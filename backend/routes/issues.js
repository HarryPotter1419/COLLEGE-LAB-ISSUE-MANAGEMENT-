/**
 * routes/issues.js — Student Issue Routes (v2)
 * New: priority field, POST comment on issue
 */
const express = require('express');
const Issue   = require('../models/Issue');
const { protect } = require('../middleware/auth');
const upload  = require('../middleware/upload');
const { sendIssueSubmittedEmail } = require('../utils/mailer');
const router  = express.Router();

router.use(protect);

// POST /api/issues — Submit new issue
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { description, labNumber, systemNumber, priority } = req.body;
    if (!description) return res.status(400).json({ message: 'Description required' });

    const issue = await Issue.create({
      student:      req.user._id,
      description,
      labNumber:    labNumber    || 'Not specified',
      systemNumber: systemNumber || 'Not specified',
      priority:     ['Low','Medium','High'].includes(priority) ? priority : 'Medium',
      imageUrl:     req.file ? `/uploads/${req.file.filename}` : null
    });

    await issue.populate('student', 'name email');

    // Send confirmation email
    sendIssueSubmittedEmail(req.user.email, req.user.name, issue);

    res.status(201).json({ message: 'Issue reported successfully', issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/issues — My issues
router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find({ student: req.user._id })
      .populate('student', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.author', 'name role')
      .sort({ createdAt: -1 });
    res.json({ count: issues.length, issues });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/issues/:id — Single issue
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findOne({ _id: req.params.id, student: req.user._id })
      .populate('student', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.author', 'name role');
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json({ issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/issues/:id/comments — Add a comment/follow-up
router.post('/:id/comments', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text required' });

    const issue = await Issue.findOne({ _id: req.params.id, student: req.user._id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.comments.push({
      author:     req.user._id,
      authorName: req.user.name,
      role:       req.user.role,
      text:       text.trim()
    });

    await issue.save();
    await issue.populate('comments.author', 'name role');

    res.status(201).json({ message: 'Comment added', comments: issue.comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/issues/:id — Delete pending issue
router.delete('/:id', async (req, res) => {
  try {
    const issue = await Issue.findOne({ _id: req.params.id, student: req.user._id });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    if (issue.status !== 'Pending')
      return res.status(400).json({ message: 'Only Pending issues can be deleted' });
    await issue.deleteOne();
    res.json({ message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;