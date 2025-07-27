

-- ═══════════════════════════════════════════════════════════════════════════════
-- DESTINY BAKES - MIGRATION-SAFE DATABASE SCHEMA
-- This script can be run multiple times safely - it will only add/update what's needed
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to check if column exists
CREATE OR REPLACE FUNCTION column_exists(p_table_name text, p_column_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = p_table_name 
        AND column_name = p_column_name
    );
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if constraint exists
CREATE OR REPLACE FUNCTION constraint_exists(p_table_name text, p_constraint_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = p_table_name 
        AND constraint_name = p_constraint_name
    );
END;
$$ LANGUAGE plpgsql;

-- Add role constraint if it doesn't exist
DO $$
BEGIN
    IF NOT constraint_exists('user_profiles'::text, 'user_profiles_role_check'::text) THEN
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
        CHECK (role IN ('customer', 'admin', 'baker'));
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- USER PROFILES TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to user_profiles
DO $$
BEGIN
    IF NOT column_exists('user_profiles', 'email') THEN
        ALTER TABLE user_profiles ADD COLUMN email VARCHAR;
    END IF;
    
    IF NOT column_exists('user_profiles', 'phone') THEN
        ALTER TABLE user_profiles ADD COLUMN phone VARCHAR;
    END IF;
    
    IF NOT column_exists('user_profiles', 'dietary_restrictions') THEN
        ALTER TABLE user_profiles ADD COLUMN dietary_restrictions TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    
    IF NOT column_exists('user_profiles', 'delivery_addresses') THEN
        ALTER TABLE user_profiles ADD COLUMN delivery_addresses JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT column_exists('user_profiles', 'preferences') THEN
        ALTER TABLE user_profiles ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT column_exists('user_profiles', 'role') THEN
        ALTER TABLE user_profiles ADD COLUMN role VARCHAR DEFAULT 'customer';
    END IF;
    
    IF NOT column_exists('user_profiles', 'updated_at') THEN
        ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add role constraint if it doesn't exist
DO $$
BEGIN
    IF NOT constraint_exists('user_profiles', 'user_profiles_role_check') THEN
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
        CHECK (role IN ('customer', 'admin', 'baker'));
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- OCCASIONS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS occasions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT column_exists('occasions', 'description') THEN
        ALTER TABLE occasions ADD COLUMN description TEXT;
    END IF;
    
    IF NOT column_exists('occasions', 'icon') THEN
        ALTER TABLE occasions ADD COLUMN icon VARCHAR DEFAULT '🎉';
    END IF;
    
    IF NOT column_exists('occasions', 'color_scheme') THEN
        ALTER TABLE occasions ADD COLUMN color_scheme TEXT[] DEFAULT ARRAY['#ec4899', '#a855f7']::TEXT[];
    END IF;
    
    IF NOT column_exists('occasions', 'default_decorations') THEN
        ALTER TABLE occasions ADD COLUMN default_decorations TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    
    IF NOT column_exists('occasions', 'price_multiplier') THEN
        ALTER TABLE occasions ADD COLUMN price_multiplier DECIMAL(3,2) DEFAULT 1.0;
    END IF;
    
    IF NOT column_exists('occasions', 'seasonal') THEN
        ALTER TABLE occasions ADD COLUMN seasonal BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT column_exists('occasions', 'active') THEN
        ALTER TABLE occasions ADD COLUMN active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT column_exists('occasions', 'updated_at') THEN
        ALTER TABLE occasions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- CAKES CATALOG TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS cakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    category VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT column_exists('cakes', 'description') THEN
        ALTER TABLE cakes ADD COLUMN description TEXT;
    END IF;
    
    IF NOT column_exists('cakes', 'images') THEN
        ALTER TABLE cakes ADD COLUMN images TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    
    IF NOT column_exists('cakes', 'ingredients') THEN
        ALTER TABLE cakes ADD COLUMN ingredients JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT column_exists('cakes', 'allergens') THEN
        ALTER TABLE cakes ADD COLUMN allergens TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    
    IF NOT column_exists('cakes', 'available') THEN
        ALTER TABLE cakes ADD COLUMN available BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT column_exists('cakes', 'featured') THEN
        ALTER TABLE cakes ADD COLUMN featured BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT column_exists('cakes', 'difficulty_level') THEN
        ALTER TABLE cakes ADD COLUMN difficulty_level INTEGER DEFAULT 1;
    END IF;
    
    IF NOT column_exists('cakes', 'preparation_time_hours') THEN
        ALTER TABLE cakes ADD COLUMN preparation_time_hours INTEGER DEFAULT 24;
    END IF;
    
    IF NOT column_exists('cakes', 'occasion_id') THEN
        ALTER TABLE cakes ADD COLUMN occasion_id UUID;
    END IF;
    
    IF NOT column_exists('cakes', 'updated_at') THEN
        ALTER TABLE cakes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add constraints for cakes table
DO $$
BEGIN
    IF NOT constraint_exists('cakes', 'cakes_difficulty_level_check') THEN
        ALTER TABLE cakes ADD CONSTRAINT cakes_difficulty_level_check 
        CHECK (difficulty_level BETWEEN 1 AND 5);
    END IF;
    
    -- Add foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cakes' AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%occasion_id%'
    ) THEN
        ALTER TABLE cakes ADD CONSTRAINT cakes_occasion_id_fkey 
        FOREIGN KEY (occasion_id) REFERENCES occasions(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ORDERS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR UNIQUE NOT NULL,
    cake_config JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT column_exists('orders', 'customer_id') THEN
        ALTER TABLE orders ADD COLUMN customer_id UUID;
    END IF;
    
    IF NOT column_exists('orders', 'status') THEN
        ALTER TABLE orders ADD COLUMN status VARCHAR DEFAULT 'pending';
    END IF;
    
    IF NOT column_exists('orders', 'delivery_date') THEN
        ALTER TABLE orders ADD COLUMN delivery_date DATE;
    END IF;
    
    IF NOT column_exists('orders', 'delivery_time') THEN
        ALTER TABLE orders ADD COLUMN delivery_time VARCHAR;
    END IF;
    
    IF NOT column_exists('orders', 'special_instructions') THEN
        ALTER TABLE orders ADD COLUMN special_instructions TEXT;
    END IF;
    
    IF NOT column_exists('orders', 'payment_status') THEN
        ALTER TABLE orders ADD COLUMN payment_status VARCHAR DEFAULT 'pending';
    END IF;
    
    IF NOT column_exists('orders', 'payment_method') THEN
        ALTER TABLE orders ADD COLUMN payment_method VARCHAR;
    END IF;
    
    IF NOT column_exists('orders', 'updated_at') THEN
        ALTER TABLE orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add constraints for orders table
DO $$
BEGIN
    IF NOT constraint_exists('orders', 'orders_status_check') THEN
        ALTER TABLE orders ADD CONSTRAINT orders_status_check 
        CHECK (status IN ('pending', 'confirmed', 'preparing', 'baking', 'decorating', 'ready', 'out_for_delivery', 'delivered', 'cancelled'));
    END IF;
    
    IF NOT constraint_exists('orders', 'orders_payment_status_check') THEN
        ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
        CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed'));
    END IF;
    
    -- Add foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'orders' AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%customer_id%'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ORDER EVENTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    event_type VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT column_exists('order_events', 'description') THEN
        ALTER TABLE order_events ADD COLUMN description TEXT;
    END IF;
    
    IF NOT column_exists('order_events', 'estimated_completion') THEN
        ALTER TABLE order_events ADD COLUMN estimated_completion TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT column_exists('order_events', 'actual_completion') THEN
        ALTER TABLE order_events ADD COLUMN actual_completion TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT column_exists('order_events', 'notes') THEN
        ALTER TABLE order_events ADD COLUMN notes TEXT;
    END IF;
    
    IF NOT column_exists('order_events', 'created_by') THEN
        ALTER TABLE order_events ADD COLUMN created_by UUID;
    END IF;
END $$;

-- Add foreign keys for order_events
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'order_events' AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%order_id%'
    ) THEN
        ALTER TABLE order_events ADD CONSTRAINT order_events_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'order_events' AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%created_by%'
    ) THEN
        ALTER TABLE order_events ADD CONSTRAINT order_events_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES user_profiles(id);
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- AI CONVERSATIONS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_id VARCHAR NOT NULL,
    assistant_type VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT column_exists('ai_conversations', 'messages') THEN
        ALTER TABLE ai_conversations ADD COLUMN messages JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT column_exists('ai_conversations', 'cake_design') THEN
        ALTER TABLE ai_conversations ADD COLUMN cake_design JSONB;
    END IF;
    
    IF NOT column_exists('ai_conversations', 'context') THEN
        ALTER TABLE ai_conversations ADD COLUMN context JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT column_exists('ai_conversations', 'status') THEN
        ALTER TABLE ai_conversations ADD COLUMN status VARCHAR DEFAULT 'active';
    END IF;
    
    IF NOT column_exists('ai_conversations', 'updated_at') THEN
        ALTER TABLE ai_conversations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add constraints for ai_conversations
DO $$
BEGIN
    IF NOT constraint_exists('ai_conversations', 'ai_conversations_assistant_type_check') THEN
        ALTER TABLE ai_conversations ADD CONSTRAINT ai_conversations_assistant_type_check 
        CHECK (assistant_type IN ('customer', 'admin', 'designer'));
    END IF;
    
    IF NOT constraint_exists('ai_conversations', 'ai_conversations_status_check') THEN
        ALTER TABLE ai_conversations ADD CONSTRAINT ai_conversations_status_check 
        CHECK (status IN ('active', 'completed', 'archived'));
    END IF;
    
    -- Add foreign key
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'ai_conversations' AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%user_id%'
    ) THEN
        ALTER TABLE ai_conversations ADD CONSTRAINT ai_conversations_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- CAKE PREVIEWS TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS cake_previews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    specifications JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT column_exists('cake_previews', 'conversation_id') THEN
        ALTER TABLE cake_previews ADD COLUMN conversation_id UUID;
    END IF;
    
    IF NOT column_exists('cake_previews', 'order_id') THEN
        ALTER TABLE cake_previews ADD COLUMN order_id UUID;
    END IF;
    
    IF NOT column_exists('cake_previews', 'description') THEN
        ALTER TABLE cake_previews ADD COLUMN description TEXT;
    END IF;
    
    IF NOT column_exists('cake_previews', 'ai_prompt') THEN
        ALTER TABLE cake_previews ADD COLUMN ai_prompt TEXT;
    END IF;
    
    IF NOT column_exists('cake_previews', 'price') THEN
        ALTER TABLE cake_previews ADD COLUMN price DECIMAL(10,2);
    END IF;
    
    IF NOT column_exists('cake_previews', 'estimated_completion_time') THEN
        ALTER TABLE cake_previews ADD COLUMN estimated_completion_time VARCHAR;
    END IF;
    
    IF NOT column_exists('cake_previews', 'status') THEN
        ALTER TABLE cake_previews ADD COLUMN status VARCHAR DEFAULT 'pending';
    END IF;
    
    IF NOT column_exists('cake_previews', 'approved_by') THEN
        ALTER TABLE cake_previews ADD COLUMN approved_by UUID;
    END IF;
    
    IF NOT column_exists('cake_previews', 'approved_at') THEN
        ALTER TABLE cake_previews ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT column_exists('cake_previews', 'reuse_count') THEN
        ALTER TABLE cake_previews ADD COLUMN reuse_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT column_exists('cake_previews', 'hash') THEN
        ALTER TABLE cake_previews ADD COLUMN hash VARCHAR;
    END IF;
END $$;

-- Add constraints and foreign keys for cake_previews
DO $$
BEGIN
    IF NOT constraint_exists('cake_previews', 'cake_previews_status_check') THEN
        ALTER TABLE cake_previews ADD CONSTRAINT cake_previews_status_check 
        CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;
    
    -- Add unique constraint on hash if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cake_previews' AND constraint_type = 'UNIQUE' 
        AND constraint_name LIKE '%hash%'
    ) THEN
        ALTER TABLE cake_previews ADD CONSTRAINT cake_previews_hash_unique UNIQUE (hash);
    END IF;
    
    -- Add foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cake_previews' AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%conversation_id%'
    ) THEN
        ALTER TABLE cake_previews ADD CONSTRAINT cake_previews_conversation_id_fkey 
        FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cake_previews' AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%order_id%'
    ) THEN
        ALTER TABLE cake_previews ADD CONSTRAINT cake_previews_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cake_previews' AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%approved_by%'
    ) THEN
        ALTER TABLE cake_previews ADD CONSTRAINT cake_previews_approved_by_fkey 
        FOREIGN KEY (approved_by) REFERENCES user_profiles(id);
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- CAKE TEMPLATES TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS cake_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    specifications JSONB NOT NULL,
    category VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT column_exists('cake_templates', 'description') THEN
        ALTER TABLE cake_templates ADD COLUMN description TEXT;
    END IF;
    
    IF NOT column_exists('cake_templates', 'price') THEN
        ALTER TABLE cake_templates ADD COLUMN price DECIMAL(10,2);
    END IF;
    
    IF NOT column_exists('cake_templates', 'difficulty_level') THEN
        ALTER TABLE cake_templates ADD COLUMN difficulty_level INTEGER DEFAULT 1;
    END IF;
    
    IF NOT column_exists('cake_templates', 'created_by') THEN
        ALTER TABLE cake_templates ADD COLUMN created_by UUID;
    END IF;
    
    IF NOT column_exists('cake_templates', 'status') THEN
        ALTER TABLE cake_templates ADD COLUMN status VARCHAR DEFAULT 'pending';
    END IF;
    
    IF NOT column_exists('cake_templates', 'approved_by') THEN
        ALTER TABLE cake_templates ADD COLUMN approved_by UUID;
    END IF;
    
    IF NOT column_exists('cake_templates', 'approved_at') THEN
        ALTER TABLE cake_templates ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT column_exists('cake_templates', 'use_count') THEN
        ALTER TABLE cake_templates ADD COLUMN use_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT column_exists('cake_templates', 'is_public') THEN
        ALTER TABLE cake_templates ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT column_exists('cake_templates', 'tags') THEN
        ALTER TABLE cake_templates ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    
    IF NOT column_exists('cake_templates', 'updated_at') THEN
        ALTER TABLE cake_templates ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add constraints for cake_templates
DO $$
BEGIN
    IF NOT constraint_exists('cake_templates', 'cake_templates_difficulty_level_check') THEN
        ALTER TABLE cake_templates ADD CONSTRAINT cake_templates_difficulty_level_check 
        CHECK (difficulty_level BETWEEN 1 AND 5);
    END IF;
    
    IF NOT constraint_exists('cake_templates', 'cake_templates_status_check') THEN
        ALTER TABLE cake_templates ADD CONSTRAINT cake_templates_status_check 
        CHECK (status IN ('pending', 'approved', 'rejected', 'featured'));
    END IF;
    
    -- Add foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cake_templates' AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%created_by%'
    ) THEN
        ALTER TABLE cake_templates ADD CONSTRAINT cake_templates_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES user_profiles(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cake_templates' AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%approved_by%'
    ) THEN
        ALTER TABLE cake_templates ADD CONSTRAINT cake_templates_approved_by_fkey 
        FOREIGN KEY (approved_by) REFERENCES user_profiles(id);
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- REMAINING TABLES (Analytics, Inventory, Reviews, Notifications)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT column_exists('analytics_events', 'user_id') THEN
        ALTER TABLE analytics_events ADD COLUMN user_id UUID;
    END IF;
    
    IF NOT column_exists('analytics_events', 'event_data') THEN
        ALTER TABLE analytics_events ADD COLUMN event_data JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT column_exists('analytics_events', 'session_id') THEN
        ALTER TABLE analytics_events ADD COLUMN session_id VARCHAR;
    END IF;
    
    IF NOT column_exists('analytics_events', 'ip_address') THEN
        ALTER TABLE analytics_events ADD COLUMN ip_address INET;
    END IF;
    
    IF NOT column_exists('analytics_events', 'user_agent') THEN
        ALTER TABLE analytics_events ADD COLUMN user_agent TEXT;
    END IF;
END $$;

-- Add foreign key for analytics_events
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'analytics_events' AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%user_id%'
    ) THEN
        ALTER TABLE analytics_events ADD CONSTRAINT analytics_events_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    current_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT column_exists('inventory', 'minimum_threshold') THEN
        ALTER TABLE inventory ADD COLUMN minimum_threshold DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT column_exists('inventory', 'cost_per_unit') THEN
        ALTER TABLE inventory ADD COLUMN cost_per_unit DECIMAL(10,2);
    END IF;
    
    IF NOT column_exists('inventory', 'supplier') THEN
        ALTER TABLE inventory ADD COLUMN supplier VARCHAR;
    END IF;
    
    IF NOT column_exists('inventory', 'expiry_date') THEN
        ALTER TABLE inventory ADD COLUMN expiry_date DATE;
    END IF;
    
    IF NOT column_exists('inventory', 'updated_at') THEN
        ALTER TABLE inventory ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    rating INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT column_exists('reviews', 'comment') THEN
        ALTER TABLE reviews ADD COLUMN comment TEXT;
    END IF;
    
    IF NOT column_exists('reviews', 'images') THEN
        ALTER TABLE reviews ADD COLUMN images TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    
    IF NOT column_exists('reviews', 'approved') THEN
        ALTER TABLE reviews ADD COLUMN approved BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add constraints and foreign keys for reviews
DO $$
BEGIN
    IF NOT constraint_exists('reviews', 'reviews_rating_check') THEN
        ALTER TABLE reviews ADD CONSTRAINT reviews_rating_check 
        CHECK (rating BETWEEN 1 AND 5);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'reviews' AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%order_id%'
    ) THEN
        ALTER TABLE reviews ADD CONSTRAINT reviews_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'reviews' AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%customer_id%'
    ) THEN
        ALTER TABLE reviews ADD CONSTRAINT reviews_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT column_exists('notifications', 'read') THEN
        ALTER TABLE notifications ADD COLUMN read BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT column_exists('notifications', 'action_url') THEN
        ALTER TABLE notifications ADD COLUMN action_url VARCHAR;
    END IF;
END $$;

-- Add constraints for notifications
DO $$
BEGIN
    IF NOT constraint_exists('notifications', 'notifications_type_check') THEN
        ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
        CHECK (type IN ('order_update', 'promotion', 'system', 'reminder'));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'notifications' AND constraint_type = 'FOREIGN KEY' 
        AND constraint_name LIKE '%user_id%'
    ) THEN
        ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- INDEXES - Create only if they don't exist
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_cakes_category ON cakes(category);
CREATE INDEX IF NOT EXISTS idx_cakes_available ON cakes(available);
CREATE INDEX IF NOT EXISTS idx_cake_previews_hash ON cake_previews(hash);
CREATE INDEX IF NOT EXISTS idx_cake_previews_status ON cake_previews(status);
CREATE INDEX IF NOT EXISTS idx_cake_templates_status ON cake_templates(status);
CREATE INDEX IF NOT EXISTS idx_cake_templates_category ON cake_templates(category);
CREATE INDEX IF NOT EXISTS idx_cake_templates_created_by ON cake_templates(created_by);

-- ═══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS AND FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers only if they don't exist
DO $$
BEGIN
    -- Check and create triggers
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_user_profiles_updated_at') THEN
        CREATE TRIGGER update_user_profiles_updated_at 
        BEFORE UPDATE ON user_profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_occasions_updated_at') THEN
        CREATE TRIGGER update_occasions_updated_at 
        BEFORE UPDATE ON occasions 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_cakes_updated_at') THEN
        CREATE TRIGGER update_cakes_updated_at 
        BEFORE UPDATE ON cakes 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_orders_updated_at') THEN
        CREATE TRIGGER update_orders_updated_at 
        BEFORE UPDATE ON orders 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_ai_conversations_updated_at') THEN
        CREATE TRIGGER update_ai_conversations_updated_at 
        BEFORE UPDATE ON ai_conversations 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_inventory_updated_at') THEN
        CREATE TRIGGER update_inventory_updated_at 
        BEFORE UPDATE ON inventory 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_cake_templates_updated_at') THEN
        CREATE TRIGGER update_cake_templates_updated_at 
        BEFORE UPDATE ON cake_templates 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEQUENCES AND FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create sequence for order numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'DB' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_sequence')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SAMPLE DATA - Insert only if tables are empty
-- ═══════════════════════════════════════════════════════════════════════════════

-- Insert sample occasions if table is empty
INSERT INTO occasions (name, description, icon, color_scheme, default_decorations, price_multiplier, seasonal, active)
SELECT * FROM (
    VALUES 
    ('Birthday', 'Perfect for birthday celebrations of all ages', '🎂', ARRAY['#ec4899', '#a855f7'], ARRAY['candles', 'sprinkles', 'birthday message'], 1.0, false, true),
    ('Wedding', 'Elegant cakes for your special day', '💒', ARRAY['#f8fafc', '#fdf2f8'], ARRAY['sugar flowers', 'pearls', 'elegant piping'], 1.5, false, true),
    ('Anniversary', 'Celebrate love and milestones', '💕', ARRAY['#ec4899', '#be185d'], ARRAY['hearts', 'romantic flowers', 'gold accents'], 1.2, false, true),
    ('Graduation', 'Honor academic achievements', '🎓', ARRAY['#3b82f6', '#1e40af'], ARRAY['cap and gown', 'diploma', 'school colors'], 1.1, true, true),
    ('Baby Shower', 'Welcome the new arrival', '👶', ARRAY['#fbbf24', '#f59e0b'], ARRAY['baby items', 'pastel colors', 'cute animals'], 1.1, false, true),
    ('Corporate Event', 'Professional celebrations', '🏢', ARRAY['#374151', '#6b7280'], ARRAY['company logo', 'elegant design', 'professional finish'], 1.3, false, true)
) AS v(name, description, icon, color_scheme, default_decorations, price_multiplier, seasonal, active)
WHERE NOT EXISTS (SELECT 1 FROM occasions LIMIT 1);

-- Insert sample cakes if table is empty
INSERT INTO cakes (name, description, base_price, category, ingredients, allergens, featured, difficulty_level, preparation_time_hours)
SELECT * FROM (
    VALUES 
    ('Classic Vanilla Birthday Cake', 'Our signature vanilla cake with buttercream frosting, perfect for any birthday celebration.', 45.00, 'Birthday', 
     '{"base": "vanilla sponge", "frosting": "buttercream", "decorations": ["sprinkles", "candles"]}'::jsonb, 
     ARRAY['gluten', 'dairy', 'eggs'], true, 2, 24),

    ('Chocolate Fudge Delight', 'Rich chocolate cake with chocolate ganache and fudge decorations.', 55.00, 'Birthday', 
     '{"base": "chocolate sponge", "frosting": "chocolate ganache", "decorations": ["chocolate shavings", "fudge pieces"]}'::jsonb, 
     ARRAY['gluten', 'dairy', 'eggs'], true, 3, 24),

    ('Strawberry Dream Cake', 'Light vanilla cake with fresh strawberry filling and cream cheese frosting.', 50.00, 'Celebration', 
     '{"base": "vanilla sponge", "filling": "strawberry cream", "frosting": "cream cheese", "decorations": ["fresh strawberries"]}'::jsonb, 
     ARRAY['gluten', 'dairy', 'eggs'], true, 2, 24),

    ('Wedding Elegance Cake', 'Multi-tier elegant cake perfect for wedding celebrations.', 120.00, 'Wedding', 
     '{"base": "vanilla and chocolate", "frosting": "buttercream", "decorations": ["sugar flowers", "pearls"]}'::jsonb, 
     ARRAY['gluten', 'dairy', 'eggs'], true, 5, 48),

    ('Choco-Mint Surprise', 'Decadent chocolate cake with refreshing mint buttercream.', 52.00, 'Special', 
     '{"base": "chocolate sponge", "frosting": "mint buttercream", "decorations": ["chocolate chips", "mint leaves"]}'::jsonb, 
     ARRAY['gluten', 'dairy', 'eggs'], false, 3, 24),

    ('Banana Cream Delight', 'Moist banana cake with cream cheese frosting and caramelized bananas.', 48.00, 'Celebration', 
     '{"base": "banana sponge", "frosting": "cream cheese", "decorations": ["caramelized bananas", "walnuts"]}'::jsonb, 
     ARRAY['gluten', 'dairy', 'eggs', 'nuts'], false, 2, 24),

    ('Fresh Fruit Paradise', 'Light sponge cake topped with seasonal fresh fruits and whipped cream.', 58.00, 'Summer', 
     '{"base": "vanilla sponge", "frosting": "whipped cream", "decorations": ["mixed fresh fruits", "fruit glaze"]}'::jsonb, 
     ARRAY['gluten', 'dairy', 'eggs'], true, 2, 18)
) AS v(name, description, base_price, category, ingredients, allergens, featured, difficulty_level, preparation_time_hours)
WHERE NOT EXISTS (SELECT 1 FROM cakes LIMIT 1);

-- ═══════════════════════════════════════════════════════════════════════════════
-- CLEANUP HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop helper functions (they were only needed for this migration)
DROP FUNCTION IF EXISTS column_exists(text, text);
DROP FUNCTION IF EXISTS constraint_exists(text, text);

-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════

-- Notify completion
DO $$
BEGIN
    RAISE NOTICE 'Destiny Bakes database migration completed successfully!';
    RAISE NOTICE 'All tables, columns, constraints, indexes, and triggers have been created or updated.';
    RAISE NOTICE 'Sample data has been inserted where appropriate.';
END $$;