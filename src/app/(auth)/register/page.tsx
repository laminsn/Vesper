"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password.trim() || !displayName.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        "Account created. Check your email to confirm, then sign in."
      );
      router.push("/login");
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
          Request Access
        </h2>
        <p className="text-sm text-[var(--jarvis-text-muted)]">
          Create an account for Vesper
        </p>
      </div>

      {/* Display Name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="displayName" className="heading-mono text-xs">
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Diane"
          className={cn(
            "w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-4 py-2.5 text-sm text-[var(--jarvis-text-primary)] placeholder:text-[var(--jarvis-text-muted)]",
            "outline-none transition-all duration-200",
            "focus:border-[var(--jarvis-accent)] focus:shadow-[0_0_12px_rgba(6,214,160,0.2)]"
          )}
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="heading-mono text-xs">
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
        <label htmlFor="password" className="heading-mono text-xs">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 6 characters"
          className={cn(
            "w-full rounded-lg border border-[var(--jarvis-border)] bg-[var(--jarvis-bg-tertiary)] px-4 py-2.5 text-sm text-[var(--jarvis-text-primary)] placeholder:text-[var(--jarvis-text-muted)]",
            "outline-none transition-all duration-200",
            "focus:border-[var(--jarvis-accent)] focus:shadow-[0_0_12px_rgba(6,214,160,0.2)]"
          )}
        />
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
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>

      {/* Info notice */}
      <p className="text-center text-xs text-[var(--jarvis-text-muted)]">
        After registration, an admin must assign your role before you can access
        the dashboard. Contact your administrator if you need immediate access.
      </p>

      {/* Login link */}
      <p className="text-center text-sm text-[var(--jarvis-text-muted)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[var(--jarvis-accent)] transition-colors hover:text-[var(--jarvis-accent-2)]"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
