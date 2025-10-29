import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Loader2, X } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    full_name: "",
    user_type: "buyer",
    location: "",
    phone_number: "",
    farm_name: "",
    farm_type: null,
    farm_size: "",
    primary_crops: [],
    business_name: "",
    purchase_interests: [],
  });
  const [cropInput, setCropInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setUser(session.user);
    await fetchProfile(session.user.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        user_type: data.user_type || "buyer",
        location: data.location || "",
        phone_number: data.phone_number || "",
        farm_name: data.farm_name || "",
        farm_type: data.farm_type || null,
        farm_size: data.farm_size || "",
        primary_crops: data.primary_crops || [],
        business_name: data.business_name || "",
        purchase_interests: data.purchase_interests || [],
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const addCrop = () => {
    if (cropInput.trim() && !profile.primary_crops.includes(cropInput.trim())) {
      setProfile({
        ...profile,
        primary_crops: [...profile.primary_crops, cropInput.trim()]
      });
      setCropInput("");
    }
  };

  const removeCrop = (crop: string) => {
    setProfile({
      ...profile,
      primary_crops: profile.primary_crops.filter((c: string) => c !== crop)
    });
  };

  const addInterest = () => {
    if (interestInput.trim() && !profile.purchase_interests.includes(interestInput.trim())) {
      setProfile({
        ...profile,
        purchase_interests: [...profile.purchase_interests, interestInput.trim()]
      });
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setProfile({
      ...profile,
      purchase_interests: profile.purchase_interests.filter((i: string) => i !== interest)
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen p-6 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>

          {/* User Type Selection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Account Type</CardTitle>
              <CardDescription>Select your role in the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={profile.user_type} onValueChange={(value) => setProfile({ ...profile, user_type: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">🌾 I am a Farmer</SelectItem>
                  <SelectItem value="buyer">🛒 I am a Buyer</SelectItem>
                </SelectContent>
              </Select>
              <div className="p-4 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Changing your account type affects which features you can access throughout the app.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="rounded-xl bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone_number}
                  onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                  placeholder="+254 712 345 678"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="e.g., Nairobi, Nakuru"
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Conditional Farmer/Buyer Fields */}
          {profile.user_type === 'farmer' ? (
            <Card className="shadow-lg border-success/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌾 Farm Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="farmName">Farm Name</Label>
                  <Input
                    id="farmName"
                    value={profile.farm_name}
                    onChange={(e) => setProfile({ ...profile, farm_name: e.target.value })}
                    placeholder="Green Valley Farm"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmType">Farm Type</Label>
                  <Select value={profile.farm_type || ""} onValueChange={(value) => setProfile({ ...profile, farm_type: value })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select farm type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crops">Crops</SelectItem>
                      <SelectItem value="livestock">Livestock</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="poultry">Poultry</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmSize">Farm Size</Label>
                  <Input
                    id="farmSize"
                    value={profile.farm_size}
                    onChange={(e) => setProfile({ ...profile, farm_size: e.target.value })}
                    placeholder="e.g., 5 acres"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary Crops/Products</Label>
                  <div className="flex gap-2">
                    <Input
                      value={cropInput}
                      onChange={(e) => setCropInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCrop())}
                      placeholder="e.g., Maize, Beans"
                      className="rounded-xl"
                    />
                    <Button type="button" onClick={addCrop} className="rounded-xl">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.primary_crops.map((crop: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                        {crop}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full"
                          onClick={() => removeCrop(crop)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-info/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🛒 Buying Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business/Company Name (Optional)</Label>
                  <Input
                    id="businessName"
                    value={profile.business_name}
                    onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                    placeholder="Fresh Produce Ltd"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Products I Buy</Label>
                  <div className="flex gap-2">
                    <Input
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                      placeholder="e.g., Maize, Tomatoes"
                      className="rounded-xl"
                    />
                    <Button type="button" onClick={addInterest} className="rounded-xl">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.purchase_interests.map((interest: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                        {interest}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full"
                          onClick={() => removeInterest(interest)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-primary rounded-xl text-lg py-6"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}