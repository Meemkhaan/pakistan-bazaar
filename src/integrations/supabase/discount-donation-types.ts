// =====================================================
// DISCOUNT & DONATION TYPES FOR SHOPPAKISTAN
// =====================================================

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_amount: number;
  max_discount?: number;
  description?: string;
  is_active: boolean;
  usage_limit?: number;
  usage_count: number;
  valid_from: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

export interface DiscountUsage {
  id: string;
  discount_code_id: string;
  user_id: string;
  order_id: string;
  discount_amount: number;
  used_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description?: string;
  category: string;
  logo_url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  province?: string;
  target_amount?: number;
  raised_amount: number;
  is_active: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  user_id?: string;
  charity_id: string;
  order_id?: string;
  amount: number;
  payment_method?: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed';
  anonymous: boolean;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface DonationImpact {
  id: string;
  charity_id: string;
  impact_type: string;
  description: string;
  people_helped?: number;
  projects_completed?: number;
  amount_required?: number;
  achieved_at: string;
}

// Updated Order interface with new fields
export interface Order {
  id: string;
  user_id?: string;
  total_amount: number;
  discount_code_id?: string;
  discount_amount: number;
  donation_amount: number;
  final_amount: number;
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  shipping_city?: string;
  phone?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Database views
export interface ActiveDiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_amount: number;
  description?: string;
  usage_limit?: number;
  usage_count: number;
  valid_until?: string;
  is_available: boolean;
}

export interface CharityStats {
  id: string;
  name: string;
  category: string;
  target_amount?: number;
  raised_amount: number;
  progress_percentage: number;
  total_donations: number;
  unique_donors: number;
}

export interface DonationImpactSummary {
  charity_name: string;
  category: string;
  total_raised: number;
  donation_count: number;
  unique_donors: number;
  impact_type: string;
  impact_description: string;
  people_helped?: number;
  projects_completed?: number;
}

// API Response types
export interface DiscountApplicationResult {
  success: boolean;
  discount_amount: number;
  message: string;
}

export interface DonationProcessResult {
  success: boolean;
  donation_id?: string;
  message: string;
}

// Form types for UI
export interface DiscountCodeForm {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_amount: number;
  max_discount?: number;
  description?: string;
  usage_limit?: number;
  valid_until?: string;
}

export interface CharityForm {
  name: string;
  description?: string;
  category: string;
  logo_url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  province?: string;
  target_amount?: number;
}

export interface DonationForm {
  charity_id: string;
  amount: number;
  anonymous: boolean;
  message?: string;
}

// Filter and search types
export interface CharityFilters {
  category?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_active?: boolean;
}

export interface DonationFilters {
  charity_id?: string;
  status?: 'pending' | 'completed' | 'failed';
  date_from?: string;
  date_to?: string;
  anonymous?: boolean;
}

// Statistics types
export interface DonationStats {
  total_donations: number;
  total_amount: number;
  unique_donors: number;
  average_donation: number;
  top_charities: Array<{
    charity_id: string;
    charity_name: string;
    total_amount: number;
    donation_count: number;
  }>;
}

export interface DiscountStats {
  total_codes: number;
  active_codes: number;
  total_usage: number;
  total_savings: number;
  popular_codes: Array<{
    code: string;
    usage_count: number;
    total_savings: number;
  }>;
}

// Enums
export enum CharityCategory {
  HEALTHCARE = 'Healthcare',
  EDUCATION = 'Education',
  SOCIAL_WELFARE = 'Social Welfare',
  ENVIRONMENT = 'Environment',
  HOUSING = 'Housing',
  EMERGENCY = 'Emergency',
  ANIMAL_WELFARE = 'Animal Welfare',
  OTHER = 'Other'
}

export enum DonationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

// Utility types
export type CharityWithStats = Charity & {
  stats?: CharityStats;
  impact?: DonationImpact[];
};

export type DiscountCodeWithUsage = DiscountCode & {
  usage?: DiscountUsage[];
};

export type DonationWithCharity = Donation & {
  charity?: Charity;
};

// API endpoints types
export interface DiscountAPI {
  applyCode: (code: string, userId: string, orderAmount: number) => Promise<DiscountApplicationResult>;
  getActiveCodes: () => Promise<ActiveDiscountCode[]>;
  getCodeDetails: (code: string) => Promise<DiscountCode | null>;
  createCode: (data: DiscountCodeForm) => Promise<DiscountCode>;
  updateCode: (id: string, data: Partial<DiscountCodeForm>) => Promise<DiscountCode>;
  deleteCode: (id: string) => Promise<void>;
}

export interface DonationAPI {
  processDonation: (data: DonationForm, userId: string, orderId?: string) => Promise<DonationProcessResult>;
  getCharities: (filters?: CharityFilters) => Promise<Charity[]>;
  getCharityStats: () => Promise<CharityStats[]>;
  getDonations: (filters?: DonationFilters) => Promise<Donation[]>;
  getDonationImpact: () => Promise<DonationImpactSummary[]>;
  getDonationStats: () => Promise<DonationStats>;
  createCharity: (data: CharityForm) => Promise<Charity>;
  updateCharity: (id: string, data: Partial<CharityForm>) => Promise<Charity>;
  deleteCharity: (id: string) => Promise<void>;
}

// Hook return types
export interface UseDiscountCodesReturn {
  codes: ActiveDiscountCode[];
  loading: boolean;
  error: string | null;
  applyCode: (code: string, orderAmount: number) => Promise<DiscountApplicationResult>;
  refreshCodes: () => Promise<void>;
}

export interface UseCharitiesReturn {
  charities: CharityWithStats[];
  loading: boolean;
  error: string | null;
  filters: CharityFilters;
  setFilters: (filters: CharityFilters) => void;
  refreshCharities: () => Promise<void>;
}

export interface UseDonationsReturn {
  donations: DonationWithCharity[];
  stats: DonationStats | null;
  loading: boolean;
  error: string | null;
  processDonation: (data: DonationForm) => Promise<DonationProcessResult>;
  refreshDonations: () => Promise<void>;
}

// =====================================================
// END OF TYPES
// ===================================================== 