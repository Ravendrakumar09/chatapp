'use client';

import React from 'react';

interface Message {
  sender: string;
  content: string;
}

interface MessagesProps {
  messages: Message[];
}

const Messages: React.FC<MessagesProps> = ({ messages }) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto text-gray-700">
      <div className="flex justify-center items-center text-gray-500 italic">
        {messages && messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className="mb-2 p-2 bg-white rounded shadow">
              <p><strong>{msg.sender}:</strong> {msg.content}</p>
            </div>
          ))
        ) : (
          "No messages yet"
        )}
      </div>
    </div>
  );
};

export default Messages;
