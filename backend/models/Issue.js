/**
 * models/Issue.js — Enhanced Issue Schema (v2)
 * New: priority, comments[], assignedTo
 */

const mongoose = require('mongoose');

// Sub-schema for student comments/follow-ups
const commentSchema = new mongoose.Schema(
  {
    author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String },
    role:     { type: String, enum: ['student', 'admin', 'technician'] },
    text:     { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const issueSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    labNumber:    { type: String, trim: true, default: 'Not specified' },
    systemNumber: { type: String, trim: true, default: 'Not specified' },
    imageUrl:     { type: String, default: null },

    // NEW: Priority level
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },

    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending'
    },

    adminRemarks: { type: String, default: '' },

    // NEW: Assigned technician (reference to a User with role 'technician')
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // NEW: Comments/follow-ups thread
    comments: [commentSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Issue', issueSchema);