import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../contexts/AuthContext';

/**
 * Protected route component that requires authentication
 */
const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { isAuthenticated, loading, initialized, error } = useAuthContext();
  const { t } = useTranslation();
  const location = useLocation();
  /**
   * Show loading while authentication is being verified
   */
  if (loading || !initialized) {
    return (
      <Box 
        className="error-container"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
        }}
      >
        <Box className="error-content">
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ 
              color: 'var(--primary-color)',
              marginBottom: 3
            }}
          />
          <Typography 
            variant="h6" 
            className="error-description"
            sx={{ 
              textAlign: 'center',
              color: 'white',
              fontWeight: 500
            }}
          >
            {t('auth.verifyingSession')}
          </Typography>
        </Box>
      </Box>
    );
  }

  /**
   * Show error state if authentication failed
   */
  if (error && !isAuthenticated) {
    return (
      <Box className="error-container">
        <Box className="error-content">
          <Alert 
            severity="error" 
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              marginBottom: 3,
              borderRadius: '12px'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('auth.authenticationError')}
            </Typography>
            <Typography variant="body2" sx={{ marginTop: 1 }}>
            {t('auth.sessionVerificationError')}
            </Typography>
          </Alert>
          
          <Navigate 
            to={redirectTo} 
            state={{ from: location, error: true }} 
            replace 
          />
        </Box>
      </Box>
    );
  }

  /**
   * Redirect to login if not authenticated
   */
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  /**
   * Render protected content if authenticated
   * Use Outlet for nested routes or children for direct usage
   */
  return children || <Outlet />;
};

export default ProtectedRoute;