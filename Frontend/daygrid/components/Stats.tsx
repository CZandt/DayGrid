<<<<<<< Updated upstream
import React from "react";
import { View, Text, StyleSheet } from "react-native";
=======
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { supabase } from "../lib/supabase";
import { useIsFocused } from "@react-navigation/native";

// Get the screen width for the chart to scale properly
const screenWidth = Dimensions.get("window").width;

const StatsPage = () => {
  const [daysPlanned, setDaysPlanned] = useState(0);
  const [longestStreak] = useState(0); // You can later update this based on your logic.
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  }>({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [aiInsights, setAiInsights] = useState("");
  const isFocused = useIsFocused();

  useEffect(() => {
    // When the page is in focus, fetch overall stats, weekly task data, and individual task details,
    // then pass all the information into the AI insights prompt.
    const fetchData = async () => {
      const plannedDays = await fetchDaysPlanned();
      const processedData = await fetchTasks();
      const tasksDetails = await fetchPlanTasksDetails();
      await fetchAIInsights(plannedDays, processedData, longestStreak, tasksDetails);
    };

    if (isFocused) {
      fetchData();
    }
  }, [isFocused]);

  // Fetch the number of days planned from the DayCollection table
  const fetchDaysPlanned = async (): Promise<number> => {
    const { count, error } = await supabase
      .from("DayCollection")
      .select("*", { count: "exact", head: true })
      .eq("completed", false); // Filter for uncompleted day collections

    if (error) {
      console.error("Error fetching days planned:", error);
      return 0;
    } else {
      const planned = count || 0;
      setDaysPlanned(planned);
      return planned;
    }
  };

  // Fetch tasks from the past 7 days and process them into completion percentages
  const fetchTasks = async (): Promise<{
    labels: string[];
    datasets: { data: number[] }[];
  }> => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const { data, error } = await supabase
      .from("Task")
      .select("created_at, completed")
      .gte("created_at", sevenDaysAgo.toISOString());

    if (error) {
      console.error("Error fetching tasks:", error);
      return { labels: [], datasets: [{ data: [] }] };
    } else {
      const processedData = processTaskData(data);
      setChartData(processedData);
      return processedData;
    }
  };

  // Process tasks to compute daily completion percentages
  const processTaskData = (tasks: { completed: boolean; created_at: string }[]) => {
    const today = new Date();
    const dateRange: string[] = [];

    // Create an array of day labels for the past 7 days (e.g., Mon, Tue, Wed, etc.)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
      dateRange.push(dayOfWeek);
    }

    // Initialize counts as an object with keys being day labels and values as [completed, total]
    const dateCounts: { [key: string]: number[] } = {};
    dateRange.forEach((day) => {
      dateCounts[day] = [0, 0];
    });

    tasks.forEach((task) => {
      const taskDate = new Date(task.created_at);
      const dayOfWeek = taskDate.toLocaleDateString("en-US", { weekday: "short" });
      if (dateCounts[dayOfWeek]) {
        dateCounts[dayOfWeek][1]++; // Increment total task count.
        if (task.completed) {
          dateCounts[dayOfWeek][0]++; // Increment completed task count.
        }
      }
    });

    // Calculate the percentage of completed tasks per day
    const sortedData = dateRange.map((day) => {
      const [completed, total] = dateCounts[day];
      return total === 0 ? 0 : (completed / total) * 100;
    });

    return {
      labels: dateRange,
      datasets: [{ data: sortedData }],
    };
  };

  // Fetch individual tasks for today and format them into a string for the AI prompt.
  const fetchPlanTasksDetails = async (): Promise<string> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight to capture today's tasks.

    const { data, error } = await supabase
      .from("Task")
      .select("name, completed, Quadrant")
      .gte("created_at", today.toISOString());

    if (error) {
      console.error("Error fetching plan tasks details:", error);
      return "No planning tasks details available.";
    }

    // Group tasks by category (using the "Quadrant" field)
    const groupedTasks: { [key: string]: { name: string; completed: boolean }[] } = {};
    data.forEach((task: any) => {
      const category = task.Quadrant || "Other";
      if (!groupedTasks[category]) {
        groupedTasks[category] = [];
      }
      groupedTasks[category].push({ name: task.name, completed: task.completed });
    });

    // Build a formatted string for each category and its tasks.
    let tasksDetails = "";
    for (const category in groupedTasks) {
      tasksDetails += `\nCategory: ${category}\n`;
      groupedTasks[category].forEach((task) => {
        tasksDetails += `- ${task.name} (Status: ${task.completed ? "COMPLETED" : "NOT COMPLETED"})\n`;
      });
    }
    return tasksDetails;
  };

  // Build the AI prompt using overall stats, weekly completion data, and individual task details,
  // then send the prompt to the AI endpoint.
  const fetchAIInsights = async (
    plannedDays: number,
    processedData: { labels: string[]; datasets: { data: number[] }[] },
    longestStreak: number,
    planTasksDetails: string
  ) => {
    const prompt = `
Analyze the following user productivity data and provide personalized insights:

Overall Stats:
- Days Planned: ${plannedDays}
- Longest Streak: ${longestStreak}
- Daily Completion Rates: ${processedData.labels
      .map((label, index) => `${label}: ${processedData.datasets[0].data[index].toFixed(0)}%`)
      .join(", ")}

Task Details:
${planTasksDetails}

Instructions:
1. For every task that is marked as COMPLETED, provide an individual commendation highlighting its positive impact.
2. For every task that is marked as NOT COMPLETED, offer clear, specific, and actionable advice on how to complete it. Avoid generic recommendations.
3. Your response should be concise, motivational, and written in a friendly tone with occasional uplifting emojis.
4. Format your answer neatly so that each task's insight is clearly separated.
5. Do not include any extra analysis beyond what is requested above.
6. Make it under 150 words

Please provide your response based on the data above.
    `;

    try {
      const response = await fetch("http://10.37.19.33:3000/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          `HTTP Error: ${response.status} - ${errorResponse.error?.message || "Unknown error"}`
        );
      }

      const data = await response.json();
      setAiInsights(data.insights);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
      setAiInsights("⚠️ Could not retrieve AI insights at this time. Please try again later.");
    }
  };

  // Display a loading message if chart data hasn't loaded yet.
  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return <Text>Loading chart data...</Text>;
  }
>>>>>>> Stashed changes

export default function Stats() {
  return (
<<<<<<< Updated upstream
    <View>
      <Text>STATS BABYS</Text>
    </View>
  );
}
=======
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your DayGrid</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{daysPlanned}</Text>
          <Text style={styles.statLabel}>Days Planned</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{longestStreak}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>
      </View>
      <Text style={styles.graphTitle}>Completion Rate</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        yAxisSuffix="%"
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(244, 162, 97, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#F4A261",
          },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      <View style={styles.aiBox}>
        <Text style={styles.aiTitle}>AI Insights</Text>
        <Text style={styles.aiText}>
          {aiInsights || "Loading insights..."}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
    backgroundColor: "#F9F9F9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    backgroundColor: "#E2E8FF",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "40%",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  aiBox: {
    marginTop: 30,
    backgroundColor: "#F0F8FF",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  aiText: {
    fontSize: 14,
    color: "#555",
  },
});

export default StatsPage;
>>>>>>> Stashed changes
