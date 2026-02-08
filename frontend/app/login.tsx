import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import CountryPicker, {
  CountryCode,
} from "react-native-country-picker-modal";
import { Ionicons } from "@expo/vector-icons";

import i18n from "./i18n";

/* 🔥 NGROK BASE URL */
const API_BASE_URL =
  "https://haxploreoccamy-app-backend.onrender.com";

export default function Login() {
  const router = useRouter();

  const [role, setRole] = useState<
    "admin" | "distributor" | ""
  >("");

  const [countryCode, setCountryCode] =
    useState<CountryCode>("IN");

  const [callingCode, setCallingCode] =
    useState("91");

  const [mobile, setMobile] = useState("");
  const [maxDigits] = useState(10);
  const [loading, setLoading] =
    useState(false);

  const [distributorCode, setDistributorCode] =
    useState("");

  // 🔥 SEND OTP
  const sendOtp = async () => {
    if (!mobile || !role) return;

    if (role === "distributor" && !distributorCode) {
      Alert.alert(
        i18n.t("missing_distributor_code"),
        i18n.t("enter_distributor_code")
      );
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        mobile,
        role,
      };

      if (role === "distributor") {
        payload.distributorCode =
          distributorCode.trim().toUpperCase();
      }

      const res = await fetch(
        `${API_BASE_URL}/auth/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(
          i18n.t("error"),
          data.message || i18n.t("otp_failed")
        );
        return;
      }

      router.push({
        pathname: "/otp",
        params: {
          role,
          mobile,
          distributorCode:
            role === "distributor"
              ? distributorCode
              : "",
        },
      });
    } catch {
      Alert.alert(
        i18n.t("network_error"),
        i18n.t("server_not_reachable")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔙 BACK */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/language");
          }
        }}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="#2E7D32"
        />
      </TouchableOpacity>

      <Text style={styles.title}>
        {i18n.t("login_title")}
      </Text>

      <Text style={styles.subtitle}>
        {i18n.t("login_subtitle")}
      </Text>

      <Text style={styles.label}>
        {i18n.t("select_role")}
      </Text>

      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[
            styles.roleBtn,
            role === "admin" && styles.roleActive,
          ]}
          onPress={() => setRole("admin")}
        >
          <Text
            style={[
              styles.roleText,
              role === "admin" &&
                styles.roleTextActive,
            ]}
          >
            {i18n.t("admin")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleBtn,
            role === "distributor" &&
              styles.roleActive,
          ]}
          onPress={() => setRole("distributor")}
        >
          <Text
            style={[
              styles.roleText,
              role === "distributor" &&
                styles.roleTextActive,
            ]}
          >
            {i18n.t("distributor")}
          </Text>
        </TouchableOpacity>
      </View>

      {role === "distributor" && (
        <TextInput
          placeholder={i18n.t("distributor_code")}
          style={styles.input}
          value={distributorCode}
          onChangeText={setDistributorCode}
          autoCapitalize="characters"
          placeholderTextColor="#888"
        />
      )}

      <View style={styles.mobileRow}>
        <TouchableOpacity style={styles.countryBox}>
          <CountryPicker
            withFilter
            withFlag
            withCallingCode
            countryCode={countryCode}
            onSelect={(country) => {
              setCountryCode(country.cca2);
              setCallingCode(
                country.callingCode[0]
              );
              setMobile("");
            }}
          />
          <Text style={styles.code}>
            +{callingCode}
          </Text>
        </TouchableOpacity>

        <TextInput
          placeholder={i18n.t("mobile_number")}
          keyboardType="number-pad"
          style={styles.mobileInput}
          value={mobile}
          maxLength={maxDigits}
          onChangeText={(val) =>
            setMobile(val.replace(/[^0-9]/g, ""))
          }
        />
      </View>

      <TouchableOpacity
        style={[
          styles.loginBtn,
          (!mobile || !role) && { opacity: 0.5 },
        ]}
        disabled={!mobile || !role || loading}
        onPress={sendOtp}
      >
        <Text style={styles.loginText}>
          {loading
            ? i18n.t("sending")
            : i18n.t("send_otp")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FBF6",
    padding: 24,
    justifyContent: "center",
  },

  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: 24,
  },

  label: {
    color: "#2E7D32",
    fontWeight: "600",
    marginBottom: 6,
  },

  roleRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  roleBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CDE8D5",
    marginRight: 8,
    backgroundColor: "#fff",
  },

  roleActive: {
    backgroundColor: "#2E7D32",
  },

  roleText: {
    textAlign: "center",
    color: "#2E7D32",
    fontWeight: "600",
  },

  roleTextActive: {
    color: "#fff",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#CDE8D5",
  },

  mobileRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CDE8D5",
    marginBottom: 20,
    height: 56,
  },

  countryBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  code: {
    marginLeft: 6,
    fontWeight: "600",
    color: "#2E7D32",
  },

  mobileInput: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 6,
  },

  loginBtn: {
    backgroundColor: "#2E7D32",
    padding: 16,
    borderRadius: 14,
  },

  loginText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
});