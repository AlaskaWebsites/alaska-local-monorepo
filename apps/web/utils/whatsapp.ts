// utils/whatsapp.ts
import type { Tenant } from '~/types/tenant'
import type { CartState } from '~/types/cart'
import { getTenantPixConfig } from '~/utils/pix'

function formatMoney(value: number): string {
  return `R$ ${(value || 0).toFixed(2)}`
}

export interface GenerateWhatsAppOrderOptions {
  tenant?: Tenant | null
  cart?: CartState
  items?: any[]
  form?: any
  subtotal?: number
  deliveryFee?: number
  total?: number
  pixPayload?: string
  customerName?: string
  customerPhone?: string
  deliveryType?: 'delivery' | 'pickup'
  address?: any
  paymentMethod?: string
  changeFor?: number
}

/**
 * Gera a URL completa para envio de pedido no WhatsApp (wa.me)
 * Suporta tanto a assinatura (tenant, cart) quanto a assinatura via objeto de opções { tenant, items, form, ... }
 */
export function generateWhatsAppOrderUrl(
  tenantOrOptions: Tenant | GenerateWhatsAppOrderOptions,
  maybeCart?: CartState
): string {
  let tenant: Tenant | null | undefined
  let cart: Partial<CartState> & Record<string, any>
  let pixPayloadParam: string | undefined

  if (maybeCart !== undefined) {
    tenant = tenantOrOptions as Tenant
    cart = maybeCart
  } else if (tenantOrOptions && typeof tenantOrOptions === 'object' && 'tenant' in tenantOrOptions) {
    const opts = tenantOrOptions as GenerateWhatsAppOrderOptions
    tenant = opts.tenant
    pixPayloadParam = opts.pixPayload

    if (opts.cart) {
      cart = opts.cart
    } else {
      const form = opts.form || {}
      cart = {
        items: opts.items || [],
        subtotal: opts.subtotal ?? 0,
        deliveryFee: opts.deliveryFee ?? 0,
        total: opts.total ?? (opts.subtotal ?? 0) + (opts.deliveryFee ?? 0),
        deliveryType: form.deliveryType || opts.deliveryType || 'delivery',
        customerName: form.customerName || opts.customerName || '',
        customerPhone: form.customerPhone || opts.customerPhone || '',
        address: form.address || opts.address || {},
        paymentMethod: form.paymentMethod || opts.paymentMethod || 'Pix',
        changeFor: form.changeFor || opts.changeFor,
      }
    }
  } else {
    tenant = tenantOrOptions as Tenant
    cart = {}
  }

  const rawPhone = tenant?.phoneWhatsApp || tenant?.whatsapp || ''
  const cleanPhone = rawPhone.replace(/\D/g, '')
  const phone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

  const tenantName = (tenant?.name || 'ESTABELECIMENTO').toUpperCase()

  const lines: string[] = []

  // 1. Cabeçalho
  lines.push(`🍔 *NOVO PEDIDO - ${tenantName}*`)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)

  // 2. Itens do Pedido
  lines.push(`📋 *ITENS:*`)
  const itemsList = cart.items || []
  for (const item of itemsList) {
    const productName = item.product?.name || item.name || 'Item'
    const qty = item.quantity || 1
    lines.push(`• *${qty}x* ${productName}`)

    // Opcionais
    const options = (item as any).options || (item as any).selectedOptions || []
    for (const opt of options) {
      const optPrice = (opt.price && opt.price > 0) ? ` (+${formatMoney(opt.price)})` : ''
      lines.push(`  ${opt.name}${optPrice}`)
    }

    // Observação do item
    const obs = (item as any).observation || (item as any).notes || (item as any).observations || ''
    if (obs) {
      lines.push(`  Obs: "${obs}"`)
    }
  }

  lines.push(``)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)

  // 3. Resumo Financeiro
  lines.push(`💰 *RESUMO FINANCEIRO:*`)
  lines.push(`Subtotal: ${formatMoney(cart.subtotal || 0)}`)

  if (cart.deliveryType === 'delivery') {
    lines.push(`Taxa de Entrega: ${formatMoney(cart.deliveryFee || 0)}`)
    lines.push(`TOTAL: ${formatMoney(cart.total || 0)}`)
  } else {
    lines.push(`TOTAL (RETIRADA): ${formatMoney(cart.total || 0)}`)
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
    const pixConfig = tenant ? getTenantPixConfig(tenant) : null
    if (pixConfig || pixPayloadParam) {
      lines.push(``)
      lines.push(`💠 *DADOS DO PIX:*`)
      if (pixConfig?.key) {
        lines.push(`• Chave: ${pixConfig.key} (${pixConfig.keyType})`)
      }
      if (pixConfig?.beneficiary) {
        lines.push(`• Favorecido: ${pixConfig.beneficiary}`)
      }
      if (pixPayloadParam) {
        lines.push(`• Copia e Cola: ${pixPayloadParam}`)
      }
      lines.push(`📌 *Por favor, envie o comprovante Pix aqui para confirmação e preparo do pedido.*`)
    }
  }

  lines.push(``)
  lines.push(`_Pedido gerado via Alaska Local_`)

  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${phone}?text=${text}`
}
