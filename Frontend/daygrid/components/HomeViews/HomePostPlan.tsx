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
  session: Session;
}

export default function HomePostPlan({ session }: HomePostPlanProps) {
  const navigation = useNavigation();

  const { plannedDay, setPlannedDay, dayCollectionID, setDayCollectionID } =
    useAppContext();

  const [quadrants, setQuadrants] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleUpdateTask = async (taskId: string, completed: boolean) => {
    try {
      // Update local state
      setQuadrants((prevQuadrants) =>
        prevQuadrants.map((quadrant) => ({
          ...quadrant,
          Task: quadrant.Task.map((task) =>
            task.id === taskId ? { ...task, completed } : task
          ),
        }))
      );

      // Update query
      const { data: data2, error: error2 } = await supabase
        .from("Task")
        .update({ completed: completed })
        .eq("id", taskId)
        .select();

      if (error2) {
        console.error("Update failed:", error2.message);
      } else {
        console.log("Update success:", data2);
      }

      if (error2) {
        console.error("Error updating task:", error2);
        fetchPlanData();
      }
    } catch (err) {
      console.error("Error in handleUpdateTask:", err);
      fetchPlanData();
    }
  };

  const fetchPlanData = async () => {
    try {
      setLoading(true);

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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanData();
  }, []);

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#00AFFF" />}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {!loading && !error && quadrants && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Plan</Text>

          <View style={styles.grid}>
            {quadrants
              .filter((quadrant) =>
                ["Looking Forward", "Thankful"].includes(quadrant.category)
              )
              .map((quadrant, index) => (
                <View key={quadrant.id || index} style={styles.gridItem}>
                  <GenericQ
                    quadrant={quadrant}
                    onUpdateTask={handleUpdateTask}
                  />
                </View>
              ))}
          </View>

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
                <View key={quadrant.id || index} style={styles.gridItem}>
                  <GenericQ
                    quadrant={quadrant}
                    onUpdateTask={handleUpdateTask}
                  />
                </View>
              ))}
          </View>

          {quadrants
            .filter((quadrant) => ["Other"].includes(quadrant.category))
            .map((quadrant, index) => (
              <MindQ key={quadrant.id || index} quadrant={quadrant} />
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
    justifyContent: "space-between",
    marginHorizontal: -8,
  },
  gridItem: {
    width: "48%",
    marginBottom: 16,
    marginHorizontal: 0,
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
