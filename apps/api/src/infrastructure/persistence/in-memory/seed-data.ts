import { Tenant } from '@core/domain/entities/tenant.entity'

export const SEED_TENANTS: Tenant[] = [
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
      beneficiary: 'Adega & Distribuidora Prime',
      city: 'SAO PAULO'
    },
    customDomain: 'adegaprime.com.br'
  }),
  new Tenant({
    id: 'ten-barbearia-style',
    slug: 'barbearia-style',
    name: 'Barbearia Style Club',
    description: 'Cortes modernos, barba na toalha quente, cerveja artesanal e ambiente climatizado.',
    phoneWhatsApp: '11977776666',
    address: 'Rua das Barbearias, 456 - Centro',
    businessCategory: 'hub',
    theme: 'barber',
    openingHours: { open: '09:00', close: '20:00' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Barbearia Style Club',
      city: 'SAO PAULO'
    },
    customDomain: 'barbeariastyle.com.br'
  }),
  new Tenant({
    id: 'ten-clinica-sorriso',
    slug: 'clinica-sorriso',
    name: 'Clínica Sorriso',
    description: 'Odontologia moderna com foco em estética, implantes e saúde bucal.',
    phoneWhatsApp: '11966665555',
    address: 'Rua da Saúde, 321 - Centro',
    businessCategory: 'pro',
    theme: 'health',
    openingHours: { open: '08:00', close: '19:00' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Clínica Sorriso Odontologia',
      city: 'SAO PAULO'
    },
    customDomain: 'clinicasorriso.com.br'
  }),
  new Tenant({
    id: 'ten-bella-donna',
    slug: 'bella-donna',
    name: 'Bella Donna Boutique | Moda Feminina',
    description: 'Moda feminina casual chic, conjuntos de alfaiataria em crepe duna, vestidos fluidos e peças do P ao GG.',
    phoneWhatsApp: '11977778888',
    address: 'Rua Gerônimo Caetano Garcia, 280 – Centro, Francisco Morato - SP',
    businessCategory: 'shop',
    theme: 'drinks',
    openingHours: { open: '09:00', close: '19:00' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Bella Donna Boutique',
      city: 'FRANCISCO MORATO'
    },
    customDomain: 'belladonna.com.br'
  }),
  new Tenant({
    id: 'ten-cafe-central',
    slug: 'cafe-central',
    name: 'Café Central & Bistrô',
    description: 'O melhor café especial da cidade, ambiente acolhedor, brunch e doces artesanais.',
    phoneWhatsApp: '11988887777',
    address: 'Rua do Café, 123 - Centro',
    businessCategory: 'menu',
    theme: 'food',
    openingHours: { open: '07:00', close: '20:00' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Café Central',
      city: 'SAO PAULO'
    },
    customDomain: 'cafecentral.com.br'
  }),
  new Tenant({
    id: 'ten-espetaria-brasa',
    slug: 'espetaria-brasa',
    name: 'Espetaria & Jantinha Brasa Nobre',
    description: 'Espetinhos artesanais na brasa, jantinhas completas, acompanhamentos caseiros e cervejas estupidamente geladas.',
    phoneWhatsApp: '11999999999',
    address: 'Av. dos Churrasqueiros, 450 - Centro',
    businessCategory: 'menu',
    theme: 'food',
    openingHours: { open: '18:00', close: '23:45' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Espetaria Brasa Nobre',
      city: 'SAO PAULO'
    },
    customDomain: 'espetariabrasa.com.br'
  }),
  new Tenant({
    id: 'ten-restaurante-bella-italia',
    slug: 'restaurante-bella-italia',
    name: 'Restaurante Bella Italia',
    description: 'Massas artesanais frescas, risotos clássicos, vinhos italianos e gastronomia tradicional.',
    phoneWhatsApp: '11933332222',
    address: 'Rua das Cantinas, 300 - Bixiga',
    businessCategory: 'menu',
    theme: 'food',
    openingHours: { open: '11:30', close: '23:00' },
    pixConfig: {
      key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
      keyType: 'random',
      beneficiary: 'Restaurante Bella Italia',
      city: 'SAO PAULO'
    },
    customDomain: 'bellaitalia.com.br'
  })
]
