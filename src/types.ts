export type ClassId = '7A' | '8A' | '8B' | '9A';

export type MonthKey = 
  | 'month_10' // តុលា
  | 'month_11' // វិច្ឆិកា
  | 'month_12' // ធ្នូ
  | 'month_01' // មករា
  | 'semester_1' // ឆមាសទី១
  | 'month_02' // កុម្ភៈ
  | 'month_03' // មីនា
  | 'month_04' // មេសា
  | 'month_05' // ឧសភា
  | 'month_06' // មិថុនា
  | 'month_07' // កក្កដា
  | 'semester_2' // ឆមាសទី២
  | 'annual'; // ប្រចាំឆ្នាំ

export interface SubjectDefinition {
  id: string;
  name: string;
  shortName: string;
  code: string;
  maxScore: number;
  coefficient: number;
  teacher?: string;
}

export interface TeacherProfile {
  name: string;
  gender: 'ប្រុស' | 'ស្រី';
  role: string;
  subject: string;
  classId: ClassId;
  phone: string;
  telegram: string;
  degree: string;
  avatar?: string;
}

export interface ClassroomInfo {
  id: ClassId;
  name: string;
  grade: number;
  section: string;
  totalStudents: number;
  femaleCount: number;
  maleCount: number;
  room: string;
  homeroomTeacher: TeacherProfile;
  gradingSystem: '700_system' | '480_diploma';
  totalMaxScore: number;
  divisor: number; // e.g. 14 for 700 system, 8.4 for 420/480 diploma
  passingAverage: number; // 25.00
  subjects: SubjectDefinition[];
}

export interface StudentScoreRecord {
  [subjectId: string]: number | null | undefined;
}

export interface StudentHealth {
  heightCm: number;
  weightKg: number;
  vision: 'ធម្មតា' | 'ពាក់វ៉ែនតា' | 'មើលជិតខ្សោយ' | 'មើលឆ្ងាយខ្សោយ';
  notes?: string;
}

export interface Student {
  id: string;
  rollNumber: number;
  classId: ClassId;
  lastName: string; // គោត្តនាម
  firstName: string; // នាម
  fullName: string;
  gender: 'ប' | 'ស'; // ប: ប្រុស, ស: ស្រី
  dob: string; // ថ្ងៃខែឆ្នាំកំណើត
  guardianName: string;
  guardianPhone: string;
  guardianJob: string;
  fatherName?: string;
  fatherJob?: string;
  motherName?: string;
  motherJob?: string;
  pob: string; // ទីកន្លែងកំណើត
  address: string;
  status: 'active' | 'dropped' | 'transferred';
  photoUrl?: string;
  health?: StudentHealth;
  scores: {
    [periodKey: string]: StudentScoreRecord;
  };
  absentPeriods?: {
    [periodKey: string]: boolean;
  };
  competencies?: {
    character: 'A' | 'B' | 'C' | 'D'; // ចរិយាសម្បទា
    skills: 'A' | 'B' | 'C' | 'D'; // បំណិនសម្បទា
    knowledge: 'A' | 'B' | 'C' | 'D'; // វិជ្ជាសម្បទា
  };
}

export interface SubjectGradingResult {
  score: number | null;
  letterGrade: string; // A, B, C, D, E, F
  rank: string; // '01', '02', ..., or '#N/A'
}

export interface CalculatedStudentGrade {
  student: Student;
  periodKey: MonthKey;
  totalScore: number;
  average: number;
  wordGrade: 'ល្អប្រសើរ' | 'ល្អ' | 'ល្អបង្គួរ' | 'មធ្យម' | 'ខ្សោយ';
  letterGrade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  classRank: number | string;
  result: 'ជាប់' | 'ធ្លាក់' | 'អវត្តមាន';
  subjectResults: {
    [subjectId: string]: SubjectGradingResult;
  };
  isAbsent: boolean;
}

export interface SchoolInfo {
  name: string;
  location: string;
  commune: string;
  district: string;
  province: string;
  academicYear: string;
  principal: string;
  principalPhone: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  category: 'ទូទៅ' | 'បន្ទាន់' | 'ប្រជុំ' | 'ប្រឡង' | 'សកម្មភាព';
  target: 'all' | 'students' | 'guardians' | 'teachers';
  isPinned?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  totalQty: number;
  goodQty: number;
  brokenQty: number;
  unit: string;
  notes: string;
}

export interface CleaningDuty {
  dayOfWeek: string; // ច័ន្ទ, អង្គារ, ពុធ, ព្រហស្បតិ៍, សុក្រ, សៅរ៍
  groupName: string;
  leader: string;
  members: string[];
  area: string;
}

export interface AttendanceRecord {
  date: string;
  classId: ClassId;
  records: {
    [studentId: string]: 'P' | 'A' | 'E'; // Present, Absent (ឥតច្បាប់), Excused (មានច្បាប់)
  };
}
