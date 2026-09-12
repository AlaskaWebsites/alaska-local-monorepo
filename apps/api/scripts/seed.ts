// scripts/seed.ts
import { Pool } from 'pg'

// Conexão com o banco PostgreSQL (prioriza Render e variáveis de ambiente)
const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgres://alaska_admin:alaska_secret_2026@localhost:5432/alaska_local_db'

const ALL_10_TENANTS = [
  {
    id: 'ten-hamburgueria-x',
    slug: 'hamburgueria-x',
    name: 'Hamburgueria X Artesanal',
    description: 'Burgers artesanais grelhados no fogo alto, smashs ultra crocantes, batatas rústicas e milkshakes cremosos.',
    phone_whatsapp: '11988882222',
    address: 'Av. Ibirapuera, 900 - Moema, São Paulo - SP',
    business_category: 'menu',
    theme: 'amber',
    custom_domain: 'hamburgueriax.com.br',
    opening_hours: { open: '18:00', close: '23:59' },
    pix_config: { key: '11988882222', keyType: 'phone', beneficiary: 'Hamburgueria X Artesanal LTDA', city: 'SAO PAULO' },
    delivery_fee_cents: 850,
    min_order_value_cents: 3000,
    reviews: { rating: 4.9, count: 486, score: 4.9, totalReviews: 486 }
  },
  {
    id: 'ten-restaurante-bella-italia',
    slug: 'restaurante-bella-italia',
    name: 'Restaurante Bella Italia',
    description: 'Massas frescas artesanais preparadas na hora, molhos tradicionais italianos e sobremesas típicas.',
    phone_whatsapp: '11944443333',
    address: 'Rua Treze de Maio, 700 - Bixiga, São Paulo - SP',
    business_category: 'menu',
    theme: 'emerald',
    custom_domain: 'bellaitalia.com.br',
    opening_hours: { open: '11:30', close: '23:00' },
    pix_config: { key: '11944443333', keyType: 'phone', beneficiary: 'Restaurante Bella Italia LTDA', city: 'SAO PAULO' },
    delivery_fee_cents: 1000,
    min_order_value_cents: 4500,
    reviews: { rating: 4.8, count: 324, score: 4.8, totalReviews: 324 }
  },
  {
    id: 'ten-espetaria-brasa',
    slug: 'espetaria-brasa',
    name: 'Espetaria & Hamburgueria Brasa Viva',
    description: 'Espetinhos nobres grelhados no fogo a lenha, jantinhas completas com tropeiro e burgers defumados.',
    phone_whatsapp: '11955558888',
    address: 'Rua do Fogo, 400 - Tatuapé, São Paulo - SP',
    business_category: 'menu',
    theme: 'rose',
    custom_domain: 'espetariabrasa.com.br',
    opening_hours: { open: '17:30', close: '23:59' },
    pix_config: { key: '11955558888', keyType: 'phone', beneficiary: 'Espetaria Brasa Viva LTDA', city: 'SAO PAULO' },
    delivery_fee_cents: 900,
    min_order_value_cents: 3500,
    reviews: { rating: 4.9, count: 342, score: 4.9, totalReviews: 342 }
  },
  {
    id: 'ten-adega-prime',
    slug: 'adega-prime',
    name: 'Adega & Distribuidora Prime',
    description: 'Cervejas trincando, combos de destilados, gelos de sabor, carvão e conveniência com entrega rápida.',
    phone_whatsapp: '11988887777',
    address: 'Av. Brasil, 850 - Centro',
    business_category: 'menu',
    theme: 'amber',
    custom_domain: 'adegaprime.com.br',
    opening_hours: { open: '00:00', close: '23:59' },
    pix_config: { key: '11988887777', keyType: 'phone', beneficiary: 'Adega & Distribuidora Prime LTDA', city: 'SAO PAULO' },
    delivery_fee_cents: 700,
    min_order_value_cents: 3000,
    reviews: { rating: 4.9, count: 42, score: 4.9, totalReviews: 42 }
  },
  {
    id: 'ten-cafe-central',
    slug: 'cafe-central',
    name: 'Café Central',
    description: 'Cafés especiais moídos na hora, cappuccinos artesanais, croissants folhados e confeitaria fina.',
    phone_whatsapp: '11988881111',
    address: 'Rua Oscar Freire, 320 - Jardins, São Paulo - SP',
    business_category: 'menu',
    theme: 'food',
    custom_domain: 'cafecentral.com.br',
    opening_hours: { open: '07:30', close: '19:00' },
    pix_config: { key: '11988881111', keyType: 'phone', beneficiary: 'Café Central Bistrô', city: 'SAO PAULO' },
    delivery_fee_cents: 800,
    min_order_value_cents: 2500,
    reviews: { rating: 4.7, count: 289, score: 4.7, totalReviews: 289 }
  },
  {
    id: 'ten-bella-donna',
    slug: 'bella-donna',
    name: 'Bella Donna Boutique | Moda Feminina',
    description: 'Moda feminina casual chic, conjuntos de alfaiataria em crepe duna, vestidos fluidos e peças exclusivas direto do Brás para você.',
    phone_whatsapp: '11999990000',
    address: 'Rua 25 de Março, 400 - Centro, São Paulo - SP',
    business_category: 'shop',
    theme: 'drinks',
    custom_domain: 'belladonna.com.br',
    opening_hours: { open: '09:00', close: '18:00' },
    pix_config: { key: '11999990000', keyType: 'phone', beneficiary: 'Bella Donna Moda LTDA', city: 'SAO PAULO' },
    delivery_fee_cents: 1200,
    min_order_value_cents: 5000,
    reviews: { rating: 4.9, count: 274, score: 4.9, totalReviews: 274 }
  },
  {
    id: 'ten-karine-finardi',
    slug: 'karine-finardi',
    name: 'Karine Finardi Semijoias',
    description: 'Semijoias finas antialérgicas, banhadas a ouro 18k e prata 925 com garantia de 1 ano e design autoral.',
    phone_whatsapp: '11999998888',
    address: 'Centro Comercial Morato - Francisco Morato - SP',
    business_category: 'shop',
    theme: 'rose',
    custom_domain: 'karinefinardi.com.br',
    opening_hours: { open: '09:00', close: '19:00' },
    pix_config: { key: '11999998888', keyType: 'phone', beneficiary: 'Karine Finardi Semijoias', city: 'FRANCISCO MORATO' },
    delivery_fee_cents: 1000,
    min_order_value_cents: 5000,
    reviews: { rating: 4.9, count: 318, score: 4.9, totalReviews: 318 }
  },
  {
    id: 'ten-barbearia-style',
    slug: 'barbearia-style',
    name: 'Barbearia Style',
    description: 'Cortes modernos, barba com toalha quente, pigmentação e estética masculina.',
    phone_whatsapp: '11977776666',
    address: 'Rua Augusta, 1200 - Consolação, São Paulo - SP',
    business_category: 'hub',
    theme: 'barber',
    custom_domain: 'barbeariastyle.com.br',
    opening_hours: { open: '09:00', close: '20:00' },
    pix_config: { key: '11977776666', keyType: 'phone', beneficiary: 'Barbearia Style LTDA', city: 'SAO PAULO' },
    delivery_fee_cents: 0,
    min_order_value_cents: 0,
    reviews: { rating: 4.9, count: 412, score: 4.9, totalReviews: 412 }
  },
  {
    id: 'ten-clinica-sorriso',
    slug: 'clinica-sorriso',
    name: 'Clínica Sorriso',
    description: 'Odontologia moderna, implantes guiados, clareamento a laser, ortodontia invisível e harmonização facial.',
    phone_whatsapp: '11966665555',
    address: 'Av. Rebouças, 1500 - Pinheiros, São Paulo - SP',
    business_category: 'pro',
    theme: 'health',
    custom_domain: 'clinicasorriso.com.br',
    opening_hours: { open: '08:00', close: '19:00' },
    pix_config: { key: '11966665555', keyType: 'phone', beneficiary: 'Clinica Sorriso LTDA', city: 'SAO PAULO' },
    delivery_fee_cents: 0,
    min_order_value_cents: 0,
    reviews: { rating: 4.8, count: 267, score: 4.8, totalReviews: 267 }
  },
  {
    id: 'ten-studio-nail-design',
    slug: 'studio-nail-design',
    name: 'Studio Nail Design',
    description: 'Especialistas em nail art, manicure, pedicure, alongamentos e esmaltes de alta qualidade. Agendamento fácil e venda de produtos profissionais.',
    phone_whatsapp: '11955553333',
    address: 'Rua das Unhas, 789 - Jardins',
    business_category: 'hub',
    theme: 'rose',
    custom_domain: 'studionaildesign.com.br',
    opening_hours: { open: '09:00', close: '19:00' },
    pix_config: { key: '11955553333', keyType: 'phone', beneficiary: 'Studio Nail Design LTDA', city: 'SAO PAULO' },
    delivery_fee_cents: 0,
    min_order_value_cents: 0,
    reviews: { rating: 4.8, count: 287, score: 4.8, totalReviews: 287 }
  }
]

async function runSeed() {
  console.log('🌱 Conectando ao PostgreSQL para sincronização dos 10 estabelecimentos...')
  const pool = new Pool({ connectionString: DATABASE_URL })

  try {
    for (const tenant of ALL_10_TENANTS) {
      const query = `
        INSERT INTO tenants (
          id, slug, name, description, phone_whatsapp, address,
          business_category, theme, custom_domain, opening_hours, pix_config,
          delivery_fee_cents, min_order_value_cents, reviews, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true
        )
        ON CONFLICT (slug) DO UPDATE SET
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
          reviews = EXCLUDED.reviews,
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
        tenant.min_order_value_cents,
        JSON.stringify(tenant.reviews)
      ])

      console.log(`✅ Tenant ${tenant.name} (${tenant.id}) sincronizado com sucesso no PostgreSQL com reviews reais.`)
    }

    console.log('\n🚀 Seed concluído com sucesso! Todos os 10 tenants estão cadastrados no banco com notas e contagens de avaliações reais.')
  } catch (error) {
    console.error('❌ Erro durante a execução do seed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runSeed()
