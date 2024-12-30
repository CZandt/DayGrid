import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Button } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useAppContext } from "./ContextProvider";

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

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        {/* Profile Photo Placeholder */}
        <View style={styles.photoContainer}>
          {/* <Image
            style={styles.photo}
            source={require("./placeholder-profile.png")} // Replace with a default profile image path
          /> */}
        </View>

        {/* User Info */}
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
    flexDirection: "row", // Arrange items horizontally
    alignItems: "center", // Align items vertically in the center
    marginBottom: 20,
  },
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#d9d9d9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20, // Space between the photo and user info
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  userInfo: {
    flex: 1, // Allow the user info to take the remaining space
  },
  nameText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: "#555",
  },
  editButton: {
    alignSelf: "flex-start", // Align the button to the left
    padding: 0, // Remove extra padding
  },
  editButtonLabel: {
    fontSize: 14,
    color: "#6200ee",
  },
});
