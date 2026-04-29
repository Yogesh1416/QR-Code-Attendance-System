const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const Attendance = require('../models/Attendance')
const Session = require('../models/Session')
const User = require('../models/User')

// Helper: start and end of today (UTC-safe)
function todayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

// Helper: build plain-text reply
function reply(text) {
  return { reply: text }
}

router.post('/chat', auth, async (req, res) => {
  try {
    const msg = (req.body.message || '').toLowerCase().trim()
    const userId = req.user.id
    const role = req.user.role  // 'admin' | 'student'

    if (!msg) return res.json(reply("Please type a message so I can help you."))

    // ── STUDENT intents ──────────────────────────────────────────────

    // "attendance percentage" / "my percentage" / "how much attendance"
    if (msg.includes('attendance percentage') || msg.includes('my percentage') || msg.includes('how much attendance')) {
      const totalSessions = await Session.countDocuments()
      if (totalSessions === 0)
        return res.json(reply("No sessions have been created yet, so your attendance is 0%."))

      const attended = await Attendance.countDocuments({ student: userId })
      const pct = ((attended / totalSessions) * 100).toFixed(1)
      return res.json(reply(
        `📊 You have attended ${attended} out of ${totalSessions} sessions.\n` +
        `Your attendance percentage is ${pct}%.`
      ))
    }

    // "present today" / "did i attend today" / "today status"
    if (msg.includes('present today') || msg.includes('did i attend today') || msg.includes('today status') || msg.includes('am i present')) {
      const { start, end } = todayRange()
      const todaySessions = await Session.find({ createdAt: { $gte: start, $lte: end } })
      if (todaySessions.length === 0)
        return res.json(reply("No sessions were held today."))

      const sessionIds = todaySessions.map(s => s._id)
      const attended = await Attendance.find({ student: userId, session: { $in: sessionIds } })
        .populate('session', 'subject')

      if (attended.length === 0)
        return res.json(reply(`⚠️ You have not marked attendance for any of today's ${todaySessions.length} session(s).`))

      const subjects = attended.map(a => `• ${a.session.subject}`).join('\n')
      return res.json(reply(
        `✅ You are present today for ${attended.length}/${todaySessions.length} session(s):\n${subjects}`
      ))
    }

    // "below 75" / "warning" / "shortage"
    if (msg.includes('below 75') || msg.includes('warning') || msg.includes('shortage') || msg.includes('low attendance')) {
      const totalSessions = await Session.countDocuments()
      if (totalSessions === 0)
        return res.json(reply("No sessions have been created yet."))

      const attended = await Attendance.countDocuments({ student: userId })
      const pct = (attended / totalSessions) * 100

      if (pct < 75) {
        const needed = Math.ceil(0.75 * totalSessions - attended)
        return res.json(reply(
          `🚨 Warning! Your attendance is ${pct.toFixed(1)}% which is below 75%.\n` +
          `You need to attend at least ${needed} more consecutive session(s) to reach 75%.`
        ))
      }
      return res.json(reply(
        `✅ You're safe! Your attendance is ${pct.toFixed(1)}%, which is above the 75% threshold.`
      ))
    }

    // "my history" / "sessions attended" / "classes attended"
    if (msg.includes('my history') || msg.includes('sessions attended') || msg.includes('classes attended') || msg.includes('how many classes')) {
      const records = await Attendance.find({ student: userId })
        .populate('session', 'subject createdAt')
        .sort({ markedAt: -1 })
        .limit(5)

      if (records.length === 0)
        return res.json(reply("You haven't attended any sessions yet."))

      const lines = records.map(r =>
        `• ${r.session?.subject || 'Unknown'} — ${new Date(r.markedAt).toLocaleDateString('en-IN')}`
      ).join('\n')
      return res.json(reply(`📋 Your last ${records.length} attended session(s):\n${lines}`))
    }

    // ── ADMIN intents ────────────────────────────────────────────────

    // "today attendance" / "who attended today" / "today's students"
    if (role === 'admin' && (msg.includes('today attendance') || msg.includes('who attended today') || msg.includes("today's students") || msg.includes('todays students'))) {
      const { start, end } = todayRange()
      const todaySessions = await Session.find({ createdBy: userId, createdAt: { $gte: start, $lte: end } })

      if (todaySessions.length === 0)
        return res.json(reply("You haven't created any sessions today."))

      const sessionIds = todaySessions.map(s => s._id)
      const records = await Attendance.find({ session: { $in: sessionIds } })
        .populate('student', 'name email')
        .populate('session', 'subject')

      if (records.length === 0)
        return res.json(reply("No students have marked attendance in today's sessions yet."))

      const lines = records.map(r =>
        `• ${r.student.name} (${r.student.email}) — ${r.session.subject}`
      ).join('\n')
      return res.json(reply(`👥 ${records.length} attendance record(s) today:\n${lines}`))
    }

    // "absent students" / "who is absent" / "absentees"
    if (role === 'admin' && (msg.includes('absent') || msg.includes('absentees') || msg.includes('who is absent') || msg.includes('not attended'))) {
      const { start, end } = todayRange()
      const todaySessions = await Session.find({ createdBy: userId, createdAt: { $gte: start, $lte: end } })

      if (todaySessions.length === 0)
        return res.json(reply("You haven't created any sessions today, so absent list is unavailable."))

      const sessionIds = todaySessions.map(s => s._id)
      const presentRecords = await Attendance.find({ session: { $in: sessionIds } }).distinct('student')
      const allStudents = await User.find({ role: 'student' }, 'name email')
      const absentStudents = allStudents.filter(u => !presentRecords.some(id => id.toString() === u._id.toString()))

      if (absentStudents.length === 0)
        return res.json(reply("🎉 All registered students have attended today's session(s)!"))

      const lines = absentStudents.map(u => `• ${u.name} (${u.email})`).join('\n')
      return res.json(reply(`❌ ${absentStudents.length} absent student(s) today:\n${lines}`))
    }

    // "total sessions" / "how many sessions"
    if (role === 'admin' && (msg.includes('total sessions') || msg.includes('how many sessions') || msg.includes('sessions created'))) {
      const total = await Session.countDocuments({ createdBy: userId })
      return res.json(reply(`📁 You have created ${total} session(s) in total.`))
    }

    // "total students" / "how many students"
    if (role === 'admin' && (msg.includes('total students') || msg.includes('how many students') || msg.includes('student count'))) {
      const count = await User.countDocuments({ role: 'student' })
      return res.json(reply(`👨‍🎓 There are ${count} registered student(s) in the system.`))
    }

    // ── HELP / FALLBACK ──────────────────────────────────────────────

    if (msg.includes('help') || msg.includes('what can you do') || msg.includes('commands')) {
      if (role === 'admin') {
        return res.json(reply(
          "🤖 Here's what you can ask me:\n\n" +
          "• today attendance — who attended today\n" +
          "• absent students — who is absent today\n" +
          "• total sessions — how many sessions you've created\n" +
          "• total students — number of registered students"
        ))
      }
      return res.json(reply(
        "🤖 Here's what you can ask me:\n\n" +
        "• attendance percentage — your overall %\n" +
        "• present today — did you attend today\n" +
        "• below 75 / warning — check if you're at risk\n" +
        "• my history — your recent sessions"
      ))
    }

    return res.json(reply("🤔 I didn't understand that. Type 'help' to see what I can answer."))

  } catch (err) {
    console.error('Chatbot error:', err)
    res.status(500).json({ reply: "Something went wrong. Please try again." })
  }
})

module.exports = router
