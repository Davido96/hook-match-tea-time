import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import HookLogo from "@/components/HookLogo";

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
  onAuthSuccess?: () => void;
  onBack?: () => void;
  onSignupSuccess?: () => void;
}

const AuthPage = ({ 
  initialMode = 'signup', 
  onAuthSuccess, 
  onBack,
  onSignupSuccess
}: AuthPageProps) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError("Please fill in all fields");
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
      if (isSignUp) {
        result = await signUp(email, password);
        if (!result.error) {
          setSuccess("Account created successfully! Please check your email to verify your account.");
          // For signup, call the signup success callback to go to profile setup
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
        // Handle specific error messages
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
          <CardTitle>{isSignUp ? 'Join Hooks' : 'Welcome Back'}</CardTitle>
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
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
                setEmail("");
                setPassword("");
              }}
              className="text-sm"
              disabled={loading}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
