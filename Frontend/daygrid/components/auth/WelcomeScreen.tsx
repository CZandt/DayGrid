import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Image 
          source={require("../../assets/DayGrid_new_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to DayGrid</Text>
        
        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={() => onNavigate("login")}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        
        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signupButton} onPress={() => onNavigate("signup")}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#373F51",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontFamily: "ProximaNova-Bold",
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: "80%",
    alignItems: "center",
  },
  loginButtonText: {
    fontFamily: "ProximaNova-Bold",
    fontSize: 16,
    color: "#9CA3AF", // White text for the Login button
  },
  signupButton: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: "80%",
    alignItems: "center",
  },
  signupButtonText: {
    fontFamily: "ProximaNova-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
