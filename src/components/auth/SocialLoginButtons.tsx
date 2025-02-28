import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

interface SocialLoginButtonsProps {
  onSuccess?: () => void;
  className?: string;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ 
  onSuccess,
  className = ''
}) => {
  const { signInWithSocial, loading } = useAuth();
  const navigate = useNavigate();

  const handleSocialLogin = async (provider: AuthProvider) => {
    const success = await signInWithSocial(provider);
    if (success) {
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-gray-600"></span>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            Ou continuer avec
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialLogin(AuthProvider.GOOGLE)}
          disabled={loading}
          className="flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin(AuthProvider.FACEBOOK)}
          disabled={loading}
          className="flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#1877F2"/>
            <path d="M16.6711 15.4688L17.2031 12H13.875V9.75C13.875 8.8008 14.3391 7.875 15.8297 7.875H17.3438V4.9219C17.3438 4.9219 15.9703 4.6875 14.6578 4.6875C11.9156 4.6875 10.125 6.3516 10.125 9.3516V12H7.07812V15.4688H10.125V23.8547C10.7367 23.9508 11.3625 24 12 24C12.6375 24 13.2633 23.9508 13.875 23.8547V15.4688H16.6711Z" fill="white"/>
          </svg>
          Facebook
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialLogin(AuthProvider.TWITTER)}
          disabled={loading}
          className="flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 5.89c-.75.33-1.5.56-2.34.67.84-.5 1.5-1.3 1.8-2.24-.8.47-1.68.8-2.6 1a4.1 4.1 0 00-7 3.73c-3.4-.17-6.4-1.8-8.4-4.28a4.1 4.1 0 001.26 5.47c-.67-.02-1.3-.2-1.86-.5v.05a4.1 4.1 0 003.3 4.03 4.1 4.1 0 01-1.86.07 4.1 4.1 0 003.83 2.85A8.23 8.23 0 012 18.43a11.67 11.67 0 006.29 1.84c7.55 0 11.67-6.25 11.67-11.67 0-.18 0-.36-.02-.53.8-.58 1.5-1.3 2.05-2.12l.01-.06z" fill="#1DA1F2"/>
          </svg>
          Twitter
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin(AuthProvider.APPLE)}
          disabled={loading}
          className="flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.0349 12.5664C17.0176 10.5576 18.5018 9.5252 18.5704 9.4819C17.5379 7.9977 15.9348 7.8341 15.3602 7.8168C14.0428 7.6878 12.7772 8.6339 12.1162 8.6339C11.4379 8.6339 10.4055 7.8341 9.2936 7.8514C7.8471 7.8687 6.5124 8.6685 5.7817 9.9686C4.2802 12.5837 5.4094 16.4294 6.8559 18.4036C7.5861 19.3671 8.4378 20.4513 9.5497 20.4167C10.6271 20.3821 11.0553 19.7211 12.3554 19.7211C13.6382 19.7211 14.0428 20.4167 15.1719 20.3994C16.3357 20.3821 17.0659 19.4186 17.7788 18.4382C18.6305 17.3194 18.9723 16.2179 18.9896 16.1746C18.9551 16.1573 17.0522 15.3748 17.0349 12.5664Z" fill="black"/>
            <path d="M15.0357 6.4223C15.6447 5.6591 16.0493 4.6094 15.9376 3.5425C15.0532 3.5771 13.9344 4.1561 13.3081 4.9021C12.7508 5.5631 12.2535 6.6473 12.3825 7.6797C13.3773 7.7489 14.4096 7.1699 15.0357 6.4223Z" fill="black"/>
          </svg>
          Apple
        </button>
      </div>
    </div>
  );
};

export default SocialLoginButtons;