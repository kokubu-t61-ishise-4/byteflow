export interface Article {
  id: string;
  title: string;
  url: string;
  likes: number;
  tags: string[];
  createdAt: string;
  authorName: string;
  authorImage: string;
  source: "Qiita" | "Zenn" | "Dev.to" | "Hatena" | "Publickey";
  summary?: string;
  summaryEn?: string;
}
