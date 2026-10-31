import React, { useRef, useState, useMemo } from 'react';
import {
  Award,
  Check,
  Download,
  FileDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  Printer,
  Sparkles,
  X,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  CalculatedStudentGrade,
  ClassId,
  ClassroomInfo,
  MonthKey,
  SchoolInfo,
  Student,
  SubjectDefinition,
} from '../types';
import { GRADE_9_SUBJECTS } from '../data/mockData';
import { calculateClassGrades, MONTH_NAMES } from '../utils/grading';

interface MonthlyReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolInfo: SchoolInfo;
  currentClass: ClassroomInfo;
  selectedPeriod: MonthKey;
  students: Student[];
}

export const MonthlyReportPdfModal: React.FC<MonthlyReportPdfModalProps> = ({
  isOpen,
  onClose,
  schoolInfo,
  currentClass,
  selectedPeriod,
  students,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'moeys11' | 'classStandard'>('moeys11');

  // Filter students for current class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === currentClass.id);
  }, [students, currentClass.id]);

  // Use the specific 11-subject MoEYS layout if layoutMode === 'moeys11'
  const activeClassroomConfig: ClassroomInfo = useMemo(() => {
    if (layoutMode === 'moeys11') {
      return {
        ...currentClass,
        subjects: GRADE_9_SUBJECTS, // Specific 11 subjects (Essay 60, Dict 40, Math 100, Phy 35, Chem 25, Bio 35, Earth 25, Hist 33, Geo 32, Civic 35, Eng 25)
        totalMaxScore: 480,
        divisor: 8.4,
      };
    }
    return currentClass;
  }, [currentClass, layoutMode]);

  // Calculate grades using the layout
  const calculatedGrades = useMemo(() => {
    return calculateClassGrades(
      classStudents,
      activeClassroomConfig,
      selectedPeriod,
      activeClassroomConfig.divisor
    );
  }, [classStudents, activeClassroomConfig, selectedPeriod]);

  // Sort by roll number or class rank
  const sortedGrades = useMemo(() => {
    return [...calculatedGrades].sort((a, b) => a.student.rollNumber - b.student.rollNumber);
  }, [calculatedGrades]);

  // Summary statistics
  const totalStudents = classStudents.length;
  const femaleCount = classStudents.filter((s) => s.gender === 'ស').length;
  const maleCount = totalStudents - femaleCount;

  const passedStudents = calculatedGrades.filter((g) => g.result === 'ជាប់');
  const passedFemale = passedStudents.filter((g) => g.student.gender === 'ស').length;
  const passRate = totalStudents > 0 ? Math.round((passedStudents.length / totalStudents) * 100) : 0;

  const failedStudents = calculatedGrades.filter((g) => g.result === 'ធ្លាក់');
  const failedFemale = failedStudents.filter((g) => g.student.gender === 'ស').length;

  const absentStudents = calculatedGrades.filter((g) => g.result === 'អវត្តមាន');
  const absentFemale = absentStudents.filter((g) => g.student.gender === 'ស').length;

  const gradeCounts = {
    A: calculatedGrades.filter((g) => g.letterGrade === 'A').length,
    B: calculatedGrades.filter((g) => g.letterGrade === 'B').length,
    C: calculatedGrades.filter((g) => g.letterGrade === 'C').length,
    D: calculatedGrades.filter((g) => g.letterGrade === 'D').length,
    E: calculatedGrades.filter((g) => g.letterGrade === 'E').length,
    F: calculatedGrades.filter((g) => g.letterGrade === 'F').length,
  };

  // Generate downloadable PDF
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsExportingPdf(true);

    try {
      const element = reportRef.current;
      // High quality canvas capture
      const canvas = await html2canvas(element, {
        scale: 2, // 2x resolution for crisp Khmer text rendering
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      // Landscape A4 orientation
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add extra pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `Monthly_Performance_Report_${currentClass.name}_${selectedPeriod}.pdf`;
      pdf.save(fileName);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('បរាជ័យក្នុងការទាញយក PDF សូមចុចប៊ូតុង «បោះពុម្ព» ជំនួសវិញ។');
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-7xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-4 max-h-[95vh] flex flex-col">
        {/* Top Control Bar (No Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 shrink-0 no-print">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-rose-100 text-rose-700 rounded-xl font-bold">
              <FileDown className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  របាយការណ៍លទ្ធផលសិក្សាប្រចាំខែជា PDF (Monthly Performance Report)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                  គំរូ ១១ មុខវិជ្ជា MoEYS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                រៀបចំតាមក្បួនខ្នាតក្រសួងអប់រំ យុវជន និងកីឡា សម្រាប់បោះពុម្ព និងដាក់ជូនថ្នាក់ដឹកនាំ
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Layout Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setLayoutMode('moeys11')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  layoutMode === 'moeys11'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                ទម្រង់ ១១ មុខវិជ្ជា MoEYS
              </button>
              <button
                onClick={() => setLayoutMode('classStandard')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  layoutMode === 'classStandard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                ទម្រង់ស្តង់ដារថ្នាក់ ({currentClass.subjects.length} មុខ)
              </button>
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer disabled:opacity-50"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>កំពុងបង្កើត PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>ទាញយក PDF (Download PDF)</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {exportSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 shrink-0">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>បានទាញយកឯកសារ PDF ដោយជោគជ័យ!</span>
          </div>
        )}

        {/* Scrollable Container with Real PDF Canvas Layout */}
        <div className="flex-1 overflow-auto bg-slate-100 p-2 sm:p-6 rounded-2xl border border-slate-200">
          {/* A4 Landscape Document Preview Target */}
          <div
            ref={reportRef}
            className="bg-white p-8 sm:p-10 shadow-xl border border-slate-300 mx-auto text-slate-900 min-w-[1250px] space-y-5 print:shadow-none print:border-none print:p-0 print:m-0"
            style={{ width: '1350px' }}
          >
            {/* 1. OFFICIAL MOEYS CAMBODIAN HEADER */}
            <div className="flex justify-between items-start text-xs border-b-2 border-slate-900 pb-4">
              {/* Left Ministry Info */}
              <div className="space-y-0.5 text-slate-800">
                <div className="font-bold text-sm">ក្រសួងអប់រំ យុវជន និងកីឡា</div>
                <div className="font-semibold text-xs">មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តព្រះសីហនុ</div>
                <div className="text-xs">ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកព្រៃនប់</div>
                <div className="font-bold text-sm text-blue-900 pt-1">
                  {schoolInfo.name}
                </div>
                <div className="text-[11px] text-slate-600">
                  ទីតាំង៖ {schoolInfo.location}
                </div>
              </div>

              {/* Center National Motto */}
              <div className="text-center space-y-1">
                <div className="font-extrabold text-sm tracking-widest text-slate-950">
                  ព្រះរាជាណាចក្រកម្ពុជា
                </div>
                <div className="text-xs font-bold text-slate-800">
                  ជាតិ សាសនា ព្រះមហាក្សត្រ
                </div>
                <div className="w-24 h-0.5 bg-slate-900 mx-auto my-1"></div>
              </div>

              {/* Right Report Title & Academic Year */}
              <div className="text-right space-y-0.5">
                <div className="text-xs text-slate-500">
                  ឆ្នាំសិក្សា៖ <strong className="text-slate-900">{schoolInfo.academicYear}</strong>
                </div>
                <div className="text-xs text-slate-500">
                  កម្រិតថ្នាក់៖ <strong className="text-blue-900 text-sm">{currentClass.name}</strong>
                </div>
                <div className="text-xs text-slate-500">
                  បន្ទប់រៀន៖ <strong>{currentClass.room}</strong>
                </div>
                <div className="text-xs text-slate-500">
                  គ្រូបន្ទុកថ្នាក់៖ <strong className="text-slate-900">{currentClass.homeroomTeacher.name}</strong>
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center pt-1 pb-1">
              <h2 className="text-lg font-black text-slate-950 uppercase tracking-wide">
                តារាងសម្រង់ពិន្ទុ និងចំណាត់ថ្នាក់សិស្សប្រចាំ{MONTH_NAMES[selectedPeriod]}
              </h2>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                (គំរូ និងរូបមន្តស្តង់ដារ ក្រសួងអប់រំ យុវជន និងកីឡា • មេគុណចែក៖ {activeClassroomConfig.divisor})
              </p>
            </div>

            {/* 2. SPECIFIC 11-SUBJECT MOEYS 2-TIER TABLE */}
            <div className="overflow-x-auto border-2 border-slate-900">
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  {/* Tier 1 Header */}
                  <tr className="bg-slate-100 text-slate-950 font-bold border-b border-slate-400 text-center">
                    <th rowSpan={2} className="px-1.5 py-1.5 border-r border-slate-400 w-8">
                      ល.រ
                    </th>
                    <th rowSpan={2} className="px-2 py-1.5 border-r border-slate-400 text-left min-w-[75px]">
                      គោត្តនាម
                    </th>
                    <th rowSpan={2} className="px-2 py-1.5 border-r border-slate-400 text-left min-w-[75px]">
                      នាម
                    </th>
                    <th rowSpan={2} className="px-1 py-1.5 border-r border-slate-400 w-8">
                      ភេទ
                    </th>
                    <th rowSpan={2} className="px-1.5 py-1.5 border-r border-slate-400 min-w-[75px]">
                      ថ្ងៃខែឆ្នាំកំណើត
                    </th>

                    {/* Specific Subjects */}
                    {activeClassroomConfig.subjects.map((subj) => (
                      <th
                        key={subj.id}
                        colSpan={3}
                        className="px-1 py-1 border-r border-slate-400 bg-blue-50/70 font-extrabold text-[11px]"
                      >
                        <div>{subj.shortName}</div>
                        <div className="text-[10px] font-mono font-semibold text-blue-900">
                          ({subj.maxScore})
                        </div>
                      </th>
                    ))}

                    {/* Totals & Results */}
                    <th rowSpan={2} className="px-1.5 py-1.5 border-r border-slate-400 bg-amber-50 font-extrabold w-12">
                      ពិន្ទុ<br />សរុប
                    </th>
                    <th rowSpan={2} className="px-1.5 py-1.5 border-r border-slate-400 bg-blue-50 font-extrabold w-14">
                      មធ្យម<br />ភាគ
                    </th>
                    <th rowSpan={2} className="px-1.5 py-1.5 border-r border-slate-400 font-bold w-14">
                      និទ្ទេស
                    </th>
                    <th rowSpan={2} className="px-1 py-1.5 border-r border-slate-400 font-bold w-10">
                      ចំណាត់<br />ថ្នាក់
                    </th>
                    <th rowSpan={2} className="px-1 py-1.5 border-r border-slate-400 font-bold w-10">
                      និទ្ទេស
                    </th>
                    <th rowSpan={2} className="px-1.5 py-1.5 font-bold w-12">
                      លទ្ធផល
                    </th>
                  </tr>

                  {/* Tier 2 Sub-columns: [ពិន្ទុ] [និទ្ទេស] [ចំណាត់ថ្នាក់] */}
                  <tr className="bg-slate-50 text-[10px] font-bold text-slate-700 border-b-2 border-slate-900 text-center">
                    {activeClassroomConfig.subjects.map((subj) => (
                      <React.Fragment key={`sub_tier2_${subj.id}`}>
                        <th className="px-1 py-0.5 border-r border-slate-300 w-9">ពិន្ទុ</th>
                        <th className="px-1 py-0.5 border-r border-slate-300 w-7">និទ្ទេស</th>
                        <th className="px-1 py-0.5 border-r border-slate-400 w-8">ចំណាត់</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-300">
                  {sortedGrades.map((grade) => {
                    const stu = grade.student;
                    const isAbsent = grade.isAbsent;

                    return (
                      <tr
                        key={stu.id}
                        className={`text-slate-900 ${
                          isAbsent ? 'bg-rose-50/30 text-slate-400' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-1 py-1 text-center font-bold text-slate-600 border-r border-slate-300">
                          {stu.rollNumber}
                        </td>
                        <td className="px-2 py-1 font-bold border-r border-slate-300 whitespace-nowrap">
                          {stu.lastName}
                        </td>
                        <td className="px-2 py-1 font-bold border-r border-slate-300 whitespace-nowrap">
                          {stu.firstName}
                        </td>
                        <td className="px-1 py-1 text-center font-semibold border-r border-slate-300">
                          {stu.gender}
                        </td>
                        <td className="px-1 py-1 text-center font-mono text-[10px] text-slate-600 border-r border-slate-400 whitespace-nowrap">
                          {stu.dob}
                        </td>

                        {/* Subject Marks, Letter Grades, and Subject Ranks */}
                        {activeClassroomConfig.subjects.map((subj) => {
                          const res = grade.subjectResults[subj.id];
                          const scoreVal = res?.score;

                          return (
                            <React.Fragment key={`cell_pdf_${stu.id}_${subj.id}`}>
                              <td className="px-1 py-1 text-center font-bold border-r border-slate-300">
                                {isAbsent ? '-' : scoreVal !== null && scoreVal !== undefined ? scoreVal : 0}
                              </td>
                              <td className="px-0.5 py-1 text-center font-bold text-[10px] border-r border-slate-300">
                                {res?.letterGrade || 'F'}
                              </td>
                              <td className="px-0.5 py-1 text-center font-mono text-[9px] text-slate-600 border-r border-slate-400">
                                {res?.rank || '#N/A'}
                              </td>
                            </React.Fragment>
                          );
                        })}

                        {/* Totals & Overall Grades */}
                        <td className="px-1.5 py-1 text-right font-extrabold border-r border-slate-300 bg-amber-50/40">
                          {isAbsent ? '0' : grade.totalScore}
                        </td>
                        <td className="px-1.5 py-1 text-right font-extrabold text-blue-900 border-r border-slate-300 bg-blue-50/40">
                          {isAbsent ? '0.00' : grade.average.toFixed(2)}
                        </td>
                        <td className="px-1 py-1 text-center font-bold text-[10px] border-r border-slate-300">
                          {grade.wordGrade}
                        </td>
                        <td className="px-1 py-1 text-center font-black border-r border-slate-300">
                          {grade.classRank}
                        </td>
                        <td className="px-1 py-1 text-center font-black border-r border-slate-300 text-[11px]">
                          {grade.letterGrade}
                        </td>
                        <td className="px-1 py-1 text-center font-bold text-[10px]">
                          <span
                            className={
                              grade.result === 'ជាប់'
                                ? 'text-emerald-800'
                                : grade.result === 'ធ្លាក់'
                                ? 'text-rose-800'
                                : 'text-slate-500'
                            }
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

            {/* 3. BOTTOM STATISTICAL SUMMARY & SIGNATURE BLOCK */}
            <div className="grid grid-cols-12 gap-4 pt-2 text-xs">
              {/* Statistical Demographics & Grade Count Table */}
              <div className="col-span-7 border border-slate-400 rounded-xl p-3 bg-slate-50/60 space-y-2">
                <span className="font-extrabold text-slate-900 text-xs">
                  📊 តារាងបូកសរុបស្ថិតិលទ្ធផលប្រឡង
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <p>• សិស្សក្នុងបញ្ជីសរុប៖ <strong>{totalStudents}</strong> នាក់ (ស្រី <strong>{femaleCount}</strong> នាក់)</p>
                    <p>• សិស្សប្រឡងជាប់៖ <strong className="text-emerald-700">{passedStudents.length}</strong> នាក់ ({passRate}%) (ស្រី <strong>{passedFemale}</strong> នាក់)</p>
                    <p>• សិស្សធ្លាក់៖ <strong className="text-rose-700">{failedStudents.length}</strong> នាក់ (ស្រី <strong>{failedFemale}</strong> នាក់)</p>
                    <p>• សិស្សអវត្តមាន៖ <strong>{absentStudents.length}</strong> នាក់ (ស្រី <strong>{absentFemale}</strong> នាក់)</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">ការបែងចែកកម្រិតនិទ្ទេស A - F៖</span>
                    <div className="grid grid-cols-3 gap-1 pt-1 font-mono text-[10px]">
                      <div className="bg-white p-1 rounded border border-slate-300 text-center">
                        A: <strong>{gradeCounts.A}</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-300 text-center">
                        B: <strong>{gradeCounts.B}</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-300 text-center">
                        C: <strong>{gradeCounts.C}</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-300 text-center">
                        D: <strong>{gradeCounts.D}</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-300 text-center">
                        E: <strong>{gradeCounts.E}</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-300 text-center">
                        F: <strong>{gradeCounts.F}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures Block */}
              <div className="col-span-5 grid grid-cols-2 gap-2 text-center text-xs pt-1">
                <div className="flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500">បានឃើញ និងពិនិត្យត្រឹមត្រូវ</span>
                    <p className="font-bold text-slate-900 mt-1">គ្រូបន្ទុកថ្នាក់</p>
                  </div>
                  <div className="pt-10">
                    <p className="font-extrabold text-slate-900">{currentClass.homeroomTeacher.name}</p>
                    <p className="text-[10px] text-slate-500">{currentClass.homeroomTeacher.role}</p>
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500">
                      ទួលទទឹង, ថ្ងៃទី....... ខែ....... ឆ្នាំ ២០២៦
                    </span>
                    <p className="font-bold text-slate-900 mt-1">នាយកសាលា</p>
                  </div>
                  <div className="pt-10">
                    <p className="font-extrabold text-slate-900">{schoolInfo.principal}</p>
                    <p className="text-[10px] text-slate-500">នាយកអនុវិទ្យាល័យទួលទទឹង</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
