import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Image,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

/* 🔥 BACKEND */
const API_BASE_URL = "https://haxploreoccamy-app-backend.onrender.com";

export default function VisitDetail() {
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [visit, setVisit] = useState<any>(null);

  const getToken = async () => {
    return await AsyncStorage.getItem("authToken");
  };

  /* ================= FETCH DETAIL ================= */

  const fetchDetail = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(
        `${API_BASE_URL}/distributor/history/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to load visit");
        return;
      }

      setVisit(data.visit);
    } catch {
      Alert.alert("Network Error", "Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  return (
    <>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />

      <SafeAreaView edges={["top"]} style={styles.safeTop} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Visit Detail</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {loading && (
            <ActivityIndicator
              size="large"
              color="#1B5E20"
              style={{ marginTop: 40 }}
            />
          )}

          {!loading && visit && (
            <>
              {/* BASIC INFO */}
              <Text style={styles.section}>Basic Info</Text>

              <View style={styles.card}>
                <Text>Name: {visit.personName || visit.village}</Text>
                <Text>Category: {visit.category}</Text>
                <Text>Type: {visit.type}</Text>
              </View>

              {/* BUSINESS */}
              <Text style={styles.section}>Business Outcome</Text>

              <View style={styles.card}>
                <Text>Potential: {visit.businessPotential} kg</Text>
                <Text>Attendees: {visit.attendees || "-"}</Text>
                <Text>Status: {visit.status}</Text>
              </View>

              {/* PHOTO */}
              <Text style={styles.section}>Photo</Text>

              <View style={styles.card}>
                {visit.photoUrl ? (
                  <Image
                    source={{ uri: visit.photoUrl }}
                    style={styles.image}
                  />
                ) : (
                  <Text>No photo uploaded</Text>
                )}
              </View>
            </>
          )}
        </ScrollView>
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
  },

  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  section: {
    marginLeft: 20,
    marginTop: 24,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
  },

  image: {
    height: 200,
    borderRadius: 14,
    marginTop: 10,
  },
});
