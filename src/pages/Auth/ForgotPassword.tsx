import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, AlertCircle, KeyRound, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import authService from "@/services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { resetPassword } = useAuth();
  const { t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Extraire le token de réinitialisation de l'URL
  const searchParams = new URLSearchParams(location.search);
  const resetToken = searchParams.get('token');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Valider l'email
    if (!validateEmail(email)) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await resetPassword(email);
      setSubmitted(true);
      toast({
        title: "Réinitialisation en cours",
        description: "Un lien de réinitialisation a été envoyé à votre email",
      });
    } catch (error) {
      console.error("Erreur de réinitialisation:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Vérifier si les mots de passe correspondent
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    // Valider le mot de passe
    if (!validatePassword(password)) {
      setError("Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Vérifier et confirmer la réinitialisation du mot de passe
      if (!resetToken) {
        throw new Error("Token de réinitialisation manquant");
      }

      await authService.confirmPasswordReset(resetToken, password);
      
      toast({
        title: "Mot de passe réinitialisé",
        description: "Votre mot de passe a été mis à jour avec succès",
      });

      // Rediriger vers la page de connexion
      navigate("/signin");
    } catch (error) {
      console.error("Erreur de réinitialisation:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    setSubmitted(false);
    setError(null);
  };

  // Rendu de la page de réinitialisation de mot de passe
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link 
            to="/" 
            className="text-4xl font-bold tontine-text-gradient mb-4 block text-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            Tontine
          </Link>
          <p className="text-gray-600 dark:text-gray-400">
            {resetToken ? "Réinitialiser votre mot de passe" : "Réinitialisation du mot de passe"}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          {/* Page de demande de réinitialisation */}
          {!resetToken && !submitted && (
            <form onSubmit={handleResetRequest} className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`tontine-input pl-10 w-full ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                {error && (
                  <div className="mt-2 flex items-center text-sm text-red-500">
                    <AlertCircle size={16} className="mr-1" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="tontine-button tontine-button-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
              </button>
            </form>
          )}

          {/* Page de confirmation d'envoi */}
          {!resetToken && submitted && (
            <div className="text-center py-4">
              <div className="bg-tontine-light-purple/20 text-tontine-dark-purple dark:bg-tontine-purple/20 dark:text-tontine-light-purple p-3 rounded-full inline-flex items-center justify-center mb-4">
                <Mail size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Vérifiez votre email</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Nous avons envoyé un lien de réinitialisation à <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vous n'avez pas reçu l'email ? Vérifiez votre dossier spam ou{" "}
                <button 
                  onClick={handleTryAgain}
                  className="text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple"
                >
                  réessayez
                </button>
              </p>
            </div>
          )}

          {/* Page de réinitialisation du mot de passe */}
          {resetToken && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Entrez un nouveau mot de passe pour votre compte.
              </p>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`tontine-input pl-10 w-full ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder="Nouveau mot de passe"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                  Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className={`tontine-input pl-10 w-full ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    placeholder="Confirmer le mot de passe"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-2 flex items-center text-sm text-red-500">
                  <AlertCircle size={16} className="mr-1" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="tontine-button tontine-button-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/signin" className="text-sm text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}