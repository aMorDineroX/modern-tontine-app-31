import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import ThemeToggle from './ThemeToggle';
import LanguageCurrencySelector from './LanguageCurrencySelector';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/signin');
      toast({
        title: t('Déconnexion réussie'),
        description: t('Vous avez été déconnecté avec succès'),
        variant: 'default'
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
      toast({
        title: t('Erreur de déconnexion'),
        description: t('Une erreur est survenue lors de la déconnexion'),
        variant: 'destructive'
      });
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-2xl font-bold text-tontine-purple dark:text-tontine-light-purple"
        >
          Tontine
        </Link>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu} 
            className="text-gray-600 dark:text-gray-300 hover:text-tontine-purple"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/dashboard" 
            className="text-gray-700 dark:text-gray-300 hover:text-tontine-purple"
          >
            {t('Dashboard')}
          </Link>
          <Link 
            to="/groups" 
            className="text-gray-700 dark:text-gray-300 hover:text-tontine-purple"
          >
            {t('Groupes')}
          </Link>
          <LanguageCurrencySelector />
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link 
                to="/profile" 
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-tontine-purple"
              >
                <User size={20} className="mr-2" />
                {user?.full_name || user?.email}
              </Link>
              <button 
                onClick={handleSignOut}
                className="flex items-center text-red-600 hover:text-red-800"
              >
                <LogOut size={20} className="mr-2" />
                {t('Déconnexion')}
              </button>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link 
                to="/signin" 
                className="text-tontine-purple hover:text-tontine-dark-purple"
              >
                {t('Connexion')}
              </Link>
              <Link 
                to="/signup" 
                className="bg-tontine-purple text-white px-4 py-2 rounded-md hover:bg-tontine-dark-purple"
              >
                {t('Inscription')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-lg md:hidden">
            <div className="flex flex-col space-y-4 p-4">
              <Link 
                to="/dashboard" 
                className="text-gray-700 dark:text-gray-300 hover:text-tontine-purple"
                onClick={toggleMenu}
              >
                {t('Dashboard')}
              </Link>
              <Link 
                to="/groups" 
                className="text-gray-700 dark:text-gray-300 hover:text-tontine-purple"
                onClick={toggleMenu}
              >
                {t('Groupes')}
              </Link>
              <LanguageCurrencySelector />
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  <Link 
                    to="/profile" 
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-tontine-purple"
                    onClick={toggleMenu}
                  >
                    <User size={20} className="mr-2" />
                    {user?.full_name || user?.email}
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center text-red-600 hover:text-red-800 text-left"
                  >
                    <LogOut size={20} className="mr-2" />
                    {t('Déconnexion')}
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-4">
                  <Link 
                    to="/signin" 
                    className="text-tontine-purple hover:text-tontine-dark-purple"
                    onClick={toggleMenu}
                  >
                    {t('Connexion')}
                  </Link>
                  <Link 
                    to="/signup" 
                    className="bg-tontine-purple text-white px-4 py-2 rounded-md hover:bg-tontine-dark-purple text-center"
                    onClick={toggleMenu}
                  >
                    {t('Inscription')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;