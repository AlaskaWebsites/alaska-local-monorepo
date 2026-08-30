// utils/whatsapp.ts
import type { Tenant } from '~/types/tenant'
import type { CartState } from '~/types/cart'
import { getTenantPixConfig } from '~/utils/pix'

function formatMoney(value: number): string {
  return `R$ ${value.toFixed(2)}`
}

/**
 * Gera a URL completa para envio de pedido no WhatsApp (wa.me)
 */
export function generateWhatsAppOrderUrl(tenant: Tenant, cart: CartState): string {
  const cleanPhone = (tenant.phoneWhatsApp || '').replace(/\D/g, '')
  const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

  const lines: string[] = []

  // 1. Cabeçalho
  lines.push(`🍔 *NOVO PEDIDO - ${tenant.name.toUpperCase()}*`)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)

  // 2. Itens do Pedido
  lines.push(`📋 *ITENS:*`)
  for (const item of cart.items) {
    const productName = item.product?.name || 'Item'
    const qty = item.quantity || 1
    lines.push(`• *${qty}x* ${productName}`)

    // Opcionais
    const options = (item as any).options || (item as any).selectedOptions || []
    for (const opt of options) {
      const optPrice = opt.price > 0 ? ` (+${formatMoney(opt.price)})` : ''
      lines.push(`  ${opt.name}${optPrice}`)
    }

    // Observação do item
    const obs = (item as any).observation || (item as any).notes || ''
    if (obs) {
      lines.push(`  Obs: "${obs}"`)
    }
  }

  lines.push(``)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)

  // 3. Resumo Financeiro
  lines.push(`💰 *RESUMO FINANCEIRO:*`)
  lines.push(`Subtotal: ${formatMoney(cart.subtotal)}`)

  if (cart.deliveryType === 'delivery') {
    lines.push(`Taxa de Entrega: ${formatMoney(cart.deliveryFee || 0)}`)
    lines.push(`TOTAL: ${formatMoney(cart.total)}`)
  } else {
    lines.push(`TOTAL (RETIRADA): ${formatMoney(cart.total)}`)
  }

  lines.push(``)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)

  // 4. Dados do Cliente
  lines.push(`👤 *CLIENTE:* ${cart.customerName || 'Cliente'}`)
  if (cart.customerPhone) {
    lines.push(`📱 *Telefone:* ${cart.customerPhone}`)
  }

  // 5. Endereço / Entrega
  if (cart.deliveryType === 'delivery') {
    const addr = cart.address || ({} as any)
    const streetNum = `${addr.street || ''}${addr.number ? `, ${addr.number}` : ''}`
    lines.push(`📍 *ENDEREÇO DE ENTREGA:*`)
    if (streetNum.trim()) lines.push(`• ${streetNum}`)
    if (addr.neighborhood) lines.push(`• Bairro: ${addr.neighborhood}`)
    if (addr.complement) lines.push(`• Compl: ${addr.complement}`)
    if (addr.city) lines.push(`• Cidade: ${addr.city}`)
    if (addr.reference) lines.push(`• Ref: ${addr.reference}`)
  } else {
    lines.push(`🏬 *RETIRADA NO BALCÃO:*`)
    lines.push(`• Retirada direta no estabelecimento`)
  }

  lines.push(``)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)

  // 6. Forma de Pagamento
  lines.push(`💳 *FORMA DE PAGAMENTO:*`)
  lines.push(`• ${cart.paymentMethod || 'Pix'}`)

  if (cart.paymentMethod === 'Dinheiro' && (cart as any).changeFor) {
    lines.push(`• Troco para: ${formatMoney((cart as any).changeFor)}`)
  }

  // 7. Bloco Informativo de Pix Direto
  if (cart.paymentMethod === 'Pix') {
    const pixConfig = getTenantPixConfig(tenant)
    if (pixConfig) {
      lines.push(``)
      lines.push(`💠 *DADOS DO PIX:*`)
      lines.push(`• Chave: ${pixConfig.key} (${pixConfig.keyType})`)
      if (pixConfig.beneficiary) {
        lines.push(`• Favorecido: ${pixConfig.beneficiary}`)
      }
      lines.push(`📌 *Por favor, envie o comprovante Pix aqui para confirmação e preparo do pedido.*`)
    }
  }

  lines.push(``)
  lines.push(`_Pedido gerado via Alaska Local_`)

  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${phone}?text=${text}`
}
