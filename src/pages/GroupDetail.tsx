import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  ArrowLeft, 
  Settings, 
  PlusCircle, 
  Edit, 
  Trash2,
  UserPlus,
  Clock,
  CreditCard
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import TontineCalendar from '@/components/tontine/TontineCalendar';
import { useApp } from '@/contexts/AppContext';

// Données fictives pour un groupe de tontine
const mockGroups = [
  { 
    id: 1, 
    name: "Family Savings", 
    members: 8, 
    contribution: 50, 
    frequency: "monthly" as const, 
    nextDue: "Jun 15, 2023",
    description: "Monthly savings for family emergencies and future plans.",
    cycleDuration: "6 months",
    startDate: "2023-01-15",
    membersList: [
      { id: 1, name: "John Doe", email: "john@example.com", avatar: "" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", avatar: "" },
      { id: 3, name: "Robert Johnson", email: "robert@example.com", avatar: "" },
      { id: 4, name: "Emily Davis", email: "emily@example.com", avatar: "" },
      { id: 5, name: "Michael Brown", email: "michael@example.com", avatar: "" },
      { id: 6, name: "Sarah Wilson", email: "sarah@example.com", avatar: "" },
      { id: 7, name: "David Taylor", email: "david@example.com", avatar: "" },
      { id: 8, name: "Lisa Anderson", email: "lisa@example.com", avatar: "" }
    ]
  },
  { 
    id: 2, 
    name: "Friends Circle", 
    members: 5, 
    contribution: 100, 
    frequency: "monthly" as const, 
    nextDue: "Jun 22, 2023",
    description: "Collective savings for group travel and shared experiences.",
    cycleDuration: "12 months",
    startDate: "2023-01-22",
    membersList: [
      { id: 1, name: "Alex Johnson", email: "alex@example.com", avatar: "" },
      { id: 2, name: "Maria Garcia", email: "maria@example.com", avatar: "" },
      { id: 3, name: "James Wilson", email: "james@example.com", avatar: "" },
      { id: 4, name: "Sophia Lee", email: "sophia@example.com", avatar: "" },
      { id: 5, name: "Daniel Martin", email: "daniel@example.com", avatar: "" }
    ]
  },
  { 
    id: 3, 
    name: "Business Collective", 
    members: 12, 
    contribution: 200, 
    frequency: "monthly" as const, 
    nextDue: "Jul 1, 2023",
    description: "Investment pool for entrepreneurial opportunities.",
    cycleDuration: "9 months",
    startDate: "2023-04-01",
    membersList: [
      { id: 1, name: "William Brown", email: "william@example.com", avatar: "" },
      { id: 2, name: "Olivia Davis", email: "olivia@example.com", avatar: "" },
      { id: 3, name: "Noah Wilson", email: "noah@example.com", avatar: "" },
      { id: 4, name: "Emma Johnson", email: "emma@example.com", avatar: "" },
      { id: 5, name: "Liam Smith", email: "liam@example.com", avatar: "" },
      { id: 6, name: "Ava Martinez", email: "ava@example.com", avatar: "" },
      { id: 7, name: "Lucas Taylor", email: "lucas@example.com", avatar: "" },
      { id: 8, name: "Isabella Thomas", email: "isabella@example.com", avatar: "" },
      { id: 9, name: "Mason Anderson", email: "mason@example.com", avatar: "" },
      { id: 10, name: "Sophia White", email: "sophia.w@example.com", avatar: "" },
      { id: 11, name: "Ethan Harris", email: "ethan@example.com", avatar: "" },
      { id: 12, name: "Mia Martin", email: "mia@example.com", avatar: "" }
    ]
  }
];

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, formatAmount } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'members' | 'settings'>('overview');
  
  // Trouver le groupe correspondant à l'ID
  const group = mockGroups.find(g => g.id === Number(id));
  
  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('groupNotFound')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('groupNotFoundDescription')}
          </p>
          <Link 
            to="/groups" 
            className="tontine-button tontine-button-primary inline-flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            {t('backToGroups')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête avec navigation de retour */}
        <div className="mb-6">
          <Link 
            to="/groups" 
            className="inline-flex items-center text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            {t('backToGroups')}
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {group.description}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button className="tontine-button tontine-button-outline inline-flex items-center">
                <Edit size={16} className="mr-2" />
                {t('editGroup')}
              </button>
              <button className="tontine-button tontine-button-danger inline-flex items-center">
                <Trash2 size={16} className="mr-2" />
                {t('deleteGroup')}
              </button>
            </div>
          </div>
        </div>
        
        {/* Onglets de navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-tontine-purple text-tontine-purple dark:border-tontine-light-purple dark:text-tontine-light-purple'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Users size={16} className="mr-2" />
              {t('overview')}
            </button>
            
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === 'calendar'
                  ? 'border-tontine-purple text-tontine-purple dark:border-tontine-light-purple dark:text-tontine-light-purple'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Calendar size={16} className="mr-2" />
              {t('calendar')}
            </button>
            
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-tontine-purple text-tontine-purple dark:border-tontine-light-purple dark:text-tontine-light-purple'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Users size={16} className="mr-2" />
              {t('members')}
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-tontine-purple text-tontine-purple dark:border-tontine-light-purple dark:text-tontine-light-purple'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Settings size={16} className="mr-2" />
              {t('settings')}
            </button>
          </nav>
        </div>
        
        {/* Contenu de l'onglet actif */}
        <div className="mt-6">
          {/* Aperçu */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Carte d'informations du groupe */}
              <div className="md:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('groupInformation')}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {t('cycleDuration')}
                        </h3>
                        <p className="text-lg font-medium dark:text-white">{group.cycleDuration}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {t('startDate')}
                        </h3>
                        <p className="text-lg font-medium dark:text-white">
                          {new Date(group.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {t('contributionAmount')}
                        </h3>
                        <p className="text-lg font-medium dark:text-white">
                          {formatAmount(group.contribution)} / {t(group.frequency)}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {t('nextPayment')}
                        </h3>
                        <p className="text-lg font-medium dark:text-white">{group.nextDue}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {t('totalMembers')}
                        </h3>
                        <p className="text-lg font-medium dark:text-white">{group.members}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {t('totalContributed')}
                        </h3>
                        <p className="text-lg font-medium dark:text-white">
                          {formatAmount(group.contribution * 3)} {/* Valeur fictive */}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        {t('upcomingPayments')}
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mr-3">
                              <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                              <p className="font-medium dark:text-white">{t('contribution')}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{group.nextDue}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-blue-600 dark:text-blue-400">
                              -{formatAmount(group.contribution)}
                            </p>
                            <span className="text-xs text-yellow-600 dark:text-yellow-400">
                              {t('pending')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mr-3">
                              <CreditCard size={16} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="font-medium dark:text-white">{t('payout')} - {group.membersList[1].name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(new Date(group.nextDue).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              +{formatAmount(group.contribution * group.members)}
                            </p>
                            <span className="text-xs text-blue-600 dark:text-blue-400">
                              {t('upcoming')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Carte des membres */}
              <div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold dark:text-white">{t('members')}</h2>
                      <button className="text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple">
                        <UserPlus size={18} />
                      </button>
                    </div>
                    
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                      {group.membersList.slice(0, 5).map((member) => (
                        <div key={member.id} className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-tontine-light-purple/20 dark:bg-tontine-purple/20 flex items-center justify-center mr-3 text-tontine-dark-purple dark:text-tontine-light-purple font-medium">
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium dark:text-white">{member.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                          </div>
                        </div>
                      ))}
                      
                      {group.membersList.length > 5 && (
                        <button 
                          onClick={() => setActiveTab('members')}
                          className="w-full text-center text-sm text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple mt-2"
                        >
                          {t('viewAllMembers')} ({group.membersList.length})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Calendrier */}
          {activeTab === 'calendar' && (
            <TontineCalendar 
              groupId={group.id}
              groupName={group.name}
              startDate={group.startDate}
              cycleDuration={group.cycleDuration}
              frequency={group.frequency}
              contributionAmount={group.contribution}
            />
          )}
          
          {/* Membres */}
          {activeTab === 'members' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold dark:text-white">{t('groupMembers')}</h2>
                  <button className="tontine-button tontine-button-outline inline-flex items-center">
                    <UserPlus size={16} className="mr-2" />
                    {t('inviteMembers')}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.membersList.map((member) => (
                    <div 
                      key={member.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-tontine-light-purple/20 dark:bg-tontine-purple/20 flex items-center justify-center mr-4 text-tontine-dark-purple dark:text-tontine-light-purple font-medium text-lg">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium dark:text-white">{member.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Paramètres */}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6 dark:text-white">{t('groupSettings')}</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4 dark:text-white">{t('cyclePlanning')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('cycleDuration')}
                        </label>
                        <select className="tontine-input w-full">
                          <option value="3_months">3 {t('months')}</option>
                          <option value="6_months" selected>6 {t('months')}</option>
                          <option value="9_months">9 {t('months')}</option>
                          <option value="12_months">12 {t('months')}</option>
                          <option value="custom">{t('custom')}</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('contributionFrequency')}
                        </label>
                        <select className="tontine-input w-full">
                          <option value="weekly">{t('weekly')}</option>
                          <option value="biweekly">{t('biweekly')}</option>
                          <option value="monthly" selected>{t('monthly')}</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('startDate')}
                        </label>
                        <input 
                          type="date" 
                          className="tontine-input w-full"
                          defaultValue={group.startDate}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('contributionAmount')}
                        </label>
                        <input 
                          type="number" 
                          className="tontine-input w-full"
                          defaultValue={group.contribution}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4 dark:text-white">{t('payoutSettings')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('payoutMethod')}
                        </label>
                        <select className="tontine-input w-full">
                          <option value="rotation" selected>{t('rotation')}</option>
                          <option value="random">{t('randomSelection')}</option>
                          <option value="bidding">{t('biddingSystem')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end space-x-3">
                    <button className="tontine-button tontine-button-outline">
                      {t('cancel')}
                    </button>
                    <button className="tontine-button tontine-button-primary">
                      {t('saveChanges')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GroupDetail;