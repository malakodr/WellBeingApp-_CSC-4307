import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { MessageBubble } from '../components/MessageBubble';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { Loader2, AlertCircle, Send, ArrowLeft, Shield } from 'lucide-react';

interface Message {
  id: string;
  body: string;
  createdAt: string;
  flagged: boolean;
  flags?: string[];
  author: {
    id: string;
    displayName: string;
  };
}

interface Room {
  id: string;
  slug: string;
  title: string;
  topic: string;
  isMinorSafe: boolean;
}

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

export default function RoomPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch room metadata and initialize Socket.IO
  useEffect(() => {
    if (!slug || !user) return;

    const initializeRoom = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch room metadata
        const roomData = await api.getRoom(slug);
        setRoom(roomData);

        // Fetch initial messages (last 50)
        const messagesData = await api.getRoomMessages(slug, { limit: 50 });
        setMessages(messagesData.messages);

        // Initialize Socket.IO connection
        const token = localStorage.getItem('auth_token');
        const socketInstance = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
        });

        socketInstance.on('connect', () => {
          console.log('Socket connected');
          
          // Join the room
          socketInstance.emit('joinRoom', {
            slug,
            userId: user.id,
            displayName: user.displayName || user.name,
          });
        });

        socketInstance.on('joinedRoom', (data) => {
          console.log('Joined room:', data);
        });

        socketInstance.on('receiveMessage', (message: Message) => {
          console.log('Received message:', message);
          setMessages((prev) => [...prev, message]);
        });

        socketInstance.on('error', (errorData) => {
          console.error('Socket error:', errorData);
          setError(errorData.message || 'Connection error');
        });

        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected');
        });

        setSocket(socketInstance);

      } catch (err: any) {
        console.error('Error initializing room:', err);
        setError(err.message || 'Failed to load room');
        
        if (err.message?.includes('403')) {
          setError('You do not have access to this room');
        } else if (err.message?.includes('401')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeRoom();

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leaveRoom', { slug });
        socket.disconnect();
      }
    };
  }, [slug, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket || !user || !room) return;

    try {
      setSending(true);

      // Emit message via Socket.IO
      socket.emit('sendMessage', {
        slug: room.slug,
        body: newMessage.trim(),
        authorId: user.id,
      });

      // Clear the input
      setNewMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#003B5C] mx-auto mb-4" />
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={() => navigate('/rooms')}
            variant="outline"
            className="mt-4 w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/rooms')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-[#003B5C] flex items-center">
                {room?.title}
                {room?.isMinorSafe && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Minor Safe
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-600">{room?.topic}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                author={message.author}
                body={message.body}
                timestamp={message.createdAt}
                flagged={message.flagged}
                isCurrentUser={message.author.id === user?.id}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-4 pb-2">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-end space-x-2">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 min-h-11 max-h-32 resize-none"
            disabled={sending || !socket}
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending || !socket}
            className="bg-[#003B5C] hover:bg-[#002840]"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
