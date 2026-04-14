import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  cases: [
    {
      caseId: mongoose.Schema.Types.ObjectId,
      role: {
        type: String,
        enum: ['OWNER', 'CONTRIBUTOR', 'VIEWER'],
        default: 'OWNER'
      }
    }
  ],
  notificationPrefs: {
    email: { type: Boolean, default: true },
    rss: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
