import React, { useEffect, useState } from 'react';
import { certApi, stateApi } from '../../services/api';
import { Certificate } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { Award, Download, XCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = () => { certApi.list().then(r => setCerts(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleCancel = async () => {
    if (!cancelId || !reason.trim()) { toast.error('Reason required'); return; }
    setProcessing(true);
    try {
      await stateApi.cancelCert(cancelId, reason);
      toast.success('Certificate cancelled successfully');
      setCancelId(null); setReason(''); load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Cancel failed');
    } finally { setProcessing(false); }
  };

  const filtered = certs.filter(c =>
    c.certificateNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.candidate?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Certificates ({certs.length})</h1>
        <p className="text-gray-500 text-sm">Manage and cancel issued certificates</p>
      </div>

      <div className="card mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by certificate number or candidate name…"
            value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">{certs.length === 0 ? 'No certificates yet' : 'No matching certificates'}</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-header">Certificate #</th>
                <th className="table-header">Candidate</th>
                <th className="table-header">Course</th>
                <th className="table-header">Training Centre</th>
                <th className="table-header">Issued</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(cert => (
                <tr key={cert.id} className={`hover:bg-gray-50 ${cert.status === 'CANCELLED' ? 'opacity-60' : ''}`}>
                  <td className="table-cell font-mono text-xs">{cert.certificateNumber}</td>
                  <td className="table-cell font-medium">{cert.candidate?.name}</td>
                  <td className="table-cell text-gray-500">{cert.candidate?.courseCompleted}</td>
                  <td className="table-cell text-gray-500">{cert.batch?.trainingCentre?.name}</td>
                  <td className="table-cell text-gray-400 text-xs">{new Date(cert.issuedAt).toLocaleDateString('en-IN')}</td>
                  <td className="table-cell"><StatusBadge status={cert.status} /></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <a href={certApi.downloadUrl(cert.id)} target="_blank" rel="noopener"
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </a>
                      {cert.status === 'ACTIVE' && (
                        <button onClick={() => { setCancelId(cert.id); setReason(''); }}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50" title="Cancel certificate">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelId && (
        <div className="modal-overlay" onClick={() => setCancelId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-red-700 mb-2">⚠️ Cancel Certificate</h3>
            <p className="text-sm text-gray-600 mb-4">
              This action is <strong>irreversible</strong>. The certificate will immediately appear as cancelled on
              the public verification portal. The candidate will not be able to use this certificate.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation reason * (required)</label>
              <textarea className="input" rows={3} value={reason} onChange={e => setReason(e.target.value)}
                placeholder="State the reason for cancellation (e.g., fraudulent submission, duplicate record)…" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelId(null)} className="btn-secondary flex-1 justify-center" disabled={processing}>Keep Active</button>
              <button onClick={handleCancel} disabled={processing || !reason.trim()} className="btn-danger flex-1 justify-center">
                {processing ? 'Cancelling…' : 'Cancel Certificate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
