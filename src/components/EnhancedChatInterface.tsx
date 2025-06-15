import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, MessageCircle, Send, Gift } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversations } from "@/hooks/useConversations";
import { useEnhancedMessages } from "@/hooks/useEnhancedMessages";
import { useNavigate } from "react-router-dom";
import TipModal from "./TipModal";

interface EnhancedChatInterfaceProps {
  onBack: () => void;
}

const EnhancedChatInterface = ({ onBack }: EnhancedChatInterfaceProps) => {
  const navigate = useNavigate();
  const { conversations, loading: conversationsLoading, markAsRead } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showTipModal, setShowTipModal] = useState(false);
  
  const { 
    messages, 
    loading: messagesLoading, 
    sendMessage, 
    updateTypingStatus 
  } = useEnhancedMessages(selectedConversation?.conversation_id);

  const filteredConversations = conversations.filter(conv =>
    conv.other_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    console.log('Sending message:', newMessage, 'to conversation:', selectedConversation.conversation_id);
    
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
      updateTypingStatus(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConversationSelect = (conversation: any) => {
    setSelectedConversation(conversation);
    // Mark as read when conversation is opened
    if (conversation.unread_count > 0) {
      markAsRead(conversation.conversation_id);
    }
  };

  const handleAvatarClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleOpenTipModal = () => {
    setShowTipModal(true);
  };

  const getLastActiveText = (lastActive?: string) => {
    if (!lastActive) return "Last seen recently";
    
    const now = new Date();
    const active = new Date(lastActive);
    const diffMinutes = Math.floor((now.getTime() - active.getTime()) / (1000 * 60));
    
    if (diffMinutes < 5) return "Active now";
    if (diffMinutes < 60) return `Active ${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Active ${diffDays}d ago`;
  };

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">Messages</h1>
                {totalUnreadCount > 0 && (
                  <Badge variant="destructive" className="bg-red-500">
                    {totalUnreadCount}
                  </Badge>
                )}
              </div>
            </div>
            
            {selectedConversation && (
              <div className="flex items-center space-x-3">
                <div className="text-white text-sm">
                  <span>{selectedConversation.other_name}</span>
                </div>
                <Button
                  onClick={handleOpenTipModal}
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Gift className="w-4 h-4 mr-1" />
                  Send Tip
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {!selectedConversation ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-semibold text-white">Conversations</h2>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {conversations.length}
                  </Badge>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>

                {/* Conversations List */}
                <ScrollArea className="h-[500px]">
                  {conversationsLoading ? (
                    <div className="text-center text-white/60 py-8">Loading conversations...</div>
                  ) : filteredConversations.length > 0 ? (
                    <div className="space-y-3">
                      {filteredConversations.map((conversation) => (
                        <div
                          key={conversation.conversation_id}
                          onClick={() => handleConversationSelect(conversation)}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer transition-colors"
                        >
                          <Avatar 
                            className="w-12 h-12 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAvatarClick(conversation.other_user_id);
                            }}
                          >
                            <AvatarImage src={conversation.other_avatar_url} alt={conversation.other_name} />
                            <AvatarFallback>{conversation.other_name[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-white text-sm truncate">
                                {conversation.other_name}
                              </h3>
                              {conversation.unread_count > 0 && (
                                <Badge variant="destructive" className="bg-red-500 text-xs">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-white/80 text-xs truncate">
                              {conversation.last_message_content || 'Start a conversation...'}
                            </p>
                            <p className="text-white/60 text-xs mt-1">
                              {conversation.last_message_at 
                                ? new Date(conversation.last_message_at).toLocaleDateString()
                                : 'Recently matched'
                              }
                            </p>
                          </div>
                          
                          {conversation.is_online && (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-white/60 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No conversations yet</p>
                      <p className="text-sm">
                        {searchTerm ? "No conversations found." : "Start matching to begin conversations!"}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            {/* Empty Chat State */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-[600px] flex items-center justify-center">
                <div className="text-center text-white/60">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                  <p>Choose a conversation to start chatting</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="text-white hover:bg-white/20 p-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  
                  <Avatar 
                    className="w-10 h-10 cursor-pointer"
                    onClick={() => handleAvatarClick(selectedConversation.other_user_id)}
                  >
                    <AvatarImage src={selectedConversation.other_avatar_url} alt={selectedConversation.other_name} />
                    <AvatarFallback>{selectedConversation.other_name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold text-white">{selectedConversation.other_name}</h3>
                    <p className="text-white/60 text-sm">
                      {getLastActiveText(selectedConversation.last_active)}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleOpenTipModal}
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Gift className="w-4 h-4 mr-1" />
                  Send Tip
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="h-[400px] p-4">
              {messagesLoading ? (
                <div className="text-center text-white/60 py-8">Loading messages...</div>
              ) : messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl ${
                          message.sender === 'me'
                            ? 'bg-white text-hooks-coral'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        <p>{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${
                            message.sender === 'me' ? 'text-hooks-coral/60' : 'text-white/60'
                          }`}>
                            {message.time}
                          </p>
                          {message.sender === 'me' && (
                            <span className={`text-xs ${
                              message.status === 'read' ? 'text-blue-500' : 
                              message.status === 'delivered' ? 'text-green-500' : 'text-gray-500'
                            }`}>
                              {message.status === 'read' ? '✓✓' : 
                               message.status === 'delivered' ? '✓' : '◌'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-white/60 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Start your conversation!</p>
                  <p className="text-sm">Send a message to {selectedConversation.other_name}</p>
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-white/20">
              <div className="flex space-x-2">
                <Input
                  placeholder={`Message ${selectedConversation.other_name}...`}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    updateTypingStatus(e.target.value.length > 0);
                  }}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-white text-hooks-coral hover:bg-white/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tip Modal */}
      {selectedConversation && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          recipientName={selectedConversation.other_name}
          recipientId={selectedConversation.other_user_id}
        />
      )}
    </div>
  );
};

export default EnhancedChatInterface;
