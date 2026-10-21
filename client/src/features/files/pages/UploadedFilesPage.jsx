import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../api/axios';
import { useFiles } from '../hooks/useFiles';
import { useAuth } from '../../../hooks/useAuth';
import { useDeleteFile } from '../hooks/useDeleteFile';
import { FileText, Calendar, Database, Eye, ServerCrash, User, AlertTriangle } from 'lucide-react';

const UploadedFilesPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(12);
  const [hasActiveImports, setHasActiveImports] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const { data: filesResponse, isLoading } = useFiles(
    { page, limit: limitPerPage },
    {
      refetchInterval: hasActiveImports ? 2000 : false,
    }
  );
  const { user } = useAuth();
  const deleteFileMutation = useDeleteFile();
  
  const files = filesResponse?.data || [];
  const total = filesResponse?.total || 0;
  const totalPages = filesResponse?.totalPages || 1;

  React.useEffect(() => {
    const active = files.some(
      (file) => file.status === 'pending' || file.status === 'processing'
    );
    if (active !== hasActiveImports) {
      setHasActiveImports(active);
    }
  }, [files, hasActiveImports]);

  return (
    <div className="space-y-6 font-sans antialiased text-slate-800">
      {/* Premium Header Zone */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b-2 border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>Data Vault</span>
            <span className="text-slate-300">/</span>
            <span className="text-indigo-600 font-mono">Assets Registry</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-600" />
            Uploaded Dataset Files
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse and manage all parsed binary matrices ingested into the Prospect Data Engine.
          </p>
        </div>
      </div>

      {/* Grid States Ingestion Layer */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200/60 shadow-sm">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200 border-t-indigo-600 mx-auto mb-3"></div>
          <span className="font-semibold text-slate-600">Resolving dataset manifests...</span>
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200/60 text-center shadow-sm min-h-[45vh]">
          <div className="p-4 bg-slate-50 rounded-xl text-slate-400 mb-4 border border-slate-100">
            <ServerCrash className="w-10 h-10 text-slate-300 animate-pulse" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No active pipelines indexed</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            No system prospect files have been imported matching your filters. Use the data broker pipeline to inject your first dataset workbook asset.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => {
              const isExcel =
                file.originalName?.endsWith('.xlsx') ||
                file.fileName?.endsWith('.xlsx') ||
                file.sourceType === 'excel';

              return (
                <div
                  key={file._id}
                  className="bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col shadow-md shadow-zinc-500 justify-between hover:shadow-md hover:border-indigo-300 transition-all duration-150 group cursor-pointer"
                  onClick={() => navigate(`/files/${file._id}`)}
                >
                  <div className="space-y-4">
                    {/* File Tag Badges & Meta Meta */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded border tracking-wide font-mono shadow-sm ${isExcel
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}>
                          {isExcel ? 'Excel Layer' : 'Flat CSV Structure'}
                        </span>
                        
                        {/* Real-time Worker Thread Status Badges */}
                        {(file.status || 'completed') === 'pending' ? (
                          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded border tracking-wide font-mono shadow-sm bg-amber-50 text-amber-700 border-amber-100 animate-pulse">Pending</span>
                        ) : (file.status === 'processing' ? (
                          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded border tracking-wide font-mono shadow-sm bg-blue-50 text-blue-700 border-blue-100 animate-pulse">Processing ({file.progress || 0}%)</span>
                        ) : (file.status === 'failed' ? (
                          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded border tracking-wide font-mono shadow-sm bg-rose-50 text-rose-700 border-rose-100 cursor-help" title={file.errorMessage || 'An error occurred in the background worker.'}>Failed</span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded border tracking-wide font-mono shadow-sm bg-emerald-50 text-emerald-700 border-emerald-100">Completed</span>
                        )))}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(file.uploadedAt || file.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Operational Title Details */}
                    <div>
                      <h3 className="font-semibold text-slate-900 text-[13px] tracking-wide group-hover:text-indigo-600 transition-colors line-clamp-1" title={file.originalName || file.fileName}>
                        {file.originalName || file.fileName}
                      </h3>
                      <div className="mt-1.5 flex items-center gap-3">
                        <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200/40 select-all">
                          HEX: {file._id?.slice(-6).toUpperCase() || 'EXTERNAL'}
                        </span>
                        {file.uploadedBy && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                            <User className="w-3 h-3" />
                            {file.uploadedBy.name}
                          </span>
                        )}
                      </div>

                      {/* Premium Progress Bar */}
                      {(file.status === 'pending' || file.status === 'processing') && (
                        <div className="mt-3.5">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
                            <span>Ingesting data matrix...</span>
                            <span>{file.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/40 shadow-inner">
                            <div 
                              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300 animate-pulse"
                              style={{ width: `${file.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {file.status === 'failed' && (
                        <div className="mt-2 text-[10px] text-rose-600 font-medium bg-rose-50 border border-rose-100 rounded px-2 py-1 leading-relaxed line-clamp-2" title={file.errorMessage}>
                          Error: {file.errorMessage || 'Worker execution failed'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grid Item Footer Elements */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-5">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Sequences</span>
                      <span className="font-semibold text-indigo-950 text-xs bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100/50 mt-0.5 inline-block">
                        {file.status === 'processing'
                          ? `${(file.processedRecords || 0).toLocaleString()} / ${(file.totalRecords || 0).toLocaleString()} rows`
                          : `${(file.totalRecords ?? 0).toLocaleString()} rows`
                        }
                      </span>
                      {/* Skipped duplicates indicator removed per UX request */}
                    </div>

                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/files/${file._id}`);
                        }}
                        disabled={file.status === 'pending' || file.status === 'processing'}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 border ${
                          file.status === 'pending' || file.status === 'processing'
                            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600 border-slate-200'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    {user && (user.role === 'admin' || user.role === 'superadmin') && (
                      <div className="ml-2 inline-block" title={file.status === 'uploading' || file.status === 'processing' ? 'Cannot delete file while upload/import is in progress.' : ''}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileToDelete(file);
                          }}
                          disabled={deleteFileMutation.isPending || file.status === 'uploading' || file.status === 'processing'}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white ${(deleteFileMutation.isPending || file.status === 'uploading' || file.status === 'processing') ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} border border-red-600 rounded-lg shadow-sm transition-all duration-150`}
                        >
                          <ServerCrash className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          {total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-xs sm:text-sm text-gray-500 font-medium">
                  Showing <span className="font-semibold text-gray-700">{Math.min((page - 1) * limitPerPage + 1, total)}</span> to{" "}
                  <span className="font-semibold text-gray-700">{Math.min(page * limitPerPage, total)}</span> of{" "}
                  <span className="font-semibold text-gray-700">{total}</span> files
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">Per page:</span>
                  <select
                    className="border border-gray-300 rounded-md p-1 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white cursor-pointer"
                    value={limitPerPage}
                    onChange={(e) => {
                      setLimitPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${
                    page === 1
                      ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                  }`}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (totalPages > 5 && p !== 1 && p !== totalPages && Math.abs(p - page) > 1) {
                    if (p === 2 && page > 3) return <span key={p} className="px-1 text-gray-400 text-xs select-none">...</span>;
                    if (p === totalPages - 1 && page < totalPages - 2) return <span key={p} className="px-1 text-gray-400 text-xs select-none">...</span>;
                    return null;
                  }
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2 rounded-lg text-xs sm:text-sm font-semibold transition border ${
                        page === p
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
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${
                    page === totalPages
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
      )}

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-50 rounded-full text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Dataset Asset</h3>
                <p className="text-sm text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to permanently delete the file <span className="font-semibold text-slate-900">"{fileToDelete.originalName || fileToDelete.fileName}"</span> and all its imported prospect records?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={deleteFileMutation.isPending}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteFileMutation.mutateAsync(fileToDelete._id);
                    toast.success('File and related data deleted successfully');
                    setFileToDelete(null);
                  } catch (err) {
                    console.error(err);
                    toast.error(err?.response?.data?.message || 'Failed to delete file');
                  }
                }}
                disabled={deleteFileMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-200 transition-all disabled:opacity-50"
              >
                {deleteFileMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <ServerCrash className="w-4 h-4" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadedFilesPage;