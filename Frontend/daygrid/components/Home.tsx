import React, { useState } from "react";
import HomePrePlan from "./HomeViews/HomePrePlan";
import HomePostPlan from "./HomeViews/HomePostPlan";
import { View, StyleSheet, Text } from "react-native";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { DayCollection } from "../types/types";
import { Session } from "@supabase/supabase-js";
import { useAppContext } from "../components/ContextProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

type HomeRouteParams = {
  Home: {
    session: Session;
  };
};

export default function Home() {
  // Correctly type `useRoute` with the `RouteProp` for `Home`
  const { session } = useRoute<RouteProp<HomeRouteParams, "Home">>().params;

  const { plannedDay, setPlannedDay, dayCollectionID, setDayCollectionID } =
    useAppContext();

  const [loading, setLoading] = React.useState(true);

  const [quadrants, setQuadrants] = useState(null);
  const [offHandQuadrants, setOffHandQuadrants] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-US")
  );

  //TODO: THIS IS A REALLY BAD WAY TO CHECK IF THE DAY HAS BEEN PLANNED
  const onLoadFunction = async () => {
    const localID = async () => {
      try {
        const lastUpdateDay = await AsyncStorage.getItem("@lastDate");
        if (lastUpdateDay === new Date().toLocaleDateString("en-US")) {
          const dayID = await AsyncStorage.getItem("@dayId");
          setDayCollectionID(dayID!); // TODO: Fix the forceUNWRAP
          return true;
        } else {
          return false;
        }
      } catch (e) {
        console.error("FAILED TO LOAD LOCAL DATA", e);
      }
    };

    return await localID();
  };

  // Runs when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setLoading(false);
      // Async function to handle logic on load
      const fetchDayStatus = async () => {
        let dayComplete = await onLoadFunction();

        if (dayComplete !== plannedDay) {
          console.log(plannedDay);
          setPlannedDay(true);
        }
      };

      fetchDayStatus(); // Call the async function;

      // Cleanup function: runs when the screen loses focus
      return () => {
        console.log("Leaving Home Screen");
        console.log(offHandQuadrants);

        if (offHandQuadrants != null) {
          setQuadrants(offHandQuadrants);
          setOffHandQuadrants(null);
          setSelectedDate(new Date().toLocaleDateString("en-US"));
        }
      };
    }, [plannedDay])
  );

  if (loading) {
    return <View></View>;
  }

  return (
    <View style={styles.container}>
      {plannedDay ? (
        <HomePostPlan
          session={session}
          quadrants={quadrants}
          setQuadrants={setQuadrants}
          offHandQuadrants={offHandQuadrants}
          setOffHandQuadrants={setOffHandQuadrants}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      ) : (
        <HomePrePlan session={session} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
