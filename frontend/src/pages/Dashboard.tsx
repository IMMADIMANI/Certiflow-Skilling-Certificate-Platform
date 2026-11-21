import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { batchApi, stateApi } from '../services/api';
import {
  FileText, CheckSquare, Award, AlertCircle, Clock,
  TrendingUp, Plus, ArrowRight, ShieldCheck, Users, RotateCcw,
  Sparkles
} from 'lucide-react';
import StatsCard from '../components/ui/StatsCard';
import StatusBadge from '../components/ui/StatusBadge';
import { Batch } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const br = await batchApi.list();
        setBatches(br.data);
        if (user?.role === 'STATE_OFFICE') {
          const sr = await stateApi.stats();
          setStats(sr.data);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const title = {
    TRAINING_CENTRE: 'Training Centre Portal',
    DISTRICT_OFFICER: 'District Officer Review Console',
    QUALITY_TEAM: 'Quality Assurance Board',
    STATE_OFFICE: 'State Skilling Authority Dashboard',
  }[user?.role || ''] || 'CertiFlow Dashboard';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Calculated stats for Training Centre
  const totalBatches = batches.length;
  const draftBatches = batches.filter(b => b.status === 'DRAFT').length;
  const submittedBatches = batches.filter(b => ['SUBMITTED', 'UNDER_REVIEW', 'QUALITY_REVIEW', 'STATE_REVIEW'].includes(b.status)).length;
  const approvedBatches = batches.filter(b => b.status === 'APPROVED').length;
  const returnedBatches = batches.filter(b => b.status === 'RETURNED').length;
  const totalCandidates = batches.reduce((acc, b) => acc + (b._count?.candidates || 0), 0);

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {user?.role?.replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Logged in as <strong className="text-slate-700">{user?.name}</strong> ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'TRAINING_CENTRE' && (
            <button
              onClick={() => navigate('/batches/create')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create New Batch
            </button>
          )}

          {user?.role === 'DISTRICT_OFFICER' && (
            <button
              onClick={() => navigate('/approvals')}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" /> Review Pending ({batches.length})
            </button>
          )}

          {user?.role === 'QUALITY_TEAM' && (
            <button
              onClick={() => navigate('/quality')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> Inspect Batches ({batches.length})
            </button>
          )}

          {user?.role === 'STATE_OFFICE' && (
            <button
              onClick={() => navigate('/state/pending')}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4" /> Final Approvals
            </button>
          )}
        </div>
      </div>

      {/* Role-specific Statistics */}
      {user?.role === 'TRAINING_CENTRE' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatsCard title="Total Batches" value={totalBatches} icon={FileText} color="blue" />
          <StatsCard title="Drafts" value={draftBatches} icon={Clock} color="yellow" />
          <StatsCard title="Under Review" value={submittedBatches} icon={TrendingUp} color="purple" />
          <StatsCard title="Certified" value={approvedBatches} icon={CheckSquare} color="green" />
          <StatsCard title="Returned" value={returnedBatches} icon={RotateCcw} color="red" />
          <StatsCard title="Candidates" value={totalCandidates} icon={Users} color="blue" />
        </div>
      )}

      {user?.role === 'DISTRICT_OFFICER' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="Awaiting Review" value={batches.length} icon={Clock} color="yellow" />
          <StatsCard title="Jurisdiction" value="District" icon={ShieldCheck} color="purple" />
          <StatsCard title="Dual-Approval Rule" value="Active (2/2)" icon={CheckSquare} color="green" />
          <StatsCard title="Overdue Alert" value=">48 Hours" icon={AlertCircle} color="red" />
        </div>
      )}

      {user?.role === 'QUALITY_TEAM' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatsCard title="High-Volume Batches" value={batches.length} icon={AlertCircle} color="yellow" />
          <StatsCard title="Review Threshold" value="≥50 Candidates" icon={ShieldCheck} color="purple" />
          <StatsCard title="Quality Status" value="Online" icon={CheckSquare} color="green" />
        </div>
      )}

      {user?.role === 'STATE_OFFICE' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatsCard title="Total Batches" value={stats.totalBatches} icon={FileText} color="blue" />
          <StatsCard title="Pending" value={stats.pendingBatches} icon={Clock} color="yellow" />
          <StatsCard title="Approved" value={stats.approvedBatches} icon={CheckSquare} color="green" />
          <StatsCard title="Certificates" value={stats.totalCerts} icon={Award} color="purple" />
          <StatsCard title="Active Certs" value={stats.activeCerts} icon={TrendingUp} color="green" />
          <StatsCard title="Overdue" value={stats.overdueBatches} icon={AlertCircle} color="red" />
        </div>
      )}

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/verify')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">Public Certificate Verifier</h3>
            <p className="text-xs text-slate-500 mt-0.5">Test real-time public authenticity & cancellation check</p>
          </div>
        </div>

        {user?.role === 'TRAINING_CENTRE' && (
          <div
            onClick={() => navigate('/batches/create')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Upload New Spreadsheet</h3>
              <p className="text-xs text-slate-500 mt-0.5">Supports CSV & Excel candidate matrices</p>
            </div>
          </div>
        )}

        {['DISTRICT_OFFICER', 'STATE_OFFICE'].includes(user?.role || '') && (
          <div
            onClick={() => navigate('/audit')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md cursor-pointer transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">Immutable Audit Trails</h3>
              <p className="text-xs text-slate-500 mt-0.5">Track every approval, return, and cancellation timestamp</p>
            </div>
          </div>
        )}

        {user?.role === 'STATE_OFFICE' && (
          <div
            onClick={() => navigate('/state/certificates')}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md cursor-pointer transition-all flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">Certificate Registry & Revocation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Download issued certificates or revoke invalid credentials</p>
            </div>
          </div>
        )}
      </div>

      {/* Batches Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {user?.role === 'DISTRICT_OFFICER' ? 'Batches Awaiting Your District Review' : 'Recent Batches'}
            </h2>
            <p className="text-xs text-slate-400">Total {batches.length} record(s) loaded</p>
          </div>
          <button
            onClick={() => navigate(user?.role === 'DISTRICT_OFFICER' ? '/approvals' : '/batches')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {batches.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-slate-700">No active batches in your queue</p>
            <p className="text-xs text-slate-400 mt-0.5">All pending tasks have been cleared or not submitted yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {batches.slice(0, 6).map((b) => (
              <div
                key={b.id}
                onClick={() => navigate(user?.role === 'DISTRICT_OFFICER' ? '/approvals' : `/batches/${b.id}`)}
                className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {b.courseType?.substring(0, 2).toUpperCase() || 'SC'}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {b.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {b.courseType} • {b._count?.candidates || 0} candidate(s) • Training Centre: {b.trainingCentre?.name || 'Sunrise'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={b.status} />
                  <span className="text-slate-300 text-sm group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
