import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import AuthNavigator from "./navigation/AuthNavigator";
import AppNavigator from "./navigation/AppNavigator";
import { View, ActivityIndicator } from "react-native";
import { Session } from "@supabase/supabase-js";
import { ContextProvider } from "./components/ContextProvider"; // ✅ Import AppProvider

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <ContextProvider> {/* ✅ Wrap AppNavigator/AuthNavigator in AppProvider */}
      {session ? <AppNavigator session={session} /> : <AuthNavigator />}
    </ContextProvider>
  );
}

//password: ryansmithgspot

//email: cole0hardy@gmail.com
