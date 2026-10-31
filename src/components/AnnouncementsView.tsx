import React, { useState } from 'react';
import {
  Bell,
  Check,
  Copy,
  Pin,
  Plus,
  Send,
  Trash2,
} from 'lucide-react';
import { Announcement } from '../types';
import { INITIAL_ANNOUNCEMENTS } from '../data/mockData';

export const AnnouncementsView: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'students' | 'guardians' | 'teachers'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New announcement modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<Announcement['category']>('ទូទៅ');
  const [newTarget, setNewTarget] = useState<Announcement['target']>('all');

  const filtered = announcements.filter(
    (a) => activeFilter === 'all' || a.target === activeFilter || a.target === 'all'
  );

  const handleCopyForTelegram = (ann: Announcement) => {
    const text = `📢 【${ann.title}】\n\n${ann.content}\n\n🗓 កាលបរិច្ឆេទ៖ ${ann.date}\n✍️ ដោយ៖ ${ann.author}\n📍 អនុវិទ្យាល័យទួលទទឹង (ស្រុកព្រៃនប់)`;
    navigator.clipboard.writeText(text);
    setCopiedId(ann.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      date: new Date().toISOString().split('T')[0],
      author: 'លោកគ្រូ/អ្នកគ្រូ',
      category: newCategory,
      target: newTarget,
      isPinned: false,
    };

    setAnnouncements([newAnn, ...announcements]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-blue-100 text-blue-700 rounded-xl font-bold">
              <Bell className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                សេចក្តីប្រកាស & ដំណឹងសាលារៀន
              </h2>
              <p className="text-xs text-slate-500">
                ផ្សព្វផ្សាយព័ត៌មានទៅកាន់សិស្ស អាណាព្យាបាល និងក្រុម Telegram
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ បង្កើតសេចក្តីប្រកាសថ្មី</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            ទាំងអស់ ({announcements.length})
          </button>
          <button
            onClick={() => setActiveFilter('guardians')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeFilter === 'guardians' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            👨‍👩‍👧 សម្រាប់អាណាព្យាបាល
          </button>
          <button
            onClick={() => setActiveFilter('students')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeFilter === 'students' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            🧒 សម្រាប់សិស្ស
          </button>
          <button
            onClick={() => setActiveFilter('teachers')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeFilter === 'teachers' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            👨‍🏫 សម្រាប់លោកគ្រូ-អ្នកគ្រូ
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filtered.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white p-5 rounded-2xl border transition-all ${
              ann.isPinned
                ? 'border-blue-300 shadow-md ring-1 ring-blue-500/20 bg-blue-50/10'
                : 'border-slate-200 shadow-xs hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {ann.isPinned && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center gap-1">
                      <Pin className="w-3 h-3 text-amber-600" />
                      បានខ្ទាស់ (Pinned)
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                    {ann.category}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {ann.date} • ដោយ៖ {ann.author}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base">
                  {ann.title}
                </h3>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => handleCopyForTelegram(ann)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="ចម្លងអត្ថបទទៅផ្ញើក្នុង Telegram"
                >
                  {copiedId === ann.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">បានចម្លង!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-blue-600" />
                      <span>ចម្លងដាក់ Telegram</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  title="លុប"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAdd}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                បង្កើតសេចក្តីប្រកាសថ្មី
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ចំណងជើងសេចក្តីប្រកាស៖</label>
                <input
                  required
                  type="text"
                  placeholder="ឧ. ការប្រឡងឆមាសទី១ ឆ្នាំសិក្សា ២០២៦-២០២៧"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ប្រភេទដំណឹង៖</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="ទូទៅ">ទូទៅ</option>
                    <option value="បន្ទាន់">បន្ទាន់</option>
                    <option value="ប្រជុំ">ប្រជុំ</option>
                    <option value="ប្រឡង">ប្រឡង</option>
                    <option value="សកម្មភាព">សកម្មភាព</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ក្រុមគោលដៅ៖</label>
                  <select
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="all">ទាំងអស់</option>
                    <option value="guardians">អាណាព្យាបាល</option>
                    <option value="students">សិស្ស</option>
                    <option value="teachers">គ្រូបង្រៀន</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ខ្លឹមសារលម្អិត៖</label>
                <textarea
                  required
                  rows={5}
                  placeholder="សរសេរខ្លឹមសារសេចក្តីប្រកាសនៅទីនេះ..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl leading-relaxed"
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
                ផ្សព្វផ្សាយ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
