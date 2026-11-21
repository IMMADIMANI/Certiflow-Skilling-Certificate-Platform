import React, { useEffect, useState } from 'react';
import { stateApi } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import { Award, Users, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StatePendingPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalBatch, setModalBatch] = useState<string | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = () => { stateApi.pending().then(r => setBatches(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleAction = async () => {
    if (!modalBatch || !action) return;
    if (action === 'reject' && !remarks.trim()) { toast.error('Rejection reason required'); return; }
    setProcessing(true);
    try {
      if (action === 'approve') await stateApi.approve(modalBatch, remarks);
      else await stateApi.reject(modalBatch, remarks);
      toast.success(action === 'approve' ? '🎉 Batch approved! Certificates are being generated.' : 'Batch rejected');
      setModalBatch(null); setRemarks(''); setAction(null); load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally { setProcessing(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending State Approval</h1>
        <p className="text-gray-500 text-sm mt-1">Final approval stage — approved batches trigger automatic certificate generation</p>
      </div>

      {batches.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No batches awaiting state approval</p>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map(b => (
            <div key={b.id} className="card border-l-4 border-orange-400">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{b.title}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {b._count?.candidates} candidates</span>
                    <span>{b.trainingCentre?.name}</span>
                    <span>{b.trainingCentre?.district?.name}</span>
                    <span>{b.courseType}</span>
                  </div>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {(b.districtApprovals || []).filter((a: any) => a.decision === 'APPROVED').map((a: any) => (
                      <span key={a.id} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                        ✓ {a.officer.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setModalBatch(b.id); setAction('approve'); setRemarks(''); }} className="btn-success">
                    <CheckCircle className="w-4 h-4" /> Final Approve
                  </button>
                  <button onClick={() => { setModalBatch(b.id); setAction('reject'); setRemarks(''); }} className="btn-danger">Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalBatch && action && (
        <div className="modal-overlay" onClick={() => { setModalBatch(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">{action === 'approve' ? '🏛️ Final Approval' : '✗ Reject Batch'}</h3>
            {action === 'approve' && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <strong>What happens next:</strong> All candidates in this batch will receive PDF certificates automatically.
                WhatsApp notifications will be sent to each candidate.
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks {action === 'reject' ? '* (required)' : '(optional)'}
              </label>
              <textarea className="input" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalBatch(null)} className="btn-secondary flex-1 justify-center" disabled={processing}>Cancel</button>
              <button onClick={handleAction} disabled={processing}
                className={`flex-1 justify-center btn text-white ${action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {processing ? 'Processing…' : `Confirm ${action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
