import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDir = path.resolve(__dirname, '../data')

if (!fs.existsSync(dataDir)) {
  console.error(`❌ Diretório de dados não encontrado: ${dataDir}`)
  process.exit(1)
}

const VALID_THEMES = [
  'food', 'barber', 'health', 'drinks', 'rose',
  'amber', 'violet', 'blue', 'emerald', 'slate', 'default'
]

const VALID_CATEGORIES = ['menu', 'shop', 'hub', 'pro']

const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'))

console.log(`\n🔍 Validando integridade de ${files.length} estabelecimentos no Alaska Local...\n`)

let hasErrors = false
const results = []

for (const file of files) {
  const filePath = path.join(dataDir, file)
  const errors = []
  const warnings = []

  let tenant = null
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    tenant = JSON.parse(raw)
  } catch (err) {
    errors.push(`JSON inválido ou corrompido: ${err.message}`)
    results.push({ file, errors, warnings })
    hasErrors = true
    continue
  }

  // 1. Validação de Slug e Nome do Arquivo
  const expectedFile = `${(tenant.slug || '').toLowerCase()}.json`
  if (!tenant.slug) {
    errors.push('Campo "slug" obrigatório ausente.')
  } else if (file !== expectedFile) {
    errors.push(`Nome do arquivo "${file}" difere do slug "${tenant.slug}" (esperado: ${expectedFile}).`)
  }

  if (!tenant.name?.trim()) {
    errors.push('Campo "name" obrigatório ausente ou vazio.')
  }

  if (!tenant.phoneWhatsApp?.trim()) {
    errors.push('Campo "phoneWhatsApp" obrigatório ausente.')
  }

  // 2. Validação de Tema
  if (!tenant.theme) {
    warnings.push('Campo "theme" ausente (usando fallback padrão).')
  } else if (!VALID_THEMES.includes(tenant.theme)) {
    errors.push(`Tema "${tenant.theme}" inválido. Temas suportados: ${VALID_THEMES.join(', ')}.`)
  }

  // 3. Validação de Categoria de Negócio
  if (!tenant.businessCategory) {
    errors.push(`Campo "businessCategory" obrigatório ausente (${VALID_CATEGORIES.join(', ')}).`)
  } else if (!VALID_CATEGORIES.includes(tenant.businessCategory)) {
    errors.push(`Categoria de negócio "${tenant.businessCategory}" inválida. Use: ${VALID_CATEGORIES.join(', ')}.`)
  }

  // 4. Validação de Profissionais (Hub e Pro)
  if (['hub', 'pro'].includes(tenant.businessCategory)) {
    if (!Array.isArray(tenant.professionals) || tenant.professionals.length === 0) {
      warnings.push('Estabelecimento de serviços/agendamento sem profissionais cadastrados no JSON.')
    } else {
      tenant.professionals.forEach((p, idx) => {
        if (!p.id) errors.push(`Profissional na posição ${idx} não possui "id".`)
        if (!p.name) errors.push(`Profissional na posição ${idx} não possui "name".`)
        if (p.isAvailable === undefined) {
          warnings.push(`Profissional "${p.name || p.id}" sem flag "isAvailable: true" explícita.`)
        }
      })
    }
  }

  // 5. Validação de Serviços vs Produtos Físicos
  if (Array.isArray(tenant.categories)) {
    let serviceCount = 0
    tenant.categories.forEach(cat => {
      (cat.products || []).forEach(prod => {
        if (prod.durationMinutes && prod.durationMinutes > 0) {
          serviceCount++
        }
      })
    })

    if (['hub', 'pro'].includes(tenant.businessCategory) && serviceCount === 0) {
      errors.push('Estabelecimento Alaska Hub/Pro não possui nenhum serviço cadastrado com "durationMinutes > 0".')
    }
  }

  // 6. Validação de Pix
  const pix = tenant.pixConfig || tenant.pix
  if (!pix) {
    warnings.push('Configuração de Pix ausente ("pixConfig").')
  } else {
    if (!pix.key) errors.push('Chave Pix ("key") ausente.')
    if (!pix.beneficiary && !tenant.name) errors.push('Beneficiário do Pix ausente.')
  }

  if (errors.length > 0) hasErrors = true
  results.push({ file, errors, warnings, slug: tenant.slug, theme: tenant.theme, category: tenant.businessCategory })
}

// Exibe relatório formatado
results.forEach(r => {
  const status = r.errors.length > 0 ? '❌ ERRO' : r.warnings.length > 0 ? '⚠️ AVISO' : '✅ OK'
  console.log(`${status} [${r.file}] -> slug: "${r.slug}", theme: "${r.theme}", category: "${r.category}"`)
  r.errors.forEach(e => console.log(`   🔴 ${e}`))
  r.warnings.forEach(w => console.log(`   🟡 ${w}`))
})

console.log('\n------------------------------------------------------------')
if (hasErrors) {
  console.error('❌ Falha na validação de integridade dos tenants.')
  process.exit(1)
} else {
  console.log('✨ Todos os estabelecimentos estão íntegros e compatíveis com o Design System!')
  process.exit(0)
}
