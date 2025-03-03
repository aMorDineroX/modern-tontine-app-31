import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Groups from "./pages/Groups";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/Auth/SignIn";
import SignUp from "./pages/Auth/SignUp";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Index";
import SupabaseDemo from "./pages/SupabaseDemo";
import AuthRoute from "./components/ProtectedRoute";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./contexts/AuthContext";
import { TontineProvider } from "./contexts/TontineContext";
import { initializeDatabase } from "./utils/databaseSetup";

const queryClient = new QueryClient();

const AppContent = () => {
  // Initialize database when the app starts
  useEffect(() => {
    // Try to initialize the database, but don't block the app if it fails
    initializeDatabase().catch(error => {
      console.warn("Database initialization failed, but app will continue:", error);
    });
  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth routes */}
          <Route element={<AuthRoute requireAuth={false} />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>
          
          {/* Protected routes */}
          <Route element={<AuthRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/supabase-demo" element={<SupabaseDemo />} />
            {/* Add more protected routes here */}
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <AuthProvider>
        <TontineProvider>
          <AppContent />
        </TontineProvider>
      </AuthProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;