import React, { useEffect, useState } from "react";

import { useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";

/* ✅ LANGUAGE */
import i18n from "../i18n";

/* 🔥 BACKEND BASE */
const API_BASE_URL = "https://haxploreoccamy-app-backend.onrender.com";

export default function DistributorNotifications() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getToken = async () => {
    return await AsyncStorage.getItem("authToken");
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const token = await getToken();
      if (!token) return;

      const res = await fetch(
        `${API_BASE_URL}/distributor/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(
          i18n.t("error"),
          data.message || i18n.t("failed_to_load_notifications")
        );
        return;
      }

      const list = Array.isArray(data)
        ? data
        : data.notifications || [];

      setNotifications(list);

      const unread = list.filter((n: any) => !n.read).length;
      setUnreadCount(unread);
    } catch {
      Alert.alert(
        i18n.t("network_error"),
        i18n.t("server_not_reachable")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(
        `${API_BASE_URL}/distributor/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) return;

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, read: true } : n
        )
      );

      setUnreadCount((c) => Math.max(c - 1, 0));
    } catch {
      console.log("Mark read failed");
    }
  };

  const openVisit = (item: any) => {
    markAsRead(item._id);

    if (item.visitId) {
      router.push({
        pathname: "/distributor/visit-detail",
        params: { id: item.visitId },
      });
    }
  };

  return (
    <>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />

      {/* HEADER */}
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerText}>
            {i18n.t("notifications")}
          </Text>

          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          ) : (
            <View style={{ width: 22 }} />
          )}
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

          {!loading &&
            notifications.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={[
                  styles.notificationCard,
                  !item.read && styles.unreadCard,
                ]}
                onPress={() => openVisit(item)}
              >
                <View style={styles.row}>
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color="#1B5E20"
                  />

                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.title}>
                      {item.title || i18n.t("new_visit_assigned")}
                    </Text>

                    <Text style={styles.subtitle}>
                      {item.message}
                    </Text>

                    <Text style={styles.date}>
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                  </View>

                  {!item.read && <View style={styles.dot} />}
                </View>
              </TouchableOpacity>
            ))}

          {!loading && notifications.length === 0 && (
            <Text style={styles.emptyText}>
              {i18n.t("no_notifications")}
            </Text>
          )}
        </ScrollView>

        {/* 🔥 REFRESH BUTTON */}
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={fetchNotifications}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  headerSafe: {
    backgroundColor: "#1B5E20",
  },

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

  badge: {
    backgroundColor: "#D32F2F",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  notificationCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#1B5E20",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontWeight: "600",
    color: "#333",
  },

  subtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  date: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D32F2F",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 60,
    color: "#777",
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