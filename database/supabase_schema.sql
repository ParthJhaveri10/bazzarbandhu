-- VoiceCart Supabase Database Schema
-- Run this in your Supabase SQL editor

-- Create vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  type TEXT DEFAULT 'vendor' CHECK (type = 'vendor'),
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suppliers table
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  type TEXT DEFAULT 'supplier' CHECK (type = 'supplier'),
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  items JSONB DEFAULT '[]'::jsonb, -- Array of items they supply
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id),
  vendor_phone TEXT NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'pooled', 'dispatched', 'delivered', 'cancelled')),
  transcript TEXT,
  confidence DECIMAL(3,2) DEFAULT 0,
  estimated_value DECIMAL(10,2) DEFAULT 0,
  actual_value DECIMAL(10,2) DEFAULT 0,
  supplier_notes TEXT,
  delivery_notes TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pools table (for order grouping)
CREATE TABLE pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  orders UUID[] DEFAULT ARRAY[]::UUID[],
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'collecting' CHECK (status IN ('collecting', 'ready', 'dispatched', 'delivered', 'cancelled')),
  total_value DECIMAL(10,2) DEFAULT 0,
  threshold_min_orders INTEGER DEFAULT 5,
  threshold_min_value DECIMAL(10,2) DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_vendors_phone ON vendors(phone);
CREATE INDEX idx_vendors_pincode ON vendors(pincode);
CREATE INDEX idx_suppliers_phone ON suppliers(phone);
CREATE INDEX idx_suppliers_pincode ON suppliers(pincode);
CREATE INDEX idx_orders_vendor_phone ON orders(vendor_phone);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_pools_supplier_id ON pools(supplier_id);
CREATE INDEX idx_pools_status ON pools(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pools_updated_at BEFORE UPDATE ON pools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO suppliers (id, name, email, phone, business_name, address, pincode, items) VALUES
(gen_random_uuid(), 'Mumbai Fresh Suppliers', 'mumbai.fresh@suppliers.com', '+919876543210', 'Mumbai Fresh Suppliers Pvt Ltd', 'Market Road, Bandra West, Mumbai', '400050', 
 '[
   {"name": "potato", "hindi": "आलू", "price": 30, "unit": "kg", "available": true},
   {"name": "onion", "hindi": "प्याज", "price": 40, "unit": "kg", "available": true},
   {"name": "tomato", "hindi": "टमाटर", "price": 50, "unit": "kg", "available": true},
   {"name": "rice", "hindi": "चावल", "price": 80, "unit": "kg", "available": true}
 ]'::jsonb),
(gen_random_uuid(), 'Local Bazaar Co', 'local.bazaar@suppliers.com', '+919876543211', 'Local Bazaar Co-operative', 'Main Market, Kurla East, Mumbai', '400024',
 '[
   {"name": "potato", "hindi": "आलू", "price": 28, "unit": "kg", "available": true},
   {"name": "dal", "hindi": "दाल", "price": 115, "unit": "kg", "available": true},
   {"name": "oil", "hindi": "तेल", "price": 140, "unit": "liter", "available": true}
 ]'::jsonb);

-- Enable Row Level Security (RLS)
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Vendors can see and update their own data
CREATE POLICY "Vendors can view own data" ON vendors
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Vendors can update own data" ON vendors
  FOR UPDATE USING (auth.uid() = id);

-- Suppliers can see and update their own data
CREATE POLICY "Suppliers can view own data" ON suppliers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Suppliers can update own data" ON suppliers
  FOR UPDATE USING (auth.uid() = id);

-- Orders policies - vendors can see their orders, suppliers can see orders in their area
CREATE POLICY "Vendors can view own orders" ON orders
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Suppliers can view orders in their area" ON orders
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM suppliers WHERE pincode = (
        SELECT pincode FROM vendors WHERE id = orders.vendor_id
      )
    )
  );

-- Allow authenticated users to insert orders
CREATE POLICY "Authenticated users can insert orders" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow order updates by vendors and suppliers
CREATE POLICY "Vendors and suppliers can update orders" ON orders
  FOR UPDATE USING (
    auth.uid() = vendor_id OR 
    auth.uid() IN (
      SELECT id FROM suppliers WHERE pincode = (
        SELECT pincode FROM vendors WHERE id = orders.vendor_id
      )
    )
  );

-- Pools policies
CREATE POLICY "Suppliers can view their pools" ON pools
  FOR SELECT USING (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can manage their pools" ON pools
  FOR ALL USING (auth.uid() = supplier_id);

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
