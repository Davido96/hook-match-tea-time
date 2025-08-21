import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import HookLogo from "@/components/HookLogo";

const PrivacyFans = () => {
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
          <h1 className="text-4xl font-bold text-white mb-6 font-playfair">Fan Privacy Policy</h1>
          <p className="text-white/80 mb-8 text-sm">Last updated: December 2024</p>

          <div className="space-y-8 text-white/90">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Your Privacy Matters</h2>
              <p className="mb-4">
                As a fan on Hooks, we understand you value your privacy when engaging with creators. 
                We're committed to protecting your personal information and being transparent about 
                how we use your data.
              </p>
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                <p><strong>Key Promise:</strong> Your interactions with creators are private by default. 
                We never share your activity or personal information with other users unless you choose to make it public.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Account & Profile</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Email address and phone number</li>
                    <li>Profile photo and display name (optional)</li>
                    <li>Age verification for content access</li>
                    <li>Location (city/state only for matching)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Activity & Preferences</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Subscriptions and content purchases</li>
                    <li>Messages with creators</li>
                    <li>Content views and interactions</li>
                    <li>Search and browsing history</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">How We Keep You Safe</h2>
              <div className="bg-white/10 rounded-xl p-6">
                <ul className="space-y-3">
                  <li><strong>Anonymous browsing:</strong> Creators can't see who viewed their profiles unless you interact</li>
                  <li><strong>Private messaging:</strong> Only you and the creator can see your conversations</li>
                  <li><strong>Secure payments:</strong> We never store your full payment details</li>
                  <li><strong>No public activity:</strong> Your subscriptions and purchases are never displayed publicly</li>
                  <li><strong>Block & report tools:</strong> Easy tools to block users and report inappropriate behavior</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">What Creators Can See</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">✓ Visible to Creators</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Your display name and profile photo</li>
                    <li>Messages you send to them</li>
                    <li>Tips and interactions you make</li>
                    <li>When you subscribe to their content</li>
                  </ul>
                </div>
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">✗ Hidden from Creators</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Your real name and contact information</li>
                    <li>Other creators you follow or subscribe to</li>
                    <li>Your browsing history and search activity</li>
                    <li>Payment methods and transaction details</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Your Control Options</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Privacy Controls</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Hide your online status from creators</li>
                    <li>Control who can message you</li>
                    <li>Set spending limits and budgets</li>
                    <li>Customize notification preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Account Management</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Download all your data</li>
                    <li>Delete your account and all data</li>
                    <li>Cancel subscriptions anytime</li>
                    <li>Update or correct your information</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Payment & Financial Privacy</h2>
              <p className="mb-4">Your financial information is protected with the highest security standards:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Secure processors:</strong> We use bank-grade payment processors (Paystack, Flutterwave)</li>
                <li><strong>No storage:</strong> We never store your full card details or bank information</li>
                <li><strong>Discretion:</strong> Charges appear as "Hooks Digital Services" on your statements</li>
                <li><strong>Fraud protection:</strong> Advanced fraud detection to protect your accounts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Sharing & Third Parties</h2>
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-4">
                <p><strong>We never sell your data.</strong> Your information is only shared in these limited cases:</p>
              </div>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Payment processing:</strong> Minimal data shared with payment processors</li>
                <li><strong>Legal compliance:</strong> When required by Nigerian law or court orders</li>
                <li><strong>Safety & security:</strong> To investigate fraud or protect user safety</li>
                <li><strong>Technical services:</strong> Trusted partners who help operate the platform (under strict agreements)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Age Verification & Content Access</h2>
              <p className="mb-4">
                To access adult content on Hooks, we require age verification to comply with Nigerian laws:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Age verification documents are encrypted and stored securely</li>
                <li>Verification data is only used to confirm eligibility</li>
                <li>Documents are deleted after verification (except as required by law)</li>
                <li>Parental controls available for younger users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact & Support</h2>
              <p className="mb-4">
                Questions about your privacy or need to exercise your rights? We're here to help:
              </p>
              <div className="bg-white/10 rounded-xl p-4">
                <p><strong>Privacy Email:</strong> privacy@hooks.ng</p>
                <p><strong>Support Chat:</strong> Available 24/7 in the app</p>
                <p><strong>Response Time:</strong> Within 24 hours for privacy matters</p>
                <p><strong>Phone Support:</strong> +234-XXX-XXXX (for urgent privacy concerns)</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/privacy/creators")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Creator Privacy Policy
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
                onClick={() => navigate("/community-guidelines")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Community Guidelines
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyFans;