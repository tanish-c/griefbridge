import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true
  },
  type: {
    type: String,
    enum: ['DEATH_CERT', 'ID_PROOF', 'BANK_PASSBOOK', 'INSURANCE_POLICY',
           'PROPERTY_DOCS', 'NOMINEE_AADHAAR', 'EPF_DOCS', 'OTHER'],
    required: true
  },
  filename: String,
  originalName: String,
  mimeType: String,
  gridfsId: mongoose.Schema.Types.ObjectId,
  uploadedBy: mongoose.Schema.Types.ObjectId,
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  associatedProcedures: [String],
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING'
  },
  extractedText: String,
  fileSize: Number
});

documentSchema.index({ caseId: 1, type: 1 });

export default mongoose.model('Document', documentSchema);
