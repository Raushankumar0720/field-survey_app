import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Alert,
  Modal,
  Image,
  ScrollView,
  SafeAreaView,
  useColorScheme,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { SurveyContext } from "../../context/SurveyContext";

export default function History() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { surveys, deleteSurvey, appTheme } = useContext(SurveyContext);
  const colorScheme = useColorScheme();
  const isDark = appTheme === "system" ? colorScheme === "dark" : appTheme === "dark";

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Deep link routing when navigation occurs from dashboard recent cards
  useEffect(() => {
    if (params && params.selectId) {
      const match = surveys.find((s) => s.id === params.selectId);
      if (match) {
        setSelectedSurvey(match);
        setModalVisible(true);
      }
    }
  }, [params, surveys]);

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to permanently delete this survey record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteSurvey(id);
            if (success) {
              setModalVisible(false);
              setSelectedSurvey(null);
              Alert.alert("Success", "Survey record deleted.");
            } else {
              Alert.alert("Error", "Failed to delete survey record.");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (survey) => {
    setModalVisible(false);
    // Redirect to New Survey screen with editing id
    router.push({
      pathname: "/newSurvey",
      params: { editId: survey.id },
    });
  };

  const handleSharePDF = async (survey) => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Inspection Report - ${survey.siteName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 25px; color: #1E293B; background-color: #FFFFFF; }
            h1 { color: #4F46E5; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px; margin-bottom: 16px; font-size: 26px; font-weight: bold; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 13px; color: #64748B; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #4F46E5; margin-bottom: 8px; letter-spacing: 0.5px; }
            .value { font-size: 17px; font-weight: bold; color: #0F172A; }
            .desc { font-size: 14px; line-height: 1.6; color: #334155; }
            .info-card { background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; border-radius: 8px; font-size: 14px; margin-bottom: 10px; line-height: 1.5; }
            .priority-tag { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .priority-high { background-color: #FEE2E2; color: #991B1B; }
            .priority-medium { background-color: #FEF3C7; color: #92400E; }
            .priority-low { background-color: #D1FAE5; color: #065F46; }
            .preview-img { width: 100%; max-width: 480px; height: auto; border-radius: 8px; margin-top: 10px; border: 1px solid #E2E8F0; }
            .student-footer { margin-top: 60px; border-top: 2px solid #E2E8F0; padding-top: 12px; font-size: 12px; color: #64748B; text-align: center; line-height: 1.6; }
          </style>
        </head>
        <body>
          <h1>Site Inspection Audit Report</h1>
          
          <div class="meta-info">
            <div><strong>Report ID:</strong> ${survey.id}</div>
            <div><strong>Date Logged:</strong> ${survey.date}</div>
          </div>

          <div class="section">
            <div class="section-title">Inspection Site Details</div>
            <div class="value">${survey.siteName}</div>
          </div>

          <div class="section">
            <div class="section-title">Client Representative</div>
            <div class="value">${survey.clientName}</div>
          </div>

          <div class="section">
            <div class="section-title">Audit Priority</div>
            <div>
              <span class="priority-tag priority-${survey.priority.toLowerCase()}">${survey.priority}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Description Summary</div>
            <div class="desc">${survey.description}</div>
          </div>

          ${
            survey.location
              ? `
          <div class="section">
            <div class="section-title">GPS Coordinates & Location</div>
            <div class="info-card">
              <strong>Latitude:</strong> ${(survey.location.coords ? survey.location.coords.latitude : survey.location.latitude).toFixed(6)}°<br/>
              <strong>Longitude:</strong> ${(survey.location.coords ? survey.location.coords.longitude : survey.location.longitude).toFixed(6)}°<br/>
              ${
                survey.location.address
                  ? `<strong>Address:</strong> ${survey.location.address}<br/>`
                  : ""
              }
              ${
                survey.location.weather
                  ? `<strong>Weather:</strong> ${survey.location.weather}`
                  : ""
              }
            </div>
          </div>
          `
              : ""
          }

          ${
            survey.contact
              ? `
          <div class="section">
            <div class="section-title">Assigned Representative Contact</div>
            <div class="info-card">
              <strong>Name:</strong> ${survey.contact.name}<br/>
              <strong>Phone:</strong> ${survey.contact.phone}
            </div>
          </div>
          `
              : ""
          }

          ${
            survey.notes
              ? `
          <div class="section">
            <div class="section-title">Survey Clipboard Logs & Notes</div>
            <div class="desc" style="white-space: pre-wrap; background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; border-radius: 8px;">${survey.notes}</div>
          </div>
          `
              : ""
          }

          ${
            survey.photo
              ? `
          <div class="section">
            <div class="section-title">Inspected Site Photo Evidence</div>
            <img src="${survey.photo.uri}" class="preview-img" />
            <div style="font-size: 11px; color: #64748B; margin-top: 6px;">Captured at: ${survey.photo.captureTime}</div>
          </div>
          `
              : ""
          }

          <div class="student-footer">
            <strong>Auditor Information</strong><br/>
            Student: Raushan Kumar &bull; Roll No: SUK250054CE064<br/>
            Course: B.E CSE &bull; Swaminarayan University
          </div>
        </body>
        </html>
      `;

      if (Platform.OS === "web") {
        // For web, open print dialog directly
        await Print.printAsync({ html: htmlContent });
      } else {
        // For mobile, generate PDF file uri and open Sharing sheet
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Share Audit Report: ${survey.siteName}`,
        });
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Export Error", "Failed to generate or share PDF report.");
    }
  };

  // Filter & Search Logic
  const filteredData = surveys.filter((item) => {
    const matchesSearch =
      item.siteName.toLowerCase().includes(search.toLowerCase()) ||
      item.clientName.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());

    if (filter === "All") return matchesSearch;
    return matchesSearch && item.priority === filter;
  });

  const themeColors = {
    bg: isDark ? "#0B0F19" : "#F8FAFC",
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    border: isDark ? "#334155" : "#E2E8F0",
    text: isDark ? "#F9FAFB" : "#0F172A",
    subText: isDark ? "#9CA3AF" : "#475569",
    inputBg: isDark ? "#0F172A" : "#FFFFFF",
    activeTab: isDark ? "#A78BFA" : "#4F46E5",
    activeTabText: "#FFFFFF",
    inactiveTabText: isDark ? "#9CA3AF" : "#475569",
    inactiveTabBg: isDark ? "#1E293B" : "#FFFFFF",
    modalOverlay: "rgba(0, 0, 0, 0.7)",
    modalHeaderBorder: isDark ? "#334155" : "#E2E8F0",
    notesBg: isDark ? "#0F172A" : "#F8FAFC",
    // Priority Colors
    highBg: isDark ? "#7F1D1D" : "#FEE2E2",
    highText: isDark ? "#FCA5A5" : "#991B1B",
    mediumBg: isDark ? "#78350F" : "#FEF3C7",
    mediumText: isDark ? "#FCD34D" : "#92400E",
    lowBg: isDark ? "#064E3B" : "#D1FAE5",
    lowText: isDark ? "#6EE7B7" : "#065F46",
    accent: isDark ? "#A78BFA" : "#4F46E5",
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg }]}>
      {/* Search & Filter Header */}
      <View style={styles.header}>
        <View style={[styles.searchContainer, { backgroundColor: themeColors.inputBg, borderColor: themeColors.border }]}>
          <Ionicons name="search" size={20} color={themeColors.subText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Search by ID, site, client..."
            placeholderTextColor="#64748B"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={themeColors.subText} />
            </Pressable>
          )}
        </View>

        {/* Filter Segment tabs */}
        <View style={styles.filterContainer}>
          {["All", "High", "Medium", "Low"].map((level) => {
            const isSelected = filter === level;
            return (
              <Pressable
                key={level}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isSelected ? themeColors.activeTab : themeColors.inactiveTabBg,
                    borderColor: themeColors.border,
                  },
                ]}
                onPress={() => setFilter(level)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    {
                      color: isSelected ? themeColors.activeTabText : themeColors.inactiveTabText,
                      fontWeight: isSelected ? "bold" : "600",
                    },
                  ]}
                >
                  {level}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* History Log List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
            onPress={() => {
              setSelectedSurvey(item);
              setModalVisible(true);
            }}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.surveyId, { color: themeColors.accent }]}>{item.id}</Text>
              <View
                style={[
                  styles.badge,
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
                    styles.badgeText,
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
            </View>

            <Text style={[styles.siteName, { color: themeColors.text }]}>{item.siteName}</Text>
            <Text style={[styles.clientName, { color: themeColors.subText }]}>Client: {item.clientName}</Text>
            <Text style={[styles.description, { color: themeColors.subText }]} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

            <View style={styles.cardFooter}>
              <View style={styles.footerRow}>
                <Ionicons name="calendar-outline" size={16} color={themeColors.subText} />
                <Text style={[styles.footerText, { color: themeColors.subText }]}>{item.date}</Text>
              </View>
              <View style={styles.footerRow}>
                {item.photo && <Ionicons name="image" size={16} color="#10B981" style={{ marginRight: 6 }} />}
                {item.location && <Ionicons name="location" size={16} color="#3B82F6" />}
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={themeColors.subText} />
            <Text style={[styles.emptyText, { color: themeColors.text }]}>No matching inspection logs found.</Text>
          </View>
        }
      />

      {/* Modal View for Detailed Log info */}
      {selectedSurvey && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: themeColors.modalOverlay }]}>
            <View style={[styles.modalContent, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
              {/* Header */}
              <View style={[styles.modalHeader, { borderBottomColor: themeColors.modalHeaderBorder }]}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>Inspection Details</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={themeColors.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* ID and Date */}
                <View style={styles.rowSection}>
                  <View>
                    <Text style={styles.modalLabel}>Survey ID</Text>
                    <Text style={[styles.modalVal, { color: themeColors.text }]}>{selectedSurvey.id}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.modalLabel}>Date Created</Text>
                    <Text style={[styles.modalVal, { color: themeColors.text }]}>{selectedSurvey.date}</Text>
                  </View>
                </View>

                {/* Site details */}
                <View style={styles.section}>
                  <Text style={styles.modalLabel}>Site Name</Text>
                  <Text style={[styles.modalSite, { color: themeColors.text }]}>{selectedSurvey.siteName}</Text>
                </View>

                {/* Client details */}
                <View style={styles.section}>
                  <Text style={styles.modalLabel}>Client Representative</Text>
                  <Text style={[styles.modalClient, { color: themeColors.text }]}>{selectedSurvey.clientName}</Text>
                </View>

                {/* Description details */}
                <View style={styles.section}>
                  <Text style={styles.modalLabel}>Description Summary</Text>
                  <Text style={[styles.modalDesc, { color: themeColors.subText }]}>{selectedSurvey.description}</Text>
                </View>

                {/* Photo details */}
                <View style={styles.section}>
                  <Text style={styles.modalLabel}>Inspected Site Photo</Text>
                  {selectedSurvey.photo ? (
                    <View>
                      <Image source={{ uri: selectedSurvey.photo.uri }} style={styles.modalImage} />
                      <Text style={[styles.modalImageTime, { color: themeColors.subText }]}>
                        Captured at: {selectedSurvey.photo.captureTime}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.infoCard, { backgroundColor: themeColors.notesBg, borderColor: themeColors.border }]}>
                      <Ionicons name="camera-outline" size={22} color="#EF4444" />
                      <Text style={[styles.infoCardText, { color: themeColors.text }]}>No site photo evidence attached.</Text>
                    </View>
                  )}
                </View>

                {/* GPS Coordinates */}
                <View style={styles.section}>
                  <Text style={styles.modalLabel}>GPS Location coordinates</Text>
                  {selectedSurvey.location ? (
                    <View style={[styles.infoCard, { backgroundColor: themeColors.notesBg, borderColor: themeColors.border }]}>
                      <Ionicons name="location-outline" size={22} color="#10B981" />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={[styles.infoCardText, { color: themeColors.text, marginLeft: 0 }]}>
                          Lat: {(selectedSurvey.location.coords ? selectedSurvey.location.coords.latitude : selectedSurvey.location.latitude).toFixed(6)}°, Lon: {(selectedSurvey.location.coords ? selectedSurvey.location.coords.longitude : selectedSurvey.location.longitude).toFixed(6)}°
                        </Text>
                        {selectedSurvey.location.address && (
                          <Text style={[styles.infoCardText, { color: themeColors.subText, fontSize: 11, marginLeft: 0, marginTop: 4 }]}>
                            Address: {selectedSurvey.location.address}
                          </Text>
                        )}
                        {selectedSurvey.location.weather && (
                          <Text style={[styles.infoCardText, { color: themeColors.subText, fontSize: 11, marginLeft: 0, marginTop: 4 }]}>
                            Weather: {selectedSurvey.location.weather}
                          </Text>
                        )}
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.infoCard, { backgroundColor: themeColors.notesBg, borderColor: themeColors.border }]}>
                      <Ionicons name="alert-circle-outline" size={22} color="#EF4444" />
                      <Text style={[styles.infoCardText, { color: themeColors.text }]}>No GPS coordinates attached.</Text>
                    </View>
                  )}
                </View>

                {/* Representative contacts */}
                <View style={styles.section}>
                  <Text style={styles.modalLabel}>Assigned Client Representative</Text>
                  {selectedSurvey.contact ? (
                    <View style={[styles.infoCard, { backgroundColor: themeColors.notesBg, borderColor: themeColors.border }]}>
                      <Ionicons name="people-outline" size={22} color={themeColors.accent} />
                      <Text style={[styles.infoCardText, { color: themeColors.text }]}>
                        {selectedSurvey.contact.name} ({selectedSurvey.contact.phone})
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.infoCard, { backgroundColor: themeColors.notesBg, borderColor: themeColors.border }]}>
                      <Ionicons name="people-outline" size={22} color="#EF4444" />
                      <Text style={[styles.infoCardText, { color: themeColors.text }]}>No representative contacts loaded.</Text>
                    </View>
                  )}
                </View>

                {/* Additional notes */}
                <View style={[styles.section, { marginBottom: 30 }]}>
                  <Text style={styles.modalLabel}>Survey Clipboard Notes</Text>
                  <Text style={[styles.notesBox, { backgroundColor: themeColors.notesBg, color: themeColors.text }]}>
                    {selectedSurvey.notes || "No additional clipboard notes logged."}
                  </Text>
                </View>
              </ScrollView>

              {/* Actions */}
              <View style={[styles.modalActions, { borderTopColor: themeColors.modalHeaderBorder }]}>
                <Pressable style={styles.deleteBtn} onPress={() => handleDelete(selectedSurvey.id)}>
                  <Ionicons name="trash-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.btnText}>Delete</Text>
                </Pressable>

                <Pressable style={styles.sharePdfBtn} onPress={() => handleSharePDF(selectedSurvey)}>
                  <Ionicons name="share-social-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.btnText}>Share PDF</Text>
                </Pressable>

                <Pressable style={styles.editBtn} onPress={() => handleEdit(selectedSurvey)}>
                  <Ionicons name="create-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.btnText}>Edit</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 46,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  filterTab: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  surveyId: {
    fontSize: 14,
    fontWeight: "bold",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  siteName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  clientName: {
    fontSize: 13,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 80,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    width: "100%",
    maxHeight: "85%",
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalScroll: {
    paddingVertical: 14,
  },
  section: {
    marginBottom: 14,
  },
  rowSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  modalSite: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalClient: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalVal: {
    fontSize: 15,
    fontWeight: "500",
  },
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    resizeMode: "cover",
    marginTop: 4,
  },
  modalImageTime: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  infoCardText: {
    fontSize: 13,
    marginLeft: 8,
  },
  notesBox: {
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 6,
  },
  sharePdfBtn: {
    flex: 1.2,
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 6,
  },
  editBtn: {
    flex: 1,
    backgroundColor: "#6366F1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});