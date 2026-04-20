/**
 * routes/technician.js — Technician Routes
 * Technicians can view issues assigned to them
 * GET /api/technician/my-issues  — get issues assigned to logged-in technician
 * GET /api/technician/my-issues/:id — get single assigned issue
 */

const express = require('express');
const Issue   = require('../models/Issue');
const { protect } = require('../middleware/auth');
const router  = express.Router();

// All routes require login
router.use(protect);

// Middleware: only technicians allowed
router.use((req, res, next) => {
  if (req.user?.role === 'technician') return next();
  return res.status(403).json({ message: 'Technicians only' });
});

// GET /api/technician/my-issues
// Returns all issues assigned to the currently logged-in technician
router.get('/my-issues', async (req, res) => {
  try {
    const issues = await Issue.find({ assignedTo: req.user._id })
      .populate('student',    'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.author', 'name role')
      .sort({ createdAt: -1 });

    res.json({ count: issues.length, issues });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/technician/my-issues/:id
// Returns single issue detail (must be assigned to this technician)
router.get('/my-issues/:id', async (req, res) => {
  try {
    const issue = await Issue.findOne({
      _id:        req.params.id,
      assignedTo: req.user._id
    })
      .populate('student',    'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.author', 'name role');

    if (!issue) return res.status(404).json({ message: 'Issue not found or not assigned to you' });

    res.json({ issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/technician/all-issues
// Technician can see all issues (read-only)
router.get('/all-issues', async (req, res) => {
  try {
    const issues = await Issue.find({})
      .populate('student',    'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ count: issues.length, issues });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/technician/my-issues/:id/status
// Technician updates status of their assigned issue (In Progress / Resolved only)
router.put('/my-issues/:id/status', async (req, res) => {
  try {
    const { status, repairNote } = req.body;

    // Technician can only set In Progress or Resolved
    if (!['In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ message: 'Technician can only set In Progress or Resolved' });
    }

    // Issue must be assigned to this technician
    const issue = await Issue.findOne({
      _id:        req.params.id,
      assignedTo: req.user._id
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found or not assigned to you' });
    }

    issue.status = status;

    // Add repair note as a comment if provided
    if (repairNote?.trim()) {
      issue.comments.push({
        author:     req.user._id,
        authorName: req.user.name,
        role:       'technician',
        text:       repairNote.trim()
      });
    }

    await issue.save();
    await issue.populate('student',    'name email');
    await issue.populate('assignedTo', 'name email');

    res.json({ message: 'Issue status updated successfully', issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/technician/my-issues/:id/comments
// Technician adds a comment/repair note
router.post('/my-issues/:id/comments', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text required' });

    const issue = await Issue.findOne({
      _id:        req.params.id,
      assignedTo: req.user._id
    });

    if (!issue) return res.status(404).json({ message: 'Issue not found or not assigned to you' });

    issue.comments.push({
      author:     req.user._id,
      authorName: req.user.name,
      role:       'technician',
      text:       text.trim()
    });

    await issue.save();
    await issue.populate('comments.author', 'name role');

    res.status(201).json({ message: 'Note added', comments: issue.comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;