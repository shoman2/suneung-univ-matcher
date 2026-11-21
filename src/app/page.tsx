import { AdmissionsDashboard } from "@/components/AdmissionsDashboard";
import { UNIVERSITIES } from "@/data/universities";
import { GraduationCap, Info } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
                  수능핏 (SuneungFit)
                </h1>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                  정시 환산 · 추천
                </span>
              </div>
              <p className="text-xs text-slate-500">
                대학별 반영비율·가산점 기반 실시간 정시 지원 가능 대학 분석
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">
              수록 모집단위 {UNIVERSITIES.length}개
            </span>
            <span className="text-slate-300">|</span>
            <span>가·나·다군 실시간 예측</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <AdmissionsDashboard />
      </main>

      <footer className="mt-12 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p>
              본 서비스의 환산점수 및 합격 예측 컷은 정시 지원 전략 수립을 돕기
              위한 모의 시뮬레이션 데이터입니다. 실제 원서 접수 전 반드시 각 대학
              입학처의 최신 모집요강을 확인하시기 바랍니다.
            </p>
          </div>
          <span className="shrink-0 font-medium text-slate-400">
            SuneungFit Admissions Platform
          </span>
        </div>
      </footer>
    </div>
  );
}
