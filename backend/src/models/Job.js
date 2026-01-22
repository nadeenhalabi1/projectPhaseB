import mongoose from 'mongoose';
import { JOB_STATUS, CRITERION_DATA_TYPES } from '../config/constants.js';

// Criterion schema - EMBEDDED in Job (not a separate collection)
const criterionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Criterion name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  weight: {
    type: Number,
    required: [true, 'Criterion weight is required'],
    min: [0, 'Weight cannot be negative'],
    max: [100, 'Weight cannot exceed 100'],
  },
  dataType: {
    type: String,
    enum: {
      values: Object.values(CRITERION_DATA_TYPES),
      message: '{VALUE} is not a valid data type',
    },
    default: CRITERION_DATA_TYPES.SCALE,
  },
  minValue: {
    type: Number,
    default: 0,
  },
  maxValue: {
    type: Number,
    default: 10,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { _id: true }); // Enable _id for criteria

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
  },
  department: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  minSalary: {
    type: Number,
    min: [0, 'Minimum salary cannot be negative'],
  },
  maxSalary: {
    type: Number,
    min: [0, 'Maximum salary cannot be negative'],
    validate: {
      validator: function(value) {
        return !this.minSalary || !value || value >= this.minSalary;
      },
      message: 'Maximum salary must be greater than or equal to minimum salary',
    },
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true,
  },
  requirements: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: {
      values: Object.values(JOB_STATUS),
      message: '{VALUE} is not a valid job status',
    },
    default: JOB_STATUS.OPEN,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  criteria: {
    type: [criterionSchema],
    validate: {
      validator: function(criteria) {
        return criteria && criteria.length > 0;
      },
      message: 'At least one criterion is required',
    },
  },
}, {
  timestamps: true,
});

// CRITICAL: Validate weights sum to 100
jobSchema.pre('save', async function() {
  if (this.criteria && this.criteria.length > 0) {
    const total = this.criteria.reduce((sum, c) => sum + c.weight, 0);

    // Allow small floating point errors
    if (Math.abs(total - 100) > 0.01) {
      const error = new Error(`Criteria weights must sum to 100. Current total: ${total}`);
      error.statusCode = 400;
      throw error;
    }
  }
});

// Validate weights on update as well
jobSchema.pre('findOneAndUpdate', async function() {
  const update = this.getUpdate();

  if (update.criteria || update.$set?.criteria) {
    const criteria = update.criteria || update.$set.criteria;

    if (criteria && criteria.length > 0) {
      const total = criteria.reduce((sum, c) => sum + c.weight, 0);

      if (Math.abs(total - 100) > 0.01) {
        const error = new Error(`Criteria weights must sum to 100. Current total: ${total}`);
        error.statusCode = 400;
        throw error;
      }
    }
  }
});

// Indexes for efficient queries
jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ userId: 1, createdAt: -1 });
jobSchema.index({ department: 1, location: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ minSalary: 1, maxSalary: 1 });

export default mongoose.model('Job', jobSchema);
