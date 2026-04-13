import React, { useMemo, useState } from "react";
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

import { DatePickerModal } from "@/components/date-picker-modal";
import { Colors } from "@/constants/theme";
import {
    TASK_STATUS_ORDER,
    type Todo,
    type TodoPriority,
    type TodoStatus,
    useTodos,
} from "@/context/todo-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

const STATUS_LABELS: Record<Exclude<TodoStatus, "trashed">, string> = {
  todo: "Todo",
  in_progress: "In progress",
  done: "Done",
  submitted: "Submitted",
};

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function TodoScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [task, setTask] = useState("");
  const [editingTask, setEditingTask] = useState<Todo | null>(null);
  const [selectedStatus, setSelectedStatus] =
    useState<Exclude<TodoStatus, "trashed">>("todo");
  const [selectedPriority, setSelectedPriority] =
    useState<TodoPriority>("medium");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [alarmTime, setAlarmTime] = useState("");
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [filter, setFilter] = useState<"all" | Exclude<TodoStatus, "trashed">>(
    "all",
  );

  const {
    tasks,
    todos,
    inProgressTasks,
    doneTasks,
    submittedTasks,
    activeTasks,
    addTask,
    updateTask,
    toggleTask,
    setTaskStatus,
    moveTaskToTrash,
  } = useTodos();

  const reminderAt = useMemo(() => {
    if (!dueDate || !alarmTime) {
      return null;
    }

    const [hours, minutes] = alarmTime.split(":").map((value) => Number(value));
    const [year, month, day] = dueDate.split("-").map((value) => Number(value));

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
  }, [alarmTime, dueDate]);

  const filteredTasks = useMemo(() => {
    const visibleTasks = tasks.filter((item) => item.status !== "trashed");

    if (filter === "all") {
      return visibleTasks;
    }

    return visibleTasks.filter((item) => item.status === filter);
  }, [filter, tasks]);

  const totals = useMemo(
    () => ({
      todo: todos.length,
      in_progress: inProgressTasks.length,
      done: doneTasks.length,
      submitted: submittedTasks.length,
    }),
    [
      doneTasks.length,
      inProgressTasks.length,
      submittedTasks.length,
      todos.length,
    ],
  );

  const resetForm = () => {
    setTask("");
    setEditingTask(null);
    setSelectedStatus("todo");
    setSelectedPriority("medium");
    setDueDate(null);
    setAlarmTime("");
  };

  const saveTask = () => {
    const cleanText = task.trim();

    if (!cleanText) {
      Alert.alert("Error", "Please enter a task");
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        text: cleanText,
        status: selectedStatus,
        priority: selectedPriority,
        dueDate,
        reminderAt,
      });
    } else {
      addTask(cleanText, {
        status: selectedStatus,
        priority: selectedPriority,
        dueDate,
        reminderAt,
      });
    }

    resetForm();
    Keyboard.dismiss();
  };

  const startEditTask = (todo: Todo) => {
    setEditingTask(todo);
    setTask(todo.text);
    setSelectedStatus(todo.status === "trashed" ? "todo" : todo.status);
    setSelectedPriority(todo.priority);
    setDueDate(todo.dueDate ?? null);
    setAlarmTime(formatTimeForInput(todo.reminderAt));
    setCalendarVisible(false);
  };

  const cancelEdit = () => {
    resetForm();
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
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                My Todo Planner
              </Text>
              <Text style={[styles.subtitle, { color: colors.icon }]}>
                {activeTasks.length} active tasks with due dates and alarms
              </Text>
            </View>

            <View style={styles.summaryRow}>
              {[
                { key: "todo", label: "Todo", value: totals.todo },
                {
                  key: "in_progress",
                  label: "In progress",
                  value: totals.in_progress,
                },
                { key: "done", label: "Done", value: totals.done },
                {
                  key: "submitted",
                  label: "Submitted",
                  value: totals.submitted,
                },
              ].map((item) => (
                <View
                  key={item.key}
                  style={[
                    styles.summaryCard,
                    {
                      borderColor: colors.icon,
                      backgroundColor: colors.background,
                    },
                  ]}
                >
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {item.value}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.icon }]}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={[
                styles.formCard,
                {
                  borderColor: colors.icon,
                  backgroundColor: colors.background,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Task details
              </Text>
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

              <Text style={[styles.fieldLabel, { color: colors.icon }]}>
                Status
              </Text>
              <View style={styles.chipRow}>
                {TASK_STATUS_ORDER.map((status) => {
                  const isSelected = selectedStatus === status;

                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.chip,
                        isSelected && {
                          backgroundColor: colors.tint,
                          borderColor: colors.tint,
                        },
                      ]}
                      onPress={() => setSelectedStatus(status)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? "#fff" : colors.text },
                        ]}
                      >
                        {STATUS_LABELS[status]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.fieldLabel, { color: colors.icon }]}>
                Priority
              </Text>
              <View style={styles.chipRow}>
                {(["low", "medium", "high"] as const).map((priority) => {
                  const isSelected = selectedPriority === priority;

                  return (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.chip,
                        isSelected && {
                          backgroundColor: colors.tint,
                          borderColor: colors.tint,
                        },
                      ]}
                      onPress={() => setSelectedPriority(priority)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? "#fff" : colors.text },
                        ]}
                      >
                        {PRIORITY_LABELS[priority]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.reminderRow}>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    {
                      borderColor: colors.icon,
                      backgroundColor: colors.background,
                    },
                  ]}
                  onPress={() => setCalendarVisible(true)}
                >
                  <Text
                    style={[styles.dateButtonLabel, { color: colors.text }]}
                  >
                    Due date
                  </Text>
                  <Text
                    style={[styles.dateButtonValue, { color: colors.icon }]}
                  >
                    {dueDate ? formatDateOnly(dueDate) : "Pick a day"}
                  </Text>
                </TouchableOpacity>

                <View style={styles.timeBlock}>
                  <Text style={[styles.fieldLabel, { color: colors.icon }]}>
                    Alarm time
                  </Text>
                  <TextInput
                    style={[
                      styles.timeInput,
                      {
                        color: colors.text,
                        borderColor: colors.icon,
                        backgroundColor: colors.background,
                      },
                    ]}
                    placeholder="09:00"
                    placeholderTextColor={colors.icon}
                    value={alarmTime}
                    onChangeText={setAlarmTime}
                  />
                </View>
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { backgroundColor: colors.tint },
                  ]}
                  onPress={saveTask}
                >
                  <Text style={styles.primaryButtonText}>
                    {editingTask ? "Save task" : "Add task"}
                  </Text>
                </TouchableOpacity>

                {editingTask ? (
                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      { borderColor: colors.icon },
                    ]}
                    onPress={cancelEdit}
                  >
                    <Text
                      style={[
                        styles.secondaryButtonText,
                        { color: colors.text },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <View style={styles.filterRow}>
              {(["all", ...TASK_STATUS_ORDER] as const).map((item) => {
                const label = item === "all" ? "All" : STATUS_LABELS[item];
                const isSelected = filter === item;

                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.filterChip,
                      isSelected && {
                        backgroundColor: colors.tint,
                        borderColor: colors.tint,
                      },
                    ]}
                    onPress={() => setFilter(item)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        { color: isSelected ? "#fff" : colors.text },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Tasks
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No tasks yet!
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.icon }]}>
              Add a task, pick a day, and set an alarm to turn it into a
              reminder.
            </Text>
          </View>
        }
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
            <View style={styles.taskBody}>
              <Text style={[styles.taskText, { color: colors.text }]}>
                {item.text}
              </Text>
              <View style={styles.metaRow}>
                <Text style={[styles.metaText, { color: colors.icon }]}>
                  {STATUS_LABELS[item.status as Exclude<TodoStatus, "trashed">]}
                </Text>
                <Text style={[styles.metaText, { color: colors.icon }]}>
                  Priority {PRIORITY_LABELS[item.priority]}
                </Text>
              </View>
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
                  Alarm {formatReminder(item.reminderAt)}
                </Text>
              ) : null}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.tint }]}
                onPress={() => startEditTask(item)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.icon }]}
                onPress={() => toggleTask(item.id)}
              >
                <Text style={styles.actionText}>Next</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: colors.icon }]}
                onPress={() => sendTaskToTrash(item.id)}
              >
                <Text style={styles.deleteText}>Trash</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.tint }]}
                onPress={() =>
                  setTaskStatus(
                    item.id,
                    item.status === "done" ? "todo" : "done",
                  )
                }
              >
                <Text style={styles.actionText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <DatePickerModal
        visible={calendarVisible}
        initialDate={dueDate}
        onClose={() => setCalendarVisible(false)}
        onSelect={(value) => {
          setDueDate(value);
          setCalendarVisible(false);
        }}
        onClear={() => setDueDate(null)}
      />
    </SafeAreaView>
  );
}

function formatTimeForInput(value?: string | null) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
}

function formatDateOnly(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatReminder(value: string) {
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  listContent: {
    padding: 20,
    paddingBottom: 32,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  summaryCard: {
    minWidth: "22%",
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  reminderRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
    alignItems: "flex-start",
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateButtonLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  dateButtonValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  timeBlock: {
    width: 120,
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  primaryButton: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "700",
  },
  taskItem: {
    padding: 16,
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  taskBody: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  taskText: {
    fontSize: 18,
    fontWeight: "700",
  },
  metaText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
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
    padding: 30,
    minHeight: 240,
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
