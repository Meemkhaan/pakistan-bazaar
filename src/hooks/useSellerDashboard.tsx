import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description?: string;
  category_id?: string;
  category?: string;
  stock_quantity: number;
  is_active: boolean;
  image_url?: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  views: number;
  sales_count: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  shipping_address: string;
  shipping_city: string;
  tracking_number?: string;
  discount_code_id?: string;
  discount_amount?: number;
  donation_amount?: number;
  final_amount?: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Analytics {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  monthlyGrowth: number;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  orderStatusDistribution: Record<string, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  lowStockProducts: number;
  outOfStockProducts: number;
}

export interface StoreSettings {
  business_name: string;
  phone: string;
  address: string;
  city: string;
  business_type: string;
  description: string;
  auto_fulfill: boolean;
  email_notifications: boolean;
  low_stock_alerts: boolean;
  commission_rate: number;
  shipping_zones: string[];
  return_policy: string;
}

export const useSellerDashboard = (sellerId: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!sellerId) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadProducts(),
        loadOrders(),
        loadAnalytics(),
        loadSettings()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [sellerId, toast]);

  // Load products
  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add mock stats for demo and map category_id to category
      const productsWithStats = data?.map(product => ({
        ...product,
        category: product.category_id || 'Electronics', // Default category
        sales_count: Math.floor(Math.random() * 50) + 1,
        views: Math.floor(Math.random() * 1000) + 100
      })) || [];

      setProducts(productsWithStats);
    } catch (error) {
      console.error('Error loading products:', error);
      throw error;
    }
  };

  // Load orders (show all orders for marketplace view)
  const loadOrders = async () => {
    try {
      // Get all orders with their items and product details
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            price,
            quantity,
            product_id,
            products (
              name,
              seller_id
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Orders fetch error:', ordersError);
        throw ordersError;
      }

      if (!Array.isArray(ordersData) || ordersData.length === 0) {
        console.log('SELLER DASHBOARD DEBUG: ordersData', ordersData);
        setOrders([]);
        return;
      }

      console.log('SELLER DASHBOARD DEBUG: ordersData', ordersData);

      // Transform orders to include seller information
      const transformedOrders: Order[] = ordersData.map(order => {
        // Show ALL items for debugging
        const allItems = order.order_items || [];
        
        // Calculate total for all items
        const totalAmount = allItems.reduce((sum, item) => 
          sum + (Number(item.price) * Number(item.quantity)), 0
        );

        return {
          id: order.id,
          order_number: order.id.slice(0, 8).toUpperCase(),
          customer_name: 'Customer', // You can fetch user info if needed
          customer_email: 'customer@example.com',
          customer_phone: '+92-300-0000000',
          total_amount: totalAmount, // Show total amount
          status: order.status,
          payment_method: order.payment_method || 'Cash on Delivery',
          payment_status: 'pending',
          shipping_address: order.shipping_address,
          shipping_city: order.shipping_address?.split(',').pop()?.trim() || 'Unknown',
          tracking_number: null,
          discount_code_id: order.discount_code_id,
          discount_amount: Number(order.discount_amount) || 0,
          donation_amount: Number(order.donation_amount) || 0,
          final_amount: Number(order.final_amount) || Number(order.total_amount),
          created_at: order.created_at,
          updated_at: order.updated_at,
          items: allItems.map(item => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.products?.name || 'Product',
            quantity: item.quantity,
            price: Number(item.price),
            subtotal: Number(item.price) * Number(item.quantity)
          }))
        };
      }); // Show ALL orders for debugging

      console.log('SELLER DASHBOARD DEBUG: transformedOrders', transformedOrders);
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    }
  };

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const totalSales = orders.reduce((sum, order) => 
        order.status !== 'cancelled' ? sum + order.total_amount : sum, 0);
      
      const totalOrders = orders.length;
      const totalProducts = products.length;
      const totalCustomers = new Set(orders.map(o => o.customer_email)).size;
      
      const monthlyGrowth = 15.5; // Mock growth

      const topProducts = products
        .sort((a, b) => b.sales_count - a.sales_count)
        .slice(0, 5)
        .map(p => ({
          name: p.name,
          sales: p.sales_count,
          revenue: p.sales_count * p.price
        }));

      const orderStatusDistribution = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const revenueByMonth = [
        { month: 'Jan 2024', revenue: 150000 },
        { month: 'Feb 2024', revenue: 180000 },
        { month: 'Mar 2024', revenue: 220000 },
        { month: 'Apr 2024', revenue: 195000 },
        { month: 'May 2024', revenue: 250000 },
        { month: 'Jun 2024', revenue: 280000 }
      ];

      const lowStockProducts = products.filter(p => p.stock_quantity < 10).length;
      const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length;

      setAnalytics({
        totalSales,
        totalOrders,
        totalProducts,
        totalCustomers,
        monthlyGrowth,
        topProducts,
        orderStatusDistribution,
        revenueByMonth,
        lowStockProducts,
        outOfStockProducts
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      throw error;
    }
  };

  // Load settings
  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', sellerId)
        .single();

      if (error) throw error;

      setSettings({
        business_name: data.business_name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        business_type: data.business_type,
        description: '', // Default empty description
        auto_fulfill: false,
        email_notifications: true,
        low_stock_alerts: true,
        commission_rate: 15,
        shipping_zones: ['Pakistan'],
        return_policy: '30-day return policy'
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      throw error;
    }
  };

  // Product management functions
  const addProduct = async (productData: {
    name: string;
    price: number;
    original_price?: number;
    description?: string;
    category: string;
    stock_quantity: number;
    image_url?: string;
    is_active: boolean;
  }) => {
    try {
      // Simple insert without any select query to avoid 400 error
      const { error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          price: productData.price,
          original_price: productData.original_price,
          description: productData.description,
          category_id: null, // Use null since we don't have actual category UUIDs
          stock_quantity: productData.stock_quantity,
          image_url: productData.image_url,
          is_active: productData.is_active,
          seller_id: sellerId
        });

      if (error) throw error;

      // Add the new product to state manually
      const newProduct = {
        id: Date.now().toString(), // Temporary ID
        name: productData.name,
        price: productData.price,
        original_price: productData.original_price,
        description: productData.description,
        category: productData.category,
        stock_quantity: productData.stock_quantity,
        image_url: productData.image_url,
        is_active: productData.is_active,
        seller_id: sellerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
        sales_count: 0
      };

      setProducts([newProduct, ...products]);
      
      toast({
        title: "Success",
        description: "Product added successfully!",
      });

      return newProduct;
    } catch (error: any) {
      console.error('Add product error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      // Simple update without select query to avoid 400 error
      const { error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          price: updates.price,
          original_price: updates.original_price,
          description: updates.description,
          category_id: null, // Use null since we don't have actual category UUIDs
          stock_quantity: updates.stock_quantity,
          image_url: updates.image_url,
          is_active: updates.is_active
        })
        .eq('id', productId);

      if (error) throw error;

      // Update the product in state manually
      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, ...updates }
          : p
      ));
      
      toast({
        title: "Success",
        description: "Product updated successfully!",
      });

      return { id: productId, ...updates };
    } catch (error: any) {
      console.error('Update product error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productId));
      
      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Order management functions
  const updateOrderStatus = async (orderId: string, status: Order['status'], trackingNumber?: string) => {
    try {
      // Mock update for demo
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status, tracking_number: trackingNumber }
          : order
      ));
      
      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Settings management functions
  const updateSettings = async (updates: Partial<StoreSettings>) => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update(updates)
        .eq('id', sellerId);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Success",
        description: "Settings updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Initialize dashboard
  useEffect(() => {
    if (sellerId) {
      loadDashboardData();
    }
  }, [sellerId, loadDashboardData]);

  return {
    loading,
    products,
    orders,
    analytics,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    updateSettings,
    refreshData: loadDashboardData
  };
}; 