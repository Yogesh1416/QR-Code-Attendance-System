const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const Session = require('../models/Session')
const Attendance = require('../models/Attendance')

//Mark attendance (students scans Qr)

router.post('/mark', auth, async (req, res) => {
  try {
    const { qrToken } = req.body
    const session = await Session.findOne({ qrToken, isActive: true })
    if (!session)
      return res.status(404).json({ msg: "Session is not found or Inactive" })
    if (new Date() > session.expiresAt)
      return res.status(410).json({ msg: "This Qr Code is Expired" })
    const already = await Attendance.findOne({
      session: session._id,
      student: req.user.id
    })
    if (already)
      return res.status(409).json({ msg: "You have Already marked Attendance" })
    await Attendance.create({
      session: session._id,
      student: req.user.id
    })
    res.json({ msg: "Attendance Marked Successfully" })
  }
  catch (err) {
    console.error(err)
    res.status(500).json({ msg: "Server Error" })
  }
})

//get Attendance Report For a Session

router.get('/report/:sessionId', auth, async (req, res) => {
  try {
    const records = await Attendance.find({ session: req.params.sessionId })
      .populate('student', 'name email')
    res.json(records)
  }
  catch (err) {
    res.status(500).json({ msg: "Server Error" })
  }
})

// Get all sessions created by a teacher with attendance count
router.get('/teacher/sessions', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });
    const now = new Date()
    const result = await Promise.all(sessions.map(async (session) => {
      const count = await Attendance.countDocuments({ session: session._id });
      // Calculate if expired based on current time vs expiresAt
      const isExpired = now > new Date(session.expiresAt);

      // If expired and still marked active in DB, update it
      if (isExpired && session.isActive) {
        await Session.findByIdAndUpdate(session._id, { isActive: false });
      }
      return {
        _id: session._id,
        subject: session.subject,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        isActive: !isExpired,
        studentCount: count
      };
    }));

    res.json(result);
  } catch (err) {
    console.error('Teacher sessions error:', err);
    res.status(500).json({ msg: err.message });
  }
});

// Get all students who attended a specific session
router.get('/teacher/session/:sessionId/students', auth, async (req, res) => {
  try {
    const records = await Attendance.find({ session: req.params.sessionId })
      .populate('student', 'name email')
      .sort({ markedAt: 1 });
    res.json(records);
  } catch (err) {
    console.error('Session students error:', err);
    res.status(500).json({ msg: err.message });
  }
});

// Get all attendance records for a student (their history)
router.get('/student/history', auth, async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.user.id })
      .populate('session', 'subject createdAt')
      .sort({ markedAt: -1 });
    res.json(records);
  } catch (err) {
    console.error('Student history error:', err);
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;