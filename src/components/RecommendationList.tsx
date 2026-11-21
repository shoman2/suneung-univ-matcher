"use client";

import {
  AcademicTrack,
  AdmissionGroup,
  JudgmentLevel,
  RecommendationResult,
  Region,
} from "@/types/admissions";
import { ArrowUpRight, BookmarkCheck, BookmarkPlus, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface RecommendationListProps {
  results: RecommendationResult[];
  portfolio: Partial<Record<AdmissionGroup, RecommendationResult>>;
  onTogglePortfolio: (item: RecommendationResult) => void;
  onSelectDetail: (item: RecommendationResult) => void;
}

type SortOption = "recommended" | "probability" | "cutoff" | "diff";

const JUDGMENT_STYLE: Record<JudgmentLevel, string> = {
  안정: "bg-emerald-100 text-emerald-800 border-emerald-200",
  적정: "bg-blue-100 text-blue-800 border-blue-200",
  소신: "bg-amber-100 text-amber-800 border-amber-200",
  상향: "bg-rose-100 text-rose-800 border-rose-200",
  지원제한: "bg-slate-200 text-slate-700 border-slate-300",
};

export function RecommendationList({
  results,
  portfolio,
  onTogglePortfolio,
  onSelectDetail,
}: RecommendationListProps) {
  const [groupFilter, setGroupFilter] = useState<"전체" | AdmissionGroup>("전체");
  const [trackFilter, setTrackFilter] = useState<"전체" | AcademicTrack>("전체");
  const [regionFilter, setRegionFilter] = useState<"전체" | Region>("전체");
  const [judgmentFilter, setJudgmentFilter] = useState<"전체" | JudgmentLevel>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");

  const summaryCounts = useMemo(() => {
    const counts: Record<JudgmentLevel, number> = {
      안정: 0,
      적정: 0,
      소신: 0,
      상향: 0,
      지원제한: 0,
    };
    for (const r of results) {
      counts[r.judgment] += 1;
    }
    return counts;
  }, [results]);

  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = results.filter((item) => {
      const d = item.department;
      if (groupFilter !== "전체" && d.group !== groupFilter) return false;
      if (trackFilter !== "전체" && d.track !== trackFilter) return false;
      if (regionFilter !== "전체" && d.region !== regionFilter) return false;
      if (judgmentFilter !== "전체" && item.judgment !== judgmentFilter) return false;
      if (
        q &&
        !d.university.toLowerCase().includes(q) &&
        !d.department.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    if (sortBy === "recommended") return filtered;

    return [...filtered].sort((a, b) => {
      if (sortBy === "probability") return b.probability - a.probability;
      if (sortBy === "cutoff") return b.department.cutoff.fit - a.department.cutoff.fit;
      return b.diffFromFit - a.diffFromFit;
    });
  }, [
    results,
    groupFilter,
    trackFilter,
    regionFilter,
    judgmentFilter,
    searchQuery,
    sortBy,
  ]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            추천 대학 · 학과 분석 결과
          </h2>
          <p className="text-xs text-slate-500">
            총 {results.length}개 주요 대학·모집단위 기준 환산 점수 및 합격 예측
          </p>
        </div>

        {/* 판정 요약 칩 (클릭 시 바로 필터링) */}
        <div className="flex flex-wrap gap-1.5">
          {(["안정", "적정", "소신", "상향"] as JudgmentLevel[]).map((level) => {
            const active = judgmentFilter === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() =>
                  setJudgmentFilter(active ? "전체" : level)
                }
                className={`rounded-full border px-2.5 py-1 text-xs font-bold transition ${
                  JUDGMENT_STYLE[level]
                } ${active ? "ring-2 ring-slate-900 ring-offset-1" : "opacity-85 hover:opacity-100"}`}
              >
                {level} {summaryCounts[level]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 필터 바 */}
      <div className="mt-4 grid gap-2.5 rounded-xl bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="대학·학과 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <select
          aria-label="모집군 필터"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value as "전체" | AdmissionGroup)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
        >
          <option value="전체">모집군: 전체</option>
          <option value="가">가군</option>
          <option value="나">나군</option>
          <option value="다">다군</option>
        </select>

        <select
          aria-label="계열 필터"
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value as "전체" | AcademicTrack)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
        >
          <option value="전체">계열: 전체</option>
          <option value="인문">인문</option>
          <option value="상경">상경</option>
          <option value="자연">자연·공학</option>
          <option value="의약">의치한약</option>
          <option value="자유전공">자유전공</option>
        </select>

        <select
          aria-label="지역 필터"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value as "전체" | Region)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
        >
          <option value="전체">지역: 전체</option>
          <option value="서울">서울</option>
          <option value="수도권">수도권</option>
          <option value="거점국립">거점국립대</option>
        </select>

        <select
          aria-label="정렬 기준"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
        >
          <option value="recommended">추천순 (적정 우선)</option>
          <option value="probability">합격 확률 높은 순</option>
          <option value="cutoff">예상 입결 높은 순</option>
          <option value="diff">내 환산점수 유리한 순</option>
        </select>
      </div>

      {/* 추천 결과 카드 */}
      <div className="mt-4 space-y-3">
        {filteredResults.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
            조건에 맞는 모집단위가 없습니다. 필터 조건을 완화해 보세요.
          </div>
        ) : (
          filteredResults.map((item) => {
            const d = item.department;
            const isPicked = portfolio[d.group]?.department.id === d.id;
            const diffPrefix = item.diffFromFit >= 0 ? "+" : "";

            return (
              <article
                key={d.id}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white">
                        {d.group}군
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {d.region} · {d.track}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                        {d.scoreType === "standard" ? "표준점수" : "백분위"} · 탐구{" "}
                        {d.inquiryCount}과목
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                          JUDGMENT_STYLE[item.judgment]
                        }`}
                      >
                        {item.judgment}
                        {item.probability > 0 ? ` · ${item.probability}%` : ""}
                      </span>
                    </div>

                    <h3 className="mt-2 text-base font-bold text-slate-900">
                      {d.university}{" "}
                      <span className="text-indigo-700">{d.department}</span>
                    </h3>
                  </div>

                  {/* 점수 비교 */}
                  <div className="text-right">
                    <div className="text-xs text-slate-500">내 대학 환산점수</div>
                    <div className="text-xl font-extrabold tabular-nums text-slate-900">
                      {item.convertedScore}
                      <span className="ml-1 text-xs font-normal text-slate-500">
                        / 1000
                      </span>
                    </div>
                    <div
                      className={`text-xs font-semibold tabular-nums ${
                        item.diffFromFit >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      적정 컷({d.cutoff.fit}점) 대비 {diffPrefix}
                      {item.diffFromFit}점
                    </div>
                  </div>
                </div>

                {/* 반영 비율 & 유불리 코멘트 */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>
                    반영비: 국 {d.weights.korean}% · 수 {d.weights.math}% · 탐{" "}
                    {d.weights.inquiry}% · 영{" "}
                    {d.weights.english > 0 ? `${d.weights.english}%` : "가감점"}
                  </span>
                  <span>
                    모집 {d.quota}명 · 전년도 경쟁률 {d.competitionRate}:1
                  </span>
                </div>

                {item.requirementIssues.length > 0 ? (
                  <p className="mt-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700">
                    필수 요강 미충족: {item.requirementIssues.join(", ")}
                  </p>
                ) : (
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
                    <span className="font-semibold text-indigo-700">유불리 분석:</span>{" "}
                    {item.advantageNote}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectDetail(item)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    상세 환산 분석
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onTogglePortfolio(item)}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      isPicked
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {isPicked ? (
                      <>
                        <BookmarkCheck className="h-3.5 w-3.5" />
                        {d.group}군 포트폴리오 담김
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="h-3.5 w-3.5" />
                        {d.group}군에 담기
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
