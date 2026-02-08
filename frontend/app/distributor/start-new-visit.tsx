import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";

/* 🔥 BACKEND BASE */
const API_BASE_URL = "https://haxploreoccamy-app-backend.onrender.com";

export default function StartVisit() {
  const router = useRouter();

  const { assignedVisitId } = useLocalSearchParams();

  /* ================= STATES ================= */

  const [visitType, setVisitType] =
    useState<"one_on_one" | "group" | null>(null);

  const [category, setCategory] =
    useState<"farmer" | "seller" | "influencer" | null>(null);

  const [businessPotential, setBusinessPotential] = useState("");
  const [notes, setNotes] = useState("");

  const [showSales, setShowSales] = useState(false);

  const [saleType, setSaleType] =
    useState<"B2B" | "B2C" | null>(null);

  const [productSKU, setProductSKU] = useState("");
  const [packSize, setPackSize] = useState("");
  const [quantity, setQuantity] = useState("");

  const [buyerType, setBuyerType] = useState("");
  const [buyerName, setBuyerName] = useState("");

  const [farmerName, setFarmerName] = useState("");
  const [paymentMode, setPaymentMode] = useState("");

  const [submitting, setSubmitting] = useState(false);

  /* 🔥 NEW STATES (ADDED ONLY) */
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [imageUri, setImageUri] = useState<string | null>(null);

  /* ================= LOCATION ================= */

  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location access is needed to start visit"
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
    })();
  }, []);

  /* ================= IMAGE PICK ================= */

  const captureImage = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Camera access needed");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  /* ================= SUBMIT ================= */

  const submitVisit = async () => {
    if (!visitType || !category) {
      Alert.alert("Error", "Select visit type & category");
      return;
    }

    if (!saleType) {
      Alert.alert("Error", "Select B2B or B2C");
      return;
    }

    if (!productSKU || !packSize || !quantity) {
      Alert.alert("Error", "Fill sales fields");
      return;
    }

    try {
      setSubmitting(true);

      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        Alert.alert("Auth Error", "Login again");
        return;
      }

      const formData = new FormData();

      /* 🔥 ADDED */
      formData.append("assignedVisitId", String(assignedVisitId));

      formData.append("visitType", visitType);
      formData.append("category", category);
      formData.append("businessPotential", businessPotential);
      formData.append("notes", notes);

      formData.append("saleType", saleType);
      formData.append("productSKU", productSKU);
      formData.append("packSize", packSize);
      formData.append("quantity", quantity);

      /* 🔥 ADDED */
      if (latitude && longitude) {
        formData.append("latitude", String(latitude));
        formData.append("longitude", String(longitude));
      }

      /* 🔥 ADDED */
      if (imageUri) {
        formData.append("visitImage", {
          uri: imageUri,
          name: "visit.jpg",
          type: "image/jpeg",
        } as any);
      }

      if (saleType === "B2B") {
        formData.append("buyerType", buyerType);
        formData.append("buyerName", buyerName);
      }

      if (saleType === "B2C") {
        formData.append("farmerName", farmerName);
        formData.append("paymentMode", paymentMode);
      }

      const res = await fetch(
        `${API_BASE_URL}/field-visits/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(
          "Error",
          data.message || "Failed to submit visit"
        );
        return;
      }

      Alert.alert("Success", "Visit & Sale captured!");
      router.back();
    } catch {
      Alert.alert("Error", "Submission failed");
    } finally {
      setSubmitting(false);
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

          <Text style={styles.headerText}>Start Visit</Text>

          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>

          {/* VISIT TYPE */}
          <Text style={styles.section}>Visit Type</Text>

          <View style={styles.row}>
            {["one_on_one", "group"].map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.chip,
                  visitType === t && styles.chipActive,
                ]}
                onPress={() => setVisitType(t as any)}
              >
                <Text
                  style={[
                    styles.chipText,
                    visitType === t && styles.chipTextActive,
                  ]}
                >
                  {t.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* CATEGORY */}
          <Text style={styles.section}>Category</Text>

          <View style={styles.row}>
            {["farmer", "seller", "influencer"].map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.chip,
                  category === c && styles.chipActive,
                ]}
                onPress={() => setCategory(c as any)}
              >
                <Text
                  style={[
                    styles.chipText,
                    category === c && styles.chipTextActive,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* BUSINESS */}
          <TextInput
            style={styles.input}
            placeholder="Business Potential (kg)"
            value={businessPotential}
            onChangeText={setBusinessPotential}
          />

          {/* 🔥 IMAGE ABOVE NOTES */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={captureImage}
          >
            <Text style={styles.secondaryText}>
              Capture Visit Image
            </Text>
          </TouchableOpacity>

          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{
                height: 160,
                marginHorizontal: 20,
                borderRadius: 12,
              }}
            />
          )}

          {/* NOTES */}
          <TextInput
            style={styles.input}
            placeholder="Notes"
            multiline
            value={notes}
            onChangeText={setNotes}
          />

          {/* NOTE */}
          <Text style={styles.noteText}>
            If no sales or orders are made during this visit, please open Sales &
            Order Capture and enter quantity as 0.
          </Text>

          {/* SALES BUTTON */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setShowSales(true)}
          >
            <Text style={styles.secondaryText}>
              Sales & Order Capture
            </Text>
          </TouchableOpacity>

          {/* SALES FORM */}
          {showSales && (
            <>
              <Text style={styles.section}>Sale Type</Text>

              <View style={styles.row}>
                {["B2B", "B2C"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.chip,
                      saleType === t && styles.chipActive,
                    ]}
                    onPress={() => setSaleType(t as any)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        saleType === t && styles.chipTextActive,
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Product SKU"
                value={productSKU}
                onChangeText={setProductSKU}
              />

              <TextInput
                style={styles.input}
                placeholder="Pack Size"
                value={packSize}
                onChangeText={setPackSize}
              />

              <TextInput
                style={styles.input}
                placeholder="Quantity Sold"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />

              {saleType === "B2B" && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Buyer Type"
                    value={buyerType}
                    onChangeText={setBuyerType}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Buyer Name"
                    value={buyerName}
                    onChangeText={setBuyerName}
                  />
                </>
              )}

              {saleType === "B2C" && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Farmer Name"
                    value={farmerName}
                    onChangeText={setFarmerName}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Payment Mode"
                    value={paymentMode}
                    onChangeText={setPaymentMode}
                  />
                </>
              )}
            </>
          )}

          {/* SUBMIT */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={submitVisit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>
                Submit Visit
              </Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  headerSafe: { backgroundColor: "#1B5E20" },

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

  safe: { flex: 1, backgroundColor: "#F4FBF7" },

  section: {
    marginLeft: 20,
    marginTop: 22,
    fontWeight: "700",
  },

  row: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 10,
  },

  chip: {
    borderWidth: 1,
    borderColor: "#1B5E20",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
  },

  chipActive: { backgroundColor: "#1B5E20" },

  chipText: { color: "#1B5E20", fontWeight: "600" },

  chipTextActive: { color: "#fff" },

  input: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 10,
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

  primaryText: { color: "#fff", fontWeight: "700" },

  secondaryBtn: {
    backgroundColor: "#E8F5E9",
    margin: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  secondaryText: {
    color: "#1B5E20",
    fontWeight: "700",
  },

  noteText: {
    marginHorizontal: 20,
    marginTop: 10,
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },
});
