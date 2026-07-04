import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Shelter from '../models/Shelter.js';
import Puppy from '../models/Puppy.js';
import Application from '../models/Application.js';
import SuccessStory from '../models/SuccessStory.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// @desc    Get platform-wide stats
// @route   GET /api/admin/stats
// @access  Private (admin)
export const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalAdopters, totalShelters, pendingShelters,
    totalPuppies, availablePuppies, adoptedPuppies,
    totalApplications, pendingApplications, totalStories,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'adopter' }),
    Shelter.countDocuments(),
    Shelter.countDocuments({ verified: false }),
    Puppy.countDocuments(),
    Puppy.countDocuments({ status: 'available' }),
    Puppy.countDocuments({ status: 'adopted' }),
    Application.countDocuments(),
    Application.countDocuments({ status: 'pending' }),
    SuccessStory.countDocuments(),
  ]);

  res.json({
    users:        { total: totalUsers, adopters: totalAdopters },
    shelters:     { total: totalShelters, pending: pendingShelters },
    puppies:      { total: totalPuppies, available: availablePuppies, adopted: adoptedPuppies },
    applications: { total: totalApplications, pending: pendingApplications },
    stories:      { total: totalStories },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// @desc    Delete a user (and their shelter + puppies if shelter role)
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
export const adminDeleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent deleting the last admin account
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      res.status(400);
      throw new Error('Cannot delete the only admin account');
    }
  }

  // If shelter role — cascade delete their shelter, puppies, applications
  if (user.shelter) {
    await Puppy.deleteMany({ shelter: user.shelter });
    await Application.deleteMany({ shelter: user.shelter });
    await SuccessStory.deleteMany({ shelter: user.shelter });
    await Shelter.findByIdAndDelete(user.shelter);
  }

  // Delete adopter applications
  if (user.role === 'adopter') {
    await Application.deleteMany({ adopter: user._id });
  }

  await user.deleteOne();
  res.json({ message: 'User and all associated data removed' });
});

// @desc    Get all shelters (admin view — includes unverified)
// @route   GET /api/admin/shelters
// @access  Private (admin)
export const getAllShelters = asyncHandler(async (req, res) => {
  const shelters = await Shelter.find()
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });
  res.json(shelters);
});

// @desc    Delete a shelter + all its puppies and applications
// @route   DELETE /api/admin/shelters/:id
// @access  Private (admin)
export const adminDeleteShelter = asyncHandler(async (req, res) => {
  const shelter = await Shelter.findById(req.params.id);
  if (!shelter) {
    res.status(404);
    throw new Error('Shelter not found');
  }

  // Cascade: remove all puppies, applications, and stories linked to this shelter
  await Puppy.deleteMany({ shelter: shelter._id });
  await Application.deleteMany({ shelter: shelter._id });
  await SuccessStory.deleteMany({ shelter: shelter._id });

  // Unlink shelter from the owner's user account
  await User.findByIdAndUpdate(shelter.owner, { shelter: null });

  await shelter.deleteOne();
  res.json({ message: 'Shelter and all associated listings removed' });
});

// @desc    Get all puppies across all shelters
// @route   GET /api/admin/puppies
// @access  Private (admin)
export const getAllPuppies = asyncHandler(async (req, res) => {
  const puppies = await Puppy.find()
    .populate('shelter', 'orgName verified')
    .sort({ createdAt: -1 });
  res.json(puppies);
});

// @desc    Delete any puppy listing
// @route   DELETE /api/admin/puppies/:id
// @access  Private (admin)
export const adminDeletePuppy = asyncHandler(async (req, res) => {
  const puppy = await Puppy.findById(req.params.id);
  if (!puppy) {
    res.status(404);
    throw new Error('Puppy not found');
  }
  await puppy.deleteOne();
  res.json({ message: 'Listing removed by admin' });
});

// @desc    Get all success stories (admin view)
// @route   GET /api/admin/stories
// @access  Private (admin)
export const getAllStories = asyncHandler(async (req, res) => {
  const stories = await SuccessStory.find()
    .populate('shelter', 'orgName')
    .sort({ createdAt: -1 });
  res.json(stories);
});

// @desc    Delete any success story
// @route   DELETE /api/admin/stories/:id
// @access  Private (admin)
export const adminDeleteStory = asyncHandler(async (req, res) => {
  const story = await SuccessStory.findById(req.params.id);
  if (!story) {
    res.status(404);
    throw new Error('Story not found');
  }
  await story.deleteOne();
  res.json({ message: 'Story removed by admin' });
});



// import asyncHandler from 'express-async-handler';
// import User from '../models/User.js';
// import Shelter from '../models/Shelter.js';
// import Puppy from '../models/Puppy.js';
// import Application from '../models/Application.js';
// import SuccessStory from '../models/SuccessStory.js';

// // @desc    Get platform-wide stats for the admin overview
// // @route   GET /api/admin/stats
// // @access  Private (admin)
// export const getStats = asyncHandler(async (req, res) => {
//   const [
//     totalUsers,
//     totalAdopters,
//     totalShelters,
//     pendingShelters,
//     totalPuppies,
//     availablePuppies,
//     adoptedPuppies,
//     totalApplications,
//     pendingApplications,
//     totalStories,
//   ] = await Promise.all([
//     User.countDocuments(),
//     User.countDocuments({ role: 'adopter' }),
//     Shelter.countDocuments(),
//     Shelter.countDocuments({ verified: false }),
//     Puppy.countDocuments(),
//     Puppy.countDocuments({ status: 'available' }),
//     Puppy.countDocuments({ status: 'adopted' }),
//     Application.countDocuments(),
//     Application.countDocuments({ status: 'pending' }),
//     SuccessStory.countDocuments(),
//   ]);

//   res.json({
//     users:        { total: totalUsers, adopters: totalAdopters },
//     shelters:     { total: totalShelters, pending: pendingShelters },
//     puppies:      { total: totalPuppies, available: availablePuppies, adopted: adoptedPuppies },
//     applications: { total: totalApplications, pending: pendingApplications },
//     stories:      { total: totalStories },
//   });
// });

// // @desc    Get all users (for admin moderation)
// // @route   GET /api/admin/users
// // @access  Private (admin)
// export const getAllUsers = asyncHandler(async (req, res) => {
//   const users = await User.find().select('-password').sort({ createdAt: -1 });
//   res.json(users);
// });

// // @desc    Get all puppies across all shelters (for admin moderation)
// // @route   GET /api/admin/puppies
// // @access  Private (admin)
// export const getAllPuppies = asyncHandler(async (req, res) => {
//   const puppies = await Puppy.find()
//     .populate('shelter', 'orgName verified')
//     .sort({ createdAt: -1 });
//   res.json(puppies);
// });

// // @desc    Admin: remove any puppy listing (moderation)
// // @route   DELETE /api/admin/puppies/:id
// // @access  Private (admin)
// export const adminDeletePuppy = asyncHandler(async (req, res) => {
//   const puppy = await Puppy.findById(req.params.id);
//   if (!puppy) {
//     res.status(404);
//     throw new Error('Puppy not found');
//   }
//   await puppy.deleteOne();
//   res.json({ message: 'Listing removed by admin' });
// });
