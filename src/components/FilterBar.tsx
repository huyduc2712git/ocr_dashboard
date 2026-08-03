import React from 'react';
import { Download, X, ArrowUpDown, Bot } from 'lucide-react';

interface FilterBarProps {
  modelFilter: string;
  onModelChange: (model: string) => void;
  models: string[];
  sortField: string;
  onSortFieldChange: (field: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  modelFilter,
  onModelChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderChange,
  limit,
  onLimitChange,
  onExportCsv,
  onExportJson,
  totalResults,
}) => {
  const handleSortSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    switch (value) {
      case 'model_asc':
        onSortFieldChange('model_used');
        onSortOrderChange('asc');
        break;
      case 'model_desc':
        onSortFieldChange('model_used');
        onSortOrderChange('desc');
        break;
      case 'id_desc':
        onSortFieldChange('id');
        onSortOrderChange('desc');
        break;
      case 'id_asc':
        onSortFieldChange('id');
        onSortOrderChange('asc');
        break;
      case 'accuracy_desc':
        onSortFieldChange('accuracy');
        onSortOrderChange('desc');
        break;
      case 'execution_time_asc':
        onSortFieldChange('execution_time');
        onSortOrderChange('asc');
        break;
      default:
        onSortFieldChange('model_used');
        onSortOrderChange('asc');
    }
  };

  const currentSortKey = `${sortField}_${sortOrder}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Left Side: Status & Active Filter indicator / Sort options */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Active Model Filter Tag (if filtered via Top Cards) */}
          {modelFilter ? (
            <div className="flex items-center gap-2 bg-purple-950/80 border border-purple-600/80 rounded-xl px-3 py-1.5 text-xs font-bold text-purple-200 shadow-sm">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>Đang lọc: {modelFilter}</span>
              <button
                onClick={() => onModelChange('')}
                className="hover:bg-purple-800/60 p-0.5 rounded-full transition-colors cursor-pointer ml-1"
                title="Bỏ lọc model"
              >
                <X className="w-3.5 h-3.5 text-purple-300" />
              </button>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 px-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Đang hiển thị: <strong className="text-white font-mono">{totalResults}</strong> bản ghi (Toàn bộ 3 Model AI)</span>
            </div>
          )}

          {/* Sort Selection Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950 border border-amber-800/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 shadow-inner">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 font-medium">Sắp xếp:</span>
            <select
              value={currentSortKey}
              onChange={handleSortSelectChange}
              className="bg-transparent text-amber-200 font-bold text-xs outline-none cursor-pointer pr-1"
            >
              <option value="model_used_asc" className="bg-slate-900 text-slate-200">Mặc định: Theo Model AI (A-Z)</option>
              <option value="model_used_desc" className="bg-slate-900 text-slate-200">Theo Model AI (Z-A)</option>
              <option value="accuracy_desc" className="bg-slate-900 text-slate-200">Độ chính xác (Cao -&gt; Thấp)</option>
              <option value="execution_time_asc" className="bg-slate-900 text-slate-200">Thời gian xử lý (Nhanh -&gt; Chậm)</option>
              <option value="id_desc" className="bg-slate-900 text-slate-200">ID Mới nhất (Giảm dần)</option>
              <option value="id_asc" className="bg-slate-900 text-slate-200">ID Cũ nhất (Tăng dần)</option>
            </select>
          </div>

        </div>

        {/* Right Side: Rows per page & Export Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Limit selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Số lượng:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value={70} className="bg-slate-900">Tất cả 70 bản ghi (Full)</option>
              <option value={100} className="bg-slate-900">100 bản ghi</option>
              <option value={50} className="bg-slate-900">50 bản ghi</option>
              <option value={20} className="bg-slate-900">20 bản ghi</option>
            </select>
          </div>

          {/* Export CSV & JSON */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all shadow-sm cursor-pointer"
              title="Xuất file CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={onExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all shadow-sm cursor-pointer"
              title="Xuất file JSON"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Xuất JSON</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
