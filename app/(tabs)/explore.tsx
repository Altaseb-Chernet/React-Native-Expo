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
import { type Todo, type TodoStatus, useTodos } from "@/context/todo-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ViewMode = "month" | "agenda";
type ColorPalette = (typeof Colors)["light"];

const STATUS_LABELS: Record<Exclude<TodoStatus, "trashed">, string> = {
  todo: "Todo",
  in_progress: "Doing",
  done: "Done",
  submitted: "Submitted",
};

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { tasks, updateTask, moveTaskToTrash } = useTodos();

  const [mode, setMode] = useState<ViewMode>("month");
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() =>
    toDateOnlyString(new Date()),
  );

  const visibleTasks = useMemo(
    () => tasks.filter((task) => task.status !== "trashed"),
    [tasks],
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

  const selectedDateTasks = useMemo(
    () => visibleTasks.filter((task) => task.dueDate === selectedDate),
    [selectedDate, visibleTasks],
  );

  const agendaTasks = useMemo(
    () =>
      [...visibleTasks]
        .filter((task) => task.dueDate)
        .sort((left, right) => {
          if (!left.dueDate || !right.dueDate) {
            return 0;
          }

          return left.dueDate.localeCompare(right.dueDate);
        }),
    [visibleTasks],
  );

  const monthCounts = useMemo(() => {
    return monthDays.reduce<Record<string, number>>((counts, day) => {
      if (!day.value) {
        return counts;
      }

      counts[day.value] = visibleTasks.filter(
        (task) => task.dueDate === day.value,
      ).length;
      return counts;
    }, {});
  }, [monthDays, visibleTasks]);

  const totals = useMemo(
    () => ({
      todo: visibleTasks.filter((task) => task.status === "todo").length,
      in_progress: visibleTasks.filter((task) => task.status === "in_progress")
        .length,
      done: visibleTasks.filter((task) => task.status === "done").length,
      submitted: visibleTasks.filter((task) => task.status === "submitted")
        .length,
    }),
    [visibleTasks],
  );

  const cycleStatus = (task: Todo) => {
    const order: Array<Exclude<TodoStatus, "trashed">> = [
      "todo",
      "in_progress",
      "done",
      "submitted",
    ];

    const currentIndex = order.indexOf(
      task.status === "trashed" ? "todo" : task.status,
    );
    const nextStatus = order[(currentIndex + 1) % order.length];

    updateTask(task.id, { status: nextStatus });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Calendar</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Month and agenda views in one place
          </Text>
        </View>

        <View style={styles.modeTabs}>
          <ModeTab
            label="Month"
            active={mode === "month"}
            onPress={() => setMode("month")}
            color={colors}
          />
          <ModeTab
            label="Agenda"
            active={mode === "agenda"}
            onPress={() => setMode("agenda")}
            color={colors}
          />
        </View>
      </View>

      <View style={styles.summaryRow}>
        <SummaryCard label="Todo" value={totals.todo} color={colors} />
        <SummaryCard label="Doing" value={totals.in_progress} color={colors} />
        <SummaryCard label="Done" value={totals.done} color={colors} />
        <SummaryCard label="Sent" value={totals.submitted} color={colors} />
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
            const count = monthCounts[day.value] ?? 0;

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
                {count > 0 ? (
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
                    <Text style={styles.dayBadgeText}>{count}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.dateRow}>
          <Text style={[styles.dateTitle, { color: colors.text }]}>
            {formatDayTitle(selectedDate)}
          </Text>
          <TouchableOpacity
            onPress={() => setSelectedDate(toDateOnlyString(new Date()))}
          >
            <Text style={[styles.todayLink, { color: colors.tint }]}>
              Today
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {mode === "month" ? (
        selectedDateTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No tasks on this day
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.icon }]}>
              Pick another date or add a new task from the Tasks tab.
            </Text>
          </View>
        ) : (
          <FlatList
            data={selectedDateTasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <CalendarTaskCard
                item={item}
                color={colors}
                onCycle={cycleStatus}
                onTrash={moveTaskToTrash}
              />
            )}
          />
        )
      ) : agendaTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No agenda items
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>
            Add due dates to tasks and they will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={agendaTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <AgendaTaskCard
              item={item}
              color={colors}
              onCycle={cycleStatus}
              onTrash={moveTaskToTrash}
            />
          )}
        />
      )}
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

function ModeTab({
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
        styles.modeTab,
        { borderColor: color.icon },
        active && { backgroundColor: color.tint, borderColor: color.tint },
      ]}
      onPress={onPress}
    >
      <Text
        style={[styles.modeTabText, { color: active ? "#fff" : color.text }]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function CalendarTaskCard({
  item,
  color,
  onCycle,
  onTrash,
}: {
  item: Todo;
  color: ColorPalette;
  onCycle: (task: Todo) => void;
  onTrash: (id: string) => void;
}) {
  return (
    <View
      style={[
        styles.taskCard,
        { borderColor: color.icon, backgroundColor: color.background },
      ]}
    >
      <View style={styles.taskTopRow}>
        <View style={styles.taskBody}>
          <Text style={[styles.taskText, { color: color.text }]}>
            {item.text}
          </Text>
          <Text style={[styles.metaText, { color: color.icon }]}>
            {item.dueDate ? formatDateOnly(item.dueDate) : "No date"}
            {item.reminderAt ? ` · ${formatTime(item.reminderAt)}` : ""}
          </Text>
        </View>
        <Text style={styles.statusBadge}>
          {STATUS_LABELS[item.status as Exclude<TodoStatus, "trashed">]}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: color.tint }]}
          onPress={() => onCycle(item)}
        >
          <Text style={styles.actionText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: color.icon }]}
          onPress={() => onTrash(item.id)}
        >
          <Text style={styles.actionText}>Trash</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AgendaTaskCard({
  item,
  color,
  onCycle,
  onTrash,
}: {
  item: Todo;
  color: ColorPalette;
  onCycle: (task: Todo) => void;
  onTrash: (id: string) => void;
}) {
  return (
    <View
      style={[
        styles.agendaCard,
        { borderColor: color.icon, backgroundColor: color.background },
      ]}
    >
      <View style={styles.agendaLeft}>
        <Text style={[styles.agendaDate, { color: color.text }]}>
          {item.dueDate ? formatFullDate(item.dueDate) : "No date"}
        </Text>
        <Text style={[styles.agendaText, { color: color.text }]}>
          {item.text}
        </Text>
        <Text style={[styles.metaText, { color: color.icon }]}>
          {STATUS_LABELS[item.status as Exclude<TodoStatus, "trashed">]} ·{" "}
          {item.priority}
        </Text>
      </View>
      <View style={styles.agendaActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: color.tint }]}
          onPress={() => onCycle(item)}
        >
          <Text style={styles.actionText}>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: color.icon }]}
          onPress={() => onTrash(item.id)}
        >
          <Text style={styles.actionText}>Trash</Text>
        </TouchableOpacity>
      </View>
    </View>
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

function formatDateOnly(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatFullDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: { fontSize: 30, fontWeight: "800" },
  subtitle: { fontSize: 14, marginTop: 4 },
  modeTabs: { flexDirection: "row", gap: 8 },
  modeTab: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modeTabText: { fontSize: 13, fontWeight: "700" },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
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
  monthTitle: { fontSize: 18, fontWeight: "800" },
  monthButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  monthButtonText: { fontSize: 13, fontWeight: "700" },
  weekRow: { flexDirection: "row", marginBottom: 8 },
  weekLabel: { flex: 1, textAlign: "center", fontSize: 12, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayCell: {
    width: "13.1%",
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: { fontSize: 13, fontWeight: "700" },
  dayBadge: {
    marginTop: 6,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  dayBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  dateRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateTitle: { fontSize: 16, fontWeight: "800" },
  todayLink: { fontSize: 14, fontWeight: "800" },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
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
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
    color: "#0f172a",
    fontSize: 11,
    fontWeight: "800",
  },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionButton: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  agendaCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  agendaLeft: { flex: 1 },
  agendaDate: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  agendaText: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  agendaActions: { justifyContent: "center", gap: 8 },
  emptyContainer: {
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontSize: 20, fontWeight: "800" },
  emptySubtext: { marginTop: 6, fontSize: 14, textAlign: "center" },
});
