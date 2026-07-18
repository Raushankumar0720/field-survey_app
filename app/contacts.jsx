import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  useColorScheme,
} from "react-native";
import * as Contacts from "expo-contacts";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SurveyContext } from "../context/SurveyContext";

export default function ContactsScreen() {
  const router = useRouter();
  const { updateDraft, appTheme } = useContext(SurveyContext);

  const [permission, setPermission] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = appTheme === "system" ? colorScheme === "dark" : appTheme === "dark";

  // Mock Contacts Data for Web fallback
  const MOCK_CONTACTS = [
    { id: "1", name: "Suresh Patel", phone: "+91 98250 12345" },
    { id: "2", name: "Anjali Shah", phone: "+91 99099 67890" },
    { id: "3", name: "Rajesh Mehta", phone: "+91 97243 55512" },
    { id: "4", name: "Vikram Sharma", phone: "+91 81400 99887" },
    { id: "5", name: "Pooja Joshi", phone: "+91 90990 11223" },
  ];

  useEffect(() => {
    requestPermissionAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestPermissionAndLoad = async () => {
    setLoading(true);

    if (Platform.OS === "web") {
      // Simulate loading mock contacts on Web
      setTimeout(() => {
        setPermission("granted");
        setContacts(MOCK_CONTACTS);
        setFilteredContacts(MOCK_CONTACTS);
        setLoading(false);
      }, 700);
      return;
    }

    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setPermission(status);

      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers],
        });

        // Filter and map contacts with valid names
        const formatted = data
          .filter((c) => c.name)
          .map((c) => ({
            id: c.id,
            name: c.name,
            phone: c.phoneNumbers?.[0]?.number || "",
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setContacts(formatted);
        setFilteredContacts(formatted);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to retrieve device contacts address book.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (text.trim() === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter((c) =>
        c.name.toLowerCase().includes(text.toLowerCase()) ||
        c.phone.includes(text)
      );
      setFilteredContacts(filtered);
    }
  };

  const selectContact = (contact) => {
    if (!contact.phone) {
      Alert.alert("Missing Phone Number", "This contact does not have a registered phone number.");
      return;
    }
    updateDraft({ contact });
    Alert.alert("Contact Attached", `${contact.name} has been attached to survey draft!`, [
      { text: "Return to Draft", onPress: () => router.push("/newSurvey") },
    ]);
  };

  const themeColors = {
    bg: isDark ? "#0B0F19" : "#F8FAFC",
    cardBg: isDark ? "#1E293B" : "#FFFFFF",
    border: isDark ? "#334155" : "#E2E8F0",
    text: isDark ? "#F9FAFB" : "#0F172A",
    subText: isDark ? "#9CA3AF" : "#475569",
    accent: isDark ? "#A78BFA" : "#4F46E5",
    avatarBg: isDark ? "#312E81" : "#DBEAFE",
    avatarText: isDark ? "#A78BFA" : "#2563EB",
    actionIconButtonBg: isDark ? "#312E81" : "#EEF2F6",
    attachBtnBg: isDark ? "#064E3B" : "#D1FAE5",
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: themeColors.bg }]}>
        <ActivityIndicator size="large" color={themeColors.accent} />
        <Text style={[styles.loadingText, { color: themeColors.subText }]}>Fetching Contacts Address Book...</Text>
      </View>
    );
  }

  if (permission !== "granted") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg }]}>
        <View style={[styles.noPermissionCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
          <Ionicons name="people-outline" size={70} color="#EF4444" />
          <Text style={[styles.noPermissionTitle, { color: themeColors.text }]}>Contacts Access Required</Text>
          <Text style={[styles.noPermissionDesc, { color: themeColors.subText }]}>
            To assign representatives, this app requires access to your contacts.
          </Text>
          <Pressable style={[styles.grantButton, { backgroundColor: themeColors.accent }]} onPress={requestPermissionAndLoad}>
            <Text style={styles.grantButtonText}>Grant Permission / Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Representative Contacts</Text>
        <View style={[styles.counterBadge, { backgroundColor: themeColors.accent }]}>
          <Text style={styles.counterText}>{filteredContacts.length} Contacts</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBarContainer, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
        <Ionicons name="search" size={20} color={themeColors.subText} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchBar, { color: themeColors.text }]}
          placeholder="Search contacts..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={handleSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={18} color={themeColors.subText} />
          </Pressable>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.contactCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}
            onPress={() => selectContact(item)}
          >
            <View style={[styles.avatarCircle, { backgroundColor: themeColors.avatarBg }]}>
              <Text style={[styles.avatarText, { color: themeColors.avatarText }]}>{item.name[0]}</Text>
            </View>

            <View style={styles.contactInfo}>
              <Text style={[styles.contactName, { color: themeColors.text }]}>{item.name}</Text>
              {item.phone ? (
                <Text style={[styles.contactPhone, { color: themeColors.subText }]}>{item.phone}</Text>
              ) : (
                <Text style={[styles.contactPhone, styles.noPhone]}>No Phone Available</Text>
              )}
            </View>

            <View style={styles.contactActions}>
              <Pressable
                style={[styles.actionIconButton, { backgroundColor: themeColors.actionIconButtonBg }]}
                onPress={() => {
                  if (item.phone) {
                    Alert.alert("Contact Details", `Name: ${item.name}\nPhone: ${item.phone}`);
                  }
                }}
              >
                <Ionicons name="information-circle-outline" size={20} color={themeColors.accent} />
              </Pressable>

              <Pressable
                style={[styles.actionIconButton, styles.attachBtn, { backgroundColor: themeColors.attachBg }]}
                onPress={() => selectContact(item)}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
              </Pressable>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people" size={60} color={themeColors.subText} />
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No Contacts Found</Text>
            <Text style={[styles.emptyDesc, { color: themeColors.subText }]}>Try typing a different name or search term.</Text>
            <Pressable style={[styles.reloadButton, { backgroundColor: themeColors.accent }]} onPress={requestPermissionAndLoad}>
              <Text style={styles.reloadButtonText}>Reload Address Book</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  counterBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  counterText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 46,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    height: "100%",
    fontSize: 15,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
  },
  contactPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  noPhone: {
    color: "#EF4444",
    fontStyle: "italic",
  },
  contactActions: {
    flexDirection: "row",
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  attachBtn: {
    // handled dynamically
  },
  noPermissionCard: {
    margin: 24,
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  noPermissionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
  },
  noPermissionDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  grantButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  grantButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  reloadButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  reloadButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
