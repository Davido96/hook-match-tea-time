import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Briefcase, User, ArrowLeft } from "lucide-react";
import AuthPage from "@/components/AuthPage";
import CreatorConsentForm from "@/components/CreatorConsentForm";
import HookLogo from "@/components/HookLogo";

interface CreatorSignupFlowProps {
  onComplete: (userType: 'creator' | 'consumer') => void;
  onBack: () => void;
}

const CreatorSignupFlow = ({ onComplete, onBack }: CreatorSignupFlowProps) => {
  const [step, setStep] = useState<'userType' | 'auth' | 'consent'>('userType');
  const [selectedUserType, setSelectedUserType] = useState<'creator' | 'consumer' | ''>('');

  const handleUserTypeNext = () => {
    if (!selectedUserType) return;
    setStep('auth');
  };

  const handleAuthSuccess = () => {
    if (selectedUserType === 'creator') {
      // Show consent form for creators
      setStep('consent');
    } else if (selectedUserType === 'consumer') {
      // Go directly to profile setup for consumers
      onComplete(selectedUserType);
    }
  };

  const handleConsentComplete = () => {
    // Consent completed, now go to profile setup
    onComplete(selectedUserType as 'creator');
  };

  const handleBackFromAuth = () => {
    setStep('userType');
  };

  const handleBackFromConsent = () => {
    setStep('auth');
  };

  if (step === 'auth') {
    return (
      <AuthPage
        initialMode="signup"
        onSignupSuccess={handleAuthSuccess}
        onBack={handleBackFromAuth}
      />
    );
  }

  if (step === 'consent') {
    return (
      <CreatorConsentForm
        onComplete={handleConsentComplete}
        onBack={handleBackFromConsent}
      />
    );
  }

  // User Type Selection Step
  return (
    <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center relative">
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-center mb-4">
            <HookLogo className="w-12 h-12" />
          </div>
          
          <CardTitle className="text-2xl font-bold text-gray-900">
            Choose Your Experience
          </CardTitle>
          <p className="text-gray-600">
            Select how you'd like to use Hook
          </p>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <RadioGroup
              value={selectedUserType}
              onValueChange={(value) => setSelectedUserType(value as 'creator' | 'consumer')}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="creator" id="creator" />
                <div className="flex-1">
                  <Label htmlFor="creator" className="cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-5 h-5 text-hooks-coral" />
                      <span className="font-medium">Content Creator</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Share exclusive content and earn from subscriptions
                    </p>
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="consumer" id="consumer" />
                <div className="flex-1">
                  <Label htmlFor="consumer" className="cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-hooks-coral" />
                      <span className="font-medium">Premium Member</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Discover and connect with amazing creators
                    </p>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            <Button
              onClick={handleUserTypeNext}
              disabled={!selectedUserType}
              className="w-full gradient-coral text-white"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorSignupFlow;