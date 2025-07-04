import { useTranslation } from 'react-i18next';
import { getK2ReturnUrl } from '../../utils/constants';
import useCourses from '../../hooks/useCourses';

const BackToK2Section = () => {
  const { t } = useTranslation();
  const { selectedCourse } = useCourses();

  return (
    <a 
      href={getK2ReturnUrl(selectedCourse)}
      style={{ textDecoration: 'none' }}
      className="dashboard-empty-button"
    >
      {t('common.backToK2')}
    </a>
  );
};

export default BackToK2Section;