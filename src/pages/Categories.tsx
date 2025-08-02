import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  product_count?: number;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    "Electronics": "📱",
    "Clothing": "👕",
    "Home & Garden": "🏠",
    "Books": "📚",
    "Sports": "⚽",
    "Beauty": "💄",
    "Toys & Games": "🎮",
    "Automotive": "🚗",
    "Health": "💊",
    "Baby & Kids": "👶",
    "Pet Supplies": "🐕",
    "Office Supplies": "📎",
    "Food & Beverages": "🍎",
    "Jewelry": "💍",
    "Music": "🎵",
    "Art & Crafts": "🎨"
  };

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          setError('Failed to load categories');
          return;
        }

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
        console.error('Error:', error);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get icon for category
  const getCategoryIcon = (categoryName: string) => {
    return categoryIcons[categoryName] || "📦";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading categories...</span>
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
            <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Categories</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Shop by Category</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover thousands of products across all categories with the best prices in Pakistan
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No Categories Found</h2>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or browse all categories
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm("")}
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                {searchTerm ? `Search Results (${filteredCategories.length})` : 'All Categories'}
              </h2>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCategories.map((category) => (
                <Link key={category.id} to={getCategoryPath(category.name)}>
                  <Card className="hover:shadow-card transition-shadow cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl group-hover:scale-110 transition-transform">
                          {getCategoryIcon(category.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                            {category.description || 'Explore amazing products in this category'}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {category.product_count || 0} items
                          </Badge>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h3>
          <p className="text-muted-foreground mb-6">
            Browse all products or contact our support team
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link to="/">Browse All Products</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories; 