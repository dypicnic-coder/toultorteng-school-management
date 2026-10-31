import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  ClipboardList,
  FileText,
  Printer,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
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

interface ReportsPlanningViewProps {
  schoolInfo: SchoolInfo;
  classrooms: ClassroomInfo[];
  selectedClassId: ClassId;
  onSelectClass: (id: ClassId) => void;
  students: Student[];
}

export const ReportsPlanningView: React.FC<ReportsPlanningViewProps> = ({
  schoolInfo,
  classrooms,
  selectedClassId,
  onSelectClass,
  students,
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  const [reportType, setReportType] = useState<'bulletin' | 'plans' | 'competencies'>('bulletin');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<MonthKey>('semester_1');

  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Set default selected student if empty
  React.useEffect(() => {
    if (classStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(classStudents[0].id);
    }
  }, [classStudents, selectedStudentId]);

  const calculatedGrades = useMemo(() => {
    return calculateClassGrades(classStudents, currentClass, selectedPeriod);
  }, [classStudents, currentClass, selectedPeriod]);

  const activeGrade =
    calculatedGrades.find((g) => g.student.id === selectedStudentId) || calculatedGrades[0];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-blue-100 text-blue-700 rounded-xl font-bold">
              <ClipboardList className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                របាយការណ៍ និង ផែនការគរុកោសល្យ
              </h2>
              <p className="text-xs text-slate-500">
                ព្រឹត្តិបត្រពិន្ទុផ្លូវការ MoEYS សម្រាប់អាណាព្យាបាល & ផែនការគ្រូបន្ទុកថ្នាក់
              </p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-auto"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ពព្រឹត្តិបត្រ (Print Bulletin)</span>
          </button>
        </div>

        {/* Navigation Tabs & Class Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {classrooms.map((cls) => {
              const isSelected = cls.id === selectedClassId;
              return (
                <button
                  key={cls.id}
                  onClick={() => {
                    onSelectClass(cls.id);
                    setSelectedStudentId('');
                  }}
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

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setReportType('bulletin')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  reportType === 'bulletin' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                🧾 ព្រឹត្តិបត្រពិន្ទុ
              </button>
              <button
                onClick={() => setReportType('plans')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  reportType === 'plans' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                📚 ផែនការគ្រូ (៣ខែ/១ឆ្នាំ)
              </button>
              <button
                onClick={() => setReportType('competencies')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  reportType === 'competencies' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                🏅 សម្បទាទាំង ៣ យ៉ាង
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1. OFFICIAL BULLETIN DE NOTES */}
      {reportType === 'bulletin' && activeGrade && (
        <div className="space-y-4">
          {/* Student Picker (No-print) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">ជ្រើសរើសសិស្ស៖</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-blue-500"
              >
                {classStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.rollNumber}. {s.fullName} ({s.gender})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">ដំណាក់កាល៖</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as MonthKey)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-blue-500"
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

          {/* Official Printable Bulletin (MoEYS Standard) */}
          <div className="bg-white p-8 sm:p-10 rounded-2xl border-2 border-slate-300 shadow-lg max-w-4xl mx-auto space-y-6 text-slate-900 print:border-none print:shadow-none print:p-0">
            {/* National Header */}
            <div className="text-center space-y-1">
              <div className="font-bold text-sm tracking-wide">ព្រះរាជាណាចក្រកម្ពុជា</div>
              <div className="text-xs font-semibold">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
              <div className="w-20 h-0.5 bg-slate-800 mx-auto my-1.5"></div>
              <div className="text-xs text-slate-600">
                ក្រសួងអប់រំ យុវជន និងកីឡា • មន្ទីរអប់រំខេត្តព្រះសីហនុ
              </div>
              <div className="text-xs font-bold text-slate-800">
                {schoolInfo.name} • ស្រុកព្រៃនប់
              </div>
            </div>

            <div className="text-center pt-2">
              <h2 className="text-lg sm:text-xl font-black tracking-wide text-blue-900 uppercase">
                ព្រឹត្តិបត្រពិន្ទុប្រចាំ{MONTH_NAMES[selectedPeriod]}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                ឆ្នាំសិក្សា {schoolInfo.academicYear}
              </p>
            </div>

            {/* Student Info Box */}
            <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/70 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500">គោត្តនាម-នាម៖</span>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {activeGrade.student.fullName}
                </p>
              </div>
              <div>
                <span className="text-slate-500">ភេទ / អត្តលេខ៖</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {activeGrade.student.gender === 'ស' ? 'ស្រី' : 'ប្រុស'} • លេខ {activeGrade.student.rollNumber}
                </p>
              </div>
              <div>
                <span className="text-slate-500">ថ្ងៃខែឆ្នាំកំណើត៖</span>
                <p className="font-bold text-slate-800 font-mono mt-0.5">
                  {activeGrade.student.dob}
                </p>
              </div>
              <div>
                <span className="text-slate-500">កម្រិតថ្នាក់ / បន្ទប់៖</span>
                <p className="font-extrabold text-blue-700 mt-0.5">
                  {currentClass.name} ({currentClass.room})
                </p>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="overflow-x-auto border border-slate-300 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                  <tr>
                    <th className="px-3 py-2 text-center w-12">ល.រ</th>
                    <th className="px-4 py-2">មុខវិជ្ជា</th>
                    <th className="px-3 py-2 text-center w-24">ពិន្ទុពេញ</th>
                    <th className="px-3 py-2 text-center w-24">ពិន្ទុទទួលបាន</th>
                    <th className="px-3 py-2 text-center w-20">និទ្ទេស</th>
                    <th className="px-3 py-2 text-center w-24">ចំណាត់ថ្នាក់</th>
                    <th className="px-4 py-2 text-slate-600">គ្រូបង្រៀន</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentClass.subjects.map((subj, idx) => {
                    const res = activeGrade.subjectResults[subj.id];
                    return (
                      <tr key={subj.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-center text-slate-500 font-medium">{idx + 1}</td>
                        <td className="px-4 py-2 font-bold text-slate-900">{subj.name}</td>
                        <td className="px-3 py-2 text-center text-slate-600">{subj.maxScore}</td>
                        <td className="px-3 py-2 text-center font-extrabold text-blue-800">
                          {activeGrade.isAbsent ? '-' : res?.score ?? 0}
                        </td>
                        <td className="px-3 py-2 text-center font-bold">
                          {res?.letterGrade || 'F'}
                        </td>
                        <td className="px-3 py-2 text-center font-mono text-slate-700">
                          {res?.rank || '#N/A'}
                        </td>
                        <td className="px-4 py-2 text-slate-500 text-[11px]">{subj.teacher}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100/90 font-extrabold text-slate-900 border-t-2 border-slate-300 text-xs">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-right">
                      ពិន្ទុសរុប & មធ្យមភាគ៖
                    </td>
                    <td className="px-3 py-3 text-center">{currentClass.totalMaxScore}</td>
                    <td className="px-3 py-3 text-center text-blue-900 text-sm">
                      {activeGrade.isAbsent ? '0' : activeGrade.totalScore}
                    </td>
                    <td className="px-3 py-3 text-center text-emerald-800 text-sm">
                      {activeGrade.letterGrade}
                    </td>
                    <td className="px-3 py-3 text-center text-amber-900 text-sm">
                      លេខ {activeGrade.classRank}
                    </td>
                    <td className="px-4 py-3">
                      លទ្ធផល៖ <strong className="text-emerald-700">{activeGrade.result}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Assessment & Signatures */}
            <div className="grid grid-cols-2 gap-6 pt-4 text-xs">
              <div className="border border-slate-300 p-4 rounded-xl space-y-2">
                <span className="font-bold text-slate-800">យោបល់គ្រូបន្ទុកថ្នាក់៖</span>
                <p className="text-slate-700 italic">
                  {Number(activeGrade.average) >= 35
                    ? 'សិស្សមានការខិតខំប្រឹងប្រែងរៀនសូត្របានល្អណាស់ វិន័យ និងសីលធម៌ថ្លៃថ្នូរ សូមបន្តរក្សាស្នាដៃនេះ!'
                    : Number(activeGrade.average) >= 25
                    ? 'ការសិក្សាស្ថិតក្នុងកម្រិតមធ្យម ត្រូវខិតខំប្រឹងប្រែងបន្ថែមទៀតលើមុខវិជ្ជាវិទ្យាសាស្ត្រពិត។'
                    : 'ការសិក្សានៅខ្សោយ សូមអាណាព្យាបាលជួយជំរុញ និងតាមដានការរៀនសូត្រនៅផ្ទះបន្ថែម។'}
                </p>
                <div className="pt-8 text-center">
                  <p className="font-bold text-slate-900">{currentClass.homeroomTeacher.name}</p>
                  <p className="text-[10px] text-slate-500">គ្រូបន្ទុកថ្នាក់ {currentClass.name}</p>
                </div>
              </div>

              <div className="border border-slate-300 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                <div>
                  <div className="text-right text-[11px] text-slate-500">
                    ថ្ងៃទី......... ខែ........... ឆ្នាំ ២០២៦
                  </div>
                  <div className="text-center font-bold text-slate-800 mt-2">
                    បានឃើញ និងឯកភាព<br />
                    នាយកសាលា
                  </div>
                </div>
                <div className="text-center pt-8">
                  <p className="font-bold text-slate-900">{schoolInfo.principal}</p>
                  <p className="text-[10px] text-slate-500">នាយកអនុវិទ្យាល័យទួលទទឹង</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. HOMEROOM TEACHER STRATEGIC PLANS */}
      {reportType === 'plans' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                ផែនការយុទ្ធសាស្ត្រគ្រូបន្ទុកថ្នាក់ {currentClass.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                រៀបចំដោយ៖ {currentClass.homeroomTeacher.name} • អនុវិទ្យាល័យទួលទទឹង
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* 3-Month Plan */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
              <h4 className="font-bold text-blue-900 text-sm">
                📌 ផែនការត្រីមាសទី១ (៣ ខែដំបូង៖ តុលា - ធ្នូ)
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>ស្ថេរភាពបញ្ជីឈ្មោះសិស្ស ៥៨/៣២/៣១/៤២ នាក់ និងបែងចែកក្រុមសិក្សា គ.គ.ថ។</li>
                <li>ធ្វើតេស្តដើមគ្រា (Diagnostic Pre-test) ដើម្បីរកសិស្សរៀនយឺត និងរៀបចំកម្មវិធីបំប៉ន។</li>
                <li>ជួបប្រជុំផ្ទាល់ជាមួយអាណាព្យាបាលសិស្សប្រឈមហានិភ័យបោះបង់ការសិក្សា។</li>
              </ul>
            </div>

            {/* 1-Year Plan */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <h4 className="font-bold text-emerald-900 text-sm">
                🎯 ផែនការប្រចាំឆ្នាំសិក្សា ២០២៦-២០២៧ (១ ឆ្នាំ)
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>អត្រាសិស្សជាប់ឡើងថ្នាក់សម្រេចឱ្យបានយ៉ាងតិច <strong>៩៥%</strong>។</li>
                <li>កាត់បន្ថយអត្រាសិស្សបោះបង់ការសិក្សាឱ្យនៅក្រោម <strong>២%</strong>។</li>
                <li>សិស្សថ្នាក់ទី៩ ជាប់សញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ (ឌីប្លូម) ១០០%។</li>
              </ul>
            </div>

            {/* 3-Year Plan */}
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2">
              <h4 className="font-bold text-purple-900 text-sm">
                🚀 ផែនការយុទ្ធសាស្ត្រ ៣ ឆ្នាំ (២០២៦ - ២០២៩)
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>អភិវឌ្ឍថ្នាក់រៀនទៅជាបន្ទប់រៀនឌីជីថលគំរូ (Smart Classroom) ប្រចាំស្រុកព្រៃនប់។</li>
                <li>ជំរុញវិធីសាស្ត្របង្រៀនបែបសកម្ម (Active Learning) និង STEM គ្រប់មុខវិជ្ជា។</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3. THREE COMPETENCIES EVALUATION */}
      {reportType === 'competencies' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                ការវាយតម្លៃសម្បទាទាំង ៣ យ៉ាង (ចរិយាសម្បទា បំណិនសម្បទា វិជ្ជាសម្បទា)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ការវាយតម្លៃការលូតលាស់សព្វជ្រុងជ្រោយរបស់សិស្សថ្នាក់ {currentClass.name}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 text-center">
                <tr>
                  <th className="px-3 py-2.5">ល.រ</th>
                  <th className="px-4 py-2.5 text-left">គោត្តនាម-នាម</th>
                  <th className="px-2 py-2.5">ភេទ</th>
                  <th className="px-3 py-2.5 bg-emerald-50 text-emerald-900">ចរិយាសម្បទា (Character)</th>
                  <th className="px-3 py-2.5 bg-blue-50 text-blue-900">បំណិនសម្បទា (Skills)</th>
                  <th className="px-3 py-2.5 bg-purple-50 text-purple-900">វិជ្ជាសម្បទា (Knowledge)</th>
                  <th className="px-4 py-2.5 text-left">យោបល់សរុប</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-center">
                {classStudents.slice(0, 15).map((stu, idx) => (
                  <tr key={stu.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-2 font-bold text-slate-900 text-left">{stu.fullName}</td>
                    <td className="px-2 py-2">{stu.gender}</td>
                    <td className="px-3 py-2 font-bold text-emerald-700">ល្អប្រសើរ (A)</td>
                    <td className="px-3 py-2 font-bold text-blue-700">ល្អ (B)</td>
                    <td className="px-3 py-2 font-bold text-purple-700">ល្អបង្គួរ (B+)</td>
                    <td className="px-4 py-2 text-left text-slate-600">
                      សិស្សមានសីលធម៌ថ្លៃថ្នូរ សហការការងារជាក្រុមបានរលូន
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
