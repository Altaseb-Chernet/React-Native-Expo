import React, { createContext, useContext, useMemo, useState } from "react";

export type TodoStatus = "active" | "completed" | "trashed";

export type Todo = {
  id: string;
  text: string;
  status: TodoStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

type TodoContextValue = {
  tasks: Todo[];
  activeTasks: Todo[];
  completedTasks: Todo[];
  trashedTasks: Todo[];
  addTask: (text: string) => void;
  updateTask: (id: string, text: string) => void;
  toggleTask: (id: string) => void;
  moveTaskToTrash: (id: string) => void;
  restoreTask: (id: string) => void;
  deleteTaskForever: (id: string) => void;
};

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Todo[]>([]);

  const addTask = (text: string) => {
    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    const newTask: Todo = {
      id: Date.now().toString(),
      text: cleanText,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, text: string) => {
    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, text: cleanText, updatedAt: new Date().toISOString() } : task,
      ),
    );
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: task.status === "completed" ? "active" : "completed",
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  };

  const moveTaskToTrash = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: "trashed",
              deletedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  };

  const restoreTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: "active",
              deletedAt: null,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  };

  const deleteTaskForever = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.status === "active"),
    [tasks],
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === "completed"),
    [tasks],
  );

  const trashedTasks = useMemo(
    () => tasks.filter((task) => task.status === "trashed"),
    [tasks],
  );

  const value = useMemo(
    () => ({
      tasks,
      activeTasks,
      completedTasks,
      trashedTasks,
      addTask,
      updateTask,
      toggleTask,
      moveTaskToTrash,
      restoreTask,
      deleteTaskForever,
    }),
    [tasks, activeTasks, completedTasks, trashedTasks],
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodos() {
  const context = useContext(TodoContext);

  if (!context) {
    throw new Error("useTodos must be used within a TodoProvider");
  }

  return context;
}
