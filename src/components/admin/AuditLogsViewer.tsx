import React, { useState, useEffect } from 'react';
import { AuditLog } from '../../types';
import { adminAuthService } from '../../services/adminAuthService';
import {
  Search,
  Download,
  Filter,
  RefreshCw,
  Clock,
  Shield,
  User,
  ArrowRight,
  Eye,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const AuditLogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [action, setAction] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await adminAuthService.getAuditLogs({
        page,
        limit,
        search: search.trim() || undefined,
        category: category !== 'all' ? category : undefined,
        action: action !== 'all' ? action : undefined,
      });
      setLogs(res.logs || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, category, action]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleExportCsv = async () => {
    await adminAuthService.exportAuditLogsCsv();
  };

  const getActionBadgeColor = (actionName: string) => {
    if (actionName.includes('LOGIN') || actionName.includes('MASTER_INITIALIZED')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (actionName.includes('LOGOUT') || actionName.includes('DELETE')) {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
    if (actionName.includes('UPDATE') || actionName.includes('SYNC')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    if (actionName.includes('CREATE') || actionName.includes('UPLOAD')) {
      return 'bg-purple-50 text-purple-800 border-purple-200';
    }
    return 'bg-stone-50 text-stone-700 border-stone-200';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E0D5] space-y-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A25828]">
                Enterprise Security &amp; Compliance
              </span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Persistent Audit Trail
              </span>
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#221C18] mt-1">
              Store Activity &amp; Audit Logs
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Immutable record of logins, security events, price modifications, content updates, and store design changes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={isLoading}
              title="Refresh Logs"
              className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExportCsv}
              className="bg-[#A25828] hover:bg-[#8A461A] text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit CSV</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search audit trail by user, email, action, product, or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-stone-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-stone-900 cursor-pointer w-full sm:w-auto"
            >
              Search
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-stone-400 text-[11px] font-semibold mr-1 shrink-0">Category:</span>
            {[
              { id: 'all', label: 'All Activities' },
              { id: 'auth', label: 'Authentication & Logins' },
              { id: 'products', label: 'Products & Pricing' },
              { id: 'categories', label: 'Categories' },
              { id: 'design', label: 'Store Design' },
              { id: 'users', label: 'Users & Permissions' },
              { id: 'settings', label: 'Store Settings' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
                  category === cat.id
                    ? 'bg-[#A25828] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200 font-bold">
                <tr>
                  <th className="py-3 px-4">Timestamp (UK)</th>
                  <th className="py-3 px-4">User &amp; Role</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Target / Entity</th>
                  <th className="py-3 px-4">Activity Description</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      {isLoading ? 'Loading audit records...' : 'No activity logs found matching the filter criteria.'}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const dateFormatted = new Date(log.timestamp).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });

                    return (
                      <tr key={log.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                          {dateFormatted}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-bold text-stone-900 block">{log.userName || 'System'}</span>
                          <span className="text-[10px] text-stone-400 block font-mono">{log.userEmail || '-'}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#A25828]">
                            {log.userRole || 'admin'}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-stone-900 whitespace-nowrap max-w-[150px] truncate">
                          {log.target}
                        </td>
                        <td className="py-3 px-4 text-stone-600 max-w-[280px] leading-relaxed">
                          {log.details}
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-stone-400 whitespace-nowrap">
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {log.beforeAfter ? (
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="text-[#A25828] hover:underline font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Diff</span>
                            </button>
                          ) : (
                            <span className="text-stone-300 text-[10px]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-[#FAF8F5] border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
            <div>
              Showing <strong className="text-stone-800">{logs.length}</strong> of{' '}
              <strong className="text-stone-800">{total}</strong> recorded activities
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white font-semibold disabled:opacity-40 cursor-pointer"
              >
                &larr; Previous
              </button>
              <span className="font-mono text-stone-700">
                Page {page} of {totalPages || 1}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white font-semibold disabled:opacity-40 cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Before / After Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSelectedLog(null)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 z-10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif font-bold text-lg text-[#221C18]">
                Audit Parameter Details
              </h3>
              <button onClick={() => setSelectedLog(null)} className="p-1 rounded-full text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-500 pb-2 border-b">
                <span>Action: <strong>{selectedLog.action}</strong></span>
                <span>User: <strong>{selectedLog.userName}</strong></span>
              </div>
              <p className="text-stone-700 py-1">{selectedLog.details}</p>

              {selectedLog.beforeAfter && (
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-stone-200 font-mono text-[11px] space-y-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">Field Modifications:</span>
                  <pre className="overflow-x-auto whitespace-pre-wrap text-stone-800">
                    {JSON.stringify(selectedLog.beforeAfter, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
