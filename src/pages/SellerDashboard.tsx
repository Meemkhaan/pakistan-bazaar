import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Eye, 
  Edit, 
  Trash2,
  Upload,
  Save,
  LogOut,
  Settings,
  User,
  ShoppingCart,
  Star,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingDown,
  Package2,
  Award,
  Target,
  Zap,
  MessageSquare,
  Printer,
  Download,
  Gift,
  Heart,
  Percent,
  Tag,
  Users2,
  Globe,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ImageUpload } from "@/components/ImageUpload";
import Header from "@/components/Header";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSellerDashboard } from "@/hooks/useSellerDashboard";
import { supabase } from "@/integrations/supabase/client";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { seller, loading: sellerLoading } = useSellerAuth();
  const { signOut } = useAuth();
  const { toast } = useToast();

  // Use comprehensive dashboard hook
  const {
    loading: dashboardLoading,
    products,
    orders,
    analytics,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    updateSettings,
    refreshData
  } = useSellerDashboard(seller?.id || '');

  // States
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Discount management states
  const [discountCodes, setDiscountCodes] = useState<any[]>([]);
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false);
  const [isEditDiscountOpen, setIsEditDiscountOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>(null);
  const [newDiscount, setNewDiscount] = useState({
    code: "",
    type: "percentage",
    value: "",
    min_amount: "",
    max_discount: "",
    description: "",
    usage_limit: "",
    valid_until: "",
    is_active: true
  });

  // Donation management states
  const [charities, setCharities] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [isAddCharityOpen, setIsAddCharityOpen] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<any>(null);
  const [newCharity, setNewCharity] = useState({
    name: "",
    description: "",
    category: "",
    website_url: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    city: "",
    province: "",
    target_amount: "",
    is_active: true
  });

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    originalPrice: "",
    description: "",
    category: "",
    stock: "",
    image_url: "",
    brand: "",
    model: "",
    weight: "",
    dimensions: "",
    color: "",
    size: "",
    material: "",
    warranty: "",
    is_active: true
  });

  const [productImage, setProductImage] = useState("");

  const [storeSettings, setStoreSettings] = useState({
    business_name: settings?.business_name || "",
    phone: settings?.phone || "",
    address: settings?.address || "",
    city: settings?.city || "",
    business_type: settings?.business_type || "",
    description: settings?.description || "",
    auto_fulfill: settings?.auto_fulfill || false,
    email_notifications: settings?.email_notifications || true,
    low_stock_alerts: settings?.low_stock_alerts || true,
    commission_rate: settings?.commission_rate || 15,
    shipping_zones: settings?.shipping_zones || ['Pakistan'],
    return_policy: settings?.return_policy || '30-day return policy'
  });

  // Redirect if not a seller
  useEffect(() => {
    if (!sellerLoading && !seller) {
      toast({
        title: "Access Denied",
        description: "You need to be a registered seller to access this dashboard",
        variant: "destructive",
      });
      navigate("/seller/login");
    }
  }, [seller, sellerLoading, navigate, toast]);

  // Update settings when they load
  useEffect(() => {
    if (settings) {
      setStoreSettings({
        business_name: settings.business_name,
        phone: settings.phone,
        address: settings.address,
        city: settings.city,
        business_type: settings.business_type,
        description: settings.description,
        auto_fulfill: settings.auto_fulfill,
        email_notifications: settings.email_notifications,
        low_stock_alerts: settings.low_stock_alerts,
        commission_rate: settings.commission_rate,
        shipping_zones: settings.shipping_zones,
        return_policy: settings.return_policy
      });
    }
  }, [settings]);

  // Load discount and donation data
  useEffect(() => {
    if (seller) {
      loadDiscountAndDonationData();
    }
  }, [seller]);

  const loadDiscountAndDonationData = async () => {
    try {
      // Load discount codes
      const { data: discountData, error: discountError } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!discountError && discountData) {
        setDiscountCodes(discountData);
      }

      // Load charities
      const { data: charityData, error: charityError } = await supabase
        .from('charities')
        .select('*')
        .order('created_at', { ascending: false });

      if (!charityError && charityData) {
        setCharities(charityData);
      }

      // Load donations
      const { data: donationData, error: donationError } = await supabase
        .from('donations')
        .select('*, charities(name)')
        .order('created_at', { ascending: false });

      if (!donationError && donationData) {
        setDonations(donationData);
      }
    } catch (error) {
      console.error('Error loading discount and donation data:', error);
    }
  };

  const handleAddProduct = async () => {
    if (!seller) return;
    
    setLoading(true);
    try {
      await addProduct({
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        category: newProduct.category,
        stock_quantity: parseInt(newProduct.stock),
        image_url: productImage || newProduct.image_url,
        is_active: true
      });

      setIsAddProductOpen(false);
      setNewProduct({
        name: "", price: "", originalPrice: "", description: "", 
        category: "", stock: "", image_url: "", brand: "", model: "",
        weight: "", dimensions: "", color: "", size: "", material: "", warranty: "", is_active: true
      });
      setProductImage("");
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    
    // Validation
    if (!newProduct.name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
      toast({
        title: "Error",
        description: "Valid price is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!newProduct.stock || parseInt(newProduct.stock) < 0) {
      toast({
        title: "Error",
        description: "Valid stock quantity is required",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      await updateProduct(selectedProduct.id, {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        original_price: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : null,
        description: newProduct.description,
        category: newProduct.category,
        stock_quantity: parseInt(newProduct.stock),
        image_url: productImage || newProduct.image_url,
        is_active: newProduct.is_active
      });
      
      setIsEditProductOpen(false);
      setSelectedProduct(null);
      setProductImage("");
      
      toast({
        title: "Success",
        description: "Product updated successfully!",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      await updateOrderStatus(orderId, status as any, trackingNumber);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(storeSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.original_price?.toString() || "",
      description: product.description || "",
      category: product.category || "Electronics",
      stock: product.stock_quantity.toString(),
      image_url: product.image_url || "",
      brand: "",
      model: "",
      weight: "",
      dimensions: "",
      color: "",
      size: "",
      material: "",
      warranty: "",
      is_active: product.is_active !== false
    });
    setProductImage(product.image_url || "");
    setIsEditProductOpen(true);
  };

  // Discount management handlers
  const handleAddDiscount = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .insert({
          code: newDiscount.code.toUpperCase(),
          type: newDiscount.type,
          value: parseFloat(newDiscount.value),
          min_amount: parseFloat(newDiscount.min_amount) || 0,
          max_discount: newDiscount.max_discount ? parseFloat(newDiscount.max_discount) : null,
          description: newDiscount.description,
          usage_limit: newDiscount.usage_limit ? parseInt(newDiscount.usage_limit) : null,
          valid_until: newDiscount.valid_until || null,
          is_active: newDiscount.is_active
        })
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discount code created successfully!",
      });

      setIsAddDiscountOpen(false);
      setNewDiscount({
        code: "", type: "percentage", value: "", min_amount: "", max_discount: "",
        description: "", usage_limit: "", valid_until: "", is_active: true
      });
      loadDiscountAndDonationData();
    } catch (error) {
      console.error('Error adding discount code:', error);
      toast({
        title: "Error",
        description: "Failed to create discount code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditDiscount = (discount: any) => {
    setSelectedDiscount(discount);
    setNewDiscount({
      code: discount.code,
      type: discount.type,
      value: discount.value.toString(),
      min_amount: discount.min_amount?.toString() || "",
      max_discount: discount.max_discount?.toString() || "",
      description: discount.description || "",
      usage_limit: discount.usage_limit?.toString() || "",
      valid_until: discount.valid_until || "",
      is_active: discount.is_active
    });
    setIsEditDiscountOpen(true);
  };

  const handleUpdateDiscount = async () => {
    if (!selectedDiscount) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({
          code: newDiscount.code.toUpperCase(),
          type: newDiscount.type,
          value: parseFloat(newDiscount.value),
          min_amount: parseFloat(newDiscount.min_amount) || 0,
          max_discount: newDiscount.max_discount ? parseFloat(newDiscount.max_discount) : null,
          description: newDiscount.description,
          usage_limit: newDiscount.usage_limit ? parseInt(newDiscount.usage_limit) : null,
          valid_until: newDiscount.valid_until || null,
          is_active: newDiscount.is_active
        })
        .eq('id', selectedDiscount.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discount code updated successfully!",
      });

      setIsEditDiscountOpen(false);
      setSelectedDiscount(null);
      loadDiscountAndDonationData();
    } catch (error) {
      console.error('Error updating discount code:', error);
      toast({
        title: "Error",
        description: "Failed to update discount code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiscount = async (discountId: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('discount_codes')
        .delete()
        .eq('id', discountId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discount code deleted successfully!",
      });

      loadDiscountAndDonationData();
    } catch (error) {
      console.error('Error deleting discount code:', error);
      toast({
        title: "Error",
        description: "Failed to delete discount code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Donation management handlers
  const handleAddCharity = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('charities')
        .insert({
          name: newCharity.name,
          description: newCharity.description,
          category: newCharity.category,
          website_url: newCharity.website_url,
          contact_email: newCharity.contact_email,
          contact_phone: newCharity.contact_phone,
          address: newCharity.address,
          city: newCharity.city,
          province: newCharity.province,
          target_amount: newCharity.target_amount ? parseFloat(newCharity.target_amount) : null,
          is_active: newCharity.is_active,
          verification_status: 'pending'
        })
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Charity added successfully!",
      });

      setIsAddCharityOpen(false);
      setNewCharity({
        name: "", description: "", category: "", website_url: "",
        contact_email: "", contact_phone: "", address: "", city: "",
        province: "", target_amount: "", is_active: true
      });
      loadDiscountAndDonationData();
    } catch (error) {
      console.error('Error adding charity:', error);
      toast({
        title: "Error",
        description: "Failed to add charity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCharity = (charity: any) => {
    setSelectedCharity(charity);
    setNewCharity({
      name: charity.name,
      description: charity.description || "",
      category: charity.category,
      website_url: charity.website_url || "",
      contact_email: charity.contact_email || "",
      contact_phone: charity.contact_phone || "",
      address: charity.address || "",
      city: charity.city || "",
      province: charity.province || "",
      target_amount: charity.target_amount?.toString() || "",
      is_active: charity.is_active
    });
    setIsAddCharityOpen(true);
  };

  const handleUpdateCharity = async () => {
    if (!selectedCharity) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('charities')
        .update({
          name: newCharity.name,
          description: newCharity.description,
          category: newCharity.category,
          website_url: newCharity.website_url,
          contact_email: newCharity.contact_email,
          contact_phone: newCharity.contact_phone,
          address: newCharity.address,
          city: newCharity.city,
          province: newCharity.province,
          target_amount: newCharity.target_amount ? parseFloat(newCharity.target_amount) : null,
          is_active: newCharity.is_active
        })
        .eq('id', selectedCharity.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Charity updated successfully!",
      });

      setIsAddCharityOpen(false);
      setSelectedCharity(null);
      loadDiscountAndDonationData();
    } catch (error) {
      console.error('Error updating charity:', error);
      toast({
        title: "Error",
        description: "Failed to update charity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCharity = async (charityId: string) => {
    if (!confirm('Are you sure you want to delete this charity?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('charities')
        .delete()
        .eq('id', charityId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Charity deleted successfully!",
      });

      loadDiscountAndDonationData();
    } catch (error) {
      console.error('Error deleting charity:', error);
      toast({
        title: "Error",
        description: "Failed to delete charity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (sellerLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not a seller
  if (!seller) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
            <div className="text-muted-foreground">
              Welcome back, {seller.business_name}!
              {seller.is_verified ? (
                <Badge variant="default" className="ml-2 bg-green-500">
                  ✓ Verified Seller
                </Badge>
              ) : (
                <Badge variant="secondary" className="ml-2">
                  Pending Verification
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <Zap className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                      <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="inventory">Product Inventory</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="discounts">Discounts</TabsTrigger>
              <TabsTrigger value="donations">Donations</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Store Settings</TabsTrigger>
            </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rs. {analytics?.totalSales.toLocaleString() || '0'}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.monthlyGrowth > 0 ? '+' : ''}{analytics?.monthlyGrowth.toFixed(1)}% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalOrders || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {orders.filter(o => o.status === 'pending').length} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalProducts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.lowStockProducts || 0} low stock
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalCustomers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Unique customers
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Chart */}
            {analytics && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.revenueByMonth.map((month, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{month.month}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={(month.revenue / Math.max(...analytics.revenueByMonth.map(m => m.revenue))) * 100} className="w-24" />
                          <span className="text-sm font-bold">Rs. {month.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Products */}
            {analytics && analytics.topProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">Rs. {product.revenue.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rs. {order.total_amount.toLocaleString()}</p>
                        <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Product Inventory</h2>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Add a new product to your inventory. Fill in the details and upload an image.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          placeholder="Enter product name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Fashion">Fashion</SelectItem>
                            <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Books">Books</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (Rs.) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                          placeholder="89999"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock Quantity *</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                          placeholder="15"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={newProduct.brand}
                          onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                          placeholder="e.g. Samsung"
                        />
                      </div>
                      <div>
                        <Label htmlFor="model">Model</Label>
                        <Input
                          id="model"
                          value={newProduct.model}
                          onChange={(e) => setNewProduct({...newProduct, model: e.target.value})}
                          placeholder="e.g. Galaxy S24"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        placeholder="Enter detailed product description..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="warranty">Warranty</Label>
                        <Input
                          id="warranty"
                          value={newProduct.warranty}
                          onChange={(e) => setNewProduct({...newProduct, warranty: e.target.value})}
                          placeholder="e.g. 1 Year"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Product Image</Label>
                      <ImageUpload
                        onImageUploaded={setProductImage}
                        currentImage={productImage}
                        className="mt-2"
                        productId={`new-${Date.now()}`}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddProduct} disabled={loading}>
                        {loading ? "Adding..." : "Add Product"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-lg font-bold">Rs. {product.price.toLocaleString()}</span>
                            {product.original_price && (
                              <span className="text-sm text-muted-foreground line-through">Rs. {product.original_price.toLocaleString()}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{product.views} views</span>
                            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{product.sales_count} sold</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">Stock: {product.stock_quantity}</p>
                          <Badge variant={product.stock_quantity < 10 ? "destructive" : "default"}>
                            {product.stock_quantity < 10 ? "Low Stock" : "In Stock"}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Orders Management</h2>
              <div className="flex items-center space-x-4">
                <Input
                  placeholder="Search orders..."
                  className="w-64"
                  onChange={(e) => {
                    // Add search functionality
                    const searchTerm = e.target.value.toLowerCase();
                    // This would filter orders based on customer name, email, or order number
                  }}
                />
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Orders Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold">{orders.length}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {orders.filter(o => o.status === 'pending').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Processing</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {orders.filter(o => o.status === 'processing').length}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Delivered</p>
                      <p className="text-2xl font-bold text-green-600">
                        {orders.filter(o => o.status === 'delivered').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                    <p className="text-muted-foreground">Orders will appear here once customers start placing them.</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{order.order_number}</h3>
                          <p className="text-sm text-muted-foreground">{order.customer_name} • {order.customer_email}</p>
                          <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">Rs. {order.total_amount.toLocaleString()}</p>
                          <Badge variant={
                            order.status === 'pending' ? 'secondary' :
                            order.status === 'confirmed' ? 'default' :
                            order.status === 'processing' ? 'default' :
                            order.status === 'shipped' ? 'default' :
                            order.status === 'delivered' ? 'default' :
                            'destructive'
                          } className="mt-2">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Order Items */}
                      <div className="bg-muted/50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium">{item.quantity}</span>
                                </div>
                                <span className="font-medium">{item.product_name}</span>
                              </div>
                              <span className="font-semibold">Rs. {item.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Order Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium mb-2">Shipping Information</h4>
                          <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                          <p className="text-sm text-muted-foreground">{order.shipping_city}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Payment Information</h4>
                          <p className="text-sm text-muted-foreground">{order.payment_method}</p>
                          <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className="mt-1">
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      {/* Discount & Donation Information */}
                      {(order.discount_amount > 0 || order.donation_amount > 0) && (
                        <div className="bg-muted/30 rounded-lg p-4 mb-4">
                          <h4 className="font-medium mb-3">Discount & Donation</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {order.discount_amount > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Gift className="w-4 h-4" />
                                  Discount Applied
                                </span>
                                <span className="text-sm font-medium text-green-600">
                                  -Rs. {order.discount_amount?.toLocaleString() || 0}
                                </span>
                              </div>
                            )}
                            {order.donation_amount > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Heart className="w-4 h-4" />
                                  Donation Added
                                </span>
                                <span className="text-sm font-medium text-red-600">
                                  +Rs. {order.donation_amount?.toLocaleString() || 0}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tracking Number */}
                      {order.tracking_number && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Tracking Number</h4>
                          <p className="text-sm font-mono bg-muted p-2 rounded">{order.tracking_number}</p>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Select value={order.status} onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contact
                          </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Invoice
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics & Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>This Month</span>
                      <span className="font-bold">Rs. {analytics?.totalSales.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Growth Rate</span>
                      <span className={`font-bold ${analytics?.monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analytics?.monthlyGrowth > 0 ? '+' : ''}{analytics?.monthlyGrowth.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg Order Value</span>
                      <span className="font-bold">
                        Rs. {analytics && analytics.totalOrders > 0 ? (analytics.totalSales / analytics.totalOrders).toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.orderStatusDistribution && Object.entries(analytics.orderStatusDistribution).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="capitalize">{status}</span>
                        <Badge variant="default">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Low Stock Items</span>
                      <Badge variant="destructive">{analytics?.lowStockProducts || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Out of Stock</span>
                      <Badge variant="destructive">{analytics?.outOfStockProducts || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active Products</span>
                      <Badge variant="default">{products.filter(p => p.is_active).length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Total Customers</span>
                      <Badge variant="default">{analytics?.totalCustomers || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Repeat Customers</span>
                      <Badge variant="default">
                        {orders.filter(o => o.customer_email).length > 0 ? 
                          new Set(orders.map(o => o.customer_email)).size : 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Conversion Rate</span>
                      <Badge variant="default">
                        {analytics && analytics.totalViews > 0 ? 
                          ((analytics.totalOrders / analytics.totalViews) * 100).toFixed(1) + '%' : '0%'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Discounts Tab */}
          <TabsContent value="discounts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Discount Management</h2>
              <Button onClick={() => setIsAddDiscountOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Discount Code
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {discountCodes.map((discount) => (
                <Card key={discount.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-primary" />
                        {discount.code}
                      </CardTitle>
                      <Badge variant={discount.is_active ? "default" : "secondary"}>
                        {discount.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <div className="flex items-center">
                        <Badge variant="outline">
                          {discount.type === 'percentage' ? <Percent className="w-3 h-3 mr-1" /> : <DollarSign className="w-3 h-3 mr-1" />}
                          {discount.type === 'percentage' ? `${discount.value}%` : `Rs. ${discount.value}`}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Min Amount</span>
                      <span className="text-sm font-medium">Rs. {discount.min_amount}</span>
                    </div>
                    
                    {discount.max_discount && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Max Discount</span>
                        <span className="text-sm font-medium">Rs. {discount.max_discount}</span>
                      </div>
                    )}
                    
                    {discount.usage_limit && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Usage Limit</span>
                        <span className="text-sm font-medium">{discount.usage_count || 0}/{discount.usage_limit}</span>
                      </div>
                    )}
                    
                    {discount.description && (
                      <p className="text-sm text-muted-foreground">{discount.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditDiscount(discount)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteDiscount(discount.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Switch
                        checked={discount.is_active}
                        onCheckedChange={(checked) => {
                          setNewDiscount({...newDiscount, is_active: checked});
                          handleUpdateDiscount();
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add/Edit Discount Dialog */}
            <Dialog open={isAddDiscountOpen || isEditDiscountOpen} onOpenChange={setIsAddDiscountOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{isEditDiscountOpen ? 'Edit Discount Code' : 'Add New Discount Code'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="discount_code">Discount Code *</Label>
                    <Input
                      id="discount_code"
                      value={newDiscount.code}
                      onChange={(e) => setNewDiscount({...newDiscount, code: e.target.value})}
                      placeholder="WELCOME10"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discount_type">Type *</Label>
                      <Select value={newDiscount.type} onValueChange={(value) => setNewDiscount({...newDiscount, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="discount_value">Value *</Label>
                      <Input
                        id="discount_value"
                        type="number"
                        value={newDiscount.value}
                        onChange={(e) => setNewDiscount({...newDiscount, value: e.target.value})}
                        placeholder={newDiscount.type === 'percentage' ? "10" : "500"}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min_amount">Minimum Amount</Label>
                      <Input
                        id="min_amount"
                        type="number"
                        value={newDiscount.min_amount}
                        onChange={(e) => setNewDiscount({...newDiscount, min_amount: e.target.value})}
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_discount">Max Discount</Label>
                      <Input
                        id="max_discount"
                        type="number"
                        value={newDiscount.max_discount}
                        onChange={(e) => setNewDiscount({...newDiscount, max_discount: e.target.value})}
                        placeholder="1000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="usage_limit">Usage Limit</Label>
                    <Input
                      id="usage_limit"
                      type="number"
                      value={newDiscount.usage_limit}
                      onChange={(e) => setNewDiscount({...newDiscount, usage_limit: e.target.value})}
                      placeholder="100"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="discount_description">Description</Label>
                    <Textarea
                      id="discount_description"
                      value={newDiscount.description}
                      onChange={(e) => setNewDiscount({...newDiscount, description: e.target.value})}
                      placeholder="Description of the discount code"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="discount_active"
                      checked={newDiscount.is_active}
                      onCheckedChange={(checked) => setNewDiscount({...newDiscount, is_active: checked})}
                    />
                    <Label htmlFor="discount_active">Active</Label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => {
                      setIsAddDiscountOpen(false);
                      setIsEditDiscountOpen(false);
                      setSelectedDiscount(null);
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={isEditDiscountOpen ? handleUpdateDiscount : handleAddDiscount}>
                      {isEditDiscountOpen ? 'Update' : 'Create'} Discount
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Donation Management</h2>
              <Button onClick={() => setIsAddCharityOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Charity
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {charities.map((charity) => (
                <Card key={charity.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        {charity.name}
                      </CardTitle>
                      <Badge variant={charity.is_active ? "default" : "secondary"}>
                        {charity.verification_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <div className="flex items-center">
                        <Badge variant="outline">{charity.category}</Badge>
                      </div>
                    </div>
                    
                    {charity.description && (
                      <p className="text-sm text-muted-foreground">{charity.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      {charity.contact_email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{charity.contact_email}</span>
                        </div>
                      )}
                      
                      {charity.contact_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{charity.contact_phone}</span>
                        </div>
                      )}
                      
                      {charity.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{charity.address}, {charity.city}</span>
                        </div>
                      )}
                    </div>
                    
                    {charity.target_amount && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Fundraising Progress</span>
                          <span className="text-sm text-muted-foreground">
                            Rs. {charity.raised_amount?.toLocaleString() || 0} / Rs. {charity.target_amount.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={charity.target_amount > 0 ? (charity.raised_amount / charity.target_amount) * 100 : 0} 
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditCharity(charity)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteCharity(charity.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Switch
                        checked={charity.is_active}
                        onCheckedChange={(checked) => {
                          setNewCharity({...newCharity, is_active: checked});
                          handleUpdateCharity();
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Donation Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Donation Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      Rs. {donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Donations</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {donations.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Donation Transactions</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {charities.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Active Charities</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add/Edit Charity Dialog */}
            <Dialog open={isAddCharityOpen} onOpenChange={setIsAddCharityOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{selectedCharity ? 'Edit Charity' : 'Add New Charity'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="charity_name">Charity Name *</Label>
                    <Input
                      id="charity_name"
                      value={newCharity.name}
                      onChange={(e) => setNewCharity({...newCharity, name: e.target.value})}
                      placeholder="Charity Name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="charity_category">Category *</Label>
                    <Select value={newCharity.category} onValueChange={(value) => setNewCharity({...newCharity, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Poverty Relief">Poverty Relief</SelectItem>
                        <SelectItem value="Emergency Services">Emergency Services</SelectItem>
                        <SelectItem value="Environmental">Environmental</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="charity_description">Description</Label>
                    <Textarea
                      id="charity_description"
                      value={newCharity.description}
                      onChange={(e) => setNewCharity({...newCharity, description: e.target.value})}
                      placeholder="Description of the charity"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="charity_email">Email</Label>
                      <Input
                        id="charity_email"
                        type="email"
                        value={newCharity.contact_email}
                        onChange={(e) => setNewCharity({...newCharity, contact_email: e.target.value})}
                        placeholder="contact@charity.org"
                      />
                    </div>
                    <div>
                      <Label htmlFor="charity_phone">Phone</Label>
                      <Input
                        id="charity_phone"
                        value={newCharity.contact_phone}
                        onChange={(e) => setNewCharity({...newCharity, contact_phone: e.target.value})}
                        placeholder="+92-300-1234567"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="charity_address">Address</Label>
                    <Input
                      id="charity_address"
                      value={newCharity.address}
                      onChange={(e) => setNewCharity({...newCharity, address: e.target.value})}
                      placeholder="Street Address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="charity_city">City</Label>
                      <Input
                        id="charity_city"
                        value={newCharity.city}
                        onChange={(e) => setNewCharity({...newCharity, city: e.target.value})}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="charity_province">Province</Label>
                      <Input
                        id="charity_province"
                        value={newCharity.province}
                        onChange={(e) => setNewCharity({...newCharity, province: e.target.value})}
                        placeholder="Province"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="charity_target">Target Amount</Label>
                    <Input
                      id="charity_target"
                      type="number"
                      value={newCharity.target_amount}
                      onChange={(e) => setNewCharity({...newCharity, target_amount: e.target.value})}
                      placeholder="500000"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="charity_active"
                      checked={newCharity.is_active}
                      onCheckedChange={(checked) => setNewCharity({...newCharity, is_active: checked})}
                    />
                    <Label htmlFor="charity_active">Active</Label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => {
                      setIsAddCharityOpen(false);
                      setSelectedCharity(null);
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={selectedCharity ? handleUpdateCharity : handleAddCharity}>
                      {selectedCharity ? 'Update' : 'Create'} Charity
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Store Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-bold">Store Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_name">Business Name *</Label>
                    <Input
                      id="business_name"
                      value={storeSettings.business_name}
                      onChange={(e) => setStoreSettings({...storeSettings, business_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={storeSettings.phone}
                      onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={storeSettings.city}
                      onChange={(e) => setStoreSettings({...storeSettings, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="business_type">Business Type *</Label>
                    <Input
                      id="business_type"
                      value={storeSettings.business_type}
                      onChange={(e) => setStoreSettings({...storeSettings, business_type: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    value={storeSettings.description}
                    onChange={(e) => setStoreSettings({...storeSettings, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                    <Input
                      id="commission_rate"
                      type="number"
                      value={storeSettings.commission_rate}
                      onChange={(e) => setStoreSettings({...storeSettings, commission_rate: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="return_policy">Return Policy</Label>
                    <Input
                      id="return_policy"
                      value={storeSettings.return_policy}
                      onChange={(e) => setStoreSettings({...storeSettings, return_policy: e.target.value})}
                    />
                  </div>
                </div>
                
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_fulfill">Auto-fulfill Orders</Label>
                    <p className="text-sm text-muted-foreground">Automatically confirm orders when payment is received</p>
                  </div>
                  <Switch
                    id="auto_fulfill"
                    checked={storeSettings.auto_fulfill}
                    onCheckedChange={(checked) => setStoreSettings({...storeSettings, auto_fulfill: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications for new orders</p>
                  </div>
                  <Switch
                    id="email_notifications"
                    checked={storeSettings.email_notifications}
                    onCheckedChange={(checked) => setStoreSettings({...storeSettings, email_notifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="low_stock_alerts">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
                  </div>
                  <Switch
                    id="low_stock_alerts"
                    checked={storeSettings.low_stock_alerts}
                    onCheckedChange={(checked) => setStoreSettings({...storeSettings, low_stock_alerts: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Product Dialog */}
        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Modify existing product details. Update name, price, stock, and other attributes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Product Preview */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Product Preview</h4>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    {productImage || newProduct.image_url ? (
                      <img 
                        src={productImage || newProduct.image_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-lg" 
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{newProduct.name || "Product Name"}</p>
                    <p className="text-sm text-muted-foreground">
                      {newProduct.category || "Category"} • {newProduct.stock || 0} in stock
                    </p>
                    <p className="text-lg font-bold">
                      Rs. {newProduct.price ? parseFloat(newProduct.price).toLocaleString() : "0"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_name">Product Name *</Label>
                    <Input
                      id="edit_name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_category">Category *</Label>
                    <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Books">Books</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Pricing & Stock */}
              <div className="space-y-4">
                <h4 className="font-semibold">Pricing & Stock</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit_price">Price (Rs.) *</Label>
                    <Input
                      id="edit_price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      placeholder="89999"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_originalPrice">Original Price (Rs.)</Label>
                    <Input
                      id="edit_originalPrice"
                      type="number"
                      value={newProduct.originalPrice}
                      onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                      placeholder="99999"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_stock">Stock Quantity *</Label>
                    <Input
                      id="edit_stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      placeholder="15"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h4 className="font-semibold">Description</h4>
                <div>
                  <Label htmlFor="edit_description">Product Description</Label>
                  <Textarea
                    id="edit_description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    rows={4}
                    placeholder="Enter detailed product description..."
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <h4 className="font-semibold">Product Image</h4>
                <ImageUpload
                  onImageUploaded={setProductImage}
                  currentImage={productImage || newProduct.image_url}
                  className="mt-2"
                  productId={selectedProduct?.id}
                />
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h4 className="font-semibold">Product Status</h4>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_is_active"
                    checked={newProduct.is_active !== false}
                    onCheckedChange={(checked) => setNewProduct({...newProduct, is_active: checked})}
                  />
                  <Label htmlFor="edit_is_active">Active (visible to customers)</Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditProductOpen(false);
                    setSelectedProduct(null);
                    setProductImage("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateProduct} 
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Product"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SellerDashboard;