import React from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";
import { Quadrant, Task } from "../../../types/types";
import { Divider } from "react-native-paper";

interface GenericQProps {
  quadrant: Quadrant;
}

export default function GenericQ({ quadrant }: GenericQProps) {
  // Determine background color based on category
  const getBackgroundColor = (category: string): string => {
    switch (category) {
      case "Relationships":
        return "#F7BFAE"; // Light Red
      case "Physical":
        return "#E2FAED"; // Light Green
      case "Work":
        return "#E9F8FC"; // Light Blue
      case "Emotional/Spiritual":
        return "#F3D3A6";
      default:
        return "#FFEEE2"; // Default color
    }
  };

  return (
    <View
      style={[
        styles.quadrantBox,
        { backgroundColor: getBackgroundColor(quadrant.category) },
      ]}
    >
      <Text style={styles.QuadrantTitle}>{quadrant.category}</Text>
      <FlatList
        data={quadrant.Task}
        keyExtractor={(task, index) => `${task.name}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.bullet} />
            <Text style={styles.taskItem}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  quadrantBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  QuadrantTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  listItem: {
    flexDirection: "row", // Align bullet and text horizontally
    alignItems: "center",
    marginVertical: 4,
  },
  bullet: {
    width: 8, // Size of the square bullet
    height: 8,
    backgroundColor: "#333", // Color of the bullet
    marginRight: 8, // Space between bullet and text
  },
  taskItem: {
    fontSize: 14,
    color: "#666",
  },
});