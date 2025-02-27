
import { Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

const NotFound = () => {
  const { t } = useApp();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold tontine-text-gradient mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">{t('pageNotFound')}</p>
        <Link to="/" className="tontine-button tontine-button-primary inline-block">
          {t('returnToDashboard')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
