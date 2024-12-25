import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./Auth";
import { View } from "react-native";
import { Session } from "@supabase/supabase-js";
import Toolbar from "./components/Toolbar";
import { NavigationContainer } from "@react-navigation/native";
import { ContextProvider } from "./components/ContextProvider";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <NavigationContainer>
      {session && session.user ? (
        <ContextProvider>
          <Toolbar session={session} />
        </ContextProvider>
      ) : (
        <Auth />
      )}
    </NavigationContainer>
  );
}

//password: ryansmithgspot

//email: cole0hardy@gmail.com
