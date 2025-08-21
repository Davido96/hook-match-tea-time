import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Shield, Users, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import HookLogo from "@/components/HookLogo";

const CommunityGuidelines = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple">
      {/* Header Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <HookLogo size="lg" />
            <span className="text-2xl font-bold text-white font-playfair">Hooks</span>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/about")}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            Back to About
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6 font-playfair">Community Guidelines</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Building a safe, respectful, and empowering community where creators and fans can connect authentically.
          </p>
        </div>

        {/* Core Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <Heart className="w-12 h-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Respect</h3>
            <p className="text-white/80">Treat all community members with dignity, kindness, and respect regardless of background.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <Shield className="w-12 h-12 text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Safety</h3>
            <p className="text-white/80">Creating a secure environment where everyone feels protected and can express themselves freely.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <Users className="w-12 h-12 text-green-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Authenticity</h3>
            <p className="text-white/80">Encouraging genuine connections and authentic content creation within our community.</p>
          </div>
        </div>

        {/* Creator Guidelines */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 font-playfair">Creator Guidelines</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-300 mr-3" />
                <h3 className="text-xl font-semibold text-white">Best Practices</h3>
              </div>
              <ul className="space-y-2 text-white/90 text-sm">
                <li>• Create original, high-quality content that provides value to your audience</li>
                <li>• Be authentic and genuine in your interactions with fans</li>
                <li>• Respond to fan messages and comments in a timely, professional manner</li>
                <li>• Clearly communicate your content boundaries and subscription terms</li>
                <li>• Use accurate descriptions and previews for paid content</li>
                <li>• Respect fan privacy and never share private conversations</li>
                <li>• Report inappropriate fan behavior to our moderation team</li>
                <li>• Follow Nigerian laws regarding content creation and taxation</li>
              </ul>
            </div>
            
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <XCircle className="w-6 h-6 text-red-300 mr-3" />
                <h3 className="text-xl font-semibold text-white">Prohibited Behavior</h3>
              </div>
              <ul className="space-y-2 text-white/90 text-sm">
                <li>• Posting content involving minors in any sexual or suggestive context</li>
                <li>• Sharing non-consensual intimate content (revenge porn)</li>
                <li>• Promoting illegal activities or substances</li>
                <li>• Harassment, bullying, or discrimination of any kind</li>
                <li>• Impersonation of other individuals or brands</li>
                <li>• Copyright infringement or stolen content</li>
                <li>• Misleading advertising or false promises about content</li>
                <li>• Attempting to conduct transactions outside the platform</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Fan Guidelines */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 font-playfair">Fan Guidelines</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-300 mr-3" />
                <h3 className="text-xl font-semibold text-white">Respectful Engagement</h3>
              </div>
              <ul className="space-y-2 text-white/90 text-sm">
                <li>• Treat creators with respect and professionalism at all times</li>
                <li>• Respect creators' boundaries and content guidelines</li>
                <li>• Pay for content as agreed and avoid chargebacks for legitimate purchases</li>
                <li>• Keep private conversations and content strictly confidential</li>
                <li>• Provide constructive feedback and support to creators you enjoy</li>
                <li>• Report inappropriate creator behavior to our support team</li>
                <li>• Use appropriate language in messages and comments</li>
                <li>• Understand that creators are not obligated to fulfill unreasonable requests</li>
              </ul>
            </div>
            
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <XCircle className="w-6 h-6 text-red-300 mr-3" />
                <h3 className="text-xl font-semibold text-white">Unacceptable Behavior</h3>
              </div>
              <ul className="space-y-2 text-white/90 text-sm">
                <li>• Sharing, distributing, or posting creator content elsewhere without permission</li>
                <li>• Harassment, stalking, or inappropriate pursuit of creators</li>
                <li>• Demanding free content or attempting to negotiate outside the platform</li>
                <li>• Creating multiple accounts to bypass creator blocks or platform bans</li>
                <li>• Sending unsolicited explicit content or messages</li>
                <li>• Attempting to find creators' personal information or social media</li>
                <li>• Making threats, using hate speech, or discriminatory language</li>
                <li>• Fraudulent chargebacks or payment disputes for received content</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Content Standards */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 font-playfair">Content Standards</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Adult Content Policy</h3>
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-4">
                <p className="text-white/90 text-sm">
                  <strong>18+ Only:</strong> All users must be 18+ to access adult content. Age verification is required.
                </p>
              </div>
              <ul className="space-y-2 text-white/90 text-sm">
                <li>• Content must be properly tagged as adult/explicit</li>
                <li>• All participants must be 18+ with valid documentation</li>
                <li>• Content must be consensual and legal in Nigeria</li>
                <li>• No extreme violence or harmful activities</li>
                <li>• Proper content warnings for sensitive material</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">General Content Rules</h3>
              <ul className="space-y-2 text-white/90 text-sm">
                <li>• All content must be original or properly licensed</li>
                <li>• No spam, duplicate, or low-quality content</li>
                <li>• Accurate descriptions and appropriate thumbnails</li>
                <li>• No misleading clickbait or false advertising</li>
                <li>• Content must comply with Nigerian broadcasting standards</li>
                <li>• Intellectual property rights must be respected</li>
                <li>• No promotion of illegal goods or services</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reporting & Enforcement */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 font-playfair">Reporting & Enforcement</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">How to Report Violations</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">In-App Reporting</p>
                    <p className="text-white/80 text-sm">Use the report button on any profile, message, or content piece</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Email Support</p>
                    <p className="text-white/80 text-sm">Send detailed reports to support@hooks.ng</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Emergency Situations</p>
                    <p className="text-white/80 text-sm">For immediate safety concerns, contact emergency@hooks.ng</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Enforcement Actions</h3>
              <div className="space-y-3">
                <div className="bg-yellow-500/20 border-l-4 border-yellow-500 pl-4 py-2">
                  <p className="text-white font-semibold">Warning</p>
                  <p className="text-white/80 text-sm">First-time minor violations receive warnings and guidance</p>
                </div>
                
                <div className="bg-orange-500/20 border-l-4 border-orange-500 pl-4 py-2">
                  <p className="text-white font-semibold">Temporary Suspension</p>
                  <p className="text-white/80 text-sm">Repeat violations result in 7-30 day account suspensions</p>
                </div>
                
                <div className="bg-red-500/20 border-l-4 border-red-500 pl-4 py-2">
                  <p className="text-white font-semibold">Permanent Ban</p>
                  <p className="text-white/80 text-sm">Severe violations or repeated offenses result in permanent removal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appeals Process */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 font-playfair">Appeals Process</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-300">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Submit Appeal</h3>
              <p className="text-white/80 text-sm">Email appeals@hooks.ng within 14 days of the enforcement action</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-300">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Review Process</h3>
              <p className="text-white/80 text-sm">Our team reviews your case within 5 business days</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-300">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Final Decision</h3>
              <p className="text-white/80 text-sm">You'll receive a detailed response about the outcome of your appeal</p>
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-hooks-coral/20 to-hooks-pink/20 backdrop-blur-sm rounded-2xl p-8 border border-hooks-coral/30">
            <h2 className="text-3xl font-bold text-white mb-4 font-playfair">Questions About Our Guidelines?</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Our community team is here to help clarify any guidelines and support you in creating a positive experience for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate("/terms")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Terms of Service
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/privacy/creators")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Privacy Policy
              </Button>
              <div className="text-white/80 text-sm mt-2">
                <p>Support: support@hooks.ng</p>
                <p>Community: community@hooks.ng</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityGuidelines;