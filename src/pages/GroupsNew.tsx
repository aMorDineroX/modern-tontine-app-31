import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  PlusCircle, 
  Edit, 
  Trash2, 
  ChevronRight 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import CreateGroupModalNew from '@/components/CreateGroupModalNew';
import { useApp } from '@/contexts/AppContext';

// Mock data for groups
const mockGroups = [
  { 
    id: 1, 
    name: "Family Savings", 
    members: 8, 
    contribution: 50, 
    frequency: "monthly", 
    nextDue: "Jun 15, 2023",
    description: "Monthly savings for family emergencies and future plans.",
    cycleDuration: "6 months",
    startDate: "2023-01-15"
  },
  { 
    id: 2, 
    name: "Friends Circle", 
    members: 5, 
    contribution: 100, 
    frequency: "monthly", 
    nextDue: "Jun 22, 2023",
    description: "Collective savings for group travel and shared experiences.",
    cycleDuration: "12 months",
    startDate: "2023-01-22"
  },
  { 
    id: 3, 
    name: "Business Collective", 
    members: 12, 
    contribution: 200, 
    frequency: "monthly", 
    nextDue: "Jul 1, 2023",
    description: "Investment pool for entrepreneurial opportunities.",
    cycleDuration: "9 months",
    startDate: "2023-04-01"
  },
];

const Groups: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, formatAmount } = useApp();

  const handleCreateGroup = (data: { 
    name: string; 
    contribution: string; 
    frequency: string; 
    members: string;
    cycleDuration: string;
    startDate: string;
    payoutMethod: string;
  }) => {
    console.log("Creating new group:", data);
    // Here you would normally send this data to your backend
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('myGroups')}</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('manageAndTrackYourTontineGroups')}
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button 
              className="tontine-button tontine-button-primary inline-flex items-center"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircle size={18} className="mr-2" />
              {t('createNewGroup')}
            </button>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGroups.map((group) => (
            <div 
              key={group.id} 
              className="tontine-card dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold dark:text-white">{group.name}</h3>
                <div className="flex space-x-2">
                  <button 
                    className="text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple"
                    title="Edit Group"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                    title="Delete Group"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {group.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center">
                    <Users size={16} className="mr-2 text-tontine-dark-purple" />
                    <span className="text-sm font-medium dark:text-white">{t('members')}</span>
                  </div>
                  <p className="text-lg font-semibold dark:text-white">{group.members}</p>
                </div>
                <div>
                  <div className="flex items-center">
                    <PlusCircle size={16} className="mr-2 text-green-600" />
                    <span className="text-sm font-medium dark:text-white">{t('contribution')}</span>
                  </div>
                  <p className="text-lg font-semibold dark:text-white">
                    {formatAmount(group.contribution)} / {t(group.frequency as 'monthly' | 'weekly' | 'biweekly')}
                  </p>
                </div>
              </div>
              
              {/* Ajout des informations sur le cycle */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md mb-4">
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{t('cycleDuration')}:</span>
                    <span className="ml-1 font-medium dark:text-white">{group.cycleDuration}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{t('startDate')}:</span>
                    <span className="ml-1 font-medium dark:text-white">
                      {new Date(group.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('nextDue')}: {group.nextDue}
                </span>
                <Link 
                  to={`/groups/${group.id}`} 
                  className="text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple inline-flex items-center"
                >
                  {t('viewDetails')}
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {mockGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-tontine-light-purple/20 text-tontine-dark-purple dark:bg-tontine-purple/20 dark:text-tontine-light-purple p-4 rounded-full inline-flex items-center justify-center mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">
              {t('noGroupsYet')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('createFirstGroupDescription')}
            </p>
            <button 
              className="tontine-button tontine-button-primary"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircle size={18} className="mr-2" />
              {t('createFirstGroup')}
            </button>
          </div>
        )}
      </main>

      <CreateGroupModalNew 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateGroup} 
      />
    </div>
  );
};

export default Groups;