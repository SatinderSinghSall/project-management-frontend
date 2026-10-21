import { useEffect, useState } from "react";
import {
  Mail,
  UserPlus,
  AlertCircle,
  X,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { useOrganization } from "@clerk/clerk-react";
import { useSelector } from "react-redux";

const getInviteErrorMessage = (error) => {
  const clerkErrors = error?.errors;
  const clerkMessage = Array.isArray(clerkErrors)
    ? clerkErrors
        .map((item) => item?.longMessage || item?.message)
        .filter(Boolean)[0]
    : null;

  const message =
    clerkMessage ||
    error?.response?.data?.message ||
    error?.message ||
    "We couldn’t send the invitation. Please try again.";

  const lower = String(message).toLowerCase();

  if (lower.includes("already a member") || lower.includes("already exists")) {
    return "This person may already be a member of the organization.";
  }
  if (lower.includes("invalid email") || lower.includes("email address")) {
    return "Please check the email address and try again.";
  }
  if (lower.includes("permission") || lower.includes("not authorized")) {
    return "You don’t have permission to invite members. Ask an organization admin for help.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "We couldn’t connect to the server. Check your internet connection and try again.";
  }

  return message;
};

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen }) => {
  const { organization, isLoaded } = useOrganization();
  const currentWorkspace = useSelector(
    (state) => state.workspace?.currentWorkspace || null,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    role: "org:member",
  });

  const isBusy = isSubmitting || !isLoaded;
  const email = formData.email.trim();

  useEffect(() => {
    if (!isDialogOpen) return;
    setFormError("");
    setEmailError("");
  }, [isDialogOpen]);

  useEffect(() => {
    if (!isDialogOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isBusy) setIsDialogOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDialogOpen, isBusy, setIsDialogOpen]);

  const closeDialog = () => {
    if (isBusy) return;
    setFormError("");
    setEmailError("");
    setIsDialogOpen(false);
  };

  const validateEmail = (value) => {
    const cleanValue = value.trim();
    if (!cleanValue) return "Enter an email address to send the invitation.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue)) {
      return "Enter a valid email address, such as name@example.com.";
    }
    return "";
  };

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setFormData((previous) => ({ ...previous, email: value }));
    if (emailError) setEmailError(validateEmail(value));
    if (formError) setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isBusy) return;

    const validationMessage = validateEmail(email);
    setEmailError(validationMessage);
    setFormError("");

    if (validationMessage) return;

    if (!organization) {
      setFormError(
        "Your organization isn’t ready yet. Please wait a moment and try again.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await organization.inviteMember({
        emailAddress: email,
        role: formData.role,
      });
      toast.success("Invitation sent successfully");
      setFormData({ email: "", role: "org:member" });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to send team invitation:", error);
      setFormError(getInviteErrorMessage(error));
      toast.error("Could not send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isDialogOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] h-[100dvh] w-screen overflow-y-auto overscroll-contain bg-black/30 p-3 pt-4 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      {/* Full-viewport flex stage. Modal stays centered when it fits and scrolls when it doesn't. */}
      <div className="flex min-h-full w-full items-center justify-center">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-member-title"
          aria-describedby="invite-member-description"
          className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl shadow-black/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 sm:max-h-[calc(100dvh-2.5rem)] sm:max-w-xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800 sm:px-7 sm:py-5">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
                <UserPlus className="size-5" />
              </div>
              <div className="min-w-0">
                <h2
                  id="invite-member-title"
                  className="text-lg font-bold tracking-tight sm:text-xl"
                >
                  Invite team member
                </h2>
                <p
                  id="invite-member-description"
                  className="mt-1 text-sm leading-5 text-zinc-500 dark:text-zinc-400"
                >
                  Send an invitation to collaborate in your workspace.
                </p>
                {currentWorkspace?.name && (
                  <p className="mt-2 break-words text-xs text-zinc-500 dark:text-zinc-400">
                    Inviting to{" "}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {currentWorkspace.name}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              disabled={isBusy}
              aria-label="Close invitation dialog"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 focus:outline-none focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Scrollable form body */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="min-h-0 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6"
          >
            {formError && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200 sm:px-4"
              >
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Invitation couldn’t be sent</p>
                  <p className="mt-1 break-words leading-5">{formError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormError("")}
                  aria-label="Dismiss error message"
                  className="rounded-md p-1 text-red-500 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400/40 dark:hover:bg-red-900/40"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            <fieldset
              disabled={isBusy}
              className="space-y-5 disabled:opacity-70"
            >
              <div className="space-y-2">
                <label
                  htmlFor="invite-email"
                  className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  Email address <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative rounded-lg transition ${
                    emailError
                      ? "ring-2 ring-red-500/15"
                      : "focus-within:ring-4 focus-within:ring-blue-500/10"
                  }`}
                >
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="invite-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    onBlur={() => setEmailError(validateEmail(formData.email))}
                    placeholder="name@example.com"
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={
                      emailError ? "invite-email-error" : "invite-email-help"
                    }
                    className={`min-h-11 w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
                      emailError
                        ? "border-red-400 focus:border-red-500 dark:border-red-700"
                        : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
                    }`}
                    required
                  />
                </div>
                {emailError ? (
                  <p
                    id="invite-email-error"
                    className="flex items-start gap-1.5 text-xs font-medium leading-5 text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                    {emailError}
                  </p>
                ) : (
                  <p
                    id="invite-email-help"
                    className="text-xs text-zinc-500 dark:text-zinc-400"
                  >
                    They’ll receive an email with instructions to join.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="invite-role"
                  className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  Role
                </label>
                <select
                  id="invite-role"
                  name="role"
                  value={formData.role}
                  onChange={(event) => {
                    setFormData((previous) => ({
                      ...previous,
                      role: event.target.value,
                    }));
                    if (formError) setFormError("");
                  }}
                  className="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none transition hover:border-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600"
                >
                  <option value="org:member">Member — standard access</option>
                  <option value="org:admin">Admin — manage organization</option>
                </select>
                <p className="flex items-start gap-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                  Choose the access level that fits this person’s
                  responsibilities.
                </p>
              </div>
            </fieldset>

            <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={closeDialog}
                disabled={isBusy}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-4 focus:ring-zinc-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBusy || !currentWorkspace || !email}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none"
              >
                {isBusy ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    {isSubmitting ? "Sending invitation…" : "Preparing…"}
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4" />
                    Send invitation
                  </>
                )}
              </button>
            </div>

            {isBusy && (
              <p
                className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400"
                role="status"
                aria-live="polite"
              >
                <LoaderCircle className="size-3.5 animate-spin" />
                Please wait while we process your invitation.
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

export default InviteMemberDialog;
