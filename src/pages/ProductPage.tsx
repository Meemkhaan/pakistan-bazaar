import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, Share2, ShoppingCart, Truck, RotateCcw, Shield, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url?: string;
  description?: string;
  stock_quantity?: number;
  category_id?: string;
  seller_id?: string;
  created_at: string;
  updated_at: string;
}

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        
        // Use stable placeholder image if no image_url
        const productWithImage = {
          ...data,
          image_url: data.image_url || `https://picsum.photos/600/600?random=${data.id}`
        };
        
        setProduct(productWithImage);
      } catch (error) {
        console.error('Error fetching product:', error);
        // Redirect to homepage if product not found
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Mock data for reviews and seller info
  const reviews = [
    {
      id: 1,
      name: "Ahmed Khan",
      rating: 5,
      date: "2 days ago",
      comment: "Excellent product! Fast delivery and exactly as described. Very satisfied with my purchase.",
      verified: true
    },
    {
      id: 2,
      name: "Fatima Ali",
      rating: 4,
      date: "1 week ago", 
      comment: "Good quality product. Shipping was quick across Pakistan.",
      verified: true
    },
    {
      id: 3,
      name: "Muhammad Hassan",
      rating: 5,
      date: "2 weeks ago",
      comment: "Amazing value for money. Highly recommended!",
      verified: true
    }
  ];

  const seller = {
    name: "TechHub Pakistan",
    rating: 4.8,
    totalSales: 12500
  };

  const sizes = ["S", "M", "L", "XL"];

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading product...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Button onClick={() => navigate('/')}>Back to Homepage</Button>
          </div>
        </div>
      </div>
    );
  }

  const discountPercentage = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4"
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">(2847 reviews)</span>
                </div>
                <Badge variant="secondary">In Stock</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                {product.original_price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                    <Badge variant="destructive">{discountPercentage}% OFF</Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {product.stock_quantity || 0} items in stock
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {product.description || "No description available for this product."}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-green-600" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-green-600" />
                <span className="text-sm">30-Day Returns</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm">Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-green-600" />
                <span className="text-sm">Verified Seller</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{review.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                    {review.verified && (
                      <Badge variant="outline" className="text-xs">Verified Purchase</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;