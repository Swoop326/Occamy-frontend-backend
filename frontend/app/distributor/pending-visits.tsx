import React, { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const API_BASE_URL = "https://haxploreoccamy-app-backend.onrender.com";

type TabType = "pending" | "today" | "future";

export default function Visits() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [allVisits, setAllVisits] = useState<any[]>([]);
  const [futureVisits, setFutureVisits] = useState<any[]>([]);
  const [pendingVisits, setPendingVisits] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("today");

  const getToken = async () =>
    await AsyncStorage.getItem("authToken");

  const normalizeDate = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const getVisitDate = (v: any) =>
    new Date(v.visitDate || v.scheduledAt);

  const todayDate = normalizeDate(new Date());

  const fetchAssignedVisits = async () => {
    try {
      const token = await getToken();
      if (!token) return [];

      const res = await fetch(
        `${API_BASE_URL}/distributor/assigned-visits`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) return [];

      return Array.isArray(data)
        ? data
        : data.visits || [];
    } catch {
      return [];
    }
  };

  const fetchUpcomingVisits = async () => {
    try {
      const token = await getToken();
      if (!token) return [];

      const res = await fetch(
        `${API_BASE_URL}/distributor/upcoming-visits`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) return [];

      return Array.isArray(data)
        ? data
        : data.visits || [];
    } catch {
      return [];
    }
  };

  const fetchPendingVisits = async () => {
    try {
      const token = await getToken();
      if (!token) return [];

      const res = await fetch(
        `${API_BASE_URL}/distributor/pending-visits`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) return [];

      return Array.isArray(data)
        ? data
        : data.visits || [];
    } catch {
      return [];
    }
  };

  const loadVisits = async () => {
    setLoading(true);

    const assigned = await fetchAssignedVisits();
    const upcoming = await fetchUpcomingVisits();
    const pending = await fetchPendingVisits();

    setAllVisits(assigned);
    setFutureVisits(upcoming);
    setPendingVisits(pending);

    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadVisits();
    }, [])
  );

  const visibleVisits =
    activeTab === "pending"
      ? pendingVisits
      : activeTab === "future"
      ? futureVisits
      : allVisits;

  const openVisit = (visitId: string) => {
    router.push({
      pathname: "/distributor/start-new-visit",
      params: { assignedVisitId: visitId  },
    });
  };

  return (
    <>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />

      <SafeAreaView style={styles.safe}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        
          <Text style={styles.headerText}>Visits</Text>
        
          <View style={{ width: 24 }} />
          </View>

        {/* TABS */}
        <View style={styles.tabRow}>
          {["pending", "today", "future"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.tabBtn,
                activeTab === t && styles.tabActive,
              ]}
              onPress={() => setActiveTab(t as TabType)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === t && styles.tabTextActive,
                ]}
              >
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
          {loading && (
            <ActivityIndicator
              size="large"
              color="#1B5E20"
              style={{ marginTop: 40 }}
            />
          )}

          {!loading && (
            <>
              {visibleVisits.length === 0 && (
                <Text style={styles.emptyText}>
                  No visits found.
                </Text>
              )}

              {visibleVisits.map((v) => (
                <TouchableOpacity
                  key={v._id}
                  style={styles.card}
                  onPress={() => openVisit(v._id)}
                >
                  <View>
                    <Text style={styles.title}>
                      {v.personName ||
                        v.village ||
                        "Visit"}
                    </Text>

                    <Text style={styles.sub}>
                      {v.type === "group"
                        ? "Group Meeting"
                        : "One-on-One"}{" "}
                      • {v.category || "General"}
                    </Text>

                    <Text style={styles.time}>
                      {getVisitDate(v).toLocaleString()}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      activeTab === "today" &&
                        styles.todayBadge,
                      activeTab === "future" &&
                        styles.futureBadge,
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {activeTab.toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>

        {/* 🔥 REFRESH BUTTON */}
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={loadVisits}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4FBF7",
  },

  header: {
    backgroundColor: "#1B5E20",
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  backBtn: {
    position: "absolute",
    left: 16,
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },

  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 14,
    justifyContent: "space-between",
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
  },

  tabActive: {
    backgroundColor: "#1B5E20",
  },

  tabText: {
    fontWeight: "700",
    color: "#1B5E20",
    fontSize: 12,
  },

  tabTextActive: {
    color: "#fff",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontWeight: "700",
    color: "#333",
  },

  sub: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },

  time: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },

  badge: {
    backgroundColor: "#FFF3E0",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  todayBadge: {
    backgroundColor: "#E8F5E9",
  },

  futureBadge: {
    backgroundColor: "#E3F2FD",
  },

  badgeText: {
    fontWeight: "700",
    fontSize: 11,
    color: "#333",
  },

  emptyText: {
    marginHorizontal: 20,
    marginTop: 12,
    fontSize: 12,
    color: "#777",
  },

  /* 🔥 REFRESH BUTTON */
  refreshBtn: {
    position: "absolute",
    bottom: 24,
    right: 20,
    backgroundColor: "#1B5E20",
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});
