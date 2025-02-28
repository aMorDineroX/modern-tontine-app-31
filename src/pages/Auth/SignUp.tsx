import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserRound, KeyRound, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
  }>({});
  
  const { signUp } = useAuth();
  const { t } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      fullName?: string;
    } = {};
    let isValid = true;

    // Full name validation
    if (!fullName || fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full name (at least 2 characters)";
      isValid = false;
    }

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Password must include uppercase, lowercase, and numbers";
      isValid = false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const success = await signUp(email, password, fullName);
      
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign Up Failed",
        description: "An error occurred during sign up. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: "" };
    
    let strength = 0;
    let label = "Very weak";
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Set label based on strength
    if (strength >= 6) label = "Very strong";
    else if (strength >= 4) label = "Strong";
    else if (strength >= 3) label = "Medium";
    else if (strength >= 2) label = "Weak";
    
    return { 
      strength: Math.min(strength, 6), 
      label,
      color: strength <= 2 ? "bg-red-500" : strength <= 3 ? "bg-yellow-500" : "bg-green-500"
    };
  };

  const passwordStrength = getPasswordStrength();
  const strengthPercentage = (passwordStrength.strength / 6) * 100;

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
          <p className="text-gray-600 dark:text-gray-400">Create your account to get started</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserRound size={18} className="text-gray-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({...errors, fullName: undefined});
                  }}
                  className={`tontine-input pl-10 w-full ${errors.fullName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="John Doe"
                  required
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

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
                    if (errors.email) setErrors({...errors, email: undefined});
                  }}
                  className={`tontine-input pl-10 w-full ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
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
                    if (errors.password) setErrors({...errors, password: undefined});
                  }}
                  className={`tontine-input pl-10 w-full ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="••••••••"
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
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${passwordStrength.color}`} 
                        style={{ width: `${strengthPercentage}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 min-w-[80px] text-right">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
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
                    if (errors.confirmPassword) setErrors({...errors, confirmPassword: undefined});
                  }}
                  className={`tontine-input pl-10 w-full ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="••••••••"
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
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-tontine-purple focus:ring-tontine-purple border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-600 dark:text-gray-400">
                  I agree to the <Link to="/terms" className="text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple">Terms of Service</Link> and <Link to="/privacy" className="text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple">Privacy Policy</Link>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="tontine-button tontine-button-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <SocialLoginButtons className="mt-6" />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/signin" className="text-tontine-purple hover:text-tontine-dark-purple dark:text-tontine-light-purple dark:hover:text-tontine-purple font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}