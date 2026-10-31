import React, { useState } from 'react';
import {
  Calculator,
  Check,
  Edit,
  Plus,
  Save,
  Sliders,
  Trash2,
} from 'lucide-react';
import { ClassId, ClassroomInfo, SubjectDefinition } from '../types';

interface SubjectCoefficientsViewProps {
  classrooms: ClassroomInfo[];
  selectedClassId: ClassId;
  onSelectClass: (id: ClassId) => void;
  onUpdateSubjects: (classId: ClassId, subjects: SubjectDefinition[], divisor: number) => void;
}

export const SubjectCoefficientsView: React.FC<SubjectCoefficientsViewProps> = ({
  classrooms,
  selectedClassId,
  onSelectClass,
  onUpdateSubjects,
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  const [subjects, setSubjects] = useState<SubjectDefinition[]>(currentClass.subjects);
  const [divisor, setDivisor] = useState<number>(currentClass.divisor);

  // Sync state when selected class changes
  React.useEffect(() => {
    setSubjects(currentClass.subjects);
    setDivisor(currentClass.divisor);
  }, [selectedClassId, currentClass]);

  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjShort, setNewSubjShort] = useState('');
  const [newSubjMax, setNewSubjMax] = useState(50);
  const [newSubjCoef, setNewSubjCoef] = useState(1);
  const [newSubjTeacher, setNewSubjTeacher] = useState('គ្រូបង្រៀន');
  const [isSavedToast, setIsSavedToast] = useState(false);

  const handleCoefficientChange = (id: string, coef: number) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, coefficient: coef } : s))
    );
  };

  const handleMaxScoreChange = (id: string, maxScore: number) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, maxScore } : s))
    );
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName) return;

    const newSubject: SubjectDefinition = {
      id: `subj_${Date.now()}`,
      name: newSubjName.trim(),
      shortName: newSubjShort.trim() || newSubjName.trim(),
      code: newSubjName.trim().slice(0, 3).toUpperCase(),
      maxScore: newSubjMax,
      coefficient: newSubjCoef,
      teacher: newSubjTeacher,
    };

    setSubjects([...subjects, newSubject]);
    setNewSubjName('');
    setNewSubjShort('');
  };

  const handleSave = () => {
    onUpdateSubjects(selectedClassId, subjects, divisor);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const totalMax = subjects.reduce((sum, s) => sum + s.maxScore, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-blue-100 text-blue-700 rounded-xl font-bold">
              <Calculator className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                គ្រប់គ្រងពិន្ទុមេគុណ & រូបមន្តគណនា
              </h2>
              <p className="text-xs text-slate-500">
                ថ្នាក់៖ <strong className="text-blue-700">{currentClass.name}</strong> • របប{' '}
                {currentClass.gradingSystem === '700_system'
                  ? '៧០០ ពិន្ទុ (ចែក ១៤)'
                  : '៤៨០ ឌីប្លូម (ចែក ៨.៤)'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>រក្សាទុកការកំណត់</span>
          </button>
        </div>

        {/* Class Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl pt-2 border-t border-slate-100">
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

        {isSavedToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>បានរក្សាទុកមេគុណ និងរូបមន្តដោយជោគជ័យ!</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">ចំនួនមុខវិជ្ជាសរុប</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{subjects.length} មុខវិជ្ជា</div>
          <span className="text-[11px] text-blue-600 font-medium">ថ្នាក់ {currentClass.name}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">ពិន្ទុពេញបូកសរុប (Max Total)</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{totalMax} ពិន្ទុ</div>
          <span className="text-[11px] text-slate-400">ផលបូកពិន្ទុពេញគ្រប់មុខវិជ្ជា</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">មេគុណចែកមធ្យមភាគ (Divisor)</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{divisor}</div>
          <span className="text-[11px] text-slate-400">មធ្យមភាគ = ពិន្ទុសរុប ÷ {divisor}</span>
        </div>
      </div>

      {/* Subject Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              តារាងមេគុណ និងពិន្ទុពេញតាមមុខវិជ្ជា
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              លោកគ្រូ-អ្នកគ្រូអាចកែប្រែមេគុណ និងពិន្ទុពេញផ្ទាល់ក្នុងតារាង
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-center">ល.រ</th>
                <th className="px-3 py-2.5">ឈ្មោះមុខវិជ្ជា</th>
                <th className="px-3 py-2.5">ឈ្មោះកាត់</th>
                <th className="px-3 py-2.5 text-center">ពិន្ទុពេញ (Max)</th>
                <th className="px-4 py-2.5 text-center">មេគុណ (Coefficient)</th>
                <th className="px-3 py-2.5">គ្រូបង្រៀន</th>
                <th className="px-3 py-2.5 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((subj, idx) => (
                <tr key={subj.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-center text-slate-500">{idx + 1}</td>
                  <td className="px-3 py-2 font-bold text-slate-900">{subj.name}</td>
                  <td className="px-3 py-2 font-mono text-slate-600">{subj.shortName}</td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="number"
                      min="1"
                      value={subj.maxScore}
                      onChange={(e) =>
                        handleMaxScoreChange(subj.id, parseInt(e.target.value) || 1)
                      }
                      className="w-16 px-2 py-1 text-center font-bold text-blue-700 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <select
                      value={subj.coefficient}
                      onChange={(e) =>
                        handleCoefficientChange(subj.id, parseFloat(e.target.value) || 1)
                      }
                      className="px-2.5 py-1 font-bold bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="1">មេគុណ ១</option>
                      <option value="1.5">មេគុណ ១.៥</option>
                      <option value="2">មេគុណ ២</option>
                      <option value="2.5">មេគុណ ២.៥</option>
                      <option value="3">មេគុណ ៣</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{subj.teacher}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => handleDeleteSubject(subj.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                      title="លុបមុខវិជ្ជា (បន្ថយជួរ)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add New Subject Row Form */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 text-xs mb-2">
            + បន្ថែមមុខវិជ្ជាថ្មី (បន្ថែមជួរមុខវិជ្ជា)
          </h4>
          <form
            onSubmit={handleAddSubject}
            className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs"
          >
            <input
              type="text"
              placeholder="ឈ្មោះមុខវិជ្ជា..."
              required
              value={newSubjName}
              onChange={(e) => setNewSubjName(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl"
            />
            <input
              type="text"
              placeholder="ឈ្មោះកាត់..."
              value={newSubjShort}
              onChange={(e) => setNewSubjShort(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl"
            />
            <input
              type="number"
              placeholder="ពិន្ទុពេញ (Max)"
              value={newSubjMax}
              onChange={(e) => setNewSubjMax(parseInt(e.target.value) || 50)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-center font-bold"
            />
            <select
              value={newSubjCoef}
              onChange={(e) => setNewSubjCoef(parseFloat(e.target.value) || 1)}
              className="px-3 py-2 border border-slate-300 rounded-xl font-bold"
            >
              <option value="1">មេគុណ ១</option>
              <option value="1.5">មេគុណ ១.៥</option>
              <option value="2">មេគុណ ២</option>
              <option value="2.5">មេគុណ ២.៥</option>
              <option value="3">មេគុណ ៣</option>
            </select>
            <input
              type="text"
              placeholder="ឈ្មោះគ្រូបង្រៀន..."
              value={newSubjTeacher}
              onChange={(e) => setNewSubjTeacher(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
            >
              + បន្ថែមជួរ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
