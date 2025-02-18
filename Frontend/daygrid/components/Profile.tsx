import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Button } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useAppContext } from "./ContextProvider";
import { supabase } from "../lib/supabase";
type PlanRouteParams = {
  session: Session;
};

export default function Profile() {
  const route = useRoute<RouteProp<{ Plan: PlanRouteParams }, "Plan">>();
  const { session } = route.params;

  const { uFirstName, uLastName } = useAppContext();
  const formattedDate = new Date(session.user.created_at).toLocaleDateString(
    "en-US"
  );

  // 🔹 Logout function
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout Error", error.message);
    } else {
      Alert.alert("Success", "You have been logged out.");
      // Navigate back to Auth screen (if you have a navigation setup)
      // navigation.replace("Auth");  // Uncomment this if using React Navigation
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.userInfo}>
          <Text style={styles.nameText}>
            {uFirstName} {uLastName}
          </Text>
          <Text style={styles.emailText}>Email: {session.user.email}</Text>
          <Text style={styles.emailText}>User since: {formattedDate}</Text>
        </View>
      </View>

      {/* Edit Info Button */}
      <Button
        mode="text"
        style={styles.editButton}
        labelStyle={styles.editButtonLabel}
        onPress={() => console.log("Edit Info")}
      >
        Edit Profile
      </Button>

      {/* 🔹 Logout Button */}
      <Button
        mode="contained"
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        Log Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: "#555",
  },
  editButton: {
    alignSelf: "flex-start",
  },
  editButtonLabel: {
    fontSize: 14,
    color: "#6200ee",
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#D32F2F", // Red color for logout
  },
});
