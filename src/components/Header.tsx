"use client";

import LanguageToggle from "./LanguageToggle";

interface HeaderProps {
  language: "ja" | "en";
  onLanguageChange: (lang: "ja" | "en") => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function Header({ language, onLanguageChange, onRefresh, isRefreshing }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--background)] border-b border-[var(--card-border)]">
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[var(--green)]">●</span>
            <span className="text-sm font-mono text-[var(--foreground)]">dev-feed</span>
            <span className="text-[var(--tag-text)]">/</span>
            <span className="text-sm text-[var(--accent)]">main</span>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--tag-text)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] rounded transition-colors disabled:opacity-50"
            title={language === "ja" ? "Fetch latest" : "Fetch latest"}
          >
            <svg
              className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>fetch</span>
          </button>
        </div>
        <LanguageToggle language={language} onChange={onLanguageChange} />
      </div>
    </header>
  );
}
