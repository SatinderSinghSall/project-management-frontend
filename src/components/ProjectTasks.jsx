import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  Circle,
  Clock3,
  Filter,
  GitCommit,
  LoaderCircle,
  MessageSquare,
  RotateCcw,
  Search,
  Square,
  Trash2,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../configs/api";
import { deleteTask, updateTask } from "../features/workspaceSlice";

const TYPE_CONFIG = {
  BUG: {
    icon: Bug,
    className:
      "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20",
  },
  FEATURE: {
    icon: Zap,
    className:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20",
  },
  TASK: {
    icon: Square,
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  },
  IMPROVEMENT: {
    icon: GitCommit,
    className:
      "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20",
  },
  OTHER: {
    icon: MessageSquare,
    className:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  },
};

const PRIORITY_CONFIG = {
  LOW: {
    label: "Low",
    className:
      "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
    dot: "bg-slate-400",
  },
  MEDIUM: {
    label: "Medium",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  HIGH: {
    label: "High",
    className: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    dot: "bg-red-500",
  },
};

const STATUS_CONFIG = {
  TODO: {
    label: "To do",
    className:
      "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
    icon: Circle,
  },
  IN_PROGRESS: {
    label: "In progress",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    icon: Clock3,
  },
  DONE: {
    label: "Done",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    icon: CheckCircleIcon,
  },
};

function CheckCircleIcon(props) {
  return <CheckCheck {...props} />;
}

const getErrorMessage = (error, fallback) => {
  const message = error?.response?.data?.message || error?.message;

  if (typeof message !== "string" || !message.trim()) {
    return fallback;
  }

  // Avoid displaying raw internal server/ORM errors in the UI.
  if (/prisma|stack trace|invalid .* invocation|node_modules/i.test(message)) {
    return fallback;
  }

  return message;
};

const getSafeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = getSafeDate(value);
  return date ? format(date, "dd MMM yyyy") : "No due date";
};

const ProjectTasks = ({ tasks = [] }) => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    priority: "",
    assignee: "",
  });

  const [updatingTasks, setUpdatingTasks] = useState({});
  const [deleting, setDeleting] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const assigneeList = useMemo(() => {
    const assignees = safeTasks
      .map((task) => task.assignee?.name)
      .filter(Boolean);

    return [...new Set(assignees)].sort((a, b) => a.localeCompare(b));
  }, [safeTasks]);

  const filteredTasks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return safeTasks.filter((task) => {
      const matchesSearch =
        !query ||
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (!filters.status || task.status === filters.status) &&
        (!filters.type || task.type === filters.type) &&
        (!filters.priority || task.priority === filters.priority) &&
        (!filters.assignee || task.assignee?.name === filters.assignee)
      );
    });
  }, [safeTasks, searchTerm, filters]);

  const selectedVisibleIds = filteredTasks
    .filter((task) => selectedTasks.includes(task.id))
    .map((task) => task.id);

  const allVisibleSelected =
    filteredTasks.length > 0 &&
    filteredTasks.every((task) => selectedTasks.includes(task.id));

  const hasActiveFilters =
    Boolean(searchTerm.trim()) || Object.values(filters).some(Boolean);

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      status: "",
      type: "",
      priority: "",
      assignee: "",
    });
    setFieldErrors({});
  };

  const showError = (title, message) => {
    setErrorBanner({ title, message });
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((previous) => ({ ...previous, [name]: value }));
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const task = safeTasks.find((item) => item.id === taskId);

    if (!task || task.status === newStatus || updatingTasks[taskId]) {
      return;
    }

    setErrorBanner(null);
    setFieldErrors((previous) => {
      const next = { ...previous };
      delete next[taskId];
      return next;
    });

    setUpdatingTasks((previous) => ({ ...previous, [taskId]: true }));

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      await api.put(
        `/api/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      dispatch(updateTask({ ...task, status: newStatus }));
      toast.success("Task status updated.");
    } catch (error) {
      const message = getErrorMessage(
        error,
        "We couldn't update this task. Please try again.",
      );

      setFieldErrors((previous) => ({
        ...previous,
        [taskId]: message,
      }));

      showError("Unable to update task", message);
    } finally {
      setUpdatingTasks((previous) => {
        const next = { ...previous };
        delete next[taskId];
        return next;
      });
    }
  };

  useEffect(() => {
    if (!showDeleteModal) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showDeleteModal]);

  const handleDelete = async () => {
    if (deleting || selectedTasks.length === 0) return;

    const idsToDelete = selectedTasks.filter((id) =>
      safeTasks.some((task) => task.id === id),
    );

    if (idsToDelete.length === 0) {
      setSelectedTasks([]);
      setShowDeleteModal(false);
      return;
    }

    setDeleting(true);
    setErrorBanner(null);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      await api.post(
        "/api/tasks/delete",
        { tasksIds: idsToDelete },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      dispatch(deleteTask(idsToDelete));
      setSelectedTasks([]);
      setShowDeleteModal(false);

      toast.success(
        `${idsToDelete.length} task${
          idsToDelete.length === 1 ? "" : "s"
        } deleted successfully.`,
      );
    } catch (error) {
      const message = getErrorMessage(
        error,
        "We couldn't delete the selected tasks. Please try again.",
      );

      showError("Unable to delete tasks", message);
    } finally {
      setDeleting(false);
    }
  };

  const toggleTask = (taskId) => {
    setSelectedTasks((previous) =>
      previous.includes(taskId)
        ? previous.filter((id) => id !== taskId)
        : [...previous, taskId],
    );
  };

  const toggleVisibleTasks = () => {
    if (allVisibleSelected) {
      setSelectedTasks((previous) =>
        previous.filter((id) => !filteredTasks.some((task) => task.id === id)),
      );
    } else {
      setSelectedTasks((previous) => [
        ...new Set([...previous, ...filteredTasks.map((task) => task.id)]),
      ]);
    }
  };

  const inputClass =
    "h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-500";

  const openTask = (task) => {
    if (!task.projectId || !task.id) {
      showError(
        "Unable to open task",
        "The project or task identifier is missing.",
      );
      return;
    }

    navigate(
      `/taskDetails?projectId=${encodeURIComponent(task.projectId)}&taskId=${encodeURIComponent(task.id)}`,
    );
  };

  const renderStatusSelect = (task) => {
    const isUpdating = Boolean(updatingTasks[task.id]);

    return (
      <div className="min-w-32">
        <div className="relative">
          <select
            aria-label={`Status for ${task.title || "task"}`}
            value={task.status || "TODO"}
            disabled={isUpdating || deleting}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) =>
              handleStatusChange(task.id, event.target.value)
            }
            className={`${inputClass} h-9 appearance-none py-1 pl-2 pr-8 text-xs font-medium ${
              STATUS_CONFIG[task.status]?.className || ""
            }`}
          >
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </select>
          {isUpdating ? (
            <LoaderCircle className="pointer-events-none absolute right-2.5 top-3 size-3.5 animate-spin text-blue-500" />
          ) : (
            <ChevronDown className="pointer-events-none absolute right-2.5 top-3 size-3.5 text-slate-400" />
          )}
        </div>

        {fieldErrors[task.id] && (
          <p className="mt-1.5 max-w-48 text-xs leading-relaxed text-red-600 dark:text-red-400">
            {fieldErrors[task.id]}
          </p>
        )}
      </div>
    );
  };

  const renderTaskCard = (task) => {
    const type = TYPE_CONFIG[task.type] || TYPE_CONFIG.OTHER;
    const TypeIcon = type.icon;
    const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.LOW;
    const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
    const StatusIcon = status.icon;
    const dueDate = getSafeDate(task.due_date);
    const isOverdue =
      dueDate &&
      dueDate < new Date(new Date().setHours(0, 0, 0, 0)) &&
      task.status !== "DONE";

    return (
      <article
        key={task.id}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500/30"
      >
        <div className="flex items-start gap-3">
          <input
            aria-label={`Select ${task.title || "task"}`}
            type="checkbox"
            checked={selectedTasks.includes(task.id)}
            disabled={deleting}
            onChange={() => toggleTask(task.id)}
            className="mt-1 size-4 shrink-0 cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
          />

          <button
            type="button"
            onClick={() => openTask(task)}
            className="min-w-0 flex-1 text-left"
          >
            <h3 className="break-words text-sm font-semibold text-slate-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400">
              {task.title || "Untitled task"}
            </h3>
            {task.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                {task.description}
              </p>
            )}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${type.className}`}
          >
            <TypeIcon size={12} />
            {(task.type || "TASK").replaceAll("_", " ")}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${priority.className}`}
          >
            <span className={`size-1.5 rounded-full ${priority.dot}`} />
            {priority.label} priority
          </span>
        </div>

        <div className="mt-4 space-y-3 border-t border-slate-100 pt-3 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              Status
            </span>
            {renderStatusSelect(task)}
          </div>

          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="flex min-w-0 items-center gap-2 text-slate-500 dark:text-zinc-400">
              {task.assignee?.image ? (
                <img
                  src={task.assignee.image}
                  alt=""
                  className="size-6 shrink-0 rounded-full bg-slate-100 object-cover dark:bg-zinc-800"
                />
              ) : (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <UserRound size={13} />
                </span>
              )}
              <span className="truncate">
                {task.assignee?.name || "Unassigned"}
              </span>
            </span>

            <span
              className={`flex shrink-0 items-center gap-1 ${
                isOverdue
                  ? "font-medium text-red-600 dark:text-red-400"
                  : "text-slate-500 dark:text-zinc-400"
              }`}
            >
              <CalendarDays size={13} />
              {formatDate(task.due_date)}
            </span>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="mx-auto w-full min-w-0 max-w-[1600px] space-y-5">
      {/* Error banner */}
      {errorBanner && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
            <AlertCircle size={19} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
              {errorBanner.title}
            </h3>
            <p className="mt-1 break-words text-sm leading-relaxed text-red-700 dark:text-red-300/90">
              {errorBanner.message}
            </p>
          </div>

          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setErrorBanner(null)}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-500/20"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Summary header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Project tasks
            </h2>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
              {filteredTasks.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Manage assignments, priorities, and task progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedTasks.length > 0 && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3.5 text-sm font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/30 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Trash2 size={15} />
              Delete ({selectedTasks.length})
            </button>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              disabled={deleting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <RotateCcw size={14} />
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-zinc-200">
          <Filter size={15} />
          Filters and search
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="relative sm:col-span-2 xl:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Search tasks"
              value={searchTerm}
              disabled={deleting}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search tasks..."
              className={`${inputClass} pl-9`}
            />
          </div>

          {[
            {
              name: "status",
              label: "Status",
              options: [
                ["", "All statuses"],
                ["TODO", "To do"],
                ["IN_PROGRESS", "In progress"],
                ["DONE", "Done"],
              ],
            },
            {
              name: "type",
              label: "Type",
              options: [
                ["", "All types"],
                ["TASK", "Task"],
                ["BUG", "Bug"],
                ["FEATURE", "Feature"],
                ["IMPROVEMENT", "Improvement"],
                ["OTHER", "Other"],
              ],
            },
            {
              name: "priority",
              label: "Priority",
              options: [
                ["", "All priorities"],
                ["LOW", "Low"],
                ["MEDIUM", "Medium"],
                ["HIGH", "High"],
              ],
            },
            {
              name: "assignee",
              label: "Assignee",
              options: [
                ["", "All assignees"],
                ...assigneeList.map((name) => [name, name]),
              ],
            },
          ].map((filter) => (
            <div key={filter.name} className="relative">
              <select
                aria-label={filter.label}
                name={filter.name}
                value={filters[filter.name]}
                onChange={handleFilterChange}
                disabled={deleting}
                className={`${inputClass} appearance-none pr-8`}
              >
                {filter.options.map(([value, label]) => (
                  <option key={value || "all"} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-slate-400" />
            </div>
          ))}
        </div>

        {hasActiveFilters && (
          <p className="mt-3 text-xs text-slate-500 dark:text-zinc-400">
            Showing {filteredTasks.length} of {safeTasks.length} tasks.
          </p>
        )}
      </div>

      {/* Task list */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <CheckCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                All tasks
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                Select tasks to perform bulk actions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span className="size-2 rounded-full bg-emerald-500" />
            {safeTasks.filter((task) => task.status === "DONE").length}{" "}
            completed
            <span className="mx-1 text-slate-300 dark:text-zinc-700">•</span>
            {safeTasks.filter((task) => task.status !== "DONE").length}{" "}
            remaining
          </div>
        </div>

        {safeTasks.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
              <CheckCheck size={25} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No tasks yet
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-zinc-400">
              Create a task for this project to start organizing your work.
            </p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
              <Search size={21} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No matching tasks
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Try changing your search or filters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <RotateCcw size={14} />
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50 dark:bg-zinc-800/60">
                  <tr className="border-b border-slate-200 dark:border-zinc-800">
                    <th className="w-12 px-4 py-3.5">
                      <input
                        type="checkbox"
                        aria-label="Select all visible tasks"
                        checked={allVisibleSelected}
                        disabled={deleting}
                        onChange={toggleVisibleTasks}
                        className="size-4 rounded accent-blue-600 disabled:opacity-50"
                      />
                    </th>
                    {[
                      ["Task", "min-w-56"],
                      ["Type", "w-32"],
                      ["Priority", "w-32"],
                      ["Status", "w-40"],
                      ["Assignee", "w-44"],
                      ["Due date", "w-36"],
                    ].map(([label, width]) => (
                      <th
                        key={label}
                        className={`${width} px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredTasks.map((task) => {
                    const type = TYPE_CONFIG[task.type] || TYPE_CONFIG.OTHER;
                    const TypeIcon = type.icon;
                    const priority =
                      PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.LOW;
                    const dueDate = getSafeDate(task.due_date);
                    const isOverdue =
                      dueDate &&
                      dueDate < new Date(new Date().setHours(0, 0, 0, 0)) &&
                      task.status !== "DONE";

                    return (
                      <tr
                        key={task.id}
                        className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-800/40"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            aria-label={`Select ${task.title || "task"}`}
                            checked={selectedTasks.includes(task.id)}
                            disabled={deleting}
                            onChange={() => toggleTask(task.id)}
                            className="size-4 rounded accent-blue-600 disabled:opacity-50"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => openTask(task)}
                            className="max-w-72 text-left"
                          >
                            <span className="block truncate text-sm font-medium text-slate-800 transition-colors group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                              {task.title || "Untitled task"}
                            </span>
                            {task.description && (
                              <span className="mt-1 block max-w-72 truncate text-xs text-slate-500 dark:text-zinc-400">
                                {task.description}
                              </span>
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${type.className}`}
                          >
                            <TypeIcon size={12} />
                            {task.type || "OTHER"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${priority.className}`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${priority.dot}`}
                            />
                            {priority.label}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {renderStatusSelect(task)}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex min-w-0 items-center gap-2.5">
                            {task.assignee?.image ? (
                              <img
                                src={task.assignee.image}
                                alt=""
                                className="size-8 shrink-0 rounded-full bg-slate-100 object-cover dark:bg-zinc-800"
                              />
                            ) : (
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                                <UserRound size={15} />
                              </div>
                            )}
                            <span className="max-w-32 truncate text-sm text-slate-700 dark:text-zinc-300">
                              {task.assignee?.name || "Unassigned"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs ${
                              isOverdue
                                ? "font-medium text-red-600 dark:text-red-400"
                                : "text-slate-500 dark:text-zinc-400"
                            }`}
                          >
                            {isOverdue ? (
                              <AlertTriangle size={14} />
                            ) : (
                              <CalendarDays size={14} />
                            )}
                            {formatDate(task.due_date)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile and tablet cards */}
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4 lg:hidden">
              <div className="col-span-full flex items-center gap-2 border-b border-slate-100 px-1 pb-3 dark:border-zinc-800">
                <input
                  type="checkbox"
                  aria-label="Select all visible tasks"
                  checked={allVisibleSelected}
                  disabled={deleting}
                  onChange={toggleVisibleTasks}
                  className="size-4 rounded accent-blue-600 disabled:opacity-50"
                />
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                  Select all {filteredTasks.length} visible tasks
                </span>
              </div>

              {filteredTasks.map(renderTaskCard)}
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <span>
                Showing {filteredTasks.length} of {safeTasks.length} tasks
              </span>
              {selectedVisibleIds.length > 0 && (
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {selectedVisibleIds.length} visible task
                  {selectedVisibleIds.length === 1 ? "" : "s"} selected
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-zinc-950/50 p-4 backdrop-blur-[3px]"
          role="presentation"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
            className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-black/20 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* Header */}
            <div className="flex items-start gap-3.5 border-b border-zinc-100 p-5 dark:border-zinc-800 sm:p-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                <Trash2 className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="delete-modal-title"
                    className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
                  >
                    Delete selected tasks
                  </h2>

                  <span className="rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    Danger zone
                  </span>
                </div>

                <p className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400">
                  This action is permanent and cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                aria-label="Close delete confirmation"
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
              <p
                id="delete-modal-description"
                className="text-sm leading-6 text-zinc-600 dark:text-zinc-300"
              >
                Are you sure you want to permanently delete the selected tasks?
                Their associated task records may no longer be available.
              </p>

              <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200/80 bg-red-50/70 p-3.5 dark:border-red-500/20 dark:bg-red-500/5">
                <AlertTriangle className="size-5 shrink-0 text-red-600 dark:text-red-400" />

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                    {selectedTasks.length} task
                    {selectedTasks.length === 1 ? "" : "s"} selected
                  </p>

                  <p className="mt-0.5 text-xs leading-5 text-red-700/80 dark:text-red-300/80">
                    All selected tasks will be removed from this project.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions remain visible while content scrolls */}
            <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:justify-end sm:p-5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || selectedTasks.length === 0}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-red-600 dark:focus-visible:ring-offset-zinc-900"
              >
                {deleting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Deleting tasks...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    Delete {selectedTasks.length} task
                    {selectedTasks.length === 1 ? "" : "s"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectTasks;
