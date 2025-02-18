import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import child screens
import WelcomeScreen from "./components/auth/WelcomeScreen";
import LoginScreen from "./components/auth/LoginScreen";
import SignupScreen from "./components/auth/SignupScreen";
import ResetPasswordScreen from "./components/auth/ResetPasswordScreen";
import ProfileSetupScreen from "./components/auth/ProfileSetupScreen";

export default function Auth() {
  const [screen, setScreen] = useState("welcome"); // Tracks which screen to show

  return (
    <SafeAreaView style={styles.container}>
      {screen === "welcome" && <WelcomeScreen onNavigate={setScreen} />}
      {screen === "login" && <LoginScreen onNavigate={setScreen} />}
      {screen === "signup" && <SignupScreen onNavigate={setScreen} />}
      {screen === "resetPassword" && <ResetPasswordScreen onNavigate={setScreen} />}
      {screen === "profileSetup" && <ProfileSetupScreen onNavigate={setScreen} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#373F51", // Dark background for the entire screen
  },
});
