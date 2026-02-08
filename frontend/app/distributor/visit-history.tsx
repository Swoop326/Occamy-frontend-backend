import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

/* 🔥 BACKEND */
const API_BASE_URL = "https://haxploreoccamy-app-backend.onrender.com";

export default function VisitHistory() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<any[]>([]);

  /* ================= TOKEN ================= */

  const getToken = async () => {
    return await AsyncStorage.getItem("authToken");
  };

  /* ================= FETCH HISTORY ================= */

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const token = await getToken();
      if (!token) return;

      const res = await fetch(
        `${API_BASE_URL}/distributor/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("HISTORY API RESPONSE 👉", data);

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to load history");
        return;
      }

      setVisits(Array.isArray(data) ? data : data.visits || []);
    } catch {
      Alert.alert("Network Error", "Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />

      <SafeAreaView edges={["top"]} style={styles.safeTop} />

      <SafeAreaView style={styles.safe}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerText}>Visit History</Text>

          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
          {loading && (
            <ActivityIndicator
              size="large"
              color="#1B5E20"
              style={{ marginTop: 40 }}
            />
          )}

          {!loading &&
            visits.map((v) => (
              <TouchableOpacity
                key={v._id}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/distributor/visit-detail",
                    params: { id: v._id },
                  })
                }
              >
                <View>
                  <Text style={styles.title}>
                    {v.personName || v.village || "Visit"}
                  </Text>

                  <Text style={styles.sub}>
                    {v.type === "group"
                      ? "Group Meeting"
                      : "One-on-One"}{" "}
                    • {v.category || "General"}
                  </Text>

                  <Text style={styles.time}>
                    {new Date(
                      v.visitDate || v.scheduledAt
                    ).toLocaleString()}
                  </Text>
                </View>

                {/* STATUS BADGE */}
                <View style={[styles.badge, styles.todayBadge]}>
                  <Text style={styles.badgeText}>
                    {(v.status || "completed").toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

          {!loading && visits.length === 0 && (
            <Text style={styles.empty}>No visits found</Text>
          )}
        </ScrollView>

        {/* 🔥 REFRESH BUTTON */}
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={fetchHistory}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeTop: { backgroundColor: "#1B5E20" },

  safe: {
    flex: 1,
    backgroundColor: "#F4FBF7",
  },

  header: {
    backgroundColor: "#1B5E20",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 14,
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
    backgroundColor: "#E8F5E9",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  todayBadge: {
    backgroundColor: "#E8F5E9",
  },

  badgeText: {
    fontWeight: "700",
    fontSize: 11,
    color: "#2E7D32",
  },

  empty: {
    marginTop: 40,
    textAlign: "center",
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
