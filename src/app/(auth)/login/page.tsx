"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      router.push("/");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="heading-display text-xl text-[var(--jarvis-text-primary)]">
          Sign in to Vesper
        </h2>
        <p className="text-sm text-[var(--jarvis-text-muted)]">
          Access the AI Army Vesper
        </p>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="heading-mono text-xs"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="diane@happierhomescomfortcare.com"
          className={cn(
            "w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-4 py-2.5 text-sm text-[var(--jarvis-text-primary)] placeholder:text-[var(--jarvis-text-muted)]",
            "outline-none transition-all duration-200",
            "focus:border-[var(--jarvis-accent)] focus:shadow-[0_0_12px_rgba(6,214,160,0.2)]"
          )}
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="heading-mono text-xs"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className={cn(
            "w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-4 py-2.5 text-sm text-[var(--jarvis-text-primary)] placeholder:text-[var(--jarvis-text-muted)]",
            "outline-none transition-all duration-200",
            "focus:border-[var(--jarvis-accent)] focus:shadow-[0_0_12px_rgba(6,214,160,0.2)]"
          )}
        />
      </div>

      {/* Forgot password */}
      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-xs text-[var(--jarvis-accent)] transition-colors hover:text-[var(--jarvis-accent-2)]"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full rounded-lg bg-[var(--jarvis-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--jarvis-bg-primary)] transition-all duration-200",
          "hover:shadow-[0_0_20px_rgba(6,214,160,0.3)]",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>

      {/* Register link */}
      <p className="text-center text-sm text-[var(--jarvis-text-muted)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[var(--jarvis-accent)] transition-colors hover:text-[var(--jarvis-accent-2)]"
        >
          Request access
        </Link>
      </p>
    </form>
  );
}
