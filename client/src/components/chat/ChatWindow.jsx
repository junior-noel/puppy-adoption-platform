import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios.js';
import { getSocket } from '../../api/socket.js';
import { useAuth } from '../../context/AuthContext.jsx';

// Drop this into a conversation page: <ChatWindow conversationId={id} />
// Loads history via REST, then listens for live messages over the socket.
const ChatWindow = ({ conversationId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    api.get(`/chat/conversations/${conversationId}/messages`).then((res) => setMessages(res.data));

    const socket = getSocket();
    socket.connect();
    socket.emit('join_conversation', conversationId);

    const handleNewMessage = (msg) => {
      if (msg.conversation === conversationId) setMessages((prev) => [...prev, msg]);
    };
    socket.on('new_message', handleNewMessage);

    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.off('new_message', handleNewMessage);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    getSocket().emit('send_message', { conversationId, text });
    setText('');
  };

  return (
    <div className="flex flex-col h-[500px] border border-amber-100 rounded-xl bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
              m.sender._id === user._id || m.sender === user._id
                ? 'ml-auto bg-amber-600 text-white'
                : 'bg-amber-50'
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex border-t border-amber-100 p-3 gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-amber-100 rounded-md px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
