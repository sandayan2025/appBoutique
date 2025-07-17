/*
  # Initial Schema for Store Management Application

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `name_ar` (text, optional)
      - `description` (text)
      - `description_ar` (text, optional)
      - `price` (numeric)
      - `stock` (integer)
      - `category` (text)
      - `category_ar` (text, optional)
      - `images` (text array)
      - `is_active` (boolean)
      - `views` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `store_settings`
      - `id` (uuid, primary key)
      - `name` (text)
      - `name_ar` (text, optional)
      - `whatsapp_number` (text)
      - `address` (text)
      - `address_ar` (text, optional)
      - `email` (text)
      - `social_links` (jsonb)
      - `logo` (text, optional)
      - `welcome_message` (text)
      - `welcome_message_ar` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `visits`
      - `id` (uuid, primary key)
      - `product_id` (uuid, optional, foreign key)
      - `page` (text)
      - `source` (text, optional)
      - `ip_address` (text, optional)
      - `user_agent` (text)
      - `referrer` (text)
      - `location` (jsonb, optional)
      - `created_at` (timestamp)

    - `orders`
      - `id` (uuid, primary key)
      - `items` (jsonb)
      - `total` (numeric)
      - `source` (text, optional)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to products and store_settings
    - Add policies for authenticated admin access to all operations

  3. Functions
    - `increment_product_views` function to atomically increment product views
    - `update_updated_at_column` trigger function for automatic timestamp updates
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  name_ar text,
  description text NOT NULL,
  description_ar text,
  price numeric(10,2) NOT NULL CHECK (price > 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category text NOT NULL,
  category_ar text,
  images text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Store settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  name_ar text,
  whatsapp_number text NOT NULL,
  address text NOT NULL,
  address_ar text,
  email text NOT NULL,
  social_links jsonb DEFAULT '{}',
  logo text,
  welcome_message text NOT NULL,
  welcome_message_ar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Visits table for analytics
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  page text NOT NULL,
  source text,
  ip_address text,
  user_agent text NOT NULL,
  referrer text NOT NULL DEFAULT '',
  location jsonb,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  items jsonb NOT NULL,
  total numeric(10,2) NOT NULL CHECK (total > 0),
  source text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to increment product views
CREATE OR REPLACE FUNCTION increment_product_views(product_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE products 
  SET views = views + 1 
  WHERE id = product_id;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at 
  BEFORE UPDATE ON store_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies for products (public read, authenticated admin write)
CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT 
  USING (true);

CREATE POLICY "Products are manageable by authenticated users" 
  ON products FOR ALL 
  USING (auth.role() = 'authenticated');

-- Policies for store_settings (public read, authenticated admin write)
CREATE POLICY "Store settings are viewable by everyone" 
  ON store_settings FOR SELECT 
  USING (true);

CREATE POLICY "Store settings are manageable by authenticated users" 
  ON store_settings FOR ALL 
  USING (auth.role() = 'authenticated');

-- Policies for visits (public write for tracking, authenticated read)
CREATE POLICY "Visits can be created by anyone" 
  ON visits FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Visits are viewable by authenticated users" 
  ON visits FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Policies for orders (public write for creation, authenticated read)
CREATE POLICY "Orders can be created by anyone" 
  ON orders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Orders are viewable by authenticated users" 
  ON orders FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Orders are manageable by authenticated users" 
  ON orders FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Insert default store settings
INSERT INTO store_settings (
  name,
  name_ar,
  whatsapp_number,
  address,
  address_ar,
  email,
  social_links,
  welcome_message,
  welcome_message_ar
) VALUES (
  'Ma Boutique',
  'متجري',
  '+212600000000',
  '123 Rue Mohammed V, Casablanca',
  '123 شارع محمد الخامس، الدار البيضاء',
  'contact@maboutique.com',
  '{"facebook": "https://facebook.com/maboutique", "instagram": "https://instagram.com/maboutique"}',
  'Bienvenue dans notre boutique ! Découvrez nos produits de qualité.',
  'مرحباً بكم في متجرنا! اكتشفوا منتجاتنا عالية الجودة.'
) ON CONFLICT DO NOTHING;