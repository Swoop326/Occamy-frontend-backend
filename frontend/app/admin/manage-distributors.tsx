import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

/* 🔥 YOUR BACKEND */
const API_BASE_URL = "https://haxploreoccamy-app-backend.onrender.com";
              
export default function ManageDistributors() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<"create" | "remove" | "status">("create");

  /* ================= CREATE ================= */

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [stateName, setStateName] = useState("");
  const [district, setDistrict] = useState("");
  const [aadhaar, setAadhaar] = useState("");

  const [loading, setLoading] = useState(false);

  const [successModal, setSuccessModal] = useState(false);
  const [newDistributorCode, setNewDistributorCode] = useState("");

  /* ================= REMOVE ================= */

  const [removeId, setRemoveId] = useState("");

  /* ================= STATUS ================= */

  const [searchId, setSearchId] = useState("");
  const [distributors, setDistributors] = useState<any[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);

  /* ================= TOKEN ================= */

  const getToken = async () => {
    return await AsyncStorage.getItem("authToken");
  };

  /* ================= FETCH STATUS ================= */

  const fetchStatus = async () => {
    try {
      setStatusLoading(true);

      const token = await getToken();

      /** 1️⃣ GET DISTRIBUTORS */
      const res = await fetch(`${API_BASE_URL}/admin/distributors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to load");
        return;
      }

      let list = data.distributors || data || [];

      /** 2️⃣ GET WORK STATUS */
      const statusRes = await fetch(`${API_BASE_URL}/work/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const statusJson = await statusRes.json();

      let statusList: any[] = [];

      if (Array.isArray(statusJson)) {
        statusList = statusJson;
      } else if (Array.isArray(statusJson.statuses)) {
        statusList = statusJson.statuses;
      } else if (Array.isArray(statusJson.distributors)) {
        statusList = statusJson.distributors;
      }

      /** 3️⃣ MERGE BOTH */
      const merged = list.map((d: any) => {
        const found = statusList.find(
          (s: any) => s.distributorCode === d.distributorCode
        );

        return {
          ...d,
          fieldWorkActive:
            found?.fieldWorkActive ??
            d.fieldWorkActive ??
            false,
        };
      });

      setDistributors(merged);
    } catch (err) {
      console.log("STATUS ERROR:", err);
      Alert.alert("Network Error", "Server unreachable");
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "status") {
      fetchStatus();
    }
  }, [activeTab]);

  /* ================= CREATE ================= */

  const createDistributor = async () => {
    if (!name || !mobile || !stateName || !district || !aadhaar) {
      Alert.alert("Error", "Fill all fields");
      return;
    }

    try {
      setLoading(true);

      const token = await getToken();

      const res = await fetch(
        `${API_BASE_URL}/admin/create-distributor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            mobile,
            state: stateName,
            district,
            aadhaar,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed");
        return;
      }

      setNewDistributorCode(data.distributorCode);
      setSuccessModal(true);

      setName("");
      setMobile("");
      setStateName("");
      setDistrict("");
      setAadhaar("");

      fetchStatus();
    } catch {
      Alert.alert("Network Error", "Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  /* ================= REMOVE ================= */

  const removeDistributor = async () => {
    if (!removeId) {
      Alert.alert("Error", "Enter Distributor Code");
      return;
    }

    try {
      setLoading(true);

      const token = await getToken();

      const res = await fetch(
        `${API_BASE_URL}/admin/remove-distributor`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            distributorCode: removeId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed");
        return;
      }

      Alert.alert("Success", "Distributor removed");

      setRemoveId("");
      fetchStatus();
    } catch {
      Alert.alert("Network Error", "Server unreachable");
    } finally {
      setLoading(false);
    }
  };

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

          <Text style={styles.headerText}>Manage Distributors</Text>

          <View style={{ width: 24 }} />
        </View>

        {/* TABS */}
        <View style={styles.tabsRow}>
          {["create", "remove", "status"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabBtn,
                activeTab === tab && styles.tabActive,
              ]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
          {/* CREATE */}
          {activeTab === "create" && (
            <>
              <Text style={styles.sectionTitle}>Create Distributor</Text>

              <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
              <TextInput placeholder="Mobile Number" keyboardType="number-pad" style={styles.input} value={mobile} onChangeText={setMobile} maxLength={10} />
              <TextInput placeholder="State" style={styles.input} value={stateName} onChangeText={setStateName} />
              <TextInput placeholder="District" style={styles.input} value={district} onChangeText={setDistrict} />
              <TextInput placeholder="Aadhaar Number" keyboardType="number-pad" style={styles.input} value={aadhaar} onChangeText={setAadhaar} maxLength={12} />

              <TouchableOpacity style={styles.primaryBtn} onPress={createDistributor} disabled={loading}>
                <Text style={styles.primaryText}>
                  {loading ? "Creating..." : "Create Distributor"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* REMOVE */}
          {activeTab === "remove" && (
            <>
              <Text style={styles.sectionTitle}>Remove Distributor</Text>

              <TextInput
                placeholder="Distributor Code"
                style={styles.input}
                value={removeId}
                onChangeText={setRemoveId}
                autoCapitalize="characters"
              />

              <TouchableOpacity
                style={styles.dangerBtn}
                onPress={removeDistributor}
                disabled={loading}
              >
                <Text style={styles.primaryText}>Remove Distributor</Text>
              </TouchableOpacity>
            </>
          )}

          {/* STATUS */}
          {activeTab === "status" && (
            <>
              <Text style={styles.sectionTitle}>Distributor Status</Text>

              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color="#777" />
                <TextInput
                  placeholder="Search by Distributor Code"
                  value={searchId}
                  onChangeText={setSearchId}
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>

              {statusLoading ? (
                <ActivityIndicator size="large" color="#1B5E20" />
              ) : (
                distributors
                  .filter((d) =>
                    (d.distributorCode || "")
                      .toLowerCase()
                      .includes(searchId.toLowerCase())
                  )
                  .map((d) => (
                    <View key={d.distributorCode} style={styles.listCard}>
                      <View>
                        <Text style={styles.listTitle}>{d.name}</Text>
                        <Text style={styles.listSub}>{d.distributorCode}</Text>
                      </View>

                      <Text
                        style={[
                          styles.status,
                          !d.fieldWorkActive && { color: "#C62828" },
                        ]}
                      >
                        {d.fieldWorkActive ? "ACTIVE" : "INACTIVE"}
                      </Text>
                    </View>
                  ))
              )}

              {/* 🔄 REFRESH BUTTON */}
              
            </>
          )}
        </ScrollView>
        {/* 🔄 FIXED REFRESH BUTTON */}
{activeTab === "status" && (
  <TouchableOpacity
    style={styles.refreshBtn}
    onPress={fetchStatus}
    disabled={statusLoading}
  >
    <Ionicons name="refresh" size={26} color="#fff" />
  </TouchableOpacity>
)}
      </SafeAreaView>

      {/* SUCCESS MODAL */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Ionicons name="checkmark-circle" size={60} color="#2E7D32" />

            <Text style={styles.modalTitle}>Distributor Created!</Text>
            <Text style={styles.modalId}>Code: {newDistributorCode}</Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setSuccessModal(false)}
            >
              <Text style={styles.primaryText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeTop: { backgroundColor: "#1B5E20" },
  safe: { flex: 1, backgroundColor: "#F4FBF7" },

  header: {
    backgroundColor: "#1B5E20",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerText: { color: "#fff", fontSize: 18, fontWeight: "700" },

  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#E8F5E9",
    paddingVertical: 10,
  },

  tabBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20 },
  tabActive: { backgroundColor: "#1B5E20" },

  tabText: { color: "#1B5E20", fontWeight: "600" },
  tabTextActive: { color: "#fff" },

  sectionTitle: { margin: 20, fontWeight: "700", fontSize: 16 },

  input: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
  },

  primaryBtn: {
    backgroundColor: "#1B5E20",
    margin: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  dangerBtn: {
    backgroundColor: "#C62828",
    margin: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  primaryText: { color: "#fff", fontWeight: "700" },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 26,
    borderRadius: 18,
    width: "80%",
    alignItems: "center",
  },

  modalTitle: { fontSize: 18, fontWeight: "700", marginTop: 10 },
  modalId: { marginVertical: 10, fontWeight: "600" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
  },

  listCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  listTitle: { fontWeight: "600" },
  listSub: { fontSize: 12, color: "#777" },

  status: { fontWeight: "700", color: "#2E7D32" },

  refreshBtn: {
  position: "absolute",
  bottom: 60,
  right: 20,
  backgroundColor: "#1B5E20",
  height: 56,
  width: 56,
  borderRadius: 28,
  justifyContent: "center",
  alignItems: "center",
  elevation: 8,
},

});
