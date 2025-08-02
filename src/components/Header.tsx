import { ShoppingCart, User, Menu, Search, Heart, AlertCircle, Store, UserCheck, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { useCart } from "@/hooks/useCart";
import { isDevelopmentMode } from "@/integrations/supabase/client";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const { user, signOut } = useAuth();
  const { seller } = useSellerAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const cartItemCount = getTotalItems();

  // Check if user is a seller
  useEffect(() => {
    if (user && seller) {
      setIsSeller(true);
    } else {
      setIsSeller(false);
    }
  }, [user, seller]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      {/* Development Mode Banner */}
      {isDevelopmentMode && (
        <div className="bg-yellow-500 text-yellow-900 py-1">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center text-xs font-medium">
              <AlertCircle className="w-3 h-3 mr-1" />
              Development Mode - Database Offline (Local Storage Active)
            </div>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center text-sm font-medium animate-bounce-gentle">
            <span>🇵🇰 Free Delivery Across Pakistan | 40-Day Return Policy | Donate Items for Community</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">PB</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Pakistan Bazaar</h1>
              <p className="text-xs text-muted-foreground">Shop & Donate for Community</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search products, brands, and more..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/donations">
              <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>Donations</span>
              </Button>
            </Link>
            
            <Link to="/donate">
              <Button size="sm" className="hidden md:flex items-center space-x-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                <Gift className="w-4 h-4" />
                <span>Donate</span>
              </Button>
            </Link>
            
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative hover:bg-accent/50 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground animate-pulse">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Welcome, {isDevelopmentMode ? user.email : user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <User className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden relative"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="border-t border-border">
        <div className="container mx-auto px-4">
                      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
              <div className="flex flex-col md:flex-row md:space-x-8 py-4">
                <Link to="/" className="text-foreground hover:text-primary py-2 md:py-0 font-medium">
                  Home
                </Link>
                <Link to="/categories" className="text-foreground hover:text-primary py-2 md:py-0">
                  Categories
                </Link>
                <Link to="/category/electronics" className="text-foreground hover:text-primary py-2 md:py-0">
                  Electronics
                </Link>
                <Link to="/category/fashion" className="text-foreground hover:text-primary py-2 md:py-0">
                  Fashion
                </Link>
                <Link to="/category/home-garden" className="text-foreground hover:text-primary py-2 md:py-0">
                  Home & Garden
                </Link>
                <Link to="/category/sports" className="text-foreground hover:text-primary py-2 md:py-0">
                  Sports
                </Link>
                <Link to="/donations" className="text-foreground hover:text-primary py-2 md:py-0 flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  <span>Donations</span>
                </Link>
                <Link to="/donate" className="text-foreground hover:text-primary py-2 md:py-0 flex items-center">
                  <Gift className="w-4 h-4 mr-2" />
                  <span>Donate</span>
                </Link>
                <Link to="/cart" className="text-foreground hover:text-primary py-2 md:py-0 flex items-center justify-between">
                  <span>Cart</span>
                  {cartItemCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Badge>
                  )}
                </Link>
                              {user ? (
                isSeller ? (
                  <Link to="/seller/dashboard" className="text-accent hover:text-accent-foreground py-2 md:py-0 font-medium flex items-center">
                    <Store className="w-4 h-4 mr-2" />
                    Seller Dashboard
                  </Link>
                ) : (
                  <Link to="/customer/dashboard" className="text-primary hover:text-primary-foreground py-2 md:py-0 font-medium flex items-center">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Customer Dashboard
                  </Link>
                )
              ) : (
                <Link to="/seller/register" className="text-accent hover:text-accent-foreground py-2 md:py-0 font-medium">
                  Become a Seller
                </Link>
              )}
              </div>
            </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;