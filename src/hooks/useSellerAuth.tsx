import { useState, useEffect } from "react";
import { supabase, isDevelopmentMode } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface Seller {
  id: string;
  email: string;
  full_name: string;
  business_name: string;
  phone: string;
  address: string;
  city: string;
  business_type: string;
  tax_id: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useSellerAuth = () => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is a seller
  const checkSellerStatus = async (userId: string) => {
    try {
      if (isDevelopmentMode) {
        // Mock seller data for development
        const mockSeller: Seller = {
          id: userId,
          email: "seller@example.com",
          full_name: "Ahmed Khan",
          business_name: "TechHub Pakistan",
          phone: "+92-300-1234567",
          address: "123 Main Street, Karachi",
          city: "Karachi",
          business_type: "Electronics",
          tax_id: "NTN-1234567-8",
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setSeller(mockSeller);
        return mockSeller;
      }

      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Seller not found
          return null;
        }
        throw error;
      }

      setSeller(data);
      return data;
    } catch (error) {
      console.error('Error checking seller status:', error);
      return null;
    }
  };

  // Register as a seller
  const registerSeller = async (sellerData: Omit<Seller, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (isDevelopmentMode) {
        // Mock registration for development
        const mockSeller: Seller = {
          ...sellerData,
          id: 'mock-seller-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setSeller(mockSeller);
        toast({
          title: "Success",
          description: "Seller account created successfully!",
        });
        return mockSeller;
      }

      // Use the helper function for seller registration
      const { data, error } = await supabase
        .rpc('register_seller', {
          seller_email: sellerData.email,
          seller_full_name: sellerData.full_name,
          seller_business_name: sellerData.business_name,
          seller_phone: sellerData.phone,
          seller_address: sellerData.address,
          seller_city: sellerData.city,
          seller_business_type: sellerData.business_type,
          seller_tax_id: sellerData.tax_id
        });

      if (error) throw error;

      setSeller(data);
      toast({
        title: "Success",
        description: "Seller account created successfully!",
      });
      return data;
    } catch (error: any) {
      console.error('Error registering seller:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create seller account",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update seller profile
  const updateSellerProfile = async (updates: Partial<Seller>) => {
    try {
      if (!seller) throw new Error("No seller logged in");

      if (isDevelopmentMode) {
        // Mock update for development
        const updatedSeller = { ...seller, ...updates, updated_at: new Date().toISOString() };
        setSeller(updatedSeller);
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
        return updatedSeller;
      }

      const { data, error } = await supabase
        .from('sellers')
        .update(updates)
        .eq('id', seller.id)
        .select()
        .single();

      if (error) throw error;

      setSeller(data);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      return data;
    } catch (error: any) {
      console.error('Error updating seller profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get seller by ID
  const getSellerById = async (sellerId: string) => {
    try {
      if (isDevelopmentMode) {
        // Mock seller data for development
        return {
          id: sellerId,
          email: "seller@example.com",
          full_name: "Ahmed Khan",
          business_name: "TechHub Pakistan",
          phone: "+92-300-1234567",
          address: "123 Main Street, Karachi",
          city: "Karachi",
          business_type: "Electronics",
          tax_id: "NTN-1234567-8",
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', sellerId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting seller:', error);
      return null;
    }
  };

  // Initialize seller auth
  useEffect(() => {
    const initializeSellerAuth = async () => {
      try {
        // Get current user from auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await checkSellerStatus(user.id);
        }
      } catch (error) {
        console.error('Error initializing seller auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSellerAuth();
  }, []);

  return {
    seller,
    loading,
    registerSeller,
    updateSellerProfile,
    getSellerById,
    checkSellerStatus,
  };
}; 