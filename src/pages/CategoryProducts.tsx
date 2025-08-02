import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Filter, Loader2, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  stock_quantity: number | null;
  is_active: boolean | null;
  seller_id: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

const CategoryProducts = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Convert slug back to category name
  const getCategoryNameFromSlug = (slug: string) => {
    // Handle special cases for category names
    const categoryMap: Record<string, string> = {
      'home-garden': 'Home & Garden',
      'electronics': 'Electronics',
      'fashion': 'Fashion',
      'sports': 'Sports',
      'books': 'Books'
    };
    
    return categoryMap[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (!categorySlug) return;

      try {
        setLoading(true);
        setError(null);

        const categoryName = getCategoryNameFromSlug(categorySlug);

        // First, get the category
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('name', categoryName)
          .single();

        if (categoryError) {
          console.error('Error fetching category:', categoryError);
          setError('Category not found');
          return;
        }

        setCategory(categoryData);

        // Then, get products for this category
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', categoryData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (productsError) {
          console.error('Error fetching products:', productsError);
          setError('Failed to load products');
          return;
        }

        setProducts(productsData || []);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [categorySlug]);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading products...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link to="/categories">Back to Categories</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-4">The category you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/categories">Browse All Categories</Link>
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/categories">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Categories
            </Link>
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{category.name}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mb-4">{category.description}</p>
          )}
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              {products.length} products
            </Badge>
            {filteredProducts.length !== products.length && (
              <Badge variant="outline">
                {filteredProducts.length} filtered
              </Badge>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">
              {searchTerm ? 'No Products Found' : 'No Products Available'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms or browse all products in this category'
                : 'This category is empty. Check back later for new products!'
              }
            </p>
            <div className="flex gap-4 justify-center">
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
              <Button asChild>
                <Link to="/">Browse All Products</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Looking for something else?</h3>
          <p className="text-muted-foreground mb-6">
            Browse other categories or check out our featured products
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/categories">Browse Categories</Link>
            </Button>
            <Button asChild>
              <Link to="/">View All Products</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts; 