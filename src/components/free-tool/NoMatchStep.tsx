"use client";

interface NoMatchStepProps {
  onBack: () => void;
}

export function NoMatchStep({ onBack }: NoMatchStepProps) {
  return (
    <div className="flex flex-col items-center text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-border/50 flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-serif font-semibold tracking-tight mb-3 text-foreground">
        No games found
      </h2>
      <p className="text-muted mb-6">
        We couldn&apos;t find any games associated with your email domain in our
        database of 2,600+ mobile titles. Try using a different work email
        address.
      </p>
      <button
        onClick={onBack}
        className="py-3 px-8 bg-accent text-background font-medium hover:bg-accent/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
