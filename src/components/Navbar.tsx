
import { Menu, X, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import SettingsModal from "./SettingsModal";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useApp();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="relative z-20 bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold tontine-text-gradient">Tontine</span>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            <Link to="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-tontine-purple dark:hover:text-tontine-light-purple transition-colors">
              {t('dashboard')}
            </Link>
            <Link to="/groups" className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-tontine-purple dark:hover:text-tontine-light-purple transition-colors">
              {t('myGroups')}
            </Link>
            <Link to="/profile" className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-tontine-purple dark:hover:text-tontine-light-purple transition-colors">
              {t('profile')}
            </Link>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings size={20} className="text-tontine-dark-purple dark:text-tontine-light-purple" />
            </button>
            <ThemeToggle />
            <button 
              className="tontine-button tontine-button-primary"
              onClick={() => setIsModalOpen(true)}
            >
              {t('createNewGroup')}
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mr-2"
            >
              <Settings size={20} className="text-tontine-dark-purple dark:text-tontine-light-purple" />
            </button>
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-tontine-purple"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden absolute w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 animate-slide-down">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-tontine-purple dark:hover:text-tontine-light-purple"
              onClick={() => setIsOpen(false)}
            >
              {t('dashboard')}
            </Link>
            <Link
              to="/groups"
              className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-tontine-purple dark:hover:text-tontine-light-purple"
              onClick={() => setIsOpen(false)}
            >
              {t('myGroups')}
            </Link>
            <Link
              to="/profile"
              className="block px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-tontine-purple dark:hover:text-tontine-light-purple"
              onClick={() => setIsOpen(false)}
            >
              {t('profile')}
            </Link>
            <div className="px-3 py-2">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setIsModalOpen(true);
                }} 
                className="w-full tontine-button tontine-button-primary"
              >
                {t('createNewGroup')}
              </button>
            </div>
            <button
              onClick={() => {
                handleSignOut();
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </nav>
  );
}
