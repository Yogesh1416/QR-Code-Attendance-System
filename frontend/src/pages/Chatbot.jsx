import { useState, useRef, useEffect } from 'react'
import API from '../api'
import './Chatbot.css'

const WELCOME = {
  from: 'bot',
  text: "👋 Hi! I'm your attendance assistant.\nType 'help' to see what I can answer."
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { from: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await API.post('/chatbot/chat', { message: text })
      setMessages(prev => [...prev, { from: 'bot', text: res.data.reply }])
    } catch (err) {
      const errMsg = err.response?.status === 401
        ? "⚠️ Please log in to use the chatbot."
        : "⚠️ Something went wrong. Please try again."
      setMessages(prev => [...prev, { from: 'bot', text: errMsg }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <>
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🤖</div>
              <div className="chatbot-header-text">
                <strong>Attendance Assistant</strong>
                <div className="chatbot-online">
                  <span className="chatbot-online-dot" />
                  Online
                </div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.from}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chatbot-hint">Try: "attendance percentage" · "below 75" · "help"</div>

          <div className="chatbot-input-row">
            <input
              type="text"
              placeholder="Ask something…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button className="chatbot-send" onClick={sendMessage} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}

      <button
        className="chatbot-toggle"
        onClick={() => setOpen(o => !o)}
        title="Attendance Assistant"
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  )
}
