"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Article } from "@/types/article";
import ArticleCard from "./ArticleCard";
import ArticleModal from "./ArticleModal";
import SearchFilter, { DEFAULT_TOPICS, Topic } from "./SearchFilter";

interface ArticleListProps {
  language: "ja" | "en";
  refreshTrigger: number;
  onRefreshStart: () => void;
  onRefreshEnd: () => void;
}

const ALL_SOURCES = ["qiita", "zenn", "hatena", "devto", "publickey"];
const STORAGE_KEY = "byteflow-custom-topics";

function getInitialTopics(): Topic[] {
  if (typeof window === "undefined") return DEFAULT_TOPICS;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const customTopics = JSON.parse(saved);
      return [...DEFAULT_TOPICS, ...customTopics];
    } catch {
      return DEFAULT_TOPICS;
    }
  }
  return DEFAULT_TOPICS;
}

export default function ArticleList({ language, refreshTrigger, onRefreshStart, onRefreshEnd }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>(ALL_SOURCES);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topics, setTopics] = useState<Topic[]>(DEFAULT_TOPICS);
  const [contentFilteredIds, setContentFilteredIds] = useState<string[] | null>(null);

  useEffect(() => {
    setTopics(getInitialTopics());
  }, []);

  const saveCustomTopics = (allTopics: Topic[]) => {
    const customTopics = allTopics.filter((t) => t.isCustom);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customTopics));
  };

  const handleAddTopic = (topic: Topic) => {
    const newTopics = [...topics, topic];
    setTopics(newTopics);
    saveCustomTopics(newTopics);
  };

  const handleRemoveTopic = (topicId: string) => {
    const newTopics = topics.filter((t) => t.id !== topicId);
    setTopics(newTopics);
    saveCustomTopics(newTopics);
    setSelectedTopics(selectedTopics.filter((t) => t !== topicId));
  };

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    onRefreshStart();

    const params = new URLSearchParams();
    params.set("sources", selectedSources.join(","));

    const response = await fetch(`/api/articles?${params.toString()}`);
    if (!response.ok) {
      setLoading(false);
      onRefreshEnd();
      return;
    }

    const data: Article[] = await response.json();
    setArticles(data);
    setContentFilteredIds(null);
    setLoading(false);
    onRefreshEnd();
  }, [selectedSources, onRefreshStart, onRefreshEnd]);

  // Filter by content when topics change
  useEffect(() => {
    const filterByContent = async () => {
      if (selectedTopics.length === 0) {
        setContentFilteredIds(null);
        return;
      }

      const selectedTopicObjects = topics.filter((t) => selectedTopics.includes(t.id));
      const allKeywords = selectedTopicObjects.flatMap((t) => t.keywords);

      // Get articles that don't match by title/tags
      const titleTagMatchedIds = articles
        .filter((article) => {
          const titleLower = article.title.toLowerCase();
          const tagsLower = article.tags.map((t) => t.toLowerCase());
          return selectedTopicObjects.every((topic) =>
            topic.keywords.some((keyword) =>
              titleLower.includes(keyword.toLowerCase()) ||
              tagsLower.some((tag) => tag.includes(keyword.toLowerCase()))
            )
          );
        })
        .map((a) => a.id);

      const remainingArticles = articles.filter((a) => !titleTagMatchedIds.includes(a.id));

      if (remainingArticles.length > 0 && remainingArticles.length <= 30) {
        setFiltering(true);
        try {
          const filterResponse = await fetch("/api/filter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              articleIds: remainingArticles.map((a) => a.id),
              articleUrls: remainingArticles.map((a) => a.url),
              keywords: allKeywords,
            }),
          });

          if (filterResponse.ok) {
            const { matchedIds } = await filterResponse.json();
            setContentFilteredIds([...titleTagMatchedIds, ...matchedIds]);
          } else {
            setContentFilteredIds(titleTagMatchedIds);
          }
        } catch {
          setContentFilteredIds(titleTagMatchedIds);
        }
        setFiltering(false);
      } else {
        setContentFilteredIds(titleTagMatchedIds);
      }
    };

    filterByContent();
  }, [articles, selectedTopics, topics]);

  useEffect(() => {
    fetchArticles();
  }, [refreshTrigger, selectedSources, fetchArticles]);

  const filteredArticles = useMemo(() => {
    let filtered = [...articles];

    // Filter by search keyword (title and tags)
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter((a) =>
        a.title.toLowerCase().includes(keyword) ||
        a.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    }

    // Filter by topics (using pre-computed content filter results)
    if (selectedTopics.length > 0 && contentFilteredIds !== null) {
      filtered = filtered.filter((a) => contentFilteredIds.includes(a.id));
    }

    return filtered;
  }, [articles, searchKeyword, selectedTopics, contentFilteredIds]);

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  if (loading && articles.length === 0) {
    return (
      <>
        <SearchFilter
          language={language}
          onSearch={handleSearch}
          onSourceChange={setSelectedSources}
          selectedSources={selectedSources}
          onTopicChange={setSelectedTopics}
          selectedTopics={selectedTopics}
          topics={topics}
          onAddTopic={handleAddTopic}
          onRemoveTopic={handleRemoveTopic}
        />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-3">
              <div className="flex items-start gap-3">
                <div className="skeleton w-1 h-10 rounded-full"></div>
                <div className="flex-1">
                  <div className="skeleton h-3 rounded w-24 mb-2"></div>
                  <div className="skeleton h-4 rounded w-3/4 mb-2"></div>
                  <div className="flex gap-1">
                    <div className="skeleton h-5 rounded w-12"></div>
                    <div className="skeleton h-5 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <SearchFilter
        language={language}
        onSearch={handleSearch}
        onSourceChange={setSelectedSources}
        selectedSources={selectedSources}
        onTopicChange={setSelectedTopics}
        selectedTopics={selectedTopics}
        topics={topics}
        onAddTopic={handleAddTopic}
        onRemoveTopic={handleRemoveTopic}
      />

      {/* Results count */}
      <div className="text-xs text-[#8b949e] mb-2 font-mono flex items-center gap-2">
        <span>// {filteredArticles.length} articles</span>
        {selectedTopics.length > 0 && (
          <span className="text-[#58a6ff]">(AND filter: {selectedTopics.length} topics)</span>
        )}
        {filtering && (
          <span className="text-[#d29922] flex items-center gap-1">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            filtering content...
          </span>
        )}
      </div>

      <div className="space-y-2">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-8 text-[#8b949e] font-mono">
            // No matching articles
          </div>
        ) : (
          filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => setSelectedArticle(article)}
            />
          ))
        )}
      </div>

      <ArticleModal
        article={selectedArticle}
        language={language}
        onClose={() => setSelectedArticle(null)}
      />
    </>
  );
}
