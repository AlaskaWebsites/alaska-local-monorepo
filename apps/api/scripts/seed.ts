import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const databaseUrl = process.env.DATABASE_URL || 'postgres://alaska:alaskapassword@localhost:5432/alaska_local'

const stores = [
  {
    "slug": "adega-prime",
    "name": "Adega & Distribuidora Prime",
    "city": "SAO PAULO"
  },
  {
    "slug": "karine-finardi",
    "name": "Karine Finardi Semijoias",
    "city": "FRANCISCO MORATO"
  },
  {
    "slug": "barbearia-style",
    "name": "Barbearia Style",
    "city": "SAO PAULO"
  },
  {
    "slug": "hamburgueria-x",
    "name": "Hamburgueria X Artesanal",
    "city": "SAO PAULO"
  },
  {
    "slug": "clinica-sorriso",
    "name": "Clínica Sorriso Odontologia",
    "city": "SAO PAULO"
  },
  {
    "slug": "bella-donna",
    "name": "Bella Donna Boutique",
    "city": "FRANCISCO MORATO"
  },
  {
    "slug": "cafe-central",
    "name": "Café Central",
    "city": "SAO PAULO"
  },
  {
    "slug": "espetaria-brasa",
    "name": "Espetaria & Jantinha Brasa Nobre",
    "city": "SAO PAULO"
  },
  {
    "slug": "restaurante-bella-italia",
    "name": "Restaurante Bella Italia",
    "city": "SAO PAULO"
  }
]

async function runSeed() {
  console.log('🌱 Conectando ao PostgreSQL para atualizar chave Pix...')
  const pool = new Pool({ connectionString: databaseUrl })

  try {
    const client = await pool.connect()
    console.log('✅ Conectado ao banco de dados!')

    const targetPixKey = '7e3ed5e6-6097-4b15-88a3-221caba64141'
    const targetKeyType = 'random'

    console.log(`🔄 Atualizando chave Pix para: ${targetPixKey} (${targetKeyType}) em todas as lojas...\n`)

    for (const store of stores) {
      const pixConfig = JSON.stringify({
        key: targetPixKey,
        keyType: targetKeyType,
        beneficiary: store.name,
        city: store.city,
        allowTestCent: true,
        depositPercentage: 30
      })

      // Atualiza o pix_config pelo slug (compatível com id UUID nativo ou VARCHAR)
      const res = await client.query(
        `UPDATE tenants 
         SET pix_config = $1::jsonb 
         WHERE LOWER(slug) = LOWER($2) 
         RETURNING slug, name, pix_config`,
        [pixConfig, store.slug]
      )

      if (res.rowCount && res.rowCount > 0) {
        const row = res.rows[0]
        console.log(`   ✓ [${row.slug}] ${row.name}: Pix Key = ${row.pix_config?.key} (${row.pix_config?.keyType})`)
      } else {
        // Se o tenant ainda não existe no banco, insere deixando o ID com default uuid
        const insertRes = await client.query(
          `INSERT INTO tenants (slug, name, phone_whatsapp, business_category, theme, pix_config)
           VALUES ($1, $2, '11999999999', 'menu', 'food', $3::jsonb)
           RETURNING slug, name, pix_config`,
          [store.slug, store.name, pixConfig]
        )
        const row = insertRes.rows[0]
        console.log(`   + [${row.slug}] ${row.name} (Criado): Pix Key = ${row.pix_config?.key}`)
      }
    }

    client.release()
    await pool.end()
    console.log('\n🚀 Todas as lojas foram atualizadas com sucesso no PostgreSQL!')
  } catch (err) {
    console.error('❌ Erro ao executar seed:', err)
    process.exit(1)
  }
}

runSeed()
