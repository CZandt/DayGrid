import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Input, Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../../lib/supabase";
import { FontAwesome } from "@expo/vector-icons";
import OAuthButtons from "../../../components/Oauth";

export default function SignupScreen() {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) alert(error.message);
    else alert("Check your email for verification!");
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Your Account</Text>
      
      <Input label="First Name" onChangeText={setFirstName} value={firstName} placeholder="John" autoCapitalize="words" />
      <Input label="Last Name" onChangeText={setLastName} value={lastName} placeholder="Doe" autoCapitalize="words" />
      <Input label="Email" onChangeText={setEmail} value={email} placeholder="email@address.com" autoCapitalize="none" />
      
      <Input
        label="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry={!passwordVisible}
        placeholder="Password"
        autoCapitalize="none"
        rightIcon={
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <FontAwesome name={passwordVisible ? "eye" : "eye-slash"} size={20} color="#888" />
          </TouchableOpacity>
        }
      />
      
      <Button title="Sign Up" onPress={handleSignup} disabled={loading} buttonStyle={styles.signupButton} />
      
      <OAuthButtons onGooglePress={() => alert("Google Signup")} onApplePress={() => alert("Apple Signup")} />
      
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  signupButton: {
    backgroundColor: "#6200EE",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginVertical: 10,
  },
  loginText: {
    color: "#6200EE",
    marginTop: 20,
  },
});