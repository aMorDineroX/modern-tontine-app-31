import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  PiggyBank, 
  Coins, 
  ChartLine, 
  UserPlus, 
  CheckCircle 
} from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 flex flex-col items-center">
          {/* Left Column - Hero Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 text-center lg:text-left">
              Tontine Digitale
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 text-center lg:text-left">
              Gérez vos tontines facilement, en toute sécurité et transparence. 
              Connectez-vous avec votre communauté et atteignez vos objectifs financiers.
            </p>
            
            <div className="flex justify-center lg:justify-start space-x-4">
              <Link 
                to="/signin" 
                className="tontine-button tontine-button-primary inline-flex items-center"
              >
                <UserPlus size={18} className="mr-2" />
                Commencer
              </Link>
              <Link 
                to="/signup" 
                className="tontine-button tontine-button-secondary inline-flex items-center"
              >
                <Users size={18} className="mr-2" />
                Créer un Groupe
              </Link>
            </div>
          </div>
          
          {/* Right Column - Features Preview */}
          <div className="mt-12 lg:mt-0 grid grid-cols-2 gap-4">
            <div className="tontine-card dark:bg-gray-800 dark:border-gray-700 animate-slide-up">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-tontine-light-purple/50 flex items-center justify-center mr-4">
                  <Coins size={20} className="text-tontine-dark-purple" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contributions</h3>
                  <p className="text-2xl font-semibold dark:text-white">Facile</p>
                </div>
              </div>
            </div>
            
            <div className="tontine-card dark:bg-gray-800 dark:border-gray-700 animate-slide-up">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-tontine-soft-blue/50 flex items-center justify-center mr-4">
                  <ChartLine size={20} className="text-tontine-dark-purple" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Suivi</h3>
                  <p className="text-2xl font-semibold dark:text-white">Transparent</p>
                </div>
              </div>
            </div>
            
            <div className="tontine-card dark:bg-gray-800 dark:border-gray-700 animate-slide-up">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100/50 flex items-center justify-center mr-4">
                  <PiggyBank size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Épargne</h3>
                  <p className="text-2xl font-semibold dark:text-white">Sécurisée</p>
                </div>
              </div>
            </div>
            
            <div className="tontine-card dark:bg-gray-800 dark:border-gray-700 animate-slide-up">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100/50 flex items-center justify-center mr-4">
                  <Users size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Communauté</h3>
                  <p className="text-2xl font-semibold dark:text-white">Connectée</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Notre plateforme simplifie la gestion de vos tontines
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-tontine-light-purple/20 rounded-full flex items-center justify-center">
                  <UserPlus size={32} className="text-tontine-dark-purple" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">Créez votre groupe</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Invitez vos amis, famille ou collègues et définissez vos règles de contribution.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100/20 rounded-full flex items-center justify-center">
                  <Coins size={32} className="text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">Contribuez régulièrement</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Suivez vos contributions, recevez des rappels et gérez vos paiements facilement.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-purple-100/20 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 dark:text-white">Atteignez vos objectifs</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Visualisez vos progrès, recevez des récompenses et célébrez vos succès ensemble.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-tontine-purple text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Commencez votre voyage financier aujourd'hui
          </h2>
          <p className="text-lg mb-8 text-white/80">
            Rejoignez des milliers de personnes qui transforment leur épargne avec notre plateforme.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/signin" 
              className="tontine-button tontine-button-secondary text-tontine-purple bg-white inline-flex items-center"
            >
              <UserPlus size={18} className="mr-2" />
              Connexion
            </Link>
            <Link 
              to="/signup" 
              className="tontine-button tontine-button-primary bg-white text-tontine-purple inline-flex items-center"
            >
              <Users size={18} className="mr-2" />
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;