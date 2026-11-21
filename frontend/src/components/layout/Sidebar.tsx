import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, Upload, CheckSquare, Award,
  Bell, Eye, Shield, LogOut, Users
} from 'lucide-react';

const navByRole: Record<string, { label: string; icon: any; path: string }[]> = {
  TRAINING_CENTRE: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Batches', icon: FileText, path: '/batches' },
    { label: 'Create Batch', icon: Upload, path: '/batches/create' },
  ],
  DISTRICT_OFFICER: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Pending Approvals', icon: CheckSquare, path: '/approvals' },
    { label: 'All Batches', icon: FileText, path: '/batches' },
    { label: 'Audit Logs', icon: Eye, path: '/audit' },
  ],
  QUALITY_TEAM: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Quality Review', icon: CheckSquare, path: '/quality' },
  ],
  STATE_OFFICE: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Pending Approval', icon: CheckSquare, path: '/state/pending' },
    { label: 'All Batches', icon: FileText, path: '/state/batches' },
    { label: 'Certificates', icon: Award, path: '/state/certificates' },
    { label: 'Notifications', icon: Bell, path: '/state/notifications' },
    { label: 'Audit Logs', icon: Eye, path: '/audit' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const items = navByRole[user?.role || ''] || [];

  const roleColor: Record<string, string> = {
    TRAINING_CENTRE: 'bg-blue-700',
    DISTRICT_OFFICER: 'bg-purple-700',
    QUALITY_TEAM: 'bg-green-700',
    STATE_OFFICE: 'bg-orange-700',
  };

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0 bottom-0 z-10">
      {/* Logo */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">CertiFlow</h1>
            <p className="text-xs text-gray-400">Skilling Certificate Platform</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-700">
        <div className={`${roleColor[user?.role || ''] || 'bg-gray-700'} rounded-lg p-3`}>
          <p className="font-semibold text-sm">{user?.name}</p>
          <p className="text-xs text-gray-200 mt-0.5">{user?.role?.replace(/_/g, ' ')}</p>
          <p className="text-xs text-gray-300 mt-0.5 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 space-y-1">
        <Link
          to="/verify"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm"
        >
          <Eye className="w-4 h-4" />
          Public Verify
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-red-900 hover:text-white transition-colors text-sm w-full"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
