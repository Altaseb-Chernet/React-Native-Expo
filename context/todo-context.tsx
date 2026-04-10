import React, { createContext, useContext, useMemo, useState } from "react";

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
};

type TodoContextValue = {
  tasks: Todo[];
  addTask: (text: string) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
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
      completed: false,
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const value = useMemo(
    () => ({
      tasks,
      addTask,
      deleteTask,
      toggleTask,
    }),
    [tasks],
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
