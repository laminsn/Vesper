import type { ReactNode } from "react";

interface AuthLayoutProps {
  readonly children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--jarvis-bg-primary)]">
      {/* Background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--jarvis-accent) 1px, transparent 1px), linear-gradient(90deg, var(--jarvis-accent) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,214,160,0.08)_0%,_transparent_70%)]" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8 px-4">
        {/* Logo and tagline */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="heading-display text-4xl tracking-tight">
            <span className="text-gradient">AI Army Vesper</span>
          </h1>
          <p className="text-sm text-[var(--jarvis-text-secondary)]">
            AI Agent Workforce Management Platform
          </p>
        </div>

        {/* Auth card */}
        <div className="glow-card w-full rounded-xl p-8">{children}</div>
      </div>
    </div>
  );
}
