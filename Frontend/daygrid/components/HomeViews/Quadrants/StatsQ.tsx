import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function StatsQ() {
  const navigation = useNavigation();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your stats</Text>
        <TouchableOpacity>
          <Text
            style={styles.openLink}
            onPress={() => navigation.navigate("Stats")}
          >
            Open
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Stats")}>
        <View style={styles.statsBox}>
          <Text style={styles.statsCircle}>UNDEFINED%</Text>
          <Text style={styles.statsText}>Of your month has been planned</Text>
          <Text style={styles.improvementText}>
            UNDEFINED% Improvement in efficiency since last month, good job!
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  openLink: {
    fontSize: 14,
    color: "#00AFFF",
  },
  statsBox: {
    backgroundColor: "#D7F4FF",
    borderRadius: 12,
    padding: 16,
  },
  statsCircle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: "gray",
  },
  improvementText: {
    fontSize: 12,
    color: "gray",
    marginTop: 8,
  },
});
