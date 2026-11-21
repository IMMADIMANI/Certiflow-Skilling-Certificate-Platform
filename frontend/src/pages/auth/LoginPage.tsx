import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { DemoAccount } from '../../types';
import { Shield, Loader2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const roleColors: Record<string, string> = {
  TRAINING_CENTRE: 'bg-blue-50 border-blue-200 hover:border-blue-400',
  DISTRICT_OFFICER: 'bg-purple-50 border-purple-200 hover:border-purple-400',
  QUALITY_TEAM: 'bg-green-50 border-green-200 hover:border-green-400',
  STATE_OFFICE: 'bg-orange-50 border-orange-200 hover:border-orange-400',
};
const roleBadge: Record<string, string> = {
  TRAINING_CENTRE: 'bg-blue-100 text-blue-700',
  DISTRICT_OFFICER: 'bg-purple-100 text-purple-700',
  QUALITY_TEAM: 'bg-green-100 text-green-700',
  STATE_OFFICE: 'bg-orange-100 text-orange-700',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
    authApi.demoAccounts().then(r => setDemoAccounts(r.data)).catch(() => {});
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (account: DemoAccount) => {
    setLoading(true);
    try {
      await login(account.email, account.password);
      toast.success(`Logged in as ${account.name}`);
      navigate('/dashboard');
    } catch {
      toast.error('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-white/10 backdrop-blur p-3 rounded-2xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white">CertiFlow</h1>
          <p className="text-blue-200 mt-1">Government Skilling Certificate Issuance Platform</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Sign In</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input" placeholder="your@email.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="input" placeholder="Enter password" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div className="mt-5 p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-500">All demo accounts use password: <strong>password123</strong></p>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center gap-2 mb-5">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900">Quick Demo Login</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Click any card to log in instantly as that role</p>
            <div className="space-y-2">
              {demoAccounts.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading accounts... (make sure backend is running)
                </div>
              ) : (
                demoAccounts.map(account => (
                  <button key={account.email} onClick={() => quickLogin(account)} disabled={loading}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${roleColors[account.role] || 'bg-gray-50 border-gray-200 hover:border-gray-400'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{account.name}</p>
                        <p className="text-xs text-gray-500">{account.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${roleBadge[account.role] || 'bg-gray-100 text-gray-600'}`}>
                        {account.role.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
