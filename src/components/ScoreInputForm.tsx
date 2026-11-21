"use client";

import {
  InquiryCategory,
  KoreanElective,
  MathElective,
  SCIENCE_INQUIRY_SUBJECTS,
  SCORE_PRESETS,
  SOCIAL_INQUIRY_SUBJECTS,
  StudentScores,
} from "@/types/admissions";
import { RotateCcw, Sparkles } from "lucide-react";

interface ScoreInputFormProps {
  scores: StudentScores;
  onChange: (next: StudentScores) => void;
  onApplyPreset: (presetId: string) => void;
  activePresetId: string | null;
}

function clampNumber(raw: string, min: number, max: number): number {
  const num = Number(raw);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, Math.round(num)));
}

export function ScoreInputForm({
  scores,
  onChange,
  onApplyPreset,
  activePresetId,
}: ScoreInputFormProps) {
  const totalStdScore =
    scores.korean.standardScore +
    scores.math.standardScore +
    scores.inquiry1.standardScore +
    scores.inquiry2.standardScore;

  const avgPercentile = (
    (scores.korean.percentile +
      scores.math.percentile +
      (scores.inquiry1.percentile + scores.inquiry2.percentile) / 2) /
    3
  ).toFixed(1);

  const updateInquiryCategory = (
    slot: "inquiry1" | "inquiry2",
    category: InquiryCategory
  ) => {
    const defaultSubject =
      category === "사회탐구"
        ? SOCIAL_INQUIRY_SUBJECTS[0]
        : SCIENCE_INQUIRY_SUBJECTS[0];
    onChange({
      ...scores,
      [slot]: {
        ...scores[slot],
        category,
        subject: defaultSubject,
      },
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">수능 성적 입력</h2>
          <p className="text-xs text-slate-500">
            표준점수·백분위·등급을 입력하면 대학별 환산 점수가 실시간 계산됩니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onApplyPreset(SCORE_PRESETS[2].id)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          기본값
        </button>
      </div>

      {/* 빠른 성적 프리셋 */}
      <div className="mt-4">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          샘플 성적표로 바로 체험하기
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SCORE_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset(preset.id)}
                className={`rounded-xl border p-2.5 text-left transition ${
                  isActive
                    ? "border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600"
                    : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-800">
                    {preset.label}
                  </span>
                  <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                    {preset.badge}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 성적 요약 KPI */}
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-900 p-3 text-white">
        <div>
          <div className="text-[11px] text-slate-300">국수탐 표점 합</div>
          <div className="mt-0.5 text-lg font-bold tabular-nums">
            {totalStdScore}점
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-300">국수탐 백분위 평균</div>
          <div className="mt-0.5 text-lg font-bold tabular-nums text-emerald-300">
            {avgPercentile}%
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-300">영어 / 한국사</div>
          <div className="mt-0.5 text-lg font-bold tabular-nums">
            {scores.englishGrade} / {scores.historyGrade}등급
          </div>
        </div>
      </div>

      {/* 영역별 입력 */}
      <div className="mt-5 space-y-4">
        {/* 국어 */}
        <div className="rounded-xl border border-slate-200 p-3.5">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-slate-800">국어</span>
            <select
              aria-label="국어 선택과목"
              value={scores.korean.elective}
              onChange={(e) =>
                onChange({
                  ...scores,
                  korean: {
                    ...scores.korean,
                    elective: e.target.value as KoreanElective,
                  },
                })
              }
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="언어와 매체">언어와 매체</option>
              <option value="화법과 작문">화법과 작문</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <label className="block">
              <span className="text-[11px] text-slate-500">표준점수</span>
              <input
                type="number"
                min={40}
                max={200}
                value={scores.korean.standardScore}
                onChange={(e) =>
                  onChange({
                    ...scores,
                    korean: {
                      ...scores.korean,
                      standardScore: clampNumber(e.target.value, 40, 200),
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-semibold tabular-nums text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[11px] text-slate-500">백분위</span>
              <input
                type="number"
                min={0}
                max={100}
                value={scores.korean.percentile}
                onChange={(e) =>
                  onChange({
                    ...scores,
                    korean: {
                      ...scores.korean,
                      percentile: clampNumber(e.target.value, 0, 100),
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-semibold tabular-nums text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[11px] text-slate-500">등급</span>
              <select
                value={scores.korean.grade}
                onChange={(e) =>
                  onChange({
                    ...scores,
                    korean: {
                      ...scores.korean,
                      grade: Number(e.target.value),
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                  <option key={g} value={g}>
                    {g}등급
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* 수학 */}
        <div className="rounded-xl border border-slate-200 p-3.5">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-slate-800">수학</span>
            <select
              aria-label="수학 선택과목"
              value={scores.math.elective}
              onChange={(e) =>
                onChange({
                  ...scores,
                  math: {
                    ...scores.math,
                    elective: e.target.value as MathElective,
                  },
                })
              }
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="미적분">미적분</option>
              <option value="기하">기하</option>
              <option value="확률과 통계">확률과 통계</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <label className="block">
              <span className="text-[11px] text-slate-500">표준점수</span>
              <input
                type="number"
                min={40}
                max={200}
                value={scores.math.standardScore}
                onChange={(e) =>
                  onChange({
                    ...scores,
                    math: {
                      ...scores.math,
                      standardScore: clampNumber(e.target.value, 40, 200),
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-semibold tabular-nums text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[11px] text-slate-500">백분위</span>
              <input
                type="number"
                min={0}
                max={100}
                value={scores.math.percentile}
                onChange={(e) =>
                  onChange({
                    ...scores,
                    math: {
                      ...scores.math,
                      percentile: clampNumber(e.target.value, 0, 100),
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-semibold tabular-nums text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[11px] text-slate-500">등급</span>
              <select
                value={scores.math.grade}
                onChange={(e) =>
                  onChange({
                    ...scores,
                    math: {
                      ...scores.math,
                      grade: Number(e.target.value),
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                  <option key={g} value={g}>
                    {g}등급
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* 영어 & 한국사 */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-3.5">
          <label className="block">
            <span className="text-xs font-bold text-slate-800">영어 (절대평가)</span>
            <select
              value={scores.englishGrade}
              onChange={(e) =>
                onChange({
                  ...scores,
                  englishGrade: Number(e.target.value),
                })
              }
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                <option key={g} value={g}>
                  {g}등급
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-800">한국사 (절대평가)</span>
            <select
              value={scores.historyGrade}
              onChange={(e) =>
                onChange({
                  ...scores,
                  historyGrade: Number(e.target.value),
                })
              }
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                <option key={g} value={g}>
                  {g}등급
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* 탐구 1, 탐구 2 */}
        {(["inquiry1", "inquiry2"] as const).map((slot, idx) => {
          const item = scores[slot];
          const subjects =
            item.category === "사회탐구"
              ? SOCIAL_INQUIRY_SUBJECTS
              : SCIENCE_INQUIRY_SUBJECTS;
          return (
            <div key={slot} className="rounded-xl border border-slate-200 p-3.5">
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-800">
                  탐구 {idx + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <select
                    aria-label={`탐구 ${idx + 1} 계열`}
                    value={item.category}
                    onChange={(e) =>
                      updateInquiryCategory(slot, e.target.value as InquiryCategory)
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="사회탐구">사탐</option>
                    <option value="과학탐구">과탐</option>
                  </select>
                  <select
                    aria-label={`탐구 ${idx + 1} 과목`}
                    value={item.subject}
                    onChange={(e) =>
                      onChange({
                        ...scores,
                        [slot]: { ...item, subject: e.target.value },
                      })
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                  >
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <label className="block">
                  <span className="text-[11px] text-slate-500">표준점수</span>
                  <input
                    type="number"
                    min={20}
                    max={100}
                    value={item.standardScore}
                    onChange={(e) =>
                      onChange({
                        ...scores,
                        [slot]: {
                          ...item,
                          standardScore: clampNumber(e.target.value, 20, 100),
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-semibold tabular-nums text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] text-slate-500">백분위</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={item.percentile}
                    onChange={(e) =>
                      onChange({
                        ...scores,
                        [slot]: {
                          ...item,
                          percentile: clampNumber(e.target.value, 0, 100),
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-semibold tabular-nums text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] text-slate-500">등급</span>
                  <select
                    value={item.grade}
                    onChange={(e) =>
                      onChange({
                        ...scores,
                        [slot]: { ...item, grade: Number(e.target.value) },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                      <option key={g} value={g}>
                        {g}등급
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
