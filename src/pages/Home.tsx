import { Link } from "react-router-dom";
import { ShieldCheck, TrendingUp, ShoppingBag, MessageSquare, CloudSun, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  const stats = [
    { icon: Users, label: "Active Users", value: "5,000+", color: "text-success" },
    { icon: ShoppingBag, label: "Market Listings", value: "12,000+", color: "text-info" },
    { icon: ShieldCheck, label: "Quality Checks", value: "25,000+", color: "text-premium" },
    { icon: CloudSun, label: "Weather Reports", value: "15,000+", color: "text-accent" },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: "Quality Checking",
      description: "AI-powered quality assessment for crops, livestock, and dairy products",
      gradient: "bg-gradient-quality",
      link: "/quality-checking"
    },
    {
      icon: CloudSun,
      title: "Weather Analysis",
      description: "Smart weather insights and farming recommendations based on conditions",
      gradient: "bg-gradient-weather",
      link: "/weather-analysis"
    },
    {
      icon: TrendingUp,
      title: "Market Advisor",
      description: "Real-time market intelligence and price recommendations",
      gradient: "bg-gradient-market",
      link: "/market-advisor"
    },
    {
      icon: ShoppingBag,
      title: "AgriMarket",
      description: "Peer-to-peer marketplace connecting farmers directly with buyers",
      gradient: "bg-gradient-marketplace",
      link: "/marketplace"
    },
    {
      icon: MessageSquare,
      title: "AgriBot Assistant",
      description: "24/7 AI farming assistant for all your agricultural questions",
      gradient: "bg-gradient-agribot",
      link: "/agribot"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-primary py-20 px-6 lg:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="container relative mx-auto max-w-6xl text-center">
          {user && profile && (
            <p className="mb-4 text-white/90 text-lg">
              Welcome back, {profile.full_name}! 👋
            </p>
          )}
          <h1 className="mb-6 text-4xl font-bold text-white lg:text-6xl">
            Smart Quality. Smart Markets.
            <br />
            <span className="text-white/90">Smart Africa.</span>
          </h1>
          <p className="mb-8 text-lg text-white/80 lg:text-xl max-w-3xl mx-auto">
            AI-powered agricultural platform empowering African farmers and buyers with quality checking,
            market intelligence, and peer-to-peer trading
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link to="/marketplace">
                  Explore Marketplace <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" variant="secondary">
                  <Link to="/login">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <Link to="/marketplace">Browse Market</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center space-y-2">
                    <Icon className={`h-8 w-8 mx-auto ${stat.color}`} />
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features for Smart Farming</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to make data-driven agricultural decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Link key={idx} to={feature.link}>
                  <Card className="h-full border-none shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                    <div className={`h-2 ${feature.gradient}`}></div>
                    <CardContent className="p-6 space-y-4">
                      <div className={`w-12 h-12 rounded-xl ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                      <div className="flex items-center gap-2 text-primary font-medium">
                        Explore <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Farm or Business?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Join thousands of farmers and buyers making smarter agricultural decisions
          </p>
          {user ? (
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link to="/quality-checking">
                Start Using Tools <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" variant="secondary">
              <Link to="/login">Sign Up Now</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-card border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Our Mission</li>
                <li>How It Works</li>
                <li>Team</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Quality Checking</li>
                <li>Market Intelligence</li>
                <li>AgriBot</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Contact Us</li>
                <li>Careers</li>
                <li>Partners</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Twitter</li>
                <li>Facebook</li>
                <li>WhatsApp</li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © 2024 AgriFusion AI Lite by <span className="text-success font-medium">CODEXA</span>.
              Powered by <span className="text-muted-foreground">SwizFusion Technologies</span>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}