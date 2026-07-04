import mongoose from 'mongoose';

const puppySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    breed: { type: String, required: true },
    age: { type: Number, required: true }, // in months
    gender: { type: String, enum: ['male', 'female'], required: true },
    size: { type: String, enum: ['small', 'medium', 'large'], required: true },
    description: { type: String },
    photos: [{ type: String }], // Cloudinary URLs
    temperamentTags: [{ type: String }], // e.g. "playful", "calm", "shy"
    medicalHistory: { type: String },
    vaccinated: { type: Boolean, default: false },
    neutered: { type: Boolean, default: false },
    goodWithKids: { type: Boolean, default: false },
    goodWithOtherPets: { type: Boolean, default: false },
    status: { type: String, enum: ['available', 'pending', 'adopted'], default: 'available' },
    shelter: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter', required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);

puppySchema.index({ location: '2dsphere' });
puppySchema.index({ breed: 'text', description: 'text', name: 'text' });

const Puppy = mongoose.model('Puppy', puppySchema);
export default Puppy;
