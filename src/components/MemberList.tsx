
import { User } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

type Member = {
  id: number;
  name: string;
  image?: string;
  status: "active" | "pending" | "paid";
};

type MemberListProps = {
  members: Member[];
  title: string;
};

export default function MemberList({ members, title }: MemberListProps) {
  const { t } = useApp();

  const getStatusText = (status: "active" | "pending" | "paid") => {
    switch(status) {
      case "active": return t('active');
      case "pending": return t('pending');
      case "paid": return t('paid');
      default: return '';
    }
  };

  return (
    <div className="tontine-card dark:bg-gray-800 dark:border-gray-700 h-full animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold dark:text-white">{title}</h3>
        <span className="text-xs px-2 py-1 bg-tontine-soft-blue dark:bg-blue-900/50 rounded-full text-tontine-dark-purple dark:text-tontine-light-purple">
          {members.length} {t('members')}
        </span>
      </div>
      
      <div className="space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 overflow-hidden">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-gray-500 dark:text-gray-400" />
                )}
              </div>
              <span className="font-medium text-sm dark:text-white">{member.name}</span>
            </div>
            
            <div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                member.status === "active" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400" 
                  : member.status === "pending" 
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400"
              }`}>
                {getStatusText(member.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
