"use client";

import { PortfolioBar } from "@/components/PortfolioBar";
import { RecommendationList } from "@/components/RecommendationList";
import { ScoreInputForm } from "@/components/ScoreInputForm";
import { UniversityDetailModal } from "@/components/UniversityDetailModal";
import { recommendUniversities } from "@/lib/admissions";
import {
  AdmissionGroup,
  RecommendationResult,
  SCORE_PRESETS,
  StudentScores,
} from "@/types/admissions";
import { useMemo, useState } from "react";

export function AdmissionsDashboard() {
  const [scores, setScores] = useState<StudentScores>(SCORE_PRESETS[2].scores);
  const [activePresetId, setActivePresetId] = useState<string | null>(
    SCORE_PRESETS[2].id
  );
  const [portfolioIds, setPortfolioIds] = useState<
    Partial<Record<AdmissionGroup, string>>
  >({});
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);

  const results = useMemo(() => recommendUniversities(scores), [scores]);

  const portfolio = useMemo(() => {
    const mapped: Partial<Record<AdmissionGroup, RecommendationResult>> = {};
    (["가", "나", "다"] as AdmissionGroup[]).forEach((group) => {
      const targetId = portfolioIds[group];
      if (!targetId) return;
      const found = results.find((r) => r.department.id === targetId);
      if (found) mapped[group] = found;
    });
    return mapped;
  }, [portfolioIds, results]);

  const selectedDetail = useMemo(
    () => results.find((r) => r.department.id === selectedDetailId) ?? null,
    [results, selectedDetailId]
  );

  const handleScoreChange = (next: StudentScores) => {
    setScores(next);
    setActivePresetId(null);
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = SCORE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setScores(preset.scores);
    setActivePresetId(preset.id);
  };

  const handleTogglePortfolio = (item: RecommendationResult) => {
    const group = item.department.group;
    setPortfolioIds((prev) => {
      if (prev[group] === item.department.id) {
        const next = { ...prev };
        delete next[group];
        return next;
      }
      return { ...prev, [group]: item.department.id };
    });
  };

  const handleRemovePortfolio = (group: AdmissionGroup) => {
    setPortfolioIds((prev) => {
      const next = { ...prev };
      delete next[group];
      return next;
    });
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-4 lg:sticky lg:top-6">
          <ScoreInputForm
            scores={scores}
            onChange={handleScoreChange}
            onApplyPreset={handleApplyPreset}
            activePresetId={activePresetId}
          />
        </div>

        <div className="space-y-6 lg:col-span-8">
          <PortfolioBar
            portfolio={portfolio}
            onRemove={handleRemovePortfolio}
            onInspect={(item) => setSelectedDetailId(item.department.id)}
          />
          <RecommendationList
            results={results}
            portfolio={portfolio}
            onTogglePortfolio={handleTogglePortfolio}
            onSelectDetail={(item) => setSelectedDetailId(item.department.id)}
          />
        </div>
      </div>

      <UniversityDetailModal
        item={selectedDetail}
        onClose={() => setSelectedDetailId(null)}
      />
    </>
  );
}
