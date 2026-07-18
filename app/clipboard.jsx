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
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SurveyContext } from "../context/SurveyContext";

export default function ClipboardScreen() {
  const router = useRouter();
  const { draft, updateDraft, appTheme } = useContext(SurveyContext);

  const [notes, setNotes] = useState("");
  const [clipboardContent, setClipboardContent] = useState("");
  const colorScheme = useColorScheme();
  const isDark = appTheme === "system" ? colorScheme === "dark" : appTheme === "dark";

  // Sync state notes with draft notes on load
  useEffect(() => {
    if (draft && draft.notes) {
      setNotes(draft.notes);
    }
  }, [draft]);

  const copyToClipboard = async (text, fieldName) => {
    if (!text || text.trim() === "") {
      Alert.alert("Warning", "No values loaded for copy.");
      return;
    }
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", `Survey ${fieldName} copied to device clipboard!`);
  };

  const fetchClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      setClipboardContent(text);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Unable to read device clipboard storage.");
    }
  };

  const handlePasteNotes = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (!text || text.trim() === "") {
        Alert.alert("Clipboard Empty", "No text content found in device clipboard.");
        return;
      }
      const combined = notes ? `${notes}\n${text}` : text;
      setNotes(combined);
      updateDraft({ notes: combined });
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearNotes = () => {
    setNotes("");
    updateDraft({ notes: "" });
  };

  const saveNotesToDraft = () => {
    updateDraft({ notes });
    Alert.alert("Success", "Clipboard notes attached to draft!", [
      { text: "OK", onPress: () => router.push("/newSurvey") },
    ]);
  };

  const themeColors = {
    bg: isDark ? "#0B0F19" : "#F8FAFC",
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    border: isDark ? "#334155" : "#E2E8F0",
    text: isDark ? "#F9FAFB" : "#0F172A",
    subText: isDark ? "#9CA3AF" : "#475569",
    inputBg: isDark ? "#0F172A" : "#F1F5F9",
    accent: isDark ? "#A78BFA" : "#4F46E5",
    copyRowBg: isDark ? "#0F172A" : "#F8FAFC",
    previewBg: isDark ? "#312E81" : "#E0F2FE",
    previewBorder: isDark ? "#4F46E5" : "#BAE6FD",
    previewLabel: isDark ? "#A78BFA" : "#0369A1",
    previewText: isDark ? "#E2E8F0" : "#0C4A6E",
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Clipboard Actions Manager</Text>

        {/* Copy Fields Card */}
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.cardHeader, { color: themeColors.text }]}>Inspection Quick Copy</Text>
          <Text style={styles.cardSubtitle}>Tap the copy icons to copy active survey details to your clipboard.</Text>

          {/* Copy Site Name */}
          <View style={[styles.copyRow, { backgroundColor: themeColors.copyRowBg, borderColor: themeColors.border }]}>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Active Survey Site</Text>
              <Text style={[styles.value, { color: themeColors.text }]}>{draft.siteName || "No active site name loaded"}</Text>
            </View>
            <Pressable
              style={[styles.copyBtn, { backgroundColor: themeColors.accent }]}
              onPress={() => copyToClipboard(draft.siteName, "Site Name")}
            >
              <Ionicons name="copy-outline" size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Copy GPS Coordinates */}
          <View style={[styles.copyRow, { backgroundColor: themeColors.copyRowBg, borderColor: themeColors.border }]}>
            <View style={styles.infoCol}>
              <Text style={styles.label}>GPS Coordinates</Text>
              <Text style={[styles.value, { color: themeColors.text }]}>
                {draft.location
                  ? `Lat: ${draft.location.coords.latitude.toFixed(5)}, Lon: ${draft.location.coords.longitude.toFixed(5)}`
                  : "No location attached to survey"}
              </Text>
            </View>
            <Pressable
              style={[styles.copyBtn, { backgroundColor: themeColors.accent }]}
              onPress={() => {
                if (draft.location) {
                  const val = `${draft.location.coords.latitude.toFixed(6)}, ${draft.location.coords.longitude.toFixed(6)}`;
                  copyToClipboard(val, "GPS Coordinates");
                } else {
                  Alert.alert("Warning", "No coordinates attached.");
                }
              }}
            >
              <Ionicons name="copy-outline" size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Copy Client phone */}
          <View style={[styles.copyRow, { backgroundColor: themeColors.copyRowBg, borderColor: themeColors.border }]}>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Representative Contact</Text>
              <Text style={[styles.value, { color: themeColors.text }]}>
                {draft.contact ? `${draft.contact.name} (${draft.contact.phone})` : "No contact representative selected"}
              </Text>
            </View>
            <Pressable
              style={[styles.copyBtn, { backgroundColor: themeColors.accent }]}
              onPress={() => {
                if (draft.contact) {
                  copyToClipboard(draft.contact.phone, "Phone Number");
                } else {
                  Alert.alert("Warning", "No representative contact selected.");
                }
              }}
            >
              <Ionicons name="copy-outline" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Paste Clipboard Card */}
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.cardHeader, { color: themeColors.text }]}>Clipboard Log Notes</Text>
          <Text style={styles.cardSubtitle}>Paste clipboard content or append custom logs to your survey report.</Text>

          <TextInput
            style={[styles.notesInput, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border, color: themeColors.text }]}
            placeholder="No notes logged. Tap 'Paste from Clipboard' or type notes manually..."
            placeholderTextColor="#64748B"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={(txt) => {
              setNotes(txt);
              updateDraft({ notes: txt });
            }}
          />

          <View style={styles.actionRow}>
            <Pressable style={styles.pasteBtn} onPress={handlePasteNotes}>
              <Ionicons name="clipboard-outline" size={18} color="#fff" style={styles.iconMargin} />
              <Text style={styles.btnText}>Paste Clipboard</Text>
            </Pressable>

            <Pressable style={styles.clearBtn} onPress={handleClearNotes}>
              <Ionicons name="trash-outline" size={18} color="#EF4444" style={styles.iconMargin} />
              <Text style={[styles.btnText, { color: "#EF4444" }]}>Clear Notes</Text>
            </Pressable>
          </View>
        </View>

        {/* Clipboard Preview Inspector */}
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Text style={[styles.cardHeader, { color: themeColors.text }]}>Device Clipboard Inspector</Text>
          <Text style={styles.cardSubtitle}>Inspect the active clipboard value currently stored on your device.</Text>

          <Pressable style={styles.checkBtn} onPress={fetchClipboard}>
            <Text style={[styles.checkBtnText, { color: themeColors.accent }]}>Tap to Inspect Device Clipboard</Text>
          </Pressable>

          {clipboardContent ? (
            <View style={[styles.clipboardPreview, { backgroundColor: themeColors.previewBg, borderColor: themeColors.previewBorder }]}>
              <Text style={[styles.previewLabel, { color: themeColors.previewLabel }]}>Current Clipboard Value:</Text>
              <Text style={[styles.previewContent, { color: themeColors.previewText }]}>{clipboardContent}</Text>
            </View>
          ) : null}
        </View>

        {/* Return Button */}
        {notes.trim() !== "" ? (
          <Pressable style={[styles.attachButton, { backgroundColor: themeColors.accent }]} onPress={saveNotesToDraft}>
            <Ionicons name="checkmark-circle" size={22} color="#fff" style={styles.iconMargin} />
            <Text style={styles.attachButtonText}>Attach Notes to Active Survey Draft</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  value: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 2,
  },
  copyBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pasteBtn: {
    flex: 1,
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 8,
  },
  clearBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 8,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  iconMargin: {
    marginRight: 6,
  },
  checkBtn: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  checkBtnText: {
    fontWeight: "600",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  clipboardPreview: {
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  previewContent: {
    fontSize: 14,
    marginTop: 4,
  },
  attachButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 30,
  },
  attachButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
