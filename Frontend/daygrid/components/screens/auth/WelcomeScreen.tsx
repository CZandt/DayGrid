import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthScreenNavigationProp } from "../../../types/types";

export default function WelcomeScreen() {
    const navigation = useNavigation<AuthScreenNavigationProp<"Welcome">>(); 

  return (
    <View style={styles.container}>
      {/* Placeholder for Logo */}
      <Image source={require("../../../assets/luigi.jpg")} style={styles.logo} />
      
      {/* App Name */}
      <Text style={styles.title}>DayGrid</Text>
      
      {/* Tagline */}
      <Text style={styles.tagline}>Plan your days with ease and efficiency</Text>

      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}> 
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={() => navigation.navigate("Signup")}> 
        <Text style={styles.buttonText}>Sign Up</Text>
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#6200EE",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupButton: {
    backgroundColor: "#888888", // Gray color for sign up
  },
});
