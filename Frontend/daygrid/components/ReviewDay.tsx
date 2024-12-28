import React from "react";
import { View, StyleSheet, Text, Button } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAppContext } from "./ContextProvider";
import Slider from "@react-native-community/slider";
import { supabase } from "../lib/supabase";

export default function ReviewDay() {
  const [reviewStarted, setReviewStarted] = React.useState(false);
  const [reviewStep, setReviewStep] = React.useState(0);
  const [reviewedDay, setReviewedDay] = React.useState(false);

  const [reviewScores, setReviewScores] = React.useState<number[]>([
    0, 0, 0, 0, 0, 0, 0,
  ]);

  const [currentScore, setCurrentScore] = React.useState<number>(0);
  const {
    plannedDay,
    setPlannedDay,
    dayCollectionID,
    setDayCollectionID,
    reviewedDayG,
    setReviewedDayG,
    reviewScoresG,
    setReviewScoresG,
  } = useAppContext();

  const prompts = [
    "I accomplished the things that had to happen today",
    "I worked intentionally today",
    "I took care of work today",
    "I took care of important relationships today",
    "I took care of my physical self today",
    "I took care of my emotional self today",
    "I had a good day today",
  ];

  const categories = [
    "Accomplishment",
    "Intentional",
    "TookCareOfWork",
    "Relationship",
    "PhysicalHealth",
    "Emotional",
    "GoodDay",
  ];

  const reviewStart = () => {
    console.log("Review Started");
    setReviewStarted(true);
  };

  const sumbitReview = async () => {
    try {
      const reviewToSubmit = {
        DayCollection_id: dayCollectionID,
        Accomplishment: reviewScores[0],
        Intentional: reviewScores[1],
        TookCareOfWork: reviewScores[2],
        Relationship: reviewScores[3],
        PhysicalHealth: reviewScores[4],
        Emotional: reviewScores[5],
        GoodDay: reviewScores[6],
      };

      console.log("SUBMITTING");

      const { data, error } = await supabase
        .from("Retrospect")
        .insert([reviewToSubmit])
        .select();

      if (error) throw error;

      console.log("Review Returned -> ", data);

      setReviewScoresG(reviewScores);
    } catch (error) {
      console.error("ERROR SUBMITTING REVIEW", error);
    }
  };

  const handleLeft = () => {
    let tempArray = reviewScores;
    tempArray[reviewStep] = currentScore;
    setReviewScores(tempArray);
    if (reviewStep > 0) {
      setCurrentScore(tempArray[reviewStep - 1]);
      setReviewStep(reviewStep - 1);
      return;
    }
  };

  const handleRight = async () => {
    let tempArray = reviewScores;
    tempArray[reviewStep] = currentScore;
    setReviewScores(tempArray);

    if (reviewStep < prompts.length - 1) {
      setCurrentScore(tempArray[reviewStep + 1]);
      setReviewStep(reviewStep + 1);
      return;
    }
    setCurrentScore(0);
    setReviewScores([0, 0, 0, 0, 0, 0, 0]);

    console.log("REVIEW FINISHED");
    console.log("FINAL SCORES: ", reviewScores);
    setReviewStep(0);

    //Some function to send the saved data to the database!
    await sumbitReview();
    setReviewedDayG(true);
    setReviewedDay(true);

    return;
  };

  // Reset state when the tab is focused
  useFocusEffect(
    React.useCallback(() => {
      setReviewStarted(false);
      setReviewStep(0);
    }, [])
  );

  if (reviewedDayG) {
    return (
      <View style={styles.container}>
        <Text style={styles.completedText}>Review Completed!</Text>
        <Text style={styles.completedText}>SCORES</Text>
        <Text style={styles.text}>Accomplishment: {reviewScoresG[0]}</Text>
        <Text style={styles.text}>Intentional: {reviewScoresG[1]}</Text>
        <Text style={styles.text}>Took care of work: {reviewScoresG[2]}</Text>
        <Text style={styles.text}>Relationship: {reviewScoresG[3]}</Text>
        <Text style={styles.text}>Physical Health: {reviewScoresG[4]}</Text>
        <Text style={styles.text}>Emotional Health: {reviewScoresG[5]}</Text>
        <Text style={styles.text}>Good Day: {reviewScoresG[6]}</Text>
      </View>
    );
  }

  if (reviewStarted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>DAYC ID: {dayCollectionID}</Text>
        <Text style={styles.text}>{prompts[reviewStep]}</Text>

        <View style={styles.sliderContainer}>
          <Text style={styles.text}>Current Score: {currentScore}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={currentScore}
            onValueChange={(value) => setCurrentScore(value)}
            minimumTrackTintColor="#4CAF50"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#4CAF50"
          />
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            {reviewStep != 0 && (
              <Button title="Prev Step" onPress={handleLeft} />
            )}
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              title={reviewStep === prompts.length - 1 ? "Finish" : "Next Step"}
              onPress={handleRight}
            />
          </View>
        </View>

        <Text style={styles.stepCounter}>
          Step {reviewStep + 1} of {prompts.length}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.completedText}>Ready to review your day?</Text>
      <Button onPress={reviewStart} title="Start Review" />
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
  sliderContainer: {
    width: "80%",
    alignItems: "center",
    marginVertical: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
});
