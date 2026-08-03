import React from 'react';
import { X, Server, Database, ShieldCheck, AlertTriangle, Layers, Table, RefreshCw, Key, Cpu } from 'lucide-react';
import { DbStatus, ColumnDef } from '../types';

interface DbInfoModalProps {
  dbStatus: DbStatus | null;
  columns: ColumnDef[];
  tableName: string;
  onClose: () => void;
  onRefreshStatus: () => void;
  forceDemo: boolean;
  onToggleForceDemo: () => void;
}

export const DbInfoModal: React.FC<DbInfoModalProps> = ({
  dbStatus,
  columns,
  tableName,
  onClose,
  onRefreshStatus,
  forceDemo,
  onToggleForceDemo,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cấu Hình & Trạng Thái Kết Nối CSDL MySQL</h2>
              <p className="text-xs text-slate-400">Kiểm tra kết nối trực tiếp CSDL image_ocr</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Status Box */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            dbStatus?.connected && !forceDemo
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
              : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
          }`}>
            {dbStatus?.connected && !forceDemo ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1">
              <h3 className="font-bold text-sm">
                {dbStatus?.connected && !forceDemo
                  ? 'Đã kết nối trực tiếp thành công tới máy chủ MySQL'
                  : 'Đang ở Chế độ Demo Tự Động (Trực Quan)'}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {dbStatus?.message || 'Hệ thống tự động phát hiện và kết nối CSDL.'}
              </p>
            </div>
          </div>

          {/* Connection Parameters Grid */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              <span>Thông Số Máy Chủ CSDL (DB Credentials)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-slate-300 font-mono">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block font-sans">DB_HOSTNAME</span>
                <span className="font-bold text-white">{dbStatus?.host || '14.225.250.17'}</span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block font-sans">DB_PORT</span>
                <span className="font-bold text-white">{dbStatus?.port || 3306}</span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block font-sans">DB_USERNAME</span>
                <span className="font-bold text-white">{dbStatus?.user || 'upos'}</span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block font-sans">DB_DATABASE</span>
                <span className="font-bold text-blue-400">{dbStatus?.database || 'image_ocr'}</span>
              </div>
            </div>
          </div>

          {/* Schema Columns Table */}
          {columns && columns.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-400" />
                <span>Cấu Trúc Các Cột Của Bảng: {tableName}</span>
              </h3>

              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px] font-semibold">
                      <th className="p-2.5">Cột (Field)</th>
                      <th className="p-2.5">Kiểu Dữ Liệu (Type)</th>
                      <th className="p-2.5">Khóa (Key)</th>
                      <th className="p-2.5">Cho Phép Null</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300 text-[11px]">
                    {columns.map((col) => (
                      <tr key={col.field} className="hover:bg-slate-900/50">
                        <td className="p-2.5 font-bold text-white">{col.field}</td>
                        <td className="p-2.5 text-blue-300">{col.type}</td>
                        <td className="p-2.5">
                          {col.key === 'PRI' ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                              PRI KEY
                            </span>
                          ) : (
                            col.key || '-'
                          )}
                        </td>
                        <td className="p-2.5 text-slate-400">{col.null}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-5 py-3 flex items-center justify-between">
          <button
            onClick={onToggleForceDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>{forceDemo ? 'Bật Chế Độ Tự Động MySQL' : 'Bật Demo Mode'}</span>
          </button>

          <button
            onClick={onRefreshStatus}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử Kết Nối Lại</span>
          </button>
        </div>

      </div>
    </div>
  );
};
