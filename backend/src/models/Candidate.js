import mongoose from 'mongoose';
import { CANDIDATE_STATUS } from '../config/constants.js';

// Score schema - EMBEDDED in Candidate
const scoreSchema = new mongoose.Schema({
  criterionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Criterion ID is required'],
  },
  criterionName: {
    type: String,
    required: [true, 'Criterion name is required'],
  },
  rawValue: {
    type: Number,
    required: [true, 'Raw value is required'],
  },
  normalizedValue: {
    type: Number,
    required: [true, 'Normalized value is required'],
    min: 0,
    max: 1,
  },
  weightedValue: {
    type: Number,
    required: [true, 'Weighted value is required'],
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
  },
  explanation: {
    type: String,
  },
}, { _id: false }); // No need for _id on scores

const candidateSchema = new mongoose.Schema({
  // Basic candidate info
  name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  phone: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: {
      values: Object.values(CANDIDATE_STATUS),
      message: '{VALUE} is not a valid candidate status',
    },
    default: CANDIDATE_STATUS.PENDING,
  },

  // Resume text extracted from uploaded file
  resumeText: {
    type: String,
    required: [true, 'Resume text is required'],
  },

  // AI-extracted data (flexible - perfect for MongoDB!)
  extractedData: {
    type: mongoose.Schema.Types.Mixed,
  },

  // Hash of criteria used to generate extractedData
  // Used to detect if re-evaluation with OpenAI is needed
  criteriaHash: {
    type: String,
    index: true,
  },

  // Ranking results
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  rank: {
    type: Number,
    min: 1,
  },

  // Individual criterion scores (EMBEDDED)
  scores: [scoreSchema],

  // Reference to job
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required'],
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
candidateSchema.index({ jobId: 1, overallScore: -1 });
candidateSchema.index({ jobId: 1, status: 1 });
candidateSchema.index({ jobId: 1, rank: 1 });
candidateSchema.index({ name: 'text', email: 'text' });

// Clean up response
candidateSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Candidate', candidateSchema);
