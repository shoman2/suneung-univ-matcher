import assert from "node:assert/strict";
import test from "node:test";
import { UNIVERSITIES } from "../src/data/universities";
import {
  evaluateDepartment,
  recommendUniversities,
  summarizePortfolio,
} from "../src/lib/admissions";
import { SCORE_PRESETS, StudentScores } from "../src/types/admissions";

test("최상위 의약·자연계 프리셋은 의약 및 최상위 학과에서 지원 가능권 판정을 받는다", () => {
  const topScores = SCORE_PRESETS[0].scores;
  const results = recommendUniversities(topScores);

  assert.equal(results.length, UNIVERSITIES.length);

  const snuMed = results.find((r) => r.department.id === "snu-med");
  assert.ok(snuMed, "서울대 의예과가 결과에 포함되어야 합니다.");
  assert.notEqual(snuMed.judgment, "지원제한");
  assert.ok(snuMed.convertedScore > 950, `환산점수 예상 범위 초과: ${snuMed.convertedScore}`);
});

test("미적분/기하 및 과탐 필수 학과에 확통+사탐 성적을 넣으면 지원제한으로 판정된다", () => {
  const humanitiesScores = SCORE_PRESETS[1].scores;
  const snuCse = UNIVERSITIES.find((u) => u.id === "snu-cse");
  assert.ok(snuCse);

  const evalResult = evaluateDepartment(humanitiesScores, snuCse);
  assert.equal(evalResult.judgment, "지원제한");
  assert.equal(evalResult.probability, 0);
  assert.equal(evalResult.requirementIssues.length, 2);
});

test("가천대 컴퓨터공학과(탐구 1과목 반영)는 탐구 한 과목이 높아도 점수가 잘 방어된다", () => {
  const gachon = UNIVERSITIES.find((u) => u.id === "gachon-cs");
  assert.ok(gachon);

  const unbalancedInquiry: StudentScores = {
    korean: { elective: "화법과 작문", standardScore: 120, percentile: 82, grade: 3 },
    math: { elective: "확률과 통계", standardScore: 122, percentile: 83, grade: 3 },
    englishGrade: 2,
    historyGrade: 2,
    inquiry1: {
      category: "사회탐구",
      subject: "사회·문화",
      standardScore: 67,
      percentile: 95,
      grade: 1,
    },
    inquiry2: {
      category: "사회탐구",
      subject: "생활과 윤리",
      standardScore: 48,
      percentile: 45,
      grade: 5,
    },
  };

  const result = evaluateDepartment(unbalancedInquiry, gachon);
  assert.ok(
    result.convertedScore >= gachon.cutoff.safe,
    `탐구 1과목 반영 시 안정선(${gachon.cutoff.safe}) 이상이어야 함: ${result.convertedScore}`
  );
  assert.equal(result.judgment, "안정");
});

test("가/나/다군 포트폴리오 균형 진단이 안정+적정+상향 조합을 정확히 판별한다", () => {
  const scores = SCORE_PRESETS[2].scores;
  const results = recommendUniversities(scores);

  const safePick = results.find((r) => r.judgment === "안정");
  const fitPick = results.find((r) => r.judgment === "적정");
  const reachPick = results.find(
    (r) => r.judgment === "소신" || r.judgment === "상향"
  );

  assert.ok(safePick && fitPick && reachPick);

  const summary = summarizePortfolio({
    가: safePick,
    나: fitPick,
    다: reachPick,
  });

  assert.equal(summary.tone, "balanced");
});
