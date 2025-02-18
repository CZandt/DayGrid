import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Input, Button } from "@rneui/themed";
import { supabase } from "../../lib/supabase";

export default function ProfileSetupScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [fullName, setFullName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleProfileSetup() {
    setLoading(true);
    
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      alert("User not found. Please log in again.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      preferred_name: preferredName,
      phone_number: phoneNumber,
    });

    if (updateError) alert(updateError.message);
    else {
      alert("Profile setup complete!");
      onNavigate("home"); // Send user to main app (Toolbar)
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Up Your Profile</Text>
      
      <Input label="Full Name" onChangeText={setFullName} value={fullName} placeholder="John Doe" autoCapitalize="words" />
      <Input label="Preferred Name" onChangeText={setPreferredName} value={preferredName} placeholder="Johnny" autoCapitalize="words" />
      <Input label="Phone Number" onChangeText={setPhoneNumber} value={phoneNumber} placeholder="123-456-7890" keyboardType="phone-pad" />
      
      <Button title="Complete Setup" onPress={handleProfileSetup} disabled={loading} buttonStyle={styles.setupButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  setupButton: { backgroundColor: "#6200EE", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 8, marginVertical: 10 },
});
