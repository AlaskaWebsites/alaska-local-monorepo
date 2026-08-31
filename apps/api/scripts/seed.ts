import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgres://alaska_admin:alaska_secret_2026@localhost:5432/alaska_local_db'

const ALL_9_TENANTS = [
  {
    id: 'ten-hamburgueria-x',
    slug: 'hamburgueria-x',
    name: 'Hamburgueria X Artesanal',
    description: 'Burgers artesanais grelhados na brasa, smashs crocantes e porções exclusivas.',
    phone_whatsapp: '11988887777',
    address: 'Rua das Hamburguerias, 123 - Centro',
    business_category: 'menu',
    theme: 'food',
    custom_domain: 'hamburgueriax.com.br',
    opening_hours: { open: '18:00', close: '23:30' },
    pix_config: { key: '11988887777', keyType: 'phone', beneficiary: 'Hamburgueria X LTDA', city: 'SAO PAULO' },
    delivery_fee_cents: 600,
    min_order_value_cents: 2000
  },
  {
    id: 'ten-adega-prime',
    slug: 'adega-prime',
    name: 'Adega Prime 24h',
    description: 'Bebidas geladas, destilados importados, cervejas artesanais e combos com entrega expressa 24 horas.',
    phone_whatsapp: '11988887777',
    address: 'Av. Paulista, 1000 - Bela Vista',
    business_category: 'menu',
    theme: 'drinks',
    custom_domain: 'adegaprime.com.br',
    opening_hours: { open: '00:00', close: '23:59' },
    pix_config: { key: '11988887777', keyType: 'phone', beneficiary: 'Adega Prime LTDA', city: 'SAO PAULO' },
    delivery_fee_cents: 800,
    min_order_value_cents: 3000
  },
  {
    id: 'ten-espetaria-brasa',
    slug: 'espetaria-brasa',
    name: 'Espetaria Brasa & Fogo',
    description: 'Espetinhos na brasa, jantinhas completas, acompanhamentos e cervejas geladas.',
    phone_whatsapp: '11977776666',
    address: 'Rua do Fogo, 450 - Vila Madalena',
    business_category: 'menu',
    theme: 'amber',
    custom_domain: 'espetariabrasa.com.br',
    opening_hours: { open: '17:00', close: '23:00' },
    pix_config: { key: '11977776666', keyType: 'phone', beneficiary: 'Espetaria Brasa LTDA', city: 'SAO PAULO' },
    delivery_fee_cents: 600,
    min_order_value_cents: 2500
  },
  {
    id: 'ten-cafe-central',
    slug: 'cafe-central',
    name: 'Café Central & Bistrô',
    description: 'Cafés especiais, doces artesanais, brunches e salgados gourmet.',
    phone_whatsapp: '11966665555',
    address: 'Praça da Sé, 10 - Centro Histórico',
    business_category: 'menu',
    theme: 'amber',
    custom_domain: 'cafecentral.com.br',
    opening_hours: { open: '08:00', close: '19:00' },
    pix_config: { key: '11966665555', keyType: 'phone', beneficiary: 'Cafe Central LTDA', city: 'SAO PAULO' },
    delivery_fee_cents: 500,
    min_order_value_cents: 1500
  },
  {
    id: 'ten-restaurante-bella-italia',
    slug: 'restaurante-bella-italia',
    name: 'Restaurante Bella Italia',
    description: 'Massas frescas feitas à mão, risotos, vinhos importados e receitas tradicionais italianas.',
    phone_whatsapp: '11955554444',
    address: 'Rua Avanhandava, 200 - Bela Vista',
    business_category: 'menu',
    theme: 'emerald',
    custom_domain: 'bellaitalia.com.br',
    opening_hours: { open: '11:30', close: '23:00' },
    pix_config: { key: '11955554444', keyType: 'phone', beneficiary: 'Bella Italia LTDA', city: 'SAO PAULO' },
    delivery_fee_cents: 1000,
    min_order_value_cents: 4000
  },
  {
    id: 'ten-bella-donna',
    slug: 'bella-donna',
    name: 'Bella Donna Boutique',
    description: 'Moda feminina contemporânea, vestidos de linho, alfaiataria e acessórios elegantes.',
    phone_whatsapp: '11944443333',
    address: 'Rua Oscar Freire, 800 - Jardins',
    business_category: 'shop',
    theme: 'rose',
    custom_domain: 'belladonna.com.br',
    opening_hours: { open: '10:00', close: '20:00' },
    pix_config: { key: '11944443333', keyType: 'phone', beneficiary: 'Bella Donna Moda', city: 'SAO PAULO' },
    delivery_fee_cents: 1500,
    min_order_value_cents: 5000
  },
  {
    id: 'ten-karine-finardi',
    slug: 'karine-finardi',
    name: 'Karine Finardi Semijoias',
    description: 'Semijoias finas hipoalergênicas, banhadas a ouro 18k e prata 925 com garantia de 1 ano.',
    phone_whatsapp: '11999998888',
    address: 'Francisco Morato - SP',
    business_category: 'shop',
    theme: 'rose',
    custom_domain: 'karinefinardi.com.br',
    opening_hours: { open: '09:00', close: '19:00' },
    pix_config: { key: '11999998888', keyType: 'phone', beneficiary: 'Karine Finardi', city: 'FRANCISCO MORATO' },
    delivery_fee_cents: 1000,
    min_order_value_cents: 5000
  },
  {
    id: 'ten-barbearia-style',
    slug: 'barbearia-style',
    name: 'Barbearia Style Club',
    description: 'Cortes modernos, barba na toalha quente, cerveja artesanal e ambiente climatizado.',
    phone_whatsapp: '11977776666',
    address: 'Rua Augusta, 500 - Consolação',
    business_category: 'hub',
    theme: 'violet',
    custom_domain: 'barbeariastyle.com.br',
    opening_hours: { open: '09:00', close: '20:00' },
    pix_config: { key: '11977776666', keyType: 'phone', beneficiary: 'Style Club Barbearia', city: 'SAO PAULO' },
    delivery_fee_cents: 0,
    min_order_value_cents: 0
  },
  {
    id: 'ten-clinica-sorriso',
    slug: 'clinica-sorriso',
    name: 'Clínica Sorriso Odontologia',
    description: 'Implantes, clareamento dental a laser, ortodontia e harmonização orofacial com especialistas.',
    phone_whatsapp: '11966665555',
    address: 'Av. Ibirapuera, 1500 - Moema',
    business_category: 'pro',
    theme: 'health',
    custom_domain: 'clinicasorriso.com.br',
    opening_hours: { open: '08:00', close: '19:00' },
    pix_config: { key: '11966665555', keyType: 'phone', beneficiary: 'Clinica Sorriso LTDA', city: 'SAO PAULO' },
    delivery_fee_cents: 0,
    min_order_value_cents: 0
  }
]

async function runSeed() {
  console.log('🌱 Conectando ao PostgreSQL para sincronização dos 9 estabelecimentos...')
  const pool = new Pool({ connectionString: DATABASE_URL })

  try {
    for (const tenant of ALL_9_TENANTS) {
      const query = `
        INSERT INTO tenants (
          id, slug, name, description, phone_whatsapp, address,
          business_category, theme, custom_domain, opening_hours,
          pix_config, delivery_fee_cents, min_order_value_cents, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true
        )
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          phone_whatsapp = EXCLUDED.phone_whatsapp,
          address = EXCLUDED.address,
          business_category = EXCLUDED.business_category,
          theme = EXCLUDED.theme,
          custom_domain = EXCLUDED.custom_domain,
          opening_hours = EXCLUDED.opening_hours,
          pix_config = EXCLUDED.pix_config,
          delivery_fee_cents = EXCLUDED.delivery_fee_cents,
          min_order_value_cents = EXCLUDED.min_order_value_cents,
          is_active = true
      `

      await pool.query(query, [
        tenant.id,
        tenant.slug,
        tenant.name,
        tenant.description,
        tenant.phone_whatsapp,
        tenant.address,
        tenant.business_category,
        tenant.theme,
        tenant.custom_domain,
        JSON.stringify(tenant.opening_hours),
        JSON.stringify(tenant.pix_config),
        tenant.delivery_fee_cents,
        tenant.min_order_value_cents
      ])

      console.log(`✅ Tenant ${tenant.name} (${tenant.id}) sincronizado com sucesso no PostgreSQL.`)
    }

    console.log('\n🚀 Seed concluído com sucesso! Todos os 9 tenants estão cadastrados no banco.')
  } catch (error) {
    console.error('❌ Erro durante a execução do seed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runSeed()
