<!-- pages/[slug]/admin.vue -->
<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
    <ClientOnly>
      <!-- 1. Tela de Login por PIN -->
      <AdminLoginCard
        v-if="!isAuthenticated"
        :error-message="errorMessage"
        :slug="slug"
        @login="handleLogin"
      />

      <!-- 2. Painel Operacional Ativo -->
      <div v-else class="max-w-2xl mx-auto pb-24">
        <!-- Header Superior Fixo -->
        <AdminTopHeader
          :store-name="tenant?.name"
          :is-emergency-closed="isEmergencyClosed"
          :is-health-store="isHealthStore"
          :is-service-store="isServiceStore"
          :slug="slug"
          @logout="logout"
        />

        <!-- Toast de Notificação Rápida -->
        <div v-if="adminToastMsg" class="sticky top-16 z-30 mx-4 mt-2 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center shadow-lg animate-in fade-in duration-150">
          {{ adminToastMsg }}
        </div>

        <!-- Navegação em Abas Operacionais com Rolagem e Setas Desktop/Mobile -->
        <AdminTabsNav
          v-model:active-tab="activeTab"
          :is-service-store="isServiceStore"
          :is-health-store="isHealthStore"
          :pending-orders-count="pendingOrdersCount"
        />

        <!-- ABA 0: Mural / Gestão de Pedidos em Tempo Real (ADR 024) -->
        <AdminOrdersTab
          v-if="activeTab === 'orders'"
          :store-name="tenant?.name || 'Estabelecimento'"
          :phone-whatsapp="tenant?.phoneWhatsApp || ''"
          :is-service-store="isServiceStore"
        />

        <!-- ABA 1: Catálogo e Serviços (Pausa, Criação, Exclusão e Preços) -->
        <AdminCatalogTab
          v-else-if="activeTab === 'catalog'"
          :categories="categories"
          :is-service-store="isServiceStore"
          :is-product-available="isProductAvailable"
          :get-product-price="getProductPrice"
          @open-price-modal="openPriceModal"
          @edit-price="openPriceModal"
          @toggle-avail="handleProductAvailabilityToggle"
          @open-create-modal="isCreateProductOpen = true"
          @create-product="isCreateProductOpen = true"
          @delete-product="handleDeleteProduct"
          @open-options="openOptionsModal"
          @manage-options="openOptionsModal"
        />

        <!-- ABA 2: Especialistas / Agenda (Hub & Pro) -->
        <AdminAgendaTab
          v-else-if="activeTab === 'agenda' && isServiceStore"
          :is-health-store="isHealthStore"
          :professionals-list="professionalsList"
          v-model:selected-agenda-date="selectedAgendaDate"
          :sample-slots="sampleSlots"
          :is-slot-blocked="isSlotBlocked"
          @create-prof="openCreateProfModal"
          @toggle-prof-avail="handleProfAvailabilityToggle"
          @toggle-prof-day="handleProfDayToggle"
          @change-prof-hours="handleProfWorkHoursChange"
          @change-prof-lunch="handleProfLunchChange"
          @delete-prof="handleDeleteProf"
          @toggle-slot="handleSlotToggle"
        />

        <!-- ABA 3: Pix & Contato -->
        <AdminPixContactTab
          v-else-if="activeTab === 'pix_contact'"
          :pix-config-input="pixConfigInput"
          :contact-input="contactInput"
          @save-pix="savePixConfig"
          @save-contact="saveContactConfig"
        />

        <!-- ABA 4: Horários & Pausa Geral -->
        <AdminHoursTab
          v-else-if="activeTab === 'hours'"
          :is-emergency-closed="isEmergencyClosed"
          :weekly-days-config="weeklyDaysConfig"
          :schedule-success-msg="scheduleSuccessMsg"
          @toggle-emergency="toggleEmergencyPause"
          @toggle-day-closed="toggleDayClosed"
          @save-schedule="saveWeeklySchedule"
        />

        <!-- ABA 5: Delivery & Taxas -->
        <AdminDeliveryTab
          v-else-if="activeTab === 'delivery' && !isServiceStore"
          v-model:delivery-fee-input="deliveryFeeInput"
          v-model:min-order-input="minOrderInput"
          v-model:estimated-time-input="estimatedTimeInput"
          @save-delivery="saveDeliveryConfig"
        />

        <!-- ABA 6: Comunicado Oficial -->
        <AdminAnnouncementTab
          v-else-if="activeTab === 'announcement'"
          v-model:announcement-enabled="announcementEnabled"
          v-model:announcement-message="announcementMessage"
          @save-announcement="saveAnnouncementConfig"
        />

        <!-- ABA 7: Segurança e PIN -->
        <AdminSecurityTab
          v-else-if="activeTab === 'security'"
          :pin-success-msg="pinSuccessMsg"
          @save-pin="saveNewPin"
        />

        <!-- Modais Operacionais -->
        <AdminPriceModal
          :is-open="isPriceModalOpen"
          :product="editingProduct"
          :model-value="newPriceInput"
          @update:model-value="newPriceInput = $event"
          @close="isPriceModalOpen = false"
          @confirm="confirmPriceEdit"
        />

        <AdminCreateProductModal
          :is-open="isCreateProductOpen"
          :categories="categories"
          :is-service-store="isServiceStore"
          @close="isCreateProductOpen = false"
          @create="handleCreateProduct"
        />

        <AdminCreateProfModal
          :is-open="isCreateProfOpen"
          :is-health-store="isHealthStore"
          @close="isCreateProfOpen = false"
          @create="handleCreateProf"
        />

        <AdminOptionsModal
          :is-open="isOptionsModalOpen"
          :product="optionsProduct"
          :paused-option-ids="localOverrides.pausedOptionIds || []"
          @close="isOptionsModalOpen = false"
          @toggle-option="toggleOptionStatus"
        />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { useMerchantAdmin } from '~/composables/useMerchantAdmin'
import { useOrderDashboard } from '~/composables/useOrderDashboard'
import AdminOrdersTab from '~/components/admin/tabs/AdminOrdersTab.vue'
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
import AdminLoginCard from '~/components/admin/AdminLoginCard.vue'
import AdminTopHeader from '~/components/admin/AdminTopHeader.vue'
import AdminTabsNav, { type AdminTabKey } from '~/components/admin/AdminTabsNav.vue'
import type { Product, Category, DaySchedule } from '@alaska/contracts'

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'hamburgueria-x')
const { tenant, refresh } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)

const {
  isAuthenticated,
  errorMessage,
  login,
  logout,
  changePin,
  getOverrides,
  toggleProductAvailability,
  updateProductPrice,
  createProduct,
  deleteProduct,
  toggleOptionAvailability,
  updateWeeklySchedule,
  updateEmergency,
  updateDelivery,
  updateAnnouncement,
  toggleProfessionalAvailability,
  updateProfessionalDays,
  updateProfessionalHours,
  updateProfessionalLunch,
  toggleBlockSlot,
  createProfessional,
  deleteProfessional,
  updatePixConfig,
  updateContact
} = useMerchantAdmin(slug)

const { pendingCount: pendingOrdersCount } = useOrderDashboard(slug)

const activeTab = ref<AdminTabKey>('orders')
const localOverrides = ref(getOverrides())

function refreshLocalOverrides() {
  localOverrides.value = getOverrides()
}

// 1. Toast helper
const adminToastMsg = ref('')
let toastTimer: any = null
function showToast(msg: string) {
  if (toastTimer) clearTimeout(toastTimer)
  adminToastMsg.value = msg
  toastTimer = setTimeout(() => {
    adminToastMsg.value = ''
  }, 2500)
}

// 2. Autenticação por PIN
async function handleLogin(pin: string) {
  const success = await login(pin)
  if (success) {
    refreshLocalOverrides()
    loadPixAndContactFromOverrides()
    loadScheduleFromOverrides()
    loadDeliveryFromOverrides()
    loadAnnouncementFromOverrides()
    showToast('Painel operacional liberado!')
  }
}

// 3. Flags de Categoria da Loja
const isServiceStore = computed(() => {
  const cat = tenant.value?.businessCategory
  return cat === 'hub' || cat === 'pro' || slug.value === 'barbearia-style' || slug.value === 'clinica-sorriso'
})

const isHealthStore = computed(() => {
  return tenant.value?.businessCategory === 'pro' || slug.value === 'clinica-sorriso'
})

const isEmergencyClosed = computed(() => {
  return Boolean(localOverrides.value?.emergency?.isClosed)
})

// 4. Catálogo: Categorias & Produtos com Overrides
const categories = computed<Category[]>(() => {
  const base = (tenant.value?.categories || []) as Category[]
  const overrides = localOverrides.value || {}
  const deletedIds = new Set(overrides.deletedProductIds || [])
  const customProds = overrides.customProducts || []

  return base.map((cat) => {
    const prods = (cat.products || []).filter((p) => !deletedIds.has(p.id))
    const extraForCat = customProds.filter((p) => p.categoryId === cat.id && !deletedIds.has(p.id))
    return {
      ...cat,
      products: [...prods, ...extraForCat]
    }
  })
})

function getProductPrice(product: Product): number {
  const overridePrice = localOverrides.value?.products?.[product.id]?.price
  return overridePrice !== undefined ? overridePrice : product.price
}

function isProductAvailable(product: Product): boolean {
  const prodOverrides = localOverrides.value?.products
  if (prodOverrides?.[product.id]?.isAvailable !== undefined) {
    return prodOverrides[product.id].isAvailable!
  }
  if (product.isAvailable !== undefined) return product.isAvailable
  return true
}

async function handleProductAvailabilityToggle(productOrList: any, productId?: string) {
  let targetProduct: Product | undefined
  if (typeof productOrList === 'object' && productOrList !== null && 'id' in productOrList && !Array.isArray(productOrList)) {
    targetProduct = productOrList as Product
  } else if (Array.isArray(productOrList) && productId) {
    targetProduct = productOrList.find((p) => p.id === productId)
  }
  if (!targetProduct) return
  const currentStatus = isProductAvailable(targetProduct)
  await toggleProductAvailability(targetProduct.id, currentStatus)
  refreshLocalOverrides()
  if (typeof refresh === 'function') {
    await refresh()
  }
  showToast(currentStatus ? `⏸️ ${targetProduct.name} pausado!` : `✅ ${targetProduct.name} ativado!`)
}

// 5. Modais de Catálogo
const isPriceModalOpen = ref(false)
const editingProduct = ref<Product | null>(null)
const editingProductsList = ref<Product[]>([])
const newPriceInput = ref(0)

function openPriceModal(categoryProductsOrProduct: any, product?: Product) {
  if (Array.isArray(categoryProductsOrProduct) && product) {
    editingProductsList.value = categoryProductsOrProduct
    editingProduct.value = product
  } else if (categoryProductsOrProduct && typeof categoryProductsOrProduct === 'object') {
    editingProduct.value = categoryProductsOrProduct
    editingProductsList.value = [categoryProductsOrProduct]
  }
  if (editingProduct.value) {
    const overridePrice = localOverrides.value?.products?.[editingProduct.value.id]?.price
    newPriceInput.value = overridePrice !== undefined ? overridePrice : editingProduct.value.price
    isPriceModalOpen.value = true
  }
}

async function confirmPriceEdit(newPrice: number) {
  if (editingProduct.value) {
    await updateProductPrice(editingProduct.value.id, newPrice)
    refreshLocalOverrides()
    if (typeof refresh === 'function') {
      await refresh()
    }
    isPriceModalOpen.value = false
    showToast(`Preço de ${editingProduct.value.name} atualizado!`)
  }
}

const isCreateProductOpen = ref(false)
function handleCreateProduct(payload: any) {
  createProduct(payload)
  refreshLocalOverrides()
  if (typeof refresh === 'function') {
    refresh()
  }
  isCreateProductOpen.value = false
  showToast('Novo item cadastrado com sucesso!')
}

function handleDeleteProduct(productId: string, productName: string) {
  if (confirm(`Deseja realmente excluir "${productName}" do catálogo?`)) {
    deleteProduct(productId)
    refreshLocalOverrides()
    if (typeof refresh === 'function') {
      refresh()
    }
    showToast(`"${productName}" excluído do catálogo.`)
  }
}

const isOptionsModalOpen = ref(false)
const optionsProduct = ref<Product | null>(null)

function openOptionsModal(product: Product) {
  optionsProduct.value = product
  isOptionsModalOpen.value = true
}

function toggleOptionStatus(optionId: string, currentAvailable: boolean) {
  toggleOptionAvailability(optionId, !currentAvailable)
  refreshLocalOverrides()
  showToast(currentAvailable ? 'Opcional pausado!' : 'Opcional reativado!')
}

// 6. Agenda & Especialistas
const professionalsList = computed(() => {
  return (tenant.value?.professionals || []) as any[]
})

const selectedAgendaDate = ref(new Date().toISOString().split('T')[0])
const sampleSlots = ref(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'])

function isSlotBlocked(slot: string): boolean {
  const blocked = localOverrides.value?.blockedSlots || []
  return blocked.some((b) => b.date === selectedAgendaDate.value && b.time === slot)
}

function handleProfAvailabilityToggle(profId: string, currentAvailable: boolean, name: string) {
  toggleProfessionalAvailability(profId, !currentAvailable)
  refreshLocalOverrides()
  showToast(`Status de ${name} atualizado!`)
}

function handleProfDayToggle(profId: string, dayIndex: number, name: string) {
  const currentDays = localOverrides.value?.professionals?.[profId]?.availableDays || [1, 2, 3, 4, 5]
  const updatedDays = currentDays.includes(dayIndex)
    ? currentDays.filter((d) => d !== dayIndex)
    : [...currentDays, dayIndex]
  updateProfessionalDays(profId, updatedDays)
  refreshLocalOverrides()
}

function handleProfWorkHoursChange(profId: string, workHours: { start: string; end: string }, name: string) {
  updateProfessionalHours(profId, workHours)
  refreshLocalOverrides()
}

function handleProfLunchChange(profId: string, lunchBreak: { start: string; end: string; enabled: boolean }, name: string) {
  updateProfessionalLunch(profId, lunchBreak)
  refreshLocalOverrides()
}

const isCreateProfOpen = ref(false)
function openCreateProfModal() {
  isCreateProfOpen.value = true
}

function handleCreateProf(payload: any) {
  createProfessional(payload)
  refreshLocalOverrides()
  isCreateProfOpen.value = false
  showToast('Novo especialista cadastrado!')
}

function handleDeleteProf(profId: string, profName: string) {
  if (confirm(`Deseja remover ${profName} da equipe?`)) {
    deleteProfessional(profId)
    refreshLocalOverrides()
    showToast(`${profName} removido da equipe.`)
  }
}

function handleSlotToggle(date: string, time: string) {
  const isBlocked = toggleBlockSlot(date, time)
  refreshLocalOverrides()
  showToast(isBlocked ? `Horário ${time} bloqueado!` : `Horário ${time} liberado!`)
}

// 7. Pix & Contatos
const pixConfigInput = ref({
  keyType: 'phone' as 'cpf' | 'cnpj' | 'phone' | 'email' | 'random',
  pixKey: '',
  beneficiary: '',
  city: ''
})

const contactInput = ref({
  whatsapp: '',
  instagram: ''
})

function loadPixAndContactFromOverrides() {
  const ov = localOverrides.value || {}
  const basePix = tenant.value?.pixConfig || (tenant.value as any)?.pix || {}
  pixConfigInput.value = {
    keyType: ov.pix?.keyType || basePix.keyType || 'phone',
    pixKey: ov.pix?.pixKey || basePix.key || basePix.pixKey || '',
    beneficiary: ov.pix?.beneficiary || basePix.beneficiary || tenant.value?.name || '',
    city: ov.pix?.city || basePix.city || 'SAO PAULO'
  }

  contactInput.value = {
    whatsapp: ov.contact?.whatsapp || tenant.value?.phoneWhatsApp || '',
    instagram: ov.contact?.instagram || (tenant.value as any)?.instagram || ''
  }
}

function savePixConfig() {
  updatePixConfig(pixConfigInput.value)
  refreshLocalOverrides()
  showToast('Configurações Pix salvas com sucesso!')
}

function saveContactConfig() {
  updateContact(contactInput.value)
  refreshLocalOverrides()
  showToast('Contatos salvos com sucesso!')
}

// 8. Horários & Pausa Geral
const weeklyDaysConfig = ref<Array<{ key: string; label: string; closed: boolean; open: string; close: string }>>([])
const scheduleSuccessMsg = ref('')

function loadScheduleFromOverrides() {
  const ov = localOverrides.value || {}
  const baseHours = (tenant.value?.openingHours || {}) as Record<string, DaySchedule> & { open?: string; close?: string }
  const overrideHours = ov.openingHours || {}
  const days = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ]

  weeklyDaysConfig.value = days.map((d) => {
    const dOverride = (overrideHours as any)[d.key]
    const dBase = (baseHours as any)[d.key]
    return {
      key: d.key,
      label: d.label,
      open: dOverride?.open || dBase?.open || baseHours.open || '09:00',
      close: dOverride?.close || dBase?.close || baseHours.close || '22:00',
      closed: dOverride?.closed ?? dBase?.closed ?? false
    }
  })
}

function toggleEmergencyPause() {
  const nextVal = !isEmergencyClosed.value
  updateEmergency(nextVal, '')
  refreshLocalOverrides()
  showToast(nextVal ? 'Atendimento emergencial pausado!' : 'Atendimento reativado!')
}

function toggleDayClosed(day: any) {
  day.closed = !day.closed
}

async function saveWeeklySchedule() {
  const schedule: Record<string, DaySchedule> = {}
  weeklyDaysConfig.value.forEach((d) => {
    schedule[d.key] = {
      open: d.open,
      close: d.close,
      closed: d.closed
    }
  })
  await updateWeeklySchedule(schedule)
  refreshLocalOverrides()
  if (typeof refresh === 'function') {
    await refresh()
  }
  scheduleSuccessMsg.value = 'Horários atualizados com sucesso!'
  showToast('Horários de funcionamento atualizados!')
  setTimeout(() => {
    scheduleSuccessMsg.value = ''
  }, 3000)
}

// 9. Delivery & Taxas
const deliveryFeeInput = ref(5)
const minOrderInput = ref(20)
const estimatedTimeInput = ref('30-45 min')

function loadDeliveryFromOverrides() {
  const ov = localOverrides.value?.delivery || {}
  deliveryFeeInput.value = ov.deliveryFee !== undefined ? ov.deliveryFee : Number(tenant.value?.deliveryFee ?? 6.0)
  minOrderInput.value = ov.minOrderValue !== undefined ? ov.minOrderValue : Number(tenant.value?.minOrderValue ?? 0)
  estimatedTimeInput.value = ov.estimatedTime || tenant.value?.estimatedTime || '30-45 min'
}

function saveDeliveryConfig() {
  updateDelivery({
    deliveryFee: Number(deliveryFeeInput.value),
    minOrderValue: Number(minOrderInput.value),
    estimatedTime: estimatedTimeInput.value
  })
  refreshLocalOverrides()
  showToast('Regras de delivery atualizadas!')
}

// 10. Comunicado Oficial
const announcementEnabled = ref(false)
const announcementMessage = ref('')

function loadAnnouncementFromOverrides() {
  const ov = localOverrides.value?.announcement || {}
  announcementEnabled.value = ov.enabled !== undefined ? ov.enabled : Boolean(tenant.value?.announcement?.enabled)
  announcementMessage.value = ov.message || tenant.value?.announcement?.message || ''
}

function saveAnnouncementConfig() {
  updateAnnouncement({
    enabled: announcementEnabled.value,
    message: announcementMessage.value
  })
  refreshLocalOverrides()
  showToast('Comunicado salvo!')
}

// 11. Segurança & PIN
const pinSuccessMsg = ref('')
async function saveNewPin(newPin: string, currentPin?: string) {
  const ok = await changePin(newPin, currentPin)
  if (ok) {
    pinSuccessMsg.value = 'PIN alterado com sucesso!'
    showToast('PIN de segurança atualizado!')
    setTimeout(() => {
      pinSuccessMsg.value = ''
    }, 3000)
  }
}

// 12. Lifecycle Loaders & Sincronização
onMounted(() => {
  refreshLocalOverrides()
  loadPixAndContactFromOverrides()
  loadScheduleFromOverrides()
  loadDeliveryFromOverrides()
  loadAnnouncementFromOverrides()

  if (typeof window !== 'undefined') {
    window.addEventListener('alaska_overrides_updated', refreshLocalOverrides)
  }
})

watch(tenant, () => {
  loadPixAndContactFromOverrides()
  loadScheduleFromOverrides()
  loadDeliveryFromOverrides()
  loadAnnouncementFromOverrides()
})
</script>
