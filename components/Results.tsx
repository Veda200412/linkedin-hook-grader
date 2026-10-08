type ResultsProps = {
  score: number;
  failedRules: Array<{ ruleName: string; explanation: string }>;
  rewrites: string[];
};

export function Results({ score, failedRules, rewrites }: ResultsProps) {
  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <h2 className="text-xl font-semibold text-slate-900">Your Results</h2>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
          Score: {score}/100
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-base font-semibold text-slate-800">Failed Rules</h3>
          {failedRules.length > 0 ? (
            <ul className="space-y-2 text-sm text-slate-600">
              {failedRules.map((rule) => (
                <li key={rule.ruleName} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span>
                    <strong className="font-medium text-slate-800">{rule.ruleName}</strong> — {rule.explanation}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-emerald-700">All five rules passed. Strong hook.</p>
          )}
        </div>

        <div className="pt-4">
          <h3 className="mb-3 text-base font-semibold text-slate-800">3 Better Hooks</h3>
          <div className="space-y-3">
            {rewrites.map((rewrite, index) => (
              <div key={`${rewrite}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Rewrite {index + 1}
                </p>
                <p className="text-sm leading-6 text-slate-700">{rewrite}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
