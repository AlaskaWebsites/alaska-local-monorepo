<!-- pages/[slug]/admin.vue -->
<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
    <ClientOnly>
      <!-- 1. Tela de Login por Credenciais ou PIN (ADR 017) -->
      <AdminLoginCard
        v-if="!isAuthenticated"
        :error-message="errorMessage"
        :is-submitting="isSubmitting"
        :slug="slug"
        @login="handleLogin"
      />

      <!-- 2. Painel Operacional Ativo -->
      <div v-else class="max-w-4xl mx-auto space-y-6">
        <!-- Toast de Notificação -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform -translate-y-4 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-4 opacity-0"
        >
          <div
            v-if="toastMessage"
            class="fixed top-4 right-4 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs"
          >
            <span>⚡</span>
            <span>{{ toastMessage }}</span>
          </div>
        </Transition>

        <!-- Top Header com Status e Ações -->
        <AdminTopHeader
          :slug="slug"
          :store-name="tenant?.name || 'Painel do Lojista'"
          :is-emergency-closed="isEmergencyClosed"
          @logout="logout"
        />

        <!-- Navegação por Abas com Rolagem Lateral Suave -->
        <AdminTabsNav
          v-model="activeTab"
          :is-service-store="isServiceStore"
          :is-health-store="isHealthStore"
          :pending-orders-count="pendingOrdersCount"
        />

        <!-- ABA 0: Mural de Pedidos em Tempo Real (ADR 024) -->
        <AdminOrdersTab
          v-if="activeTab === 'orders'"
          :orders="orders"
          :stats="orderStats"
          :slug="slug"
          :store-phone="tenant?.phoneWhatsApp || ''"
          @update-status="handleOrderStatusUpdate"
          @notify-whatsapp="handleOrderWhatsAppNotify"
        />

        <!-- ABA 1: Catálogo e Serviços (Pausa, Criação, Exclusão e Preços) -->
        <AdminCatalogTab
          v-else-if="activeTab === 'catalog'"
          :categories="categories"
          :is-service-store="isServiceStore"
          :is-product-available="isProductAvailable"
          :get-product-price="getProductPrice"
          @create-product="isCreateProductOpen = true"
          @create-category="isCreateCategoryOpen = true"
          @delete-category="handleDeleteCategory"
          @toggle-product="handleProductAvailabilityToggle"
          @edit-price="openPriceModal"
          @manage-options="openOptionsModal"
          @delete-product="handleDeleteProduct"
        />

        <!-- ABA 2: Equipe & Agenda (Exclusivo Hub & Pro) -->
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

        <!-- ABA 7: Segurança -->
        <AdminSecurityTab
          v-else-if="activeTab === 'security'"
          :password-success-msg="passwordSuccessMsg"
          @change-password="handleChangePassword"
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
          @open-create-category="isCreateCategoryOpen = true"
          @create="handleCreateProduct"
          @submit="handleCreateProduct"
        />

        <AdminCreateCategoryModal
          :is-open="isCreateCategoryOpen"
          @close="isCreateCategoryOpen = false"
          @submit="handleCreateCategory"
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
import AdminCreateCategoryModal from '~/components/admin/modals/AdminCreateCategoryModal.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useMerchantAdmin, type TenantOverrides } from '~/composables/useMerchantAdmin'
import { useOrderDashboard } from '~/composables/useOrderDashboard'
import { useTenantTheme } from '~/composables/useTenantTheme'
import AdminLoginCard from '~/components/admin/AdminLoginCard.vue'
import AdminTopHeader from '~/components/admin/AdminTopHeader.vue'
import AdminTabsNav, { type AdminTabKey } from '~/components/admin/AdminTabsNav.vue'
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
import type { Product, Category, OrderStatus } from '@alaska/contracts'

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'default')
const { tenant, refresh } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)

const {
  isAuthenticated,
  merchantUser,
  merchantToken,
  isSubmitting,
  errorMessage,
  login,
  logout,
  changePassword,
  changePin,
  createCategory,
  deleteCategory,
  getEffectiveCategories,
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
  createProfessional,
  deleteProfessional,
  updatePixConfig,
  updateContact,
  toggleSlotBlock,
  isSlotBlocked
} = useMerchantAdmin(slug)

const {
  orders,
  stats: orderStats,
  pendingCount: pendingOrdersCount,
  updateStatus: updateOrderStatus,
  notifyCustomerWhatsApp: notifyCustomerOrderWhatsApp
} = useOrderDashboard(slug)

const activeTab = ref<AdminTabKey>('orders')
const toastMessage = ref('')

function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 2500)
}

// 2. Autenticação Corporativa e PIN (ADR 017)
async function handleLogin(credentialsOrPin: any) {
  const success = await login(credentialsOrPin)
  if (success) {
    refreshLocalOverrides()
    loadPixAndContactFromOverrides()
    showToast('Acesso autorizado! Bem-vindo.')
  }
}

// 3. Gestão e Sincronização de Overrides Locais
const localOverrides = ref<TenantOverrides>({})

function refreshLocalOverrides() {
  localOverrides.value = getOverrides()
}

// 4. Catálogo Reativo com Resolução de Preço e Disponibilidade (ADR 018)
const isServiceStore = computed(() => {
  const cat = tenant.value?.category
  return cat === 'hub' || cat === 'pro'
})

const isHealthStore = computed(() => {
  return tenant.value?.category === 'pro'
})

const categories = computed<Category[]>(() => {
  const base = (tenant.value?.categories || []) as Category[]
  return getEffectiveCategories(base)
})

function getProductPrice(product: Product): number {
  const prodOverrides = localOverrides.value?.products
  if (prodOverrides?.[product.id]?.price !== undefined) {
    return prodOverrides[product.id].price!
  }
  return product.price
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
const newPriceInput = ref(0)

function openPriceModal(categoryProductsOrProduct: any, product?: Product) {
  if (product) {
    editingProduct.value = product
    newPriceInput.value = getProductPrice(product)
    isPriceModalOpen.value = true
  } else if (categoryProductsOrProduct && 'id' in categoryProductsOrProduct) {
    editingProduct.value = categoryProductsOrProduct
    newPriceInput.value = getProductPrice(categoryProductsOrProduct)
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

// Categoria Dinâmica (ADR 026)
const isCreateCategoryOpen = ref(false)

function handleCreateCategory(payload: { name: string; icon?: string }) {
  const newCat = createCategory(payload)
  refreshLocalOverrides()
  if (typeof refresh === 'function') {
    refresh()
  }
  isCreateCategoryOpen.value = false
  showToast(`Categoria "${newCat.name}" criada com sucesso!`)
}

function handleDeleteCategory(categoryId: string, categoryName: string) {
  if (confirm(`Deseja realmente excluir a categoria "${categoryName}"?`)) {
    deleteCategory(categoryId)
    refreshLocalOverrides()
    if (typeof refresh === 'function') {
      refresh()
    }
    showToast(`Categoria "${categoryName}" excluída.`)
  }
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

function toggleOptionStatus(optionId: string) {
  const currentOverrides = getOverrides()
  const paused = new Set(currentOverrides.pausedOptionIds || [])
  const isCurrentlyPaused = paused.has(optionId)
  toggleOptionAvailability(optionId, isCurrentlyPaused)
  refreshLocalOverrides()
  showToast(isCurrentlyPaused ? 'Opcional reativado!' : 'Opcional pausado!')
}

// 6. Agenda & Equipe
const selectedAgendaDate = ref(new Date().toISOString().split('T')[0])
const sampleSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
]

const professionalsList = computed(() => {
  const baseProfs = (tenant.value?.professionals || []) as any[]
  const profOverrides = localOverrides.value?.professionals || {}
  const deletedProfIds = new Set(localOverrides.value?.deletedProfessionalIds || [])
  const customProfs = localOverrides.value?.customProfessionals || []

  const activeProfs = [
    ...baseProfs.filter((p) => !deletedProfIds.has(p.id)),
    ...customProfs.filter((p) => !deletedProfIds.has(p.id))
  ]

  return activeProfs.map((prof) => {
    const override = profOverrides[prof.id]
    return {
      ...prof,
      isAvailable: override?.isAvailable !== undefined ? override.isAvailable : prof.isAvailable,
      availableDays: override?.availableDays ? [...override.availableDays] : (prof.availableDays ? [...prof.availableDays] : [1, 2, 3, 4, 5]),
      workHours: override?.workHours ? { ...override.workHours } : (prof.workHours ? { ...prof.workHours } : { start: '08:00', end: '18:00' }),
      lunchBreak: override?.lunchBreak ? { ...override.lunchBreak } : (prof.lunchBreak ? { ...prof.lunchBreak } : { start: '12:00', end: '13:00', enabled: true })
    }
  })
})

function handleProfAvailabilityToggle(profId: string, currentStatus: boolean, name: string) {
  toggleProfessionalAvailability(profId, !currentStatus)
  refreshLocalOverrides()
  showToast(`Status de ${name} alterado!`)
}

function handleProfDayToggle(profId: string, dayIndex: number, name: string) {
  const currentProfs = localOverrides.value?.professionals || {}
  const currentDays = currentProfs[profId]?.availableDays || [1, 2, 3, 4, 5]
  const updatedDays = currentDays.includes(dayIndex)
    ? currentDays.filter((d: number) => d !== dayIndex)
    : [...currentDays, dayIndex]
  updateProfessionalDays(profId, updatedDays)
  refreshLocalOverrides()
  showToast(`Escala semanal de ${name} atualizada!`)
}

function handleProfWorkHoursChange(profId: string, workHours: { start: string; end: string }, name: string) {
  updateProfessionalHours(profId, workHours)
  refreshLocalOverrides()
  showToast(`Horário de expediente de ${name} atualizado!`)
}

function handleProfLunchChange(profId: string, lunchBreak: { start: string; end: string; enabled: boolean }, name: string) {
  updateProfessionalLunch(profId, lunchBreak)
  refreshLocalOverrides()
  showToast(`Horário de almoço de ${name} atualizado!`)
}

const isCreateProfOpen = ref(false)
function openCreateProfModal() {
  isCreateProfOpen.value = true
}

function handleCreateProf(payload: any) {
  createProfessional(payload)
  refreshLocalOverrides()
  isCreateProfOpen.value = false
  showToast('Novo especialista adicionado à equipe!')
}

function handleDeleteProf(profId: string, name: string) {
  if (confirm(`Deseja remover "${name}" da equipe?`)) {
    deleteProfessional(profId)
    refreshLocalOverrides()
    showToast(`"${name}" removido da equipe.`)
  }
}

function handleSlotToggle(date: string, time: string) {
  const isBlocked = toggleSlotBlock(date, time)
  refreshLocalOverrides()
  showToast(isBlocked ? `Horário ${time} bloqueado!` : `Horário ${time} liberado!`)
}

// 7. Mural de Pedidos em Tempo Real (ADR 024)
function handleOrderStatusUpdate(orderId: string, newStatus: OrderStatus) {
  updateOrderStatus(orderId, newStatus)
  showToast(`Pedido #${orderId.slice(-4)} atualizado para ${newStatus}!`)
}

function handleOrderWhatsAppNotify(orderId: string) {
  notifyCustomerOrderWhatsApp(orderId)
  showToast('Abrindo WhatsApp do cliente...')
}

// 8. Pix & Contato
const pixConfigInput = ref({
  keyType: 'cpf',
  pixKey: '',
  beneficiary: '',
  city: 'SAO PAULO'
})

const contactInput = ref({
  whatsapp: '',
  instagram: ''
})

function loadPixAndContactFromOverrides() {
  const ov = localOverrides.value
  const tPix = tenant.value?.pixConfig
  pixConfigInput.value = {
    keyType: ov.pix?.keyType || tPix?.keyType || 'cpf',
    pixKey: ov.pix?.pixKey || tPix?.pixKey || '',
    beneficiary: ov.pix?.beneficiary || tPix?.beneficiary || tenant.value?.name || '',
    city: ov.pix?.city || tPix?.city || 'SAO PAULO'
  }
  contactInput.value = {
    whatsapp: ov.contact?.whatsapp || tenant.value?.phoneWhatsApp || (tenant.value as any)?.whatsapp || '',
    instagram: ov.contact?.instagram || tenant.value?.instagram || ''
  }
}

function savePixConfig(payload: any) {
  updatePixConfig(payload)
  refreshLocalOverrides()
  showToast('Chave Pix salva com sucesso!')
}

function saveContactConfig(payload: any) {
  updateContact(payload)
  refreshLocalOverrides()
  showToast('Dados de contato salvos!')
}

// 9. Horários & Pausa Geral
const isEmergencyClosed = computed(() => {
  const ov = localOverrides.value
  if (ov.isEmergencyClosed !== undefined) return ov.isEmergencyClosed
  if (ov.emergency?.isClosed !== undefined) return ov.emergency.isClosed
  return tenant.value?.isEmergencyClosed || false
})

const weeklyDaysConfig = ref<any>({})
const scheduleSuccessMsg = ref('')

function loadScheduleFromOverrides() {
  const ov = localOverrides.value?.openingHours
  const tHours = tenant.value?.openingHours as any
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const cfg: any = {}
  for (const d of days) {
    const o = ov?.[d]
    const t = tHours?.[d]
    cfg[d] = {
      open: o?.open || t?.open || '09:00',
      close: o?.close || t?.close || '19:00',
      closed: o?.closed !== undefined ? o.closed : (t?.closed !== undefined ? t.closed : false)
    }
  }
  weeklyDaysConfig.value = cfg
}

function toggleEmergencyPause() {
  const nextVal = !isEmergencyClosed.value
  updateEmergency(nextVal, nextVal ? 'Estamos em pausa operacional no momento.' : '')
  refreshLocalOverrides()
  showToast(nextVal ? '🚨 Loja fechada em modo emergência!' : '🟢 Loja reaberta com sucesso!')
}

function toggleDayClosed(dayKey: string) {
  if (!weeklyDaysConfig.value[dayKey]) return
  weeklyDaysConfig.value[dayKey].closed = !weeklyDaysConfig.value[dayKey].closed
}

function saveWeeklySchedule(schedule: any) {
  updateWeeklySchedule(schedule)
  refreshLocalOverrides()
  scheduleSuccessMsg.value = 'Horários atualizados com sucesso!'
  showToast('Escala semanal salva!')
  setTimeout(() => {
    scheduleSuccessMsg.value = ''
  }, 3500)
}

// 10. Delivery & Taxas
const deliveryFeeInput = ref(5)
const minOrderInput = ref(20)
const estimatedTimeInput = ref('30-45 min')

function loadDeliveryFromOverrides() {
  const ov = localOverrides.value?.delivery
  const t = tenant.value
  deliveryFeeInput.value = ov?.deliveryFee !== undefined ? ov.deliveryFee : (t?.deliveryFee !== undefined ? t.deliveryFee / 100 : 5)
  minOrderInput.value = ov?.minOrderValue !== undefined ? ov.minOrderValue : (t?.minOrder !== undefined ? t.minOrder / 100 : 20)
  estimatedTimeInput.value = ov?.estimatedTime || t?.estimatedTime || '30-45 min'
}

function saveDeliveryConfig() {
  updateDelivery({
    deliveryFee: Number(deliveryFeeInput.value) || 0,
    minOrderValue: Number(minOrderInput.value) || 0,
    estimatedTime: estimatedTimeInput.value
  })
  refreshLocalOverrides()
  showToast('Regras de delivery salvas!')
}

// 11. Comunicado
const announcementEnabled = ref(false)
const announcementMessage = ref('')

function loadAnnouncementFromOverrides() {
  const ov = localOverrides.value?.announcement
  const t = tenant.value as any
  announcementEnabled.value = ov?.enabled !== undefined ? ov.enabled : Boolean(t?.announcementEnabled)
  announcementMessage.value = ov?.message || t?.announcementMessage || ''
}

function saveAnnouncementConfig() {
  updateAnnouncement({
    enabled: announcementEnabled.value,
    message: announcementMessage.value
  })
  refreshLocalOverrides()
  showToast('Comunicado salvo!')
}

// 12. Segurança, PIN e Senha Corporativa (ADR 017)
const pinSuccessMsg = ref('')
const passwordSuccessMsg = ref('')

async function saveNewPin(newPin: string, currentPin?: string) {
  const ok = await changePin(newPin, currentPin)
  if (ok) {
    pinSuccessMsg.value = 'PIN alterado com sucesso!'
    showToast('PIN de segurança atualizado!')
    setTimeout(() => {
      pinSuccessMsg.value = ''
    }, 3500)
  } else {
    showToast('Falha ao atualizar PIN de segurança.')
  }
}

async function handleChangePassword(payload: { currentPassword: string; newPassword: string; confirmPassword: string }) {
  const res = await changePassword(payload)
  if (res.success) {
    passwordSuccessMsg.value = res.message || 'Senha corporativa alterada com sucesso!'
    showToast('Senha atualizada com sucesso!')
    setTimeout(() => {
      passwordSuccessMsg.value = ''
    }, 3500)
  } else {
    showToast(res.message || 'Erro ao alterar senha.')
  }
}

// 13. Lifecycle Loaders & Sincronização
onMounted(() => {
  refreshLocalOverrides()
  loadPixAndContactFromOverrides()
  loadScheduleFromOverrides()
  loadDeliveryFromOverrides()
  loadAnnouncementFromOverrides()

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', refreshLocalOverrides)
    window.addEventListener('alaska_overrides_updated', refreshLocalOverrides)
  }
})

watch(
  tenant,
  () => {
    refreshLocalOverrides()
    loadPixAndContactFromOverrides()
    loadScheduleFromOverrides()
    loadDeliveryFromOverrides()
    loadAnnouncementFromOverrides()
  },
  { deep: true }
)
</script>
