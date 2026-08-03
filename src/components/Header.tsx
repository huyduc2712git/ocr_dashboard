import React from 'react';
import { Database, RefreshCw, Server, ShieldCheck, AlertTriangle, Layers, Activity } from 'lucide-react';
import { DbStatus } from '../types';

interface HeaderProps {
  dbStatus: DbStatus | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenDbModal: () => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  forceDemo: boolean;
  onToggleForceDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dbStatus,
  loading,
  onRefresh,
  onOpenDbModal,
  autoRefresh,
  onToggleAutoRefresh,
  forceDemo,
  onToggleForceDemo,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">OCR Image Dashboard</h1>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                    image_ocr
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Quản lý & Giám sát dữ liệu nhận dạng hình ảnh MySQL
                </p>
              </div>
            </div>

            {/* Mobile Connection Badge */}
            <button
              onClick={onOpenDbModal}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300"
            >
              <div className={`w-2 h-2 rounded-full ${dbStatus?.connected && !forceDemo ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{dbStatus?.connected && !forceDemo ? 'MySQL Live' : 'Demo Mode'}</span>
            </button>
          </div>

          {/* Database Info & Status Bar */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            
            {/* DB Badge */}
            <button
              onClick={onOpenDbModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/70 text-slate-700 border border-slate-300 transition-all shadow-xs"
              title="Xem thông tin cấu hình MySQL"
            >
              <Server className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-mono text-slate-700 font-semibold">14.225.250.17:3306</span>
              <span className="text-slate-400">|</span>
              <span className="font-medium text-blue-700 font-bold">{dbStatus?.database || 'image_ocr'}</span>

              {dbStatus?.connected && !forceDemo ? (
                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[11px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Live ({dbStatus.pingTimeMs ?? '<10'}ms)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[11px] font-bold">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Demo Mode
                </span>
              )}
            </button>

            {/* Toggle Demo Mode Button */}
            <button
              onClick={onToggleForceDemo}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                forceDemo
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
              title="Chuyển đổi giữa dữ liệu MySQL trực tiếp và dữ liệu Demo"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{forceDemo ? 'Bật Demo' : 'MySQL Tự động'}</span>
            </button>

            {/* Auto Refresh Switch */}
            <button
              onClick={onToggleAutoRefresh}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                autoRefresh
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
              }`}
              title="Tự động làm mới dữ liệu mỗi 15 giây"
            >
              <Activity className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-600' : ''}`} />
              <span>{autoRefresh ? 'Tự động 15s' : 'Tắt làm mới'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-all shadow-sm disabled:opacity-50 cursor-pointer font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
