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
import { getRecipientPhoneGT, getRecipientPhoneOCR } from './StatsCards';

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
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center my-6 shadow-lg">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3 animate-bounce" />
        <h3 className="text-base font-bold text-white">Không tìm thấy bản ghi OCR phù hợp</h3>
        <p className="text-xs text-slate-400 mt-1">Vui lòng chọn lại Model AI từ danh sách trên.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {records.map((record, index) => {
        const idKey = record.id;
        const modelName = record.model_used || 'General AI';
        
        // Extract phone numbers
        const gtPhone = getRecipientPhoneGT(record.ground_truth);
        const ocrPhone = getRecipientPhoneOCR(record);
        
        const hasPhones = Boolean(gtPhone || ocrPhone);
        const isPhoneMatch = Boolean(gtPhone && ocrPhone && gtPhone === ocrPhone);

        // Model badge styling
        const isChatGPT = modelName.includes('ChatGPT') || modelName.includes('GPT');
        const isGemini = modelName.includes('Gemini');
        const isVintern = modelName.includes('vintern');

        const modelBadgeStyle = isChatGPT
          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600/80'
          : isGemini
          ? 'bg-blue-950/90 text-blue-300 border-blue-600/80'
          : 'bg-purple-950/90 text-purple-300 border-purple-600/80';

        const cardBorderStyle = isChatGPT
          ? 'border-emerald-900/40 hover:border-emerald-600/60'
          : isGemini
          ? 'border-blue-900/40 hover:border-blue-600/60'
          : 'border-purple-900/40 hover:border-purple-600/60';

        const accuracyVal = record.accuracy ?? record.confidence_score;

        return (
          <div
            key={idKey}
            className={`bg-slate-900/90 border rounded-2xl overflow-hidden shadow-xl transition-all ${cardBorderStyle}`}
          >
            {/* Header Bar */}
            <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              
              {/* ID & Model */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 shadow-sm">
                  Mẫu #{record.id}
                </span>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold border ${modelBadgeStyle}`}>
                  <Bot className="w-3.5 h-3.5" />
                  <span>{modelName}</span>
                </span>

                {record.name && (
                  <span className="text-xs text-slate-400 truncate max-w-[200px] hidden lg:inline-block font-medium">
                    • {record.name}
                  </span>
                )}
              </div>

              {/* Metrics & Actions */}
              <div className="flex items-center gap-3">
                {accuracyVal !== undefined && accuracyVal !== null && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs font-mono font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Accuracy: {accuracyVal.toFixed(1)}%</span>
                  </div>
                )}

                {record.execution_time && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-300 text-xs font-mono border border-slate-700">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{record.execution_time.toFixed(2)}s</span>
                  </div>
                )}

                <button
                  onClick={() => onRecordClick(record)}
                  className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Chi Tiết JSON</span>
                </button>
              </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
              
              {/* Image Preview Box (3 Cols on Large Screens) */}
              <div className="lg:col-span-3 p-4 bg-slate-950/40 flex flex-col items-center justify-between">
                <div 
                  onClick={() => record.image_url && onImageClick(record.image_url, `Mẫu OCR #${record.id} (${modelName})`)}
                  className="relative group w-full h-52 bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 flex items-center justify-center cursor-pointer hover:border-blue-500/70 transition-all shadow-inner"
                >
                  {record.image_url ? (
                    <>
                      <img
                        src={record.image_url}
                        alt={`OCR ID ${record.id}`}
                        className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                          <ZoomIn className="w-4 h-4" />
                          <span>Xem Ảnh Phóng Tỏ</span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                      <span className="text-xs text-slate-500 font-medium">Chưa có ảnh xem trước</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 w-full text-center bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Image Record ID: #{record.image_id || record.id}</span>
                  {record.phone && (
                    <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 block">
                      SĐT Đơn: {record.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Ground Truth Box (4.5 Cols on Large Screens) */}
              <div className="lg:col-span-4 p-4 flex flex-col justify-between bg-slate-900/30">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-700/80 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Văn Bản Đúng (Ground Truth)
                    </span>

                    {record.ground_truth && (
                      <button
                        onClick={(e) => handleCopyText(record.ground_truth!, `gt_${idKey}`, e)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs cursor-pointer"
                        title="Sao chép văn bản Ground Truth"
                      >
                        {copiedId === `gt_${idKey}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-950 border border-emerald-900/40 rounded-xl p-3.5 text-xs text-slate-100 font-sans whitespace-pre-wrap leading-relaxed min-h-[160px] max-h-[320px] overflow-y-auto select-text font-medium shadow-inner">
                    {record.ground_truth ? (
                      record.ground_truth
                    ) : (
                      <span className="text-slate-500 italic">Không có văn bản đối soát (Ground Truth)</span>
                    )}
                  </div>
                </div>

                {gtPhone && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">SĐT trong Ground Truth:</span>
                    <span className="font-mono font-bold text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
                      {gtPhone}
                    </span>
                  </div>
                )}
              </div>

              {/* OCR Extracted Text Box (4.5 Cols on Large Screens) */}
              <div className="lg:col-span-5 p-4 flex flex-col justify-between bg-slate-900/60">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-extrabold text-blue-300 uppercase tracking-wide flex items-center gap-1.5 bg-blue-950/80 px-3 py-1 rounded-lg border border-blue-700/80 shadow-sm">
                      <Bot className="w-3.5 h-3.5 text-blue-400" />
                      Bản OCR Từ AI ({modelName})
                    </span>

                    {(record.raw_text || record.ocr_text) && (
                      <button
                        onClick={(e) => handleCopyText(record.raw_text || record.ocr_text!, `ocr_${idKey}`, e)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs cursor-pointer"
                        title="Sao chép văn bản OCR"
                      >
                        {copiedId === `ocr_${idKey}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-950 border border-blue-900/40 rounded-xl p-3.5 text-xs text-slate-100 font-sans whitespace-pre-wrap leading-relaxed min-h-[160px] max-h-[320px] overflow-y-auto select-text font-medium shadow-inner">
                    {record.raw_text || record.ocr_text ? (
                      record.raw_text || record.ocr_text
                    ) : (
                      <span className="text-slate-500 italic">Chưa nhận dạng được văn bản từ AI</span>
                    )}
                  </div>
                </div>

                {ocrPhone && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">SĐT trong Bản OCR:</span>
                    <span className="font-mono font-bold text-blue-300 bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-800">
                      {ocrPhone}
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Phone Match Comparison Bar */}
            <div className="border-t border-slate-800 px-5 py-3 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Đối So Sánh Số Điện Thoại:
                </span>
              </div>

              {hasPhones ? (
                isPhoneMatch ? (
                  /* MATCH */
                  <div className="flex items-center gap-2.5 bg-emerald-950/90 border-2 border-emerald-500 px-4 py-1.5 rounded-xl shadow-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wide">
                      KHỚP SĐT CHÍNH XÁC
                    </span>
                    <span className="text-xs font-mono font-extrabold text-emerald-200 bg-emerald-900/90 px-2.5 py-0.5 rounded-md border border-emerald-600">
                      {gtPhone}
                    </span>
                  </div>
                ) : (
                  /* MISMATCH */
                  <div className="flex flex-wrap items-center gap-2.5 bg-rose-950/90 border-2 border-rose-500 px-4 py-1.5 rounded-xl shadow-lg">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-extrabold text-rose-300 uppercase tracking-wide">
                      LỆCH SỐ ĐIỆN THOẠI
                    </span>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold">
                      <span className="text-emerald-300 bg-slate-900 px-2.5 py-0.5 rounded border border-emerald-600" title="Ground Truth Phone">
                        GT: {gtPhone || 'N/A'}
                      </span>
                      <span className="text-rose-400 font-extrabold">≠</span>
                      <span className="text-rose-300 bg-slate-900 px-2.5 py-0.5 rounded border border-rose-600" title="OCR Extracted Phone">
                        OCR: {ocrPhone || 'N/A'}
                      </span>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-xs text-slate-500 italic bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                  Không phát hiện SĐT trong mẫu này
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};
