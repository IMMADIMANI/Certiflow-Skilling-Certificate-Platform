export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export function validateCandidateRow(row: any, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const r = rowIndex + 2; // 1-indexed after header

  const name = String(row.name || '').trim();
  if (!name) errors.push({ row: r, field: 'name', message: 'Candidate name is required' });

  const fatherName = String(row.fatherName || '').trim();
  if (!fatherName) errors.push({ row: r, field: 'fatherName', message: "Father's name is required" });

  const phone = String(row.phone || '').trim();
  if (!phone) {
    errors.push({ row: r, field: 'phone', message: 'Phone number is required' });
  } else if (!/^\d{10}$/.test(phone)) {
    errors.push({ row: r, field: 'phone', message: 'Phone must be exactly 10 digits' });
  }

  if (!row.dob) {
    errors.push({ row: r, field: 'dob', message: 'Date of birth is required' });
  } else {
    const dob = new Date(row.dob);
    if (isNaN(dob.getTime())) {
      errors.push({ row: r, field: 'dob', message: 'Invalid date of birth (use YYYY-MM-DD)' });
    } else {
      const ageMs = Date.now() - dob.getTime();
      const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
      if (ageYears < 14) {
        errors.push({ row: r, field: 'dob', message: 'Candidate must be at least 14 years old' });
      }
    }
  }

  const course = String(row.courseCompleted || '').trim();
  if (!course) errors.push({ row: r, field: 'courseCompleted', message: 'Course completed is required' });

  if (!row.completionDate) {
    errors.push({ row: r, field: 'completionDate', message: 'Completion date is required' });
  } else {
    const cd = new Date(row.completionDate);
    if (isNaN(cd.getTime())) {
      errors.push({ row: r, field: 'completionDate', message: 'Invalid completion date (use YYYY-MM-DD)' });
    } else if (cd > new Date()) {
      errors.push({ row: r, field: 'completionDate', message: 'Completion date cannot be in the future' });
    }
  }

  if (row.aadhar) {
    const aadhar = String(row.aadhar).trim();
    if (!/^\d{12}$/.test(aadhar)) {
      errors.push({ row: r, field: 'aadhar', message: 'Aadhar must be exactly 12 digits' });
    }
  }

  return errors;
}
