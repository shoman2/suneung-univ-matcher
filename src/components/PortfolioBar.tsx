"use client";

import { summarizePortfolio } from "@/lib/admissions";
import { AdmissionGroup, JudgmentLevel, RecommendationResult } from "@/types/admissions";
import { CheckCircle2, Compass, X } from "lucide-react";

interface PortfolioBarProps {
  portfolio: Partial<Record<AdmissionGroup, RecommendationResult>>;
  onRemove: (group: AdmissionGroup) => void;
  onInspect: (item: RecommendationResult) => void;
}

const JUDGMENT_BADGE: Record<JudgmentLevel, string> = {
  안정: "bg-emerald-100 text-emerald-800 border-emerald-200",
  적정: "bg-blue-100 text-blue-800 border-blue-200",
  소신: "bg-amber-100 text-amber-800 border-amber-200",
  상향: "bg-rose-100 text-rose-800 border-rose-200",
  지원제한: "bg-slate-200 text-slate-700 border-slate-300",
};

const TONE_STYLE: Record<string, string> = {
  balanced: "border-emerald-200 bg-emerald-50 text-emerald-900",
  conservative: "border-blue-200 bg-blue-50 text-blue-900",
  aggressive: "border-amber-200 bg-amber-50 text-amber-900",
  incomplete: "border-slate-200 bg-slate-50 text-slate-800",
};

export function PortfolioBar({
  portfolio,
  onRemove,
  onInspect,
}: PortfolioBarProps) {
  const summary = summarizePortfolio(portfolio);
  const groups: AdmissionGroup[] = ["가", "나", "다"];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">
            가·나·다군 3장 모의 지원 포트폴리오
          </h2>
        </div>
        <span className="text-xs text-slate-500">
          각 군에서 1개 학과씩 담아 지원 밸런스를 점검하세요
        </span>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {groups.map((group) => {
          const item = portfolio[group];
          if (!item) {
            return (
              <div
                key={group}
                className="flex min-h-[84px] flex-col justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-center"
              >
                <span className="text-xs font-bold text-slate-500">
                  {group}군 미선택
                </span>
                <span className="mt-1 text-[11px] text-slate-400">
                  아래 목록에서 &apos;포트폴리오 담기&apos;를 눌러 추가
                </span>
              </div>
            );
          }

          return (
            <div
              key={group}
              className="flex min-h-[84px] flex-col justify-between rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onInspect(item)}
                  className="text-left hover:underline"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {group}군
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {item.department.university}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs font-medium text-slate-700">
                    {item.department.department}
                  </div>
                </button>
                <button
                  type="button"
                  aria-label={`${group}군 제거`}
                  onClick={() => onRemove(group)}
                  className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                    JUDGMENT_BADGE[item.judgment]
                  }`}
                >
                  {item.judgment}
                  {item.probability > 0 ? ` (${item.probability}%)` : ""}
                </span>
                <span className="font-semibold tabular-nums text-slate-700">
                  환산 {item.convertedScore}점
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`mt-3 flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs ${
          TONE_STYLE[summary.tone]
        }`}
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <div className="font-bold">{summary.title}</div>
          <div className="mt-0.5 opacity-90">{summary.description}</div>
        </div>
      </div>
    </section>
  );
}
