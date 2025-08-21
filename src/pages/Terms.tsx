import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import HookLogo from "@/components/HookLogo";

const Terms = () => {
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
          <h1 className="text-4xl font-bold text-white mb-6 font-playfair">Terms of Service</h1>
          <p className="text-white/80 mb-8 text-sm">Last updated: December 2024 | Effective Date: January 1, 2025</p>

          <div className="space-y-8 text-white/90">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
              <p className="mb-4">
                By accessing or using the Hooks platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree to these Terms, do not use our Service.
              </p>
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                <p><strong>Important:</strong> You must be at least 18 years old to use Hooks. By using our service, you represent and warrant that you are of legal age.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Platform Overview</h2>
              <p className="mb-4">
                Hooks is a creator economy platform that enables content creators to monetize their work through:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
                <li>Monthly subscription services</li>
                <li>Pay-per-view content</li>
                <li>Direct tips and appreciation</li>
                <li>Custom content requests</li>
                <li>Direct messaging and interactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration & Verification</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Account Requirements</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Provide accurate, current information</li>
                    <li>Maintain security of your account credentials</li>
                    <li>Must be 18+ years old with valid ID</li>
                    <li>One account per person</li>
                    <li>Comply with Nigerian laws and regulations</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Creator Verification</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Valid government-issued ID required</li>
                    <li>Bank account verification for payouts</li>
                    <li>Profile photo matching ID document</li>
                    <li>Compliance with content guidelines</li>
                    <li>Tax identification for earnings over ₦500,000</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Content Guidelines & Restrictions</h2>
              
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">✓ Allowed Content</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Original creative content (photography, videos, art, music)</li>
                  <li>Educational and tutorial content</li>
                  <li>Behind-the-scenes and lifestyle content</li>
                  <li>Adult content (18+ only, properly tagged)</li>
                  <li>Fashion and modeling content</li>
                </ul>
              </div>

              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-2">✗ Prohibited Content</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Illegal activities or content violating Nigerian law</li>
                  <li>Non-consensual intimate content (revenge porn)</li>
                  <li>Content involving minors in any sexual context</li>
                  <li>Extreme violence or harm to others</li>
                  <li>Copyright infringement or stolen content</li>
                  <li>Harassment, hate speech, or discrimination</li>
                  <li>Scams, pyramid schemes, or fraudulent activities</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Creator Rights & Responsibilities</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Your Rights</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Retain ownership of your original content</li>
                    <li>Set your own pricing and subscription tiers</li>
                    <li>Control access to your content</li>
                    <li>Receive 80% of all earnings</li>
                    <li>Delete or modify content at any time</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Your Responsibilities</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Comply with all applicable laws</li>
                    <li>Respect fan privacy and boundaries</li>
                    <li>Provide content as advertised</li>
                    <li>Respond to fan inquiries professionally</li>
                    <li>Report inappropriate user behavior</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibent text-white mb-4">6. Payment Terms & Revenue Sharing</h2>
              
              <div className="bg-white/10 rounded-xl p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-300 mb-1">80%</div>
                    <div className="text-sm">Creator Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white/60 mb-1">15%</div>
                    <div className="text-sm">Platform Operations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white/60 mb-1">5%</div>
                    <div className="text-sm">Payment Processing</div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">Payment Schedule</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Weekly payouts every Friday (minimum ₦5,000)</li>
                  <li>7-day hold period for new creators (fraud prevention)</li>
                  <li>Instant payouts available for premium creators (₦200 fee)</li>
                  <li>All payouts subject to Nigerian tax regulations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Fan Terms & Conduct</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Fan Rights</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Access purchased content as advertised</li>
                    <li>Privacy protection for your activities</li>
                    <li>Fair dispute resolution process</li>
                    <li>Cancel subscriptions at any time</li>
                    <li>Block or report inappropriate creators</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Prohibited Fan Conduct</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Sharing or distributing creator content</li>
                    <li>Harassment or stalking of creators</li>
                    <li>Chargebacks for legitimate purchases</li>
                    <li>Creating fake accounts or impersonation</li>
                    <li>Attempting to contact creators outside platform</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Intellectual Property & DMCA</h2>
              <p className="mb-4">
                Hooks respects intellectual property rights and complies with the Nigerian Copyright Act and DMCA.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Report copyright infringement to: legal@hooks.ng</li>
                <li>Include specific details about the infringed content</li>
                <li>Repeated violations may result in account termination</li>
                <li>Counter-notifications accepted for legitimate disputes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Platform Policies & Enforcement</h2>
              
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Violation Consequences</h3>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li><strong>First violation:</strong> Warning and content removal</li>
                  <li><strong>Second violation:</strong> 7-day account suspension</li>
                  <li><strong>Severe violations:</strong> Immediate permanent ban</li>
                  <li><strong>Legal violations:</strong> Account termination and law enforcement reporting</li>
                </ul>
              </div>

              <p className="text-sm">
                We reserve the right to suspend or terminate accounts that violate these Terms, 
                with or without notice, depending on the severity of the violation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <p className="mb-2">
                  <strong>Hooks provides the platform "as is" and disclaims all warranties.</strong> 
                  We are not liable for:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>User-generated content or interactions between users</li>
                  <li>Loss of earnings due to platform downtime or technical issues</li>
                  <li>Third-party payment processor failures</li>
                  <li>Actions of other users on the platform</li>
                  <li>Content disputes between creators and fans</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Governing Law & Disputes</h2>
              <p className="mb-4">
                These Terms are governed by Nigerian law. Any disputes will be resolved through:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>First, our internal mediation process</li>
                <li>If unresolved, binding arbitration in Lagos, Nigeria</li>
                <li>Courts of Lagos State for matters not subject to arbitration</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Information</h2>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="mb-2"><strong>Legal Questions:</strong> legal@hooks.ng</p>
                <p className="mb-2"><strong>Support:</strong> support@hooks.ng</p>
                <p className="mb-2"><strong>Address:</strong> Hooks Digital Services Ltd, Lagos, Nigeria</p>
                <p><strong>Phone:</strong> +234-XXX-XXXX</p>
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
                Privacy Policy
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/community-guidelines")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Community Guidelines
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

export default Terms;