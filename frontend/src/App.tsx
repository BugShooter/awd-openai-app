import { useEffect, useRef, useState } from 'react'
import './App.css'

interface User {
  id: string;
  email: string;
  name: string;
}

interface Session {
  id: string;
  user_id: string;
  created_at: Date;
}

interface ChatMessage {
  id: string;
  session_id: string | null;
  role: string;
  content: string;
  model: string | null;
  created_at: Date;
  status: 'pending' | 'completed' | 'error';
}

interface AuthProps {
  user: User | null;
  sessions: Session[] | null;
}

const sendMessage = async (sessionId: string, message: string) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/${sessionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
  });
  return response.json();
};

function App({ user, sessions }: AuthProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (sessions && sessions.length > 0 && sessions.findIndex(s => s.id === sessionId) === -1) {
      setSessionId(sessions[0].id);
    }
  }, [sessionId, sessions]);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;
    if (!sessionId) {
      console.error("No session ID available.");
      return;
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      session_id: sessionId,
      role: "user",
      content: message,
      model: null,
      created_at: new Date(),
      status: 'pending',
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Handle sending the message
    console.log("Sending message:", message);
    try {
      setIsSending(true);
      const response = await sendMessage(sessionId, message);
      userMessage.status = 'completed';
      const { id, role, model, content, created_at } = response;
      const assistantMessage: ChatMessage = {
        id,
        session_id: sessionId,
        role,
        content,
        model,
        created_at: new Date(created_at),
        status: 'completed',
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      userMessage.status = 'error';
      setMessages((prevMessages) => [...prevMessages]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <h1>LLM Chat</h1>
      {user && <div className="user-info">Logged in as: {user.name}</div>}
      <div className="chat-container">
        <div className="sessions">
          {sessions && sessions.map((session) => (
            <div key={session.id} className={`session ${session.id === sessionId ? 'active' : ''}`}>{session.id}</div>
          ))}
        </div>
        <div className="messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.role}-message`}>
              <strong>{msg.role === 'user' ? 'You' : 'Assistant'}: </strong>
              {msg.content}
              {msg.status === 'pending' && <span className="status pending"> (Sending...)</span>}
              {msg.status === 'error' && <span className="status error"> (Error)</span>}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="user-actions">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          readOnly={isSending}
        />
        <button onClick={handleSendMessage} disabled={isSending}>Send Message</button>
      </div>
    </>
  )
}

// Component that handles authentication and wraps the App
const AppWrapper = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth`);
        const data = await response.json();
        setUser(data.user);
        setSessions(data.sessions.map((session: Session) => ({
          id: session.id,
          user_id: session.user_id,
          created_at: new Date(session.created_at),
        })));
      } catch (error) {
        console.error("Error fetching auth data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <App user={user} sessions={sessions} />;
};

export default AppWrapper;
