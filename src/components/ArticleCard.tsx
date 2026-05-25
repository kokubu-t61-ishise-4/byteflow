"use client";

import { Article } from "@/types/article";

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const SOURCE_COLORS: Record<string, string> = {
  Qiita: "var(--green)",
  Zenn: "var(--accent)",
  "Dev.to": "var(--purple)",
  Hatena: "var(--red)",
  Publickey: "var(--yellow)",
};

export default function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <div className="card p-3 cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-3">
        <div
          className="w-1 h-full min-h-[40px] rounded-full flex-shrink-0"
          style={{ backgroundColor: SOURCE_COLORS[article.source] || "var(--tag-text)" }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 text-xs">
            <span style={{ color: SOURCE_COLORS[article.source] }}>
              [{article.source.toLowerCase()}]
            </span>
            <span className="text-[var(--tag-text)]">{formatDate(article.createdAt)}</span>
            {article.likes > 0 && (
              <span className="text-[var(--tag-text)]">+{article.likes}</span>
            )}
          </div>
          <h3 className="text-sm leading-tight mb-1.5 text-[var(--foreground)] hover:text-[var(--accent)] transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {article.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
