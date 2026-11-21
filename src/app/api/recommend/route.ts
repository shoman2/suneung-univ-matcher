import { NextResponse } from "next/server";
import { recommendUniversities } from "@/lib/admissions";
import { StudentScores } from "@/types/admissions";

function isValidScoreNumber(value: unknown, min: number, max: number): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function validateStudentScores(body: unknown): body is StudentScores {
  if (!body || typeof body !== "object") return false;
  const s = body as StudentScores;

  const hasSubjects =
    Boolean(s.korean) &&
    Boolean(s.math) &&
    Boolean(s.inquiry1) &&
    Boolean(s.inquiry2);
  if (!hasSubjects) return false;

  return (
    isValidScoreNumber(s.korean.standardScore, 40, 200) &&
    isValidScoreNumber(s.korean.percentile, 0, 100) &&
    isValidScoreNumber(s.korean.grade, 1, 9) &&
    isValidScoreNumber(s.math.standardScore, 40, 200) &&
    isValidScoreNumber(s.math.percentile, 0, 100) &&
    isValidScoreNumber(s.math.grade, 1, 9) &&
    isValidScoreNumber(s.englishGrade, 1, 9) &&
    isValidScoreNumber(s.historyGrade, 1, 9) &&
    isValidScoreNumber(s.inquiry1.standardScore, 20, 100) &&
    isValidScoreNumber(s.inquiry1.percentile, 0, 100) &&
    isValidScoreNumber(s.inquiry1.grade, 1, 9) &&
    isValidScoreNumber(s.inquiry2.standardScore, 20, 100) &&
    isValidScoreNumber(s.inquiry2.percentile, 0, 100) &&
    isValidScoreNumber(s.inquiry2.grade, 1, 9)
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    if (!validateStudentScores(body)) {
      return NextResponse.json(
        { error: "유효하지 않은 수능 성적 입력값입니다." },
        { status: 400 }
      );
    }

    const results = recommendUniversities(body);
    const counts = {
      안정: results.filter((r) => r.judgment === "안정").length,
      적정: results.filter((r) => r.judgment === "적정").length,
      소신: results.filter((r) => r.judgment === "소신").length,
      상향: results.filter((r) => r.judgment === "상향").length,
      지원제한: results.filter((r) => r.judgment === "지원제한").length,
    };

    return NextResponse.json({
      total: results.length,
      counts,
      results,
    });
  } catch {
    return NextResponse.json(
      { error: "추천 계산 처리 중 오류가 발생했습니다." },
      { status: 400 }
    );
  }
}
