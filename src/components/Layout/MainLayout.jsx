import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

/**
 * Main layout component for all authenticated pages
 * Includes the Navbar and tracks user activity
 * 
 * @returns {React.ReactElement} MainLayout component
 */
const MainLayout = () => {
  
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout; 