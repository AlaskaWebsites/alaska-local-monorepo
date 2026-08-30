// utils/images.ts

export type ImageCategory = 'food' | 'barber' | 'health' | 'drinks' | 'shop' | 'general'

export interface ThemeSvgConfig {
  bgStart: string
  bgEnd: string
  accentColor: string
  accentSoft: string
  textColor: string
  label: string
  iconPath: string
}

/**
 * Paleta de cores, gradientes e ícones vetoriais por tema do Alaska Local
 */
export const THEME_SVG_CONFIGS: Record<ImageCategory, ThemeSvgConfig> = {
  food: {
    bgStart: '#1c1917',
    bgEnd: '#291515',
    accentColor: '#ef4444',
    accentSoft: 'rgba(239, 68, 68, 0.15)',
    textColor: '#fca5a5',
    label: 'Gastronomia & Delivery',
    iconPath: 'M12 2v20M17 5v6a3 3 0 0 1-6 0V5M7 2v20',
  },
  barber: {
    bgStart: '#18181b',
    bgEnd: '#272015',
    accentColor: '#f59e0b',
    accentSoft: 'rgba(245, 158, 11, 0.15)',
    textColor: '#fde68a',
    label: 'Barbearia & Estética',
    iconPath: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 0l6 6m6-6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 0l-6 6m-3 3l9 9m-9 0l9-9',
  },
  health: {
    bgStart: '#0f172a',
    bgEnd: '#0f2928',
    accentColor: '#0d9488',
    accentSoft: 'rgba(13, 148, 136, 0.15)',
    textColor: '#99f6e4',
    label: 'Saúde & Cuidados',
    iconPath: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  },
  drinks: {
    bgStart: '#181226',
    bgEnd: '#241438',
    accentColor: '#a855f7',
    accentSoft: 'rgba(168, 85, 247, 0.15)',
    textColor: '#e9d5ff',
    label: 'Adegas & Bebidas',
    iconPath: 'M8 22h8M12 15v7M8 2h8l3 9a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6Z',
  },
  shop: {
    bgStart: '#1f1622',
    bgEnd: '#2b1626',
    accentColor: '#f43f5e',
    accentSoft: 'rgba(244, 63, 94, 0.15)',
    textColor: '#fecdd3',
    label: 'Moda & Boutique',
    iconPath: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0',
  },
  general: {
    bgStart: '#0f172a',
    bgEnd: '#1e293b',
    accentColor: '#64748b',
    accentSoft: 'rgba(100, 116, 139, 0.15)',
    textColor: '#cbd5e1',
    label: 'Alaska Local',
    iconPath: 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7m4 0h6m-3-3v6M9 11l3 3 4.5-4.5L21 14',
  },
}

/**
 * Normaliza qualquer tema, categoria ou template para a categoria canônica de imagem
 */
export function normalizeImageCategory(categoryOrTheme?: string | null): ImageCategory {
  if (!categoryOrTheme) return 'general'
  const c = String(categoryOrTheme).toLowerCase().trim()
  if (['food', 'menu', 'restaurant', 'lanches', 'pizzaria', 'delivery', 'burger'].includes(c)) return 'food'
  if (['barber', 'hub', 'salao', 'cabelo', 'barbearia', 'servico', 'servicos'].includes(c)) return 'barber'
  if (['health', 'pro', 'odonto', 'clinica', 'medico', 'saude', 'dentista'].includes(c)) return 'health'
  if (['drinks', 'adega', 'vinho', 'cerveja', 'bebidas', 'distribuidora'].includes(c)) return 'drinks'
  if (['shop', 'loja', 'moda', 'boutique', 'semijoias', 'calcados'].includes(c)) return 'shop'
  if (c in THEME_SVG_CONFIGS) return c as ImageCategory
  return 'general'
}

/**
 * Gera um placeholder SVG vetorial elegante estilizado na paleta do tema.
 * Retornado como Data URI inline (sem dependência de rede, 100% à prova de 404).
 */
export function getFallbackSvgDataUri(categoryOrTheme?: string | null, width = 600, height = 600): string {
  const category = normalizeImageCategory(categoryOrTheme)
  const config = THEME_SVG_CONFIGS[category] || THEME_SVG_CONFIGS.general

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 600 600" fill="none">
  <defs>
    <radialGradient id="bgGlow-${category}" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="${config.accentColor}" stop-opacity="0.25" />
      <stop offset="60%" stop-color="${config.bgEnd}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${config.bgStart}" />
    </radialGradient>
    <filter id="glow-${category}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <!-- Fundo com Gradiente Temático -->
  <rect width="600" height="600" fill="url(#bgGlow-${category})" />
  
  <!-- Padrão Sutil de Grid Geométrica -->
  <g opacity="0.04" stroke="#ffffff" stroke-width="1">
    <path d="M0 100h600M0 200h600M0 300h600M0 400h600M0 500h600" />
    <path d="M100 0v600M200 0v600M300 0v600M400 0v600M500 0v600" />
  </g>
  
  <!-- Moldura Central do Ícone -->
  <circle cx="300" cy="270" r="70" fill="${config.accentSoft}" stroke="${config.accentColor}" stroke-width="2" stroke-opacity="0.4" />
  
  <!-- Ícone Vetorial Central -->
  <g transform="translate(265, 235) scale(2.9)" stroke="${config.accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#glow-${category})">
    <path d="${config.iconPath}" />
  </g>
  
  <!-- Tipografia e Identidade -->
  <text x="300" y="390" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="${config.textColor}" letter-spacing="0.5">
    ${config.label}
  </text>
  <text x="300" y="420" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" letter-spacing="1.5" text-transform="uppercase" opacity="0.7">
    Alaska Local
  </text>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/**
 * Retorna a URL de fallback adequada para a categoria ou tema fornecido.
 */
export function getFallbackImageUrl(categoryOrTheme?: string | null): string {
  return getFallbackSvgDataUri(categoryOrTheme)
}

/**
 * Manipulador de erro para tags <img> nativas (@error).
 * Substitui o src que falhou pelo placeholder SVG elegante estilizado na paleta do tema.
 * Previne loops infinitos marcando o elemento no dataset.
 */
export function handleImageError(
  event: Event,
  categoryOrTheme?: string | null,
  customFallbackUrl?: string
): void {
  const target = event?.target as HTMLImageElement | null
  if (!target) return

  // Previne loop infinito caso a própria imagem de fallback também falhe
  if (target.dataset && target.dataset.hasFallbackError === 'true') {
    return
  }

  const fallbackUrl = customFallbackUrl || getFallbackImageUrl(categoryOrTheme)

  if (target.src !== fallbackUrl) {
    if (target.dataset) {
      target.dataset.hasFallbackError = 'true'
    }
    target.src = fallbackUrl
  }
}
