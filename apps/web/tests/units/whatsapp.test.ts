// tests/units/whatsapp.test.ts
import { describe, it, expect } from 'vitest'
import { generateWhatsAppOrderUrl } from '~/utils/whatsapp'
import { TenantSchema, ProductSchema } from '~/types/tenant'
import type { CartState } from '~/types/cart'

describe('Unit: Gerador de Pedidos WhatsApp (utils/whatsapp.ts)', () => {
    // Zod preenche todos os defaults automaticamente
    const baseTenant = TenantSchema.parse({
        slug: 'hamburgueria-teste',
        name: 'Hamburgueria Teste',
        phoneWhatsApp: '11999998888',
        currency: 'R$',
        deliveryFee: 6.0,
        minOrderValue: 20.0,
        categories: []
    })

    const baseProduct = ProductSchema.parse({
        id: 'p1',
        name: 'Burger Duplo Angus',
        price: 32.0,
        available: true,
        optionGroups: []
    })

    const baseCart: CartState = {
        items: [
            {
                product: baseProduct,
                quantity: 2,
                unitPrice: 32.0,
                selectedOptions: [
                    { id: 'o1', name: 'Ponto da Carne: Ao Ponto', price: 0, maxQuantity: 1 },
                    { id: 'o2', name: 'Bacon Extra', price: 5.0, maxQuantity: 2 }
                ],
                observation: 'Sem picles por favor'
            }
        ],
        deliveryType: 'delivery',
        deliveryFee: 6.0,
        customerName: 'Danilo Santos',
        address: {
            street: 'Av. Paulista',
            number: '1000',
            neighborhood: 'Bela Vista',
            complement: 'Apto 42'
        },
        paymentMethod: 'Pix',
        changeFor: null,
        subtotal: 64.0,
        total: 70.0
    }

    it('deve gerar a URL com o número sanitizado e prefixo 55', () => {
        const url = generateWhatsAppOrderUrl(baseTenant, baseCart)
        expect(url.startsWith('https://wa.me/5511999998888?text=')).toBe(true)
    })

    it('deve formatar o pedido de Delivery com dados completos de endereço e taxa', () => {
        const url = generateWhatsAppOrderUrl(baseTenant, baseCart)
        const decodedText = decodeURIComponent(url)

        expect(decodedText).toContain('NOVO PEDIDO - HAMBURGUERIA TESTE')
        expect(decodedText).toContain('*2x* Burger Duplo Angus')
        expect(decodedText).toContain('Ponto da Carne: Ao Ponto')
        expect(decodedText).toContain('Bacon Extra (+R$ 5.00)')
        expect(decodedText).toContain('Obs: "Sem picles por favor"')
        expect(decodedText).toContain('Subtotal: R$ 64.00')
        expect(decodedText).toContain('Taxa de Entrega: R$ 6.00')
        expect(decodedText).toContain('TOTAL: R$ 70.00')
        expect(decodedText).toContain('Danilo Santos')
        expect(decodedText).toContain('Av. Paulista, 1000')
        expect(decodedText).toContain('Compl: Apto 42')
        expect(decodedText).toContain('Bairro: Bela Vista')
        expect(decodedText).toContain('Pix')
    })

    it('deve formatar o pedido de Retirada no Balcão sem taxa e sem endereço', () => {
        const pickupCart: CartState = {
            ...baseCart,
            deliveryType: 'pickup',
            deliveryFee: 0,
            total: 64.0
        }

        const url = generateWhatsAppOrderUrl(baseTenant, pickupCart)
        const decodedText = decodeURIComponent(url)

        expect(decodedText).toContain('TOTAL (RETIRADA): R$ 64.00')
        expect(decodedText).toContain('RETIRADA NO BALCÃO:')
        expect(decodedText).not.toContain('DADOS DE ENTREGA:')
        expect(decodedText).not.toContain('Taxa de Entrega:')
    })

    it('deve incluir o valor do troco quando a forma de pagamento for Dinheiro', () => {
        const cashCart: CartState = {
            ...baseCart,
            paymentMethod: 'Dinheiro',
            changeFor: 100.0
        }

        const url = generateWhatsAppOrderUrl(baseTenant, cashCart)
        const decodedText = decodeURIComponent(url)

        expect(decodedText).toContain('FORMA DE PAGAMENTO:')
        expect(decodedText).toContain('Dinheiro')
        expect(decodedText).toContain('Troco para: R$ 100.00')
    })
})