"use client";

import { useMemo, useState } from "react";

import { Results } from "@/components/Results";

type FormState = {
  name: string;
  designation: string;
  email: string;
  hook: string;
};

type ResponseData = {
  score: number;
  failedRules: Array<{ ruleName: string; explanation: string }>;
  rewrites: string[];
};

const initialForm: FormState = {
  name: "",
  designation: "",
  email: "",
  hook: "",
};

export function HookGrader() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<ResponseData | null>(null);

  const isFormComplete = useMemo(
    () => form.name.trim() && form.designation.trim() && form.email.trim() && form.hook.trim(),
    [form],
  );

  function updateField(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) {
      setError("");
    }
    if (results) {
      setResults(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedDesignation = form.designation.trim();
    const trimmedEmail = form.email.trim();
    const trimmedHook = form.hook.trim();

    if (!trimmedName || !trimmedDesignation || !trimmedEmail || !trimmedHook) {
      setError("Please complete all fields before grading your hook.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (trimmedHook.length < 20) {
      setError("Your LinkedIn hook should be at least 20 characters long.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/grade-hook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          designation: trimmedDesignation,
          email: trimmedEmail,
          hook: trimmedHook,
        }),
      });

      const data = (await response.json()) as ResponseData & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "We could not grade your hook right now.");
      }

      setResults({
        score: data.score,
        failedRules: data.failedRules || [],
        rewrites: data.rewrites || [],
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Something went wrong while grading the hook.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-8">
      <div className="mb-8 space-y-3">
        <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">
          Professional hook analysis
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          LinkedIn Hook Grader
        </h1>
        <p className="max-w-2xl text-base text-slate-600">
          Paste the first two lines of your LinkedIn post and get a score plus 3 stronger alternatives.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Name
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              placeholder="Your name"
              autoComplete="name"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Designation
            <input
              value={form.designation}
              onChange={(event) => updateField("designation", event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              placeholder="Marketing Lead"
              autoComplete="organization-title"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          LinkedIn Hook
          <textarea
            value={form.hook}
            onChange={(event) => updateField("hook", event.target.value)}
            className="min-h-36 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            placeholder="Paste the first two lines of your LinkedIn post here..."
          />
          <span className="text-xs text-slate-500">
            Paste the first two lines of your LinkedIn post, not the entire article.
          </span>
        </label>

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || !isFormComplete}
          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSubmitting ? "Grading..." : "Grade My Hook"}
        </button>
      </form>

      {results ? <Results score={results.score} failedRules={results.failedRules} rewrites={results.rewrites} /> : null}
    </div>
  );
}
