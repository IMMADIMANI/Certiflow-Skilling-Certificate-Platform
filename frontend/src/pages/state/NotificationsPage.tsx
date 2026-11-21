import React, { useEffect, useState } from 'react';
import { notificationApi } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import { Bell, RefreshCw } from 'lucide-react';

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => { notificationApi.list().then(r => setNotifs(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const summary = {
    total: notifs.length,
    sent: notifs.filter(n => n.status === 'SENT').length,
    failed: notifs.filter(n => n.status === 'FAILED').length,
    pending: notifs.filter(n => n.status === 'PENDING' || n.status === 'RETRYING').length,
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Notifications</h1>
          <p className="text-gray-500 text-sm">Simulated WhatsApp delivery status (80% success rate, up to 3 retries)</p>
        </div>
        <button onClick={load} className="btn-secondary text-sm"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: summary.total, color: 'bg-gray-50 border-gray-200' },
          { label: 'Sent ✓', value: summary.sent, color: 'bg-green-50 border-green-200' },
          { label: 'Failed ✗', value: summary.failed, color: 'bg-red-50 border-red-200' },
          { label: 'Pending', value: summary.pending, color: 'bg-yellow-50 border-yellow-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      {notifs.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No notifications yet</p>
          <p className="text-sm">Notifications are sent after certificates are generated</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="table-header">Candidate</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Certificate</th>
                <th className="table-header">Status</th>
                <th className="table-header">Attempts</th>
                <th className="table-header">Last Attempt</th>
                <th className="table-header">Delivered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {notifs.map(n => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{n.candidate?.name}</td>
                  <td className="table-cell">{n.candidate?.phone}</td>
                  <td className="table-cell font-mono text-xs">{n.certificate?.certificateNumber}</td>
                  <td className="table-cell"><StatusBadge status={n.status} /></td>
                  <td className="table-cell text-center">{n.attempts}/3</td>
                  <td className="table-cell text-gray-400 text-xs">{n.lastAttempt ? new Date(n.lastAttempt).toLocaleString('en-IN') : '—'}</td>
                  <td className="table-cell text-xs text-green-600">{n.deliveredAt ? new Date(n.deliveredAt).toLocaleString('en-IN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
