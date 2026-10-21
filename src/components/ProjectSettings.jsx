import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FolderKanban,
  LoaderCircle,
  Plus,
  Save,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import toast from "react-hot-toast";

import { fetchWorkspaces } from "../features/workspaceSlice";
import api from "../configs/api";

import AddProjectMember from "./AddProjectMember";

const getDateValue = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    // Date-only strings should stay date-only to avoid timezone shifts.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const parsed = new Date(value);
    return isValid(parsed) ? format(parsed, "yyyy-MM-dd") : "";
  }

  const parsed = new Date(value);
  return isValid(parsed) ? format(parsed, "yyyy-MM-dd") : "";
};

const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (status === 401)
    return "Your session may have expired. Please sign in again.";
  if (status === 403)
    return "You don't have permission to update this project.";
  if (status === 404)
    return "The project could not be found. Refresh the page and try again.";
  if (!error?.response)
    return "Unable to connect to the server. Check your connection and try again.";

  if (typeof message === "string" && message.trim()) {
    if (
      /prisma|stack trace|node_modules|invalid .* invocation/i.test(message)
    ) {
      return "The project could not be saved because some project information is missing or invalid. Please refresh and try again.";
    }

    return message;
  }

  return "Something went wrong while saving your project. Please try again.";
};

export default function ProjectSettings({ project }) {
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const [formData, setFormData] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!project) return;

    setFormData({
      ...project,
      name: project.name || "",
      description: project.description || "",
      status: project.status || "PLANNING",
      priority: project.priority || "MEDIUM",
      start_date: getDateValue(project.start_date),
      end_date: getDateValue(project.end_date),
      progress: Number(project.progress ?? 0),
    });

    setErrorBanner("");
    setFieldErrors({});
  }, [project]);

  const members = Array.isArray(project?.members) ? project.members : [];
  const today = format(new Date(), "yyyy-MM-dd");

  const updateField = (name, value) => {
    setFormData((previous) => ({ ...previous, [name]: value }));

    setFieldErrors((previous) => {
      const next = { ...previous };
      delete next[name];
      return next;
    });

    setErrorBanner("");
  };

  const validate = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = "Project name is required.";
    } else if (formData.name.trim().length > 120) {
      errors.name = "Project name must be 120 characters or fewer.";
    }

    if ((formData.description || "").length > 2000) {
      errors.description = "Description must be 2,000 characters or fewer.";
    }

    if (formData.start_date && !isValid(parseISO(formData.start_date))) {
      errors.start_date = "Enter a valid start date.";
    }

    if (formData.end_date && !isValid(parseISO(formData.end_date))) {
      errors.end_date = "Enter a valid end date.";
    }

    if (
      formData.start_date &&
      formData.end_date &&
      formData.end_date < formData.start_date
    ) {
      errors.end_date = "End date must be on or after the start date.";
    }

    if (!project?.id) {
      errors.project =
        "Project information is missing. Refresh the page and try again.";
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setErrorBanner("");

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorBanner("Please review the highlighted fields before saving.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      // Preserve the project fields and ID expected by the existing API.
      const payload = {
        ...formData,
        id: project.id,
        name: formData.name.trim(),
        description: (formData.description || "").trim(),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        progress: Number(formData.progress ?? 0),
      };

      const { data } = await api.put("/api/projects", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(data?.message || "Project updated successfully.");

      // Refresh workspace data so the sidebar and project views stay current.
      await dispatch(fetchWorkspaces({ getToken })).unwrap();
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorBanner(message);
      toast.error("Unable to save project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (name) =>
    `mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70 dark:bg-zinc-900 dark:text-zinc-100 dark:disabled:bg-zinc-800 ${
      fieldErrors[name]
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500"
        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10 dark:border-zinc-700"
    }`;

  const labelClasses =
    "block text-sm font-medium text-slate-700 dark:text-zinc-300";

  const renderFieldError = (name) =>
    fieldErrors[name] ? (
      <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-red-600 dark:text-red-400">
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
        {fieldErrors[name]}
      </p>
    ) : null;

  const cardClasses =
    "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.025] dark:border-zinc-800 dark:bg-gradient-to-br dark:from-zinc-900 dark:to-zinc-950";

  if (!project) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Project unavailable
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Project details could not be loaded. Refresh and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
      {/* Project details */}
      <section className={cardClasses}>
        <div className="flex items-start gap-3.5 border-b border-slate-100 px-5 py-5 sm:px-6 dark:border-zinc-800">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
            <FolderKanban className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              Project details
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
              Update your project's information, status, and timeline.
            </p>
          </div>
        </div>

        {errorBanner && (
          <div
            role="alert"
            aria-live="assertive"
            className="mx-5 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 sm:mx-6 dark:border-red-500/30 dark:bg-red-500/10"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <AlertCircle className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Unable to save project
              </p>
              <p className="mt-1 break-words text-sm leading-relaxed text-red-700 dark:text-red-300/90">
                {errorBanner}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner("")}
              disabled={isSubmitting}
              aria-label="Dismiss error"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-100 disabled:opacity-40 dark:text-red-300 dark:hover:bg-red-500/20"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <fieldset disabled={isSubmitting} className="min-w-0">
            <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
              {fieldErrors.project && renderFieldError("project")}

              <div>
                <label htmlFor="project-name" className={labelClasses}>
                  Project name <span className="text-red-500">*</span>
                </label>
                <input
                  id="project-name"
                  value={formData.name || ""}
                  onChange={(event) => updateField("name", event.target.value)}
                  maxLength={120}
                  placeholder="Enter a project name"
                  className={inputClasses("name")}
                  aria-invalid={Boolean(fieldErrors.name)}
                />
                {renderFieldError("name")}
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="project-description" className={labelClasses}>
                    Description
                  </label>
                  <span className="text-xs text-slate-400">
                    {(formData.description || "").length}/2000
                  </span>
                </div>
                <textarea
                  id="project-description"
                  value={formData.description || ""}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  maxLength={2000}
                  rows={4}
                  placeholder="What is this project about?"
                  className={`${inputClasses("description")} min-h-28 resize-y`}
                  aria-invalid={Boolean(fieldErrors.description)}
                />
                {renderFieldError("description")}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="project-status" className={labelClasses}>
                    Status
                  </label>
                  <div className="relative">
                    <select
                      id="project-status"
                      value={formData.status || "PLANNING"}
                      onChange={(event) =>
                        updateField("status", event.target.value)
                      }
                      className={`${inputClasses("status")} appearance-none pr-10`}
                    >
                      <option value="PLANNING">Planning</option>
                      <option value="ACTIVE">Active</option>
                      <option value="ON_HOLD">On hold</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-4 size-4 text-slate-400" />
                  </div>
                  {renderFieldError("status")}
                </div>

                <div>
                  <label htmlFor="project-priority" className={labelClasses}>
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      id="project-priority"
                      value={formData.priority || "MEDIUM"}
                      onChange={(event) =>
                        updateField("priority", event.target.value)
                      }
                      className={`${inputClasses("priority")} appearance-none pr-10`}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-4 size-4 text-slate-400" />
                  </div>
                  {renderFieldError("priority")}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <CalendarDays className="size-4 text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                    Project timeline
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="project-start" className={labelClasses}>
                      Start date
                    </label>
                    <input
                      id="project-start"
                      type="date"
                      value={formData.start_date || ""}
                      onChange={(event) =>
                        updateField("start_date", event.target.value)
                      }
                      className={inputClasses("start_date")}
                      aria-invalid={Boolean(fieldErrors.start_date)}
                    />
                    {renderFieldError("start_date")}
                  </div>

                  <div>
                    <label htmlFor="project-end" className={labelClasses}>
                      End date
                    </label>
                    <input
                      id="project-end"
                      type="date"
                      value={formData.end_date || ""}
                      min={formData.start_date || undefined}
                      onChange={(event) =>
                        updateField("end_date", event.target.value)
                      }
                      className={inputClasses("end_date")}
                      aria-invalid={Boolean(fieldErrors.end_date)}
                    />
                    {renderFieldError("end_date")}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <label
                      htmlFor="project-progress"
                      className="text-sm font-semibold text-slate-800 dark:text-zinc-200"
                    >
                      Project progress
                    </label>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                      Adjust the overall completion level.
                    </p>
                  </div>
                  <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold tabular-nums text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                    {Number(formData.progress ?? 0)}%
                  </span>
                </div>

                <input
                  id="project-progress"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={Number(formData.progress ?? 0)}
                  onChange={(event) =>
                    updateField("progress", Number(event.target.value))
                  }
                  className="w-full cursor-pointer accent-blue-600 disabled:cursor-not-allowed dark:accent-blue-400"
                />

                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>0% · Not started</span>
                  <span>100% · Complete</span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-[width] duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(0, Number(formData.progress ?? 0)))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-zinc-800 dark:bg-zinc-900/40">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Changes apply to this project.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Saving changes...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Team members */}
      <section className={cardClasses}>
        <div className="flex items-start gap-3.5 border-b border-slate-100 px-5 py-5 sm:px-6 dark:border-zinc-800">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20">
            <Users className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                Team members
              </h2>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                {members.length}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
              People who have access to this project.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/5 dark:hover:text-blue-300"
          >
            <Plus className="size-4" />
            Add team member
          </button>

          <AddProjectMember
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
          />

          {members.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center dark:border-zinc-800">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                <Users className="size-5" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-zinc-200">
                No team members yet
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Add people to collaborate on this project.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member, index) => {
                const user = member?.user;
                const isLead = Boolean(
                  user?.id && project.team_lead === user.id,
                );
                const displayName =
                  user?.name || user?.email || "Unknown member";
                const initial = displayName.charAt(0).toUpperCase();

                return (
                  <div
                    key={user?.id || member?.id || index}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 transition hover:border-slate-200 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-600 dark:from-zinc-700 dark:to-zinc-800 dark:text-zinc-200">
                      {initial}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-zinc-200">
                        {displayName}
                      </p>
                      {user?.email && user?.name && (
                        <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                          {user.email}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                        {isLead ? "Project lead" : "Team member"}
                      </p>
                    </div>

                    {isLead ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                        <ShieldCheck className="size-3.5" />
                        Lead
                      </span>
                    ) : (
                      <CheckCircle2 className="size-4 shrink-0 text-slate-300 dark:text-zinc-600" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
