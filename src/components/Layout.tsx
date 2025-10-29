import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, ShieldCheck, CloudSun, TrendingUp, ShoppingBag, MessageSquare, User, LogOut, Menu, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { title: "Home", url: "/", icon: Home, forAll: true },
    { title: "Quality Checking", url: "/quality-checking", icon: ShieldCheck, forAll: true },
    { title: "Weather Analysis", url: "/weather-analysis", icon: CloudSun, forAll: true },
    { title: "Market Advisor", url: "/market-advisor", icon: TrendingUp, forAll: true },
    { title: "AgriMarket", url: "/marketplace", icon: ShoppingBag, forAll: true },
    { title: "AgriBot", url: "/agribot", icon: MessageSquare, forAll: true },
    { title: "Profile", url: "/profile", icon: User, requireAuth: true },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b border-border p-6">
        <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sprout className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AgriFusion
            </h1>
            <p className="text-xs text-muted-foreground">AI Lite</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          if (item.requireAuth && !user) return null;
          
          const isActive = location.pathname === item.url;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.url}
              to={item.url}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                isActive
                  ? "bg-gradient-primary text-white shadow-lg"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4 space-y-4">
        {user && profile ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-muted p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{profile.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className={`w-full justify-center ${
                  profile.user_type === 'farmer' ? 'bg-success/10 text-success' : 'bg-info/10 text-info'
                }`}
              >
                {profile.user_type === 'farmer' ? '🌾 Farmer' : '🛒 Buyer'}
              </Badge>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <Button asChild className="w-full bg-gradient-primary">
            <Link to="/login">Login / Sign Up</Link>
          </Button>
        )}
        
        <div className="text-center space-y-1">
          <p className="text-xs text-success font-medium">by CODEXA</p>
          <p className="text-xs text-muted-foreground">SwizFusion Technologies</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 border-r border-border bg-card/50 backdrop-blur-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold">AgriFusion</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {profile && (
              <Badge variant="secondary" className="text-xs">
                {profile.user_type === 'farmer' ? '🌾' : '🛒'}
              </Badge>
            )}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:pl-0 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}