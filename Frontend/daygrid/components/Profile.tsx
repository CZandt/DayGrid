import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useAppContext } from "./ContextProvider";

type PlanRouteParams = {
  session: Session;
};

export default function Profile() {
  const route = useRoute<RouteProp<{ Plan: PlanRouteParams }, "Plan">>();
  const { session } = route.params;

  const { uFirstName, uLastName } = useAppContext();

  return (
    <View>
      <Text>
        Name: {uFirstName} {uLastName}
      </Text>
      <Text>Email: {session.user.email}</Text>
    </View>
  );
}
