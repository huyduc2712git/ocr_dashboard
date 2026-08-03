import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, Copy, Check, FileText, Code2, Maximize2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'text' | 'json'>('text');

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

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = record.file_name || `ocr_image_${record.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-blue-600/20 text-blue-300 font-mono text-xs font-bold border border-blue-500/30">
              ID #{record.id}
            </span>
            <span className="text-sm font-semibold text-white">
              {record.document_type || record.type || 'Hồ sơ nhận dạng OCR'}
            </span>
            {record.file_name && (
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                ({record.file_name})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasPrev && (
              <button
                onClick={onPrev}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Bản ghi trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Bản ghi tiếp theo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            
            <div className="h-4 w-px bg-slate-800 mx-1" />

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body (2 Columns) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-950">
          
          {/* Left Column: Image Viewer with controls (7 cols) */}
          <div className="lg:col-span-7 relative flex flex-col items-center justify-center bg-slate-950/80 p-4 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden select-none">
            
            {/* Image display canvas */}
            <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
              <img
                src={imageUrl}
                alt={record.file_name || `OCR #${record.id}`}
                className="max-h-[68vh] object-contain transition-transform duration-200 shadow-2xl rounded-lg border border-slate-800"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60';
                }}
              />
            </div>

            {/* Bottom Floating Control Bar */}
            <div className="absolute bottom-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-full px-4 py-2 flex items-center gap-3 shadow-xl">
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              
              <span className="text-xs font-mono font-medium text-blue-400 min-w-[40px] text-center">
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={handleZoomIn}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="h-3 w-px bg-slate-700" />

              <button
                onClick={handleRotate}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                title="Xoay 90 độ"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetZoom}
                className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                title="Cặt lại kích thước"
              >
                Đặt lại
              </button>

              <div className="h-3 w-px bg-slate-700" />

              <button
                onClick={handleDownload}
                className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-full transition-colors"
                title="Tải ảnh gốc về máy"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Right Column: OCR Text & JSON Inspector (5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-slate-900 overflow-hidden">
            
            {/* Tabs Bar */}
            <div className="flex items-center justify-between bg-slate-950 px-4 py-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'text'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Văn bản OCR</span>
                </button>

                <button
                  onClick={() => setActiveTab('json')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeTab === 'json'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Dữ liệu JSON</span>
                </button>
              </div>

              {activeTab === 'text' ? (
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
              ) : (
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép JSON</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Tab Content Display */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-200">
              {activeTab === 'text' ? (
                <div className="space-y-4">
                  
                  {/* Confidence Badge */}
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-sans text-xs">Độ tự tin nhận dạng (Confidence)</span>
                    <span className="text-emerald-400 font-bold font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      {(record.confidence_score ?? record.confidence ?? 98.5).toFixed(1)}%
                    </span>
                  </div>

                  {/* OCR Raw Text Box */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 leading-relaxed font-sans text-slate-200 whitespace-pre-wrap selection:bg-blue-600 selection:text-white">
                    {ocrText ? ocrText : <span className="text-slate-500 italic">Không tìm thấy nội dung văn bản trong bản ghi này</span>}
                  </div>

                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
                  {formattedJson ? (
                    <pre className="text-amber-300 font-mono text-xs leading-relaxed">
                      {formattedJson}
                    </pre>
                  ) : (
                    <p className="text-slate-500 italic font-sans text-xs">Chưa có kết quả phân tích dữ liệu JSON cho tài liệu này</p>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
