# 🤖 Chatbot Feature Documentation

## Overview
A keyword-based attendance assistant chatbot integrated into the QR Attendance System. Works independently without modifying existing code.

---

## Backend

### Route: `/api/chatbot/chat`
**File:** `backend/routes/chatbot.js`

**Method:** POST  
**Auth:** Required (JWT token via `authMiddleware`)

**Request Body:**
```json
{
  "message": "attendance percentage"
}
```

**Response:**
```json
{
  "reply": "📊 You have attended 8 out of 10 sessions.\nYour attendance percentage is 80.0%."
}
```

---

## Student Commands

| Command | Description | Example Response |
|---------|-------------|------------------|
| `attendance percentage` | Shows overall attendance % | "You have attended 8/10 sessions. Your attendance is 80%." |
| `present today` | Checks today's attendance status | "✅ You are present today for 2/2 sessions" |
| `below 75` / `warning` | Warns if attendance < 75% | "🚨 Warning! Your attendance is 68.5% which is below 75%." |
| `my history` | Shows last 5 attended sessions | "📋 Your last 5 attended sessions: ..." |
| `help` | Lists available commands | Shows all student commands |

---

## Admin Commands

| Command | Description | Example Response |
|---------|-------------|------------------|
| `today attendance` | Lists all students who attended today | "👥 12 attendance records today: ..." |
| `absent students` | Lists students who didn't attend today | "❌ 3 absent students today: ..." |
| `total sessions` | Shows total sessions created | "📁 You have created 15 sessions in total." |
| `total students` | Shows registered student count | "👨🎓 There are 45 registered students." |
| `help` | Lists available commands | Shows all admin commands |

---

## Frontend

### Component: `Chatbot.jsx`
**File:** `frontend/src/pages/Chatbot.jsx`

**Features:**
- Floating chat button (bottom-right corner)
- Slide-up chat window
- Auto-scroll to latest message
- Loading state ("Thinking…")
- Enter key support

**Integration:**
```jsx
import Chatbot from './Chatbot'

// Add to any page:
<Chatbot />
```

**Currently integrated in:**
- `AdminDashboard.jsx`
- `StudentDashboard.jsx`

---

## Technical Details

### How It Works
1. User types a message in the chat input
2. Frontend sends POST request to `/api/chatbot/chat` with JWT token
3. Backend extracts `req.user.id` and `req.user.role` from token
4. Chatbot matches keywords in the message (case-insensitive)
5. Queries MongoDB models (`Attendance`, `Session`, `User`) based on intent
6. Returns a plain-text reply

### No External Dependencies
- No AI APIs (OpenAI, Dialogflow, etc.)
- Simple string matching with `.includes()`
- Reads existing MongoDB collections
- Zero changes to existing models or schemas

### Error Handling
- 401: "Please log in to use the chatbot."
- 500: "Something went wrong. Please try again."
- Unknown command: "🤔 I didn't understand that. Type 'help' to see what I can answer."

---

## Files Added

### Backend
- `backend/routes/chatbot.js` — chatbot route with keyword logic

### Frontend
- `frontend/src/pages/Chatbot.jsx` — React component
- `frontend/src/pages/Chatbot.css` — floating widget styles

### Modified (1 line each)
- `backend/server.js` — added `app.use('/api/chatbot', require('./routes/chatbot'))`
- `frontend/src/pages/AdminDashboard.jsx` — added `<Chatbot />` import + render
- `frontend/src/pages/StudentDashboard.jsx` — added `<Chatbot />` import + render

---

## Testing

### Student Flow
1. Log in as a student
2. Click the 💬 button (bottom-right)
3. Type: `attendance percentage`
4. Type: `below 75`
5. Type: `help`

### Admin Flow
1. Log in as a teacher
2. Click the 💬 button
3. Type: `today attendance`
4. Type: `absent students`
5. Type: `help`

---

## Future Enhancements (Optional)
- Add NLP library (compromise.js) for better intent matching
- Integrate OpenAI API for conversational responses
- Add voice input/output
- Multi-language support
- Export chat history
- Admin analytics dashboard via chatbot

---

## Notes
- Chatbot is **completely isolated** — removing it won't break existing features
- Uses existing auth middleware — no new security layer needed
- Mobile-responsive (chat window adapts to small screens)
- Works alongside all existing routes without conflicts
