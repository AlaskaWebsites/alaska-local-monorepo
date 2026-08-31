<!-- components/ProductCustomizerModal.vue -->
<script setup lang="ts">
import { ref, computed, toRef, watch, onMounted, onUnmounted } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { formatCurrency } from '~/utils/formatters'
import { handleImageError } from '~/utils/images'
import { useHaptic } from '~/composables/useHaptic'
import { useMerchantAdmin } from '~/composables/useMerchantAdmin'
import { X, Plus, Minus, Check } from 'lucide-vue-next'
import type { Product, Tenant } from '~/types/tenant'
import type { CartItem } from '~/types/cart'

const props = defineProps<{
  product: Product
  isOpen: boolean
  tenant?: Tenant
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add-to-cart', item: CartItem): void
}>()

const { triggerHaptic } = useHaptic()
const { getOverrides } = useMerchantAdmin(props.tenant?.slug || 'default')

// 1. Tema Dinâmico
const { themeClasses } = useTenantTheme(toRef(props, 'tenant'))

// 2. Trava de Rolagem
useBodyScrollLock(toRef(props, 'isOpen'))

// 3. Fechamento ESC
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('keydown', handleKeyDown)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', handleKeyDown)
  }
})

// 4. Overrides de Opcionais Pausados (Estoque em Tempo Real)
const pausedOptionIds = computed<string[]>(() => {
  const ov = getOverrides()
  return ov.pausedOptionIds || []
})

function isOptionPaused(optionId: string): boolean {
  return pausedOptionIds.value.includes(optionId)
}

// 5. Estado do Formulário de Customização
const quantity = ref(1)
const observation = ref('')
const selectedOptions = ref<Record<string, string[]>>({})

// Reseta o estado quando o produto mudar ou abrir o modal
watch(
  () => props.product,
  (newProd) => {
    quantity.value = 1
    observation.value = ''
    selectedOptions.value = {}

    if (newProd?.optionGroups) {
      newProd.optionGroups.forEach(group => {
        selectedOptions.value[group.id] = []
      })
    }
  },
  { immediate: true }
)

function isOptionSelected(groupId: string, optionId: string): boolean {
  return (selectedOptions.value[groupId] || []).includes(optionId)
}

function toggleOption(group: any, option: any) {
  if (isOptionPaused(option.id)) {
    return // Bloqueia seleção de opcional esgotado
  }

  triggerHaptic(20)
  const current = selectedOptions.value[group.id] || []
  const max = group.max || 1

  if (max === 1) {
    // Escolha única (Radio-like)
    if (current.includes(option.id)) {
      if (!group.required) {
        selectedOptions.value[group.id] = []
      }
    } else {
      selectedOptions.value[group.id] = [option.id]
    }
  } else {
    // Escolha múltipla (Checkbox-like)
    if (current.includes(option.id)) {
      selectedOptions.value[group.id] = current.filter(id => id !== option.id)
    } else {
      if (current.length < max) {
        selectedOptions.value[group.id] = [...current, option.id]
      }
    }
  }
}

// 6. Validação de Grupos Obrigatórios
const isValid = computed(() => {
  if (!props.product?.optionGroups) return true
  for (const group of props.product.optionGroups) {
    const count = (selectedOptions.value[group.id] || []).length
    const min = group.min !== undefined ? group.min : (group.required ? 1 : 0)
    if (count < min) return false
    if (group.max && count > group.max) return false
  }
  return true
})

// 7. Cálculo do Preço Total do Item Customizado
const unitPrice = computed(() => {
  let total = Number(props.product?.price || 0)
  if (!props.product?.optionGroups) return total

  props.product.optionGroups.forEach(group => {
    const selectedIds = selectedOptions.value[group.id] || []
    group.options.forEach(opt => {
      if (selectedIds.includes(opt.id) && !isOptionPaused(opt.id)) {
        total += Number(opt.price || 0)
      }
    })
  })

  return total
})

const totalPrice = computed(() => unitPrice.value * quantity.value)

function incrementQuantity() {
  triggerHaptic(15)
  quantity.value++
}

function decrementQuantity() {
  if (quantity.value > 1) {
    triggerHaptic(15)
    quantity.value--
  }
}

// 8. Adicionar à Sacola
function handleAddToCart() {
  if (!isValid.value) return

  triggerHaptic(40)

  // Extrai lista plana de opções selecionadas
  const flattenedOptions: any[] = []
  if (props.product?.optionGroups) {
    props.product.optionGroups.forEach(group => {
      const selectedIds = selectedOptions.value[group.id] || []
      group.options.forEach(opt => {
        if (selectedIds.includes(opt.id) && !isOptionPaused(opt.id)) {
          flattenedOptions.push({
            id: opt.id,
            name: opt.name,
            price: opt.price || 0,
            groupTitle: group.title
          })
        }
      })
    })
  }

  const cartItem: CartItem = {
    id: `${props.product.id}-${Date.now()}`,
    product: props.product,
    quantity: quantity.value,
    selectedOptions: flattenedOptions,
    options: flattenedOptions,
    observation: observation.value.trim() || undefined,
    notes: observation.value.trim() || undefined,
    unitPrice: unitPrice.value
  }

  emit('add-to-cart', cartItem)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      @click="emit('close')"
    >
      <div
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`product-customizer-title-${product.id}`"
        class="bg-white text-slate-800 w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg flex flex-col overflow-hidden sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-2xl"
        @click.stop
      >
        <!-- Header Fixo no Topo -->
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div class="min-w-0 flex-1 pr-3">
            <h2 :id="`product-customizer-title-${product.id}`" class="text-base sm:text-lg font-extrabold text-slate-900 truncate">
              {{ product.name }}
            </h2>
            <p class="text-xs font-mono font-bold" :class="themeClasses.primaryText">
              {{ formatCurrency(product.price) }}
            </p>
          </div>
          <button
            @click="emit('close')"
            class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar modal de customização"
          >
            <X class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <!-- Conteúdo com Rolagem Suave -->
        <div class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-6">
          <!-- Imagem e Descrição -->
          <div v-if="product.image || product.description" class="space-y-3">
            <div v-if="product.image" class="w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
              <img
                :src="product.image"
                :alt="product.name"
                class="w-full h-full object-cover"
                @error="handleImageError($event, tenant?.theme)"
              />
            </div>
            <p v-if="product.description" class="text-xs text-slate-600 leading-relaxed">
              {{ product.description }}
            </p>
          </div>

          <!-- Grupos de Opcionais e Adicionais -->
          <div v-if="product.optionGroups && product.optionGroups.length > 0" class="space-y-6">
            <div
              v-for="group in product.optionGroups"
              :key="group.id"
              class="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/50 space-y-3"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{{ group.title }}</span>
                    <span
                      v-if="group.required"
                      class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-amber-100 text-amber-800"
                    >
                      Obrigatório
                    </span>
                  </h3>
                  <p class="text-[10px] text-slate-500 mt-0.5">
                    {{ group.max === 1 ? 'Escolha 1 opção' : `Escolha até ${group.max} opções` }}
                  </p>
                </div>
              </div>

              <!-- Lista de Opções -->
              <div class="space-y-2 pt-1">
                <div
                  v-for="opt in group.options"
                  :key="opt.id"
                  @click="toggleOption(group, opt)"
                  class="p-3 rounded-xl border transition-all flex items-center justify-between select-none"
                  :class="[
                    isOptionPaused(opt.id)
                      ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                      : isOptionSelected(group.id, opt.id)
                        ? 'bg-emerald-50 border-emerald-300 text-slate-900 shadow-2xs cursor-pointer'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 cursor-pointer'
                  ]"
                >
                  <div class="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div
                      class="w-4 h-4 rounded-md flex items-center justify-center border text-[10px] transition-colors"
                      :class="[
                        group.max === 1 ? 'rounded-full' : 'rounded-md',
                        isOptionPaused(opt.id)
                          ? 'border-slate-300 bg-slate-200'
                          : isOptionSelected(group.id, opt.id)
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                      ]"
                    >
                      <Check v-if="isOptionSelected(group.id, opt.id) && !isOptionPaused(opt.id)" class="w-3 h-3 stroke-[3]" />
                    </div>

                    <span class="text-xs font-semibold truncate" :class="{ 'line-through': isOptionPaused(opt.id) }">
                      {{ opt.name }}
                    </span>

                    <span
                      v-if="isOptionPaused(opt.id)"
                      class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-rose-100 text-rose-700 ml-1 shrink-0"
                    >
                      Esgotado
                    </span>
                  </div>

                  <span v-if="opt.price > 0 && !isOptionPaused(opt.id)" class="text-xs font-mono font-bold text-slate-600 shrink-0">
                    + {{ formatCurrency(opt.price) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Campo de Observações do Item -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-800">
              Observações do item:
            </label>
            <textarea
              v-model="observation"
              rows="2"
              placeholder="Ex: Tirar cebola, maionese à parte, ponto bem passado..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition-all leading-relaxed"
            ></textarea>
          </div>
        </div>

        <!-- Rodapé Fixo com Quantidade e Botão Adicionar -->
        <div class="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              @click="decrementQuantity"
              :disabled="quantity <= 1"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Diminuir quantidade"
            >
              <Minus class="w-3.5 h-3.5" />
            </button>
            <span class="w-6 text-center font-bold text-sm text-slate-900 font-mono">
              {{ quantity }}
            </span>
            <button
              @click="incrementQuantity"
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Aumentar quantidade"
            >
              <Plus class="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            @click="handleAddToCart"
            :disabled="!isValid"
            class="flex-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-between shadow-lg active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>Adicionar</span>
            <span class="font-mono font-extrabold text-amber-400">
              {{ formatCurrency(totalPrice) }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
