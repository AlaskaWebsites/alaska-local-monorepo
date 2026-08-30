import { Pool } from 'pg'
import { randomUUID } from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const databaseUrl = process.env.DATABASE_URL || 'postgres://alaska_admin:alaska_secret_2026@localhost:5432/alaska_local_db'

interface StoreSeed {
  slug: string
  name: string
  category: 'menu' | 'shop' | 'hub' | 'pro'
  theme: string
  city: string
  phone: string
}

const stores: StoreSeed[] = [
  {
    slug: 'adega-prime',
    name: 'Adega & Distribuidora Prime',
    category: 'menu',
    theme: 'amber',
    city: 'SAO PAULO',
    phone: '11988889999'
  },
  {
    slug: 'karine-finardi',
    name: 'Karine Finardi Semijoias',
    category: 'shop',
    theme: 'rose',
    city: 'FRANCISCO MORATO',
    phone: '11999998888'
  },
  {
    slug: 'barbearia-style',
    name: 'Barbearia Style',
    category: 'hub',
    theme: 'barber',
    city: 'SAO PAULO',
    phone: '11977776666'
  },
  {
    slug: 'hamburgueria-x',
    name: 'Hamburgueria X Artesanal',
    category: 'menu',
    theme: 'food',
    city: 'SAO PAULO',
    phone: '11999999999'
  },
  {
    slug: 'clinica-sorriso',
    name: 'Clínica Sorriso Odontologia',
    category: 'pro',
    theme: 'health',
    city: 'SAO PAULO',
    phone: '11966665555'
  },
  {
    slug: 'bella-donna',
    name: 'Bella Donna Boutique',
    category: 'shop',
    theme: 'drinks',
    city: 'FRANCISCO MORATO',
    phone: '11977778888'
  },
  {
    slug: 'cafe-central',
    name: 'Café Central',
    category: 'menu',
    theme: 'food',
    city: 'SAO PAULO',
    phone: '11988887777'
  },
  {
    slug: 'espetaria-brasa',
    name: 'Espetaria & Jantinha Brasa Nobre',
    category: 'menu',
    theme: 'food',
    city: 'SAO PAULO',
    phone: '11999999999'
  },
  {
    slug: 'restaurante-bella-italia',
    name: 'Restaurante Bella Italia',
    category: 'menu',
    theme: 'food',
    city: 'SAO PAULO',
    phone: '5511999999999'
  }
]

async function runSeed() {
  console.log('🌱 Conectando ao PostgreSQL para sincronizar estabelecimentos...')
  const pool = new Pool({ connectionString: databaseUrl })

  try {
    const client = await pool.connect()

    const targetPixKey = '7e3ed5e6-6097-4b15-88a3-221caba64141'
    const targetKeyType = 'random'

    console.log(`🔄 Atualizando estabelecimentos e chaves Pix (${targetPixKey})...\n`)

    for (const store of stores) {
      const pixConfig = JSON.stringify({
        key: targetPixKey,
        keyType: targetKeyType,
        beneficiary: store.name,
        city: store.city,
        allowTestCent: true,
        depositPercentage: 30
      })

      // 1. Tenta atualizar se o tenant já existe pelo slug
      const res = await client.query(
        `UPDATE tenants 
         SET pix_config = $1::jsonb,
             name = $2,
             business_category = $3,
             theme = $4,
             updated_at = NOW()
         WHERE LOWER(slug) = LOWER($5) 
         RETURNING slug, name, pix_config`,
        [pixConfig, store.name, store.category, store.theme, store.slug]
      )

      if (res.rowCount && res.rowCount > 0) {
        const row = res.rows[0]
        console.log(`   ✓ [${row.slug}] ${row.name}: Sincronizado`)
      } else {
        // 2. Se o tenant não existe no banco, insere gerando UUID explícito
        const generatedId = randomUUID()
        const insertRes = await client.query(
          `INSERT INTO tenants (id, slug, name, phone_whatsapp, business_category, theme, pix_config)
           VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
           RETURNING slug, name, pix_config`,
          [generatedId, store.slug, store.name, store.phone, store.category, store.theme, pixConfig]
        )
        const row = insertRes.rows[0]
        console.log(`   + [${row.slug}] ${row.name} (Criado com ID ${generatedId.slice(0, 8)}...)`)
      }
    }

    client.release()
    await pool.end()
    console.log('\n🚀 Todos os 9 estabelecimentos foram sincronizados com sucesso no PostgreSQL!')
  } catch (err) {
    console.error('❌ Erro ao executar seed:', err)
    process.exit(1)
  }
}

runSeed()
