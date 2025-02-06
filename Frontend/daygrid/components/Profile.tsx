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
} from "react-native";
import { Button } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useAppContext } from "./ContextProvider";
import * as Notifications from "expo-notifications";
import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

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

  //for the default and custom reminders
  const [defaultReminders, setDefaultReminders] = useState(true);
  const [customReminders, setCustomReminders] = useState(false);
  const [morningTime, setMorningTime] = useState<Date>(
    new Date(new Date().setHours(9, 0, 0))
  );
  const [eveningTime, setEveningTime] = useState<Date>(
    new Date(new Date().setHours(21, 0, 0))
  );
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState("morning");

  useEffect(() => {
    if (defaultReminders) {
      scheduleNotification(
        morningTime,
        "Good Morning!",
        "Start your day right!"
      );
      scheduleNotification(eveningTime, "Good Evening!", "Time to wind down.");
    }
  }, [defaultReminders]);

  async function scheduleNotification(time: Date, title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        date: time,
        repeats: true,
      } as unknown as Notifications.NotificationTriggerInput,
    });
  }

  function toggleDefaultReminders(value: boolean) {
    setDefaultReminders(value);
    if (value) {
      // Turn off custom reminders and hide the time picker.
      setCustomReminders(false);
      setShowPicker(false);

      // Create new Date objects for default times.
      const defaultMorning = new Date();
      defaultMorning.setHours(9, 0, 0, 0); // 9:00 AM

      const defaultEvening = new Date();
      defaultEvening.setHours(21, 0, 0, 0); // 9:00 PM

      // Update state to reflect default times.
      setMorningTime(defaultMorning);
      setEveningTime(defaultEvening);

      // Cancel any previously scheduled notifications.
      Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule notifications with the same messages.
      scheduleNotification(
        defaultMorning,
        "Good Morning!",
        "Start your day right!"
      );
      scheduleNotification(
        defaultEvening,
        "Good Evening!",
        "Time to wind down."
      );
    } else {
      // When turning off default, cancel notifications.
      Notifications.cancelAllScheduledNotificationsAsync();
    }
  }

  function toggleCustomReminders(value: boolean) {
    setCustomReminders(value);
    if (!value) {
      setShowPicker(false);
    }

    if (value) {
      setDefaultReminders(false); //turns off default toggle when the user selects custom
    }
  }

  // Example buttons to open the picker:
  {
    customReminders && (
      <>
        <Button
          onPress={() => {
            setPickerMode("morning");
            setShowPicker(true);
          }}
        >
          Select Morning Time
        </Button>
        <Button
          onPress={() => {
            setPickerMode("evening");
            setShowPicker(true);
          }}
        >
          Select Evening Time
        </Button>
      </>
    );
  }

  // Render the DateTimePicker only if BOTH customReminders and showPicker are true.
  {
    customReminders && showPicker && (
      <DateTimePicker
        value={pickerMode === "morning" ? morningTime : eveningTime}
        mode="time"
        display={Platform.OS === "ios" ? "spinner" : "default"}
        onChange={onTimeChange}
      />
    );
  }

  function onTimeChange(event: any, selectedTime?: Date | undefined) {
    if (selectedTime) {
      pickerMode === "morning"
        ? setMorningTime(new Date(selectedTime))
        : setEveningTime(new Date(selectedTime));
    }
    setShowPicker(false);
  }

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

      {/* Current Daily Reminders */}
      <Text style={styles.header}>Current Daily Reminders</Text>
      <Text>Morning: {new Date(morningTime).toLocaleTimeString()}</Text>
      <Text>Evening: {new Date(eveningTime).toLocaleTimeString()}</Text>

      {/* Default Reminders */}
      <View style={styles.toggleContainer}>
        <Text style={styles.header}>Default Daily Reminders</Text>
        <Switch
          value={defaultReminders}
          onValueChange={toggleDefaultReminders}
          style={styles.switch}
        />
      </View>

      {/* Custom Notifications */}
      <View style={styles.toggleContainer}>
        <Text style={styles.header}>Custom Daily Reminders</Text>
        <Switch
          value={customReminders}
          onValueChange={toggleCustomReminders}
          style={styles.switch}
        />
      </View>
      <View>
        {customReminders && (
          <>
            <Button
              onPress={() => {
                setPickerMode("morning");
                setShowPicker(true);
              }}
            >
              Select Morning Time
            </Button>
            <Button
              onPress={() => {
                setPickerMode("evening");
                setShowPicker(true);
              }}
            >
              Select Evening Time
            </Button>
          </>
        )}
        {showPicker && (
          <DateTimePicker
            value={
              pickerMode === "morning"
                ? new Date(morningTime)
                : new Date(eveningTime)
            }
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onTimeChange}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  switch: {
    // Adjust the translateY value until the toggle aligns with the text
    transform: [{ translateY: 12 }],
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
  button: {
    alignSelf: "flex-start", // Align the button to the left
    padding: 0, // Remove extra padding
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
  header: { fontSize: 18, fontWeight: "bold", marginTop: 20 },
});

//
