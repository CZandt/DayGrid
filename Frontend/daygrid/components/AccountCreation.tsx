import { useState } from "react";
import { View, Text, StyleSheet, Button, Image } from "react-native";

const onboardingSteps = [
  {
    id: 1,
    //image: { uri: "https://ibb.co/7J7cx3Tr" },
    image: require("../assets/onboarding1.png"),
    subtitle: "Plan Better",
    text: "Use this app to become more mindful and productive through simplified planning and journaling. One day at a time.",
  },
  {
    id: 2,
    image: { uri: "https://ibb.co/nMt8r9SZ" },
    subtitle: "Be More Mindful",
    text: "DayGrid is built to help you live in the moment, write down things on your mind and enjoy your day.",
  },
  {
    id: 3,
    image: { uri: "https://ibb.co/bj8K8XXx" },
    subtitle: "Boost Productivity",
    text: "By planning a day at a time, you will be able to accomplish goals, plans, and become more productive over time.",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      console.log("Onboarding complete"); // Replace with navigation logic
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DayGrid</Text>
      <Image source={onboardingSteps[step].image} style={styles.image} />
      <Text style={styles.subtitle}>{onboardingSteps[step].subtitle}</Text>
      <Text style={styles.text}>{onboardingSteps[step].text}</Text>
      <Button title="Next" onPress={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#92A9BD",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  image: {
    width: 300,
    height: 200,
    resizeMode: "contain",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
});
