import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

export const SurveyContext = createContext();

const initialDraft = {
  siteName: "",
  clientName: "",
  description: "",
  priority: "Medium",
  date: new Date().toLocaleDateString(),
  photo: null, // { uri: string, captureTime: string }
  contact: null, // { name: string, phoneNumber: string }
  location: null, // { latitude: number, longitude: number, accuracy: number }
  notes: "",
};

export const SurveyProvider = ({ children }) => {
  const [surveys, setSurveys] = useState([]);
  const [draft, setDraft] = useState({ ...initialDraft });
  const [loading, setLoading] = useState(true);
  const [appTheme, setAppTheme] = useState("system"); // 'system', 'light', 'dark'
  const [profileImage, setProfileImage] = useState(null); // uri of profile picture
  const [isOnline, setIsOnline] = useState(true);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Load surveys, theme, profile image, and draft from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem("surveys");
        if (stored) {
          setSurveys(JSON.parse(stored));
        } else {
          // Add default initial data for demo
          const defaultData = [
            {
              id: "SURV-1001",
              siteName: "ABC Factory",
              clientName: "Reliance Ltd",
              description: "Inspection of main production line and power backup generator systems.",
              priority: "High",
              date: "18 Jul 2026",
              photo: null,
              contact: { name: "Anil Ambani", phoneNumber: "+91 98765 43210" },
              location: { latitude: 19.0760, longitude: 72.8777, accuracy: 5.2 },
              notes: "Requires immediate follow-up on safety switch wiring.",
            },
            {
              id: "SURV-1002",
              siteName: "XYZ Warehouse",
              clientName: "Tata Steel",
              description: "Structural check on storage bays and emergency exits.",
              priority: "Medium",
              date: "17 Jul 2026",
              photo: null,
              contact: { name: "Ratan Tata", phoneNumber: "+91 99887 76655" },
              location: { latitude: 22.8046, longitude: 86.2029, accuracy: 12.4 },
              notes: "Emergency lighting needs battery replacement.",
            },
          ];
          setSurveys(defaultData);
          await AsyncStorage.setItem("surveys", JSON.stringify(defaultData));
        }

        const storedTheme = await AsyncStorage.getItem("appTheme");
        if (storedTheme) {
          setAppTheme(storedTheme);
        }

        const storedProfileImage = await AsyncStorage.getItem("profileImage");
        if (storedProfileImage) {
          setProfileImage(storedProfileImage);
        }

        const storedDraft = await AsyncStorage.getItem("surveyDraft");
        if (storedDraft) {
          setDraft(JSON.parse(storedDraft));
        }
      } catch (e) {
        console.error("Error loading surveys/theme/profileImage/draft", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Auto-save draft changes to AsyncStorage
  useEffect(() => {
    const saveDraft = async () => {
      try {
        await AsyncStorage.setItem("surveyDraft", JSON.stringify(draft));
      } catch (e) {
        console.error("Error auto-saving survey draft", e);
      }
    };
    // Don't auto-save while loading is true to avoid overwriting on initial boot
    if (!loading) {
      saveDraft();
    }
  }, [draft, loading]);

  // Update draft fields
  const updateDraft = (fields) => {
    setDraft((prev) => ({
      ...prev,
      ...fields,
    }));
  };

  // Clear draft
  const clearDraft = async () => {
    const freshDraft = {
      ...initialDraft,
      date: new Date().toLocaleDateString(),
    };
    setDraft(freshDraft);
    try {
      await AsyncStorage.setItem("surveyDraft", JSON.stringify(freshDraft));
    } catch (e) {
      console.error("Error clearing survey draft", e);
    }
  };

  // Submit survey
  const submitSurvey = async (editingId = null) => {
    try {
      let updatedSurveys;
      if (editingId) {
        // Edit existing
        updatedSurveys = surveys.map((s) =>
          s.id === editingId ? { ...draft, id: editingId } : s
        );
      } else {
        // Create new
        const newSurvey = {
          ...draft,
          id: `SURV-${Math.floor(1000 + Math.random() * 9000)}`,
        };
        updatedSurveys = [newSurvey, ...surveys];
      }
      setSurveys(updatedSurveys);
      await AsyncStorage.setItem("surveys", JSON.stringify(updatedSurveys));
      await clearDraft(); // reset draft in state and store
      return true;
    } catch (e) {
      console.error("Error saving survey", e);
      return false;
    }
  };

  // Delete survey
  const deleteSurvey = async (id) => {
    try {
      const updated = surveys.filter((s) => s.id !== id);
      setSurveys(updated);
      await AsyncStorage.setItem("surveys", JSON.stringify(updated));
      return true;
    } catch (e) {
      console.error("Error deleting survey", e);
      return false;
    }
  };

  // Clear all surveys
  const clearAllSurveys = async () => {
    try {
      setSurveys([]);
      await AsyncStorage.removeItem("surveys");
    } catch (e) {
      console.error("Error clearing database", e);
    }
  };

  // Toggle theme mode
  const toggleTheme = async () => {
    let nextTheme = "light";
    if (appTheme === "light") nextTheme = "dark";
    else if (appTheme === "dark") nextTheme = "system";
    else nextTheme = "light"; // system -> light -> dark -> system

    setAppTheme(nextTheme);
    await AsyncStorage.setItem("appTheme", nextTheme);
  };

  // Update Profile Image
  const updateProfileImage = async (uri) => {
    try {
      setProfileImage(uri);
      if (uri) {
        await AsyncStorage.setItem("profileImage", uri);
      } else {
        await AsyncStorage.removeItem("profileImage");
      }
    } catch (e) {
      console.error("Error saving profile image", e);
    }
  };

  return (
    <SurveyContext.Provider
      value={{
        surveys,
        draft,
        loading,
        appTheme,
        profileImage,
        isOnline,
        updateDraft,
        clearDraft,
        submitSurvey,
        deleteSurvey,
        clearAllSurveys,
        toggleTheme,
        updateProfileImage,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
};
