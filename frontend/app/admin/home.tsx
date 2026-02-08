import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

/* 🔥 BACKEND BASE */
const API_BASE_URL = "https://haxploreoccamy-app-backend.onrender.com";

export default function AdminHome() {
  const router = useRouter();

  /* ================= DASHBOARD METRICS ================= */

  const [stats, setStats] = useState({
    totalDistributors: "--",
    todayDistance: "--",
    meetingsToday: "--",
    farmersConverted: "--",
    b2cSales: "--",
    b2bSales: "--",
  });

  const [stateActivity, setStateActivity] = useState<any[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<any[]>([]);

  /* ================= TOKEN ================= */

  const getToken = async () => {
    return await AsyncStorage.getItem("authToken");
  };

  /* ================= FETCH DASHBOARD ================= */

  const fetchDashboard = async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) return;

      setStats({
        totalDistributors: data.totalDistributors,
        todayDistance: data.todayDistance,
        meetingsToday: data.meetingsToday,
        farmersConverted: data.farmersConverted,
        b2cSales: data.b2cSales,
        b2bSales: data.b2bSales,
      });

      setStateActivity(data.stateActivity || []);
      setMonthlySummary(data.monthlySummary || []);
    } catch (err) {
      console.log("Dashboard API error", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />

      <SafeAreaView style={styles.safe}>
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Admin Dashboard</Text>
        </View>

        {/* ================= BODY ================= */}
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
          {/* ================= SUMMARY ================= */}

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Distributors</Text>
              <Text style={styles.summaryValue}>
                {stats.totalDistributors}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Meetings Today</Text>
              <Text style={styles.summaryValue}>
                {stats.meetingsToday}
              </Text>
            </View>
          </View>

          {/* ================= SALES ================= */}

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>B2C Sales</Text>
              <Text style={styles.summaryValue}>{stats.b2cSales}</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>B2B Sales</Text>
              <Text style={styles.summaryValue}>{stats.b2bSales}</Text>
            </View>
          </View>

          {/* ================= QUICK ACTIONS ================= */}

          <Text style={styles.sectionTitle}>Quick Actions</Text>

          {/* ASSIGN VISITS */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/admin/assign-visit")}
          >
            <Ionicons
              name="person-add-outline"
              size={22}
              color="#1B5E20"
            />
            <Text style={styles.actionText}>
              Assign Visits to Distributors
            </Text>
          </TouchableOpacity>

          {/* 🔥 DO NOT TOUCH */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              router.push("/admin/manage-distributors")
            }
          >
            <Ionicons
              name="people-outline"
              size={22}
              color="#1B5E20"
            />
            <Text style={styles.actionText}>Manage Distributors</Text>
          </TouchableOpacity>

          {/* ✅ CONNECTED REPORT PAGE */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() =>
              router.push("/admin/reports-analytics")
            }
          >
            <Ionicons
              name="analytics-outline"
              size={22}
              color="#1B5E20"
            />
            <Text style={styles.actionText}>
              View Reports & Analytics
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

/*================= STYLES =================*/

const styles = StyleSheet.create({

  safeTop: { backgroundColor: "#1B5E20" },

  safe: {
    flex: 1,
    backgroundColor: "#F4FBF7",
  },

  header: {
    backgroundColor: "#1B5E20",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },

  summaryCard: {
    backgroundColor: "#E8F5E9",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    width: "30%",
  },

  summaryLabel: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B5E20",
  },

  sectionTitle: {
    marginLeft: 20,
    marginTop: 26,
    marginBottom: 6,
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

  actionText: {
    marginLeft: 10,
    fontWeight: "600",
    color: "#1B5E20",
  },

  listCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  listTitle: {
    fontWeight: "600",
    color: "#333",
  },

  listSub: {
    fontSize: 12,
    color: "#777",
  },

  status: {
    fontWeight: "700",
    color: "#2E7D32",
  },
});
