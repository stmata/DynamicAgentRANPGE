import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  DialogContentText 
} from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

/**
 * Delete conversation confirmation dialog component
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether dialog is open
 * @param {Function} props.onClose - Close dialog handler
 * @param {Function} props.onConfirm - Confirm deletion handler
 * @returns {JSX.Element} DeleteConversationDialog component
 */
const DeleteConversationDialog = ({ open, onClose, onConfirm }) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          background: isDarkMode ? 'var(--dark-white)' : 'var(--white)',
          color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)'
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 600,
        borderBottom: '1px solid',
        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      }}>
        {t('deleteConversation.title')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{
          color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)',
          marginTop: '8px'
        }}>
          {t('deleteConversation.message')}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ 
        borderTop: '1px solid',
        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        padding: '16px 24px'
      }}>
        <Button 
          onClick={onClose}
          sx={{
            color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)',
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }
          }}
        >
          {t('deleteConversation.cancel')}
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          sx={{
            backgroundColor: '#e73d3c',
            '&:hover': {
              backgroundColor: '#c0392b'
            }
          }}
        >
          {t('deleteConversation.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConversationDialog; 