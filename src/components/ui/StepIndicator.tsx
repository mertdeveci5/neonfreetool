"use client";

const STEPS = [
  { key: "email", label: "Email" },
  { key: "confirm", label: "Confirm" },
  { key: "results", label: "Insights" },
] as const;

interface StepIndicatorProps {
  currentStep: "email" | "confirm" | "results" | "no-match";
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {STEPS.map((step, i) => {
        const isActive = step.key === currentStep;
        const isComplete = i < currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`w-8 h-px ${
                  isComplete ? "bg-accent" : "bg-border"
                }`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-background"
                    : isComplete
                      ? "bg-accent/20 text-accent"
                      : "bg-border text-muted"
                }`}
              >
                {isComplete ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm ${
                  isActive ? "font-medium text-foreground" : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
