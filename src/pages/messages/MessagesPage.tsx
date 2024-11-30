import React, { useState } from 'react';
import { ChatList } from '../../components/messaging/ChatList';
import { ChatWindow } from '../../components/messaging/ChatWindow';
import { useAuthStore } from '../../store/useAuthStore';

// Mock data - replace with API calls
const MOCK_CHATS = [
  {
    id: '1',
    userId: 'user2',
    userName: 'Alice Smith',
    userAvatar: 'https://ui-avatars.com/api/?name=Alice+Smith',
    lastMessage: 'Is this still available?',
    lastMessageDate: '2024-03-15T14:30:00Z',
    unread: true,
  },
  {
    id: '2',
    userId: 'user3',
    userName: 'Bob Johnson',
    userAvatar: 'https://ui-avatars.com/api/?name=Bob+Johnson',
    lastMessage: 'Thanks for the quick response!',
    lastMessageDate: '2024-03-14T09:15:00Z',
    unread: false,
  },
];

const MOCK_MESSAGES = {
  '1': [
    {
      id: 'm1',
      senderId: 'user2',
      content: 'Hi, is this property still available?',
      timestamp: '2024-03-15T14:30:00Z',
    },
    {
      id: 'm2',
      senderId: 'user1',
      content: 'Yes, it is! Would you like to schedule a viewing?',
      timestamp: '2024-03-15T14:35:00Z',
    },
  ],
};

export function MessagesPage() {
  const user = useAuthStore((state) => state.user);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();

  const handleSendMessage = (content: string) => {
    // TODO: Implement sending messages
    console.log('Sending message:', content);
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm min-h-[600px]">
      <div className="grid grid-cols-3 h-full">
        {/* Chat List */}
        <div className="border-r">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>
          <ChatList
            chats={MOCK_CHATS}
            onChatSelect={setSelectedChatId}
            selectedChatId={selectedChatId}
          />
        </div>

        {/* Chat Window */}
        <div className="col-span-2">
          {selectedChatId ? (
            <ChatWindow
              chatId={selectedChatId}
              messages={MOCK_MESSAGES[selectedChatId] || []}
              currentUserId={user.id}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}