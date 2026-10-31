import React from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  Download,
  Menu,
  School,
  Sparkles,
  Users,
} from 'lucide-react';
import { ClassId, ClassroomInfo, SchoolInfo } from '../types';

interface NavbarProps {
  schoolInfo: SchoolInfo;
  classrooms: ClassroomInfo[];
  selectedClassId: ClassId;
  onSelectClass: (id: ClassId) => void;
  onOpenMobileMenu: () => void;
  onPrintPage: () => void;
  onQuickAIModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  schoolInfo,
  classrooms,
  selectedClassId,
  onSelectClass,
  onOpenMobileMenu,
  onPrintPage,
  onQuickAIModal,
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Ministry & School Banner */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-blue-950 text-white px-4 py-2 text-xs flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold tracking-wide">
            ក្រសួងអប់រំ យុវជន និងកីឡា • មន្ទីរអប់រំខេត្តព្រះសីហនុ • ការិយាល័យអប់រំស្រុកព្រៃនប់
          </span>
        </div>
        <div className="flex items-center gap-4 text-blue-200">
          <span>ឆ្នាំសិក្សា៖ <strong className="text-white font-medium">{schoolInfo.academicYear}</strong></span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">📍 {schoolInfo.commune}, {schoolInfo.district}</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & School Branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg focus:outline-hidden"
            aria-label="បើកម៉ឺនុយ"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                  {schoolInfo.name}
                </h1>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                  ឌីជីថល MoEYS
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                ប្រព័ន្ធគ្រប់គ្រងពិន្ទុ និងរដ្ឋបាលថ្នាក់រៀនឆ្លាតវៃ
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right: Class Selector Tabs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 px-2.5 hidden md:inline">
              ជ្រើសរើសថ្នាក់៖
            </span>
            <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
              {classrooms.map((cls) => {
                const isActive = cls.id === selectedClassId;
                return (
                  <button
                    key={cls.id}
                    onClick={() => onSelectClass(cls.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : 'text-slate-700 hover:bg-white hover:text-blue-700'
                    }`}
                  >
                    <span>{cls.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {cls.totalStudents}នាក់
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick AI Trigger */}
          <button
            onClick={onQuickAIModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold hover:shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
            title="ជំនួយការ AI Gemini 3.8 Flash"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI គ្រូបង្រៀន</span>
          </button>
        </div>
      </div>

      {/* Class Meta Sub-bar */}
      <div className="bg-slate-50/80 border-t border-slate-200/80 px-4 py-1.5 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-slate-900 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            ថ្នាក់បច្ចុប្បន្ន៖ <span className="text-blue-700 font-bold">{currentClass.name}</span>
          </span>
          <span>•</span>
          <span>
            សិស្សសរុប៖ <strong>{currentClass.totalStudents}</strong> នាក់ (ស្រី {currentClass.femaleCount} នាក់)
          </span>
          <span>•</span>
          <span>
            បន្ទប់៖ <strong>{currentClass.room}</strong>
          </span>
          <span>•</span>
          <span>
            គ្រូបន្ទុកថ្នាក់៖ <strong>{currentClass.homeroomTeacher.name}</strong> ({currentClass.homeroomTeacher.subject})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-medium text-[11px]">
            {currentClass.gradingSystem === '700_system'
              ? 'ប្រព័ន្ធ ៧០០ ពិន្ទុ (មធ្យមភាគ ៥០ / ចែក ១៤)'
              : 'ប្រព័ន្ធ ៤៨០ ពិន្ទុ (ឌីប្លូម / ចែក ៨.៤)'}
          </span>
          <button
            onClick={onPrintPage}
            className="text-slate-600 hover:text-blue-700 p-1 rounded hover:bg-slate-200"
            title="បោះពុម្ពទំព័រនេះ"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
