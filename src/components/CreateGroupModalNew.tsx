import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import CyclePlanningForm from "./tontine/CyclePlanningForm";

type CreateGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { 
    name: string; 
    contribution: string; 
    frequency: string; 
    members: string;
    cycleDuration: string;
    startDate: string;
    payoutMethod: string;
  }) => void;
};

export default function CreateGroupModal({ isOpen, onClose, onSubmit }: CreateGroupModalProps) {
  const { t, currency } = useApp();
  const [name, setName] = useState("");
  const [contribution, setContribution] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [members, setMembers] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("rotation");
  const [startDate, setStartDate] = useState("");
  const [cycleDuration, setCycleDuration] = useState("6_months");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }
    
    onSubmit({ 
      name, 
      contribution, 
      frequency, 
      members,
      cycleDuration,
      startDate,
      payoutMethod
    });
    
    // Réinitialiser les champs
    setName("");
    setContribution("");
    setFrequency("monthly");
    setMembers("");
    setPayoutMethod("rotation");
    setStartDate("");
    setCycleDuration("6_months");
    setCurrentStep(1);
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Titre de l'étape actuelle
  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return t('basicInformation');
      case 2:
        return t('cyclePlanning');
      case 3:
        return t('membersAndPayouts');
      default:
        return t('createGroup');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-40 p-4 pointer-events-none">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md pointer-events-auto animate-fade-in">
          <div className="p-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold dark:text-white">{getStepTitle()}</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Indicateur de progression */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('step')} {currentStep} {t('of')} {totalSteps}
                </span>
                <span className="text-xs font-medium text-tontine-purple dark:text-tontine-light-purple">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-tontine-purple dark:bg-tontine-light-purple h-1.5 rounded-full" 
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Étape 1: Informations de base */}
              {currentStep === 1 && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('groupName')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="tontine-input w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Family Tontine"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contribution" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('contributionAmount')} ({currency.symbol})
                    </label>
                    <input
                      type="text"
                      id="contribution"
                      value={contribution}
                      onChange={(e) => setContribution(e.target.value)}
                      className="tontine-input w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="50"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('contributionFrequency')}
                    </label>
                    <select
                      id="frequency"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="tontine-input w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="weekly">{t('weekly')}</option>
                      <option value="biweekly">{t('biweekly')}</option>
                      <option value="monthly">{t('monthly')}</option>
                    </select>
                  </div>
                </>
              )}

              {/* Étape 2: Planification du cycle */}
              {currentStep === 2 && (
                <CyclePlanningForm 
                  cycleDuration={cycleDuration}
                  setCycleDuration={setCycleDuration}
                  frequency={frequency}
                  startDate={startDate}
                  setStartDate={setStartDate}
                />
              )}

              {/* Étape 3: Membres et méthode de paiement */}
              {currentStep === 3 && (
                <>
                  <div>
                    <label htmlFor="payoutMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('payoutMethod')}
                    </label>
                    <select
                      id="payoutMethod"
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                      className="tontine-input w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="rotation">{t('rotation')}</option>
                      <option value="random">{t('randomSelection')}</option>
                      <option value="bidding">{t('biddingSystem')}</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {payoutMethod === 'rotation' && t('rotationDescription')}
                      {payoutMethod === 'random' && t('randomDescription')}
                      {payoutMethod === 'bidding' && t('biddingDescription')}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="members" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('inviteMembers')}
                    </label>
                    <textarea
                      id="members"
                      value={members}
                      onChange={(e) => setMembers(e.target.value)}
                      className="tontine-input w-full mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={3}
                      placeholder="email1@example.com, email2@example.com"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {t('separateEmailsByComma')}
                    </p>
                  </div>
                </>
              )}

              {/* Boutons de navigation */}
              <div className="pt-4 flex justify-between">
                {currentStep > 1 ? (
                  <button 
                    type="button" 
                    onClick={handlePrevStep}
                    className="tontine-button tontine-button-outline flex items-center"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    {t('previous')}
                  </button>
                ) : (
                  <div></div> // Espace vide pour maintenir l'alignement
                )}
                
                <button 
                  type="submit" 
                  className="tontine-button tontine-button-primary flex items-center"
                >
                  {currentStep < totalSteps ? (
                    <>
                      {t('next')}
                      <ChevronRight size={16} className="ml-1" />
                    </>
                  ) : (
                    t('createGroup')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}