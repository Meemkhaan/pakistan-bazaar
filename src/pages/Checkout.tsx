import { useState } from "react";
import { MapPin, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import PaymentSystem from "@/components/PaymentSystem";

const Checkout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal: ""
  });
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const subtotal = getTotalPrice();
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to place an order",
        variant: "destructive",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    // Validate form data
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create order in database with basic fields only
      const orderData = {
        user_id: user.id,
        total_amount: total, // Use the original total, not paymentData.amount
        shipping_address: `${formData.address}, ${formData.city}, ${formData.state}`,
        payment_method: paymentData.method
      };

      console.log('User ID:', user.id);
      console.log('User authenticated:', !!user);

      console.log('Creating order with data:', orderData);

      // Use Supabase client with authentication
      const { data: orderResult, error: orderError } = await (supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single() as any);

      if (orderError) {
        console.log('Order creation error:', orderError);
        console.log('Error code:', orderError.code);
        console.log('Error message:', orderError.message);
        console.log('Error details:', orderError.details);
        throw orderError;
      }

      console.log('Order created successfully:', orderResult);

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderResult.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price
      }));

      console.log('Creating order items:', orderItems);

      // Use Supabase client for order items
      const { error: itemsError } = await (supabase
        .from('order_items')
        .insert(orderItems) as any);

      if (itemsError) {
        console.log('Order items creation error:', itemsError);
        throw itemsError;
      }

      console.log('Order items created successfully');

      // Clear cart after successful order
      await clearCart();
      
      toast({
        title: "Payment Successful!",
        description: `Order #${orderResult.id.slice(0, 8)} has been confirmed. Transaction ID: ${paymentData.transactionId}`,
      });
      
      // Redirect to orders page
      navigate("/orders");
    } catch (error: any) {
      console.error('Error placing order:', error);
      
      let errorMessage = "Failed to place order. Please try again.";
      
      if (error.code === 'PGRST204') {
        errorMessage = "Database schema error. Please contact support.";
      } else if (error.message?.includes('phone')) {
        errorMessage = "Phone number is required. Please fill in all required fields.";
      } else if (error.message?.includes('user_id')) {
        errorMessage = "Authentication error. Please log in again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Add some items to your cart before checkout.
            </p>
            <Button onClick={() => navigate("/")} className="bg-gradient-primary">
              Continue Shopping
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate("/cart")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">Complete your order securely</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Ahmed" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Khan" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="ahmed@example.com" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+92 300 1234567" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                </div>
                
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" placeholder="House 123, Street 45, Block A" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Karachi" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="state">Province</Label>
                    <Input id="state" placeholder="Sindh" value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="postal">Postal Code</Label>
                    <Input id="postal" placeholder="75300" value={formData.postal} onChange={(e) => handleInputChange('postal', e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment System */}
            <PaymentSystem 
              total={subtotal}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />

            {/* Terms and Conditions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the{" "}
                      <a href="#" className="text-primary hover:underline">
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox id="newsletter" />
                    <Label htmlFor="newsletter" className="text-sm">
                      Subscribe to our newsletter for updates and special offers
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Items */}
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium line-clamp-2 mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-border" />

                {/* Trust Indicators */}
                <div className="text-center space-y-2 text-sm text-muted-foreground">
                  <p>✓ Free delivery across Pakistan</p>
                  <p>✓ 40-day return policy</p>
                  <p>✓ Secure payment guarantee</p>
                  <p>✓ Support local charities</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;