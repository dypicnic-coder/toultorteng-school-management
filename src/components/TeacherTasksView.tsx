import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  LayoutGrid,
  Package,
  Phone,
  Plus,
  Scale,
  ShieldAlert,
  Smile,
  Sparkles,
  Trash2,
  Users,
  Wrench,
} from 'lucide-react';
import {
  CleaningDuty,
  ClassId,
  ClassroomInfo,
  InventoryItem,
  SchoolInfo,
  Student,
} from '../types';
import { INITIAL_CLEANING_DUTIES, INITIAL_INVENTORY } from '../data/mockData';

interface TeacherTasksViewProps {
  schoolInfo: SchoolInfo;
  classrooms: ClassroomInfo[];
  selectedClassId: ClassId;
  onSelectClass: (id: ClassId) => void;
  students: Student[];
}

export const TeacherTasksView: React.FC<TeacherTasksViewProps> = ({
  schoolInfo,
  classrooms,
  selectedClassId,
  onSelectClass,
  students,
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  const classStudents = students.filter((s) => s.classId === selectedClassId);

  const [activeSubTab, setActiveSubTab] = useState<
    | 'sec'
    | 'cleaning'
    | 'subject_submission'
    | 'timetable'
    | 'rules'
    | 'guardians'
    | 'inventory'
    | 'seating'
    | 'committee'
    | 'council'
  >('sec');

  // Inventory state
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [newInvName, setNewInvName] = useState('');
  const [newInvQty, setNewInvQty] = useState(1);
  const [newInvUnit, setNewInvUnit] = useState('តុ');

  // Add Inventory row
  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvName) return;
    const item: InventoryItem = {
      id: `inv_${Date.now()}`,
      name: newInvName,
      category: 'សម្ភារៈបន្ទប់',
      totalQty: newInvQty,
      goodQty: newInvQty,
      brokenQty: 0,
      unit: newInvUnit,
      notes: 'ទើបបន្ថែម',
    };
    setInventoryList([...inventoryList, item]);
    setNewInvName('');
  };

  const handleDeleteInventory = (id: string) => {
    setInventoryList(inventoryList.filter((i) => i.id !== id));
  };

  // Seating plan state (5 rows x 4 columns = 20 desks, 2 students per desk = 40 seats)
  const [seatingArrangement, setSeatingArrangement] = useState<{ [deskIndex: number]: string[] }>({
    0: [classStudents[0]?.fullName || 'សិស្ស ១', classStudents[1]?.fullName || 'សិស្ស ២'],
    1: [classStudents[2]?.fullName || 'សិស្ស ៣', classStudents[3]?.fullName || 'សិស្ស ៤'],
    2: [classStudents[4]?.fullName || 'សិស្ស ៥', classStudents[5]?.fullName || 'សិស្ស ៦'],
    3: [classStudents[6]?.fullName || 'សិស្ស ៧', classStudents[7]?.fullName || 'សិស្ស ៨'],
  });

  return (
    <div className="space-y-6">
      {/* Header & Sub-tab switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-blue-100 text-blue-700 rounded-xl font-bold">
              <Wrench className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                កញ្ចប់ការងារសម្រាប់គ្រូ (Classroom Toolkit ទាំង ១០)
              </h2>
              <p className="text-xs text-slate-500">
                ឧបករណ៍រដ្ឋបាលគរុកោសល្យ និងគ្រប់គ្រងថ្នាក់រៀនជាក់ស្តែង
              </p>
            </div>
          </div>

          {/* Class Switcher */}
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
        </div>

        {/* 10 Subtabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs font-semibold pt-2 border-t border-slate-100">
          {[
            { id: 'sec', label: '🧮 ចំនួនសិស្ស (SEC)' },
            { id: 'cleaning', label: '🧹 វេនសម្អាត' },
            { id: 'subject_submission', label: '📋 បញ្ជីស្រង់ពិន្ទុ' },
            { id: 'timetable', label: '🗓 កាលវិភាគ' },
            { id: 'rules', label: '📜 បទបញ្ជាផ្ទៃក្នុង' },
            { id: 'guardians', label: '📞 ទំនាក់ទំនងអាណាព្យាបាល' },
            { id: 'inventory', label: '📦 សារពើភ័ណ្ឌ' },
            { id: 'seating', label: '🪑 ប្លង់តុសិស្ស' },
            { id: 'committee', label: '🏫 គ.គ.ថ' },
            { id: 'council', label: '🧒 ក្រុមប្រឹក្សាកុមារ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. SEC CLASS DEMOGRAPHICS */}
      {activeSubTab === 'sec' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                តារាងស្ថិតិចំនួនសិស្សតាមថ្នាក់ (ទម្រង់ SEC ក្រសួងអប់រំ)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                អនុវិទ្យាល័យទួលទទឹង • ឃុំទួលទទឹង ស្រុកព្រៃនប់ ខេត្តព្រះសីហនុ • ឆ្នាំ ២០២៦-២០២៧
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 font-bold text-xs">
              សរុបសាលា៖ ១៦៣ នាក់
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200 text-center">
                <tr>
                  <th rowSpan={2} className="px-3 py-2 border-r border-slate-200">ល.រ</th>
                  <th rowSpan={2} className="px-4 py-2 border-r border-slate-200 text-left">កម្រិតថ្នាក់</th>
                  <th colSpan={3} className="px-3 py-1.5 border-r border-slate-200 bg-blue-50">សិស្សដើមឆ្នាំ</th>
                  <th colSpan={2} className="px-3 py-1.5 border-r border-slate-200 bg-amber-50">សិស្សត្រួតថ្នាក់</th>
                  <th colSpan={3} className="px-3 py-1.5 bg-emerald-50">សិស្សបច្ចុប្បន្ន</th>
                  <th rowSpan={2} className="px-3 py-2 border-l border-slate-200 text-left">គ្រូបន្ទុកថ្នាក់</th>
                </tr>
                <tr className="border-t border-slate-200 text-[10px]">
                  <th className="px-2 py-1 border-r border-slate-200">សរុប</th>
                  <th className="px-2 py-1 border-r border-slate-200 text-rose-700">ស្រី</th>
                  <th className="px-2 py-1 border-r border-slate-200 text-blue-700">ប្រុស</th>
                  <th className="px-2 py-1 border-r border-slate-200">សរុប</th>
                  <th className="px-2 py-1 border-r border-slate-200 text-rose-700">ស្រី</th>
                  <th className="px-2 py-1 border-r border-slate-200">សរុប</th>
                  <th className="px-2 py-1 border-r border-slate-200 text-rose-700">ស្រី</th>
                  <th className="px-2 py-1 text-blue-700">ប្រុស</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-center">
                {classrooms.map((cls, idx) => (
                  <tr key={cls.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-bold text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-900 text-left">
                      {cls.name} ({cls.room})
                    </td>
                    <td className="px-2 py-2.5 font-bold text-slate-800">{cls.totalStudents}</td>
                    <td className="px-2 py-2.5 font-bold text-rose-700">{cls.femaleCount}</td>
                    <td className="px-2 py-2.5 font-bold text-blue-700">{cls.maleCount}</td>
                    <td className="px-2 py-2.5 text-slate-600">2</td>
                    <td className="px-2 py-2.5 text-rose-600">1</td>
                    <td className="px-2 py-2.5 font-black text-emerald-800 bg-emerald-50/30">
                      {cls.totalStudents}
                    </td>
                    <td className="px-2 py-2.5 font-bold text-rose-700 bg-emerald-50/30">
                      {cls.femaleCount}
                    </td>
                    <td className="px-2 py-2.5 font-bold text-blue-700 bg-emerald-50/30">
                      {cls.maleCount}
                    </td>
                    <td className="px-3 py-2.5 text-left text-slate-700 font-medium">
                      {cls.homeroomTeacher.name}
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-slate-100 font-black text-slate-900">
                  <td colSpan={2} className="px-4 py-3 text-center">
                    ⭐️ សរុបទូទាំងសាលា (៤ ថ្នាក់)
                  </td>
                  <td className="px-2 py-3">១៦៣</td>
                  <td className="px-2 py-3 text-rose-700">៩២</td>
                  <td className="px-2 py-3 text-blue-700">៧១</td>
                  <td className="px-2 py-3">៨</td>
                  <td className="px-2 py-3 text-rose-700">៣</td>
                  <td className="px-2 py-3 text-emerald-700 text-sm">១៦៣</td>
                  <td className="px-2 py-3 text-rose-700 text-sm">៩២ (៥៦.៤%)</td>
                  <td className="px-2 py-3 text-blue-700 text-sm">៧១ (៤៣.៦%)</td>
                  <td className="px-3 py-3 text-left">៤ រូប</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. DAILY CLEANING DUTY */}
      {activeSubTab === 'cleaning' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                កាលវិភាគវេនសម្អាតប្រចាំថ្ងៃ (ច័ន្ទ ដល់ សៅរ៍)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ថ្នាក់ {currentClass.name} • អនុវិទ្យាល័យទួលទទឹង
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs">
              សាលារៀនបៃតង & អនាម័យ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INITIAL_CLEANING_DUTIES.map((duty, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-800 text-sm">{duty.dayOfWeek}</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold text-[10px]">
                    {duty.groupName}
                  </span>
                </div>
                <div className="pt-1">
                  <p className="text-slate-500">
                    ប្រធានក្រុម៖ <strong className="text-slate-900 font-bold">{duty.leader}</strong>
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    ទីតាំងសម្អាត៖ <strong className="text-emerald-700 font-semibold">{duty.area}</strong>
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] text-slate-400 font-medium">សមាជិក៖</span>
                  <p className="text-slate-700 font-medium mt-0.5">
                    {duty.members.join(' • ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SUBJECT SCORE SUBMISSION TRACKER */}
      {activeSubTab === 'subject_submission' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                បញ្ជីស្រង់ និងតាមដានការប្រគល់ពិន្ទុពីគ្រូមុខវិជ្ជា
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ថ្នាក់ {currentClass.name} ({currentClass.subjects.length} មុខវិជ្ជា)
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 font-bold text-xs">
              ខែតុលា ២០២៦
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 text-center">ល.រ</th>
                  <th className="px-3 py-2.5">មុខវិជ្ជា</th>
                  <th className="px-3 py-2.5">គ្រូបង្រៀន</th>
                  <th className="px-3 py-2.5 text-center">ពិន្ទុពេញ</th>
                  <th className="px-3 py-2.5 text-center">មេគុណ</th>
                  <th className="px-3 py-2.5 text-center">កាលបរិច្ឆេទប្រគល់</th>
                  <th className="px-3 py-2.5 text-center">ស្ថានភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentClass.subjects.map((subj, idx) => (
                  <tr key={subj.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="px-3 py-2 font-bold text-slate-900">{subj.name}</td>
                    <td className="px-3 py-2 text-slate-700">{subj.teacher}</td>
                    <td className="px-3 py-2 text-center font-bold text-blue-700">{subj.maxScore}</td>
                    <td className="px-3 py-2 text-center font-bold">{subj.coefficient}</td>
                    <td className="px-3 py-2 text-center font-mono text-[11px] text-slate-500">
                      ២៨/១០/២០២៦
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        បានប្រគល់រួចរាល់
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TIMETABLE */}
      {activeSubTab === 'timetable' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                កាលវិភាគបង្រៀនប្រចាំសប្តាហ៍ (វេនព្រឹក ០៧:០០ - ១១:០០)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ថ្នាក់ {currentClass.name} • បន្ទប់ {currentClass.room}
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-800 font-bold text-xs">
              កាលវិភាគផ្លូវការ
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 border-r border-slate-200">ម៉ោងសិក្សា</th>
                  <th className="px-3 py-2.5 border-r border-slate-200">ច័ន្ទ</th>
                  <th className="px-3 py-2.5 border-r border-slate-200">អង្គារ</th>
                  <th className="px-3 py-2.5 border-r border-slate-200">ពុធ</th>
                  <th className="px-3 py-2.5 border-r border-slate-200">ព្រហស្បតិ៍</th>
                  <th className="px-3 py-2.5 border-r border-slate-200">សុក្រ</th>
                  <th className="px-3 py-2.5">សៅរ៍</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-3 py-2.5 font-bold text-slate-500 bg-slate-50 border-r border-slate-200">
                    ០៧:០០ - ០៧:៥០
                  </td>
                  <td className="px-3 py-2.5 font-bold text-blue-900 bg-blue-50/30 border-r border-slate-200">ភាសាខ្មែរ</td>
                  <td className="px-3 py-2.5 font-bold text-indigo-900 bg-indigo-50/30 border-r border-slate-200">គណិតវិទ្យា</td>
                  <td className="px-3 py-2.5 font-bold text-cyan-900 bg-cyan-50/30 border-r border-slate-200">រូបវិទ្យា</td>
                  <td className="px-3 py-2.5 font-bold text-blue-900 bg-blue-50/30 border-r border-slate-200">ភាសាខ្មែរ</td>
                  <td className="px-3 py-2.5 font-bold text-emerald-900 bg-emerald-50/30 border-r border-slate-200">ជីវវិទ្យា</td>
                  <td className="px-3 py-2.5 font-bold text-slate-800">អប់រំកាយ</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-slate-500 bg-slate-50 border-r border-slate-200">
                    ០៧:៥០ - ០៨:៤០
                  </td>
                  <td className="px-3 py-2.5 font-bold text-blue-900 bg-blue-50/30 border-r border-slate-200">ភាសាខ្មែរ</td>
                  <td className="px-3 py-2.5 font-bold text-indigo-900 bg-indigo-50/30 border-r border-slate-200">គណិតវិទ្យា</td>
                  <td className="px-3 py-2.5 font-bold text-amber-900 bg-amber-50/30 border-r border-slate-200">គីមីវិទ្យា</td>
                  <td className="px-3 py-2.5 font-bold text-indigo-900 bg-indigo-50/30 border-r border-slate-200">គណិតវិទ្យា</td>
                  <td className="px-3 py-2.5 font-bold text-emerald-900 bg-emerald-50/30 border-r border-slate-200">ផែនដីវិទ្យា</td>
                  <td className="px-3 py-2.5 font-bold text-slate-800">គេហវិទ្យា</td>
                </tr>
                <tr className="bg-amber-50/70 text-amber-900 font-bold text-[11px]">
                  <td colSpan={7} className="py-1">
                    ☕️ ម៉ោងសម្រាកលំហែកាយ (០៨:៤០ - ០៩:០០)
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-slate-500 bg-slate-50 border-r border-slate-200">
                    ០៩:០០ - ០៩:៥០
                  </td>
                  <td className="px-3 py-2.5 font-bold text-slate-800 border-r border-slate-200">ប្រវត្តិវិទ្យា</td>
                  <td className="px-3 py-2.5 font-bold text-slate-800 border-r border-slate-200">ភូមិវិទ្យា</td>
                  <td className="px-3 py-2.5 font-bold text-purple-900 bg-purple-50/30 border-r border-slate-200">អង់គ្លេស</td>
                  <td className="px-3 py-2.5 font-bold text-slate-800 border-r border-slate-200">សីលធម៌</td>
                  <td className="px-3 py-2.5 font-bold text-purple-900 bg-purple-50/30 border-r border-slate-200">អង់គ្លេស</td>
                  <td className="px-3 py-2.5 font-bold text-slate-800">សីលធម៌</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-slate-500 bg-slate-50 border-r border-slate-200">
                    ០៩:៥០ - ១០:៤០
                  </td>
                  <td className="px-3 py-2.5 font-bold text-indigo-900 bg-indigo-50/30 border-r border-slate-200">គណិតវិទ្យា</td>
                  <td className="px-3 py-2.5 font-bold text-purple-900 bg-purple-50/30 border-r border-slate-200">អង់គ្លេស</td>
                  <td className="px-3 py-2.5 font-bold text-slate-800 border-r border-slate-200">ភូមិវិទ្យា</td>
                  <td className="px-3 py-2.5 font-bold text-slate-800 border-r border-slate-200">ប្រវត្តិវិទ្យា</td>
                  <td className="px-3 py-2.5 font-bold text-cyan-900 bg-cyan-50/30 border-r border-slate-200">រូបវិទ្យា</td>
                  <td className="px-3 py-2.5 font-bold text-emerald-900 bg-emerald-50/30">ជីវវិទ្យា</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. RULES */}
      {activeSubTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                បទបញ្ជាផ្ទៃក្នុងថ្នាក់រៀន និងសាលា
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                វិន័យ សីលធម៌ និងការគោរពពេលវេលារបស់សិស្សានុសិស្ស
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs">
              បទបញ្ជាស្តង់ដារ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
              <h4 className="font-bold text-blue-900 text-sm">១. វិន័យ និងការគោរពពេលវេលា</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>មកដល់សាលាមុនម៉ោងយ៉ាងតិច ១៥ នាទី (ម៉ោង ០៦:៤៥ ព្រឹក)។</li>
                <li>ចូលរួមគោរពទង់ជាតិដោយស្ងប់ស្ងាត់ និងសេចក្តីថ្លៃថ្នូរ។</li>
                <li>អវត្តមានត្រូវមានច្បាប់អនុញ្ញាតពីអាណាព្យាបាលជាលាយលក្ខណ៍អក្សរ។</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <h4 className="font-bold text-emerald-900 text-sm">២. សម្លៀកបំពាក់ និងអនាម័យ</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>ស្លៀកពាក់ឯកសណ្ឋានសិស្សឱ្យបានត្រឹមត្រូវ ស្អាតបាត និងពាក់ស្លាកឈ្មោះ។</li>
                <li>កាត់សក់ខ្លីសមរម្យសម្រាប់សិស្សប្រុស ចងសក់របៀបរៀបរយសម្រាប់សិស្សស្រី។</li>
                <li>ចូលរួមសម្អាតថ្នាក់រៀនតាមវេន និងមិនចោលសំរាមផ្តេសផ្តាស។</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 6. GUARDIAN DIRECTORY */}
      {activeSubTab === 'guardians' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                បញ្ជីទំនាក់ទំនងអាណាព្យាបាលសិស្ស ({classStudents.length} នាក់)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ថ្នាក់ {currentClass.name} • ចុចដើម្បីហៅទូរស័ព្ទទាក់ទងផ្ទាល់
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 text-center">ល.រ</th>
                  <th className="px-3 py-2.5">ឈ្មោះសិស្ស</th>
                  <th className="px-2 py-2.5 text-center">ភេទ</th>
                  <th className="px-3 py-2.5">ឈ្មោះអាណាព្យាបាល</th>
                  <th className="px-3 py-2.5">មុខរបរ</th>
                  <th className="px-3 py-2.5">លេខទូរស័ព្ទ</th>
                  <th className="px-3 py-2.5 text-center">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-center text-slate-500">{stu.rollNumber}</td>
                    <td className="px-3 py-2 font-bold text-slate-900">{stu.fullName}</td>
                    <td className="px-2 py-2 text-center">{stu.gender}</td>
                    <td className="px-3 py-2 text-slate-700">{stu.guardianName}</td>
                    <td className="px-3 py-2 text-slate-600">{stu.guardianJob}</td>
                    <td className="px-3 py-2 font-mono text-[11px] font-bold text-blue-700">
                      {stu.guardianPhone}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <a
                        href={`tel:${stu.guardianPhone}`}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold inline-flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        ហៅ
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. INVENTORY */}
      {activeSubTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                បញ្ជីសារពើភ័ណ្ឌ និងសម្ភារៈបន្ទប់រៀន
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                តាមដានតុ កៅអី ក្តារខៀន និងបរិក្ខារបន្ទប់ {currentClass.room}
              </p>
            </div>

            {/* Add Inventory Form */}
            <form onSubmit={handleAddInventory} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="ឈ្មោះសម្ភារៈ..."
                value={newInvName}
                onChange={(e) => setNewInvName(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs w-36"
              />
              <input
                type="number"
                min="1"
                value={newInvQty}
                onChange={(e) => setNewInvQty(parseInt(e.target.value) || 1)}
                className="px-2 py-1.5 border border-slate-300 rounded-xl text-xs w-16 text-center"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
              >
                + បន្ថែមជួរ
              </button>
            </form>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 text-center">ល.រ</th>
                  <th className="px-3 py-2.5">ឈ្មោះសម្ភារៈ</th>
                  <th className="px-3 py-2.5">ប្រភេទ</th>
                  <th className="px-3 py-2.5 text-center">ចំនួនសរុប</th>
                  <th className="px-3 py-2.5 text-center text-emerald-700">ប្រើការបាន</th>
                  <th className="px-3 py-2.5 text-center text-rose-700">ខូចខាត</th>
                  <th className="px-3 py-2.5">កំណត់សម្គាល់</th>
                  <th className="px-3 py-2.5 text-center">លុប</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-center text-slate-500">{idx + 1}</td>
                    <td className="px-3 py-2 font-bold text-slate-900">{item.name}</td>
                    <td className="px-3 py-2 text-slate-600">{item.category}</td>
                    <td className="px-3 py-2 text-center font-bold">{item.totalQty} {item.unit}</td>
                    <td className="px-3 py-2 text-center font-bold text-emerald-700">{item.goodQty}</td>
                    <td className="px-3 py-2 text-center font-bold text-rose-600">{item.brokenQty}</td>
                    <td className="px-3 py-2 text-slate-500">{item.notes}</td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleDeleteInventory(item.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. INTERACTIVE SEATING PLAN */}
      {activeSubTab === 'seating' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                ប្លង់តុសិស្សក្នុងបន្ទប់រៀន (Seating Plan)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ថ្នាក់ {currentClass.name} • បន្ទប់ {currentClass.room}
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 font-bold text-xs">
              ៥ ជួរដេក x ៤ ជួរឈរ
            </span>
          </div>

          {/* Teacher Desk & Whiteboard */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="p-3 bg-slate-800 text-white rounded-xl text-center font-bold text-xs shadow-md">
              ⬛️ ក្តារខៀនមេដែក (Whiteboard) & តុកៅអីគ្រូបង្រៀន ({currentClass.homeroomTeacher.name})
            </div>

            {/* Grid of Desks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, deskIdx) => (
                <div
                  key={deskIdx}
                  className="p-3 rounded-xl border-2 border-slate-300 bg-slate-50/80 hover:border-blue-400 transition-all text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>តុលេខ {deskIdx + 1}</span>
                    <span>២ នាក់</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold truncate">
                    {seatingArrangement[deskIdx]?.[0] || `សិស្ស ${deskIdx * 2 + 1}`}
                  </div>
                  <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold truncate">
                    {seatingArrangement[deskIdx]?.[1] || `សិស្ស ${deskIdx * 2 + 2}`}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 bg-slate-100 rounded-xl text-center text-slate-500 text-[11px]">
              🚪 ទ្វារចេញចូលបន្ទប់រៀន (ខាងក្រោយ)
            </div>
          </div>
        </div>
      )}

      {/* 9. COMMITTEE (គ.គ.ថ) */}
      {activeSubTab === 'committee' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                គណៈកម្មការគ្រប់គ្រងថ្នាក់រៀន (គ.គ.ថ)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ថ្នាក់ {currentClass.name} • ឆ្នាំសិក្សា ២០២៦-២០២៧
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {[
              { role: 'ប្រធានថ្នាក់', name: classStudents[0]?.fullName || 'សិស្សឆ្នើម', duties: 'ដឹកនាំថ្នាក់ ត្រួតពិនិត្យវត្តមាន និងសាមគ្គីភាព' },
              { role: 'អនុប្រធានថ្នាក់ទី១ (សិក្សា)', name: classStudents[1]?.fullName || 'សិស្សពូកែ', duties: 'ជួយមិត្តភក្តិរៀនយឺត និងតាមដានកិច្ចការផ្ទះ' },
              { role: 'អនុប្រធានថ្នាក់ទី២ (វិន័យ)', name: classStudents[2]?.fullName || 'សិស្សវិន័យ', duties: 'ត្រួតពិនិត្យឯកសណ្ឋាន និងសណ្តាប់ធ្នាប់' },
              { role: 'ប្រធានផ្នែកអនាម័យ', name: classStudents[3]?.fullName || 'សិស្សអនាម័យ', duties: 'ត្រួតពិនិត្យវេនសម្អាត និងសាលាបៃតង' },
              { role: 'ប្រធានផ្នែកកីឡា & សិល្បៈ', name: classStudents[4]?.fullName || 'សិស្សកីឡា', duties: 'ដឹកនាំការហាត់ប្រាណ និងសកម្មភាពកម្សាន្ត' },
            ].map((c, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                  {c.role}
                </span>
                <p className="font-bold text-slate-900 text-sm mt-1">{c.name}</p>
                <p className="text-slate-500 text-[11px]">{c.duties}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. COUNCIL (ក្រុមប្រឹក្សាកុមារ-យុវជន) */}
      {activeSubTab === 'council' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                សាខាក្រុមប្រឹក្សាកុមារ និងយុវជនប្រចាំថ្នាក់
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                លើកកម្ពស់សិទ្ធិកុមារ បរិស្ថាន និងការងារស្ម័គ្រចិត្តកាកបាទក្រហម
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
              <span className="font-bold text-emerald-800 text-sm">🌱 ស្លាបបរិស្ថាន</span>
              <p className="text-slate-600">
                ទទួលបន្ទុកថែទាំសួនផ្កា ស្រោចទឹករុក្ខជាតិ និងយុទ្ធនាការកាត់បន្ថយប្លាស្ទិកក្នុងសាលា។
              </p>
            </div>
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
              <span className="font-bold text-rose-800 text-sm">❤️ កាកបាទក្រហមកម្ពុជា</span>
              <p className="text-slate-600">
                ជួយសង្គ្រោះបឋម មើលថែសិស្សឈឺក្នុងថ្នាក់ និងផ្សព្វផ្សាយការថែទាំសុខភាព។
              </p>
            </div>
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
              <span className="font-bold text-blue-800 text-sm">📚 ស្លាបសិក្សាធិការ</span>
              <p className="text-slate-600">
                រៀបចំក្លឹបស្វ័យសិក្សា និងជួយបង្រៀនមិត្តភក្តិដែលរៀនយឺត។
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
