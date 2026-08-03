import React from 'react';
import { Eye, ExternalLink, Copy, Check, Image as ImageIcon, Code2, Bot } from 'lucide-react';
import { OcrRecord } from '../types';

interface OcrGridViewProps {
  records: OcrRecord[];
  loading: boolean;
  onSelectImage: (record: OcrRecord) => void;
  onSelectRecord: (record: OcrRecord) => void;
}

export const OcrGridView: React.FC<OcrGridViewProps> = ({
  records,
  loading,
  onSelectImage,
  onSelectRecord,
}) => {
  const [copiedId, setCopiedId] = React.useState<number | string | null>(null);

  const handleCopyText = (text: string, id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getImageUrl = (record: OcrRecord): string | null => {
    return (
      record.image_url ||
      record.image_path ||
      record.image ||
      record.img_url ||
      record.photo_url ||
      null
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-pulse h-64 flex flex-col justify-between">
            <div className="w-full h-32 bg-slate-800 rounded-lg" />
            <div className="space-y-2 mt-3">
              <div className="h-4 bg-slate-800 rounded w-1/2" />
              <div className="h-3 bg-slate-800 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {records.map((row) => {
        const imgUrl = getImageUrl(row);
        const docType = row.document_type || row.type || 'Hồ sơ';
        const ocrText = row.ocr_text || row.text || row.raw_text || '';
        const confidence = typeof (row.confidence_score ?? row.confidence) === 'number'
          ? (row.confidence_score ?? row.confidence)!
          : 96.0;

        return (
          <div
            key={row.id}
            onClick={() => onSelectRecord(row)}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col justify-between group cursor-pointer"
          >
            {/* Image Container with overlay */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelectImage(row);
              }}
              className="relative h-44 bg-slate-950 overflow-hidden border-b border-slate-800 group/cardimg"
            >
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={row.file_name || `OCR image ${row.id}`}
                  className="w-full h-full object-cover group-hover/cardimg:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=60';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <ImageIcon className="w-10 h-10" />
                </div>
              )}

              {/* Top Badges */}
              <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1.5 max-w-[80%]">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/90 backdrop-blur-md text-blue-300 border border-slate-700/80 shadow">
                  #{row.id}
                </span>
                {row.model_used && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold backdrop-blur-md border shadow flex items-center gap-1 ${
                    row.model_used.includes('ChatGPT') || row.model_used.includes('GPT')
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800/80'
                      : row.model_used.includes('Gemini')
                      ? 'bg-blue-950/90 text-blue-300 border-blue-800/80'
                      : 'bg-purple-950/90 text-purple-300 border-purple-800/80'
                  }`}>
                    <Bot className="w-2.5 h-2.5" />
                    <span>{row.model_used}</span>
                  </span>
                )}
              </div>

              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/90 text-emerald-400 border border-emerald-800/80 shadow">
                  {(row.accuracy ?? confidence).toFixed(1)}%
                </span>
              </div>

              {/* Hover Lightbox Icon */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cardimg:opacity-100 flex items-center justify-center transition-opacity">
                <div className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem trước ảnh</span>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                {row.name && (
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-xs truncate">{row.name}</span>
                    {row.phone && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        {row.phone}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-slate-300 text-xs line-clamp-3 leading-relaxed font-sans bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 mb-3">
                  {ocrText ? ocrText : <span className="text-slate-500 italic">Chưa có thông tin nhận dạng</span>}
                </p>
              </div>

              {/* Footer info & Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleCopyText(ocrText, row.id, e)}
                    className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Sao chép văn bản OCR"
                  >
                    {copiedId === row.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {row.extracted_json && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRecord(row);
                      }}
                      className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors"
                      title="Xem dữ liệu JSON"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRecord(row);
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>Chi tiết</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};
