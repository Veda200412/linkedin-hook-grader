import { NextResponse } from "next/server";

import { generateRewrites } from "@/lib/gemini";
import { scoreHook } from "@/lib/scoring";
import { formatFailedRules, saveSession } from "@/lib/supabase";

const inFlightRequests = new Set<string>();

function removeRepeatedHook(hook: string) {
  const midpoint = hook.length / 2;

  if (Number.isInteger(midpoint) && hook.slice(0, midpoint) === hook.slice(midpoint)) {
    return hook.slice(0, midpoint).trim();
  }

  return hook;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const designation = typeof body.designation === "string" ? body.designation.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const submittedHook = typeof body.hook === "string" ? body.hook.trim() : "";
  const hook = removeRepeatedHook(submittedHook);

  if (!name || !designation || !email || !hook) {
    return NextResponse.json({ error: "Name, designation, email and hook are required." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  if (hook.length < 20) {
    return NextResponse.json({ error: "The hook must be at least 20 characters long." }, { status: 400 });
  }

  const requestKey = email.toLowerCase();

  if (inFlightRequests.has(requestKey)) {
    return NextResponse.json(
      { error: "This submission is already being processed. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  inFlightRequests.add(requestKey);

  try {
    const scoreResult = scoreHook(hook);

    let rewrites: string[] = [];

    try {
      rewrites = await generateRewrites(hook);
    } catch (geminiError) {
      const message = geminiError instanceof Error ? geminiError.message : "Gemini failed to generate rewrites.";
      return NextResponse.json(
        {
          error: `Gemini could not generate rewrites. ${message}`,
        },
        { status: 502 },
      );
    }

    try {
      await saveSession({
        name,
        designation,
        email,
        hook,
        score: scoreResult.score,
        failed_rules: formatFailedRules(scoreResult.failedRules),
        rewrite_1: rewrites[0],
        rewrite_2: rewrites[1],
        rewrite_3: rewrites[2],
      });
    } catch (supabaseError) {
      const message = supabaseError instanceof Error ? supabaseError.message : "Supabase failed to save the session.";
      return NextResponse.json(
        {
          error: `Unable to save the session. ${message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      score: scoreResult.score,
      failedRules: scoreResult.failedRules.map((rule) => ({
        ruleName: rule.ruleName,
        explanation: rule.explanation,
      })),
      rewrites,
    });
  } finally {
    inFlightRequests.delete(requestKey);
  }
}
