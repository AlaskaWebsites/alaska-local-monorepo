import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgres://alaska_admin:alaska_secret_2026@localhost:5432/alaska_local_db'

/**
 * Catálogos canônicos completos dos 10 estabelecimentos do ecossistema Alaska Local
 * Migrados para o PostgreSQL eliminando a dependência de dados mockados no frontend.
 */
const ALL_10_STORES: any[] = [
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
        "id": "cat-consultas-odontologicas",
        "name": "Consultas & Procedimentos em Consultório",
        "icon": "🦷",
        "products": [
          {
            "id": "serv-avaliacao-geral",
            "name": "Avaliação Diagnóstica Completa com Câmera Intraoral",
            "description": "Check-up digital minucioso com registro fotográfico de alta resolução em monitor para identificação precoce de cáries e trincas.",
            "price": 120,
            "durationMinutes": 45,
            "image": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "serv-profilaxia-ultrassom",
            "name": "Profilaxia Completa com Ultrassom e Jato de Bicarbonato",
            "description": "Limpeza dental profunda para remoção de placa bacteriana e tártaro com ultrassom indolor e polimento com pasta profilática.",
            "price": 180,
            "durationMinutes": 45,
            "image": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "serv-clareamento-laser",
            "name": "Sessão de Clareamento Dental a Laser em Consultório",
            "description": "Aplicação de gel clareador fotoativado por laser de diodo para resultados visíveis imediatos em apenas 1 sessão.",
            "price": 450,
            "durationMinutes": 60,
            "image": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "espetaria-brasa",
    "name": "Espetaria & Jantinha Brasa Nobre",
    "description": "Espetos artesanais na brasa de carvão de eucalipto, jantinhas completas com feijão tropeiro e vinagrete da casa.",
    "logo": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11988882222",
    "address": "Rua do Glicério, 450 - Liberdade, São Paulo - SP",
    "businessCategory": "menu",
    "theme": "food",
    "currency": "BRL",
    "deliveryFee": 6,
    "minOrderValue": 20,
    "openingHours": {
      "open": "18:00",
      "close": "23:59"
    },
    "pixConfig": {
      "key": "11988882222",
      "keyType": "phone",
      "beneficiary": "Espetaria Brasa Nobre",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "categories": [
      {
        "id": "cat-jantinhas-completas",
        "name": "Jantinhas Completas com Acompanhamentos",
        "icon": "🍽️",
        "products": [
          {
            "id": "prod-jantinha-tradicional",
            "name": "Jantinha Nobre com 1 Espeto à Escolha",
            "description": "Arroz branco soltinho, feijão tropeiro especial com bacon, vinagrete artesanal e mandioca na manteiga de garrafa.",
            "price": 28.9,
            "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-jantinha-dupla",
            "name": "Jantinha Dupla para Compartilhar (2 Espetos)",
            "description": "Porção farta para 2 pessoas: Arroz branco, dobro de feijão tropeiro, vinagrete, mandioca frita e 2 espetos suculentos.",
            "price": 49.9,
            "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-espetos-carnes",
        "name": "Espetos de Carnes Nobres na Brasa",
        "icon": "🥩",
        "products": [
          {
            "id": "prod-espeto-picanha",
            "name": "Espeto de Picanha Bovina Maturada na Brasa",
            "description": "Cubos nobres de picanha com capa de gordura perfeita, selados no sal de parrilla e servidos com farofa da casa.",
            "price": 18,
            "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-espeto-alcatra",
            "name": "Espeto de Alcatra com Bacon Defumado",
            "description": "Alcatra bovina macia entremeada com fatias grossas de bacon crocante artesanal.",
            "price": 15,
            "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-espeto-fraldinha",
            "name": "Espeto de Fraldinha na Manteiga de Garrafa",
            "description": "Fraldinha marinada em ervas finas e pincelada com manteiga de garrafa legítima do sertão.",
            "price": 16.5,
            "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-espetos-frango-porco",
        "name": "Espetos de Frango, Porco & Queijos",
        "icon": "🍗",
        "products": [
          {
            "id": "prod-espeto-coracao",
            "name": "Espeto de Coração de Frango Marinado no Vinho Branco",
            "description": "Corações de frango marinados no vinho branco e ervas, grelhados no ponto perfeito, sem ressecar.",
            "price": 13,
            "image": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-espeto-queijo-coalho",
            "name": "Espeto de Queijo Coalho Dourado com Melaço de Cana",
            "description": "Queijo coalho nordestino tostadinho na brasa, servido com fio de melaço artesanal e orégano.",
            "price": 12,
            "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-espeto-pao-alho",
            "name": "Pão de Alho Especial Recheado com Queijo",
            "description": "Baguete crocante recheada com pasta cremosa de alho e muçarela derretida na brasa.",
            "price": 9.9,
            "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-bebidas-espetaria",
        "name": "Bebidas & Refrigerantes",
        "icon": "🥤",
        "products": [
          {
            "id": "prod-guarana-antarctica",
            "name": "Refrigerante Guaraná Antarctica Lata 350ml Gelada",
            "description": "Lata de 350ml trincando de gelada.",
            "price": 6,
            "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-coca-cola-lata",
            "name": "Refrigerante Coca-Cola Original Lata 350ml",
            "description": "Lata de 350ml estupidamente gelada.",
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
    "name": "Hamburgueria X",
    "description": "Burgers artesanais defumados na lenha, smash burgers crocantes, batata rústica trufada e milk-shakes cremosos.",
    "logo": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11999991111",
    "address": "Av. Brigadeiro Faria Lima, 2200 - Itaim Bibi, São Paulo - SP",
    "businessCategory": "menu",
    "theme": "food",
    "currency": "BRL",
    "deliveryFee": 7.5,
    "minOrderValue": 35,
    "openingHours": {
      "open": "18:00",
      "close": "23:59"
    },
    "pixConfig": {
      "key": "11999991111",
      "keyType": "phone",
      "beneficiary": "Hamburgueria X Artesanal LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "categories": [
      {
        "id": "cat-smash-burgers",
        "name": "Smash Burgers & Artesanais",
        "icon": "🍔",
        "products": [
          {
            "id": "prod-x-bacon-artesanal",
            "name": "X-Bacon Especial Blend 180g na Brasa",
            "description": "Blend suculento de costela 180g grelhado na brasa, queijo cheddar inglês derretido, fatias generosas de bacon artesanal crocante e maionese defumada no pão brioche tostado na manteiga.",
            "price": 38.9,
            "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-double-smash",
            "name": "Double Smash Burger Crocante 2x 90g",
            "description": "Dois discos smash ultra prensados com crostinha perfeita de maillard, american cheese duplo, picles agridoce da casa e molho secreto X no pão de batata fofinho.",
            "price": 32.9,
            "image": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-acompanhamentos-burger",
        "name": "Batatas & Acompanhamentos",
        "icon": "🍟",
        "products": [
          {
            "id": "prod-batata-trufada",
            "name": "Batata Rústica com Alecrim e Parmesão Ralado 300g",
            "description": "Batatas cortadas à mão com casca, fritas em imersão dupla para máxima crocância, salpicadas com flor de sal e queijo parmesão ralado na hora.",
            "price": 24.9,
            "image": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-bebidas-burger",
        "name": "Bebidas & Shakes",
        "icon": "🥤",
        "products": [
          {
            "id": "prod-coca-zero-lata",
            "name": "Refrigerante Coca-Cola Sem Açúcar Lata 350ml",
            "description": "Lata 350ml bem gelada.",
            "price": 6.5,
            "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "karine-finardi",
    "name": "Karine Finardi | Semijoias & Revenda",
    "description": "Semijoias banhadas a ouro 18k e prata 925 com acabamento de alta joalheria, garantia de 1 ano e hipoalergênicas.",
    "logo": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11999998888",
    "address": "Rua das Rosas, 120 - Centro, Francisco Morato - SP",
    "businessCategory": "shop",
    "theme": "barber",
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
        "name": "Colares & Chokers Banhados a Ouro 18k",
        "icon": "✨",
        "products": [
          {
            "id": "prod-colar-ponto-luz",
            "name": "Colar Ponto de Luz em Zircônia Ouro 18k",
            "description": "Corrente veneziana de 45cm com extensor de 5cm, pingente caixa alta com zircônia cúbica lapidação brilhante de 6mm. Banho 10 milésimos.",
            "price": 89.9,
            "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-choker-fita-laminada",
            "name": "Choker Fita Laminada Dourada 4mm Banhada Ouro 18k",
            "description": "Malha maleável com brilho espelhado intenso, banhada a 10 milésimos de ouro 18k com dupla camada de verniz protetor.",
            "price": 119.9,
            "image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-brincos-argolas",
        "name": "Brincos & Argolas Hipoalergênicas",
        "icon": "💎",
        "products": [
          {
            "id": "prod-argola-cravejada",
            "name": "Argola Média Cravejada em Microzircônias Cristal",
            "description": "Fecho italiano de fácil encaixe, micro cravação manual com zircônias de primeira linha. Leve e super confortável para o dia a dia.",
            "price": 69.9,
            "image": "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-ear-cuff-perolas",
            "name": "Ear Cuff Delicado com Pérolas Shell e Gotas",
            "description": "Envolve a cartilagem da orelha sem necessidade de segundo furo. Pérolas shell legítimas com brilho acetinado.",
            "price": 54.9,
            "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-pulseiras-aneis",
        "name": "Pulseiras & Anéis Reguláveis",
        "icon": "💍",
        "products": [
          {
            "id": "prod-pulseira-riviera",
            "name": "Pulseira Riviera Tênis Flexível com Zircônias",
            "description": "Clássico atemporal com fecho gaveta e trava de segurança dupla. Zircônias lapidadas que conferem brilho idêntico ao diamante.",
            "price": 149.9,
            "image": "https://images.unsplash.com/photo-1611591475878-2c4f693b4823?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-anel-solitario",
            "name": "Anel Solitário Cravação 4 Garras Ouro 18k",
            "description": "Aro anatômico polido com pedra central de zircônia cristal 7mm. O presente clássico para momentos inesquecíveis.",
            "price": 79.9,
            "image": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  },
  {
    "slug": "restaurante-bella-italia",
    "name": "Bella Italia",
    "description": "Massas frescas artesanais feitas diariamente, risotos cremosos e molhos italianos de receita centenária.",
    "logo": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11988883333",
    "address": "Rua Treze de Maio, 800 - Bixiga, São Paulo - SP",
    "businessCategory": "menu",
    "theme": "food",
    "currency": "BRL",
    "deliveryFee": 9,
    "minOrderValue": 40,
    "openingHours": {
      "open": "11:30",
      "close": "23:00"
    },
    "pixConfig": {
      "key": "11988883333",
      "keyType": "phone",
      "beneficiary": "Restaurante Bella Italia Trattoria",
      "city": "SAO PAULO",
      "allowTestCent": true
    },
    "categories": [
      {
        "id": "cat-massas-artesanais",
        "name": "Massas Artesanais da Trattoria",
        "icon": "🍝",
        "products": [
          {
            "id": "prod-fettuccine-ragu",
            "name": "Fettuccine Fresco ao Ragù de Costela 6 Horas",
            "description": "Massa artesanal fresca de sêmola e ovos caipiras, envolta em ragù rústico de costela cozida lentamente por 6h no vinho tinto e tomates san marzano.",
            "price": 58.9,
            "image": "https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-lasanha-bolonhesa",
            "name": "Lasanha Tradicional Alla Bolognese Gratinada",
            "description": "Camadas de massa fresca intercaladas com molho à bolonhesa clássico, bechamel aveludado com noz-moscada e cobertura generosa de queijo parmesão gratinado.",
            "price": 52,
            "image": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-risotos-italianos",
        "name": "Risotos Cremosos",
        "icon": "🥘",
        "products": [
          {
            "id": "prod-risoto-funghi",
            "name": "Risoto de Arroz Arbóreo ao Funghi Porcini Secchi",
            "description": "Arroz arbóreo italiano importado, caldo aromático de legumes, hidratação no vinho branco e funghi porcini finalizado com manteiga trufada e parmesão.",
            "price": 64,
            "image": "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-tiramisu-classico",
            "name": "Tiramisù Tradicional Italiano com Mascarpone e Café",
            "description": "Biscoitos savoiardi embebidos em café espresso forte e licor amaretto, creme denso de mascarpone e cacau em pó holandês 100%.",
            "price": 26,
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
    "description": "Especialistas em nail art, manicure, pedicure, alongamentos e esmaltes de alta qualidade. Agendamento fácil e venda de produtos profissionais.",
    "logo": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=150&auto=format&fit=crop&q=80",
    "banner": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&auto=format&fit=crop&q=80",
    "phoneWhatsApp": "11955553333",
    "address": "Rua das Unhas, 789 - Jardins, São Paulo - SP",
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
      "key": "11955553333",
      "keyType": "phone",
      "beneficiary": "Studio Nail Design LTDA",
      "city": "SAO PAULO",
      "allowTestCent": true,
      "depositPercentage": 30
    },
    "professionals": [
      {
        "id": "prof-juliana",
        "name": "Juliana Santos (Nail Artist)",
        "role": "Especialista em Nail Art e Alongamentos",
        "isAvailable": true,
        "availableDays": [1, 2, 3, 4, 5, 6],
        "workHours": { "start": "09:00", "end": "19:00" },
        "lunchBreak": { "start": "12:00", "end": "13:00", "enabled": true }
      },
      {
        "id": "prof-fernanda",
        "name": "Fernanda Lima",
        "role": "Manicure e Pedicure Premium",
        "isAvailable": true,
        "availableDays": [2, 3, 4, 5, 6],
        "workHours": { "start": "09:00", "end": "19:00" },
        "lunchBreak": { "start": "13:00", "end": "14:00", "enabled": true }
      }
    ],
    "categories": [
      {
        "id": "cat-alongamentos-gel",
        "name": "Alongamentos & Estrutura em Gel",
        "icon": "💅",
        "products": [
          {
            "id": "serv-alongamento-fibra",
            "name": "Alongamento em Fibra de Vidro (Aplicação Completa)",
            "description": "Estruturação natural e resistente com fibra de vidro premium importada, curvatura C perfeita e acabamento ultra fino sem aspecto grosseiro.",
            "price": 160,
            "durationMinutes": 120,
            "image": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "serv-banho-de-gel",
            "name": "Banho de Gel sobre Unhas Naturais",
            "description": "Blindagem protetora em gel para unhas naturais que quebram com facilidade. Estimula o crescimento saudável sem descascar o esmalte.",
            "price": 90,
            "durationMinutes": 60,
            "image": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "serv-manutencao-fibra",
            "name": "Manutenção Periódica de Alongamento em Gel/Fibra",
            "description": "Nivelamento do crescimento, reforço da área de estresse, troca do formato e reaplicação do selante top coat com brilho duradouro.",
            "price": 100,
            "durationMinutes": 90,
            "image": "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-manicure-pedicure",
        "name": "Manicure, Pedicure & Esmaltação em Gel",
        "icon": "✨",
        "products": [
          {
            "id": "serv-manicure-russa",
            "name": "Manicure Russa / Combinada com Cuticulagem Perfeita",
            "description": "Técnica a seco com brocas diamantadas para acabamento milimétrico e duradouro, sem uso de alicate tradicional.",
            "price": 60,
            "durationMinutes": 50,
            "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "serv-esmalte-gel",
            "name": "Esmaltação em Gel com Secagem em Cabine LED/UV",
            "description": "Unhas 100% secas na hora, sem risco de borrar, com brilho espelhado que dura de 15 a 20 dias intacto.",
            "price": 75,
            "durationMinutes": 45,
            "image": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "serv-spa-pes",
            "name": "Spa dos Pés Relaxante com Esfoliação e Hidratação Térmica",
            "description": "Imersão em sais aromáticos, esfoliação com açúcar mascavo e óleos essenciais, massagem relaxante e hidratação profunda.",
            "price": 80,
            "durationMinutes": 60,
            "image": "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      },
      {
        "id": "cat-produtos-nail-care",
        "name": "Produtos de Cuidado & Home Care",
        "icon": "🧴",
        "products": [
          {
            "id": "prod-oleo-cuticulas",
            "name": "Óleo Hidratante de Cutículas com Gotas de Melaleuca 30ml",
            "description": "Fórmula nutritiva enriquecida com vitamina E e óleo de melaleuca. Previne o ressecamento e mantém a esmaltação linda.",
            "price": 28,
            "image": "https://images.unsplash.com/photo-1608248597359-45e076be13df?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-creme-maos-karite",
            "name": "Creme Hidratante para Mãos Manteiga de Karité 50g",
            "description": "Toque aveludado e absorção rápida que não deixa sensação pegajosa, com perfume suave e delicado de rosas.",
            "price": 34.9,
            "image": "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          },
          {
            "id": "prod-esmalte-gel-colecao",
            "name": "Esmalte em Gel Coleção Tons Nude & Rose 10ml",
            "description": "Esmalte profissional de alta pigmentação para cabine LED/UV. Cor suave, sofisticada e de fácil aplicação.",
            "price": 24.5,
            "image": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&auto=format&fit=crop&q=80",
            "isAvailable": true
          }
        ]
      }
    ]
  }
]

async function runSeed() {
  console.log('🌱 Conectando ao PostgreSQL para migração completa dos 10 estabelecimentos...')
  const pool = new Pool({ connectionString: DATABASE_URL })

  try {
    const client = await pool.connect()
    console.log('✅ Conectado ao banco de dados!')

    // 1. Garantir migrações e colunas essenciais
    console.log('🔄 Verificando e aplicando extensões e colunas no schema...')
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)
    await client.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS professionals JSONB;`)
    await client.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS reviews JSONB;`)
    await client.query(`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255);`)
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS duration_minutes INT;`)
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS option_groups JSONB;`)

    let totalCats = 0
    let totalProds = 0

    for (const store of ALL_10_STORES) {
      const tenantId = store.id || `ten-${store.slug}`
      const deliveryFeeCents = Math.round((store.deliveryFee ?? 0) * 100)
      const minOrderValueCents = Math.round((store.minOrderValue ?? 0) * 100)

      // 2. Inserir ou atualizar Tenant
      const tenantRes = await client.query(
        `INSERT INTO tenants (
          id, slug, name, description, logo, banner, phone_whatsapp, address,
          business_category, theme, custom_domain, opening_hours, pix_config,
          delivery_fee_cents, min_order_value_cents, is_active, professionals, reviews, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true, $16, $17, NOW()
        )
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
          store.reviews ? JSON.stringify(store.reviews) : JSON.stringify({})
        ]
      )

      const realTenantId = tenantRes.rows[0]?.id || tenantId

      // 3. Sincronizar Categorias e Produtos
      if (Array.isArray(store.categories)) {
        for (let cIdx = 0; cIdx < store.categories.length; cIdx++) {
          const cat = store.categories[cIdx]
          totalCats++

          await client.query(
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

              await client.query(
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
            }}
        }
      }

      console.log(`✅ [${store.slug}] ${store.name} sincronizado com categorias e produtos.`)
    }

    client.release()
    console.log(`\n🎉 Migração concluída com sucesso!`)
    console.log(`📊 10 Lojas, ${totalCats} Categorias e ${totalProds} Produtos salvos no PostgreSQL.`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro durante a execução do seed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runSeed()
