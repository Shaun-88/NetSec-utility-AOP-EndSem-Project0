import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit } from "@/core/tool-kit/runner";

const reportInputSchema = z.object({
  historyLogs: z.array(z.any()).max(50),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 reports per minute
  const allowed = await checkRateLimit(`${userId}:report-gen`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit reached." }, { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parseResult = reportInputSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { historyLogs } = parseResult.data;

  if (historyLogs.length === 0) {
    return NextResponse.json({ summary: "No intelligence data available for the last 48 hours." });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey });

  // Format logs for AI
  const formattedLogs = historyLogs.map((log, index) => {
    return `Log ${index + 1}:\nTool: ${log.toolId}\nTarget: ${log.target}\nStatus: ${log.status}\nData: ${JSON.stringify(log.outputData || {})}\nDate: ${new Date(log.ranAt).toISOString()}\n`;
  }).join("\n---\n");

  const systemInstruction = `You are Big Bro, a highly advanced, professional corporate cybersecurity AI.
Your task is to analyze the provided threat intelligence logs (from the last 48 hours) and produce a strictly professional, executive-level security summary.
- Tone: Formal, objective, authoritative, strictly professional. NO hacker slang, NO emojis, NO conversational filler.
- Format: A clean, structured executive summary. Do not use markdown headers (#). Use plain paragraphs or bullet points.
- Content Requirement: For every tool/scan found in the logs, you MUST first briefly explain what that specific test actually checks (e.g., 'A DNS Lookup verifies the public routing records of a domain'). Then, explain the user's specific results in plain, professional English.
- Focus: Highlight any critical vulnerabilities (like exposed ports, expired certificates, data breaches) and summarize benign activity clearly.
- Context: These logs represent the user's recent diagnostic scans.`;

  const FLASH_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
  ];

  let summary = "";
  let lastError = null;

  for (const modelName of FLASH_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Here are the latest telemetry logs:\n\n${formattedLogs}`,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      });
      summary = response.text || "";
      if (summary) break;
    } catch (err) {
      console.warn(`[Report Gen] Model ${modelName} failed, trying next...`);
      lastError = err;
    }
  }

  if (!summary) {
    console.error("[Report Gen] All AI models failed:", lastError);
    return NextResponse.json({ error: "Failed to generate AI summary. AI services might be temporarily unavailable." }, { status: 500 });
  }
    
  return NextResponse.json({ summary });
}
