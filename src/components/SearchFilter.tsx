"use client";

import { useState, useEffect } from "react";

export interface Topic {
  id: string;
  label: string;
  keywords: string[];
  isCustom?: boolean;
}

interface SearchFilterProps {
  language: "ja" | "en";
  onSearch: (keyword: string) => void;
  onSourceChange: (sources: string[]) => void;
  selectedSources: string[];
  onTopicChange: (topics: string[]) => void;
  selectedTopics: string[];
  topics: Topic[];
  onAddTopic: (topic: Topic) => void;
  onRemoveTopic: (topicId: string) => void;
}

const SOURCES = [
  { id: "qiita", label: "qiita", color: "#3fb950" },
  { id: "zenn", label: "zenn", color: "#58a6ff" },
  { id: "hatena", label: "hatena", color: "#f85149" },
  { id: "devto", label: "dev.to", color: "#a371f7" },
  { id: "publickey", label: "publickey", color: "#d29922" },
];

export const DEFAULT_TOPICS: Topic[] = [
  {
    id: "vscode-ai",
    label: "VS Code × AI",
    keywords: ["vscode", "vs code", "claude", "cline", "copilot", "cursor", "claude code", "claudecode", "aider", "continue", "windsurf"]
  },
  {
    id: "monetize",
    label: "マネタイズ",
    keywords: ["マネタイズ", "収益", "副業", "稼ぐ", "monetize", "revenue", "income", "売上", "収入", "収益化"]
  },
  {
    id: "free-tools",
    label: "無料ツール",
    keywords: ["無料", "free", "oss", "オープンソース", "open source", "タダ", "0円", "無償"]
  },
  {
    id: "ai-dev",
    label: "AI開発",
    keywords: ["ai", "機械学習", "llm", "gpt", "gemini", "claude", "chatgpt", "生成ai", "rag", "langchain"]
  },
  {
    id: "web-dev",
    label: "Web開発",
    keywords: ["react", "next", "vue", "typescript", "javascript", "frontend", "backend", "api", "node"]
  },
  {
    id: "infra",
    label: "インフラ",
    keywords: ["docker", "kubernetes", "aws", "gcp", "azure", "terraform", "linux", "devops", "ci/cd"]
  },
];

export default function SearchFilter({
  language,
  onSearch,
  onSourceChange,
  selectedSources,
  onTopicChange,
  selectedTopics,
  topics,
  onAddTopic,
  onRemoveTopic,
}: SearchFilterProps) {
  const [keyword, setKeyword] = useState("");
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(true);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTopicLabel, setNewTopicLabel] = useState("");
  const [newTopicKeywords, setNewTopicKeywords] = useState("");

  const handleSearch = () => {
    onSearch(keyword.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setKeyword("");
    onSearch("");
  };

  const toggleSource = (sourceId: string) => {
    if (selectedSources.includes(sourceId)) {
      if (selectedSources.length > 1) {
        onSourceChange(selectedSources.filter((s) => s !== sourceId));
      }
    } else {
      onSourceChange([...selectedSources, sourceId]);
    }
  };

  const toggleTopic = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      onTopicChange(selectedTopics.filter((t) => t !== topicId));
    } else {
      onTopicChange([...selectedTopics, topicId]);
    }
  };

  const clearTopics = () => {
    onTopicChange([]);
  };

  const handleAddTopic = () => {
    if (!newTopicLabel.trim() || !newTopicKeywords.trim()) return;

    const newTopic: Topic = {
      id: `custom-${Date.now()}`,
      label: newTopicLabel.trim(),
      keywords: newTopicKeywords.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean),
      isCustom: true,
    };

    onAddTopic(newTopic);
    setNewTopicLabel("");
    setNewTopicKeywords("");
    setShowAddForm(false);
  };

  return (
    <div className="card p-3 mb-3">
      {/* Search Bar */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]">$</span>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="grep -i 'keyword'"
            className="w-full pl-7 pr-8 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-sm font-mono focus:outline-none focus:border-[#58a6ff] text-[#c9d1d9]"
          />
          {keyword && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#c9d1d9]"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="btn-primary px-3 font-mono"
        >
          run
        </button>
      </div>

      {/* Topic Filter */}
      <div className="mb-3 pb-3 border-b border-[#30363d]">
        <button
          onClick={() => setIsTopicsExpanded(!isTopicsExpanded)}
          className="flex items-center justify-between w-full mb-2 text-left"
        >
          <span className="text-[#8b949e] text-xs font-mono flex items-center gap-2">
            <svg
              className={`w-3 h-3 transition-transform ${isTopicsExpanded ? "rotate-90" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            // topics {selectedTopics.length > 0 && `(${selectedTopics.length} active, AND)`}
          </span>
          {selectedTopics.length > 0 && (
            <span
              onClick={(e) => { e.stopPropagation(); clearTopics(); }}
              className="text-xs text-[#58a6ff] hover:underline font-mono"
            >
              clear
            </span>
          )}
        </button>

        {isTopicsExpanded && (
          <>
            <div className="flex flex-wrap gap-2 mb-2">
              {topics.map((topic) => (
                <div key={topic.id} className="flex items-center">
                  <button
                    onClick={() => toggleTopic(topic.id)}
                    className={`px-2 py-1 rounded-l text-xs font-mono transition-colors ${
                      selectedTopics.includes(topic.id)
                        ? "bg-[#58a6ff] text-[#0d1117]"
                        : "bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d]"
                    }`}
                  >
                    {topic.label}
                  </button>
                  {topic.isCustom && (
                    <button
                      onClick={() => onRemoveTopic(topic.id)}
                      className="px-1 py-1 bg-[#21262d] text-[#8b949e] hover:text-[#f85149] hover:bg-[#30363d] rounded-r border-l border-[#30363d] text-xs"
                      title="削除"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-2 py-1 rounded text-xs font-mono bg-[#21262d] text-[#3fb950] hover:bg-[#30363d] border border-dashed border-[#3fb950]"
              >
                + add
              </button>
            </div>

            {/* Add Topic Form */}
            {showAddForm && (
              <div className="p-2 bg-[#0d1117] rounded border border-[#30363d] space-y-2">
                <input
                  type="text"
                  value={newTopicLabel}
                  onChange={(e) => setNewTopicLabel(e.target.value)}
                  placeholder="トピック名 (例: データ分析)"
                  className="w-full px-2 py-1 bg-[#161b22] border border-[#30363d] rounded text-xs font-mono focus:outline-none focus:border-[#58a6ff] text-[#c9d1d9]"
                />
                <input
                  type="text"
                  value={newTopicKeywords}
                  onChange={(e) => setNewTopicKeywords(e.target.value)}
                  placeholder="キーワード (カンマ区切り: pandas, データ分析, sql)"
                  className="w-full px-2 py-1 bg-[#161b22] border border-[#30363d] rounded text-xs font-mono focus:outline-none focus:border-[#58a6ff] text-[#c9d1d9]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTopic}
                    disabled={!newTopicLabel.trim() || !newTopicKeywords.trim()}
                    className="px-2 py-1 bg-[#3fb950] text-[#0d1117] rounded text-xs font-mono disabled:opacity-50"
                  >
                    add
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewTopicLabel(""); setNewTopicKeywords(""); }}
                    className="px-2 py-1 text-[#8b949e] hover:text-[#c9d1d9] text-xs font-mono"
                  >
                    cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Source Filter */}
      <div>
        <button
          onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
          className="flex items-center gap-2 text-[#8b949e] text-xs font-mono mb-2"
        >
          <svg
            className={`w-3 h-3 transition-transform ${isSourcesExpanded ? "rotate-90" : ""}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          sources: [{selectedSources.length}/{SOURCES.length}]
        </button>

        {isSourcesExpanded && (
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((source) => (
              <button
                key={source.id}
                onClick={() => toggleSource(source.id)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  selectedSources.includes(source.id)
                    ? "bg-[#21262d] border border-[#30363d]"
                    : "text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: selectedSources.includes(source.id) ? source.color : "#8b949e",
                    opacity: selectedSources.includes(source.id) ? 1 : 0.4,
                  }}
                />
                {source.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
