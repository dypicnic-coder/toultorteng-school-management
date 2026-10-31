import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  Printer,
  QrCode,
  Share2,
  Sparkles,
} from 'lucide-react';
import { SchoolInfo } from '../types';

interface SchoolQRViewProps {
  schoolInfo: SchoolInfo;
}

export const SchoolQRView: React.FC<SchoolQRViewProps> = ({ schoolInfo }) => {
  const [qrType, setQrType] = useState<'portal' | 'telegram' | 'facebook' | 'custom'>('portal');
  const [customUrl, setCustomUrl] = useState('https://moeys.gov.kh');

  const getTargetUrl = () => {
    switch (qrType) {
      case 'portal':
        return window.location.origin;
      case 'telegram':
        return 'https://t.me/tuol_totueng_secondary';
      case 'facebook':
        return 'https://facebook.com/tuol.totueng.school';
      case 'custom':
        return customUrl;
    }
  };

  const targetUrl = getTargetUrl();
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    targetUrl
  )}`;

  return (
    <div className="space-y-6">
      {/* Top Controls (No-print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-blue-100 text-blue-700 rounded-xl font-bold">
              <QrCode className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                ស្លាក QR Code ផ្លូវការរបស់សាលារៀន (School Placard)
              </h2>
              <p className="text-xs text-slate-500">
                សម្រាប់បោះពុម្ពបិទនៅមាត់ទ្វារបន្ទប់រៀន តុគ្រូ ឬក្តារព័ត៌មានសាលា
              </p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-auto"
          >
            <Printer className="w-4 h-4" />
            <span>បោះពុម្ពស្លាកផ្លូវការ (Print Placard)</span>
          </button>
        </div>

        {/* QR Type Switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
          <span className="font-semibold text-slate-600">គោលដៅ QR Code៖</span>
          <button
            onClick={() => setQrType('portal')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              qrType === 'portal' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            🌐 ផតថលសាលារៀន (App Portal)
          </button>
          <button
            onClick={() => setQrType('telegram')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              qrType === 'telegram' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            ✈️ Telegram សាលារៀន
          </button>
          <button
            onClick={() => setQrType('facebook')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              qrType === 'facebook' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            📘 ទំព័រ Facebook ផ្លូវការ
          </button>
        </div>
      </div>

      {/* Official Printable Placard (A4 / Frame Style) */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border-4 border-double border-blue-900 shadow-xl max-w-lg mx-auto text-center space-y-6 print:border-4 print:shadow-none print:m-0">
        {/* National Emblem & Header */}
        <div className="space-y-1">
          <div className="font-bold text-sm tracking-wide text-slate-900">ព្រះរាជាណាចក្រកម្ពុជា</div>
          <div className="text-xs font-semibold text-slate-700">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
          <div className="w-24 h-0.5 bg-blue-900 mx-auto my-2"></div>
          <div className="text-xs text-slate-600">
            ក្រសួងអប់រំ យុវជន និងកីឡា • មន្ទីរអប់រំខេត្តព្រះសីហនុ
          </div>
          <div className="text-xs font-bold text-slate-800">
            ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកព្រៃនប់
          </div>
        </div>

        {/* School Name */}
        <div className="pt-2">
          <h1 className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight">
            {schoolInfo.name}
          </h1>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            ឃុំទួលទទឹង ស្រុកព្រៃនប់ ខេត្តព្រះសីហនុ
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-full">
            ឆ្នាំសិក្សា {schoolInfo.academicYear}
          </div>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-slate-50 border-2 border-slate-300 rounded-2xl inline-block shadow-inner">
          <img
            src={qrApiUrl}
            alt="School Official QR Code"
            className="w-56 h-56 mx-auto rounded-lg"
          />
        </div>

        {/* Instruction */}
        <div className="space-y-1">
          <p className="font-extrabold text-sm text-slate-900">
            ស្កេនដើម្បីមើលព័ត៌មាន និងលទ្ធផលសិក្សាសិស្ស
          </p>
          <p className="text-[11px] text-slate-500 font-mono break-all px-4">
            {targetUrl}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span>នាយកសាលា៖ {schoolInfo.principal}</span>
          <span>ទូរស័ព្ទ៖ {schoolInfo.principalPhone}</span>
        </div>
      </div>
    </div>
  );
};
