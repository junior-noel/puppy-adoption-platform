import { useParams } from 'react-router-dom';
import ChatWindow from '../../components/chat/ChatWindow.jsx';

const ChatPage = () => {
  const { conversationId } = useParams();
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-3xl mb-6">Conversation</h1>
      <ChatWindow conversationId={conversationId} />
    </div>
  );
};

export default ChatPage;
