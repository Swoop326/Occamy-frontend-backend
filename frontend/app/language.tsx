import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

import { setLanguage } from "./i18n";

export default function Language() {
  const router = useRouter();

  const [selected, setSelected] =
    useState<"en" | "hi" | null>(null);

  const handleContinue = async () => {
    if (!selected) return;

    // save selected language
    await setLanguage(selected);

    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Choose Language
      </Text>

      <Text style={styles.subtitle}>
        Select the language you prefer
      </Text>

      <TouchableOpacity
        style={[
          styles.card,
          selected === "en" && styles.activeCard,
        ]}
        onPress={() => setSelected("en")}
      >
        <Text style={styles.langTitle}>
          English
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.card,
          selected === "hi" && styles.activeCard,
        ]}
        onPress={() => setSelected("hi")}
      >
        <Text style={styles.langTitle}>
          Hindi
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.btn,
          !selected && { opacity: 0.5 },
        ]}
        disabled={!selected}
        onPress={handleContinue}
      >
        <Text style={styles.btnText}>
          Continue →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FBF6",
    padding: 26,
    justifyContent: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#2E7D32",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 40,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#CDE8D5",
  },

  activeCard: {
    borderWidth: 2,
    borderColor: "#2E7D32",
  },

  langTitle: {
    fontSize: 20,
    fontWeight: "600",
  },

  btn: {
    backgroundColor: "#2E7D32",
    marginTop: 40,
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});