
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import HookLogo from "@/components/HookLogo";

interface AuthPageProps {
  initialMode?: 'signin' | 'signup' | 'forgot-password';
  onAuthSuccess?: () => void;
  onBack?: () => void;
  onSignupSuccess?: () => void;
  userType?: 'creator' | 'consumer' | null;
}

const AuthPage = ({ 
  initialMode = 'signup', 
  onAuthSuccess, 
  onBack,
  onSignupSuccess,
  userType
}: AuthPageProps) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password'>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    if (mode === 'forgot-password') {
      try {
        const result = await resetPassword(email);
        if (result.error) {
          setError(result.error.message || "An error occurred. Please try again.");
        } else {
          setSuccess("Password reset email sent! Please check your inbox and follow the instructions.");
        }
      } catch (err: any) {
        console.error('Reset password error:', err);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError("Please enter your password");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      let result;
      if (mode === 'signup') {
        result = await signUp(email, password);
        if (!result.error) {
          setSuccess("Account created successfully! Please check your email to verify your account.");
          setTimeout(() => {
            onSignupSuccess?.();
          }, 1000);
        }
      } else {
        result = await signIn(email, password);
        if (!result.error) {
          setSuccess("Signed in successfully!");
          setTimeout(() => {
            onAuthSuccess?.();
          }, 1000);
        }
      }

      if (result.error) {
        if (result.error.message.includes('Invalid login credentials')) {
          setError("Invalid email or password. Please check your credentials.");
        } else if (result.error.message.includes('User already registered')) {
          setError("An account with this email already exists. Try signing in instead.");
        } else if (result.error.message.includes('Email not confirmed')) {
          setError("Please check your email and click the confirmation link before signing in.");
        } else {
          setError(result.error.message || "An error occurred. Please try again.");
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setSuccess(null);
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'forgot-password') => {
    setMode(newMode);
    resetForm();
  };

  const getTitle = () => {
    switch (mode) {
      case 'signup': return 'Join Hooks';
      case 'signin': return 'Welcome Back';
      case 'forgot-password': return 'Reset Password';
      default: return 'Welcome';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Loading...';
    switch (mode) {
      case 'signup': return 'Sign Up';
      case 'signin': return 'Sign In';
      case 'forgot-password': return 'Send Reset Email';
      default: return 'Continue';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="absolute top-4 left-4 p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <HookLogo size="lg" />
            <h1 className="text-2xl font-bold text-gradient">Hooks</h1>
          </div>
          <CardTitle>
            {getTitle()}
            {userType && mode === 'signup' && (
              <p className="text-sm text-gray-600 mt-2">
                Joining as a {userType}
              </p>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            {mode !== 'forgot-password' && (
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-coral text-white"
            >
              {getButtonText()}
            </Button>
          </form>
          
          <div className="mt-4 text-center space-y-2">
            {mode === 'signin' && (
              <Button
                variant="ghost"
                onClick={() => switchMode('forgot-password')}
                className="text-sm text-hooks-coral hover:text-hooks-coral/80"
                disabled={loading}
              >
                Forgot your password?
              </Button>
            )}
            
            {mode === 'forgot-password' && (
              <Button
                variant="ghost"
                onClick={() => switchMode('signin')}
                className="text-sm"
                disabled={loading}
              >
                Back to Sign In
              </Button>
            )}
            
            {mode !== 'forgot-password' && (
              <Button
                variant="ghost"
                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-sm"
                disabled={loading}
              >
                {mode === 'signin' 
                  ? "Don't have an account? Sign Up" 
                  : 'Already have an account? Sign In'
                }
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
