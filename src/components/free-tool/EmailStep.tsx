"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { PublisherSearchResult } from "@/lib/types";

interface EmailStepProps {
  onSubmit: (email: string) => void;
  onCompanySelect: (publisherName: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function EmailStep({
  onSubmit,
  onCompanySelect,
  isLoading,
  error,
}: EmailStepProps) {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<PublisherSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isEmailMode = input.includes("@");

  const searchPublishers = useCallback(async (query: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/search-publisher?q=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );
      const data = await res.json();
      setResults(data.results ?? []);
      setShowDropdown(true);
      setActiveIndex(-1);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (isEmailMode || input.trim().length < 2 || isLoading) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      searchPublishers(input.trim());
    }, 250);

    return () => clearTimeout(timer);
  }, [input, isEmailMode, isLoading, searchPublishers]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEmailMode && input.trim()) {
      onSubmit(input.trim());
    }
  }

  function handleSelect(name: string) {
    setShowDropdown(false);
    setInput(name);
    onCompanySelect(name);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex].publisher_name);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (inputRef.current && !inputRef.current.contains(target)) {
        // If dropdown list exists, also allow clicks inside it
        if (!dropdownRef.current || !dropdownRef.current.contains(target)) {
          setShowDropdown(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.children;
      items[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const formatRevenue = (val: number) => {
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

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
        Enter your work email or company name and we&apos;ll calculate how much
        additional revenue your games could generate with Neon.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (results.length > 0 && !isEmailMode) setShowDropdown(true);
              }}
              placeholder="Email or company name..."
              className="w-full px-4 py-3 border border-border bg-surface text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
              disabled={isLoading}
              autoComplete="off"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="w-4 h-4 border-2 border-muted/30 border-t-muted rounded-full animate-spin block" />
              </div>
            )}
            {showDropdown && results.length > 0 && !isEmailMode && (
              <ul
                ref={dropdownRef}
                className="absolute z-50 w-full mt-1 border border-border bg-surface max-h-72 overflow-y-auto shadow-lg"
                role="listbox"
              >
                {results.map((r, i) => (
                  <li
                    key={r.publisher_name}
                    role="option"
                    aria-selected={i === activeIndex}
                    className={`px-4 py-3 cursor-pointer flex justify-between items-center transition-colors ${
                      i === activeIndex
                        ? "bg-accent/10 text-foreground"
                        : "text-foreground hover:bg-accent/5"
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(r.publisher_name)}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <span className="font-medium truncate mr-3">
                      {r.publisher_name}
                    </span>
                    <span className="text-xs text-muted whitespace-nowrap">
                      {r.game_count} {r.game_count === 1 ? "game" : "games"}{" "}
                      &middot; {formatRevenue(r.total_revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {showDropdown && !isSearching && results.length === 0 && input.trim().length >= 2 && !isEmailMode && (
              <div className="absolute z-50 w-full mt-1 border border-border bg-surface px-4 py-3 text-sm text-muted">
                No matches found
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-400 text-left">{error}</p>}
          {isEmailMode && (
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
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
          )}
        </div>
      </form>

      <p className="text-xs text-muted mt-8">
        We match your email domain or company name to our database of 2,600+
        mobile games to estimate your DTC revenue potential.
      </p>
    </div>
  );
}
