import {
  CalculatedStudentGrade,
  ClassroomInfo,
  MonthKey,
  Student,
  SubjectDefinition,
  SubjectGradingResult,
} from '../types';

export interface AcademicPeriodOption {
  key: MonthKey;
  label: string;
  shortLabel: string;
  isHoliday?: boolean;
  isSemester?: boolean;
  isAnnual?: boolean;
}

export const ACADEMIC_PERIOD_OPTIONS: AcademicPeriodOption[] = [
  { key: 'month_11', label: 'វិច្ឆិកា (ខែទី១)', shortLabel: 'វិច្ឆិកា (ខែទី១)' },
  { key: 'month_12', label: 'ធ្នូ (ខែទី២)', shortLabel: 'ធ្នូ (ខែទី២)' },
  { key: 'month_01', label: 'មករា (ខែទី៣)', shortLabel: 'មករា (ខែទី៣)' },
  { key: 'semester_1', label: 'កុម្ភៈ (ឆមាសលើកទី១)', shortLabel: 'កុម្ភៈ (ឆមាស១)', isSemester: true },
  { key: 'month_03', label: 'មិនា (ខែទី៤)', shortLabel: 'មិនា (ខែទី៤)' },
  { key: 'month_04', label: 'មេសា (សម្រាកវិស្សមកាល)', shortLabel: 'មេសា (វិស្សមកាល)', isHoliday: true },
  { key: 'month_05', label: 'ឧសភា (ខែទី៥)', shortLabel: 'ឧសភា (ខែទី៥)' },
  { key: 'month_06', label: 'មិថុនា (ខែទី៦)', shortLabel: 'មិថុនា (ខែទី៦)' },
  { key: 'semester_2', label: 'កក្កដា (ឆមាសលើកទី២)', shortLabel: 'កក្កដា (ឆមាស២)', isSemester: true },
  { key: 'annual', label: 'លទ្ធផលប្រចាំឆ្នាំ (Annual)', shortLabel: 'ប្រចាំឆ្នាំ', isAnnual: true },
];

export const MONTH_NAMES: { [key in MonthKey]: string } = {
  month_10: 'តុលា (ដើមគ្រា)',
  month_11: 'វិច្ឆិកា (ខែទី១)',
  month_12: 'ធ្នូ (ខែទី២)',
  month_01: 'មករា (ខែទី៣)',
  semester_1: 'កុម្ភៈ (ឆមាសលើកទី១)',
  month_02: 'កុម្ភៈ (ឆមាសលើកទី១)',
  month_03: 'មិនា (ខែទី៤)',
  month_04: 'មេសា (សម្រាកវិស្សមកាល)',
  month_05: 'ឧសភា (ខែទី៥)',
  month_06: 'មិថុនា (ខែទី៦)',
  month_07: 'កក្កដា (ឆមាសលើកទី២)',
  semester_2: 'កក្កដា (ឆមាសលើកទី២)',
  annual: 'លទ្ធផលប្រចាំឆ្នាំ (Annual)',
};

/**
 * Determine subject letter grade based on percentage of maxScore
 */
export function getSubjectLetterGrade(score: number | null | undefined, maxScore: number): string {
  if (score === null || score === undefined || isNaN(score)) return 'F';
  if (score === 0) return 'F';
  const pct = (score / maxScore) * 100;
  if (pct >= 85) return 'A';
  if (pct >= 75) return 'B';
  if (pct >= 65) return 'C';
  if (pct >= 55) return 'D';
  if (pct >= 50) return 'E';
  return 'F';
}

/**
 * Determine overall word grade based on average (out of 50)
 */
export function getOverallWordGrade(
  average: number,
  isAbsent: boolean
): 'ល្អប្រសើរ' | 'ល្អ' | 'ល្អបង្គួរ' | 'មធ្យម' | 'ខ្សោយ' {
  if (isAbsent || average <= 0) return 'ខ្សោយ';
  if (average >= 45) return 'ល្អប្រសើរ';
  if (average >= 40) return 'ល្អ';
  if (average >= 33) return 'ល្អបង្គួរ';
  if (average >= 25) return 'មធ្យម';
  return 'ខ្សោយ';
}

/**
 * Determine overall letter grade based on average (out of 50)
 */
export function getOverallLetterGrade(
  average: number,
  isAbsent: boolean
): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' {
  if (isAbsent || average <= 0) return 'F';
  if (average >= 45) return 'A';
  if (average >= 40) return 'B';
  if (average >= 35) return 'C';
  if (average >= 30) return 'D';
  if (average >= 25) return 'E';
  return 'F';
}

/**
 * Calculate grades for all students in a classroom for a specific period
 */
export function calculateClassGrades(
  students: Student[],
  classroom: ClassroomInfo,
  periodKey: MonthKey,
  overrideDivisor?: number
): CalculatedStudentGrade[] {
  const subjects = classroom.subjects;
  const divisor = overrideDivisor && overrideDivisor > 0 ? overrideDivisor : classroom.divisor;
  const passingAvg = classroom.passingAverage || 25.0;

  // 1. Calculate subject scores and ranks
  // Map of subjectId -> array of { studentId, score, isAbsent }
  const subjectScoresMap: {
    [subjId: string]: Array<{ studentId: string; score: number; isAbsent: boolean }>;
  } = {};

  subjects.forEach((subj) => {
    subjectScoresMap[subj.id] = [];
  });

  students.forEach((stu) => {
    const isExplicitAbsent = stu.absentPeriods?.[periodKey] === true;
    const periodScores = stu.scores[periodKey] || {};

    subjects.forEach((subj) => {
      const val = periodScores[subj.id];
      const hasScore = val !== null && val !== undefined && !isNaN(val);
      subjectScoresMap[subj.id].push({
        studentId: stu.id,
        score: hasScore ? Number(val) : 0,
        isAbsent: isExplicitAbsent || !hasScore,
      });
    });
  });

  // Calculate subject ranking
  const subjectRankings: { [subjId: string]: { [studentId: string]: string } } = {};

  subjects.forEach((subj) => {
    subjectRankings[subj.id] = {};
    const list = subjectScoresMap[subj.id];

    // Filter students with actual scores
    const activeScored = list
      .filter((item) => !item.isAbsent && item.score > 0)
      .sort((a, b) => b.score - a.score);

    // Assign rank with standard competition ranking
    let currentRank = 1;
    for (let i = 0; i < activeScored.length; i++) {
      if (i > 0 && activeScored[i].score < activeScored[i - 1].score) {
        currentRank = i + 1;
      }
      const rankStr = currentRank < 10 ? `0${currentRank}` : `${currentRank}`;
      subjectRankings[subj.id][activeScored[i].studentId] = rankStr;
    }

    // Assign #N/A to absents or 0 scores if needed
    list.forEach((item) => {
      if (!subjectRankings[subj.id][item.studentId]) {
        // If score is 0, give rank at the bottom or #N/A if absent
        if (item.isAbsent) {
          subjectRankings[subj.id][item.studentId] = '#N/A';
        } else {
          // Bottom rank for 0
          const bottomRank = activeScored.length + 1;
          subjectRankings[subj.id][item.studentId] =
            bottomRank < 10 ? `0${bottomRank}` : `${bottomRank}`;
        }
      }
    });
  });

  // 2. Preliminary student calculation
  interface TempStudentResult {
    student: Student;
    totalScore: number;
    average: number;
    isAbsent: boolean;
    subjectResults: { [subjId: string]: SubjectGradingResult };
  }

  const tempResults: TempStudentResult[] = students.map((stu) => {
    const isExplicitAbsent = stu.absentPeriods?.[periodKey] === true;
    const periodScores = stu.scores[periodKey] || {};

    let total = 0;
    let scoredCount = 0;
    const subjRes: { [subjId: string]: SubjectGradingResult } = {};

    subjects.forEach((subj) => {
      const val = periodScores[subj.id];
      const hasScore = val !== null && val !== undefined && !isNaN(val);
      const numericVal = hasScore ? Number(val) : null;

      if (hasScore && !isExplicitAbsent) {
        total += numericVal!;
        scoredCount++;
      }

      subjRes[subj.id] = {
        score: numericVal,
        letterGrade: getSubjectLetterGrade(numericVal, subj.maxScore),
        rank: subjectRankings[subj.id]?.[stu.id] || '#N/A',
      };
    });

    const isAbsent = isExplicitAbsent || (scoredCount === 0 && total === 0);
    const avg = isAbsent ? 0 : Number((total / divisor).toFixed(2));

    return {
      student: stu,
      totalScore: isAbsent ? 0 : total,
      average: avg,
      isAbsent,
      subjectResults: subjRes,
    };
  });

  // 3. Overall class ranking
  // Sort non-absent students by totalScore desc
  const nonAbsentStudents = tempResults
    .filter((r) => !r.isAbsent)
    .sort((a, b) => b.totalScore - a.totalScore);

  const studentRankMap: { [stuId: string]: number | string } = {};
  let currentClassRank = 1;

  for (let i = 0; i < nonAbsentStudents.length; i++) {
    if (i > 0 && nonAbsentStudents[i].totalScore < nonAbsentStudents[i - 1].totalScore) {
      currentClassRank = i + 1;
    }
    studentRankMap[nonAbsentStudents[i].student.id] = currentClassRank;
  }

  // Absent students get rank equal to total active students + 1 (or lowest)
  const lowestRank = nonAbsentStudents.length + 1;
  tempResults.forEach((r) => {
    if (r.isAbsent) {
      studentRankMap[r.student.id] = lowestRank;
    }
  });

  // 4. Final formatted result
  return tempResults.map((r) => {
    const wordGrade = getOverallWordGrade(r.average, r.isAbsent);
    const letterGrade = getOverallLetterGrade(r.average, r.isAbsent);
    const classRank = studentRankMap[r.student.id] ?? '-';

    let result: 'ជាប់' | 'ធ្លាក់' | 'អវត្តមាន' = 'ជាប់';
    if (r.isAbsent) {
      result = 'អវត្តមាន';
    } else if (r.average >= passingAvg) {
      result = 'ជាប់';
    } else {
      result = 'ធ្លាក់';
    }

    return {
      student: r.student,
      periodKey,
      totalScore: r.totalScore,
      average: r.average,
      wordGrade,
      letterGrade,
      classRank,
      result,
      subjectResults: r.subjectResults,
      isAbsent: r.isAbsent,
    };
  });
}
