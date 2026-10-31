import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Calculator,
  Check,
  Download,
  Eraser,
  Filter,
  Info,
  Printer,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sliders,
  Sparkles,
  Trash2,
  UserX,
  X,
} from 'lucide-react';
import {
  CalculatedStudentGrade,
  ClassId,
  ClassroomInfo,
  MonthKey,
  Student,
  SubjectDefinition,
} from '../types';
import {
  ACADEMIC_PERIOD_OPTIONS,
  calculateClassGrades,
  MONTH_NAMES,
} from '../utils/grading';

interface ScoreEntryViewProps {
  classrooms: ClassroomInfo[];
  selectedClassId: ClassId;
  onSelectClass: (id: ClassId) => void;
  students: Student[];
  onUpdateStudents: (updatedStudents: Student[]) => void;
  onOpenCertificate: (grade: CalculatedStudentGrade) => void;
}

export const ScoreEntryView: React.FC<ScoreEntryViewProps> = ({
  classrooms,
  selectedClassId,
  onSelectClass,
  students,
  onUpdateStudents,
  onOpenCertificate,
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  // Default to month_11 (វិច្ឆិកា ខែទី១) as per MoEYS calendar
  const [selectedPeriod, setSelectedPeriod] = useState<MonthKey>('month_11');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [clearedToast, setClearedToast] = useState(false);
  const [lastClearedBackup, setLastClearedBackup] = useState<{
    classId: ClassId;
    period: MonthKey;
    scores: { [studentId: string]: { [subjectId: string]: number | null | undefined } };
    absents: { [studentId: string]: boolean };
  } | null>(null);

  // Custom formula adjustments (temporary or persisted)
  const [customDivisor, setCustomDivisor] = useState<number>(currentClass.divisor);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);

  // Filter students for the active class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Local state for instant score editing
  const [editedScores, setEditedScores] = useState<{
    [studentId: string]: { [subjectId: string]: number | null };
  }>({});

  const [editedAbsents, setEditedAbsents] = useState<{
    [studentId: string]: boolean;
  }>({});

  // Merge students with local edits
  const activeStudentsWithEdits: Student[] = useMemo(() => {
    return classStudents.map((stu) => {
      const stuEdits = editedScores[stu.id];
      const isAbsentEdit = editedAbsents[stu.id];

      const periodScores = { ...(stu.scores[selectedPeriod] || {}) };
      if (stuEdits) {
        Object.keys(stuEdits).forEach((subjId) => {
          periodScores[subjId] = stuEdits[subjId];
        });
      }

      const absentPeriods = { ...(stu.absentPeriods || {}) };
      if (isAbsentEdit !== undefined) {
        absentPeriods[selectedPeriod] = isAbsentEdit;
      }

      return {
        ...stu,
        scores: {
          ...stu.scores,
          [selectedPeriod]: periodScores,
        },
        absentPeriods,
      };
    });
  }, [classStudents, editedScores, editedAbsents, selectedPeriod]);

  // Calculated grades using the exact MoEYS formulas
  const calculatedGrades = useMemo(() => {
    return calculateClassGrades(
      activeStudentsWithEdits,
      currentClass,
      selectedPeriod,
      customDivisor
    );
  }, [activeStudentsWithEdits, currentClass, selectedPeriod, customDivisor]);

  // Handle cell score change
  const handleScoreChange = (studentId: string, subjectId: string, rawVal: string, maxScore: number) => {
    let numVal: number | null = null;
    if (rawVal.trim() !== '') {
      const parsed = parseFloat(rawVal);
      if (!isNaN(parsed)) {
        numVal = Math.max(0, Math.min(maxScore, parsed));
      }
    }

    setEditedScores((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectId]: numVal,
      },
    }));

    // If student enters a score, unmark absent
    if (numVal !== null && numVal > 0) {
      setEditedAbsents((prev) => ({
        ...prev,
        [studentId]: false,
      }));
    }
  };

  // Toggle student absent
  const handleToggleAbsent = (studentId: string) => {
    const currentAbsent =
      editedAbsents[studentId] ??
      (classStudents.find((s) => s.id === studentId)?.absentPeriods?.[selectedPeriod] === true);

    setEditedAbsents((prev) => ({
      ...prev,
      [studentId]: !currentAbsent,
    }));
  };

  // Save all modified scores into main state & localStorage
  const handleSaveAll = () => {
    const updated = students.map((stu) => {
      if (stu.classId !== selectedClassId) return stu;
      const stuEdits = editedScores[stu.id];
      const isAbsentEdit = editedAbsents[stu.id];

      if (!stuEdits && isAbsentEdit === undefined) return stu;

      const newScores = { ...stu.scores };
      const currentPeriodScores = { ...(newScores[selectedPeriod] || {}) };
      if (stuEdits) {
        Object.keys(stuEdits).forEach((subj) => {
          currentPeriodScores[subj] = stuEdits[subj];
        });
      }
      newScores[selectedPeriod] = currentPeriodScores;

      const newAbsent = { ...(stu.absentPeriods || {}) };
      if (isAbsentEdit !== undefined) {
        newAbsent[selectedPeriod] = isAbsentEdit;
      }

      return {
        ...stu,
        scores: newScores,
        absentPeriods: newAbsent,
      };
    });

    onUpdateStudents(updated);
    setEditedScores({});
    setEditedAbsents({});
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  // Clear all scores and attendance for current class in selected period
  const handleClearScores = () => {
    // 1. Backup current class scores & absents for instant Undo
    const backupScores: { [studentId: string]: { [subjectId: string]: number | null | undefined } } = {};
    const backupAbsents: { [studentId: string]: boolean } = {};

    classStudents.forEach((stu) => {
      backupScores[stu.id] = { ...(stu.scores[selectedPeriod] || {}) };
      backupAbsents[stu.id] = stu.absentPeriods?.[selectedPeriod] || false;
    });

    setLastClearedBackup({
      classId: selectedClassId,
      period: selectedPeriod,
      scores: backupScores,
      absents: backupAbsents,
    });

    // 2. Clear local unsaved edits
    setEditedScores({});
    setEditedAbsents({});

    // 3. Clear stored scores for this period in all students belonging to this class
    const updated = students.map((stu) => {
      if (stu.classId !== selectedClassId) return stu;
      const newScores = { ...stu.scores };
      newScores[selectedPeriod] = {};
      const newAbsents = { ...(stu.absentPeriods || {}) };
      newAbsents[selectedPeriod] = false;

      return {
        ...stu,
        scores: newScores,
        absentPeriods: newAbsents,
      };
    });

    onUpdateStudents(updated);
    setIsClearConfirmOpen(false);
    setClearedToast(true);
    setTimeout(() => setClearedToast(false), 12000);
  };

  // Undo the clear action if teacher cleared by mistake
  const handleUndoClear = () => {
    if (!lastClearedBackup) return;
    const { classId, period, scores, absents } = lastClearedBackup;

    const restored = students.map((stu) => {
      if (stu.classId !== classId) return stu;
      const newScores = { ...stu.scores };
      newScores[period] = (scores[stu.id] as { [s: string]: number }) || {};
      const newAbsents = { ...(stu.absentPeriods || {}) };
      newAbsents[period] = absents[stu.id] || false;

      return {
        ...stu,
        scores: newScores,
        absentPeriods: newAbsents,
      };
    });

    onUpdateStudents(restored);
    setLastClearedBackup(null);
    setClearedToast(false);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const subjects = currentClass.subjects;
    // Build CSV Header
    let csv = `ល.រ,គោត្តនាម,នាម,ភេទ,ថ្ងៃខែឆ្នាំកំណើត,`;
    subjects.forEach((s) => {
      csv += `${s.name}(ពិន្ទុ),${s.name}(និទ្ទេស),${s.name}(ចំណាត់ថ្នាក់),`;
    });
    csv += `ពិន្ទុសរុប,មធ្យមភាគ,និទ្ទេស(ពាក្យ),ចំណាត់ថ្នាក់,និទ្ទេស(អក្សរ),លទ្ធផល\n`;

    calculatedGrades.forEach((g) => {
      csv += `${g.student.rollNumber},"${g.student.lastName}","${g.student.firstName}",${g.student.gender},${g.student.dob},`;
      subjects.forEach((s) => {
        const sRes = g.subjectResults[s.id];
        const sc = sRes?.score !== null && sRes?.score !== undefined ? sRes.score : '';
        const lt = sRes?.letterGrade || 'F';
        const rk = sRes?.rank || '#N/A';
        csv += `${sc},${lt},${rk},`;
      });
      csv += `${g.isAbsent ? 0 : g.totalScore},${g.isAbsent ? '0.00' : g.average.toFixed(2)},${g.wordGrade},${g.classRank},${g.letterGrade},${g.result}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `សម្រង់ពិន្ទុ_${currentClass.name}_${selectedPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter students by search
  const filteredGrades = useMemo(() => {
    return calculatedGrades.filter(
      (g) =>
        g.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.student.rollNumber.toString().includes(searchQuery)
    );
  }, [calculatedGrades, searchQuery]);

  const hasUnsavedChanges =
    Object.keys(editedScores).length > 0 || Object.keys(editedAbsents).length > 0;

  return (
    <div className="space-y-6">
      {/* Header Bar with Class Switcher & Period Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-800 rounded-xl font-bold">
                <Calculator className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  សម្រង់ពិន្ទុនៃការប្រឡង (គំរូ MoEYS ផ្លូវការ)
                </h2>
                <p className="text-xs text-slate-500">
                  ថ្នាក់៖ <strong className="text-blue-700">{currentClass.name}</strong> • របប{' '}
                  <strong>
                    {currentClass.gradingSystem === '700_system'
                      ? '៧០០ ពិន្ទុ (ចែក ១៤)'
                      : '៤៨០ ពិន្ទុ (ឌីប្លូម / ចែក ៨.៤)'}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsFormulaModalOpen(true)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>រូបមន្ត (ចែក {customDivisor})</span>
            </button>

            <button
              onClick={() => setIsClearConfirmOpen(true)}
              className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              title={`សម្អាតពិន្ទុទាំងអស់សម្រាប់ថ្នាក់ ${currentClass.name} ក្នុង ${MONTH_NAMES[selectedPeriod]} ដើម្បីបំពេញថ្មី`}
            >
              <Eraser className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear ពិន្ទុ</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ទាញយក CSV/Excel</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>បោះពុម្ពតារាង</span>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={!hasUnsavedChanges}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 animate-pulse'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>រក្សាទុកពិន្ទុ {hasUnsavedChanges ? '(មានការកែ)' : ''}</span>
            </button>
          </div>
        </div>

        {/* Class Switcher & Month Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Class Tabs */}
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

          {/* Month & Search */}
          <div className="flex items-center gap-2 flex-wrap">
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

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ស្វែងរកសិស្ស..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 w-36"
              />
            </div>
          </div>
        </div>

        {/* Live Notification Bar */}
        {isSavedToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>បានរក្សាទុកពិន្ទុ និងគណនាលទ្ធផលសិស្សដោយជោគជ័យ!</span>
          </div>
        )}

        {/* Cleared Scores Notification Bar with Undo */}
        {clearedToast && (
          <div
            data-testid="cleared-toast"
            className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center justify-between gap-3 shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Eraser className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                ពិន្ទុសម្រាប់ថ្នាក់ <strong>{currentClass.name}</strong> ក្នុង{' '}
                <strong>{MONTH_NAMES[selectedPeriod]}</strong> ត្រូវបានសម្អាតរួចរាល់!
                លោកគ្រូ-អ្នកគ្រូអាចចាប់ផ្តើមបំពេញពិន្ទុថ្មីបានហើយ។
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {lastClearedBackup && (
                <button
                  onClick={handleUndoClear}
                  className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>មិនធ្វើវិញ (Undo)</span>
                </button>
              )}
              <button
                onClick={() => setClearedToast(false)}
                className="p-1 hover:bg-rose-200/50 rounded-lg text-rose-500 hover:text-rose-700 cursor-pointer"
                title="បិទការជូនដំណឹង"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Vacation Period Warning / Info */}
        {selectedPeriod === 'month_04' && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2.5">
            <span className="text-xl">🏖️</span>
            <div>
              <p className="font-bold">
                ខែមេសា (សម្រាកវិស្សមកាល) — ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិខ្មែរ
              </p>
              <p className="text-amber-700">
                ពុំមានការប្រឡងប្រចាំខែឡើយ ប៉ុន្តែលោកគ្រូ-អ្នកគ្រូនៅតែអាចកត់ត្រាពិន្ទុកិច្ចការស្រាវជ្រាវ
                ឬពិន្ទុពិសេសបានប្រសិនបើមាន។
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Official MoEYS Print Header (Visible only in print) */}
      <div className="hidden print-only mb-6 text-center">
        <div className="font-bold text-sm tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</div>
        <div className="text-xs">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
        <div className="my-2 border-b border-black w-24 mx-auto"></div>
        <div className="font-bold text-base mt-2">
          តារាងសម្រង់ពិន្ទុប្រឡងប្រចាំ{MONTH_NAMES[selectedPeriod]} ឆ្នាំសិក្សា ២០២៦-២០២៧
        </div>
        <div className="text-xs text-slate-600 mt-1">
          អនុវិទ្យាល័យទួលទទឹង • ថ្នាក់ {currentClass.name} • គ្រូបន្ទុកថ្នាក់៖ {currentClass.homeroomTeacher.name}
        </div>
      </div>

      {/* 2-TIER INTERACTIVE SCORE TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[700px] relative">
          <table className="w-full text-xs text-left border-collapse min-w-[1300px]">
            {/* Header Tier 1 & 2 */}
            <thead className="bg-slate-100 text-slate-800 sticky top-0 z-20 shadow-xs">
              {/* Row 1 */}
              <tr className="border-b border-slate-300 text-center font-bold">
                <th rowSpan={2} className="px-2 py-2 border-r border-slate-300 bg-slate-200/90 w-10 sticky left-0 z-30">
                  ល.រ
                </th>
                <th rowSpan={2} className="px-3 py-2 border-r border-slate-300 bg-slate-200/90 min-w-[90px] sticky left-10 z-30 text-left">
                  គោត្តនាម
                </th>
                <th rowSpan={2} className="px-3 py-2 border-r border-slate-300 bg-slate-200/90 min-w-[90px] sticky left-32 z-30 text-left">
                  នាម
                </th>
                <th rowSpan={2} className="px-1.5 py-2 border-r border-slate-300 bg-slate-200/90 w-10">
                  ភេទ
                </th>
                <th rowSpan={2} className="px-2 py-2 border-r border-slate-300 bg-slate-200/90 min-w-[85px]">
                  ថ្ងៃខែឆ្នាំកំណើត
                </th>

                {/* Subject Columns (colspan 3 each) */}
                {currentClass.subjects.map((subj) => (
                  <th
                    key={subj.id}
                    colSpan={3}
                    className="px-2 py-1.5 border-r border-slate-300 bg-blue-50/80 text-blue-950 font-extrabold text-[11px]"
                  >
                    <div>{subj.shortName}</div>
                    <div className="text-[10px] text-blue-700 font-semibold font-mono">
                      (ពេញ {subj.maxScore})
                    </div>
                  </th>
                ))}

                {/* Summary Headers */}
                <th rowSpan={2} className="px-2 py-2 border-r border-slate-300 bg-amber-100 text-amber-950 font-extrabold min-w-[65px]">
                  ពិន្ទុសរុប
                </th>
                <th rowSpan={2} className="px-2 py-2 border-r border-slate-300 bg-blue-100 text-blue-950 font-extrabold min-w-[65px]">
                  មធ្យមភាគ
                </th>
                <th rowSpan={2} className="px-2 py-2 border-r border-slate-300 bg-slate-200 font-bold min-w-[65px]">
                  និទ្ទេស
                </th>
                <th rowSpan={2} className="px-1.5 py-2 border-r border-slate-300 bg-amber-50 font-bold w-12">
                  ចំណាត់ថ្នាក់
                </th>
                <th rowSpan={2} className="px-2 py-2 border-r border-slate-300 bg-slate-200 font-bold w-12">
                  និទ្ទេស
                </th>
                <th rowSpan={2} className="px-2 py-2 bg-slate-200 font-bold min-w-[60px]">
                  លទ្ធផល
                </th>
              </tr>

              {/* Row 2: Sub-columns */}
              <tr className="border-b border-slate-300 text-[10px] font-bold text-slate-600 bg-slate-100">
                {currentClass.subjects.map((subj) => (
                  <React.Fragment key={`sub_${subj.id}`}>
                    <th className="px-1.5 py-1 text-center border-r border-slate-200 w-12">ពិន្ទុ</th>
                    <th className="px-1 py-1 text-center border-r border-slate-200 w-8 text-slate-500">និទ្ទេស</th>
                    <th className="px-1 py-1 text-center border-r border-slate-300 w-9 text-slate-500">ចំណាត់ថ្នាក់</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredGrades.map((grade) => {
                const stu = grade.student;
                const isAbsent = grade.isAbsent;

                return (
                  <tr
                    key={stu.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isAbsent ? 'bg-rose-50/40 text-slate-400' : 'bg-white'
                    }`}
                  >
                    {/* Sticky info columns */}
                    <td className="px-2 py-1.5 text-center font-semibold text-slate-500 border-r border-slate-200 bg-slate-50 sticky left-0 z-10">
                      {stu.rollNumber}
                    </td>
                    <td className="px-3 py-1.5 font-bold text-slate-900 border-r border-slate-200 bg-slate-50 sticky left-10 z-10 whitespace-nowrap">
                      {stu.lastName}
                    </td>
                    <td className="px-3 py-1.5 font-bold text-slate-900 border-r border-slate-200 bg-slate-50 sticky left-32 z-10 whitespace-nowrap">
                      {stu.firstName}
                    </td>
                    <td className="px-1 py-1.5 text-center border-r border-slate-200 font-semibold">
                      <span
                        className={`px-1 rounded text-[10px] ${
                          stu.gender === 'ស' ? 'text-rose-700 bg-rose-50' : 'text-blue-700 bg-blue-50'
                        }`}
                      >
                        {stu.gender}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-center text-[10px] font-mono text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {stu.dob}
                    </td>

                    {/* Subject Cells: [Score] [Letter] [Rank] */}
                    {currentClass.subjects.map((subj) => {
                      const res = grade.subjectResults[subj.id];
                      const rawScoreVal = res?.score ?? '';

                      return (
                        <React.Fragment key={`cell_${stu.id}_${subj.id}`}>
                          {/* Score Input */}
                          <td className="px-1 py-1 border-r border-slate-200 text-center">
                            <input
                              type="number"
                              disabled={isAbsent}
                              value={rawScoreVal}
                              onChange={(e) =>
                                handleScoreChange(stu.id, subj.id, e.target.value, subj.maxScore)
                              }
                              placeholder={isAbsent ? '-' : '0'}
                              max={subj.maxScore}
                              min={0}
                              className={`w-11 text-center font-bold text-xs py-0.5 rounded border focus:outline-hidden focus:ring-1 focus:ring-blue-500 ${
                                isAbsent
                                  ? 'bg-transparent border-transparent text-slate-400'
                                  : 'bg-white border-slate-200 text-slate-900 hover:border-slate-400'
                              }`}
                            />
                          </td>

                          {/* Letter Grade */}
                          <td className="px-1 py-1 border-r border-slate-200 text-center font-bold text-[11px]">
                            <span
                              className={`${
                                res?.letterGrade === 'A'
                                  ? 'text-emerald-700'
                                  : res?.letterGrade === 'B'
                                  ? 'text-blue-700'
                                  : res?.letterGrade === 'C'
                                  ? 'text-cyan-700'
                                  : res?.letterGrade === 'D' || res?.letterGrade === 'E'
                                  ? 'text-amber-700'
                                  : 'text-rose-600'
                              }`}
                            >
                              {res?.letterGrade || 'F'}
                            </span>
                          </td>

                          {/* Subject Rank */}
                          <td className="px-1 py-1 border-r border-slate-300 text-center font-mono text-[10px] text-slate-600">
                            {res?.rank || '#N/A'}
                          </td>
                        </React.Fragment>
                      );
                    })}

                    {/* Summary Columns */}
                    <td className="px-2 py-1.5 text-right font-extrabold text-slate-900 border-r border-slate-200 bg-amber-50/50">
                      {isAbsent ? '0' : grade.totalScore}
                    </td>
                    <td className="px-2 py-1.5 text-right font-extrabold text-blue-700 border-r border-slate-200 bg-blue-50/50">
                      {isAbsent ? '0.00' : grade.average.toFixed(2)}
                    </td>
                    <td className="px-2 py-1.5 text-center font-bold text-[11px] text-slate-800 border-r border-slate-200">
                      {grade.wordGrade}
                    </td>
                    <td className="px-1 py-1.5 text-center font-extrabold text-slate-900 border-r border-slate-200 bg-amber-50">
                      {grade.classRank}
                    </td>
                    <td className="px-1.5 py-1.5 text-center font-extrabold text-xs border-r border-slate-200">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
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
                    <td className="px-2 py-1.5 text-center font-semibold text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          grade.result === 'ជាប់'
                            ? 'bg-emerald-100 text-emerald-800 font-bold'
                            : grade.result === 'ធ្លាក់'
                            ? 'bg-rose-100 text-rose-800 font-bold'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {grade.result}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORMULA ADJUSTMENT MODAL */}
      {isFormulaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  កែប្រែរូបមន្ត & មេគុណចែក
                </h3>
              </div>
              <button
                onClick={() => setIsFormulaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                រូបមន្តគណនាមធ្យមភាគ៖ <strong className="text-blue-700">មធ្យមភាគ = ពិន្ទុសរុប ÷ មេគុណចែក</strong>
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  មេគុណចែក (Divisor)៖
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={customDivisor}
                    onChange={(e) => setCustomDivisor(parseFloat(e.target.value) || 1)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl font-bold text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setCustomDivisor(currentClass.divisor)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
                  >
                    ស្តង់ដារ ({currentClass.divisor})
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  • ថ្នាក់ទី ៧ និង ៨ (របប ៧០០ ពិន្ទុ)៖ មេគុណចែកគឺ <strong>១៤</strong> (៧០០ ÷ ៥០)<br />
                  • ថ្នាក់ទី ៩ ឌីប្លូម (របប ៤២០/៤៨០)៖ មេគុណចែកគឺ <strong>៨.៤</strong> (៤២០ ÷ ៥០)
                </p>
              </div>

              <div className="pt-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  ពិន្ទុមធ្យមភាគជាប់ (Pass Benchmark)៖
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                  ២៥.០០ (លើខ្នាត ៥០.០០) ស្របតាមក្បួនខ្នាត MoEYS
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setIsFormulaModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                អនុវត្តរូបមន្ត
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Scores Confirmation Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  បញ្ជាក់ការសម្អាតពិន្ទុ (Clear Scores)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  សម្រាប់ករណីចង់លុបពិន្ទុចោល ដើម្បីបំពេញពិន្ទុថ្មីពីដើម
                </p>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5 space-y-2 text-xs text-rose-900">
              <div className="flex justify-between items-center py-1 border-b border-rose-200/60">
                <span className="text-rose-700">ថ្នាក់រៀន៖</span>
                <strong className="font-bold">{currentClass.name}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-rose-200/60">
                <span className="text-rose-700">កាលបរិច្ឆេទស្រង់ពិន្ទុ៖</span>
                <strong className="font-bold">{MONTH_NAMES[selectedPeriod]}</strong>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-rose-700">ចំនួនសិស្សទទួលរងការ Clear៖</span>
                <strong className="font-bold">{classStudents.length} នាក់</strong>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-800">ចំណាំសំខាន់៖</p>
              <p>• ពិន្ទុគ្រប់មុខវិជ្ជារបស់សិស្សក្នុងថ្នាក់នេះ សម្រាប់{MONTH_NAMES[selectedPeriod]} នឹងត្រូវកំណត់ជាទទេ (Empty) ភ្លាមៗ។</p>
              <p>• លោកគ្រូ-អ្នកគ្រូអាចចាប់ផ្តើមវាយបញ្ចូលពិន្ទុថ្មីក្នុងតារាងបានភ្លាមៗ។</p>
              <p>• ទិន្នន័យនៃខែផ្សេងៗទៀត នឹងរក្សាទុកដដែល មិនមានការបាត់បង់ឡើយ។</p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                onClick={handleClearScores}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>បាទ/ចាស Clear ពិន្ទុឥឡូវនេះ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
