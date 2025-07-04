import { useTranslation } from 'react-i18next';
import { Target } from 'lucide-react';
import BackToK2Section from './BackToK2Section';

const EmptyDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="dashboard-empty-state">
      <Target className="dashboard-empty-icon" />
      <h3 className="dashboard-empty-title">{t('dashboard.startLearning')}</h3>
      <p className="dashboard-empty-description">{t('dashboard.startDescription')}</p>
      <BackToK2Section />
    </div>
  );
};

export default EmptyDashboard;