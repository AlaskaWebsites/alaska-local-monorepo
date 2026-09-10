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
                  {
                    "id": "gelo-maracuja",
                    "name": "Maracujá Tropical",
                    "price": 0
                  },
                  {
                    "id": "gelo-coco",
                    "name": "Água de Coco",
                    "price": 0
                  },
                  {
                    "id": "gelo-morango",
                    "name": "Morango Silvestre",
                    "price": 0
                  }
                ]
              }
            ]
          },
          {
            "id": "prod-combo-whisky",
            "name": "Kit Whisky Red Label 1L + 4 Energéticos Red Bull",
            "description": "1 Garrafa Johnnie Walker Red Label 1L + 4 Latas de Energético Red Bull 250ml e copo personalizado da casa.",
            "price": 139.9,
            "image": "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true,
            "optionGroups": [
              {
                "id": "opt-copo-whisky",
                "name": "Acompanhamento Extra",
                "min": 0,
                "max": 1,
                "options": [
                  {
                    "id": "copo-acrilico-balde",
                    "name": "Balde de Gelo Acrílico com Pegador",
                    "price": 18
                  },
                  {
                    "id": "pacote-bala-halls",
                    "name": "2x Trident Menta",
                    "price": 6
                  }
                ]
              }
            ]
          },
          {
            "id": "prod-combo-vodka",
            "name": "Kit Vodka Smirnoff 998ml + 1 Energético Baly 2L",
            "description": "1 Vodka Smirnoff 998ml + 1 Energético Baly 2 Litros (Sabor à escolha) + 2 Gelos de Coco.",
            "price": 69.9,
            "image": "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-cervejas",
        "name": "Cervejas & Packs (Trincando)",
        "icon": "🍺",
        "products": [
          {
            "id": "prod-heineken-pack",
            "name": "Pack Cerveja Heineken 350ml (12 Latas Geladas)",
            "description": "Fardo fechado com 12 latas de 350ml. Entregue em temperatura abaixo de zero, pronta para consumo.",
            "price": 68.9,
            "image": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-spaten-pack",
            "name": "Pack Cerveja Spaten Munich Helles 350ml (12 Latas)",
            "description": "Puro malte munich tradicional alemã. Pack com 12 unidades estupidamente geladas.",
            "price": 54.9,
            "image": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-corona-unidade",
            "name": "Cerveja Corona Extra 330ml Long Neck (Unidade Gelada)",
            "description": "Garrafa individual 330ml servida no ponto. Acompanha fatia de limão taiti em embalagem lacrada.",
            "price": 8.5,
            "image": "https://images.unsplash.com/photo-1584225064785-c62a8b43d148?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-gelo-carvao",
        "name": "Gelo, Carvão & Conveniência",
        "icon": "🧊",
        "products": [
          {
            "id": "prod-gelo-cubo",
            "name": "Saco de Gelo em Cubo 5kg Filtrado",
            "description": "Gelo em cubo de água filtrada, cristalino e ideal para drinks e champanheiras.",
            "price": 14,
            "image": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-gelo-sabor-coco",
            "name": "Gelo de Sabor Coco Leve 200ml (Unidade)",
            "description": "Gelo saborizado de água de coco pura para harmonizar com whisky e gin.",
            "price": 4.5,
            "image": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-carvao-3kg",
            "name": "Saco de Carvão Vegetal Especial 3kg",
            "description": "Carvão selecionado 100% eucalipto reflorestado, brasa duradoura e sem faíscas.",
            "price": 19.9,
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-petiscos",
        "name": "Salgadinhos & Petiscos Rápidos",
        "icon": "🥜",
        "products": [
          {
            "id": "prod-amendoim-japones",
            "name": "Amendoim Japonês Crocante Dori 150g",
            "description": "Petisco clássico com casca super crocante de shoyu e especiarias.",
            "price": 7.5,
            "image": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-doritos-nacho",
            "name": "Salgadinho Doritos Queijo Nacho 140g",
            "description": "Tortilhas crocantes de milho sabor queijo nacho.",
            "price": 13.9,
            "image": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "barbearia-style",
    "name": "Barbearia Style",
    "description": "Cortes modernos, barba com toalha quente, pigmentação e estética masculina.",
    "logo": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11977776666",
    "address": "Rua Augusta, 1200 - Consolação, São Paulo - SP",
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
      "key": "11977776666",
      "keyType": "phone",
      "beneficiary": "Barbearia Style LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true,
      "depositPercentage": 30
    },
    "professionals": [
      {
        "id": "prof-1",
        "name": "Carlos Santos",
        "role": "Barbeiro Master",
        "isAvailable": true,
        "availableDays": [1, 2, 3, 4, 5, 6],
        "workHours": { "start": "09:00", "end": "20:00" },
        "lunchBreak": { "start": "12:00", "end": "13:00", "enabled": true }
      },
      {
        "id": "prof-2",
        "name": "Lucas Oliveira",
        "role": "Visagista & Barbeiro",
        "isAvailable": true,
        "availableDays": [2, 3, 4, 5, 6],
        "workHours": { "start": "10:00", "end": "20:00" },
        "lunchBreak": { "start": "14:00", "end": "15:00", "enabled": true }
      },
      {
        "id": "prof-3",
        "name": "Mateus Silva",
        "role": "Especialista em Cortes Clássicos",
        "isAvailable": true,
        "availableDays": [1, 3, 4, 5, 6],
        "workHours": { "start": "09:00", "end": "18:00" },
        "lunchBreak": { "start": "12:00", "end": "13:00", "enabled": false }
      }
    ],
    "categories": [
      {
        "id": "cat-cabelo",
        "name": "Cabelo & Barba",
        "icon": "💈",
        "products": [
          {
            "id": "serv-corte-degrade",
            "name": "Corte Masculino Premium + Lavagem",
            "description": "Degradê navalhado, fade ou clássico na tesoura. Inclui lavagem com shampoo refrescante e finalização com pomada matte.",
            "price": 45,
            "durationMinutes": 40,
            "image": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "serv-barboterapia",
            "name": "Barboterapia Tradicional (Toalha Quente)",
            "description": "Alinhamento com navalhete descartável, esfoliação facial prévia, toalha quente com óleo essencial de menta e pós-barba hidratante.",
            "price": 38,
            "durationMinutes": 35,
            "image": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "serv-combo-completo",
            "name": "Combo Style: Cabelo + Barba + Sobrancelha",
            "description": "Nosso pacote completo mais pedido. Atendimento de 1 hora com direito a 1 cerveja long neck cortesia da casa.",
            "price": 75,
            "durationMinutes": 60,
            "image": "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-produtos-barbearia",
        "name": "Produtos para Levar",
        "icon": "🧴",
        "products": [
          {
            "id": "prod-pomada-matte",
            "name": "Pomada Modeladora Efeito Matte 150g",
            "description": "Fixação forte sem brilho, à base de água e com aroma amadeirado. Não deixa resíduos.",
            "price": 39.9,
            "image": "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=500&auto=format&fit=crop&q=80",
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
      "close": "18:00"
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
            "id": "prod-conjunto-alfaiataria",
            "name": "Conjunto Alfaiataria Colete + Calça Pantalona",
            "description": "Tecido crepe duna encorpado que não amassa. Calça de cintura alta com bolsos faca e colete estruturado com botões encapados.",
            "price": 189.9,
            "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-blazer-oversized",
            "name": "Blazer Feminino Oversized Alfaiataria Max",
            "description": "Forrado internamente, caimento impecável e ombreiras discretas. Versátil para looks casuais ou executivos.",
            "price": 159.9,
            "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-vestidos",
        "name": "Vestidos & Macacões",
        "icon": "👗",
        "products": [
          {
            "id": "prod-vestido-midi",
            "name": "Vestido Midi Canelado Gola Alta Fenda Lateral",
            "description": "Malha canelada premium de alta elasticidade que valoriza a silhueta com extremo conforto e elegância.",
            "price": 99.9,
            "image": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-vestido-longo-fluido",
            "name": "Vestido Longo Floral Fluido com Lastéx",
            "description": "Alças reguláveis, decote coração com elastex ajustável nas costas. Tecido viscose acetinada fresquinho.",
            "price": 129.9,
            "image": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-blusas-croppeds",
        "name": "Blusas, Croppeds & T-Shirts",
        "icon": "👚",
        "products": [
          {
            "id": "prod-cropped-amarracao",
            "name": "Cropped Manga Bufante com Amarração Frontal",
            "description": "Tendência absoluta! Mangas com elástico suave e amarração frontal que permite ajustar o decote.",
            "price": 59.9,
            "image": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-tshirt-algodao",
            "name": "T-Shirt 100% Algodão Penteado Estampa Minimal",
            "description": "Gola redonda em ribana, toque aveludado e estampa silk de alta durabilidade que não desbota na lavagem.",
            "price": 49.9,
            "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-camisa-linho",
            "name": "Camisa Feminina Social Viscolinho Premium",
            "description": "Toque leve de linho com viscose, mangas compridas com martingale para dobrar e botões tartaruga.",
            "price": 89.9,
            "image": "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
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
            "isAvailable": true
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
    "slug": "cafe-central",
    "name": "Café Central",
    "description": "Cafés especiais moídos na hora, cappuccinos artesanais, croissants folhados e confeitaria fina.",
    "logo": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11988881111",
    "address": "Rua Oscar Freire, 320 - Jardins, São Paulo - SP",
    "businessCategory": "menu",
    "theme": "food",
    "currency": "BRL",
    "deliveryFee": 8,
    "minOrderValue": 25,
    "openingHours": {
      "open": "07:30",
      "close": "19:00"
    },
    "pixConfig": {
      "key": "11988881111",
      "keyType": "phone",
      "beneficiary": "Café Central Bistrô",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "categories": [
      {
        "id": "cat-cafes-quentes",
        "name": "Cafés Especiais & Bebidas Quentes",
        "icon": "☕",
        "products": [
          {
            "id": "prod-cappuccino-italiano",
            "name": "Cappuccino Italiano Clássico com Canela",
            "description": "Dose dupla de espresso arábica, leite vaporizado cremoso, polvilhado com cacau 70% e raspas de canela.",
            "price": 14.5,
            "image": "https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-espresso-duplo",
            "name": "Espresso Duplo Grãos Selecionados Cerrado Mineiro",
            "description": "60ml de café puro com crema espessa e notas aromáticas amendoadas de chocolate meio amargo.",
            "price": 9.9,
            "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-mocha-chocolate",
            "name": "Mocha Especial com Calda Artesanal de Chocolate Belga",
            "description": "Espresso, leite vaporizado e generosa camada de ganache de chocolate belga finalizado com chantilly.",
            "price": 18,
            "image": "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-confeitaria-folhados",
        "name": "Croissants, Quiches & Confeitaria",
        "icon": "🥐",
        "products": [
          {
            "id": "prod-croissant-manteiga",
            "name": "Croissant Francês Folhado na Manteiga",
            "description": "Massa artesanal fermentada por 48h, super crocante por fora e com alvéolos macios amanteigados por dentro.",
            "price": 16,
            "image": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-cheesecake-frutas",
            "name": "Cheesecake Clássica com Calda de Frutas Vermelhas",
            "description": "Base crocante de biscoito amanteigado, recheio denso de cream cheese e calda artesanal com pedaços de amora e framboesa.",
            "price": 22.9,
            "image": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-quiche-alho-poro",
            "name": "Fatia de Quiche Lorraine com Alho-Poró e Queijo Gruyère",
            "description": "Massa brisée levinha que derrete na boca com recheio cremoso à base de creme de leite fresco e queijos selecionados.",
            "price": 19.5,
            "image": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "clinica-sorriso",
    "name": "Clínica Sorriso",
    "description": "Odontologia moderna, implantes guiados, clareamento a laser, ortodontia invisível e harmonização facial.",
    "logo": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11966665555",
    "address": "Av. Rebouças, 1500 - Pinheiros, São Paulo - SP",
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
      "key": "11966665555",
      "keyType": "phone",
      "beneficiary": "Clinica Sorriso Odonto LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true,
      "depositPercentage": 20
    },
    "professionals": [
      {
        "id": "prof-1",
        "name": "Dra. Camila Rocha",
        "role": "Ortodontista & Estética",
        "isAvailable": true,
        "availableDays": [1, 2, 3, 4, 5, 6],
        "workHours": { "start": "08:00", "end": "18:00" },
        "lunchBreak": { "start": "12:00", "end": "13:00", "enabled": true }
      },
      {
        "id": "prof-2",
        "name": "Dr. Rafael Mendes",
        "role": "Implantodontista & Cirurgião",
        "isAvailable": true,
        "availableDays": [2, 3, 4, 5, 6],
        "workHours": { "start": "09:00", "end": "19:00" },
        "lunchBreak": { "start": "13:00", "end": "14:00", "enabled": true }
      },
      {
        "id": "prof-3",
        "name": "Dra. Beatriz Lima",
        "role": "Clínica Geral & Periodontia",
        "isAvailable": true,
        "availableDays": [1, 3, 4, 5, 6],
        "workHours": { "start": "08:00", "end": "17:00" },
        "lunchBreak": { "start": "12:00", "end": "13:00", "enabled": true }
      }
    ],
    "categories": [
      {
        "id": "cat-consultas-procedimentos",
        "name": "Procedimentos & Consultas Odontológicas",
        "icon": "🦷",
        "products": [
          {
            "id": "serv-avaliacao-inicial",
            "name": "Consulta de Avaliação Completa com Check-up Digital",
            "description": "Exame clínico detalhado, câmera intraoral de alta definição e planejamento digital do tratamento.",
            "price": 120,
            "durationMinutes": 45,
            "image": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "serv-limpeza-profilaxia",
            "name": "Profilaxia Profissional com Ultrassom e Jato de Bicarbonato",
            "description": "Remoção completa de tártaro e placa bacteriana, polimento dental coronário e aplicação tópica de flúor.",
            "price": 180,
            "durationMinutes": 50,
            "image": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "serv-clareamento-laser",
            "name": "Sessão de Clareamento Dental a Laser em Consultório",
            "description": "Aplicação de gel clareador de peróxido potencializado por luz LED/Laser. Dentes até 4 tons mais brancos na sessão.",
            "price": 450,
            "durationMinutes": 60,
            "image": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "espetaria-brasa",
    "name": "Espetaria & Hamburgueria Brasa Viva",
    "description": "Espetinhos nobres grelhados no fogo a lenha, jantinhas completas com tropeiro e burgers defumados.",
    "logo": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11955558888",
    "address": "Rua do Fogo, 400 - Tatuapé, São Paulo - SP",
    "businessCategory": "menu",
    "theme": "rose",
    "currency": "BRL",
    "deliveryFee": 9,
    "minOrderValue": 35,
    "openingHours": {
      "open": "17:30",
      "close": "23:59"
    },
    "pixConfig": {
      "key": "11955558888",
      "keyType": "phone",
      "beneficiary": "Espetaria Brasa Viva LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "categories": [
      {
        "id": "cat-espetinhos-carnes",
        "name": "Espetos Nobres na Brasa",
        "icon": "🍢",
        "products": [
          {
            "id": "prod-espeto-picanha",
            "name": "Espetinho de Picanha Grill com Sal Grosso de Parrilla",
            "description": "Cubos macios de picanha maturada, intercalados com bacon crocante e selados no ponto certo.",
            "price": 22,
            "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-espeto-frango-bacon",
            "name": "Medalhão de Frango com Bacon Defumado Artesanal",
            "description": "Peito de frango suculento marinado em ervas finas e envolvido em fatias crocantes de bacon.",
            "price": 16.5,
            "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-espeto-queijo-coalho",
            "name": "Espeto de Queijo Coalho Dourado com Melaço de Cana",
            "description": "Capa dourada e crocante por fora com interior macio, acompanhado de sachê de melaço artesanal.",
            "price": 15,
            "image": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-jantinhas-combos",
        "name": "Jantinhas Completas da Casa",
        "icon": "🥘",
        "products": [
          {
            "id": "prod-jantinha-tradicional",
            "name": "Jantinha Clássica Mineira (Espeto à Escolha + Acompanhamentos)",
            "description": "Acompanha arroz branco soltinho, feijão tropeiro tradicional com torresmo, mandioca cozida na manteiga de garrafa e vinagrete.",
            "price": 38.9,
            "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-acompanhamentos-porcoes",
        "name": "Porções & Guarnições",
        "icon": "🍟",
        "products": [
          {
            "id": "prod-mandioca-frita-bacon",
            "name": "Porção de Mandioca Cremosa com Bacon e Queijo Parmesão",
            "description": "Cozida e frita na hora, super crocante com queijo ralado fresco derretido por cima.",
            "price": 28,
            "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-bebidas-geladas",
        "name": "Bebidas & Refrigerantes",
        "icon": "🥤",
        "products": [
          {
            "id": "prod-refrigerante-lata",
            "name": "Coca-Cola Original 350ml Lata Gelada",
            "description": "Lata de 350ml entregue bem gelada.",
            "price": 6.5,
            "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "hamburgueria-x",
    "name": "Hamburgueria X Artesanal",
    "description": "Burgers artesanais grelhados no fogo alto, smashs ultra crocantes, batatas rústicas e milkshakes cremosos.",
    "logo": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11988882222",
    "address": "Av. Ibirapuera, 900 - Moema, São Paulo - SP",
    "businessCategory": "menu",
    "theme": "amber",
    "currency": "BRL",
    "deliveryFee": 8.5,
    "minOrderValue": 30,
    "openingHours": {
      "open": "18:00",
      "close": "23:59"
    },
    "pixConfig": {
      "key": "11988882222",
      "keyType": "phone",
      "beneficiary": "Hamburgueria X Artesanal LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "categories": [
      {
        "id": "cat-burgers-artesanais",
        "name": "Burgers Artesanais no Brioche",
        "icon": "🍔",
        "products": [
          {
            "id": "prod-x-bacon-artesanal",
            "name": "X-Bacon Supremo (Blend 180g + Cheddar Inglês)",
            "description": "Pão brioche tostado na manteiga, blend bovino Angus 180g, fatias generosas de bacon crocante, cheddar derretido e maionese defumada da casa.",
            "price": 36.9,
            "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-double-smash-crocante",
            "name": "Double Smash Burger Crocante com Picles e Cebola Roxa",
            "description": "2x ultra smash 90g com crostinha tostada perfeita, queijo prato duplo, picles agridoce em fatias e molho especial.",
            "price": 32.9,
            "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-acompanhamentos-fritas",
        "name": "Batatas & Snacks",
        "icon": "🍟",
        "products": [
          {
            "id": "prod-batata-rustica-alecrim",
            "name": "Batata Rústica com Alecrim e Sal Grosso",
            "description": "Batatas cortadas à mão com casca, fritas na temperatura perfeita com dentes de alho confitados e alecrim fresco.",
            "price": 24,
            "image": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-milkshakes-sobremesas",
        "name": "Milkshakes & Sobremesas",
        "icon": "🥤",
        "products": [
          {
            "id": "prod-shake-nutella",
            "name": "Milkshake de Nutella com Ninho 500ml",
            "description": "Sorvete artesanal de baunilha batido com creme de avelã Nutella pura, leite Ninho e borda com calda.",
            "price": 22.9,
            "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "karine-finardi",
    "name": "Karine Finardi Semijoias",
    "description": "Semijoias finas antialérgicas, banhadas a ouro 18k e prata 925 com garantia de 1 ano e design autoral.",
    "logo": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11999998888",
    "address": "Centro Comercial Morato - Francisco Morato - SP",
    "businessCategory": "shop",
    "theme": "rose",
    "currency": "BRL",
    "deliveryFee": 10,
    "minOrderValue": 50,
    "openingHours": {
      "open": "09:00",
      "close": "19:00"
    },
    "pixConfig": {
      "key": "11999998888",
      "keyType": "phone",
      "beneficiary": "Karine Finardi Semijoias",
      "city": "FRANCISCO MORATO",
      "allowTestCent": true
    },
    "categories": [
      {
        "id": "cat-colares-chokers",
        "name": "Colares, Chokers & Pingentes",
        "icon": "📿",
        "products": [
          {
            "id": "prod-colar-ponto-luz",
            "name": "Colar Ponto de Luz Zircônia Redonda Ouro 18k",
            "description": "Corrente veneziana de 45cm com extensor de 5cm e zircônia cúbica com brilho de diamante. Banho antialérgico de 10 milésimos.",
            "price": 89.9,
            "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-choker-fita-laminada",
            "name": "Choker Fita Laminada Espelhada 4mm Banhada Ouro 18k",
            "description": "Brilho espelhado que reflete a luz com movimento fluido. Fecho lagosta resistente com verniz cataforético.",
            "price": 119.9,
            "image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-brincos-argolas",
        "name": "Brincos, Argolas & Earcuffs",
        "icon": "💎",
        "products": [
          {
            "id": "prod-argola-cravejada",
            "name": "Argola Média Cravejada em Microzircônias Prata 925",
            "description": "Fecho click anatômico super confortável que não machuca para dormir. Duas fileiras de microzircônias brancas.",
            "price": 79.9,
            "image": "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-pulseiras-braceletes",
        "name": "Pulseiras & Riviera",
        "icon": "✨",
        "products": [
          {
            "id": "prod-pulseira-riviera",
            "name": "Pulseira Riviera Tennis Cravejada com Trava Dupla",
            "description": "Sofisticação absoluta. Zircônias lapidadas individualmente presas por 4 garras seguras.",
            "price": 149.9,
            "image": "https://images.unsplash.com/photo-1611591475839-729c24ed983b?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "restaurante-bella-italia",
    "name": "Restaurante Bella Italia",
    "description": "Massas frescas artesanais preparadas na hora, molhos tradicionais italianos e sobremesas típicas.",
    "logo": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11944443333",
    "address": "Rua Treze de Maio, 700 - Bixiga, São Paulo - SP",
    "businessCategory": "menu",
    "theme": "emerald",
    "currency": "BRL",
    "deliveryFee": 10,
    "minOrderValue": 45,
    "openingHours": {
      "open": "11:30",
      "close": "23:00"
    },
    "pixConfig": {
      "key": "11944443333",
      "keyType": "phone",
      "beneficiary": "Restaurante Bella Italia LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "categories": [
      {
        "id": "cat-massas-frescas",
        "name": "Massas Artesanais da Nonna",
        "icon": "🍝",
        "products": [
          {
            "id": "prod-fettuccine-alfredo",
            "name": "Fettuccine Alfredo Clássico com Lascas de Parmigiano Reggiano",
            "description": "Massa longa fresca feita com sêmola de trigo durum, emulsão cremosa de manteiga trufada e queijo parmesão 24 meses.",
            "price": 58,
            "image": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-lasanha-bolonhesa",
            "name": "Lasanha Tradicional com Ragu de Carne Cozido por 6h",
            "description": "Camadas intercaladas de massa fresca, bechamel aveludado com noz-moscada e ragu de carne bovina e suína.",
            "price": 54,
            "image": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-sobremesas-italianas",
        "name": "Dolci / Sobremesas Típicas",
        "icon": "🍰",
        "products": [
          {
            "id": "prod-tiramisu-tradicional",
            "name": "Tiramisù Tradicional com Mascarpone Italiano e Cacau",
            "description": "Biscoitos savoiardi embebidos em café espresso com licor amaretto, creme denso de queijo mascarpone e cacau 100%.",
            "price": 28,
            "image": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "studio-nail-design",
    "name": "Studio Nail Design",
    "description": "Alongamento em fibra de vidro, esmaltação em gel, nail art personalizada e spa dos pés.",
    "logo": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11933332222",
    "address": "Alameda dos Anapurus, 600 - Moema, São Paulo - SP",
    "businessCategory": "hub",
    "theme": "rose",
    "currency": "BRL",
    "deliveryFee": 0,
    "minOrderValue": 0,
    "openingHours": {
      "open": "09:00",
      "close": "19:00"
    },
    "pixConfig": {
      "key": "11933332222",
      "keyType": "phone",
      "beneficiary": "Studio Nail Design LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true,
      "depositPercentage": 30
    },
    "professionals": [
      {
        "id": "prof-1",
        "name": "Juliana Ferreira",
        "role": "Master Nail Designer",
        "isAvailable": true,
        "availableDays": [1, 2, 3, 4, 5, 6],
        "workHours": { "start": "09:00", "end": "19:00" },
        "lunchBreak": { "start": "12:30", "end": "13:30", "enabled": true }
      },
      {
        "id": "prof-2",
        "name": "Patrícia Souza",
        "role": "Especialista em Esmaltação em Gel",
        "isAvailable": true,
        "availableDays": [2, 3, 4, 5, 6],
        "workHours": { "start": "10:00", "end": "18:00" },
        "lunchBreak": { "start": "13:00", "end": "14:00", "enabled": true }
      }
    ],
    "categories": [
      {
        "id": "cat-alongamento-unhas",
        "name": "Alongamentos & Manutenção",
        "icon": "💅",
        "products": [
          {
            "id": "serv-alongamento-fibra",
            "name": "Alongamento de Unhas em Fibra de Vidro (Aplicação)",
            "description": "Procedimento completo com preparação anatômica da lâmina, curvatura C duradoura, ponto de tensão perfeito e lixamento técnico.",
            "price": 160,
            "durationMinutes": 120,
            "image": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "serv-manutencao-fibra",
            "name": "Manutenção Periódica de Fibra de Vidro (até 25 dias)",
            "description": "Nivelamento do crescimento, reforço da fibra, reparo de até 2 unhas quebradas e finalização com top coat extra brilho.",
            "price": 110,
            "durationMinutes": 90,
            "image": "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-esmaltacao-spa",
        "name": "Esmaltação & Spa dos Pés",
        "icon": "✨",
        "products": [
          {
            "id": "serv-esmaltacao-gel",
            "name": "Esmaltação em Gel com Cuticulagem Russa",
            "description": "Secagem instantânea na cabine LED/UV, brilho espelhado que não descasca por até 20 dias.",
            "price": 75,
            "durationMinutes": 60,
            "image": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "serv-spa-pes",
            "name": "Spa dos Pés com Esfoliação e Massagem Relaxante",
            "description": "Imersão em sais aromáticos de lavanda, esfoliação com açúcar mascavo e óleos vegetais, hidratação profunda e massagem.",
            "price": 65,
            "durationMinutes": 45,
            "image": "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-home-care",
        "name": "Cuidados Diários (Home Care)",
        "icon": "🧴",
        "products": [
          {
            "id": "prod-oleo-cuticulas",
            "name": "Óleo Hidratante de Cutículas com Vitamina E 15ml",
            "description": "Frasco conta-gotas com óleo de jojoba e melaleuca para manter as cutículas hidratadas e sem pelinhas soltas.",
            "price": 25,
            "image": "https://images.unsplash.com/photo-1608248597359-00994f87a324?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  }
]

export async function seedAllStores(db: { query: (sql: string, params?: unknown[]) => Promise<any> }) {
  let totalTenants = 0
  let totalCats = 0
  let totalProds = 0

  for (const store of ALL_10_STORES) {
    totalTenants++
    const tenantId = `ten-${store.slug}`
    const deliveryFeeCents = Math.round((store.deliveryFee ?? 0) * 100)
    const minOrderValueCents = Math.round((store.minOrderValue ?? 0) * 100)

    const tenantRes = await db.query(
      `INSERT INTO tenants (
        id, slug, name, description, logo, banner, phone_whatsapp, address,
        business_category, theme, custom_domain, opening_hours, pix_config,
        delivery_fee_cents, min_order_value_cents, is_active, professionals, reviews, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true, $16, $17, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
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
        is_active = true,
        professionals = EXCLUDED.professionals,
        reviews = EXCLUDED.reviews,
        updated_at = NOW()
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
          `INSERT INTO categories (id, tenant_id, name, icon, sort_order)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET
             tenant_id = EXCLUDED.tenant_id,
             name = EXCLUDED.name,
             icon = EXCLUDED.icon,
             sort_order = EXCLUDED.sort_order;`,
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
