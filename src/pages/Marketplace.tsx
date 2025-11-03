import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Phone, Mail, MapPin, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function Marketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [profile, setProfile] = useState<any>(null);

  const categories = ["all", "crops", "livestock", "dairy", "poultry", "seeds", "equipment", "other"];

  useEffect(() => {
    fetchProfile();
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [searchQuery, activeCategory, listings]);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      setProfile(data);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('market_listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load listings");
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  const filterListings = () => {
    let filtered = listings;

    if (activeCategory !== "all") {
      filtered = filtered.filter(listing => listing.category === activeCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  };

  const categoryColors: Record<string, string> = {
    crops: "bg-success/10 text-success",
    livestock: "bg-warning/10 text-warning",
    dairy: "bg-info/10 text-info",
    poultry: "bg-grade-c/10 text-grade-c",
    seeds: "bg-premium/10 text-premium",
    equipment: "bg-accent/10 text-accent",
    other: "bg-muted text-muted-foreground",
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">AgriMarket</h1>
              <p className="text-muted-foreground">Browse fresh produce and products from local farmers</p>
            </div>
            {profile?.user_type === 'farmer' && (
              <Button asChild className="bg-gradient-marketplace">
                <Link to="/add-listing">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Listing
                </Link>
              </Button>
            )}
          </div>

          {/* Search & Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-xl capitalize ${activeCategory === category ? 'bg-gradient-marketplace' : ''}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-96 animate-pulse bg-muted" />
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Link key={listing.id} to={`/listing/${listing.id}`}>
                  <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
                    {listing.image_url && (
                      <img
                        src={listing.image_url}
                        alt={listing.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-xl line-clamp-1">{listing.title}</h3>
                          <Badge className={categoryColors[listing.category] || "bg-muted"}>
                            {listing.category}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-success">
                          KSh {Number(listing.price).toLocaleString()}
                          <span className="text-sm text-muted-foreground"> / {listing.unit}</span>
                        </p>
                        {listing.quantity_available && (
                          <p className="text-sm text-muted-foreground">
                            Available: {listing.quantity_available} {listing.unit}s
                          </p>
                        )}
                      </div>

                      {listing.description && (
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {listing.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {listing.location}
                      </div>

                      <div className="space-y-2 pt-2">
                        <p className="text-sm font-medium">Seller: {listing.seller_name}</p>
                        <div className="flex gap-2">
                          {listing.seller_phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `tel:${listing.seller_phone}`;
                              }}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              Call
                            </Button>
                          )}
                          {listing.seller_email && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `mailto:${listing.seller_email}`;
                              }}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-bold mb-2">No listings found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || activeCategory !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Be the first to add a listing!"}
              </p>
              {profile?.user_type === 'farmer' && (
                <Button asChild className="bg-gradient-marketplace">
                  <Link to="/add-listing">
                    <Plus className="mr-2 h-5 w-5" />
                    Add Your First Listing
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}