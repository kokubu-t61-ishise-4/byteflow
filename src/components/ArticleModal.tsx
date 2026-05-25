"use client";

import { useState, useEffect } from "react";
import { Article } from "@/types/article";

interface ArticleModalProps {
  article: Article | null;
  language: "ja" | "en";
  onClose: () => void;
}

const SOURCE_COLORS: Record<string, string> = {
  Qiita: "var(--green)",
  Zenn: "var(--accent)",
  "Dev.to": "var(--purple)",
  Hatena: "var(--red)",
  Publickey: "var(--yellow)",
};

export default function ArticleModal({
  article,
  language,
  onClose,
}: ArticleModalProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [askingQuestion, setAskingQuestion] = useState(false);

  useEffect(() => {
    if (!article) return;

    setSummary(null);
    setAnswer(null);
    setQuestion("");

    const fetchSummary = async () => {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: article.url, language }),
      });

      if (!response.ok) {
        setError("// Error: Failed to fetch summary");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setSummary(data.summary);
      setLoading(false);
    };

    fetchSummary();
  }, [article, language]);

  const handleAskQuestion = async () => {
    if (!question.trim() || !article) return;

    setAskingQuestion(true);
    setAnswer(null);

    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: article.url,
        question: question.trim(),
        language,
      }),
    });

    if (!response.ok) {
      setAnswer("// Error: Failed to get response");
      setAskingQuestion(false);
      return;
    }

    const data = await response.json();
    setAnswer(data.answer);
    setAskingQuestion(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  if (!article) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--card-bg)] w-full sm:max-w-2xl sm:rounded-lg rounded-t-lg max-h-[90vh] overflow-hidden flex flex-col border border-[var(--card-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-2 border-b border-[var(--card-border)] flex items-center justify-between bg-[var(--background)]">
          <div className="flex items-center gap-2 text-xs">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: SOURCE_COLORS[article.source] }}
            />
            <span style={{ color: SOURCE_COLORS[article.source] }}>{article.source.toLowerCase()}</span>
            <span className="text-[var(--tag-text)]">/</span>
            <span className="text-[var(--foreground)] truncate max-w-[300px]">{article.title}</span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--tag-text)] hover:text-[var(--foreground)] text-xs"
          >
            [x] close
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {article.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Summary Section */}
          <div className="mb-4">
            <div className="text-xs text-[var(--accent)] mb-2 font-mono">
              {language === "ja" ? "// AI Summary" : "// AI Summary"}
            </div>
            {loading ? (
              <div className="space-y-2">
                <div className="skeleton h-3 rounded w-full"></div>
                <div className="skeleton h-3 rounded w-5/6"></div>
                <div className="skeleton h-3 rounded w-4/6"></div>
                <div className="skeleton h-3 rounded w-full mt-3"></div>
                <div className="skeleton h-3 rounded w-3/4"></div>
              </div>
            ) : error ? (
              <p className="text-[var(--red)] text-sm font-mono">{error}</p>
            ) : (
              <div className="text-sm whitespace-pre-wrap leading-relaxed text-[var(--foreground)]">
                {summary}
              </div>
            )}
          </div>

          {/* Question Section */}
          {!loading && summary && (
            <div className="border-t border-[var(--card-border)] pt-4">
              <div className="text-xs text-[var(--accent)] mb-2 font-mono">
                {language === "ja" ? "// Ask a question" : "// Ask a question"}
              </div>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tag-text)]">&gt;</span>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={language === "ja" ? "質問を入力..." : "Enter question..."}
                    className="w-full pl-7 pr-3 py-1.5 bg-[var(--background)] border border-[var(--card-border)] rounded text-sm font-mono focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--tag-text)]"
                    disabled={askingQuestion}
                  />
                </div>
                <button
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || askingQuestion}
                  className="btn-primary px-3 font-mono disabled:opacity-50"
                >
                  {askingQuestion ? "..." : "ask"}
                </button>
              </div>
              {answer && (
                <div className="p-3 bg-[var(--background)] rounded border border-[var(--card-border)]">
                  <div className="text-sm whitespace-pre-wrap text-[var(--foreground)]">
                    {answer}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[var(--card-border)] flex gap-2 bg-[var(--background)]">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 text-center font-mono text-xs"
          >
            open source →
          </a>
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-[var(--card-border)] rounded text-xs font-mono text-[var(--tag-text)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]"
          >
            esc
          </button>
        </div>
      </div>
    </div>
  );
}
