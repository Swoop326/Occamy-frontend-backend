import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import i18n from "../i18n";

/* 🔥 BACKEND BASE */
const API_BASE_URL = "https://haxploreoccamy-app-backend.onrender.com";

export default function DistributorHome() {
  const router = useRouter();

  const [fieldWork, setFieldWork] = useState(false);
  const [activeView, setActiveView] = useState("home");

  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState({
    today: 0,
    completed: 0,
    pending: 0,
  });

  const [distributorCode, setDistributorCode] = useState("");

  const getToken = async () => {
    return await AsyncStorage.getItem("authToken");
  };

  const fetchDistributorMe = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/distributor/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) return;

      setDistributorCode(data.distributorCode || data.code || "");
    } catch {
      console.log("Distributor ME API failed");
    }
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        Alert.alert(i18n.t("auth_error"), i18n.t("token_missing"));
        return;
      }

      const res = await fetch(`${API_BASE_URL}/distributor/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(
          i18n.t("error"),
          data.message || i18n.t("failed_to_load_dashboard")
        );
        return;
      }

      setVisits(data.visits || []);
      setSummary({
        today: data.todaysVisits || 0,
        completed: data.completed || 0,
        pending: data.pending || 0,
      });

      setFieldWork(data.fieldWorkActive || false);
    } catch {
      Alert.alert(
        i18n.t("network_error"),
        i18n.t("network_error_server")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchDistributorMe();
  }, []);

  /* ================= FIELD WORK TOGGLE ================= */

  const toggleFieldWork = async (value: boolean) => {
    try {
      setFieldWork(value);

      const token = await getToken();
      if (!token) return;

      const endpoint = value ? "/work/start" : "/work/end";

      const method = value ? "POST" : "PATCH"; // ✅ FIXED

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(i18n.t("error"), data.message || "Failed");
        setFieldWork(!value);
      }
    } catch {
      Alert.alert(
        i18n.t("network_error"),
        i18n.t("network_error_server")
      );
      setFieldWork(!value);
    }
  };

  const renderVisits = (filter: string) =>
    visits
      .filter((v) => (filter === "today" ? true : v.status === filter))
      .map((v) => (
        <View key={v.id} style={styles.activityCard}>
          <Text style={styles.activityTitle}>{v.name}</Text>
          <Text
            style={[
              styles.activitySub,
              v.status === "pending" && { color: "#F57C00" },
            ]}
          >
            {v.status.toUpperCase()} · {v.time}
          </Text>
        </View>
      ));

  return (
    <>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />

      {/* HEADER */}
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {i18n.t("distributor_id")} : {distributorCode || "---"}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/distributor/notifications")}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* BODY */}
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
          {loading && (
            <ActivityIndicator
              size="large"
              color="#1B5E20"
              style={{ marginTop: 40 }}
            />
          )}

          {!loading && activeView === "home" && (
            <>
              {/* SUMMARY */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>
                    {i18n.t("todays_visits")}
                  </Text>
                  <Text style={styles.summaryValue}>{summary.today}</Text>
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>
                    {i18n.t("completed")}
                  </Text>
                  <Text style={[styles.summaryValue, { color: "#2E7D32" }]}>
                    {summary.completed}
                  </Text>
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>
                    {i18n.t("pending")}
                  </Text>
                  <Text style={[styles.summaryValue, { color: "#F57C00" }]}>
                    {summary.pending}
                  </Text>
                </View>
              </View>

              {/* FIELD WORK */}
              <View style={styles.sliderCard}>
                <Text style={styles.sliderText}>
                  {fieldWork
                    ? i18n.t("field_work_started")
                    : i18n.t("field_work_ended")}
                </Text>

                <Switch
                  value={fieldWork}
                  onValueChange={toggleFieldWork}
                  thumbColor={fieldWork ? "#2E7D32" : "#ccc"}
                  trackColor={{ false: "#ddd", true: "#A5D6A7" }}
                />
              </View>

              {/* QUICK ACTIONS */}
              <Text style={styles.sectionTitle}>
                {i18n.t("quick_actions")}
              </Text>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push("/distributor/pending-visits")}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={22}
                  color="#2E7D32"
                />
                <Text style={styles.actionText}>
                  {i18n.t("start_new_visit")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, styles.actionGreen]}
                onPress={() => router.push("/distributor/route-map")}
              >
                <Ionicons name="map-outline" size={22} color="#1B5E20" />
                <Text style={styles.actionText}>
                  {i18n.t("view_route_map")}
                </Text>
              </TouchableOpacity>

              {/* RECENT */}
              <Text style={styles.sectionTitle}>
                {i18n.t("recent_activity")}
              </Text>

              {renderVisits("today")}
            </>
          )}
        </ScrollView>

        {/* BOTTOM TABS */}
        <View style={styles.bottomTabs}>
          <TouchableOpacity
            style={activeView === "home" ? styles.tabActive : styles.tab}
            onPress={() => setActiveView("home")}
          >
            <Ionicons
              name="home"
              size={22}
              color={activeView === "home" ? "#1B5E20" : "#777"}
            />
            <Text
              style={
                activeView === "home"
                  ? styles.tabTextActive
                  : styles.tabText
              }
            >
              {i18n.t("home")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => router.push("/distributor/visit-history")}
          >
            <Ionicons name="time-outline" size={22} color="#777" />
            <Text style={styles.tabText}>
              {i18n.t("visit_history")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  headerSafe: { backgroundColor: "#1B5E20" },
  safe: { flex: 1, backgroundColor: "#F4FBF7" },
  header: {
    backgroundColor: "#1B5E20",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 6,
  },
  summaryCard: {
    backgroundColor: "#E8F5E9",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    width: "30%",
  },
  summaryLabel: { color: "#555", fontSize: 12 },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1B5E20",
  },

  sliderCard: {
    margin: 20,
    marginTop: 28,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderText: { fontSize: 17, fontWeight: "600", color: "#333" },

  sectionTitle: {
    marginLeft: 20,
    marginTop: 20,
    fontWeight: "700",
    color: "#333",
  },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
  },
  actionGreen: { backgroundColor: "#E8F5E9" },
  actionText: {
    marginLeft: 10,
    fontWeight: "600",
    color: "#1B5E20",
  },

  activityCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
  },
  activityTitle: { fontWeight: "600", color: "#333" },
  activitySub: {
    fontSize: 12,
    color: "#2E7D32",
    marginTop: 4,
  },

  bottomTabs: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    paddingVertical: 10,
  },
  tab: { flex: 1, alignItems: "center" },
  tabActive: { flex: 1, alignItems: "center" },
  tabText: { color: "#777", fontSize: 12 },
  tabTextActive: {
    color: "#1B5E20",
    fontSize: 12,
    fontWeight: "700",
  },
});
