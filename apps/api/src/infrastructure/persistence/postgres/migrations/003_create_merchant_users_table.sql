-- Migration 003: Criar tabela de merchant_users para autenticação corporativa do Lojista (ADR 017)
CREATE TABLE IF NOT EXISTS merchant_users (
    id VARCHAR(100) PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tenant_slug VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'merchant',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_merchant_user_tenant_email UNIQUE(tenant_slug, email)
);

CREATE INDEX IF NOT EXISTS idx_merchant_users_slug_email ON merchant_users(tenant_slug, email);
