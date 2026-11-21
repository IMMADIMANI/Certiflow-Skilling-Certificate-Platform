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
    a.download = 'certiflow_valid_sample.csv';
    a.click();
    toast.success('Downloaded sample CSV to your Downloads folder!');
  };

  const download60Candidates = () => {
    const rows = [
      'name,fatherName,dob,phone,email,aadhar,courseCompleted,completionDate,marks,grade',
      'Aarav Sharma,Ramesh Sharma,1998-05-14,9876543201,aarav.sharma@example.com,123456789001,Web Development,2024-10-31,82,A',
      'Priya Verma,Suresh Verma,1999-03-22,9876543202,priya.verma@example.com,123456789002,Web Development,2024-10-31,76,B',
      'Rahul Singh,Mohan Singh,2000-07-11,9876543203,rahul.singh@example.com,123456789003,Web Development,2024-10-31,91,A+',
      'Anjali Gupta,Dinesh Gupta,1998-12-05,9876543204,anjali.gupta@example.com,123456789004,Web Development,2024-10-31,65,C',
      'Vikram Patel,Hemant Patel,1997-08-30,9876543205,vikram.patel@example.com,123456789005,Web Development,2024-10-31,88,A',
      'Sneha Reddy,Naresh Reddy,2001-01-17,9876543206,sneha.reddy@example.com,123456789006,Web Development,2024-10-31,73,B',
      'Amit Kumar,Rajesh Kumar,1999-06-25,9876543207,amit.kumar@example.com,123456789007,Web Development,2024-10-31,55,D',
      'Pooja Joshi,Vinod Joshi,2000-09-08,9876543208,pooja.joshi@example.com,123456789008,Web Development,2024-10-31,69,C',
      'Arun Nair,Krishnan Nair,1998-02-14,9876543209,arun.nair@example.com,123456789009,Web Development,2024-10-31,84,A',
      'Meena Pillai,Gopalan Pillai,2001-11-20,9876543210,meena.pillai@example.com,123456789010,Web Development,2024-10-31,78,B',
      'Deepak Yadav,Santosh Yadav,1997-04-16,9876543211,deepak.yadav@example.com,123456789011,Web Development,2024-10-31,93,A+',
      'Ritu Saxena,Ashok Saxena,1999-07-29,9876543212,ritu.saxena@example.com,123456789012,Web Development,2024-10-31,61,C',
      'Suresh Mishra,Ramakant Mishra,2000-10-03,9876543213,suresh.mishra@example.com,123456789013,Web Development,2024-10-31,87,A',
      'Kavita Dixit,Jagdish Dixit,1998-01-28,9876543214,kavita.dixit@example.com,123456789014,Web Development,2024-10-31,72,B',
      'Nitin Agarwal,Prakash Agarwal,2001-05-19,9876543215,nitin.agarwal@example.com,123456789015,Web Development,2024-10-31,58,D',
      'Swati Chaudhary,Vinay Chaudhary,1999-08-07,9876543216,swati.chaudhary@example.com,123456789016,Web Development,2024-10-31,80,A',
      'Mohit Tripathi,Sunil Tripathi,1998-03-11,9876543217,mohit.tripathi@example.com,123456789017,Web Development,2024-10-31,66,C',
      'Shalini Pandey,Narendra Pandey,2000-06-23,9876543218,shalini.pandey@example.com,123456789018,Web Development,2024-10-31,75,B',
      'Alok Srivastava,Girish Srivastava,1997-09-15,9876543219,alok.srivastava@example.com,123456789019,Web Development,2024-10-31,89,A',
      'Neha Tandon,Arvind Tandon,2001-12-01,9876543220,neha.tandon@example.com,123456789020,Web Development,2024-10-31,77,B',
      'Gaurav Shukla,Madan Shukla,1999-02-18,9876543221,gaurav.shukla@example.com,123456789021,Web Development,2024-10-31,94,A+',
      'Poonam Rathore,Bharat Rathore,1998-05-27,9876543222,poonam.rathore@example.com,123456789022,Web Development,2024-10-31,63,C',
      'Hemant Jain,Sushil Jain,2000-08-14,9876543223,hemant.jain@example.com,123456789023,Web Development,2024-10-31,86,A',
      'Rashmi Dubey,Ramesh Dubey,1999-11-30,9876543224,rashmi.dubey@example.com,123456789024,Web Development,2024-10-31,70,B',
      'Ashish Tiwari,Bhupesh Tiwari,1997-01-09,9876543225,ashish.tiwari@example.com,123456789025,Web Development,2024-10-31,52,D',
      'Shweta Kapoor,Ajay Kapoor,2001-04-22,9876543226,shweta.kapoor@example.com,123456789026,Web Development,2024-10-31,81,A',
      'Rohit Vyas,Prakash Vyas,1998-07-18,9876543227,rohit.vyas@example.com,123456789027,Web Development,2024-10-31,67,C',
      'Preeti Bhatt,Giridhar Bhatt,2000-10-26,9876543228,preeti.bhatt@example.com,123456789028,Web Development,2024-10-31,74,B',
      'Ajay Pandya,Mahesh Pandya,1999-01-05,9876543229,ajay.pandya@example.com,123456789029,Web Development,2024-10-31,90,A+',
      'Nisha Rawat,Rajendra Rawat,1998-04-13,9876543230,nisha.rawat@example.com,123456789030,Web Development,2024-10-31,78,B',
      'Vikas Chauhan,Govind Chauhan,2001-07-07,9876543231,vikas.chauhan@example.com,123456789031,Web Development,2024-10-31,85,A',
      'Sunita Bhardwaj,Daya Bhardwaj,1997-10-21,9876543232,sunita.bhardwaj@example.com,123456789032,Web Development,2024-10-31,59,D',
      'Sanjay Ojha,Ramchandra Ojha,1999-03-16,9876543233,sanjay.ojha@example.com,123456789033,Web Development,2024-10-31,83,A',
      'Vandana Kulkarni,Shankar Kulkarni,2000-06-04,9876543234,vandana.kulkarni@example.com,123456789034,Web Development,2024-10-31,71,B',
      'Manoj Bose,Pradip Bose,1998-09-28,9876543235,manoj.bose@example.com,123456789035,Web Development,2024-10-31,96,A+',
      'Archana Sen,Tapan Sen,2001-12-17,9876543236,archana.sen@example.com,123456789036,Web Development,2024-10-31,64,C',
      'Sunil Ghosh,Bibhas Ghosh,1997-02-24,9876543237,sunil.ghosh@example.com,123456789037,Web Development,2024-10-31,88,A',
      'Renu Das,Mrinal Das,1999-05-10,9876543238,renu.das@example.com,123456789038,Web Development,2024-10-31,76,B',
      'Kapil Sarkar,Debasish Sarkar,2000-08-21,9876543239,kapil.sarkar@example.com,123456789039,Web Development,2024-10-31,53,D',
      'Manju Roy,Subrata Roy,1998-11-13,9876543240,manju.roy@example.com,123456789040,Web Development,2024-10-31,79,B',
      'Tarun Biswas,Nirmal Biswas,2001-02-06,9876543241,tarun.biswas@example.com,123456789041,Web Development,2024-10-31,92,A+',
      'Jyoti Mukherjee,Suresh Mukherjee,1997-05-30,9876543242,jyoti.mukherjee@example.com,123456789042,Web Development,2024-10-31,68,C',
      'Dinesh Chatterjee,Ratan Chatterjee,1999-08-15,9876543243,dinesh.chatterjee@example.com,123456789043,Web Development,2024-10-31,84,A',
      'Kamla Dey,Probhat Dey,2000-11-29,9876543244,kamla.dey@example.com,123456789044,Web Development,2024-10-31,73,B',
      'Rajiv Basu,Ashim Basu,1998-01-22,9876543245,rajiv.basu@example.com,123456789045,Web Development,2024-10-31,56,D',
      'Sushmita Haldar,Nitai Haldar,2001-04-08,9876543246,sushmita.haldar@example.com,123456789046,Web Development,2024-10-31,87,A',
      'Biplab Majumdar,Shyamal Majumdar,1997-07-01,9876543247,biplab.majumdar@example.com,123456789047,Web Development,2024-10-31,65,C',
      'Sharmila Pal,Gopal Pal,1999-10-19,9876543248,sharmila.pal@example.com,123456789048,Web Development,2024-10-31,77,B',
      'Arnab Ghoshal,Tapas Ghoshal,2000-01-31,9876543249,arnab.ghoshal@example.com,123456789049,Web Development,2024-10-31,91,A+',
      'Mousumi Banerjee,Ranjit Banerjee,1998-04-24,9876543250,mousumi.banerjee@example.com,123456789050,Web Development,2024-10-31,74,B',
      'Partha Mitra,Ashok Mitra,2001-07-16,9876543251,partha.mitra@example.com,123456789051,Web Development,2024-10-31,86,A',
      'Nilufar Islam,Jamal Islam,1997-10-09,9876543252,nilufar.islam@example.com,123456789052,Web Development,2024-10-31,62,C',
      'Sabbir Ahmed,Faruk Ahmed,1999-01-27,9876543253,sabbir.ahmed@example.com,123456789053,Web Development,2024-10-31,80,A',
      'Fatema Begum,Rafiqul Hossain,2000-04-15,9876543254,fatema.begum@example.com,123456789054,Web Development,2024-10-31,69,C',
      'Rakibul Hasan,Nurul Hasan,1998-07-03,9876543255,rakibul.hasan@example.com,123456789055,Web Development,2024-10-31,95,A+',
      'Sharmin Sultana,Abdul Karim,2001-10-27,9876543256,sharmin.sultana@example.com,123456789056,Web Development,2024-10-31,72,B',
      'Mizan Molla,Rezaul Molla,1997-01-20,9876543257,mizan.molla@example.com,123456789057,Web Development,2024-10-31,83,A',
      'Laxmi Devi,Ratan Lal,1999-04-08,9876543258,laxmi.devi@example.com,123456789058,Web Development,2024-10-31,57,D',
      'Parveen Akhtar,Mohammad Akhtar,2000-07-24,9876543259,parveen.akhtar@example.com,123456789059,Web Development,2024-10-31,76,B',
      'Zainab Hussain,Gulam Hussain,1998-11-06,9876543260,zainab.hussain@example.com,123456789060,Web Development,2024-10-31,89,A',
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sample_60_candidates.csv';
    a.click();
    toast.success('Downloaded 60-candidate CSV to your Downloads folder!');
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
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Upload Candidates</h2>
            <div className="flex items-center gap-2">
              <button onClick={downloadTemplate} className="btn-secondary text-xs">
                <Download className="w-3.5 h-3.5" /> Sample (3 rows)
              </button>
              <button onClick={download60Candidates} className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700">
                <Download className="w-3.5 h-3.5" /> 60 Candidates CSV (Scenario 3)
              </button>
            </div>
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
