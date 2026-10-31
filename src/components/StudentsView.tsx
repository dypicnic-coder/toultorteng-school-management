import React, { useState, useMemo } from 'react';
import {
  Edit,
  GraduationCap,
  HeartPulse,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { ClassId, ClassroomInfo, Student } from '../types';

interface StudentsViewProps {
  classrooms: ClassroomInfo[];
  selectedClassId: ClassId;
  onSelectClass: (id: ClassId) => void;
  students: Student[];
  onUpdateStudents: (updatedStudents: Student[]) => void;
  onOpenStudentDetail: (student: Student) => void;
  onUpdateTeacherProfile: (classId: ClassId, updatedHomeroom: any) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  classrooms,
  selectedClassId,
  onSelectClass,
  students,
  onUpdateStudents,
  onOpenStudentDetail,
  onUpdateTeacherProfile,
}) => {
  const [filterClass, setFilterClass] = useState<string>(selectedClassId);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'ប' | 'ស'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // New Student Form State
  const [newLastName, setNewLastName] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newGender, setNewGender] = useState<'ប' | 'ស'>('ស');
  const [newDob, setNewDob] = useState('1/15/2012');
  const [newClassId, setNewClassId] = useState<ClassId>(selectedClassId);
  const [newGuardian, setNewGuardian] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newJob, setNewJob] = useState('');
  const [newAddress, setNewAddress] = useState('ភូមិទួលទទឹង ឃុំទួលទទឹង');

  // Teacher Edit Form State
  const currentClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  const [teacherName, setTeacherName] = useState(currentClass.homeroomTeacher.name);
  const [teacherSubject, setTeacherSubject] = useState(currentClass.homeroomTeacher.subject);
  const [teacherPhone, setTeacherPhone] = useState(currentClass.homeroomTeacher.phone);
  const [teacherTelegram, setTeacherTelegram] = useState(currentClass.homeroomTeacher.telegram);
  const [teacherDegree, setTeacherDegree] = useState(currentClass.homeroomTeacher.degree);

  // Filtered Students
  const displayedStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = filterClass === 'all' || s.classId === filterClass;
      const matchSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.fatherName && s.fatherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.motherName && s.motherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.rollNumber.toString().includes(searchQuery);
      const matchGender = genderFilter === 'all' || s.gender === genderFilter;
      return matchClass && matchSearch && matchGender;
    });
  }, [students, filterClass, searchQuery, genderFilter]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLastName || !newFirstName) return;

    const classItems = students.filter((s) => s.classId === newClassId);
    const maxRoll = classItems.reduce((max, s) => Math.max(max, s.rollNumber), 0);

    const newStudent: Student = {
      id: `stu_${Date.now()}`,
      rollNumber: maxRoll + 1,
      classId: newClassId,
      lastName: newLastName.trim(),
      firstName: newFirstName.trim(),
      fullName: `${newLastName.trim()} ${newFirstName.trim()}`,
      gender: newGender,
      dob: newDob,
      guardianName: newGuardian || `${newLastName} អាណាព្យាបាល`,
      guardianPhone: newPhone || '012 000 000',
      guardianJob: newJob || 'កសិករ',
      pob: 'ឃុំទួលទទឹង ស្រុកព្រៃនប់',
      address: newAddress,
      status: 'active',
      scores: {},
      health: {
        heightCm: 148,
        weightKg: 40,
        vision: 'ធម្មតា',
      },
    };

    onUpdateStudents([...students, newStudent]);
    setIsAddModalOpen(false);
    // Reset form
    setNewLastName('');
    setNewFirstName('');
    setNewGuardian('');
    setNewPhone('');
  };

  const handleEditStudentSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const updated = students.map((s) =>
      s.id === editingStudent.id
        ? {
            ...editingStudent,
            fullName: `${editingStudent.lastName} ${editingStudent.firstName}`,
          }
        : s
    );

    onUpdateStudents(updated);
    setEditingStudent(null);
  };

  const handleDeleteStudent = (studentId: string, fullName: string) => {
    if (confirm(`តើលោកគ្រូពិតជាចង់លុបឈ្មោះសិស្ស «${fullName}» មែនទេ?`)) {
      onUpdateStudents(students.filter((s) => s.id !== studentId));
    }
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTeacherProfile(selectedClassId, {
      name: teacherName,
      subject: teacherSubject,
      phone: teacherPhone,
      telegram: teacherTelegram,
      degree: teacherDegree,
    });
    setIsTeacherModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Teacher Profile Card for Active Class */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base">
                {currentClass.homeroomTeacher.name}
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                {currentClass.homeroomTeacher.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              មុខវិជ្ជាឯកទេស៖ <strong>{currentClass.homeroomTeacher.subject}</strong> • {currentClass.homeroomTeacher.degree}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
              <span>📞 {currentClass.homeroomTeacher.phone}</span>
              <span>•</span>
              <span className="text-blue-600">Telegram: {currentClass.homeroomTeacher.telegram}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setTeacherName(currentClass.homeroomTeacher.name);
            setTeacherSubject(currentClass.homeroomTeacher.subject);
            setTeacherPhone(currentClass.homeroomTeacher.phone);
            setTeacherTelegram(currentClass.homeroomTeacher.telegram);
            setTeacherDegree(currentClass.homeroomTeacher.degree);
            setIsTeacherModalOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>កែប្រែព័ត៌មានគ្រូ</span>
        </button>
      </div>

      {/* Main Student Directory & Filter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              បញ្ជីរាយនាមសិស្ស ({displayedStudents.length} នាក់)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              គ្រប់គ្រងសិស្សទាំង ៤ ថ្នាក់ នៃអនុវិទ្យាល័យទួលទទឹង (សរុប ១៦៣ នាក់)
            </p>
          </div>

          <button
            onClick={() => {
              setNewClassId(selectedClassId);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ បន្ថែមសិស្សថ្មី (បន្ថែមជួរ)</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Class Switcher for Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => {
                setFilterClass('all');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterClass === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              ទាំងអស់ (១៦៣)
            </button>
            {classrooms.map((cls) => (
              <button
                key={cls.id}
                onClick={() => {
                  setFilterClass(cls.id);
                  onSelectClass(cls.id);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  filterClass === cls.id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                {cls.name} ({cls.totalStudents})
              </button>
            ))}
          </div>

          {/* Search & Gender */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ស្វែងរកតាមឈ្មោះ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 w-44"
              />
            </div>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5"
            >
              <option value="all">ភេទទាំងអស់</option>
              <option value="ស">ស្រី</option>
              <option value="ប">ប្រុស</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 text-center">អត្តលេខ</th>
                <th className="px-3 py-2.5">គោត្តនាម-នាម</th>
                <th className="px-2 py-2.5 text-center">ភេទ</th>
                <th className="px-3 py-2.5 text-center">ថ្នាក់</th>
                <th className="px-3 py-2.5">ថ្ងៃខែឆ្នាំកំណើត</th>
                <th className="px-3 py-2.5">អាណាព្យាបាល</th>
                <th className="px-3 py-2.5">ទូរស័ព្ទ</th>
                <th className="px-3 py-2.5">ទីលំនៅបច្ចុប្បន្ន</th>
                <th className="px-3 py-2.5 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedStudents.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2 text-center font-bold text-slate-700 font-mono">
                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-md text-[11px] text-blue-800 font-bold">
                      {stu.id}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-normal">ល.រ {stu.rollNumber}</span>
                  </td>
                  <td className="px-3 py-2 font-bold text-slate-900">
                    <button
                      onClick={() => onOpenStudentDetail(stu)}
                      className="hover:text-blue-600 hover:underline text-left cursor-pointer"
                    >
                      {stu.fullName}
                    </button>
                  </td>
                  <td className="px-2 py-2 text-center font-semibold">
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
                  <td className="px-3 py-2 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {stu.classId}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600 font-mono text-[11px]">
                    {stu.dob}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    <div className="font-medium text-slate-800">{stu.guardianName}</div>
                    <div className="text-[10px] text-slate-500">
                      {stu.fatherName ? `ឳ៖ ${stu.fatherName}` : ''}{' '}
                      {stu.motherName ? `ម្តាយ៖ ${stu.motherName}` : ''}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">
                    {stu.guardianPhone}
                  </td>
                  <td className="px-3 py-2 text-slate-600 truncate max-w-[150px]">
                    {stu.address}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onOpenStudentDetail(stu)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-600"
                        title="មើលព័ត៌មានលម្អិត"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingStudent(stu)}
                        className="p-1 rounded hover:bg-blue-100 text-blue-600"
                        title="កែសម្រួល"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(stu.id, stu.fullName)}
                        className="p-1 rounded hover:bg-rose-100 text-rose-600"
                        title="លុបសិស្ស (បន្ថយជួរ)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddStudent}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                បន្ថែមសិស្សថ្មី (បន្ថែមជួរ)
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">គោត្តនាម (ត្រកូល)៖</label>
                <input
                  required
                  type="text"
                  placeholder="ឧ. សុខ"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">នាម (ឈ្មោះ)៖</label>
                <input
                  required
                  type="text"
                  placeholder="ឧ. វិសាល"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ភេទ៖</label>
                <select
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ស">ស្រី (ស)</option>
                  <option value="ប">ប្រុស (ប)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ថ្នាក់រៀន៖</label>
                <select
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value as ClassId)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ថ្ងៃខែឆ្នាំកំណើត៖</label>
                <input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={newDob}
                  onChange={(e) => setNewDob(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ឈ្មោះអាណាព្យាបាល៖</label>
                <input
                  type="text"
                  placeholder="ឧ. សុខ សំអុល"
                  value={newGuardian}
                  onChange={(e) => setNewGuardian(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">លេខទូរស័ព្ទ៖</label>
                <input
                  type="text"
                  placeholder="097xxxxxxx"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">មុខរបរអាណាព្យាបាល៖</label>
                <input
                  type="text"
                  placeholder="ឧ. កសិករ / អាជីវករ"
                  value={newJob}
                  onChange={(e) => setNewJob(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                បន្ថែមសិស្ស
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleEditStudentSave}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                កែសម្រួលព័ត៌មានសិស្ស «{editingStudent.fullName}»
              </h3>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">គោត្តនាម៖</label>
                <input
                  required
                  type="text"
                  value={editingStudent.lastName}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, lastName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">នាម៖</label>
                <input
                  required
                  type="text"
                  value={editingStudent.firstName}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, firstName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ភេទ៖</label>
                <select
                  value={editingStudent.gender}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, gender: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="ស">ស្រី</option>
                  <option value="ប">ប្រុស</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ថ្ងៃខែឆ្នាំកំណើត៖</label>
                <input
                  type="text"
                  value={editingStudent.dob}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, dob: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ឈ្មោះអាណាព្យាបាល៖</label>
                <input
                  type="text"
                  value={editingStudent.guardianName}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, guardianName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">លេខទូរស័ព្ទ៖</label>
                <input
                  type="text"
                  value={editingStudent.guardianPhone}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, guardianPhone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                រក្សាទុកការកែប្រែ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TEACHER PROFILE EDIT MODAL */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveTeacher}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                កែសម្រួលព័ត៌មានគ្រូបន្ទុក {currentClass.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsTeacherModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ឈ្មោះគ្រូបន្ទុកថ្នាក់៖</label>
                <input
                  required
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">មុខវិជ្ជាបង្រៀន៖</label>
                <input
                  required
                  type="text"
                  value={teacherSubject}
                  onChange={(e) => setTeacherSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">លេខទូរស័ព្ទ៖</label>
                <input
                  type="text"
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">គណនី Telegram៖</label>
                <input
                  type="text"
                  value={teacherTelegram}
                  onChange={(e) => setTeacherTelegram(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">កម្រិតវប្បធម៌ / សញ្ញាបត្រ៖</label>
                <input
                  type="text"
                  value={teacherDegree}
                  onChange={(e) => setTeacherDegree(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsTeacherModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                រក្សាទុក
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
