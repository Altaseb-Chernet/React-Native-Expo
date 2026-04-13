import { Audio } from "expo-av";
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Alert } from "react-native";

export type TodoStatus =
  | "todo"
  | "in_progress"
  | "done"
  | "submitted"
  | "trashed";
export type TodoPriority = "low" | "medium" | "high";

export const TASK_STATUS_ORDER: Array<Exclude<TodoStatus, "trashed">> = [
  "todo",
  "in_progress",
  "done",
  "submitted",
];

const DEFAULT_PRIORITY: TodoPriority = "medium";
const ALARM_SOUND = require("../assets/sounds/alarm.wav");

export type Todo = {
  id: string;
  text: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: string | null;
  reminderAt?: string | null;
  alarmTriggeredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  previousStatus?: Exclude<TodoStatus, "trashed"> | null;
};

type TodoDraft = {
  status?: Exclude<TodoStatus, "trashed">;
  priority?: TodoPriority;
  dueDate?: string | null;
  reminderAt?: string | null;
};

type TodoUpdates = Partial<
  Pick<Todo, "text" | "status" | "priority" | "dueDate" | "reminderAt">
>;

type TodoContextValue = {
  tasks: Todo[];
  todos: Todo[];
  inProgressTasks: Todo[];
  doneTasks: Todo[];
  submittedTasks: Todo[];
  activeTasks: Todo[];
  completedTasks: Todo[];
  trashedTasks: Todo[];
  addTask: (text: string, draft?: TodoDraft) => void;
  updateTask: (id: string, updates: TodoUpdates) => void;
  toggleTask: (id: string) => void;
  setTaskStatus: (id: string, status: Exclude<TodoStatus, "trashed">) => void;
  moveTaskToTrash: (id: string) => void;
  restoreTask: (id: string) => void;
  deleteTaskForever: (id: string) => void;
};

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

function getNextStatus(status: Exclude<TodoStatus, "trashed">) {
  const currentIndex = TASK_STATUS_ORDER.indexOf(status);
  return TASK_STATUS_ORDER[(currentIndex + 1) % TASK_STATUS_ORDER.length];
}

function normalizeDateTime(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function normalizeDateOnly(value?: string | null) {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function playAlarmSound() {
  const sound = new Audio.Sound();
  await sound.loadAsync(ALARM_SOUND, { shouldPlay: true, volume: 1 });
  await sound.playAsync();
  return sound;
}

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Todo[]>([]);
  const alarmTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );
  const playingSoundRef = useRef<Audio.Sound | null>(null);

  const clearAlarmTimers = () => {
    Object.values(alarmTimersRef.current).forEach((timerId) => {
      clearTimeout(timerId);
    });

    alarmTimersRef.current = {};
  };

  const triggerAlarm = async (task: Todo) => {
    try {
      if (playingSoundRef.current) {
        await playingSoundRef.current.unloadAsync().catch(() => undefined);
        playingSoundRef.current = null;
      }

      playingSoundRef.current = await playAlarmSound();
    } catch {
      playingSoundRef.current = null;
    } finally {
      Alert.alert("Task alarm", `${task.text} is due now.`);

      setTasks((prev) =>
        prev.map((currentTask) =>
          currentTask.id === task.id
            ? {
                ...currentTask,
                alarmTriggeredAt: currentTask.reminderAt,
                updatedAt: new Date().toISOString(),
              }
            : currentTask,
        ),
      );
    }
  };

  const addTask = (text: string, draft: TodoDraft = {}) => {
    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    const reminderAt = normalizeDateTime(draft.reminderAt);
    const dueDate = normalizeDateOnly(draft.dueDate);

    const newTask: Todo = {
      id: Date.now().toString(),
      text: cleanText,
      status: draft.status ?? "todo",
      priority: draft.priority ?? DEFAULT_PRIORITY,
      dueDate,
      reminderAt,
      alarmTriggeredAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: TodoUpdates) => {
    const trimmedText = updates.text?.trim();
    const reminderAt =
      updates.reminderAt === undefined
        ? undefined
        : normalizeDateTime(updates.reminderAt);
    const dueDate =
      updates.dueDate === undefined
        ? undefined
        : normalizeDateOnly(updates.dueDate);

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) {
          return task;
        }

        return {
          ...task,
          text: trimmedText && trimmedText.length > 0 ? trimmedText : task.text,
          status:
            updates.status && updates.status !== "trashed"
              ? updates.status
              : task.status,
          priority: updates.priority ?? task.priority,
          dueDate: dueDate === undefined ? task.dueDate : dueDate,
          reminderAt: reminderAt === undefined ? task.reminderAt : reminderAt,
          alarmTriggeredAt:
            reminderAt !== undefined && reminderAt !== task.reminderAt
              ? null
              : task.alarmTriggeredAt,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id && task.status !== "trashed"
          ? {
              ...task,
              status: getNextStatus(task.status),
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  };

  const setTaskStatus = (
    id: string,
    status: Exclude<TodoStatus, "trashed">,
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
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
              previousStatus:
                task.status === "trashed" ? task.previousStatus : task.status,
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
              status: task.previousStatus ?? "todo",
              previousStatus: null,
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

  useEffect(() => {
    clearAlarmTimers();

    const now = Date.now();

    tasks.forEach((task) => {
      if (task.status === "trashed" || !task.reminderAt) {
        return;
      }

      if (task.alarmTriggeredAt === task.reminderAt) {
        return;
      }

      const reminderTime = new Date(task.reminderAt).getTime();

      if (Number.isNaN(reminderTime)) {
        return;
      }

      const delay = reminderTime - now;

      if (delay <= 0) {
        void triggerAlarm(task);
        return;
      }

      alarmTimersRef.current[task.id] = setTimeout(() => {
        void triggerAlarm(task);
      }, delay);
    });

    return () => {
      clearAlarmTimers();
    };
  }, [tasks]);

  const todos = useMemo(
    () => tasks.filter((task) => task.status === "todo"),
    [tasks],
  );

  const inProgressTasks = useMemo(
    () => tasks.filter((task) => task.status === "in_progress"),
    [tasks],
  );

  const doneTasks = useMemo(
    () => tasks.filter((task) => task.status === "done"),
    [tasks],
  );

  const submittedTasks = useMemo(
    () => tasks.filter((task) => task.status === "submitted"),
    [tasks],
  );

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.status !== "trashed"),
    [tasks],
  );

  const completedTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.status === "done" || task.status === "submitted",
      ),
    [tasks],
  );

  const trashedTasks = useMemo(
    () => tasks.filter((task) => task.status === "trashed"),
    [tasks],
  );

  const value = useMemo(
    () => ({
      tasks,
      todos,
      inProgressTasks,
      doneTasks,
      submittedTasks,
      activeTasks,
      completedTasks,
      trashedTasks,
      addTask,
      updateTask,
      toggleTask,
      setTaskStatus,
      moveTaskToTrash,
      restoreTask,
      deleteTaskForever,
    }),
    [
      tasks,
      todos,
      inProgressTasks,
      doneTasks,
      submittedTasks,
      activeTasks,
      completedTasks,
      trashedTasks,
    ],
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
