-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table (extends Clerk user data)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR NOT NULL,
    email VARCHAR,
    phone VARCHAR,
    dietary_restrictions TEXT[],
    delivery_addresses JSONB DEFAULT '[]'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    role VARCHAR DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'baker')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create occasions table
CREATE TABLE IF NOT EXISTS occasions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT,
    icon VARCHAR DEFAULT '🎉',
    color_scheme TEXT[] DEFAULT ARRAY['#ec4899', '#a855f7']::TEXT[],
    default_decorations TEXT[] DEFAULT ARRAY[]::TEXT[],
    price_multiplier DECIMAL(3,2) DEFAULT 1.0,
    seasonal BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cakes catalog table
CREATE TABLE IF NOT EXISTS cakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    category VARCHAR NOT NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    ingredients JSONB DEFAULT '{}'::jsonb,
    allergens TEXT[] DEFAULT ARRAY[]::TEXT[],
    available BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    preparation_time_hours INTEGER DEFAULT 24,
    occasion_id UUID REFERENCES occasions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    order_number VARCHAR UNIQUE NOT NULL,
    cake_config JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'baking', 'decorating', 'ready', 'out_for_delivery', 'delivered', 'cancelled')),
    delivery_date DATE,
    delivery_time VARCHAR,
    delivery_address JSONB NOT NULL,
    special_instructions TEXT,
    payment_status VARCHAR DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_method VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_events table for tracking
CREATE TABLE IF NOT EXISTS order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    event_type VARCHAR NOT NULL,
    description TEXT,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    actual_completion TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_id VARCHAR NOT NULL,
    assistant_type VARCHAR NOT NULL CHECK (assistant_type IN ('customer', 'admin', 'designer')),
    messages JSONB DEFAULT '[]'::jsonb,
    cake_design JSONB,
    context JSONB DEFAULT '{}'::jsonb,
    status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cake_previews table for AI-generated previews
CREATE TABLE IF NOT EXISTS cake_previews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    description TEXT,
    specifications JSONB NOT NULL,
    ai_prompt TEXT,
    price DECIMAL(10,2),
    estimated_completion_time VARCHAR,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    reuse_count INTEGER DEFAULT 0,
    hash VARCHAR UNIQUE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cake_templates table for saved designs
CREATE TABLE IF NOT EXISTS cake_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    specifications JSONB NOT NULL,
    price DECIMAL(10,2),
    category VARCHAR NOT NULL,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    created_by UUID REFERENCES user_profiles(id),
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
    approved_by UUID REFERENCES user_profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    use_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    event_type VARCHAR NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    session_id VARCHAR,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    current_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR NOT NULL,
    minimum_threshold DECIMAL(10,2) DEFAULT 0,
    cost_per_unit DECIMAL(10,2),
    supplier VARCHAR,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR NOT NULL CHECK (type IN ('order_update', 'promotion', 'system', 'reminder')),
    read BOOLEAN DEFAULT false,
    action_url VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cakes_updated_at BEFORE UPDATE ON cakes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cake_templates_updated_at BEFORE UPDATE ON cake_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample cake data
INSERT INTO cakes (name, description, base_price, category, ingredients, allergens, featured) VALUES
('Classic Vanilla Birthday Cake', 'Our signature vanilla cake with buttercream frosting, perfect for any birthday celebration.', 45.00, 'Birthday', 
 '{"base": "vanilla sponge", "frosting": "buttercream", "decorations": ["sprinkles", "candles"]}', 
 ARRAY['gluten', 'dairy', 'eggs'], true),

('Chocolate Fudge Delight', 'Rich chocolate cake with chocolate ganache and fudge decorations.', 55.00, 'Birthday', 
 '{"base": "chocolate sponge", "frosting": "chocolate ganache", "decorations": ["chocolate shavings", "fudge pieces"]}', 
 ARRAY['gluten', 'dairy', 'eggs'], true),

('Strawberry Dream Cake', 'Light vanilla cake with fresh strawberry filling and cream cheese frosting.', 50.00, 'Celebration', 
 '{"base": "vanilla sponge", "filling": "strawberry cream", "frosting": "cream cheese", "decorations": ["fresh strawberries"]}', 
 ARRAY['gluten', 'dairy', 'eggs'], true),

('Wedding Elegance Cake', 'Multi-tier elegant cake perfect for wedding celebrations.', 120.00, 'Wedding', 
 '{"base": "vanilla and chocolate", "frosting": "buttercream", "decorations": ["sugar flowers", "pearls"]}', 
 ARRAY['gluten', 'dairy', 'eggs'], true);

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'DB' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_sequence')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;