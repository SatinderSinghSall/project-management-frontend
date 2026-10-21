import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  LoaderCircle,
  Plus,
  Save,
  X,
} from "lucide-react";
import { format, parseISO, isValid, startOfDay } from "date-fns";
import toast from "react-hot-toast";

import api from "../configs/api";
import { addTask } from "../features/workspaceSlice";

const INITIAL_FORM = {
  title: "",
  description: "",
  type: "TASK",
  status: "TODO",
  priority: "MEDIUM",
  assigneeId: "",
  due_date: "",
};

const FIELD_LABELS = {
  title: "Task title",
  description: "Description",
  type: "Task type",
  priority: "Priority",
  assigneeId: "Assignee",
  status: "Status",
  due_date: "Due date",
};

const getErrorMessage = (error) => {
  const message = error?.response?.data?.message;

  if (typeof message === "string" && message.trim()) {
    // Avoid exposing internal database/ORM details to end users.
    if (
      /prisma|stack trace|invalid .* invocation|node_modules/i.test(message)
    ) {
      return "We couldn't create this task. Please check your information and try again.";
    }

    return message;
  }

  if (error?.response?.status === 401) {
    return "Your session may have expired. Please sign in again.";
  }

  if (error?.response?.status === 403) {
    return "You don't have permission to create a task in this project.";
  }

  if (error?.response?.status === 404) {
    return "This project or workspace could not be found. Refresh the page and try again.";
  }

  if (!error?.response) {
    return "Unable to connect to the server. Check your internet connection and try again.";
  }

  return "Something went wrong while creating the task. Please try again.";
};

export default function CreateTaskDialog({
  showCreateTask,
  setShowCreateTask,
  projectId,
}) {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const titleRef = useRef(null);

  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null,
  );

  const project = currentWorkspace?.projects?.find(
    (item) => item.id === projectId,
  );

  const teamMembers = project?.members || [];

  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const today = format(new Date(), "yyyy-MM-dd");

  const closeDialog = () => {
    if (isSubmitting) return;

    setShowCreateTask(false);
    setErrorBanner("");
    setFieldErrors({});
  };

  useEffect(() => {
    if (!showCreateTask) return;

    const timeout = window.setTimeout(() => titleRef.current?.focus(), 50);

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        closeDialog();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("keydown", handleKeyDown);
    };
    // Dialog visibility controls the keyboard listener lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateTask, isSubmitting]);

  const updateField = (name, value) => {
    setFormData((previous) => ({ ...previous, [name]: value }));

    setFieldErrors((previous) => {
      const next = { ...previous };
      delete next[name];
      return next;
    });

    if (errorBanner) setErrorBanner("");
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Please enter a task title.";
    } else if (formData.title.trim().length > 200) {
      errors.title = "The title must be 200 characters or fewer.";
    }

    if (formData.description.length > 2000) {
      errors.description = "The description must be 2,000 characters or fewer.";
    }

    if (formData.due_date) {
      const dueDate = parseISO(formData.due_date);

      if (!isValid(dueDate)) {
        errors.due_date = "Please enter a valid due date.";
      } else if (startOfDay(dueDate) < startOfDay(new Date())) {
        errors.due_date = "The due date cannot be in the past.";
      }
    }

    if (!currentWorkspace?.id) {
      errors.workspaceId =
        "Workspace information is unavailable. Refresh and try again.";
    }

    if (!projectId) {
      errors.projectId =
        "Project information is missing. Reopen this dialog and try again.";
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setErrorBanner("");

    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorBanner(
        "Please correct the highlighted fields before continuing.",
      );

      if (errors.title) {
        titleRef.current?.focus();
      }

      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        workspaceId: currentWorkspace.id,
        projectId,
      };

      const { data } = await api.post("/api/tasks", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data?.task) {
        throw new Error(
          "The server did not return the created task. Please refresh before retrying.",
        );
      }

      dispatch(addTask(data.task));
      setFormData({ ...INITIAL_FORM });
      setFieldErrors({});
      setErrorBanner("");
      setShowCreateTask(false);

      toast.success(data.message || "Task created successfully.");
    } catch (error) {
      const message = getErrorMessage(error);

      setErrorBanner(message);
      toast.error("Unable to create task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (name) =>
    `mt-1.5 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70 dark:bg-zinc-900 dark:text-zinc-100 dark:disabled:bg-zinc-800 ${
      fieldErrors[name]
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500"
        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10 dark:border-zinc-700"
    }`;

  const labelClass =
    "block text-sm font-medium text-slate-700 dark:text-zinc-300";

  const renderFieldError = (name) =>
    fieldErrors[name] ? (
      <p
        id={`${name}-error`}
        className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-red-600 dark:text-red-400"
      >
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
        {fieldErrors[name]}
      </p>
    ) : null;

  if (!showCreateTask) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
        aria-describedby="create-task-description"
        className="flex max-h-[calc(100dvh-24px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 dark:border-zinc-800 dark:bg-zinc-950 sm:max-h-[calc(100dvh-48px)]"
      >
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7 sm:py-5 dark:border-zinc-800">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
              <ClipboardList size={22} />
            </div>

            <div className="min-w-0">
              <h2
                id="create-task-title"
                className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white sm:text-xl"
              >
                Create new task
              </h2>
              <p
                id="create-task-description"
                className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-zinc-400"
              >
                Add a task, set its priority, and assign it to your team.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDialog}
            disabled={isSubmitting}
            aria-label="Close create task dialog"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <X size={19} />
          </button>
        </header>

        {/* Error banner */}
        {errorBanner && (
          <div
            role="alert"
            aria-live="assertive"
            className="mx-5 mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 sm:mx-7 dark:border-red-500/30 dark:bg-red-500/10"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <AlertCircle size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Unable to create task
              </p>
              <p className="mt-1 break-words text-sm leading-relaxed text-red-700 dark:text-red-300/90">
                {errorBanner}
              </p>

              {Object.keys(fieldErrors).length > 0 && (
                <p className="mt-2 text-xs text-red-700 dark:text-red-300">
                  {Object.keys(fieldErrors).length} field
                  {Object.keys(fieldErrors).length === 1 ? "" : "s"} need
                  attention.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setErrorBanner("")}
              disabled={isSubmitting}
              aria-label="Dismiss error message"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-100 disabled:opacity-40 dark:text-red-300 dark:hover:bg-red-500/20"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Form body */}
        <form
          id="create-task-form"
          onSubmit={handleSubmit}
          noValidate
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <fieldset disabled={isSubmitting} className="min-w-0">
            <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
              {/* General information */}
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    General information
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                    Provide a clear title and optional description.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="task-title" className={labelClass}>
                      Task title <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={titleRef}
                      id="task-title"
                      name="title"
                      value={formData.title}
                      onChange={(event) =>
                        updateField("title", event.target.value)
                      }
                      maxLength={200}
                      placeholder="e.g. Build the authentication page"
                      autoComplete="off"
                      aria-invalid={Boolean(fieldErrors.title)}
                      aria-describedby={
                        fieldErrors.title ? "title-error" : undefined
                      }
                      className={inputClass("title")}
                    />
                    <div className="mt-1.5 flex justify-between gap-3">
                      {renderFieldError("title")}
                      <span className="ml-auto shrink-0 text-xs text-slate-400">
                        {formData.title.length}/200
                      </span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="task-description" className={labelClass}>
                      Description
                    </label>
                    <textarea
                      id="task-description"
                      name="description"
                      value={formData.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                      maxLength={2000}
                      rows={3}
                      placeholder="Describe the work, requirements, or expected outcome..."
                      aria-invalid={Boolean(fieldErrors.description)}
                      aria-describedby={
                        fieldErrors.description
                          ? "description-error"
                          : undefined
                      }
                      className={`${inputClass("description")} min-h-24 resize-y`}
                    />
                    <div className="mt-1.5 flex justify-between gap-3">
                      {renderFieldError("description")}
                      <span className="ml-auto shrink-0 text-xs text-slate-400">
                        {formData.description.length}/2000
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-zinc-800" />

              {/* Classification */}
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Task details
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                    Choose a type, priority, and current status.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="task-type" className={labelClass}>
                      Type
                    </label>
                    <div className="relative">
                      <select
                        id="task-type"
                        value={formData.type}
                        onChange={(event) =>
                          updateField("type", event.target.value)
                        }
                        className={`${inputClass("type")} appearance-none pr-10`}
                      >
                        <option value="TASK">Task</option>
                        <option value="BUG">Bug</option>
                        <option value="FEATURE">Feature</option>
                        <option value="IMPROVEMENT">Improvement</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-4 size-4 text-slate-400" />
                    </div>
                    {renderFieldError("type")}
                  </div>

                  <div>
                    <label htmlFor="task-priority" className={labelClass}>
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        id="task-priority"
                        value={formData.priority}
                        onChange={(event) =>
                          updateField("priority", event.target.value)
                        }
                        className={`${inputClass("priority")} appearance-none pr-10`}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-4 size-4 text-slate-400" />
                    </div>
                    {renderFieldError("priority")}
                  </div>

                  <div>
                    <label htmlFor="task-assignee" className={labelClass}>
                      Assignee
                    </label>
                    <div className="relative">
                      <select
                        id="task-assignee"
                        value={formData.assigneeId}
                        onChange={(event) =>
                          updateField("assigneeId", event.target.value)
                        }
                        className={`${inputClass("assigneeId")} appearance-none pr-10`}
                      >
                        <option value="">Unassigned</option>
                        {teamMembers.map((member) => {
                          const user = member?.user;
                          if (!user?.id) return null;

                          return (
                            <option key={user.id} value={user.id}>
                              {user.email || user.name || "Team member"}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-4 size-4 text-slate-400" />
                    </div>
                    {renderFieldError("assigneeId")}
                    {teamMembers.length === 0 && (
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
                        No team members are available to assign.
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="task-status" className={labelClass}>
                      Status
                    </label>
                    <div className="relative">
                      <select
                        id="task-status"
                        value={formData.status}
                        onChange={(event) =>
                          updateField("status", event.target.value)
                        }
                        className={`${inputClass("status")} appearance-none pr-10`}
                      >
                        <option value="TODO">To do</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="DONE">Done</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-4 size-4 text-slate-400" />
                    </div>
                    {renderFieldError("status")}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-zinc-800" />

              {/* Due date */}
              <div>
                <label htmlFor="task-due-date" className={labelClass}>
                  Due date{" "}
                  <span className="font-normal text-slate-400">(optional)</span>
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="task-due-date"
                    name="due_date"
                    type="date"
                    value={formData.due_date}
                    min={today}
                    onChange={(event) =>
                      updateField("due_date", event.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.due_date)}
                    aria-describedby={
                      fieldErrors.due_date ? "due_date-error" : undefined
                    }
                    className={`${inputClass("due_date")} pl-10`}
                  />
                </div>

                {renderFieldError("due_date")}

                {formData.due_date &&
                  isValid(parseISO(formData.due_date)) &&
                  !fieldErrors.due_date && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                      Due on{" "}
                      {format(
                        parseISO(formData.due_date),
                        "EEEE, MMMM d, yyyy",
                      )}
                    </p>
                  )}
              </div>

              {(fieldErrors.workspaceId || fieldErrors.projectId) && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                  {fieldErrors.workspaceId || fieldErrors.projectId}
                </div>
              )}
            </div>
          </fieldset>
        </form>

        {/* Footer stays visible while the form scrolls */}
        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex dark:text-zinc-400">
            <span className="text-red-500">*</span>
            Required field
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeDialog}
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="create-task-form"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Creating task...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Create task
                </>
              )}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
