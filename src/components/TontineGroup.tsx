
import { CalendarIcon, Coins, Users } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

type TontineGroupProps = {
  name: string;
  members: number;
  contribution: string;
  nextDue: string;
  onClick?: () => void;
};

export default function TontineGroup({ name, members, contribution, nextDue, onClick }: TontineGroupProps) {
  const { t } = useApp();
  
  return (
    <div 
      className="tontine-card dark:bg-gray-800 dark:border-gray-700 cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold dark:text-white">{name}</h3>
        <div className="flex items-center space-x-1">
          <Users size={16} className="text-tontine-dark-purple dark:text-tontine-light-purple" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{members}</span>
        </div>
      </div>
      
      <div className="flex flex-col space-y-3">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-tontine-soft-blue dark:bg-blue-900/50 flex items-center justify-center mr-3">
            <Coins size={16} className="text-tontine-dark-purple dark:text-tontine-light-purple" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('contribution')}</p>
            <p className="font-medium dark:text-white">{contribution}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-tontine-soft-green dark:bg-green-900/50 flex items-center justify-center mr-3">
            <CalendarIcon size={16} className="text-tontine-dark-purple dark:text-tontine-light-purple" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('nextDue')}</p>
            <p className="font-medium dark:text-white">{nextDue}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
