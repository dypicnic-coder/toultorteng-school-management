import React, { useState } from 'react';
import {
  Check,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Folder,
  Info,
  Layers,
  RefreshCw,
  School,
  Settings,
  Table,
  Upload,
  Users,
} from 'lucide-react';
import { ClassroomInfo, MonthKey, SchoolInfo, Student } from '../types';
import { ALL_INITIAL_STUDENTS, INITIAL_CLASSROOMS, INITIAL_SCHOOL_INFO } from '../data/mockData';
import { ACADEMIC_PERIOD_OPTIONS } from '../utils/grading';
import {
  buildMasterBackupPayload,
  downloadCsv,
  downloadJson,
  generateAllPeriodsOverviewCsv,
  generateClassroomsCsv,
  generateSchoolSummaryCsv,
  generateScoresCsv,
  generateStudentsRosterCsv,
} from '../utils/exportUtils';

interface SettingsViewProps {
  schoolInfo: SchoolInfo;
  onUpdateSchoolInfo: (info: SchoolInfo) => void;
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  classrooms: ClassroomInfo[];
  onUpdateClassrooms: (classrooms: ClassroomInfo[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  schoolInfo,
  onUpdateSchoolInfo,
  students,
  onUpdateStudents,
  classrooms,
  onUpdateClassrooms,
}) => {
  const [name, setName] = useState(schoolInfo.name);
  const [commune, setCommune] = useState(schoolInfo.commune);
  const [district, setDistrict] = useState(schoolInfo.district);
  const [province, setProvince] = useState(schoolInfo.province);
  const [academicYear, setAcademicYear] = useState(schoolInfo.academicYear);
  const [principal, setPrincipal] = useState(schoolInfo.principal);
  const [principalPhone, setPrincipalPhone] = useState(schoolInfo.principalPhone);

  const [localFolder, setLocalFolder] = useState('D:\\ClassManagement_2026\\TuolTotueng_Data');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Export scope selectors
  const [selectedExportClass, setSelectedExportClass] = useState<string>('all');
  const [selectedExportPeriod, setSelectedExportPeriod] = useState<MonthKey>('month_11');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSchoolInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolInfo({
      name,
      location: `ភូមិ${commune} ឃុំ${commune} ស្រុក${district} ខេត្ត${province}`,
      commune,
      district,
      province,
      academicYear,
      principal,
      principalPhone,
    });
    showToast('បានរក្សាទុកព័ត៌មានគ្រឹះស្ថានសិក្សាដោយជោគជ័យ!');
  };

  // Full JSON Backup
  const handleExportBackup = () => {
    const backupData = buildMasterBackupPayload(schoolInfo, classrooms, students);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadJson(`TuolTotueng_Backup_Master_${dateStr}.json`, backupData);
    showToast('បានទាញយកឯកសារបម្រុងទុកពេញលេញ (Backup JSON) រួចរាល់!');
  };

  // Restore JSON Backup
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        let restoredCount = 0;

        if (data.students && Array.isArray(data.students)) {
          onUpdateStudents(data.students);
          restoredCount++;
        }
        if (data.classrooms && Array.isArray(data.classrooms)) {
          onUpdateClassrooms(data.classrooms);
          restoredCount++;
        }
        if (data.schoolInfo) {
          onUpdateSchoolInfo(data.schoolInfo);
          setName(data.schoolInfo.name || '');
          setCommune(data.schoolInfo.commune || '');
          setDistrict(data.schoolInfo.district || '');
          setProvince(data.schoolInfo.province || '');
          setAcademicYear(data.schoolInfo.academicYear || '');
          setPrincipal(data.schoolInfo.principal || '');
          setPrincipalPhone(data.schoolInfo.principalPhone || '');
          restoredCount++;
        }

        if (restoredCount > 0) {
          showToast('បានស្តារទិន្នន័យ (Restore) ពីឯកសារ JSON ដោយជោគជ័យ!');
        } else {
          alert('ឯកសារ JSON គ្មានទិន្នន័យត្រឹមត្រូវសម្រាប់ប្រព័ន្ធនេះទេ!');
        }
      } catch {
        alert('ឯកសារ JSON មិនត្រឹមត្រូវ សូមពិនិត្យម្តងទៀត!');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Reset to original 163 students
  const handleResetData = () => {
    if (
      confirm(
        'តើលោកគ្រូពិតជាចង់កំណត់ទិន្នន័យដើមឡើងវិញ (Reset to 163 Students) មែនទេ? រាល់ការកែប្រែថ្មីនឹងត្រូវកំណត់ឡើងវិញ។'
      )
    ) {
      onUpdateStudents(ALL_INITIAL_STUDENTS);
      onUpdateClassrooms(INITIAL_CLASSROOMS);
      onUpdateSchoolInfo(INITIAL_SCHOOL_INFO);
      showToast('បានកំណត់ទិន្នន័យសិស្សទាំង ១៦៣ នាក់ ឡើងវិញដោយជោគជ័យ!');
    }
  };

  // CSV Export Handlers
  const handleExportStudentsCsv = () => {
    const csv = generateStudentsRosterCsv(students, classrooms, selectedExportClass);
    const dateStr = new Date().toISOString().slice(0, 10);
    const classSuffix = selectedExportClass === 'all' ? 'AllClasses' : `Class_${selectedExportClass}`;
    downloadCsv(`TuolTotueng_Students_Roster_${classSuffix}_${dateStr}.csv`, csv);
    showToast('បានទាញយកបញ្ជីឈ្មោះសិស្សជា CSV (Excel UTF-8) រួចរាល់!');
  };

  const handleExportScoresCsv = () => {
    const csv = generateScoresCsv(students, classrooms, selectedExportPeriod, selectedExportClass);
    const dateStr = new Date().toISOString().slice(0, 10);
    const classSuffix = selectedExportClass === 'all' ? 'AllClasses' : `Class_${selectedExportClass}`;
    downloadCsv(
      `TuolTotueng_Scores_${selectedExportPeriod}_${classSuffix}_${dateStr}.csv`,
      csv
    );
    showToast('បានទាញយកតារាងពិន្ទុ និងលទ្ធផលសិក្សាជា CSV រួចរាល់!');
  };

  const handleExportClassroomsCsv = () => {
    const csv = generateClassroomsCsv(classrooms, schoolInfo);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCsv(`TuolTotueng_Classrooms_Teachers_${dateStr}.csv`, csv);
    showToast('បានទាញយកបញ្ជីថ្នាក់រៀន និងគ្រូបន្ទុកថ្នាក់ជា CSV រួចរាល់!');
  };

  const handleExportSchoolSummaryCsv = () => {
    const csv = generateSchoolSummaryCsv(schoolInfo, classrooms, students);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadCsv(`TuolTotueng_School_Profile_${dateStr}.csv`, csv);
    showToast('បានទាញយករបាយការណ៍ស្ថិតិសាលារៀនជា CSV រួចរាល់!');
  };

  const handleExportAllPeriodsOverviewCsv = () => {
    const csv = generateAllPeriodsOverviewCsv(students, classrooms, selectedExportClass);
    const dateStr = new Date().toISOString().slice(0, 10);
    const classSuffix = selectedExportClass === 'all' ? 'AllClasses' : `Class_${selectedExportClass}`;
    downloadCsv(`TuolTotueng_AllPeriods_Scores_Overview_${classSuffix}_${dateStr}.csv`, csv);
    showToast('បានទាញយកតារាងតាមដានពិន្ទុគ្រប់ខែប្រចាំឆ្នាំជា CSV រួចរាល់!');
  };

  // Student count according to filter
  const targetStudentCount =
    selectedExportClass === 'all'
      ? students.length
      : students.filter((s) => s.classId === selectedExportClass).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-blue-100 text-blue-700 rounded-xl font-bold">
            <Settings className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              ការកំណត់ប្រព័ន្ធ & មជ្ឈមណ្ឌលនាំចេញទិន្នន័យ (Settings & Data Backup / Export)
            </h2>
            <p className="text-xs text-slate-500">
              គ្រប់គ្រងព័ត៌មានសាលា បម្រុងទុក JSON និងទាញយកទិន្នន័យជាឯកសារ CSV/Excel ដោយមិនបាត់បង់ពុម្ពអក្សរខ្មែរ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {toastMessage && (
            <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-bounce">
              <Check className="w-3.5 h-3.5" />
              <span>{toastMessage}</span>
            </div>
          )}
          <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl font-medium">
            សិស្សសរុប៖ <strong className="text-blue-700">{students.length} នាក់</strong> | ថ្នាក់៖{' '}
            <strong className="text-blue-700">{classrooms.length}</strong>
          </div>
        </div>
      </div>

      {/* CSV Data Export Center */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                មជ្ឈមណ្ឌលនាំចេញទិន្នន័យ CSV / Excel (External Data Export Center)
              </h3>
              <p className="text-xs text-slate-500">
                នាំចេញទិន្នន័យសាលា ថ្នាក់រៀន បញ្ជីឈ្មោះសិស្ស និងពិន្ទុជាឯកសារ .CSV ជាមួយ UTF-8 BOM សម្រាប់បើកក្នុង Excel មិនបែកពុម្ពអក្សរខ្មែរ
              </p>
            </div>
          </div>

          {/* Export Scope Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
              <span className="text-[11px] font-bold text-slate-600">ថ្នាក់៖</span>
              <select
                value={selectedExportClass}
                onChange={(e) => setSelectedExportClass(e.target.value)}
                className="text-xs font-bold text-blue-700 bg-transparent border-0 outline-hidden cursor-pointer"
              >
                <option value="all">គ្រប់ថ្នាក់ទាំងអស់ ({students.length} នាក់)</option>
                {classrooms.map((c) => {
                  const cnt = students.filter((s) => s.classId === c.id).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({cnt} នាក់)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
              <span className="text-[11px] font-bold text-slate-600">កាលបរិច្ឆេទខែ៖</span>
              <select
                value={selectedExportPeriod}
                onChange={(e) => setSelectedExportPeriod(e.target.value as MonthKey)}
                className="text-xs font-bold text-indigo-700 bg-transparent border-0 outline-hidden cursor-pointer"
              >
                {ACADEMIC_PERIOD_OPTIONS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4 Primary Export Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Students Roster CSV */}
          <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-xl border border-slate-200 transition-colors flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    បញ្ជីរាយនាមសិស្ស (Student Roster)
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  CSV
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                រួមមាន៖ អត្តលេខ, លេខរៀងថ្នាក់, គោត្តនាម-នាម, ភេទ, ថ្ងៃខែឆ្នាំកំណើត, អាណាព្យាបាល, លេខទូរស័ព្ទ, មុខរបរ, និងអាសយដ្ឋាន។
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleExportStudentsCsv}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ទាញយកបញ្ជីសិស្ស ({targetStudentCount} នាក់)</span>
              </button>
            </div>
          </div>

          {/* Card 2: Student Scores & Results CSV */}
          <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-xl border border-slate-200 transition-colors flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    តារាងពិន្ទុ & លទ្ធផលសិក្សា (Scores)
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  CSV
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ពិន្ទុ ១១ មុខវិជ្ជា MoEYS, ពិន្ទុសរុប, មធ្យមភាគ, និទ្ទេស (A-F), ចំណាត់ថ្នាក់, និងលទ្ធផលជាប់/ធ្លាក់ តាមខែដែលបានជ្រើស។
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleExportScoresCsv}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ទាញយកតារាងពិន្ទុ ({targetStudentCount} នាក់)</span>
              </button>
            </div>
          </div>

          {/* Card 3: Classrooms & Teachers CSV */}
          <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-xl border border-slate-200 transition-colors flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    បញ្ជីថ្នាក់រៀន & គ្រូបន្ទុក (Classrooms)
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                  CSV
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ព័ត៌មានថ្នាក់រៀនទាំង ៤ (៧ ក, ៨ ក, ៨ ខ, ៩ ក), បន្ទប់រៀន, គ្រូបន្ទុក, លេខទូរស័ព្ទ, Telegram, ចំនួនសិស្សប្រុស/ស្រី, និងប្រព័ន្ធពិន្ទុ។
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleExportClassroomsCsv}
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ទាញយកបញ្ជីថ្នាក់រៀន ({classrooms.length} ថ្នាក់)</span>
              </button>
            </div>
          </div>

          {/* Card 4: School Statistical Summary CSV */}
          <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-xl border border-slate-200 transition-colors flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    ស្ថិតិសាលារៀន (School Profile)
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                  CSV
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                របាយការណ៍សង្ខេបគ្រឹះស្ថានសិក្សា, រដ្ឋបាល, គណៈគ្រប់គ្រង, ស្ថិតិសិស្សប្រុស-ស្រីសរុប និងសមាមាត្រតាមថ្នាក់រៀននីមួយៗ។
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleExportSchoolSummaryCsv}
                className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ទាញយកស្ថិតិសាលា (CSV)</span>
              </button>
            </div>
          </div>

          {/* Card 5: All-Periods Longitudinal Overview CSV */}
          <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-xl border border-slate-200 transition-colors flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    តាមដានពិន្ទុគ្រប់ខែ (All Periods)
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                  CSV
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                តារាងតាមដានមធ្យមភាគ និងនិទ្ទេសសិស្សម្នាក់ៗតាំងពីខែទី១ រហូតដល់ឆមាសទី២ ក្នុងឯកសារតែមួយ ងាយស្រួលប្រៀបធៀបការវិវត្ត។
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleExportAllPeriodsOverviewCsv}
                className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ទាញយកស្ថិតិគ្រប់ខែ ({targetStudentCount} នាក់)</span>
              </button>
            </div>
          </div>

          {/* Card 6: Comprehensive JSON Master Backup */}
          <div className="bg-blue-50/70 hover:bg-blue-50 p-4 rounded-xl border border-blue-200 transition-colors flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-700" />
                  <span className="font-bold text-blue-900 text-xs sm:text-sm">
                    ទិន្នន័យបម្រុងទុកពេញលេញ (Master JSON)
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  JSON
                </span>
              </div>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                កញ្ចប់ទិន្នន័យ Master Backup ផ្ទុកព័ត៌មានសាលា ថ្នាក់រៀន សិស្សទាំង ១៦៣ នាក់ រួមទាំងប្រវត្តិពិន្ទុគ្រប់ខែ និងសុខភាពសិស្ស។
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleExportBackup}
                className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ទាញយក Master Backup JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compatibility and Info Banner */}
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              ការធានាភាពត្រូវគ្នានៃពុម្ពអក្សរខ្មែរ (Khmer Unicode / UTF-8 BOM Compatibility):
            </p>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              រាល់ឯកសារ CSV ដែលទាញយកពីប្រព័ន្ធនេះ ត្រូវបានបង្កប់កូដ UTF-8 BOM ដោយស្វ័យប្រវត្តិ។ នៅពេលបើកក្នុង <strong>Microsoft Excel</strong>, <strong>Google Sheets</strong>, ឬ <strong>Apple Numbers</strong> នឹងបង្ហាញអក្សរខ្មែរបានយ៉ាងត្រឹមត្រូវ ១០០% ដោយមិនបាច់ប្តូរ Font ឬជួបបញ្ហាអក្សរបែកឡើយ។
            </p>
          </div>
        </div>
      </div>

      {/* Grid: School Info Form & JSON Backup/Restore Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: School Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <School className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              ព័ត៌មានគ្រឹះស្ថានសិក្សា និងរដ្ឋបាល
            </h3>
          </div>

          <form onSubmit={handleSaveSchoolInfo} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ឈ្មោះសាលារៀន៖</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ឃុំ/សង្កាត់៖</label>
                <input
                  type="text"
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ស្រុក/ខណ្ឌ៖</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ខេត្ត/ក្រុង៖</label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ឆ្នាំសិក្សា៖</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ឈ្មោះនាយកសាលា៖</label>
                <input
                  type="text"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">ទូរស័ព្ទទាក់ទង៖</label>
              <input
                type="text"
                value={principalPhone}
                onChange={(e) => setPrincipalPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer"
              >
                រក្សាទុកព័ត៌មានសាលា
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: JSON Backup, Restore, and Local Config */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              បម្រុងទុក និងស្តារទិន្នន័យកុំព្យូទ័រ (JSON Backup / Restore)
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Export JSON Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800">
                📥 ទាញយកទិន្នន័យបម្រុងទុកពេញលេញ (Export JSON)
              </span>
              <p className="text-slate-500">
                រក្សាទុកទិន្នន័យសិស្សទាំង ១៦៣ នាក់ ពិន្ទុ និងការកំណត់ទាំងអស់ទៅជាឯកសារ .json ទុកលើកុំព្យូទ័រ
              </p>
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>ទាញយក Master Backup JSON ឥឡូវនេះ</span>
              </button>
            </div>

            {/* Restore JSON Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800">
                📤 ស្តារទិន្នន័យឡើងវិញ (Restore JSON Backup)
              </span>
              <p className="text-slate-500">
                ជ្រើសរើសឯកសារបម្រុងទុក .json ដែលបានទាញយកពីមុន ដើម្បីស្តារទិន្នន័យសាលា ថ្នាក់ និងសិស្សមកវិញភ្លាមៗ
              </p>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>ជ្រើសរើសឯកសារ JSON ដើម្បីស្តារ</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  className="hidden"
                />
              </label>
            </div>

            {/* Folder Path Config */}
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                <Folder className="w-4 h-4 text-blue-600" />
                <span>ទីតាំងថតឯកសារលើកុំព្យូទ័រ (Local Directory)</span>
              </div>
              <input
                type="text"
                value={localFolder}
                onChange={(e) => setLocalFolder(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-[11px]"
              />
              <p className="text-[10px] text-slate-500">
                ឯកសារ Backup JSON ឬ CSV/Excel ដែលទាញយកនឹងរក្សាទុកក្នុង Folder នេះ។
              </p>
            </div>

            {/* Reset Factory */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-rose-700">កំណត់ទិន្នន័យដើមឡើងវិញ</p>
                <p className="text-[10px] text-slate-400">កំណត់សិស្សទាំង ១៦៣ នាក់ និង ៤ ថ្នាក់</p>
              </div>
              <button
                onClick={handleResetData}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
