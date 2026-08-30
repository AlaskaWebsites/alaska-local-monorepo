-- Script de Inicialização do PostgreSQL 16 com RLS e Seeds para o Alaska Local
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Tenants
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(100) PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo TEXT,
    banner TEXT,
    phone_whatsapp VARCHAR(20) NOT NULL,
    address TEXT,
    business_category VARCHAR(20) NOT NULL CHECK (business_category IN ('menu', 'shop', 'hub', 'pro')),
    theme VARCHAR(30) DEFAULT 'food',
    custom_domain VARCHAR(100) UNIQUE,
    opening_hours JSONB,
    pix_config JSONB,
    delivery_fee_cents INT DEFAULT 0,
    min_order_value_cents INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Produtos / Serviços
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id VARCHAR(100) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_cents INT NOT NULL CHECK (price_cents >= 0),
    image TEXT,
    available BOOLEAN DEFAULT true,
    duration_minutes INT,
    option_groups JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Pedidos (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('delivery', 'pickup')),
    address JSONB,
    items JSONB NOT NULL,
    subtotal_cents INT NOT NULL,
    delivery_fee_cents INT NOT NULL DEFAULT 0,
    total_cents INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    change_for_cents INT,
    status VARCHAR(30) DEFAULT 'created',
    pix_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Agendamentos (Bookings)
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    services JSONB NOT NULL,
    professional_id VARCHAR(100),
    professional_name VARCHAR(255),
    booking_date DATE NOT NULL,
    booking_time VARCHAR(10) NOT NULL,
    total_price_cents INT NOT NULL,
    total_duration_minutes INT NOT NULL,
    payment_mode VARCHAR(30) NOT NULL,
    deposit_amount_cents INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'scheduled',
    notes TEXT,
    pix_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- SEED INICIAL DE DEMOSTRAÇÃO: Adega Prime 24h, Karine Finardi & Barbearia Style
INSERT INTO tenants (id, slug, name, description, phone_whatsapp, address, business_category, theme, custom_domain, opening_hours, pix_config, delivery_fee_cents, min_order_value_cents)
VALUES 
(
  'ten-adega-prime', 'adega-prime', 'Adega Prime 24h',
  'Bebidas geladas, destilados importados, cervejas artesanais e combos com entrega expressa 24 horas.',
  '11988887777', 'Av. Paulista, 1000 - Bela Vista', 'menu', 'amber', 'adegaprime.com.br',
  '{"open": "00:00", "close": "23:59"}'::jsonb,
  '{"key": "7e3ed5e6-6097-4b15-88a3-221caba64141", "keyType": "random", "beneficiary": "Adega Prime LTDA", "city": "SAO PAULO"}'::jsonb,
  700, 3000
),
(
  'ten-karine-finardi', 'karine-finardi', 'Karine Finardi Semijoias',
  'Semijoias finas hipoalergênicas, banhadas a ouro 18k e prata 925 com garantia de 1 ano.',
  '11999998888', 'Francisco Morato - SP', 'shop', 'rose', 'karinefinardi.com.br',
  '{"open": "09:00", "close": "19:00"}'::jsonb,
  '{"key": "7e3ed5e6-6097-4b15-88a3-221caba64141", "keyType": "random", "beneficiary": "Karine Finardi", "city": "FRANCISCO MORATO"}'::jsonb,
  1000, 5000
),
(
  'ten-barbearia-style', 'barbearia-style', 'Barbearia Style Club',
  'Cortes modernos, barba na toalha quente, cerveja artesanal e ambiente climatizado.',
  '11977776666', 'Rua Augusta, 500 - Consolação', 'hub', 'violet', 'barbeariastyle.com.br',
  '{"open": "09:00", "close": "20:00"}'::jsonb,
  '{"key": "7e3ed5e6-6097-4b15-88a3-221caba64141", "keyType": "random", "beneficiary": "Style Club Barbearia", "city": "SAO PAULO"}'::jsonb,
  0, 0
)
ON CONFLICT (slug) DO NOTHING;
