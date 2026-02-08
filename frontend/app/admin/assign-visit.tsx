import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

/* 🔥 BACKEND BASE */
const API_BASE_URL = "https://haxploreoccamy-app-backend.onrender.com";

export default function AssignVisit() {
  const router = useRouter();

  /* ================= STATES ================= */

  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selectedDistributor, setSelectedDistributor] =
    useState<any>(null);

  const [village, setVillage] = useState("");
  const [notes, setNotes] = useState("");

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  /* ================= TOKEN ================= */

  const getToken = async () => {
    return await AsyncStorage.getItem("authToken");
  };

  /* ================= SEARCH ================= */

  const autoSelectDistributor = (text: string, list: any[]) => {
    const match = list.find(
      (d) =>
        d.distributorCode.toUpperCase() === text.toUpperCase()
    );

    if (match) {
      setSelectedDistributor(match);
      setFiltered([]);
    }
  };

  const onSearch = async (text: string) => {
    setSearch(text);
    setSelectedDistributor(null);

    if (!text || text.length < 1) {
      setFiltered([]);
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(
        `${API_BASE_URL}/admin/search-distributors?query=${encodeURIComponent(
          text
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      const list = Array.isArray(data) ? data : [];

      setFiltered(list);

      autoSelectDistributor(text, list);
    } catch (err) {
      console.log("Distributor search failed:", err);
      setFiltered([]);
    }
  };

  const selectDistributor = (d: any) => {
    setSelectedDistributor(d);
    setSearch(d.distributorCode);
    setFiltered([]);
  };

  /* ================= ASSIGN ================= */

  const assignVisit = async () => {
    if (!search || !village || !date || !time) {
      Alert.alert("Error", "Fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const token = await getToken();
      if (!token) return;

      // 🔥🔥🔥 COMBINE DATE + TIME INTO ONE ISO STRING
      const combinedDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes(),
        time.getSeconds()
      );

      const payload = {
        distributorCode:
          selectedDistributor?.distributorCode || search,
        village,
        notes,

        // ✅ SEND ONLY ONE FIELD
        visitDate: combinedDateTime.getTime(),
      };

      const res = await fetch(
        `${API_BASE_URL}/admin/assign-visit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed");
        return;
      }

      setSuccessModal(true);

      // reset
      setVillage("");
      setNotes("");
      setDate(null);
      setTime(null);
      setSearch("");
      setSelectedDistributor(null);
      setFiltered([]);
    } catch {
      Alert.alert("Network Error", "Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DATE / TIME ================= */

  const onDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowDate(false);
    if (selectedDate) setDate(selectedDate);
  };

  const onTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date
  ) => {
    setShowTime(false);
    if (selectedTime) setTime(selectedTime);
  };

  return (
    <>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerText}>Assign Visit</Text>

          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* SEARCH */}
          <Text style={styles.sectionTitle}>Select Distributor</Text>

          <TextInput
            placeholder="Type DIST..."
            style={styles.input}
            value={search}
            onChangeText={onSearch}
            autoCapitalize="characters"
          />

          {!selectedDistributor && filtered.length > 0 && (
            <View style={styles.dropdown}>
              {filtered.map((d) => (
                <TouchableOpacity
                  key={d._id || d.distributorCode}
                  style={styles.dropdownItem}
                  onPress={() => selectDistributor(d)}
                >
                  <Text>
                    {d.distributorCode} — {d.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* DATE */}
          <Text style={styles.sectionTitle}>Visit Date</Text>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDate(true)}
          >
            <Text>
              {date ? date.toDateString() : "Select Date"}
            </Text>
          </TouchableOpacity>

          {showDate && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              minimumDate={new Date()}
              display={
                Platform.OS === "ios" ? "spinner" : "default"
              }
              onChange={onDateChange}
            />
          )}

          {/* TIME */}
          <Text style={styles.sectionTitle}>Visit Time</Text>

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowTime(true)}
          >
            <Text>
              {time
                ? time.toLocaleTimeString()
                : "Select Time"}
            </Text>
          </TouchableOpacity>

          {showTime && (
            <DateTimePicker
              value={time || new Date()}
              mode="time"
              is24Hour={true}          // ✅ ANDROID
              locale="en_GB"           // ✅ iOS forces 24h
              display={
                Platform.OS === "ios" ? "spinner" : "default"
              }
              onChange={onTimeChange}
              />
            )}


          {/* VILLAGE */}
          <Text style={styles.sectionTitle}>Location ( Village, District, State )</Text>

          <TextInput
            placeholder="e.g. Rampur, Nagpur, Maharashtra"
            style={styles.input}
            value={village}
            onChangeText={setVillage}
          />

          {/* NOTES */}
          <Text style={styles.sectionTitle}>Notes</Text>

          <TextInput
            placeholder="Instructions"
            style={[styles.input, { height: 90 }]}
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          {/* BUTTON */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={assignVisit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>
                Assign Visit
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* SUCCESS MODAL */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Ionicons
              name="checkmark-circle"
              size={60}
              color="#2E7D32"
            />

            <Text style={styles.modalTitle}>
              Visit Assigned Successfully!
            </Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                setSuccessModal(false);
                router.back();
              }}
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
  safe: { flex: 1, backgroundColor: "#F4FBF7" },

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

  sectionTitle: {
    margin: 20,
    marginBottom: 6,
    fontWeight: "700",
  },

  input: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
  },

  dropdown: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },

  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  primaryBtn: {
    backgroundColor: "#1B5E20",
    margin: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  primaryText: {
    color: "#fff",
    fontWeight: "700",
  },

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

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 10,
  },
});
 