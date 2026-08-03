import React from 'react';
import { Eye, Image as ImageIcon, Copy, FileText, Check, ExternalLink, Code2, AlertTriangle, ArrowUpDown, Bot, Sparkles } from 'lucide-react';
import { OcrRecord, ColumnDef } from '../types';

interface OcrTableViewProps {
  records: OcrRecord[];
  columns: ColumnDef[];
  loading: boolean;
  onSelectImage: (record: OcrRecord) => void;
  onSelectRecord: (record: OcrRecord) => void;
  selectedRecordId?: number | string | null;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  selectedIds: (number | string)[];
  onToggleSelectRecord: (id: number | string) => void;
  onToggleSelectAll: () => void;
}

export const OcrTableView: React.FC<OcrTableViewProps> = ({
  records,
  columns,
  loading,
  onSelectImage,
  onSelectRecord,
  selectedRecordId,
  sortField,
  sortOrder,
  onSort,
  selectedIds,
  onToggleSelectRecord,
  onToggleSelectAll,
}) => {
  const [copiedId, setCopiedId] = React.useState<number | string | null>(null);

  const handleCopyText = (text: string, id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Resolve Image URL from various possible column names
  const getImageUrl = (record: OcrRecord): string | null => {
    return (
      record.image_url ||
      record.image_path ||
      record.image ||
      record.img_url ||
      record.photo_url ||
      record.src ||
      null
    );
  };

  // Helper for status badge styling
  const getStatusBadge = (status?: string) => {
    const s = (status || 'SUCCESS').toString().toUpperCase();
    if (s === 'SUCCESS' || s === '1' || s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          SUCCESS
        </span>
      );
    }
    if (s === 'PENDING' || s === '0' || s === 'PROCESSING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          PENDING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        {s}
      </span>
    );
  };

  // Confidence progress bar styling
  const renderConfidenceBar = (score?: number) => {
    const confidence = typeof score === 'number' ? score : 95.0;
    let colorClass = 'bg-emerald-500';
    let textClass = 'text-emerald-400';

    if (confidence < 70) {
      colorClass = 'bg-rose-500';
      textClass = 'text-rose-400';
    } else if (confidence < 88) {
      colorClass = 'bg-amber-500';
      textClass = 'text-amber-400';
    }

    return (
      <div className="w-28 flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className={`font-semibold ${textClass}`}>{confidence.toFixed(1)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${colorClass} transition-all duration-300`}
            style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
          />
        </div>
      </div>
    );
  };

  const isAllSelected = records.length > 0 && selectedIds.length === records.length;

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <div className="inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-300">Đang tải dữ liệu OCR từ CSDL MySQL...</p>
        <p className="text-xs text-slate-500 mt-1">Đang truy vấn bảng image_ocr</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3 opacity-80" />
        <h3 className="text-base font-semibold text-slate-200">Không tìm thấy bản ghi OCR phù hợp</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc loại văn bản / trạng thái.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              
              {/* Checkbox */}
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                />
              </th>

              {/* ID & Type */}
              <th
                onClick={() => onSort('id')}
                className="p-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              {/* AI Model Used */}
              <th
                onClick={() => onSort('model_used')}
                className="p-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1 text-purple-300">
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span>Model AI</span>
                  <ArrowUpDown className="w-3 h-3 text-purple-400/60" />
                </div>
              </th>

              {/* Image Preview Thumbnail */}
              <th className="p-3 text-center">
                <span>Xem Trước Ảnh</span>
              </th>

              {/* Customer & OCR Extracted Text */}
              <th className="p-3 min-w-[240px]">
                <span>Khách Hàng &amp; Kết Quả OCR</span>
              </th>

              {/* Accuracy / Confidence Score */}
              <th
                onClick={() => onSort('accuracy')}
                className="p-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Độ Chính Xác</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              {/* Status */}
              <th
                onClick={() => onSort('status')}
                className="p-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Trạng Thái</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              {/* JSON Result */}
              <th className="p-3 text-center">
                <span>Dữ Liệu JSON</span>
              </th>

              {/* Date */}
              <th
                onClick={() => onSort('created_at')}
                className="p-3 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Thời Gian</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              {/* Actions */}
              <th className="p-3 text-right">
                <span>Thao Tác</span>
              </th>

            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 text-xs">
            {records.map((row) => {
              const imgUrl = getImageUrl(row);
              const isSelected = selectedIds.includes(row.id);
              const isCurrentSelected = selectedRecordId === row.id;
              const docType = row.document_type || row.type || 'Chung';
              const ocrText = row.ocr_text || row.text || row.raw_text || '';

              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectRecord(row)}
                  className={`group transition-colors hover:bg-slate-800/40 cursor-pointer ${
                    isCurrentSelected ? 'bg-blue-950/40 border-l-2 border-blue-500' : ''
                  }`}
                >
                  
                  {/* Select checkbox */}
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectRecord(row.id)}
                      className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                  </td>

                  {/* ID */}
                  <td className="p-3">
                    <div className="font-mono font-bold text-slate-200 text-xs">
                      #{row.id}
                    </div>
                  </td>

                  {/* AI Model Used */}
                  <td className="p-3">
                    {row.model_used ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                        row.model_used.includes('ChatGPT') || row.model_used.includes('GPT')
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                          : row.model_used.includes('Gemini')
                          ? 'bg-blue-950/60 text-blue-300 border-blue-800/80'
                          : 'bg-purple-950/60 text-purple-300 border-purple-800/80'
                      }`}>
                        <Bot className="w-3 h-3" />
                        <span>{row.model_used}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">N/A</span>
                    )}
                  </td>

                  {/* Thumbnail Image */}
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div
                      onClick={() => onSelectImage(row)}
                      className="relative w-16 h-12 mx-auto rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 group/img cursor-pointer hover:border-blue-500 hover:scale-105 transition-all shadow-md"
                      title="Bấm để xem ảnh phóng to full màn hình"
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={row.file_name || `OCR image ${row.id}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&auto=format&fit=crop&q=60';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <Eye className="w-4 h-4 text-blue-300" />
                      </div>
                    </div>
                  </td>

                  {/* Customer & OCR Extracted Text */}
                  <td className="p-3">
                    <div className="relative group/text max-w-sm">
                      {row.name && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white text-xs">{row.name}</span>
                          {row.phone && (
                            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                              {row.phone}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed font-sans">
                        {ocrText ? ocrText : <span className="text-slate-500 italic">Chưa nhận dạng văn bản</span>}
                      </p>
                      {ocrText && (
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            onClick={(e) => handleCopyText(ocrText, row.id, e)}
                            className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-400 transition-colors"
                            title="Sao chép toàn bộ văn bản OCR"
                          >
                            {copiedId === row.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Đã chép!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Sao chép OCR</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Accuracy Score */}
                  <td className="p-3">
                    {renderConfidenceBar(row.accuracy ?? row.confidence_score ?? row.confidence)}
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    {getStatusBadge(row.status)}
                  </td>

                  {/* JSON Chip */}
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectRecord(row)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 transition-all cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{row.extracted_json ? 'Xem JSON' : 'Trống'}</span>
                    </button>
                  </td>

                  {/* Date */}
                  <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                    {row.created_at || row.processed_at ? (
                      new Date(row.created_at || row.processed_at!).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    ) : (
                      'N/A'
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectImage(row)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 transition-all cursor-pointer"
                        title="Xem phóng to ảnh"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onSelectRecord(row)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 transition-all cursor-pointer"
                        title="Xem chi tiết đầy đủ thông tin"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
