# Destiny Bakes: AI-Powered Cake Ordering Platform

## 🎯 Project Overview

**Business:** Destiny Bakes - Custom Cake Baking (Home-based, Chirundu, Zambia)  
**Vision:** Create a world-class, AI-centric platform that revolutionizes local cake ordering with exceptional UX and smart business intelligence.

## 🏗️ Technology Stack

- **Frontend:** Next.js 14+ (App Router) with TypeScript
- **Authentication:** Clerk (multi-provider auth + user management)
- **Database:** Supabase (PostgreSQL + Real-time + Storage)
- **Styling:** Tailwind CSS + shadcn/ui components
- **AI Integration:** CopilotKit for intelligent interactions
- **State Management:** XState for complex order flows
- **Notifications:** Twilio/Africa's Talking (WhatsApp + SMS)
- **Analytics:** Custom dashboard + Supabase Analytics
- **Payments:** Flutterwave/Paystack (Zambian market)

## 🎨 Design System

### Color Palette
- **Primary:** Warm pink/rose (#E91E63)
- **Secondary:** Cream/vanilla (#FFF8E1)
- **Accent:** Gold (#FFD700)
- **Neutral:** Warm grays

### Typography
- **Headers:** Playfair Display (elegant, bakery feel)
- **Body:** Poppins (modern, readable)
- **Accent:** Dancing Script (handwritten cake labels)

## 🚀 Core Features

### 1. Public Website
- AI-powered landing page with dynamic cake showcase
- Interactive cake catalog with smart filtering
- Custom cake designer with state machine flow
- Real-time pricing and availability

### 2. Customer Dashboard
- Order tracking with AI predictions
- Personalized cake recommendations
- Order history and favorites
- Account management

### 3. Admin Dashboard
- Real-time order management
- Business intelligence with AI insights
- Inventory management
- Customer analytics

### 4. AI Features (CopilotKit)
- Customer service chatbot
- Cake design assistant
- Price optimization
- Demand forecasting

## 📱 Project Structure

```
destiny-bakes/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with CopilotKit
│   ├── page.tsx           # Landing page
│   ├── (auth)/            # Protected routes
│   │   ├── dashboard/     # Customer dashboard
│   │   └── admin/         # Admin dashboard
│   ├── cake-designer/     # AI cake customization
│   ├── api/               # API routes
│   │   ├── copilotkit/    # AI backend
│   │   ├── orders/        # Order management
│   │   └── notifications/ # WhatsApp/SMS
│   └── globals.css        # Tailwind styles
├── components/            # Reusable UI
│   ├── ui/               # shadcn/ui components
│   ├── ai/               # AI components
│   ├── cake/             # Cake-specific components
│   └── dashboard/        # Dashboard components
├── lib/                  # Core utilities
│   ├── supabase.ts       # Database client
│   ├── clerk.ts          # Auth config
│   ├── copilotkit.ts     # AI configuration
│   └── state-machines/   # XState machines
├── types/                # TypeScript definitions
└── hooks/                # Custom React hooks
```

## 🗄️ Database Schema

### Core Tables
```sql
-- User profiles (extends Clerk)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  clerk_user_id VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  phone VARCHAR,
  dietary_restrictions TEXT[],
  delivery_addresses JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cake catalog
CREATE TABLE cakes (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  base_price DECIMAL,
  category VARCHAR,
  images TEXT[],
  ingredients JSONB,
  allergens TEXT[],
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES user_profiles(id),
  cake_config JSONB,
  total_amount DECIMAL,
  status VARCHAR DEFAULT 'pending',
  delivery_date DATE,
  delivery_address JSONB,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order tracking
CREATE TABLE order_events (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  event_type VARCHAR,
  description TEXT,
  estimated_completion TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY,
  user_id UUID,
  assistant_type VARCHAR,
  messages JSONB,
  cake_design JSONB,
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks

# Database
npx supabase start   # Start local Supabase
npx supabase db push # Push schema changes
npx supabase gen types # Generate TypeScript types

# AI/CopilotKit
npm run copilotkit   # Start CopilotKit service
```

## 🚀 Implementation Plan

### Phase 1: Foundation (Week 1)
- [x] Project setup with Next.js 14 + TypeScript
- [x] Tailwind CSS configuration with design system
- [x] Basic project structure
- [ ] Clerk authentication setup
- [ ] Supabase database configuration

### Phase 2: Core Features (Week 2)
- [ ] shadcn/ui component integration
- [ ] Basic landing page
- [ ] User authentication flows
- [ ] Database schema implementation
- [ ] Basic cake catalog

### Phase 3: AI Integration (Week 3)
- [ ] CopilotKit setup and configuration
- [ ] AI-powered cake designer
- [ ] State machine for order flow
- [ ] Customer AI assistant
- [ ] Basic admin dashboard

### Phase 4: Advanced Features (Week 4)
- [ ] Payment integration
- [ ] Order tracking system
- [ ] WhatsApp/SMS notifications
- [ ] Advanced analytics
- [ ] Mobile optimization

## 🔒 Environment Variables

```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Integration
NEXT_PUBLIC_COPILOT_API_KEY=
OPENAI_API_KEY=

# Payments
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=

# Notifications
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
```

## 📊 Success Metrics

### Technical KPIs
- Page load speed: < 2 seconds on mobile
- Uptime: 99.9% availability
- Conversion rate: > 5% visitor to customer
- Mobile usage: > 80% traffic

### Business KPIs
- Customer acquisition cost optimization
- Customer lifetime value increase
- Order fulfillment time reduction
- Customer satisfaction: > 4.5/5 rating

### AI Performance
- Recommendation accuracy: > 70% CTR
- Chatbot resolution: > 80% first-contact
- Demand prediction: < 10% forecast error
- Price optimization: 15% profit margin increase

## 🎯 Available Cake Options

### Flavors
- Vanilla
- Strawberry  
- Chocolate
- Choco-mint
- Mint
- Banana
- Fruit

### Sizes
- 4" (2-4 servings)
- 6" (6-8 servings)
- 8" (10-12 servings)
- 10" (15-20 servings)

### Shapes
- Round
- Square
- Heart

### Structure
- Layers: 1-3 combinations
- Tiers: 1-3 levels

## 🌟 Unique Features

1. **AI-Powered Design Assistant:** Helps customers create perfect cakes through conversational UI
2. **Smart Preview Generation:** AI creates realistic cake previews before ordering
3. **Predictive Analytics:** AI forecasts demand and optimizes inventory
4. **Local Context Integration:** Zambian holidays, events, and preferences
5. **WhatsApp Integration:** Native messaging for order updates
6. **Progressive Web App:** App-like experience without app store
7. **State Machine Ordering:** Robust, step-by-step cake customization
8. **Real-time Tracking:** Live order progress with AI predictions

## 🎨 Brand Personality

Destiny Bakes embodies:
- **Warmth & Love:** Every cake tells a story of celebration
- **Quality & Craftsmanship:** Artisanal approach with modern technology
- **Local Pride:** Proudly Zambian, globally inspired
- **Innovation:** AI-powered but human-centered
- **Accessibility:** Beautiful cakes for every budget and occasion

---

*This platform will transform Destiny Bakes from a local home bakery into a technology-driven cake creation experience that delights customers and optimizes business operations.*