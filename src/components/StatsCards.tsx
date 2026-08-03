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

// Normalize phone number for standard comparison (e.g. 84912345678 -> 0912345678)
export function normalizePhoneNumber(phoneStr?: string): string {
  if (!phoneStr) return '';
  let digits = extractDigits(phoneStr);
  if (digits.startsWith('84') && digits.length === 11) {
    digits = '0' + digits.slice(2);
  }
  return digits;
}

// Helper to extract a valid phone number pattern from text block (prioritizes recipient phone)
export function extractPhonePattern(text?: string): string {
  if (!text) return '';

  // 1. Try extracting phone from RECIPIENT section first (after "NGƯỜI NHẬN", "KHÁCH HÀNG", "RECIPIENT", etc.)
  const recipientMatch = text.match(/(?:người\s*nhận|nguoi\s*nhan|khách\s*hàng|khach\s*hang|recipient|consignee|to:)([\s\S]*)/i);
  const targetText = recipientMatch ? recipientMatch[1] : text;

  // Helper to extract all valid phone patterns from a text block
  const findAllPhones = (t: string): string[] => {
    const phones: string[] = [];
    const lines = t.split('\n');
    for (const line of lines) {
      if (/đIỆN THOẠI|điện thoại|sđt|sdt|đt|phone|tel|mobile/i.test(line)) {
        const matches = line.match(/(?:\+?84|84|0)[\s\.\-]?[35789](?:[\s\.\-]?\d){8}/g)
          || line.match(/(?:\+?84|84|0)[\s\.\-]?\d{2,3}[\s\.\-]?\d{3}[\s\.\-]?\d{3,4}/g);
        if (matches) {
          for (const m of matches) {
            const norm = normalizePhoneNumber(m);
            if (norm.length >= 9 && norm.length <= 11) phones.push(norm);
          }
        } else {
          const lineDigits = extractDigits(line);
          if (lineDigits.length >= 9 && lineDigits.length <= 11) {
            phones.push(normalizePhoneNumber(lineDigits));
          }
        }
      }
    }

    if (phones.length === 0) {
      const matches = t.match(/(?:\+?84|84|0)[\s\.\-]?[35789](?:[\s\.\-]?\d){8}/g);
      if (matches) {
        for (const m of matches) {
          const norm = normalizePhoneNumber(m);
          if (norm.length >= 9 && norm.length <= 11) phones.push(norm);
        }
      }
    }

    if (phones.length === 0) {
      const standalone = t.match(/\b(?:\+?84|84|0)?[35789]\d{8}\b/g)
        || t.match(/\b(?:\+?84|84|0)?\d{9,11}\b/g);
      if (standalone) {
        for (const s of standalone) {
          const norm = normalizePhoneNumber(s);
          if (norm.length >= 9 && norm.length <= 11) phones.push(norm);
        }
      }
    }
    return phones;
  };

  const recipientPhones = findAllPhones(targetText);
  if (recipientPhones.length > 0) {
    return recipientPhones[0];
  }

  // Fallback: search whole text. If multiple phone numbers found (Sender vs Recipient),
  // Recipient phone is listed last (bottom of invoice).
  const allPhones = findAllPhones(text);
  if (allPhones.length > 0) {
    return allPhones[allPhones.length - 1]; // Return last phone match (recipient phone)
  }

  return '';
}

// Component to render digit-by-digit color-coded phone comparison (green for match, red for mismatch)
export const ComparePhoneDigits: React.FC<{ ocrPhone?: string; gtPhone?: string }> = ({ ocrPhone, gtPhone }) => {
  if (!ocrPhone) return <span className="text-slate-400 italic font-sans text-xs">Chưa đọc được</span>;
  if (!gtPhone) return <span className="font-mono text-slate-700 text-xs">{ocrPhone}</span>;

  const ocrChars = ocrPhone.split('');
  const gtDigits = extractDigits(gtPhone);
  let gtDigitIdx = 0;

  return (
    <span className="font-mono text-xs font-bold tracking-tight inline-flex flex-wrap items-center gap-[0.5px]">
      {ocrChars.map((char, index) => {
        if (/\D/.test(char)) {
          return <span key={index} className="text-slate-400">{char}</span>;
        }

        const isMatch = gtDigitIdx < gtDigits.length && char === gtDigits[gtDigitIdx];
        gtDigitIdx++;

        if (isMatch) {
          return (
            <span key={index} className="text-emerald-700 font-extrabold">
              {char}
            </span>
          );
        } else {
          return (
            <span key={index} className="text-rose-600 font-extrabold bg-rose-100 px-[2px] rounded border border-rose-200">
              {char}
            </span>
          );
        }
      })}
    </span>
  );
};

// Extract recipient phone from Ground Truth (DB phone field or Ground Truth text block)
export function getRecipientPhoneGT(r: OcrRecord | string | undefined): string {
  if (!r) return '';
  if (typeof r === 'string') {
    return extractPhonePattern(r);
  }
  // 1. Prioritize Ground Truth text block extraction
  const gtTextPhone = extractPhonePattern(r.ground_truth);
  if (gtTextPhone) {
    return gtTextPhone;
  }
  // 2. Fallback to explicit DB phone field if ground_truth text has no phone
  if (r.phone) {
    const norm = normalizePhoneNumber(r.phone);
    if (norm.length >= 9 && norm.length <= 11) return norm;
  }
  return '';
}

// Extract recipient phone from AI OCR output (raw_text / ocr_text / json_result)
export function getRecipientPhoneOCR(r: OcrRecord): string {
  // 1. Check AI JSON output if available
  if (r.extracted_json || r.json_result) {
    try {
      const jsonObj = typeof r.extracted_json === 'string'
        ? JSON.parse(r.extracted_json)
        : (r.extracted_json || (typeof r.json_result === 'string' ? JSON.parse(r.json_result) : r.json_result));
      if (jsonObj && typeof jsonObj === 'object') {
        const jsonPhone = jsonObj.phone || jsonObj.sdt || jsonObj.dien_thoai || jsonObj.recipient_phone;
        if (jsonPhone) {
          const norm = normalizePhoneNumber(String(jsonPhone));
          if (norm.length >= 9 && norm.length <= 11) return norm;
        }
      }
    } catch {
      // ignore json parse error
    }
  }

  // 2. Extract phone pattern from AI's raw OCR text output
  const text = r.raw_text || r.ocr_text || '';
  return extractPhonePattern(text);
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

    // Phone match count & records with GT phone number
    let phoneMatches = 0;
    let phoneRecordsCount = 0;
    modelRecords.forEach((r) => {
      const gt = getRecipientPhoneGT(r);
      if (gt) {
        phoneRecordsCount++;
        const ocr = getRecipientPhoneOCR(r);
        if (ocr && normalizePhoneNumber(gt) === normalizePhoneNumber(ocr)) phoneMatches++;
      }
    });

    const phoneMatchRate = phoneRecordsCount > 0
      ? Math.round((phoneMatches / phoneRecordsCount) * 100)
      : 0;

    const isSelected = modelFilter === fullName;

    return {
      fullName,
      count: modelRecords.length,
      avgAcc,
      phoneMatches,
      phoneRecordsCount,
      phoneMatchRate,
      isSelected,
    };
  };

  const chatGptStats = getModelStats('ChatGPT GPT 5.4 Nano', 'ChatGPT');
  const geminiStats = getModelStats('Gemini 3.1 Flash-Lite', 'Gemini');
  const vinternStats = getModelStats('vintern_python', 'vintern');

  // Overall Phone Match Rate
  let totalPhoneMatches = 0;
  let totalPhoneRecordsCount = 0;
  records.forEach((r) => {
    const gt = getRecipientPhoneGT(r);
    if (gt) {
      totalPhoneRecordsCount++;
      const ocr = getRecipientPhoneOCR(r);
      if (ocr && normalizePhoneNumber(gt) === normalizePhoneNumber(ocr)) totalPhoneMatches++;
    }
  });
  const overallPhoneMatchRate = totalPhoneRecordsCount > 0
    ? Math.round((totalPhoneMatches / totalPhoneRecordsCount) * 100)
    : 0;

  const handleCardClick = (modelName: string) => {
    if (modelFilter === modelName) {
      onModelChange(''); // toggle off
    } else {
      onModelChange(modelName);
    }
  };

  return (
    <div className="mb-3.5 space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 text-xs">
        
        {/* Total Benchmark Records (3 Cols) */}
        <div 
          onClick={() => onModelChange('')}
          className={`col-span-12 md:col-span-3 border rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-all cursor-pointer shadow-sm ${
            !modelFilter 
              ? 'bg-white border-blue-500 ring-2 ring-blue-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">TỔNG BẢN GHI</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-extrabold text-slate-900 font-mono">{loading ? '...' : totalRecords}</span>
                <span className="text-[11px] text-blue-600 font-mono font-bold">Full 70</span>
              </div>
            </div>
          </div>
          {!modelFilter && (
            <span className="text-[11px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-md">Tất cả</span>
          )}
        </div>

        {/* Overall Accuracy Mini Card (4 Cols) */}
        <div className="col-span-12 md:col-span-4 bg-gradient-to-r from-emerald-50 via-white to-white border border-emerald-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> ACCURACY TB
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-lg font-extrabold text-emerald-800 font-mono">{loading ? '...' : `${overallAvgAccuracy}%`}</span>
                <span className="text-[11px] text-emerald-700 font-mono font-bold">SĐT: {totalPhoneMatches}/{totalPhoneRecordsCount} ({overallPhoneMatchRate}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Models Mini Pills Selector (5 Cols) */}
        <div className="col-span-12 md:col-span-5 bg-white border border-slate-200 rounded-xl p-1.5 flex items-center justify-between gap-2 shadow-sm">
          {/* ChatGPT Pill */}
          <button
            onClick={() => handleCardClick(chatGptStats.fullName)}
            className={`flex-1 px-2.5 py-1.5 rounded-lg text-left transition-all border flex flex-col justify-between cursor-pointer ${
              chatGptStats.isSelected
                ? 'bg-emerald-100/90 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold truncate text-emerald-900">ChatGPT</span>
              <span className="text-xs font-mono font-extrabold text-emerald-700">{chatGptStats.avgAcc}%</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>{chatGptStats.count} mẫu</span>
              <span>SĐT {chatGptStats.phoneMatches}/{chatGptStats.phoneRecordsCount}</span>
            </div>
          </button>

          {/* Gemini Pill */}
          <button
            onClick={() => handleCardClick(geminiStats.fullName)}
            className={`flex-1 px-2.5 py-1.5 rounded-lg text-left transition-all border flex flex-col justify-between cursor-pointer ${
              geminiStats.isSelected
                ? 'bg-blue-100/90 border-blue-500 ring-2 ring-blue-500/30 text-blue-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold truncate text-blue-900">Gemini</span>
              <span className="text-xs font-mono font-extrabold text-blue-700">{geminiStats.avgAcc}%</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>{geminiStats.count} mẫu</span>
              <span>SĐT {geminiStats.phoneMatches}/{geminiStats.phoneRecordsCount}</span>
            </div>
          </button>

          {/* Vintern Pill */}
          <button
            onClick={() => handleCardClick(vinternStats.fullName)}
            className={`flex-1 px-2.5 py-1.5 rounded-lg text-left transition-all border flex flex-col justify-between cursor-pointer ${
              vinternStats.isSelected
                ? 'bg-purple-100/90 border-purple-500 ring-2 ring-purple-500/30 text-purple-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold truncate text-purple-900">Vintern</span>
              <span className="text-xs font-mono font-extrabold text-purple-700">{vinternStats.avgAcc}%</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>{vinternStats.count} mẫu</span>
              <span>SĐT {vinternStats.phoneMatches}/{vinternStats.phoneRecordsCount}</span>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
