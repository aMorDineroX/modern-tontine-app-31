
import { useState } from "react";
import { ChartLine, Coins, PiggyBank, UserPlus, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import TontineGroup from "@/components/TontineGroup";
import ContributionCard from "@/components/ContributionCard";
import MemberList from "@/components/MemberList";
import UserProfile from "@/components/UserProfile";
import CreateGroupModal from "@/components/CreateGroupModal";
import { useApp } from "@/contexts/AppContext";

// Mock data
const mockGroups = [
  { id: 1, name: "Family Savings", members: 8, contribution: 50, frequency: "monthly", nextDue: "Jun 15, 2023" },
  { id: 2, name: "Friends Circle", members: 5, contribution: 100, frequency: "monthly", nextDue: "Jun 22, 2023" },
  { id: 3, name: "Business Collective", members: 12, contribution: 200, frequency: "monthly", nextDue: "Jul 1, 2023" },
];

const mockMembers = [
  { id: 1, name: "Nia Johnson", status: "active" as const },
  { id: 2, name: "Kwame Brown", status: "active" as const },
  { id: 3, name: "Zainab Ali", status: "pending" as const },
  { id: 4, name: "Tariq Hassan", status: "active" as const },
  { id: 5, name: "Amara Okafor", status: "paid" as const },
];

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const { t, formatAmount } = useApp();

  const handleCreateGroup = (data: { name: string; contribution: string; frequency: string; members: string }) => {
    console.log("Creating new group:", data);
    // Here you would normally send this data to your backend
    setIsModalOpen(false);
  };

  const formatContribution = (amount: number, frequency: string) => {
    return `${formatAmount(amount)} / ${t(frequency as 'monthly' | 'weekly' | 'biweekly')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('welcome')}</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t('trackContributions')}
            </p>
          </div>
          <div className="mt-4 lg:mt-0 flex flex-wrap gap-2">
            <button 
              className="tontine-button tontine-button-secondary inline-flex items-center"
              onClick={() => setNotificationCount(0)}
            >
              <div className="relative">
                <Coins size={18} className="mr-2" />
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </div>
              {t('payments')}
            </button>
            <button 
              className="tontine-button tontine-button-primary inline-flex items-center"
              onClick={() => setIsModalOpen(true)}
            >
              <UserPlus size={18} className="mr-2" />
              {t('createNewGroup')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ContributionCard 
            title={t('totalContributions')}
            amount={formatAmount(1250)}
            trend={`Up 8% from last month`}
            icon="contribution" 
          />
          <ContributionCard 
            title={t('availableBalance')}
            amount={formatAmount(450)}
            icon="balance" 
          />
          <div className="tontine-card dark:bg-gray-800 dark:border-gray-700 animate-slide-up">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-tontine-light-purple/50 flex items-center justify-center mr-4">
                <Users size={20} className="text-tontine-dark-purple" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('activeGroups')}</h3>
                <p className="text-2xl font-semibold dark:text-white">3</p>
              </div>
            </div>
          </div>
          <div className="tontine-card dark:bg-gray-800 dark:border-gray-700 animate-slide-up">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-tontine-soft-blue/50 flex items-center justify-center mr-4">
                <ChartLine size={20} className="text-tontine-dark-purple" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('nextPayout')}</h3>
                <p className="text-2xl font-semibold dark:text-white">Jun 30</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Groups */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold dark:text-white">{t('yourGroups')}</h2>
              <button className="text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple text-sm font-medium">
                {t('viewAll')}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockGroups.map((group) => (
                <TontineGroup
                  key={group.id}
                  name={group.name}
                  members={group.members}
                  contribution={formatContribution(group.contribution, group.frequency)}
                  nextDue={group.nextDue}
                  onClick={() => console.log("Clicked on group:", group.id)}
                />
              ))}
            </div>

            {/* Calendar section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">{t('paymentCalendar')}</h2>
              <div className="tontine-card dark:bg-gray-800 dark:border-gray-700 p-4">
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }).map((_, i) => {
                    const day = i - 3; // Start from previous month's last days
                    const isCurrentMonth = day > 0 && day <= 30;
                    const hasPayment = [10, 15, 22].includes(day);
                    
                    return (
                      <div 
                        key={i} 
                        className={`
                          h-10 flex items-center justify-center rounded-md text-sm
                          ${isCurrentMonth ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-gray-400 dark:text-gray-600'} 
                          ${hasPayment ? 'bg-tontine-light-purple/20 dark:bg-tontine-purple/30' : ''}
                        `}
                      >
                        {day > 0 ? day : 31 + day}
                        {hasPayment && (
                          <span className="w-1 h-1 bg-tontine-purple absolute bottom-1 rounded-full"></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile & Members */}
          <div className="space-y-8">
            <div className="tontine-card dark:bg-gray-800 dark:border-gray-700">
              <UserProfile 
                name="Olivia Nkosi" 
                contribution="Premium Member" 
              />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Coins size={18} className="text-tontine-dark-purple mr-1" />
                    <span className="text-sm font-medium dark:text-white">{t('active')}</span>
                  </div>
                  <p className="font-semibold dark:text-white">3 {t('members')}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <PiggyBank size={18} className="text-tontine-dark-purple mr-1" />
                    <span className="text-sm font-medium dark:text-white">Saved</span>
                  </div>
                  <p className="font-semibold dark:text-white">{formatAmount(3200)}</p>
                </div>
              </div>
            </div>
            
            <MemberList 
              title={t('recentMembers')}
              members={mockMembers} 
            />

            {/* Activity Feed */}
            <div className="tontine-card dark:bg-gray-800 dark:border-gray-700">
              <h3 className="font-semibold mb-4 dark:text-white">{t('recentActivity')}</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Coins size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm dark:text-white">{t('receivedPayout')} <span className="font-medium">{formatAmount(200)}</span></p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 {t('hoursAgo')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm dark:text-white"><span className="font-medium">Zainab Ali</span> {t('joinedGroup')} Family Savings</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('yesterday')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <PiggyBank size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm dark:text-white">{t('madeContribution')} <span className="font-medium">{formatAmount(50)}</span> to Family Savings</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">2 {t('daysAgo')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CreateGroupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateGroup} 
      />
    </div>
  );
};

export default Index;
