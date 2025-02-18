import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { supabase } from "../lib/supabase";
import { useIsFocused } from "@react-navigation/native";

// #b1c9de

// Get the screen width for the chart to scale properly
const screenWidth = Dimensions.get("window").width;

const StatsPage = () => {
  const [daysPlanned, setDaysPlanned] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [chartData, setChartData] = useState<{ labels: string[]; datasets: { data: number[] }[] }>({
    labels: [],
    datasets: [{ data: [] }],
  });

  // useEffect(() => {
  //   const FetchData = async () => {
  //     await fetchDaysPlanned();
  //     await fetchTasks();
  //   };
  //   FetchData();
  // }, []);

  const isFocused = useIsFocused();

  useEffect(() => {
    // This function fetches the data when the page is in focus
    const fetchData = async () => {
      await fetchDaysPlanned();  // Fetch data for planned days
      await fetchTasks();        // Fetch task data for the chart
    };
  
    if (isFocused) {  // Check if the page is in focus
      fetchData();  // Fetch the data when the page is focused
    }
  }, [isFocused]);  // Dependency array: This effect will run whenever `isFocused` changes
  


  const fetchDaysPlanned = async () => {
    const { count, error } = await supabase
      .from("DayCollection")
      .select("*", { count: "exact", head: true })
      .eq("completed", false); // Filter for false values

    if (error) {
      console.error("Error fetching days planned:", error);
    } else {
      setDaysPlanned(count || 0);
    }
  };

  const fetchTasks = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const { data, error } = await supabase
      .from("Task")
      .select("created_at, completed")
      .gte("created_at", sevenDaysAgo.toISOString());

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      const processedData = processTaskData(data);
      setChartData(processedData);
    }
  };

  const processTaskData = (tasks: { completed: boolean, created_at: string }[]) => {
    const today = new Date();
    const dateRange: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Get the day of the week (Mon, Tue, Wed, etc.)
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }); // 'short' gives the 3-letter abbreviation
      dateRange.push(dayOfWeek);
    }

    const dateCounts: { [key: string]: number[] } = {};

    dateRange.forEach((date) => {
      dateCounts[date] = [0, 0];
    });

    tasks.forEach((task) => {
      const taskDate = new Date(task.created_at); // Convert the task's created_at string to a Date object
      const dayOfWeek = taskDate.toLocaleDateString('en-US', { weekday: 'short' }); // Get the day of the week
      if (dateCounts[dayOfWeek]) {
        dateCounts[dayOfWeek][1]++;
        if (task.completed) {
          dateCounts[dayOfWeek][0]++;
        }
      }
    });

    const sortedDates = dateRange;
    const sortedData = sortedDates.map((date) => {
      const [completed, total] = dateCounts[date];
      return total === 0 ? 0 : (completed / total) * 100;
    });

    return {
      labels: sortedDates,
      datasets: [
        {
          data: sortedData,
        },
      ],
    };
  };

  // Only render the LineChart when chartData is available
  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return <Text>Loading chart data...</Text>;
  }

  return (
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
            stroke: "#f4a261",
          },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
      
      <View style={styles.aiBox}>
        <Text style={styles.aiTitle}>AI Insights</Text>
        <Text style={styles.aiText}>You plan more on Mondays, try balancing your focus across all quadrants this week!</Text>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
    backgroundColor: "#f9f9f9",
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
    backgroundColor: '#F0F8FF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  aiText: {
    fontSize: 14,
    color: '#555',
  },
});

export default StatsPage;
