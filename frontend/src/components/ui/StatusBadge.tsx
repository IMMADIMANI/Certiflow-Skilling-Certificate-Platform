import React from 'react';

const statusConfig: Record<string, { label: string; cls: string }> = {
  DRAFT:          { label: 'Draft',          cls: 'bg-gray-100 text-gray-700' },
  SUBMITTED:      { label: 'Submitted',      cls: 'bg-blue-100 text-blue-800' },
  UNDER_REVIEW:   { label: 'Under Review',   cls: 'bg-indigo-100 text-indigo-800' },
  QUALITY_REVIEW: { label: 'Quality Review', cls: 'bg-purple-100 text-purple-800' },
  STATE_REVIEW:   { label: 'State Review',   cls: 'bg-orange-100 text-orange-800' },
  APPROVED:       { label: 'Approved',       cls: 'bg-green-100 text-green-800' },
  REJECTED:       { label: 'Rejected',       cls: 'bg-red-100 text-red-800' },
  RETURNED:       { label: 'Returned',       cls: 'bg-yellow-100 text-yellow-800' },
  CANCELLED:      { label: 'Cancelled',      cls: 'bg-red-100 text-red-700' },
  PENDING:        { label: 'Pending',        cls: 'bg-gray-100 text-gray-600' },
  CERTIFIED:      { label: 'Certified',      cls: 'bg-green-100 text-green-700' },
  ACTIVE:         { label: 'Active',         cls: 'bg-green-100 text-green-700' },
  SENT:           { label: 'Sent',           cls: 'bg-green-100 text-green-700' },
  FAILED:         { label: 'Failed',         cls: 'bg-red-100 text-red-700' },
  RETRYING:       { label: 'Retrying',       cls: 'bg-yellow-100 text-yellow-700' },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || { label: status, cls: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
