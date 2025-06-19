import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Course selection dialog for positioning assessment
 * Shows available courses and allows user to select one for evaluation
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether dialog is open
 * @param {Function} props.onClose - Close dialog handler  
 * @param {Function} props.onCourseSelect - Course selection handler
 * @param {Array} props.availableCourses - Array of available courses
 * @returns {JSX.Element} CourseSelectionDialog component
 */
const CourseSelectionDialog = ({ 
  open, 
  onClose, 
  onCourseSelect, 
  availableCourses = [] 
}) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  /**
   * Handle course selection and close dialog
   * @param {Object} course - Selected course object
   */
  const handleCourseSelect = (course) => {
    onCourseSelect(course);
    onClose();
  };

  /**
   * Filter only active courses for positioning assessment
   * Exclude the positioning card itself from the selection
   */
  const activeCourses = availableCourses.filter(course => 
    course.isActive && course.id !== 'positionnement'
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
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
        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        {t('positioning.selectCourse')}
      </DialogTitle>
      
      <DialogContent sx={{ padding: 0 }}>
        <Box sx={{ padding: '16px 24px 8px 24px' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)',
              opacity: 0.8,
              textAlign: 'center',
              marginBottom: '16px'
            }}
          >
            {t('positioning.selectCourseDescription')}
          </Typography>
        </Box>

        {activeCourses.length > 0 ? (
          <List sx={{ padding: 0 }}>
            {activeCourses.map((course, index) => (
              <React.Fragment key={course.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleCourseSelect(course)}
                    sx={{
                      padding: '16px 24px',
                      '&:hover': {
                        backgroundColor: isDarkMode 
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {course.title?.fr || course.title?.en || course.title}
                          </Typography>
                          <Chip 
                            label={`${course.modules} ${t('common.modules')}`}
                            size="small"
                            sx={{
                              backgroundColor: isDarkMode 
                                ? 'rgba(255,255,255,0.1)' 
                                : 'rgba(0,0,0,0.08)',
                              color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)',
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)',
                            opacity: 0.7,
                            marginTop: '4px'
                          }}
                        >
                          {course.shortDescription?.fr || course.shortDescription?.en || course.shortDescription}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < activeCourses.length - 1 && (
                  <Box 
                    sx={{ 
                      height: '1px', 
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      margin: '0 24px'
                    }} 
                  />
                )}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ padding: '32px 24px', textAlign: 'center' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)',
                opacity: 0.6
              }}
            >
              {t('positioning.noCoursesAvailable')}
            </Typography>
          </Box>
        )}
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
          {t('common.cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseSelectionDialog; 