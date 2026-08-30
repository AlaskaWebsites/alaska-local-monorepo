<!-- components/ProductCustomizerModal.vue -->
<script setup lang="ts">
import { ref, computed, toRef, watch, onMounted, onUnmounted } from 'vue'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { formatCurrency } from '~/utils/formatters'
import { handleImageError } from '~/utils/images'
import { X, Star, Plus, Minus, Check, AlertCircle } from 'lucide-vue-next'
import type { Tenant, Product, OptionGroup, Option, CartItem } from '~/types'

const props = defineProps<{
    product: Product | null
    tenant: Tenant
    isOpen: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'add-to-cart', payload: CartItem): void
}>()

// 1. Tema Dinâmico
const { themeClasses } = useTenantTheme(toRef(props, 'tenant'))

// 2. Trava de Scroll e Acessibilidade ESC
useBodyScrollLock(toRef(props, 'isOpen'))

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

// 3. Estado Interno de Customização
const selectedOptions = ref<Map<string, Option[]>>(new Map())
const productObservation = ref('')
const productQuantity = ref(1)

// Reinicia o estado quando abre um novo produto
watch(
    () => props.product,
    (newProduct) => {
        if (newProduct) {
            selectedOptions.value = new Map()
            productObservation.value = ''
            productQuantity.value = 1

            // Auto-seleciona a primeira opção de grupos obrigatórios com 1 opção
            newProduct.optionGroups?.forEach((group) => {
                const firstOption = group.options.at(0)
                if (group.required && group.max === 1 && firstOption) {
                    selectedOptions.value.set(group.id, [firstOption])
                }
            })
        }
    },
    { immediate: true }
)

// 4. Helpers de Validação e Seleção
function isGroupValid(group: OptionGroup): boolean {
    const selected = selectedOptions.value.get(group.id) || []
    if (group.required) {
        return selected.length >= (group.min || 1)
    }
    return true
}

function getSelectedCountInGroup(groupId: string): number {
    return (selectedOptions.value.get(groupId) || []).length
}

function isOptionSelected(groupId: string, optionId: string): boolean {
    const options = selectedOptions.value.get(groupId) || []
    return options.some((o) => o.id === optionId)
}

function toggleOption(group: OptionGroup, option: Option) {
    const current = selectedOptions.value.get(group.id) || []
    const exists = current.some((o) => o.id === option.id)

    if (group.max === 1) {
        selectedOptions.value.set(group.id, [option])
    } else {
        if (exists) {
            selectedOptions.value.set(group.id, current.filter((o) => o.id !== option.id))
        } else if (current.length < group.max) {
            selectedOptions.value.set(group.id, [...current, option])
        }
    }
}

function calculateProductTotal(): number {
    if (!props.product) return 0
    let total = props.product.price
    selectedOptions.value.forEach((options) => {
        options.forEach((opt) => {
            total += opt.price
        })
    })
    return total
}

const isProductConfigValid = computed(() => {
    if (!props.product) return false
    for (const group of props.product.optionGroups || []) {
        const selected = selectedOptions.value.get(group.id) || []
        if (group.required && selected.length < (group.min || 1)) {
            return false
        }
    }
    return true
})

function handleAdd() {
    if (!props.product || !isProductConfigValid.value) return

    const allSelectedOptions: Option[] = []
    const selectedOptionsRecord: Record<string, string | string[]> = {}

    selectedOptions.value.forEach((opts, groupId) => {
        allSelectedOptions.push(...opts)
        if (opts.length === 1) {
            selectedOptionsRecord[groupId] = opts[0].name
        } else if (opts.length > 1) {
            selectedOptionsRecord[groupId] = opts.map((o) => o.name)
        }
    })

    emit('add-to-cart', {
        product: props.product,
        quantity: productQuantity.value,
        selectedOptions: selectedOptionsRecord,
        options: allSelectedOptions,
        notes: productObservation.value.trim() || undefined,
        observation: productObservation.value.trim(),
        unitPrice: calculateProductTotal(),
    })
    emit('close')
}
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen && product"
            class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200"
            @click="emit('close')">
            <div role="dialog" aria-modal="true" aria-labelledby="product-modal-title"
                class="bg-white text-slate-800 w-full h-full sm:h-auto sm:max-h-[88vh] sm:max-w-lg flex flex-col overflow-hidden sm:rounded-3xl sm:border sm:border-slate-200 sm:shadow-2xl"
                @click.stop>
                <!-- Header da Foto -->
                <div class="relative h-60 sm:h-52 w-full bg-slate-100 shrink-0">
                    <img v-if="product.image" :src="product.image" :alt="product.name"
                        class="w-full h-full object-cover" @error="handleImageError($event, tenant?.theme)" />

                    <!-- Botão Fechar -->
                    <button @click="emit('close')"
                        class="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-full transition-colors backdrop-blur-md z-10 shadow-md cursor-pointer"
                        aria-label="Fechar modal de montagem do produto">
                        <X class="w-5 h-5" aria-hidden="true" />
                    </button>

                    <!-- Badge do Restaurante -->
                    <div
                        class="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md rounded-full py-1 px-3 shadow-md flex items-center gap-2 border border-slate-200 text-[11px]">
                        <img v-if="tenant.logo" :src="tenant.logo" :alt="tenant.name"
                            class="w-4 h-4 rounded-full object-cover" @error="handleImageError($event, tenant?.theme)" />
                        <span class="font-bold text-slate-900 truncate max-w-[130px]">{{ tenant.name }}</span>
                        <span class="text-slate-300" aria-hidden="true">•</span>
                        <span class="flex items-center gap-0.5 font-bold text-amber-500">
                            <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                            {{ tenant.reviews ? tenant.reviews.score.toFixed(1) : '4.9' }}
                        </span>
                    </div>
                </div>

                <!-- Conteúdo do Modal -->
                <div class="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
                    <!-- Título, Descrição e Preço -->
                    <div class="space-y-1.5">
                        <h3 id="product-modal-title" class="text-xl font-extrabold text-slate-900 leading-tight">
                            {{ product.name }}
                        </h3>
                        <p class="text-xs text-slate-500 leading-relaxed">{{ product.description }}</p>
                        <div class="flex items-center justify-between pt-1">
                            <span class="text-xs font-semibold text-slate-400">Serve até 1 ou 2 pessoas</span>
                            <span class="text-xl font-black" :class="themeClasses.primaryText">
                                {{ formatCurrency(product.price) }}
                            </span>
                        </div>
                    </div>

                    <!-- Grupos de Opcionais com Feedback Visual -->
                    <div v-for="group in product.optionGroups" :key="group.id" class="space-y-2.5 pt-2" role="group"
                        :aria-labelledby="`group-title-${group.id}`"
                        :aria-invalid="group.required && !isGroupValid(group)">
                        <div class="border-y px-4 py-2.5 -mx-4 sm:-mx-5 flex items-center justify-between transition-colors"
                            :class="group.required && !isGroupValid(group) ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'">
                            <div>
                                <h4 :id="`group-title-${group.id}`" class="font-bold text-xs sm:text-sm text-slate-900">
                                    {{ group.title }}
                                </h4>
                                <p class="text-[11px] font-medium"
                                    :class="group.required && !isGroupValid(group) ? 'text-amber-800' : 'text-slate-500'">
                                    {{ group.max === 1 ? 'Escolha 1 opção' : `Escolha até ${group.max} opções` }}
                                    <span v-if="getSelectedCountInGroup(group.id) > 0" class="font-bold ml-1"
                                        :class="themeClasses.primaryText">
                                        ({{ getSelectedCountInGroup(group.id) }}/{{ group.max }} selecionado{{
                                            getSelectedCountInGroup(group.id) > 1 ? 's' : ''
                                        }})
                                    </span>
                                </p>
                            </div>

                            <!-- Badges Dinâmicos -->
                            <span v-if="group.required && isGroupValid(group)"
                                class="border text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 flex items-center gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                                <Check class="w-2.5 h-2.5" aria-hidden="true" />
                                CONCLUÍDO
                            </span>
                            <span v-else-if="group.required && !isGroupValid(group)"
                                class="bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 animate-pulse">
                                OBRIGATÓRIO
                            </span>
                            <span v-else
                                class="bg-slate-200/80 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                                OPCIONAL
                            </span>
                        </div>

                        <!-- Lista de Opções (Checkboxes e Contornos Dinâmicos com a cor da Loja) -->
                        <div class="space-y-2 pt-1">
                            <label v-for="option in group.options" :key="option.id"
                                class="flex items-center justify-between p-3 rounded-2xl border transition-colors cursor-pointer"
                                :class="isOptionSelected(group.id, option.id) ? themeClasses.selectedOptionClass : 'border-slate-200 hover:bg-slate-50'">
                                <div class="flex flex-col pr-3">
                                    <span class="text-xs sm:text-sm font-medium text-slate-800">{{ option.name }}</span>
                                    <span v-if="option.price > 0" class="text-xs font-bold mt-0.5"
                                        :class="themeClasses.primaryText">
                                        + {{ formatCurrency(option.price) }}
                                    </span>
                                </div>

                                <input :type="group.max === 1 ? 'radio' : 'checkbox'" :name="group.id"
                                    :aria-required="group.required" :checked="isOptionSelected(group.id, option.id)"
                                    @change="toggleOption(group, option)"
                                    class="w-5 h-5 rounded border-slate-300 shrink-0 cursor-pointer"
                                    :class="themeClasses.accentClass" />
                            </label>
                        </div>
                    </div>

                    <!-- Observação -->
                    <div class="pt-3 border-t border-slate-200">
                        <label for="product-observation-input" class="block text-xs font-bold text-slate-700 mb-1.5">
                            Alguma observação?
                        </label>
                        <textarea id="product-observation-input" v-model="productObservation" rows="2"
                            placeholder="Ex: Sem gelo, copos descartáveis extras, etc."
                            :class="['w-full text-xs p-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none resize-none placeholder:text-slate-400', themeClasses.focusRing]"></textarea>
                    </div>
                </div>

                <!-- Footer do Modal -->
                <div class="p-4 pb-6 sm:pb-4 border-t border-slate-200 bg-white flex flex-col gap-2 shrink-0">
                    <div class="flex items-center gap-3 w-full">
                        <div class="flex items-center border border-slate-200 rounded-2xl p-1 shrink-0 bg-slate-100"
                            role="group" aria-label="Controle de quantidade">
                            <button @click="productQuantity > 1 ? productQuantity-- : null"
                                class="p-2 text-slate-500 hover:text-slate-900 disabled:opacity-30 active:scale-95 transition-transform cursor-pointer"
                                aria-label="Diminuir quantidade" :disabled="productQuantity <= 1">
                                <Minus class="w-4 h-4" aria-hidden="true" />
                            </button>
                            <span class="w-8 text-center font-extrabold text-sm text-slate-900" aria-live="polite">
                                {{ productQuantity }}
                            </span>
                            <button @click="productQuantity++"
                                class="p-2 text-slate-500 hover:text-slate-900 active:scale-95 transition-transform cursor-pointer"
                                aria-label="Aumentar quantidade">
                                <Plus class="w-4 h-4" aria-hidden="true" />
                            </button>
                        </div>

                        <button @click="handleAdd" :disabled="!isProductConfigValid"
                            :aria-label="`Adicionar ${productQuantity} item ao carrinho por ${formatCurrency(calculateProductTotal() * productQuantity)}`"
                            class="flex-1 py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-between cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            :class="themeClasses.buttonPrimary">
                            <span>Adicionar</span>
                            <span class="font-extrabold">{{ formatCurrency(calculateProductTotal() * productQuantity)
                                }}</span>
                        </button>
                    </div>

                    <!-- Mensagem Explicativa Contextual -->
                    <p v-if="!isProductConfigValid"
                        class="text-[11px] text-amber-700 font-semibold text-center flex items-center justify-center gap-1.5 pt-1 animate-in fade-in duration-200"
                        role="alert">
                        <AlertCircle class="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                        <span>Selecione as opções obrigatórias para poder adicionar</span>
                    </p>
                </div>
            </div>
        </div>
    </Teleport>
</template>
