import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['DEADLINE_UPCOMING', 'DOCUMENT_REQUIRED', 'TASK_COMPLETE', 'REMINDER', 'ALERT'],
    required: true
  },
  procedureId: String,
  title: String,
  message: String,
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 2592000 } // Auto-delete after 30 days
  }
});

export default mongoose.model('Notification', notificationSchema);
