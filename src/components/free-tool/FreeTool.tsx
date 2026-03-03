"use client";

import { useState } from "react";
import { FlowStep, Game, PublisherStats } from "@/lib/types";
import { computePublisherStats } from "@/lib/analytics";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { EmailStep } from "./EmailStep";
import { ConfirmStep } from "./ConfirmStep";
import { ResultsStep } from "./ResultsStep";
import { NoMatchStep } from "./NoMatchStep";

interface LookupData {
  publisher_name: string;
  games: Game[];
  publisher_stats: PublisherStats;
}

export function FreeTool() {
  const [step, setStep] = useState<FlowStep>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LookupData | null>(null);

  async function handleEmailSubmit(email: string) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Something went wrong");
        return;
      }

      const body = await res.json();

      if (!body.matched) {
        setStep("no-match");
        return;
      }

      setData({
        publisher_name: body.publisher_name,
        games: body.games,
        publisher_stats: body.publisher_stats,
      });
      setStep("confirm");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCompanySelect(publisherName: string) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/publisher-lookup?name=${encodeURIComponent(publisherName)}`
      );

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Something went wrong");
        return;
      }

      const body = await res.json();

      if (!body.matched) {
        setStep("no-match");
        return;
      }

      setData({
        publisher_name: body.publisher_name,
        games: body.games,
        publisher_stats: body.publisher_stats,
      });
      setStep("confirm");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleConfirm(selectedGames: Game[]) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            games: selectedGames,
            publisher_stats: computePublisherStats(selectedGames),
          }
        : prev
    );
    setStep("results");
  }

  function handleReset() {
    setStep("email");
    setData(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {step !== "results" && step !== "no-match" && (
          <StepIndicator currentStep={step} />
        )}

        {step === "email" && (
          <EmailStep
            onSubmit={handleEmailSubmit}
            onCompanySelect={handleCompanySelect}
            isLoading={isLoading}
            error={error}
          />
        )}

        {step === "confirm" && data && (
          <ConfirmStep
            publisherName={data.publisher_name}
            games={data.games}
            onConfirm={handleConfirm}
            onBack={handleReset}
          />
        )}

        {step === "results" && data && (
          <ResultsStep
            publisherName={data.publisher_name}
            games={data.games}
            stats={data.publisher_stats}
            onReset={handleReset}
          />
        )}

        {step === "no-match" && <NoMatchStep onBack={handleReset} />}
      </div>
    </div>
  );
}
