import mongoose from 'mongoose';
import { USER_ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
  },
  role: {
    type: String,
    enum: {
      values: Object.values(USER_ROLES),
      message: '{VALUE} is not a valid role',
    },
    default: USER_ROLES.RECRUITER,
  },
}, {
  timestamps: true,
});

// Index for faster queries
userSchema.index({ email: 1 });

// Don't return password hash in JSON responses
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
