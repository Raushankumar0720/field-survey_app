import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  useColorScheme,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { SurveyContext } from "../../context/SurveyContext";

const Profile = () => {
  const { appTheme, profileImage, updateProfileImage } = useContext(SurveyContext);
  const colorScheme = useColorScheme();
  const isDark = appTheme === "system" ? colorScheme === "dark" : appTheme === "dark";

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "Logged out successfully.");
          },
        },
      ]
    );
  };

  const handleSelectImage = () => {
    Alert.alert(
      "Update Profile Photo",
      "Choose a source to set your custom profile photo:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Camera (Take Photo)", onPress: handleLaunchCamera },
        { text: "Gallery (Choose Image)", onPress: handleLaunchLibrary },
        ...(profileImage ? [{ text: "Remove Current Photo", style: "destructive", onPress: () => updateProfileImage(null) }] : []),
      ]
    );
  };

  const handleLaunchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Camera permission is required to snap a profile photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        // Compress profile photo to 512x512 and 80% quality
        const manipulated = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 512, height: 512 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        updateProfileImage(manipulated.uri);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to access camera.");
    }
  };

  const handleLaunchLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Media library permission is required to choose a profile photo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        // Compress profile photo to 512x512 and 80% quality
        const manipulated = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 512, height: 512 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        updateProfileImage(manipulated.uri);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to access media gallery.");
    }
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
    <ScrollView style={[styles.container, { backgroundColor: themeColors.bg }]}>
      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        <Pressable onPress={handleSelectImage} style={styles.avatarWrapper}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileAvatar} />
          ) : (
            <Ionicons name="person-circle" size={120} color={themeColors.accent} />
          )}
          <View style={[styles.editIconCircle, { backgroundColor: themeColors.accent }]}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </Pressable>
        <Text style={[styles.name, { color: themeColors.text }]}>Raushan Kumar</Text>
        <Text style={[styles.role, { color: themeColors.subText }]}>B.E CSE Student</Text>
      </View>

      {/* Student Details */}
      <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        <Text style={[styles.heading, { color: themeColors.text }]}>Student Information</Text>

        <View style={styles.row}>
          <Ionicons name="id-card" size={22} color={themeColors.accent} />
          <Text style={[styles.text, { color: themeColors.text }]}>Roll No : SUK250054CE064</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="school" size={22} color={themeColors.accent} />
          <Text style={[styles.text, { color: themeColors.text }]}>Course : B.E CSE</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="business" size={22} color={themeColors.accent} />
          <Text style={[styles.text, { color: themeColors.text }]}>Swaminarayan University</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="mail" size={22} color={themeColors.accent} />
          <Text style={[styles.text, { color: themeColors.text }]}>raushankumar.cg@gmail.com</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="call" size={22} color={themeColors.accent} />
          <Text style={[styles.text, { color: themeColors.text }]}>+91 9876543210</Text>
        </View>
      </View>

      {/* App Information */}
      <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        <Text style={[styles.heading, { color: themeColors.text }]}>App Information</Text>

        <View style={styles.row}>
          <Ionicons name="information-circle" size={22} color={themeColors.accent} />
          <Text style={[styles.text, { color: themeColors.text }]}>Smart Field Survey App</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="code-slash" size={22} color={themeColors.accent} />
          <Text style={[styles.text, { color: themeColors.text }]}>Version : 1.0.0</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="phone-portrait" size={22} color={themeColors.accent} />
          <Text style={[styles.text, { color: themeColors.text }]}>Built using Expo + React Native</Text>
        </View>
      </View>

      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  profileCard: {
    borderRadius: 20,
    alignItems: "center",
    padding: 25,
    marginBottom: 20,
    borderWidth: 1,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconCircle: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  role: {
    marginTop: 5,
    fontSize: 16,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  text: {
    marginLeft: 15,
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});