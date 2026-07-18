import React, { useContext } from "react";
import "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { ThemeProvider, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, Image } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SurveyProvider, SurveyContext } from "../context/SurveyContext";

export const unstable_settings = {
  initialRouteName: "(tabs)",
  anchor: "(tabs)",
};

// Custom Drawer Content to add Profile Header and exact drawer menu items
function CustomDrawerContent(props) {
  const { appTheme, toggleTheme, profileImage } = useContext(SurveyContext);
  const systemScheme = useColorScheme();
  const isDark = appTheme === "system" ? systemScheme === "dark" : appTheme === "dark";

  const getActiveRouteName = () => {
    if (!props.state || !props.state.routes) return "";
    const currentRouteName = props.state.routeNames?.[props.state.index];
    const tabRoute = props.state.routes.find((r) => r.name === "(tabs)");
    const tabState = tabRoute?.state;
    if (tabState && tabState.routeNames && typeof tabState.index === "number") {
      return tabState.routeNames[tabState.index];
    }
    return currentRouteName || "";
  };

  const activeRoute = getActiveRouteName();

  const themeColors = {
    bg: isDark ? "#0B0F19" : "#FFFFFF",
    divider: isDark ? "#1E293B" : "#E2E8F0",
    userName: isDark ? "#F9FAFB" : "#0F172A",
    userRole: isDark ? "#9CA3AF" : "#475569",
    rollNo: isDark ? "#64748B" : "#94A3B8",
    avatar: isDark ? "#A78BFA" : "#4F46E5",
    activeText: isDark ? "#A78BFA" : "#4F46E5",
    activeBg: isDark ? "rgba(167, 139, 250, 0.15)" : "#EEF2F6",
    inactiveText: isDark ? "#9CA3AF" : "#475569",
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.drawerContainer, { backgroundColor: themeColors.bg }]}
    >
      <View style={styles.drawerHeader}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profilePic} />
        ) : (
          <Ionicons name="person-circle" size={80} color={themeColors.avatar} />
        )}
        <Text style={[styles.userName, { color: themeColors.userName }]}>Raushan Kumar</Text>
        <Text style={[styles.userRole, { color: themeColors.userRole }]}>B.E CSE Student</Text>
        <Text style={[styles.rollNo, { color: themeColors.rollNo }]}>Roll: SUK250054CE064</Text>
      </View>
      
      <View style={[styles.divider, { backgroundColor: themeColors.divider }]} />

      <DrawerItem
        label="Dashboard"
        focused={activeRoute === "dashboard"}
        activeTintColor={themeColors.activeText}
        inactiveTintColor={themeColors.inactiveText}
        activeBackgroundColor={themeColors.activeBg}
        icon={({ color }) => <Ionicons name="home" size={22} color={color} />}
        onPress={() => props.navigation.navigate("(tabs)", { screen: "dashboard" })}
      />

      <DrawerItem
        label="Survey"
        focused={activeRoute === "newSurvey"}
        activeTintColor={themeColors.activeText}
        inactiveTintColor={themeColors.inactiveText}
        activeBackgroundColor={themeColors.activeBg}
        icon={({ color }) => <Ionicons name="add-circle" size={22} color={color} />}
        onPress={() => props.navigation.navigate("(tabs)", { screen: "newSurvey" })}
      />

      <DrawerItem
        label="Camera"
        focused={activeRoute === "camera"}
        activeTintColor={themeColors.activeText}
        inactiveTintColor={themeColors.inactiveText}
        activeBackgroundColor={themeColors.activeBg}
        icon={({ color }) => <Ionicons name="camera" size={22} color={color} />}
        onPress={() => props.navigation.navigate("camera")}
      />

      <DrawerItem
        label="Contacts"
        focused={activeRoute === "contacts"}
        activeTintColor={themeColors.activeText}
        inactiveTintColor={themeColors.inactiveText}
        activeBackgroundColor={themeColors.activeBg}
        icon={({ color }) => <Ionicons name="people" size={22} color={color} />}
        onPress={() => props.navigation.navigate("contacts")}
      />

      <DrawerItem
        label="Location"
        focused={activeRoute === "location"}
        activeTintColor={themeColors.activeText}
        inactiveTintColor={themeColors.inactiveText}
        activeBackgroundColor={themeColors.activeBg}
        icon={({ color }) => <Ionicons name="location" size={22} color={color} />}
        onPress={() => props.navigation.navigate("location")}
      />

      <DrawerItem
        label="Clipboard"
        focused={activeRoute === "clipboard"}
        activeTintColor={themeColors.activeText}
        inactiveTintColor={themeColors.inactiveText}
        activeBackgroundColor={themeColors.activeBg}
        icon={({ color }) => <Ionicons name="clipboard" size={22} color={color} />}
        onPress={() => props.navigation.navigate("clipboard")}
      />

      <DrawerItem
        label="Settings"
        focused={activeRoute === "settings"}
        activeTintColor={themeColors.activeText}
        inactiveTintColor={themeColors.inactiveText}
        activeBackgroundColor={themeColors.activeBg}
        icon={({ color }) => <Ionicons name="settings" size={22} color={color} />}
        onPress={() => props.navigation.navigate("settings")}
      />

      <View style={[styles.divider, { backgroundColor: themeColors.divider, marginVertical: 20 }]} />

      {/* Theme Toggle Button inside Drawer Footer */}
      <DrawerItem
        label={`Theme: ${appTheme.toUpperCase()}`}
        activeTintColor={themeColors.activeText}
        inactiveTintColor={themeColors.inactiveText}
        icon={({ color }) => (
          <Ionicons
            name={
              appTheme === "dark"
                ? "moon"
                : appTheme === "light"
                ? "sunny"
                : "contrast"
            }
            size={22}
            color={color}
          />
        )}
        onPress={toggleTheme}
      />

    </DrawerContentScrollView>
  );
}

function InnerRootLayout() {
  const { appTheme } = useContext(SurveyContext);
  const systemScheme = useColorScheme();
  const isDark = appTheme === "system" ? systemScheme === "dark" : appTheme === "dark";

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "#1E293B" : "#E2E8F0",
            shadowOpacity: 0,
            elevation: 0,
          },
          headerTintColor: isDark ? "#F9FAFB" : "#0F172A",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
          },
          drawerActiveTintColor: isDark ? "#A78BFA" : "#4F46E5",
          drawerInactiveTintColor: isDark ? "#9CA3AF" : "#475569",
          drawerStyle: {
            backgroundColor: isDark ? "#0B0F19" : "#FFFFFF",
            width: 280,
          },
          drawerLabelStyle: {
            marginLeft: -10,
            fontSize: 16,
            fontWeight: "600",
          },
        }}
      >
        {/* Drawer items */}
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: "Dashboard & Survey",
            title: "Smart Field Survey",
            drawerIcon: ({ color }) => <Ionicons name="home" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="camera"
          options={{
            drawerLabel: "Camera Module",
            title: "Survey Camera",
            drawerIcon: ({ color }) => <Ionicons name="camera" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="location"
          options={{
            drawerLabel: "GPS Location",
            title: "Survey Location",
            drawerIcon: ({ color }) => <Ionicons name="location" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="contacts"
          options={{
            drawerLabel: "Client Contacts",
            title: "Survey Contacts",
            drawerIcon: ({ color }) => <Ionicons name="people" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="clipboard"
          options={{
            drawerLabel: "Clipboard Actions",
            title: "Clipboard Manager",
            drawerIcon: ({ color }) => <Ionicons name="clipboard" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: "Settings",
            title: "Settings",
            drawerIcon: ({ color }) => <Ionicons name="settings" size={22} color={color} />,
          }}
        />
      </Drawer>
      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SurveyProvider>
      <InnerRootLayout />
    </SurveyProvider>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    paddingTop: 40,
    height: "100%",
  },
  drawerHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "flex-start",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  userRole: {
    fontSize: 14,
    marginTop: 2,
  },
  rollNo: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
  },
});
