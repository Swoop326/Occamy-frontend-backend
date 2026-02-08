import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import * as Location from "expo-location";
import { WebView } from "react-native-webview";

/* 🔥 BACKEND BASE */
const API_BASE_URL = "https://haxploreoccamy-app-backend.onrender.com";

export default function RouteMap() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] =
    useState<{ latitude: number; longitude: number } | null>(null);

  /* ================= TOKEN ================= */

  const getToken = async () => {
    return await AsyncStorage.getItem("authToken");
  };

  /* ================= LIVE LOCATION ================= */

  const fetchLiveLocation = async () => {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Location access is required to show route map"
      );
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setCurrentLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  };

  /* ================= FETCH ROUTE VISITS ================= */

  const fetchRouteVisits = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const res = await fetch(
        `${API_BASE_URL}/distributor/map-visits`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to load visits");
        return;
      }

      setVisits(data.visits || data || []);
    } catch {
      Alert.alert("Network Error", "Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD ================= */

  useEffect(() => {
    fetchLiveLocation();
    fetchRouteVisits();
  }, []);

  /* ================= BUILD LEAFLET HTML ================= */

  const buildMapHTML = () => {
  if (!currentLocation) return "";

  const markersJS = visits
    .map(
      (v) => `
        const visitIcon = L.icon({
          iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -30],
        });

        L.marker(
          [${v.location.coordinates[1]}, ${v.location.coordinates[0]}],
          { icon: visitIcon }
        )
          .addTo(map)
          .bindPopup("${v.village || "Visit"}");
      `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <style>
        html, body, #map {
          height: 100%;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>

      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

      <script>
        const map = L.map("map").setView(
          [${currentLocation.latitude}, ${currentLocation.longitude}],
          12
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(map);

        // 🔵 Distributor Icon
        const distributorIcon = L.icon({
          iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue.png",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -30],
        });

        L.marker([
          ${currentLocation.latitude},
          ${currentLocation.longitude},
        ], { icon: distributorIcon })
          .addTo(map)
          .bindPopup("📍 You are here")
          .openPopup();

        // 🔴 Visit Markers
        ${markersJS}
      </script>
    </body>
    </html>
  `;
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

          <Text style={styles.headerText}>Route Map</Text>

          <View style={{ width: 24 }} />
        </View>

        {/* MAP */}
        {loading || !currentLocation ? (
          <ActivityIndicator
            size="large"
            color="#1B5E20"
            style={{ marginTop: 40 }}
          />
        ) : (
          <WebView
            originWhitelist={["*"]}
            source={{ html: buildMapHTML() }}
            style={{ flex: 1 }}
          />
        )}

        {/* REFRESH */}
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => {
            fetchLiveLocation();
            fetchRouteVisits();
          }}
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
