/**
 * Application constants
 */

export const USER_ROLES = {
  RECRUITER: 'RECRUITER',
};

export const JOB_STATUS = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
};

export const CANDIDATE_STATUS = {
  PENDING: 'PENDING',           // Just uploaded
  PROCESSING: 'PROCESSING',     // Being analyzed
  PROCESSED: 'PROCESSED',       // Analysis complete
  REVIEWED: 'REVIEWED',         // Recruiter looked at it
  SHORTLISTED: 'SHORTLISTED',  // Moving forward
  REJECTED: 'REJECTED',         // Not selected
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
};

export const CRITERION_DATA_TYPES = {
  SCALE: 'SCALE',       // 0-10 numeric scale
  BOOLEAN: 'BOOLEAN',   // Yes/No
  YEARS: 'YEARS',       // Years of experience
  LEVEL: 'LEVEL',       // Beginner/Intermediate/Expert
  TEXT_MATCH: 'TEXT_MATCH', // Text/keyword matching
};

export const ALLOWED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
  'text/plain': '.txt',
};

export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default
export const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};
