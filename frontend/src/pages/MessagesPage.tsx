import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { getSocket } from '../services/socket';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  MessageSquare, 
  Send, 
  User, 
  Phone, 
  Video, 
  MoreVertical, 
  Search,
  X
} from 'lucide-react';
import type { Message, User as UserType } from '../types';

interface Conversation {
  other_user: UserType;
  last_message: Message;
  unread_count: number;
}

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConversationRef = useRef<Conversation | null>(null);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Fetch conversations
  const loadConversations = async () => {
    try {
      const response = await apiService.getConversations();
      setConversations(response.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  // Fetch messages for a conversation
  const loadMessages = async (otherUserId: number) => {
    try {
      setLoading(true);
      const response = await apiService.getMessages({ other_user_id: otherUserId });
      setMessages(response.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await apiService.sendMessage({
        receiver_id: selectedConversation.other_user.id,
        content: newMessage.trim()
      });

      // Add the new message to the current messages list
      setMessages(prev => [...prev, response.message]);
      
      // Update the conversation list with the new message
      setConversations(prev => 
        prev.map(conv => 
          conv.other_user.id === selectedConversation.other_user.id
            ? { ...conv, last_message: response.message }
            : conv
        )
      );

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Load conversations on initial render
  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    const handleIncomingMessage = (message: Message) => {
      const activeConversation = selectedConversationRef.current;
      const isIncoming = message.receiver_id === user.id;
      const otherUserId = isIncoming ? message.sender_id : message.receiver_id;

      setConversations((prev) => {
        const existing = prev.find((conv) => conv.other_user.id === otherUserId);
        if (existing) {
          return prev.map((conv) =>
            conv.other_user.id === otherUserId
              ? {
                  ...conv,
                  last_message: message,
                  unread_count: isIncoming && activeConversation?.other_user.id !== otherUserId
                    ? conv.unread_count + 1
                    : conv.unread_count,
                }
              : conv
          );
        }
        return prev;
      });

      if (
        isIncoming &&
        activeConversation?.other_user.id === message.sender_id
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on('message', handleIncomingMessage);
    return () => {
      socket.off('message', handleIncomingMessage);
    };
  }, [user]);

  // Handle query parameters to auto-select conversation after conversations are loaded
  useEffect(() => {
    if (conversations.length > 0) {
      const userId = searchParams.get('user');
      if (userId) {
        const targetUserId = parseInt(userId);
        const conversation = conversations.find(conv => conv.other_user.id === targetUserId);
        if (conversation) {
          handleSelectConversation(conversation);
        } else {
          // If conversation not found in the list, try loading messages directly
          loadMessages(targetUserId);
          
          // Fetch user profile to get proper information
          const fetchUserProfile = async () => {
            try {
              const userProfile = await apiService.getUserById(targetUserId);
              
              // Create a conversation object with proper user info
              const tempConversation: Conversation = {
                other_user: userProfile,
                last_message: {
                  id: 0,
                  sender_id: targetUserId,
                  receiver_id: user?.id || 0,
                  content: '',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  read_at: null,
                  message_type: 'text',
                  status: 'sent'
                } as unknown as Message,
                unread_count: 0
              };
              setSelectedConversation(tempConversation);
            } catch (error) {
              console.error('Failed to fetch user profile:', error);
              // Fallback to basic user info
              const tempConversation: Conversation = {
                other_user: {
                  id: targetUserId,
                  username: `User ${targetUserId}`,
                  // Add minimal required fields
                } as unknown as UserType,
                last_message: {
                  id: 0,
                  sender_id: targetUserId,
                  receiver_id: user?.id || 0,
                  content: '',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  read_at: null,
                  message_type: 'text',
                  status: 'sent'
                } as unknown as Message,
                unread_count: 0
              };
              setSelectedConversation(tempConversation);
            }
          };
          
          fetchUserProfile();
        }
      }
    }
  }, [conversations, searchParams, user]);

  // Effect to handle initial load with user parameter
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId && conversations.length === 0) {
      // If navigating directly to a user and conversations aren't loaded yet,
      // try to load messages directly
      const targetUserId = parseInt(userId);
      if (!isNaN(targetUserId)) {
        loadMessages(targetUserId);
        
        // Fetch user profile to get proper information
        const fetchUserProfile = async () => {
          try {
            const userProfile = await apiService.getUserById(targetUserId);
            
            // Create a conversation object with proper user info
            const tempConversation: Conversation = {
              other_user: userProfile,
              last_message: {
                id: 0,
                sender_id: targetUserId,
                receiver_id: user?.id || 0,
                content: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                read_at: null,
                message_type: 'text',
                status: 'sent'
              } as unknown as Message,
              unread_count: 0
            };
            setSelectedConversation(tempConversation);
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // Fallback to basic user info
            const tempConversation: Conversation = {
              other_user: {
                id: targetUserId,
                username: `User ${targetUserId}`,
                // Add minimal required fields
              } as unknown as UserType,
              last_message: {
                id: 0,
                sender_id: targetUserId,
                receiver_id: user?.id || 0,
                content: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                read_at: null,
                message_type: 'text',
                status: 'sent'
              } as unknown as Message,
              unread_count: 0
            };
            setSelectedConversation(tempConversation);
          }
        };
        
        fetchUserProfile();
      }
    }
  }, [conversations, searchParams, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.other_user.id);
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv =>
    conv.other_user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Conversations sidebar */}
          <div className="w-full lg:w-1/3">
            <Card>
              <CardHeader className="border-b border-secondary-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Messages
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Search bar */}
                <div className="mt-4 relative">
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="divide-y divide-secondary-200">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.other_user.id}
                      className={`p-4 cursor-pointer hover:bg-secondary-50 transition-colors ${
                        selectedConversation?.other_user.id === conversation.other_user.id
                          ? 'bg-green-50 border-r-2 border-green-500'
                          : ''
                      }`}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-green-600" />
                          </div>
                          {conversation.unread_count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-secondary-900 truncate">
                              {conversation.other_user.username}
                            </h3>
                            <span className="text-xs text-secondary-500">
                              {conversation.last_message.created_at 
                                ? new Date(conversation.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : ''}
                            </span>
                          </div>
                          
                          <p className="text-sm text-secondary-600 truncate">
                            {conversation.last_message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredConversations.length === 0 && (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                      <h3 className="font-medium text-secondary-900 mb-1">No conversations yet</h3>
                      <p className="text-secondary-600">Start a conversation by sending a message</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Chat area */}
          <div className="w-full lg:w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat header */}
                <Card className="mb-4">
                  <CardHeader className="p-4 border-b border-secondary-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-secondary-900">
                            {selectedConversation.other_user.username}
                          </h3>
                          <p className="text-xs text-secondary-500">Online</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                
                {/* Messages container */}
                <Card className="flex-1 flex flex-col">
                  <CardContent className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-250px)]">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_id === user?.id
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender_id === user?.id
                                  ? 'bg-green-600 text-white'
                                  : 'bg-secondary-200 text-secondary-900'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.sender_id === user?.id
                                    ? 'text-green-100'
                                    : 'text-secondary-500'
                                }`}
                              >
                                {new Date(message.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </CardContent>
                  
                  {/* Message input */}
                  <div className="p-4 border-t border-secondary-200">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="flex-1 flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                  <h3 className="font-medium text-secondary-900 mb-2">Select a conversation</h3>
                  <p className="text-secondary-600 max-w-md mx-auto">
                    Choose a conversation from the list to start chatting with someone
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;