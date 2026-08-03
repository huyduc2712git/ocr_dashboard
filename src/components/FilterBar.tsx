import React from 'react';
import { Download, X, ArrowUpDown, Bot, Columns, LayoutList, Table } from 'lucide-react';
import { ViewMode } from '../types';

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
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
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
    <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 mb-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Left Side: Status / Active Filter indicator & View Mode */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          
          {/* Active Model Filter Tag */}
          {modelFilter ? (
            <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-1 text-xs font-bold text-purple-800 shadow-xs">
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              <span>Đang lọc: {modelFilter}</span>
              <button
                onClick={() => onModelChange('')}
                className="hover:bg-purple-100 p-0.5 rounded-full transition-colors cursor-pointer ml-1 text-purple-700"
                title="Bỏ lọc model"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5 px-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Hiển thị: <strong className="text-slate-900 font-mono text-xs">{totalResults}</strong> bản ghi</span>
            </div>
          )}



          {/* Sort Selection Dropdown */}
          <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200 rounded-lg px-2.5 py-1 text-xs text-amber-900 shadow-inner">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-amber-800 font-medium">Sắp xếp:</span>
            <select
              value={currentSortKey}
              onChange={handleSortSelectChange}
              className="bg-transparent text-amber-900 font-bold text-xs outline-none cursor-pointer pr-1"
            >
              <option value="model_used_asc" className="bg-white text-slate-800">Model AI (A-Z)</option>
              <option value="model_used_desc" className="bg-white text-slate-800">Model AI (Z-A)</option>
              <option value="accuracy_desc" className="bg-white text-slate-800">Accuracy (Cao -&gt; Thấp)</option>
              <option value="execution_time_asc" className="bg-white text-slate-800">Thời gian (Nhanh -&gt; Chậm)</option>
              <option value="id_desc" className="bg-white text-slate-800">ID Mới nhất</option>
              <option value="id_asc" className="bg-white text-slate-800">ID Cũ nhất</option>
            </select>
          </div>

        </div>

        {/* Right Side: Rows per page & Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Limit selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Số lượng:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer"
            >
              <option value={70} className="bg-white">Tất cả 70</option>
              <option value={100} className="bg-white">100 bản ghi</option>
              <option value={50} className="bg-white">50 bản ghi</option>
              <option value={20} className="bg-white">20 bản ghi</option>
            </select>
          </div>

          {/* Export CSV & JSON */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer shadow-xs"
              title="Xuất file CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={onExportJson}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer shadow-xs"
              title="Xuất file JSON"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Xuất JSON</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
