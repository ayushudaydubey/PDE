import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, CheckCircle, AlertCircle, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import Button from '../../../components/ui/Button';
import Table from '../../../components/ui/Table';

const ImportPage = () => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();

  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [pendingFileInfo, setPendingFileInfo] = useState(null);

  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [historyUser, setHistoryUser] = useState('');

  // Fetch users for filter
  const { data: usersList = [] } = useQuery({
    queryKey: ['filterUsers', 'sales'],
    queryFn: () => api.get('/users/filter-list?targetRole=sales').then((res) => res.data.data || []),
  });

  const [hasActiveImports, setHasActiveImports] = useState(false);

  const { data: historyResponse, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['importHistory', historyPage, historyLimit, historyUser],
    queryFn: () => api.get(`/import/history?page=${historyPage}&limit=${historyLimit}${historyUser ? `&userId=${historyUser}` : ''}`).then((res) => res.data),
    refetchInterval: hasActiveImports ? 2000 : false,
  });

  const history = historyResponse?.history || [];
  const historyTotal = historyResponse?.total || 0;
  const historyTotalPages = historyResponse?.totalPages || 1;

  React.useEffect(() => {
    const active = history.some((row) => row.status === 'pending' || row.status === 'queued' || row.status === 'processing');
    if (active !== hasActiveImports) {
      setHasActiveImports(active);
    }
  }, [history, hasActiveImports]);

  React.useEffect(() => {
    let eventSource = null;
    if (hasActiveImports) {
      const sseUrl = `${api.defaults.baseURL}/import/events`;
      eventSource = new EventSource(sseUrl, { withCredentials: true });
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.fileId) {
            queryClient.setQueryData(['importHistory', historyPage, historyLimit, historyUser], (oldData) => {
              if (!oldData || !oldData.history) return oldData;
              return {
                ...oldData,
                history: oldData.history.map((row) => {
                  if (row._id === data.fileId) {
                    return {
                      ...row,
                      ...data
                    };
                  }
                  return row;
                })
              };
            });
            if (data.status === 'completed' || data.status === 'failed') {
              queryClient.invalidateQueries({ queryKey: ['importHistory'] });
              queryClient.invalidateQueries({ queryKey: ['files'] });
            }
          }
        } catch (e) {
          // ignore parse errors
        }
      };
    }
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [hasActiveImports, historyPage, historyLimit, historyUser, queryClient]);

  const confirmMutation = useMutation({
    mutationFn: (fileId) => api.post(`/import/confirm/${fileId}`),
    onSuccess: () => {
      toast.success("Import confirmed and started.", { autoClose: 6000 });
      setWarningModalOpen(false);
      setPendingFileInfo(null);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['importHistory'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to confirm import");
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (fileId) => api.post(`/import/cancel/${fileId}`),
    onSuccess: () => {
      toast.info("Import cancelled.");
      setWarningModalOpen(false);
      setPendingFileInfo(null);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to cancel import");
    }
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) =>
      api.post('/import/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: (res) => {
      const data = res.data;
      if (data.duplicateCount > 0) {
        setPendingFileInfo(data);
        setWarningModalOpen(true);
      } else {
        // No duplicates, auto confirm
        confirmMutation.mutate(data.fileId);
      }
    },
    onError: (error) => {
      const data = error.response?.data;
      toast.error(data?.message || data?.error || 'Failed to upload file');
    },
  });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const validTypes = [
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];
      const fileExt = selected.name.split('.').pop().toLowerCase();
      if (
        validTypes.includes(selected.type) ||
        ['csv', 'xlsx', 'xls', 'gsheet'].includes(fileExt)
      ) {
        setFile(selected);
      } else {
        toast.error('Please select a valid CSV, Excel, or GSheet file');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  };

  const columns = [
    {
      header: 'Date & Time',
      accessor: 'uploadedAt',
      cell: (row) => new Date(row.uploadedAt || row.createdAt).toLocaleString(),
    },
    {
      header: 'File Name',
      accessor: 'originalName',
      cell: (row) => row.originalName || row.fileName,
    },
    {
      header: 'Uploaded By',
      cell: (row) => (
        <div>
          <span className="font-semibold text-gray-900">
            {row.uploadedBy ? row.uploadedBy.name : 'Admin/System'}
          </span>
          {row.uploadedBy?.email && (
            <span className="block text-xs text-gray-500">{row.uploadedBy.email}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Records Added',
      accessor: 'totalRecords',
      cell: (row) => {
        if (row.status === 'pending') return <span className="text-amber-600 font-medium text-xs animate-pulse">Pending...</span>;
        if (row.status === 'queued') return <span className="text-indigo-600 font-medium text-xs animate-pulse">Queued in Pool...</span>;
        if (row.status === 'processing') {
          const prog = row.progress || 0;
          const spd = row.speed ? `${row.speed} rows/s` : 'Calculating...';
          const etaSec = row.eta || 0;
          let etaStr = etaSec > 60 ? `${Math.round(etaSec/60)}m left` : `${etaSec}s left`;
          return (
            <div className="flex flex-col text-xs w-40">
              <div className="flex justify-between font-semibold text-blue-700 mb-1">
                <span>{prog}%</span>
                <span>{spd}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${prog}%` }}></div>
              </div>
              <span className="text-gray-500 text-[10px]">{row.processedRecords || 0} / {row.totalRecords || 0} ({etaStr})</span>
            </div>
          );
        }
        
        const total = row.totalRecords || 0;
        const inserted = row.insertedRecords !== undefined ? row.insertedRecords : (row.processedRecords || total);
        const skipped = row.skippedDuplicates || 0;

        return (
          <div className="flex flex-col text-xs">
            <span className="font-semibold text-green-700">Inserted: {inserted}</span>
            <span className="text-gray-500">Duplicates: {skipped}</span>
            <span className="text-gray-400 text-[10px]">Total: {total}</span>
          </div>
        );
      },
    },
    {
      header: 'Status',
      cell: (row) => {
        if (row.status === 'pending') {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
              <AlertCircle className="w-3 h-3 mr-1" /> Pending
            </span>
          );
        }
        if (row.status === 'queued') {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
              <div className="animate-pulse h-2 w-2 bg-indigo-500 rounded-full mr-1.5"></div>
              Queued
            </span>
          );
        }
        if (row.status === 'processing') {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
              <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full mr-1"></div>
              Processing
            </span>
          );
        }
        if (row.status === 'failed') {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700" title={row.errorMessage}>
              <AlertCircle className="w-3 h-3 mr-1" /> Failed
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
            <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> Success
          </span>
        );
      },
    },
    {
      header: 'Action',
      cell: (row) => (
        <Link
          to={`/files/${row._id}`}
          className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm font-semibold"
        >
          View Data
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Data</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload CSV, Excel, or GSheet files to import prospect companies.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors">
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.gsheet"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={uploadMutation.isPending}
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-full text-blue-500">
              <Upload className="w-8 h-8" />
            </div>
            {file ? (
              <div className="flex items-center space-x-2 text-gray-700">
                <FileText className="w-5 h-5" />
                <span className="font-medium">{file.name}</span>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">
                  CSV, Excel, GSheet files only (max. 10MB)
                </p>
              </div>
            )}
            <Button
              variant={file ? 'primary' : 'outline'}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              {file ? 'Change File' : 'Select File'}
            </Button>
          </div>
        </div>

        {file && (
          <div className="mt-6 flex flex-col items-end">
            <Button onClick={handleUpload} isLoading={uploadMutation.isPending} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Processing Import...' : 'Start Import'}
            </Button>
            {uploadMutation.isPending && (
              <p className="text-sm text-indigo-600 mt-2 font-medium animate-pulse">
                Data is being parsed and inserted into the database. Please do not close this window.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/50 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Import History</h2>
            <p className="text-xs text-gray-500 mt-0.5">Track when and what files employees utilized to upload data.</p>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" />
            <select
              className="border border-gray-300 rounded-lg p-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={historyUser}
              onChange={(e) => {
                setHistoryUser(e.target.value);
                setHistoryPage(1);
              }}
            >
              <option value="">All Users</option>
              {usersList.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
        <Table
          columns={columns}
          data={history}
          isLoading={isHistoryLoading}
          emptyMessage="No import history found."
        />

        {/* Pagination Footer */}
        {historyTotal > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-xs sm:text-sm text-gray-500 font-medium">
                Showing <span className="font-semibold text-gray-700">{Math.min((historyPage - 1) * historyLimit + 1, historyTotal)}</span> to{" "}
                <span className="font-semibold text-gray-700">{Math.min(historyPage * historyLimit, historyTotal)}</span> of{" "}
                <span className="font-semibold text-gray-700">{historyTotal}</span> logs
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">Per page:</span>
                <select
                  className="border border-gray-300 rounded-md p-1 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white cursor-pointer"
                  value={historyLimit}
                  onChange={(e) => {
                    setHistoryLimit(Number(e.target.value));
                    setHistoryPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setHistoryPage(Math.max(1, historyPage - 1))}
                disabled={historyPage === 1}
                className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${
                  historyPage === 1
                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                }`}
              >
                Previous
              </button>

              {Array.from({ length: historyTotalPages }, (_, i) => i + 1).map((p) => {
                if (historyTotalPages > 5 && p !== 1 && p !== historyTotalPages && Math.abs(p - historyPage) > 1) {
                  if (p === 2 && historyPage > 3) return <span key={p} className="px-1 text-gray-400 text-xs select-none">...</span>;
                  if (p === historyTotalPages - 1 && historyPage < historyTotalPages - 2) return <span key={p} className="px-1 text-gray-400 text-xs select-none">...</span>;
                  return null;
                }
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setHistoryPage(p)}
                    className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2 rounded-lg text-xs sm:text-sm font-semibold transition border ${
                      historyPage === p
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setHistoryPage(Math.min(historyTotalPages, historyPage + 1))}
                disabled={historyPage === historyTotalPages}
                className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${
                  historyPage === historyTotalPages
                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {warningModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Duplicate Records Detected</h3>
              <p className="text-sm text-gray-600 mb-4">
                This file contains <span className="font-bold text-amber-600">{pendingFileInfo?.duplicateCount}</span> duplicate records (matching company name).
              </p>
              <p className="text-sm text-gray-600">
                These duplicates will be automatically skipped during import. Only the remaining <span className="font-bold text-green-600">{pendingFileInfo?.totalRecords - pendingFileInfo?.duplicateCount}</span> unique records will be imported. Proceed?
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
              <Button variant="outline" onClick={() => cancelMutation.mutate(pendingFileInfo?.fileId)} disabled={cancelMutation.isPending || confirmMutation.isPending}>
                No, Cancel
              </Button>
              <Button variant="primary" onClick={() => confirmMutation.mutate(pendingFileInfo?.fileId)} isLoading={confirmMutation.isPending} disabled={cancelMutation.isPending || confirmMutation.isPending}>
                Yes, Import
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportPage;
