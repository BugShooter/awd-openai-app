import { useEffect, useRef, useState } from 'react'
import './App.css'

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  model: string | null;
  created_at: Date;
  status: 'pending' | 'completed' | 'error';
}

const sendMessage = async (message) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
  });
  return response.json();
};

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      // session_id: "1",
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
      const response = await sendMessage(message);
      // console.log("Response from server:", response);
      // Example response structure {
      //     "id": "5e260447-704a-4f09-a3ff-32f153f858cf",
      //     "session_id": "6e5764f2-0b33-4995-964a-ca3c44cdd576",
      //     "role": "assistant",
      //     "content": "Hello there.",
      //     "model": "gpt-5-nano-2025-08-07",
      //     "created_at": "2025-08-25T16:31:38.000Z"
      // }
      userMessage.status = 'completed';
      const { id, role, model, content, created_at } = response;
      const assistantMessage: ChatMessage = {
        id,
        role,
        content,
        model,
        created_at: new Date(created_at),
        status: 'completed',
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      userMessage.status = 'error';
      // setMessages([...messages]);
    }

    setMessage("");
  }

  return (
    <>
      <h1>LLM Chat</h1>
      <div className="chat-container">
        <div className="sessions"></div>
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
        />
        <button onClick={handleSendMessage}>Send Message</button>
      </div>
    </>
  )
}

export default App
