import { ClassroomInfo, MonthKey, SchoolInfo, Student } from '../types';
import { calculateClassGrades, ACADEMIC_PERIOD_OPTIONS, MONTH_NAMES } from './grading';

/**
 * Escapes a single cell value for CSV export according to RFC 4180
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  // If string contains comma, quote, or newline, escape quotes and wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Formats an array of rows into a CSV string
 */
export function formatCsv(rows: (string | number | null | undefined)[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
}

/**
 * Prepares CSV string with UTF-8 BOM so Microsoft Excel renders Khmer Unicode correctly
 */
export function withUtf8Bom(csvString: string): string {
  return '\uFEFF' + csvString;
}

/**
 * Triggers browser download of a CSV file with proper UTF-8 BOM encoding
 */
export function downloadCsv(filename: string, csvContent: string): void {
  const contentWithBom = csvContent.startsWith('\uFEFF') ? csvContent : withUtf8Bom(csvContent);
  const blob = new Blob([contentWithBom], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers browser download of a JSON file
 */
export function downloadJson(filename: string, data: unknown): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates Student Roster CSV (បញ្ជីរាយនាមសិស្ស)
 */
export function generateStudentsRosterCsv(
  students: Student[],
  classrooms: ClassroomInfo[],
  selectedClassId?: string
): string {
  const filteredStudents = selectedClassId && selectedClassId !== 'all'
    ? students.filter((s) => s.classId === selectedClassId)
    : students;

  const classMap = new Map(classrooms.map((c) => [c.id, c.name]));

  const headers = [
    'ល.រ',
    'អត្តលេខ',
    'លេខរៀងថ្នាក់',
    'ថ្នាក់រៀន',
    'គោត្តនាម និងនាម',
    'ភេទ',
    'ឆ្នាំកំណើត',
    'ឈ្មោះឪពុក',
    'មុខរបរឪពុក',
    'ឈ្មោះម្តាយ',
    'មុខរបរម្តាយ',
    'លេខទូរស័ព្ទអាណាព្យាបាល',
    'អាសយដ្ឋានបច្ចុប្បន្ន',
    'ស្ថានភាព',
  ];

  const rows: (string | number | null | undefined)[][] = [headers];

  filteredStudents.forEach((s, idx) => {
    const className = classMap.get(s.classId) || s.classId;
    const genderLabel = s.gender === 'ស' ? 'ស្រី' : 'ប្រុស';
    const statusLabel =
      s.status === 'active' ? 'កំពុងរៀន' : s.status === 'dropped' ? 'បោះបង់' : 'ផ្លាស់ប្តូរ';

    rows.push([
      idx + 1,
      s.id,
      s.rollNumber,
      className,
      s.fullName,
      genderLabel,
      s.dob,
      s.fatherName || '',
      s.fatherJob || '',
      s.motherName || '',
      s.motherJob || '',
      s.guardianPhone,
      s.address,
      statusLabel,
    ]);
  });

  return withUtf8Bom(formatCsv(rows));
}

/**
 * Generates Classrooms and Homeroom Teachers CSV (បញ្ជីថ្នាក់រៀន និងគ្រូបន្ទុកថ្នាក់)
 */
export function generateClassroomsCsv(
  classrooms: ClassroomInfo[],
  schoolInfo: SchoolInfo
): string {
  const headers = [
    'ល.រ',
    'អត្តលេខថ្នាក់',
    'ឈ្មោះថ្នាក់',
    'កម្រិតថ្នាក់',
    'បន្ទប់រៀន',
    'គ្រូបន្ទុកថ្នាក់',
    'ភេទគ្រូ',
    'លេខទូរស័ព្ទគ្រូ',
    'Telegram គ្រូ',
    'កម្រិតវប្បធម៌គ្រូ',
    'មុខវិជ្ជាបង្រៀន',
    'ចំនួនសិស្សសរុប',
    'សិស្សស្រី',
    'សិស្សប្រុស',
    'ប្រព័ន្ធពិន្ទុ',
    'ពិន្ទុអតិបរមា',
    'មេគុណចែក',
  ];

  const rows: (string | number | null | undefined)[][] = [headers];

  classrooms.forEach((c, idx) => {
    rows.push([
      idx + 1,
      c.id,
      c.name,
      `ថ្នាក់ទី ${c.grade}`,
      c.room,
      c.homeroomTeacher?.name || '',
      c.homeroomTeacher?.gender || '',
      c.homeroomTeacher?.phone || '',
      c.homeroomTeacher?.telegram || '',
      c.homeroomTeacher?.degree || '',
      c.homeroomTeacher?.subject || '',
      c.totalStudents,
      c.femaleCount,
      c.maleCount,
      c.gradingSystem === '700_system' ? 'ប្រព័ន្ធ ៧០០ ពិន្ទុ (MoEYS)' : 'ប្រព័ន្ធឌីប្លូម ៤៨០ ពិន្ទុ',
      c.totalMaxScore,
      c.divisor,
    ]);
  });

  return withUtf8Bom(formatCsv(rows));
}

/**
 * Generates Student Scores and Academic Results CSV for a specific Period (តារាងពិន្ទុ និងលទ្ធផលសិក្សា)
 */
export function generateScoresCsv(
  students: Student[],
  classrooms: ClassroomInfo[],
  periodKey: MonthKey,
  selectedClassId?: string
): string {
  const filteredClassrooms = selectedClassId && selectedClassId !== 'all'
    ? classrooms.filter((c) => c.id === selectedClassId)
    : classrooms;

  const periodLabel = MONTH_NAMES[periodKey] || periodKey;

  // Header row
  const headers = [
    'ល.រ',
    'ថ្នាក់រៀន',
    'លេខរៀង',
    'អត្តលេខ',
    'គោត្តនាម-នាម',
    'ភេទ',
    'ភាសាខ្មែរ',
    'គណិតវិទ្យា',
    'រូបវិទ្យា',
    'គីមីវិទ្យា',
    'ជីវវិទ្យា',
    'ប្រវត្តិវិទ្យា',
    'ភូមិវិទ្យា',
    'ពលរដ្ឋវិជ្ជា',
    'ភាសាអង់គ្លេស',
    'ផែនដីវិទ្យា',
    'ព័ត៌មានវិទ្យា/អប់រំកាយ',
    'ពិន្ទុសរុប',
    'មធ្យមភាគ',
    'និទ្ទេស',
    'ចំណាត់ថ្នាក់',
    'លទ្ធផល',
    'កម្រិតសមត្ថភាព',
    'កាលបរិច្ឆេទខែ',
  ];

  const rows: (string | number | null | undefined)[][] = [headers];

  let overallCounter = 1;

  filteredClassrooms.forEach((c) => {
    const classStudents = students.filter((s) => s.classId === c.id);
    const calculatedGrades = calculateClassGrades(classStudents, c, periodKey);

    calculatedGrades.forEach((res) => {
      const stu = res.student;
      const genderLabel = stu.gender === 'ស' ? 'ស្រី' : 'ប្រុស';

      const sRes = res.subjectResults;
      const khmerScore = sRes['khmer']?.score ?? '';
      const mathScore = sRes['math']?.score ?? '';
      const physicsScore = sRes['physics']?.score ?? '';
      const chemistryScore = sRes['chemistry']?.score ?? '';
      const biologyScore = sRes['biology']?.score ?? '';
      const historyScore = sRes['history']?.score ?? '';
      const geographyScore = sRes['geography']?.score ?? '';
      const civicsScore = sRes['civics']?.score ?? '';
      const englishScore = sRes['english']?.score ?? '';
      const earthScore = sRes['earth_science']?.score ?? '';
      const ictScore = sRes['ict_pe']?.score ?? '';

      rows.push([
        overallCounter++,
        c.name,
        stu.rollNumber,
        stu.id,
        stu.fullName,
        genderLabel,
        khmerScore,
        mathScore,
        physicsScore,
        chemistryScore,
        biologyScore,
        historyScore,
        geographyScore,
        civicsScore,
        englishScore,
        earthScore,
        ictScore,
        res.isAbsent ? 0 : res.totalScore,
        res.isAbsent ? 0 : res.average,
        res.isAbsent ? 'F' : res.letterGrade,
        res.isAbsent ? 'អវត្តមាន' : res.classRank,
        res.result,
        res.wordGrade,
        periodLabel,
      ]);
    });
  });

  return withUtf8Bom(formatCsv(rows));
}

/**
 * Generates an All-Periods Academic Overview CSV for long-term longitudinal tracking
 */
export function generateAllPeriodsOverviewCsv(
  students: Student[],
  classrooms: ClassroomInfo[],
  selectedClassId?: string
): string {
  const filteredStudents = selectedClassId && selectedClassId !== 'all'
    ? students.filter((s) => s.classId === selectedClassId)
    : students;

  const classMap = new Map(classrooms.map((c) => [c.id, c]));

  // Pick the key active evaluation periods
  const activePeriods = ACADEMIC_PERIOD_OPTIONS.filter((p) => !p.isHoliday);

  const headers = [
    'ល.រ',
    'ថ្នាក់រៀន',
    'អត្តលេខ',
    'ឈ្មោះសិស្ស',
    'ភេទ',
    ...activePeriods.map((p) => `${p.shortLabel} (ម.ភាគ)`),
    ...activePeriods.map((p) => `${p.shortLabel} (និទ្ទេស)`),
  ];

  const rows: (string | number | null | undefined)[][] = [headers];

  filteredStudents.forEach((stu, idx) => {
    const classroom = classMap.get(stu.classId);
    const genderLabel = stu.gender === 'ស' ? 'ស្រី' : 'ប្រុស';
    const className = classroom ? classroom.name : stu.classId;

    const averages: (number | string)[] = [];
    const grades: string[] = [];

    activePeriods.forEach((period) => {
      if (!classroom) {
        averages.push('');
        grades.push('');
        return;
      }
      const periodScores = stu.scores[period.key];
      if (!periodScores || Object.keys(periodScores).length === 0) {
        averages.push('គ្មានទិន្នន័យ');
        grades.push('-');
      } else {
        // Calculate student single grade
        const isAbsent = stu.absentPeriods?.[period.key] === true;
        let total = 0;
        let hasAny = false;
        classroom.subjects.forEach((subj) => {
          const val = periodScores[subj.id];
          if (val !== null && val !== undefined && !isNaN(val)) {
            total += Number(val);
            hasAny = true;
          }
        });
        if (isAbsent || !hasAny) {
          averages.push(0);
          grades.push('F');
        } else {
          const avg = Number((total / classroom.divisor).toFixed(2));
          averages.push(avg);
          if (avg >= 42.5) grades.push('A');
          else if (avg >= 37.5) grades.push('B');
          else if (avg >= 32.5) grades.push('C');
          else if (avg >= 27.5) grades.push('D');
          else if (avg >= 25.0) grades.push('E');
          else grades.push('F');
        }
      }
    });

    rows.push([
      idx + 1,
      className,
      stu.id,
      stu.fullName,
      genderLabel,
      ...averages,
      ...grades,
    ]);
  });

  return withUtf8Bom(formatCsv(rows));
}

/**
 * Generates School Overview & Statistical Summary CSV
 */
export function generateSchoolSummaryCsv(
  schoolInfo: SchoolInfo,
  classrooms: ClassroomInfo[],
  students: Student[]
): string {
  const totalStudents = students.length;
  const femaleStudents = students.filter((s) => s.gender === 'ស').length;
  const maleStudents = students.filter((s) => s.gender === 'ប').length;

  const rows: (string | number | null | undefined)[][] = [
    ['សេចក្តីសង្ខេបស្ថិតិគ្រឹះស្ថានសិក្សា និងរដ្ឋបាល (School Statistical Profile)'],
    ['កាលបរិច្ឆេទនាំចេញ', new Date().toLocaleString('km-KH')],
    [],
    ['ព័ត៌មានទូទៅសាលារៀន'],
    ['ឈ្មោះសាលា', schoolInfo.name],
    ['ឆ្នាំសិក្សា', schoolInfo.academicYear],
    ['នាយកសាលា', schoolInfo.principal],
    ['លេខទូរស័ព្ទ', schoolInfo.principalPhone],
    ['ទីតាំង', schoolInfo.location],
    ['ឃុំ/សង្កាត់', schoolInfo.commune],
    ['ស្រុក/ខណ្ឌ', schoolInfo.district],
    ['ខេត្ត/ក្រុង', schoolInfo.province],
    [],
    ['ស្ថិតិសិស្ស និងថ្នាក់រៀន'],
    ['ចំនួនថ្នាក់រៀនសរុប', classrooms.length],
    ['ចំនួនសិស្សសរុប', totalStudents],
    ['សិស្សស្រីសរុប', femaleStudents],
    ['សិស្សប្រុសសរុប', maleStudents],
    [
      'អត្រាសិស្សស្រី (%)',
      totalStudents > 0 ? ((femaleStudents / totalStudents) * 100).toFixed(1) + '%' : '0%',
    ],
    [],
    ['តារាងសង្ខេបតាមថ្នាក់រៀន'],
    ['ល.រ', 'ឈ្មោះថ្នាក់', 'កម្រិតថ្នាក់', 'បន្ទប់', 'គ្រូបន្ទុកថ្នាក់', 'សរុប', 'ស្រី', 'ប្រុស', 'ប្រព័ន្ធពិន្ទុ'],
  ];

  classrooms.forEach((c, idx) => {
    rows.push([
      idx + 1,
      c.name,
      `ថ្នាក់ទី ${c.grade}`,
      c.room,
      c.homeroomTeacher?.name || '',
      c.totalStudents,
      c.femaleCount,
      c.maleCount,
      c.gradingSystem === '700_system' ? '៧០០ ពិន្ទុ' : '៤៨០ ពិន្ទុ',
    ]);
  });

  return withUtf8Bom(formatCsv(rows));
}

/**
 * Builds Full Complete JSON backup payload
 */
export function buildMasterBackupPayload(
  schoolInfo: SchoolInfo,
  classrooms: ClassroomInfo[],
  students: Student[]
) {
  return {
    version: '2.0',
    appName: 'ប្រព័ន្ធគ្រប់គ្រងថ្នាក់រៀនឌីជីថល (Tuol Totueng Digital School System)',
    exportedAt: new Date().toISOString(),
    schoolInfo,
    classrooms,
    students,
    metadata: {
      totalClassrooms: classrooms.length,
      totalStudents: students.length,
      femaleStudents: students.filter((s) => s.gender === 'ស').length,
      maleStudents: students.filter((s) => s.gender === 'ប').length,
      academicYear: schoolInfo.academicYear,
    },
  };
}
