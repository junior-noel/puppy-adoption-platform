import asyncHandler from 'express-async-handler';
import Puppy from '../models/Puppy.js';

// @desc    Browse/search/filter puppies
// @route   GET /api/puppies
// @access  Public
// Query params: breed, gender, size, minAge, maxAge, goodWithKids, goodWithOtherPets,
//                search (text search), lng, lat, radius (meters), page, limit
export const getPuppies = asyncHandler(async (req, res) => {
  const {
    breed, gender, size, minAge, maxAge,
    goodWithKids, goodWithOtherPets,
    search, lng, lat, radius,
    page = 1, limit = 12,
  } = req.query;

  const filter = { status: 'available' };
  if (breed) filter.breed = new RegExp(breed, 'i');
  if (gender) filter.gender = gender;
  if (size) filter.size = size;
  if (goodWithKids) filter.goodWithKids = goodWithKids === 'true';
  if (goodWithOtherPets) filter.goodWithOtherPets = goodWithOtherPets === 'true';
  if (minAge || maxAge) {
    filter.age = {};
    if (minAge) filter.age.$gte = Number(minAge);
    if (maxAge) filter.age.$lte = Number(maxAge);
  }
  if (search) filter.$text = { $search: search };
  if (lng && lat) {
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(radius) || 40000, // default 40km
      },
    };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [puppies, total] = await Promise.all([
    Puppy.find(filter).populate('shelter', 'orgName verified address').skip(skip).limit(Number(limit)),
    Puppy.countDocuments(filter),
  ]);

  res.json({ puppies, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// @desc    Get one puppy's full profile
// @route   GET /api/puppies/:id
// @access  Public
export const getPuppyById = asyncHandler(async (req, res) => {
  const puppy = await Puppy.findById(req.params.id).populate('shelter', 'orgName verified address phone');
  if (!puppy) {
    res.status(404);
    throw new Error('Puppy not found');
  }
  res.json(puppy);
});

// @desc    Create a puppy listing
// @route   POST /api/puppies
// @access  Private (shelter)
export const createPuppy = asyncHandler(async (req, res) => {
  if (!req.user.shelter) {
    res.status(400);
    throw new Error('You must register a shelter profile before listing puppies');
  }

  const puppy = await Puppy.create({ ...req.body, shelter: req.user.shelter });
  res.status(201).json(puppy);
});

// @desc    Update a puppy listing
// @route   PUT /api/puppies/:id
// @access  Private (owning shelter, admin)
export const updatePuppy = asyncHandler(async (req, res) => {
  const puppy = await Puppy.findById(req.params.id);
  if (!puppy) {
    res.status(404);
    throw new Error('Puppy not found');
  }
  if (puppy.shelter.toString() !== req.user.shelter?.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this listing');
  }

  Object.assign(puppy, req.body);
  const updated = await puppy.save();
  res.json(updated);
});

// @desc    Delete a puppy listing
// @route   DELETE /api/puppies/:id
// @access  Private (owning shelter, admin)
export const deletePuppy = asyncHandler(async (req, res) => {
  const puppy = await Puppy.findById(req.params.id);
  if (!puppy) {
    res.status(404);
    throw new Error('Puppy not found');
  }
  if (puppy.shelter.toString() !== req.user.shelter?.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this listing');
  }

  await puppy.deleteOne();
  res.json({ message: 'Listing removed' });
});

// @desc    Get all puppies for the logged-in shelter (including pending/adopted)
// @route   GET /api/puppies/mine
// @access  Private (shelter)
export const getMyShelterPuppies = asyncHandler(async (req, res) => {
  if (!req.user.shelter) {
    res.status(400);
    throw new Error('No shelter profile linked to this account');
  }
  const puppies = await Puppy.find({ shelter: req.user.shelter });
  res.json(puppies);
});
