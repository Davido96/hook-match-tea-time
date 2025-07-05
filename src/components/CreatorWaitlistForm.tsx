import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCreatorWaitlist } from "@/hooks/useCreatorWaitlist";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Upload, X, Instagram, Twitter, Users, MapPin, DollarSign, Target } from "lucide-react";
import { nigerianStates } from "@/data/nigerianLocations";

const creatorCategories = [
  { value: "lifestyle", label: "Lifestyle & Fashion" },
  { value: "fitness", label: "Fitness & Health" },
  { value: "beauty", label: "Beauty & Skincare" },
  { value: "food", label: "Food & Cooking" },
  { value: "travel", label: "Travel & Adventure" },
  { value: "tech", label: "Technology & Gaming" },
  { value: "music", label: "Music & Entertainment" },
  { value: "art", label: "Art & Design" },
  { value: "education", label: "Education & Learning" },
  { value: "business", label: "Business & Finance" },
  { value: "comedy", label: "Comedy & Humor" },
  { value: "other", label: "Other" }
];

const revenueRanges = [
  { value: 50000, label: "₦50,000 - ₦100,000" },
  { value: 150000, label: "₦100,000 - ₦200,000" },
  { value: 300000, label: "₦200,000 - ₦400,000" },
  { value: 600000, label: "₦400,000 - ₦800,000" },
  { value: 1000000, label: "₦800,000 - ₦1,200,000" },
  { value: 1500000, label: "₦1,200,000+" }
];

interface FormData {
  email: string;
  fullName: string;
  phoneNumber: string;
  locationCity: string;
  locationState: string;
  twitterHandle: string;
  instagramHandle: string;
  tiktokHandle: string;
  otherSocial: string;
  creatorCategory: string;
  currentFollowers: number;
  contentDescription: string;
  whyJoin: string;
  contentStrategy: string;
  expectedMonthlyRevenue: number;
  profilePhoto: File | null;
  portfolioFiles: File[];
}

const CreatorWaitlistForm = () => {
  const navigate = useNavigate();
  const { submitApplication, uploadFile, loading, uploading } = useCreatorWaitlist();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    fullName: "",
    phoneNumber: "",
    locationCity: "",
    locationState: "",
    twitterHandle: "",
    instagramHandle: "",
    tiktokHandle: "",
    otherSocial: "",
    creatorCategory: "",
    currentFollowers: 0,
    contentDescription: "",
    whyJoin: "",
    contentStrategy: "",
    expectedMonthlyRevenue: 0,
    profilePhoto: null,
    portfolioFiles: []
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: 'profilePhoto', file: File) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handlePortfolioUpload = (files: FileList) => {
    const fileArray = Array.from(files).slice(0, 5); // Max 5 files
    setFormData(prev => ({ ...prev, portfolioFiles: fileArray }));
  };

  const removePortfolioFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolioFiles: prev.portfolioFiles.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.email && formData.fullName && formData.phoneNumber);
      case 2:
        return !!(formData.locationState && formData.locationCity);
      case 3:
        return !!(formData.instagramHandle || formData.twitterHandle || formData.tiktokHandle);
      case 4:
        return !!(formData.creatorCategory && formData.contentDescription);
      case 5:
        return !!(formData.whyJoin && formData.contentStrategy);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      let profilePhotoUrl = "";
      let portfolioUrls: string[] = [];

      // Upload profile photo
      if (formData.profilePhoto) {
        const url = await uploadFile(formData.profilePhoto, 'profile-photos');
        if (url) profilePhotoUrl = url;
      }

      // Upload portfolio files
      if (formData.portfolioFiles.length > 0) {
        const uploadPromises = formData.portfolioFiles.map(file => 
          uploadFile(file, 'portfolios')
        );
        const urls = await Promise.all(uploadPromises);
        portfolioUrls = urls.filter(url => url !== null) as string[];
      }

      const application = {
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        locationCity: formData.locationCity,
        locationState: formData.locationState,
        twitterHandle: formData.twitterHandle,
        instagramHandle: formData.instagramHandle,
        tiktokHandle: formData.tiktokHandle,
        otherSocial: formData.otherSocial,
        creatorCategory: formData.creatorCategory,
        currentFollowers: formData.currentFollowers,
        contentDescription: formData.contentDescription,
        whyJoin: formData.whyJoin,
        contentStrategy: formData.contentStrategy,
        expectedMonthlyRevenue: formData.expectedMonthlyRevenue,
        profilePhotoUrl,
        portfolioUrls
      };

      const result = await submitApplication(application);
      if (result.success) {
        navigate('/creator-waitlist/success');
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold mb-2">Join the Creator Waitlist</h1>
          <p className="text-muted-foreground">
            Be among the first creators to monetize your content on Hook
          </p>
          <div className="mt-4">
            <Progress value={progress} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <Users className="w-5 h-5" />}
              {currentStep === 2 && <MapPin className="w-5 h-5" />}
              {currentStep === 3 && <Instagram className="w-5 h-5" />}
              {currentStep === 4 && <Target className="w-5 h-5" />}
              {currentStep === 5 && <DollarSign className="w-5 h-5" />}
              
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Location Details"}
              {currentStep === 3 && "Social Media Presence"}
              {currentStep === 4 && "Content & Category"}
              {currentStep === 5 && "Goals & Portfolio"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+234 xxx xxx xxxx"
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="locationState">State *</Label>
                  <Select
                    value={formData.locationState}
                    onValueChange={(value) => updateFormData('locationState', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((state) => (
                        <SelectItem key={state.state} value={state.state}>
                          {state.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="locationCity">City *</Label>
                  <Input
                    id="locationCity"
                    placeholder="Enter your city"
                    value={formData.locationCity}
                    onChange={(e) => updateFormData('locationCity', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Social Media */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Provide at least one social media handle where you create content *
                </p>
                <div>
                  <Label htmlFor="instagramHandle" className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram Handle
                  </Label>
                  <Input
                    id="instagramHandle"
                    placeholder="@yourusername"
                    value={formData.instagramHandle}
                    onChange={(e) => updateFormData('instagramHandle', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="twitterHandle" className="flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter/X Handle
                  </Label>
                  <Input
                    id="twitterHandle"
                    placeholder="@yourusername"
                    value={formData.twitterHandle}
                    onChange={(e) => updateFormData('twitterHandle', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tiktokHandle">TikTok Handle</Label>
                  <Input
                    id="tiktokHandle"
                    placeholder="@yourusername"
                    value={formData.tiktokHandle}
                    onChange={(e) => updateFormData('tiktokHandle', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="currentFollowers">Total Followers Across All Platforms</Label>
                  <Input
                    id="currentFollowers"
                    type="number"
                    placeholder="0"
                    value={formData.currentFollowers || ''}
                    onChange={(e) => updateFormData('currentFollowers', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Content & Category */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="creatorCategory">Content Category *</Label>
                  <Select
                    value={formData.creatorCategory}
                    onValueChange={(value) => updateFormData('creatorCategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary content category" />
                    </SelectTrigger>
                    <SelectContent>
                      {creatorCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contentDescription">Describe Your Content *</Label>
                  <Textarea
                    id="contentDescription"
                    placeholder="Tell us about the type of content you create, your style, and what makes you unique..."
                    rows={4}
                    value={formData.contentDescription}
                    onChange={(e) => updateFormData('contentDescription', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="profilePhoto">Profile Photo</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('profilePhoto', file);
                      }}
                    />
                    {formData.profilePhoto && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {formData.profilePhoto.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Goals & Portfolio */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="whyJoin">Why do you want to join Hook? *</Label>
                  <Textarea
                    id="whyJoin"
                    placeholder="Share your motivation for joining our creator platform..."
                    rows={3}
                    value={formData.whyJoin}
                    onChange={(e) => updateFormData('whyJoin', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contentStrategy">Your Content Strategy *</Label>
                  <Textarea
                    id="contentStrategy"
                    placeholder="Describe your content strategy and how you plan to engage with your audience on Hook..."
                    rows={3}
                    value={formData.contentStrategy}
                    onChange={(e) => updateFormData('contentStrategy', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="expectedRevenue">Expected Monthly Revenue Goal</Label>
                  <Select
                    value={formData.expectedMonthlyRevenue.toString()}
                    onValueChange={(value) => updateFormData('expectedMonthlyRevenue', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your revenue goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {revenueRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value.toString()}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Portfolio/Sample Content (Optional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload up to 5 files showcasing your best content
                  </p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => {
                      if (e.target.files) handlePortfolioUpload(e.target.files);
                    }}
                  />
                  {formData.portfolioFiles.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.portfolioFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span className="text-sm truncate">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePortfolioFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateStep(currentStep) || loading || uploading}
                  className="gradient-coral text-white"
                >
                  {loading || uploading ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatorWaitlistForm;