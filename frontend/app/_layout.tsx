import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { loadLanguage } from "./i18n";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadLanguage().then(() => setReady(true));
  }, []);

  if (!ready) return null; // prevents UI before language loads

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}