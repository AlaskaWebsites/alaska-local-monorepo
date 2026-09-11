<!-- pages/[slug]/admin.vue -->
<template>
  <ClientOnly>
    <div class="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 selection:bg-emerald-500 selection:text-white">
      <!-- Toast de Sucesso Flutuante Global do Painel -->
      <Transition
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="adminToastMsg"
          class="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-emerald-400"
        >
          <span>✓</span>
          <span>{{ adminToastMsg }}</span>
        </div>
      </Transition>

      <!-- 1. Tela de Login por PIN de 4 Dígitos -->
      <AdminLoginCard
        v-if="!isAuthenticated"
        :tenant-name="tenant?.name"
        :error-message="errorMessage"
        @login="handleLogin"
      />

      <!-- 2. Painel Operacional Logado -->
      <div v-else class="max-w-4xl mx-auto">
        <!-- Header Superior Fixo -->
        <AdminTopHeader
          :tenant-name="tenant?.name"
          :slug="slug"
          @logout="logout"
        />

        <!-- Barra de Navegação Horizontal das Abas -->
        <AdminTabsNav
          v-model="activeTab"
          :is-service-store="isServiceStore"
          :is-health-store="isHealthStore"
        />

        <!-- ABA 1: Catálogo & Preços em Tempo Real -->
        <AdminCatalogTab
          v-if="activeTab === 'catalog'"
          :categories="categories"
          :is-product-available="isProductAvailable"
          :get-product-price="getProductPrice"
          @create-product="openCreateProductModal"
          @toggle-product="toggleProduct"
          @edit-price="openPriceModal"
          @manage-options="openOptionsModal"
          @delete-product="handleDeleteProduct"
        />

        <!-- ABA 2: Equipe & Agenda (Exclusivo Hub & Pro) -->
        <AdminAgendaTab
          v-else-if="activeTab === 'agenda' && isServiceStore"
          :is-health-store="isHealthStore"
          :professionals="professionals"
          :blocked-slots="localOverrides.blockedSlots || []"
          @open-create-prof="openCreateProfModal"
          @toggle-prof="toggleProf"
          @days-change="handleProfDaysChange"
          @hours-change="handleProfHoursChange"
          @lunch-change="handleProfLunchChange"
          @delete-prof="handleDeleteProf"
          @toggle-slot="handleToggleSlot"
        />

        <!-- ABA 3: Pix & Contato -->
        <AdminPixContactTab
          v-else-if="activeTab === 'pix_contact'"
          v-model:pix-form="pixForm"
          v-model:contact-form="contactForm"
          @save-pix="savePixConfig"
          @save-contact="saveContactConfig"
        />

        <!-- ABA 4: Horários & Emergência -->
        <AdminHoursTab
          v-else-if="activeTab === 'hours'"
          v-model:schedule-form="scheduleForm"
          v-model:emergency-closed="emergencyClosed"
          v-model:emergency-message="emergencyMessage"
          @save="saveSchedule"
        />

        <!-- ABA 5: Delivery & Taxas -->
        <AdminDeliveryTab
          v-else-if="activeTab === 'delivery'"
          v-model:delivery-fee="deliveryFeeInput"
          v-model:min-order="minOrderInput"
          v-model:estimated-time="estimatedTimeInput"
          @save="saveDeliveryConfig"
        />

        <!-- ABA 6: Comunicado Oficial da Loja -->
        <AdminAnnouncementTab
          v-else-if="activeTab === 'announcement'"
          v-model:enabled="announcementEnabled"
          v-model:message="announcementMessage"
          @save="saveAnnouncementConfig"
        />

        <!-- ABA 7: Segurança & PIN de Acesso -->
        <AdminSecurityTab
          v-else-if="activeTab === 'security'"
          :success-message="pinSuccessMsg"
          :error-message="errorMessage"
          @save-pin="saveNewPin"
        />

        <!-- MODAIS DO PAINEL ADMIN -->
        <AdminPriceModal
          :is-open="isPriceModalOpen"
          :product="editingProduct"
          :initial-price="newPriceInput"
          @close="isPriceModalOpen = false"
          @confirm="confirmPriceEdit"
        />

        <AdminCreateProductModal
          :is-open="isCreateProductOpen"
          :categories="categories"
          :is-service-store="isServiceStore"
          @close="isCreateProductOpen = false"
          @submit="handleCreateProductSubmit"
        />

        <AdminCreateProfModal
          :is-open="isCreateProfOpen"
          @close="isCreateProfOpen = false"
          @submit="handleCreateProfSubmit"
        />

        <AdminOptionsModal
          :is-open="isOptionsModalOpen"
          :product="selectedProductForOptions"
          :is-option-paused="isOptionPaused"
          @close="isOptionsModalOpen = false"
          @toggle-option="toggleOptionStatus"
        />
      </div>

      <!-- Fallback SSR / Loading -->
      <template #fallback>
        <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div class="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      </template>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useMerchantAdmin, type TenantOverrides, type DaySchedule } from '~/composables/useMerchantAdmin'
import AdminLoginCard from '~/components/admin/AdminLoginCard.vue'
import AdminTopHeader from '~/components/admin/AdminTopHeader.vue'
import AdminTabsNav, { type AdminTabKey } from '~/components/admin/AdminTabsNav.vue'
import AdminCatalogTab from '~/components/admin/tabs/AdminCatalogTab.vue'
import AdminAgendaTab from '~/components/admin/tabs/AdminAgendaTab.vue'
import AdminPixContactTab from '~/components/admin/tabs/AdminPixContactTab.vue'
import AdminHoursTab from '~/components/admin/tabs/AdminHoursTab.vue'
import AdminDeliveryTab from '~/components/admin/tabs/AdminDeliveryTab.vue'
import AdminAnnouncementTab from '~/components/admin/tabs/AdminAnnouncementTab.vue'
import AdminSecurityTab from '~/components/admin/tabs/AdminSecurityTab.vue'
import AdminPriceModal from '~/components/admin/modals/AdminPriceModal.vue'
import AdminCreateProductModal from '~/components/admin/modals/AdminCreateProductModal.vue'
import AdminCreateProfModal from '~/components/admin/modals/AdminCreateProfModal.vue'
import AdminOptionsModal from '~/components/admin/modals/AdminOptionsModal.vue'
import type { Product, Category } from '@alaska/contracts'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const { tenant, refresh } = useTenant(slug)
const {
  isAuthenticated,
  errorMessage,
  login,
  logout,
  changePin,
  getOverrides,
  saveOverrides,
  toggleProductAvailability,
  updateProductPrice,
  createProduct,
  deleteProduct,
  toggleOptionAvailability,
  updatePixConfig,
  updateContact,
  updateWeeklySchedule,
  toggleProfessionalAvailability,
  updateProfessionalDays,
  updateProfessionalHours,
  updateProfessionalLunch,
  createProfessional,
  deleteProfessional,
  updateDelivery,
  updateAnnouncement,
  updateEmergency,
  toggleBlockSlot
} = useMerchantAdmin(slug)

const activeTab = ref<AdminTabKey>('catalog')
const adminToastMsg = ref('')
const localOverrides = ref<TenantOverrides>({})

function showToast(msg: string) {
  adminToastMsg.value = msg
  setTimeout(() => {
    adminToastMsg.value = ''
  }, 3000)
}

function refreshLocalOverrides() {
  localOverrides.value = getOverrides()
}

onMounted(async () => {
  if (slug.value && typeof refresh === 'function') {
    await refresh()
  }
  refreshLocalOverrides()
  loadScheduleFromOverrides()
  loadPixAndContactFromOverrides()
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', refreshLocalOverrides)
    window.addEventListener('alaska_overrides_updated', refreshLocalOverrides)
  }
})

function handleLogin(pin: string) {
  login(pin)
}

const categories = computed<Category[]>(() => {
  return (tenant.value?.categories || []) as Category[]
})

function isProductAvailable(product: Product): boolean {
  if (product.isAvailable !== undefined) return Boolean(product.isAvailable)
  if ((product as any).available !== undefined) return Boolean((product as any).available)
  const prodOverrides = localOverrides.value?.products
  if (prodOverrides?.[product.id]?.isAvailable !== undefined) {
    return Boolean(prodOverrides[product.id].isAvailable)
  }
  return true
}

function getProductPrice(product: Product): number {
  const prodOverrides = localOverrides.value?.products
  if (prodOverrides?.[product.id]?.price !== undefined) {
    return Number(prodOverrides[product.id].price)
  }
  return Number(product.price || 0)
}

async function toggleProduct(categoryProducts: Product[], productId: string, currentStatus: boolean) {
  await toggleProductAvailability(categoryProducts, productId, currentStatus)
  refreshLocalOverrides()
  if (typeof refresh === 'function') {
    await refresh()
  }
  showToast(currentStatus ? 'Item pausado no catálogo' : 'Item ativado no catálogo')
}

// 2. Edição de Preços (Modal)
const isPriceModalOpen = ref(false)
const editingProduct = ref<Product | null>(null)
const editingProductsList = ref<Product[]>([])
const newPriceInput = ref(0)

function openPriceModal(categoryProducts: Product[], product: Product) {
  editingProductsList.value = categoryProducts
  editingProduct.value = product
  newPriceInput.value = getProductPrice(product)
  isPriceModalOpen.value = true
}

async function confirmPriceEdit(newPrice: number) {
  if (editingProduct.value && newPrice > 0) {
    await updateProductPrice(editingProductsList.value, editingProduct.value.id, newPrice)
    refreshLocalOverrides()
    if (typeof refresh === 'function') {
      await refresh()
    }
    showToast(`Preço de ${editingProduct.value.name} atualizado!`)
  }
  isPriceModalOpen.value = false
}

// 3. Criação e Exclusão de Produtos
const isCreateProductOpen = ref(false)

function openCreateProductModal() {
  isCreateProductOpen.value = true
}

function handleCreateProductSubmit(form: { name: string; price: number; categoryId: string; description: string }) {
  if (!form.name || !form.price || !form.categoryId) {
    showToast('⚠️ Preencha nome, preço e categoria!')
    return
  }
  createProduct(form)
  refreshLocalOverrides()
  isCreateProductOpen.value = false
  showToast(`✅ ${form.name} cadastrado com sucesso!`)
}

function handleDeleteProduct(productId: string, productName: string) {
  if (confirm(`Tem certeza que deseja excluir ${productName}?`)) {
    deleteProduct(productId)
    refreshLocalOverrides()
    showToast(`🗑️ ${productName} removido do catálogo!`)
  }
}

// 4. Modal de Gestão de Opcionais / Adicionais
const isOptionsModalOpen = ref(false)
const selectedProductForOptions = ref<Product | null>(null)

function openOptionsModal(product: Product) {
  selectedProductForOptions.value = product
  isOptionsModalOpen.value = true
}

function isOptionPaused(optionId: string): boolean {
  const current = localOverrides.value || {}
  return (current.pausedOptionIds || []).includes(optionId)
}

async function toggleOptionStatus(optionId: string) {
  const currentlyPaused = isOptionPaused(optionId)
  await toggleOptionAvailability(optionId, currentlyPaused, selectedProductForOptions.value?.id)
  refreshLocalOverrides()
  if (typeof refresh === 'function') {
    await refresh()
  }
  showToast(currentlyPaused ? 'Opcional ativado no estoque' : 'Opcional pausado no estoque')
}

// 5. Especialistas & Horários Individuais (Hub & Pro)
const isServiceStore = computed(() => {
  const cat = tenant.value?.businessCategory || (tenant.value as any)?.template
  return cat === 'hub' || cat === 'pro' || slug.value === 'barbearia-style' || slug.value === 'clinica-sorriso'
})

const isHealthStore = computed(() => {
  return tenant.value?.businessCategory === 'pro' || slug.value === 'clinica-sorriso'
})

const professionals = computed(() => {
  return (tenant.value?.professionals || []) as any[]
})

function toggleProf(profId: string, isAvailable: boolean) {
  toggleProfessionalAvailability(profId, isAvailable)
  refreshLocalOverrides()
}

function handleProfDaysChange(profId: string, availableDays: number[]) {
  updateProfessionalDays(profId, availableDays)
  refreshLocalOverrides()
}

function handleProfHoursChange(profId: string, workHours: { start: string; end: string }) {
  updateProfessionalHours(profId, workHours)
  refreshLocalOverrides()
}

function handleProfLunchChange(profId: string, lunchBreak: { start: string; end: string; enabled: boolean }) {
  updateProfessionalLunch(profId, lunchBreak)
  refreshLocalOverrides()
}

// 6. Criação e Exclusão de Especialistas
const isCreateProfOpen = ref(false)

function openCreateProfModal() {
  isCreateProfOpen.value = true
}

function handleCreateProfSubmit(form: { name: string; role: string }) {
  if (!form.name || !form.role) {
    showToast('⚠️ Preencha nome e especialidade!')
    return
  }
  createProfessional({
    name: form.name,
    role: form.role,
    availableDays: [1, 2, 3, 4, 5],
    workHours: { start: '08:00', end: '18:00' },
    lunchBreak: { start: '12:00', end: '13:00', enabled: true }
  })
  refreshLocalOverrides()
  isCreateProfOpen.value = false
  showToast(`✅ ${form.name} cadastrado na equipe!`)
}

function handleDeleteProf(profId: string, profName: string) {
  if (confirm(`Remover ${profName} da equipe?`)) {
    deleteProfessional(profId)
    refreshLocalOverrides()
    showToast(`🗑️ ${profName} removido da equipe!`)
  }
}

// 7. Bloqueio de Horários na Agenda
function handleToggleSlot(date: string, time: string) {
  const isBlocked = toggleBlockSlot(date, time)
  refreshLocalOverrides()
  showToast(isBlocked ? `Horário ${time} bloqueado!` : `Horário ${time} liberado!`)
}

// 8. Configurações Pix & Contato
const pixForm = ref({
  keyType: 'phone' as 'cpf' | 'cnpj' | 'phone' | 'email' | 'random',
  pixKey: '',
  beneficiary: '',
  city: '',
  enabled: true
})

const contactForm = ref({
  whatsapp: '',
  phone: '',
  instagram: ''
})

function loadPixAndContactFromOverrides() {
  const ov = localOverrides.value || {}
  const basePix = tenant.value?.pixConfig || (tenant.value as any)?.pix || {}
  pixForm.value = {
    keyType: ov.pix?.keyType || basePix.keyType || 'phone',
    pixKey: ov.pix?.pixKey || basePix.key || basePix.pixKey || '',
    beneficiary: ov.pix?.beneficiary || basePix.beneficiary || tenant.value?.name || '',
    city: ov.pix?.city || basePix.city || 'SAO PAULO',
    enabled: ov.pix?.enabled ?? true
  }

  contactForm.value = {
    whatsapp: ov.contact?.whatsapp || tenant.value?.phoneWhatsApp || '',
    phone: ov.contact?.phone || '',
    instagram: ov.contact?.instagram || (tenant.value as any)?.instagram || ''
  }
}

function savePixConfig() {
  updatePixConfig(pixForm.value)
  refreshLocalOverrides()
  showToast('Configurações Pix salvas com sucesso!')
}

function saveContactConfig() {
  updateContact(contactForm.value)
  refreshLocalOverrides()
  showToast('Contatos salvos com sucesso!')
}

// 9. Horários & Escala Semanal
const scheduleForm = ref<Record<string, DaySchedule>>({})
const emergencyClosed = ref(false)
const emergencyMessage = ref('')

function loadScheduleFromOverrides() {
  const ov = localOverrides.value || {}
  const baseHours = (tenant.value?.openingHours || {}) as Record<string, DaySchedule> & { open?: string; close?: string }
  const overrideHours = ov.openingHours || {}
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  const result: Record<string, DaySchedule> = {}
  days.forEach(day => {
    const dOverride = (overrideHours as any)[day]
    const dBase = (baseHours as any)[day]
    result[day] = {
      open: dOverride?.open || dBase?.open || baseHours.open || '09:00',
      close: dOverride?.close || dBase?.close || baseHours.close || '22:00',
      closed: dOverride?.closed ?? dBase?.closed ?? false
    }
  })

  scheduleForm.value = result
  emergencyClosed.value = ov.emergency?.isClosed ?? false
  emergencyMessage.value = ov.emergency?.message || ''
}

async function saveSchedule() {
  await updateWeeklySchedule(scheduleForm.value)
  updateEmergency(emergencyClosed.value, emergencyMessage.value)
  refreshLocalOverrides()
  if (typeof refresh === 'function') {
    await refresh()
  }
  showToast('Horários de funcionamento atualizados!')
}

// 10. Delivery & Taxas
const deliveryFeeInput = ref(0)
const minOrderInput = ref(0)
const estimatedTimeInput = ref('30-50 min')

function saveDeliveryConfig() {
  updateDelivery(deliveryFeeInput.value, minOrderInput.value, estimatedTimeInput.value)
  refreshLocalOverrides()
  showToast('Configurações de entrega salvas com sucesso!')
}

// 11. Comunicados em Destaque
const announcementEnabled = ref(false)
const announcementMessage = ref('')

function saveAnnouncementConfig() {
  updateAnnouncement(announcementEnabled.value, announcementMessage.value)
  refreshLocalOverrides()
  showToast('Comunicado da loja salvo com sucesso!')
}

// 12. Troca de PIN
const pinSuccessMsg = ref('')

function saveNewPin(newPin: string) {
  if (changePin(newPin)) {
    pinSuccessMsg.value = 'PIN de acesso atualizado com sucesso!'
    refreshLocalOverrides()
    showToast('PIN atualizado com sucesso!')
    setTimeout(() => {
      pinSuccessMsg.value = ''
    }, 3000)
  }
}
</script>
