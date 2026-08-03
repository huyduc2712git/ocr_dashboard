import React, { useState } from 'react';
import { X, Copy, Check, FileText, Code2, Calendar, HardDrive, Shield, Sparkles, Image as ImageIcon, Database } from 'lucide-react';
import { OcrRecord } from '../types';

interface DetailModalProps {
  record: OcrRecord | null;
  onClose: () => void;
  onOpenImage: (record: OcrRecord) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ record, onClose, onOpenImage }) => {
  if (!record) return null;

  const [copiedText, setCopiedText] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const getImageUrl = (r: OcrRecord): string => {
    return (
      r.image_url ||
      r.image_path ||
      r.image ||
      r.img_url ||
      r.photo_url ||
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
    );
  };

  const imgUrl = getImageUrl(record);
  const ocrText = record.ocr_text || record.text || record.raw_text || '';

  let formattedJson = '';
  if (record.extracted_json) {
    if (typeof record.extracted_json === 'string') {
      try {
        formattedJson = JSON.stringify(JSON.parse(record.extracted_json), null, 2);
      } catch {
        formattedJson = record.extracted_json;
      }
    } else {
      formattedJson = JSON.stringify(record.extracted_json, null, 2);
    }
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(ocrText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Chi Tiết Bản Ghi OCR</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/50">
                  #{record.id}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Thẻ lưu trữ thông tin nhận dạng dữ liệu hình ảnh</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Image Preview Box */}
            <div className="md:col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-between gap-3">
              <div
                onClick={() => onOpenImage(record)}
                className="w-full h-40 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 relative group cursor-pointer"
              >
                <img
                  src={imgUrl}
                  alt={record.file_name || 'OCR Detail'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold">
                  <span>Phóng to ảnh</span>
                </div>
              </div>

              <button
                onClick={() => onOpenImage(record)}
                className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Xem Trước Ảnh Chi Tiết</span>
              </button>
            </div>

            {/* Metadata Fields */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs">
              <div>
                <span className="text-slate-500 text-[11px]">Mô Hình AI (Model)</span>
                <p className="text-blue-400 font-semibold mt-0.5">{record.model_used || record.document_type || 'Gemini OCR'}</p>
              </div>

              <div>
                <span className="text-slate-500 text-[11px]">Độ Chính Xác (Accuracy)</span>
                <p className="text-emerald-400 font-mono font-bold mt-0.5">
                  {record.accuracy !== undefined && record.accuracy !== null ? `${record.accuracy.toFixed(1)}%` : `${(record.confidence_score ?? 98.0).toFixed(1)}%`}
                </p>
              </div>

              <div>
                <span className="text-slate-500 text-[11px]">Thời Gian Xử Lý</span>
                <p className="text-amber-300 font-mono font-bold mt-0.5">
                  {record.execution_time ? `${record.execution_time.toFixed(2)} giây` : 'N/A'}
                </p>
              </div>

              {record.name && (
                <div>
                  <span className="text-slate-500 text-[11px]">Tên Khách Hàng</span>
                  <p className="text-white font-bold mt-0.5">{record.name}</p>
                </div>
              )}

              {record.phone && (
                <div>
                  <span className="text-slate-500 text-[11px]">Số Điện Thoại</span>
                  <p className="text-emerald-300 font-mono font-bold mt-0.5">{record.phone}</p>
                </div>
              )}

              {record.address && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-500 text-[11px]">Địa Chỉ Giao Hàng</span>
                  <p className="text-slate-200 mt-0.5">{record.address}</p>
                </div>
              )}

              {record.products && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-500 text-[11px]">Sản Phẩm Trích Xuất</span>
                  <p className="text-amber-200 font-mono text-[11px] mt-0.5 bg-slate-900 p-2 rounded border border-slate-800">
                    {typeof record.products === 'string' ? record.products : JSON.stringify(record.products)}
                  </p>
                </div>
              )}

              <div>
                <span className="text-slate-500 text-[11px]">Tên Tập Tin / Image ID</span>
                <p className="text-slate-300 font-mono truncate mt-0.5">{record.file_name || `image_${record.image_id || record.id}.jpg`}</p>
              </div>

              <div>
                <span className="text-slate-500 text-[11px]">Thời Gian Nhận Dạng</span>
                <p className="text-slate-300 font-mono mt-0.5">
                  {record.created_at ? new Date(record.created_at).toLocaleString('vi-VN') : 'N/A'}
                </p>
              </div>
            </div>

          </div>

          {/* OCR Extracted Text Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Nội Dung Văn Bản Nhận Dạng (OCR Text)</span>
              </h3>
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
              {ocrText || <span className="text-slate-500 italic">Không có văn bản</span>}
            </div>
          </div>

          {/* Extracted JSON Block */}
          {formattedJson && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-amber-400" />
                  <span>Dữ Liệu Trích Xuất JSON (Extracted JSON)</span>
                </h3>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép JSON</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép JSON</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
                <pre>{formattedJson}</pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-5 py-3 flex items-center justify-between text-xs text-slate-400">
          <span>Database Table: <strong className="text-slate-200">image_ocr</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
