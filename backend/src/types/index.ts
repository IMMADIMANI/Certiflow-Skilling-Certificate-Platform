export type UserRole = 'TRAINING_CENTRE' | 'DISTRICT_OFFICER' | 'QUALITY_TEAM' | 'STATE_OFFICE' | 'CANDIDATE';
export type BatchStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'QUALITY_REVIEW' | 'STATE_REVIEW' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'CANCELLED';
export type CandidateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CERTIFIED' | 'CANCELLED';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}
