import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check, AlertCircle, Clock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

type PaymentStatus = 'completed' | 'pending' | 'upcoming';

interface PaymentEvent {
  id: number;
  date: string;
  amount: number;
  status: PaymentStatus;
  recipient?: string;
  isPayout: boolean;
}

interface TontineCalendarProps {
  groupId: number;
  groupName: string;
  startDate: string;
  cycleDuration: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  contributionAmount: number;
  payments?: PaymentEvent[];
}

const TontineCalendar: React.FC<TontineCalendarProps> = ({
  groupId,
  groupName,
  startDate,
  cycleDuration,
  frequency,
  contributionAmount,
  payments: providedPayments
}) => {
  const { t, formatAmount } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Générer des paiements fictifs si aucun n'est fourni
  const generatePayments = (): PaymentEvent[] => {
    const result: PaymentEvent[] = [];
    const start = new Date(startDate);
    const durationMonths = parseInt(cycleDuration.split(' ')[0]);
    
    // Déterminer l'intervalle entre les paiements en jours
    const intervalDays = frequency === 'weekly' ? 7 : frequency === 'biweekly' ? 14 : 30;
    
    // Nombre total de paiements basé sur la durée et la fréquence
    const totalPayments = frequency === 'weekly' 
      ? durationMonths * 4 
      : frequency === 'biweekly' 
        ? durationMonths * 2 
        : durationMonths;
    
    const now = new Date();
    
    for (let i = 0; i < totalPayments; i++) {
      const paymentDate = new Date(start);
      paymentDate.setDate(start.getDate() + (i * intervalDays));
      
      // Déterminer le statut du paiement
      let status: PaymentStatus = 'upcoming';
      if (paymentDate < now) {
        // 80% de chance que les paiements passés soient complétés
        status = Math.random() < 0.8 ? 'completed' : 'pending';
      } else if (
        paymentDate.getTime() >= now.getTime() && 
        paymentDate.getTime() <= now.getTime() + (7 * 24 * 60 * 60 * 1000)
      ) {
        // Paiements dans la semaine à venir sont en attente
        status = 'pending';
      }
      
      // Déterminer si c'est un paiement ou un versement
      // Pour cet exemple, nous supposons que chaque membre reçoit un versement à tour de rôle
      const isPayout = i % (totalPayments / (totalPayments / durationMonths)) === 0 && i > 0;
      
      result.push({
        id: i + 1,
        date: paymentDate.toISOString().split('T')[0],
        amount: contributionAmount,
        status,
        recipient: isPayout ? `Member ${(i % durationMonths) + 1}` : undefined,
        isPayout
      });
    }
    
    return result;
  };
  
  const payments = providedPayments || generatePayments();
  
  // Filtrer les paiements pour le mois actuel
  const getPaymentsForMonth = () => {
    return payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return (
        paymentDate.getMonth() === currentMonth.getMonth() &&
        paymentDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };
  
  const currentMonthPayments = getPaymentsForMonth();
  
  // Navigation entre les mois
  const goToPreviousMonth = () => {
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    setCurrentMonth(previousMonth);
  };
  
  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  // Formater le nom du mois
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };
  
  // Obtenir le statut du paiement avec l'icône et la couleur appropriées
  const getStatusInfo = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return {
          icon: <Check size={16} />,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          label: t('completed')
        };
      case 'pending':
        return {
          icon: <Clock size={16} />,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          label: t('pending')
        };
      case 'upcoming':
        return {
          icon: <AlertCircle size={16} />,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          label: t('upcoming')
        };
      default:
        return {
          icon: <Clock size={16} />,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          label: t('unknown')
        };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold dark:text-white">
            {t('paymentsCalendar')}
          </h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={goToPreviousMonth}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <span className="font-medium dark:text-white">
              {formatMonth(currentMonth)}
            </span>
            <button 
              onClick={goToNextMonth}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Calendar size={18} className="text-tontine-purple dark:text-tontine-light-purple mr-2" />
            <h3 className="font-medium dark:text-white">{groupName}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('frequency')}:</span>
              <span className="ml-1 dark:text-white">{t(frequency)}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('contribution')}:</span>
              <span className="ml-1 dark:text-white">{formatAmount(contributionAmount)}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('startDate')}:</span>
              <span className="ml-1 dark:text-white">{new Date(startDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('cycleDuration')}:</span>
              <span className="ml-1 dark:text-white">{cycleDuration}</span>
            </div>
          </div>
        </div>
        
        {currentMonthPayments.length > 0 ? (
          <div className="space-y-4">
            {currentMonthPayments.map((payment) => {
              const statusInfo = getStatusInfo(payment.status);
              return (
                <div 
                  key={payment.id}
                  className={`p-4 rounded-lg border ${payment.isPayout ? 'border-green-200 dark:border-green-800' : 'border-gray-200 dark:border-gray-700'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full ${payment.isPayout ? 'bg-green-100 dark:bg-green-900/20' : statusInfo.bgColor} flex items-center justify-center mr-3`}>
                          {payment.isPayout ? (
                            <ArrowDownCircle size={16} className="text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUpCircle size={16} className={statusInfo.color} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium dark:text-white">
                            {payment.isPayout ? t('payout') : t('contribution')}
                            {payment.recipient && ` - ${payment.recipient}`}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${payment.isPayout ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {payment.isPayout ? '+' : '-'}{formatAmount(payment.amount)}
                      </p>
                      <div className={`inline-flex items-center text-xs ${statusInfo.color} mt-1`}>
                        {statusInfo.icon}
                        <span className="ml-1">{statusInfo.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full inline-flex items-center justify-center mb-3">
              <Calendar size={24} className="text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t('noPaymentsThisMonth')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Icônes supplémentaires
const ArrowUpCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m16 12-4-4-4 4" />
    <path d="M12 16V8" />
  </svg>
);

const ArrowDownCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m8 12 4 4 4-4" />
    <path d="M12 8v8" />
  </svg>
);

export default TontineCalendar;