<!-- components/admin/modals/AdminCreateProductModal.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Upload, Loader2, X, Link2 } from 'lucide-vue-next'
import { useImageUpload } from '~/composables/useImageUpload'
import { useMerchantAdmin } from '~/composables/useMerchantAdmin'
import type { Category } from '~/types'

const props = defineProps<{
  isOpen: boolean
  categories: Category[]
  isServiceStore?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', form: { name: string; price: number; categoryId: string; description: string; image?: string }): void
  (e: 'submit', form: { name: string; price: number; categoryId: string; description: string; image?: string }): void
}>()

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'default')
const { getOverrides, saveOverrides } = useMerchantAdmin(slug)
const { uploadImage, isUploading, uploadError } = useImageUpload()

const fileInputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string | null>(null)
const showManualUrl = ref(false)

const form = ref({
  name: '',
  price: 0,
  categoryId: '',
  description: '',
  image: ''
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      form.value = {
        name: '',
        price: 0,
        categoryId: props.categories[0]?.id || '',
        description: '',
        image: ''
      }
      previewUrl.value = null
      showManualUrl.value = false
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
    }
  }
)

function triggerFileSelect() {
  if (isUploading.value) return
  fileInputRef.value?.click()
}

async function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Gera preview local instantâneo
  previewUrl.value = URL.createObjectURL(file)

  const result = await uploadImage(file)
  if (result?.url) {
    form.value.image = result.url
    previewUrl.value = result.url
  }
}

function removeImage() {
  form.value.image = ''
  previewUrl.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function handleSubmit() {
  if (isUploading.value) return
  
  const payload = { ...form.value }
  emit('submit', payload)
  emit('confirm', payload)

  // Sincronização direta de imagem nos overrides locais
  if (payload.image) {
    const injectImageToLastCustom = () => {
      try {
        const overrides = getOverrides()
        const customs = overrides.customProducts || []
        if (customs.length > 0) {
          const lastIndex = customs.length - 1
          const lastProd = customs[lastIndex]
          if (lastProd && lastProd.name === payload.name && lastProd.image !== payload.image) {
            lastProd.image = payload.image
            saveOverrides({ customProducts: [...customs] })
          }
        }
      } catch {}
    }

    injectImageToLastCustom()
    setTimeout(injectImageToLastCustom, 50)
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" @click="emit('close')">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-100" @click.stop>
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <Plus class="w-4 h-4 text-emerald-400" />
          <span>Cadastrar Novo {{ isServiceStore ? 'Serviço' : 'Produto' }}</span>
        </h3>
        <button
          type="button"
          @click="emit('close')"
          class="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Nome:</label>
          <input
            type="text"
            v-model="form.name"
            placeholder="Ex: Combo Burger Duplo"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Categoria:</label>
          <select
            v-model="form.categoryId"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
          >
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Preço (R$):</label>
          <input
            type="number"
            step="0.50"
            v-model.number="form.price"
            placeholder="0.00"
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <!-- Foto do Produto com Upload Cloudinary -->
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Foto / Imagem:</label>

          <input
            ref="fileInputRef"
            type="file"
            accept="image/png, image/jpeg, image/webp"
            class="hidden"
            @change="onFileSelected"
          />

          <!-- Área de Upload / Seleção Mobile -->
          <div
            v-if="!previewUrl && !form.image"
            @click="triggerFileSelect"
            class="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <div class="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400">
              <Upload v-if="!isUploading" class="w-5 h-5 text-emerald-400" />
              <Loader2 v-else class="w-5 h-5 text-emerald-400 animate-spin" />
            </div>
            <div class="text-center">
              <p class="text-xs font-medium text-white">Toque para tirar foto ou escolher da galeria</p>
              <p class="text-[10px] text-slate-500">Otimização automática Cloudinary (WebP ~40KB)</p>
            </div>
          </div>

          <!-- Preview Ativo com Opções de Troca/Remoção -->
          <div v-else class="flex items-center gap-3 p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
            <div class="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
              <img
                :src="previewUrl || form.image"
                alt="Preview"
                class="w-full h-full object-cover object-center"
                referrerpolicy="no-referrer"
              />
              <div v-if="isUploading" class="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 class="w-5 h-5 text-emerald-400 animate-spin" />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-white truncate">
                {{ isUploading ? 'Enviando e otimizando...' : 'Imagem anexada' }}
              </p>
              <p class="text-[10px] text-slate-400 truncate">
                {{ isUploading ? 'Aguarde a finalização' : 'Pronta para publicação' }}
              </p>
              <div class="flex items-center gap-2 mt-1.5">
                <button
                  type="button"
                  :disabled="isUploading"
                  @click="triggerFileSelect"
                  class="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                >
                  Trocar foto
                </button>
                <span class="text-slate-700">•</span>
                <button
                  type="button"
                  :disabled="isUploading"
                  @click="removeImage"
                  class="text-[11px] text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>

          <!-- Erro de Upload -->
          <p v-if="uploadError" class="text-[11px] text-rose-400 mt-1">
            ⚠️ {{ uploadError }}
          </p>

          <!-- Fallback: Link manual -->
          <div class="mt-1.5 flex items-center justify-between">
            <button
              type="button"
              @click="showManualUrl = !showManualUrl"
              class="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Link2 class="w-3 h-3" />
              <span>{{ showManualUrl ? 'Ocultar link manual' : 'Ou colar URL de imagem externa' }}</span>
            </button>
          </div>

          <div v-if="showManualUrl" class="mt-2">
            <input
              type="url"
              v-model="form.image"
              placeholder="https://images.unsplash.com/..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Descrição (opcional):</label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Detalhes dos ingredientes ou benefícios..."
            class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
          ></textarea>
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <button
          type="button"
          @click="emit('close')"
          class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="isUploading"
          @click="handleSubmit"
          class="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Loader2 v-if="isUploading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isUploading ? 'Enviando...' : 'Cadastrar' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
