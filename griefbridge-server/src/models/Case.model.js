import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
  caseId: {
    type: String,
    unique: true,
    default: () => `GB-${Date.now()}`
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      role: {
        type: String,
        enum: ['OWNER', 'CONTRIBUTOR', 'VIEWER'],
        default: 'CONTRIBUTOR'
      },
      invitedAt: Date,
      acceptedAt: Date
    }
  ],
  deceased: {
    name: String,
    dateOfDeath: Date,
    state: String,
    intakeAnswers: {
      is_govt_employee: Boolean,
      has_epf: Boolean,
      has_property: Boolean,
      has_insurance: Boolean,
      has_pension: Boolean,
      has_post_office: Boolean,
      has_vehicle: Boolean,
      is_taxpayer: Boolean,
      has_mutual_funds: Boolean,
      has_loans: Boolean
    }
  },
  procedures: [
    {
      procedureId: String,
      title: String,
      department: String,
      status: {
        type: String,
        enum: ['NOT_STARTED', 'UNLOCKED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'OVERDUE'],
        default: 'NOT_STARTED'
      },
      priority: Number,
      deadline: Date,
      dependencies: [String],
      completedAt: Date,
      assignedTo: mongoose.Schema.Types.ObjectId,
      requiredDocTypes: [String]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Case', caseSchema);
