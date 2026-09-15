import { Tenant } from '@core/domain/entities/tenant.entity'

export const SEED_TENANTS: Tenant[] = [
  new Tenant({
    id: 'ten-adega-do-rei',
    slug: 'adega-do-rei',
    name: 'Adega e Casa de Ração do Rei',
    description: 'O ponto completo na Av. Afonso Moreno: cervejas trincando, destilados, vinhos selecionados, carvão e nutrição premium para cães e gatos com entrega rápida em Francisco Morato.',
    phoneWhatsApp: '11973075705',
    address: 'Av. Afonso Moreno, 1238 - Res. Casa Grande I, Francisco Morato - SP, CEP 07906-000',
    businessCategory: 'menu',
    theme: 'amber',
    openingHours: { open: '07:00', close: '20:00' },
    pixConfig: {
      key: '11973075705',
      keyType: 'phone',
      beneficiary: 'Adega e Casa de Racao do Rei',
      city: 'FRANCISCO MORATO'
    }
  }),
  new Tenant({
    id: 'ten-hamburgueria-x',
    slug: 'hamburgueria-x',
    name: 'Hamburgueria X',
    description: 'Burgers artesanais grelhados na brasa, smashs crocantes e porções exclusivas.',
    phoneWhatsApp: '11999999999',
    address: 'Rua das Hamburguerias, 123 - Centro',
    businessCategory: 'menu',
    theme: 'food',
    openingHours: { open: '18:00', close: '23:30' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Hamburgueria X Artesanal',
      city: 'SAO PAULO'
    },
    customDomain: 'hamburgueria-x.com.br'
  }),
  new Tenant({
    id: 'ten-karine-finardi',
    slug: 'karine-finardi',
    name: 'Karine Finardi | Semijoias & Revenda',
    description: 'Semijoias femininas delicadas, hipoalergênicas, banhadas a ouro 18k e prata 925 com garantia de 1 ano.',
    phoneWhatsApp: '11999998888',
    address: 'Francisco Morato – SP',
    businessCategory: 'shop',
    theme: 'barber',
    openingHours: { open: '09:00', close: '19:00' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Karine Finardi Semijoias',
      city: 'FRANCISCO MORATO'
    },
    customDomain: 'karinefinardi.com.br'
  }),
  new Tenant({
    id: 'ten-adega-prime',
    slug: 'adega-prime',
    name: 'Adega & Distribuidora Prime',
    description: 'Cervejas trincando, combos de destilados, gelos de sabor, carvão e conveniência com entrega rápida.',
    phoneWhatsApp: '11988889999',
    address: 'Av. Brasil, 850 - Centro',
    businessCategory: 'menu',
    theme: 'amber',
    openingHours: { open: '14:00', close: '03:00' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Adega Prime Distribuidora',
      city: 'SAO PAULO'
    }
  }),
  new Tenant({
    id: 'ten-barbearia-style',
    slug: 'barbearia-style',
    name: 'Barbearia Vintage Style',
    description: 'Cortes clássicos e modernos, barba com toalha quente, navalha e cerveja gelada.',
    phoneWhatsApp: '11977778888',
    address: 'Rua Augusta, 500 - Consolação',
    businessCategory: 'hub',
    theme: 'barber',
    openingHours: { open: '09:00', close: '20:00' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Vintage Style Barbearia',
      city: 'SAO PAULO'
    }
  }),
  new Tenant({
    id: 'ten-clinica-sorriso',
    slug: 'clinica-sorriso',
    name: 'Clínica Odonto Sorriso',
    description: 'Tratamentos odontológicos completos, ortodontia, clareamento e implantes com tecnologia de ponta.',
    phoneWhatsApp: '11966667777',
    address: 'Alameda Santos, 1000 - Jardins',
    businessCategory: 'pro',
    theme: 'health',
    openingHours: { open: '08:00', close: '19:00' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Clinica Odonto Sorriso LTDA',
      city: 'SAO PAULO'
    }
  }),
  new Tenant({
    id: 'ten-bella-donna',
    slug: 'bella-donna',
    name: 'Bella Donna Boutique',
    description: 'Moda feminina contemporânea, vestidos elegantes, conjuntos e acessórios exclusivos.',
    phoneWhatsApp: '11955556666',
    address: 'Rua Oscar Freire, 300 - Cerqueira César',
    businessCategory: 'shop',
    theme: 'drinks',
    openingHours: { open: '10:00', close: '20:00' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Bella Donna Boutique LTDA',
      city: 'SAO PAULO'
    }
  }),
  new Tenant({
    id: 'ten-cafe-central',
    slug: 'cafe-central',
    name: 'Café & Bistrô Central',
    description: 'Cafés especiais moídos na hora, brunchs deliciosos, tortas artesanais e pães de fermentação natural.',
    phoneWhatsApp: '11944445555',
    address: 'Praça da Sé, 50 - Centro Histórico',
    businessCategory: 'menu',
    theme: 'food',
    openingHours: { open: '07:30', close: '19:00' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Cafe Bistro Central Eireli',
      city: 'SAO PAULO'
    }
  }),
  new Tenant({
    id: 'ten-espetaria-brasa',
    slug: 'espetaria-brasa',
    name: 'Espetaria & Petiscaria Brasa Viva',
    description: 'Espetos artesanais na brasa, porções caprichadas, chopp gelado e música ao vivo.',
    phoneWhatsApp: '11933334444',
    address: 'Av. das Nações, 250 - Vila Nova',
    businessCategory: 'menu',
    theme: 'food',
    openingHours: { open: '17:00', close: '01:00' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Brasa Viva Espetaria',
      city: 'SAO PAULO'
    }
  }),
  new Tenant({
    id: 'ten-restaurante-bella-italia',
    slug: 'restaurante-bella-italia',
    name: 'Cantina & Restaurante Bella Itália',
    description: 'Massas artesanais frescas, molhos italianos tradicionais, risotos e cartas de vinhos nobres.',
    phoneWhatsApp: '11922223333',
    address: 'Rua Treze de Maio, 800 - Bixiga',
    businessCategory: 'menu',
    theme: 'food',
    openingHours: { open: '11:30', close: '23:00' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Cantina Bella Italia LTDA',
      city: 'SAO PAULO'
    }
  })
]
