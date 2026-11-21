import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { batchApi, stateApi } from '../services/api';
import { FileText, CheckSquare, Award, AlertCircle, Clock, TrendingUp, Plus, ArrowRight } from 'lucide-react';
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
        setBatches(br.data.slice(0, 6));
        if (user?.role === 'STATE_OFFICE') {
          const sr = await stateApi.stats();
          setStats(sr.data);
        }
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [user]);

  const title = {
    TRAINING_CENTRE: 'Training Centre Dashboard',
    DISTRICT_OFFICER: 'District Officer Dashboard',
    QUALITY_TEAM: 'Quality Review Dashboard',
    STATE_OFFICE: 'State Office Dashboard',
  }[user?.role || ''] || 'Dashboard';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-1">Welcome back, <strong>{user?.name}</strong></p>
        </div>
        {user?.role === 'TRAINING_CENTRE' && (
          <button onClick={() => navigate('/batches/create')} className="btn-primary">
            <Plus className="w-4 h-4" /> New Batch
          </button>
        )}
      </div>

      {/* Stats for State Office */}
      {user?.role === 'STATE_OFFICE' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatsCard title="Total Batches" value={stats.totalBatches} icon={FileText} color="blue" />
          <StatsCard title="Pending" value={stats.pendingBatches} icon={Clock} color="yellow" />
          <StatsCard title="Approved" value={stats.approvedBatches} icon={CheckSquare} color="green" />
          <StatsCard title="Certificates" value={stats.totalCerts} icon={Award} color="purple" />
          <StatsCard title="Active Certs" value={stats.activeCerts} icon={TrendingUp} color="green" />
          <StatsCard title="Overdue" value={stats.overdueBatches} icon={AlertCircle} color="red" />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {user?.role === 'DISTRICT_OFFICER' && (
          <div onClick={() => navigate('/approvals')} className="card cursor-pointer hover:shadow-md transition-shadow border-l-4 border-purple-500">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-purple-500" />
              <div>
                <p className="font-semibold">Pending Approvals</p>
                <p className="text-sm text-gray-500">Review submitted batches</p>
              </div>
            </div>
          </div>
        )}
        {user?.role === 'QUALITY_TEAM' && (
          <div onClick={() => navigate('/quality')} className="card cursor-pointer hover:shadow-md transition-shadow border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-semibold">Quality Review</p>
                <p className="text-sm text-gray-500">Review large batches</p>
              </div>
            </div>
          </div>
        )}
        {user?.role === 'STATE_OFFICE' && (
          <div onClick={() => navigate('/state/pending')} className="card cursor-pointer hover:shadow-md transition-shadow border-l-4 border-orange-500">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-orange-500" />
              <div>
                <p className="font-semibold">Final Approvals</p>
                <p className="text-sm text-gray-500">Give state-level approval</p>
              </div>
            </div>
          </div>
        )}
        <div onClick={() => navigate('/verify')} className="card cursor-pointer hover:shadow-md transition-shadow border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-blue-500" />
            <div>
              <p className="font-semibold">Verify Certificate</p>
              <p className="text-sm text-gray-500">Public verification portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Batches */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Batches</h2>
          <button onClick={() => navigate('/batches')} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {batches.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No batches yet</p>
            {user?.role === 'TRAINING_CENTRE' && (
              <button onClick={() => navigate('/batches/create')} className="btn-primary mt-3 text-sm">
                Create First Batch
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {batches.map(b => (
              <div key={b.id} onClick={() => navigate(`/batches/${b.id}`)}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{b.title}</p>
                  <p className="text-xs text-gray-500">{b.courseType} · {b._count?.candidates || 0} candidates · {b.trainingCentre?.name}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
