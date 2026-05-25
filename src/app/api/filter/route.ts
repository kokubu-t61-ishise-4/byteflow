import { NextRequest, NextResponse } from "next/server";

async function fetchArticleContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!response.ok) return "";

    const html = await response.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .slice(0, 5000);
  } catch {
    return "";
  }
}

export async function POST(request: NextRequest) {
  const { articleIds, articleUrls, keywords } = await request.json();

  if (!articleIds || !articleUrls || !keywords || keywords.length === 0) {
    return NextResponse.json({ matchedIds: articleIds || [] });
  }

  const matchedIds: string[] = [];

  // Process articles in parallel (limit to 10 concurrent)
  const batchSize = 10;
  for (let i = 0; i < articleUrls.length; i += batchSize) {
    const batch = articleUrls.slice(i, i + batchSize);
    const batchIds = articleIds.slice(i, i + batchSize);

    const contents = await Promise.all(
      batch.map((url: string) => fetchArticleContent(url))
    );

    contents.forEach((content, index) => {
      const allKeywordsMatch = keywords.every((kw: string) =>
        content.includes(kw.toLowerCase())
      );
      if (allKeywordsMatch) {
        matchedIds.push(batchIds[index]);
      }
    });
  }

  return NextResponse.json({ matchedIds });
}
