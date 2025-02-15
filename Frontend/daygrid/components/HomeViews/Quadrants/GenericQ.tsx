import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Quadrant, Task } from "../../../types/types";
import { Checkbox } from "react-native-paper";

interface GenericQProps {
  quadrant: Quadrant;
  onUpdateTask: (taskId: string, completed: boolean) => void;
}

export default function GenericQ({ quadrant, onUpdateTask }: GenericQProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleTaskCompletion = (taskId: string, currentStatus: boolean) => {
    onUpdateTask(taskId, !currentStatus);
  };

  const getBackgroundColor = (category: string): string => {
    switch (category) {
      case "Relationships":
        return "#F7BFAE";
      case "Physical":
        return "#E2FAED";
      case "Work":
        return "#E9F8FC";
      case "Emotional/Spiritual":
        return "#F3D3A6";
      default:
        return "#FFEEE2";
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <View
          style={[
            styles.quadrantBox,
            { backgroundColor: getBackgroundColor(quadrant.category) },
          ]}
        >
          <Text style={styles.QuadrantTitle}>{quadrant.category}</Text>
          <FlatList
            data={quadrant.Task.filter((task) => !task.completed)} // Filter non-completed tasks
            keyExtractor={(task, index) => `${task.name}-${index}`} // Ensure a unique key for each item
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={styles.bullet} />
                <Text style={styles.taskItem}>{item.name}</Text>
              </View>
            )}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{quadrant.category}</Text>
                <FlatList
                  data={quadrant.Task}
                  keyExtractor={(task, index) => `${task.name}-${index}`}
                  renderItem={({ item }) => (
                    <View style={styles.modalTaskContainer}>
                      <Checkbox
                        status={item.completed ? "checked" : "unchecked"}
                        onPress={() =>
                          handleTaskCompletion(item.id, item.completed)
                        }
                        color="#007AFF"
                      />
                      <Text
                        style={[
                          styles.modalTask,
                          item.completed && styles.completedTask,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.taskItem}>{item.id}</Text>
                    </View>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  bullet: {
    width: 8,
    height: 8,
    backgroundColor: "#333",
    marginRight: 8,
  },
  taskItem: {
    fontSize: 14,
    color: "#666",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: "90%",
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalTaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTask: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
    color: "#333",
  },
  completedTask: {
    textDecorationLine: "line-through",
    color: "#888",
  },
});
