
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import StatsQ from "./Quadrants/StatsQ";


import { Session } from "@supabase/supabase-js";
import { useAppContext } from "../ContextProvider";

interface HomePrePlanProps {
  session: Session;
}

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "../../types/types"; // ✅ Ensure correct import path

type HomePrePlanNavigationProp = StackNavigationProp<AppStackParamList, "Home">;

export default function HomePrePlan({ session }: HomePrePlanProps) {
  const navigation = useNavigation<HomePrePlanNavigationProp>();
  const { uFirstName, uLastName } = useAppContext();
  return (
    <View style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeText}>Welcome back {uFirstName}!</Text>
        <Text style={styles.subText}>Make today the best possible!</Text>
      </View>

      {/* Today's Plan Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Plan</Text>
        </View>
        <TouchableOpacity
          style={styles.planBox}
          onPress={() => navigation.navigate("Plan")}
        >
          <Text style={styles.planText}>Start planning</Text>
          <Text style={styles.addIcon}>+</Text>
          <Text style={styles.planSubText}>Create today's plan</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <StatsQ />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 70,
  },
  welcomeBox: {
    backgroundColor: "#3B3B3B",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  subText: {
    fontSize: 14,
    color: "lightgray",
    marginVertical: 8,
  },
  searchBar: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
  },
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
  planBox: {
    backgroundColor: "#F9ECCC",
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  planText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addIcon: {
    fontSize: 36,
    color: "gray",
  },
  planSubText: {
    fontSize: 12,
    color: "gray",
    marginTop: 8,
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
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: "gray",
  },
  footerIcon: {
    fontSize: 20,
    color: "white",
  },
});
