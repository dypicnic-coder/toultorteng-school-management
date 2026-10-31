import React from 'react';
import { Award, Download, Printer, Sparkles, X } from 'lucide-react';
import { CalculatedStudentGrade, SchoolInfo } from '../types';
import { MONTH_NAMES } from '../utils/grading';

interface CertificateModalProps {
  grade: CalculatedStudentGrade | null;
  schoolInfo: SchoolInfo;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  grade,
  schoolInfo,
  onClose,
}) => {
  if (!grade) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
        {/* Top Control Bar (No Print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Award className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              បណ្ណសរសើរកិត្តិយស (Certificate of Honor)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>បោះពុម្ពបណ្ណសរសើរ</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Certificate (MoEYS Royal Style) */}
        <div className="bg-amber-50/30 p-8 sm:p-12 rounded-3xl border-8 border-double border-amber-600/80 shadow-inner text-center space-y-5 relative overflow-hidden print:border-4 print:p-6 print:m-0">
          {/* Subtle Watermark Emblem Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Award className="w-96 h-96 text-amber-900" />
          </div>

          {/* National Header */}
          <div className="space-y-1 relative z-10">
            <div className="font-bold text-sm tracking-widest text-slate-900">
              ព្រះរាជាណាចក្រកម្ពុជា
            </div>
            <div className="text-xs font-semibold text-slate-700">
              ជាតិ សាសនា ព្រះមហាក្សត្រ
            </div>
            <div className="w-24 h-0.5 bg-amber-700 mx-auto my-2"></div>
            <div className="text-xs text-slate-600">
              ក្រសួងអប់រំ យុវជន និងកីឡា • មន្ទីរអប់រំខេត្តព្រះសីហនុ
            </div>
            <div className="text-xs font-bold text-slate-800">
              {schoolInfo.name} • ស្រុកព្រៃនប់
            </div>
          </div>

          {/* Certificate Title */}
          <div className="pt-2 relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black text-amber-900 tracking-wide uppercase font-serif">
              បណ្ណសរសើរ
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              គណៈគ្រប់គ្រងសាលា និងលោកគ្រូ-អ្នកគ្រូ សូមប្រគល់ជូន
            </p>
          </div>

          {/* Student Recipient Info */}
          <div className="py-2 space-y-2 relative z-10">
            <div className="text-xl sm:text-2xl font-black text-blue-950 font-serif border-b-2 border-dashed border-amber-400 pb-2 inline-block px-8">
              សិស្សឈ្មោះ៖ {grade.student.fullName}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed max-w-lg mx-auto">
              ភេទ <strong className="text-slate-900">{grade.student.gender === 'ស' ? 'ស្រី' : 'ប្រុស'}</strong> • កើតថ្ងៃទី{' '}
              <strong className="text-slate-900 font-mono">{grade.student.dob}</strong> • ថ្នាក់ទី{' '}
              <strong className="text-blue-700">{grade.student.classId}</strong>
            </p>

            <p className="text-xs text-slate-800 font-semibold leading-relaxed max-w-xl mx-auto pt-2">
              ដែលបានខិតខំប្រឹងប្រែងរៀនសូត្រ ប្រកបដោយវិន័យ និងសីលធម៌ល្អ រហូតទទួលបាន{' '}
              <span className="text-amber-800 font-extrabold underline text-sm">
                ចំណាត់ថ្នាក់លេខ {grade.classRank}
              </span>{' '}
              (មធ្យមភាគ {grade.average} និទ្ទេស {grade.letterGrade}) ប្រចាំ{MONTH_NAMES[grade.periodKey]} ឆ្នាំសិក្សា{' '}
              {schoolInfo.academicYear}។
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 text-xs relative z-10">
            <div className="text-center space-y-1">
              <span className="text-slate-500 text-[11px]">បានឃើញ និងបញ្ជាក់</span>
              <p className="font-bold text-slate-900">គ្រូបន្ទុកថ្នាក់</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-800">លោកគ្រូ/អ្នកគ្រូ</p>
            </div>

            <div className="text-center space-y-1">
              <span className="text-slate-500 text-[11px]">
                ទួលទទឹង, ថ្ងៃទី......... ខែ........... ឆ្នាំ ២០២៦
              </span>
              <p className="font-bold text-slate-900">នាយកសាលា</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-800">{schoolInfo.principal}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
