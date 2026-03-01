"use client";

import { useState } from "react";
import Image from "next/image";

interface EmailStepProps {
  onSubmit: (email: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function EmailStep({ onSubmit, isLoading, error }: EmailStepProps) {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      onSubmit(email.trim());
    }
  }

  return (
    <div className="flex flex-col items-center text-center max-w-xl mx-auto">
      <Image
        src="/neon-logo.png"
        alt="Neon Commerce"
        width={48}
        height={48}
        className="mb-5"
      />
      <p className="text-xs uppercase tracking-widest text-accent mb-4">
        Neon Commerce
      </p>
      <h1 className="text-4xl md:text-5xl font-serif font-semibold tracking-tight leading-tight mb-4 text-foreground">
        See how much more you could earn going direct.
      </h1>
      <p className="text-lg text-muted mb-10 max-w-md">
        Enter your work email and we&apos;ll calculate how much additional revenue
        your games could generate by shifting to direct-to-consumer with Neon.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full px-4 py-3 border border-border bg-surface text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
            required
            disabled={isLoading}
          />
          {error && <p className="text-sm text-red-400 text-left">{error}</p>}
          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full py-3 px-6 bg-accent text-background font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Looking up your games...
              </span>
            ) : (
              "Analyze My Portfolio"
            )}
          </button>
        </div>
      </form>

      <p className="text-xs text-muted mt-8">
        We match your email domain to our database of 2,600+ mobile games to estimate your DTC revenue potential.
      </p>
    </div>
  );
}
