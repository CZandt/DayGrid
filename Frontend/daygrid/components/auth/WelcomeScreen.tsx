import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function WelcomeScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to DayGrid</Text>
      <TouchableOpacity style={styles.button} onPress={() => onNavigate("login")}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonOutline} onPress={() => onNavigate("signup")}>
        <Text style={styles.buttonOutlineText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: { backgroundColor: "#6200EE", padding: 12, borderRadius: 8, marginTop: 10 },
  buttonText: { color: "white", fontSize: 16 },
  buttonOutline: { borderWidth: 1, borderColor: "#6200EE", padding: 12, borderRadius: 8, marginTop: 10 },
  buttonOutlineText: { color: "#6200EE", fontSize: 16 },
});
