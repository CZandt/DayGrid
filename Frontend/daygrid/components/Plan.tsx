import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  FlatList,
} from "react-native";
import { supabase } from "../lib/supabase"; // Import your Supabase client
import { Quadrant, Task } from "./types"; // Assuming these interfaces are imported.
import { Session } from "@supabase/supabase-js";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { useAppContext } from "../components/ContextProvider";
import ReviewDay from "./ReviewDay";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PlanRouteParams = {
  session: Session;
};

export default function Plan() {
  const [planningStep, setPlanningStep] = React.useState(0);
  const [quadrants, setQuadrants] = React.useState<Quadrant[]>([]);
  const [currentTask, setCurrentTask] = React.useState("");
  const [completed, setCompleted] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false); // Add state for submission

  const { plannedDay, setPlannedDay } = useAppContext();

  const route = useRoute<RouteProp<{ Plan: PlanRouteParams }, "Plan">>();
  const { session } = route.params;

  const prompts = [
    "What are you looking forward to today?",
    "What are you thankful for today?",
    "Work (What are you getting done today)?",
    "Relationships (How are you focusing on your relationships today)?",
    "Physical (How are you helping your body today)?",
    "Emotional/Spiritual (How are you helping your soul today)?",
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
    quadrants[planningStep]?.tasks.map((task: Task) => task.name) || [];

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
      <Button title="RESET DEBUG" onPress={handleReset} />

      <Text style={styles.text}>{prompts[planningStep]}</Text>

      <FlatList
        data={currentTasks}
        renderItem={({ item }) => <Text style={styles.taskItem}>• {item}</Text>}
        keyExtractor={(item, index) => `${index}-${planningStep}`}
        style={styles.taskList}
      />

      <TextInput
        style={styles.input}
        value={currentTask}
        onChangeText={setCurrentTask}
        placeholder="Add a task"
      />
      <Button title="Add Task" onPress={handleTaskAdd} />

      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          {planningStep != 0 && (
            <Button
              title="Prev Step"
              onPress={() => setPlanningStep(planningStep - 1)}
            />
          )}
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title={planningStep === prompts.length - 1 ? "Finish" : "Next Step"}
            onPress={handleRight}
          />
        </View>
      </View>

      <Text style={styles.stepCounter}>
        Step {planningStep + 1} of {prompts.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  taskList: {
    width: "100%",
    marginBottom: 20,
    maxHeight: 150, // Limit the height of the task list
  },
  taskItem: {
    fontSize: 16,
    marginVertical: 5,
  },
  input: {
    width: "100%",
    height: 40, // Smaller input height
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  buttonWrapper: {
    flex: 1, // Ensures buttons take up equal space
    marginHorizontal: 5, // Adds spacing between buttons
  },
  stepCounter: {
    fontSize: 14,
    color: "#888",
  },
  completedText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#4CAF50",
  },
});
