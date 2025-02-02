import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";
import { Session } from "@supabase/supabase-js";
import GenericQ from "./Quadrants/GenericQ";
import TopQ from "./Quadrants/TopQ";
import MindQ from "./Quadrants/MindQ";
import { useAppContext } from "../../components/ContextProvider";
import { Quadrant } from "../../types/types";
import { Calendar } from "react-native-calendars";

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
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const [offHandQuadrants, setOffHandQuadrants] = useState(null);

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
      console.log("SET LOAD FALSE");
      setLoading(false);
    }
    console.log("Set load false out of try");

    setLoading(false);

    // Run a query to grab all the valid days that user has entered so we can adjust the calendar to only allow selection of valid days. + bound the calendar
  };

  const fetchPreviousPlanData = async () => {
    if (offHandQuadrants === null) {
      setOffHandQuadrants(quadrants); //Saves the current day quadrants
    }

    let newQuadrantArray: Quadrant[] | null = [];

    const { data: prevQuad, error: qError } = await supabase
      .from("Quadrant")
      .select("*, Tast(*)");
    //Add a modifier to use the currently selected day
  };

  useEffect(() => {
    console.log("Fetching plan data");
    fetchPlanData();
  }, []);

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#00AFFF" />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && !error && quadrants && (
        <View style={styles.section}>
          <View style={styles.headerContainer}>
            <Text style={styles.sectionTitle}>Today's Plan</Text>
            <TouchableOpacity
              onPress={() => setShowCalendar(true)}
              style={styles.calendarButton}
            >
              <Text style={styles.calendarButtonText}>📅</Text>
            </TouchableOpacity>
          </View>

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
      <Modal
        visible={showCalendar}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCalendar(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setShowCalendar(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.calendarWrapper}
          >
            <Calendar
              current={new Date().toISOString()}
              minDate="2023-01-01"
              maxDate="2025-12-31"
              onDayPress={(day) => {
                console.log("Selected day:", day.dateString);
                setSelectedDate(day.dateString);
                setShowCalendar(false);
              }}
              theme={{
                backgroundColor: "#ffffff",
                calendarBackground: "#ffffff",
                textSectionTitleColor: "#b6c1cd",
                selectedDayBackgroundColor: "#00adf5",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#00adf5",
                dayTextColor: "#2d4150",
                textDisabledColor: "#d9e1e8",
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "black",
    marginBottom: 8,
  },
  calendarButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#E2E8FF",
  },
  calendarButtonText: {
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  calendarWrapper: {
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 16,
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
