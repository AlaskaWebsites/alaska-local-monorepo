<!-- components/storefront/StoreHeaderCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Star, Clock, Calendar, MapPin, Truck, Phone } from 'lucide-vue-next'
import { handleImageError } from '~/utils/images'
import type { Tenant } from '~/types'

const props = defineProps<{
  tenant: Tenant
  isOpen: boolean
  statusText: string
  openingAriaLabel?: string
  isServiceStore?: boolean
  themeClasses: any
}>()

const emit = defineEmits<{
  (e: 'open-reviews'): void
  (e: 'open-info'): void
  (e: 'open-booking'): void
}>()

const instagramUrl = computed(() => {
  const insta = props.tenant?.instagram
  if (!insta) return ''
  const clean = String(insta).trim().replace(/^@/, '')
  if (!clean) return ''
  return clean.startsWith('http') ? clean : `https://instagram.com/${clean}`
})

const instagramHandle = computed(() => {
  const insta = props.tenant?.instagram
  if (!insta) return ''
  const clean = String(insta).trim()
  if (clean.startsWith('http')) {
    const parts = clean.split('/').filter(Boolean)
    return `@${parts[parts.length - 1]}`
  }
  return clean.startsWith('@') ? clean : `@${clean}`
})
</script>

<template>
  <header class="max-w-4xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-10">
    <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 flex flex-col items-center text-center">
      <!-- Logo Flutuante com Fallback -->
      <div class="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white p-1 shadow-md border border-slate-100 shrink-0 overflow-hidden -mt-16 sm:-mt-20 mb-4">
        <img
          v-if="tenant.logo"
          :src="tenant.logo"
          :alt="`Logo de ${tenant.name}`"
          class="w-full h-full object-cover rounded-xl"
          @error="handleImageError($event, tenant?.theme)"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center font-bold text-2xl"
          :class="themeClasses.primaryText"
        >
          {{ tenant.name ? tenant.name.charAt(0) : 'A' }}
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap justify-center mb-1">
        <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {{ tenant.name }}
        </h1>
        <span v-if="tenant.priceRange" class="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {{ tenant.priceRange }}
        </span>
      </div>

      <p v-if="tenant.description" class="text-xs sm:text-sm text-slate-500 max-w-lg mb-4 leading-relaxed">
        {{ tenant.description }}
      </p>

      <!-- Badges e Botões de Prova Social, Status e Tempo de Entrega -->
      <div class="flex items-center gap-2.5 flex-wrap justify-center text-xs font-semibold mb-5">
        <!-- Avaliações iFood-Style -->
        <button
          v-if="tenant.reviews"
          @click="emit('open-reviews')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs hover:bg-amber-100 transition-colors cursor-pointer"
          aria-label="Abrir avaliações da loja"
        >
          <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span class="font-bold">{{ (tenant.reviews?.score || 5).toFixed(1) }}</span>
          <span class="text-slate-500">({{ tenant.reviews?.totalReviews || 0 }})</span>
        </button>

        <!-- Status Aberto/Fechado -->
        <button
          @click="emit('open-info')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs transition-all cursor-pointer"
          :class="isOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80'"
          :aria-label="`${openingAriaLabel || (isOpen ? 'Loja aberta' : 'Loja fechada')}. Clique para ver horários e endereço`"
        >
          <Clock class="w-3.5 h-3.5" aria-hidden="true" />
          <span>{{ statusText }}</span>
        </button>

        <!-- Tempo Estimado de Entrega (Badge) -->
        <div
          v-if="tenant.estimatedTime"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 shadow-2xs text-xs font-bold"
        >
          <Truck class="w-3.5 h-3.5 text-slate-500" />
          <span>{{ tenant.estimatedTime }}</span>
        </div>

        <!-- Botão Agendar Horário em Destaque (Alaska Hub & Pro) -->
        <button
          v-if="isServiceStore"
          @click="emit('open-booking')"
          class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer text-white"
          :class="themeClasses.primaryBg"
          aria-label="Agendar horário de atendimento"
        >
          <Calendar class="w-3.5 h-3.5" />
          <span>Agendar Horário</span>
        </button>
      </div>

      <!-- Meta Informações Rápidas -->
      <div class="w-full pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-slate-600">
        <div v-if="tenant.address" class="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900" @click="emit('open-info')">
          <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span class="truncate">{{ tenant.address }}</span>
        </div>

        <div v-if="tenant.estimatedTime || tenant.deliveryType" class="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900" @click="emit('open-info')">
          <Truck class="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span class="truncate">
            {{ tenant.estimatedTime ? `${tenant.estimatedTime} • ` : '' }}{{ tenant.deliveryType || 'Delivery' }}
          </span>
        </div>

        <div v-if="tenant.openingHours" class="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900" @click="emit('open-info')">
          <Clock class="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{{ tenant.openingHours.open }} às {{ tenant.openingHours.close }}</span>
        </div>

        <div class="flex items-center justify-center gap-3">
          <!-- WhatsApp Link -->
          <a
            v-if="tenant.phoneWhatsApp || tenant.whatsapp"
            :href="`https://wa.me/55${(tenant.phoneWhatsApp || tenant.whatsapp || '').replace(/\\D/g, '')}`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
          >
            <Phone class="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <!-- Instagram Link -->
          <a
            v-if="instagramUrl"
            :href="instagramUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            :title="`Instagram ${instagramHandle}`"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            <span>Instagram</span>
          </a>
        </div>
      </div>
    </div>
  </header>
</template>
