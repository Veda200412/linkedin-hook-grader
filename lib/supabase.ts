import { createClient } from "@supabase/supabase-js";

import type { RuleResult } from "@/lib/scoring";

export type FailedRuleRecord = {
  ruleName: string;
  explanation: string;
};

export type HookSessionPayload = {
  name: string;
  designation: string;
  email: string;
  hook: string;
  score: number;
  failed_rules: FailedRuleRecord[];
  rewrite_1: string;
  rewrite_2: string;
  rewrite_3: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false },
      })
    : null;

export const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      })
    : null;

export function formatFailedRules(failedRules: RuleResult[]): FailedRuleRecord[] {
  return failedRules.map((rule) => ({
    ruleName: rule.ruleName,
    explanation: rule.explanation,
  }));
}

export async function saveSession(payload: HookSessionPayload) {
  const client = supabaseAdmin ?? supabaseClient;

  if (!client) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY, to the environment.",
    );
  }

  const { error } = await client.from("linkedin_hook_sessions").insert({
    name: payload.name,
    designation: payload.designation,
    email: payload.email,
    hook: payload.hook,
    score: payload.score,
    failed_rules: payload.failed_rules,
    rewrite_1: payload.rewrite_1,
    rewrite_2: payload.rewrite_2,
    rewrite_3: payload.rewrite_3,
  });

  if (error) {
    throw new Error(`Unable to save the session to Supabase: ${error.message}`);
  }
}
