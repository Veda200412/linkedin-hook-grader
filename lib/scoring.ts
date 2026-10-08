export type RuleResult = {
  passed: boolean;
  ruleName: string;
  explanation: string;
};

export type ScoreResult = {
  score: number;
  rules: RuleResult[];
  failedRules: RuleResult[];
};

const weakOpeners = [
  /^i am excited to share/i,
  /^i am thrilled to share/i,
  /^today i want to talk about/i,
  /^today i want to share/i,
  /^i recently/i,
  /^here are some thoughts/i,
  /^here are my thoughts/i,
  /^here are a few thoughts/i,
  /^this is a post about/i,
];

const valueSignals = [
  "learn",
  "save",
  "avoid",
  "reduce",
  "mistake",
  "mistakes",
  "framework",
  "process",
  "strategy",
  "template",
  "checklist",
  "insight",
  "result",
  "lesson",
  "win",
  "growth",
  "tool",
  "system",
  "tactic",
  "hack",
  "secret",
  "warning",
];

const curiositySignals = [
  "why",
  "surprising",
  "secret",
  "most",
  "what nobody tells you",
  "here's why",
  "here is why",
  "most founders",
  "most teams",
  "why this",
  "the mistake",
];

function normalizeHook(hook: string) {
  return hook.trim().replace(/\s+/g, " ");
}

export function scoreHook(hook: string): ScoreResult {
  const cleanedHook = normalizeHook(hook);
  const wordCount = cleanedHook.split(" ").filter(Boolean).length;
  const hasNumber = /\d/.test(cleanedHook);
  const hasSpecificContext = /(vs|mistake|launch|team|client|project|sales|revenue|growth|lead|email|cost|error|customer|product|api|engineer|founder|startup|marketing|pipeline)/i.test(cleanedHook);
  const hasQuestion = /\?/.test(cleanedHook);
  const hasValueSignal = valueSignals.some((signal) => cleanedHook.toLowerCase().includes(signal));
  const hasCuriositySignal = curiositySignals.some((signal) => cleanedHook.toLowerCase().includes(signal));
  const hasWeakOpening = weakOpeners.some((pattern) => pattern.test(cleanedHook));

  const rules: RuleResult[] = [
    {
      passed: wordCount <= 42 && cleanedHook.length <= 260,
      ruleName: "Concise",
      explanation: "Keep the opening short enough to read in a glance.",
    },
    {
      passed: hasNumber || hasSpecificContext,
      ruleName: "Specific",
      explanation: "Use a concrete detail, metric, or real-world example.",
    },
    {
      passed: hasQuestion || hasCuriositySignal,
      ruleName: "Curiosity",
      explanation: "Create tension or intrigue that makes the reader continue.",
    },
    {
      passed: hasValueSignal,
      ruleName: "Value",
      explanation: "Signal a useful lesson, result, tool, or takeaway.",
    },
    {
      passed: !hasWeakOpening,
      ruleName: "Strong opening",
      explanation: "Avoid generic openings like 'I am excited to share...'",
    },
  ];

  const failedRules = rules.filter((rule) => !rule.passed);
  const score = rules.filter((rule) => rule.passed).length * 20;

  return {
    score,
    rules,
    failedRules,
  };
}
