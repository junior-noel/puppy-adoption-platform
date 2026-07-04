import mongoose from 'mongoose';

// Multi-tenant by design: even a single-shelter deployment just seeds
// one Shelter document and disables public shelter signup via env flag.
const shelterSchema = new mongoose.Schema(
  {
    orgName: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String },
    address: { type: String },
    phone: { type: String },
    website: { type: String },
    verified: { type: Boolean, default: false }, // admin must verify before listings go live
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
  },
  { timestamps: true }
);

shelterSchema.index({ location: '2dsphere' });

const Shelter = mongoose.model('Shelter', shelterSchema);
export default Shelter;
