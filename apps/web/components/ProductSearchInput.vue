<!-- components/ProductSearchInput.vue -->
<template>
    <div class="w-full" role="search" aria-label="Buscar produtos no cardápio ou catálogo">
        <div class="relative flex items-center">
            <!-- Ícone de Busca -->
            <div class="absolute left-3.5 pointer-events-none text-slate-400 flex items-center justify-center"
                aria-hidden="true">
                <Search class="w-4 h-4" />
            </div>

            <!-- Input de Busca -->
            <input :value="modelValue"
                @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" type="text"
                :placeholder="placeholder || 'Buscar no cardápio / catálogo...'"
                class="w-full pl-10 pr-10 py-2.5 bg-white rounded-2xl border border-slate-200 text-slate-900 text-xs font-medium placeholder:text-slate-400 shadow-2xs focus:outline-none transition-all"
                :class="themeClasses.focusRing" aria-label="Campo de busca de produtos" />

            <!-- Botão Limpar Busca (quando há texto) -->
            <button v-if="modelValue" @click="emit('clear')"
                class="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Limpar termo de busca" title="Limpar busca">
                <X class="w-3.5 h-3.5" aria-hidden="true" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { useTenantTheme } from '~/composables/useTenantTheme'
import type { TenantTheme } from '~/types'

const props = defineProps<{
    modelValue: string
    placeholder?: string
    theme?: TenantTheme
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'clear'): void
}>()

const { themeClasses } = useTenantTheme(computed(() => props.theme))
</script>
