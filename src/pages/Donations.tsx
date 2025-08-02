import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { 
  Gift, 
  Heart, 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  Package,
  Users,
  ArrowRight,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Copy,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DonationItem {
  id: string;
  product_name: string;
  description: string | null;
  condition: string;
  category: string;
  estimated_value: number;
  quantity: number;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  pickup_address: string;
  pickup_city: string;
  preferred_pickup_date: string | null;
  image_urls: string[];
  status: string;
  created_at: string;
}

const Donations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const categories = [
    "All Categories",
    "Electronics",
    "Fashion",
    "Home & Garden",
    "Sports",
    "Books",
    "Toys & Games",
    "Baby & Kids",
    "Health & Beauty",
    "Automotive",
    "Other"
  ];

  const conditions = [
    "All Conditions",
    "Brand New",
    "Like New",
    "Excellent",
    "Good",
    "Fair",
    "Needs Repair"
  ];

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('donations')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching donations:', error);
        return;
      }

      setDonations(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (donation.description && donation.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "" || selectedCategory === "All Categories" || donation.category === selectedCategory;
    const matchesCondition = selectedCondition === "" || selectedCondition === "All Conditions" || donation.condition === selectedCondition;

    return matchesSearch && matchesCategory && matchesCondition;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Brand New':
        return 'bg-green-100 text-green-800';
      case 'Like New':
        return 'bg-blue-100 text-blue-800';
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-800';
      case 'Good':
        return 'bg-yellow-100 text-yellow-800';
      case 'Fair':
        return 'bg-orange-100 text-orange-800';
      case 'Needs Repair':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
        variant: "default",
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleContactDonor = (donation: DonationItem) => {
    setSelectedDonation(donation);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span>Loading donations...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Available Donations</h1>
              <p className="text-muted-foreground">Browse items donated by generous people in your community</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span>{donations.length} items available</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span>Multiple cities</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4 text-green-500" />
              <span>Free pickup</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search donations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Donations Grid */}
        {filteredDonations.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">
              {searchTerm || selectedCategory !== "" || selectedCondition !== "" 
                ? 'No Donations Found' 
                : 'No Donations Available'
              }
            </h2>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedCategory !== "" || selectedCondition !== ""
                ? 'Try adjusting your search terms or filters'
                : 'Check back later for new donations or consider donating items yourself!'
              }
            </p>
            <div className="flex gap-4 justify-center">
              {(searchTerm || selectedCategory !== "" || selectedCondition !== "") && (
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedCondition("");
                }}>
                  Clear Filters
                </Button>
              )}
              <Button onClick={() => navigate('/donate')}>
                <Plus className="w-4 h-4 mr-2" />
                Donate Items
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonations.map((donation) => (
              <Card key={donation.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {donation.product_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getConditionColor(donation.condition)}>
                          {donation.condition}
                        </Badge>
                        <Badge variant="secondary">
                          {donation.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Image */}
                  {donation.image_urls && donation.image_urls.length > 0 ? (
                    <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                      <img
                        src={donation.image_urls[0]}
                        alt={donation.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                      <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}

                  {/* Description */}
                  {donation.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {donation.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>Donated by {donation.donor_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{donation.pickup_city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Available since {formatDate(donation.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span>Quantity: {donation.quantity}</span>
                    </div>
                  </div>

                  {/* Estimated Value */}
                  {donation.estimated_value > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Estimated Value: </span>
                      <span className="font-semibold">Rs. {donation.estimated_value.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Contact Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleContactDonor(donation)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Donor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-red-500" />
                          Contact Donor
                        </DialogTitle>
                      </DialogHeader>
                      
                      {selectedDonation && (
                        <div className="space-y-6">
                          {/* Item Info */}
                          <div className="bg-muted/50 rounded-lg p-4">
                            <h3 className="font-semibold mb-2">{selectedDonation.product_name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge className={getConditionColor(selectedDonation.condition)}>
                                {selectedDonation.condition}
                              </Badge>
                              <Badge variant="secondary">
                                {selectedDonation.category}
                              </Badge>
                            </div>
                          </div>

                          {/* Donor Contact Info */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-sm">Donor Information</h4>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">Name</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{selectedDonation.donor_name}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(selectedDonation.donor_name, 'Name')}
                                  >
                                    {copiedField === 'Name' ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">Email</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{selectedDonation.donor_email}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(selectedDonation.donor_email, 'Email')}
                                  >
                                    {copiedField === 'Email' ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm">Phone</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{selectedDonation.donor_phone}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(selectedDonation.donor_phone, 'Phone')}
                                  >
                                    {copiedField === 'Phone' ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Pickup Information */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-sm">Pickup Information</h4>
                            
                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Address</p>
                                  <p className="text-sm text-muted-foreground">{selectedDonation.pickup_address}</p>
                                  <p className="text-sm text-muted-foreground">{selectedDonation.pickup_city}</p>
                                </div>
                              </div>

                              {selectedDonation.preferred_pickup_date && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">Preferred Date</p>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(selectedDonation.preferred_pickup_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-4">
                            <Button 
                              className="flex-1" 
                              onClick={() => window.open(`mailto:${selectedDonation.donor_email}?subject=Regarding your donation: ${selectedDonation.product_name}`)}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => window.open(`tel:${selectedDonation.donor_phone}`)}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              Call
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Want to Help Your Community?</h3>
          <p className="text-muted-foreground mb-6">
            Donate your unused items and help families in need across Pakistan
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/donate')}>
              <Gift className="w-4 h-4 mr-2" />
              Donate Items
            </Button>
            <Button onClick={() => navigate('/')}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations; 