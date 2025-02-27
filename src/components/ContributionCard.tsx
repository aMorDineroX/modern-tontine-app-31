
import { DollarSign, PiggyBank } from "lucide-react";

type ContributionCardProps = {
  title: string;
  amount: string;
  trend?: string;
  icon: "contribution" | "balance";
};

export default function ContributionCard({ title, amount, trend, icon }: ContributionCardProps) {
  return (
    <div className="tontine-card dark:bg-gray-800 dark:border-gray-700 animate-slide-up">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
          icon === "contribution" 
            ? "bg-tontine-soft-blue dark:bg-blue-900/50" 
            : "bg-tontine-soft-green dark:bg-green-900/50"
        }`}>
          {icon === "contribution" ? (
            <DollarSign size={20} className="text-tontine-dark-purple dark:text-tontine-light-purple" />
          ) : (
            <PiggyBank size={20} className="text-tontine-dark-purple dark:text-tontine-light-purple" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-semibold dark:text-white">{amount}</p>
          {trend && (
            <p className="text-xs text-green-600 dark:text-green-400">{trend}</p>
          )}
        </div>
      </div>
    </div>
  );
}
