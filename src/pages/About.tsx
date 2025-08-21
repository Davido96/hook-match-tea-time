import { Button } from "@/components/ui/button";
import { Heart, Shield, TrendingUp, Users, Star, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import HookLogo from "@/components/HookLogo";

const About = () => {
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
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/privacy/creators" className="text-white/80 hover:text-white transition-colors">Creator Privacy</Link>
            <Link to="/privacy/fans" className="text-white/80 hover:text-white transition-colors">Fan Privacy</Link>
            <Link to="/earnings-info" className="text-white/80 hover:text-white transition-colors">Earnings</Link>
            <Link to="/terms" className="text-white/80 hover:text-white transition-colors">Terms</Link>
            <Link to="/community-guidelines" className="text-white/80 hover:text-white transition-colors">Guidelines</Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/")}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6 font-playfair">About Hooks</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Empowering Nigeria's creator economy with safe, authentic connections and 
            fair monetization opportunities for content creators and their fans.
          </p>
        </div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <Star className="w-8 h-8 text-yellow-300 mr-3" />
              <h2 className="text-3xl font-bold text-white font-playfair">Our Vision</h2>
            </div>
            <p className="text-white/90 text-lg leading-relaxed">
              To become Africa's leading platform where creators can build sustainable businesses 
              while fostering genuine connections with their audience. We envision a future where 
              every creative individual has the tools and platform to monetize their talent fairly.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <Heart className="w-8 h-8 text-red-300 mr-3" />
              <h2 className="text-3xl font-bold text-white font-playfair">Our Mission</h2>
            </div>
            <p className="text-white/90 text-lg leading-relaxed">
              To democratize the creator economy by providing a safe, transparent platform 
              where creators keep 80% of their earnings, build authentic relationships with 
              fans, and have complete control over their content and pricing.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-12 font-playfair">What Makes Us Different</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
              <TrendingUp className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">80% Creator Revenue</h3>
              <p className="text-white/80">Industry-leading revenue share ensuring creators get maximum value for their work</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
              <Shield className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Safety First</h3>
              <p className="text-white/80">Verified profiles, secure payments, and robust content moderation for peace of mind</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
              <Users className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">African Focus</h3>
              <p className="text-white/80">Built specifically for the Nigerian market with local payment solutions and cultural understanding</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300">
              <Zap className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Creator Control</h3>
              <p className="text-white/80">Complete autonomy over pricing, content, and fan interactions with powerful creator tools</p>
            </div>
          </div>
        </div>

        {/* Platform Safety */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 font-playfair text-center">Platform Safety & Trust</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Verified Profiles</h3>
              <p className="text-white/80">All creators go through our verification process to ensure authenticity and safety</p>
            </div>
            <div className="text-center">
              <Users className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Content Moderation</h3>
              <p className="text-white/80">AI-powered and human-reviewed content moderation to maintain community standards</p>
            </div>
            <div className="text-center">
              <Heart className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Secure Payments</h3>
              <p className="text-white/80">Bank-grade security for all transactions with transparent fee structure</p>
            </div>
          </div>
        </div>

        {/* Creator Support */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6 font-playfair">How We Empower Creators</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">Revenue Streams</h3>
                <ul className="text-white/90 text-left space-y-2">
                  <li>• Monthly subscriptions from dedicated fans</li>
                  <li>• Pay-per-view exclusive content</li>
                  <li>• Direct tips and appreciation messages</li>
                  <li>• Custom content requests and commissions</li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">Creator Tools</h3>
                <ul className="text-white/90 text-left space-y-2">
                  <li>• Advanced analytics and earnings dashboard</li>
                  <li>• Flexible pricing and subscription tiers</li>
                  <li>• Direct messaging with fans</li>
                  <li>• Content scheduling and management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4 font-playfair">Questions or Concerns?</h2>
            <p className="text-white/90 mb-6">
              We're here to help. Reach out to our support team or explore our comprehensive policy pages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                onClick={() => navigate("/privacy/creators")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Creator Policies
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/earnings-info")}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Earnings Info
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

export default About;