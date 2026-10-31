import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateClassGrades,
  getSubjectLetterGrade,
  getOverallWordGrade,
  getOverallLetterGrade,
} from './grading.js';
import { ClassroomInfo, Student } from '../types.js';

test('getSubjectLetterGrade returns correct grades based on percentage', () => {
  // Max score 100
  assert.equal(getSubjectLetterGrade(90, 100), 'A');
  assert.equal(getSubjectLetterGrade(85, 100), 'A');
  assert.equal(getSubjectLetterGrade(76, 100), 'B');
  assert.equal(getSubjectLetterGrade(65, 100), 'C');
  assert.equal(getSubjectLetterGrade(56, 100), 'D');
  assert.equal(getSubjectLetterGrade(50, 100), 'E');
  assert.equal(getSubjectLetterGrade(40, 100), 'F');
  assert.equal(getSubjectLetterGrade(null, 100), 'F');

  // Max score 35
  // 30 / 35 = 85.7% -> A
  assert.equal(getSubjectLetterGrade(30, 35), 'A');
  // 12 / 35 = 34.2% -> F
  assert.equal(getSubjectLetterGrade(12, 35), 'F');
});

test('getOverallWordGrade and getOverallLetterGrade handle averages correctly', () => {
  assert.equal(getOverallWordGrade(42, false), 'ល្អ');
  assert.equal(getOverallLetterGrade(42, false), 'B');

  assert.equal(getOverallWordGrade(36, false), 'ល្អបង្គួរ');
  assert.equal(getOverallLetterGrade(36, false), 'C');

  assert.equal(getOverallWordGrade(28, false), 'មធ្យម');
  assert.equal(getOverallLetterGrade(28, false), 'E');

  assert.equal(getOverallWordGrade(18, false), 'ខ្សោយ');
  assert.equal(getOverallLetterGrade(18, false), 'F');

  assert.equal(getOverallWordGrade(0, true), 'ខ្សោយ');
  assert.equal(getOverallLetterGrade(0, true), 'F');
});

test('calculateClassGrades computes total, average, ranks and results', () => {
  const dummyClass: ClassroomInfo = {
    id: '8B',
    name: 'ថ្នាក់ទី ៨ ខ',
    grade: 8,
    section: 'ខ',
    totalStudents: 2,
    femaleCount: 1,
    maleCount: 1,
    room: 'បន្ទប់ ២០២',
    homeroomTeacher: {
      name: 'លោកគ្រូ ជា វ៉ាន់ឌី',
      gender: 'ប្រុស',
      role: 'គ្រូបន្ទុកថ្នាក់',
      subject: 'គណិតវិទ្យា',
      classId: '8B',
      phone: '012 345 678',
      telegram: '@vanndy168',
      degree: 'បរិញ្ញាបត្រគរុកោសល្យ',
    },
    gradingSystem: '700_system',
    totalMaxScore: 700,
    divisor: 14,
    passingAverage: 25.0,
    subjects: [
      { id: 'khmer', name: 'ភាសាខ្មែរ', shortName: 'ខ្មែរ', code: 'KH', maxScore: 100, coefficient: 1 },
      { id: 'math', name: 'គណិតវិទ្យា', shortName: 'គណិត', code: 'MATH', maxScore: 100, coefficient: 1 },
    ],
  };

  const dummyStudents: Student[] = [
    {
      id: 's1',
      rollNumber: 1,
      classId: '8B',
      lastName: 'សុខា',
      firstName: 'ណារ័តុ្ន',
      fullName: 'សុខា ណារ័តុ្ន',
      gender: 'ស',
      dob: '9/7/2012',
      guardianName: 'សុខ គង់',
      guardianPhone: '097123456',
      guardianJob: 'កសិករ',
      pob: 'ព្រៃនប់',
      address: 'ទួលទទឹង',
      status: 'active',
      scores: {
        month_10: {
          khmer: 80,
          math: 90,
        },
      },
    },
    {
      id: 's2',
      rollNumber: 2,
      classId: '8B',
      lastName: 'កាន់',
      firstName: 'លីហ៊ាង',
      fullName: 'កាន់ លីហ៊ាង',
      gender: 'ប',
      dob: '10/20/2011',
      guardianName: 'កាន់ ហេង',
      guardianPhone: '097999888',
      guardianJob: 'អាជីវករ',
      pob: 'ព្រៃនប់',
      address: 'ទួលទទឹង',
      status: 'active',
      scores: {
        month_10: {},
      },
      absentPeriods: {
        month_10: true,
      },
    },
  ];

  const results = calculateClassGrades(dummyStudents, dummyClass, 'month_10', 14);

  assert.equal(results.length, 2);
  const s1 = results.find((r) => r.student.id === 's1')!;
  const s2 = results.find((r) => r.student.id === 's2')!;

  assert.equal(s1.totalScore, 170);
  assert.equal(s1.average, Number((170 / 14).toFixed(2))); // 12.14
  assert.equal(s1.classRank, 1);

  assert.equal(s2.isAbsent, true);
  assert.equal(s2.result, 'អវត្តមាន');
  assert.equal(s2.totalScore, 0);
  assert.equal(s2.average, 0);
});

test('ACADEMIC_PERIOD_OPTIONS contains all 9 required MoEYS academic periods in order', async () => {
  const { ACADEMIC_PERIOD_OPTIONS } = await import('./grading.js');
  const keys = ACADEMIC_PERIOD_OPTIONS.map((o) => o.key);

  assert.equal(keys[0], 'month_11'); // វិច្ឆិកា (ខែទី១)
  assert.equal(keys[1], 'month_12'); // ធ្នូ (ខែទី២)
  assert.equal(keys[2], 'month_01'); // មករា (ខែទី៣)
  assert.equal(keys[3], 'semester_1'); // កុម្ភៈ (ឆមាសលើកទី១)
  assert.equal(keys[4], 'month_03'); // មិនា (ខែទី៤)
  assert.equal(keys[5], 'month_04'); // មេសា (សម្រាកវិស្សមកាល)
  assert.equal(keys[6], 'month_05'); // ឧសភា (ខែទី៥)
  assert.equal(keys[7], 'month_06'); // មិថុនា (ខែទី៦)
  assert.equal(keys[8], 'semester_2'); // កក្កដា (ឆមាសលើកទី២)

  const nov = ACADEMIC_PERIOD_OPTIONS.find((o) => o.key === 'month_11')!;
  assert.match(nov.label, /វិច្ឆិកា/);

  const april = ACADEMIC_PERIOD_OPTIONS.find((o) => o.key === 'month_04')!;
  assert.equal(april.isHoliday, true);
  assert.match(april.label, /មេសា/);

  const sem1 = ACADEMIC_PERIOD_OPTIONS.find((o) => o.key === 'semester_1')!;
  assert.equal(sem1.isSemester, true);
  assert.match(sem1.label, /កុម្ភៈ/);
});
