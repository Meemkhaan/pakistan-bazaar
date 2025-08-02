import { useState, useEffect } from "react";
import { supabase, isDevelopmentMode } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    stock_quantity: number;
  };
}

// Product ID mapping for UUID conversion
const productIdMapping: { [key: string]: string } = {
  "1": "11111111-1111-1111-1111-111111111111",
  "2": "22222222-2222-2222-2222-222222222222", 
  "3": "33333333-3333-3333-3333-333333333333",
  "4": "44444444-4444-4444-4444-444444444444",
  "5": "55555555-5555-5555-5555-555555555555",
  "6": "66666666-6666-6666-6666-666666666666"
};

// Fallback product data for development
const fallbackProducts = {
  "1": {
    id: "1",
    name: "Samsung Galaxy A54 5G - 128GB Storage, 6GB RAM",
    price: 89999,
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    stock_quantity: 15
  },
  "2": {
    id: "2",
    name: "Nike Air Force 1 Original White Sneakers",
    price: 12500,
    image_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
    stock_quantity: 25
  },
  "3": {
    id: "3",
    name: "HP Pavilion 15.6\" Laptop Intel Core i5",
    price: 145000,
    image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    stock_quantity: 8
  },
  "4": {
    id: "4",
    name: "Uniqlo Men's Cotton T-Shirt Pack of 3",
    price: 3500,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    stock_quantity: 30
  },
  "5": {
    id: "5",
    name: "Philips Air Fryer XXL Digital 7.3L",
    price: 35000,
    image_url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    stock_quantity: 12
  },
  "6": {
    id: "6",
    name: "Traditional Pakistani Kurta",
    price: 4500,
    image_url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400",
    stock_quantity: 20
  }
};

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCartItems = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      if (isDevelopmentMode) {
        // Use local storage in development mode
        const localCart = localStorage.getItem(`cart_${user.id}`);
        if (localCart) {
          setCartItems(JSON.parse(localCart));
        } else {
          setCartItems([]);
        }
        return;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          product:products (
            id,
            name,
            price,
            image_url,
            stock_quantity
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error: any) {
      console.error("Error fetching cart items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isDevelopmentMode) {
        // Add to local storage in development mode
        const fallbackProduct = fallbackProducts[productId as keyof typeof fallbackProducts];
        if (!fallbackProduct) {
          toast({
            title: "Error",
            description: "Product not found",
            variant: "destructive",
          });
          return;
        }

        setCartItems(prev => {
          const existingItem = prev.find(item => item.product_id === productId);
          let newCart;
          
          if (existingItem) {
            newCart = prev.map(item =>
              item.product_id === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            const newItem: CartItem = {
              id: `local-${Date.now()}`,
              product_id: productId,
              quantity,
              created_at: new Date().toISOString(),
              product: fallbackProduct
            };
            newCart = [...prev, newItem];
          }
          
          // Save to local storage
          localStorage.setItem(`cart_${user.id}`, JSON.stringify(newCart));
          return newCart;
        });

        toast({
          title: "Success",
          description: "Item added to cart",
        });
        return;
      }

      // Convert simple ID to UUID if needed
      const actualProductId = productIdMapping[productId] || productId;
      
      const { data, error } = await supabase
        .from("cart_items")
        .upsert(
          {
            user_id: user.id,
            product_id: actualProductId,
            quantity,
          },
          {
            onConflict: "user_id,product_id",
          }
        );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item added to cart",
      });

      fetchCartItems();
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      if (isDevelopmentMode) {
        setCartItems(prev => {
          const newCart = prev.map(item =>
            item.id === cartItemId ? { ...item, quantity } : item
          );
          if (user) {
            localStorage.setItem(`cart_${user.id}`, JSON.stringify(newCart));
          }
          return newCart;
        });
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", cartItemId);

      if (error) throw error;
      fetchCartItems();
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      if (isDevelopmentMode) {
        setCartItems(prev => {
          const newCart = prev.filter(item => item.id !== cartItemId);
          if (user) {
            localStorage.setItem(`cart_${user.id}`, JSON.stringify(newCart));
          }
          return newCart;
        });

        toast({
          title: "Success",
          description: "Item removed from cart",
        });
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item removed from cart",
      });

      fetchCartItems();
    } catch (error: any) {
      console.error("Error removing from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      if (isDevelopmentMode) {
        localStorage.removeItem(`cart_${user.id}`);
        setCartItems([]);
        return;
      }

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      setCartItems([]);
    } catch (error: any) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    fetchCartItems,
  };
};