import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./Auth";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Session } from "@supabase/supabase-js";
import Toolbar from "./components/Toolbar";
import { NavigationContainer } from "@react-navigation/native";
import { ContextProvider, useAppContext } from "./components/ContextProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Parent() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  const [refreshLoad, setRefreshLoad] = useState(false);
  const [getSessionLoad, setGetSessionLoad] = useState(false);
  const {
    plannedDay,
    setPlannedDay,
    dayCollectionID,
    setDayCollectionID,
    setUFirstName,
    setULastName,
  } = useAppContext();

  useEffect(() => {
    setLoading(true);
    setRefreshLoad(true);
    setGetSessionLoad(true);

    let localSession: Session | null = null;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      localSession = session;
      await saveUserData();
      setSession(session);
      setGetSessionLoad(false);
      if (!refreshLoad) {
        setLoading(false);
      }
    });

    const saveUserData = async () => {
      if (localSession === null && session != null) {
        localSession = session;
      }
      if (localSession !== null) {
        try {
          let { data: User, error: e } = await supabase
            .from("Users")
            .select("*")
            .eq("user_id", localSession.user.id);

          await AsyncStorage.setItem("@firstName", User[0].first_name);
          setUFirstName(User[0].first_name);
          console.log("NAME", User[0].first_name);
          await AsyncStorage.setItem("@lastName", User[0].last_name);
          setULastName(User[0].last_name);
        } catch (e) {
          console.error("ERROR GRABBING USER INFO", e);
        }
      }
    };

    const fetchDayStatus = async () => {
      let dayComplete = await onLoadFunction();

      if (dayComplete !== plannedDay) {
        console.log(plannedDay);
        setPlannedDay(true);
      }
      console.log("FETCH DONE");
    };

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

    supabase.auth.onAuthStateChange(async (_event, session) => {
      localSession = session;
      await saveUserData();
      setSession(session);
    });

    fetchDayStatus(); // Call the async function
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session && session.user ? <Toolbar session={session} /> : <Auth />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Optional: add a background color
  },
});

//password: ryansmithgspot

//email: cole0hardy@gmail.com
