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
import Parent from "./Parent";

export default function App() {
  return (
    <ContextProvider>
      <Parent />
    </ContextProvider>
  );
}

//password: ryansmithgspot

//email: cole0hardy@gmail.com
//password: ryansmithgspot

//email: cole0hardy@gmail.com
