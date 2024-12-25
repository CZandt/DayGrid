import React from "react";
import HomePrePlan from "./HomeViews/HomePrePlan";
import HomePostPlan from "./HomeViews/HomePostPlan";
import { View, StyleSheet, Text } from "react-native";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { DayCollection } from "../types/types";
import { Session } from "@supabase/supabase-js";
import { useAppContext } from "../components/ContextProvider";

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

  //TODO: THIS IS A REALLY BAD WAY TO CHECK IF THE DAY HAS BEEN PLANNED
  const onLoadFunction = async () => {
    let { data: DayCollection, error } = await supabase
      .from("DayCollection")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("date", new Date().toLocaleDateString("en-US"));

    if (DayCollection?.length === 0) {
      console.log("Returned False");
      return false;
    } else {
      setDayCollectionID(DayCollection[0].id);
      return true;
    }
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

      fetchDayStatus(); // Call the async function

      // Cleanup function: runs when the screen loses focus
      return () => {
        console.log("Leaving Home Screen");
      };
    }, [plannedDay])
  );

  if (loading) {
    return (
      <View>
        <Text>LOADING...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {plannedDay ? (
        <HomePostPlan session={session} />
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
