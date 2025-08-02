import { useState } from "react";
import { 
  CreditCard, 
  Smartphone, 
  MapPin, 
  Lock, 
  CheckCircle, 
  XCircle,
  Gift,
  Heart,
  DollarSign,
  Percent,
  QrCode,
  Phone,
  Mail,
  Shield,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface PaymentSystemProps {
  total: number;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount: number;
  description: string;
}

const DISCOUNT_CODES: DiscountCode[] = [
  { code: 'WELCOME10', type: 'percentage', value: 10, minAmount: 1000, description: '10% off for new customers' },
  { code: 'FREESHIP', type: 'fixed', value: 500, minAmount: 2000, description: 'Rs. 500 off on orders above Rs. 2000' },
  { code: 'PAKISTAN20', type: 'percentage', value: 20, minAmount: 5000, description: '20% off on orders above Rs. 5000' },
  { code: 'FLASH50', type: 'fixed', value: 1000, minAmount: 3000, description: 'Rs. 1000 off flash sale' }
];

const PaymentSystem = ({ total, onPaymentSuccess, onPaymentError }: PaymentSystemProps) => {
  const [paymentMethod, setPaymentMethod] = useState("easypaisa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [donationAmount, setDonationAmount] = useState(0);
  const [showDonation, setShowDonation] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    easypaisa: { phone: "", otp: "" },
    jazzcash: { phone: "", otp: "" },
    card: { number: "", expiry: "", cvv: "", name: "" },
    cod: { name: "", phone: "" }
  });
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === 'percentage') {
      return (total * appliedDiscount.value) / 100;
    }
    return appliedDiscount.value;
  };

  const calculateTotal = () => {
    const discount = calculateDiscount();
    return Math.max(0, total - discount + donationAmount);
  };

  const handleApplyDiscount = () => {
    const code = discountCode.toUpperCase();
    const discount = DISCOUNT_CODES.find(d => d.code === code);
    
    if (!discount) {
      toast({
        title: "Invalid Code",
        description: "The discount code you entered is not valid.",
        variant: "destructive",
      });
      return;
    }

    if (total < discount.minAmount) {
      toast({
        title: "Minimum Amount Required",
        description: `This code requires a minimum order of ${formatPrice(discount.minAmount)}.`,
        variant: "destructive",
      });
      return;
    }

    setAppliedDiscount(discount);
    toast({
      title: "Discount Applied!",
      description: discount.description,
    });
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
  };

  const handlePaymentDetailsChange = (method: string, field: string, value: string) => {
    setPaymentDetails(prev => ({
      ...prev,
      [method]: {
        ...prev[method as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const simulatePaymentProcessing = async () => {
    setIsProcessing(true);
    setProcessingStep(0);

    // Simulate payment processing steps
    const steps = [
      "Validating payment method...",
      "Processing payment...",
      "Verifying transaction...",
      "Confirming order..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Simulate success/failure based on payment method
    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
      onPaymentSuccess({
        method: paymentMethod,
        amount: total, // Use original total, not calculated total
        transactionId: `TXN${Date.now()}`,
        timestamp: new Date().toISOString()
      });
    } else {
      onPaymentError("Payment failed. Please try again.");
    }

    setIsProcessing(false);
    setProcessingStep(0);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'easypaisa':
        return <Smartphone className="w-6 h-6 text-green-600" />;
      case 'jazzcash':
        return <Smartphone className="w-6 h-6 text-orange-600" />;
      case 'card':
        return <CreditCard className="w-6 h-6 text-blue-600" />;
      case 'cod':
        return <MapPin className="w-6 h-6 text-purple-600" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'easypaisa':
        return 'bg-green-100';
      case 'jazzcash':
        return 'bg-orange-100';
      case 'card':
        return 'bg-blue-100';
      case 'cod':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Discount Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Discount & Offers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter discount code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleApplyDiscount}
              disabled={!discountCode.trim()}
              variant="outline"
            >
              Apply
            </Button>
          </div>
          
          {appliedDiscount && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">
                  {appliedDiscount.code} - {appliedDiscount.description}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveDiscount}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          )}

          {/* Available Discounts */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Available Discounts:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {DISCOUNT_CODES.map((code) => (
                <div key={code.code} className="flex items-center justify-between p-2 bg-secondary rounded text-xs">
                  <span className="font-mono">{code.code}</span>
                  <span className="text-muted-foreground">{code.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Support Local Charities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Make a difference in your community
              </p>
              <p className="text-xs text-muted-foreground">
                Your donation goes directly to local Pakistani charities
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDonation(!showDonation)}
            >
              {showDonation ? 'Hide' : 'Add Donation'}
            </Button>
          </div>

          {showDonation && (
            <div className="space-y-4 p-4 bg-red-50 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                {[100, 200, 500, 1000].map((amount) => (
                  <Button
                    key={amount}
                    variant={donationAmount === amount ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDonationAmount(donationAmount === amount ? 0 : amount)}
                    className="w-full"
                  >
                    {formatPrice(amount)}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Custom amount"
                  type="number"
                  value={donationAmount > 0 && ![100, 200, 500, 1000].includes(donationAmount) ? donationAmount : ''}
                  onChange={(e) => setDonationAmount(Number(e.target.value) || 0)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDonationAmount(0)}
                >
                  Clear
                </Button>
              </div>
              {donationAmount > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Heart className="w-4 h-4" />
                  <span>Thank you for your generosity!</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
            {/* Easypaisa */}
            <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
              <RadioGroupItem value="easypaisa" id="easypaisa" />
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-12 h-12 ${getPaymentMethodColor('easypaisa')} rounded-lg flex items-center justify-center`}>
                  {getPaymentMethodIcon('easypaisa')}
                </div>
                <div>
                  <Label htmlFor="easypaisa" className="text-base font-medium">
                    Easypaisa
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Pay securely with your Easypaisa account
                  </p>
                </div>
              </div>
            </div>

            {/* JazzCash */}
            <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
              <RadioGroupItem value="jazzcash" id="jazzcash" />
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-12 h-12 ${getPaymentMethodColor('jazzcash')} rounded-lg flex items-center justify-center`}>
                  {getPaymentMethodIcon('jazzcash')}
                </div>
                <div>
                  <Label htmlFor="jazzcash" className="text-base font-medium">
                    JazzCash
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Pay securely with your JazzCash wallet
                  </p>
                </div>
              </div>
            </div>

            {/* Credit Card */}
            <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
              <RadioGroupItem value="card" id="card" />
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-12 h-12 ${getPaymentMethodColor('card')} rounded-lg flex items-center justify-center`}>
                  {getPaymentMethodIcon('card')}
                </div>
                <div>
                  <Label htmlFor="card" className="text-base font-medium">
                    Credit/Debit Card
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Visa, Mastercard, and other major cards
                  </p>
                </div>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
              <RadioGroupItem value="cod" id="cod" />
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-12 h-12 ${getPaymentMethodColor('cod')} rounded-lg flex items-center justify-center`}>
                  {getPaymentMethodIcon('cod')}
                </div>
                <div>
                  <Label htmlFor="cod" className="text-base font-medium">
                    Cash on Delivery
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Pay when your order arrives
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>

          {/* Payment Method Specific Forms */}
          {paymentMethod === "easypaisa" && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Easypaisa Payment</span>
              </div>
              <div>
                <Label htmlFor="easypaisaPhone">Phone Number</Label>
                <Input 
                  id="easypaisaPhone" 
                  placeholder="03XX XXXXXXX" 
                  value={paymentDetails.easypaisa.phone}
                  onChange={(e) => handlePaymentDetailsChange('easypaisa', 'phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="easypaisaOtp">OTP Code</Label>
                <Input 
                  id="easypaisaOtp" 
                  placeholder="Enter 6-digit OTP" 
                  value={paymentDetails.easypaisa.otp}
                  onChange={(e) => handlePaymentDetailsChange('easypaisa', 'otp', e.target.value)}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                You will receive an OTP on your registered Easypaisa number
              </div>
            </div>
          )}

          {paymentMethod === "jazzcash" && (
            <div className="mt-6 p-4 bg-orange-50 rounded-lg space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">JazzCash Payment</span>
              </div>
              <div>
                <Label htmlFor="jazzcashPhone">Phone Number</Label>
                <Input 
                  id="jazzcashPhone" 
                  placeholder="03XX XXXXXXX" 
                  value={paymentDetails.jazzcash.phone}
                  onChange={(e) => handlePaymentDetailsChange('jazzcash', 'phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="jazzcashOtp">OTP Code</Label>
                <Input 
                  id="jazzcashOtp" 
                  placeholder="Enter 6-digit OTP" 
                  value={paymentDetails.jazzcash.otp}
                  onChange={(e) => handlePaymentDetailsChange('jazzcash', 'otp', e.target.value)}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                You will receive an OTP on your registered JazzCash number
              </div>
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Secure Card Payment</span>
              </div>
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input 
                  id="cardNumber" 
                  placeholder="1234 5678 9012 3456" 
                  value={paymentDetails.card.number}
                  onChange={(e) => handlePaymentDetailsChange('card', 'number', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input 
                    id="expiry" 
                    placeholder="MM/YY" 
                    value={paymentDetails.card.expiry}
                    onChange={(e) => handlePaymentDetailsChange('card', 'expiry', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input 
                    id="cvv" 
                    placeholder="123" 
                    value={paymentDetails.card.cvv}
                    onChange={(e) => handlePaymentDetailsChange('card', 'cvv', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input 
                  id="cardName" 
                  placeholder="Ahmed Khan" 
                  value={paymentDetails.card.name}
                  onChange={(e) => handlePaymentDetailsChange('card', 'name', e.target.value)}
                />
              </div>
            </div>
          )}

          {paymentMethod === "cod" && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Cash on Delivery</span>
              </div>
              <div>
                <Label htmlFor="codName">Full Name</Label>
                <Input 
                  id="codName" 
                  placeholder="Ahmed Khan" 
                  value={paymentDetails.cod.name}
                  onChange={(e) => handlePaymentDetailsChange('cod', 'name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="codPhone">Phone Number</Label>
                <Input 
                  id="codPhone" 
                  placeholder="03XX XXXXXXX" 
                  value={paymentDetails.cod.phone}
                  onChange={(e) => handlePaymentDetailsChange('cod', 'phone', e.target.value)}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Payment will be collected upon delivery
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please wait while we process your payment securely...
                  </p>
                  <Progress value={(processingStep + 1) * 25} className="mb-4" />
                  <p className="text-xs text-muted-foreground">
                    Step {processingStep + 1} of 4
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            {appliedDiscount && (
              <div className="flex justify-between text-green-600">
                <span>Discount ({appliedDiscount.code})</span>
                <span>-{formatPrice(calculateDiscount())}</span>
              </div>
            )}
            {donationAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Donation</span>
                <span>+{formatPrice(donationAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-green-600">FREE</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(calculateTotal())}</span>
            </div>
          </div>

          <Button 
            className="w-full bg-gradient-primary" 
            size="lg"
            onClick={simulatePaymentProcessing}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Pay Securely • {formatPrice(calculateTotal())}
              </>
            )}
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Your payment is protected by SSL encryption</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSystem; 