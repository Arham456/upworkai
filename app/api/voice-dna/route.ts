import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SYSTEM_PROMPT =
  "You are a writing style analyst. Analyze proposal samples and extract the writer's Voice DNA. Return ONLY valid JSON.";

interface VoiceDNA {
  avgSentenceLength: "short" | "medium" | "long";
  tone: "direct" | "formal" | "casual" | "confident" | "warm";
  phrasesNeverUsed: string[];
  phrasesAlwaysUsed: string[];
  structurePattern: string;
  uniqueCharacteristics: string[];
  analyzedAt: string;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error: ANTHROPIC_API_KEY is not set" },
        { status: 500 },
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { sampleProposals: true },
    });

    if (!profile || profile.sampleProposals.length === 0) {
      return NextResponse.json(
        { error: "No sample proposals found in profile." },
        { status: 400 },
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const userMessage = `Analyze the following proposal samples and extract the writer's Voice DNA. Return a JSON object with these exact keys:
{
  "avgSentenceLength": "<'short' | 'medium' | 'long'>",
  "tone": "<'direct' | 'formal' | 'casual' | 'confident' | 'warm'>",
  "phrasesNeverUsed": ["<3-5 cliché phrases this writer avoids>"],
  "phrasesAlwaysUsed": ["<3-5 actual phrases/patterns this writer uses>"],
  "structurePattern": "<string describing their typical proposal structure>",
  "uniqueCharacteristics": ["<3-5 unique things about their writing style>"],
  "analyzedAt": "<ISO date string>"
}

Proposal samples:
${profile.sampleProposals.join("\n\n---\n\n")}`;

    const message = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No text response from AI" }, { status: 500 });
    }

    let voiceDNA: VoiceDNA;
    try {
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found in response");
      voiceDNA = JSON.parse(jsonMatch[0]) as VoiceDNA;
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response." },
        { status: 500 },
      );
    }

    await prisma.profile.update({
      where: { userId: session.user.id },
      data: { voiceDNA: voiceDNA as unknown as import("@prisma/client").Prisma.InputJsonValue },
    });

    return NextResponse.json(voiceDNA);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
