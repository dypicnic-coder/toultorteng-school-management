import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Filter,
  GraduationCap,
  HeartPulse,
  Phone,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
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

interface DashboardViewProps {
  schoolInfo: SchoolInfo;
  classrooms: ClassroomInfo[];
  selectedClassId: ClassId;
  onSelectClass: (id: ClassId) => void;
  students: Student[];
  onOpenCertificate: (grade: CalculatedStudentGrade) => void;
  onOpenStudentDetail: (student: Student) => void;
  onNavigateToScores: () => void;
  onNavigateToAI: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  schoolInfo,
  classrooms,
  selectedClassId,
  onSelectClass,
  students,
  onOpenCertificate,
  onOpenStudentDetail,
  onNavigateToScores,
  onNavigateToAI,
}) => {
  // Period filter for the dashboard: default to month_11 (វិច្ឆិកា ខែទី១)
  const [selectedPeriod, setSelectedPeriod] = useState<MonthKey>('month_11');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'ប' | 'ស'>('all');
  const [gradeFilter, setGradeFilter] = useState<'all' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('all');

  // Currently active class
  const currentClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];

  // Filter students strictly for the selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId && s.status === 'active');
  }, [students, selectedClassId]);

  // Calculate grades for the selected class and selected period
  const calculatedGrades = useMemo(() => {
    return calculateClassGrades(classStudents, currentClass, selectedPeriod);
  }, [classStudents, currentClass, selectedPeriod]);

  // School-wide high level statistics
  const schoolTotalStudents = students.filter((s) => s.status === 'active').length;
  const schoolTotalFemales = students.filter((s) => s.status === 'active' && s.gender === 'ស').length;
  const schoolTotalMales = schoolTotalStudents - schoolTotalFemales;

  // Class specific statistics
  const totalInClass = classStudents.length;
  const femalesInClass = classStudents.filter((s) => s.gender === 'ស').length;
  const malesInClass = totalInClass - femalesInClass;
  const femalePercent = totalInClass > 0 ? Math.round((femalesInClass / totalInClass) * 100) : 0;

  // Grade breakdown
  const gradeCounts = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    calculatedGrades.forEach((g) => {
      if (g.letterGrade in counts) {
        counts[g.letterGrade as keyof typeof counts]++;
      }
    });
    return counts;
  }, [calculatedGrades]);

  const passedCount = calculatedGrades.filter((g) => g.result === 'ជាប់').length;
  const failedCount = calculatedGrades.filter((g) => g.result === 'ធ្លាក់').length;
  const absentCount = calculatedGrades.filter((g) => g.result === 'អវត្តមាន').length;
  const passRate = totalInClass > 0 ? Math.round((passedCount / (totalInClass - absentCount || 1)) * 100) : 0;

  // Calculate class average
  const nonAbsentGrades = calculatedGrades.filter((g) => !g.isAbsent);
  const classAverage =
    nonAbsentGrades.length > 0
      ? (
          nonAbsentGrades.reduce((sum, g) => sum + g.average, 0) / nonAbsentGrades.length
        ).toFixed(2)
      : '0.00';

  // Top 10 Outstanding Students (Sorted by Class Rank)
  const top10Students = useMemo(() => {
    return [...calculatedGrades]
      .filter((g) => !g.isAbsent && typeof g.classRank === 'number')
      .sort((a, b) => (a.classRank as number) - (b.classRank as number))
      .slice(0, 10);
  }, [calculatedGrades]);

  // At-Risk / Needs Support Students (Grade F or Absent)
  const atRiskStudents = useMemo(() => {
    return calculatedGrades.filter(
      (g) => g.letterGrade === 'F' || g.result === 'ធ្លាក់' || g.isAbsent
    );
  }, [calculatedGrades]);

  // Subject performance calculation
  const subjectAverages = useMemo(() => {
    const subjects = currentClass.subjects;
    return subjects.map((subj) => {
      let totalScore = 0;
      let count = 0;
      calculatedGrades.forEach((g) => {
        const sRes = g.subjectResults[subj.id];
        if (sRes && sRes.score !== null && !g.isAbsent) {
          totalScore += sRes.score;
          count++;
        }
      });
      const avg = count > 0 ? Number((totalScore / count).toFixed(1)) : 0;
      const pct = subj.maxScore > 0 ? Math.round((avg / subj.maxScore) * 100) : 0;
      return {
        subject: subj,
        avgScore: avg,
        percentage: pct,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [currentClass, calculatedGrades]);

  // Filtered student list for quick search table
  const filteredStudentGrades = useMemo(() => {
    return calculatedGrades.filter((g) => {
      const matchSearch =
        g.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.student.rollNumber.toString().includes(searchQuery);
      const matchGender = genderFilter === 'all' || g.student.gender === genderFilter;
      const matchGrade = gradeFilter === 'all' || g.letterGrade === gradeFilter;
      return matchSearch && matchGender && matchGrade;
    });
  }, [calculatedGrades, searchQuery, genderFilter, gradeFilter]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP CLASS SWITCHER (Requested Feature) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <Filter className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                ផ្ទាំងជ្រើសរើសថ្នាក់រៀន (Class Switcher)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ជ្រើសរើសថ្នាក់ដើម្បីវិភាគទិន្នន័យ ពិន្ទុ និងស្ថិតិសិស្សដោយបំបែកតាមថ្នាក់នីមួយៗ
            </p>
          </div>

          {/* Month / Exam Selector */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              កាលបរិច្ឆេទស្រង់ពិន្ទុ៖
            </span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as MonthKey)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
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
          </div>
        </div>

        {/* 4 Class Switcher Cards / Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          {classrooms.map((cls) => {
            const isSelected = cls.id === selectedClassId;
            return (
              <button
                key={cls.id}
                onClick={() => onSelectClass(cls.id)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-linear-to-b from-blue-50/80 to-blue-100/50 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
                )}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-bold ${
                      isSelected ? 'text-blue-900' : 'text-slate-800'
                    }`}
                  >
                    {cls.name}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cls.totalStudents} នាក់
                  </span>
                </div>

                <div className="mt-2 space-y-0.5 text-[11px]">
                  <p className="text-slate-500">
                    ស្រី៖ <strong className="text-slate-700">{cls.femaleCount}</strong> នាក់ ({Math.round((cls.femaleCount/cls.totalStudents)*100)}%)
                  </p>
                  <p className="text-slate-500 truncate">
                    គ្រូ៖ <strong className="text-slate-700">{cls.homeroomTeacher.name}</strong>
                  </p>
                  <p className={`text-[10px] font-medium pt-1 ${isSelected ? 'text-blue-700' : 'text-slate-400'}`}>
                    {cls.gradingSystem === '700_system' ? 'របប ៧០០ពិន្ទុ' : 'របប ៤៨០ ឌីប្លូម'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CLASS EXECUTIVE STAT CARDS (Calculated for currentClass) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Student Demographics */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>ចំនួនសិស្សថ្នាក់ {currentClass.name}</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalInClass}
            </span>
            <span className="text-xs text-slate-500 font-medium">នាក់ (១០០%)</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-rose-600 font-semibold">ស្រី {femalesInClass} នាក់ ({femalePercent}%)</span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-600 font-semibold">ប្រុស {malesInClass} នាក់</span>
          </div>
          {/* Ratio bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden flex">
            <div style={{ width: `${femalePercent}%` }} className="bg-rose-500 h-full" title="ស្រី"></div>
            <div style={{ width: `${100 - femalePercent}%` }} className="bg-blue-500 h-full" title="ប្រុស"></div>
          </div>
        </div>

        {/* Card 2: Class Average */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>មធ្យមភាគរួមប្រចាំថ្នាក់</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {classAverage}
            </span>
            <span className="text-xs text-slate-400">/ ៥០.០០</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
            <span>ខ្នាតមធ្យមភាគ៖ <strong className="text-slate-800">៥០</strong></span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium text-[10px]">
              {Number(classAverage) >= 25 ? 'កម្រិតជាប់' : 'ក្រោមមធ្យម'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              style={{ width: `${Math.min(100, (Number(classAverage) / 50) * 100)}%` }}
              className="bg-emerald-500 h-full rounded-full"
            ></div>
          </div>
        </div>

        {/* Card 3: Pass Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>អត្រាសិស្សជាប់ (Pass Rate)</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
              {passRate}%
            </span>
            <span className="text-xs text-slate-500">
              ({passedCount}/{totalInClass - absentCount} នាក់)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <span className="text-emerald-600 font-medium">ជាប់ {passedCount}</span>
            <span>•</span>
            <span className="text-amber-600 font-medium">ធ្លាក់ {failedCount}</span>
            <span>•</span>
            <span className="text-slate-400">អវត្តមាន {absentCount}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden flex">
            <div style={{ width: `${passRate}%` }} className="bg-indigo-600 h-full"></div>
            <div style={{ width: `${100 - passRate}%` }} className="bg-amber-400 h-full"></div>
          </div>
        </div>

        {/* Card 4: Top 1 Rank */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>សិស្សឆ្នើមលេខ ១ ប្រចាំថ្នាក់</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-4 h-4" />
            </span>
          </div>
          {top10Students.length > 0 ? (
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
                  {top10Students[0].student.fullName}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold shrink-0">
                  និទ្ទេស {top10Students[0].letterGrade}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                <span>មធ្យមភាគ៖ <strong className="text-blue-700">{top10Students[0].average}</strong></span>
                <span>ពិន្ទុ៖ <strong className="text-slate-800">{top10Students[0].totalScore}</strong></span>
              </div>
              <button
                onClick={() => {
                  triggerConfetti();
                  onOpenCertificate(top10Students[0]);
                }}
                className="mt-2 text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                ចេញបណ្ណសរសើរ
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-3">មិនទាន់មានទិន្នន័យ</p>
          )}
        </div>
      </div>

      {/* 3. MIDDLE SECTION: GRADE DISTRIBUTION & SUBJECT RANKINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Breakdown Column */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              ការបែងចែកកម្រិតនិទ្ទេស (A - F)
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {MONTH_NAMES[selectedPeriod]}
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { grade: 'A', label: 'និទ្ទេស A (ល្អប្រសើរ)', count: gradeCounts.A, color: 'bg-emerald-600', text: 'text-emerald-700' },
              { grade: 'B', label: 'និទ្ទេស B (ល្អ)', count: gradeCounts.B, color: 'bg-blue-600', text: 'text-blue-700' },
              { grade: 'C', label: 'និទ្ទេស C (ល្អបង្គួរ)', count: gradeCounts.C, color: 'bg-cyan-600', text: 'text-cyan-700' },
              { grade: 'D', label: 'និទ្ទេស D (មធ្យម)', count: gradeCounts.D, color: 'bg-amber-500', text: 'text-amber-700' },
              { grade: 'E', label: 'និទ្ទេស E (មធ្យម)', count: gradeCounts.E, color: 'bg-orange-500', text: 'text-orange-700' },
              { grade: 'F', label: 'និទ្ទេស F (ខ្សោយ)', count: gradeCounts.F, color: 'bg-rose-600', text: 'text-rose-700' },
            ].map((item) => {
              const pct = totalInClass > 0 ? Math.round((item.count / totalInClass) * 100) : 0;
              return (
                <div key={item.grade} className="text-xs">
                  <div className="flex items-center justify-between pb-1">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="font-bold text-slate-900">
                      {item.count} នាក់ ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>សិស្សសរុបគណនា៖ <strong>{totalInClass} នាក់</strong></span>
            <button
              onClick={onNavigateToScores}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              មើលតារាងពិន្ទុពេញ <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Subject Performance Ranking */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                មធ្យមភាគពិន្ទុតាមមុខវិជ្ជា ({currentClass.subjects.length} មុខវិជ្ជា)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                រៀបតាមភាគរយលទ្ធផលខ្ពស់បំផុត ទៅទាបបំផុត នៃថ្នាក់ {currentClass.name}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs">
              {currentClass.gradingSystem === '700_system' ? 'ខ្នាត ៧០០ ពិន្ទុ' : 'ខ្នាត ៤៨០ ឌីប្លូម'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
            {subjectAverages.map((item, idx) => (
              <div
                key={item.subject.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all text-xs"
              >
                <div className="flex items-center justify-between pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800">{item.subject.name}</span>
                  </div>
                  <span className="font-extrabold text-blue-700">
                    {item.avgScore} <span className="text-[10px] text-slate-400 font-normal">/{item.subject.maxScore}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1">
                  <span>ភាគរយជោគជ័យ៖</span>
                  <span className="font-semibold text-slate-700">{item.percentage}%</span>
                </div>

                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className={`h-full rounded-full ${
                      item.percentage >= 70
                        ? 'bg-emerald-500'
                        : item.percentage >= 50
                        ? 'bg-blue-500'
                        : 'bg-rose-500'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. TOP 10 OUTSTANDING STUDENTS & EARLY WARNING AT-RISK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Outstanding Students (Honors) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                តារាងកិត្តិយស៖ សិស្សពូកែកំពូល ១០ នាក់ ({currentClass.name})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ចំណាត់ថ្នាក់ប្រចាំ {MONTH_NAMES[selectedPeriod]}
              </p>
            </div>
            <button
              onClick={triggerConfetti}
              className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold text-xs flex items-center gap-1 hover:bg-amber-100 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              អបអរសាទរ
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {top10Students.map((grade) => (
              <div
                key={grade.student.id}
                className="py-2.5 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      grade.classRank === 1
                        ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                        : grade.classRank === 2
                        ? 'bg-slate-300 text-slate-900'
                        : grade.classRank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {grade.classRank}
                  </span>
                  <div>
                    <button
                      onClick={() => onOpenStudentDetail(grade.student)}
                      className="font-bold text-slate-900 text-xs hover:text-blue-600 text-left"
                    >
                      {grade.student.fullName}
                    </button>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>ភេទ៖ {grade.student.gender === 'ស' ? 'ស្រី' : 'ប្រុស'}</span>
                      <span>•</span>
                      <span>អត្តលេខ {grade.student.rollNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="text-xs font-extrabold text-blue-700">
                      មធ្យម {grade.average}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-600">
                      និទ្ទេស {grade.letterGrade} ({grade.wordGrade})
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      triggerConfetti();
                      onOpenCertificate(grade);
                    }}
                    className="p-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold cursor-pointer"
                    title="ចេញបណ្ណសរសើរ"
                  >
                    បណ្ណសរសើរ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dropout / At-Risk Early Warning */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                សិស្សប្រឈមហានិភ័យបោះបង់ ឬពិន្ទុខ្សោយ ({atRiskStudents.length} នាក់)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ប្រព័ន្ធប្រកាសអាសន្នជាមុន (Early Warning) សម្រាប់គ្រូបន្ទុកថ្នាក់
              </p>
            </div>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-xs">
              ត្រូវការអន្តរាគមន៍
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {atRiskStudents.length > 0 ? (
              atRiskStudents.map((grade) => (
                <div
                  key={grade.student.id}
                  className="py-2.5 px-2 flex items-center justify-between hover:bg-rose-50/50 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                      {grade.isAbsent ? 'អវត្ត' : 'F'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        {grade.student.fullName}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        អាណាព្យាបាល៖ {grade.student.guardianName} ({grade.student.guardianJob})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right text-xs">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        {grade.isAbsent ? 'អវត្តមានប្រឡង' : `ពិន្ទុ ${grade.totalScore}`}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        មធ្យម {grade.average}
                      </p>
                    </div>
                    <a
                      href={`tel:${grade.student.guardianPhone}`}
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                      title={`ហៅទូរស័ព្ទ៖ ${grade.student.guardianPhone}`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                🎉 ថ្នាក់នេះគ្មានសិស្សប្រឈមហានិភ័យធ្លាក់ឡើយ!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE CLASS STUDENT DIRECTORY (Reactive to Switcher) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              បញ្ជីសិស្ស និងលទ្ធផលប្រឡងថ្នាក់ {currentClass.name} ({filteredStudentGrades.length} នាក់)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ទិន្នន័យស្រង់ចេញពី {MONTH_NAMES[selectedPeriod]}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ស្វែងរកឈ្មោះ ឬអត្តលេខ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden w-44"
              />
            </div>

            {/* Gender Filter */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-hidden"
            >
              <option value="all">ភេទទាំងអស់</option>
              <option value="ស">ស្រី</option>
              <option value="ប">ប្រុស</option>
            </select>

            {/* Grade Filter */}
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-hidden"
            >
              <option value="all">និទ្ទេសទាំងអស់</option>
              <option value="A">និទ្ទេស A</option>
              <option value="B">និទ្ទេស B</option>
              <option value="C">និទ្ទេស C</option>
              <option value="D">និទ្ទេស D</option>
              <option value="E">និទ្ទេស E</option>
              <option value="F">និទ្ទេស F</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-center">ល.រ</th>
                <th className="px-3 py-2.5">គោត្តនាម-នាម</th>
                <th className="px-2 py-2.5 text-center">ភេទ</th>
                <th className="px-3 py-2.5">ថ្ងៃខែឆ្នាំកំណើត</th>
                <th className="px-3 py-2.5 text-right">ពិន្ទុសរុប</th>
                <th className="px-3 py-2.5 text-right">មធ្យមភាគ</th>
                <th className="px-3 py-2.5 text-center">និទ្ទេស</th>
                <th className="px-2 py-2.5 text-center">ចំណាត់ថ្នាក់</th>
                <th className="px-3 py-2.5 text-center">លទ្ធផល</th>
                <th className="px-3 py-2.5 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudentGrades.map((grade) => (
                <tr key={grade.student.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-3 py-2 text-center font-medium text-slate-500">
                    {grade.student.rollNumber}
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
                  <td className="px-3 py-2 text-slate-600 font-mono text-[11px]">
                    {grade.student.dob}
                  </td>
                  <td className="px-3 py-2 text-right font-extrabold text-slate-900">
                    {grade.isAbsent ? '-' : grade.totalScore}
                  </td>
                  <td className="px-3 py-2 text-right font-extrabold text-blue-700">
                    {grade.isAbsent ? '-' : grade.average.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-center font-bold">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] ${
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
                  <td className="px-2 py-2 text-center font-bold text-slate-800">
                    {grade.classRank}
                  </td>
                  <td className="px-3 py-2 text-center font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] ${
                        grade.result === 'ជាប់'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : grade.result === 'ធ្លាក់'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {grade.result}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onOpenStudentDetail(grade.student)}
                        className="px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-[10px]"
                      >
                        ព័ត៌មាន
                      </button>
                      <button
                        onClick={() => {
                          triggerConfetti();
                          onOpenCertificate(grade);
                        }}
                        className="px-2 py-1 rounded bg-amber-100 text-amber-900 hover:bg-amber-200 font-semibold text-[10px]"
                      >
                        បណ្ណ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
