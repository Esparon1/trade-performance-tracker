import { useState } from "react";
import { supabase } from "../../lib/supabase";

type AuthMode = "login" | "signup";

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters.",
      );
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { error: signupError } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
          });

        if (signupError) {
          throw signupError;
        }

        setMessage(
          "Account created. Check your email if confirmation is enabled.",
        );
      } else {
        const { error: loginError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (loginError) {
          throw loginError;
        }
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Authentication failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background */}
      <div
        className="absolute inset-0  bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/auth-background.png')",
            backgroundSize: "95% auto",
        }}
      />

      {/* Subtle global darkening */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Left-side readability gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/35 to-transparent" />

      {/* Login content */}
      <div className="relative z-10 flex min-h-screen items-center px-6 py-10 sm:px-10 lg:px-20">
        <section className="w-full max-w-[460px]">

          {/* Brand */}
          <div className="mb-10 flex items-center gap-3">
            {/* Small performance bars */}
            <div className="flex items-end gap-1">
              <span className="h-3 w-1.5 rounded-sm bg-emerald-400" />
              <span className="h-5 w-1.5 rounded-sm bg-emerald-400" />
              <span className="h-7 w-1.5 rounded-sm bg-emerald-400" />
            </div>

            <h1 className="text-lg font-semibold tracking-tight">
              Performance{" "}
              <span className="text-emerald-400">
                Tracker
              </span>
            </h1>
          </div>

          {/* Headline */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold leading-[1] tracking-tight sm:text-4xl">
              <span className="block">
                TRADE.
              </span>

              <span className="mt-2 block">
                TRACK.
              </span>

              <span className="mt-2 block text-emerald-400">
                COMPOUND.
              </span>
            </h2>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <label className="block">
              <span className="sr-only">
                Email
              </span>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Email"
                autoComplete="email"
                className="w-full rounded-xl border border-white/15 bg-black/65 px-4 py-3.5 text-white shadow-lg backdrop-blur-md outline-none transition placeholder:text-neutral-400 focus:border-emerald-400/70 focus:bg-black/75"
              />
            </label>

            <label className="block">
              <span className="sr-only">
                Password
              </span>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleSubmit();
                  }
                }}
                placeholder="Password"
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
                className="w-full rounded-xl border border-white/15 bg-black/65 px-4 py-3.5 text-white shadow-lg backdrop-blur-md outline-none transition placeholder:text-neutral-400 focus:border-emerald-400/70 focus:bg-black/75"
              />
            </label>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-4 rounded-lg border border-red-500/20 bg-red-950/60 px-4 py-3 text-sm text-red-300 backdrop-blur-md">
              {error}
            </p>
          )}

          {/* Success message */}
          {message && (
            <p className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-300 backdrop-blur-md">
              {message}
            </p>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-emerald-400 px-4 py-3.5 font-semibold text-black shadow-[0_0_30px_rgba(52,211,153,0.20)] transition duration-200 hover:bg-emerald-300 hover:shadow-[0_0_40px_rgba(52,211,153,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Log in"
                : "Create account"}
          </button>

          {/* Login / signup switch */}
          <div className="mt-5 text-center text-sm text-neutral-400">
            {mode === "login"
              ? "No account? "
              : "Already have an account? "}

            <button
              type="button"
              onClick={() => {
                setMode((currentMode) =>
                  currentMode === "login"
                    ? "signup"
                    : "login",
                );

                setError("");
                setMessage("");
              }}
              className="font-medium text-emerald-400 transition hover:text-emerald-300"
            >
              {mode === "login"
                ? "Create one"
                : "Log in"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}