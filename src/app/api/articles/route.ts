import { NextRequest, NextResponse } from "next/server";
import { Article } from "@/types/article";

interface QiitaArticle {
  id: string;
  title: string;
  url: string;
  likes_count: number;
  tags: { name: string }[];
  created_at: string;
  user: { id: string; name: string; profile_image_url: string };
}

interface ZennArticle {
  id: number;
  title: string;
  path: string;
  liked_count: number;
  published_at: string;
  user: { username: string; avatar_small_url: string };
}

interface DevtoArticle {
  id: number;
  title: string;
  url: string;
  positive_reactions_count: number;
  tag_list: string[];
  published_at: string;
  user: { name: string; profile_image: string };
}

async function fetchQiita(): Promise<Article[]> {
  const response = await fetch(
    "https://qiita.com/api/v2/items?page=1&per_page=30",
    { next: { revalidate: 0 } }
  );
  if (!response.ok) return [];

  const articles: QiitaArticle[] = await response.json();
  return articles.map((a) => ({
    id: `qiita-${a.id}`,
    title: a.title,
    url: a.url,
    likes: a.likes_count,
    tags: a.tags.map((t) => t.name.toLowerCase()),
    createdAt: a.created_at,
    authorName: a.user.name || a.user.id,
    authorImage: a.user.profile_image_url,
    source: "Qiita" as const,
  }));
}

async function fetchZenn(): Promise<Article[]> {
  const response = await fetch(
    "https://zenn.dev/api/articles?order=latest&count=30",
    { next: { revalidate: 0 } }
  );
  if (!response.ok) return [];

  const data = await response.json();
  const articles: ZennArticle[] = data.articles || [];
  return articles.map((a) => ({
    id: `zenn-${a.id}`,
    title: a.title,
    url: `https://zenn.dev${a.path}`,
    likes: a.liked_count,
    tags: [],
    createdAt: a.published_at,
    authorName: a.user.username,
    authorImage: a.user.avatar_small_url,
    source: "Zenn" as const,
  }));
}

async function fetchDevto(): Promise<Article[]> {
  const response = await fetch(
    "https://dev.to/api/articles?per_page=30&top=1",
    { next: { revalidate: 0 } }
  );
  if (!response.ok) return [];

  const articles: DevtoArticle[] = await response.json();
  return articles.map((a) => ({
    id: `devto-${a.id}`,
    title: a.title,
    url: a.url,
    likes: a.positive_reactions_count,
    tags: a.tag_list.map((t) => t.toLowerCase()),
    createdAt: a.published_at,
    authorName: a.user.name,
    authorImage: a.user.profile_image,
    source: "Dev.to" as const,
  }));
}

async function fetchHatena(): Promise<Article[]> {
  const response = await fetch(
    "https://b.hatena.ne.jp/hotentry/it.rss",
    { next: { revalidate: 0 } }
  );
  if (!response.ok) return [];

  const text = await response.text();
  const items: Article[] = [];
  const itemMatches = text.match(/<item>[\s\S]*?<\/item>/g) || [];

  for (let i = 0; i < Math.min(itemMatches.length, 30); i++) {
    const item = itemMatches[i];
    const title = item.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1] || "";
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
    const bookmarkCount = item.match(/<hatena:bookmarkcount>(\d+)<\/hatena:bookmarkcount>/)?.[1] || "0";
    const date = item.match(/<dc:date>(.*?)<\/dc:date>/)?.[1] || new Date().toISOString();

    if (title && link) {
      items.push({
        id: `hatena-${i}-${Date.now()}`,
        title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
        url: link,
        likes: parseInt(bookmarkCount, 10),
        tags: [],
        createdAt: date,
        authorName: "はてブ",
        authorImage: "https://b.hatena.ne.jp/favicon.ico",
        source: "Hatena" as const,
      });
    }
  }
  return items;
}

async function fetchPublickey(): Promise<Article[]> {
  const response = await fetch(
    "https://www.publickey1.jp/atom.xml",
    { next: { revalidate: 0 } }
  );
  if (!response.ok) return [];

  const text = await response.text();
  const items: Article[] = [];
  const entryMatches = text.match(/<entry>[\s\S]*?<\/entry>/g) || [];

  for (let i = 0; i < Math.min(entryMatches.length, 20); i++) {
    const entry = entryMatches[i];
    const title = entry.match(/<title[^>]*>(.*?)<\/title>/)?.[1] || "";
    const link = entry.match(/<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1] || "";
    const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || new Date().toISOString();

    if (title && link) {
      items.push({
        id: `publickey-${i}-${Date.now()}`,
        title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
        url: link,
        likes: 0,
        tags: [],
        createdAt: published,
        authorName: "Publickey",
        authorImage: "https://www.publickey1.jp/favicon.ico",
        source: "Publickey" as const,
      });
    }
  }
  return items;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sources = searchParams.get("sources")?.split(",") || ["qiita", "zenn", "devto", "hatena", "publickey"];

  const fetchPromises: Promise<Article[]>[] = [];

  if (sources.includes("qiita")) fetchPromises.push(fetchQiita());
  if (sources.includes("zenn")) fetchPromises.push(fetchZenn());
  if (sources.includes("devto")) fetchPromises.push(fetchDevto());
  if (sources.includes("hatena")) fetchPromises.push(fetchHatena());
  if (sources.includes("publickey")) fetchPromises.push(fetchPublickey());

  const results = await Promise.all(fetchPromises);
  const articles = results.flat();

  // Sort by date (newest first)
  articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(articles);
}
