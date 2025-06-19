import React from 'react';
import Chat from '../components/Chat/Chat';

/**
 * Chat screen component with full screen layout
 * 
 * @returns {React.ReactElement} Chat screen component
 */
const ChatScreen = () => {
  return (
    <div className="chat-screen">
      <Chat />
    </div>
  );
};

export default ChatScreen;