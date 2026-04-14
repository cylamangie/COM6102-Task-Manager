import TaskCard from "./TaskCard";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { Task, TaskStatus, TaskPriority } from "../types";

interface TaskColumnProps {
  title: string;
  statusKey: TaskStatus;
  items: Task[];
  onTitleEdit?: (taskId: number, newTitle: string) => void;
  onDescriptionEdit?: (taskId: number, newDescription: string) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (taskId: number, nextStatus: TaskStatus) => void;
  onPriorityChange: (taskId: number, nextPriority: TaskPriority) => void;
  droppableId: string;
  onColumnDoubleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  localNewTask?: { title: string; description: string; priority: TaskPriority };
  onLocalTaskChange?: (
    task:
      | { title: string; description: string; priority: TaskPriority }
      | undefined,
  ) => void;
  onLocalTaskConfirm?: (task: {
    title: string;
    description: string;
    priority: TaskPriority;
  }) => void;
}

const TaskColumn = ({
  title,
  statusKey,
  items,
  onTitleEdit,
  onDescriptionEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  droppableId,
  onColumnDoubleClick,
  localNewTask,
  onLocalTaskChange,
  onLocalTaskConfirm,
}: TaskColumnProps) => {
  return (
    <Droppable droppableId={statusKey}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={
            `rounded-2xl p-5 min-h-105 shadow-xl border border-zinc-200 dark:border-zinc-700 ` +
            (statusKey === "todo"
              ? "bg-linear-to-b from-amber-50 to-yellow-100 dark:from-zinc-800 dark:to-zinc-700/80"
              : statusKey === "in-progress"
                ? "bg-linear-to-b from-yellow-50 to-yellow-200 dark:from-blue-900 dark:to-blue-800/80"
                : "bg-linear-to-b from-emerald-50 to-emerald-100 dark:from-emerald-800 dark:to-emerald-700/80")
          }
          onDoubleClick={onColumnDoubleClick}
          style={{ cursor: onColumnDoubleClick ? "pointer" : undefined }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
              {title}
            </h2>
            <span className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-full px-3 py-1 text-xs font-bold shadow">
              {items.length}
            </span>
          </div>
          {localNewTask && (
            <div
              tabIndex={-1}
              onBlur={(e) => {
                // Only dismiss if focus truly leaves the card and all its children (including dropdowns)
                const next = e.relatedTarget as Node | null;
                if (!next || !e.currentTarget.contains(next)) {
                  onLocalTaskChange?.(undefined);
                }
              }}
            >
              <TaskCard
                task={{
                  id: -1,
                  title: localNewTask.title,
                  description: localNewTask.description,
                  status: "todo",
                  priority: localNewTask.priority,
                  updated_at: new Date().toISOString(),
                }}
                onTitleEdit={(_, newTitle, e) => {
                  // If Enter pressed, create task
                  if (
                    e &&
                    e.type === "keydown" &&
                    (e as React.KeyboardEvent).key === "Enter" &&
                    newTitle.trim()
                  ) {
                    onLocalTaskConfirm?.({ ...localNewTask, title: newTitle });
                  }
                }}
                onDescriptionEdit={(_, newDesc, e) => {
                  // If Enter pressed (without Shift), create task
                  if (
                    e &&
                    e.type === "keydown" &&
                    (e as React.KeyboardEvent).key === "Enter" &&
                    !(e as React.KeyboardEvent).shiftKey &&
                    localNewTask.title.trim()
                  ) {
                    onLocalTaskConfirm?.({
                      ...localNewTask,
                      description: newDesc,
                    });
                  } else {
                    onLocalTaskChange?.({
                      ...localNewTask,
                      description: newDesc,
                    });
                  }
                }}
                onStatusChange={() => {}}
                onPriorityChange={(_, newPriority) => {
                  onLocalTaskChange?.({
                    ...localNewTask,
                    priority: newPriority,
                  });
                }}
                forceEditMode
                onEditTitleInput={(value) =>
                  onLocalTaskChange?.({ ...localNewTask, title: value })
                }
                onEditDescInput={(value) =>
                  onLocalTaskChange?.({ ...localNewTask, description: value })
                }
              />
            </div>
          )}
          {items.map((task, idx) => (
            <Draggable
              key={task.id}
              draggableId={task.id.toString()}
              index={idx}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <TaskCard
                    task={task}
                    onTitleEdit={onTitleEdit!}
                    onDescriptionEdit={onDescriptionEdit!}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    onPriorityChange={onPriorityChange}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default TaskColumn;
