import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { TrendingUp, DollarSign, Calendar, CreditCard, Shield, Users } from "lucide-react";
import HookLogo from "@/components/HookLogo";

const EarningsInfo = () => {
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

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6 font-playfair">Earnings & Payout System</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Transparent, fair, and creator-first. Learn how Hooks empowers creators with industry-leading revenue sharing and secure payouts.
          </p>
        </div>

        {/* Revenue Share Highlight */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-green-500/30">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-2">80% Revenue Share</h2>
            <p className="text-xl text-white/90 mb-4">Keep more of what you earn - industry-leading creator revenue share</p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-300 mb-2">₦800</div>
                <div className="text-white/80">You keep from every ₦1,000</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white/60 mb-2">₦150</div>
                <div className="text-white/60">Platform operations & support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white/60 mb-2">₦50</div>
                <div className="text-white/60">Payment processing fees</div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Streams */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 font-playfair">Revenue Streams</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Users className="w-8 h-8 text-blue-300 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Monthly Subscriptions</h3>
                  <p className="text-white/80 text-sm">Recurring revenue from dedicated fans. Set your own pricing from ₦500 to ₦50,000 per month.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <DollarSign className="w-8 h-8 text-green-300 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Pay-Per-View Content</h3>
                  <p className="text-white/80 text-sm">Premium content with one-time pricing from ₦100 to ₦10,000 per piece.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <TrendingUp className="w-8 h-8 text-yellow-300 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Tips & Appreciation</h3>
                  <p className="text-white/80 text-sm">Direct support from fans with custom tip amounts and messages.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <CreditCard className="w-8 h-8 text-purple-300 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Custom Requests</h3>
                  <p className="text-white/80 text-sm">Personalized content commissions with your own pricing structure.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 font-playfair">Payout Schedule</h2>
            <div className="space-y-6">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-6 h-6 text-green-300" />
                  <h3 className="text-lg font-semibold text-white">Weekly Payouts</h3>
                </div>
                <p className="text-white/80 text-sm">Get paid every Friday for the previous week's earnings (minimum ₦5,000).</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-300" />
                  <h3 className="text-lg font-semibold text-white">Instant Payouts</h3>
                </div>
                <p className="text-white/80 text-sm">Premium creators can request instant payouts for a small fee (₦200).</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="w-6 h-6 text-yellow-300" />
                  <h3 className="text-lg font-semibold text-white">Hold Period</h3>
                </div>
                <p className="text-white/80 text-sm">7-day hold period for new accounts to prevent fraud and chargebacks.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payout Methods */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 font-playfair text-center">Payout Methods</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-green-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Bank Transfer</h3>
              <p className="text-white/80 text-sm">Direct deposits to all major Nigerian banks. Free for amounts over ₦10,000.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Mobile Money</h3>
              <p className="text-white/80 text-sm">Instant payouts to Opay, PalmPay, and other mobile wallets.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Crypto Payouts</h3>
              <p className="text-white/80 text-sm">USDT and BTC payouts for international creators (coming soon).</p>
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 font-playfair">Tax Compliance</h2>
            <div className="space-y-4">
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-2">Nigerian Tax Requirements</h3>
                <p className="text-white/80 text-sm">We provide annual tax documents (1099-equivalent) for all creators earning over ₦500,000 annually.</p>
              </div>
              
              <ul className="space-y-2 text-white/90">
                <li>• Automatic tax document generation</li>
                <li>• Monthly earnings statements</li>
                <li>• Expense tracking tools</li>
                <li>• FIRS compliance support</li>
              </ul>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6 font-playfair">Creator Support</h2>
            <div className="space-y-4">
              <p className="text-white/90">Our dedicated creator success team helps you maximize your earnings:</p>
              
              <ul className="space-y-2 text-white/90">
                <li>• Personalized earnings optimization</li>
                <li>• Content strategy consultation</li>
                <li>• Marketing and promotion guidance</li>
                <li>• 24/7 payout support</li>
                <li>• Priority customer service</li>
              </ul>
              
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mt-4">
                <p className="text-white/90 text-sm"><strong>Top Creators:</strong> Earn over ₦2M monthly with our premium creator program and dedicated account management.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Safety */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 font-playfair text-center">Security & Safety</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <Shield className="w-12 h-12 text-blue-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Bank-Grade Security</h3>
              <p className="text-white/80 text-sm">256-bit encryption and PCI DSS compliance</p>
            </div>
            
            <div className="text-center">
              <CreditCard className="w-12 h-12 text-green-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Fraud Protection</h3>
              <p className="text-white/80 text-sm">Advanced AI fraud detection and prevention</p>
            </div>
            
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-yellow-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Chargeback Protection</h3>
              <p className="text-white/80 text-sm">We handle disputes and protect your earnings</p>
            </div>
            
            <div className="text-center">
              <Users className="w-12 h-12 text-purple-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
              <p className="text-white/80 text-sm">Round-the-clock assistance for payment issues</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-hooks-coral/20 to-hooks-pink/20 backdrop-blur-sm rounded-2xl p-8 border border-hooks-coral/30">
            <h2 className="text-3xl font-bold text-white mb-4 font-playfair">Ready to Start Earning?</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Join thousands of creators already earning on Hooks. Set up your profile, upload your content, and start monetizing your audience today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 font-semibold"
              >
                Start Creating Today
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/privacy/creators")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Creator Privacy Policy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsInfo;