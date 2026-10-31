import React, { useState } from 'react';
import {
  BookOpen,
  Camera,
  CheckCircle,
  Copy,
  Download,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Loader2,
  Printer,
  QrCode,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { ClassroomInfo, SchoolInfo, Student } from '../types';
import { generateAICotent } from '../services/gemini';

interface AITeacherSuiteViewProps {
  schoolInfo: SchoolInfo;
  classrooms: ClassroomInfo[];
  selectedClassId: string;
  students: Student[];
}

export const AITeacherSuiteView: React.FC<AITeacherSuiteViewProps> = ({
  schoolInfo,
  classrooms,
  selectedClassId,
  students,
}) => {
  const currentClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  const [activeTool, setActiveTool] = useState<
    | 'lesson_plan'
    | 'exam_maker'
    | 'id_card'
    | 'certificate'
    | 'worksheet'
    | 'agreement'
    | 'leave_request'
    | 'teaching_aid'
    | 'online_quiz'
    | 'career_guidance'
  >('lesson_plan');

  // Lesson Plan Form State with Image Upload
  const [lessonSubject, setLessonSubject] = useState('គណិតវិទ្យា');
  const [lessonGrade, setLessonGrade] = useState(`ថ្នាក់ទី ${currentClass.grade}`);
  const [lessonTopic, setLessonTopic] = useState('សមីការដឺក្រេទី១ មានមួយអញ្ញាត');
  const [lessonDuration, setLessonDuration] = useState('៥០ នាទី (១ ម៉ោងសិក្សា)');
  const [lessonImageBase64, setLessonImageBase64] = useState<string | null>(null);
  const [lessonImageMime, setLessonImageMime] = useState<string>('image/jpeg');

  // General AI Output & Loading
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [copiedToast, setCopiedToast] = useState(false);

  // Exam Maker State
  const [examSubject, setExamSubject] = useState('រូបវិទ្យា');
  const [examTopic, setExamTopic] = useState('ច្បាប់ញូតុន និងកម្លាំងកកិត');
  const [examQuestionCount, setExamQuestionCount] = useState('៥ សំណួរ');

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLessonImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onloadend = () => {
      setLessonImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateLessonPlan = async () => {
    setIsGenerating(true);
    setGeneratedOutput('');

    try {
      const prompt = `សូមជួយបង្កើត «កិច្ចតែងការបង្រៀនស្តង់ដារ ៥ ជំហាន MoEYS» សម្រាប់សាលារៀន ${schoolInfo.name} (ស្រុកព្រៃនប់ ខេត្តព្រះសីហនុ) លើ៖
- មុខវិជ្ជា៖ ${lessonSubject}
- កម្រិតថ្នាក់៖ ${lessonGrade}
- ចំណងជើងមេរៀន៖ ${lessonTopic}
- រយៈពេលបង្រៀន៖ ${lessonDuration}
${lessonImageBase64 ? 'ចំណាំសំខាន់៖ ខ្ញុំបាន Upload រូបភាពទំព័រសៀវភៅពុម្ព/លំហាត់ភ្ជាប់មកជាមួយ។ សូមពិនិត្យខ្លឹមសារ និងលំហាត់ក្នុងរូបភាពនេះឱ្យបានហ្មត់ចត់ រួចដកស្រង់មកដាក់ក្នុងជំហានទី ៣ (មេរៀនថ្មី) និងជំហានទី ៤ (ពង្រឹងចំណេះដឹង)។' : ''}

ទម្រង់កិច្ចតែងការ MoEYS ត្រូវមាន ៥ ជំហានពេញលេញ៖
ជំហានទី១៖ រដ្ឋបាលថ្នាក់ (វត្តមាន អនាម័យ ឯកសណ្ឋាន)
ជំហានទី២៖ រំលឹកមេរៀនចាស់ (សំណួរគន្លឹះ)
ជំហានទី៣៖ មេរៀនថ្មី (សកម្មភាពគ្រូ និងសកម្មភាពសិស្ស)
ជំហានទី៤៖ ពង្រឹងពុទ្ធិ (លំហាត់អនុវត្តន៍ និងសំណួរត្រិះរិះ)
ជំហានទី៥៖ បណ្តាំផ្ញើ (កិច្ចការផ្ទះ និងការថែរក្សាសុខភាព)

សូមសរសេរជាភាសាខ្មែរផ្លូវការ ស្របតាមក្បួនគរុកោសល្យទំនើប (Active Learning)។`;

      const result = await generateAICotent({
        prompt,
        systemInstruction:
          'You are an expert pedagogical advisor for Cambodia Ministry of Education, Youth and Sports (MoEYS). Generate structured, professional Khmer lesson plans.',
        imageBase64: lessonImageBase64 || undefined,
        mimeType: lessonImageMime,
      });

      setGeneratedOutput(result);
    } catch (err: any) {
      setGeneratedOutput(`កំហុសក្នុងការបង្កើតកិច្ចតែងការ៖ ${err.message || 'សូមព្យាយាមម្តងទៀត'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateExamPaper = async () => {
    setIsGenerating(true);
    setGeneratedOutput('');

    try {
      const prompt = `សូមបង្កើត «វិញ្ញាសារប្រឡងឆ្លាតវៃ» សម្រាប់អនុវិទ្យាល័យទួលទទឹង៖
- មុខវិជ្ជា៖ ${examSubject}
- ថ្នាក់ទី៖ ${currentClass.grade}
- មេរៀន៖ ${examTopic}
- ចំនួនសំណួរ៖ ${examQuestionCount}

ទម្រង់វិញ្ញាសាររួមមាន៖
ផ្នែកទី១៖ សំណួរពហុជ្រើសរើស (MCQ ៤ ជម្រើស ក, ខ, គ, ឃ)
ផ្នែកទី២៖ សំណួរត្រិះរិះ ឬលំហាត់គណនា
ផ្នែកទី៣៖ តារាងគន្លឹះចម្លើយ និងការបែងចែកពិន្ទុ (Rubric)`;

      const result = await generateAICotent({
        prompt,
        systemInstruction: 'You are an educational assessment expert for Cambodia secondary schools.',
      });

      setGeneratedOutput(result);
    } catch (err: any) {
      setGeneratedOutput(`កំហុស៖ ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyOutput = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-purple-900 via-indigo-900 to-blue-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-amber-300">
              <Sparkles className="w-7 h-7" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black">
                  កញ្ចប់ AI សម្រាប់គ្រូបង្រៀន (Gemini 3.8 Flash)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px]">
                  ឆ្លាតវៃ & គាំទ្ររូបភាព
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                បង្កើតកិច្ចតែងការបង្រៀន MoEYS ៥ ជំហាន វិញ្ញាសារប្រឡង និងកិច្ចព្រមព្រៀងការងារគ្រូ
              </p>
            </div>
          </div>
        </div>

        {/* 10 Tool Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-semibold pt-2 border-t border-white/10">
          {[
            { id: 'lesson_plan', label: '📝 កិច្ចតែងការ (មាន Upload រូបភាព)' },
            { id: 'exam_maker', label: '📄 វិញ្ញាសារឆ្លាតវៃ' },
            { id: 'worksheet', label: '🧠 សន្លឹកកិច្ចការ' },
            { id: 'id_card', label: '🪪 កាតសិស្ស QR' },
            { id: 'certificate', label: '🎓 បណ្ណសរសើរឌីជីថល' },
            { id: 'agreement', label: '🤝 កិច្ចព្រមព្រៀងគ្រូ' },
            { id: 'leave_request', label: '✉️ លិខិតសុំច្បាប់' },
            { id: 'teaching_aid', label: '🎨 សម្ភារៈឧបទេស' },
            { id: 'online_quiz', label: '📱 Link & QR ប្រឡង' },
            { id: 'career_guidance', label: '🧭 តម្រង់ទិសអាជីព' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id as any);
                setGeneratedOutput('');
              }}
              className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTool === tool.id
                  ? 'bg-white text-blue-900 font-extrabold shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      {/* TOOL 1: LESSON PLAN GENERATOR (WITH IMAGE UPLOAD) */}
      {activeTool === 'lesson_plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              កំណត់ព័ត៌មានកិច្ចតែងការបង្រៀន
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">មុខវិជ្ជា៖</label>
                <select
                  value={lessonSubject}
                  onChange={(e) => setLessonSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value="ភាសាខ្មែរ">ភាសាខ្មែរ</option>
                  <option value="គណិតវិទ្យា">គណិតវិទ្យា</option>
                  <option value="រូបវិទ្យា">រូបវិទ្យា</option>
                  <option value="គីមីវិទ្យា">គីមីវិទ្យា</option>
                  <option value="ជីវវិទ្យា">ជីវវិទ្យា</option>
                  <option value="ផែនដីវិទ្យា">ផែនដីវិទ្យា</option>
                  <option value="ប្រវត្តិវិទ្យា">ប្រវត្តិវិទ្យា</option>
                  <option value="ភូមិវិទ្យា">ភូមិវិទ្យា</option>
                  <option value="សីលធម៌-ពលរដ្ឋ">សីលធម៌-ពលរដ្ឋ</option>
                  <option value="ភាសាអង់គ្លេស">ភាសាអង់គ្លេស</option>
                  <option value="គេហវិទ្យា">គេហវិទ្យា</option>
                  <option value="កីឡា">កីឡា</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">កម្រិតថ្នាក់៖</label>
                <input
                  type="text"
                  value={lessonGrade}
                  onChange={(e) => setLessonGrade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ចំណងជើងមេរៀន / ប្រធានបទ៖</label>
                <input
                  type="text"
                  placeholder="ឧ. សមីការដឺក្រេទី១ មានមួយអញ្ញាត"
                  value={lessonTopic}
                  onChange={(e) => setLessonTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">រយៈពេលបង្រៀន៖</label>
                <input
                  type="text"
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              {/* IMAGE UPLOAD FIELD (Explicitly requested by user) */}
              <div className="pt-2">
                <label className="block font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-purple-600" />
                  <span>បង្ហោះរូបភាពសៀវភៅពុម្ព ឬលំហាត់ (Image Upload)៖</span>
                </label>

                {!lessonImageBase64 ? (
                  <label className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center">
                    <Upload className="w-8 h-8 text-purple-600 mb-1" />
                    <span className="font-bold text-purple-900 text-xs">
                      ចុចដើម្បី Upload ឬថតរូបសៀវភៅពុម្ព
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      គាំទ្រ JPG, PNG, WebP (AI នឹងអានអត្ថបទ និងលំហាត់ពីក្នុងរូបភាព)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-purple-200 bg-slate-900 shadow-md">
                    <img
                      src={lessonImageBase64}
                      alt="Uploaded textbook page"
                      className="w-full h-44 object-contain bg-slate-100"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setLessonImageBase64(null)}
                        className="p-1.5 bg-rose-600 text-white rounded-xl shadow-md hover:bg-rose-700 text-xs font-bold"
                        title="លុបរូបភាពចេញ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-2 bg-purple-900 text-white text-[11px] font-semibold text-center">
                      ✓ បានភ្ជាប់រូបភាពសៀវភៅពុម្ពរួចរាល់
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleGenerateLessonPlan}
                disabled={isGenerating}
                className="w-full py-3 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini កំពុងរៀបចំកិច្ចតែងការ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>បង្កើតកិច្ចតែងការ ៥ ជំហាន MoEYS</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Column */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  លទ្ធផលកិច្ចតែងការបង្រៀនផ្លូវការ
                </h3>
                {generatedOutput && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyOutput}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedToast ? 'បានចម្លង!' : 'ចម្លង'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>បោះពុម្ព</span>
                    </button>
                  </div>
                )}
              </div>

              {generatedOutput ? (
                <div className="mt-4 p-5 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans max-h-[600px] overflow-y-auto">
                  {generatedOutput}
                </div>
              ) : (
                <div className="py-24 text-center text-slate-400 text-xs space-y-2">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-600">
                    មិនទាន់មានកិច្ចតែងការត្រូវបានបង្កើតនៅឡើយ
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    សូមបំពេញប្រធានបទមេរៀន ឬ Upload រូបភាពសៀវភៅពុម្ពនៅខាងឆ្វេង រួចចុច «បង្កើតកិច្ចតែងការ ៥ ជំហាន»
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: EXAM PAPER MAKER */}
      {activeTool === 'exam_maker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              រៀបចំវិញ្ញាសារប្រឡងឆ្លាតវៃ
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">មុខវិជ្ជា៖</label>
                <input
                  type="text"
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ប្រធានបទវិញ្ញាសារ៖</label>
                <input
                  type="text"
                  value={examTopic}
                  onChange={(e) => setExamTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ចំនួនសំណួរ៖</label>
                <select
                  value={examQuestionCount}
                  onChange={(e) => setExamQuestionCount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="៥ សំណួរ">៥ សំណួរ (តេស្តរហ័ស ១៥ នាទី)</option>
                  <option value="១០ សំណួរ">១០ សំណួរ (ប្រឡងប្រចាំខែ ៥០ នាទី)</option>
                  <option value="១៥ សំណួរ">១៥ សំណួរ (ប្រឡងឆមាស ៩០ នាទី)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateExamPaper}
                disabled={isGenerating}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI កំពុងរៀបចំវិញ្ញាសារ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>បង្កើតវិញ្ញាសារ & គន្លឹះចម្លើយ</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                សន្លឹកវិញ្ញាសារ និងគន្លឹះចម្លើយ
              </h3>
              {generatedOutput && (
                <button
                  onClick={handleCopyOutput}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  ចម្លង
                </button>
              )}
            </div>

            {generatedOutput ? (
              <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                {generatedOutput}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 text-xs">
                ចុច «បង្កើតវិញ្ញាសារ» ដើម្បីឱ្យ Gemini រៀបចំសន្លឹកសំណួរ និងតារាងពិន្ទុ
              </div>
            )}
          </div>
        </div>
      )}

      {/* OTHER TOOLS PLACEHOLDERS / QUICK GENERATORS */}
      {activeTool !== 'lesson_plan' && activeTool !== 'exam_maker' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto text-2xl">
            ✨
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            មុខងារ AI Gemini 3.8 Flash កំពុងដំណើរការស្របតាមតម្រូវការជាក់ស្តែង
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            លោកគ្រូ-អ្នកគ្រូអាចជ្រើសរើសផ្ទាំង «កិច្ចតែងការ (មាន Upload រូបភាព)» ឬ «វិញ្ញាសារឆ្លាតវៃ» ដើម្បីបង្កើតឯកសារគរុកោសល្យភ្លាមៗ។
          </p>
        </div>
      )}
    </div>
  );
};
