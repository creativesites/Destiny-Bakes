export interface UserProfile {
  id: string;
  clerk_user_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  dietary_restrictions?: string[];
  delivery_addresses?: DeliveryAddress[];
  preferences?: Record<string, any>;
  role: 'customer' | 'admin' | 'baker';
  created_at: string;
  updated_at: string;
}

export interface DeliveryAddress {
  id: string;
  label: string;
  street: string;
  area: string;
  city: string;
  landmark?: string;
  phone?: string;
  is_default?: boolean;
}

export interface Cake {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  category: string;
  images?: string[];
  ingredients?: Record<string, any>;
  allergens?: string[];
  available: boolean;
  featured: boolean;
  difficulty_level: number;
  preparation_time_hours: number;
  created_at: string;
  updated_at: string;
}

export interface CakeConfig {
  flavor: 'Vanilla' | 'Strawberry' | 'Chocolate' | 'Choco-mint' | 'Mint' | 'Banana' | 'Fruit';
  size: '4"' | '6"' | '8"' | '10"';
  shape: 'Round' | 'Square' | 'Heart';
  layers: 1 | 2 | 3;
  tiers: 1 | 2 | 3;
  customization?: {
    colors?: string[];
    message?: string;
    decorations?: string[];
    dietary?: string[];
  };
  occasion?: string;
  servings?: number;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  cake_config: CakeConfig;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'baking' | 'decorating' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  delivery_date?: string;
  delivery_time?: string;
  delivery_address: DeliveryAddress;
  special_instructions?: string;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  event_type: string;
  description?: string;
  estimated_completion?: string;
  actual_completion?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  session_id: string;
  assistant_type: 'customer' | 'admin' | 'designer';
  messages: ConversationMessage[];
  cake_design?: CakeConfig;
  context?: Record<string, any>;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CakePreview {
  id: string;
  conversation_id: string;
  image_url: string;
  description?: string;
  specifications: CakeConfig;
  ai_prompt?: string;
  price?: number;
  estimated_completion_time?: string;
  generated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  event_type: string;
  event_data?: Record<string, any>;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  current_quantity: number;
  unit: string;
  minimum_threshold: number;
  cost_per_unit?: number;
  supplier?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  customer_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  images?: string[];
  approved: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order_update' | 'promotion' | 'system' | 'reminder';
  read: boolean;
  action_url?: string;
  created_at: string;
}

// Database utility types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      cakes: {
        Row: Cake;
        Insert: Omit<Cake, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Cake, 'id' | 'created_at' | 'updated_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>;
      };
      order_events: {
        Row: OrderEvent;
        Insert: Omit<OrderEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderEvent, 'id' | 'created_at'>>;
      };
      ai_conversations: {
        Row: AIConversation;
        Insert: Omit<AIConversation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AIConversation, 'id' | 'created_at' | 'updated_at'>>;
      };
      cake_previews: {
        Row: CakePreview;
        Insert: Omit<CakePreview, 'id' | 'generated_at'>;
        Update: Partial<Omit<CakePreview, 'id' | 'generated_at'>>;
      };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: Omit<AnalyticsEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<AnalyticsEvent, 'id' | 'created_at'>>;
      };
      inventory: {
        Row: InventoryItem;
        Insert: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at'>;
        Update: Partial<Omit<Review, 'id' | 'created_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
    };
  };
}