import { useEffect, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import { addProject } from "../features/workspaceSlice";
import toast from "react-hot-toast";
import api from "../configs/api";

const initialFormData = {
  name: "",
  description: "",
  status: "PLANNING",
  priority: "MEDIUM",
  start_date: "",
  end_date: "",
  team_members: [],
  team_lead: "",
  progress: 0,
};

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { currentWorkspace } = useSelector((state) => state.workspace);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const members = currentWorkspace?.members ?? [];
  const selectedMembers = formData.team_members;

  // Close the modal using Escape, except during submission.
  useEffect(() => {
    if (!isDialogOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        setIsDialogOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isDialogOpen, isSubmitting, setIsDialogOpen]);

  // Reset the form when the modal closes.
  useEffect(() => {
    if (!isDialogOpen) {
      setFormData(initialFormData);
      setErrors({});
      setServerError("");
      setIsSubmitting(false);
    }
  }, [isDialogOpen]);

  const updateField = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
      ...(field === "start_date" ? { end_date: "" } : {}),
    }));

    setServerError("");
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Project name is required.";
    } else if (formData.name.trim().length < 3) {
      nextErrors.name = "Project name must contain at least 3 characters.";
    } else if (formData.name.trim().length > 100) {
      nextErrors.name = "Project name cannot exceed 100 characters.";
    }

    if (formData.description.length > 1000) {
      nextErrors.description = "Description cannot exceed 1,000 characters.";
    }

    if (!formData.team_lead) {
      nextErrors.team_lead = "Please select a project lead.";
    }

    if (
      formData.start_date &&
      formData.end_date &&
      formData.end_date < formData.start_date
    ) {
      nextErrors.end_date = "End date cannot be before the start date.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerError("");

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    if (!currentWorkspace?.id) {
      setServerError(
        "No workspace is selected. Please select a workspace and try again.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error(
          "Your session could not be verified. Please sign in again.",
        );
      }

      const payload = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        workspaceId: currentWorkspace.id,
      };

      const { data } = await api.post("/api/projects", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(addProject(data.project));
      toast.success("Project created successfully.");
      setIsDialogOpen(false);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while creating the project.";

      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeTeamMember = (email) => {
    setFormData((previous) => ({
      ...previous,
      team_members: previous.team_members.filter((member) => member !== email),
    }));
  };

  if (!isDialogOpen) return null;

  const inputClass = (field) =>
    `mt-1.5 w-full min-w-0 rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70 dark:bg-zinc-900 dark:text-zinc-100 dark:disabled:bg-zinc-900/60 ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500/70"
        : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/10 dark:border-zinc-700 dark:focus:border-indigo-500"
    }`;

  const fieldLabel =
    "block text-sm font-medium text-slate-700 dark:text-zinc-300";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6"
      onClick={(event) => {
        // Close only when the backdrop itself is clicked.
        if (event.target === event.currentTarget && !isSubmitting) {
          setIsDialogOpen(false);
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        onClick={(event) => event.stopPropagation()}
        className="relative my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 dark:border-zinc-800 dark:bg-zinc-950 sm:max-h-[calc(100dvh-3rem)]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 dark:border-zinc-800 sm:px-7">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <BriefcaseBusiness size={21} />
            </div>

            <div className="min-w-0">
              <h2
                id="create-project-title"
                className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white sm:text-xl"
              >
                Create new project
              </h2>

              <p className="mt-1 break-words text-sm text-slate-500 dark:text-zinc-400">
                {currentWorkspace
                  ? `In workspace: ${currentWorkspace.name}`
                  : "Create a project in your workspace"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDialogOpen(false)}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        {/* Scrollable form body */}
        <form
          id="create-project-form"
          onSubmit={handleSubmit}
          noValidate
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <fieldset
            disabled={isSubmitting}
            className="min-w-0 space-y-5 px-5 py-5 sm:px-7 sm:py-6"
          >
            {/* General error banner */}
            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    Unable to create project
                  </p>
                  <p className="mt-1 break-words text-sm leading-5">
                    {serverError}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setServerError("")}
                  aria-label="Dismiss error"
                  className="shrink-0 rounded-md p-1 transition hover:bg-red-100 dark:hover:bg-red-500/20"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Project details */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <BriefcaseBusiness
                  size={16}
                  className="text-slate-400 dark:text-zinc-500"
                />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Project details
                </h3>
              </div>

              <div>
                <label htmlFor="project-name" className={fieldLabel}>
                  Project name <span className="text-red-500">*</span>
                </label>

                <input
                  id="project-name"
                  autoFocus
                  type="text"
                  maxLength={100}
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="e.g. Website redesign"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? "project-name-error" : undefined
                  }
                  className={inputClass("name")}
                  required
                />

                {errors.name && (
                  <p
                    id="project-name-error"
                    className="mt-1.5 text-xs text-red-600 dark:text-red-400"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <label htmlFor="project-description" className={fieldLabel}>
                  Description
                  <span className="ml-1.5 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="project-description"
                  rows={3}
                  maxLength={1000}
                  value={formData.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="What is this project about?"
                  aria-invalid={Boolean(errors.description)}
                  className={`${inputClass("description")} resize-y`}
                />

                <div className="mt-1 flex justify-between gap-2">
                  {errors.description ? (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {errors.description}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="shrink-0 text-xs text-slate-400">
                    {formData.description.length}/1000
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-zinc-800" />

            {/* Planning */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
                Planning
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="project-status" className={fieldLabel}>
                    Status
                  </label>
                  <select
                    id="project-status"
                    value={formData.status}
                    onChange={(event) =>
                      updateField("status", event.target.value)
                    }
                    className={inputClass("status")}
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On hold</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="project-priority" className={fieldLabel}>
                    Priority
                  </label>
                  <select
                    id="project-priority"
                    value={formData.priority}
                    onChange={(event) =>
                      updateField("priority", event.target.value)
                    }
                    className={inputClass("priority")}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="project-start-date" className={fieldLabel}>
                    Start date
                  </label>
                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="project-start-date"
                      type="date"
                      value={formData.start_date}
                      onChange={(event) =>
                        updateField("start_date", event.target.value)
                      }
                      className={`${inputClass("start_date")} pr-10`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="project-end-date" className={fieldLabel}>
                    End date
                  </label>
                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="project-end-date"
                      type="date"
                      value={formData.end_date}
                      min={formData.start_date || undefined}
                      onChange={(event) =>
                        updateField("end_date", event.target.value)
                      }
                      aria-invalid={Boolean(errors.end_date)}
                      className={`${inputClass("end_date")} pr-10`}
                    />
                  </div>

                  {errors.end_date && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                      {errors.end_date}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-zinc-800" />

            {/* People */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Users
                  size={17}
                  className="text-slate-400 dark:text-zinc-500"
                />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  People
                </h3>
              </div>

              <div>
                <label htmlFor="project-lead" className={fieldLabel}>
                  Project lead <span className="text-red-500">*</span>
                </label>

                <select
                  id="project-lead"
                  value={formData.team_lead}
                  onChange={(event) => {
                    const lead = event.target.value;

                    setFormData((previous) => ({
                      ...previous,
                      team_lead: lead,
                      team_members: lead
                        ? [...new Set([...previous.team_members, lead])]
                        : previous.team_members,
                    }));

                    setErrors((previous) => ({
                      ...previous,
                      team_lead: "",
                    }));
                    setServerError("");
                  }}
                  aria-invalid={Boolean(errors.team_lead)}
                  className={inputClass("team_lead")}
                  required
                >
                  <option value="">Select a project lead</option>
                  {members.map((member) => {
                    const email = member.user?.email;
                    if (!email) return null;

                    return (
                      <option key={email} value={email}>
                        {email}
                      </option>
                    );
                  })}
                </select>

                {errors.team_lead && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                    {errors.team_lead}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <label htmlFor="project-members" className={fieldLabel}>
                  Team members
                  <span className="ml-1.5 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <select
                  id="project-members"
                  value=""
                  onChange={(event) => {
                    const email = event.target.value;
                    if (!email) return;

                    setFormData((previous) => ({
                      ...previous,
                      team_members: [
                        ...new Set([...previous.team_members, email]),
                      ],
                    }));
                  }}
                  className={inputClass("team_members")}
                >
                  <option value="">Add a team member</option>
                  {members.map((member) => {
                    const email = member.user?.email;
                    if (!email || selectedMembers.includes(email)) return null;

                    return (
                      <option key={email} value={email}>
                        {email}
                      </option>
                    );
                  })}
                </select>

                {selectedMembers.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedMembers.map((email) => (
                      <span
                        key={email}
                        className="inline-flex max-w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-2.5 pr-1.5 text-xs text-slate-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                      >
                        <span className="max-w-[220px] truncate">{email}</span>
                        <button
                          type="button"
                          onClick={() => removeTeamMember(email)}
                          aria-label={`Remove ${email}`}
                          className="flex size-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-zinc-700 dark:hover:text-white"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </fieldset>
        </form>

        {/* Fixed footer */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setIsDialogOpen(false)}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="create-project-form"
            disabled={isSubmitting || !currentWorkspace?.id}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Creating project...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Create project
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default CreateProjectDialog;
