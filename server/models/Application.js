import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    puppy: { type: mongoose.Schema.Types.ObjectId, ref: 'Puppy', required: true },
    adopter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shelter: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'waitlisted'],
      default: 'pending',
    },
    formData: {
      housingType: { type: String }, // house, apartment, etc.
      hasYard: { type: Boolean },
      otherPets: { type: String },
      experience: { type: String },
      reasonForAdopting: { type: String },
    },
  },
  { timestamps: true }
);

// One pending application per adopter per puppy
applicationSchema.index({ puppy: 1, adopter: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
