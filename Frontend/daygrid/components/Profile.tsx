import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  Switch,
  Platform,
  Modal,
} from "react-native";

import { Button } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useAppContext } from "./ContextProvider";
import * as Notifications from "expo-notifications";
import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

import { supabase } from "../lib/supabase";

type PlanRouteParams = {
  session: Session;
};

//Reminder Messages
const TITLE = "DayGrid";
const MORNING_SUBTITLE = "Lock in gang!";
const MORNING_BODY = "Start your day right with a quick planning session!";
const EVENING_SUBTITLE = "Ready to review your day?";
const EVENING_BODY = "Let's see how you did.";

export default function Profile() {
  const route = useRoute<RouteProp<{ Plan: PlanRouteParams }, "Plan">>();
  const { session } = route.params;

  const { uFirstName, uLastName } = useAppContext();
  const formattedDate = new Date(session.user.created_at).toLocaleDateString(
    "en-US"
  );
  //for the default and custom reminders
  const [defaultReminders, setDefaultReminders] = useState(true);
  const [customReminders, setCustomReminders] = useState(false);
  const [morningTime, setMorningTime] = useState<Date>(
    new Date(new Date().setHours(9, 0, 0))
  );
  const [eveningTime, setEveningTime] = useState<Date>(
    new Date(new Date().setHours(21, 0, 0))
  );

  // For handling the inline time picker and save button
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"morning" | "evening">(
    "morning"
  );
  // Temporary state to store the user's selection until they hit Save
  const [tempTime, setTempTime] = useState<Date>(new Date());

  // Open the inline time picker and set the temporary value to the current time for the mode
  function openPicker(mode: "morning" | "evening") {
    setPickerMode(mode);
    setTempTime(mode === "morning" ? morningTime : eveningTime);
    setShowPicker(true);
  }

  // Called when the user changes the time in the picker. We update the temporary state,
  // but we do not update the final state until the user taps Save.
  function onPickerChange(event: any, selectedDate?: Date) {
    if (selectedDate) {
      setTempTime(selectedDate);
    }
  }

  // Save the selected time and update the corresponding reminder
  function onSaveTime() {
    if (pickerMode === "morning") {
      setMorningTime(tempTime);
    } else {
      setEveningTime(tempTime);
    }
    setShowPicker(false);
    Alert.alert("Saved", "Your new reminder changes have been saved.");
  }

  // Toggle functions
  function toggleDefaultReminders(value: boolean) {
    //way to force teh user to have reminders and warn them if they try to turn them off
    if (!value && !customReminders) {
      Alert.alert(
        "Reminders Recommended",
        "We recommend keeping your daily reminders on to help you stay accountable."
      );
      return;
    }

    setDefaultReminders(value);
    if (value) {
      // When default is turned on, disable custom reminders and reset times to default 9 AM / 9 PM
      setCustomReminders(false);
      setShowPicker(false);

      const defaultMorning = new Date();
      defaultMorning.setHours(9, 0, 0, 0);
      const defaultEvening = new Date();
      defaultEvening.setHours(21, 0, 0, 0);
      setMorningTime(defaultMorning);
      setEveningTime(defaultEvening);
    }
    //to control no reminders use case
    // else if (!customReminders) {
    //   setMorningTime(null);
    //   setEveningTime(null);
    // }
  }

  //Function for the Custom Reminders Toggle
  function toggleCustomReminders(value: boolean) {
    setCustomReminders(value);
    if (!value) {
      setShowPicker(false);
    }
    if (value) {
      setDefaultReminders(false); //turns off default toggle when the user selects custom
    }
    //to control no reminders use case
    // else if (!defaultReminders) {
    //   setMorningTime(null);
    //   setEveningTime(null);
    // }
  }

  // useEffect hook to re-schedule notifications whenever the times or reminder type changes.
  //also handling iOS permissions for notifications
  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Enable notifications in settings.");
      }
    }

    requestPermissions();

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification Received", notification);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });

  //Create Notification time
  function createNotificationTime(time: Date) {
    const now = new Date(); // Get current time
    const notificationTime = new Date(time); // Clone the selected time

    // If the selected time is in the past, schedule it for the next day
    if (notificationTime < now) {
      notificationTime.setDate(now.getDate() + 1);
    }

    return notificationTime;
  }

  // Schedule Notifications for Morning and Evening
  async function scheduleNotifications() {
    // Cancel existing notifications before scheduling new ones
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Ensure notifications are scheduled only if reminders are enabled
    if (defaultReminders || customReminders) {
      const morningNotificationTime = createNotificationTime(morningTime);
      const eveningNotificationTime = createNotificationTime(eveningTime);

      // Schedule Morning Notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: TITLE,
          subtitle: MORNING_SUBTITLE,
          body: MORNING_BODY,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: morningNotificationTime.getHours(),
          minute: morningNotificationTime.getMinutes(),
        },
      });

      // Schedule Evening Notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: TITLE,
          subtitle: EVENING_SUBTITLE,
          body: EVENING_BODY,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: eveningNotificationTime.getHours(),
          minute: eveningNotificationTime.getMinutes(),
        },
      });

      console.log(
        "Notifications scheduled for:",
        morningNotificationTime,
        eveningNotificationTime
      );
    }
  }

  // Trigger Notifications When Settings Change
  useEffect(() => {
    scheduleNotifications();
  }, [defaultReminders, customReminders, morningTime, eveningTime]);

  //Reminders Drop down
  const [showReminders, setShowReminders] = useState(false);

  {
    /* ------------------------TEST BUTTON FUNCTION BEGIN-----------------------------
  }
  async function sendTestNotification() {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "You must allow notifications.");
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "DayGrid",
        subtitle: "🔔 Testing Expo Notifications",
        body: "If you see this, notifications are working!",
        data: { test: "This is a test notification" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
    Alert.alert("Success", "Test notification sent!");
  }
  {
    ------------------------TEST BUTTON FUNCTION END----------------------------- */
  }
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
      {/* Existing Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.photoContainer}></View>
        <View style={styles.userInfo}>
          <Text style={styles.nameText}>
            {uFirstName} {uLastName}
          </Text>
          <Text style={styles.emailText}>Email: {session.user.email}</Text>
          <Text style={styles.emailText}>User since: {formattedDate}</Text>
          <Button
            style={styles.editButton}
            labelStyle={styles.editButtonLabel}
            onPress={() => console.log("Edit Info")}
          >
            Edit Profile
          </Button>
        </View>
      </View>

      {/* ------------------------TEST BUTTON BEGIN-----------------------------
      <Button
        mode="contained"
        onPress={sendTestNotification}
        style={styles.testButton}
      >
        Send Test Notification
      </Button>
       ------------------------TEST BUTTON END----------------------------- */}

      {/* Notification Preferences Dropdown */}
      <Button
        mode="contained"
        onPress={() => setShowReminders(!showReminders)}
        style={styles.dropdownButton}
        icon={showReminders ? "chevron-up" : "chevron-down"}
      >
        Notification Preferences
      </Button>
      {/* Reminder Settings - Visible Only if showReminders is True */}
      {showReminders && (
        <View style={styles.remindersContainer}>
          {/* Current Daily Reminders */}
          <Text style={styles.header}>Current Daily Reminders</Text>
          <Text>
            Morning:{" "}
            {defaultReminders || customReminders
              ? new Date(morningTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "No Reminder Set"}
          </Text>
          <Text>
            Evening:{" "}
            {defaultReminders || customReminders
              ? new Date(eveningTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "No Reminder Set"}
          </Text>

          {/* Toggles */}
          <View style={styles.togglesWrapper}>
            <View style={styles.toggleContainer}>
              <Text style={styles.header}>Default Daily Reminders</Text>
              <Switch
                value={defaultReminders}
                onValueChange={toggleDefaultReminders}
                style={styles.switch}
              />
            </View>
            <View style={styles.toggleContainer}>
              <Text style={styles.header}>Custom Daily Reminders</Text>
              <Switch
                value={customReminders}
                onValueChange={toggleCustomReminders}
                style={styles.switch}
              />
            </View>
          </View>

          {/* Custom Reminder Buttons */}
          {customReminders && (
            <>
              <Button
                onPress={() => openPicker("morning")}
                style={styles.reminderButton}
                labelStyle={styles.reminderButtonLabel}
              >
                Set Morning Time
              </Button>
              <Button
                onPress={() => openPicker("evening")}
                style={styles.reminderButton}
                labelStyle={styles.reminderButtonLabel}
              >
                Set Evening Time
              </Button>
            </>
          )}

          {/* Inline DateTimePicker with Save button */}
          {customReminders && showPicker && (
            <Modal
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowPicker(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={tempTime}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onPickerChange}
                    textColor="black"
                  />

                  {/* Buttons Row */}
                  <View style={styles.buttonRow}>
                    <Button
                      mode="outlined"
                      onPress={() => setShowPicker(false)}
                      style={styles.cancelButton}
                      labelStyle={styles.cancelButtonLabel}
                    >
                      Cancel
                    </Button>

                    <Button
                      mode="contained"
                      onPress={onSaveTime}
                      style={styles.saveButton}
                    >
                      Save
                    </Button>
                  </View>
                </View>
              </View>
            </Modal>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    marginVertical: 10,
    backgroundColor: "#6200ee",
    borderWidth: 1,
  },
  remindersContainer: {
    marginTop: 10,
    padding: 20,
    backgroundColor: "#f1f1f1",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
    justifyContent: "flex-start",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "100%",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent overlay
  },
  pickerContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    // Optionally add shadow/elevation if desired:
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  // New wrapper style to align toggle rows to the left
  togglesWrapper: {
    width: "100%",
    alignItems: "flex-start",
  },
  reminderButton: {
    marginVertical: 10,
    backgroundColor: "#6200ee",
  },
  reminderButtonLabel: {
    color: "#FFFFFF",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 15,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10, // Space between buttons
    marginTop: 10,
    backgroundColor: "#E0E0E0", // Light gray for cancel button
  },
  cancelButtonLabel: {
    color: "#000000",
  },
  saveButton: {
    flex: 1,
    marginTop: 10,
    backgroundColor: "#6200ee",
  },
  switch: {
    // Adjust the translateY value until the toggle aligns with the text
    transform: [{ translateY: 12 }],
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
  button: {
    alignSelf: "flex-start", // Align the button to the left
    padding: 0, // Remove extra padding
    marginVertical: 10,
    backgroundColor: "#6200ee",
  },
  editButton: {
    alignSelf: "flex-start",
    padding: 0,
    marginTop: 8, // Adjust this value to fine-tune alignment
  },
  buttonLabel: {
    fontSize: 14,
    color: "#6200ee",
  },
  editButtonLabel: {
    fontSize: 14,
    color: "#6200ee",
    textAlign: "left", // Aligns text to the left
    alignSelf: "flex-start", // Ensures text stays left-aligned
    width: "100%", // Makes sure the label uses full button width
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  testButton: {
    marginVertical: 10,
    backgroundColor: "#6200ee",
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#D32F2F", // Red color for logout
  },
});
