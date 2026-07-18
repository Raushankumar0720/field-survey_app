import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SurveyContext } from "../../context/SurveyContext";

export default function NewSurvey() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { draft, updateDraft, clearDraft, submitSurvey, appTheme, isOnline } = useContext(SurveyContext);
  const colorScheme = useColorScheme();
  const isDark = appTheme === "system" ? colorScheme === "dark" : appTheme === "dark";

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editingId, setEditingId] = useState(null); // If editing an existing survey

  // Handle edit parameters (if routed from history edit action)
  useEffect(() => {
    if (params.editData) {
      try {
        const item = JSON.parse(params.editData);
        updateDraft({
          siteName: item.siteName,
          clientName: item.clientName,
          description: item.description,
          priority: item.priority,
          date: item.date,
          photo: item.photo,
          contact: item.contact,
          location: item.location,
          notes: item.notes || "",
        });
        setEditingId(item.id);
      } catch (e) {
        console.error(e);
      }
    }
  }, [params.editData, updateDraft]);

  const handlePreview = () => {
    if (
      draft.siteName.trim() === "" ||
      draft.clientName.trim() === "" ||
      draft.description.trim() === ""
    ) {
      Alert.alert("Validation Error", "Please fill in all required fields (Site Name, Client Name, Description).");
      return;
    }
    setIsPreviewMode(true);
  };

  const handleSubmit = async () => {
    const success = await submitSurvey(editingId);
    if (success) {
      Alert.alert(
        editingId ? "Survey Updated" : "Survey Submitted",
        editingId
          ? "Your changes have been saved successfully."
          : "Smart Field Survey has been recorded and saved locally.",
        [
          {
            text: "OK",
            onPress: () => {
              clearDraft();
              setIsPreviewMode(false);
              setEditingId(null);
              router.replace("/History");
            },
          },
        ]
      );
    } else {
      Alert.alert("Submission Failed", "There was an error saving your survey.");
    }
  };

  const themeColors = {
    bg: isDark ? "#0B0F19" : "#F8FAFC",
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    border: isDark ? "#334155" : "#E2E8F0",
    text: isDark ? "#F9FAFB" : "#0F172A",
    subText: isDark ? "#9CA3AF" : "#475569",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    accent: isDark ? "#A78BFA" : "#4F46E5",
    accentBg: isDark ? "#312E81" : "#EEF2F6",
    divider: isDark ? "#334155" : "#E2E8F0",
    previewBadgeBg: isDark ? "#312E81" : "#DBEAFE",
    previewBadgeText: isDark ? "#A78BFA" : "#2563EB",
    sectionHeaderColor: isDark ? "#C7D2FE" : "#4B5563",
    notesBg: isDark ? "#0F172A" : "#F9FAFB",
    editBtnBorder: isDark ? "#6366F1" : "#2563EB",
    editBtnText: isDark ? "#6366F1" : "#2563EB",
  };

  if (isPreviewMode) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg }]}>
        {/* Offline Alert Banner */}
        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.offlineText}>Working Offline — Local Saves Only</Text>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.previewHeaderRow}>
            <Text style={[styles.heading, { color: themeColors.text, marginBottom: 0 }]}>Confirm Survey Details</Text>
            <View style={[styles.previewBadge, { backgroundColor: themeColors.previewBadgeBg }]}>
              <Text style={[styles.previewBadgeText, { color: themeColors.previewBadgeText }]}>Verification</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Text style={[styles.sectionHeader, { color: themeColors.sectionHeaderColor, borderBottomColor: themeColors.divider }]}>General Info</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Site Name</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>{draft.siteName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Client Name</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>{draft.clientName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>{draft.description}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Priority Level</Text>
              <Text style={[styles.detailValue, { color: themeColors.text }]}>{draft.priority}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Text style={[styles.sectionHeader, { color: themeColors.sectionHeaderColor, borderBottomColor: themeColors.divider }]}>Site Photo Evidence</Text>
            {draft.photo ? (
              <View>
                <Image source={{ uri: draft.photo.uri }} style={styles.previewImage} />
                <Text style={[styles.imageTime, { color: themeColors.subText }]}>Captured at: {draft.photo.captureTime}</Text>
              </View>
            ) : (
              <View style={styles.iconInfoRow}>
                <Ionicons name="camera-outline" size={28} color="#EF4444" />
                <View style={styles.iconInfoTexts}>
                  <Text style={[styles.iconInfoTitle, { color: themeColors.text }]}>No Photo Attached</Text>
                  <Text style={[styles.iconInfoSub, { color: themeColors.subText }]}>Highly recommended for visual evidence.</Text>
                </View>
              </View>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Text style={[styles.sectionHeader, { color: themeColors.sectionHeaderColor, borderBottomColor: themeColors.divider }]}>GPS Location</Text>
            {draft.location ? (
              <View style={styles.iconInfoRow}>
                <Ionicons name="location-outline" size={28} color="#10B981" />
                <View style={styles.iconInfoTexts}>
                  <Text style={[styles.iconInfoTitle, { color: themeColors.text }]}>
                    Lat: ${(draft.location.coords ? draft.location.coords.latitude : draft.location.latitude).toFixed(5)}, Lon: ${(draft.location.coords ? draft.location.coords.longitude : draft.location.longitude).toFixed(5)}
                  </Text>
                  <Text style={[styles.iconInfoSub, { color: themeColors.subText }]}>
                    {draft.location.address || "Coordinates Attached"}
                  </Text>
                  {draft.location.weather && (
                    <Text style={[styles.iconInfoSub, { color: themeColors.subText, marginTop: 4 }]}>
                      Weather: {draft.location.weather}
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.iconInfoRow}>
                <Ionicons name="alert-circle-outline" size={28} color="#EF4444" />
                <View style={styles.iconInfoTexts}>
                  <Text style={[styles.iconInfoTitle, { color: themeColors.text }]}>No Location Attached</Text>
                  <Text style={[styles.iconInfoSub, { color: themeColors.subText }]}>Necessary for geolocation verification.</Text>
                </View>
              </View>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Text style={[styles.sectionHeader, { color: themeColors.sectionHeaderColor, borderBottomColor: themeColors.divider }]}>Contact Representative</Text>
            {draft.contact ? (
              <View style={styles.iconInfoRow}>
                <Ionicons name="person-outline" size={28} color="#2563EB" />
                <View style={styles.iconInfoTexts}>
                  <Text style={[styles.iconInfoTitle, { color: themeColors.text }]}>{draft.contact.name}</Text>
                  <Text style={[styles.iconInfoSub, { color: themeColors.subText }]}>{draft.contact.phone}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.iconInfoRow}>
                <Ionicons name="person-remove-outline" size={28} color="#EF4444" />
                <View style={styles.iconInfoTexts}>
                  <Text style={[styles.iconInfoTitle, { color: themeColors.text }]}>No Contact Attached</Text>
                  <Text style={[styles.iconInfoSub, { color: themeColors.subText }]}>Useful for representative verification.</Text>
                </View>
              </View>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Text style={[styles.sectionHeader, { color: themeColors.sectionHeaderColor, borderBottomColor: themeColors.divider }]}>Survey Clipboard Notes</Text>
            {draft.notes.trim() !== "" ? (
              <Text style={[styles.notesText, { color: themeColors.text, backgroundColor: themeColors.notesBg }]}>{draft.notes}</Text>
            ) : (
              <Text style={[styles.notesText, { color: themeColors.subText, backgroundColor: themeColors.notesBg, fontStyle: "italic" }]}>
                No additional clipboard notes.
              </Text>
            )}
          </View>

          <View style={styles.actionButtonRow}>
            <Pressable style={[styles.editButton, { borderColor: themeColors.editBtnBorder }]} onPress={() => setIsPreviewMode(false)}>
              <Ionicons name="create-outline" size={20} color={themeColors.editBtnText} style={{ marginRight: 6 }} />
              <Text style={[styles.editButtonText, { color: themeColors.editBtnText }]}>Edit details</Text>
            </Pressable>
            <Pressable style={styles.submitButton} onPress={handleSubmit}>
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.submitButtonText}>Submit Survey</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg }]}>
      {/* Offline Alert Banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.offlineText}>Working Offline — Local Saves Only</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.heading, { color: themeColors.text }]}>{editingId ? "Edit Site Survey" : "New Field Survey"}</Text>

        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.label, { color: themeColors.subText }]}>Site Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.text }]}
            placeholder="e.g. Swaminarayan Main Building"
            placeholderTextColor="#64748B"
            value={draft.siteName}
            onChangeText={(txt) => updateDraft({ siteName: txt })}
          />
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.label, { color: themeColors.subText }]}>Client Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.text }]}
            placeholder="e.g. Swaminarayan Trust Board"
            placeholderTextColor="#64748B"
            value={draft.clientName}
            onChangeText={(txt) => updateDraft({ clientName: txt })}
          />
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.label, { color: themeColors.subText }]}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.text }]}
            placeholder="Outline structural or field issues found during inspection..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={4}
            value={draft.description}
            onChangeText={(txt) => updateDraft({ description: txt })}
          />
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.label, { color: themeColors.subText }]}>Priority Level</Text>
          <View style={styles.priorityContainer}>
            {["Low", "Medium", "High"].map((level) => {
              const isSelected = draft.priority === level;
              return (
                <Pressable
                  key={level}
                  style={[
                    styles.priorityButton,
                    {
                      borderColor: themeColors.border,
                      backgroundColor: isSelected
                        ? level === "High"
                          ? "#EF4444"
                          : level === "Medium"
                          ? "#F59E0B"
                          : "#10B981"
                        : "transparent",
                    },
                  ]}
                  onPress={() => updateDraft({ priority: level })}
                >
                  <Text style={[styles.priorityText, { color: isSelected ? "#fff" : themeColors.text }]}>
                    {level}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Modular Hardware Connectors */}
        <Text style={[styles.subHeading, { color: themeColors.text }]}>Audit Attachments</Text>

        <View style={styles.gridRow}>
          <Pressable
            style={[styles.attachCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
            onPress={() => router.push("/camera")}
          >
            <Ionicons name="camera" size={28} color={draft.photo ? "#10B981" : themeColors.accent} />
            <Text style={[styles.attachTitle, { color: themeColors.text }]}>Inspection Photo</Text>
            <Text style={[styles.attachStatus, { color: draft.photo ? "#10B981" : "#EF4444" }]}>
              {draft.photo ? "Attached" : "Not Attached"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.attachCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
            onPress={() => router.push("/location")}
          >
            <Ionicons name="location" size={28} color={draft.location ? "#10B981" : themeColors.accent} />
            <Text style={[styles.attachTitle, { color: themeColors.text }]}>GPS Coordinates</Text>
            <Text style={[styles.attachStatus, { color: draft.location ? "#10B981" : "#EF4444" }]}>
              {draft.location ? "Attached" : "Not Attached"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.gridRow}>
          <Pressable
            style={[styles.attachCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
            onPress={() => router.push("/contacts")}
          >
            <Ionicons name="person" size={28} color={draft.contact ? "#10B981" : themeColors.accent} />
            <Text style={[styles.attachTitle, { color: themeColors.text }]}>Client Contact</Text>
            <Text style={[styles.attachStatus, { color: draft.contact ? "#10B981" : "#EF4444" }]}>
              {draft.contact ? "Attached" : "Not Attached"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.attachCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
            onPress={() => router.push("/clipboard")}
          >
            <Ionicons name="clipboard" size={28} color={draft.notes.trim() !== "" ? "#10B981" : themeColors.accent} />
            <Text style={[styles.attachTitle, { color: themeColors.text }]}>Clipboard Notes</Text>
            <Text style={[styles.attachStatus, { color: draft.notes.trim() !== "" ? "#10B981" : "#EF4444" }]}>
              {draft.notes.trim() !== "" ? "Attached" : "Not Attached"}
            </Text>
          </Pressable>
        </View>

        {/* Submit Actions */}
        <View style={styles.footerButtons}>
          <Pressable
            style={styles.cancelBtn}
            onPress={() => {
              Alert.alert("Discard", "Are you sure you want to clear this draft?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear Draft",
                  style: "destructive",
                  onPress: () => {
                    clearDraft();
                    setEditingId(null);
                  },
                },
              ]);
            }}
          >
            <Text style={styles.cancelBtnText}>Reset Draft</Text>
          </Pressable>

          <Pressable style={styles.previewBtn} onPress={handlePreview}>
            <Text style={styles.previewBtnText}>Verify & Preview</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  priorityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priorityButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  priorityText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  attachCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  attachTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 6,
  },
  attachStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 8,
  },
  cancelBtnText: {
    color: "#4B5563",
    fontWeight: "bold",
    fontSize: 16,
  },
  previewBtn: {
    flex: 1.2,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginLeft: 8,
  },
  previewBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  previewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  previewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 12,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 11,
    color: "#64748B",
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
    marginTop: 4,
  },
  imageTime: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },
  iconInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconInfoTexts: {
    marginLeft: 12,
    flex: 1,
  },
  iconInfoTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  iconInfoSub: {
    fontSize: 13,
    marginTop: 2,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    padding: 10,
    borderRadius: 8,
  },
  actionButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  editButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  submitButton: {
    flex: 1.2,
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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
});