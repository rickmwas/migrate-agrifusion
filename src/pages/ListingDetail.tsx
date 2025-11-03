import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, User, Package } from "lucide-react";
import { toast } from "sonner";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('market_listings')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error) {
      toast.error("Failed to load listing");
    } else {
      setListing(data);
    }
    setLoading(false);
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

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
          <p className="text-muted-foreground mb-6">The listing you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/marketplace">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/marketplace">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={categoryColors[listing.category] || "bg-muted"}>
                {listing.category}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Listed {new Date(listing.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Image */}
        {listing.image_url && (
          <Card>
            <CardContent className="p-0">
              <img
                src={listing.image_url}
                alt={listing.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        )}

        {/* Price and Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-success">
                  KSh {Number(listing.price).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">per {listing.unit}</p>
              </div>

              {listing.quantity_available && (
                <div>
                  <p className="font-medium">Available Quantity</p>
                  <p className="text-muted-foreground">{listing.quantity_available} {listing.unit}s</p>
                </div>
              )}

              <div>
                <p className="font-medium">Location</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{listing.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">{listing.seller_name}</p>
                <p className="text-sm text-muted-foreground">Verified Seller</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">Contact Options</p>

                {listing.seller_phone && (
                  <Button
                    className="w-full justify-start gap-2"
                    onClick={() => window.location.href = `tel:${listing.seller_phone}`}
                  >
                    <Phone className="h-4 w-4" />
                    Call {listing.seller_phone}
                  </Button>
                )}

                {listing.seller_email && (
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => window.location.href = `mailto:${listing.seller_email}`}
                  >
                    <Mail className="h-4 w-4" />
                    Email Seller
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {listing.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Listing ID</p>
                <p className="text-muted-foreground font-mono">{listing.id}</p>
              </div>
              <div>
                <p className="font-medium">Last Updated</p>
                <p className="text-muted-foreground">{new Date(listing.updated_at || listing.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
