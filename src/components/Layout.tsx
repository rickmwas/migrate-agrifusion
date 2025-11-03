import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, ShieldCheck, CloudSun, TrendingUp, ShoppingBag, MessageSquare, User, LogOut, Menu, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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

  const AppSidebar = () => (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="border-b border-border p-6">
          <Link to="/" className="flex items-center gap-3">
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
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                if (item.requireAuth && !user) return null;

                const isActive = location.pathname === item.url;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
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
      </SidebarFooter>
    </Sidebar>
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <div className="flex items-center gap-2 p-4 border-b border-border lg:hidden">
          <SidebarTrigger />
          {profile && (
            <Badge variant="secondary" className="text-xs">
              {profile.user_type === 'farmer' ? '🌾' : '🛒'}
            </Badge>
          )}
        </div>
        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}