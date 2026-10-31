import React from 'react';
import {
  Award,
  Bell,
  BookMarked,
  Calculator,
  CalendarCheck,
  ClipboardList,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  QrCode,
  Settings,
  Sparkles,
  Users,
  Wrench,
  X,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'scores'
  | 'results'
  | 'students'
  | 'attendance'
  | 'reports'
  | 'toolkit'
  | 'coefficients'
  | 'ai_suite'
  | 'school_qr'
  | 'announcements'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  unreadAnnouncements?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  unreadAnnouncements = 3,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'ផ្ទាំងគ្រប់គ្រង',
      sub: 'ស្ថិតិទូទៅ & សង្ខេប',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'scores',
      label: 'សម្រង់ពិន្ទុនៃការប្រឡង',
      sub: 'តារាងស្រង់ពិន្ទុពេញមួយឆ្នាំ',
      icon: FileSpreadsheet,
      badge: 'គំរូ MoEYS',
    },
    {
      id: 'results',
      label: 'លទ្ធផល & តារាងកិត្តិយស',
      sub: 'ចំណាត់ថ្នាក់ & បណ្ណសរសើរ',
      icon: Award,
      badge: null,
    },
    {
      id: 'students',
      label: 'ព័ត៌មានគ្រូ និងសិស្ស',
      sub: 'គ្រប់គ្រងបញ្ជីឈ្មោះសិស្ស',
      icon: Users,
      badge: null,
    },
    {
      id: 'attendance',
      label: 'វត្តមានសិស្សប្រចាំថ្ងៃ',
      sub: 'ស្រង់វត្តមាន & ស្ថិតិ',
      icon: CalendarCheck,
      badge: null,
    },
    {
      id: 'reports',
      label: 'របាយការណ៍ & ផែនការ',
      sub: 'ព្រឹត្តិបត្រពិន្ទុ & ផែនការគ្រូ',
      icon: ClipboardList,
      badge: null,
    },
    {
      id: 'toolkit',
      label: 'ការងារសម្រាប់គ្រូ (Toolkit)',
      sub: 'អនាម័យ ប្លង់តុ សារពើភ័ណ្ឌ',
      icon: Wrench,
      badge: '១០ ការងារ',
    },
    {
      id: 'coefficients',
      label: 'ពិន្ទុមេគុណតាមមុខវិជ្ជា',
      sub: 'កំណត់ពិន្ទុពេញ & រូបមន្ត',
      icon: Calculator,
      badge: null,
    },
    {
      id: 'ai_suite',
      label: 'កញ្ចប់ AI សម្រាប់គ្រូ',
      sub: 'Gemini 3.8 Flash (Upload រូបភាព)',
      icon: Sparkles,
      badge: 'AI ឆ្លាតវៃ',
      highlight: true,
    },
    {
      id: 'school_qr',
      label: 'QR Code ព័ត៌មានសាលា',
      sub: 'ស្លាកសាលា & ផតថល',
      icon: QrCode,
      badge: null,
    },
    {
      id: 'announcements',
      label: 'សេចក្តីប្រកាស',
      sub: 'ផ្ញើទៅ Telegram & សាលា',
      icon: Bell,
      badge: unreadAnnouncements > 0 ? `${unreadAnnouncements}` : null,
    },
    {
      id: 'settings',
      label: 'ការកំណត់ & បម្រុងទុក',
      sub: 'Backup / Restore JSON',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNav = (tabId: ActiveTab) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header in Mobile */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between lg:hidden bg-slate-50">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-800 text-sm">មឺនុយរដ្ឋបាលថ្នាក់</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-200"
            aria-label="បិទម៉ឺនុយ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            ប្រព័ន្ធគ្រប់គ្រងសាលា និងថ្នាក់រៀន
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-500/20'
                    : item.highlight
                    ? 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : item.highlight
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isActive ? 'text-white' : item.highlight ? 'text-purple-950' : 'text-slate-900'
                      }`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-[10px] truncate ${
                        isActive ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {item.sub}
                    </p>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ml-1.5 ${
                      isActive
                        ? 'bg-blue-800 text-white'
                        : item.highlight
                        ? 'bg-purple-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            អនុវិទ្យាល័យទួលទទឹង
          </p>
          <p className="text-[10px] text-slate-400">
            ខេត្តព្រះសីហនុ • ឆ្នាំ ២០២៦-២០២៧
          </p>
        </div>
      </aside>
    </>
  );
};
