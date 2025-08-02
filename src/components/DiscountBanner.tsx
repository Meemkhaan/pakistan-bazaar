import { useState } from "react";
import { Gift, Percent, Clock, ArrowRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface DiscountOffer {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount: number;
  description: string;
  expiresAt: string;
  isNew?: boolean;
  isPopular?: boolean;
}

const DISCOUNT_OFFERS: DiscountOffer[] = [
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minAmount: 1000,
    description: '10% off for new customers',
    expiresAt: '2024-12-31',
    isNew: true
  },
  {
    code: 'FREESHIP',
    type: 'fixed',
    value: 500,
    minAmount: 2000,
    description: 'Rs. 500 off on orders above Rs. 2000',
    expiresAt: '2024-11-30',
    isPopular: true
  },
  {
    code: 'PAKISTAN20',
    type: 'percentage',
    value: 20,
    minAmount: 5000,
    description: '20% off on orders above Rs. 5000',
    expiresAt: '2024-12-15'
  },
  {
    code: 'FLASH50',
    type: 'fixed',
    value: 1000,
    minAmount: 3000,
    description: 'Rs. 1000 off flash sale',
    expiresAt: '2024-10-31'
  }
];

const DiscountBanner = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Code Copied!",
        description: `Discount code "${code}" copied to clipboard`,
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  const getDiscountValue = (offer: DiscountOffer) => {
    if (offer.type === 'percentage') {
      return `${offer.value}% OFF`;
    }
    return `${formatPrice(offer.value)} OFF`;
  };

  return (
    <div className="space-y-6">
      {/* Main Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Gift className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-green-800">Special Offers & Discounts</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Save big on your purchases with our exclusive discount codes. 
              Valid on all products with free delivery across Pakistan.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Discount Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DISCOUNT_OFFERS.map((offer) => {
          const daysLeft = getDaysUntilExpiry(offer.expiresAt);
          const isExpiringSoon = daysLeft <= 7;
          
          return (
            <Card key={offer.code} className="relative hover:shadow-lg transition-shadow">
              {offer.isNew && (
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
                  NEW
                </Badge>
              )}
              {offer.isPopular && (
                <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white">
                  POPULAR
                </Badge>
              )}
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {/* Code Section */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-primary" />
                      <span className="font-mono font-bold text-lg">{offer.code}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(offer.code)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedCode === offer.code ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Discount Value */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {getDiscountValue(offer)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Min. order: {formatPrice(offer.minAmount)}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground text-center">
                    {offer.description}
                  </p>

                  {/* Expiry */}
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <Clock className="w-3 h-3" />
                    <span className={isExpiringSoon ? "text-red-600 font-medium" : "text-muted-foreground"}>
                      {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                    </span>
                  </div>

                  {/* Use Code Button */}
                  <Button 
                    className="w-full bg-gradient-primary" 
                    size="sm"
                    onClick={() => copyToClipboard(offer.code)}
                  >
                    Use Code
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* How to Use */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">How to Use Discount Codes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="w-8 h-8 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <h4 className="font-medium">Add Items to Cart</h4>
                <p className="text-sm text-muted-foreground">
                  Browse and add products to your shopping cart
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <h4 className="font-medium">Apply Code at Checkout</h4>
                <p className="text-sm text-muted-foreground">
                  Enter the discount code during checkout process
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <h4 className="font-medium">Enjoy Your Savings</h4>
                <p className="text-sm text-muted-foreground">
                  Discount will be applied to your total order
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>• Discount codes cannot be combined with other offers</p>
        <p>• Valid on all products unless otherwise specified</p>
        <p>• Free delivery applies to all orders across Pakistan</p>
        <p>• Offers subject to change without notice</p>
      </div>
    </div>
  );
};

export default DiscountBanner; 