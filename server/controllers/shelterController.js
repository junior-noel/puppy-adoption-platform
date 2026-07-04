import asyncHandler from "express-async-handler";
import Shelter from "../models/Shelter.js";
import User from "../models/User.js";

// @desc    Register a shelter org
// @route   POST /api/shelters
// @access  Private (shelter)
export const registerShelter = asyncHandler(async (req, res) => {
  if (req.user.shelter) {
    res.status(400);
    throw new Error("This account is already linked to a shelter");
  }

  const { orgName, description, address, phone, website, lng, lat } = req.body;

  const shelter = await Shelter.create({
    orgName,
    description,
    address,
    phone,
    website,
    owner: req.user._id,
    location:
      lng && lat
        ? { type: "Point", coordinates: [Number(lng), Number(lat)] }
        : undefined,
    // Auto-verify in development — set NODE_ENV=production to require admin approval
    verified: process.env.NODE_ENV !== "production",
  });

  await User.findByIdAndUpdate(req.user._id, { shelter: shelter._id });

  res.status(201).json(shelter);
});

// @desc    Get a single shelter's public profile
// @route   GET /api/shelters/:id
// @access  Public
export const getShelterById = asyncHandler(async (req, res) => {
  const shelter = await Shelter.findById(req.params.id);
  if (!shelter) {
    res.status(404);
    throw new Error("Shelter not found");
  }
  res.json(shelter);
});

// @desc    Update shelter profile
// @route   PUT /api/shelters/:id
// @access  Private (shelter owner, admin)
export const updateShelter = asyncHandler(async (req, res) => {
  const shelter = await Shelter.findById(req.params.id);
  if (!shelter) {
    res.status(404);
    throw new Error("Shelter not found");
  }

  if (
    shelter.owner.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this shelter");
  }

  Object.assign(shelter, req.body);
  const updated = await shelter.save();
  res.json(updated);
});

// @desc    List all shelters
// @route   GET /api/shelters
// @access  Public
export const getShelters = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.verified !== undefined)
    filter.verified = req.query.verified === "true";
  const shelters = await Shelter.find(filter);
  res.json(shelters);
});

// @desc    Verify a shelter (admin moderation)
// @route   PUT /api/shelters/:id/verify
// @access  Private (admin)
export const verifyShelter = asyncHandler(async (req, res) => {
  const shelter = await Shelter.findById(req.params.id);
  if (!shelter) {
    res.status(404);
    throw new Error("Shelter not found");
  }
  shelter.verified = true;
  await shelter.save();
  res.json(shelter);
});

// import asyncHandler from 'express-async-handler';
// import Shelter from '../models/Shelter.js';
// import User from '../models/User.js';

// // @desc    Register a shelter org (links to the logged-in 'shelter' role user)
// // @route   POST /api/shelters
// // @access  Private (shelter)
// export const registerShelter = asyncHandler(async (req, res) => {
//   if (req.user.shelter) {
//     res.status(400);
//     throw new Error('This account is already linked to a shelter');
//   }

//   const { orgName, description, address, phone, website, lng, lat } = req.body;

//   const shelter = await Shelter.create({
//     orgName,
//     description,
//     address,
//     phone,
//     website,
//     owner: req.user._id,
//     location: lng && lat ? { type: 'Point', coordinates: [lng, lat] } : undefined,
//     // verified stays false until an admin approves it
//   });

//   await User.findByIdAndUpdate(req.user._id, { shelter: shelter._id });

//   res.status(201).json(shelter);
// });

// // @desc    Get a single shelter's public profile
// // @route   GET /api/shelters/:id
// // @access  Public
// export const getShelterById = asyncHandler(async (req, res) => {
//   const shelter = await Shelter.findById(req.params.id);
//   if (!shelter) {
//     res.status(404);
//     throw new Error('Shelter not found');
//   }
//   res.json(shelter);
// });

// // @desc    Update shelter profile
// // @route   PUT /api/shelters/:id
// // @access  Private (shelter owner, admin)
// export const updateShelter = asyncHandler(async (req, res) => {
//   const shelter = await Shelter.findById(req.params.id);
//   if (!shelter) {
//     res.status(404);
//     throw new Error('Shelter not found');
//   }

//   if (shelter.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
//     res.status(403);
//     throw new Error('Not authorized to update this shelter');
//   }

//   Object.assign(shelter, req.body);
//   const updated = await shelter.save();
//   res.json(updated);
// });

// // @desc    List all shelters (optionally filter by verified status)
// // @route   GET /api/shelters
// // @access  Public
// export const getShelters = asyncHandler(async (req, res) => {
//   const filter = {};
//   if (req.query.verified !== undefined) filter.verified = req.query.verified === 'true';
//   const shelters = await Shelter.find(filter);
//   res.json(shelters);
// });

// // @desc    Verify a shelter (admin moderation)
// // @route   PUT /api/shelters/:id/verify
// // @access  Private (admin)
// export const verifyShelter = asyncHandler(async (req, res) => {
//   const shelter = await Shelter.findById(req.params.id);
//   if (!shelter) {
//     res.status(404);
//     throw new Error('Shelter not found');
//   }
//   shelter.verified = true;
//   await shelter.save();
//   res.json(shelter);
// });
