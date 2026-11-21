import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { batchApi } from '../../services/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const COURSE_TYPES = ['Web Development', 'Mobile App Development', 'Data Science', 'Digital Marketing', 'Financial Literacy', 'Entrepreneurship', 'Tailoring & Embroidery', 'Electrical Work', 'Plumbing', 'Beauty & Wellness', 'Computer Basics', 'Other'];
const DURATIONS = ['1 month', '2 months', '3 months', '6 months', '1 year'];

export default function CreateBatchPage() {
  const [form, setForm] = useState({ title: '', description: '', courseType: '', courseDuration: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await batchApi.create(form);
      toast.success('Batch created! Now upload candidates.');
      navigate(`/batches/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create batch');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-8 max-w-2xl">
      <button onClick={() => navigate('/batches')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Batches
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Batch</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Title *</label>
            <input className="input" placeholder="e.g., Web Development Batch – Nov 2024"
              value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea className="input" rows={3} placeholder="Brief description of this batch..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Type *</label>
            <select className="input" value={form.courseType} onChange={e => set('courseType', e.target.value)} required>
              <option value="">Select course type...</option>
              {COURSE_TYPES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Duration *</label>
            <select className="input" value={form.courseDuration} onChange={e => set('courseDuration', e.target.value)} required>
              <option value="">Select duration...</option>
              {DURATIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/batches')} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
        <strong>Next step:</strong> After creating the batch, you'll be taken to the batch detail page where you can upload the candidate Excel/CSV file.
      </div>
    </div>
  );
}
