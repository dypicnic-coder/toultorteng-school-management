import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeCsvCell,
  formatCsv,
  withUtf8Bom,
  generateStudentsRosterCsv,
  generateClassroomsCsv,
  generateScoresCsv,
  generateSchoolSummaryCsv,
  buildMasterBackupPayload,
} from './exportUtils';
import { ClassroomInfo, SchoolInfo, Student } from '../types';

const mockSchoolInfo: SchoolInfo = {
  name: 'អនុវិទ្យាល័យទួលទទឹង',
  location: 'ភូមិទួលទទឹង ឃុំទួលទទឹង ស្រុកព្រៃកប្បាស ខេត្តតាកែវ',
  commune: 'ទួលទទឹង',
  district: 'ព្រៃកប្បាស',
  province: 'តាកែវ',
  academicYear: '២០២៦-២០២៧',
  principal: 'លោកនាយក ឈួន ម៉ៅ',
  principalPhone: '012 345 678',
};

const mockClassroom: ClassroomInfo = {
  id: '7A',
  name: 'ថ្នាក់ទី ៧ ក',
  grade: 7,
  section: 'ក',
  totalStudents: 1,
  femaleCount: 1,
  maleCount: 0,
  room: 'បន្ទប់ A1',
  homeroomTeacher: {
    name: 'អ្នកគ្រូ កែវ មុន្នី',
    gender: 'ស្រី',
    role: 'គ្រូបន្ទុកថ្នាក់',
    subject: 'ភាសាខ្មែរ',
    classId: '7A',
    phone: '012 999 888',
    telegram: '@keomony',
    degree: 'បរិញ្ញាបត្រអប់រំ',
  },
  gradingSystem: '700_system',
  totalMaxScore: 700,
  divisor: 14,
  passingAverage: 25,
  subjects: [
    { id: 'khmer', name: 'ភាសាខ្មែរ', shortName: 'ខ្មែរ', code: 'KH', maxScore: 100, coefficient: 2 },
    { id: 'math', name: 'គណិតវិទ្យា', shortName: 'គណិត', code: 'MA', maxScore: 100, coefficient: 2 },
  ],
};

const mockStudent: Student = {
  id: 'TTT-07-001',
  rollNumber: 1,
  classId: '7A',
  lastName: 'សុខា',
  firstName: 'ណារ័តុ្ន',
  fullName: 'សុខា ណារ័តុ្ន',
  gender: 'ស',
  dob: '12/05/2012',
  guardianName: 'សុខ សាន',
  guardianPhone: '097 123 456',
  guardianJob: 'កសិករ',
  pob: 'តាកែវ',
  address: 'ភូមិទួលទទឹង',
  status: 'active',
  scores: {
    month_11: {
      khmer: 88,
      math: 92,
    },
  },
};

describe('exportUtils', () => {
  it('correctly escapes CSV cell values with commas and quotes', () => {
    assert.equal(escapeCsvCell('Hello'), 'Hello');
    assert.equal(escapeCsvCell('Hello, World'), '"Hello, World"');
    assert.equal(escapeCsvCell('Say "Hi"'), '"Say ""Hi"""');
    assert.equal(escapeCsvCell(null), '');
    assert.equal(escapeCsvCell(undefined), '');
    assert.equal(escapeCsvCell(123), '123');
  });

  it('formats multiple rows into RFC 4180 CSV with CRLF', () => {
    const rows = [
      ['Name', 'Class', 'Score'],
      ['Sokha, Naroth', '7A', 95],
    ];
    const csv = formatCsv(rows);
    assert.ok(csv.includes('"Sokha, Naroth",7A,95'));
  });

  it('prepends UTF-8 BOM to CSV content', () => {
    const raw = 'Header 1,Header 2';
    const bommed = withUtf8Bom(raw);
    assert.equal(bommed.charCodeAt(0), 0xfeff);
    assert.ok(bommed.includes(raw));
  });

  it('generates Student Roster CSV with Khmer labels and UTF-8 BOM', () => {
    const csv = generateStudentsRosterCsv([mockStudent], [mockClassroom]);
    assert.equal(csv.charCodeAt(0), 0xfeff);
    assert.ok(csv.includes('អត្តលេខ'));
    assert.ok(csv.includes('TTT-07-001'));
    assert.ok(csv.includes('សុខា ណារ័តុ្ន'));
    assert.ok(csv.includes('ស្រី'));
    assert.ok(csv.includes('ថ្នាក់ទី ៧ ក'));
  });

  it('generates Classroom and Teacher Directory CSV', () => {
    const csv = generateClassroomsCsv([mockClassroom], mockSchoolInfo);
    assert.equal(csv.charCodeAt(0), 0xfeff);
    assert.ok(csv.includes('ឈ្មោះថ្នាក់'));
    assert.ok(csv.includes('អ្នកគ្រូ កែវ មុន្នី'));
    assert.ok(csv.includes('7A'));
    assert.ok(csv.includes('បន្ទប់ A1'));
  });

  it('generates Student Scores CSV with calculated grades and ranks', () => {
    // 88 + 92 = 180 / 14 = 12.85, so result is ធ្លាក់
    const csv = generateScoresCsv([mockStudent], [mockClassroom], 'month_11');
    assert.equal(csv.charCodeAt(0), 0xfeff);
    assert.ok(csv.includes('ពិន្ទុសរុប'));
    assert.ok(csv.includes('មធ្យមភាគ'));
    assert.ok(csv.includes('TTT-07-001'));
    assert.ok(csv.includes('88'));
    assert.ok(csv.includes('92'));
    assert.ok(csv.includes('ធ្លាក់'));
  });

  it('generates School Summary CSV', () => {
    const csv = generateSchoolSummaryCsv(mockSchoolInfo, [mockClassroom], [mockStudent]);
    assert.equal(csv.charCodeAt(0), 0xfeff);
    assert.ok(csv.includes('អនុវិទ្យាល័យទួលទទឹង'));
    assert.ok(csv.includes('លោកនាយក ឈួន ម៉ៅ'));
    assert.ok(csv.includes('ចំនួនសិស្សសរុប'));
  });

  it('builds master JSON backup payload with metadata', () => {
    const payload = buildMasterBackupPayload(mockSchoolInfo, [mockClassroom], [mockStudent]);
    assert.equal(payload.version, '2.0');
    assert.equal(payload.schoolInfo.name, 'អនុវិទ្យាល័យទួលទទឹង');
    assert.equal(payload.students.length, 1);
    assert.equal(payload.classrooms.length, 1);
    assert.equal(payload.metadata.femaleStudents, 1);
    assert.equal(payload.metadata.maleStudents, 0);
  });
});
