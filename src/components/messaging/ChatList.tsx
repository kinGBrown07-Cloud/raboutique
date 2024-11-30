import React from 'react';
import { formatDate } from '../../utils/date';

interface Chat {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  lastMessageDate: string;
  unread: boolean;
}

interface ChatListProps {
  chats: Chat[];
  onChatSelect: (chatId: string) => void;
  selectedChatId?: string;
}

export function ChatList({ chats, onChatSelect, selectedChatId }: ChatListProps) {
  return (
    <div className="divide-y divide-gray-200">
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onChatSelect(chat.id)}
          className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 ${
            selectedChatId === chat.id ? 'bg-indigo-50' : ''
          }`}
        >
          <img
            src={chat.userAvatar}
            alt={chat.userName}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <p className="text-sm font-medium text-gray-900 truncate">
                {chat.userName}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(chat.lastMessageDate)}
              </p>
            </div>
            <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
          </div>
          {chat.unread && (
            <div className="w-2 h-2 bg-indigo-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}