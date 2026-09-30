import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { getUserToolHistory } from "@/db/queries/history";
import { BIG_BRO_SYSTEM_PROMPT } from "@/core/ai/system-prompt";
import { buildHistoryPromptContext } from "@/core/ai/history-context";
import { checkRateLimit } from "@/core/tool-kit/runner";

const chatInputSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(50),
});

/**
 * Primary & fallback Flash models
 */
const FLASH_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest",
];

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required. Please sign in to access the AI Zone." },
      { status: 401 },
    );
  }

  // Rate limit: 25 requests per minute per user
  const allowed = checkRateLimit(`${userId}:ai-chat`, 25, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit reached. Please wait a moment before sending another message." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parseResult = chatInputSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid chat payload. Provide a valid messages array." },
      { status: 400 },
    );
  }

  const { messages } = parseResult.data;

  const apiKey =
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI service configuration error: GEMINI_API_KEY is missing on server." },
      { status: 500 },
    );
  }

  // Retrieve user's past 48-hour diagnostic history for context
  let historyContext = "";
  try {
    const recentHistory = await getUserToolHistory(userId, {
      timeRangeHours: 48,
      limit: 10,
    });
    historyContext = buildHistoryPromptContext(recentHistory);
  } catch (err) {
    console.warn("[AI Zone] Failed to load history context:", err);
  }

  const fullSystemInstruction = `${BIG_BRO_SYSTEM_PROMPT}\n\n${historyContext}`;

  const ai = new GoogleGenAI({ apiKey });

  // Map messages to Gemini contents format
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // Attempt streaming with primary model, fall back gracefully if experiencing spikes
  let streamResponse = null;
  let lastError: Error | null = null;

  for (const modelName of FLASH_MODELS) {
    try {
      streamResponse = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });
      break; // Success
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[AI Zone] Model ${modelName} unavailable, attempting fallback:`, err);
    }
  }

  if (!streamResponse) {
    console.error("[AI Zone] All Gemini Flash models failed:", lastError);
    return NextResponse.json(
      {
        error:
          "The AI Cyber Desk is currently experiencing high demand. Please try again in a few moments.",
      },
      { status: 503 },
    );
  }

  // Create UTF-8 readable stream to pipe chunks to the client
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamResponse) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        console.error("[AI Zone Stream Error]:", err);
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
