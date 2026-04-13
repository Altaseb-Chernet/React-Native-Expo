import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type DatePickerModalProps = {
  visible: boolean;
  initialDate?: string | null;
  onClose: () => void;
  onSelect: (value: string) => void;
  onClear?: () => void;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateOnlyString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function fromDateOnlyString(value?: string | null) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map((entry) => Number(entry));

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function DatePickerModal({
  visible,
  initialDate,
  onClose,
  onSelect,
  onClear,
}: DatePickerModalProps) {
  const [monthCursor, setMonthCursor] = useState(() => {
    const initial = fromDateOnlyString(initialDate);
    return initial ?? new Date();
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(
    initialDate ?? null,
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    const initial = fromDateOnlyString(initialDate);
    setMonthCursor(initial ?? new Date());
    setSelectedDate(initialDate ?? null);
  }, [initialDate, visible]);

  const days = useMemo(() => {
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

  const handleSelect = () => {
    if (!selectedDate) {
      return;
    }

    onSelect(selectedDate);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => undefined}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Pick a date</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.monthRow}>
            <TouchableOpacity
              style={styles.monthButton}
              onPress={() =>
                setMonthCursor(
                  (current) =>
                    new Date(current.getFullYear(), current.getMonth() - 1, 1),
                )
              }
            >
              <Text style={styles.monthButtonText}>Prev</Text>
            </TouchableOpacity>

            <Text style={styles.monthLabel}>{getMonthLabel(monthCursor)}</Text>

            <TouchableOpacity
              style={styles.monthButton}
              onPress={() =>
                setMonthCursor(
                  (current) =>
                    new Date(current.getFullYear(), current.getMonth() + 1, 1),
                )
              }
            >
              <Text style={styles.monthButtonText}>Next</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((day) => (
              <Text key={day} style={styles.weekLabel}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {days.map((day, index) => {
              if (!day.label || !day.value) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const isSelected = selectedDate === day.value;

              return (
                <TouchableOpacity
                  key={day.value}
                  style={[styles.dayCell, isSelected && styles.selectedDayCell]}
                  onPress={() => setSelectedDate(day.value)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                    ]}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setSelectedDate(toDateOnlyString(new Date()))}
            >
              <Text style={styles.secondaryButtonText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setSelectedDate(null);
                onClear?.();
              }}
            >
              <Text style={styles.secondaryButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSelect}
            >
              <Text style={styles.primaryButtonText}>
                {selectedDate ? `Use ${selectedDate}` : "Select"}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeText: {
    color: "#0a7ea4",
    fontSize: 14,
    fontWeight: "600",
  },
  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#e2e8f0",
  },
  monthButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  weekRow: {
    flexDirection: "row",
  },
  weekLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayCell: {
    width: "13.2%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#f8fafc",
  },
  selectedDayCell: {
    backgroundColor: "#0a7ea4",
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  selectedDayText: {
    color: "#fff",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#e2e8f0",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  primaryButton: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});
