import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";

const { width } = Dimensions.get("window");

export default function Onboarding() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <LinearGradient
      colors={["#f6fff8", "#ffffff"]}
      style={{ flex: 1 }}
    >
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      >
        {slides.map((item, index) => (
          <View key={index} style={[styles.slide, { width }]}>
            <View style={styles.imageCard}>
              <Image source={item.image} style={styles.image} />
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>

            {index === slides.length - 1 && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.button}
                onPress={() => router.replace("/language")}
              >
                <Text style={styles.btnText}>Get Started →</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </Animated.ScrollView>

      {/* DOT INDICATORS */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => {
          const inputRange = [
            (i - 1) * width,
            i * width,
            (i + 1) * width,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.3, 0.8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { transform: [{ scale }], opacity },
              ]}
            />
          );
        })}
      </View>
    </LinearGradient>
  );
}

const slides = [
  {
    title: "Track Field Work",
    subtitle: "Log village visits, meetings, and activities easily",
    image: require("../assets/onboarding/track.png"),
  },
  {
    title: "GPS Verified Visits",
    subtitle: "Every visit is tracked with real‑time location",
    image: require("../assets/onboarding/gps.png"),
  },
  {
    title: "Real‑time Analytics",
    subtitle: "Monitor sales, visits, and performance instantly",
    image: require("../assets/onboarding/analytics.png"),
  },
];

const styles = StyleSheet.create({
  slide: {
    width,
    alignItems: "center",

    paddingTop: 90,      // 🔥 FIXED TOP OFFSET
    paddingHorizontal: 28,

    flex: 1,
  },

  imageCard: {
   backgroundColor: "#fff",
   borderRadius: 26,

   width: width * 0.9,
   height: 300,          // locked height

   justifyContent: "center",
   alignItems: "center",

   marginBottom: 28,

   shadowColor: "#000",
   shadowOpacity: 0.12,
   shadowRadius: 10,
   shadowOffset: { width: 0, height: 4 },
   elevation: 6,
 },

  image: {
    width: width * 0.75,
    height: 220,
    resizeMode: "contain",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#1b5e20",
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 46,
    paddingHorizontal: 20,
    lineHeight: 22,
  },

  button: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: "#2E7D32",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  dotsRow: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2E7D32",
    marginHorizontal: 6,
  },
});
