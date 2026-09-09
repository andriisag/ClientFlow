import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock3,
  ListTodo,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import api from "../services/api";
import type {
  Task,
  TaskStatus,
} from "../types/task";

function formatDueDate(dueDate: string | null) {
  if (!dueDate) {
    return "No due date";
  }

  const date = new Date(dueDate);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isOverdue(
  dueDate: string | null,
  status: TaskStatus,
) {
  if (!dueDate || status === "completed") {
    return false;
  }

  return new Date(dueDate).getTime() < Date.now();
}

function Tasks() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [status, setStatus] =
    useState<TaskStatus>("pending");
  const [dueDate, setDueDate] = useState("");

  const queryClient = useQueryClient();

  const {
    data: tasks,
    isLoading,
    isError,
  } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await api.get<Task[]>("/tasks");
      return response.data;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<Task>("/tasks", {
        title,
        description: description || null,
        status,
        due_date: dueDate || null,
      });

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      closeForm();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async () => {
      if (!editingTask) {
        throw new Error("No task selected");
      }

      const response = await api.put<Task>(
        `/tasks/${editingTask.id}`,
        {
          title,
          description: description || null,
          status,
          due_date: dueDate || null,
        },
      );

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      closeForm();
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await api.delete(`/tasks/${taskId}`);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (task: Task) => {
      const newStatus: TaskStatus =
        task.status === "pending"
          ? "completed"
          : "pending";

      const response = await api.put<Task>(
        `/tasks/${task.id}`,
        {
          title: task.title,
          description: task.description,
          status: newStatus,
          due_date: task.due_date,
        },
      );

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  function resetForm() {
    setTitle("");
    setDescription("");
    setStatus("pending");
    setDueDate("");
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingTask(null);
    resetForm();
  }

  function openCreateForm() {
    setEditingTask(null);
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(task: Task) {
    setEditingTask(task);

    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);

    if (task.due_date) {
      setDueDate(task.due_date.slice(0, 16));
    } else {
      setDueDate("");
    }

    setIsFormOpen(true);
  }

  function handleDelete(task: Task) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    deleteTaskMutation.mutate(task.id);
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (editingTask) {
      updateTaskMutation.mutate();
    } else {
      createTaskMutation.mutate();
    }
  }

  function toggleTaskStatus(task: Task) {
    toggleTaskMutation.mutate(task);
  }

  const isSaving =
    createTaskMutation.isPending ||
    updateTaskMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ListTodo size={18} />
          Loading tasks...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
        Failed to load tasks. Please try again.
      </div>
    );
  }

  const pendingTasks =
    tasks?.filter(
      (task) => task.status === "pending",
    ) ?? [];

  const completedTasks =
    tasks?.filter(
      (task) => task.status === "completed",
    ) ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <ListTodo size={22} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Tasks
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your tasks and deadlines
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingTask
                  ? "Edit Task"
                  : "Add Task"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {editingTask
                  ? "Update task information"
                  : "Create a new task"}
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={19} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Follow up with client"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Task description..."
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as TaskStatus,
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="completed">
                    Completed
                  </option>
                </select>
              </div>

              {/* Due date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Due Date
                </label>

                <div className="relative">
                  <Clock3
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {(createTaskMutation.isError ||
              updateTaskMutation.isError) && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                Failed to save task. Please try again.
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingTask
                    ? "Save Changes"
                    : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
              <ListTodo size={18} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Total
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {tasks?.length ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Clock3 size={18} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Pending
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {pendingTasks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Completed
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {completedTasks.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Task columns */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Pending */}
        <section className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />

              <h2 className="text-sm font-semibold text-gray-900">
                Pending
              </h2>

              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-500 shadow-sm">
                {pendingTasks.length}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {pendingTasks.map((task) => {
              const overdue = isOverdue(
                task.due_date,
                task.status,
              );

              return (
                <div
                  key={task.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="mt-2 text-sm leading-5 text-gray-500">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      Pending
                    </span>
                  </div>

                  <div
                    className={`mt-4 flex items-center gap-2 text-sm ${
                      overdue
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    <Clock3 size={15} />

                    <span>
                      {overdue
                        ? "Overdue: "
                        : "Due: "}
                      {formatDueDate(
                        task.due_date,
                      )}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        toggleTaskStatus(task)
                      }
                      disabled={
                        toggleTaskMutation.isPending
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 transition hover:text-emerald-700 disabled:opacity-50"
                    >
                      <Check size={15} />
                      Mark completed
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(task)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(task)
                        }
                        disabled={
                          deleteTaskMutation.isPending
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {pendingTasks.length === 0 && (
              <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white/50 px-5 text-center">
                <CheckCircle2
                  size={28}
                  className="text-emerald-400"
                />

                <p className="mt-3 text-sm font-medium text-gray-500">
                  No pending tasks
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  You're all caught up.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Completed */}
        <section className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

              <h2 className="text-sm font-semibold text-gray-900">
                Completed
              </h2>

              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-500 shadow-sm">
                {completedTasks.length}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-700 line-through decoration-gray-300">
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="mt-2 text-sm leading-5 text-gray-400">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Completed
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                  <Clock3 size={15} />

                  <span>
                    {formatDueDate(task.due_date)}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      toggleTaskStatus(task)
                    }
                    disabled={
                      toggleTaskMutation.isPending
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 transition hover:text-amber-700 disabled:opacity-50"
                  >
                    <Clock3 size={15} />
                    Mark pending
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(task)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(task)
                      }
                      disabled={
                        deleteTaskMutation.isPending
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {completedTasks.length === 0 && (
              <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white/50 px-5 text-center">
                <ListTodo
                  size={28}
                  className="text-gray-300"
                />

                <p className="mt-3 text-sm font-medium text-gray-500">
                  No completed tasks
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Completed tasks will appear here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Tasks;

