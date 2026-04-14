import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  ResponderProvided,
} from "@hello-pangea/dnd";
import type React from "react";
import io from "socket.io-client";
import TaskColumn from "./components/TaskColumn";
import type { Task, TaskStatus, TaskPriority } from "./types";

const socket = io();

const statusValues: TaskStatus[] = ["todo", "in-progress", "done"];
const priorityValues: TaskPriority[] = ["low", "medium", "high"];

const isTaskStatus = (value: string): value is TaskStatus => {
  return statusValues.includes(value as TaskStatus);
};

const isTaskPriority = (value: string): value is TaskPriority => {
  return priorityValues.includes(value as TaskPriority);
};

function App() {
  const updateTaskDescription = async (
    taskId: number,
    newDescription: string,
  ) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: newDescription }),
    });
    if (!response.ok) {
      window.alert("Failed to update task description");
      return;
    }
    // Optimistically update local state
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, description: newDescription } : task,
      ),
    );
  };
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const boardId = 1;

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch(`/api/boards/${boardId}/tasks`);
      const responseTasks = (await response.json()) as Task[];
      setTasks(responseTasks);
    };

    void fetchTasks();

    socket.on("taskCreated", (task: Task) => {
      setTasks((previousTasks) => [task, ...previousTasks]);
    });

    socket.on("taskDeleted", (deletedTaskId: number) => {
      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== deletedTaskId),
      );
    });

    socket.on("taskUpdated", (updatedTask: Task) => {
      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task,
        ),
      );
    });

    return () => {
      socket.off("taskCreated");
      socket.off("taskDeleted");
      socket.off("taskUpdated");
    };
  }, [boardId]);

  const addTask = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTask.trim()) {
      return;
    }
    const response = await fetch(`/api/boards/${boardId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTask,
        description: newDescription,
        priority: newPriority,
      }),
    });
    if (response.ok) {
      setNewTask("");
      setNewDescription("");
      setNewPriority("medium");
    }
  };

  const deleteTask = async (taskId: number) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      window.alert("Failed to delete task");
    }
  };

  // Inline title update (no prompt)
  const updateTaskTitle = async (taskId: number, newTitle: string) => {
    if (!newTitle.trim()) return;
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    if (!response.ok) {
      window.alert("Failed to update task title");
      return;
    }
    setTasks((prev: Task[]) =>
      prev.map((task: Task) =>
        task.id === taskId ? { ...task, title: newTitle.trim() } : task,
      ),
    );
  };
  // Local new task state for To Do column (for double-click-to-add UX)
  const [localNewTask, setLocalNewTask] = useState<
    | {
        title: string;
        description: string;
        priority: TaskPriority;
      }
    | undefined
  >(undefined);

  // Handler for double-clicking whitespace in To Do column
  const handleTodoColumnDoubleClick = () => {
    if (!localNewTask) {
      setLocalNewTask({
        title: "New Task",
        description: "",
        priority: "medium",
      });
    }
  };

  // Handler for confirming the local new task (send to backend)
  const handleLocalTaskConfirm = async (task: {
    title: string;
    description: string;
    priority: TaskPriority;
  }) => {
    if (!task.title.trim()) return;
    const response = await fetch(`/api/boards/${boardId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        priority: task.priority,
      }),
    });
    if (response.ok) {
      setLocalNewTask(undefined);
    } else {
      window.alert("Failed to add task");
    }
  };

  const updateStatus = async (taskId: number, nextStatus: TaskStatus) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!response.ok) {
      alert("Failed to update status");
    }
  };

  const updatePriority = async (taskId: number, nextPriority: TaskPriority) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: nextPriority }),
    });

    if (!response.ok) {
      alert("Failed to update priority");
    }
  };

  const groupedTasks: Record<TaskStatus, Task[]> = {
    todo: tasks.filter((task: Task) => task.status === "todo"),
    "in-progress": tasks.filter((task: Task) => task.status === "in-progress"),
    done: tasks.filter((task: Task) => task.status === "done"),
  };

  // No dynamic style functions needed; use Tailwind dark: classes in components

  // Drag and drop handlers
  const onDragEnd = (result: DropResult, provided?: ResponderProvided) => {
    const { source, destination, draggableId } = result;
    if (!destination) {
      if (provided && result.reason === "CANCEL") {
        provided.announce &&
          provided.announce(
            "Drag cancelled. Item returned to original position.",
          );
      }
      return;
    }
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;
    // Find the task
    const taskId = Number(draggableId);
    const task = tasks.find((t: Task) => t.id === taskId);
    if (!task) return;
    // If moved to a new column, update status
    if (source.droppableId !== destination.droppableId) {
      updateStatus(taskId, destination.droppableId as TaskStatus);
    }
    // Optionally: reorder within column (not persisted in DB)
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 to-slate-200 dark:from-zinc-900 dark:to-zinc-800 dark:bg-zinc-900 py-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 dark:bg-zinc-800/90 rounded-3xl px-8 py-10 mb-10 shadow-2xl border border-zinc-200 dark:border-zinc-700">
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 drop-shadow-lg">
            <span className="dark:text-zinc-100 text-zinc-900">COM6102</span>{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              Task Manager
            </span>
          </h1>
          <p className="mb-6 text-zinc-500 text-lg font-medium">
            Real-time collaborative Kanban board (Board {boardId})
          </p>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(["todo", "in-progress", "done"] as TaskStatus[]).map(
              (statusKey) => (
                <TaskColumn
                  key={statusKey}
                  title={
                    statusKey === "todo"
                      ? "To Do"
                      : statusKey === "in-progress"
                        ? "In Progress"
                        : "Done"
                  }
                  statusKey={statusKey}
                  items={groupedTasks[statusKey]}
                  // onEdit prop removed
                  onTitleEdit={updateTaskTitle}
                  onDescriptionEdit={updateTaskDescription}
                  onDelete={deleteTask}
                  onStatusChange={updateStatus}
                  onPriorityChange={updatePriority}
                  droppableId={statusKey}
                  onColumnDoubleClick={
                    statusKey === "todo"
                      ? handleTodoColumnDoubleClick
                      : undefined
                  }
                  localNewTask={statusKey === "todo" ? localNewTask : undefined}
                  onLocalTaskChange={
                    statusKey === "todo" ? setLocalNewTask : undefined
                  }
                  onLocalTaskConfirm={
                    statusKey === "todo" ? handleLocalTaskConfirm : undefined
                  }
                />
              ),
            )}
          </div>
        </DragDropContext>
        <p className="mt-8 text-zinc-400 italic text-center">
          Double-click whitespace in To Do column to add a new task. Task is
          only sent to backend when confirmed.
        </p>
      </div>
    </div>
  );
}

export default App;
