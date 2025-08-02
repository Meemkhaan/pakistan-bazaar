import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { 
  Gift, 
  Heart, 
  Upload, 
  Package, 
  MapPin, 
  Phone, 
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface DonationForm {
  productName: string;
  description: string;
  condition: string;
  category: string;
  estimatedValue: number;
  quantity: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  pickupAddress: string;
  pickupCity: string;
  preferredPickupDate: string;
  additionalNotes: string;
  images: File[];
}

const DonateProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<DonationForm>({
    productName: "",
    description: "",
    condition: "",
    category: "",
    estimatedValue: 0,
    quantity: 1,
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    pickupAddress: "",
    pickupCity: "",
    preferredPickupDate: "",
    additionalNotes: "",
    images: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const categories = [
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
    "Brand New",
    "Like New",
    "Excellent",
    "Good",
    "Fair",
    "Needs Repair"
  ];

  const handleInputChange = (field: keyof DonationForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const uploadImagesToStorage = async (images: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const image of images) {
      const fileName = `donations/${Date.now()}-${image.name}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, image);

      if (error) {
        console.error('Error uploading image:', error);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to donate products",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const imageUrls = await uploadImagesToStorage(formData.images);

      // Create donation record
      const { data: donationData, error: donationError } = await (supabase as any)
        .from('donations')
        .insert({
          donor_id: user.id,
          product_name: formData.productName,
          description: formData.description,
          condition: formData.condition,
          category: formData.category,
          estimated_value: formData.estimatedValue,
          quantity: formData.quantity,
          donor_name: formData.donorName,
          donor_email: formData.donorEmail,
          donor_phone: formData.donorPhone,
          pickup_address: formData.pickupAddress,
          pickup_city: formData.pickupCity,
          preferred_pickup_date: formData.preferredPickupDate,
          additional_notes: formData.additionalNotes,
          image_urls: imageUrls,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (donationError) {
        throw donationError;
      }

      toast({
        title: "Donation Submitted Successfully!",
        description: "Thank you for your generosity. We'll contact you soon to arrange pickup.",
        variant: "default",
      });

      // Reset form
      setFormData({
        productName: "",
        description: "",
        condition: "",
        category: "",
        estimatedValue: 0,
        quantity: 1,
        donorName: "",
        donorEmail: "",
        donorPhone: "",
        pickupAddress: "",
        pickupCity: "",
        preferredPickupDate: "",
        additionalNotes: "",
        images: []
      });
      setUploadedImages([]);

      // Navigate to confirmation page
      navigate('/donate/confirmation', { 
        state: { donationId: donationData.id }
      });

    } catch (error) {
      console.error('Error submitting donation:', error);
      toast({
        title: "Error",
        description: "Failed to submit donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">Donate Product</span>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Donate Your Products</h1>
                <p className="text-muted-foreground">Help others by donating items you no longer need</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Free pickup service</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Tax deductible</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Help communities</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      value={formData.productName}
                      onChange={(e) => handleInputChange('productName', e.target.value)}
                      placeholder="e.g., Samsung Galaxy Phone"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleInputChange('category', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the product, its features, and why someone would want it..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select 
                      value={formData.condition} 
                      onValueChange={(value) => handleInputChange('condition', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
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

                  <div>
                    <Label htmlFor="estimatedValue">Estimated Value (Rs.)</Label>
                    <Input
                      id="estimatedValue"
                      type="number"
                      value={formData.estimatedValue}
                      onChange={(e) => handleInputChange('estimatedValue', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="images">Product Images</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload photos of your product (max 5 images)
                    </p>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('images')?.click()}
                    >
                      Choose Files
                    </Button>
                  </div>
                  {formData.images.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        {formData.images.length} image(s) selected
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Donor Information */}
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
                    <Label htmlFor="donorName">Full Name *</Label>
                    <Input
                      id="donorName"
                      value={formData.donorName}
                      onChange={(e) => handleInputChange('donorName', e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="donorEmail">Email *</Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      value={formData.donorEmail}
                      onChange={(e) => handleInputChange('donorEmail', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="donorPhone">Phone Number *</Label>
                  <Input
                    id="donorPhone"
                    type="tel"
                    value={formData.donorPhone}
                    onChange={(e) => handleInputChange('donorPhone', e.target.value)}
                    placeholder="+92 300 1234567"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pickup Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Pickup Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pickupAddress">Pickup Address *</Label>
                  <Textarea
                    id="pickupAddress"
                    value={formData.pickupAddress}
                    onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                    placeholder="Complete address where we can pick up the items"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickupCity">City *</Label>
                    <Input
                      id="pickupCity"
                      value={formData.pickupCity}
                      onChange={(e) => handleInputChange('pickupCity', e.target.value)}
                      placeholder="e.g., Karachi, Lahore, Islamabad"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="preferredPickupDate">Preferred Pickup Date</Label>
                    <Input
                      id="preferredPickupDate"
                      type="date"
                      value={formData.preferredPickupDate}
                      onChange={(e) => handleInputChange('preferredPickupDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    placeholder="Any special instructions for pickup, product details, or other information..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Impact Information */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Your Donation Makes a Difference</h3>
                  <p className="text-muted-foreground mb-4">
                    Your donated items will be distributed to families in need, schools, and community centers across Pakistan.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">500+</div>
                      <div className="text-muted-foreground">Families Helped</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">50+</div>
                      <div className="text-muted-foreground">Schools Supported</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">1000+</div>
                      <div className="text-muted-foreground">Items Donated</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button 
                type="submit" 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5 mr-2" />
                    Submit Donation
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonateProduct; 