import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import ProductPage from "./pages/ProductPage";
import SellerDashboard from "./pages/SellerDashboard";
import SellerLogin from "./pages/SellerLogin";
import SellerRegistration from "./pages/SellerRegistration";
import CustomerDashboard from "./pages/CustomerDashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Returns from "./pages/Returns";
import Auth from "./pages/Auth";
import Orders from "./pages/Orders";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import Donations from "./pages/Donations";
import DonateProduct from "./pages/DonateProduct";
import DonationConfirmation from "./pages/DonationConfirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:categorySlug" element={<CategoryProducts />} />
            <Route path="/product/:id" element={<ProductPage />} />
            
            {/* Seller Routes */}
            <Route path="/seller/login" element={<SellerLogin />} />
            <Route path="/seller/register" element={<SellerRegistration />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller" element={<SellerDashboard />} />
            
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/donate" element={<DonateProduct />} />
            <Route path="/donate/confirmation" element={<DonationConfirmation />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
