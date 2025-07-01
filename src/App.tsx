import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import NotificationToast from "@/components/NotificationToast";
import LandingPage from "@/components/LandingPage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import ProfileSetupPage from "@/pages/ProfileSetupPage";
import AppPage from "@/pages/AppPage";
import MessagesPage from "@/pages/MessagesPage";
import ExclusiveContentPage from "@/pages/ExclusiveContentPage";
import IncomingLikesPage from "@/pages/IncomingLikesPage";
import UserProfile from "@/pages/UserProfile";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthRoute from "@/components/AuthRoute";
import ProfileRequiredRoute from "@/components/ProfileRequiredRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <NotificationToast />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Auth routes - redirect authenticated users */}
            <Route path="/auth/signin" element={<AuthRoute><SignInPage /></AuthRoute>} />
            <Route path="/auth/signup" element={<AuthRoute><SignUpPage /></AuthRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Profile setup - requires auth but no profile */}
            <Route path="/profile-setup" element={
              <ProtectedRoute>
                <ProfileSetupPage />
              </ProtectedRoute>
            } />
            
            {/* App routes - require auth and profile */}
            <Route path="/app" element={
              <ProfileRequiredRoute>
                <AppPage />
              </ProfileRequiredRoute>
            } />
            <Route path="/app/messages" element={
              <ProfileRequiredRoute>
                <MessagesPage />
              </ProfileRequiredRoute>
            } />
            <Route path="/app/exclusive" element={
              <ProfileRequiredRoute>
                <ExclusiveContentPage />
              </ProfileRequiredRoute>
            } />
            <Route path="/app/likes" element={
              <ProfileRequiredRoute>
                <IncomingLikesPage />
              </ProfileRequiredRoute>
            } />
            
            {/* Other protected routes */}
            <Route path="/profile/:userId" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
