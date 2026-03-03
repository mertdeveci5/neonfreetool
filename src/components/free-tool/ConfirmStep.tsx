"use client";

import { useState } from "react";
import { Game } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/format";

interface ConfirmStepProps {
  publisherName: string;
  games: Game[];
  onConfirm: (selectedGames: Game[]) => void;
  onBack: () => void;
}

export function ConfirmStep({
  publisherName,
  games,
  onConfirm,
  onBack,
}: ConfirmStepProps) {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(
    () => new Set(games.map((g) => g.app_name))
  );

  const allSelected = selectedNames.size === games.length;
  const noneSelected = selectedNames.size === 0;

  function toggleAll() {
    if (allSelected) {
      setSelectedNames(new Set());
    } else {
      setSelectedNames(new Set(games.map((g) => g.app_name)));
    }
  }

  function toggleGame(appName: string) {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(appName)) {
        next.delete(appName);
      } else {
        next.add(appName);
      }
      return next;
    });
  }

  function handleConfirm() {
    const selected = games.filter((g) => selectedNames.has(g.app_name));
    onConfirm(selected);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-semibold tracking-tight mb-2 text-foreground">
          We found your games
        </h2>
        <p className="text-muted">
          <span className="font-medium text-foreground">{publisherName}</span>
          {" — "}
          {selectedNames.size} of {games.length} game
          {games.length !== 1 ? "s" : ""} selected
        </p>
      </div>

      <div className="border border-border overflow-hidden mb-6">
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface border-b border-border">
              <tr>
                <th className="py-3 px-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="accent-accent w-4 h-4 cursor-pointer"
                    aria-label="Select all games"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider">
                  Game
                </th>
                <th className="text-left py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden sm:table-cell">
                  Category
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 font-medium text-muted text-xs uppercase tracking-wider hidden sm:table-cell">
                  Downloads
                </th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => {
                const isSelected = selectedNames.has(game.app_name);
                return (
                  <tr
                    key={game.app_name}
                    onClick={() => toggleGame(game.app_name)}
                    className={`border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors cursor-pointer ${
                      !isSelected ? "opacity-50" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3 w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleGame(game.app_name)}
                        onClick={(e) => e.stopPropagation()}
                        className="accent-accent w-4 h-4 cursor-pointer"
                        aria-label={`Select ${game.app_name}`}
                      />
                    </td>
                    <td className="py-2.5 px-4 font-medium text-foreground">
                      {game.app_name}
                    </td>
                    <td className="py-2.5 px-4 text-muted hidden sm:table-cell">
                      {game.subcategory?.split(",")[0] ?? "—"}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-foreground">
                      {formatCurrency(game.total_revenue)}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums text-muted hidden sm:table-cell">
                      {formatNumber(game.total_downloads)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleConfirm}
          disabled={noneSelected}
          className="py-3 px-8 bg-accent text-background font-medium hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm selection
        </button>
        <button
          onClick={onBack}
          className="py-3 px-8 border border-border text-muted font-medium hover:bg-surface-hover transition-colors"
        >
          Try different email
        </button>
      </div>
    </div>
  );
}
