// src/components/GroupChat.jsx
import React from 'react';
import { messages } from '../data/mockData';
// import MessageBubble from './MessageBubble';
// import ChatInput from './ChatInput';
// import './GroupChat.css';

const GroupChat = () => {
  return (
    <section className="group-chat">
      <div className="messages-wrapper">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
      <ChatInput />
    </section>
  );
};

export default GroupChat;
