import React, { useState, useMemo, useEffect } from 'react';
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
  AlertTriangle,
  ZoomIn,
  Search,
  ChevronRight,
  Layers,
  FileText,
  User,
  MapPin,
  Tag
} from 'lucide-react';
import { OcrRecord } from '../types';
import { getRecipientPhoneGT, getRecipientPhoneOCR, normalizePhoneNumber, ComparePhoneDigits } from './StatsCards';

interface OcrSplitViewProps {
  records: OcrRecord[];
  onRecordClick: (record: OcrRecord) => void;
  onImageClick: (imageUrl: string, title: string) => void;
}

export const OcrSplitView: React.FC<OcrSplitViewProps> = ({
  records,
  onRecordClick,
  onImageClick,
}) => {
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  // Filter records locally in the split list search box
  const filteredListRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase().trim();
    return records.filter((r) => {
      const idMatch = String(r.id).toLowerCase().includes(q);
      const modelMatch = (r.model_used || '').toLowerCase().includes(q);
      const nameMatch = (r.name || '').toLowerCase().includes(q);
      const phoneMatch = (r.phone || '').toLowerCase().includes(q);
      const gtPhoneMatch = getRecipientPhoneGT(r).includes(q);
      const ocrPhoneMatch = getRecipientPhoneOCR(r).includes(q);
      return idMatch || modelMatch || nameMatch || phoneMatch || gtPhoneMatch || ocrPhoneMatch;
    });
  }, [records, searchQuery]);

  // Synchronously derive active record (0ms flicker)
  const activeRecord = useMemo(() => {
    if (filteredListRecords.length === 0) return null;
    if (selectedId !== null) {
      const found = filteredListRecords.find((r) => r.id === selectedId);
      if (found) return found;
    }
    return filteredListRecords[0];
  }, [filteredListRecords, selectedId]);

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
        <p className="text-xs text-slate-400 mt-1">Vui lòng chọn lại bộ lọc hoặc Model AI từ danh sách trên.</p>
      </div>
    );
  }

  // Active Record Metrics
  const activeModelName = activeRecord?.model_used || 'General AI';
  const activeGtPhone = activeRecord ? getRecipientPhoneGT(activeRecord) : '';
  const activeOcrPhone = activeRecord ? getRecipientPhoneOCR(activeRecord) : '';
  const activeHasPhones = Boolean(activeGtPhone || activeOcrPhone);
  const activeIsPhoneMatch = Boolean(
    activeGtPhone && 
    activeOcrPhone && 
    normalizePhoneNumber(activeGtPhone) === normalizePhoneNumber(activeOcrPhone)
  );

  const isChatGPT = activeModelName.includes('ChatGPT') || activeModelName.includes('GPT');
  const isGemini = activeModelName.includes('Gemini');

  const modelBadgeStyle = isChatGPT
    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
    : isGemini
    ? 'bg-blue-50 text-blue-800 border-blue-300'
    : 'bg-purple-50 text-purple-800 border-purple-300';

  const activeAccuracy = activeRecord?.accuracy ?? activeRecord?.confidence_score;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8 items-start">
      
      {/* LEFT SIDE: MASTER LIST PANEL (4 Columns) */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col max-h-[780px] sticky top-20">
        
        {/* Master List Header & Search */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Danh Sách Mẫu OCR ({filteredListRecords.length})
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full border border-slate-300">
              Trang {records.length} mục
            </span>
          </div>

          {/* Quick search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo ID, SĐT, Model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Master Items List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar min-h-[400px]">
          {filteredListRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 italic">
              Không tìm thấy mẫu phù hợp với từ khóa "{searchQuery}"
            </div>
          ) : (
            filteredListRecords.map((r) => {
              const isSelected = activeRecord?.id === r.id;
              const model = r.model_used || 'General AI';
              const gtPhone = getRecipientPhoneGT(r);
              const ocrPhone = getRecipientPhoneOCR(r);
              const hasPhones = Boolean(gtPhone || ocrPhone);
              const isMatch = Boolean(
                gtPhone && 
                ocrPhone && 
                normalizePhoneNumber(gtPhone) === normalizePhoneNumber(ocrPhone)
              );

              const modelBadgeColor = model.includes('ChatGPT') || model.includes('GPT')
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : model.includes('Gemini')
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-purple-50 text-purple-800 border-purple-300';

              const accuracy = r.accuracy ?? r.confidence_score;

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border text-xs flex flex-col justify-between gap-2 relative ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-500/30 text-slate-900'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                  }`}
                >
                  {/* Left Active Line Marker */}
                  {isSelected && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full shadow-sm" />
                  )}

                  {/* Top Bar: ID & Model */}
                  <div className="flex items-center justify-between gap-2 pl-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-extrabold px-2 py-0.5 rounded text-[11px] ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}>
                        #{r.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${modelBadgeColor}`}>
                        {model}
                      </span>
                    </div>

                    {accuracy !== undefined && accuracy !== null && (
                      <span className="font-mono text-[11px] font-extrabold text-emerald-700">
                        {accuracy.toFixed(1)}%
                      </span>
                    )}
                  </div>

                  {/* Customer / Name & Phone preview */}
                  <div className="pl-1 space-y-1">
                    {r.name && (
                      <div className="font-semibold text-slate-800 truncate text-[11px] flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        <span className="truncate">{r.name}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      {gtPhone || ocrPhone || r.phone ? (
                        <div className="font-mono font-bold text-slate-800 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-600" />
                          <span>{gtPhone || r.phone || ocrPhone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">Chưa trích xuất SĐT</span>
                      )}

                      {/* Phone Match Badge */}
                      {hasPhones ? (
                        isMatch ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Khớp</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Lệch SĐT</span>
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">—</span>
                      )}
                    </div>
                  </div>

                  {/* Arrow Indicator on Hover/Selected */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/80 pl-1">
                    <span>Image ID: #{r.image_id || r.id}</span>
                    <div className="flex items-center gap-0.5 font-bold text-blue-600">
                      <span>Chi tiết</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1' : ''}`} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT SIDE: DETAIL DISPLAY PANEL (8 Columns) */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {activeRecord ? (
          <div>
            
            {/* Detail Top Header */}
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              
              {/* ID & Model */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-extrabold px-3.5 py-1 rounded-lg bg-blue-600 text-white shadow-sm">
                  Mẫu OCR #{activeRecord.id}
                </span>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold border ${modelBadgeStyle}`}>
                  <Bot className="w-4 h-4" />
                  <span>{activeModelName}</span>
                </span>
              </div>

              {/* Action Buttons & Metrics */}
              <div className="flex items-center gap-3">
                {activeAccuracy !== undefined && activeAccuracy !== null && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Accuracy: {activeAccuracy.toFixed(1)}%</span>
                  </div>
                )}

                {activeRecord.execution_time && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono border border-slate-300 font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{activeRecord.execution_time.toFixed(2)}s</span>
                  </div>
                )}

                <button
                  onClick={() => onRecordClick(activeRecord)}
                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span>Xem JSON Full</span>
                </button>
              </div>
            </div>

            {/* Content Body: Image + GT + OCR Grid */}
            <div className="p-5 space-y-5">
              
              {/* Image Preview & Quick Summary Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                
                {/* Image Box (5 Columns) */}
                <div className="md:col-span-5 bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
                  <div 
                    onClick={() => activeRecord.image_url && onImageClick(activeRecord.image_url, `Mẫu OCR #${activeRecord.id} (${activeModelName})`)}
                    className="relative group w-full h-56 bg-slate-100 rounded-lg overflow-hidden border border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all shadow-inner"
                  >
                    {activeRecord.image_url ? (
                      <>
                        <img
                          src={activeRecord.image_url}
                          alt={`OCR ID ${activeRecord.id}`}
                          className="w-full h-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                            <ZoomIn className="w-4 h-4" />
                            <span>Xem Ảnh Phóng To</span>
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

                  <div className="text-center bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block font-medium">
                      Image Record ID: #{activeRecord.image_id || activeRecord.id}
                    </span>
                  </div>
                </div>

                {/* Structured Data Quick Summary (7 Columns) */}
                <div className="md:col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between text-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <span className="font-extrabold text-slate-800 uppercase tracking-wider">Thông Tin Đơn Hàng</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                      <span className="text-slate-500 text-[11px] block">Tên Khách Hàng</span>
                      <span className="font-bold text-slate-900 mt-0.5 block truncate">
                        {activeRecord.name || 'Không rõ'}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                      <span className="text-slate-500 text-[11px] block">SĐT Chuẩn (Ground Truth)</span>
                      <span className="font-mono font-bold text-emerald-700 mt-0.5 block">
                        {activeGtPhone || activeRecord.phone || 'Chưa có'}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                      <span className="text-slate-500 text-[11px] block">SĐT AI Đọc Được (OCR)</span>
                      <span className="font-mono font-bold text-blue-700 mt-0.5 block">
                        {activeOcrPhone || 'Chưa đọc được'}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                      <span className="text-slate-500 text-[11px] block">Trạng Thái Khớp SĐT</span>
                      <div className="mt-0.5">
                        {activeOcrPhone ? (
                          <ComparePhoneDigits ocrPhone={activeOcrPhone} gtPhone={activeGtPhone} />
                        ) : (
                          <span className="text-slate-400 italic block text-xs">Không phát hiện</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {activeRecord.address && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                      <span className="text-slate-500 text-[11px] flex items-center gap-1 mb-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        <span>Địa Chỉ Giao Hàng</span>
                      </span>
                      <p className="text-slate-800 line-clamp-2 leading-relaxed font-medium">{activeRecord.address}</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Side-by-Side Text Comparison: Ground Truth vs OCR Extracted */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Ground Truth Box */}
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        Ground Truth (Văn Bản Chuẩn)
                      </span>

                      {activeRecord.ground_truth && (
                        <button
                          onClick={(e) => handleCopyText(activeRecord.ground_truth!, `gt_${activeRecord.id}`, e)}
                          className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-emerald-300 rounded text-slate-700 text-[10px] font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                        >
                          {copiedId === `gt_${activeRecord.id}` ? (
                            <span className="text-emerald-700 font-bold">Đã chép</span>
                          ) : (
                            <span>Copy</span>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="bg-white border border-emerald-200 rounded-lg p-2.5 text-[11px] text-slate-800 font-sans whitespace-pre-wrap leading-relaxed min-h-[90px] max-h-[170px] overflow-y-auto font-medium shadow-xs">
                      {activeRecord.ground_truth ? (
                        activeRecord.ground_truth
                      ) : (
                        <span className="text-slate-400 italic">Không có văn bản đối soát (Ground Truth)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI OCR Text Box */}
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wide flex items-center gap-1.5 bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-300">
                        <Bot className="w-3 h-3 text-blue-700" />
                        Bản OCR Từ AI ({activeModelName})
                      </span>

                      {(activeRecord.raw_text || activeRecord.ocr_text) && (
                        <button
                          onClick={(e) => handleCopyText(activeRecord.raw_text || activeRecord.ocr_text!, `ocr_${activeRecord.id}`, e)}
                          className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-blue-300 rounded text-slate-700 text-[10px] font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                        >
                          {copiedId === `ocr_${activeRecord.id}` ? (
                            <span className="text-emerald-700 font-bold">Đã chép</span>
                          ) : (
                            <span>Copy</span>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="bg-white border border-blue-200 rounded-lg p-2.5 text-[11px] text-slate-800 font-sans whitespace-pre-wrap leading-relaxed min-h-[90px] max-h-[170px] overflow-y-auto font-medium shadow-xs">
                      {activeRecord.raw_text || activeRecord.ocr_text ? (
                        activeRecord.raw_text || activeRecord.ocr_text
                      ) : (
                        <span className="text-slate-400 italic">Chưa nhận dạng được văn bản từ AI</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>


            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            Vui lòng chọn một mẫu từ danh sách bên trái để xem nội dung chi tiết.
          </div>
        )}
      </div>

    </div>
  );
};
