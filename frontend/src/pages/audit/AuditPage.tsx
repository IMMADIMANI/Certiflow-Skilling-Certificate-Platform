import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  userRole: string;
  previousStatus?: string;
  newStatus?: string;
  remarks?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface AuditResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-blue-100 text-blue-700',
  BATCH_CREATED: 'bg-purple-100 text-purple-700',
  BATCH_SUBMITTED: 'bg-indigo-100 text-indigo-700',
  BATCH_APPROVED: 'bg-green-100 text-green-700',
  BATCH_REJECTED: 'bg-red-100 text-red-700',
  BATCH_RETURNED: 'bg-yellow-100 text-yellow-700',
  BATCH_RESUBMITTED: 'bg-orange-100 text-orange-700',
  QUALITY_APPROVED: 'bg-teal-100 text-teal-700',
  QUALITY_REJECTED: 'bg-rose-100 text-rose-700',
  STATE_APPROVED: 'bg-emerald-100 text-emerald-700',
  CERTIFICATE_GENERATED: 'bg-cyan-100 text-cyan-700',
  CERTIFICATE_CANCELLED: 'bg-red-100 text-red-700',
  NOTIFICATION_SENT: 'bg-sky-100 text-sky-700',
  NOTIFICATION_FAILED: 'bg-orange-100 text-orange-700',
};

const ENTITY_ICONS: Record<string, string> = {
  BATCH: '📦',
  CERTIFICATE: '🏅',
  USER: '👤',
  NOTIFICATION: '📱',
  SYSTEM: '⚙️',
};

export default function AuditPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [page, debouncedSearch, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 20 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (actionFilter) params.action = actionFilter;
      const response = await api.get<AuditResponse>('/audit', { params });
      setLogs(response.data.logs || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) =>
    ACTION_COLORS[action] || 'bg-gray-100 text-gray-700';

  const getEntityIcon = (entityType: string) =>
    ENTITY_ICONS[entityType] || '📄';

  const formatRole = (role: string) =>
    role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const uniqueActions = Array.from(
    new Set(Object.keys(ACTION_COLORS))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
            <p className="text-sm text-gray-500">
              {total.toLocaleString()} total entries — tamper-proof record of all system actions
            </p>
          </div>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, batch ID, certificate ID..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Actions</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500">Loading audit logs...</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Shield className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium">No audit logs found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Time</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Action</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Entity</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status Change</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    {/* Time */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-900">
                        {format(new Date(log.createdAt), 'dd MMM yyyy')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(new Date(log.createdAt), 'HH:mm:ss')}
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs font-semibold text-gray-900">{log.userName || log.userId}</div>
                      <div className="text-xs text-gray-400">{formatRole(log.userRole || '')}</div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}
                      >
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Entity */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-gray-700">
                        {getEntityIcon(log.entityType)} {log.entityType}
                      </div>
                      <div className="text-xs text-gray-400 font-mono truncate max-w-[120px]">
                        {log.entityId}
                      </div>
                    </td>

                    {/* Status Change */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {log.previousStatus || log.newStatus ? (
                        <div className="flex items-center gap-1 text-xs">
                          {log.previousStatus && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-mono">
                              {log.previousStatus}
                            </span>
                          )}
                          {log.previousStatus && log.newStatus && (
                            <span className="text-gray-400">→</span>
                          )}
                          {log.newStatus && (
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-mono">
                              {log.newStatus}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Remarks */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-600 max-w-[200px] truncate" title={log.remarks}>
                        {log.remarks || <span className="text-gray-300">—</span>}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} ({total.toLocaleString()} entries)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
        🔒 <strong>Audit logs are immutable.</strong> All entries are write-once and protected from modification.
        Only authorized roles (District Officers, State Office, Quality Team) can view this log.
      </div>
    </div>
  );
}
