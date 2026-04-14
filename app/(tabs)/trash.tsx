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
import { useTodos } from "@/context/todo-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

const STATUS_LABELS: Record<string, string> = {
  todo: "Todo",
  in_progress: "In progress",
  done: "Done",
  submitted: "Submitted",
  trashed: "Trash",
};

export default function TrashScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { trashedTasks, restoreTask, deleteTaskForever } = useTodos();

  const confirmDeleteForever = (id: string) => {
    Alert.alert("Delete forever", "This task will be removed permanently.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTaskForever(id),
      },
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
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Trash</Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          {trashedTasks.length} {trashedTasks.length === 1 ? "task" : "tasks"}{" "}
          in trash
        </Text>
      </View>

      {trashedTasks.length === 0 ? (
        <View
          style={[
            styles.emptyContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.emptyText, { color: colors.text }]}>Trash is empty</Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>
            Deleted tasks will appear here before permanent removal.
          </Text>
        </View>
      ) : (
        <FlatList
          data={trashedTasks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View
              style={[
                styles.trashItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.taskCopy}>
                <Text style={[styles.taskText, { color: colors.text }]}>
                  {item.text}
                </Text>
                <Text style={[styles.metaText, { color: colors.icon }]}>
                  Status {STATUS_LABELS[item.previousStatus ?? item.status]}
                </Text>
                <Text style={[styles.metaText, { color: colors.icon }]}>
                  Priority {item.priority}
                </Text>
                <Text style={[styles.metaText, { color: colors.icon }]}>
                  Created {formatDate(item.createdAt)}
                </Text>
                {item.dueDate ? (
                  <Text style={[styles.metaText, { color: colors.icon }]}>
                    Due {formatDateOnly(item.dueDate)}
                  </Text>
                ) : null}
                {item.reminderAt ? (
                  <Text style={[styles.metaText, { color: colors.icon }]}>
                    Alarm {formatDateTime(item.reminderAt)}
                  </Text>
                ) : null}
                <Text style={[styles.metaText, { color: colors.icon }]}>
                  Deleted{" "}
                  {item.deletedAt ? formatDate(item.deletedAt) : "Recently"}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.tint },
                  ]}
                  onPress={() => restoreTask(item.id)}
                >
                  <Text style={styles.actionText}>Restore</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    { backgroundColor: colors.danger },
                  ]}
                  onPress={() => confirmDeleteForever(item.id)}
                >
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

function formatDateOnly(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
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
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  title: { fontSize: 32, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  listContent: {
    padding: 20,
    paddingBottom: 124,
  },
  trashItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  taskCopy: {
    flex: 1,
    paddingRight: 12,
  },
  taskText: { fontSize: 17, marginBottom: 6, fontWeight: "800" },
  metaText: {
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  deleteButton: {
    borderRadius: 12,
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
    padding: 24,
    margin: 20,
    borderWidth: 1,
    borderRadius: 24,
  },
  emptyText: { fontSize: 20, fontWeight: "900", marginBottom: 8 },
  emptySubtext: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});
