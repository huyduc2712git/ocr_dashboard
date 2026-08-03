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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Chi Tiết Bản Ghi OCR</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  #{record.id}
                </span>
              </h2>
              <p className="text-xs text-slate-500">Thẻ lưu trữ thông tin nhận dạng dữ liệu hình ảnh</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Image Preview Box */}
            <div className="md:col-span-1 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-between gap-3">
              <div
                onClick={() => onOpenImage(record)}
                className="w-full h-40 rounded-lg overflow-hidden border border-slate-300 bg-slate-100 relative group cursor-pointer"
              >
                <img
                  src={imgUrl}
                  alt={record.file_name || 'OCR Detail'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold">
                  <span>Phóng to ảnh</span>
                </div>
              </div>

              <button
                onClick={() => onOpenImage(record)}
                className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Xem Trước Ảnh Chi Tiết</span>
              </button>
            </div>

            {/* Metadata Fields */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
              <div>
                <span className="text-slate-500 text-[11px]">Mô Hình AI (Model)</span>
                <p className="text-blue-700 font-bold mt-0.5">{record.model_used || record.document_type || 'Gemini OCR'}</p>
              </div>

              <div>
                <span className="text-slate-500 text-[11px]">Độ Chính Xác (Accuracy)</span>
                <p className="text-emerald-700 font-mono font-bold mt-0.5">
                  {record.accuracy !== undefined && record.accuracy !== null ? `${record.accuracy.toFixed(1)}%` : `${(record.confidence_score ?? 98.0).toFixed(1)}%`}
                </p>
              </div>

              <div>
                <span className="text-slate-500 text-[11px]">Thời Gian Xử Lý</span>
                <p className="text-amber-700 font-mono font-bold mt-0.5">
                  {record.execution_time ? `${record.execution_time.toFixed(2)} giây` : 'N/A'}
                </p>
              </div>

              {record.name && (
                <div>
                  <span className="text-slate-500 text-[11px]">Tên Khách Hàng</span>
                  <p className="text-slate-900 font-bold mt-0.5">{record.name}</p>
                </div>
              )}

              {record.phone && (
                <div>
                  <span className="text-slate-500 text-[11px]">Số Điện Thoại</span>
                  <p className="text-emerald-700 font-mono font-bold mt-0.5">{record.phone}</p>
                </div>
              )}

              {record.address && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-500 text-[11px]">Địa Chỉ Giao Hàng</span>
                  <p className="text-slate-800 font-medium mt-0.5">{record.address}</p>
                </div>
              )}

              {record.products && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-500 text-[11px]">Sản Phẩm Trích Xuất</span>
                  <p className="text-slate-800 font-mono text-[11px] mt-0.5 bg-white p-2 rounded border border-slate-200">
                    {typeof record.products === 'string' ? record.products : JSON.stringify(record.products)}
                  </p>
                </div>
              )}

              <div>
                <span className="text-slate-500 text-[11px]">Tên Tập Tin / Image ID</span>
                <p className="text-slate-700 font-mono truncate mt-0.5">{record.file_name || `image_${record.image_id || record.id}.jpg`}</p>
              </div>

              <div>
                <span className="text-slate-500 text-[11px]">Thời Gian Nhận Dạng</span>
                <p className="text-slate-700 font-mono mt-0.5">
                  {record.created_at ? new Date(record.created_at).toLocaleString('vi-VN') : 'N/A'}
                </p>
              </div>
            </div>

          </div>

          {/* OCR Extracted Text Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Nội Dung Văn Bản Nhận Dạng (OCR Text)</span>
              </h3>
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer shadow-xs"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap font-medium">
              {ocrText || <span className="text-slate-400 italic">Không có văn bản</span>}
            </div>
          </div>

          {/* Extracted JSON Block */}
          {formattedJson && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-amber-600" />
                  <span>Dữ Liệu Trích Xuất JSON (Extracted JSON)</span>
                </h3>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer shadow-xs"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Đã chép JSON</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép JSON</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto shadow-inner">
                <pre>{formattedJson}</pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Database Table: <strong className="text-slate-800">image_ocr</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
