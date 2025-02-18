import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, NativeSyntheticEvent, NativeScrollEvent, RefreshControl, SafeAreaView} from "react-native";
import { LineChart, ProgressChart, ContributionGraph} from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { supabase } from "../lib/supabase";
import { useIsFocused } from "@react-navigation/native";



// #b1c9de

// Get the screen width for the chart to scale properly
const screenWidth = Dimensions.get("window").width;

const StatsPage = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [daysPlanned, setDaysPlanned] = useState(0);
  const [progressData, setProgressData] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [chartData, setChartData] = useState<{ labels: string[]; datasets: { data: number[] }[] }>({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [contributionData, setContributionData] = useState<{ date: string; count: number }[]>([]);

  const [activeIndex, setActiveIndex] = useState(0);



  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchData = async () => {
      await fetchStreaks();  // Fetch data for streaks
      await fetchLine();        // Fetch task data for the chart
      await fetchContribution();
      await fetchProgress();
    };
  
    fetchData();  // Fetch the data once when the component mounts
  }, []);  // Empty dependency array = runs only once when mounted
  

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.floor(contentOffsetX / (screenWidth - 50)); // Adjust this to match your item width
    setActiveIndex(newIndex);
  };
// Streaks Graph Data
  const fetchStreaks = async () => {
    // Fetch retrospect entries sorted by date (most recent first)
    const { data, error } = await supabase
      .from("Retrospect")
      .select("created_at")
      .order("created_at", { ascending: false });
  
    if (error) {
      console.error("Error fetching retrospect data:", error);
      return;
    }
  
    let streak = 0;
    let currentDate = new Date();
  
    for (const record of data) {
      const recordDate = new Date(record.created_at);
  
      // Normalize both dates to midnight
      currentDate.setHours(0, 0, 0, 0);
      recordDate.setHours(0, 0, 0, 0);
  
      if (streak === 0 && recordDate.getTime() !== currentDate.getTime()) {
        break; // If the latest entry is not today, no streak
      }
  
      if (recordDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1); // Move to previous day
      } else {
        break; // If there's a gap, stop counting
      }
    }
  
    // Update state with the current streak
    setDaysPlanned(streak);
  
    // Fetch user ID and longest streak
    const { data: userData, error: userError } = await supabase
      .from("Users")
      .select("user_id, longest_streak")
      .single(); // Assuming only one user (adjust if multi-user)
  
    if (userError) {
      console.error("Error fetching user data:", userError);
      return;
    }
  
    const userId = userData?.user_id;
    const longestStreak = userData?.longest_streak || 0;

    setLongestStreak(longestStreak);

    console.log("User ID:", userId); // Debug log
    console.log("Current Streak:", streak);
    console.log("Longest Streak:", longestStreak);
  

    // If the current streak is the longest, update it
    if (streak > longestStreak) {
      const { data, error: updateError } = await supabase
      .from("Users")
      .update({ longest_streak: streak })
      .eq("user_id", userId)
      .select();  // This will return the updated row
    
    console.log("Updated User Data:", data);

      if (updateError) {
        console.error("Error updating longest streak:", updateError);
      }
    }
  };

  const fetchProgress = async () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());  
    const startISO = startOfDay.toISOString(); // Convert to UTC format

    const { data, error } = await supabase
    .from("Task")
    .select("completed")
    .gte("created_at", startISO); // Only check if it's after today's start

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      console.log(data)
      const totalTasks = data.length;
      const completedTasks = data.filter(task => task.completed).length;
  // Calculate completion percentage (avoid division by zero)
      const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
      console.log(completionPercentage)
      setProgressData(completionPercentage)
    }
  };

// Line Graph Data
  const fetchLine = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const { data, error } = await supabase
      .from("Task")
      .select("created_at, completed")
      .gte("created_at", sevenDaysAgo.toISOString());

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      const processedData = processLineData(data);
      setChartData(processedData);
    }
  };

  const processLineData = (tasks: { completed: boolean, created_at: string }[]) => {
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

  // Contribution Graph Data
  const fetchContribution = async () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const { data, error } = await supabase
    .from("Task")
    .select("created_at, completed") // Renaming count(*) to "count"
    .eq('completed', true)
    .gte('created_at', threeMonthsAgo.toISOString())

    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      const processedConData = processContributionData(data)
      setContributionData(processedConData)

    }
  };

  function processContributionData(tasks: { created_at: string; completed: boolean }[]) {
    type ProcessedTask = {
      date: string; // Date part of the timestamp (yyyy-mm-dd)
      count: number;
    };
  
    const result: ProcessedTask[] = [];
  
    tasks.forEach(task => {
      // Extract the date from the created_at timestamp (ignoring the time part)
      const date = task.created_at.split('T')[0];
  
      // Check if the date already exists in the result array
      const existingEntry = result.find(entry => entry.date === date);
  
      if (existingEntry) {
        // If it exists, increment the count
        existingEntry.count += 1;
      } else {
        // If it doesn't exist, create a new entry for the date
        result.push({ date, count: 1 });
      }
    });
  
    return result;
  }

  const onRefresh = async () => {
    setRefreshing(true);

    // const freshData = await fetchData();

    setRefreshing(false);
  };
  
  // Only render the LineChart when chartData is available
  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return <Text>Loading chart data...</Text>;
  }

  return (
    <ScrollView style={styles.container}
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor="blue" // Spinner color
        title="Refreshing..." // Custom text while refreshing
        titleColor="black" // Text color
        style={{}}
      />
    }
>
      <Text style={styles.title}>Your DayGrid</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{daysPlanned}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>{longestStreak}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>
      </View>

      <ScrollView
      horizontal
      decelerationRate={0}
      snapToInterval={screenWidth - 30} // Adjust to your item width
      snapToAlignment="center"
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      bounces={false}
    >
      <View style={styles.carouselItem}>
      <Text style={styles.graphTitle}>Today's Progress</Text>
      <ProgressChart
        data={{labels: ['',], data: [progressData]}} // Calculate percentage
        width={screenWidth - 50}
        height={220}
        radius={60}
        // hideLegend={true}
        strokeWidth={50}
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 167, 38, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          propsForLabels: {
            fontSize: "16",
            fontWeight: "bold"
          },
          }}
          style= {{
            borderRadius: 16,
          }}
      />
      </View>

      <View style={styles.carouselItem}>
      <Text style={styles.graphTitle}>This Week</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 50}
        height={220}
        bezier
        yAxisSuffix="%"
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(244, 162, 97, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,

          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726",
          },
        }}
        style={{
          borderRadius: 16,
        }}
      />
      </View>

      <View style={styles.carouselItem}>
      <Text style={styles.graphTitle}>Last 3 Months</Text>
      <ContributionGraph
      values={contributionData}
      // endDate={new Date("2017-04-01")} // Set the end date as specified
      numDays={96} // The number of days to show
      width={screenWidth - 50} // Dynamically adjust width based on screen size
      height={220} // Set the height for the graph
      tooltipDataAttrs={() => ({})}
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#fb8c00",
          backgroundGradientTo: "#ffa726",
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16
          },
          // propsForDots: {
          //   r: "6",
          //   strokeWidth: "2",
          //   stroke: "#ffa726"
          // }
        }}
      /> 
        </View>
    </ScrollView>
        
    <View style={styles.pagination}>
        {[...Array(3)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === activeIndex ? "#f4a261" : "#ccc" },
            ]}
          />
        ))}
      </View>


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
    marginTop: 20,
    marginBottom: 5,
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
  progressCircle: {
    alignSelf: "center",
    marginVertical: 20,
  },
  carouselItem: {
    width: screenWidth - 50,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    marginTop: 10,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 5,
  },
  activeDot: {
    backgroundColor: "#f4a261", // Active dot color
  },
});

export default StatsPage;
