import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { 
  CheckCircle, 
  Gift, 
  Heart, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Download,
  Share2,
  Home
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface DonationData {
  id: string;
  product_name: string;
  category: string;
  condition: string;
  quantity: number;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  pickup_address: string;
  pickup_city: string;
  preferred_pickup_date: string;
  status: string;
  created_at: string;
}

const DonationConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [donation, setDonation] = useState<DonationData | null>(null);
  const [loading, setLoading] = useState(true);

  const donationId = location.state?.donationId;

  useEffect(() => {
    if (!donationId) {
      navigate('/donate');
      return;
    }

    const fetchDonation = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('donations')
          .select('*')
          .eq('id', donationId)
          .single();

        if (error) {
          console.error('Error fetching donation:', error);
          return;
        }

        setDonation(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [donationId, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadReceipt = () => {
    if (!donation) return;

    const receipt = `
DONATION RECEIPT
================

Donation ID: ${donation.id}
Date: ${formatDate(donation.created_at)}

DONOR INFORMATION:
Name: ${donation.donor_name}
Email: ${donation.donor_email}
Phone: ${donation.donor_phone}

DONATED ITEM:
Product: ${donation.product_name}
Category: ${donation.category}
Condition: ${donation.condition}
Quantity: ${donation.quantity}

PICKUP INFORMATION:
Address: ${donation.pickup_address}
City: ${donation.pickup_city}
Preferred Date: ${donation.preferred_pickup_date || 'Not specified'}

Status: ${donation.status.toUpperCase()}

Thank you for your generous donation!
Your contribution will help families in need across Pakistan.

ShopPakistan Donation Program
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donation-receipt-${donation.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span>Loading confirmation...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Donation Not Found</h1>
            <p className="text-muted-foreground mb-4">The donation you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Donation Submitted Successfully!</h1>
            <p className="text-muted-foreground">
              Thank you for your generosity. We'll contact you soon to arrange pickup.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Donation Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Donation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Product Name</Label>
                      <p className="font-semibold">{donation.product_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                      <p className="font-semibold">{donation.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Condition</Label>
                      <p className="font-semibold">{donation.condition}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Quantity</Label>
                      <p className="font-semibold">{donation.quantity}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant="secondary" className="mt-1">
                      {donation.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                      <p className="font-semibold">{donation.donor_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="font-semibold">{donation.donor_email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="font-semibold">{donation.donor_phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Donation ID</Label>
                      <p className="font-mono text-sm">{donation.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Pickup Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Pickup Address</Label>
                    <p className="font-semibold">{donation.pickup_address}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">City</Label>
                      <p className="font-semibold">{donation.pickup_city}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Preferred Date</Label>
                      <p className="font-semibold">
                        {donation.preferred_pickup_date 
                          ? new Date(donation.preferred_pickup_date).toLocaleDateString()
                          : 'Not specified'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What's Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Review</h4>
                      <p className="text-sm text-muted-foreground">
                        We'll review your donation within 24 hours
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Contact</h4>
                      <p className="text-sm text-muted-foreground">
                        We'll call you to confirm pickup details
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Pickup</h4>
                      <p className="text-sm text-muted-foreground">
                        Free pickup service at your convenience
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={downloadReceipt}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const text = `I just donated ${donation.product_name} through ShopPakistan! Help others by donating your unused items too.`;
                      if (navigator.share) {
                        navigator.share({
                          title: 'Donation Made',
                          text: text,
                          url: window.location.origin
                        });
                      } else {
                        navigator.clipboard.writeText(text);
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/donate')}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Donate Another Item
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>donations@shoppakistan.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>+92 300 1234567</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold mb-4">Thank You for Making a Difference!</h3>
            <p className="text-muted-foreground mb-6">
              Your donation will help families in need across Pakistan. Every item counts!
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button onClick={() => navigate('/')}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationConfirmation; 