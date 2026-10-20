import { SignIn } from "@clerk/clerk-react";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  CircleHelp,
  Layers3,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const features = [
  "Keep projects and tasks organized",
  "Collaborate with your entire team",
  "Track progress without the clutter",
];

const SignInPage = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f7fc] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-violet-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 right-[-8rem] h-[34rem] w-[34rem] rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] items-center justify-center p-3 sm:p-6 lg:p-10">
        <section className="grid w-full max-w-[1240px] overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_30px_100px_-35px_rgba(30,41,100,0.24)] lg:min-h-[760px] lg:grid-cols-[1.02fr_0.98fr]">
          {/* Left branding panel */}
          <aside className="relative hidden flex-col overflow-hidden bg-[#21145e] p-10 text-white sm:p-12 lg:flex xl:p-14">
            {/* Gradient and decorative shapes */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#33218b] via-[#3524a1] to-[#562be6]" />
            <div className="pointer-events-none absolute -right-32 -top-36 h-[440px] w-[440px] rounded-full border border-white/[0.09]">
              <div className="absolute inset-10 rounded-full border border-white/[0.08]" />
              <div className="absolute inset-24 rounded-full bg-white/[0.035]" />
            </div>
            <div className="pointer-events-none absolute -bottom-52 -left-36 h-[480px] w-[480px] rounded-full border-[65px] border-white/[0.045]" />
            <div className="pointer-events-none absolute bottom-20 right-10 h-40 w-40 rounded-full bg-violet-400/20 blur-3xl" />

            {/* Brand */}
            <div className="relative z-10 flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-white/20 bg-white/10 shadow-lg shadow-black/10 backdrop-blur">
                <Layers3 size={25} strokeWidth={2.1} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  ProjectFlow
                </h1>
                <p className="mt-0.5 text-xs font-medium tracking-wide text-indigo-200">
                  PROJECT MANAGEMENT
                </p>
              </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 my-auto py-12">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-2 text-xs font-medium text-indigo-100 shadow-sm backdrop-blur-sm">
                <Sparkles size={14} className="text-violet-200" />
                Your team's workspace, reimagined
              </div>

              <h2 className="max-w-[480px] text-[42px] font-bold leading-[1.13] tracking-[-1.8px] xl:text-[50px]">
                Turn big ideas into{" "}
                <span className="bg-gradient-to-r from-violet-200 via-indigo-100 to-white bg-clip-text text-transparent">
                  real progress.
                </span>
              </h2>

              <p className="mt-6 max-w-[420px] text-[15px] leading-7 text-indigo-100/80">
                Everything your team needs to plan projects, manage tasks, and
                move forward together — all in one place.
              </p>

              {/* Mini dashboard preview */}
              <div className="mt-10 max-w-[440px] rounded-2xl border border-white/15 bg-white/[0.10] p-4 shadow-2xl shadow-indigo-950/20 backdrop-blur-md xl:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium text-indigo-200">
                      WORKSPACE OVERVIEW
                    </p>
                    <h3 className="mt-1 text-sm font-semibold">
                      Project progress
                    </h3>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200">
                    <ArrowUpRight size={20} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/[0.08] p-3.5">
                    <p className="text-xs text-indigo-200">Active projects</p>
                    <p className="mt-2 text-2xl font-bold">Projects</p>
                    <p className="mt-1 text-[10px] text-indigo-200/80">
                      Your work, organized
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/[0.08] p-3.5">
                    <p className="text-xs text-indigo-200">Team workflow</p>
                    <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
                      <CheckCircle2 size={16} className="text-emerald-300" />
                      Stay on track
                    </p>
                    <div className="mt-3 flex gap-1">
                      <span className="h-1.5 flex-1 rounded-full bg-violet-200" />
                      <span className="h-1.5 flex-1 rounded-full bg-violet-200/80" />
                      <span className="h-1.5 flex-1 rounded-full bg-white/20" />
                      <span className="h-1.5 flex-1 rounded-full bg-white/20" />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-200">
                    <Check size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium">
                      One organized workspace
                    </p>
                    <p className="mt-0.5 text-[10px] text-indigo-200">
                      Projects, tasks, and teammates together
                    </p>
                  </div>
                  <Sparkles size={15} className="shrink-0 text-violet-200" />
                </div>
              </div>

              <div className="mt-8 space-y-3.5">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10">
                      <Check size={12} strokeWidth={2.5} />
                    </span>
                    <span className="text-sm text-indigo-50/90">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex items-center justify-between gap-4 border-t border-white/15 pt-5">
              <div className="flex items-center gap-2 text-xs text-indigo-200">
                <ShieldCheck size={16} />
                Built for better teamwork
              </div>
              <span className="text-xs text-indigo-200/70">Work smarter.</span>
            </div>
          </aside>

          {/* Right authentication panel */}
          <section className="relative flex min-w-0 flex-col justify-center bg-white px-5 py-9 sm:px-10 sm:py-12 lg:px-10 xl:px-16">
            {/* Mobile branding */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200/70">
                <Layers3 size={23} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  ProjectFlow
                </h1>
                <p className="text-xs text-slate-500">Project Management</p>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[420px]">
              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-bold tracking-[1.5px] text-indigo-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  WELCOME BACK
                </div>

                <h2 className="text-[30px] font-bold leading-tight tracking-[-1px] text-slate-950 sm:text-[34px]">
                  Let's get you back
                  <br className="hidden sm:block" /> to work.
                </h2>

                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                  Sign in to pick up where you left off and keep your team
                  moving forward.
                </p>
              </div>

              {/* Clerk authentication */}
              <div className="clerk-signin-polished">
                <SignIn
                  routing="hash"
                  signUpUrl="/sign-up"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "w-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_35px_-20px_rgba(15,23,42,0.24)] sm:p-7",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      socialButtons: "gap-3",
                      socialButtonsBlockButton:
                        "min-h-11 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/50",
                      socialButtonsBlockButtonText: "font-medium",
                      dividerRow: "my-5",
                      dividerLine: "bg-slate-200",
                      dividerText: "text-xs font-medium text-slate-400",
                      form: "gap-4",
                      formFieldLabel:
                        "mb-1.5 text-xs font-semibold text-slate-700",
                      formFieldInput:
                        "min-h-11 rounded-xl border-slate-200 bg-slate-50/50 text-sm shadow-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10",
                      formFieldAction:
                        "text-xs font-medium text-indigo-600 hover:text-indigo-700",
                      formButtonPrimary:
                        "min-h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold shadow-md shadow-indigo-200/60 transition hover:from-indigo-700 hover:to-violet-700 hover:shadow-lg",
                      footer: "mt-2",
                      footerAction: "mt-5",
                      footerActionText: "text-sm text-slate-500",
                      footerActionLink:
                        "font-semibold text-indigo-600 hover:text-indigo-700",
                      identityPreview:
                        "rounded-xl border border-slate-200 bg-slate-50",
                      formFieldSuccessText: "text-emerald-600",
                      formFieldErrorText: "text-red-600",
                      alert: "rounded-xl",
                      otpCodeFieldInput:
                        "rounded-lg border-slate-200 focus:border-indigo-500",
                      backLink: "text-sm font-medium text-indigo-600",
                    },
                    variables: {
                      colorPrimary: "#4f46e5",
                      colorText: "#0f172a",
                      colorTextSecondary: "#64748b",
                      colorBackground: "#ffffff",
                      colorInputBackground: "#f8fafc",
                      colorInputText: "#0f172a",
                      borderRadius: "0.75rem",
                      fontFamily: "inherit",
                    },
                  }}
                />
              </div>

              {/* Security note */}
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-white text-emerald-600 shadow-sm">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Your account, protected
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Secure sign-in powered by Clerk authentication.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center text-[11px] text-slate-400">
                <span>© {new Date().getFullYear()} ProjectFlow</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <CircleHelp size={12} />
                  Need help signing in?
                </span>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
};

export default SignInPage;
