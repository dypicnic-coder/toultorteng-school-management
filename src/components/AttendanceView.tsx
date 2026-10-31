import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  CheckCheck,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Printer,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { ClassId, ClassroomInfo, SchoolInfo, Student } from '../types';

interface AttendanceViewProps {
  schoolInfo: SchoolInfo;
  classrooms: ClassroomInfo[];
  selectedClassId: ClassId;
  onSelectClass: (id: ClassId) => void;
  students: Student[];
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  schoolInfo,
  classrooms,
  selectedClassId,
  onSelectClass,
  students,
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  const [selectedDate, setSelectedDate] = useState('2026-10-30');

  // Filter students for the current class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Attendance state: { [studentId]: 'P' | 'E' | 'A' }
  const [attendanceMap, setAttendanceMap] = useState<{ [stuId: string]: 'P' | 'E' | 'A' }>({});

  const getStatus = (stuId: string): 'P' | 'E' | 'A' => {
    return attendanceMap[stuId] || 'P'; // Default to Present
  };

  const setStatus = (stuId: string, status: 'P' | 'E' | 'A') => {
    setAttendanceMap((prev) => ({
      ...prev,
      [stuId]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: { [k: string]: 'P' } = {};
    classStudents.forEach((s) => {
      updated[s.id] = 'P';
    });
    setAttendanceMap(updated);
  };

  // Stats
  const presentCount = classStudents.filter((s) => getStatus(s.id) === 'P').length;
  const excusedCount = classStudents.filter((s) => getStatus(s.id) === 'E').length;
  const absentCount = classStudents.filter((s) => getStatus(s.id) === 'A').length;
  const presentRate = classStudents.length > 0 ? Math.round((presentCount / classStudents.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
              <CalendarCheck className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                បញ្ជីវត្តមានសិស្សប្រចាំថ្ងៃ
              </h2>
              <p className="text-xs text-slate-500">
                ថ្នាក់៖ <strong className="text-blue-700">{currentClass.name}</strong> • បន្ទប់{' '}
                {currentClass.room}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>ចុចម្តងវត្តមានទាំងអស់</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>បោះពុម្ពបញ្ជីវត្តមាន</span>
            </button>
          </div>
        </div>

        {/* Class Switcher & Date Picker */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">កាលបរិច្ឆេទ៖</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">សិស្សសរុប</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{classStudents.length} នាក់</div>
          <span className="text-[11px] text-slate-400">ថ្នាក់ {currentClass.name}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-emerald-600 font-medium">មានវត្តមាន (P)</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{presentCount} នាក់</div>
          <span className="text-[11px] text-emerald-700 font-semibold">{presentRate}% ចូលរៀន</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-amber-600 font-medium">មានច្បាប់ (E)</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{excusedCount} នាក់</div>
          <span className="text-[11px] text-amber-700">មានលិខិតសុំច្បាប់</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-rose-600 font-medium">ឥតច្បាប់ (A)</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{absentCount} នាក់</div>
          <span className="text-[11px] text-rose-700 font-semibold">អវត្តមានគ្មានច្បាប់</span>
        </div>
      </div>

      {/* Daily Roll Call Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            តារាងស្រង់វត្តមានសិស្សប្រចាំថ្ងៃ ({selectedDate})
          </h3>
          <span className="text-xs text-slate-500">
            គ្រូបន្ទុកថ្នាក់៖ {currentClass.homeroomTeacher.name}
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-center">ល.រ</th>
                <th className="px-3 py-2.5">គោត្តនាម-នាម</th>
                <th className="px-2 py-2.5 text-center">ភេទ</th>
                <th className="px-3 py-2.5">អាណាព្យាបាល</th>
                <th className="px-3 py-2.5">លេខទូរស័ព្ទ</th>
                <th className="px-4 py-2.5 text-center">ស្ថានភាពវត្តមាន</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((stu) => {
                const status = getStatus(stu.id);

                return (
                  <tr key={stu.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 text-center font-bold text-slate-500">
                      {stu.rollNumber}
                    </td>
                    <td className="px-3 py-2.5 font-bold text-slate-900">
                      {stu.fullName}
                    </td>
                    <td className="px-2 py-2.5 text-center font-semibold">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          stu.gender === 'ស'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {stu.gender}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {stu.guardianName}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-blue-700">
                      {stu.guardianPhone}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => setStatus(stu.id, 'P')}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                            status === 'P'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          វត្តមាន
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(stu.id, 'E')}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                            status === 'E'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-amber-700'
                          }`}
                        >
                          មានច្បាប់
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(stu.id, 'A')}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                            status === 'A'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-rose-700'
                          }`}
                        >
                          ឥតច្បាប់
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
