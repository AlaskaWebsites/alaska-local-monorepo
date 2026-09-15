export interface StoreSeedData {
  slug: string
  name: string
  description?: string
  logo?: string
  banner?: string
  phoneWhatsApp?: string
  whatsapp?: string
  address?: string
  businessCategory: 'menu' | 'shop' | 'hub' | 'pro'
  theme: string
  currency?: string
  deliveryFee?: number
  minOrderValue?: number
  customDomain?: string
  openingHours?: Record<string, any>
  pixConfig?: {
    key: string
    keyType: 'cpf' | 'cnpj' | 'phone' | 'email' | 'random'
    beneficiary?: string
    name?: string
    city: string
    allowTestCent?: boolean
    depositPercentage?: number
  }
  professionals?: Array<{
    id: string
    name: string
    role: string
    isAvailable?: boolean
    availableDays?: number[]
    workHours?: { start: string; end: string }
    lunchBreak?: { start: string; end: string; enabled: boolean }
  }>
  categories?: Array<{
    id: string
    name: string
    icon?: string
    products?: Array<{
      id: string
      name: string
      description?: string
      price: number
      image?: string
      isAvailable?: boolean
      available?: boolean
      durationMinutes?: number
      optionGroups?: Array<{
        id: string
        name: string
        min?: number
        max?: number
        options?: Array<{ id: string; name: string; price: number }>
      }>
    }>
  }>
}

export const ALL_10_STORES: StoreSeedData[] = [
  {
    "slug": "adega-do-rei",
    "name": "Adega e Casa de Ração do Rei",
    "description": "O ponto completo na Av. Afonso Moreno: cervejas trincando, destilados, vinhos selecionados, carvão e nutrição premium para cães e gatos com entrega rápida em Francisco Morato.",
    "logo": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&h=200&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&h=400&fit=crop&q=80",
    "phoneWhatsApp": "11973075705",
    "whatsapp": "11973075705",
    "address": "Av. Afonso Moreno, 1238 - Res. Casa Grande I, Francisco Morato - SP, CEP 07906-000",
    "currency": "R$",
    "deliveryFee": 5.0,
    "minOrderValue": 20.0,
    "theme": "amber",
    "businessCategory": "menu",
    "openingHours": {
      "monday": {
        "open": "07:00",
        "close": "20:00",
        "closed": false
      },
      "tuesday": {
        "open": "07:00",
        "close": "20:00",
        "closed": false
      },
      "wednesday": {
        "open": "07:00",
        "close": "20:00",
        "closed": false
      },
      "thursday": {
        "open": "07:00",
        "close": "20:00",
        "closed": false
      },
      "friday": {
        "open": "07:00",
        "close": "20:00",
        "closed": false
      },
      "saturday": {
        "open": "07:00",
        "close": "20:00",
        "closed": false
      },
      "sunday": {
        "open": "07:00",
        "close": "15:00",
        "closed": false
      },
      "open": "07:00",
      "close": "20:00"
    },
    "pixConfig": {
      "key": "11973075705",
      "keyType": "phone",
      "beneficiary": "Adega e Casa de Ração do Rei",
      "city": "FRANCISCO MORATO",
      "allowTestCent": true,
      "depositPercentage": 30
    },
    "categories": [
      {
        "id": "cat-racao-caes",
        "name": "🐶 Rações para Cães",
        "icon": "paw",
        "products": [
          {
            "id": "prod-racao-magnus-carne-frango-10kg",
            "name": "Ração Magnus Todo Dia Carne e Frango Pequeno Porte 10kg",
            "description": "Nutrição completa para cães de pequeno porte. Pelos brilhantes, pele saudável, mais energia e alta digestibilidade.",
            "price": 78.99,
            "image": "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-racao-special-dog-carne-10kg",
            "name": "Ração Special Dog Carne Pequeno Porte 10kg",
            "description": "Alimento completo com ômegas 3 e 6, extrato de yucca que reduz odor das fezes e 23% de proteína para cães pequenos.",
            "price": 88.99,
            "image": "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-racao-premier-grandes-gigantes-15kg",
            "name": "Ração PremieR Formula Cães Raças Grandes e Gigantes Frango e Mandioca 15kg",
            "description": "Linha Super Premium com satisfação 110% garantida. Suporte articular com condroitina e glicosamina para raças fortes e musculosas.",
            "price": 259.99,
            "image": "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          }
        ]
      },
      {
        "id": "cat-saches-petiscos",
        "name": "🥩 Sachês & Petiscos",
        "icon": "sparkles",
        "products": [
          {
            "id": "prod-sache-golden-gourmet-caes-85g",
            "name": "Sachê GoldeN Gourmet Cães Adultos Frango com Cenoura e Arroz 85g",
            "description": "Alimento úmido premium especial sabor frango com legumes. Sem corantes nem aromatizantes artificiais.",
            "price": 3.0,
            "image": "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-sache-special-dog-ultralife-100g",
            "name": "Sachê Special Dog Ultralife Cães Adultos Carne ao Molho 100g",
            "description": "Pedaços cozidos a vapor em molho suculento, rico em vitaminas para cães adultos.",
            "price": 3.0,
            "image": "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-sache-granplus-gourmet-100g",
            "name": "Sachê GranPlus Gourmet Cães e Gatos Carne ao Molho 100g",
            "description": "Nutrição de alto desempenho e bem-estar para cães e gatos com ingredientes nobres.",
            "price": 3.0,
            "image": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-sache-origens-85g",
            "name": "Sachê Origens Cães e Gatos Seleção Natural 85g",
            "description": "Ingredientes de verdade sem corantes artificiais para uma refeição deliciosa e hidratante.",
            "price": 3.0,
            "image": "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-bifinho-keldog-carne-65g",
            "name": "Petisco Bifinho Keldog Carne e Frango 65g",
            "description": "Snack macio e saboroso feito com carnes frescas, ideal para agrado e recompensa diária.",
            "price": 4.9,
            "image": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          }
        ]
      },
      {
        "id": "cat-destilados-whisky",
        "name": "🥃 Whiskies & Destilados",
        "icon": "flame",
        "products": [
          {
            "id": "prod-jack-daniels-no7-1l",
            "name": "Whisky Jack Daniel's Old No. 7 Tennessee Whiskey 1L",
            "description": "O clássico Tennessee Whiskey filtrado gota a gota em carvão vegetal. Sabor marcante, encorpado e aveludado.",
            "price": 149.9,
            "image": "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-jack-daniels-apple-1l",
            "name": "Whisky Jack Daniel's Tennessee Apple 1L",
            "description": "Mistura do autêntico Old No. 7 com licor crocante de maçã verde. Extremamente refrescante.",
            "price": 159.9,
            "image": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-jack-daniels-honey-1l",
            "name": "Whisky Jack Daniel's Tennessee Honey 1L",
            "description": "Suavidade incomparável combinando o tradicional whisky Jack Daniel's com licor de mel legítimo.",
            "price": 159.9,
            "image": "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-jack-daniels-blackberry-1l",
            "name": "Whisky Jack Daniel's Tennessee Blackberry 1L",
            "description": "Edição aromática e exclusiva com notas sofisticadas de amoras silvestres. Excelente para drinks e degustação pura.",
            "price": 169.9,
            "image": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-gelo-sabor-maracuja-coco",
            "name": "Gelo de Sabor para Drinks Coco com Maracujá 200ml",
            "description": "Gelo saborizado que potencializa seu drink à medida que derrete. Não aguenta o copo!",
            "price": 4.5,
            "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          }
        ]
      },
      {
        "id": "cat-vinhos-selecionados",
        "name": "🍷 Vinhos Selecionados",
        "icon": "wine",
        "products": [
          {
            "id": "prod-vinho-valle-chillan-gran-reserva-750ml",
            "name": "Vinho Chileno Valle Chillán Cabernet Sauvignon Gran Reserva 750ml",
            "description": "Vinho fino chileno premium de guarda. Notas de frutas negras, baunilha e taninos aveludados.",
            "price": 120.0,
            "image": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-vinho-pergola-bordo-suave-1l",
            "name": "Vinho Pérgola Bordô Tinto Suave 1L",
            "description": "O vinho de mesa mais consagrado do Brasil. Frutado, equilibrado e perfeito para relaxar ou almoço em família.",
            "price": 23.5,
            "image": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-vinho-san-martin-bordo-seco-750ml",
            "name": "Vinho San Martin Bordô Tinto Seco 750ml",
            "description": "Tradição gaúcha em uvas Bordô. Coloração intensa, aroma marcante e paladar estruturado.",
            "price": 23.5,
            "image": "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-vinho-san-martin-suave-750ml",
            "name": "Vinho San Martin Tinto Suave 750ml",
            "description": "Vinho tinto suave clássico, levemente adocicado e ideal para servir geladinho.",
            "price": 17.5,
            "image": "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-vinho-dom-bosco-tinto-suave-750ml",
            "name": "Vinho Dom Bosco Tinto Suave 750ml",
            "description": "Tradição de gerações. Vinho tinto suave com aroma de frutas vermelhas e sabor harmonioso.",
            "price": 17.5,
            "image": "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-vinho-dom-bosco-bordo-750ml",
            "name": "Vinho Dom Bosco Bordô 750ml",
            "description": "Tinto de mesa elaborado com uvas Bordô. Cor rubi viva e sabor agradável com ótimo custo-benefício.",
            "price": 14.9,
            "image": "https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          }
        ]
      },
      {
        "id": "cat-cervejas-conveniencia",
        "name": "🍺 Cervejas & Conveniência",
        "icon": "shopping-bag",
        "products": [
          {
            "id": "prod-pack-cerveja-heineken-lata-6un",
            "name": "Pack Cerveja Heineken Puro Malte 350ml (6 Latas)",
            "description": "A cerveja premium puro malte holandesa mais apreciada do mundo. Entregue trincando de gelada.",
            "price": 38.9,
            "image": "https://images.unsplash.com/photo-1608270546103-ac6888db6282?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          },
          {
            "id": "prod-carvao-vegetal-churrasco-2-5kg",
            "name": "Carvão Vegetal Selecionado para Churrasco 2,5kg",
            "description": "Eucalipto reflorestado com pedaços graúdos de fácil acendimento e brasas duradouras.",
            "price": 18.9,
            "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=350&fit=crop&q=80",
            "isAvailable": true,
            "available": true,
            "durationMinutes": 0,
            "optionGroups": []
          }
        ]
      }
    ]
  },
  {
    "slug": "adega-prime",
    "name": "Adega & Distribuidora Prime",
    "description": "Cervejas trincando, combos de destilados, gelos de sabor, carvão e conveniência com entrega rápida.",
    "logo": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11988887777",
    "address": "Av. Brasil, 850 - Centro",
    "businessCategory": "menu",
    "theme": "amber",
    "currency": "BRL",
    "deliveryFee": 7,
    "minOrderValue": 30,
    "openingHours": {
      "open": "00:00",
      "close": "23:59"
    },
    "pixConfig": {
      "key": "11988887777",
      "keyType": "phone",
      "beneficiary": "Adega & Distribuidora Prime LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "categories": [
      {
        "id": "cat-combos",
        "name": "Combos & Kits de Destilados",
        "icon": "🔥",
        "products": [
          {
            "id": "prod-combo-gin",
            "name": "Kit Gin Tanqueray 750ml + 4 Tônicas + Gelo de Sabor",
            "description": "1 Garrafa Gin Tanqueray London Dry 750ml, 4 Latas de Tônica Schweppes Lata e 2 Gelos de Sabor Coco com Maracujá 200ml.",
            "price": 149.9,
            "image": "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true,
            "optionGroups": [
              {
                "id": "opt-sabores-gelo-gin",
                "name": "Escolha o sabor do Gelo",
                "min": 1,
                "max": 1,
                "options": [
                  { "id": "opt-gelo-coco-maracuja", "name": "Coco com Maracujá", "price": 0 },
                  { "id": "opt-gelo-morango", "name": "Morango Silvestre", "price": 0 },
                  { "id": "opt-gelo-maca-verde", "name": "Maçã Verde", "price": 0 }
                ]
              }
            ]
          },
          {
            "id": "prod-combo-whisky-red",
            "name": "Combo Red Label 1L + 4 Energéticos + Gelo de Coco",
            "description": "1 Garrafa Whisky Johnnie Walker Red Label 1L, 4 Latas de Red Bull Energy Drink 250ml e 2 Gelos de Coco 200ml.",
            "price": 139.9,
            "image": "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-combo-vodka-absolut",
            "name": "Combo Vodka Absolut 750ml + 4 Red Bull Tropical",
            "description": "1 Garrafa Vodka Absolut Regular 750ml e 4 Latas de Red Bull Tropical Edition 250ml trincando de geladas.",
            "price": 129.9,
            "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-cervejas-geladas",
        "name": "Cervejas Trincando (Lata & Long Neck)",
        "icon": "🍺",
        "products": [
          {
            "id": "prod-heineken-long-neck",
            "name": "Heineken Long Neck 330ml (Pack com 6 Unidades)",
            "description": "Pack com 6 garrafas Long Neck 330ml da verdinha mais pedida do Brasil. Entregue estupidamente gelada.",
            "price": 42.0,
            "image": "https://images.unsplash.com/photo-1608270546103-ac6888db6282?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-corona-long-neck",
            "name": "Corona Extra Long Neck 330ml (Pack com 6 Unidades)",
            "description": "Pack com 6 garrafas 330ml com fatia de limão cortesia. Leve, refrescante e ultra gelada.",
            "price": 45.0,
            "image": "https://images.unsplash.com/photo-1584225064785-c62a8b43d148?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-amstel-lata-pack",
            "name": "Amstel Puro Malte Lata 350ml (Pack com 12 Latas)",
            "description": "Fardo fechado com 12 latas de 350ml puro malte trincando de geladas.",
            "price": 48.0,
            "image": "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-gelo-conveniencia",
        "name": "Gelo, Carvão & Tabacaria",
        "icon": "🧊",
        "products": [
          {
            "id": "prod-gelo-sabor-coco",
            "name": "Gelo de Coco para Drinks 200ml (Unidade)",
            "description": "Água de coco natural congelada com embalagem lacrada higiênica. Derrete enriquecendo seu drink.",
            "price": 4.5,
            "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-carvao-churrasco-3kg",
            "name": "Saco de Carvão Vegetal Especial 3kg",
            "description": "Carvão vegetal selecionado de eucalipto 100% reflorestado, brasas duradouras e sem faíscas.",
            "price": 19.9,
            "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "hamburgueria-x",
    "name": "Hamburgueria X",
    "description": "Burgers artesanais grelhados no fogo forte, smashs crocantes, bacon caramelizado e batatas rústicas.",
    "logo": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11999990000",
    "address": "Rua das Hamburguerias, 123 - Centro",
    "businessCategory": "menu",
    "theme": "food",
    "currency": "BRL",
    "deliveryFee": 5,
    "minOrderValue": 25,
    "openingHours": {
      "open": "18:00",
      "close": "23:30"
    },
    "pixConfig": {
      "key": "11999990000",
      "keyType": "phone",
      "beneficiary": "Hamburgueria X Artesanal LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "categories": [
      {
        "id": "cat-artesanais",
        "name": "Burgers Artesanais no Fogo",
        "icon": "🍔",
        "products": [
          {
            "id": "prod-x-bacon-artesanal",
            "name": "X-Bacon Supremo Defumado",
            "description": "Pão brioche selado na manteiga, burger Angus 180g grelhado no ponto da casa, queijo cheddar inglês derretido, tiras crocantes de bacon artesanal e maionese defumada.",
            "price": 34.9,
            "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true,
            "optionGroups": [
              {
                "id": "opt-ponto-carne-xbacon",
                "name": "Ponto da Carne",
                "min": 1,
                "max": 1,
                "options": [
                  { "id": "opt-ponto-vermelho", "name": "Ao Ponto para Mal (Vermelhinho)", "price": 0 },
                  { "id": "opt-ponto-casa", "name": "Ao Ponto da Casa (Rosado e Suculento)", "price": 0 },
                  { "id": "opt-bem-passado", "name": "Bem Passado", "price": 0 }
                ]
              },
              {
                "id": "opt-adicionais-xbacon",
                "name": "Turbine seu Burger",
                "min": 0,
                "max": 3,
                "options": [
                  { "id": "opt-bacon-extra", "name": "Bacon Crocante Extra (+60g)", "price": 6.0 },
                  { "id": "opt-queijo-cheddar-extra", "name": "Cheddar Cremoso Extra", "price": 5.0 },
                  { "id": "opt-cebola-caramelizada", "name": "Cebola Caramelizada no Shoyu", "price": 4.5 }
                ]
              }
            ]
          },
          {
            "id": "prod-smash-duplo",
            "name": "Duplo Smash Cheddar Bacon",
            "description": "Dois burgers ultra-smash prensados com crostinha crocante (100g cada), fatias duplas de queijo prato, cebola roxa picadinha, picles artesanal e molho especial da casa no pão de batata.",
            "price": 29.9,
            "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-x-trufa-gourmet",
            "name": "Burger Trufado com Queijo Brie",
            "description": "Burger Angus 200g grelhado, fatias generosas de queijo brie maçaricado, geleia caseira de pimenta vermelha, rúcula precoce e azeite trufado branco no pão australiano tostado.",
            "price": 42.9,
            "image": "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-acompanhamentos",
        "name": "Porções & Acompanhamentos Crocantes",
        "icon": "🍟",
        "products": [
          {
            "id": "prod-batata-rustica-alecrim",
            "name": "Batatas Rústicas com Alecrim & Alho Confitado",
            "description": "400g de batatas selecionadas com casca crocante por fora e macias por dentro, salpicadas com sal de parrilla, alecrim fresco e dentes de alho confitados.",
            "price": 22.0,
            "image": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-onion-rings",
            "name": "Onion Rings Empanadas na Cerveja (10 unidades)",
            "description": "Anéis de cebola doce fresca empanados em massa temperada com cerveja artesanal e fritos até dourar. Acompanha molho barbecue rústico.",
            "price": 24.0,
            "image": "https://images.unsplash.com/photo-1639024471285-0af50758e74a?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-bebidas-sobremesas",
        "name": "Bebidas & Sobremesas Artesanais",
        "icon": "🥤",
        "products": [
          {
            "id": "prod-coca-cola-lata",
            "name": "Coca-Cola Original Lata 350ml Gelada",
            "description": "Lata 350ml trincando de gelada.",
            "price": 6.5,
            "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-shake-nutella",
            "name": "Milk-Shake Cremoso de Nutella com Ninho 400ml",
            "description": "Sorvete artesanal de baunilha batido com leite integral, camadas generosas de Nutella pura e finalizado com leite Ninho polvilhado no topo.",
            "price": 19.9,
            "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "bella-donna",
    "name": "Bella Donna Boutique | Moda Feminina",
    "description": "Moda feminina casual chic, conjuntos de alfaiataria em crepe duna, vestidos fluidos e peças exclusivas direto do Brás para você.",
    "logo": "https://images.unsplash.com/photo-1544441893-675973e31985?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11999990000",
    "address": "Rua 25 de Março, 400 - Centro, São Paulo - SP",
    "businessCategory": "shop",
    "theme": "drinks",
    "currency": "BRL",
    "deliveryFee": 12,
    "minOrderValue": 50,
    "openingHours": {
      "open": "09:00",
      "close": "19:00"
    },
    "pixConfig": {
      "key": "11999990000",
      "keyType": "phone",
      "beneficiary": "Bella Donna Moda LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "categories": [
      {
        "id": "cat-conjuntos",
        "name": "Conjuntos & Alfaiataria",
        "icon": "✨",
        "products": [
          {
            "id": "prod-blazer-oversized",
            "name": "Blazer Feminino Oversized Alfaiataria Max",
            "description": "Forrado internamente, caimento impecável e ombreiras discretas. Versátil para looks casuais ou executivos.",
            "price": 159.9,
            "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-conjunto-alfaiataria",
            "name": "Conjunto Alfaiataria Colete + Calça Pantalona",
            "description": "Tecido crepe duna encorpado que não amassa. Calça de cintura alta com bolsos faca e colete estruturado com botões encapados.",
            "price": 189.9,
            "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80",
            "isAvailable": false
          }
        ]
      },
      {
        "id": "cat-vestidos",
        "name": "Vestidos & Macacões",
        "icon": "👗",
        "products": [
          {
            "id": "prod-vestido-longo-fluido",
            "name": "Vestido Longo Floral Fluido com Lastéx",
            "description": "Alças reguláveis, decote coração com elastex ajustável nas costas. Tecido viscose acetinada fresquinho.",
            "price": 129.9,
            "image": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80",
            "isAvailable": false
          },
          {
            "id": "prod-vestido-midi",
            "name": "Vestido Midi Canelado Gola Alta Fenda Lateral",
            "description": "Malha canelada premium de alta elasticidade que valoriza a silhueta com extremo conforto e elegância.",
            "price": 99.9,
            "image": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&auto=format&fit=crop&q=80",
            "isAvailable": false
          }
        ]
      },
      {
        "id": "cat-blusas-croppeds",
        "name": "Blusas, Croppeds & T-Shirts",
        "icon": "👚",
        "products": [
          {
            "id": "prod-camisa-linho",
            "name": "Camisa Feminina Social Viscolinho Premium",
            "description": "Toque leve de linho com viscose, mangas compridas com martingale para dobrar e botões tartaruga.",
            "price": 89.9,
            "image": "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=500&auto=format&fit=crop&q=80",
            "isAvailable": false
          },
          {
            "id": "prod-cropped-amarracao",
            "name": "Cropped Manga Bufante com Amarração Frontal",
            "description": "Tendência absoluta! Mangas com elástico suave e amarração frontal que permite ajustar o decote.",
            "price": 59.9,
            "image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=80",
            "isAvailable": false
          },
          {
            "id": "prod-tshirt-algodao",
            "name": "T-Shirt 100% Algodão Penteado Estampa Minimal",
            "description": "Gola redonda em ribana, toque aveludado e estampa silk de alta durabilidade que não desbota na lavagem.",
            "price": 49.9,
            "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
            "isAvailable": false
          }
        ]
      },
      {
        "id": "cat-calcas-jeans",
        "name": "Calças & Jeans Modeladores",
        "icon": "👖",
        "products": [
          {
            "id": "prod-calca-wide-leg",
            "name": "Calça Jeans Wide Leg Cintura Alta Lavagem Clara",
            "description": "Jeans 100% algodão sem elastano, caimento soltinho reto da coxa até a barra. Clássico contemporâneo.",
            "price": 139.9,
            "image": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=80",
            "isAvailable": false
          },
          {
            "id": "prod-calca-pantalona-crepe",
            "name": "Calça Pantalona Crepe Duna Fluida com Elástico",
            "description": "Cós largo com elástico reforçado nas costas para ajuste perfeito na cintura e tecido leve com movimento.",
            "price": 99.9,
            "image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-acessorios",
        "name": "Bolsas & Cintos",
        "icon": "👜",
        "products": [
          {
            "id": "prod-bolsa-tiracolo",
            "name": "Bolsa Feminina Tiracolo Corrente Dourada",
            "description": "Couro sintético matelassê, fecho em trava giratória e alça mista de corrente regulável.",
            "price": 79.9,
            "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-cinto-fivela-dourada",
            "name": "Cinto Fino Feminino com Fivela Dourada Minimal",
            "description": "Largura de 2cm ideal para calças de alfaiataria, shorts e vestidos. Vários furos de regulagem.",
            "price": 29.9,
            "image": "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "barbearia-style",
    "name": "Barbearia Vintage Style",
    "description": "Cortes clássicos e modernos, barba com toalha quente, navalha e cerveja gelada.",
    "logo": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11977778888",
    "address": "Rua Augusta, 500 - Consolação",
    "businessCategory": "hub",
    "theme": "barber",
    "currency": "BRL",
    "deliveryFee": 0,
    "minOrderValue": 0,
    "openingHours": {
      "open": "09:00",
      "close": "20:00"
    },
    "pixConfig": {
      "key": "11977778888",
      "keyType": "phone",
      "beneficiary": "Vintage Style Barbearia LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "professionals": [
      {
        "id": "prof-1",
        "name": "Carlos Navalha",
        "role": "Master Barber & Visagista",
        "isAvailable": true,
        "availableDays": [1, 2, 3, 4, 5, 6],
        "workHours": { "start": "09:00", "end": "19:00" },
        "lunchBreak": { "start": "12:00", "end": "13:00", "enabled": true }
      },
      {
        "id": "prof-2",
        "name": "Lucas Fade",
        "role": "Especialista em Degradê & Barba Terapêutica",
        "isAvailable": true,
        "availableDays": [1, 2, 3, 4, 5, 6],
        "workHours": { "start": "10:00", "end": "20:00" },
        "lunchBreak": { "start": "13:00", "end": "14:00", "enabled": true }
      }
    ],
    "categories": [
      {
        "id": "cat-servicos-barba-cabelo",
        "name": "Serviços de Cabelo & Barba",
        "icon": "✂️",
        "products": [
          {
            "id": "prod-corte-cabelo-degrade",
            "name": "Corte Masculino Degradê / Social na Tesoura",
            "description": "Lavagem com shampoo mentolado, corte personalizado conforme o visagismo do rosto e finalização com pomada modeladora matte.",
            "price": 45.0,
            "image": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true,
            "durationMinutes": 30
          },
          {
            "id": "prod-barba-terapia-toalha-quente",
            "name": "Barba Terapia com Toalha Quente & Ozônio",
            "description": "Esfoliação facial, aplicação de óleos essenciais, toalha quente emoliente, barbear clássico na navalha descartável e pós-barba refrescante.",
            "price": 35.0,
            "image": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true,
            "durationMinutes": 30
          },
          {
            "id": "prod-combo-cabelo-barba",
            "name": "Combo Completo: Cabelo + Barba + Sobrancelha",
            "description": "Experiência completa de cuidado masculino com corte, barba terapia e alinhamento de sobrancelha na navalha. Cortesia: 1 Cerveja Long Neck.",
            "price": 75.0,
            "image": "https://images.unsplash.com/photo-1517832606589-7157be614e5b?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true,
            "durationMinutes": 60
          }
        ]
      },
      {
        "id": "cat-pomadas-cuidados",
        "name": "Produtos de Barbearia para Levar",
        "icon": "💈",
        "products": [
          {
            "id": "prod-pomada-matte-150g",
            "name": "Pomada Modeladora Efeito Matte Seco 150g",
            "description": "Alta fixação sem brilho, fácil de remover na água e aroma refrescante amadeirado.",
            "price": 35.0,
            "image": "https://images.unsplash.com/photo-1512290900672-1a48c4fa06ef?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true,
            "durationMinutes": 0
          },
          {
            "id": "prod-oleo-para-barba-30ml",
            "name": "Óleo Hidratante para Barba com Cravo & Cedro 30ml",
            "description": "Hidrata os fios ressecados, alivia a coceira inicial da barba e deixa toque sedoso com brilho suave.",
            "price": 29.9,
            "image": "https://images.unsplash.com/photo-1608248597359-21b2bfa9f664?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true,
            "durationMinutes": 0
          }
        ]
      }
    ]
  },
  {
    "slug": "clinica-sorriso",
    "name": "Clínica Odonto Sorriso",
    "description": "Tratamentos odontológicos completos, ortodontia, clareamento e implantes com tecnologia de ponta.",
    "logo": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11966667777",
    "address": "Alameda Santos, 1000 - Jardins",
    "businessCategory": "pro",
    "theme": "health",
    "currency": "BRL",
    "deliveryFee": 0,
    "minOrderValue": 0,
    "openingHours": {
      "open": "08:00",
      "close": "19:00"
    },
    "pixConfig": {
      "key": "11966667777",
      "keyType": "phone",
      "beneficiary": "Clinica Odonto Sorriso LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "professionals": [
      {
        "id": "prof-1",
        "name": "Dra. Beatriz Mendes",
        "role": "Cirurgiã Dentista & Ortodontista (CRO-SP 114829)",
        "isAvailable": true,
        "availableDays": [1, 2, 3, 4, 5],
        "workHours": { "start": "08:00", "end": "17:00" },
        "lunchBreak": { "start": "12:00", "end": "13:00", "enabled": true }
      },
      {
        "id": "prof-2",
        "name": "Dr. Fernando Sato",
        "role": "Implantodontista & Reabilitação Oral (CRO-SP 98231)",
        "isAvailable": true,
        "availableDays": [1, 2, 3, 4, 5],
        "workHours": { "start": "09:00", "end": "18:00" },
        "lunchBreak": { "start": "13:00", "end": "14:00", "enabled": true }
      }
    ],
    "categories": [
      {
        "id": "cat-consultas-odontologicas",
        "name": "Procedimentos & Consultas Odontológicas",
        "icon": "🦷",
        "products": [
          {
            "id": "prod-avaliacao-checkup-digital",
            "name": "Consulta de Avaliação & Check-up Digital Completo",
            "description": "Exame clínico detalhado, profilaxia com jato de bicarbonato, registro fotográfico intraoral e planejamento digital do sorriso.",
            "price": 120.0,
            "image": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true,
            "durationMinutes": 45
          },
          {
            "id": "prod-clareamento-laser",
            "name": "Sessão de Clareamento Dental a Laser no Consultório",
            "description": "Sessão clínica com gel clareador de alta performance ativado por luz de laser de última geração. Dentes brancos em 1 hora.",
            "price": 380.0,
            "image": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true,
            "durationMinutes": 60
          },
          {
            "id": "prod-manutencao-ortodontica",
            "name": "Manutenção Ortodôntica Mensal (Aparelho Fixo / Alinhador)",
            "description": "Troca de fios e borrachinhas, ajuste da força mecânica e acompanhamento da movimentação dental.",
            "price": 110.0,
            "image": "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true,
            "durationMinutes": 30
          }
        ]
      },
      {
        "id": "cat-higiene-oral-home",
        "name": "Produtos de Higiene Oral Recomendados",
        "icon": "✨",
        "products": [
          {
            "id": "prod-kit-escova-curaprox",
            "name": "Kit Escova Curaprox Ultra Soft 5460 (2 unidades)",
            "description": "Cerdas ultra macias de Curen que não agridem a gengiva nem desgastam o esmalte dentário.",
            "price": 49.9,
            "image": "https://images.unsplash.com/photo-1559591937-e62fb330bc1f?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true,
            "durationMinutes": 0
          }
        ]
      }
    ]
  },
  {
    "slug": "cafe-central",
    "name": "Café & Bistrô Central",
    "description": "Cafés especiais moídos na hora, brunchs deliciosos, tortas artesanais e pães de fermentação natural.",
    "logo": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11944445555",
    "address": "Praça da Sé, 50 - Centro Histórico",
    "businessCategory": "menu",
    "theme": "food",
    "currency": "BRL",
    "deliveryFee": 6,
    "minOrderValue": 20,
    "openingHours": {
      "open": "07:30",
      "close": "19:00"
    },
    "pixConfig": {
      "key": "11944445555",
      "keyType": "phone",
      "beneficiary": "Cafe Bistro Central Eireli",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "categories": [
      {
        "id": "cat-cafes-especiais",
        "name": "Cafés Filtrados & Espresso",
        "icon": "☕",
        "products": [
          {
            "id": "prod-cappuccino-italiano",
            "name": "Cappuccino Italiano Cremoso com Canela",
            "description": "Dose dupla de espresso da Alta Mogiana, leite vaporizado com microespuma densa e toque suave de cacau 70% com canela.",
            "price": 14.9,
            "image": "https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "espetaria-brasa",
    "name": "Espetaria & Petiscaria Brasa Viva",
    "description": "Espetos artesanais na brasa, porções caprichadas, chopp gelado e música ao vivo.",
    "logo": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11933334444",
    "address": "Av. das Nações, 250 - Vila Nova",
    "businessCategory": "menu",
    "theme": "food",
    "currency": "BRL",
    "deliveryFee": 8,
    "minOrderValue": 35,
    "openingHours": {
      "open": "17:00",
      "close": "01:00"
    },
    "pixConfig": {
      "key": "11933334444",
      "keyType": "phone",
      "beneficiary": "Brasa Viva Espetaria LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "categories": [
      {
        "id": "cat-espetos-carvao",
        "name": "Espetos Artesanais na Brasa",
        "icon": "🍢",
        "products": [
          {
            "id": "prod-espeto-picanha",
            "name": "Espeto de Picanha Grill com Farofa e Vinagrete",
            "description": "Cubos nobres de picanha com capa de gordura dourada no braseiro alto. Acompanha farofa crocante e vinagrete caseiro.",
            "price": 18.9,
            "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "restaurante-bella-italia",
    "name": "Cantina & Restaurante Bella Itália",
    "description": "Massas artesanais frescas, molhos italianos tradicionais, risotos e cartas de vinhos nobres.",
    "logo": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11922223333",
    "address": "Rua Treze de Maio, 800 - Bixiga",
    "businessCategory": "menu",
    "theme": "food",
    "currency": "BRL",
    "deliveryFee": 10,
    "minOrderValue": 45,
    "openingHours": {
      "open": "11:30",
      "close": "23:00"
    },
    "pixConfig": {
      "key": "11922223333",
      "keyType": "phone",
      "beneficiary": "Cantina Bella Italia LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "categories": [
      {
        "id": "cat-massas-frescas",
        "name": "Massas Artesanais da Casa",
        "icon": "🍝",
        "products": [
          {
            "id": "prod-fettuccine-alfredo",
            "name": "Fettuccine Alfredo com Iscas de Filet Mignon",
            "description": "Massa fresca da casa salteada em emulsão rica de manteiga francesa, parmesão Grana Padano ralado na hora e tiras macias de filé mignon.",
            "price": 49.9,
            "image": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  }
]

export const ALL_STORES = ALL_10_STORES

export async function seedAllStores(db: any) {
  let totalTenants = 0
  let totalCats = 0
  let totalProds = 0

  for (const store of ALL_10_STORES) {
    totalTenants++
    const tenantId = `ten-${store.slug}`
    const deliveryFeeCents = Math.round((store.deliveryFee || 0) * 100)
    const minOrderValueCents = Math.round((store.minOrderValue || 0) * 100)

    const tenantRes = await db.query(
      `INSERT INTO tenants (
        id, slug, name, description, logo, banner, phone_whatsapp, address,
        business_category, theme, custom_domain, opening_hours, pix_config,
        delivery_fee_cents, min_order_value_cents, professionals, reviews
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        logo = EXCLUDED.logo,
        banner = EXCLUDED.banner,
        phone_whatsapp = EXCLUDED.phone_whatsapp,
        address = EXCLUDED.address,
        business_category = EXCLUDED.business_category,
        theme = EXCLUDED.theme,
        custom_domain = EXCLUDED.custom_domain,
        opening_hours = EXCLUDED.opening_hours,
        pix_config = EXCLUDED.pix_config,
        delivery_fee_cents = EXCLUDED.delivery_fee_cents,
        min_order_value_cents = EXCLUDED.min_order_value_cents,
        professionals = EXCLUDED.professionals,
        reviews = EXCLUDED.reviews
      RETURNING id;`,
      [
        tenantId,
        store.slug,
        store.name,
        store.description || null,
        store.logo || null,
        store.banner || null,
        store.phoneWhatsApp || store.whatsapp || '11999999999',
        store.address || null,
        store.businessCategory || 'menu',
        store.theme || 'food',
        store.customDomain || null,
        store.openingHours ? JSON.stringify(store.openingHours) : null,
        store.pixConfig ? JSON.stringify(store.pixConfig) : null,
        deliveryFeeCents,
        minOrderValueCents,
        store.professionals ? JSON.stringify(store.professionals) : JSON.stringify([]),
        JSON.stringify({ rating: 4.9, count: 42 })
      ]
    )

    const realTenantId = tenantRes.rows[0]?.id || tenantId

    if (Array.isArray(store.categories)) {
      for (let cIdx = 0; cIdx < store.categories.length; cIdx++) {
        const cat = store.categories[cIdx]
        totalCats++

        await db.query(
          `INSERT INTO categories (id, tenant_id, name, icon, sort_order)\n           VALUES ($1, $2, $3, $4, $5)\n           ON CONFLICT (id) DO UPDATE SET\n             tenant_id = EXCLUDED.tenant_id,\n             name = EXCLUDED.name,\n             icon = EXCLUDED.icon,\n             sort_order = EXCLUDED.sort_order;`,
          [cat.id, realTenantId, cat.name, cat.icon || null, cIdx]
        )

        if (Array.isArray(cat.products)) {
          for (const prod of cat.products) {
            totalProds++
            const priceCents = Math.round((prod.price || 0) * 100)
            const duration = prod.durationMinutes !== undefined ? prod.durationMinutes : null
            const isAvailable = prod.isAvailable !== undefined ? prod.isAvailable : (prod.available !== false)
            const options = prod.optionGroups || []

            await db.query(
              `INSERT INTO products (
                id, tenant_id, category_id, name, description, price_cents, image, available, duration_minutes, option_groups
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              ON CONFLICT (id) DO UPDATE SET
                tenant_id = EXCLUDED.tenant_id,
                category_id = EXCLUDED.category_id,
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                price_cents = EXCLUDED.price_cents,
                image = EXCLUDED.image,
                available = EXCLUDED.available,
                duration_minutes = EXCLUDED.duration_minutes,
                option_groups = EXCLUDED.option_groups;`,
              [
                prod.id,
                realTenantId,
                cat.id,
                prod.name,
                prod.description || null,
                priceCents,
                prod.image || null,
                isAvailable,
                duration,
                JSON.stringify(options)
              ]
            )
          }
        }
      }
    }
  }

  return { totalTenants, totalCats, totalProds }
}
