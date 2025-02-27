import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  LogOut, 
  Edit, 
  Save,
  Phone,
  Calendar,
  CreditCard,
  Shield,
  Bell,
  Settings,
  HelpCircle,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t, formatAmount } = useApp();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || 'Utilisateur Tontine');
  const [email] = useState(user?.email || 'utilisateur@exemple.com');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '+33 6 12 34 56 78');
  const [birthdate, setBirthdate] = useState(user?.user_metadata?.birthdate || '01/01/1980');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [language, setLanguage] = useState('Français');

  // Mock transaction history
  const transactions = [
    { id: 1, type: 'contribution', amount: 100, group: 'Family Savings', date: '15 Mai 2023', status: 'completed' },
    { id: 2, type: 'payout', amount: 800, group: 'Friends Circle', date: '22 Avril 2023', status: 'completed' },
    { id: 3, type: 'contribution', amount: 50, group: 'Family Savings', date: '15 Avril 2023', status: 'completed' },
    { id: 4, type: 'contribution', amount: 200, group: 'Business Collective', date: '1 Avril 2023', status: 'completed' },
  ];

  // Mock payment methods
  const paymentMethods = [
    { id: 1, type: 'card', last4: '4242', expiry: '04/25', default: true },
    { id: 2, type: 'bank', accountNumber: '****3456', name: 'Compte Courant', default: false }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    try {
      // Implement profile update logic here
      setIsEditing(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations personnelles ont été mises à jour avec succès.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de votre profil.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordReset = () => {
    toast({
      title: "Email envoyé",
      description: "Un email de réinitialisation de mot de passe a été envoyé à votre adresse email.",
      variant: "default",
    });
  };

  const handleToggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast({
      title: twoFactorEnabled ? "Authentification à deux facteurs désactivée" : "Authentification à deux facteurs activée",
      description: twoFactorEnabled ? 
        "La sécurité de votre compte est réduite." : 
        "Votre compte est maintenant mieux protégé.",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profil Personnel</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-tontine-light-purple text-tontine-dark-purple text-xl">
                      {fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold dark:text-white">{fullName}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
                  
                  <div className="mt-4 w-full">
                    <Button 
                      variant="outline" 
                      className="w-full mb-2"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit size={16} className="mr-2" />
                      Modifier le profil
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleSignOut}
                    >
                      <LogOut size={16} className="mr-2" />
                      Déconnexion
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Résumé Financier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <Lock size={16} className="text-green-600" />
                      </div>
                      <span className="text-sm font-medium dark:text-white">Total Épargné</span>
                    </div>
                    <span className="font-semibold dark:text-white">{formatAmount(3200)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <CreditCard size={16} className="text-blue-600" />
                      </div>
                      <span className="text-sm font-medium dark:text-white">Contributions</span>
                    </div>
                    <span className="font-semibold dark:text-white">{formatAmount(1250)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <User size={16} className="text-purple-600" />
                      </div>
                      <span className="text-sm font-medium dark:text-white">Groupes Actifs</span>
                    </div>
                    <span className="font-semibold dark:text-white">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="mb-4 grid grid-cols-4">
                <TabsTrigger value="personal">Informations</TabsTrigger>
                <TabsTrigger value="security">Sécurité</TabsTrigger>
                <TabsTrigger value="payments">Paiements</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
              </TabsList>
              
              {/* Personal Information Tab */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Informations Personnelles</CardTitle>
                      {!isEditing ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit size={16} className="mr-2" />
                          Modifier
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleSaveProfile}
                        >
                          <Save size={16} className="mr-2" />
                          Enregistrer
                        </Button>
                      )}
                    </div>
                    <CardDescription>
                      Gérez vos informations personnelles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Nom complet</Label>
                          {isEditing ? (
                            <input 
                              id="fullName"
                              type="text" 
                              value={fullName} 
                              onChange={(e) => setFullName(e.target.value)}
                              className="tontine-input w-full"
                              placeholder="Nom complet"
                            />
                          ) : (
                            <div className="flex items-center">
                              <User size={16} className="text-gray-500 mr-2" />
                              <p className="text-base dark:text-white">{fullName}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Adresse email</Label>
                          <div className="flex items-center">
                            <Mail size={16} className="text-gray-500 mr-2" />
                            <p className="text-base dark:text-white">{email}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Numéro de téléphone</Label>
                          {isEditing ? (
                            <input 
                              id="phone"
                              type="tel" 
                              value={phone} 
                              onChange={(e) => setPhone(e.target.value)}
                              className="tontine-input w-full"
                              placeholder="Numéro de téléphone"
                            />
                          ) : (
                            <div className="flex items-center">
                              <Phone size={16} className="text-gray-500 mr-2" />
                              <p className="text-base dark:text-white">{phone}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="birthdate">Date de naissance</Label>
                          {isEditing ? (
                            <input 
                              id="birthdate"
                              type="text" 
                              value={birthdate} 
                              onChange={(e) => setBirthdate(e.target.value)}
                              className="tontine-input w-full"
                              placeholder="Date de naissance"
                            />
                          ) : (
                            <div className="flex items-center">
                              <Calendar size={16} className="text-gray-500 mr-2" />
                              <p className="text-base dark:text-white">{birthdate}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium dark:text-white">Préférences</h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Bell size={18} className="text-gray-500" />
                            <Label htmlFor="notifications">Notifications</Label>
                          </div>
                          <Switch 
                            id="notifications" 
                            checked={notificationsEnabled}
                            onCheckedChange={setNotificationsEnabled}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Settings size={18} className="text-gray-500" />
                            <Label htmlFor="darkMode">Mode sombre</Label>
                          </div>
                          <Switch 
                            id="darkMode" 
                            checked={darkModeEnabled}
                            onCheckedChange={setDarkModeEnabled}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Globe size={18} className="text-gray-500" />
                            <Label htmlFor="language">Langue</Label>
                          </div>
                          <select 
                            id="language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="tontine-select"
                          >
                            <option value="Français">Français</option>
                            <option value="English">English</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Sécurité du Compte</CardTitle>
                    <CardDescription>
                      Gérez les paramètres de sécurité de votre compte
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium dark:text-white">Mot de passe</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Votre mot de passe a été mis à jour pour la dernière fois il y a 3 mois
                        </p>
                        <Button 
                          variant="outline"
                          onClick={handlePasswordReset}
                        >
                          <Lock size={16} className="mr-2" />
                          Changer le mot de passe
                        </Button>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium dark:text-white">Authentification à deux facteurs</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Ajoutez une couche de sécurité supplémentaire à votre compte
                            </p>
                          </div>
                          <Switch 
                            checked={twoFactorEnabled}
                            onCheckedChange={handleToggleTwoFactor}
                          />
                        </div>
                        
                        {twoFactorEnabled && (
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <div className="flex items-start">
                              <CheckCircle2 size={20} className="text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                              <div>
                                <h4 className="text-base font-medium text-green-800 dark:text-green-400">
                                  Authentification à deux facteurs activée
                                </h4>
                                <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                                  Votre compte est maintenant mieux protégé contre les accès non autorisés.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium dark:text-white">Sessions actives</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium dark:text-white">Cet appareil</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Paris, France • Dernière activité: Aujourd'hui
                              </p>
                            </div>
                            <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                              Actif
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Payment Methods Tab */}
              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Moyens de Paiement</CardTitle>
                      <Button variant="outline" size="sm">
                        <CreditCard size={16} className="mr-2" />
                        Ajouter
                      </Button>
                    </div>
                    <CardDescription>
                      Gérez vos moyens de paiement pour les contributions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div 
                          key={method.id}
                          className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4">
                              {method.type === 'card' ? (
                                <CreditCard size={20} className="text-tontine-dark-purple" />
                              ) : (
                                <Building size={20} className="text-tontine-dark-purple" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium dark:text-white">
                                {method.type === 'card' ? (
                                  <>Carte •••• {method.last4}</>
                                ) : (
                                  <>{method.name}</>
                                )}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {method.type === 'card' ? (
                                  <>Expire: {method.expiry}</>
                                ) : (
                                  <>Compte: {method.accountNumber}</>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {method.default && (
                              <span className="text-xs bg-tontine-light-purple/20 text-tontine-dark-purple dark:bg-tontine-purple/30 dark:text-tontine-light-purple px-2 py-1 rounded-full">
                                Par défaut
                              </span>
                            )}
                            <Button variant="ghost" size="sm">
                              <Edit size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Transaction History Tab */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Historique des Transactions</CardTitle>
                    <CardDescription>
                      Consultez l'historique de vos contributions et paiements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div 
                          key={transaction.id}
                          className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                              transaction.type === 'contribution' 
                                ? 'bg-blue-100 dark:bg-blue-900/20' 
                                : 'bg-green-100 dark:bg-green-900/20'
                            }`}>
                              {transaction.type === 'contribution' ? (
                                <ArrowUpCircle size={20} className="text-blue-600 dark:text-blue-400" />
                              ) : (
                                <ArrowDownCircle size={20} className="text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium dark:text-white">
                                {transaction.type === 'contribution' ? 'Contribution' : 'Paiement reçu'}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {transaction.group} • {transaction.date}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.type === 'contribution' 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {transaction.type === 'contribution' ? '-' : '+'}{formatAmount(transaction.amount)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {transaction.status === 'completed' ? 'Complété' : 'En attente'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

// Add missing icons
const Globe = (props) => (
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
    <line x1="2" x2="22" y1="12" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const Building = (props) => (
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
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

const ArrowUpCircle = (props) => (
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

const ArrowDownCircle = (props) => (
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

export default Profile;