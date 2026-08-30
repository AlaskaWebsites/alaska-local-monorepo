// scripts/new-demo.js
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const args = process.argv.slice(2)
const slug = String(args[0] || '').trim()
const name = String(args[1] || 'Novo Estabelecimento').trim()
const phone = String(args[2] || '11999999999').trim()
const vertical = String(args[3] || 'shop').trim().toLowerCase()

if (!slug) {
  console.log('❌ Uso: node scripts/new-demo.js <slug> "<Nome>" "<Telefone>" [vertical]')
  console.log('Verticais: shop (semijoias/moda), menu (food/burger), adega (bebidas), hub (barbearia), pro (clínica)')
  console.log('Exemplo: node scripts/new-demo.js joias-luxo "Joias de Luxo" "11987654321" shop')
  process.exit(1)
}

// Mapa de templates canônicos por vertical
const templateMap = {
  shop: 'karine-finardi.json',
  semijoia: 'karine-finardi.json',
  semijoias: 'karine-finardi.json',
  boutique: 'bella-donna.json',
  menu: 'hamburgueria-x.json',
  food: 'hamburgueria-x.json',
  burger: 'hamburgueria-x.json',
  adega: 'adega-prime.json',
  drinks: 'adega-prime.json',
  pizza: 'restaurante-bella-italia.json',
  pizzaria: 'restaurante-bella-italia.json',
  hub: 'barbearia-style.json',
  barber: 'barbearia-style.json',
  barbearia: 'barbearia-style.json',
  pro: 'clinica-sorriso.json',
  health: 'clinica-sorriso.json',
  clinica: 'clinica-sorriso.json'
}

const templateFile = templateMap[vertical] || 'karine-finardi.json'
const templatePath = path.join(rootDir, 'data', templateFile)
const newPath = path.join(rootDir, 'data', `${slug}.json`)

if (fs.existsSync(newPath)) {
  console.log(`❌ Já existe uma demonstração com o slug "${slug}" em data/${slug}.json`)
  process.exit(1)
}

if (!fs.existsSync(templatePath)) {
  console.log(`❌ Template base (${templateFile}) não encontrado em: ${templatePath}`)
  process.exit(1)
}

const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf-8'))
templateData.slug = slug
templateData.name = name
templateData.phoneWhatsApp = phone.replace(/\D/g, '')
if (templateData.pixConfig) {
  templateData.pixConfig.key = '7e3ed5e6-6097-4b15-88a3-221caba64141'
  templateData.pixConfig.keyType = 'random'
  templateData.pixConfig.beneficiary = name
}

fs.writeFileSync(newPath, JSON.stringify(templateData, null, 2), 'utf-8')
console.log(`✅ Nova demo (${vertical.toUpperCase()}) criada com sucesso: data/${slug}.json`)
console.log(`📋 Baseada no template: ${templateFile}`)
console.log(`🔗 Acesse em: http://localhost:3000/${slug}`)
