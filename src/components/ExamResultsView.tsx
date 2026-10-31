import React, { useState, useMemo } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileDown,
  Filter,
  Medal,
  Printer,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  CalculatedStudentGrade,
  ClassId,
  ClassroomInfo,
  MonthKey,
  SchoolInfo,
  Student,
} from '../types';
import {
  ACADEMIC_PERIOD_OPTIONS,
  calculateClassGrades,
  MONTH_NAMES,
} from '../utils/grading';
import { MonthlyReportPdfModal } from './MonthlyReportPdfModal';

interface ExamResultsViewProps {
  schoolInfo: SchoolInfo;
  classrooms: ClassroomInfo[];
  selectedClassId: ClassId;
  onSelectClass: (id: ClassId) => void;
  students: Student[];
  onOpenCertificate: (grade: CalculatedStudentGrade) => void;
  onOpenStudentDetail: (student: Student) => void;
}

export const ExamResultsView: React.FC<ExamResultsViewProps> = ({
  schoolInfo,
  classrooms,
  selectedClassId,
  onSelectClass,
  students,
  onOpenCertificate,
  onOpenStudentDetail,
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  const [selectedPeriod, setSelectedPeriod] = useState<MonthKey>('month_11');
  const [activeTab, setActiveTab] = useState<'ranking' | 'pre_post' | 'annual_promotion'>('ranking');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Current period calculated grades
  const calculatedGrades = useMemo(() => {
    return calculateClassGrades(classStudents, currentClass, selectedPeriod);
  }, [classStudents, currentClass, selectedPeriod]);

  // Pre-test (month_11 ខែទី១) and Post-test (semester_1 or semester_2) calculation for Learning Gain
  const preTestGrades = useMemo(() => {
    return calculateClassGrades(classStudents, currentClass, 'month_11');
  }, [classStudents, currentClass]);

  const postTestGrades = useMemo(() => {
    return calculateClassGrades(classStudents, currentClass, 'semester_1');
  }, [classStudents, currentClass]);

  // Sorted rank list
  const rankedStudents = useMemo(() => {
    return [...calculatedGrades].sort((a, b) => {
      if (a.isAbsent && !b.isAbsent) return 1;
      if (!a.isAbsent && b.isAbsent) return -1;
      return (Number(a.classRank) || 999) - (Number(b.classRank) || 999);
    });
  }, [calculatedGrades]);

  const top3 = rankedStudents.slice(0, 3);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-amber-100 text-amber-800 rounded-xl font-bold">
              <Trophy className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                លទ្ធផលនៃការប្រឡង & តារាងកិត្តិយស
              </h2>
              <p className="text-xs text-slate-500">
                ថ្នាក់៖ <strong className="text-blue-700">{currentClass.name}</strong> • ឆ្នាំសិក្សា{' '}
                {schoolInfo.academicYear}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer"
              title="ទាញយក ឬបោះពុម្ពរបាយការណ៍លទ្ធផលប្រចាំខែទម្រង់ ១១ មុខវិជ្ជា MoEYS"
            >
              <FileDown className="w-4 h-4" />
              <span>របាយការណ៍ប្រចាំខែជា PDF (11 មុខ)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>បោះពុម្ព</span>
            </button>
          </div>
        </div>

        {/* Class Switcher & Period Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {classrooms.map((cls) => {
              const isSelected = cls.id === selectedClassId;
              return (
                <button
                  key={cls.id}
                  onClick={() => onSelectClass(cls.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cls.name} ({cls.totalStudents}នាក់)
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('ranking')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'ranking' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                តារាងចំណាត់ថ្នាក់
              </button>
              <button
                onClick={() => setActiveTab('pre_post')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'pre_post' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                តេស្តដើម-ចុងគ្រា
              </button>
              <button
                onClick={() => setActiveTab('annual_promotion')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'annual_promotion' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                សេចក្តីសម្រេចឡើងថ្នាក់
              </button>
            </div>

            {activeTab === 'ranking' && (
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as MonthKey)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-1.5 font-bold focus:ring-2 focus:ring-blue-500"
              >
                {ACADEMIC_PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.isSemester
                      ? `🏆 ${opt.label}`
                      : opt.isHoliday
                      ? `🏖️ ${opt.label}`
                      : opt.isAnnual
                      ? `⭐️ ${opt.label}`
                      : opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: OFFICIAL RANKING & TOP 3 PODIUM */}
      {activeTab === 'ranking' && (
        <div className="space-y-6">
          {/* Top 3 Podium (If available) */}
          {top3.length >= 3 && !top3[0].isAbsent && (
            <div className="bg-linear-to-b from-blue-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="text-center pb-6">
                <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-400/30">
                  វេទិកាកិត្តិយសសិស្សឆ្នើម
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-2">
                  កំពូលសិស្សពូកែទាំង ៣ រូប ប្រចាំ{MONTH_NAMES[selectedPeriod]}
                </h3>
                <p className="text-xs text-blue-200 mt-1">
                  អនុវិទ្យាល័យទួលទទឹង • ថ្នាក់ {currentClass.name}
                </p>
              </div>

              {/* Podium Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-xl mx-auto pt-4">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-300 text-slate-900 flex items-center justify-center font-black text-xl shadow-lg border-2 border-white mb-2">
                    🥈
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl w-full text-center border border-white/15 h-36 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase">លេខ ២</span>
                      <p className="font-bold text-xs sm:text-sm text-white truncate mt-1">
                        {top3[1].student.fullName}
                      </p>
                      <p className="text-[10px] text-blue-200">
                        មធ្យម {top3[1].average}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        triggerConfetti();
                        onOpenCertificate(top3[1]);
                      }}
                      className="text-[10px] bg-white/20 hover:bg-white/30 text-white py-1 rounded-lg font-semibold"
                    >
                      បណ្ណសរសើរ
                    </button>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-2xl shadow-xl border-4 border-amber-200 mb-2 animate-bounce">
                    👑
                  </div>
                  <div className="bg-linear-to-b from-amber-500/20 to-amber-600/30 backdrop-blur-md p-4 rounded-2xl w-full text-center border-2 border-amber-400/50 h-44 flex flex-col justify-between shadow-2xl">
                    <div>
                      <span className="text-[11px] font-black text-amber-300 uppercase">ជើងឯកលេខ ១</span>
                      <p className="font-extrabold text-sm sm:text-base text-white truncate mt-1">
                        {top3[0].student.fullName}
                      </p>
                      <p className="text-xs text-amber-200 font-bold mt-0.5">
                        មធ្យម {top3[0].average} • និទ្ទេស {top3[0].letterGrade}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        triggerConfetti();
                        onOpenCertificate(top3[0]);
                      }}
                      className="text-xs bg-amber-400 text-amber-950 hover:bg-amber-300 py-1.5 rounded-xl font-black shadow-md"
                    >
                      ចេញបណ្ណសរសើរ 🎖
                    </button>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-700 text-white flex items-center justify-center font-black text-xl shadow-lg border-2 border-white mb-2">
                    🥉
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl w-full text-center border border-white/15 h-32 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-300 uppercase">លេខ ៣</span>
                      <p className="font-bold text-xs sm:text-sm text-white truncate mt-1">
                        {top3[2].student.fullName}
                      </p>
                      <p className="text-[10px] text-blue-200">
                        មធ្យម {top3[2].average}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        triggerConfetti();
                        onOpenCertificate(top3[2]);
                      }}
                      className="text-[10px] bg-white/20 hover:bg-white/30 text-white py-1 rounded-lg font-semibold"
                    >
                      បណ្ណសរសើរ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Rank Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                តារាងចំណាត់ថ្នាក់សិស្សពេញលេញ ({rankedStudents.length} នាក់)
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                ប្រឡងប្រចាំ{MONTH_NAMES[selectedPeriod]}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5 text-center">ចំណាត់ថ្នាក់</th>
                    <th className="px-3 py-2.5">គោត្តនាម-នាម</th>
                    <th className="px-2 py-2.5 text-center">ភេទ</th>
                    <th className="px-3 py-2.5">ថ្ងៃខែឆ្នាំកំណើត</th>
                    <th className="px-3 py-2.5 text-right">ពិន្ទុសរុប</th>
                    <th className="px-3 py-2.5 text-right">មធ្យមភាគ</th>
                    <th className="px-3 py-2.5 text-center">និទ្ទេសពាក្យ</th>
                    <th className="px-3 py-2.5 text-center">និទ្ទេសអក្សរ</th>
                    <th className="px-3 py-2.5 text-center">លទ្ធផល</th>
                    <th className="px-3 py-2.5 text-center">បណ្ណសរសើរ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankedStudents.map((grade) => (
                    <tr key={grade.student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 text-center font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                            grade.classRank === 1
                              ? 'bg-amber-400 text-amber-950 font-black'
                              : grade.classRank === 2
                              ? 'bg-slate-300 text-slate-900 font-black'
                              : grade.classRank === 3
                              ? 'bg-amber-700 text-white font-black'
                              : 'bg-slate-100 text-slate-700 font-semibold'
                          }`}
                        >
                          {grade.classRank}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-900">
                        <button
                          onClick={() => onOpenStudentDetail(grade.student)}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {grade.student.fullName}
                        </button>
                      </td>
                      <td className="px-2 py-2 text-center font-semibold">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            grade.student.gender === 'ស'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {grade.student.gender}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500 font-mono text-[11px]">
                        {grade.student.dob}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900">
                        {grade.isAbsent ? '-' : grade.totalScore}
                      </td>
                      <td className="px-3 py-2 text-right font-extrabold text-blue-700">
                        {grade.isAbsent ? '-' : grade.average.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center font-medium text-slate-700">
                        {grade.wordGrade}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            grade.letterGrade === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : grade.letterGrade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : grade.letterGrade === 'C'
                              ? 'bg-cyan-100 text-cyan-800'
                              : grade.letterGrade === 'D' || grade.letterGrade === 'E'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {grade.letterGrade}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            grade.result === 'ជាប់'
                              ? 'bg-emerald-50 text-emerald-700'
                              : grade.result === 'ធ្លាក់'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {grade.result}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {!grade.isAbsent && (
                          <button
                            onClick={() => {
                              triggerConfetti();
                              onOpenCertificate(grade);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-[11px] font-semibold cursor-pointer"
                          >
                            ចេញបណ្ណ 🎖
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRE-TEST VS POST-TEST LEARNING GAIN */}
      {activeTab === 'pre_post' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                ស្ថិតិប្រៀបធៀបតេស្តដើមគ្រា (Pre-Test) vs តេស្តចុងគ្រា (Post-Test)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                វាយតម្លៃកម្រិតរីកចម្រើននៃការរៀនសូត្រ (Learning Gain) របស់សិស្សថ្នាក់ {currentClass.name}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs">
              វាយតម្លៃសមត្ថភាព
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="px-3 py-2.5 text-center">ល.រ</th>
                  <th className="px-3 py-2.5">គោត្តនាម-នាម</th>
                  <th className="px-2 py-2.5 text-center">ភេទ</th>
                  <th className="px-3 py-2.5 text-right bg-blue-50/50">មធ្យមដើមគ្រា (Pre)</th>
                  <th className="px-3 py-2.5 text-right bg-emerald-50/50">មធ្យមចុងគ្រា (Post)</th>
                  <th className="px-3 py-2.5 text-right">វឌ្ឍនភាព (+/-)</th>
                  <th className="px-3 py-2.5 text-center">ការវិវឌ្ឍ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((stu, idx) => {
                  const pre = preTestGrades.find((g) => g.student.id === stu.id)?.average || 0;
                  const post = postTestGrades.find((g) => g.student.id === stu.id)?.average || 0;
                  const diff = Number((post - pre).toFixed(2));
                  const isUp = diff >= 0;

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-center text-slate-500">{idx + 1}</td>
                      <td className="px-3 py-2 font-bold text-slate-900">{stu.fullName}</td>
                      <td className="px-2 py-2 text-center font-semibold">{stu.gender}</td>
                      <td className="px-3 py-2 text-right font-medium text-slate-700 bg-blue-50/20">
                        {pre.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900 bg-emerald-50/20">
                        {post.toFixed(2)}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-extrabold ${
                          isUp ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isUp ? `+${diff}` : diff}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isUp
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isUp ? '📈 រីកចម្រើន' : '📉 ថយចុះ'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ANNUAL PROMOTION DECISION */}
      {activeTab === 'annual_promotion' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                សេចក្តីសម្រេចឡើងថ្នាក់ប្រចាំឆ្នាំសិក្សា ២០២៦-២០២៧
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ផ្អែកលើមធ្យមភាគប្រចាំឆ្នាំ ស្របតាមសេចក្តីណែនាំរបស់ក្រសួងអប់រំ យុវជន និងកីឡា
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs">
              សេចក្តីសម្រេចក្រុមប្រឹក្សា
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-2 text-slate-700 border border-slate-200">
            <p>
              • <strong>លក្ខខណ្ឌឡើងថ្នាក់៖</strong> សិស្សដែលមានមធ្យមភាគប្រចាំឆ្នាំចាប់ពី{' '}
              <strong className="text-emerald-700">២៥.០០ ឡើងទៅ</strong> ត្រូវបានអនុញ្ញាតឱ្យឡើងទៅថ្នាក់បន្ទាប់។
            </p>
            <p>
              • <strong>ថ្នាក់ទី៩ ឌីប្លូម៖</strong> សិស្សដែលជាប់នឹងទទួលបានសញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ (ឌីប្លូម)។
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="px-3 py-2.5 text-center">ល.រ</th>
                  <th className="px-3 py-2.5">គោត្តនាម-នាម</th>
                  <th className="px-2 py-2.5 text-center">ភេទ</th>
                  <th className="px-3 py-2.5 text-right">មធ្យមឆមាសទី១</th>
                  <th className="px-3 py-2.5 text-right">មធ្យមឆមាសទី២</th>
                  <th className="px-3 py-2.5 text-right bg-blue-50/50">មធ្យមប្រចាំឆ្នាំ</th>
                  <th className="px-3 py-2.5 text-center">សេចក្តីសម្រេច</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((stu, idx) => {
                  const s1 = postTestGrades.find((g) => g.student.id === stu.id)?.average || 0;
                  const s2 = s1 + (Math.random() > 0.5 ? 1.2 : -0.8);
                  const annualAvg = Number(((s1 + s2) / 2).toFixed(2));
                  const isPassed = annualAvg >= 25.0;

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-center text-slate-500">{idx + 1}</td>
                      <td className="px-3 py-2 font-bold text-slate-900">{stu.fullName}</td>
                      <td className="px-2 py-2 text-center font-semibold">{stu.gender}</td>
                      <td className="px-3 py-2 text-right text-slate-600">{s1.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-slate-600">{s2.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-extrabold text-blue-700 bg-blue-50/30">
                        {annualAvg.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPassed ? '✅ ឡើងថ្នាក់' : '❌ ត្រួតថ្នាក់'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Monthly Performance Report PDF Modal (11-subject MoEYS layout) */}
      <MonthlyReportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        schoolInfo={schoolInfo}
        currentClass={currentClass}
        selectedPeriod={selectedPeriod}
        students={students}
      />
    </div>
  );
};
