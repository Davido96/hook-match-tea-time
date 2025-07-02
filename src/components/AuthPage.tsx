
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import HookLogo from "./HookLogo";

interface AuthPageProps {
  initialMode?: "signin" | "signup";
  onAuthSuccess?: () => void;
  onSignupSuccess?: () => void;
  onBack: () => void;
}

const AuthPage = ({ initialMode = "signin", onAuthSuccess, onSignupSuccess, onBack }: AuthPageProps) => {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  // Extract referral code from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    if (location.pathname === '/auth/signup' && referralCode) {
      setMode('signup');
    }
  }, [location.pathname, referralCode]);

  const validateSignUp = () => {
    if (!email || !password || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
        variant: "destructive"
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const validateSignIn = () => {
    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter your email and password.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUp()) return;
    
    setLoading(true);
    
    try {
      const options: any = {};
      
      // Add referral code to user metadata if present
      if (referralCode) {
        options.data = { referral_code: referralCode };
      }
      
      const { error } = await signUp(email, password, options);
      
      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: referralCode 
            ? "Account created! Check your email to verify and claim your referral bonus."
            : "Account created! Check your email to verify your account.",
        });
        
        if (onSignupSuccess) {
          onSignupSuccess();
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Sign Up Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignIn()) return;

    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        console.error('Signin error:', error);
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: "Signed in successfully!",
        });
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      }
    } catch (error: any) {
      console.error('Signin error:', error);
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <HookLogo className="w-12 h-12" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {mode === "signin" ? "Welcome Back" : "Join Hook"}
          </CardTitle>
          <p className="text-gray-600">
            {mode === "signin" 
              ? "Sign in to your account" 
              : referralCode 
                ? "Create your account and claim your bonus!"
                : "Create your account to get started"
            }
          </p>
          {referralCode && mode === "signup" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
              <p className="text-sm text-green-700">
                🎉 You're using referral code: <strong>{referralCode}</strong>
                <br />You'll receive bonus Keys after verification!
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                type="email" 
                id="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                type="password" 
                id="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            {mode === "signup" && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  type="password" 
                  id="confirmPassword" 
                  placeholder="Confirm your password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
            <Button type="submit" className="w-full gradient-coral text-white" disabled={loading}>
              {loading 
                ? <span className="animate-pulse">Loading...</span> 
                : mode === "signin" ? "Sign In" : "Sign Up"}
            </Button>
          </form>
        </CardContent>

        <div className="p-4 text-center">
          {mode === "signin" ? (
            <>
              Don't have an account?{" "}
              <Button variant="link" onClick={() => setMode("signup")} disabled={loading}>
                Sign Up
              </Button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Button variant="link" onClick={() => setMode("signin")} disabled={loading}>
                Sign In
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;
