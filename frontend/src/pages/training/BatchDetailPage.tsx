import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { batchApi, certApi } from '../../services/api';
import { Batch, Candidate, ValidationError } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import { ArrowLeft, Upload, AlertCircle, CheckCircle, Loader2, Download, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const loadBatch = useCallback(async () => {
    try {
      const res = await batchApi.get(id!);
      setBatch(res.data);
    } catch { toast.error('Failed to load batch'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadBatch(); }, [loadBatch]);

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setUploading(true);
    setValidationErrors([]);
    try {
      await batchApi.upload(id!, files[0]);
      toast.success('Candidates uploaded successfully!');
      loadBatch();
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        toast.error(`${err.response.data.errors.length} validation error(s) found — nothing saved`);
      } else {
        toast.error(err.response?.data?.error || 'Upload failed');
      }
    } finally { setUploading(false); }
  }, [id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled: uploading,
  });

  const handleSubmit = async () => {
    if (!confirm('Submit this batch for district officer approval?')) return;
    setSubmitting(true);
    try {
      await batchApi.submit(id!);
      toast.success('Batch submitted for approval!');
      loadBatch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Submit failed');
    } finally { setSubmitting(false); }
  };

  const downloadTemplate = () => {
    const csv = [
      'name,fatherName,dob,phone,email,aadhar,courseCompleted,completionDate,marks,grade',
      'Rahul Kumar,Suresh Kumar,1998-05-15,9876543210,rahul@email.com,123456789012,Web Development,2024-06-30,85,A',
      'Priya Sharma,Mohan Sharma,1999-02-20,9876543211,priya@email.com,234567890123,Web Development,2024-06-30,78,B',
      'Amit Singh,Ramesh Singh,1997-07-10,9876543212,,,,2024-06-30,90,A',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'certiflow_template.csv';
    a.click();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
  if (!batch) return <div className="p-8 text-red-500">Batch not found</div>;

  const canUpload = ['DRAFT', 'RETURNED'].includes(batch.status);
  const canSubmit = canUpload && batch.candidates?.length > 0;

  return (
    <div className="p-8 max-w-5xl">
      <button onClick={() => navigate('/batches')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Batches
      </button>

      {/* Header */}
      <div className="card mb-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <h1 className="text-xl font-bold text-gray-900">{batch.title}</h1>
              <StatusBadge status={batch.status} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
              <div><span className="font-medium text-gray-700">Course:</span> {batch.courseType}</div>
              <div><span className="font-medium text-gray-700">Duration:</span> {batch.courseDuration}</div>
              <div><span className="font-medium text-gray-700">Candidates:</span> {batch.candidates?.length || 0}</div>
              <div><span className="font-medium text-gray-700">Training Centre:</span> {batch.trainingCentre?.name}</div>
            </div>
          </div>
        </div>

        {batch.status === 'RETURNED' && batch.returnReason && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-1">
              <RotateCcw className="w-4 h-4" /> Batch Returned for Correction
            </div>
            <p className="text-yellow-700 text-sm">{batch.returnReason}</p>
            <p className="text-yellow-600 text-xs mt-1">Please fix the issues, re-upload the corrected file, and resubmit.</p>
          </div>
        )}
      </div>

      {/* Upload Section */}
      {canUpload && (
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upload Candidates</h2>
            <button onClick={downloadTemplate} className="btn-secondary text-sm">
              <Download className="w-4 h-4" /> Download Template
            </button>
          </div>

          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-blue-500 bg-blue-50' : uploading ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}>
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-gray-600 font-medium">Processing and validating file…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-700">{isDragActive ? 'Drop it here!' : 'Drag & drop Excel or CSV file here'}</p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse · .xlsx, .xls, .csv · Max 10MB</p>
                  <p className="text-xs text-gray-400 mt-2">Required columns: name, fatherName, dob, phone, courseCompleted, completionDate</p>
                </div>
              </div>
            )}
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2 text-red-700 font-semibold mb-3">
                <AlertCircle className="w-5 h-5" />
                {validationErrors.length} Validation Error(s) — <span className="font-bold">NO DATA WAS SAVED</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {validationErrors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-700 bg-red-100 rounded px-2 py-1">
                    <span className="font-mono font-bold shrink-0 bg-red-200 px-1.5 rounded text-xs">Row {e.row}</span>
                    <span className="text-red-500 font-medium shrink-0">{e.field}:</span>
                    <span>{e.message}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-red-500 mt-3">Fix all errors above, then upload the corrected file again.</p>
            </div>
          )}
        </div>
      )}

      {/* Submit button */}
      {canSubmit && (
        <div className="card mb-5 flex items-center justify-between bg-green-50 border-green-200">
          <div>
            <p className="font-semibold text-green-800">Ready to submit for approval</p>
            <p className="text-sm text-green-600">{batch.candidates.length} candidates uploaded successfully</p>
          </div>
          <button onClick={handleSubmit} disabled={submitting} className="btn-success">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {submitting ? 'Submitting…' : 'Submit for Approval'}
          </button>
        </div>
      )}

      {/* Candidates Table */}
      {batch.candidates?.length > 0 && (
        <div className="card mb-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidates ({batch.candidates.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header w-8">#</th>
                  <th className="table-header">Name</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Course</th>
                  <th className="table-header">Completion Date</th>
                  <th className="table-header">Grade</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {batch.candidates.map((c: Candidate, i: number) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="table-cell text-gray-400">{i + 1}</td>
                    <td className="table-cell">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.fatherName}</p>
                    </td>
                    <td className="table-cell">{c.phone}</td>
                    <td className="table-cell">{c.courseCompleted}</td>
                    <td className="table-cell">{c.completionDate ? new Date(c.completionDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="table-cell">{c.grade || '—'}</td>
                    <td className="table-cell"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approval History */}
      {batch.districtApprovals?.length > 0 && (
        <div className="card mb-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval History</h2>
          <div className="space-y-2">
            {batch.districtApprovals.map((a: any) => (
              <div key={a.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <StatusBadge status={a.decision} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{a.officer.name}
                    <span className="font-normal text-gray-500"> ({a.officer.email})</span>
                  </p>
                  {a.remarks && <p className="text-xs text-gray-600 mt-0.5">{a.remarks}</p>}
                  <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates */}
      {batch.certificates?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Certificates ({batch.certificates.length})</h2>
          <div className="space-y-2">
            {batch.certificates.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg">
                <div>
                  <p className="text-sm font-medium font-mono">{c.certificateNumber}</p>
                  <p className="text-xs text-gray-500">{c.candidate?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  <a href={certApi.downloadUrl(c.id)} target="_blank" rel="noopener" className="text-blue-600 text-xs hover:underline flex items-center gap-1 font-medium">
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
