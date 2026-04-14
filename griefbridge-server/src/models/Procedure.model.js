import mongoose from 'mongoose';

const procedureSchema = new mongoose.Schema({
  procedureId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  department: String,
  description: String,
  requirementVector: {
    is_govt_employee: { type: Number, default: 0 },
    has_epf: { type: Number, default: 0 },
    has_property: { type: Number, default: 0 },
    has_insurance: { type: Number, default: 0 },
    has_pension: { type: Number, default: 0 },
    has_post_office: { type: Number, default: 0 },
    has_vehicle: { type: Number, default: 0 },
    is_taxpayer: { type: Number, default: 0 },
    has_mutual_funds: { type: Number, default: 0 },
    has_loans: { type: Number, default: 0 }
  },
  requirementWeights: mongoose.Schema.Types.Mixed,
  legalPriority: {
    type: Number,
    default: 999
  },
  legalDeadline: {
    value: Number,
    unit: { type: String, enum: ['days', 'months', 'years'], default: 'years' }
  },
  dependencies: [String],
  requiredDocTypes: [String],
  formTemplateId: String
});

export default mongoose.model('Procedure', procedureSchema);
