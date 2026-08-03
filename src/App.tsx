import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { FilterBar } from './components/FilterBar';
import { OcrCompareView } from './components/OcrCompareView';
import { OcrSplitView } from './components/OcrSplitView';
import { ImageModal } from './components/ImageModal';
import { DetailModal } from './components/DetailModal';
import { DbInfoModal } from './components/DbInfoModal';
import { OcrRecord, DbStatus, ApiResponse, ViewMode } from './types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  // DB & API States
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Controls
  const [modelFilter, setModelFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(70);
  const [sortField, setSortField] = useState<string>('model_used');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Available AI models
  const models = useMemo(() => [
    'ChatGPT GPT 5.4 Nano',
    'Gemini 3.1 Flash-Lite',
    'vintern_python'
  ], []);

  // Interactive Settings
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [forceDemo, setForceDemo] = useState<boolean>(false);

  // Modals & Selected items
  const [selectedImageRecord, setSelectedImageRecord] = useState<OcrRecord | null>(null);
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<OcrRecord | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);

  // Fetch DB Connection Status
  const fetchDbStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/db-status?db=image_ocr');
      const data: DbStatus = await res.json();
      setDbStatus(data);
    } catch (err) {
      console.error('Failed to fetch DB status:', err);
      setDbStatus({
        connected: false,
        host: '14.225.250.17',
        port: 3306,
        user: 'upos',
        database: 'image_ocr',
        isDemoMode: false,
        message: 'Lỗi kết nối máy chủ MySQL',
      });
    }
  }, []);

  // Fetch OCR Data
  const fetchOcrData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        db: 'image_ocr',
        tableName: 'ocr_results',
        page: page.toString(),
        limit: limit.toString(),
        demo: forceDemo ? 'true' : 'false',
      });

      const res = await fetch(`/api/ocr-data?${params.toString()}`);
      const data: ApiResponse = await res.json();
      setApiResponse(data);
    } catch (err) {
      console.error('Failed to fetch OCR data:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, forceDemo]);

  // Initial Load & Auto-Refresh Setup
  useEffect(() => {
    fetchDbStatus();
    fetchOcrData();
  }, [fetchDbStatus, fetchOcrData]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoRefresh) {
      timer = setInterval(() => {
        fetchOcrData();
      }, 15000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRefresh, fetchOcrData]);

  // Filter & Sort client-side
  const filteredAndSortedRecords = useMemo(() => {
    if (!apiResponse?.data) return [];
    let list = [...apiResponse.data];

    if (modelFilter) {
      list = list.filter((r) => r.model_used === modelFilter);
    }

    list.sort((a, b) => {
      const valA = a[sortField as keyof OcrRecord];
      const valB = b[sortField as keyof OcrRecord];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        const comp = valA.localeCompare(valB, 'vi', { sensitivity: 'base' });
        return sortOrder === 'asc' ? comp : -comp;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [apiResponse, modelFilter, sortField, sortOrder]);

  // Export CSV
  const handleExportCsv = () => {
    if (filteredAndSortedRecords.length === 0) return;
    const headers = ['ID', 'Model AI', 'Chất lượng Accuracy', 'Ground Truth', 'Bản OCR', 'SĐT'];
    const rows = filteredAndSortedRecords.map((r) => [
      r.id,
      r.model_used || '',
      r.accuracy ?? r.confidence_score ?? '',
      `"${(r.ground_truth || '').replace(/"/g, '""')}"`,
      `"${(r.raw_text || '').replace(/"/g, '""')}"`,
      `"${r.phone || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ocr_benchmark_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJson = () => {
    if (filteredAndSortedRecords.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredAndSortedRecords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ocr_benchmark_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Lightbox Next/Prev navigation
  const currentImageIndex = useMemo(() => {
    if (!selectedImageRecord) return -1;
    return filteredAndSortedRecords.findIndex((r) => r.id === selectedImageRecord.id);
  }, [selectedImageRecord, filteredAndSortedRecords]);

  const handleNextImage = () => {
    if (currentImageIndex >= 0 && currentImageIndex < filteredAndSortedRecords.length - 1) {
      setSelectedImageRecord(filteredAndSortedRecords[currentImageIndex + 1]);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setSelectedImageRecord(filteredAndSortedRecords[currentImageIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation Header */}
      <Header
        dbStatus={dbStatus}
        loading={loading}
        onRefresh={() => {
          fetchDbStatus();
          fetchOcrData();
        }}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        forceDemo={forceDemo}
        onToggleForceDemo={() => setForceDemo(!forceDemo)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Notice Banner when in Demo mode */}
        {(forceDemo || apiResponse?.isDemoMode) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-800 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>
                <strong>Chế độ Xem Trực Quan Demo:</strong> Đang hiển thị bộ dữ liệu CSDL OCR chuẩn với hình ảnh nhận dạng thực tế.
              </span>
            </div>
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="underline font-semibold hover:text-blue-900 cursor-pointer"
            >
              Cấu hình MySQL
            </button>
          </div>
        )}

        {/* Top Metric Cards (Total Records, Overall Accuracy, 3 Model Breakdown) */}
        <StatsCards
          pagination={apiResponse?.pagination || null}
          records={apiResponse?.data || []}
          loading={loading}
          modelFilter={modelFilter}
          onModelChange={(model) => {
            setModelFilter(model);
            setPage(1);
          }}
        />

        {/* Filter & Toolbar */}
        <FilterBar
          modelFilter={modelFilter}
          onModelChange={(model) => {
            setModelFilter(model);
            setPage(1);
          }}
          models={models}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          limit={limit}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onExportCsv={handleExportCsv}
          onExportJson={handleExportJson}
          totalResults={filteredAndSortedRecords.length}
        />

        {/* Dynamic Main View Display: Master-Detail Split View (Default) or Stacked Cards View */}
        {viewMode === 'split' ? (
          <OcrSplitView
            records={filteredAndSortedRecords}
            onRecordClick={(record) => setSelectedDetailRecord(record)}
            onImageClick={(url, title) => {
              if (filteredAndSortedRecords.length > 0) {
                const matched = filteredAndSortedRecords.find(r => r.image_url === url) || filteredAndSortedRecords[0];
                setSelectedImageRecord(matched);
              }
            }}
          />
        ) : (
          <OcrCompareView
            records={filteredAndSortedRecords}
            onRecordClick={(record) => setSelectedDetailRecord(record)}
            onImageClick={(url, title) => {
              if (filteredAndSortedRecords.length > 0) {
                const matched = filteredAndSortedRecords.find(r => r.image_url === url) || filteredAndSortedRecords[0];
                setSelectedImageRecord(matched);
              }
            }}
          />
        )}

        {/* Pagination Bar */}
        {apiResponse?.pagination && apiResponse.pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 gap-3 shadow-sm">
            <div className="text-xs text-slate-600">
              Trang <span className="font-bold text-slate-900">{page}</span> /{' '}
              <span className="font-bold text-slate-900">{apiResponse.pagination.totalPages}</span>{' '}
              (Tổng cộng {apiResponse.pagination.total} bản ghi)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-medium text-slate-700 flex items-center gap-1 transition-colors cursor-pointer border border-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trang trước</span>
              </button>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, apiResponse.pagination.totalPages))}
                disabled={page >= apiResponse.pagination.totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-medium text-slate-700 flex items-center gap-1 transition-colors cursor-pointer border border-slate-300"
              >
                <span>Trang sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      <ImageModal
        record={selectedImageRecord}
        onClose={() => setSelectedImageRecord(null)}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
        hasNext={currentImageIndex >= 0 && currentImageIndex < filteredAndSortedRecords.length - 1}
        hasPrev={currentImageIndex > 0}
      />

      <DetailModal
        record={selectedDetailRecord}
        onClose={() => setSelectedDetailRecord(null)}
        onOpenImage={(rec) => setSelectedImageRecord(rec)}
      />

      {isDbModalOpen && (
        <DbInfoModal
          dbStatus={dbStatus}
          columns={apiResponse?.columns || []}
          tableName={apiResponse?.tableName || 'image_ocr'}
          onClose={() => setIsDbModalOpen(false)}
          onRefreshStatus={() => {
            fetchDbStatus();
            fetchOcrData();
          }}
          forceDemo={forceDemo}
          onToggleForceDemo={() => setForceDemo(!forceDemo)}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Dashboard CSDL MySQL OCR Image • Database: <span className="font-mono text-slate-700 font-bold">upos</span> • Table: <span className="font-mono text-slate-700 font-bold">image_ocr</span>
      </footer>

    </div>
  );
}
