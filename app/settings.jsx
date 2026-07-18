import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  SafeAreaView,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SurveyContext } from "../context/SurveyContext";

export default function SettingsScreen() {
  const { clearAllSurveys, appTheme, toggleTheme } = useContext(SurveyContext);
  const colorScheme = useColorScheme();
  const isDark = appTheme === "system" ? colorScheme === "dark" : appTheme === "dark";

  const handleClearCache = () => {
    Alert.alert(
      "Purge Survey Database",
      "This will permanently delete all logged surveys from your local device storage. This action cannot be undone. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            await clearAllSurveys();
            Alert.alert("Success", "All logged surveys have been purged successfully.");
          },
        },
      ]
    );
  };

  const themeColors = {
    bg: isDark ? "#0B0F19" : "#F8FAFC",
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    border: isDark ? "#334155" : "#E2E8F0",
    text: isDark ? "#F9FAFB" : "#0F172A",
    subText: isDark ? "#9CA3AF" : "#475569",
    accent: isDark ? "#A78BFA" : "#4F46E5",
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Application Settings</Text>

      {/* Theme Settings Card */}
      <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Visual Appearance</Text>
        <Text style={[styles.desc, { color: themeColors.subText }]}>
          Toggle between Light, Dark, or System visual themes.
        </Text>
        <Pressable
          style={[styles.themeToggleButton, { backgroundColor: themeColors.accent }]}
          onPress={toggleTheme}
        >
          <Ionicons
            name={appTheme === "dark" ? "moon" : appTheme === "light" ? "sunny" : "contrast"}
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.buttonText}>Switch Theme (Current: {appTheme.toUpperCase()})</Text>
        </Pressable>
      </View>

      {/* Database Management Card */}
      <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Database Management</Text>
        <Text style={[styles.desc, { color: themeColors.subText }]}>
          Purge local device storage to resolve storage size warnings. This deletes all surveys locally.
        </Text>

        <Pressable style={styles.dangerButton} onPress={handleClearCache}>
          <Ionicons name="trash-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Purge Local Databases</Text>
        </Pressable>
      </View>

      {/* Developer Details Card */}
      <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Developer Information</Text>
        <Text style={[styles.developerVal, { color: themeColors.subText }]}>Student: Raushan Kumar</Text>
        <Text style={[styles.developerVal, { color: themeColors.subText }]}>Roll No: SUK250054CE064</Text>
        <Text style={[styles.developerVal, { color: themeColors.subText }]}>Course: B.E CSE</Text>
        <Text style={[styles.developerVal, { color: themeColors.subText }]}>Institution: Swaminarayan University</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  card: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    marginBottom: 16,
  },
  dangerButton: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  themeToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  developerVal: {
    fontSize: 15,
    marginTop: 6,
  },
});
