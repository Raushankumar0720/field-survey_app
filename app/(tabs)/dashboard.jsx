import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SurveyContext } from "../../context/SurveyContext";

export default function Dashboard() {
  const router = useRouter();
  const { surveys, appTheme, toggleTheme, profileImage, isOnline } = useContext(SurveyContext);
  const colorScheme = useColorScheme();
  const isDark = appTheme === "system" ? colorScheme === "dark" : appTheme === "dark";

  // Calculate today's survey count dynamically
  const todayStr = new Date().toLocaleDateString();
  const todaySurveys = surveys.filter((s) => {
    return s.date === todayStr;
  });

  const recentSurveys = surveys.slice(0, 3); // Get latest 3 surveys

  const themeColors = {
    bg: isDark ? "#0B0F19" : "#F8FAFC",
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    border: isDark ? "#334155" : "#E2E8F0",
    text: isDark ? "#F9FAFB" : "#0F172A",
    subText: isDark ? "#9CA3AF" : "#475569",
    welcomeBg: isDark ? "#4F46E5" : "#6366F1",
    welcomeText: isDark ? "#E0E7FF" : "#FFFFFF",
    welcomeDesc: isDark ? "#C7D2FE" : "#E2E8F0",
    accent: isDark ? "#A78BFA" : "#4F46E5",
    headerBg: isDark ? "#0F172A" : "#FFFFFF",
    headerBorder: isDark ? "#1E293B" : "#E2E8F0",
    headerText: isDark ? "#F9FAFB" : "#0F172A",
    // status badges
    highBg: isDark ? "#7F1D1D" : "#FEE2E2",
    highText: isDark ? "#FCA5A5" : "#991B1B",
    mediumBg: isDark ? "#78350F" : "#FEF3C7",
    mediumText: isDark ? "#FCD34D" : "#92400E",
    lowBg: isDark ? "#064E3B" : "#D1FAE5",
    lowText: isDark ? "#6EE7B7" : "#065F46",
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={themeColors.headerBg} />
      
      {/* Custom App Header */}
      <View style={[styles.header, { backgroundColor: themeColors.headerBg, borderBottomColor: themeColors.headerBorder }]}>
        <View>
          <Text style={[styles.appTitle, { color: themeColors.headerText }]}>Smart Inspection</Text>
          <Text style={[styles.subtitle, { color: themeColors.subText }]}>Field Operations Hub</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={toggleTheme} style={{ marginRight: 12, padding: 6 }}>
            <Ionicons
              name={appTheme === "dark" ? "moon" : appTheme === "light" ? "sunny" : "contrast"}
              size={24}
              color={themeColors.accent}
            />
          </Pressable>
          <Pressable onPress={() => router.push("/Profile")} style={styles.profileBtn}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.headerProfilePic} />
            ) : (
              <Ionicons name="person-circle" size={44} color={themeColors.accent} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Offline Alert Banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.offlineText}>Working Offline — Local Saves Only</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Welcome Card */}
        <View style={[styles.welcomeCard, { backgroundColor: themeColors.welcomeBg }]}>
          <View style={styles.welcomeInfo}>
            <Text style={[styles.welcomeText, { color: themeColors.welcomeText }]}>Welcome Back 👋</Text>
            <Text style={[styles.name, { color: themeColors.welcomeText }]}>Raushan Kumar</Text>
            <Text style={[styles.studentDetails, { color: themeColors.welcomeDesc }]}>Roll No: SUK250054CE064</Text>
            <Text style={[styles.studentDetails, { color: themeColors.welcomeDesc }]}>B.E CSE • Swaminarayan University</Text>
          </View>
        </View>

        {/* Today's Survey Count */}
        <View style={[styles.statsCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <View style={styles.statsHeader}>
            <Ionicons name="trending-up" size={24} color={themeColors.accent} />
            <Text style={[styles.statsTitle, { color: themeColors.subText }]}>{"Today's Surveys"}</Text>
          </View>
          <Text style={[styles.statsCount, { color: themeColors.accent }]}>{todaySurveys.length}</Text>
          <Text style={[styles.statsLabel, { color: themeColors.subText }]}>Completed surveys today</Text>
        </View>

        {/* Quick Action Cards */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Quick Actions</Text>
        <View style={styles.gridContainer}>
          <Pressable style={[styles.gridCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]} onPress={() => router.push("/newSurvey")}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "#312E81" : "#DBEAFE" }]}>
              <Ionicons name="add" size={26} color={isDark ? "#A78BFA" : "#2563EB"} />
            </View>
            <Text style={[styles.gridText, { color: themeColors.text }]}>New Survey</Text>
          </Pressable>

          <Pressable style={[styles.gridCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]} onPress={() => router.push("/camera")}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "#500733" : "#FCE7F3" }]}>
              <Ionicons name="camera" size={24} color={isDark ? "#F472B6" : "#DB2777"} />
            </View>
            <Text style={[styles.gridText, { color: themeColors.text }]}>Camera</Text>
          </Pressable>

          <Pressable style={[styles.gridCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]} onPress={() => router.push("/location")}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "#064E3B" : "#D1FAE5" }]}>
              <Ionicons name="location" size={24} color={isDark ? "#34D399" : "#059669"} />
            </View>
            <Text style={[styles.gridText, { color: themeColors.text }]}>GPS Location</Text>
          </Pressable>

          <Pressable style={[styles.gridCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]} onPress={() => router.push("/contacts")}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "#78350F" : "#FEF3C7" }]}>
              <Ionicons name="people" size={24} color={isDark ? "#FBBF24" : "#D97706"} />
            </View>
            <Text style={[styles.gridText, { color: themeColors.text }]}>Contacts</Text>
          </Pressable>

          <Pressable style={[styles.gridCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]} onPress={() => router.push("/clipboard")}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "#1E3A8A" : "#E0F2FE" }]}>
              <Ionicons name="clipboard" size={24} color={isDark ? "#60A5FA" : "#0284C7"} />
            </View>
            <Text style={[styles.gridText, { color: themeColors.text }]}>Clipboard</Text>
          </Pressable>

          <Pressable style={[styles.gridCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]} onPress={() => router.push("/History")}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "#581C87" : "#F3E8FF" }]}>
              <Ionicons name="list" size={24} color={isDark ? "#C084FC" : "#7C3AED"} />
            </View>
            <Text style={[styles.gridText, { color: themeColors.text }]}>History</Text>
          </Pressable>
        </View>

        {/* Recent Survey Summary */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Recent Surveys Summary</Text>
        {recentSurveys.length === 0 ? (
          <View style={[styles.emptyRecent, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Ionicons name="document-text" size={48} color={themeColors.subText} />
            <Text style={[styles.emptyRecentText, { color: themeColors.subText }]}>No surveys completed yet</Text>
          </View>
        ) : (
          recentSurveys.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.recentCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
              onPress={() => router.push({ pathname: "/History", params: { selectId: item.id } })}
            >
              <View style={styles.recentInfo}>
                <Text style={[styles.recentSite, { color: themeColors.text }]}>{item.siteName}</Text>
                <Text style={[styles.recentClient, { color: themeColors.subText }]}>Client: {item.clientName}</Text>
                <Text style={[styles.recentDate, { color: themeColors.subText }]}>{item.date}</Text>
              </View>
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor:
                      item.priority === "High"
                        ? themeColors.highBg
                        : item.priority === "Medium"
                        ? themeColors.mediumBg
                        : themeColors.lowBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    {
                      color:
                        item.priority === "High"
                          ? themeColors.highText
                          : item.priority === "Medium"
                          ? themeColors.mediumText
                          : themeColors.lowText,
                    },
                  ]}
                >
                  {item.priority}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  profileBtn: {
    padding: 2,
  },
  headerProfilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  offlineBanner: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    width: "100%",
  },
  offlineText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  welcomeInfo: {
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 4,
  },
  studentDetails: {
    fontSize: 13,
    lineHeight: 18,
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  statsCount: {
    fontSize: 48,
    fontWeight: "bold",
  },
  statsLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gridCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  gridText: {
    fontSize: 14,
    fontWeight: "600",
  },
  recentCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
  },
  recentInfo: {
    flex: 1,
    marginRight: 10,
  },
  recentSite: {
    fontSize: 16,
    fontWeight: "bold",
  },
  recentClient: {
    fontSize: 13,
    marginTop: 2,
  },
  recentDate: {
    fontSize: 11,
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  emptyRecent: {
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  emptyRecentText: {
    marginTop: 8,
    fontSize: 14,
  },
});