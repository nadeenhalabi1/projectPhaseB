import crypto from 'crypto';
import mongoose from 'mongoose';
import { Job, Candidate } from '../models/index.js';
import { CANDIDATE_STATUS } from '../config/constants.js';
import parserService from './parser.service.js';
import openaiService from './openai.service.js';

/**
 * Calculate hash of criteria structure (excludes weights)
 * Used to detect if criteria changed in a way that requires re-evaluation
 */
function calculateCriteriaHash(criteria) {
  const relevantData = criteria.map(c => ({
    id: c._id.toString(),
    name: c.name,
    description: c.description,
    dataType: c.dataType
  }));
  return crypto.createHash('sha256')
    .update(JSON.stringify(relevantData))
    .digest('hex');
}

class ResumesService {
  /**
   * Process uploaded resume(s) for a job
   * @param {string} jobId - Job ID
   * @param {string} userId - User ID (for ownership verification)
   * @param {Array} files - Array of uploaded file objects
   * @returns {Promise<Array>} Array of created candidates
   */
  async processResumes(jobId, userId, files) {
    // Verify job exists and belongs to user
    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    // Clean up any ghost candidates stuck in PROCESSING state from previous failed uploads
    const ghostCandidates = await Candidate.deleteMany({
      jobId: job._id,
      status: CANDIDATE_STATUS.PROCESSING,
    });
    if (ghostCandidates.deletedCount > 0) {
      console.log(`[CLEANUP] Removed ${ghostCandidates.deletedCount} ghost candidate(s) in PROCESSING state`);
    }

    const results = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      try {
        const candidate = await this.processResume(job, file);
        results.push(candidate);
      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        errors.push({
          filename: file.originalname,
          error: error.message,
        });

        // Note: File cleanup is already handled in processResume error handler
        // No need to delete file again here
      }
    }

    return {
      success: results,
      errors,
      successCount: results.length,
      errorCount: errors.length,
    };
  }

  /**
 * Process a single resume
 * @param {Object} job - Job document
 * @param {Object} file - Uploaded file object
 * @returns {Promise<Object>} Created candidate
 */
async processResume(job, file) {
  const session = await mongoose.startSession();
  let fileDeleted = false;

  try {
    // Start transaction
    session.startTransaction();

    // 1. Create candidate in PROCESSING state (in transaction)
    const [candidate] = await Candidate.create(
      [
        {
          jobId: job._id,
          name: 'Processing...',
          resumeText: 'Processing...',
          status: CANDIDATE_STATUS.PROCESSING,
        },
      ],
      { session }
    );

    // 2. Parse resume (outside transaction - file operation)
    const resumeText = await parserService.parseResume(file);

    // 3. Delete uploaded file ASAP (outside transaction - file operation)
    await parserService.deleteFile(file.path);
    fileDeleted = true;

    // 4. Update candidate with parsed text (in transaction)
    candidate.resumeText = resumeText;
    await candidate.save({ session });

    // 5. Extract structured data (outside transaction - API call)
    const extractedData = await openaiService.extractResumeData(
      resumeText,
      job.criteria
    );

    // 6. Finalize candidate - handle OpenAI returning string "null" instead of actual null
    const candidateData = extractedData?.candidate || {};
    candidate.name = candidateData.name || 'Unknown';
    candidate.email =
      candidateData.email && candidateData.email !== 'null'
        ? candidateData.email
        : null;
    candidate.phone =
      candidateData.phone && candidateData.phone !== 'null'
        ? candidateData.phone
        : null;
    candidate.extractedData = extractedData;
    candidate.criteriaHash = calculateCriteriaHash(job.criteria);
    candidate.status = CANDIDATE_STATUS.PROCESSED;

    // Final save (in transaction)
    await candidate.save({ session });

    // Commit transaction - candidate is now permanently in DB
    await session.commitTransaction();
    console.log(`[SUCCESS] Processed candidate ${candidate._id} from ${file.originalname}`);

    return candidate;
  } catch (error) {
    // ---- ROLLBACK & CLEANUP ----
    console.error(
      `[ERROR] Failed to process ${file.originalname}:`,
      error.message
    );

    // Abort transaction - this automatically removes the candidate from DB
    await session.abortTransaction();
    console.log(`[ROLLBACK] Transaction aborted - candidate not saved to DB`);

    // Delete file only if it wasn't already deleted
    if (!fileDeleted) {
      try {
        await parserService.deleteFile(file.path);
        console.log(`[CLEANUP] Deleted file ${file.originalname}`);
      } catch (cleanupError) {
        // Swallow file deletion errors (file might not exist)
      }
    }

    throw error;
  } finally {
    // Always end the session
    session.endSession();
  }
}


  /**
   * Get all resumes/candidates for a job
   * @param {string} jobId - Job ID
   * @param {string} userId - User ID (for ownership verification)
   * @returns {Promise<Array>} List of candidates
   */
  async getJobResumes(jobId, userId) {
    // Verify job exists and belongs to user
    const job = await Job.findOne({ _id: jobId, userId });
    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    const candidates = await Candidate.find({ jobId })
      .sort({ createdAt: -1 })
      .lean();

    return candidates;
  }

  /**
   * Delete a resume/candidate
   * @param {string} candidateId - Candidate ID
   * @param {string} userId - User ID (for ownership verification)
   * @returns {Promise<void>}
   */
  async deleteResume(candidateId, userId) {
    const candidate = await Candidate.findById(candidateId).populate('jobId');

    if (!candidate) {
      const error = new Error('Candidate not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify job belongs to user
    if (candidate.jobId.userId.toString() !== userId) {
      const error = new Error('Access forbidden');
      error.statusCode = 403;
      throw error;
    }

    // Delete candidate (no file to clean up - we already deleted it after parsing)
    await Candidate.deleteOne({ _id: candidateId });
  }
}

const resumesServiceInstance = new ResumesService();

export default resumesServiceInstance;
export { calculateCriteriaHash };
