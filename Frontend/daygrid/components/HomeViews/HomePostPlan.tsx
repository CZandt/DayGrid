import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";
import { Session } from "@supabase/supabase-js";
import GenericQ from "./Quadrants/GenericQ";
import TopQ from "./Quadrants/TopQ";
import MindQ from "./Quadrants/MindQ";
import { useAppContext } from "../../components/ContextProvider";
import { Quadrant } from "../../types/types";
import { TouchableOpacityBase } from "react-native";

interface HomePostPlanProps {
  session: Session; // Define session as a prop
}

export default function HomePostPlan({ session }: HomePostPlanProps) {
  const navigation = useNavigation();

  const { plannedDay, setPlannedDay, dayCollectionID, setDayCollectionID } =
    useAppContext();

  // State to hold the fetched data
  const [quadrants, setQuadrants] = useState(null);

  // State to track loading status
  const [loading, setLoading] = useState(true);

  // State to track errors
  const [error, setError] = useState(null);

  // Function to fetch data
  const fetchPlanData = async () => {
    try {
      setLoading(true); // Start loading

      let newQuadrantArray: Quadrant[] | null = [];

      const { data: testQuad, error: thisError } = await supabase
        .from("Quadrant")
        .select("*, Task(*)")
        .eq("DayCollection_id", dayCollectionID);

      for (let i = 0; i < testQuad?.length; i++) {
        newQuadrantArray.push(testQuad[i]);
      }

      setQuadrants(newQuadrantArray);
    } catch (err) {
      console.error("Error fetching plan data:", err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Call fetchPlanData when the component mounts
  useEffect(() => {
    fetchPlanData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Loading State */}
      {loading && <ActivityIndicator size="large" color="#00AFFF" />}

      {/* Error State */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Display Data */}
      {!loading && !error && quadrants && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Plan</Text>

          <View style={styles.grid}>
            {quadrants
              .filter((quadrant) =>
                ["Looking Forward", "Thankful"].includes(quadrant.category)
              )
              .map((quadrant, index) => (
                <View style={styles.gridItem}>
                  <GenericQ quadrant={quadrant} />
                </View>
              ))}
          </View>

          {/*MAIN QUADRANTS */}
          <View style={styles.grid}>
            {quadrants
              .filter((quadrant) =>
                [
                  "Work",
                  "Relationships",
                  "Physical",
                  "Emotional/Spiritual",
                ].includes(quadrant.category)
              )
              .map((quadrant, index) => (
                <View key={index} style={styles.gridItem}>
                  <GenericQ quadrant={quadrant} />
                </View>
              ))}
          </View>

          {quadrants
            .filter((quadrant) => ["Other"].includes(quadrant.category))
            .map((quadrant, index) => (
              <MindQ quadrant={quadrant} />
            ))}

          <TouchableOpacity onPress={() => navigation.navigate("Plan")}>
            <View style={styles.FinishDayButton}>
              <Text style={styles.quadrantTitle}>Finish Your Day</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 70,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "black",
    marginBottom: 8,
  },
  quadrantBox: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  quadrantTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  quadrantDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Ensures space between columns
    marginHorizontal: -8, // Align items with consistent spacing
  },
  gridItem: {
    width: "48%", // Adjust width for 2 columns with some spacing
    marginBottom: 16, // Space between rows
    marginHorizontal: 0, // Spacing on the sides
  },
  FinishDayButton: {
    width: "70%",
    marginBottom: 16,
    backgroundColor: "#E2E8FF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignSelf: "center",
  },
});
