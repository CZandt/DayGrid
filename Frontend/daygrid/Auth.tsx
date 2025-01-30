import React, { useState } from "react";
import { Alert, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { supabase } from "./lib/supabase";
import { Button, Input } from "@rneui/themed";
import { FontAwesome } from "@expo/vector-icons"; // Import FontAwesome icons
import OAuthButtons from "./components/Oauth"; // Import OAuth button component

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // 🔹 New state for toggling password visibility

  async function signInWithEmail() {
    setLoading(true);
    console.log("LOADING");
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    console.log("LOADED");
    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  // Mock OAuth function (replace this when Supabase OAuth is ready)
  const mockOAuth = (provider: string) => {
    console.log(`${provider} OAuth clicked`);
    Alert.alert(`${provider} OAuth clicked`, "This will work once configured.");
  };

  return (
    <View style={styles.container}>
      {/* Email Input */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: "font-awesome", name: "envelope" }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input with Eye Icon */}
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: "font-awesome", name: "lock" }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={!passwordVisible} // Toggle visibility
          placeholder="Password"
          autoCapitalize="none"
          rightIcon={
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <FontAwesome
                name={passwordVisible ? "eye" : "eye-slash"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          }
        />
      </View>

      {/* Sign In & Sign Up Buttons */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title="Sign in"
          disabled={loading}
          onPress={() => signInWithEmail()}
          buttonStyle={styles.authButton}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading}
          onPress={() => signUpWithEmail()}
          buttonStyle={styles.authButton}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      {/* OAuth Buttons */}
      <OAuthButtons
        onGooglePress={() => mockOAuth("Google")}
        onApplePress={() => mockOAuth("Apple")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 16,
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  verticallySpaced: {
    paddingVertical: 8,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  authButton: {
    backgroundColor: "#6200EE", // Consistent color for auth buttons
    borderRadius: 8,
    paddingVertical: 12,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: "#666",
  },
});


