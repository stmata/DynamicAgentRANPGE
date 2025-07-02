import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import ChatLayout from './components/Layout/ChatLayout';
import HomeScreen from './pages/HomeScreen';
import DashboardScreen from './pages/DashboardScreen/DashboardScreen';
import CourseModuleScreen from './pages/CourseModuleScreen';
import SettingsModal from './components/Settings/SettingsModal';
import EvaluationScreen from './pages/EvaluationScreen/EvaluationScreen';
import ChatScreen from './pages/ChatScreen';
import LoginScreen from './pages/LoginScreen/LoginScreen';
import ErrorScreen from './pages/ErrorScreen/ErrorScreen';
import EvaluationCaseScren from './pages/EvaluationCaseScren';
import FloatingChatButton from './components/FloatingChatButton/FloatingChatButton';

/**
 * Main App component with routing and context providers
 * 
 * @returns {React.ReactElement} App component
 */
function App() {
  useEffect(() => {
    const imgs = document.querySelectorAll('img');
    imgs.forEach((img) => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }, []);
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginScreen />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  {/* Main routes with navbar */}
                  <Route element={<MainLayout />}>
                    <Route path="/" element={<HomeScreen />} />
                    <Route path="/dashboard" element={< DashboardScreen/>} />
                    <Route path="/evaluation" element={<EvaluationScreen />} />
                    <Route path="/course-modules" element={<CourseModuleScreen />} />
                  </Route>
                  
                  {/* Chat route with its own layout (no navbar) */}
                  <Route element={<ChatLayout />}>
                    <Route path="/chat" element={<ChatScreen />} />
                    <Route path="/chat/:conversationId" element={<ChatScreen />} />
                    <Route path="/evaluation-case" element={<EvaluationCaseScren />} />
                  </Route>
                </Route>
                {/* 404 Error route */}
                <Route path="*" element={<ErrorScreen />} />
              </Routes>
              {/* Floating Chat Button - visible on all pages */}
              <FloatingChatButton />
              <SettingsModal />
            </Router>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
