import React, { useState } from 'react';
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { Shield, HelpCircle, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_USERS = [
  { name: 'Anika Singh', role: 'Training Centre', email: 'anika@certiflow.in' },
  { name: 'Dev Sharma', role: 'District Officer (North)', email: 'dev@certiflow.in' },
  { name: 'Meera Patel', role: 'District Officer (South)', email: 'meera@certiflow.in' },
  { name: 'Kabir Khan', role: 'District Officer (East)', email: 'kabir@certiflow.in' },
  { name: 'Neha Gupta', role: 'Quality Team', email: 'neha@certiflow.in' },
  { name: 'Farah Irani', role: 'State Office', email: 'farah@certiflow.in' },
];

export default function Layout() {
  const { user, isLoading, quickSwitch } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Loading CertiFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const handleSwitch = async (email: string) => {
    if (email === user.email) return;
    setSwitching(true);
    try {
      await quickSwitch(email);
      toast.success(`Switched role to ${email.split('@')[0]}!`, { icon: '🔄' });
      navigate('/dashboard');
    } catch {
      toast.error('Failed to switch role');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Enterprise Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shadow-xs">
          {/* Left Gov branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
                System Live
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-500 hidden md:inline">
                National Skilling Registry • <strong>Hackathon Demo Sandbox</strong>
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Switcher Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium pl-2 hidden sm:inline">Switch Role:</span>
              <select
                value={user.email}
                disabled={switching}
                onChange={(e) => handleSwitch(e.target.value)}
                className="bg-white font-semibold text-slate-800 rounded-lg px-2.5 py-1 border border-slate-300 shadow-xs focus:outline-hidden cursor-pointer"
              >
                {DEMO_USERS.map((u) => (
                  <option key={u.email} value={u.email}>
                    {u.name} — {u.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Scenarios Cheatsheet Button */}
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-xs cursor-pointer"
              title="View Hackathon Scenarios Guide"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scenario Guide</span>
            </button>

            {/* Public Verify Portal button */}
            <Link
              to="/verify"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span>Public Verify</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Main page content */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Hackathon Scenarios Modal Guide for Judges */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">CertiFlow Hackathon Scenarios Checklist</h3>
                  <p className="text-xs text-slate-500">Test every mandatory criteria directly in the UI</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Scenario 1 */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-blue-900">Scenario 1: Invalid CSV Upload</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-200 text-blue-800">Anika (Training Centre)</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Go to <strong>My Batches</strong> → Click a draft or <strong>Create Batch</strong> → Drop <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200">backend/samples/sample_invalid_rows.csv</code>.
                  System flags missing fields, invalid phone, wrong date with row numbers, and saves <strong>0 invalid rows</strong>.
                </p>
              </div>

              {/* Scenario 2 */}
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-purple-900">Scenario 2: Dual District Officer Approval</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-200 text-purple-800">Dev & Meera</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Switch to <strong>Dev Sharma</strong> → Click Approve on batch. Switch to <strong>Meera Patel</strong> → Approve the same batch. Batch requires <strong>exactly 2 distinct approvals</strong> before proceeding to State/Quality!
                </p>
              </div>

              {/* Scenario 3 */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-900">Scenario 3: 60 Candidates & Large Batch Review</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">Anika → Neha → Farah</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Upload <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200">sample_60_candidates.csv</code> (≥50 candidates). Dual approved batches automatically route to <strong>Neha Gupta (Quality Team)</strong> for inspection, then to <strong>Farah Irani (State)</strong>. Generates exactly 60 unique verifiable certificates!
                </p>
              </div>

              {/* Scenario 4 */}
              <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-rose-900">Scenario 4: Certificate Revocation</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-200 text-rose-800">Farah (State Office)</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Switch to <strong>Farah</strong> → Go to <strong>Certificates</strong> → Click the Cancel icon (❌) and enter a reason. Copy the Certificate ID and search it on <strong>Public Verify</strong>. The public status immediately updates to <strong className="text-rose-700">CANCELLED</strong>.
                </p>
              </div>

              {/* Scenario 5 */}
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-900">Scenario 5: Delayed Officer Approval Alert</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-200 text-amber-800">Farah & Dev</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Batches pending without action for &gt;48 hours are automatically flagged as overdue with warning badges on both State and District dashboards to prevent bottlenecks.
                </p>
              </div>

              {/* Scenario 6 */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-indigo-900">Scenario 6: Batch Correction & Resubmission</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-200 text-indigo-800">Dev → Anika</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  District officer returns batch with specific correction remarks. Training Centre sees the feedback, fixes candidates, and resubmits. Full history remains tamper-proof in <strong>Audit Logs</strong>!
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
