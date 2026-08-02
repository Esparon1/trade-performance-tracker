import { useState } from "react";
import { supabase } from "../../lib/supabase";

type AuthMode = "login" | "signup";

export default function AuthForm() {
  const [mode, setMode] =
    useState<AuthMode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] =
    useState("");

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
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
      <section className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-7">
        <h1 className="text-3xl font-bold">
          Esparon Portfolio
        </h1>

        <p className="mt-2 text-neutral-400">
          {mode === "login"
            ? "Log in to access your portfolio."
            : "Create your portfolio account."}
        </p>

        <div className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-neutral-300">
              Email
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-neutral-300">
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
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-neutral-400"
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-4 text-sm text-green-400">
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-white px-4 py-3 font-medium text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Log in"
              : "Create account"}
        </button>

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
          className="mt-4 w-full text-sm text-neutral-400 hover:text-white"
        >
          {mode === "login"
            ? "No account? Create one"
            : "Already have an account? Log in"}
        </button>
      </section>
    </main>
  );
}