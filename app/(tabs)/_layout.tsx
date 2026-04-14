import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useTodos } from "@/context/todo-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { tasks } = useTodos();

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const inboxCount = tasks.filter(
    (task) => task.status === "todo" || task.status === "in_progress",
  ).length;

  const todayCount = tasks.filter(
    (task) => task.status !== "trashed" && task.dueDate === todayKey,
  ).length;

  const trashCount = tasks.filter((task) => task.status === "trashed").length;

  const formatBadge = (count: number) => (count > 99 ? "99+" : count);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.icon,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBadgeStyle: {
          backgroundColor: colors.tint,
          color: "#fff",
          fontSize: 10,
          fontWeight: "700",
        },
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 14,
          height: 72,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          borderRadius: 24,
          overflow: "hidden",
          ...(Platform.OS === "android"
            ? { elevation: 10 }
            : {
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 22,
                shadowOffset: { width: 0, height: 10 },
              }),
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tasks",
          tabBarBadge: inboxCount > 0 ? formatBadge(inboxCount) : undefined,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="checkmark.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Calendar",
          tabBarBadge: todayCount > 0 ? formatBadge(todayCount) : undefined,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trash"
        options={{
          title: "Trash",
          tabBarBadge: trashCount > 0 ? formatBadge(trashCount) : undefined,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="trash.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
