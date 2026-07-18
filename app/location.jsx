import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  useColorScheme,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { SurveyContext } from "../context/SurveyContext";

export default function LocationScreen() {
  const router = useRouter();
  const { draft, updateDraft, appTheme } = useContext(SurveyContext);

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = appTheme === "system" ? colorScheme === "dark" : appTheme === "dark";

  const requestPermissionAndFetch = async () => {
    setLoading(true);
    setErrorMsg(null);

    if (Platform.OS === "web") {
      // Mock coordinates and weather on web (Swaminarayan University location context)
      setTimeout(() => {
        const mockLocation = {
          coords: {
            latitude: 22.5937,
            longitude: 72.8222,
            accuracy: 3.8,
          },
          address: "Swaminarayan University, Kalol, Gujarat, India",
          weather: "☀️ Clear Sky, 32°C (Wind: 12.5 km/h)",
          timestamp: Date.now(),
        };
        setLocation(mockLocation);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      // Reverse geocode coordinate values to physical address
      let resolvedAddress = "Unknown Address";
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (address) {
          const parts = [
            address.name,
            address.street,
            address.district,
            address.city,
            address.subregion,
            address.region,
            address.postalCode,
            address.country
          ].filter(part => part && part.trim() !== "");
          resolvedAddress = parts.join(", ");
        }
      } catch (geocodeErr) {
        console.error("Reverse geocoding failed", geocodeErr);
      }

      // Fetch current weather conditions using Open-Meteo API
      let weatherString = "☀️ Clear Sky, 30°C";
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.coords.latitude}&longitude=${loc.coords.longitude}&current_weather=true`;
        const response = await fetch(weatherUrl);
        const data = await response.json();
        if (data && data.current_weather) {
          const temp = data.current_weather.temperature;
          const code = data.current_weather.weathercode;
          const wind = data.current_weather.windspeed;
          
          // Map weather codes
          let condition = "Clear";
          let emoji = "☀️";
          if (code === 0) { condition = "Clear Sky"; emoji = "☀️"; }
          else if (code >= 1 && code <= 3) { condition = "Partly Cloudy"; emoji = "☁️"; }
          else if (code >= 45 && code <= 48) { condition = "Foggy"; emoji = "🌫️"; }
          else if (code >= 51 && code <= 67) { condition = "Drizzle/Rainy"; emoji = "🌧️"; }
          else if (code >= 71 && code <= 77) { condition = "Snowy"; emoji = "❄️"; }
          else if (code >= 80 && code <= 82) { condition = "Rain Showers"; emoji = "🌧️"; }
          else if (code >= 95 && code <= 99) { condition = "Thunderstorm"; emoji = "🌩️"; }
          
          weatherString = `${emoji} ${condition}, ${temp}°C (Wind: ${wind} km/h)`;
        }
      } catch (weatherErr) {
        console.error("Weather fetch failed", weatherErr);
      }

      const locationData = {
        coords: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy,
        },
        address: resolvedAddress,
        weather: weatherString,
        timestamp: loc.timestamp,
      };

      setLocation(locationData);
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to resolve current device coordinates.");
    } finally {
      setLoading(false);
    }
  };

  // Sync draft location on mount, or auto-fetch if no location is active
  useEffect(() => {
    if (draft && draft.location) {
      setLocation(draft.location);
    } else {
      requestPermissionAndFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyLocationToClipboard = async () => {
    if (location) {
      const textToCopy = `Lat: ${location.coords.latitude.toFixed(6)}, Lon: ${location.coords.longitude.toFixed(6)}\nAddress: ${location.address || "Unknown"}\nWeather: ${location.weather || "Unknown"}`;
      await Clipboard.setStringAsync(textToCopy);
      Alert.alert("Success", "Coordinates, Address & Weather copied to clipboard!");
    }
  };

  const attachToDraft = () => {
    if (location) {
      updateDraft({ location });
      Alert.alert("Success", "Coordinates, address and weather attached to survey draft!", [
        { text: "OK", onPress: () => router.push("/newSurvey") },
      ]);
    }
  };

  const themeColors = {
    bg: isDark ? "#0B0F19" : "#F8FAFC",
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    border: isDark ? "#334155" : "#E2E8F0",
    text: isDark ? "#F9FAFB" : "#0F172A",
    subText: isDark ? "#9CA3AF" : "#475569",
    displayBg: isDark ? "#0F172A" : "#F1F5F9",
    accent: isDark ? "#A78BFA" : "#4F46E5",
    coordValue: isDark ? "#F9FAFB" : "#1E293B",
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg }]}>
      <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        <Text style={[styles.title, { color: themeColors.text }]}>Module 4: Location API</Text>
        <Text style={[styles.subtitle, { color: themeColors.subText }]}>Get current GPS coordinates for your inspection site.</Text>

        <View style={[styles.displayArea, { backgroundColor: themeColors.displayBg, borderColor: themeColors.border }]}>
          {loading ? (
            <View style={styles.infoBox}>
              <ActivityIndicator size="large" color={themeColors.accent} />
              <Text style={[styles.loadingText, { color: themeColors.subText }]}>Fetching GPS Coordinates...</Text>
            </View>
          ) : errorMsg ? (
            <View style={[styles.infoBox, styles.errorBox]}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text style={styles.errorText}>{errorMsg}</Text>
              <Pressable style={[styles.retryButton, { backgroundColor: themeColors.accent }]} onPress={requestPermissionAndFetch}>
                <Text style={styles.retryButtonText}>Grant Permission / Retry</Text>
              </Pressable>
            </View>
          ) : location ? (
            <View style={styles.coordsContainer}>
              <View style={styles.coordRow}>
                <View style={styles.coordCol}>
                  <Text style={styles.coordLabel}>Latitude</Text>
                  <Text style={[styles.coordValue, { color: themeColors.coordValue }]}>{location.coords.latitude.toFixed(6)}°</Text>
                </View>
                <View style={styles.coordCol}>
                  <Text style={styles.coordLabel}>Longitude</Text>
                  <Text style={[styles.coordValue, { color: themeColors.coordValue }]}>{location.coords.longitude.toFixed(6)}°</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

              <View style={styles.accuracyRow}>
                <Ionicons name="locate" size={20} color="#10B981" />
                <Text style={[styles.accuracyText, { color: themeColors.text }]}>
                  Accuracy: <Text style={{ fontWeight: "bold" }}>{location.coords.accuracy.toFixed(1)} meters</Text>
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

              <View style={styles.addressRow}>
                <Ionicons name="map-outline" size={20} color={themeColors.accent} style={{ marginRight: 6 }} />
                <Text style={[styles.addressText, { color: themeColors.text }]}>
                  Address: <Text style={{ fontWeight: "600" }}>{location.address || "Unknown Address"}</Text>
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

              <View style={styles.addressRow}>
                <Ionicons name="cloudy-night-outline" size={20} color="#10B981" style={{ marginRight: 6 }} />
                <Text style={[styles.addressText, { color: themeColors.text }]}>
                  Weather: <Text style={{ fontWeight: "600" }}>{location.weather || "Unknown Weather"}</Text>
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.infoBox}>
              <Ionicons name="location-outline" size={48} color={themeColors.subText} />
              <Text style={[styles.noDataText, { color: themeColors.subText }, { marginBottom: 12 }]}>No Location Loaded</Text>
              <Pressable style={[styles.retryButton, { backgroundColor: themeColors.accent }]} onPress={requestPermissionAndFetch}>
                <Text style={styles.retryButtonText}>Get Current Location</Text>
              </Pressable>
            </View>
          )}
        </View>

        {location && (
          <View style={styles.actionsContainer}>
            <Pressable style={[styles.actionButton, { backgroundColor: themeColors.accent }]} onPress={requestPermissionAndFetch}>
              <Ionicons name="refresh" size={20} color="#fff" style={styles.iconMargin} />
              <Text style={styles.actionButtonText}>Refresh Location</Text>
            </Pressable>

            <Pressable style={[styles.actionButton, styles.copyButton]} onPress={copyLocationToClipboard}>
              <Ionicons name="copy" size={20} color="#fff" style={styles.iconMargin} />
              <Text style={styles.actionButtonText}>Copy to Clipboard</Text>
            </Pressable>
          </View>
        )}
      </View>

      {location && (
        <Pressable style={[styles.attachButton, { backgroundColor: themeColors.accent }]} onPress={attachToDraft}>
          <Ionicons name="checkmark-circle" size={22} color="#fff" style={styles.iconMargin} />
          <Text style={styles.attachButtonText}>Attach to Active Survey Draft</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
  },
  displayArea: {
    minHeight: 280,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  infoBox: {
    alignItems: "center",
  },
  errorBox: {
    paddingHorizontal: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
    marginTop: 10,
    fontSize: 15,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  coordsContainer: {
    width: "100%",
  },
  coordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coordCol: {
    flex: 1,
    alignItems: "center",
  },
  coordLabel: {
    fontSize: 12,
    color: "#64748B",
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 4,
  },
  coordValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  accuracyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  accuracyText: {
    marginLeft: 8,
    fontSize: 15,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
  },
  noDataText: {
    marginTop: 10,
  },
  actionsContainer: {
    flexDirection: "column",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  copyButton: {
    backgroundColor: "#10B981",
    marginBottom: 0,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  iconMargin: {
    marginRight: 6,
  },
  attachButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  attachButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
