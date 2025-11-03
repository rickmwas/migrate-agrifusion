import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AddListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', price: '', unit: 'kg', category: 'crops', city: '', quantity_available: '' });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = ["crops","livestock","dairy","poultry","seeds","equipment","other"];

  const handleUploadAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      // Fetch user profile for seller information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, phone_number')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      let imageUrl = null;
      if (image) {
        const fileName = `${Date.now()}_${image.name}`;
        const { error: uploadError } = await supabase.storage.from('public/listings').upload(fileName, image, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('public/listings').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      const insert = {
        seller_id: session.user.id,
        title: form.title,
        description: form.description,
        price: form.price || null,
        unit: form.unit,
        category: form.category,
        location: form.city, // Changed from city to location
        image_url: imageUrl,
        quantity_available: form.quantity_available || null,
        seller_name: profile?.full_name || session.user.email?.split('@')[0] || 'Unknown Seller',
        seller_phone: profile?.phone_number || null,
        seller_email: session.user.email || null,
      };

      const { error } = await supabase.from('market_listings').insert([insert]);
      if (error) throw error;

      toast.success('Listing created');
      navigate('/marketplace');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 lg:p-12">
        <h1 className="text-4xl font-bold mb-4">Add Listing</h1>
        <form onSubmit={handleUploadAndCreate} className="max-w-3xl space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <Label>Description</Label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-2 rounded" rows={4} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Price (KSh)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <Label>Unit</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={form.quantity_available} onChange={(e) => setForm({ ...form, quantity_available: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full p-2 rounded">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label>City / Location</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label>Image</Label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
          </div>
          <div>
            <Button type="submit" className="bg-gradient-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Listing'}</Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}