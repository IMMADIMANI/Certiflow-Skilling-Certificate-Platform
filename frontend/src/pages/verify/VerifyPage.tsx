import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, AlertTriangle, Shield, QrCode } from 'lucide-react';
import axios from 'axios';

const rawApi = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_URL = rawApi.replace(/\/+$/, '');

interface VerificationResult {
  valid: boolean;
  status: 'ACTIVE' | 'CANCELLED' | 'NOT_FOUND';
  certificate?: {
    certificateId: string;
    candidateName: string;
    courseName: string;
    trainingCentreName: string;
    completionDate: string;
    issuedAt: string;
    cancelledAt?: string;
    cancelReason?: string;
  };
  message: string;
}

export default function VerifyPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [certId, setCertId] = useState(id || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      setCertId(id);
      handleVerify(id);
    }
  }, [id]);

  const handleVerify = async (overrideId?: string) => {
    const idToCheck = (overrideId || certId).trim();
    if (!idToCheck) {
      setError('Please enter a certificate ID.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await axios.get(`${API_URL}/api/verify/${encodeURIComponent(idToCheck)}`);
      setResult(response.data);
      navigate(`/verify/${encodeURIComponent(idToCheck)}`, { replace: true });
    } catch (err: any) {
      if (err.response?.status === 404) {
        setResult({
          valid: false,
          status: 'NOT_FOUND',
          message: 'No certificate found with this ID. It may be invalid or does not exist.',
        });
      } else {
        setError('Unable to verify at this time. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleVerify();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">CertiFlow</h1>
              <p className="text-xs text-gray-500">Certificate Verification Portal</p>
            </div>
          </div>
          <a
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Officer Login →
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <QrCode className="w-9 h-9 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Certificate</h2>
          <p className="text-gray-500 text-base">
            Enter a certificate ID or scan a QR code to verify its authenticity instantly.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Certificate ID
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. CERT-2024-ABCD1234"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
            />
            <button
              onClick={() => handleVerify()}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? 'Checking...' : 'Verify'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> {error}
            </p>
          )}
          <p className="mt-3 text-xs text-gray-400">
            💡 Tip: If you scanned a QR code, the certificate ID will auto-fill above.
          </p>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`rounded-2xl border-2 p-6 shadow-md ${
              result.status === 'ACTIVE'
                ? 'border-green-400 bg-green-50'
                : result.status === 'CANCELLED'
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            {/* Status Header */}
            <div className="flex items-start gap-4 mb-5">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  result.status === 'ACTIVE'
                    ? 'bg-green-100'
                    : result.status === 'CANCELLED'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}
              >
                {result.status === 'ACTIVE' ? (
                  <CheckCircle className="w-7 h-7 text-green-600" />
                ) : result.status === 'CANCELLED' ? (
                  <XCircle className="w-7 h-7 text-red-600" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-gray-500" />
                )}
              </div>
              <div>
                <h3
                  className={`text-xl font-bold ${
                    result.status === 'ACTIVE'
                      ? 'text-green-800'
                      : result.status === 'CANCELLED'
                      ? 'text-red-800'
                      : 'text-gray-700'
                  }`}
                >
                  {result.status === 'ACTIVE'
                    ? '✅ Certificate is Valid'
                    : result.status === 'CANCELLED'
                    ? '❌ Certificate is Cancelled'
                    : '⚠️ Certificate Not Found'}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    result.status === 'ACTIVE'
                      ? 'text-green-700'
                      : result.status === 'CANCELLED'
                      ? 'text-red-700'
                      : 'text-gray-600'
                  }`}
                >
                  {result.message}
                </p>
              </div>
            </div>

            {/* Certificate Details */}
            {result.certificate && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Certificate Details
                </h4>
                <DetailRow label="Certificate ID" value={result.certificate.certificateId} mono />
                <DetailRow label="Candidate Name" value={result.certificate.candidateName} />
                <DetailRow label="Course" value={result.certificate.courseName} />
                <DetailRow label="Training Centre" value={result.certificate.trainingCentreName} />
                <DetailRow
                  label="Completion Date"
                  value={new Date(result.certificate.completionDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                />
                <DetailRow
                  label="Issued On"
                  value={new Date(result.certificate.issuedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                />
                {result.certificate.cancelledAt && (
                  <>
                    <div className="border-t border-red-200 pt-3 mt-3">
                      <DetailRow
                        label="Cancelled On"
                        value={new Date(result.certificate.cancelledAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                        danger
                      />
                      {result.certificate.cancelReason && (
                        <DetailRow
                          label="Cancellation Reason"
                          value={result.certificate.cancelReason}
                          danger
                        />
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Cancelled Warning */}
            {result.status === 'CANCELLED' && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ This certificate has been officially cancelled and is no longer valid.
                  Do not accept it as proof of certification.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 text-center text-xs text-gray-400 space-y-1">
          <p>🔒 This verification portal is maintained by the State Skilling Authority.</p>
          <p>Certificates are tamper-proof and verified against the official registry.</p>
          <p className="mt-2">
            For disputes, contact{' '}
            <a href="mailto:support@certiflow.in" className="text-blue-500 hover:underline">
              support@certiflow.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  danger = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">{label}</span>
      <span
        className={`text-sm font-medium text-right ${
          danger ? 'text-red-700' : 'text-gray-900'
        } ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
