import React from 'react';
import {
  Calendar,
  HeartPulse,
  MapPin,
  Phone,
  Printer,
  Sparkles,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { Student } from '../types';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
}) => {
  if (!student) return null;

  // Calculate BMI
  const heightM = (student.health?.heightCm || 150) / 100;
  const weightKg = student.health?.weightKg || 40;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let bmiStatus = 'ស្តង់ដារ';
  let bmiColor = 'text-emerald-700 bg-emerald-50';
  if (bmi < 16) {
    bmiStatus = 'ស្គម';
    bmiColor = 'text-amber-700 bg-amber-50';
  } else if (bmi > 23) {
    bmiStatus = 'លើសទម្ងន់';
    bmiColor = 'text-rose-700 bg-rose-50';
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
              {student.gender === 'ស' ? '👩' : '👦'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {student.fullName}
                </h3>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    student.gender === 'ស'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {student.gender === 'ស' ? 'ស្រី' : 'ប្រុស'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                អត្តលេខ {student.rollNumber} • ថ្នាក់ទី {student.classId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl"
              title="បោះពុម្ពប្រវត្តិរូបសិស្ស"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
            <span className="text-slate-400 text-[10px]">ថ្ងៃខែឆ្នាំកំណើត</span>
            <p className="font-bold text-slate-800 font-mono">{student.dob}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
            <span className="text-slate-400 text-[10px]">ទីកន្លែងកំណើត</span>
            <p className="font-bold text-slate-800 truncate">{student.pob}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
            <span className="text-slate-400 text-[10px]">ទីលំនៅបច្ចុប្បន្ន</span>
            <p className="font-bold text-slate-800 truncate">{student.address}</p>
          </div>

          {student.fatherName && (
            <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
              <span className="text-slate-400 text-[10px]">ឈ្មោះឪពុក</span>
              <p className="font-bold text-slate-800">
                {student.fatherName}{' '}
                <span className="text-slate-500 font-normal">({student.fatherJob || 'កសិករ'})</span>
              </p>
            </div>
          )}

          {student.motherName && (
            <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
              <span className="text-slate-400 text-[10px]">ឈ្មោះម្តាយ</span>
              <p className="font-bold text-slate-800">
                {student.motherName}{' '}
                <span className="text-slate-500 font-normal">({student.motherJob || 'កសិករ'})</span>
              </p>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl space-y-0.5">
            <span className="text-slate-400 text-[10px]">អាណាព្យាបាលទូទៅ</span>
            <p className="font-bold text-slate-800">{student.guardianName}</p>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl space-y-0.5 col-span-2 sm:col-span-1">
            <span className="text-blue-600 text-[10px] font-bold">ទូរស័ព្ទទាក់ទង</span>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-blue-900 font-mono">{student.guardianPhone}</span>
              {student.guardianPhone && student.guardianPhone !== 'គ្មាន' && (
                <a
                  href={`tel:${student.guardianPhone}`}
                  className="p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  title="ហៅ"
                >
                  <Phone className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Health & BMI Section */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-linear-to-r from-emerald-50/40 to-teal-50/40 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-emerald-600" />
              សុខភាពសិក្សា & សន្ទស្សន៍ម៉ាសរាងកាយ (BMI)
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${bmiColor}`}>
              {bmiStatus} (BMI: {bmi})
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-white p-2 rounded-xl text-center border border-slate-200">
              <span className="text-[10px] text-slate-400">កម្ពស់</span>
              <p className="font-bold text-slate-800">{student.health?.heightCm || 150} cm</p>
            </div>
            <div className="bg-white p-2 rounded-xl text-center border border-slate-200">
              <span className="text-[10px] text-slate-400">ទម្ងន់</span>
              <p className="font-bold text-slate-800">{student.health?.weightKg || 40} kg</p>
            </div>
            <div className="bg-white p-2 rounded-xl text-center border border-slate-200">
              <span className="text-[10px] text-slate-400">ចក្ខុវិញ្ញាណ (ភ្នែក)</span>
              <p className="font-bold text-slate-800">{student.health?.vision || 'ធម្មតា'}</p>
            </div>
          </div>
        </div>

        {/* Competencies */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-slate-900">ការវាយតម្លៃសម្បទាទាំង ៣ យ៉ាង៖</span>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-slate-400 text-[10px]">ចរិយាសម្បទា</span>
              <p className="font-bold text-emerald-700 text-sm mt-0.5">និទ្ទេស A (ល្អប្រសើរ)</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-slate-400 text-[10px]">បំណិនសម្បទា</span>
              <p className="font-bold text-blue-700 text-sm mt-0.5">និទ្ទេស B (ល្អ)</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-slate-400 text-[10px]">វិជ្ជាសម្បទា</span>
              <p className="font-bold text-purple-700 text-sm mt-0.5">និទ្ទេស B (ល្អ)</p>
            </div>
          </div>
        </div>

        {/* Close button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
          >
            បិទផ្ទាំង
          </button>
        </div>
      </div>
    </div>
  );
};
