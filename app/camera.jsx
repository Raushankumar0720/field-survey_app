import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  useColorScheme,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImageManipulator from "expo-image-manipulator";
import { SurveyContext } from "../context/SurveyContext";

export default function CameraScreen() {
  const router = useRouter();
  const { draft, updateDraft, appTheme } = useContext(SurveyContext);
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null); // { uri, captureTime }
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [facing, setFacing] = useState("back"); // "back" or "front"
  const cameraRef = useRef(null);
  const colorScheme = useColorScheme();
  const isDark = appTheme === "system" ? colorScheme === "dark" : appTheme === "dark";

  // Web webcam references
  const webVideoRef = useRef(null);
  const [webcamStream, setWebcamStream] = useState(null);

  // Sync draft photo on load
  useEffect(() => {
    if (draft && draft.photo) {
      setPhoto(draft.photo);
    }
  }, [draft]);

  // Clean up web stream on unmount
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [webcamStream]);

  const handleCapture = async () => {
    const captureTime = new Date().toLocaleTimeString();

    if (Platform.OS === "web") {
      // Capture real frame from browser webcam video element
      if (webVideoRef.current && webcamStream) {
        try {
          const video = webVideoRef.current;
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          const photoData = { uri: dataUrl, captureTime };
          
          setPhoto(photoData);
          updateDraft({ photo: photoData });
          stopWebcam();
          return;
        } catch (e) {
          console.error("Canvas draw error:", e);
        }
      }
      
      // Secondary fallback (dummy photo) if webcam stream failed to initialize
      const dummyPhoto = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800";
      const photoData = { uri: dummyPhoto, captureTime };
      setPhoto(photoData);
      updateDraft({ photo: photoData });
      setIsCameraActive(false);
      return;
    }

    // Native mobile capture
    if (cameraRef.current) {
      try {
        const options = { quality: 0.85, skipProcessing: false };
        const data = await cameraRef.current.takePictureAsync(options);
        
        // Compress captured photo to max 1024px width and 80% quality
        const manipulated = await ImageManipulator.manipulateAsync(
          data.uri,
          [{ resize: { width: 1024 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        const photoData = { uri: manipulated.uri, captureTime };
        setPhoto(photoData);
        updateDraft({ photo: photoData });
        setIsCameraActive(false);
      } catch (error) {
        console.error("Capture Error:", error);
        Alert.alert("Capture Error", "Failed to take photo.");
      }
    }
  };

  const handleDeletePhoto = () => {
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPhoto(null);
            updateDraft({ photo: null });
          },
        },
      ]
    );
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setIsReady(false);

    if (Platform.OS === "web") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing === "back" ? "environment" : "user" },
          audio: false,
        });
        setWebcamStream(stream);
        setIsReady(true);
        setTimeout(() => {
          if (webVideoRef.current) {
            webVideoRef.current.srcObject = stream;
            webVideoRef.current.play().catch((e) => console.log("Video play error:", e));
          }
        }, 150);
      } catch (err) {
        console.error("Webcam access error:", err);
        Alert.alert(
          "Camera Access Blocked",
          "Unable to access hardware camera in web. A preset inspection photo will be generated.",
          [{ text: "Continue" }]
        );
        setIsReady(true);
      }
    } else {
      // Native simulated loading screen
      setTimeout(() => {
        setIsReady(true);
      }, 750);
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
    setIsCameraActive(false);
  };

  const toggleFacing = async () => {
    const nextFacing = facing === "back" ? "front" : "back";
    setFacing(nextFacing);

    if (Platform.OS === "web" && isCameraActive) {
      // Clean up current webcam stream first
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
      
      // Start camera with new facing mode
      try {
        setIsReady(false);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: nextFacing === "back" ? "environment" : "user" },
          audio: false,
        });
        setWebcamStream(stream);
        setIsReady(true);
        setTimeout(() => {
          if (webVideoRef.current) {
            webVideoRef.current.srcObject = stream;
            webVideoRef.current.play().catch((e) => console.log("Video play error:", e));
          }
        }, 150);
      } catch (err) {
        console.error("Webcam flip access error:", err);
      }
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

  // Permission screen for Native Devices only
  if (Platform.OS !== "web") {
    if (!permission) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: themeColors.bg }]}>
          <ActivityIndicator size="large" color={themeColors.accent} />
          <Text style={[styles.loadingText, { color: themeColors.subText }]}>Checking Camera Permission...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
          <View style={[styles.noPermissionCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
            <Ionicons name="camera-outline" size={70} color="#EF4444" />
            <Text style={[styles.noPermissionTitle, { color: themeColors.text }]}>Camera Access Required</Text>
            <Text style={[styles.noPermissionDesc, { color: themeColors.subText }]}>
              To capture site inspection photos, this app requires access to your camera.
            </Text>
            <Pressable style={[styles.grantButton, { backgroundColor: themeColors.accent }]} onPress={requestPermission}>
              <Text style={styles.grantButtonText}>Grant Permission</Text>
            </Pressable>
          </View>
        </View>
      );
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg }]}>
      {isCameraActive ? (
        <View style={styles.cameraContainer}>
          {!isReady && (
            <View style={styles.cameraLoading}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.cameraLoadingText}>Opening Camera...</Text>
            </View>
          )}

          {Platform.OS === "web" ? (
            <View style={styles.camera}>
              <video
                ref={webVideoRef}
                style={styles.webVideo}
                autoPlay
                playsInline
                muted
              />
              <View style={styles.cameraOverlay}>
                <View style={styles.cameraControlsHeader}>
                  <Pressable onPress={stopWebcam}>
                    <Ionicons name="close-circle" size={40} color="#fff" />
                  </Pressable>
                  <Pressable onPress={toggleFacing} style={styles.flipPillBtn}>
                    <Ionicons name="camera-reverse" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.flipPillText}>Flip Camera</Text>
                  </Pressable>
                </View>
                <View style={styles.captureButtonContainer}>
                  <Pressable style={styles.captureOuterButton} onPress={handleCapture}>
                    <View style={styles.captureInnerButton} />
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
              <View style={styles.cameraOverlay}>
                <View style={styles.cameraControlsHeader}>
                  <Pressable onPress={() => setIsCameraActive(false)}>
                    <Ionicons name="close-circle" size={40} color="#fff" />
                  </Pressable>
                  <Pressable onPress={toggleFacing} style={styles.flipPillBtn}>
                    <Ionicons name="camera-reverse" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.flipPillText}>Flip Camera</Text>
                  </Pressable>
                </View>
                <View style={styles.captureButtonContainer}>
                  <Pressable style={styles.captureOuterButton} onPress={handleCapture}>
                    <View style={styles.captureInnerButton} />
                  </Pressable>
                </View>
              </View>
            </CameraView>
          )}
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Text style={[styles.title, { color: themeColors.text }]}>Module 3: Camera</Text>

          {photo ? (
            <View style={[styles.photoCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
              <Image source={{ uri: photo.uri }} style={styles.previewImage} />
              <View style={[styles.photoInfo, { backgroundColor: themeColors.cardBg }]}>
                <View>
                  <Text style={styles.infoLabel}>Capture Time</Text>
                  <Text style={[styles.infoValue, { color: themeColors.text }]}>{photo.captureTime}</Text>
                </View>
                <View style={styles.actionButtons}>
                  <Pressable style={[styles.retakeButton, { backgroundColor: themeColors.accent }]} onPress={startCamera}>
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Retake</Text>
                  </Pressable>
                  <Pressable style={styles.deleteButton} onPress={handleDeletePhoto}>
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
              <Ionicons name="image-outline" size={80} color={themeColors.subText} />
              <Text style={[styles.emptyText, { color: themeColors.text }]}>No Inspection Photo Captured</Text>
              <Text style={[styles.emptyDesc, { color: themeColors.subText }]}>
                {Platform.OS === "web"
                  ? "Real-time webcam interface will activate on start."
                  : "Photos provide critical visual evidence for field surveys."}
              </Text>
              <Pressable style={[styles.openCameraButton, { backgroundColor: themeColors.accent }]} onPress={startCamera}>
                <Ionicons name="camera" size={24} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.openCameraText}>Open Camera</Text>
              </Pressable>
            </View>
          )}

          {photo && (
            <Pressable
              style={styles.saveDraftButton}
              onPress={() => {
                Alert.alert("Saved", "Inspection photo attached to survey draft!");
                router.push("/newSurvey");
              }}
            >
              <Text style={styles.saveDraftText}>Return to Survey Draft</Text>
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  noPermissionCard: {
    margin: 24,
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  noPermissionTitle: {
    fontSize: 20,
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
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  cameraLoadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
  },
  camera: {
    flex: 1,
    position: "relative",
  },
  webVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    justifyContent: "space-between",
    padding: 20,
  },
  cameraControlsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingTop: 10,
  },
  flipPillBtn: {
    backgroundColor: "rgba(0,0,0,0.65)",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.45)",
  },
  flipPillText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  captureButtonContainer: {
    alignSelf: "center",
    marginBottom: 30,
  },
  captureOuterButton: {
    borderWidth: 4,
    borderColor: "#fff",
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  captureInnerButton: {
    backgroundColor: "#fff",
    borderRadius: 30,
    width: 60,
    height: 60,
  },
  previewContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  photoCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
  },
  previewImage: {
    width: "100%",
    height: 320,
    resizeMode: "cover",
  },
  photoInfo: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 4,
  },
  emptyState: {
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  openCameraButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  openCameraText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  saveDraftButton: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveDraftText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
