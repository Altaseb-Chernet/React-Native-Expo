import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Keyboard,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { type Todo, useTodos } from "@/context/todo-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TodoScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [task, setTask] = useState("");
  const [editingTask, setEditingTask] = useState<Todo | null>(null);
  const { activeTasks, addTask, updateTask, toggleTask, moveTaskToTrash } =
    useTodos();

  const saveTask = () => {
    const cleanText = task.trim();

    if (!cleanText) {
      Alert.alert("Error", "Please enter a task");
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, cleanText);
      setEditingTask(null);
    } else {
      addTask(cleanText);
    }

    setTask("");
    Keyboard.dismiss();
  };

  const startEditTask = (todo: Todo) => {
    setEditingTask(todo);
    setTask(todo.text);
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setTask("");
  };

  const sendTaskToTrash = (id: string) => {
    Alert.alert("Move to Trash", "This task will be moved to Trash.", [
      { text: "Cancel", style: "cancel" },
      { text: "Move", onPress: () => moveTaskToTrash(id) },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.icon,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>My Todo List</Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          {activeTasks.length} {activeTasks.length === 1 ? "task" : "tasks"}{" "}
          active
        </Text>
      </View>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.icon,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.icon,
              backgroundColor: colors.background,
            },
          ]}
          placeholder="Enter a new task..."
          placeholderTextColor={colors.icon}
          value={task}
          onChangeText={setTask}
          onSubmitEditing={saveTask}
        />
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.tint }]}
          onPress={saveTask}
        >
          <Text style={styles.primaryButtonText}>
            {editingTask ? "Save" : "Add"}
          </Text>
        </TouchableOpacity>
      </View>

      {editingTask ? (
        <View style={styles.editBar}>
          <Text style={[styles.editLabel, { color: colors.icon }]}>
            Editing a task
          </Text>
          <TouchableOpacity onPress={cancelEdit}>
            <Text style={[styles.cancelText, { color: colors.tint }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {activeTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No tasks yet!
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>
            Add your first task using the input above.
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeTasks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View
              style={[
                styles.taskItem,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.icon,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.taskLeft}
                onPress={() => toggleTask(item.id)}
              >
                <View style={[styles.checkbox, { borderColor: colors.tint }]} />
                <View style={styles.taskBody}>
                  <Text style={[styles.taskText, { color: colors.text }]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.metaText, { color: colors.icon }]}>
                    Created {formatDate(item.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.tint },
                  ]}
                  onPress={() => startEditTask(item)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    { backgroundColor: colors.icon },
                  ]}
                  onPress={() => sendTaskToTrash(item.id)}
                >
                  <Text style={styles.deleteText}>Trash</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 20,
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  primaryButton: {
    marginLeft: 10,
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  editBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  editLabel: {
    fontSize: 12,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  taskBody: {
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
  },
  taskText: {
    fontSize: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  deleteButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});
