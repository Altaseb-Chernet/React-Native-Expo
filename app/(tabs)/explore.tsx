import React, { useMemo, useState } from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Colors } from "@/constants/theme";
import {
    TASK_STATUS_ORDER,
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

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { tasks, setTaskStatus, toggleTask, moveTaskToTrash } = useTodos();
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() =>
    toDateOnlyString(new Date()),
  );

  const monthDays = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ label: number | null; value?: string }> = [];

    for (let index = 0; index < startOffset; index += 1) {
      cells.push({ label: null });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      cells.push({ label: day, value: toDateOnlyString(date) });
    }

    while (cells.length % 7 !== 0) {
      cells.push({ label: null });
    }

    return cells;
  }, [monthCursor]);

  const tasksForSelectedDate = useMemo(
    () =>
      tasks.filter(
        (task) => task.status !== "trashed" && task.dueDate === selectedDate,
      ),
    [selectedDate, tasks],
  );

  const totals = useMemo(
    () => ({
      todo: tasks.filter((task) => task.status === "todo").length,
      in_progress: tasks.filter((task) => task.status === "in_progress").length,
      done: tasks.filter((task) => task.status === "done").length,
      submitted: tasks.filter((task) => task.status === "submitted").length,
    }),
    [tasks],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Calendar</Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          Plan dates, track progress, and trigger reminders
        </Text>
      </View>

      <View style={styles.summaryRow}>
        {TASK_STATUS_ORDER.map((status) => (
          <View
            key={status}
            style={[
              styles.summaryCard,
              { borderColor: colors.icon, backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {totals[status]}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.icon }]}>
              {STATUS_LABELS[status]}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.monthCard,
          { backgroundColor: colors.background, borderColor: colors.icon },
        ]}
      >
        <View style={styles.monthHeader}>
          <TouchableOpacity
            style={[styles.monthButton, { borderColor: colors.icon }]}
            onPress={() =>
              setMonthCursor(
                (current) =>
                  new Date(current.getFullYear(), current.getMonth() - 1, 1),
              )
            }
          >
            <Text style={[styles.monthButtonText, { color: colors.text }]}>
              Prev
            </Text>
          </TouchableOpacity>

          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {monthCursor.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </Text>

          <TouchableOpacity
            style={[styles.monthButton, { borderColor: colors.icon }]}
            onPress={() =>
              setMonthCursor(
                (current) =>
                  new Date(current.getFullYear(), current.getMonth() + 1, 1),
              )
            }
          >
            <Text style={[styles.monthButtonText, { color: colors.text }]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Text key={day} style={[styles.weekLabel, { color: colors.icon }]}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {monthDays.map((day, index) => {
            if (!day.label || !day.value) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const isSelected = selectedDate === day.value;
            const tasksCount = tasks.filter(
              (task) => task.dueDate === day.value && task.status !== "trashed",
            ).length;

            return (
              <TouchableOpacity
                key={day.value}
                style={[
                  styles.dayCell,
                  { borderColor: colors.icon },
                  isSelected && {
                    backgroundColor: colors.tint,
                    borderColor: colors.tint,
                  },
                ]}
                onPress={() => setSelectedDate(day.value as string)}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    { color: isSelected ? "#fff" : colors.text },
                  ]}
                >
                  {day.label}
                </Text>
                {tasksCount > 0 ? (
                  <View
                    style={[
                      styles.dayBadge,
                      {
                        backgroundColor: isSelected
                          ? "rgba(255,255,255,0.28)"
                          : colors.tint,
                      },
                    ]}
                  >
                    <Text style={styles.dayBadgeText}>{tasksCount}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.selectedDateRow}>
          <Text style={[styles.selectedDateLabel, { color: colors.text }]}>
            {formatDayTitle(selectedDate)}
          </Text>
          <TouchableOpacity
            onPress={() => setSelectedDate(toDateOnlyString(new Date()))}
          >
            <Text style={[styles.selectedDateAction, { color: colors.tint }]}>
              Today
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {tasksForSelectedDate.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No tasks on this day
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>
            Pick a date with a due task or create one from the Todos tab.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasksForSelectedDate}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
              <View style={styles.taskCopy}>
                <Text style={[styles.taskText, { color: colors.text }]}>
                  {item.text}
                </Text>
                <Text style={[styles.metaText, { color: colors.icon }]}>
                  {STATUS_LABELS[item.status as Exclude<TodoStatus, "trashed">]}{" "}
                  · {item.priority}
                </Text>
                <Text style={[styles.metaText, { color: colors.icon }]}>
                  Created {formatDate(item.createdAt)}
                </Text>
                {item.reminderAt ? (
                  <Text style={[styles.metaText, { color: colors.icon }]}>
                    Alarm {formatDateTime(item.reminderAt)}
                  </Text>
                ) : null}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.tint },
                  ]}
                  onPress={() => toggleTask(item.id)}
                >
                  <Text style={styles.actionText}>Next</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: colors.tint },
                  ]}
                  onPress={() =>
                    setTaskStatus(
                      item.id,
                      item.status === "done" ? "todo" : "done",
                    )
                  }
                >
                  <Text style={styles.actionText}>Done</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    { backgroundColor: colors.icon },
                  ]}
                  onPress={() => moveTaskToTrash(item.id)}
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

function toDateOnlyString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDayTitle(value: string) {
  const parsed = new Date(`${value}T12:00:00`);

  return parsed.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
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
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
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
  monthCard: {
    borderWidth: 1,
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 14,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  monthButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  monthButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayCell: {
    width: "13.1%",
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: "700",
  },
  dayBadge: {
    marginTop: 6,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  dayBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  selectedDateRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedDateLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  selectedDateAction: {
    fontSize: 14,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  taskCard: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontWeight: "700",
    marginBottom: 4,
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
    padding: 20,
    minHeight: 220,
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
