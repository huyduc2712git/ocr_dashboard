import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { OcrRecord } from '../types';

interface ImageModalProps {
  record: OcrRecord | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  record,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}) => {
  if (!record) return null;

  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  const getImageUrl = (r: OcrRecord): string => {
    return (
      r.image_url ||
      r.image_path ||
      r.image ||
      r.img_url ||
      r.photo_url ||
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1000&auto=format&fit=crop&q=80'
    );
  };

  const imageUrl = getImageUrl(record);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = record.file_name || `ocr_image_${record.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
              ID #{record.id}
            </span>
            <span className="text-sm font-bold text-slate-900">
              {record.model_used || record.document_type || record.type || 'Ảnh Nhận Dạng OCR'}
            </span>
            {record.file_name && (
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                ({record.file_name})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasPrev && (
              <button
                onClick={onPrev}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer border border-slate-300 shadow-xs"
                title="Bản ghi trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer border border-slate-300 shadow-xs"
                title="Bản ghi tiếp theo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            
            <div className="h-4 w-px bg-slate-300 mx-1" />

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Full Image Viewer Canvas */}
        <div className="flex-1 relative flex flex-col items-center justify-center bg-slate-100/80 p-4 overflow-hidden select-none">
          
          <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
            <img
              src={imageUrl}
              alt={record.file_name || `OCR #${record.id}`}
              className="max-h-[78vh] object-contain transition-transform duration-200 shadow-xl rounded-xl border border-slate-300"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60';
              }}
            />
          </div>

          {/* Floating Control Bar */}
          <div className="absolute bottom-5 bg-white/95 backdrop-blur-md border border-slate-300 rounded-full px-4 py-2 flex items-center gap-3 shadow-xl">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-xs font-mono font-bold text-blue-700 min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="h-3 w-px bg-slate-300" />

            <button
              onClick={handleRotate}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Xoay 90 độ"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetZoom}
              className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Đặt lại kích thước"
            >
              Đặt lại
            </button>

            <div className="h-3 w-px bg-slate-300" />

            <button
              onClick={handleDownload}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer"
              title="Tải ảnh gốc về máy"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
