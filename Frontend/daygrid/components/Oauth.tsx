import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "@rneui/themed";
import { FontAwesome } from "@expo/vector-icons"; // Icons for branding


// Define types for props
interface OAuthButtonsProps {
  onGooglePress: () => void;
  onApplePress: () => void;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onGooglePress, onApplePress }) => {
  return (
    <View>
      {/* Google Sign-In */}
      <Button
        title="Sign in with Google"
        buttonStyle={[styles.button, styles.googleButton]}
        titleStyle={styles.buttonText}
        icon={<FontAwesome name="google" size={20} color="white" />}
        onPress={onGooglePress}
      />

      {/* Apple Sign-In */}
      <Button
        title="Sign in with Apple"
        buttonStyle={[styles.button, styles.appleButton]}
        titleStyle={styles.buttonText}
        icon={<FontAwesome name="apple" size={20} color="white" />}
        onPress={onApplePress}
      />
    </View>
  );
};

export default OAuthButtons;

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  googleButton: {
    backgroundColor: "#DB4437", // Google Red
  },
  appleButton: {
    backgroundColor: "#000000", // Black for Apple
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 10,
    color: "white",
  },
});
