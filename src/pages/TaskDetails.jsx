import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";
import { format, isValid } from "date-fns";
import toast from "react-hot-toast";
import api from "../configs/api";
import {
  CalendarDays,
  MessageCircle,
  Pencil,
  UserCircle2,
  Send,
  LoaderCircle,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Clock3,
  FolderKanban,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";

const formatDate = (value, pattern = "dd MMM yyyy") => {
  if (!value) return "Not set";
  const date = new Date(value);
  return isValid(date) ? format(date, pattern) : "Not set";
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.errors?.[0]?.longMessage ||
  error?.message ||
  fallback;

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

const TaskDetails = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const taskId = searchParams.get("taskId");

  const { getToken } = useAuth();
  const { user } = useUser();
  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null,
  );

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [taskError, setTaskError] = useState("");
  const [commentsError, setCommentsError] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [avatarErrors, setAvatarErrors] = useState({});

  const projects = Array.isArray(currentWorkspace?.projects)
    ? currentWorkspace.projects
    : [];

  const fetchTaskDetails = useCallback(() => {
    setLoading(true);
    setTaskError("");

    if (!projectId || !taskId) {
      setTask(null);
      setProject(null);
      setTaskError("The task link is missing a project or task ID.");
      setLoading(false);
      return;
    }

    if (!currentWorkspace) {
      // Workspace data may still be loading; wait for Redux state to update.
      return;
    }

    const foundProject = projects.find((item) => item?.id === projectId);
    const foundTask = foundProject?.tasks?.find((item) => item?.id === taskId);

    if (!foundProject || !foundTask) {
      setTask(null);
      setProject(null);
      setTaskError(
        "We couldn’t find this task in the current workspace. It may have been deleted or moved.",
      );
      setLoading(false);
      return;
    }

    setTask(foundTask);
    setProject(foundProject);
    setLoading(false);
  }, [projectId, taskId, currentWorkspace, projects]);

  const fetchComments = useCallback(
    async ({ quiet = false } = {}) => {
      if (!taskId) return;
      if (!quiet) setIsLoadingComments(true);

      try {
        const token = await getToken();
        const { data } = await api.get(`/api/comments/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(Array.isArray(data?.comments) ? data.comments : []);
        setCommentsError("");
      } catch (error) {
        console.error("Failed to load task comments:", error);
        setCommentsError(
          getErrorMessage(error, "Comments couldn’t be loaded. Please try again."),
        );
      } finally {
        if (!quiet) setIsLoadingComments(false);
      }
    },
    [taskId, getToken],
  );

  const handleAddComment = async (event) => {
    event.preventDefault();
    const content = newComment.trim();
    if (!content || !task?.id || isPostingComment) return;

    setIsPostingComment(true);
    setCommentsError("");

    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/comments",
        { taskId: task.id, content },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data?.comment) {
        setComments((previous) => [...previous, data.comment]);
      } else {
        await fetchComments({ quiet: true });
      }
      setNewComment("");
      toast.success("Comment added");
    } catch (error) {
      console.error("Failed to add comment:", error);
      const message = getErrorMessage(
        error,
        "Your comment couldn’t be posted. Please try again.",
      );
      setCommentsError(message);
      toast.error("Could not post comment");
    } finally {
      setIsPostingComment(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  useEffect(() => {
    if (!currentWorkspace) return undefined;
    // If workspace data is present but the task isn't found, show the not-found state.
    return undefined;
  }, [currentWorkspace]);

  useEffect(() => {
    if (!taskId || !task) return undefined;

    fetchComments();
    const interval = setInterval(() => {
      fetchComments({ quiet: true });
    }, 15000);

    return () => clearInterval(interval);
  }, [taskId, task?.id, fetchComments]);

  const taskStatus = String(task?.status || "TODO").replaceAll("_", " ");
  const taskType = String(task?.type || "TASK").replaceAll("_", " ");
  const taskPriority = String(task?.priority || "MEDIUM").replaceAll("_", " ");

  const statusStyle = useMemo(() => {
    const status = String(task?.status || "").toUpperCase();
    if (status.includes("DONE") || status.includes("COMPLETE")) {
      return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20";
    }
    if (status.includes("PROGRESS")) {
      return "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20";
    }
    return "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700";
  }, [task?.status]);

  const Avatar = ({ name, image, size = "size-8", label = "User avatar" }) => {
    const key = `${name || "user"}-${image || "no-image"}`;
    if (image && !avatarErrors[key]) {
      return (
        <img
          src={image}
          alt={label}
          loading="lazy"
          onError={() => setAvatarErrors((previous) => ({ ...previous, [key]: true }))}
          className={`${size} shrink-0 rounded-full bg-zinc-100 object-cover ring-1 ring-black/5 dark:bg-zinc-800 dark:ring-white/10`}
        />
      );
    }
    return (
      <span
        aria-label={label}
        className={`${size} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-xs font-semibold text-indigo-700 ring-1 ring-black/5 dark:from-blue-500/20 dark:to-indigo-500/20 dark:text-indigo-200 dark:ring-white/10`}
      >
        {initials(name || "User")}
      </span>
    );
  };

  if (loading) {
    return (
      <main className="w-full space-y-5 p-4 sm:p-6 lg:p-8" role="status" aria-live="polite">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,1fr)]">
          <div className="h-[420px] animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
          <div className="space-y-5">
            <div className="h-48 animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
            <div className="h-40 animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
          </div>
        </div>
        <p className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <LoaderCircle className="size-4 animate-spin" />
          Loading task details…
        </p>
      </main>
    );
  }

  if (taskError || !task) {
    return (
      <main className="flex min-h-[55vh] w-full items-center justify-center p-5">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm dark:border-red-900/50 dark:bg-zinc-900 sm:p-8">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
            Unable to open this task
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {taskError || "This task may have been removed or is no longer available."}
          </p>
          <button
            type="button"
            onClick={fetchTaskDetails}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-w-0 space-y-5 pb-8 text-zinc-900 dark:text-zinc-100 sm:space-y-6">
      {/* Page heading */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
            Workspace / Tasks
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Task details
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            Follow the conversation and review task information in one place.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          <span className="size-2 rounded-full bg-emerald-500" />
          Task workspace
        </span>
      </header>

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.9fr)]">
        {/* Discussion panel */}
        <section className="flex min-h-[540px] min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:min-h-[calc(100dvh-230px)]">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                <MessageCircle className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-zinc-900 dark:text-white">
                  Task discussion
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {comments.length} {comments.length === 1 ? "comment" : "comments"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchComments()}
              disabled={isLoadingComments}
              aria-label="Refresh comments"
              title="Refresh comments"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 hover:text-blue-600 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <RefreshCw className={`size-4 ${isLoadingComments ? "animate-spin" : ""}`} />
            </button>
          </div>

          {commentsError && (
            <div role="alert" className="mx-4 mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 sm:mx-6">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p className="min-w-0 flex-1">{commentsError}</p>
              <button type="button" onClick={() => setCommentsError("")} aria-label="Dismiss error" className="rounded p-0.5 hover:bg-red-100 dark:hover:bg-red-900/40">
                <X className="size-4" />
              </button>
            </div>
          )}

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
            {isLoadingComments && comments.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500 dark:text-zinc-400" role="status">
                <LoaderCircle className="size-4 animate-spin" />
                Loading comments…
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment, index) => {
                const isMine = comment?.user?.id === user?.id;
                const commentName = comment?.user?.name || "Workspace member";
                return (
                  <article
                    key={comment?.id || `${comment?.createdAt}-${index}`}
                    className={`flex w-full gap-2.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar
                      name={commentName}
                      image={comment?.user?.image}
                      size="size-8"
                      label={`${commentName} avatar`}
                    />
                    <div className={`min-w-0 max-w-[88%] sm:max-w-[80%] ${isMine ? "text-right" : ""}`}>
                      <div className={`mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 ${isMine ? "justify-end" : ""}`}>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {isMine ? "You" : commentName}
                        </span>
                        <span>{formatDate(comment?.createdAt, "dd MMM yyyy, HH:mm")}</span>
                      </div>
                      <div className={`inline-block rounded-2xl px-3.5 py-2.5 text-left text-sm leading-6 ${
                        isMine
                          ? "rounded-tr-md bg-blue-600 text-white"
                          : "rounded-tl-md border border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{comment?.content || ""}</p>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 py-10 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <MessageCircle className="size-5" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  No discussion yet
                </h3>
                <p className="mt-1 max-w-xs text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Start the conversation by sharing an update or asking a question.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleAddComment} className="border-t border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/70 sm:p-5">
            <label htmlFor="task-comment" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Add to discussion
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="task-comment"
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Write a comment… (Enter to post, Shift+Enter for a new line)"
                disabled={isPostingComment}
                className="min-h-[76px] min-w-0 flex-1 resize-y rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                rows={2}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isPostingComment}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
              >
                {isPostingComment ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                <span className="hidden sm:inline">{isPostingComment ? "Posting…" : "Post"}</span>
              </button>
            </div>
          </form>
        </section>

        {/* Right-side details */}
        <aside className="flex min-w-0 flex-col gap-5">
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
                Task overview
              </p>
              <h2 className="mt-2 break-words text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {task.title || "Untitled task"}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle}`}>
                  {taskStatus}
                </span>
                <span className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                  {taskType}
                </span>
                <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20">
                  {taskPriority}
                </span>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Description
                </p>
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                  {task.description?.trim() || "No description has been added."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <div className="flex min-w-0 items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <Avatar
                    name={task.assignee?.name || "Unassigned"}
                    image={task.assignee?.image}
                    size="size-9"
                    label="Assignee avatar"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Assignee
                    </p>
                    <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {task.assignee?.name || "Unassigned"}
                    </p>
                  </div>
                </div>
                <div className="flex min-w-0 items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                    <CalendarDays className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Due date
                    </p>
                    <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {formatDate(task.due_date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {project && (
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                  <FolderKanban className="size-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-zinc-900 dark:text-white">
                    Project details
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    Parent project information
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Pencil className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                <p className="break-words text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {project.name || "Untitled project"}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <CalendarDays className="size-4 shrink-0" />
                <span>Starts {formatDate(project.start_date)}</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Status</p>
                  <p className="mt-1 break-words text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {String(project.status || "Not set").replaceAll("_", " ")}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Priority</p>
                  <p className="mt-1 break-words text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {String(project.priority || "Not set").replaceAll("_", " ")}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Project progress</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {Number.isFinite(Number(project.progress))
                      ? `${Math.min(100, Math.max(0, Number(project.progress)))}%`
                      : "—"}
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
                  role="progressbar"
                  aria-label="Project progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.min(100, Math.max(0, Number(project.progress) || 0))}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, Number(project.progress) || 0))}%`,
                    }}
                  />
                </div>
              </div>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
};

export default TaskDetails;
