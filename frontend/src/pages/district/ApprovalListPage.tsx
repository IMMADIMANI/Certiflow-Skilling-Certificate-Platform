import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { approvalApi } from '../../services/api';
import { Batch } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { Clock, Users, CheckSquare, AlertTriangle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApprovalListPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalBatch, setModalBatch] = useState<string | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | 'return' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    approvalApi.list().then(r => setBatches(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openModal = (batchId: string, act: 'approve' | 'reject' | 'return') => {
    setModalBatch(batchId); setAction(act); setRemarks('');
  };
  const closeModal = () => { setModalBatch(null); setAction(null); setRemarks(''); };

  const handleAction = async () => {
    if (!modalBatch || !action) return;
    if ((action === 'reject' || action === 'return') && !remarks.trim()) {
      toast.error('Please provide a reason'); return;
    }
    setProcessing(true);
    try {
      if (action === 'approve') await approvalApi.approve(modalBatch, remarks);
      else if (action === 'reject') await approvalApi.reject(modalBatch, remarks);
      else await approvalApi.returnBatch(modalBatch, remarks);
      toast.success(`Batch ${action === 'return' ? 'returned' : action + 'd'} successfully`);
      closeModal(); load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || `Failed to ${action} batch`);
    } finally { setProcessing(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">District Approval Queue</h1>
        <p className="text-gray-500 text-sm mt-1">Batches require 2 district officer approvals to advance</p>
      </div>

      {batches.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No batches pending approval</p>
          <p className="text-sm mt-1">All caught up! Check back later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map(batch => {
            const hoursOld = batch.submittedAt
              ? Math.floor((Date.now() - new Date(batch.submittedAt).getTime()) / 3600000)
              : 0;
            const isOverdue = hoursOld > 48;
            const approvalCount = (batch.districtApprovals || []).filter((a: any) => a.decision === 'APPROVED').length;

            return (
              <div key={batch.id} className={`card ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">{batch.title}</h3>
                      <StatusBadge status={batch.status} />
                      {isOverdue && (
                        <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                          <AlertTriangle className="w-3 h-3" /> Overdue ({hoursOld}h)
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {batch._count?.candidates || 0} candidates</span>
                      <span>{batch.trainingCentre?.name}</span>
                      <span>{batch.trainingCentre?.district?.name}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />
                        {batch.submittedAt ? `Submitted ${hoursOld}h ago` : 'Not yet submitted'}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs font-medium text-gray-500">Approvals: {approvalCount}/2</span>
                      {(batch.districtApprovals || []).map((a: any) => (
                        <span key={a.id} className={`text-xs px-2 py-0.5 rounded-full ${
                          a.decision === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          ✓ {a.officer.name} ({a.decision})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => navigate(`/batches/${batch.id}`)} className="btn-secondary text-xs py-1.5">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button onClick={() => openModal(batch.id, 'approve')} className="btn-success text-xs py-1.5">Approve</button>
                    <button onClick={() => openModal(batch.id, 'return')} className="btn-warning text-xs py-1.5">Return</button>
                    <button onClick={() => openModal(batch.id, 'reject')} className="btn-danger text-xs py-1.5">Reject</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Modal */}
      {modalBatch && action && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1 capitalize">
              {action === 'approve' ? '✓ Approve Batch' : action === 'reject' ? '✗ Reject Batch' : '↩ Return for Correction'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {action === 'approve' ? 'This counts as your approval. 2 approvals needed to advance.' :
               action === 'reject' ? 'The batch will be rejected. Training centre will be notified.' :
               'Batch will be returned to training centre for corrections.'}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {action === 'approve' ? 'Remarks (optional)' : 'Reason * (required)'}
              </label>
              <textarea className="input" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)}
                placeholder={action === 'approve' ? 'Optional remarks…' : 'Explain why…'} />
            </div>
            <div className="flex gap-3">
              <button onClick={closeModal} className="btn-secondary flex-1 justify-center" disabled={processing}>Cancel</button>
              <button onClick={handleAction} disabled={processing}
                className={`flex-1 justify-center btn text-white ${
                  action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-yellow-500 hover:bg-yellow-600'}`}>
                {processing ? 'Processing…' : `Confirm ${action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
