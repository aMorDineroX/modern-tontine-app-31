import { useState } from "react";
import { Calendar, Info, AlertCircle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

type CyclePlanningFormProps = {
  cycleDuration: string;
  setCycleDuration: (value: string) => void;
  frequency: string;
  startDate: string;
  setStartDate: (value: string) => void;
};

export default function CyclePlanningForm({ 
  cycleDuration, 
  setCycleDuration, 
  frequency,
  startDate,
  setStartDate
}: CyclePlanningFormProps) {
  const { t } = useApp();
  const [showCycleInfo, setShowCycleInfo] = useState(false);
  const [customDuration, setCustomDuration] = useState("6");

  // Calculer le nombre estimé de membres en fonction de la durée du cycle
  const getEstimatedMembers = () => {
    const durationMap: Record<string, number> = {
      "3_months": 3,
      "6_months": 6,
      "9_months": 9,
      "12_months": 12,
      "custom": parseInt(customDuration) || 0
    };
    
    const frequencyMap: Record<string, number> = {
      "weekly": 4, // ~4 semaines par mois
      "biweekly": 2, // ~2 fois par mois
      "monthly": 1 // 1 fois par mois
    };
    
    const months = durationMap[cycleDuration];
    const periodsPerMonth = frequencyMap[frequency];
    return months * periodsPerMonth;
  };

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomDuration(value);
    // Mettre à jour la durée du cycle avec la valeur personnalisée
    setCycleDuration("custom");
  };

  return (
    <div className="space-y-4">
      <div className="bg-tontine-light-purple/10 dark:bg-tontine-purple/20 p-4 rounded-lg">
        <div className="flex items-start">
          <Calendar className="text-tontine-purple dark:text-tontine-light-purple mt-1 mr-3 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-medium text-tontine-dark-purple dark:text-tontine-light-purple">
              {t('cyclePlanning')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('cyclePlanningDescription')}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label htmlFor="cycleDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('cycleDuration')}
          </label>
          <button
            type="button"
            onClick={() => setShowCycleInfo(!showCycleInfo)}
            className="text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple"
          >
            <Info size={16} />
          </button>
        </div>
        
        {showCycleInfo && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-300">
            <p>{t('cycleInfoDescription')}</p>
          </div>
        )}
        
        <div className="mt-2 grid grid-cols-2 gap-3">
          <label className={`
            flex items-center justify-center p-3 border rounded-md cursor-pointer
            ${cycleDuration === "3_months" 
              ? "border-tontine-purple bg-tontine-light-purple/10 dark:border-tontine-light-purple dark:bg-tontine-purple/20" 
              : "border-gray-200 dark:border-gray-700"}
          `}>
            <input
              type="radio"
              name="cycleDuration"
              value="3_months"
              checked={cycleDuration === "3_months"}
              onChange={() => setCycleDuration("3_months")}
              className="sr-only"
            />
            <span className="text-center">
              <span className="block font-medium dark:text-white">3 {t('months')}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('shortTerm')}</span>
            </span>
          </label>
          
          <label className={`
            flex items-center justify-center p-3 border rounded-md cursor-pointer
            ${cycleDuration === "6_months" 
              ? "border-tontine-purple bg-tontine-light-purple/10 dark:border-tontine-light-purple dark:bg-tontine-purple/20" 
              : "border-gray-200 dark:border-gray-700"}
          `}>
            <input
              type="radio"
              name="cycleDuration"
              value="6_months"
              checked={cycleDuration === "6_months"}
              onChange={() => setCycleDuration("6_months")}
              className="sr-only"
            />
            <span className="text-center">
              <span className="block font-medium dark:text-white">6 {t('months')}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('mediumTerm')}</span>
            </span>
          </label>
          
          <label className={`
            flex items-center justify-center p-3 border rounded-md cursor-pointer
            ${cycleDuration === "9_months" 
              ? "border-tontine-purple bg-tontine-light-purple/10 dark:border-tontine-light-purple dark:bg-tontine-purple/20" 
              : "border-gray-200 dark:border-gray-700"}
          `}>
            <input
              type="radio"
              name="cycleDuration"
              value="9_months"
              checked={cycleDuration === "9_months"}
              onChange={() => setCycleDuration("9_months")}
              className="sr-only"
            />
            <span className="text-center">
              <span className="block font-medium dark:text-white">9 {t('months')}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('mediumTerm')}</span>
            </span>
          </label>
          
          <label className={`
            flex items-center justify-center p-3 border rounded-md cursor-pointer
            ${cycleDuration === "12_months" 
              ? "border-tontine-purple bg-tontine-light-purple/10 dark:border-tontine-light-purple dark:bg-tontine-purple/20" 
              : "border-gray-200 dark:border-gray-700"}
          `}>
            <input
              type="radio"
              name="cycleDuration"
              value="12_months"
              checked={cycleDuration === "12_months"}
              onChange={() => setCycleDuration("12_months")}
              className="sr-only"
            />
            <span className="text-center">
              <span className="block font-medium dark:text-white">12 {t('months')}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('longTerm')}</span>
            </span>
          </label>
          
          <label className={`
            flex items-center justify-center p-3 border rounded-md cursor-pointer col-span-2
            ${cycleDuration === "custom" 
              ? "border-tontine-purple bg-tontine-light-purple/10 dark:border-tontine-light-purple dark:bg-tontine-purple/20" 
              : "border-gray-200 dark:border-gray-700"}
          `}>
            <input
              type="radio"
              name="cycleDuration"
              value="custom"
              checked={cycleDuration === "custom"}
              onChange={() => setCycleDuration("custom")}
              className="sr-only"
            />
            <span className="flex items-center">
              <span className="font-medium dark:text-white mr-2">{t('custom')}:</span>
              <input
                type="number"
                min="1"
                max="60"
                value={customDuration}
                onChange={handleCustomDurationChange}
                onClick={() => setCycleDuration("custom")}
                className="tontine-input w-20 py-1 px-2 text-center"
              />
              <span className="ml-2 dark:text-white">{t('months')}</span>
            </span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('startDate')}
        </label>
        <div className="relative mt-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar size={16} className="text-gray-400" />
          </div>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="tontine-input pl-10 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex items-start">
          <Info size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-300">
              {t('cycleEstimation')}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              {t('basedOnYourSettings')}:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
              <li>• {t('estimatedMembers')}: <span className="font-medium">{getEstimatedMembers()}</span></li>
              <li>• {t('estimatedDuration')}: <span className="font-medium">
                {cycleDuration === "custom" ? customDuration : cycleDuration.split('_')[0]} {t('months')}
              </span></li>
              <li>• {t('contributionFrequency')}: <span className="font-medium">{t(frequency)}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}