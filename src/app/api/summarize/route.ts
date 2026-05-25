import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  const { url, language } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "Groq API key not configured" },
      { status: 500 }
    );
  }

  const articleResponse = await fetch(url);
  if (!articleResponse.ok) {
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }

  const html = await articleResponse.text();
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);

  const prompt =
    language === "en"
      ? `Summarize the following technical article in English. Provide:
1. A brief overview (2-3 sentences)
2. 3-5 key points as bullet points
3. Why this is useful to know

Keep it concise and easy to understand for someone learning IT.

Article content:
${textContent}`
      : `以下の技術記事を日本語で要約してください。以下の形式で回答してください：
1. 概要（2〜3文）
2. ポイント（3〜5個の箇条書き）
3. なぜこれを知っておくと良いか

IT初心者でも分かりやすく、簡潔にまとめてください。

記事の内容:
${textContent}`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 1024,
  });

  const summary = completion.choices[0]?.message?.content || "要約を生成できませんでした";

  return NextResponse.json({ summary });
}
