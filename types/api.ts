export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  assets_count?: number;
}

export interface Asset {
  id: number;
  name: string;
  asset_tag: string;
  serial: string;
  status: 'active' | 'archived' | 'checked_out' | 'discarded';
  photo_url: string | null;
  brand: string | null;
  model: string | null;
  condition: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  supplier: string | null;
  location: string | null;
  description: string | null;
  archived_at: string | null;
  archived_reason: string | null;
  discarded_at: string | null;
  discarded_reason: string | null;
  created_at: string;
  category?: Category;
  creator?: User;
  current_checkout?: CheckOut;
  checkouts?: CheckOut[];
  activity_logs?: ActivityLog[];
}

export interface CheckOut {
  id: number;
  assignee_name: string;
  department: string | null;
  purpose: string | null;
  destination: string | null;
  expected_return: string | null;
  notes: string | null;
  checked_out_at: string;
  returned_at: string | null;
  return_notes: string | null;
  asset?: Asset;
  user?: User;
}

export interface ActivityLog {
  id: number;
  type: string;
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
  asset?: Asset;
  user?: User;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  description: string;
  metadata: Record<string, any> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface DashboardSummary {
  total: number;
  active: number;
  archived: number;
  discarded?: number;
  damaged: number;
  expired: number;
  checked_out: number;
  recent_checkouts: CheckOut[];
  recent_assets: Asset[];
  recent_activity: ActivityLog[];
}
