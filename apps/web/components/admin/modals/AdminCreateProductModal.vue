<!-- components/admin/modals/AdminCreateProductModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, Upload, Loader2, X, Link2 } from 'lucide-vue-next'
import { useImageUpload } from '~/composables/useImageUpload'
import { useTenantTheme } from '~/composables/useTenantTheme'
import type { Category } from '~/types'

const props = defineProps<{
  isOpen: boolean
  categories: Category[]
  isServiceStore?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open-create-category'): void
  (e: 'create', form: { name: string; price: number; categoryId: string; description: string; image?: string }): void
}>()

const { themeClasses } = useTenantTheme()
const { uploadImage, isUploading, uploadError } = useImageUpload()

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
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
      if (previewUrl.value?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl.value)
      }
      previewUrl.value = null
      selectedFile.value = null
      uploadError.value = null
      showManualUrl.value = false
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
    }
  }
)

// Quando categorias mudam (ex: adicionou nova categoria), seleciona a última criada
watch(
  () => props.categories,
  (newCats) => {
    if (newCats && newCats.length > 0 && !form.value.categoryId) {
      form.value.categoryId = newCats[newCats.length - 1].id
    }
  },
  { deep: true }
)

function triggerFileSelect() {
  if (isUploading.value) return
  fileInputRef.value?.click()
}

function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Limpa preview anterior se era blob
  if (previewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }

  // Apenas armazena o arquivo e exibe o preview local (sem enviar para o Cloudinary ainda)
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  uploadError.value = null
}

function removeImage() {
  if (previewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl.value)
  }
  form.value.image = ''
  previewUrl.value = null
  selectedFile.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

async function handleSubmit() {
  if (isUploading.value) return
  if (!form.value.name.trim()) return

  // Faz o upload para o Cloudinary somente no momento do cadastro
  if (selectedFile.value) {
    const result = await uploadImage(selectedFile.value)
    if (result?.url) {
      form.value.image = result.url
    } else {
      // Falha no upload: erro exibido na tela, não cadastra sem sucesso
      return
    }
  }

  emit('create', form.value)
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4" @click="emit('close')">
    <div class="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-900" @click.stop>
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Plus class="w-4 h-4" :class="themeClasses.primaryText" />
          <span>Cadastrar Novo {{ isServiceStore ? 'Serviço' : 'Produto' }}</span>
        </h3>
        <button
          type="button"
          @click="emit('close')"
          class="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Nome:</label>
          <input
            type="text"
            v-model="form.name"
            placeholder="Ex: Combo Burger Duplo"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-semibold text-slate-600">Categoria:</label>
            <button
              type="button"
              @click="emit('open-create-category')"
              class="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
            >
              + Nova Categoria
            </button>
          </div>
          <select
            v-model="form.categoryId"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
          >
            <option v-for="c in categories" :key="c.id" :value="c.id">
              {{ c.icon ? `${c.icon} ` : '' }}{{ c.name }}
            </option>
          </select>
        </div>

        <!-- Foto do Produto com Preview Local e Upload sob Demanda no Cloudinary -->
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Foto / Imagem (opcional):</label>

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
            class="border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shadow-2xs">
              <Upload v-if="!isUploading" class="w-5 h-5 text-rose-500" />
              <Loader2 v-else class="w-5 h-5 text-rose-500 animate-spin" />
            </div>
            <div class="text-center">
              <p class="text-xs font-medium text-slate-800">Toque para tirar foto ou escolher da galeria</p>
              <p class="text-[10px] text-slate-400">Otimização automática Cloudinary (WebP ~40KB)</p>
            </div>
          </div>

          <!-- Preview Ativo com Opções de Troca/Remoção -->
          <div v-else class="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div class="relative w-16 h-16 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
              <img
                :src="previewUrl || form.image"
                alt="Preview"
                class="w-full h-full object-cover"
                referrerpolicy="no-referrer"
              />
              <div v-if="isUploading" class="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 class="w-5 h-5 text-white animate-spin" />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-slate-900 truncate">
                {{ isUploading ? 'Enviando foto ao Cloudinary...' : (selectedFile ? 'Foto selecionada' : 'Imagem anexada') }}
              </p>
              <p class="text-[10px] text-slate-500 truncate">
                {{ isUploading ? 'Aguarde a otimização...' : (selectedFile ? 'Será enviada ao clicar em Cadastrar' : 'URL externa vinculada') }}
              </p>
              <div class="flex items-center gap-2 mt-1.5">
                <button
                  type="button"
                  :disabled="isUploading"
                  @click="triggerFileSelect"
                  class="text-[11px] font-bold text-slate-700 hover:text-slate-950 cursor-pointer disabled:opacity-50"
                >
                  Trocar foto
                </button>
                <span class="text-slate-300">•</span>
                <button
                  type="button"
                  :disabled="isUploading"
                  @click="removeImage"
                  class="text-[11px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer disabled:opacity-50"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>

          <!-- Erro de Upload -->
          <p v-if="uploadError" class="text-[11px] text-rose-600 mt-1 font-medium">
            ⚠️ {{ uploadError }}
          </p>

          <!-- Fallback: Link manual -->
          <div class="mt-1.5 flex items-center justify-between">
            <button
              type="button"
              @click="showManualUrl = !showManualUrl"
              class="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
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
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Preço (R$):</label>
          <input
            type="number"
            step="0.50"
            v-model.number="form.price"
            placeholder="0.00"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 font-mono"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Descrição (opcional):</label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Detalhes dos ingredientes ou benefícios..."
            class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-slate-400"
          ></textarea>
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <button
          type="button"
          :disabled="isUploading"
          @click="emit('close')"
          class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="isUploading || !form.name.trim()"
          @click="handleSubmit"
          class="flex-1 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          :class="themeClasses.primaryBg"
        >
          <Loader2 v-if="isUploading" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isUploading ? 'Enviando e cadastrando...' : 'Cadastrar' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
