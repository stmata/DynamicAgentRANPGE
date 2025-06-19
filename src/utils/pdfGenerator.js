import html2pdf from 'html2pdf.js';
import i18next from 'i18next';

/**
 * Configuration options for PDF generation
 */
const DEFAULT_PDF_OPTIONS = {
  margin: 10,
  filename: 'document.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { 
    scale: 1.5,
    useCORS: true,
    letterRendering: true,
    allowTaint: false,
    logging: false,
    height: null,
    width: null,
    scrollX: 0,
    scrollY: 0
  },
  jsPDF: { 
    unit: 'mm', 
    format: 'a4', 
    orientation: 'portrait',
    compress: true
  }
};

/**
 * Gets the current language from i18n
 * @returns {string} Current language code
 */
const getCurrentLanguage = () => {
  return i18next.language || 'en';
};

/**
 * Gets localized text using i18n with fallback
 * @param {string} key - Translation key
 * @param {string} fallback - Fallback text if translation not found
 * @returns {string} Localized text
 */
const t = (key, fallback = '') => {
  return i18next.t(key, { defaultValue: fallback });
};

/**
 * Converts markdown content to HTML string
 * @param {string} markdownContent - The markdown content to convert
 * @returns {string} HTML string
 */
const markdownToHtml = (markdownContent) => {
  if (!markdownContent) return '';
  
  // Clean up common markdown artifacts that might not render properly
  let cleanedContent = markdownContent
    .replace(/^\*\*(.*?)\*\*$/gm, '<strong>$1</strong>') // Bold text on its own line
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Inline bold text
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>') // H3 headers
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>') // H2 headers
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>') // H1 headers
    .replace(/^\* (.*?)$/gm, '<li>$1</li>') // List items
    .replace(/\n\n/g, '</p><p>') // Paragraph breaks
    .replace(/\n/g, '<br>'); // Line breaks

  // Wrap list items properly
  cleanedContent = cleanedContent.replace(/(<li>.*?<\/li>)/gs, (match) => {
    return `<ul>${match}</ul>`;
  });
  
  // Remove duplicate ul tags
  cleanedContent = cleanedContent.replace(/<\/ul>\s*<ul>/g, '');
  
  // Ensure content is wrapped in paragraphs
  if (cleanedContent && !cleanedContent.startsWith('<')) {
    cleanedContent = `<p>${cleanedContent}</p>`;
  }

  return cleanedContent;
};

/**
 * Enhanced styles for PDF documents
 */
const getEnhancedStyles = () => `
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
      width: 100%;
      min-height: 100vh;
    }
    
    .pdf-container {
      width: 100%;
      max-width: none;
      margin: 0;
      padding: 20px;
      background: white;
      min-height: 100vh;
    }
    
    .pdf-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #1976d2;
    }
    
    .pdf-title {
      color: #1976d2;
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .pdf-subtitle {
      color: #666;
      font-size: 18px;
      font-weight: normal;
      margin: 5px 0;
    }
    
    .pdf-meta {
      color: #999;
      font-size: 14px;
      margin: 5px 0;
    }
    
    .content-section {
      margin-bottom: 30px;
    }
    
    .message {
      margin-bottom: 25px;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      page-break-inside: avoid;
      break-inside: avoid;
      width: 100%;
    }
    
    .user-message {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      margin-left: 30px;
      border-left: 4px solid #1976d2;
    }
    
    .bot-message {
      background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
      margin-right: 30px;
      border-left: 4px solid #424242;
    }
    
    .message-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      font-weight: bold;
    }
    
    .message-avatar {
      margin-right: 10px;
      font-size: 18px;
    }
    
    .user-label {
      color: #1976d2;
    }
    
    .bot-label {
      color: #424242;
    }
    
    .message-content {
      line-height: 1.7;
      font-size: 14px;
    }
    
    .message-content h1, .message-content h2, .message-content h3 {
      margin: 15px 0 10px 0;
      color: #333;
    }
    
    .message-content h1 {
      font-size: 20px;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 5px;
    }
    
    .message-content h2 {
      font-size: 18px;
      color: #1976d2;
    }
    
    .message-content h3 {
      font-size: 16px;
      color: #555;
    }
    
    .message-content p {
      margin: 10px 0;
    }
    
    .message-content ul, .message-content ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    
    .message-content li {
      margin: 5px 0;
    }
    
    .message-content strong {
      color: #1976d2;
      font-weight: 600;
    }
    
    .evaluation-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border-left: 4px solid #28a745;
    }
    
    .evaluation-title {
      color: #28a745;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    
    .score-display {
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
      text-align: center;
      margin: 15px 0;
      padding: 10px;
      background: white;
      border-radius: 8px;
    }
    
    .points-section {
      margin: 20px 0;
    }
    
    .points-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }
    
    .point-item {
      display: flex;
      align-items: flex-start;
      margin: 8px 0;
      padding: 5px 0;
    }
    
    .point-icon {
      margin-right: 8px;
      margin-top: 2px;
    }
    
    .check-icon {
      color: #28a745;
    }
    
    .improvement-icon {
      color: #ffc107;
    }
    
    .pdf-footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    
    @media print {
      .pdf-container {
        padding: 20px;
      }
      
      .message {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  </style>
`;

/**
 * Generates and downloads a PDF from a DOM element
 * @param {HTMLElement} element - The DOM element to convert to PDF
 * @param {string} filename - The filename for the downloaded PDF
 * @param {Object} options - Optional configuration overrides
 * @returns {Promise<void>}
 */
export const generatePDFFromElement = async (element, filename = 'document.pdf', options = {}) => {
  if (!element) {
    throw new Error('Element is required for PDF generation');
  }

  const config = {
    ...DEFAULT_PDF_OPTIONS,
    ...options,
    filename
  };

  try {
    await html2pdf().from(element).set(config).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

/**
 * Generates and downloads a PDF from HTML content
 * @param {string} htmlContent - The HTML content as string
 * @param {string} filename - The filename for the downloaded PDF
 * @param {Object} options - Optional configuration overrides
 * @returns {Promise<void>}
 */
export const generatePDFFromHTML = async (htmlContent, filename = 'document.pdf', options = {}) => {
  if (!htmlContent) {
    throw new Error('HTML content is required for PDF generation');
  }

  const config = {
    ...DEFAULT_PDF_OPTIONS,
    ...options,
    filename
  };

  const fullHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${getEnhancedStyles()}
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

  try {
    await html2pdf().from(fullHTML).set(config).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

/**
 * Generates PDF from study guide content with enhanced formatting
 * @param {string} studyGuideContent - The study guide content (can be markdown)
 * @param {string} title - The title for the PDF
 * @returns {Promise<void>}
 */
export const generateStudyGuidePDF = async (studyGuideContent, title = null) => {
  const pdfTitle = title || t('pdf.studyGuide.title', 'Study Guide');
  const processedContent = markdownToHtml(studyGuideContent);
  const currentLang = getCurrentLanguage();
  
  const htmlContent = `
    <div class="pdf-container">
      <div class="pdf-header">
        <h1 class="pdf-title">${pdfTitle}</h1>
      </div>
      
      <div class="content-section">
        <div class="message-content">
          ${processedContent}
        </div>
      </div>
      
      <div class="pdf-footer">
        ${t('pdf.generatedOn', 'Generated on')} ${new Date().toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-US')} ${t('pdf.at', 'at')} ${new Date().toLocaleTimeString(currentLang === 'fr' ? 'fr-FR' : 'en-US')}
      </div>
    </div>
  `;

  const filename = `${pdfTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
  
  await generatePDFFromHTML(htmlContent, filename, {
    margin: [15, 10, 15, 10],
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  });
};

/**
 * Finds evaluation message in conversation
 * @param {Array} messages - Array of conversation messages
 * @returns {Object|null} Evaluation message or null
 */
const findEvaluationMessage = (messages) => {
  return messages.find(msg => 
    msg.content && (
      // French terms
      msg.content.includes('Score obtenu') || 
      msg.content.includes('Résultats de l\'évaluation') ||
      msg.content.includes('Points forts') ||
      msg.content.includes('Points d\'amélioration') ||
      msg.content.includes('Commentaires détaillés') ||
      // English terms
      msg.content.includes('Score obtained') ||
      msg.content.includes('Evaluation results') ||
      msg.content.includes('Assessment results') ||
      msg.content.includes('Strong points') ||
      msg.content.includes('Strengths') ||
      msg.content.includes('Areas for improvement') ||
      msg.content.includes('Points for improvement') ||
      msg.content.includes('Improvement areas') ||
      msg.content.includes('Detailed comments')
    )
  );
};

/**
 * Formats evaluation content with proper HTML structure
 * @param {string} content - Message content
 * @returns {string} Formatted HTML content
 */
const formatEvaluationContent = (content) => {
  // Extract score if present
  const scoreMatch = content.match(/(Score obtenu|Score obtained|Score)[:\s]*(\d+)\/(\d+)/i);
  let scoreHTML = '';
  if (scoreMatch) {
    scoreHTML = `<div class="score-display">${t('pdf.evaluation.score', 'Score')}: ${scoreMatch[2]}/${scoreMatch[3]}</div>`;
  }
  
  // Process the content
  let processedContent = markdownToHtml(content);
  
  // Format evaluation sections using i18n
  processedContent = processedContent
    // French patterns
    .replace(/(Points forts)[:\s]*/gi, `<div class="points-title">${t('pdf.evaluation.strengths', 'Points forts')} :</div>`)
    .replace(/(Points d'amélioration)[:\s]*/gi, `<div class="points-title">${t('pdf.evaluation.improvements', 'Points d\'amélioration')} :</div>`)
    .replace(/(Commentaires détaillés)[:\s]*/gi, `<div class="points-title">${t('pdf.evaluation.comments', 'Commentaires détaillés')} :</div>`)
    // English patterns
    .replace(/(Strong points|Strengths)[:\s]*/gi, `<div class="points-title">${t('pdf.evaluation.strengths', 'Strengths')} :</div>`)
    .replace(/(Areas for improvement|Points for improvement|Improvement areas)[:\s]*/gi, `<div class="points-title">${t('pdf.evaluation.improvements', 'Areas for improvement')} :</div>`)
    .replace(/(Detailed comments)[:\s]*/gi, `<div class="points-title">${t('pdf.evaluation.comments', 'Detailed comments')} :</div>`);
  
  return scoreHTML + processedContent;
};

/**
 * Generates PDF from evaluation case conversation with i18n support
 * @param {Array} messages - Array of conversation messages
 * @param {string} moduleId - Module identifier
 * @param {string} courseTitle - Course title
 * @returns {Promise<void>}
 */
export const generateEvaluationCasePDF = async (messages, moduleId, courseTitle) => {
  if (!messages || messages.length === 0) {
    throw new Error('Messages are required for PDF generation');
  }

  const currentLang = getCurrentLanguage();
  const evaluationMessage = findEvaluationMessage(messages);

  // eslint-disable-next-line no-unused-vars
  const conversationHTML = messages.map((message, index) => {
    const messageClass = message.type === 'user' ? 'user-message' : 'bot-message';
    const avatar = message.type === 'user' ? '👤' : '🤖';
    const labelClass = message.type === 'user' ? 'user-label' : 'bot-label';
    const label = message.type === 'user' 
      ? t('pdf.conversation.you', 'You') 
      : t('pdf.conversation.assistant', 'Assistant');
    
    let processedContent;
    
    if (evaluationMessage && message === evaluationMessage) {
      processedContent = formatEvaluationContent(message.content || '');
    } else {
      processedContent = markdownToHtml(message.content || '');
    }
    
    return `
      <div class="message ${messageClass}">
        <div class="message-header">
          <span class="message-avatar">${avatar}</span>
          <span class="${labelClass}">${label}</span>
        </div>
        <div class="message-content">
          ${processedContent}
        </div>
      </div>
    `;
  }).join('');

  const htmlContent = `
    <div class="pdf-container">
      <div class="pdf-header">
        <h1 class="pdf-title">${t('pdf.evaluation.title', 'Practical Case Evaluation')}</h1>
        <h2 class="pdf-subtitle">${courseTitle}</h2>
        <p class="pdf-meta">${t('pdf.evaluation.module', 'Module')}: ${moduleId}</p>
      </div>
      
      <div class="content-section">
        ${conversationHTML}
      </div>
      
      <div class="pdf-footer">
        ${t('pdf.generatedOn', 'Generated on')} ${new Date().toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-US')} ${t('pdf.at', 'at')} ${new Date().toLocaleTimeString(currentLang === 'fr' ? 'fr-FR' : 'en-US')}
      </div>
    </div>
  `;

  const filename = `evaluation_case_${moduleId}_${Date.now()}.pdf`;
  
  await generatePDFFromHTML(htmlContent, filename, {
    margin: [10, 8, 10, 8],
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    html2canvas: {
      scale: 1.2,
      useCORS: true,
      letterRendering: true,
      allowTaint: false,
      logging: false,
      scrollX: 0,
      scrollY: 0
    }
  });
};

/**
 * Utility function to clean markdown artifacts from text
 * @param {string} text - Text that may contain markdown
 * @returns {string} Cleaned text
 */
export const cleanMarkdownArtifacts = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') 
    .replace(/###\s*/g, '') 
    .replace(/##\s*/g, '') 
    .replace(/#\s*/g, '') 
    .replace(/^\*\s*/gm, '• ') 
    .trim();
};