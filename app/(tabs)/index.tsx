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
    type Todo,
    type TodoPriority,
    type TodoStatus,
    useTodos,
} from "@/context/todo-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ColorPalette = (typeof Colors)["light"];

const STATUS_FLOW: Array<Exclude<TodoStatus, "trashed">> = [
  "todo",
  "in_progress",
  "done",
  "submitted",
];

const STATUS_LABELS: Record<Exclude<TodoStatus, "trashed">, string> = {
  todo: "Todo",
  in_progress: "Doing",
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
  const { tasks, addTask, updateTask, moveTaskToTrash } = useTodos();

  const [taskText, setTaskText] = useState("");
  const [editingTask, setEditingTask] = useState<Todo | null>(null);
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [alarmTime, setAlarmTime] = useState("09:00");
  const [calendarVisible, setCalendarVisible] = useState(false);

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.status !== "trashed"),
    [tasks],
  );

  const todayCount = useMemo(
    () =>
      activeTasks.filter(
        (task) => task.dueDate === toDateOnlyString(new Date()),
      ).length,
    [activeTasks],
  );

  const upcomingCount = useMemo(
    () =>
      activeTasks.filter((task) => {
        if (!task.dueDate) {
          return false;
        }

        return task.dueDate >= toDateOnlyString(new Date());
      }).length,
    [activeTasks],
  );

  const resetComposer = () => {
    setTaskText("");
    setEditingTask(null);
    setPriority("medium");
    setDueDate(null);
    setAlarmEnabled(false);
    setAlarmTime("09:00");
  };

  const saveTask = () => {
    const cleanText = taskText.trim();

    if (!cleanText) {
      Alert.alert("Missing task", "Enter a task title first.");
      return;
    }

    const reminderAt = alarmEnabled
      ? buildReminderAt(dueDate, alarmTime)
      : null;

    if (editingTask) {
      updateTask(editingTask.id, {
        text: cleanText,
        priority,
        dueDate,
        reminderAt,
      });
    } else {
      addTask(cleanText, {
        priority,
        dueDate,
        reminderAt,
      });
    }

    resetComposer();
    Keyboard.dismiss();
  };

  const startEditTask = (task: Todo) => {
    setEditingTask(task);
    setTaskText(task.text);
    setPriority(task.priority);
    setDueDate(task.dueDate ?? null);
    setAlarmEnabled(Boolean(task.reminderAt));
    setAlarmTime(formatTimeForInput(task.reminderAt) || "09:00");
  };

  const cycleStatus = (task: Todo) => {
    if (task.status === "trashed") {
      return;
    }

    const currentIndex = STATUS_FLOW.indexOf(task.status);
    const nextStatus = STATUS_FLOW[(currentIndex + 1) % STATUS_FLOW.length];

    updateTask(task.id, { status: nextStatus });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={activeTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  Tasks
                </Text>
                <Text style={[styles.subtitle, { color: colors.icon }]}>
                  {todayCount} today · {upcomingCount} upcoming
                </Text>
              </View>
              <View style={styles.headerPill}>
                <Text style={styles.headerPillText}>Simple</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <SummaryCard label="Today" value={todayCount} color={colors} />
              <SummaryCard
                label="Upcoming"
                value={upcomingCount}
                color={colors}
              />
            </View>

            <View
              style={[
                styles.composerCard,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.icon,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Quick add
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.icon },
                ]}
                placeholder="What do you need to do?"
                placeholderTextColor={colors.icon}
                value={taskText}
                onChangeText={setTaskText}
                onSubmitEditing={saveTask}
                returnKeyType="done"
              />

              <View style={styles.chipRow}>
                {(["low", "medium", "high"] as const).map((item) => (
                  <Chip
                    key={item}
                    label={PRIORITY_LABELS[item]}
                    active={priority === item}
                    onPress={() => setPriority(item)}
                    color={colors}
                  />
                ))}
              </View>

              <View style={styles.composerRow}>
                <SmallButton
                  label={dueDate ? formatDateOnly(dueDate) : "Add date"}
                  onPress={() => setCalendarVisible(true)}
                  color={colors}
                />
                <SmallButton
                  label={alarmEnabled ? `Alarm ${alarmTime}` : "Add alarm"}
                  onPress={() => setAlarmEnabled((value) => !value)}
                  active={alarmEnabled}
                  color={colors}
                />
              </View>

              {alarmEnabled ? (
                <TextInput
                  style={[
                    styles.timeInput,
                    { color: colors.text, borderColor: colors.icon },
                  ]}
                  placeholder="09:00"
                  placeholderTextColor={colors.icon}
                  value={alarmTime}
                  onChangeText={setAlarmTime}
                />
              ) : null}

              <View style={styles.composerActions}>
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
                    style={[styles.ghostButton, { borderColor: colors.icon }]}
                    onPress={resetComposer}
                  >
                    <Text
                      style={[styles.ghostButtonText, { color: colors.text }]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Inbox
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No tasks yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.icon }]}>
              Add one task and keep it simple.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.taskCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.icon,
              },
            ]}
          >
            <View style={styles.taskTopRow}>
              <View style={styles.taskBody}>
                <Text style={[styles.taskText, { color: colors.text }]}>
                  {item.text}
                </Text>
                <Text style={[styles.metaText, { color: colors.icon }]}>
                  {item.dueDate ? formatDateOnly(item.dueDate) : "No date"}
                </Text>
              </View>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityBadgeText}>
                  {PRIORITY_LABELS[item.priority]}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor(item.status) },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {STATUS_LABELS[item.status as Exclude<TodoStatus, "trashed">]}
                </Text>
              </View>
              {item.reminderAt ? (
                <Text style={[styles.metaText, { color: colors.icon }]}>
                  Alarm {formatReminder(item.reminderAt)}
                </Text>
              ) : null}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.tint }]}
                onPress={() => cycleStatus(item)}
              >
                <Text style={styles.actionText}>Next</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.icon }]}
                onPress={() => startEditTask(item)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.icon }]}
                onPress={() => moveTaskToTrash(item.id)}
              >
                <Text style={styles.actionText}>Trash</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <DatePickerModal
        visible={calendarVisible}
        initialDate={dueDate}
        onClose={() => setCalendarVisible(false)}
        onSelect={(value) => setDueDate(value)}
        onClear={() => setDueDate(null)}
      />
    </SafeAreaView>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: ColorPalette;
}) {
  return (
    <View
      style={[
        styles.summaryCard,
        { borderColor: color.icon, backgroundColor: color.background },
      ]}
    >
      <Text style={[styles.summaryValue, { color: color.text }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: color.icon }]}>{label}</Text>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
  color,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  color: ColorPalette;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { borderColor: color.icon },
        active && { borderColor: color.tint, backgroundColor: color.tint },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, { color: active ? "#fff" : color.text }]}>
        {" "}
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SmallButton({
  label,
  onPress,
  active,
  color,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  color: ColorPalette;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.smallButton,
        { borderColor: color.icon },
        active && { borderColor: color.tint, backgroundColor: color.tint },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.smallButtonText,
          { color: active ? "#fff" : color.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function toDateOnlyString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildReminderAt(dueDate: string | null, alarmTime: string) {
  if (!dueDate) {
    return null;
  }

  const [year, month, day] = dueDate.split("-").map((part) => Number(part));
  const [hours, minutes] = alarmTime.split(":").map((part) => Number(part));

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
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

function statusColor(status: TodoStatus) {
  switch (status) {
    case "todo":
      return "#dbeafe";
    case "in_progress":
      return "#fef3c7";
    case "done":
      return "#dcfce7";
    case "submitted":
      return "#e0e7ff";
    default:
      return "#e2e8f0";
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 32 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: { fontSize: 32, fontWeight: "800" },
  subtitle: { marginTop: 4, fontSize: 14 },
  headerPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#0f172a",
  },
  headerPillText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  summaryValue: { fontSize: 24, fontWeight: "800" },
  summaryLabel: { marginTop: 4, fontSize: 12, fontWeight: "600" },
  composerCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  chipRow: { flexDirection: "row", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: { fontSize: 12, fontWeight: "700" },
  composerRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  smallButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  smallButtonText: { fontSize: 13, fontWeight: "700" },
  timeInput: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  composerActions: { flexDirection: "row", gap: 10 },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  ghostButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  ghostButtonText: { fontSize: 15, fontWeight: "700" },
  taskCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  taskTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  taskBody: { flex: 1 },
  taskText: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  metaText: { fontSize: 12, fontWeight: "600" },
  priorityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#0f172a",
  },
  priorityBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },
  actionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  actionButton: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontSize: 20, fontWeight: "800" },
  emptySubtext: { marginTop: 6, fontSize: 14, textAlign: "center" },
});
