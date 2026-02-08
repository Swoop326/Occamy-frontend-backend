import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { LineChart, BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width - 32;

/* ================= DISTRIBUTORS ================= */

const DISTRIBUTORS = [
  { id: "overall", label: "Overall" },
  { id: "DIST001", label: "Distributor DIST001" },
  { id: "DIST002", label: "Distributor DIST002" },
  { id: "DIST003", label: "Distributor DIST003" },
];

/* ================= ANALYTICS DATA ================= */

const ANALYTICS_DATA = {
  overall: {
    kpi: { total: 162, completed: 124, pending: 38 },
    visitsPerDay: [18, 22, 25, 20, 30, 28, 19],
    salesPerMonth: [42000, 51000, 48000, 60000, 72000, 69000],
    b2bPerMonth: [26000, 30000, 28000, 35000, 42000, 40000],
    b2cPerMonth: [16000, 21000, 20000, 25000, 30000, 29000],
  },

  DIST001: {
    kpi: { total: 54, completed: 41, pending: 13 },
    visitsPerDay: [6, 8, 9, 7, 10, 8, 6],
    salesPerMonth: [12000, 15000, 14000, 18000, 21000, 20000],
    b2bPerMonth: [7000, 9000, 8000, 11000, 13000, 12000],
    b2cPerMonth: [5000, 6000, 6000, 7000, 8000, 8000],
  },

  DIST002: {
    kpi: { total: 61, completed: 47, pending: 14 },
    visitsPerDay: [7, 9, 10, 8, 12, 9, 6],
    salesPerMonth: [15000, 19000, 17000, 22000, 26000, 24000],
    b2bPerMonth: [9000, 11000, 10000, 14000, 16000, 15000],
    b2cPerMonth: [6000, 8000, 7000, 8000, 10000, 9000],
  },

  DIST003: {
    kpi: { total: 47, completed: 36, pending: 11 },
    visitsPerDay: [5, 6, 6, 5, 8, 7, 10],
    salesPerMonth: [10000, 17000, 16000, 20000, 25000, 24000],
    b2bPerMonth: [5000, 9000, 8000, 11000, 15000, 14000],
    b2cPerMonth: [5000, 8000, 8000, 9000, 10000, 10000],
  },
};

/* ================= SCREEN ================= */

export default function ReportsAnalytics() {
  const router = useRouter();

  const [selectedDistributor, setSelectedDistributor] =
    useState("overall");

  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  // ✅ SAFE FALLBACK
  const analytics =
    ANALYTICS_DATA[selectedDistributor] ||
    ANALYTICS_DATA.overall;

  /* ================= FILTERED LIST ================= */

  const filteredDistributors = useMemo(() => {
    if (!searchText) return DISTRIBUTORS;

    return DISTRIBUTORS.filter((d) =>
      d.id.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  /* ================= CHART DATA ================= */

  const visitsPerDayData = useMemo(
    () => ({
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{ data: analytics.visitsPerDay }],
    }),
    [analytics]
  );

  const salesPerMonthData = useMemo(
    () => ({
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [{ data: analytics.salesPerMonth }],
    }),
    [analytics]
  );

  const b2bVsB2cLineData = useMemo(
    () => ({
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        { data: analytics.b2bPerMonth, color: () => "#1B5E20" },
        { data: analytics.b2cPerMonth, color: () => "#66BB6A" },
      ],
      legend: ["B2B", "B2C"],
    }),
    [analytics]
  );

  return (
    <>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />

      <SafeAreaView style={styles.safe}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerText}>Reports & Analytics</Text>

          <View style={{ width: 24 }} />
        </View>

        {/* 🔽 DROPDOWN BUTTON */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.dropdownText}>
              {selectedDistributor === "overall"
                ? "Overall"
                : selectedDistributor}
            </Text>

            <Ionicons name="chevron-down" size={20} />
          </TouchableOpacity>
        </View>

        {/* 🪟 MODAL */}
        <Modal transparent visible={modalVisible} animationType="fade">
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setModalVisible(false)}
            activeOpacity={1}
          >
            <View style={styles.modalBox}>
              {/* 🔍 SEARCH */}
              <View style={styles.modalSearchRow}>
                <Ionicons name="search" size={18} />
                <TextInput
                  placeholder="Search Distributor ID..."
                  value={searchText}
                  onChangeText={setSearchText}
                  style={styles.modalSearchInput}
                />
              </View>

              <FlatList
                data={filteredDistributors}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedDistributor(item.id);
                      setModalVisible(false);
                      setSearchText("");
                    }}
                  >
                    <Text>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
          {/* ================= KPI ================= */}

          <Text style={styles.sectionTitle}>
            Summary (
            {selectedDistributor === "overall"
              ? "Overall"
              : selectedDistributor}
            )
          </Text>

          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Total Visits</Text>
              <Text style={styles.kpiValue}>
                {analytics.kpi.total}
              </Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Completed</Text>
              <Text style={styles.kpiValue}>
                {analytics.kpi.completed}
              </Text>
            </View>

            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Pending</Text>
              <Text style={styles.kpiValue}>
                {analytics.kpi.pending}
              </Text>
            </View>
          </View>

          {/* ================= VISITS PER DAY ================= */}

          <Text style={styles.sectionTitle}>Visits Per Day</Text>

          <LineChart
            data={visitsPerDayData}
            width={screenWidth}
            height={240}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />

          {/* ================= SALES PER MONTH ================= */}

          <Text style={styles.sectionTitle}>Sales Per Month</Text>

          <BarChart
            data={salesPerMonthData}
            width={screenWidth}
            height={240}
            chartConfig={chartConfig}
            fromZero
            style={styles.chart}
          />

          {/* ================= B2B vs B2C ================= */}

          <Text style={styles.sectionTitle}>
            B2B vs B2C Sales (Monthly)
          </Text>

          <LineChart
            data={b2bVsB2cLineData}
            width={screenWidth}
            height={240}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

/* ================= CHART CONFIG ================= */

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(27,94,32, ${opacity})`,
  labelColor: () => "#555",
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
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

  filterRow: {
    alignItems: "flex-end",
    padding: 16,
  },

  dropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 6,
  },

  dropdownText: {
    fontWeight: "600",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
  },

  modalSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
  },

  modalSearchInput: {
    flex: 1,
    padding: 8,
  },

  modalItem: {
    paddingVertical: 14,
  },

  sectionTitle: {
    marginLeft: 20,
    marginTop: 26,
    marginBottom: 12,
    fontWeight: "700",
    fontSize: 16,
  },

  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  kpiCard: {
    backgroundColor: "#E8F5E9",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    width: "30%",
  },

  kpiLabel: {
    fontSize: 12,
    color: "#555",
  },

  kpiValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B5E20",
  },

  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: "center",
  },
});
