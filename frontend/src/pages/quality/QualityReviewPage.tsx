import React, { useEffect, useState } from 'react';
import { qualityApi } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import { CheckSquare, Users, Info, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QualityReviewPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [decision, setDecision] = useState('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  const load = () => { qualityApi.list().then(r => setBatches(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleReview = async () => {
    if (!reviewing) return;
    if (decision === 'REJECTED' && !remarks.trim()) { toast.error('Remarks required for rejection'); return; }
    setProcessing(true);
    try {
      await qualityApi.review(reviewing, decision, remarks);
      toast.success(`Quality review: ${decision}`);
      setReviewing(null); setDecision('APPROVED'); setRemarks('');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Review failed');
    } finally { setProcessing(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quality Review</h1>
        <p className="text-gray-500 text-sm mt-1">Large batches (50+ candidates) require quality review before state approval</p>
      </div>

      <div className="mb-5 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <strong>Quality Review Threshold:</strong> Batches with 50 or more candidates are automatically routed here
          for additional quality scrutiny before the State Office gives final approval.
          This threshold is configurable via the <code>QUALITY_REVIEW_THRESHOLD</code> environment variable.
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No batches awaiting quality review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map(b => (
            <div key={b.id} className="card">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{b.title}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {b._count?.candidates} candidates</span>
                    <span>{b.trainingCentre?.name}</span>
                    <span>{b.trainingCentre?.district?.name}</span>
                    <span>{b.courseType}</span>
                  </div>
                </div>
                <button onClick={() => { setReviewing(b.id); setDecision('APPROVED'); setRemarks(''); }} className="btn-primary">
                  Review Batch
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewing && (
        <div className="modal-overlay" onClick={() => setReviewing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Quality Review Decision</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Decision *</label>
              <div className="flex gap-3">
                <button onClick={() => setDecision('APPROVED')}
                  className={`flex-1 py-2.5 rounded-lg border-2 font-medium text-sm transition-colors ${decision === 'APPROVED' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                  ✓ Approve
                </button>
                <button onClick={() => setDecision('REJECTED')}
                  className={`flex-1 py-2.5 rounded-lg border-2 font-medium text-sm transition-colors ${decision === 'REJECTED' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'}`}>
                  ✗ Reject
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks {decision === 'REJECTED' ? '* (required)' : '(optional)'}
              </label>
              <textarea className="input" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)}
                placeholder="Quality review findings…" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReviewing(null)} className="btn-secondary flex-1 justify-center" disabled={processing}>Cancel</button>
              <button onClick={handleReview} disabled={processing}
                className={`flex-1 justify-center btn text-white ${decision === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {processing ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
