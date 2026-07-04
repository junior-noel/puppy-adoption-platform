import asyncHandler from "express-async-handler";
import Application from "../models/Application.js";
import Puppy from "../models/Puppy.js";
import Shelter from "../models/Shelter.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import sendEmail from "../utils/sendEmail.js";
import {
  newApplicationEmail,
  applicationApprovedEmail,
  applicationRejectedEmail,
  applicationWaitlistedEmail,
} from "../utils/emailTemplates.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// @desc    Submit an adoption application
// @route   POST /api/applications
// @access  Private (adopter)
export const createApplication = asyncHandler(async (req, res) => {
  const { puppyId, formData } = req.body;

  const puppy = await Puppy.findById(puppyId);
  if (!puppy) {
    res.status(404);
    throw new Error("Puppy not found");
  }
  if (puppy.status !== "available") {
    res.status(400);
    throw new Error("This puppy is no longer available");
  }

  const application = await Application.create({
    puppy: puppy._id,
    adopter: req.user._id,
    shelter: puppy.shelter,
    formData,
  });

  // Fetch shelter to get owner ID for conversation + email
  const shelter = await Shelter.findById(puppy.shelter);

  // Add both adopter and shelter owner to conversation participants
  const participants = [req.user._id];
  if (shelter?.owner && shelter.owner.toString() !== req.user._id.toString()) {
    participants.push(shelter.owner);
  }

  const conversation = await Conversation.create({
    application: application._id,
    puppy: puppy._id,
    participants,
  });

  // Email: notify shelter owner of new application
  if (shelter?.owner) {
    const shelterOwner = await User.findById(shelter.owner).select(
      "email name",
    );
    if (shelterOwner?.email) {
      await sendEmail({
        to: shelterOwner.email,
        subject: `New adoption application for ${puppy.name} 🐾`,
        html: newApplicationEmail({
          shelterName: shelterOwner.name,
          adopterName: req.user.name,
          puppyName: puppy.name,
          dashboardUrl: `${CLIENT_URL}/dashboard/shelter`,
        }),
      });
    }
  }

  res.status(201).json({ application, conversationId: conversation._id });
});

// @desc    Get the logged-in adopter's applications
// @route   GET /api/applications/mine
// @access  Private (adopter)
export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ adopter: req.user._id })
    .populate("puppy", "name photos breed")
    .populate("shelter", "orgName");
  res.json(applications);
});

// @desc    Get applications received by the logged-in shelter
// @route   GET /api/applications/shelter
// @access  Private (shelter)
export const getShelterApplications = asyncHandler(async (req, res) => {
  if (!req.user.shelter) {
    res.status(400);
    throw new Error("No shelter profile linked to this account");
  }
  const applications = await Application.find({ shelter: req.user.shelter })
    .populate("puppy", "name photos breed status")
    .populate("adopter", "name email phone");
  res.json(applications);
});

// @desc    Approve / reject / waitlist an application
// @route   PUT /api/applications/:id/status
// @access  Private (shelter)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const application = await Application.findById(req.params.id)
    .populate("puppy", "name")
    .populate("adopter", "name email")
    .populate("shelter", "orgName");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }
  if (application.shelter._id.toString() !== req.user.shelter?.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this application");
  }

  application.status = status;
  await application.save();

  // When approved, mark puppy pending and waitlist other applicants
  if (status === "approved") {
    await Puppy.findByIdAndUpdate(application.puppy._id, { status: "pending" });
    await Application.updateMany(
      {
        puppy: application.puppy._id,
        _id: { $ne: application._id },
        status: "pending",
      },
      { status: "waitlisted" },
    );
  }

  // Find the conversation to link the adopter directly to the chat
  const conversation = await Conversation.findOne({
    application: application._id,
  });
  const chatUrl = conversation
    ? `${CLIENT_URL}/chat/${conversation._id}`
    : `${CLIENT_URL}/dashboard`;

  const adopterEmail = application.adopter?.email;
  const adopterName = application.adopter?.name;
  const puppyName = application.puppy?.name;
  const shelterName = application.shelter?.orgName;

  // Email: notify adopter of status change
  if (adopterEmail) {
    if (status === "approved") {
      await sendEmail({
        to: adopterEmail,
        subject: `Your application for ${puppyName} was approved! 🎉`,
        html: applicationApprovedEmail({
          adopterName,
          puppyName,
          shelterName,
          chatUrl,
        }),
      });
    } else if (status === "rejected") {
      await sendEmail({
        to: adopterEmail,
        subject: `Update on your application for ${puppyName}`,
        html: applicationRejectedEmail({
          adopterName,
          puppyName,
          shelterName,
          browseUrl: `${CLIENT_URL}/browse`,
        }),
      });
    } else if (status === "waitlisted") {
      await sendEmail({
        to: adopterEmail,
        subject: `You've been waitlisted for ${puppyName}`,
        html: applicationWaitlistedEmail({
          adopterName,
          puppyName,
          shelterName,
        }),
      });
    }
  }

  res.json(application);
});

// import asyncHandler from "express-async-handler";
// import Application from "../models/Application.js";
// import Puppy from "../models/Puppy.js";
// import Shelter from "../models/Shelter.js";
// import Conversation from "../models/Conversation.js";

// // @desc    Submit an adoption application
// // @route   POST /api/applications
// // @access  Private (adopter)
// export const createApplication = asyncHandler(async (req, res) => {
//   const { puppyId, formData } = req.body;

//   const puppy = await Puppy.findById(puppyId);
//   if (!puppy) {
//     res.status(404);
//     throw new Error("Puppy not found");
//   }
//   if (puppy.status !== "available") {
//     res.status(400);
//     throw new Error("This puppy is no longer available");
//   }

//   const application = await Application.create({
//     puppy: puppy._id,
//     adopter: req.user._id,
//     shelter: puppy.shelter,
//     formData,
//   });

//   // Fetch the shelter so we can add the owner to the conversation participants
//   const shelter = await Shelter.findById(puppy.shelter);

//   // Build participants: always the adopter + shelter owner (if found and different)
//   const participants = [req.user._id];
//   if (shelter?.owner && shelter.owner.toString() !== req.user._id.toString()) {
//     participants.push(shelter.owner);
//   }

//   const conversation = await Conversation.create({
//     application: application._id,
//     puppy: puppy._id,
//     participants, // ← both adopter AND shelter owner
//   });

//   res.status(201).json({ application, conversationId: conversation._id });
// });

// // @desc    Get the logged-in adopter's applications
// // @route   GET /api/applications/mine
// // @access  Private (adopter)
// export const getMyApplications = asyncHandler(async (req, res) => {
//   const applications = await Application.find({ adopter: req.user._id })
//     .populate("puppy", "name photos breed")
//     .populate("shelter", "orgName");
//   res.json(applications);
// });

// // @desc    Get applications received by the logged-in shelter
// // @route   GET /api/applications/shelter
// // @access  Private (shelter)
// export const getShelterApplications = asyncHandler(async (req, res) => {
//   if (!req.user.shelter) {
//     res.status(400);
//     throw new Error("No shelter profile linked to this account");
//   }
//   const applications = await Application.find({ shelter: req.user.shelter })
//     .populate("puppy", "name photos breed status")
//     .populate("adopter", "name email phone");
//   res.json(applications);
// });

// // @desc    Approve / reject / waitlist an application
// // @route   PUT /api/applications/:id/status
// // @access  Private (shelter)
// export const updateApplicationStatus = asyncHandler(async (req, res) => {
//   const { status } = req.body;
//   const application = await Application.findById(req.params.id);

//   if (!application) {
//     res.status(404);
//     throw new Error("Application not found");
//   }
//   if (application.shelter.toString() !== req.user.shelter?.toString()) {
//     res.status(403);
//     throw new Error("Not authorized to update this application");
//   }

//   application.status = status;
//   await application.save();

//   // When approved, mark puppy pending and waitlist other applicants
//   if (status === "approved") {
//     await Puppy.findByIdAndUpdate(application.puppy, { status: "pending" });
//     await Application.updateMany(
//       {
//         puppy: application.puppy,
//         _id: { $ne: application._id },
//         status: "pending",
//       },
//       { status: "waitlisted" },
//     );
//   }

//   res.json(application);
// });
