import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Input, Button } from "@rneui/themed";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleResetPassword() {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      alert(error.message);
    } else {
      setMessage("A password reset link has been sent to your email.");
    }
    
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Button title="Send Reset Link" onPress={handleResetPassword} disabled={loading} />
      {message ? <Text style={styles.successMessage}>{message}</Text> : null}
      <TouchableOpacity onPress={() => onNavigate("login")}>
        <Text style={styles.switchText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  switchText: { marginTop: 20, color: "#6200EE" },
  successMessage: { marginTop: 10, color: "green", fontSize: 14 },
});
