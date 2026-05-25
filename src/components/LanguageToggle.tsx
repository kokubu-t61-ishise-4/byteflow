"use client";

interface LanguageToggleProps {
  language: "ja" | "en";
  onChange: (lang: "ja" | "en") => void;
}

export default function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-[var(--tag-text)]">lang:</span>
      <button
        onClick={() => onChange("ja")}
        className={`px-2 py-0.5 rounded transition-colors ${
          language === "ja"
            ? "bg-[var(--accent)] text-[var(--background)]"
            : "text-[var(--tag-text)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]"
        }`}
      >
        ja
      </button>
      <button
        onClick={() => onChange("en")}
        className={`px-2 py-0.5 rounded transition-colors ${
          language === "en"
            ? "bg-[var(--accent)] text-[var(--background)]"
            : "text-[var(--tag-text)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]"
        }`}
      >
        en
      </button>
    </div>
  );
}
