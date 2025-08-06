import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Shield, UserCheck, Eye, FileCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useCreatorConsent } from "@/hooks/useCreatorConsent";

interface CreatorConsentFormProps {
  onComplete: () => void;
  onBack?: () => void;
}

const CreatorConsentForm = ({ onComplete, onBack }: CreatorConsentFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [consentData, setConsentData] = useState({
    kycConsent: false,
    ageConsent: false,
    privacyConsent: false,
    finalAgreement: false,
  });

  const { createOrUpdateConsent, loading } = useCreatorConsent();

  const steps = [
    {
      id: 1,
      title: "KYC Onboarding Policy",
      icon: UserCheck,
      key: "kycConsent" as keyof typeof consentData,
    },
    {
      id: 2,
      title: '"Rated 18+" Consent Form',
      icon: Shield,
      key: "ageConsent" as keyof typeof consentData,
    },
    {
      id: 3,
      title: "Privacy Disclaimer",
      icon: Eye,
      key: "privacyConsent" as keyof typeof consentData,
    },
    {
      id: 4,
      title: "Final Agreement",
      icon: FileCheck,
      key: "finalAgreement" as keyof typeof consentData,
    },
  ];

  const currentStepData = steps[currentStep - 1];
  const progress = (currentStep / steps.length) * 100;

  const handleNext = async () => {
    const updatedConsent = {
      ...consentData,
      [currentStepData.key]: true,
    };
    setConsentData(updatedConsent);

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - save to database and complete
      const result = await createOrUpdateConsent(updatedConsent);
      if (result.success) {
        onComplete();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Purpose:</h3>
              <p className="text-muted-foreground">
                To verify the identity of every creator, protect the integrity of our community, and comply with age-restriction standards, we require creators to complete a KYC (Know Your Customer) process.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">What you'll provide during onboarding:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• A clear live photo (selfie) of yourself</li>
                <li>• A valid government-issued identity document</li>
                <li>• Consent for face matching to confirm identity</li>
                <li>• Your preferred display username (this will be public)</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Important Notes:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Your full name, ID number, and face data are only used for verification and will not be shared publicly.</li>
                <li>• Only your username, profile photo, and content will be visible to fans.</li>
                <li>• All data submitted is stored securely and in compliance with privacy laws.</li>
              </ul>
            </div>

            <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="kyc-consent"
                checked={consentData.kycConsent}
                onCheckedChange={(checked) => 
                  setConsentData(prev => ({ ...prev, kycConsent: checked as boolean }))
                }
              />
              <label htmlFor="kyc-consent" className="text-sm font-medium">
                By clicking next, I confirm that the documents provided are valid and belong to me.
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              This platform is exclusively for adults. By signing up as a creator, you confirm the following:
            </p>

            <ul className="space-y-3 text-muted-foreground">
              <li>• You are 18 years of age or older.</li>
              <li>• You are consenting to post or share adult-rated or suggestive content.</li>
              <li>• You understand and accept that HooksFans is an adult content platform, and your content will be available only to age-verified users.</li>
              <li>• You agree not to post illegal, abusive, or non-consensual content.</li>
              <li>• You acknowledge that HooksFans has the right to moderate or remove content that violates its policies.</li>
            </ul>

            <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="age-consent"
                checked={consentData.ageConsent}
                onCheckedChange={(checked) => 
                  setConsentData(prev => ({ ...prev, ageConsent: checked as boolean }))
                }
              />
              <label htmlFor="age-consent" className="text-sm font-medium">
                By clicking next, I certify that I am legally eligible and consenting to participate as a creator on an 18+ platform.
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Your privacy and safety are our top priority. Here's how we handle your data:
            </p>

            <ul className="space-y-3 text-muted-foreground">
              <li>• Personal information (name, photo, ID, etc.) is used strictly for identity verification.</li>
              <li>• We do not sell, trade, or publicly display any part of your personal data.</li>
              <li>• Only your public-facing username and content will be visible to users.</li>
              <li>• You may request to delete your account and data at any time, subject to identity confirmation.</li>
              <li>• We maintain strict security protocols to store your data securely and prevent unauthorized access.</li>
            </ul>

            <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="privacy-consent"
                checked={consentData.privacyConsent}
                onCheckedChange={(checked) => 
                  setConsentData(prev => ({ ...prev, privacyConsent: checked as boolean }))
                }
              />
              <label htmlFor="privacy-consent" className="text-sm font-medium">
                By clicking agree, I acknowledge the data handling policy and agree to participate with my privacy protected.
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <FileCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Final Agreement</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You are about to complete your onboarding and become a verified creator on HooksFans. 
                Please review that you have agreed to all previous sections.
              </p>
            </div>

            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">KYC Onboarding Policy - Agreed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">"Rated 18+" Consent Form - Agreed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-muted-foreground">Privacy Disclaimer - Agreed</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="final-agreement"
                checked={consentData.finalAgreement}
                onCheckedChange={(checked) => 
                  setConsentData(prev => ({ ...prev, finalAgreement: checked as boolean }))
                }
              />
              <label htmlFor="final-agreement" className="text-sm font-medium">
                I agree to all terms and conditions and wish to proceed as a verified creator on HooksFans.
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isCurrentStepComplete = () => {
    return consentData[currentStepData.key];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🔐 HooksFans Creator Verification Agreement
          </h1>
          <p className="text-muted-foreground">
            Welcome to HooksFans. Please complete this verification process to proceed.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <currentStepData.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                <CardDescription>Step {currentStep} of {steps.length}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? "Back" : "Previous"}</span>
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isCurrentStepComplete() || loading}
            className="flex items-center space-x-2"
          >
            <span>
              {currentStep === steps.length 
                ? (loading ? "Completing..." : "I Agree & Proceed") 
                : "Next"
              }
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatorConsentForm;