import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Chat layout component without navbar
 * Used only for the chat screen
 * 
 * @returns {React.ReactElement} ChatLayout component
 */
const ChatLayout = () => {
  
  return (
    <div className="app">
      <main className="chat-content-container">
        <Outlet />
      </main>
    </div>
  );
};

export default ChatLayout; 