import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Donation {
  id: string;
  donor_id: string;
  product_name: string;
  description: string | null;
  condition: string;
  category: string;
  estimated_value: number;
  quantity: number;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  pickup_address: string;
  pickup_city: string;
  preferred_pickup_date: string | null;
  additional_notes: string | null;
  image_urls: string[];
  status: 'pending' | 'approved' | 'rejected' | 'picked_up' | 'completed';
  admin_notes: string | null;
  pickup_date: string | null;
  pickup_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonationStats {
  total_donations: number;
  pending_donations: number;
  approved_donations: number;
  picked_up_donations: number;
  completed_donations: number;
  total_estimated_value: number;
  avg_estimated_value: number;
}

export const useDonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's donations
  const fetchUserDonations = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all donations (admin only)
  const fetchAllDonations = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (err) {
      console.error('Error fetching all donations:', err);
      setError('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch donation statistics
  const fetchDonationStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('donation_stats')
        .select('*')
        .single();

      if (error) throw error;
      setStats(data);
    } catch (err) {
      console.error('Error fetching donation stats:', err);
      setError('Failed to fetch donation statistics');
    } finally {
      setLoading(false);
    }
  };

  // Update donation status (admin only)
  const updateDonationStatus = async (donationId: string, status: Donation['status'], adminNotes?: string) => {
    setLoading(true);
    setError(null);

    try {
      const updateData: any = { status };
      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { error } = await supabase
        .from('donations')
        .update(updateData)
        .eq('id', donationId);

      if (error) throw error;

      // Refresh donations
      await fetchAllDonations();
    } catch (err) {
      console.error('Error updating donation status:', err);
      setError('Failed to update donation status');
    } finally {
      setLoading(false);
    }
  };

  // Schedule pickup
  const schedulePickup = async (donationId: string, pickupDate: string, pickupTime: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('donations')
        .update({
          pickup_date: pickupDate,
          pickup_time: pickupTime,
          status: 'approved'
        })
        .eq('id', donationId);

      if (error) throw error;

      // Refresh donations
      await fetchAllDonations();
    } catch (err) {
      console.error('Error scheduling pickup:', err);
      setError('Failed to schedule pickup');
    } finally {
      setLoading(false);
    }
  };

  // Delete donation (admin only)
  const deleteDonation = async (donationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('donations')
        .delete()
        .eq('id', donationId);

      if (error) throw error;

      // Refresh donations
      await fetchAllDonations();
    } catch (err) {
      console.error('Error deleting donation:', err);
      setError('Failed to delete donation');
    } finally {
      setLoading(false);
    }
  };

  // Get donations by status
  const getDonationsByStatus = (status: Donation['status']) => {
    return donations.filter(donation => donation.status === status);
  };

  // Get donations by category
  const getDonationsByCategory = (category: string) => {
    return donations.filter(donation => donation.category === category);
  };

  return {
    donations,
    stats,
    loading,
    error,
    fetchUserDonations,
    fetchAllDonations,
    fetchDonationStats,
    updateDonationStatus,
    schedulePickup,
    deleteDonation,
    getDonationsByStatus,
    getDonationsByCategory,
  };
}; 