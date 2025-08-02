import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url?: string;
  image?: string;
  rating?: number;
  reviews?: number;
  isFreeDelivery?: boolean;
  isOnSale?: boolean;
}

const ProductCard = ({
  id,
  name,
  price,
  original_price,
  image_url,
  image,
  rating = 4.5,
  reviews = 100,
  isFreeDelivery = true,
  isOnSale = false
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const formatPrice = (price: number | undefined | null) => {
    if (!price || isNaN(price)) {
      return 'Rs. 0';
    }
    return `Rs. ${price.toLocaleString()}`;
  };

  const discountPercentage = original_price 
    ? Math.round(((original_price - price) / original_price) * 100)
    : 0;

  const handleAddToCart = async () => {
    try {
      await addToCart(id, 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-pak transition-all duration-300 bg-gradient-card border-border/50">
      <div className="relative">
        {/* Product Image */}
        <Link to={`/product/${id}`}>
          <div className="aspect-square overflow-hidden bg-muted">
            <img
              src={image_url || image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOnSale && discountPercentage > 0 && (
            <Badge className="bg-destructive text-destructive-foreground">
              {discountPercentage}% OFF
            </Badge>
          )}
          {isFreeDelivery && (
            <Badge className="bg-primary text-primary-foreground">
              Free Delivery
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>

      <CardContent className="p-4">
        {/* Product Name */}
        <Link to={`/product/${id}`}>
          <h3 className="font-medium text-sm mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(rating)
                    ? 'text-accent fill-accent'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary">
            {formatPrice(price)}
          </span>
          {original_price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(original_price)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button 
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          size="sm"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;