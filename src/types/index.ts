export type Category = {
  id: string;
  name: string;
  image?: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  image: string;
  images?: string[];
  category_id?: string;
  /**
   * @deprecated Use category_id instead
   */
  category?: string;
  tags: string[];
  stock: number;
  rating: number;
  reviews: number;
  full_description?: string;
  specifications?: Record<string, string>;
  warranty_info?: string;
  created_at: string;
  reviews_list?: ProductReview[]; // Added for storing fetched reviews
};

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  helpful_votes: number;
  is_verified_purchase: boolean;
  user?: {
    full_name?: string;
    email?: string;
  };
}

export type CartItem = {
  product: Product;
  quantity: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing';
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  priority: number;
  notes: string | null;
  created_at: string;
  product?: Product;
}

export interface UserPreferences {
  id: string;
  theme: 'light' | 'dark';
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  shipping_address: {
    full_name: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  payment_details?: any;
  created_at: string;
  items?: OrderItem[];
  tracking_id?: string;
  tracking_url?: string;
  shipping_carrier?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type CancellationReason = 
  | 'changed_mind' 
  | 'found_better_price' 
  | 'ordered_by_mistake' 
  | 'wrong_item' 
  | 'other';

export type ReplacementReason = 
  | 'defective_product' 
  | 'damaged_on_arrival' 
  | 'wrong_item_received' 
  | 'missing_parts' 
  | 'not_as_described' 
  | 'other';

export type RequestStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected';

export interface OrderCancellationRequest {
  id: string;
  order_id: string;
  user_id: string;
  type: 'cancel' | 'exchange';
  reason: string;
  status: RequestStatus;
  admin_response?: string;
  created_at: string;
  updated_at: string;
}