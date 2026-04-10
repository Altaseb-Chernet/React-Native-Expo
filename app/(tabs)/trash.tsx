import React from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTodos } from "@/context/todo-context";

export default function TrashScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { trashedTasks, restoreTask, deleteTaskForever } = useTodos();

  const confirmDeleteForever = (id: string) => {
    Alert.alert("Delete forever", "This task will be removed permanently.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTaskForever(id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.icon }]}>
        <Text style={[styles.title, { color: colors.text }]}>Trash</Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}> 
          {trashedTasks.length} {trashedTasks.length === 1 ? "task" : "tasks"} in trash
        </Text>
      </View>

      {trashedTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>Trash is empty</Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>Deleted tasks will appear here before permanent removal.</Text>
        </View>
      ) : (
        <FlatList
          data={trashedTasks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.trashItem, { backgroundColor: colors.background, borderColor: colors.icon }]}>
              <View style={styles.taskCopy}>
                <Text style={[styles.taskText, { color: colors.text }]}>{item.text}</Text>
                <Text style={[styles.metaText, { color: colors.icon }]}>Created {formatDate(item.createdAt)}</Text>
                <Text style={[styles.metaText, { color: colors.icon }]}>Deleted {item.deletedAt ? formatDate(item.deletedAt) : "Recently"}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.tint }]} onPress={() => restoreTask(item.id)}>
                  <Text style={styles.actionText}>Restore</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.icon }]} onPress={() => confirmDeleteForever(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
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
    fontSize: 30,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  listContent: {
    padding: 20,
    paddingBottom: 24,
  },
  trashItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  taskCopy: {
    flex: 1,
    paddingRight: 12,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});