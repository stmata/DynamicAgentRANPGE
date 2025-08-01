import React, { useState, useEffect } from 'react';
import Chat from '../components/Chat/Chat';
import FloatingChatButton from '../components/FloatingChatButton/FloatingChatButton';

/**
 * Chat screen component with responsive FloatingChatButton positioning
 * On small screens (≤1040px), the FloatingChatButton is rendered inside the sidebar
 * On larger screens (>1040px), it's rendered outside the sidebar in the main screen
 * 
 * @returns {React.ReactElement} Chat screen component
 */
const ChatScreen = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 1040);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  /**
   * Update screen size state based on window width
   */
  const updateScreenSize = () => {
    setIsSmallScreen(window.innerWidth <= 1040);
  };

  /**
   * Setup window resize listener to track screen size changes
   */
  useEffect(() => {
    updateScreenSize();
    
    window.addEventListener('resize', updateScreenSize);
    
    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  /**
   * Create FloatingChatButton for sidebar (small screen)
   */
  const sidebarFloatingButton = isSmallScreen && isSidebarOpen ? (
  <FloatingChatButton isK2Mode={true} intoSidebar={true} />
) : null;

  return (
    <div className="chat-screen">
      <Chat 
        sidebarFloatingButton={sidebarFloatingButton}
        onSidebarToggle={setIsSidebarOpen}
      />
      
      {/* FloatingChatButton for large screens - positioned outside sidebar 
      {!isSmallScreen && (
        <FloatingChatButton isK2Mode={true} intoSidebar={false} />
      )}*/}
    </div>
  );
};

export default ChatScreen;