import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { batchApi } from '../../services/api';
import { Batch } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { Plus, FileText, AlertCircle, Search } from 'lucide-react';

export default function BatchListPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    batchApi.list().then(r => setBatches(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = batches.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.courseType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
          <p className="text-gray-500 text-sm">{batches.length} total</p>
        </div>
        <button onClick={() => navigate('/batches/create')} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Batch
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-5 flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search batches..." value={search}
            onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-auto">
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="QUALITY_REVIEW">Quality Review</option>
          <option value="STATE_REVIEW">State Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="RETURNED">Returned</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No batches found</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header">Batch Title</th>
                <th className="table-header">Course Type</th>
                <th className="table-header">Candidates</th>
                <th className="table-header">District</th>
                <th className="table-header">Status</th>
                <th className="table-header">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(b => (
                <tr key={b.id} onClick={() => navigate(`/batches/${b.id}`)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors">
                  <td className="table-cell">
                    <p className="font-medium text-gray-900">{b.title}</p>
                    {b.returnReason && (
                      <p className="text-xs text-yellow-600 flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3 h-3" /> Returned: {b.returnReason.substring(0, 40)}…
                      </p>
                    )}
                  </td>
                  <td className="table-cell">{b.courseType}</td>
                  <td className="table-cell font-medium">{b._count?.candidates || 0}</td>
                  <td className="table-cell text-gray-500">{b.trainingCentre?.district?.name || '—'}</td>
                  <td className="table-cell"><StatusBadge status={b.status} /></td>
                  <td className="table-cell text-gray-400 text-xs">{new Date(b.updatedAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
