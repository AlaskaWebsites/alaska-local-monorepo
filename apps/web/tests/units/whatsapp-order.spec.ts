// tests/unit/whatsapp-order.spec.ts
import { describe, it, expect } from 'vitest'

describe('Motor de Pedidos e Despacho no WhatsApp (utils/whatsapp)', () => {
    // Helper para limpar e formatar o número do WhatsApp
    const formatPhone = (phone: string): string => {
        const cleanNumber = phone.replace(/\D/g, '')
        return cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`
    }

    // Interface mockada para o item do pedido
    interface MockOrderItem {
        name: string
        quantity: number
        unitPrice: number
        selectedOptions?: { name: string; price: number }[]
        observation?: string
    }

    interface MockOrderPayload {
        tenantName: string
        phoneWhatsApp: string
        customerName: string
        deliveryType: 'delivery' | 'pickup'
        address?: { street: string; number: string; neighborhood: string }
        deliveryFee: number
        paymentMethod: string
        changeFor?: number
        items: MockOrderItem[]
    }

    // Função pura que gera a mensagem e o link do WhatsApp
    const buildWhatsAppMessage = (data: MockOrderPayload): { text: string; url: string } => {
        const lines: string[] = []
        lines.push(`🍔 *NOVO PEDIDO - ${data.tenantName.toUpperCase()}*`)
        lines.push('━━━━━━━━━━━━━━━━━━━━━')

        let subtotal = 0

        data.items.forEach((item) => {
            let itemPrice = item.unitPrice
            if (item.selectedOptions) {
                item.selectedOptions.forEach((opt) => {
                    itemPrice += opt.price
                })
            }
            const itemTotal = itemPrice * item.quantity
            subtotal += itemTotal

            lines.push(`*${item.quantity}x* ${item.name} — *R$ ${itemTotal.toFixed(2)}*`)
            if (item.selectedOptions && item.selectedOptions.length > 0) {
                item.selectedOptions.forEach((opt) => {
                    const priceText = opt.price > 0 ? ` (+R$ ${opt.price.toFixed(2)})` : ''
                    lines.push(`   └ _${opt.name}${priceText}_`)
                })
            }
            if (item.observation) {
                lines.push(`   └ 💬 _Obs: "${item.observation}"_`)
            }
            lines.push('')
        })

        lines.push('━━━━━━━━━━━━━━━━━━━━━')
        lines.push(`Subtotal: R$ ${subtotal.toFixed(2)}`)

        const fee = data.deliveryType === 'delivery' ? data.deliveryFee : 0
        const total = subtotal + fee

        if (data.deliveryType === 'delivery' && data.address) {
            lines.push(`Taxa de Entrega: R$ ${fee.toFixed(2)}`)
            lines.push(`*TOTAL: R$ ${total.toFixed(2)}*`)
            lines.push('━━━━━━━━━━━━━━━━━━━━━')
            lines.push('📍 *DADOS DE ENTREGA:*')
            lines.push(`• Nome: ${data.customerName}`)
            lines.push(`• Endereço: ${data.address.street}, ${data.address.number} - ${data.address.neighborhood}`)
        } else {
            lines.push(`*TOTAL (RETIRADA): R$ ${total.toFixed(2)}*`)
            lines.push('━━━━━━━━━━━━━━━━━━━━━')
            lines.push('🛍️ *RETIRADA NO BALCÃO:*')
            lines.push(`• Nome: ${data.customerName}`)
        }

        lines.push('━━━━━━━━━━━━━━━━━━━━━')
        lines.push(`💳 *FORMA DE PAGAMENTO:*`)
        lines.push(`• ${data.paymentMethod}`)
        if (data.paymentMethod === 'Dinheiro' && data.changeFor) {
            lines.push(`• Troco para: R$ ${data.changeFor.toFixed(2)}`)
        }

        const message = lines.join('\n')
        const cleanPhone = formatPhone(data.phoneWhatsApp)
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`

        return { text: message, url }
    }

    it('deve formatar corretamente o número de telefone removendo máscaras', () => {
        expect(formatPhone('(11) 99999-9999')).toBe('5511999999999') // Adicionado o 9º dígito
        expect(formatPhone('11 98888 7777')).toBe('5511988887777')
        expect(formatPhone('5511999999999')).toBe('5511999999999')
    })

    it('deve montar o pedido de delivery somando os adicionais e a taxa de entrega', () => {
        const payload: MockOrderPayload = {
            tenantName: 'Hamburgueria X',
            phoneWhatsApp: '(11) 99999-9999',
            customerName: 'Danilo Gozzi',
            deliveryType: 'delivery',
            deliveryFee: 5.0,
            paymentMethod: 'Pix',
            address: {
                street: 'Rua das Flores',
                number: '100',
                neighborhood: 'Centro',
            },
            items: [
                {
                    name: 'X-Burger Clássico',
                    quantity: 2,
                    unitPrice: 25.0,
                    selectedOptions: [{ name: 'Bacon Extra', price: 4.0 }],
                    observation: 'Sem cebola',
                },
            ],
        }

        const result = buildWhatsAppMessage(payload)

        // Subtotal: 2x (25 + 4) = 58.00 | Total: 58.00 + 5.00 (taxa) = 63.00
        expect(result.text).toContain('Subtotal: R$ 58.00')
        expect(result.text).toContain('*TOTAL: R$ 63.00*')
        expect(result.text).toContain('Bacon Extra (+R$ 4.00)')
        expect(result.text).toContain('Obs: "Sem cebola"')
        expect(result.text).toContain('Rua das Flores, 100 - Centro')
        expect(result.url).toContain('https://wa.me/551199999999')
    })

    it('deve montar o pedido de retirada sem cobrar taxa de entrega', () => {
        const payload: MockOrderPayload = {
            tenantName: 'Espetaria Brasa Nobre',
            phoneWhatsApp: '11999999999',
            customerName: 'Carlos Silva',
            deliveryType: 'pickup',
            deliveryFee: 6.0, // Deve ser ignorada no balcão
            paymentMethod: 'Cartão de Crédito',
            items: [
                {
                    name: 'Jantinha Tradicional',
                    quantity: 1,
                    unitPrice: 27.9,
                },
            ],
        }

        const result = buildWhatsAppMessage(payload)

        expect(result.text).toContain('RETIRADA NO BALCÃO')
        expect(result.text).not.toContain('Taxa de Entrega')
        expect(result.text).toContain('*TOTAL (RETIRADA): R$ 27.90*')
    })

    it('deve incluir o valor do troco caso o pagamento seja em Dinheiro', () => {
        const payload: MockOrderPayload = {
            tenantName: 'Hamburgueria X',
            phoneWhatsApp: '11999999999',
            customerName: 'Aline',
            deliveryType: 'pickup',
            deliveryFee: 0,
            paymentMethod: 'Dinheiro',
            changeFor: 50.0,
            items: [{ name: 'Lanche', quantity: 1, unitPrice: 30.0 }],
        }

        const result = buildWhatsAppMessage(payload)

        expect(result.text).toContain('• Dinheiro')
        expect(result.text).toContain('• Troco para: R$ 50.00')
    })
})