export type UserRole = 'TRAINING_CENTRE' | 'DISTRICT_OFFICER' | 'QUALITY_TEAM' | 'STATE_OFFICE' | 'CANDIDATE';
export type BatchStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'QUALITY_REVIEW' | 'STATE_REVIEW' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Batch {
  id: string;
  title: string;
  description?: string;
  courseType: string;
  courseDuration: string;
  status: BatchStatus;
  submittedAt?: string;
  approvedAt?: string;
  returnReason?: string;
  createdAt: string;
  updatedAt: string;
  trainingCentre?: { name: string; district?: { name: string } };
  _count?: { candidates: number; certificates?: number };
  districtApprovals?: DistrictApproval[];
  candidates?: Candidate[];
}

export interface Candidate {
  id: string;
  name: string;
  fatherName: string;
  phone: string;
  email?: string;
  dob: string;
  courseCompleted: string;
  completionDate: string;
  marks?: number;
  grade?: string;
  status: string;
}

export interface DistrictApproval {
  id: string;
  decision: 'APPROVED' | 'REJECTED' | 'RETURNED';
  remarks?: string;
  createdAt: string;
  officer: { name: string; email: string };
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  status: 'ACTIVE' | 'CANCELLED';
  issuedAt: string;
  pdfPath?: string;
  cancelledAt?: string;
  cancelReason?: string;
  candidate?: { name: string; courseCompleted: string; phone: string };
  batch?: { trainingCentre?: { name: string } };
}

export interface DemoAccount {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  description: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}
