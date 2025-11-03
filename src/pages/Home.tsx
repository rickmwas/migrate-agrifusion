import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldCheck,
  CloudSun,
  TrendingUp,
  ShoppingBag,
  MessageSquare,
  Users,
  FileCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "User",
          user_type: user.user_metadata?.user_type || "user"
        };
      } catch {
        return null;
      }
    },
  });

  const features = [
    {
      icon: ShieldCheck,
      title: "Quality Checking",
      description: "AI-powered visual analysis to grade your produce and get market-ready insights",
      gradient: "from-green-600 to-emerald-600",
      link: "QualityChecking",
    },
    {
      icon: CloudSun,
      title: "Weather Analysis",
      description: "Real-time weather data with AI farming recommendations based on conditions",
      gradient: "from-blue-600 to-cyan-600",
      link: "WeatherAnalysis",
    },
    {
      icon: TrendingUp,
      title: "Market Advisor",
      description: "Get intelligent pricing recommendations based on real-time market conditions",
      gradient: "from-emerald-600 to-teal-600",
      link: "MarketAdvisor",
    },
    {
      icon: ShoppingBag,
      title: "AgriMarket",
      description: "Connect directly with buyers and sellers in a peer-to-peer marketplace",
      gradient: "from-purple-600 to-pink-600",
      link: "Marketplace",
    },
  ];

  const stats = [
    { icon: Users, label: "Active Users", value: "5,000+", color: "text-green-600" },
    { icon: ShoppingBag, label: "Market Listings", value: "12,000+", color: "text-blue-600" },
    { icon: FileCheck, label: "Quality Checks", value: "25,000+", color: "text-purple-600" },
    { icon: CloudSun, label: "Weather Reports", value: "15,000+", color: "text-cyan-600" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 px-6 py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          {user && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <p className="text-lg text-gray-600">
                Welcome back, <span className="font-semibold text-green-600">{user.full_name}</span>! 👋
              </p>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight"
          >
            Smart Quality. Smart Markets.
            <br />Smart Africa.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered platform empowering African farmers and buyers with intelligent farming insights
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to={createPageUrl("QualityChecking")}>
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Using Tools
                </Button>
              </Link>
            ) : (
              <Link to={createPageUrl("Profile")}>
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <stat.icon className={`w-10 h-10 mx-auto mb-3 ${stat.color}`} />
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features for Modern Farming</h2>
            <p className="text-xl text-gray-600">Everything you need to make smarter farming decisions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                <Link to={createPageUrl(feature.link)}>
                  <Card className="h-full border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <div className="flex items-center text-green-600 font-medium group-hover:translate-x-2 transition-transform">
                        Explore <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AgriBot CTA */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white overflow-hidden">
            <CardContent className="p-8 md:p-12 relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
              <div className="relative">
                <MessageSquare className="w-12 h-12 mb-4" />
                <h3 className="text-3xl font-bold mb-4">Meet AgriBot - Your 24/7 Farming Assistant</h3>
                <p className="text-xl mb-6 text-blue-100">Get instant answers to all your farming questions, from crop selection to pest control</p>
                <Link to={createPageUrl("AgriBot")}>
                  <Button size="lg" variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100">
                    Chat with AgriBot
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Transform Your {user?.user_type === 'farmer' ? 'Farm' : 'Business'}?</h2>
          <p className="text-xl mb-8 text-green-100">Join thousands of farmers and buyers making smarter decisions every day</p>
          {!user && (
            <Link to={createPageUrl("Profile")}>
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-xl">
                Sign Up Now - It's Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">About</h4>
              <ul className="space-y-2">
                <li>About AgriFusion</li>
                <li>Our Mission</li>
                <li>Team CODEXA</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Features</h4>
              <ul className="space-y-2">
                <li>Quality Checking</li>
                <li>Weather Analysis</li>
                <li>Market Advisor</li>
                <li>AgriMarket</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>SwizFusion Technologies</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li>Twitter</li>
                <li>LinkedIn</li>
                <li>Facebook</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>© 2024 AgriFusion AI Lite by <span className="text-green-500">AgriFusion AI</span>. Powered by <span className="text-blue-500">AgriFusion Technologies</span>.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}