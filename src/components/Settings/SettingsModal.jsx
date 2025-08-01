import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import './SettingsModal.css';

const SettingsModal = () => {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isSettingsOpen, closeSettings } = useSettings();

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    localStorage.setItem('darkMode', !isDarkMode);
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'settings-overlay active') {
      closeSettings();
    }
  };

  if (!isSettingsOpen) return null;

  return (
    <div className="settings-overlay active" onClick={handleOverlayClick}>
      <div className="settings-content">
        <div className="settings-header">
          <h2>{t('settings.title')}</h2>
          <button className="settings-close" onClick={closeSettings}>&times;</button>
        </div>
        <div className="settings-body">
          {/* Sélection de la langue */}
          <div className="settings-section">
            <h3>{t('settings.language')}</h3>
            <select 
              className="language-select"
              value={i18n.language}
              onChange={handleLanguageChange}
            >
              <option value="fr">{t('settings.french')}</option>
              <option value="en">{t('settings.english')}</option>
              <option value="pt-BR">{t('settings.portuguese')}</option>
            </select>
          </div>

          {/* Thème */}
          <div className="settings-section">
            <h3>{t('settings.theme')}</h3>
            <div className="theme-toggle">
              <span>{t('settings.darkMode')}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={handleThemeToggle}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 