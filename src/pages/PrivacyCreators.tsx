import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import HookLogo from "@/components/HookLogo";

const PrivacyCreators = () => {
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

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-white mb-6 font-playfair">Creator Privacy Policy</h1>
          <p className="text-white/80 mb-8 text-sm">Last updated: December 2024</p>

          <div className="space-y-8 text-white/90">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Your Content, Your Control</h2>
              <p className="mb-4">
                As a creator on Hooks, you retain full ownership and control of all content you upload. 
                We never claim ownership of your intellectual property, and you can delete your content 
                at any time.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You own all rights to your original content</li>
                <li>You control who can access your content through our subscription and pay-per-view systems</li>
                <li>You can delete or modify your content at any time</li>
                <li>We only store your content to provide our services to you</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Personal Information We Collect</h2>
              <p className="mb-4">To provide our services and ensure platform safety, we collect:</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Account Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Email address and phone number</li>
                    <li>Profile information you choose to share</li>
                    <li>Payment and tax information for earnings</li>
                    <li>Age verification documents</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Platform Usage</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Content upload and engagement metrics</li>
                    <li>Subscriber and earnings data</li>
                    <li>Messages and interactions with fans</li>
                    <li>Technical data for security and performance</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">How We Protect Your Privacy</h2>
              <div className="bg-white/10 rounded-xl p-6">
                <ul className="space-y-3">
                  <li><strong>Bank-grade encryption:</strong> All sensitive data is encrypted in transit and at rest</li>
                  <li><strong>Limited access:</strong> Only authorized personnel can access user data, and only when necessary</li>
                  <li><strong>No content sharing:</strong> We never share your content with third parties without your consent</li>
                  <li><strong>Secure payments:</strong> We use industry-standard payment processors and never store full payment details</li>
                  <li><strong>Regular audits:</strong> We conduct regular security audits and vulnerability assessments</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Your Rights as a Creator</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Content Rights</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Download all your uploaded content</li>
                    <li>Delete specific content or your entire account</li>
                    <li>Control content visibility and pricing</li>
                    <li>Restrict access to specific regions or users</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Data Rights</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Access all data we have about you</li>
                    <li>Correct inaccurate information</li>
                    <li>Request data deletion (right to be forgotten)</li>
                    <li>Data portability to other platforms</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Earnings & Tax Information</h2>
              <p className="mb-4">
                We collect and store earnings information to comply with Nigerian tax regulations and provide 
                you with accurate earnings reports:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Bank account details for payments (encrypted and secure)</li>
                <li>Tax identification numbers as required by law</li>
                <li>Earnings history for tax reporting purposes</li>
                <li>Transaction records for dispute resolution</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Sharing & Third Parties</h2>
              <p className="mb-4">We only share your data in these limited circumstances:</p>
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <ul className="space-y-2">
                  <li><strong>Payment processors:</strong> To process your earnings (with minimal necessary data)</li>
                  <li><strong>Legal requirements:</strong> When required by Nigerian law or valid legal requests</li>
                  <li><strong>Safety measures:</strong> To investigate fraud, abuse, or terms of service violations</li>
                  <li><strong>Service providers:</strong> Trusted partners who help us operate the platform (under strict agreements)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="mb-4">
                For privacy-related questions or to exercise your rights, contact our privacy team:
              </p>
              <div className="bg-white/10 rounded-xl p-4">
                <p><strong>Email:</strong> privacy@hooks.ng</p>
                <p><strong>Response time:</strong> Within 48 hours for privacy requests</p>
                <p><strong>Data Protection Officer:</strong> Available for EU residents</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/privacy/fans")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Fan Privacy Policy
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/terms")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Terms of Service
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/earnings-info")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Earnings Information
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyCreators;