import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook for managing chat interface state and interactions
 * @returns {Object} Interface state and handlers
 */
export const useChatInterface = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [currentReferences, setCurrentReferences] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const textareaRef = useRef(null);
  const profileRef = useRef(null);
  const chatContentRef = useRef(null);

  /**
   * Handle screen size changes for responsive design
   */
  useEffect(() => {
    const checkScreenSize = () => {
      const isSmall = window.innerWidth <= 768;
      setIsSmallScreen(isSmall);
      if (isSmall && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isSidebarOpen]);

  /**
   * Auto-resize textarea based on content
   */
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [inputMessage]);

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  /**
   * Handle references display
   */
  const handleReferencesClick = (references) => {
    setCurrentReferences(references);
    setShowReferences(true);
  };

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    isSmallScreen,
    isProfileOpen,
    setIsProfileOpen,
    showReferences,
    setShowReferences,
    currentReferences,
    inputMessage,
    setInputMessage,
    textareaRef,
    profileRef,
    chatContentRef,
    toggleSidebar,
    handleReferencesClick
  };
}; 