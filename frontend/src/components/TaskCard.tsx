import React, { useState, useRef, useEffect } from "react";
import type { Task, TaskStatus, TaskPriority } from "../types";
import Chip from "../components/ui/Chip";

interface TaskCardProps {
  task: Task;
  onTitleEdit: (
    taskId: number,
    newTitle: string,
    e?: React.KeyboardEvent | React.ChangeEvent,
  ) => void;
  onDescriptionEdit: (
    taskId: number,
    newDescription: string,
    e?: React.KeyboardEvent | React.ChangeEvent,
  ) => void;
  onDelete?: (taskId: number) => void;
  onStatusChange: (taskId: number, nextStatus: TaskStatus) => void;
  onPriorityChange: (taskId: number, nextPriority: TaskPriority) => void;
  forceEditMode?: boolean;
  onEditTitleInput?: (value: string) => void;
  onEditDescInput?: (value: string) => void;
}

const TaskCard = ({
  task,
  onTitleEdit,
  onDescriptionEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  forceEditMode = false,
  onEditTitleInput,
  onEditDescInput,
}: TaskCardProps) => {
  // Badge color logic
  const statusBadge = {
    todo: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
    "in-progress":
      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100",
    done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100",
  }[task.status as TaskStatus];

  const priorityBadge = {
    low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
    high: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-100",
  }[task.priority as TaskPriority];

  // Priority dropdown state
  const [priorityOpen, setPriorityOpen] = useState(false);
  let closeTimeout: ReturnType<typeof setTimeout> | null = null;
  const priorityOptions: TaskPriority[] = ["low", "medium", "high"];
  const handlePrioritySelect = (priority: TaskPriority) => {
    setPriorityOpen(false);
    if (priority !== task.priority) {
      onPriorityChange(task.id, priority);
    }
  };

  // Inline title editing state
  const [editingTitle, setEditingTitle] = useState(forceEditMode);
  const [titleInput, setTitleInput] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Inline description editing state
  const [editingDesc, setEditingDesc] = useState(forceEditMode);
  const [descInput, setDescInput] = useState(task.description || "");
  const descRef = useRef<HTMLTextAreaElement>(null);

  // Focus input when editing
  useEffect(() => {
    if (editingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
    if (editingDesc && descRef.current) {
      descRef.current.focus();
      descRef.current.select();
    }
  }, [editingTitle, editingDesc]);

  const handleTitleDoubleClick = () => {
    setTitleInput(task.title);
    setEditingTitle(true);
  };
  const handleDescDoubleClick = () => {
    setDescInput(task.description || "");
    setEditingDesc(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleInput(e.target.value);
    if (onEditTitleInput) onEditTitleInput(e.target.value);
  };
  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescInput(e.target.value);
    if (onEditDescInput) onEditDescInput(e.target.value);
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
    setTitleInput(task.title);
  };
  const handleDescBlur = () => {
    setEditingDesc(false);
    setDescInput(task.description || "");
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (titleInput.trim()) {
        onTitleEdit(task.id, titleInput.trim(), e);
      }
      setEditingTitle(false);
      if (inputRef.current) inputRef.current.blur();
    } else if (e.key === "Escape") {
      setEditingTitle(false);
      setTitleInput(task.title);
    }
  };
  const handleDescKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onDescriptionEdit(task.id, descInput.trim(), e);
      setEditingDesc(false);
      if (descRef.current) descRef.current.blur();
    } else if (e.key === "Escape") {
      setEditingDesc(false);
      setDescInput(task.description || "");
    }
  };

  return (
    <div
      className="relative rounded-2xl p-6 border border-indigo-400/60 dark:border-indigo-300/30 bg-white/70 dark:bg-zinc-900/70 shadow-xl flex flex-col gap-3 backdrop-blur-md transition-transform hover:-translate-y-1 hover:shadow-2xl group" // removed overflow-hidden
      style={{
        boxShadow: "0 4px 32px 0 rgba(80, 80, 180, 0.10)",
        overflow: "visible",
      }}
    >
      {/* Accent border overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl border-2 border-transparent group-hover:border-indigo-500/80 transition-all duration-200" />
      <h3
        className="mb-1 text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 drop-shadow-sm cursor-pointer"
        onDoubleClick={handleTitleDoubleClick}
      >
        {editingTitle ? (
          <input
            ref={inputRef}
            className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 border border-indigo-300 rounded px-2 py-1 w-full outline-none"
            value={titleInput}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            maxLength={200}
          />
        ) : (
          task.title
        )}
      </h3>
      <div className="flex gap-2 mb-1">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm ${statusBadge}`}
        >
          {task.status}
        </span>
        <span
          className="relative priority-badge-wrapper"
          onMouseEnter={() => {
            if (closeTimeout) clearTimeout(closeTimeout);
            setPriorityOpen(true);
          }}
          onMouseLeave={() => {
            closeTimeout = setTimeout(() => setPriorityOpen(false), 120);
          }}
          tabIndex={0}
          onFocus={() => setPriorityOpen(true)}
          onBlur={() => setPriorityOpen(false)}
        >
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm cursor-pointer ${priorityBadge}`}
            aria-label="Change priority"
          >
            {task.priority}
          </span>
          {priorityOpen && (
            <div
              className="absolute z-30 left-1/2 -translate-x-1/2 mt-2 flex gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg px-2 py-1"
              style={{ minWidth: "max-content" }}
              onMouseEnter={() => {
                if (closeTimeout) clearTimeout(closeTimeout);
                setPriorityOpen(true);
              }}
              onMouseLeave={() => {
                closeTimeout = setTimeout(() => setPriorityOpen(false), 120);
              }}
            >
              {priorityOptions.map((option) => (
                <span
                  key={option}
                  className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm cursor-pointer transition-colors duration-150 ${
                    option === "low"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100"
                      : option === "medium"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-100"
                  } ${option === task.priority ? "ring-2 ring-indigo-400 scale-105" : "opacity-80 hover:opacity-100"}`}
                  onMouseDown={() => handlePrioritySelect(option)}
                  tabIndex={0}
                  aria-label={`Set priority to ${option}`}
                >
                  {option}
                </span>
              ))}
            </div>
          )}
        </span>
      </div>
      <div
        className="mb-2 text-zinc-500 dark:text-zinc-400 text-sm italic cursor-pointer"
        onDoubleClick={handleDescDoubleClick}
      >
        {editingDesc ? (
          <textarea
            ref={descRef}
            className="w-full rounded border border-indigo-200 bg-white dark:bg-zinc-900 px-2 py-1 text-sm text-zinc-700 dark:text-zinc-100 outline-none"
            value={descInput}
            onChange={handleDescChange}
            onBlur={handleDescBlur}
            onKeyDown={handleDescKeyDown}
            rows={2}
            maxLength={500}
            placeholder="Add a description..."
          />
        ) : task.description && task.description.trim() ? (
          task.description
        ) : (
          <span className="text-zinc-300 dark:text-zinc-600 italic">
            Double-click to add description
          </span>
        )}
      </div>
      {/* Status selection removed: status is changed by drag-and-drop only */}
      <p className="mt-2 text-xs text-zinc-400">
        Updated: {new Date(task.updated_at).toLocaleString()}
      </p>
      {/* Delete button in top-right corner */}
      {onDelete && (
        <div className="absolute top-2 right-2 flex gap-1 z-20">
          <button
            onClick={() => onDelete(task.id)}
            className="w-7 h-7 flex items-center justify-center bg-rose-100 text-rose-600 rounded-full font-bold text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 focus:opacity-100 focus:ring-2 focus:ring-rose-400 border border-rose-200 hover:bg-rose-200 hover:text-rose-700"
            title="Delete"
            aria-label="Delete"
            tabIndex={0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
