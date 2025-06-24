import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { useTheme } from '../../../contexts/ThemeContext';
import { generateStudyGuidePDF } from '../../../utils/pdfGenerator';

/**
 * Quiz dialogs component containing all Material-UI dialogs
 * @param {boolean} confirmDialogOpen - Confirm submission dialog state
 * @param {boolean} successDialogOpen - Success dialog state
 * @param {boolean} guideDialogOpen - Study guide dialog state
 * @param {boolean} errorDialogOpen - Error dialog state
 * @param {number} attemptedCount - Number of attempted questions
 * @param {number} totalQuestions - Total number of questions
 * @param {Object} submissionResults - Submission results with study guide
 * @param {string} error - Error message
 * @param {Function} setConfirmDialogOpen - Set confirm dialog state
 * @param {Function} setSuccessDialogOpen - Set success dialog state
 * @param {Function} setGuideDialogOpen - Set guide dialog state
 * @param {Function} setErrorDialogOpen - Set error dialog state
 * @param {Function} confirmSubmit - Confirm submission handler
 */
const QuizDialogs = ({
  confirmDialogOpen,
  successDialogOpen,
  guideDialogOpen,
  errorDialogOpen,
  attemptedCount,
  totalQuestions,
  submissionResults,
  error,
  isPositionnement,
  setConfirmDialogOpen,
  setSuccessDialogOpen,
  setGuideDialogOpen,
  setErrorDialogOpen,
  confirmSubmit,
  onSuccessDialogClose
}) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

  /**
   * Processes bold text formatting in study guide content
   * @param {string} text - Text to process
   * @returns {JSX.Element[]} Processed text with bold formatting
   */
  const processBoldText = (text) => {
    if (!text.includes('**')) return text;
    
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };
  
  /**
   * Handles PDF download for study guide
   */
  const handleDownloadStudyGuidePDF = async () => {
    try {
      if (!submissionResults?.study_guide) {
        console.error('No study guide content available');
        return;
      }
      
      await generateStudyGuidePDF(
        submissionResults.study_guide,
        t('evaluation.guideTitle')
      );
    } catch (error) {
      console.error('Error downloading study guide PDF:', error);
    }
  };
  

  /**
   * Renders formatted study guide content
   */
  const renderStudyGuide = () => {
    if (!submissionResults?.study_guide) {
      return <DialogContentText>{t('evaluation.guideUnavailable')}</DialogContentText>;
    }
  
    const lines = submissionResults.study_guide.split('\n');
  
    const output = [];
    const listStack = [];
  
    const pushParagraph = (text, key) => {
      if (text.trim() !== '') {
        output.push(
          <p key={`p-${key}`} className="study-guide-paragraph">
            {processBoldText(text)}
          </p>
        );
      }
    };
  
    const closeLists = () => {
      while (listStack.length > 0) {
        const list = listStack.pop();
        const parent = listStack[listStack.length - 1];
        const element = (
          <ul key={`list-${output.length}-${list.indent}`} className={`indent-level-${list.indent}`}>
            {list.items}
          </ul>
        );
        if (parent) {
          parent.items.push(
            <li key={`li-${output.length}-${list.indent}`} className={`study-guide-bullet indent-${list.indent}`}>
              {element}
            </li>
          );
        } else {
          output.push(element);
        }
      }
    };
  
    lines.forEach((line, index) => {
      const trimmed = line.trim();
  
      // Header (## Title)
      const headerMatch = /^#{1,6}\s+(.+)$/.exec(trimmed);
      if (headerMatch) {
        closeLists();
        const level = line.match(/^#+/)[0].length;
        const headerClass = level === 2 ? 'study-guide-header-main' : 'study-guide-header';
        output.push(
          <h3 key={`h-${index}`} className={headerClass}>
            {headerMatch[1]}
          </h3>
        );
        return;
      }
  
      // Empty line
      if (trimmed === '') {
        closeLists();
        output.push(<br key={`br-${index}`} />);
        return;
      }
  
      // Bullet or sub-bullet
      const bulletMatch = /^(\s*)([-*])\s+(.+)$/.exec(line);
      if (bulletMatch) {
        const indent = Math.floor(bulletMatch[1].length / 2);
        const text = bulletMatch[3];
  
        // Adjust list stack
        while (listStack.length > 0 && listStack[listStack.length - 1].indent > indent) {
          const list = listStack.pop();
          const element = (
            <ul key={`list-${output.length}-${list.indent}`} className={`indent-level-${list.indent}`}>
              {list.items}
            </ul>
          );
  
          if (listStack.length > 0) {
            listStack[listStack.length - 1].items.push(
              <li key={`nested-li-${index}`} className={`study-guide-bullet indent-${list.indent}`}>
                {element}
              </li>
            );
          } else {
            output.push(element);
          }
        }
  
        if (listStack.length === 0 || listStack[listStack.length - 1].indent < indent) {
          listStack.push({ indent, items: [] });
        }
  
        listStack[listStack.length - 1].items.push(
          <li key={`li-${index}`} className={`study-guide-bullet indent-${indent}`}>
            {processBoldText(text)}
          </li>
        );
        return;
      }
  
      // Regular paragraph
      closeLists();
      pushParagraph(line, index);
    });
  
    closeLists(); // In case anything remains in the stack
  
    return <div className="study-guide-content">{output}</div>;
  };
  

  return (
    <>
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              background: isDarkMode ? 'var(--dark-white)' : 'var(--white)',
              color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)'
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600,
          borderBottom: '1px solid',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }}>
          {t('evaluation.confirmSubmitTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{
            color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)',
            marginTop: '8px'
          }}>
            {t('evaluation.confirmSubmit', { 
              attempted: attemptedCount, 
              total: totalQuestions 
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          padding: '16px 24px'
        }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)}
            sx={{
              color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)',
              '&:hover': {
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              }
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={confirmSubmit} 
            variant="contained"
            sx={{
              backgroundColor: isDarkMode ? 'var(--primary)' : 'var(--primary)',
              '&:hover': {
                backgroundColor: isDarkMode ? 'var(--primary-dark)' : 'var(--primary-dark)'
              }
            }}
          >
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              background: isDarkMode ? 'var(--dark-white)' : 'var(--white)',
              color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)'
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600,
          borderBottom: '1px solid',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }}>
          {t('evaluation.submissionSuccessTitle')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{
            color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)',
            marginTop: '8px'
          }}>
            {submissionResults?.final_score !== undefined ? (
              <>
                {t('evaluation.submitSuccess')}
                <br /><br />
                <div style={{ 
                  textAlign: 'center', 
                  fontSize: '1.2em', 
                  fontWeight: 'bold',
                  margin: '10px 0'
                }}>
                  {t('evaluation.scoreLabel')} {t('evaluation.scoreValue', { score: Math.round(submissionResults.final_score) })}
                </div>
                <br />
                {isPositionnement ? (
                  submissionResults.final_score >= 57
                    ? t('evaluation.positioningPassed')
                    : t('evaluation.positioningFailed')
                ) : (
                  submissionResults.final_score >= 57
                    ? t('evaluation.moduleGood')
                    : t('evaluation.moduleNeedsWork')
                )}
              </>
            ) : (
              t('evaluation.submitSuccess')
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          padding: '16px 24px'
        }}>
          <Button 
            onClick={() => {
              setSuccessDialogOpen(false);
              if (onSuccessDialogClose) {
                onSuccessDialogClose();
              }
            }} 
            variant="contained"
            sx={{
              backgroundColor: isDarkMode ? 'var(--primary)' : 'var(--primary)',
              '&:hover': {
                backgroundColor: isDarkMode ? 'var(--primary-dark)' : 'var(--primary-dark)'
              }
            }}
          >
            {t('common.ok')}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog
        open={guideDialogOpen}
        onClose={() => setGuideDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              background: isDarkMode ? 'var(--dark-white)' : 'var(--white)',
              color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)'
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600,
          borderBottom: '1px solid',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }}>
          {t('evaluation.guideTitle')}
        </DialogTitle>
        <DialogContent>
          {renderStudyGuide()}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          padding: '16px 24px'
        }}>
          <Button 
            onClick={() => setGuideDialogOpen(false)} 
            sx={{
              color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)',
              '&:hover': {
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
              }
            }}
          >
            {t('common.close')}
          </Button>
          <Button 
            onClick={handleDownloadStudyGuidePDF}
            variant="contained"
            sx={{
              backgroundColor: isDarkMode ? 'var(--primary)' : 'var(--primary)',
              '&:hover': {
                backgroundColor: isDarkMode ? 'var(--primary-dark)' : 'var(--primary-dark)'
              }
            }}
          >
            {t('common.download_pdf')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              background: isDarkMode ? 'var(--dark-white)' : 'var(--white)',
              color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)'
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600,
          borderBottom: '1px solid',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }}>
          {t('common.error')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{
            color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)',
            marginTop: '8px'
          }}>
            {error}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          padding: '16px 24px'
        }}>
          <Button 
            onClick={() => setErrorDialogOpen(false)} 
            variant="contained"
            sx={{
              backgroundColor: isDarkMode ? 'var(--primary)' : 'var(--primary)',
              '&:hover': {
                backgroundColor: isDarkMode ? 'var(--primary-dark)' : 'var(--primary-dark)'
              }
            }}
          >
            {t('common.ok')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuizDialogs; 