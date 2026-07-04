import asyncHandler from 'express-async-handler';
import SuccessStory from '../models/SuccessStory.js';
import Puppy from '../models/Puppy.js';
import Application from '../models/Application.js';

// @desc    Get all success stories (public)
// @route   GET /api/stories
// @access  Public
export const getSuccessStories = asyncHandler(async (req, res) => {
  const stories = await SuccessStory.find()
    .populate('shelter', 'orgName')
    .sort({ createdAt: -1 });
  res.json(stories);
});

// @desc    Create a success story (shelter marks puppy as adopted)
// @route   POST /api/stories
// @access  Private (shelter)
export const createSuccessStory = asyncHandler(async (req, res) => {
  const { puppyId, applicationId, message, storyPhoto, adopterDisplayName } = req.body;

  const puppy = await Puppy.findById(puppyId);
  if (!puppy) {
    res.status(404);
    throw new Error('Puppy not found');
  }
  if (puppy.shelter.toString() !== req.user.shelter?.toString()) {
    res.status(403);
    throw new Error('Not authorized — this puppy does not belong to your shelter');
  }

  // Mark the puppy as adopted
  puppy.status = 'adopted';
  await puppy.save();

  // Mark the application as adopted if provided
  if (applicationId) {
    await Application.findByIdAndUpdate(applicationId, { status: 'approved' });
  }

  const story = await SuccessStory.create({
    puppy: {
      name:  puppy.name,
      breed: puppy.breed,
      photo: puppy.photos?.[0] || null,
    },
    adopter: {
      name: adopterDisplayName || 'A loving family',
    },
    shelter:    req.user.shelter,
    message,
    storyPhoto: storyPhoto || null,
  });

  const populated = await story.populate('shelter', 'orgName');
  res.status(201).json(populated);
});

// @desc    Delete a success story
// @route   DELETE /api/stories/:id
// @access  Private (shelter owner, admin)
export const deleteSuccessStory = asyncHandler(async (req, res) => {
  const story = await SuccessStory.findById(req.params.id);
  if (!story) {
    res.status(404);
    throw new Error('Story not found');
  }
  if (
    story.shelter.toString() !== req.user.shelter?.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this story');
  }

  await story.deleteOne();
  res.json({ message: 'Story removed' });
});
