/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ActiveTab, Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ScoreEntryView } from './components/ScoreEntryView';
import { ExamResultsView } from './components/ExamResultsView';
import { StudentsView } from './components/StudentsView';
import { AttendanceView } from './components/AttendanceView';
import { ReportsPlanningView } from './components/ReportsPlanningView';
import { TeacherTasksView } from './components/TeacherTasksView';
import { SubjectCoefficientsView } from './components/SubjectCoefficientsView';
import { AITeacherSuiteView } from './components/AITeacherSuiteView';
import { SchoolQRView } from './components/SchoolQRView';
import { AnnouncementsView } from './components/AnnouncementsView';
import { SettingsView } from './components/SettingsView';
import { CertificateModal } from './components/CertificateModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import {
  CalculatedStudentGrade,
  ClassId,
  ClassroomInfo,
  SchoolInfo,
  Student,
  SubjectDefinition,
} from './types';
import {
  ALL_INITIAL_STUDENTS,
  INITIAL_CLASSROOMS,
  INITIAL_SCHOOL_INFO,
} from './data/mockData';

const LOCAL_STORAGE_KEY_STUDENTS = 'tuol_totueng_students_2026_real_v2';
const LOCAL_STORAGE_KEY_CLASSROOMS = 'tuol_totueng_classrooms_2026_real_v2';
const LOCAL_STORAGE_KEY_SCHOOL = 'tuol_totueng_school_2026_real_v2';

export default function App() {
  // 1. Core State with LocalStorage Persistence
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SCHOOL);
      return saved ? JSON.parse(saved) : INITIAL_SCHOOL_INFO;
    } catch {
      return INITIAL_SCHOOL_INFO;
    }
  });

  const [classrooms, setClassrooms] = useState<ClassroomInfo[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CLASSROOMS);
      return saved ? JSON.parse(saved) : INITIAL_CLASSROOMS;
    } catch {
      return INITIAL_CLASSROOMS;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure real roster is active (starts with 1109 គា រតនា)
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id === '1109') {
          return parsed;
        }
      }
      return ALL_INITIAL_STUDENTS;
    } catch {
      return ALL_INITIAL_STUDENTS;
    }
  });

  // Selected class: default to 8B (which has the user's specific 31 students)
  const [selectedClassId, setSelectedClassId] = useState<ClassId>('8B');

  // Active view tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Mobile menu drawer
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Modals
  const [certificateGrade, setCertificateGrade] = useState<CalculatedStudentGrade | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  // Save to localStorage when state updates
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed saving students to localStorage', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CLASSROOMS, JSON.stringify(classrooms));
    } catch (e) {
      console.error('Failed saving classrooms to localStorage', e);
    }
  }, [classrooms]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SCHOOL, JSON.stringify(schoolInfo));
    } catch (e) {
      console.error('Failed saving school info to localStorage', e);
    }
  }, [schoolInfo]);

  // Handle teacher profile update
  const handleUpdateTeacherProfile = (classId: ClassId, updatedHomeroom: any) => {
    setClassrooms((prev) =>
      prev.map((c) =>
        c.id === classId
          ? {
              ...c,
              homeroomTeacher: {
                ...c.homeroomTeacher,
                ...updatedHomeroom,
              },
            }
          : c
      )
    );
  };

  // Handle subjects & divisor update
  const handleUpdateSubjects = (
    classId: ClassId,
    newSubjects: SubjectDefinition[],
    newDivisor: number
  ) => {
    const totalMax = newSubjects.reduce((sum, s) => sum + s.maxScore, 0);
    setClassrooms((prev) =>
      prev.map((c) =>
        c.id === classId
          ? {
              ...c,
              subjects: newSubjects,
              divisor: newDivisor,
              totalMaxScore: totalMax,
            }
          : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar with Universal Class Switcher */}
      <Navbar
        schoolInfo={schoolInfo}
        classrooms={classrooms}
        selectedClassId={selectedClassId}
        onSelectClass={setSelectedClassId}
        onOpenMobileMenu={() => setIsOpenMobile(true)}
        onPrintPage={() => window.print()}
        onQuickAIModal={() => setActiveTab('ai_suite')}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpenMobile={isOpenMobile}
          onCloseMobile={() => setIsOpenMobile(false)}
        />

        {/* Center Main View */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              schoolInfo={schoolInfo}
              classrooms={classrooms}
              selectedClassId={selectedClassId}
              onSelectClass={setSelectedClassId}
              students={students}
              onOpenCertificate={setCertificateGrade}
              onOpenStudentDetail={setDetailStudent}
              onNavigateToScores={() => setActiveTab('scores')}
              onNavigateToAI={() => setActiveTab('ai_suite')}
            />
          )}

          {activeTab === 'scores' && (
            <ScoreEntryView
              classrooms={classrooms}
              selectedClassId={selectedClassId}
              onSelectClass={setSelectedClassId}
              students={students}
              onUpdateStudents={setStudents}
              onOpenCertificate={setCertificateGrade}
            />
          )}

          {activeTab === 'results' && (
            <ExamResultsView
              schoolInfo={schoolInfo}
              classrooms={classrooms}
              selectedClassId={selectedClassId}
              onSelectClass={setSelectedClassId}
              students={students}
              onOpenCertificate={setCertificateGrade}
              onOpenStudentDetail={setDetailStudent}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              classrooms={classrooms}
              selectedClassId={selectedClassId}
              onSelectClass={setSelectedClassId}
              students={students}
              onUpdateStudents={setStudents}
              onOpenStudentDetail={setDetailStudent}
              onUpdateTeacherProfile={handleUpdateTeacherProfile}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              schoolInfo={schoolInfo}
              classrooms={classrooms}
              selectedClassId={selectedClassId}
              onSelectClass={setSelectedClassId}
              students={students}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPlanningView
              schoolInfo={schoolInfo}
              classrooms={classrooms}
              selectedClassId={selectedClassId}
              onSelectClass={setSelectedClassId}
              students={students}
            />
          )}

          {activeTab === 'toolkit' && (
            <TeacherTasksView
              schoolInfo={schoolInfo}
              classrooms={classrooms}
              selectedClassId={selectedClassId}
              onSelectClass={setSelectedClassId}
              students={students}
            />
          )}

          {activeTab === 'coefficients' && (
            <SubjectCoefficientsView
              classrooms={classrooms}
              selectedClassId={selectedClassId}
              onSelectClass={setSelectedClassId}
              onUpdateSubjects={handleUpdateSubjects}
            />
          )}

          {activeTab === 'ai_suite' && (
            <AITeacherSuiteView
              schoolInfo={schoolInfo}
              classrooms={classrooms}
              selectedClassId={selectedClassId}
              students={students}
            />
          )}

          {activeTab === 'school_qr' && (
            <SchoolQRView schoolInfo={schoolInfo} />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementsView />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              schoolInfo={schoolInfo}
              onUpdateSchoolInfo={setSchoolInfo}
              students={students}
              onUpdateStudents={setStudents}
              classrooms={classrooms}
              onUpdateClassrooms={setClassrooms}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CertificateModal
        grade={certificateGrade}
        schoolInfo={schoolInfo}
        onClose={() => setCertificateGrade(null)}
      />

      <StudentDetailModal
        student={detailStudent}
        onClose={() => setDetailStudent(null)}
      />
    </div>
  );
}
