/**
 * routes/admin.js — Admin Routes (v2)
 * New: assign technician, add admin comments, email on status update
 */
const express = require('express');
const Issue   = require('../models/Issue');
const User    = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { sendStatusUpdateEmail } = require('../utils/mailer');
const router  = express.Router();

router.use(protect, adminOnly);

// GET /api/admin/issues — All issues with filters
router.get('/issues', async (req, res) => {
  try {
    const { status, lab, search, priority, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status)   filter.status    = status;
    if (priority) filter.priority  = priority;
    if (lab)      filter.labNumber = { $regex: lab, $options: 'i' };
    if (search)   filter.description = { $regex: search, $options: 'i' };

    const total  = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .populate('student',    'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ total, page: +page, totalPages: Math.ceil(total / limit), issues });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/issues/:id
router.get('/issues/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('student',    'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.author', 'name role');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json({ issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/issues/:id — Update status, remarks, assignedTo
router.put('/issues/:id', async (req, res) => {
  try {
    const { status, adminRemarks, assignedTo } = req.body;

    if (status && !['Pending','In Progress','Resolved'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const issue = await Issue.findById(req.params.id).populate('student', 'name email');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const statusChanged = status && status !== issue.status;

    if (status)       issue.status       = status;
    if (adminRemarks !== undefined) issue.adminRemarks = adminRemarks;
    if (assignedTo !== undefined)  issue.assignedTo   = assignedTo || null;

    await issue.save();
    await issue.populate('assignedTo', 'name email');

    // Send email notification if status changed
    if (statusChanged && issue.student?.email) {
      sendStatusUpdateEmail(issue.student.email, issue.student.name, issue);
    }

    res.json({ message: 'Issue updated', issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/issues/:id/comments — Admin adds a comment
router.post('/issues/:id/comments', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text required' });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.comments.push({
      author:     req.user._id,
      authorName: req.user.name,
      role:       'admin',
      text:       text.trim()
    });

    await issue.save();
    await issue.populate('comments.author', 'name role');
    res.status(201).json({ message: 'Comment added', comments: issue.comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [total, pending, inProgress, resolved, totalStudents, high, unassigned] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'Pending' }),
      Issue.countDocuments({ status: 'In Progress' }),
      Issue.countDocuments({ status: 'Resolved' }),
      User.countDocuments({ role: 'student' }),
      Issue.countDocuments({ priority: 'High', status: { $ne: 'Resolved' } }),
      Issue.countDocuments({ assignedTo: null, status: { $ne: 'Resolved' } })
    ]);
    res.json({ total, pending, inProgress, resolved, totalStudents, high, unassigned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/technicians — List all technicians for assignment dropdown
router.get('/technicians', async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician' }).select('-password');
    res.json({ technicians });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json({ count: students.length, students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;