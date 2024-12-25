import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Home from "./Home";
import Profile from "./Profile";
import Plan from "./Plan";
import Stats from "./Stats";
import { Session } from "@supabase/supabase-js";
import { useAppContext } from "./ContextProvider";

import { useState } from "react";

const Tab = createBottomTabNavigator();

interface ToolbarProps {
  session: Session;
}

export default function Toolbar({ session }: ToolbarProps) {
  const { plannedDay } = useAppContext();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#e91e63",
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        initialParams={{ session }}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Plan"
        component={Plan}
        initialParams={{ session }}
        options={{
          tabBarLabel: plannedDay ? "Review" : "Plan",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="book-plus"
              color={color}
              size={size}
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={Stats}
        options={{
          tabBarLabel: "Stats",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-box-outline"
              color={color}
              size={size}
            />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        initialParams={{ session }}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

//cole0hardy@gmail.com
//ryansmit
