-- Migration 002: Adicionar pin_hash à tabela de tenants para autenticação do Painel do Lojista
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255);

-- Comentário da coluna para documentação
COMMENT ON COLUMN tenants.pin_hash IS 'Hash SHA-256 / Bcrypt do PIN de 4 a 8 dígitos do lojista para acesso ao Painel Admin';
