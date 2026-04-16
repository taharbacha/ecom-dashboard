-- Run these optionally if you want to completely overwrite your previous tables:
-- DROP TABLE IF EXISTS ad_spend CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;

-- Enable UUID Extension (required for uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Products Table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Orders Table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE, -- Tracks the product by ID
  ref TEXT NOT NULL,
  date DATE NOT NULL,
  client TEXT NOT NULL,
  num TEXT,
  wilaya TEXT,
  qtt NUMERIC DEFAULT 0,
  prix_de_vente NUMERIC DEFAULT 0,
  benefice_net NUMERIC DEFAULT 0,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Ad Spend Table
CREATE TABLE ad_spend (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE, -- Tracks the product by ID
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  amount_dzd NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
