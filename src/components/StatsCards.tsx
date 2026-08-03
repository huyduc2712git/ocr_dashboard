import React from 'react';
import { Percent, Bot, PhoneCall, Layers, Sparkles, CheckCircle, XCircle, Check, Filter } from 'lucide-react';
import { OcrRecord, Pagination } from '../types';

interface StatsCardsProps {
  pagination: Pagination | null;
  records: OcrRecord[];
  loading: boolean;
  modelFilter: string;
  onModelChange: (model: string) => void;
}

// Utility to clean phone digits
export function extractDigits(str?: string): string {
  if (!str) return '';
  return str.replace(/\D/g, '');
}

// Extract recipient phone from Ground Truth
export function getRecipientPhoneGT(gt?: string): string {
  if (!gt) return '';
  const lines = gt.split('\n');
  const phones: string[] = [];
  for (const line of lines) {
    if (/đIỆN THOẠI|điện thoại|sđt|phone/i.test(line)) {
      const d = extractDigits(line);
      if (d.length >= 8) phones.push(d);
    }
  }
  if (phones.length > 0) return phones[phones.length - 1];
  const allDigits = gt.match(/\b\d{9,11}\b/g) || [];
  return allDigits.length > 0 ? allDigits[allDigits.length - 1] : '';
}

// Extract recipient phone from OCR text
export function getRecipientPhoneOCR(r: OcrRecord): string {
  if (r.phone) {
    const d = extractDigits(r.phone);
    if (d.length >= 8) return d;
  }
  const text = r.raw_text || r.ocr_text || '';
  if (!text) return '';
  const lines = text.split('\n');
  const phones: string[] = [];
  for (const line of lines) {
    if (/đIỆN THOẠI|điện thoại|sđt|phone/i.test(line)) {
      const d = extractDigits(line);
      if (d.length >= 8) phones.push(d);
    }
  }
  if (phones.length > 0) return phones[phones.length - 1];
  return extractDigits(text);
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  pagination,
  records,
  loading,
  modelFilter,
  onModelChange,
}) => {
  const totalRecords = pagination?.total || records.length;

  // Calculate overall average accuracy across all records
  const accuracies = records
    .map((r) => r.accuracy ?? r.confidence_score)
    .filter((val): val is number => typeof val === 'number' && !isNaN(val));

  const overallAvgAccuracy = accuracies.length > 0
    ? (accuracies.reduce((a, b) => a + b, 0) / accuracies.length).toFixed(1)
    : '0.0';

  // Helper for per-model accuracy
  const getModelStats = (fullName: string, modelNameKeyword: string) => {
    const modelRecords = records.filter(
      (r) => r.model_used && r.model_used.toLowerCase().includes(modelNameKeyword.toLowerCase())
    );
    const modelAccuracies = modelRecords
      .map((r) => r.accuracy ?? r.confidence_score)
      .filter((val): val is number => typeof val === 'number' && !isNaN(val));

    const avgAcc = modelAccuracies.length > 0
      ? (modelAccuracies.reduce((a, b) => a + b, 0) / modelAccuracies.length).toFixed(1)
      : 'N/A';

    // Phone match count
    let phoneMatches = 0;
    modelRecords.forEach((r) => {
      const gt = getRecipientPhoneGT(r.ground_truth);
      const ocr = getRecipientPhoneOCR(r);
      if (gt && ocr && gt === ocr) phoneMatches++;
    });

    const phoneMatchRate = modelRecords.length > 0
      ? Math.round((phoneMatches / modelRecords.length) * 100)
      : 0;

    const isSelected = modelFilter === fullName;

    return {
      fullName,
      count: modelRecords.length,
      avgAcc,
      phoneMatches,
      phoneMatchRate,
      isSelected,
    };
  };

  const chatGptStats = getModelStats('ChatGPT GPT 5.4 Nano', 'ChatGPT');
  const geminiStats = getModelStats('Gemini 3.1 Flash-Lite', 'Gemini');
  const vinternStats = getModelStats('vintern_python', 'vintern');

  // Overall Phone Match Rate
  let totalPhoneMatches = 0;
  records.forEach((r) => {
    const gt = getRecipientPhoneGT(r.ground_truth);
    const ocr = getRecipientPhoneOCR(r);
    if (gt && ocr && gt === ocr) totalPhoneMatches++;
  });
  const overallPhoneMatchRate = totalRecords > 0
    ? Math.round((totalPhoneMatches / totalRecords) * 100)
    : 0;

  const handleCardClick = (modelName: string) => {
    if (modelFilter === modelName) {
      onModelChange(''); // toggle off
    } else {
      onModelChange(modelName);
    }
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Top Bar: Total Benchmark Records & Overall Average Accuracy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        
        {/* Total Benchmark Records */}
        <div 
          onClick={() => onModelChange('')}
          className={`border rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer shadow-sm ${
            !modelFilter 
              ? 'bg-slate-900 border-blue-500/80 ring-2 ring-blue-500/20' 
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Tổng Số Bản Ghi Benchmark
              </span>
              {!modelFilter && (
                <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                  Đang xem tất cả
                </span>
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                {loading ? '...' : totalRecords}
              </span>
              <span className="text-xs text-blue-400 bg-blue-950/80 border border-blue-800/80 px-2.5 py-0.5 rounded-md font-mono">
                Full 70 Dataset
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Click để xem toàn bộ 3 Model AI
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Overall Average Accuracy (TỔNG ĐỘ CHÍNH XÁC TB) */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-800/80 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              TỔNG ĐỘ CHÍNH XÁC TRUNG BÌNH (OVERALL ACCURACY)
            </span>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-emerald-300 tracking-tight font-mono">
                {loading ? '...' : `${overallAvgAccuracy}%`}
              </span>
              <span className="text-xs text-emerald-300 bg-emerald-900/80 border border-emerald-700/80 px-2.5 py-0.5 rounded-full font-bold">
                {records.length} Mẫu
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              Khớp SĐT chính xác: <strong className="text-emerald-300 font-mono ml-1">{totalPhoneMatches}/{totalRecords} ({overallPhoneMatchRate}%)</strong>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
            <Percent className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3 Model AI Clickable Cards */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            Click chọn Model AI bên dưới để lọc danh sách:
          </span>
          {modelFilter && (
            <button
              onClick={() => onModelChange('')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              Hiển thị lại Tất Cả 3 Model
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Model 1: ChatGPT GPT 5.4 Nano */}
          <div
            onClick={() => handleCardClick(chatGptStats.fullName)}
            className={`rounded-2xl p-4 transition-all cursor-pointer relative shadow-sm border ${
              chatGptStats.isSelected
                ? 'bg-emerald-950/90 border-2 border-emerald-400 ring-2 ring-emerald-500/30 shadow-emerald-950/50 shadow-lg'
                : 'bg-slate-900/90 border-slate-800 hover:border-emerald-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                  chatGptStats.isSelected ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">{chatGptStats.fullName}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{chatGptStats.count} mẫu test</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-emerald-300 bg-emerald-950/90 border border-emerald-700/80 px-2.5 py-1 rounded-lg font-mono block">
                  {chatGptStats.avgAcc}% TB
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Khớp số điện thoại:</span>
              <span className="font-mono font-bold text-emerald-300 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                {chatGptStats.phoneMatches}/{chatGptStats.count} ({chatGptStats.phoneMatchRate}%)
              </span>
            </div>

            {chatGptStats.isSelected && (
              <div className="mt-2 text-center bg-emerald-500/20 text-emerald-200 text-[10px] font-bold py-0.5 rounded border border-emerald-500/40">
                ✓ ĐANG LỌC THEO MODEL NÀY
              </div>
            )}
          </div>

          {/* Model 2: Gemini 3.1 Flash-Lite */}
          <div
            onClick={() => handleCardClick(geminiStats.fullName)}
            className={`rounded-2xl p-4 transition-all cursor-pointer relative shadow-sm border ${
              geminiStats.isSelected
                ? 'bg-blue-950/90 border-2 border-blue-400 ring-2 ring-blue-500/30 shadow-blue-950/50 shadow-lg'
                : 'bg-slate-900/90 border-slate-800 hover:border-blue-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                  geminiStats.isSelected ? 'bg-blue-500 text-slate-950 border-blue-300 font-bold' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-300">{geminiStats.fullName}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{geminiStats.count} mẫu test</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-blue-300 bg-blue-950/90 border border-blue-700/80 px-2.5 py-1 rounded-lg font-mono block">
                  {geminiStats.avgAcc}% TB
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Khớp số điện thoại:</span>
              <span className="font-mono font-bold text-blue-300 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                {geminiStats.phoneMatches}/{geminiStats.count} ({geminiStats.phoneMatchRate}%)
              </span>
            </div>

            {geminiStats.isSelected && (
              <div className="mt-2 text-center bg-blue-500/20 text-blue-200 text-[10px] font-bold py-0.5 rounded border border-blue-500/40">
                ✓ ĐANG LỌC THEO MODEL NÀY
              </div>
            )}
          </div>

          {/* Model 3: vintern_python */}
          <div
            onClick={() => handleCardClick(vinternStats.fullName)}
            className={`rounded-2xl p-4 transition-all cursor-pointer relative shadow-sm border ${
              vinternStats.isSelected
                ? 'bg-purple-950/90 border-2 border-purple-400 ring-2 ring-purple-500/30 shadow-purple-950/50 shadow-lg'
                : 'bg-slate-900/90 border-slate-800 hover:border-purple-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                  vinternStats.isSelected ? 'bg-purple-500 text-slate-950 border-purple-300 font-bold' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}>
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-purple-300">{vinternStats.fullName}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{vinternStats.count} mẫu test</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-purple-300 bg-purple-950/90 border border-purple-700/80 px-2.5 py-1 rounded-lg font-mono block">
                  {vinternStats.avgAcc}% TB
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Khớp số điện thoại:</span>
              <span className="font-mono font-bold text-purple-300 flex items-center gap-1">
                {vinternStats.phoneMatches > 0 ? (
                  <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                )}
                {vinternStats.phoneMatches}/{vinternStats.count} ({vinternStats.phoneMatchRate}%)
              </span>
            </div>

            {vinternStats.isSelected && (
              <div className="mt-2 text-center bg-purple-500/20 text-purple-200 text-[10px] font-bold py-0.5 rounded border border-purple-500/40">
                ✓ ĐANG LỌC THEO MODEL NÀY
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
