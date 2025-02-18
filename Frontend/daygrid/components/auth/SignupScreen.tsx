import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Input, Button, Icon } from "@rneui/themed";
import { supabase } from "../../lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else onNavigate("profileSetup"); // Go to profile setup after signup
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.container}>
        {/* Back Arrow */}
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate("welcome")}>
          <Icon name="arrow-back" type="material" color="#111827" size={28} />
        </TouchableOpacity>

        <Text style={styles.title}>Sign Up</Text>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Input
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            containerStyle={styles.inputContainerWrapper}
            inputContainerStyle={[styles.inputContainer, styles.centeredInputContainer]}
            inputStyle={[styles.inputText, { textAlign: "center" }]}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Input
            placeholder="Enter your password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            containerStyle={styles.inputContainerWrapper}
            inputContainerStyle={[styles.inputContainer, styles.centeredInputContainer]}
            inputStyle={[styles.inputText, { textAlign: "center" }]}
            secureTextEntry
          />
        </View>

        {/* Sign Up Button */}
        <Button
          title="Sign Up"
          onPress={signUpWithEmail}
          disabled={loading}
          buttonStyle={styles.signupButton}
          titleStyle={styles.signupButtonTitle}
        />

        {/* Bottom Link */}
        <TouchableOpacity style={styles.bottomWrapper} onPress={() => onNavigate("login")}>
          <Text style={styles.bottomText}>
            Already have an account?{" "}
            <Text style={styles.bottomLink}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Light background
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 100,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 80,
    left: 24,
  },
  title: {
    fontFamily: "ProximaNova-Bold",
    fontSize: 24,
    color: "#111827",
    marginBottom: 24,
  },
  inputWrapper: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
  },
  inputContainerWrapper: {
    paddingHorizontal: 8,
  },
  inputContainer: {
    borderBottomWidth: 0,
    height: 40, // Fixed height for a single line
    paddingVertical: 0,
  },
  centeredInputContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  inputText: {
    fontFamily: "ProximaNova-Regular",
    fontSize: 16,
    color: "#111827",
    lineHeight: 20,
    paddingVertical: 0,
  },
  signupButton: {
    backgroundColor: "#111827", // Dark button
    borderRadius: 8,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  signupButtonTitle: {
    fontFamily: "ProximaNova-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  bottomWrapper: {
    marginTop: 20,
  },
  bottomText: {
    fontFamily: "ProximaNova-Regular",
    fontSize: 14,
    color: "#6B7280",
  },
  bottomLink: {
    fontFamily: "ProximaNova-Bold",
    fontSize: 14,
    color: "#111827",
  },
});
