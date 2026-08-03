import React, { useState } from 'react';
import { 
  Bot, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  Phone, 
  FileText,
  AlertTriangle,
  ZoomIn
} from 'lucide-react';
import { OcrRecord } from '../types';
import { getRecipientPhoneGT, getRecipientPhoneOCR, normalizePhoneNumber } from './StatsCards';

interface OcrCompareViewProps {
  records: OcrRecord[];
  onRecordClick: (record: OcrRecord) => void;
  onImageClick: (imageUrl: string, title: string) => void;
}

export const OcrCompareView: React.FC<OcrCompareViewProps> = ({
  records,
  onRecordClick,
  onImageClick,
}) => {
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const handleCopyText = (text: string, idKey: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (records.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center my-6 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-bounce" />
        <h3 className="text-base font-bold text-slate-900">Không tìm thấy bản ghi OCR phù hợp</h3>
        <p className="text-xs text-slate-500 mt-1">Vui lòng chọn lại Model AI từ danh sách trên.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {records.map((record, index) => {
        const idKey = record.id;
        const modelName = record.model_used || 'General AI';
        
        // Extract phone numbers
        const gtPhone = getRecipientPhoneGT(record);
        const ocrPhone = getRecipientPhoneOCR(record);
        
        const hasPhones = Boolean(gtPhone || ocrPhone);
        const isPhoneMatch = Boolean(gtPhone && ocrPhone && normalizePhoneNumber(gtPhone) === normalizePhoneNumber(ocrPhone));

        // Model badge styling
        const isChatGPT = modelName.includes('ChatGPT') || modelName.includes('GPT');
        const isGemini = modelName.includes('Gemini');
        const isVintern = modelName.includes('vintern');

        const modelBadgeStyle = isChatGPT
          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
          : isGemini
          ? 'bg-blue-50 text-blue-800 border-blue-300'
          : 'bg-purple-50 text-purple-800 border-purple-300';

        const cardBorderStyle = isChatGPT
          ? 'border-emerald-200 hover:border-emerald-400'
          : isGemini
          ? 'border-blue-200 hover:border-blue-400'
          : 'border-purple-200 hover:border-purple-400';

        const accuracyVal = record.accuracy ?? record.confidence_score;

        return (
          <div
            key={idKey}
            className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${cardBorderStyle}`}
          >
            {/* Header Bar */}
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              
              {/* ID & Model */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 shadow-xs">
                  Mẫu #{record.id}
                </span>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold border ${modelBadgeStyle}`}>
                  <Bot className="w-3.5 h-3.5" />
                  <span>{modelName}</span>
                </span>

                {record.name && (
                  <span className="text-xs text-slate-500 truncate max-w-[200px] hidden lg:inline-block font-medium">
                    • {record.name}
                  </span>
                )}
              </div>

              {/* Metrics & Actions */}
              <div className="flex items-center gap-3">
                {accuracyVal !== undefined && accuracyVal !== null && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Accuracy: {accuracyVal.toFixed(1)}%</span>
                  </div>
                )}

                {record.execution_time && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono border border-slate-300 font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{record.execution_time.toFixed(2)}s</span>
                  </div>
                )}

                <button
                  onClick={() => onRecordClick(record)}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span>Chi Tiết JSON</span>
                </button>
              </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              
              {/* Image Preview Box (3 Cols on Large Screens) */}
              <div className="lg:col-span-3 p-4 bg-slate-50 flex flex-col items-center justify-between">
                <div 
                  onClick={() => record.image_url && onImageClick(record.image_url, `Mẫu OCR #${record.id} (${modelName})`)}
                  className="relative group w-full h-52 bg-slate-100 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all shadow-inner"
                >
                  {record.image_url ? (
                    <>
                      <img
                        src={record.image_url}
                        alt={`OCR ID ${record.id}`}
                        className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                          <ZoomIn className="w-4 h-4" />
                          <span>Xem Ảnh Phóng Tỏ</span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                      <span className="text-xs text-slate-500 font-medium">Chưa có ảnh xem trước</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 w-full text-center bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block font-medium">Image Record ID: #{record.image_id || record.id}</span>
                  {record.phone && (
                    <span className="text-xs font-mono font-bold text-emerald-700 mt-0.5 block">
                      SĐT Đơn: {record.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Ground Truth Box (4.5 Cols on Large Screens) */}
              <div className="lg:col-span-4 p-3 flex flex-col justify-between bg-emerald-50/40">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300 shadow-xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Văn Bản Đúng (Ground Truth)
                    </span>

                    {record.ground_truth && (
                      <button
                        onClick={(e) => handleCopyText(record.ground_truth!, `gt_${idKey}`, e)}
                        className="px-2 py-0.5 bg-white hover:bg-slate-100 rounded border border-emerald-300 text-slate-700 transition-colors flex items-center gap-1 text-[10px] cursor-pointer shadow-xs font-bold"
                        title="Sao chép văn bản Ground Truth"
                      >
                        {copiedId === `gt_${idKey}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="bg-white border border-emerald-200 rounded-lg p-2.5 text-[11px] text-slate-800 font-sans whitespace-pre-wrap leading-relaxed min-h-[90px] max-h-[170px] overflow-y-auto select-text font-medium shadow-xs">
                    {record.ground_truth ? (
                      record.ground_truth
                    ) : (
                      <span className="text-slate-400 italic">Không có văn bản đối soát (Ground Truth)</span>
                    )}
                  </div>
                </div>

                {gtPhone && (
                  <div className="mt-2 pt-2 border-t border-emerald-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">SĐT trong Ground Truth:</span>
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                      {gtPhone}
                    </span>
                  </div>
                )}
              </div>

              {/* OCR Extracted Text Box (4.5 Cols on Large Screens) */}
              <div className="lg:col-span-5 p-3 flex flex-col justify-between bg-blue-50/40">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wide flex items-center gap-1.5 bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-300 shadow-xs">
                      <Bot className="w-3 h-3 text-blue-600" />
                      Bản OCR Từ AI ({modelName})
                    </span>

                    {(record.raw_text || record.ocr_text) && (
                      <button
                        onClick={(e) => handleCopyText(record.raw_text || record.ocr_text!, `ocr_${idKey}`, e)}
                        className="px-2 py-0.5 bg-white hover:bg-slate-100 rounded border border-blue-300 text-slate-700 transition-colors flex items-center gap-1 text-[10px] cursor-pointer shadow-xs font-bold"
                        title="Sao chép văn bản OCR"
                      >
                        {copiedId === `ocr_${idKey}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="bg-white border border-blue-200 rounded-lg p-2.5 text-[11px] text-slate-800 font-sans whitespace-pre-wrap leading-relaxed min-h-[90px] max-h-[170px] overflow-y-auto select-text font-medium shadow-xs">
                    {record.raw_text || record.ocr_text ? (
                      record.raw_text || record.ocr_text
                    ) : (
                      <span className="text-slate-400 italic">Chưa nhận dạng được văn bản từ AI</span>
                    )}
                  </div>
                </div>

                {ocrPhone && (
                  <div className="mt-2 pt-2 border-t border-blue-200 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">SĐT trong Bản OCR:</span>
                    <span className="font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                      {ocrPhone}
                    </span>
                  </div>
                )}
              </div>

            </div>


          </div>
        );
      })}
    </div>
  );
};
