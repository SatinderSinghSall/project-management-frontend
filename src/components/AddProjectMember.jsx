import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  LoaderCircle,
  Mail,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../configs/api";
import { fetchWorkspaces } from "../features/workspaceSlice";

const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (status === 401)
    return "Your session may have expired. Please sign in again.";
  if (status === 403)
    return "You don't have permission to add members to this project.";
  if (status === 404)
    return "The project or selected member could not be found.";
  if (!error?.response)
    return "Unable to connect to the server. Check your connection and try again.";

  return typeof message === "string" && message.trim()
    ? message
    : "Unable to add this member. Please try again.";
};

export default function AddProjectMember({ isDialogOpen, setIsDialogOpen }) {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");

  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null,
  );

  const project = currentWorkspace?.projects?.find(
    (item) => item.id === projectId,
  );

  const projectMembers = project?.members || [];
  const workspaceMembers = currentWorkspace?.members || [];

  const projectMemberIds = useMemo(
    () =>
      new Set(projectMembers.map((member) => member?.user?.id).filter(Boolean)),
    [projectMembers],
  );

  const availableMembers = useMemo(
    () =>
      workspaceMembers.filter(
        (member) =>
          member?.user?.id &&
          member?.user?.email &&
          !projectMemberIds.has(member.user.id),
      ),
    [workspaceMembers, projectMemberIds],
  );

  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    if (isDialogOpen) {
      setEmail("");
      setSearch("");
      setErrorMessage("");
      setFieldError("");
    }
  }, [isDialogOpen, projectId]);

  useEffect(() => {
    if (!isDialogOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isAdding) {
        setIsDialogOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDialogOpen, isAdding, setIsDialogOpen]);

  if (!isDialogOpen || typeof document === "undefined") return null;

  const selectedMember = availableMembers.find(
    (member) => member.user.email === email,
  );

  const filteredMembers = availableMembers.filter((member) => {
    const query = search.trim().toLowerCase();
    return (
      (member.user.email || "").toLowerCase().includes(query) ||
      (member.user.name || "").toLowerCase().includes(query)
    );
  });

  const closeDialog = () => {
    if (isAdding) return;
    setIsDialogOpen(false);
    setErrorMessage("");
    setFieldError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isAdding) return;

    setErrorMessage("");
    setFieldError("");

    if (!project?.id) {
      setErrorMessage(
        "Project details are unavailable. Refresh the page and try again.",
      );
      return;
    }

    if (!email) {
      setFieldError("Please select a workspace member.");
      return;
    }

    if (!availableMembers.some((member) => member.user.email === email)) {
      setFieldError(
        "This member is no longer available. Select another member.",
      );
      return;
    }

    setIsAdding(true);

    try {
      const token = await getToken();
      if (!token)
        throw new Error("Your session has expired. Please sign in again.");

      await api.post(
        `/api/projects/${project.id}/addMember`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setIsDialogOpen(false);
      setEmail("");
      setSearch("");
      toast.success("Member added to the project.");

      try {
        await dispatch(fetchWorkspaces({ getToken })).unwrap();
      } catch {
        toast.error(
          "Member added, but refreshing the workspace failed. Reload to see the latest members.",
        );
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsAdding(false);
    }
  };

  const inputClasses =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex h-[100dvh] w-screen items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-member-title"
        className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 sm:max-h-[calc(100dvh-3rem)] dark:border-zinc-800 dark:bg-zinc-950"
      >
        {/* Header */}
        <header className="flex shrink-0 items-start gap-3.5 border-b border-slate-100 px-5 py-5 sm:px-6 dark:border-zinc-800">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
            <UserPlus className="size-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="add-member-title"
              className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white"
            >
              Add team member
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
              Invite an existing workspace member to collaborate on this
              project.
            </p>

            {project && (
              <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-zinc-900">
                <Users className="size-3.5 shrink-0 text-slate-500" />
                <span className="text-slate-500">Project</span>
                <span className="truncate font-semibold text-slate-800 dark:text-zinc-200">
                  {project.name}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={closeDialog}
            disabled={isAdding}
            aria-label="Close dialog"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* Scrollable content */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <fieldset
            disabled={isAdding}
            className="min-h-0 flex-1 overflow-y-auto"
          >
            {errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className="mx-5 mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 sm:mx-6 dark:border-red-500/30 dark:bg-red-500/10"
              >
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                    Unable to add member
                  </p>
                  <p className="mt-1 break-words text-sm leading-relaxed text-red-700 dark:text-red-300">
                    {errorMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage("")}
                  aria-label="Dismiss error"
                  className="rounded-lg p-1 text-red-600 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-500/20"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="member-search"
                    className="text-sm font-semibold text-slate-700 dark:text-zinc-300"
                  >
                    Select a workspace member{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400">
                    {availableMembers.length} available
                  </span>
                </div>

                {availableMembers.length > 0 ? (
                  <>
                    <div className="relative mb-3">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="member-search"
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name or email..."
                        className={`${inputClasses} pl-9`}
                      />
                    </div>

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                      <select
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setFieldError("");
                          setErrorMessage("");
                        }}
                        aria-invalid={Boolean(fieldError)}
                        aria-describedby={
                          fieldError ? "member-field-error" : undefined
                        }
                        className={`${inputClasses} appearance-none pl-9 pr-10 ${
                          fieldError
                            ? "border-red-400 focus:ring-red-500/10"
                            : ""
                        }`}
                        required
                      >
                        <option value="">Choose a member</option>
                        {filteredMembers.map((member) => (
                          <option
                            key={member.user.id}
                            value={member.user.email}
                          >
                            {member.user.name
                              ? `${member.user.name} — ${member.user.email}`
                              : member.user.email}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    </div>

                    {filteredMembers.length === 0 && (
                      <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
                        No members match your search.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
                    <CheckCircle2 className="mx-auto mb-2 size-6 text-emerald-500" />
                    <p className="text-sm font-medium text-slate-700 dark:text-zinc-200">
                      Everyone is already on this project
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                      Add more people to the workspace before inviting them
                      here.
                    </p>
                  </div>
                )}

                {fieldError && (
                  <p
                    id="member-field-error"
                    className="mt-2 flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                    {fieldError}
                  </p>
                )}
              </div>

              {selectedMember && (
                <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 dark:border-blue-500/20 dark:bg-blue-500/5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                    {(selectedMember.user.name ||
                      selectedMember.user.email)[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-zinc-200">
                      {selectedMember.user.name || "Selected member"}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                      {selectedMember.user.email}
                    </p>
                  </div>
                  <CheckCircle2 className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                </div>
              )}

              <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-zinc-900/70">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-500" />
                <p className="text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                  Only existing workspace members can be added through this
                  form.
                </p>
              </div>
            </div>
          </fieldset>

          {/* Fixed footer within modal */}
          <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 dark:border-zinc-800 dark:bg-zinc-900/50">
            <button
              type="button"
              onClick={closeDialog}
              disabled={isAdding}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isAdding ||
                !project?.id ||
                !email ||
                availableMembers.length === 0
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAdding ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Adding member...
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  Add member
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}
