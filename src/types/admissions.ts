export type AdmissionGroup = "가" | "나" | "다";

export type AcademicTrack = "인문" | "상경" | "자연" | "의약" | "자유전공";

export type Region = "서울" | "수도권" | "거점국립";

export type KoreanElective = "화법과 작문" | "언어와 매체";

export type MathElective = "확률과 통계" | "미적분" | "기하";

export type InquiryCategory = "사회탐구" | "과학탐구";

export type JudgmentLevel = "안정" | "적정" | "소신" | "상향" | "지원제한";

export interface SubjectScore {
  standardScore: number;
  percentile: number;
  grade: number;
}

export interface StudentScores {
  korean: SubjectScore & { elective: KoreanElective };
  math: SubjectScore & { elective: MathElective };
  englishGrade: number;
  historyGrade: number;
  inquiry1: SubjectScore & { category: InquiryCategory; subject: string };
  inquiry2: SubjectScore & { category: InquiryCategory; subject: string };
}

export interface UniversityDepartment {
  id: string;
  university: string;
  department: string;
  group: AdmissionGroup;
  track: AcademicTrack;
  region: Region;
  quota: number;
  competitionRate: number;
  scoreType: "standard" | "percentile";
  /** 영역별 반영 비율 합계 = 100 (english가 0이면 영어 감점제 적용) */
  weights: {
    korean: number;
    math: number;
    inquiry: number;
    english: number;
  };
  inquiryCount: 1 | 2;
  /** 1~9등급별 1000점 만점 환산점수 (weights.english > 0일 때 사용) */
  englishTable?: number[];
  /** 1~9등급별 총점 가감점 (weights.english === 0일 때 사용) */
  englishDeduction?: number[];
  /** 한국사 1~9등급별 가감점 */
  historyDeduction: number[];
  bonusRules?: {
    mathCalcGeoBonusRate?: number;
    scienceInquiryBonusRate?: number;
    requireMathCalcGeo?: boolean;
    requireScienceInquiry?: boolean;
  };
  /** 1000점 환산 기준 합격 예측선 */
  cutoff: {
    safe: number;
    fit: number;
    reach: number;
  };
  recentTrend: string;
}

export interface ScoreBreakdown {
  korean: number;
  math: number;
  inquiry: number;
  english: number;
  historyAdjustment: number;
  bonusPoints: number;
}

export interface RecommendationResult {
  department: UniversityDepartment;
  convertedScore: number;
  breakdown: ScoreBreakdown;
  diffFromFit: number;
  diffFromSafe: number;
  judgment: JudgmentLevel;
  probability: number;
  advantageNote: string;
  requirementIssues: string[];
}

export interface ScorePreset {
  id: string;
  label: string;
  badge: string;
  description: string;
  scores: StudentScores;
}

export const SOCIAL_INQUIRY_SUBJECTS = [
  "생활과 윤리",
  "윤리와 사상",
  "한국지리",
  "세계지리",
  "동아시아사",
  "세계사",
  "경제",
  "정치와 법",
  "사회·문화",
] as const;

export const SCIENCE_INQUIRY_SUBJECTS = [
  "물리학Ⅰ",
  "화학Ⅰ",
  "생명과학Ⅰ",
  "지구과학Ⅰ",
  "물리학Ⅱ",
  "화학Ⅱ",
  "생명과학Ⅱ",
  "지구과학Ⅱ",
] as const;

export const SCORE_PRESETS: ScorePreset[] = [
  {
    id: "medical-top",
    label: "최상위 의약·자연계",
    badge: "백분위 98.5%",
    description: "국어·수학·과탐 모두 1등급 최상위 표본",
    scores: {
      korean: { elective: "언어와 매체", standardScore: 140, percentile: 99, grade: 1 },
      math: { elective: "미적분", standardScore: 145, percentile: 99, grade: 1 },
      englishGrade: 1,
      historyGrade: 1,
      inquiry1: {
        category: "과학탐구",
        subject: "생명과학Ⅰ",
        standardScore: 69,
        percentile: 98,
        grade: 1,
      },
      inquiry2: {
        category: "과학탐구",
        subject: "지구과학Ⅰ",
        standardScore: 68,
        percentile: 97,
        grade: 1,
      },
    },
  },
  {
    id: "sky-humanities",
    label: "상위권 인문·상경",
    badge: "백분위 94%",
    description: "SKY~서성한 인문/상경계열 지원 가능권",
    scores: {
      korean: { elective: "언어와 매체", standardScore: 133, percentile: 95, grade: 1 },
      math: { elective: "확률과 통계", standardScore: 131, percentile: 94, grade: 2 },
      englishGrade: 2,
      historyGrade: 1,
      inquiry1: {
        category: "사회탐구",
        subject: "생활과 윤리",
        standardScore: 66,
        percentile: 94,
        grade: 1,
      },
      inquiry2: {
        category: "사회탐구",
        subject: "사회·문화",
        standardScore: 65,
        percentile: 92,
        grade: 2,
      },
    },
  },
  {
    id: "seoul-engineering",
    label: "인서울 주요 공대",
    badge: "백분위 88%",
    description: "중경외시·건동홍 자연/공학계열 지원권",
    scores: {
      korean: { elective: "화법과 작문", standardScore: 125, percentile: 87, grade: 2 },
      math: { elective: "미적분", standardScore: 131, percentile: 91, grade: 2 },
      englishGrade: 2,
      historyGrade: 2,
      inquiry1: {
        category: "과학탐구",
        subject: "물리학Ⅰ",
        standardScore: 63,
        percentile: 87,
        grade: 2,
      },
      inquiry2: {
        category: "과학탐구",
        subject: "화학Ⅰ",
        standardScore: 62,
        percentile: 85,
        grade: 3,
      },
    },
  },
  {
    id: "national-balanced",
    label: "수도권·거점국립대",
    badge: "백분위 77%",
    description: "인서울 중위·수도권 주요대 및 거점국립대권",
    scores: {
      korean: { elective: "화법과 작문", standardScore: 116, percentile: 76, grade: 3 },
      math: { elective: "확률과 통계", standardScore: 118, percentile: 78, grade: 3 },
      englishGrade: 3,
      historyGrade: 2,
      inquiry1: {
        category: "사회탐구",
        subject: "한국지리",
        standardScore: 59,
        percentile: 77,
        grade: 3,
      },
      inquiry2: {
        category: "사회탐구",
        subject: "정치와 법",
        standardScore: 58,
        percentile: 75,
        grade: 3,
      },
    },
  },
];
