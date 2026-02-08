import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import i18n, { loadLanguage } from "./i18n";

/* 🔥 NGROK BASE URL */
const API_BASE_URL = "https://haxploreoccamy-app-backend.onrender.com";

export default function Otp() {
  const router = useRouter();

  const { mobile, callingCode, role, distributorCode } =
    useLocalSearchParams<{
      mobile: string;
      callingCode: string;
      role: string;
      distributorCode?: string;
    }>();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const inputs = useRef<(TextInput | null)[]>([]);

  /* ================= LOAD LANGUAGE ================= */
  useEffect(() => {
    loadLanguage();
  }, []);

  /* ================= SHAKE ================= */
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* ================= TIMER ================= */
  useEffect(() => {
    if (resendTimer === 0) return;

    const timer = setInterval(() => {
      setResendTimer((v) => v - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (val: string, index: number) => {
    if (!/^\d?$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (!val && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  /* ================= VERIFY OTP ================= */
  const verifyOtp = async () => {
    if (otp.join("").length < 6) {
      triggerShake();
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile,
          otp: otp.join(""),
          distributorCode:
            role === "distributor" ? distributorCode : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        triggerShake();
        setOtp(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();

        Alert.alert(
          i18n.t("error"),
          data.message || i18n.t("otp_verify_failed")
        );
        return;
      }

      /* ================= SAVE TOKEN ================= */
      await AsyncStorage.setItem("authToken", data.token);
      await AsyncStorage.setItem("role", data.role);
      await AsyncStorage.setItem("userId", data.userId);

      /* ================= REDIRECT ================= */
      if (data.role === "admin") {
        router.replace("/admin/home");
      } else {
        router.replace("/distributor/home");
      }
    } catch {
      Alert.alert(
        i18n.t("network_error"),
        i18n.t("server_not_reachable")
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND ================= */
  const resendOtp = async () => {
    try {
      setResendTimer(30);

      await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile,
          distributorCode:
            role === "distributor" ? distributorCode : undefined,
        }),
      });

      Alert.alert(
        i18n.t("otp_sent"),
        i18n.t("otp_sent_success")
      );
    } catch {
      Alert.alert(
        i18n.t("error"),
        i18n.t("otp_resend_failed")
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* BACK */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#2E7D32" />
      </TouchableOpacity>

      <Text style={styles.title}>{i18n.t("enter_otp")}</Text>

      <Text style={styles.subtitle}>
        {i18n.t("otp_sent_to")} +{callingCode} {mobile}
      </Text>

      {/* OTP */}
      <Animated.View
        style={[
          styles.otpRow,
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(r) => {
              inputs.current[index] = r;
            }}
            style={styles.otpBox}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(v) => handleChange(v, index)}
          />
        ))}
      </Animated.View>

      {/* VERIFY */}
      <TouchableOpacity
        style={styles.verifyBtn}
        onPress={verifyOtp}
        disabled={loading}
      >
        <Text style={styles.verifyText}>
          {loading ? i18n.t("verifying") : i18n.t("verify_otp")}
        </Text>
      </TouchableOpacity>

      {/* RESEND */}
      <View style={styles.resendBox}>
        {resendTimer > 0 ? (
          <Text style={styles.timerText}>
            {i18n.t("resend_in")} {resendTimer}s
          </Text>
        ) : (
          <TouchableOpacity onPress={resendOtp}>
            <Text style={styles.resendText}>
              {i18n.t("resend_otp")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FBF6",
    justifyContent: "center",
    padding: 24,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2E7D32",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpBox: {
    width: 48,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CDE8D5",
    backgroundColor: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
  verifyBtn: {
    backgroundColor: "#2E7D32",
    padding: 16,
    borderRadius: 14,
  },
  verifyText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  resendBox: {
    marginTop: 18,
    alignItems: "center",
  },
  resendText: {
    color: "#2E7D32",
    fontWeight: "700",
  },
  timerText: {
    color: "#888",
  },
});