import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Input, Button, Icon } from "@rneui/themed";
import * as AuthSession from "expo-auth-session";
import { supabase } from "../../lib/supabase";

const GOOGLE_CLIENT_ID =
  "848534837876-d03an5usggt455fgkd4jcd8t5njgoqq1.apps.googleusercontent.com";
const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
};
const redirectUri = AuthSession.makeRedirectUri();

export default function LoginScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  // Google Auth Request
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: "token",
    },
    discovery
  );

  // Email & Password States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handle Google Auth response
  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      signInWithSupabase(id_token);
    }
  }, [response]);

  async function signInWithSupabase(idToken: string) {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });
    if (error) alert("Google Login Failed: " + error.message);
    else console.log("✅ Google Login Successful:", data);
  }

  async function loginWithEmail() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert("Email Login Failed: " + error.message);
    else console.log("✅ Email Login Successful:", data);
  }

  return (
    <View style={styles.container}>
      {/* Back Arrow Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => onNavigate("welcome")}>
        <Icon name="arrow-back" type="material" color="#111827" size={28} />
      </TouchableOpacity>

      {/* Titles */}
      <Text style={styles.title}>Welcome!</Text>
      

      {/* Email Field */}
      <View style={styles.inputWrapper}>
        <Input
          placeholder="Enter your email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* Password Field with Eye Icon */}
      <View style={styles.inputWrapper}>
        <Input
          placeholder="Enter your password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          secureTextEntry={!showPassword}
          rightIcon={
            <Icon
              name={showPassword ? "eye" : "eye-off"}
              type="material-community"
              color="#9CA3AF"
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
      </View>

      {/* Forgot Password (aligned right) */}
      <View style={styles.forgotWrapper}>
        <TouchableOpacity onPress={() => onNavigate("resetPassword")}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Email Login Button */}
      <Button
        title="Login"
        onPress={loginWithEmail}
        buttonStyle={styles.loginButton}
        titleStyle={styles.loginButtonTitle}
      />

      {/* OR Divider */}
      <Text style={styles.orText}>Or </Text>

      {/* Google Login Button */}
      <Button
        title="Sign in with Google"
        onPress={() => promptAsync()}
        disabled={!request}
        buttonStyle={styles.googleButton}
        titleStyle={styles.googleButtonTitle}
      />

      {/* Bottom Link: Register */}
      <View style={styles.bottomWrapper}>
        <Text style={styles.bottomText}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => onNavigate("signup")}>
          <Text style={styles.bottomLink}>Register Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Light background
    paddingHorizontal: 24,
    paddingTop: 150,
  },
  backButton: {
    position: "absolute",
    top: 80,
    left: 24,
  },
  title: {
    fontFamily: "ProximaNova-Bold",
    fontSize: 24,
    color: "#111827", // Dark text
    marginBottom: 12,
  },
  
  inputWrapper: {
    backgroundColor: "#F3F4F6", // Light gray background for inputs
    borderRadius: 8,
    marginBottom: 16,
  },
  inputContainer: {
    borderBottomWidth: 0, // Remove default underline
  },
  inputText: {
    fontFamily: "ProximaNova-Regular",
    fontSize: 16,
    color: "#111827",
  },
  forgotWrapper: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotText: {
    fontFamily: "ProximaNova-Regular",
    fontSize: 14,
    color: "#9CA3AF",
  },
  loginButton: {
    backgroundColor: "#111827", // Dark button
    borderRadius: 8,
    paddingVertical: 14,
  },
  loginButtonTitle: {
    fontFamily: "ProximaNova-Bold",
    fontSize: 16,
  },
  orText: {
    fontFamily: "ProximaNova-Regular",
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginVertical: 24,
  },
  googleButton: {
    backgroundColor: "#DB4437",
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 30,
  },
  googleButtonTitle: {
    fontFamily: "ProximaNova-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  bottomWrapper: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
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
