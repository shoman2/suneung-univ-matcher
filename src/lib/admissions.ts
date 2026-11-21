import { UNIVERSITIES } from "@/data/universities";
import {
  JudgmentLevel,
  RecommendationResult,
  ScoreBreakdown,
  StudentScores,
  UniversityDepartment,
} from "@/types/admissions";

const STANDARD_MAX = {
  korean: 145,
  math: 148,
  inquiry: 71,
} as const;

function clampGradeIndex(grade: number): number {
  const safeGrade = Math.min(9, Math.max(1, Math.round(grade)));
  return safeGrade - 1;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function computeInquiryAdjustedValue(
  scores: StudentScores,
  dept: UniversityDepartment
): { normalized: number; bonusRatioContribution: number } {
  const useStd = dept.scoreType === "standard";
  const sciRate = dept.bonusRules?.scienceInquiryBonusRate ?? 0;

  const raw1 = useStd ? scores.inquiry1.standardScore : scores.inquiry1.percentile;
  const raw2 = useStd ? scores.inquiry2.standardScore : scores.inquiry2.percentile;
  const denom = useStd ? STANDARD_MAX.inquiry : 100;

  const mult1 = scores.inquiry1.category === "과학탐구" ? 1 + sciRate : 1;
  const mult2 = scores.inquiry2.category === "과학탐구" ? 1 + sciRate : 1;

  const eff1 = raw1 * mult1;
  const eff2 = raw2 * mult2;

  if (dept.inquiryCount === 1) {
    const pickFirst = eff1 >= eff2;
    const baseRaw = pickFirst ? raw1 : raw2;
    const effRaw = pickFirst ? eff1 : eff2;
    return {
      normalized: (baseRaw / denom) * 1000,
      bonusRatioContribution: ((effRaw - baseRaw) / denom) * 1000,
    };
  }

  const baseAvg = (raw1 + raw2) / 2;
  const effAvg = (eff1 + eff2) / 2;
  return {
    normalized: (baseAvg / denom) * 1000,
    bonusRatioContribution: ((effAvg - baseAvg) / denom) * 1000,
  };
}

export function evaluateDepartment(
  scores: StudentScores,
  dept: UniversityDepartment
): RecommendationResult {
  const useStd = dept.scoreType === "standard";
  const koreanBase =
    ((useStd ? scores.korean.standardScore : scores.korean.percentile) /
      (useStd ? STANDARD_MAX.korean : 100)) *
    1000;

  const mathBase =
    ((useStd ? scores.math.standardScore : scores.math.percentile) /
      (useStd ? STANDARD_MAX.math : 100)) *
    1000;

  const isMathCalcGeo =
    scores.math.elective === "미적분" || scores.math.elective === "기하";
  const mathBonusRate = isMathCalcGeo ? dept.bonusRules?.mathCalcGeoBonusRate ?? 0 : 0;

  const inquiryCalc = computeInquiryAdjustedValue(scores, dept);

  const koreanWeighted = koreanBase * (dept.weights.korean / 100);
  const mathWeighted = mathBase * (dept.weights.math / 100);
  const inquiryWeighted = inquiryCalc.normalized * (dept.weights.inquiry / 100);

  const engIdx = clampGradeIndex(scores.englishGrade);
  const englishWeighted =
    dept.weights.english > 0 && dept.englishTable
      ? dept.englishTable[engIdx] * (dept.weights.english / 100)
      : dept.englishDeduction
        ? dept.englishDeduction[engIdx]
        : 0;

  const histIdx = clampGradeIndex(scores.historyGrade);
  const historyAdjustment = dept.historyDeduction[histIdx] ?? 0;

  const bonusPoints =
    mathWeighted * mathBonusRate +
    inquiryCalc.bonusRatioContribution * (dept.weights.inquiry / 100);

  const convertedScore = round1(
    koreanWeighted +
      mathWeighted +
      inquiryWeighted +
      englishWeighted +
      historyAdjustment +
      bonusPoints
  );

  const breakdown: ScoreBreakdown = {
    korean: round1(koreanWeighted),
    math: round1(mathWeighted),
    inquiry: round1(inquiryWeighted),
    english: round1(englishWeighted),
    historyAdjustment: round1(historyAdjustment),
    bonusPoints: round1(bonusPoints),
  };

  const requirementIssues: string[] = [];
  if (dept.bonusRules?.requireMathCalcGeo && !isMathCalcGeo) {
    requirementIssues.push("수학(미적분 또는 기하) 필수 응시 요강");
  }
  if (
    dept.bonusRules?.requireScienceInquiry &&
    (scores.inquiry1.category !== "과학탐구" ||
      scores.inquiry2.category !== "과학탐구")
  ) {
    requirementIssues.push("과학탐구 2과목 필수 응시 요강");
  }

  const diffFromFit = round1(convertedScore - dept.cutoff.fit);
  const diffFromSafe = round1(convertedScore - dept.cutoff.safe);

  let judgment: JudgmentLevel;
  let probability: number;

  if (requirementIssues.length > 0) {
    judgment = "지원제한";
    probability = 0;
  } else if (convertedScore >= dept.cutoff.safe) {
    judgment = "안정";
    probability = Math.min(97, Math.round(82 + (convertedScore - dept.cutoff.safe) * 0.7));
  } else if (convertedScore >= dept.cutoff.fit) {
    judgment = "적정";
    const span = Math.max(1, dept.cutoff.safe - dept.cutoff.fit);
    probability = Math.round(62 + ((convertedScore - dept.cutoff.fit) / span) * 19);
  } else if (convertedScore >= dept.cutoff.reach) {
    judgment = "소신";
    const span = Math.max(1, dept.cutoff.fit - dept.cutoff.reach);
    probability = Math.round(35 + ((convertedScore - dept.cutoff.reach) / span) * 26);
  } else {
    judgment = "상향";
    const deficit = dept.cutoff.reach - convertedScore;
    probability = Math.max(5, Math.round(33 - deficit * 1.1));
  }

  const advantageNote = buildAdvantageNote(scores, dept, mathBonusRate);

  return {
    department: dept,
    convertedScore,
    breakdown,
    diffFromFit,
    diffFromSafe,
    judgment,
    probability,
    advantageNote,
    requirementIssues,
  };
}

function buildAdvantageNote(
  scores: StudentScores,
  dept: UniversityDepartment,
  mathBonusRate: number
): string {
  const parts: string[] = [];

  if (dept.weights.math >= 37 && scores.math.percentile >= scores.korean.percentile) {
    parts.push(`수학 비중(${dept.weights.math}%)이 높아 현재 성적 조합에 유리`);
  } else if (dept.weights.korean >= 35 && scores.korean.percentile > scores.math.percentile) {
    parts.push(`국어 비중(${dept.weights.korean}%)이 높아 국어 강점을 살리기 유리`);
  }

  if (dept.inquiryCount === 1) {
    const gap = Math.abs(scores.inquiry1.percentile - scores.inquiry2.percentile);
    if (gap >= 4) {
      parts.push("탐구 상위 1과목만 반영되어 탐구 편차를 방어");
    } else {
      parts.push("탐구 1과목 반영 대학");
    }
  }

  if (mathBonusRate > 0) {
    parts.push(`${scores.math.elective} 가산(+${Math.round(mathBonusRate * 100)}%) 적용`);
  }

  if (
    (dept.bonusRules?.scienceInquiryBonusRate ?? 0) > 0 &&
    (scores.inquiry1.category === "과학탐구" || scores.inquiry2.category === "과학탐구")
  ) {
    parts.push(
      `과탐 가산(+${Math.round((dept.bonusRules?.scienceInquiryBonusRate ?? 0) * 100)}%) 반영`
    );
  }

  if (dept.weights.english === 0 && scores.englishGrade >= 3) {
    parts.push("영어 감점제라 3등급 이하 부담이 상대적으로 적음");
  } else if (dept.weights.english >= 15 && scores.englishGrade === 1) {
    parts.push(`영어 비중(${dept.weights.english}%)으로 1등급 이점이 큼`);
  }

  if (parts.length === 0) {
    parts.push(
      dept.scoreType === "standard"
        ? "표준점수 기준 균형 반영 구조"
        : "백분위 기준 균형 반영 구조"
    );
  }

  return parts.join(" · ");
}

export function recommendUniversities(
  scores: StudentScores,
  dataset: UniversityDepartment[] = UNIVERSITIES
): RecommendationResult[] {
  return dataset
    .map((dept) => evaluateDepartment(scores, dept))
    .sort((a, b) => {
      const rank = (j: JudgmentLevel): number => {
        switch (j) {
          case "적정":
            return 0;
          case "안정":
            return 1;
          case "소신":
            return 2;
          case "상향":
            return 3;
          case "지원제한":
            return 4;
        }
      };
      const rankDiff = rank(a.judgment) - rank(b.judgment);
      if (rankDiff !== 0) return rankDiff;
      return Math.abs(a.diffFromFit) - Math.abs(b.diffFromFit);
    });
}

export function summarizePortfolio(
  selected: Partial<Record<"가" | "나" | "다", RecommendationResult>>
): {
  title: string;
  description: string;
  tone: "balanced" | "aggressive" | "conservative" | "incomplete";
} {
  const items = Object.values(selected).filter(
    (v): v is RecommendationResult => Boolean(v)
  );
  if (items.length < 3) {
    return {
      title: `가·나·다군 조합 ${items.length}/3 선택됨`,
      description: "각 모집군에서 1개씩 대학을 담아 정시 3장 전략 균형을 확인해 보세요.",
      tone: "incomplete",
    };
  }

  const hasIssue = items.some((i) => i.judgment === "지원제한");
  if (hasIssue) {
    return {
      title: "응시 요강 미충족 학과가 포함되어 있습니다",
      description: "지원제한 표시된 학과는 필수 과목(미적분·기하 또는 과탐) 요건을 확인하세요.",
      tone: "aggressive",
    };
  }

  const safeCount = items.filter((i) => i.judgment === "안정").length;
  const fitCount = items.filter((i) => i.judgment === "적정").length;
  const stretchCount = items.filter(
    (i) => i.judgment === "소신" || i.judgment === "상향"
  ).length;

  if (safeCount >= 1 && fitCount >= 1 && stretchCount >= 1) {
    return {
      title: "균형 잡힌 정시 3장 조합 (안정 + 적정 + 소신/상향)",
      description: "안정 카드로 하방을 지키면서 적정·소신 지원을 노리는 이상적인 배치입니다.",
      tone: "balanced",
    };
  }

  if (safeCount >= 2) {
    return {
      title: "안정 위주 방어형 조합",
      description: "합격 확률이 매우 높지만, 한 군 정도는 적정~소신 상향 카드를 고려해 볼 수 있습니다.",
      tone: "conservative",
    };
  }

  if (stretchCount >= 2) {
    return {
      title: "공격적 상향·소신 조합",
      description: "재수 방지 목표라면 가/나/다군 중 1곳 이상을 '안정' 카드로 교체하는 것을 권장합니다.",
      tone: "aggressive",
    };
  }

  return {
    title: "적정권 중심 실속 조합",
    description: "합격 가능권에 집중된 구성입니다. 추가합격 추이를 보며 최종 원서를 결정하세요.",
    tone: "balanced",
  };
}
