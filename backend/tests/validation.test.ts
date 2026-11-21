import { validateCandidateRow } from '../src/utils/validators';

describe('Candidate Row Validation', () => {
  const validRow = {
    name: 'John Doe',
    fatherName: 'James Doe',
    phone: '9876543210',
    dob: '1995-01-15',
    courseCompleted: 'Web Development',
    completionDate: '2024-06-30',
  };

  it('should pass validation with all valid data', () => {
    const errors = validateCandidateRow(validRow, 0);
    expect(errors).toHaveLength(0);
  });

  it('should fail when name is empty', () => {
    const errors = validateCandidateRow({ ...validRow, name: '' }, 0);
    expect(errors.some((e) => e.field === 'name')).toBe(true);
  });

  it('should fail when fatherName is missing', () => {
    const errors = validateCandidateRow({ ...validRow, fatherName: '' }, 0);
    expect(errors.some((e) => e.field === 'fatherName')).toBe(true);
  });

  it('should fail when phone has less than 10 digits', () => {
    const errors = validateCandidateRow({ ...validRow, phone: '12345' }, 0);
    expect(errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('should fail when phone has letters', () => {
    const errors = validateCandidateRow({ ...validRow, phone: '98765abc10' }, 0);
    expect(errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('should fail when completionDate is in the future', () => {
    const errors = validateCandidateRow({ ...validRow, completionDate: '2099-01-01' }, 0);
    expect(errors.some((e) => e.field === 'completionDate')).toBe(true);
  });

  it('should fail when candidate is under 14 years old', () => {
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 10);
    const errors = validateCandidateRow({ ...validRow, dob: dob.toISOString().split('T')[0] }, 0);
    expect(errors.some((e) => e.field === 'dob')).toBe(true);
  });

  it('should report correct row number starting from 2 for first row', () => {
    const errors = validateCandidateRow({ ...validRow, name: '' }, 0);
    expect(errors[0].row).toBe(2);
  });

  it('should report row 5 for index 3 (4th data row)', () => {
    const errors = validateCandidateRow({ ...validRow, name: '' }, 3);
    expect(errors[0].row).toBe(5);
  });

  it('should fail when dob is invalid format', () => {
    const errors = validateCandidateRow({ ...validRow, dob: 'not-a-date' }, 0);
    expect(errors.some((e) => e.field === 'dob')).toBe(true);
  });

  it('should fail when courseCompleted is empty', () => {
    const errors = validateCandidateRow({ ...validRow, courseCompleted: '' }, 0);
    expect(errors.some((e) => e.field === 'courseCompleted')).toBe(true);
  });
});
