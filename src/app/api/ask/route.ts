import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: NextRequest) {
  const { url, question, language } = await request.json();

  if (!url || !question) {
    return NextResponse.json({ error: "URL and question are required" }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "Groq API key not configured" },
      { status: 500 }
    );
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

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
      ? `Based on the following technical article, answer this question concisely and clearly.

Question: ${question}

Article content:
${textContent}

Answer the question directly. If the article doesn't contain relevant information, say so. Keep the answer easy to understand for someone learning IT.`
      : `以下の技術記事の内容に基づいて、質問に簡潔に答えてください。

質問: ${question}

記事の内容:
${textContent}

質問に直接答えてください。記事に関連する情報がない場合は、その旨を伝えてください。IT初心者にも分かりやすく回答してください。`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 1024,
  });

  const answer = completion.choices[0]?.message?.content ||
    (language === "ja" ? "回答を生成できませんでした" : "Failed to generate answer");

  return NextResponse.json({ answer });
}
