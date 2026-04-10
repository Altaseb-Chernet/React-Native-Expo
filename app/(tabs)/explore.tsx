import React from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { useTodos } from "@/context/todo-context";

export default function CompletedScreen() {
  const { tasks } = useTodos();
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Completed Tasks</Text>
        <Text style={styles.subtitle}>
          {completedTasks.length}{" "}
          {completedTasks.length === 1 ? "task" : "tasks"} done
        </Text>
      </View>

      {completedTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No completed tasks yet</Text>
          <Text style={styles.emptySubtext}>
            Mark tasks as complete from the Todos tab.
          </Text>
        </View>
      ) : (
        <FlatList
          data={completedTasks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.completedItem}>
              <Text style={styles.completedText}>{item.text}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  listContent: {
    padding: 20,
  },
  completedItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  completedText: {
    fontSize: 16,
    color: "#666",
    textDecorationLine: "line-through",
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
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
