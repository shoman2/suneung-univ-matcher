"use client";

import { RecommendationResult } from "@/types/admissions";
import { X } from "lucide-react";

interface UniversityDetailModalProps {
  item: RecommendationResult | null;
  onClose: () => void;
}

export function UniversityDetailModal({
  item,
  onClose,
}: UniversityDetailModalProps) {
  if (!item) return null;

  const d = item.department;
  const minScale = Math.min(d.cutoff.reach - 20, item.convertedScore - 15);
  const maxScale = Math.max(d.cutoff.safe + 20, item.convertedScore + 15);
  const span = Math.max(1, maxScale - minScale);
  const toPercent = (val: number) =>
    Math.min(100, Math.max(0, ((val - minScale) / span) * 100));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
              <span>{d.group}군</span>
              <span>·</span>
              <span>{d.region}</span>
              <span>·</span>
              <span>{d.track}계열</span>
            </div>
            <h3 className="mt-1 text-xl font-bold text-slate-900">
              {d.university} {d.department}
            </h3>
          </div>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 내 점수 vs 컷 라인 시각화 */}
        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-slate-600">
              합격 예측선 대비 내 환산점수 위치
            </span>
            <span className="text-lg font-extrabold tabular-nums text-indigo-700">
              {item.convertedScore}점 ({item.judgment})
            </span>
          </div>

          <div className="relative mt-6 h-3 rounded-full bg-gradient-to-r from-rose-200 via-amber-200 via-blue-200 to-emerald-200">
            {[
              { label: "소신컷", value: d.cutoff.reach, color: "bg-amber-600" },
              { label: "적정컷", value: d.cutoff.fit, color: "bg-blue-600" },
              { label: "안정컷", value: d.cutoff.safe, color: "bg-emerald-600" },
            ].map((marker) => (
              <div
                key={marker.label}
                style={{ left: `${toPercent(marker.value)}%` }}
                className="absolute -top-1 -translate-x-1/2"
              >
                <div className={`h-5 w-1 rounded-full ${marker.color}`} />
                <div className="mt-1 whitespace-nowrap text-center text-[10px] font-semibold text-slate-600">
                  {marker.label} {marker.value}
                </div>
              </div>
            ))}

            <div
              style={{ left: `${toPercent(item.convertedScore)}%` }}
              className="absolute -top-6 -translate-x-1/2"
            >
              <div className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                나 ({item.convertedScore})
              </div>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-white p-2">
              <div className="text-slate-400">소신 기준</div>
              <div className="font-bold tabular-nums text-amber-700">
                {d.cutoff.reach}점
              </div>
            </div>
            <div className="rounded-lg bg-white p-2">
              <div className="text-slate-400">적정 기준</div>
              <div className="font-bold tabular-nums text-blue-700">
                {d.cutoff.fit}점
              </div>
            </div>
            <div className="rounded-lg bg-white p-2">
              <div className="text-slate-400">안정 기준</div>
              <div className="font-bold tabular-nums text-emerald-700">
                {d.cutoff.safe}점
              </div>
            </div>
          </div>
        </div>

        {/* 영역별 환산 세부 내역 */}
        <div className="mt-5">
          <h4 className="text-sm font-bold text-slate-900">영역별 환산 기여 점수</h4>
          <div className="mt-2.5 grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 p-2.5">
              <div className="text-slate-500">국어 ({d.weights.korean}%)</div>
              <div className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">
                {item.breakdown.korean}점
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-2.5">
              <div className="text-slate-500">수학 ({d.weights.math}%)</div>
              <div className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">
                {item.breakdown.math}점
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-2.5">
              <div className="text-slate-500">
                탐구 ({d.weights.inquiry}% · {d.inquiryCount}과목)
              </div>
              <div className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">
                {item.breakdown.inquiry}점
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-2.5">
              <div className="text-slate-500">
                영어 ({d.weights.english > 0 ? `${d.weights.english}%` : "가감점"})
              </div>
              <div className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">
                {item.breakdown.english}점
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-2.5">
              <div className="text-slate-500">선택과목 가산</div>
              <div className="mt-0.5 text-sm font-bold tabular-nums text-indigo-700">
                +{item.breakdown.bonusPoints}점
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-2.5">
              <div className="text-slate-500">한국사 가감</div>
              <div className="mt-0.5 text-sm font-bold tabular-nums text-slate-900">
                {item.breakdown.historyAdjustment}점
              </div>
            </div>
          </div>
        </div>

        {/* 입시 코멘트 & 추세 */}
        <div className="mt-5 space-y-2.5 text-xs">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-slate-800">
            <div className="font-bold text-indigo-900">내 점수 유불리 분석</div>
            <p className="mt-1 leading-relaxed">{item.advantageNote}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-slate-700">
            <div className="font-bold text-slate-900">모집 단위 특징 · 전년도 추이</div>
            <p className="mt-1 leading-relaxed">{d.recentTrend}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
