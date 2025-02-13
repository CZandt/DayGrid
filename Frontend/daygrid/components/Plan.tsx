import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../lib/supabase"; // Import your Supabase client
import { Quadrant, Task } from "./types"; // Assuming these interfaces are imported.
import { Session } from "@supabase/supabase-js";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { useAppContext } from "../components/ContextProvider";
import ReviewDay from "./ReviewDay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

type PlanRouteParams = {
  session: Session;
};

export default function Plan() {
  const [planningStep, setPlanningStep] = React.useState(0);
  const [currentTask, setCurrentTask] = React.useState("");
  const [completed, setCompleted] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false); // Add state for submission

  const { plannedDay, setPlannedDay, quadrants, setQuadrants } =
    useAppContext();
  const navigation = useNavigation();

  const route = useRoute<RouteProp<{ Plan: PlanRouteParams }, "Plan">>();
  const { session } = route.params;
  function getFormattedDate(date) {
    const options = { month: "long", day: "numeric" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  // Usage example:
  const today = new Date();
  const formattedDate = getFormattedDate(today);

  const prompts = [
    "What are you looking forward to today?",
    "What are you thankful for today?",
    "What are you getting done today?",
    "How are you focusing on your relationships today?",
    "How are you helping your body today?",
    "How are you helping your soul today?",
    "Other things on my mind?",
  ];

  const categories = [
    "Looking Forward",
    "Thankful",
    "Work",
    "Relationships",
    "Physical",
    "Emotional/Spiritual",
    "Other",
  ];

  const handleTaskAdd = () => {
    if (!currentTask.trim()) return;

    const updatedQuadrants = [...quadrants];
    const category = categories[planningStep];
    const task: Task = {
      id: `${category}-${Date.now()}`,
      created_at: new Date(),
      Quadrant: category,
      completed: false,
      name: currentTask.trim(),
    };

    if (!updatedQuadrants[planningStep]) {
      updatedQuadrants[planningStep] = {
        id: `${category}-${Date.now()}`,
        created_at: new Date(),
        category,
        date: new Date(),
        DayCollection_id: "day-collection-id", // Placeholder, updated on save
        tasks: [],
      };
    }

    updatedQuadrants[planningStep].tasks.push(task);
    setQuadrants(updatedQuadrants);
    setCurrentTask(""); // Clear the input
  };

  const handleRight = async () => {
    if (planningStep < prompts.length - 1) {
      setPlanningStep(planningStep + 1);
      return;
    }

    // Finish: Save DayCollection, Quadrants, and Tasks to the database
    try {
      const dayCollection = {
        user_id: session.user.id,
        date: new Date().toLocaleDateString("en-US"),
        completed: false,
      };

      // Insert DayCollection
      const { data: dayCollectionData, error: dayCollectionError } =
        await supabase
          .from("DayCollection")
          .insert([dayCollection])
          .select()
          .single();

      if (dayCollectionError) throw dayCollectionError;

      const dayCollectionId = dayCollectionData.id;

      // Prepare Quadrants with the DayCollection ID
      const quadrantsToInsert = quadrants.map((quadrant) => ({
        category: quadrant.category,
        date: new Date().toLocaleDateString("en-US"),
        DayCollection_id: dayCollectionId,
      }));

      // Insert Quadrants
      const { data: quadrantsData, error: quadrantsError } = await supabase
        .from("Quadrant")
        .insert(quadrantsToInsert)
        .select();

      if (quadrantsError) throw quadrantsError;

      // Prepare Tasks with associated Quadrant IDs
      const tasksToInsert = quadrantsData.flatMap((quadrant, index) =>
        quadrants[index].tasks.map((task: Task) => ({
          name: task.name,
          completed: false,
          Quadrant: quadrant.id,
        }))
      );

      // Insert Tasks
      const { error: tasksError } = await supabase
        .from("Task")
        .insert(tasksToInsert);

      if (tasksError) throw tasksError;

      console.log("Data successfully saved!");
      setIsSubmitted(true); // Update the state to show the completed screen

      const saveData = async () => {
        try {
          await AsyncStorage.setItem(
            "@lastDate",
            new Date().toLocaleDateString("en-US")
          );
          await AsyncStorage.setItem("@dayId", dayCollectionId);
        } catch (e) {
          console.error("FAILED LOCAL STORAGE SAVE", e);
        }

        setPlannedDay(true);
      };

      await saveData();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleReset = () => {
    setPlanningStep(0);
    setQuadrants([]);
    setCurrentTask("");
    setIsSubmitted(false); // Reset the submission state
  };

  const currentTasks =
    quadrants[planningStep]?.Task.map((task: Task) => task.name) || [];

  useFocusEffect(
    React.useCallback(() => {
      console.log("ENTERED PLANNING");

      return () => {
        setIsSubmitted(false);
        console.log("Leaving Plan Screen");
      };
    }, [plannedDay])
  );
  // Completed Screen
  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <Text style={styles.completedText}>Plan Submitted</Text>
        <Button title="Start Over" onPress={handleReset} />
      </View>
    );
  }

  if (plannedDay) {
    return <ReviewDay />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.backButtonText}>‹</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Today's Plan</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>
              {planningStep + 1}/{prompts.length}
            </Text>
            <View style={styles.progressArc} />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{categories[planningStep]}</Text>
        <Text style={styles.cardSubtitle}>{prompts[planningStep]}</Text>

        <FlatList
          data={currentTasks}
          renderItem={({ item }) => (
            <Text style={styles.taskItem}>□ {item}</Text>
          )}
          keyExtractor={(item, index) => `${index}-${planningStep}`}
          style={styles.taskList}
        />

        <TextInput
          style={styles.input}
          value={currentTask}
          onChangeText={setCurrentTask}
          placeholder="⊕ Add another item..."
          placeholderTextColor="#666"
          onSubmitEditing={handleTaskAdd} // Add task on Enter key
          blurOnSubmit={false} // Keeps the TextInput focused after pressing Enter
        />

        {/* <TouchableOpacity
          style={styles.addTaskButton} // Styling for the Add Task button
          onPress={handleTaskAdd}
        >
          <Text style={styles.addTaskButtonText}>Add Task</Text>
        </TouchableOpacity> */}
      </View>

      <View style={styles.navigationButtons}>
        {planningStep !== 0 && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setPlanningStep(planningStep - 1)}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.navButton} onPress={handleRight}>
          <Text style={styles.navButtonText}>
            {planningStep === prompts.length - 1 ? "Finish" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  backButtonText: {
    fontSize: 32,
    color: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  date: {
    fontSize: 18,
    color: "#333",
  },
  progressContainer: {
    position: "relative",
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  progressArc: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 30,
    height: 15,
    borderTopRightRadius: 15,
    backgroundColor: "#4CAF50",
  },
  progressText: {
    fontSize: 14,
    color: "#333",
  },
  card: {
    backgroundColor: "#f0f8ff",
    borderRadius: 15,
    padding: 20,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  taskList: {
    maxHeight: 200,
  },
  taskItem: {
    fontSize: 16,
    marginVertical: 8,
    color: "#333",
  },
  input: {
    fontSize: 16,
    color: "#666",
    padding: 0,
  },
  addButton: {
    marginTop: 10,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 120,
  },
  navButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  addTaskButton: {
    marginTop: 10,
    backgroundColor: "#4CAF50", // Green color
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  addTaskButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
