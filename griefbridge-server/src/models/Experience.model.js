import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  procedureId: String,
  institution: String,
  city: String,
  state: String,
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  upvotes: {
    type: Number,
    default: 0
  },
  bookmarks: {
    type: Number,
    default: 0
  },
  anonymousAuthorId: String, // one-way hash of userId + caseId
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

experienceSchema.index({ procedureId: 1, city: 1 });

export default mongoose.model('Experience', experienceSchema);
