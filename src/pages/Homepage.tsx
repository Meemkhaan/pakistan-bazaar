import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import DiscountBanner from "@/components/DiscountBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase, isDevelopmentMode } from "@/integrations/supabase/client";
import { 
  Truck, 
  Shield, 
  RotateCcw, 
  Award, 
  ArrowRight,
  MapPin,
  CreditCard,
  Smartphone
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url?: string;
  description?: string;
  stock_quantity?: number;
  category_id?: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  product_count: number;
}

const Homepage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0
  });

  // Generate stable hash from product ID
  const generateStableHash = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      
      // Use actual images or stable placeholders for products without images
      const productsWithImages = (data || []).map(product => ({
        ...product,
        image_url: product.image_url || `https://via.placeholder.com/400x400/cccccc/666666?text=${encodeURIComponent(product.name)}`
      }));
      
      setProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  // Fetch categories with product counts
  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      // Fetch product counts for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count: productCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('is_active', true);

          return {
            ...category,
            product_count: productCount || 0
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total categories
      const { count: totalCategories } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      // Get total orders (for demo, we'll use a realistic number)
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalProducts: totalProducts || 0,
        totalCategories: totalCategories || 0,
        totalOrders: totalOrders || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalProducts: 0,
        totalCategories: 0,
        totalOrders: 0
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchStats()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    "Electronics": "📱",
    "Fashion": "👕",
    "Home & Garden": "🏠",
    "Sports": "⚽",
    "Books": "📚",
    "Beauty": "💄",
    "Toys & Games": "🎮",
    "Automotive": "🚗",
    "Health": "💊",
    "Baby & Kids": "👶",
    "Pet Supplies": "🐕",
    "Office Supplies": "📎"
  };

  // Get category path
  const getCategoryPath = (categoryName: string) => {
    // Handle special cases for category slugs
    const categorySlugMap: Record<string, string> = {
      'Home & Garden': 'home-garden',
      'Electronics': 'electronics',
      'Fashion': 'fashion',
      'Sports': 'sports',
      'Books': 'books'
    };
    
    return `/category/${categorySlugMap[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '-')}`;
  };

  // Get icon for category
  const getCategoryIcon = (categoryName: string) => {
    return categoryIcons[categoryName] || "📦";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Pakistan's Most
                <br />
                <span className="text-accent">Trusted Bazaar</span>
              </h1>
              <p className="text-xl mb-8 text-primary-foreground/90">
                Free delivery across Pakistan • 40-day return policy • Secure payments with Easypaisa & JazzCash
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/categories">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Start Shopping
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/seller">
                  <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    Become a Seller
                  </Button>
                </Link>
              </div>
            </div>
            <div className="animate-slide-up">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600" 
                  alt="Shopping in Pakistan"
                  className="rounded-lg shadow-pak"
                />
                <div className="absolute -bottom-4 -left-4 bg-background p-4 rounded-lg shadow-card">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
                    <span className="text-sm font-medium text-foreground">
                      {stats.totalOrders > 0 ? `${stats.totalOrders}+ orders` : 'Fresh start - be first!'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Free Delivery</h3>
              <p className="text-sm text-muted-foreground">Across Pakistan</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">40-Day Returns</h3>
              <p className="text-sm text-muted-foreground">Easy returns policy</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">Easypaisa & JazzCash</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Quality Products</h3>
              <p className="text-sm text-muted-foreground">Verified sellers only</p>
            </div>
          </div>
        </div>
      </section>

      {/* Discount Banner */}
      <section className="py-16 bg-gradient-to-b from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <DiscountBanner />
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {stats.totalProducts > 0 
                ? `Discover ${stats.totalProducts}+ products across ${stats.totalCategories} categories with the best prices in Pakistan`
                : 'Explore our categories and be the first to add products!'
              }
            </p>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading categories...</p>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category) => (
                <Link key={category.id} to={getCategoryPath(category.name)}>
                  <Card className="hover:shadow-card transition-shadow cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                        {getCategoryIcon(category.name)}
                      </div>
                      <h3 className="font-semibold mb-1">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {category.product_count} items
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No categories available yet.</p>
              <Button asChild>
                <Link to="/seller">Become a Seller</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
              <p className="text-muted-foreground">
                {products.length > 0 
                  ? 'Handpicked products with the best deals'
                  : 'Be the first to add products!'
                }
              </p>
            </div>
            <Link to="/categories">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  original_price={product.original_price}
                  image_url={product.image_url}
                  isOnSale={!!product.original_price}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No products available yet.</p>
              <Button asChild>
                <Link to="/seller">Start Selling</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted Payment Methods</h2>
            <p className="text-muted-foreground">
              Pay securely with your preferred method
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-semibold">Easypaisa</h3>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="font-semibold">JazzCash</h3>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="font-semibold">Credit Card</h3>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="font-semibold">Cash on Delivery</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-accent rounded flex items-center justify-center">
                  <span className="text-accent-foreground font-bold">SP</span>
                </div>
                <span className="text-xl font-bold">ShopPakistan</span>
              </div>
              <p className="text-primary-foreground/80 mb-4">
                Pakistan's most trusted online marketplace with free delivery and easy returns.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><a href="#" className="hover:text-accent">About Us</a></li>
                <li><a href="#" className="hover:text-accent">Contact</a></li>
                <li><a href="#" className="hover:text-accent">Careers</a></li>
                <li><a href="#" className="hover:text-accent">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><Link to="/returns" className="hover:text-accent">Returns</Link></li>
                <li><a href="#" className="hover:text-accent">Shipping Info</a></li>
                <li><Link to="/orders" className="hover:text-accent">Track Order</Link></li>
                <li><a href="#" className="hover:text-accent">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Sellers</h3>
              <ul className="space-y-2 text-primary-foreground/80">
                <li><Link to="/seller" className="hover:text-accent">Sell on ShopPakistan</Link></li>
                <li><Link to="/seller" className="hover:text-accent">Seller Dashboard</Link></li>
                <li><a href="#" className="hover:text-accent">Seller Support</a></li>
                <li><a href="#" className="hover:text-accent">Policies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
            <p>&copy; 2024 ShopPakistan. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;