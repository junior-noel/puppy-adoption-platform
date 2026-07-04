import mongoose from 'mongoose';

const successStorySchema = new mongoose.Schema(
  {
    puppy: {
      // Snapshot fields — stored directly so the story survives if the
      // puppy listing is ever deleted
      name:   { type: String, required: true },
      breed:  { type: String, required: true },
      photo:  { type: String }, // single Cloudinary URL
    },
    adopter: {
      name: { type: String }, // display name, not linked to User for privacy
    },
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Shelter',
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    // Optional extra photo the adopter/shelter shares with the story
    storyPhoto: { type: String },
  },
  { timestamps: true }
);

const SuccessStory = mongoose.model('SuccessStory', successStorySchema);
export default SuccessStory;
