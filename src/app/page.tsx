"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import ArticleList from "@/components/ArticleList";

export default function Home() {
  const [language, setLanguage] = useState<"ja" | "en">("ja");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleRefreshStart = useCallback(() => {
    setIsRefreshing(true);
  }, []);

  const handleRefreshEnd = useCallback(() => {
    setIsRefreshing(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-4">
        <ArticleList
          language={language}
          refreshTrigger={refreshTrigger}
          onRefreshStart={handleRefreshStart}
          onRefreshEnd={handleRefreshEnd}
        />
      </main>
      <footer className="border-t border-[var(--card-border)] py-2 text-center text-xs text-[var(--tag-text)]">
        <span className="font-mono">$ tail -f /var/log/tech-articles.log</span>
      </footer>
    </div>
  );
}
