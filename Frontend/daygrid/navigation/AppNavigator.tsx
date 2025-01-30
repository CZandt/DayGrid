import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import HomePrePlan from "../components/HomeViews/HomePrePlan"; // ✅ Ensure this exists
import { Session } from "@supabase/supabase-js";

const Stack = createStackNavigator();

type AppNavigatorProps = {
  session: Session | null; // ✅ Expect session as a prop
};

export default function AppNavigator({ session }: AppNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Home" 
          children={() => <HomePrePlan session={session!} />} // ✅ Correct way to pass props
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
