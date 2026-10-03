<!-- pages/[slug]/admin.vue -->
<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
    <ClientOnly>
      <!-- 1. Tela de Login Corporativo com E-mail e Senha (ADR 017) -->
      <AdminLoginCard
        v-if="!isAuthenticated"
        :slug="slug"
        :error-message="errorMessage"
        :is-submitting="isSubmitting"
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
          :professionals="professionals"
          :is-health-store="isHealthStore"
          :blocked-slots="blockedSlots"
          @toggle-prof="handleToggleProf"
          @edit-schedule="openScheduleModal"
          @create-prof="openCreateProfModal"
          @delete-prof="handleDeleteProf"
          @toggle-block-slot="handleToggleBlockSlot"
        />

        <!-- ABA 3: Pix & Contato -->
        <AdminPixContactTab
          v-else-if="activeTab === 'pix_contact'"
          :pix-input="pixInput"
          :contact-input="contactInput"
          @save-pix="savePixConfig"
          @save-contact="saveContactConfig"
        />

        <!-- ABA 4: Horários Semanais & Pausa de Emergência -->
        <AdminHoursTab
          v-else-if="activeTab === 'hours'"
          :weekly-schedule="weeklySchedule"
          :is-emergency-closed="isEmergencyClosed"
          :emergency-message="emergencyMessage"
          @update-schedule="saveScheduleConfig"
          @toggle-emergency="toggleEmergencyMode"
        />

        <!-- ABA 5: Delivery & Taxas -->
        <AdminDeliveryTab
          v-else-if="activeTab === 'delivery' && !isServiceStore"
          :delivery-fee="deliveryFee"
          :min-order-value="minOrderValue"
          :estimated-time="estimatedTime"
          @update:delivery-fee="deliveryFee = $event"
          @update:min-order-value="minOrderValue = $event"
          @update:estimated-time="estimatedTime = $event"
          @save-delivery="saveDeliveryConfig"
        />

        <!-- ABA 6: Comunicado no Topo -->
        <AdminAnnouncementTab
          v-else-if="activeTab === 'announcement'"
          :enabled="announcementEnabled"
          :message="announcementMessage"
          @update:enabled="announcementEnabled = $event"
          @update:message="announcementMessage = $event"
          @save-announcement="saveAnnouncementConfig"
        />

        <!-- ABA 7: Segurança -->
        <AdminSecurityTab
          v-else-if="activeTab === 'security'"
          :password-success-msg="passwordSuccessMsg"
          @change-password="handleChangePassword"
        />

        <!-- MODAIS OPERACIONAIS -->
        <AdminPriceModal
          :is-open="isPriceModalOpen"
          :product="editingProduct"
          :price-input="newPriceInput"
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
          :is-option-paused="isOptionPaused"
          @close="isOptionsModalOpen = false"
          @toggle-option="toggleOptionStatus"
        />
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTenant } from '~/composables/useTenant'
import { useMerchantAdmin } from '~/composables/useMerchantAdmin'
import { useTenantTheme } from '~/composables/useTenantTheme'

// Componentes da Interface Administrativa
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

// Modais Operacionais
import AdminPriceModal from '~/components/admin/modals/AdminPriceModal.vue'
import AdminCreateProductModal from '~/components/admin/modals/AdminCreateProductModal.vue'
import AdminCreateCategoryModal from '~/components/admin/modals/AdminCreateCategoryModal.vue'
import AdminCreateProfModal from '~/components/admin/modals/AdminCreateProfModal.vue'
import AdminOptionsModal from '~/components/admin/modals/AdminOptionsModal.vue'
import type { Product, Category, OrderStatus } from '@alaska/contracts'

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || 'default')
const { tenant, refresh } = useTenant(slug)
const { themeClasses } = useTenantTheme(tenant)

const activeTab = ref<AdminTabKey>('catalog')
const toastMessage = ref('')

function showToast(msg: string) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

// 1. Inicialização do Composable do Lojista
const {
  isAuthenticated,
  merchantUser,
  merchantToken,
  isSubmitting,
  errorMessage,
  overridesKey,
  login,
  logout,
  changePassword,
  changePin,
  createCategory,
  deleteCategory,
  getEffectiveCategories,
  getOverrides,
  saveOverrides,
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
  toggleProfessionalDay,
  updateProfessionalHours,
  updateProfessionalLunch,
  toggleBlockSlot,
  createProfessional,
  deleteProfessional,
  updatePixConfig,
  updateContact,
} = useMerchantAdmin(slug)

// 2. Estado de Overrides Reativo no Cliente
const localOverrides = ref(getOverrides())

function refreshLocalOverrides() {
  localOverrides.value = getOverrides()
}

// 3. Tipos e Segmentos de Loja
const isServiceStore = computed(() => {
  const cat = tenant.value?.businessCategory
  return cat === 'hub' || cat === 'pro' || slug.value === 'barbearia-style' || slug.value === 'clinica-sorriso'
})

const isHealthStore = computed(() => {
  const cat = tenant.value?.businessCategory
  return cat === 'pro' || slug.value === 'clinica-sorriso'
})

// 4. Autenticação e Login Corporativo
async function handleLogin(credentialsOrPin: any) {
  const success = await login(credentialsOrPin)
  if (success) {
    refreshLocalOverrides()
    showToast('Acesso concedido ao painel!')
  }
}

// 5. Gestão de Pedidos em Tempo Real (Mural ADR 024)
const orders = ref<any[]>([])
const pendingOrdersCount = computed(() => orders.value.filter(o => o.status === 'pending').length)

const orderStats = computed(() => {
  const list = orders.value
  return {
    total: list.length,
    pending: list.filter(o => o.status === 'pending').length,
    confirmed: list.filter(o => o.status === 'confirmed').length,
    dispatched: list.filter(o => o.status === 'dispatched').length,
    delivered: list.filter(o => o.status === 'delivered').length,
  }
})

function handleOrderStatusUpdate(orderId: string, newStatus: OrderStatus) {
  const ord = orders.value.find(o => o.id === orderId)
  if (ord) {
    ord.status = newStatus
    showToast(`Pedido #${orderId.slice(-4)} atualizado para ${newStatus}`)
  }
}

function handleOrderWhatsAppNotify(order: any) {
  showToast(`Notificando cliente do pedido #${order.id.slice(-4)} via WhatsApp`)
}

// 6. Catálogo de Produtos e Serviços Efetivos
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
  if (product.isAvailable !== undefined) return product.isAvailable
  return true
}

async function handleProductAvailabilityToggle(productOrList: any, productId?: string) {
  let targetProduct: Product | undefined

  if (typeof productOrList === 'object' && productOrList !== null && 'id' in productOrList) {
    targetProduct = productOrList as Product
  } else if (typeof productId === 'string') {
    for (const cat of categories.value) {
      const found = (cat.products || []).find(p => p.id === productId)
      if (found) {
        targetProduct = found
        break
      }
    }
  }

  if (!targetProduct) return
  const currentStatus = isProductAvailable(targetProduct)
  await toggleProductAvailability(targetProduct.id, currentStatus)
  refreshLocalOverrides()
  if (typeof refresh === 'function') {
    await refresh()
  }
}

// Modal de Preço
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

function confirmPriceEdit(newPrice: number) {
  if (editingProduct.value) {
    updateProductPrice([], editingProduct.value.id, newPrice)
    refreshLocalOverrides()
    if (typeof refresh === 'function') {
      refresh()
    }
    isPriceModalOpen.value = false
    showToast(`Preço de ${editingProduct.value.name} atualizado!`)
  }
}

const isCreateProductOpen = ref(false)
let isCreatingProduct = false
function handleCreateProduct(payload: any) {
  if (isCreatingProduct) return
  isCreatingProduct = true
  try {
    createProduct(payload)
    refreshLocalOverrides()
    if (typeof refresh === 'function') {
      refresh()
    }
    isCreateProductOpen.value = false
    showToast('Novo item cadastrado com sucesso!')
  } finally {
    setTimeout(() => {
      isCreatingProduct = false
    }, 600)
  }
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

function toggleOptionStatus(optionId: string, currentAvailable: boolean) {
  toggleOptionAvailability(optionId, currentAvailable)
  refreshLocalOverrides()
}

function isOptionPaused(optionId: string): boolean {
  const paused = localOverrides.value?.pausedOptionIds || []
  return paused.includes(optionId)
}

// 7. Equipe e Especialistas
const professionals = computed(() => {
  const base = tenant.value?.professionals || []
  const overrides = localOverrides.value || {}
  const deleted = new Set(overrides.deletedProfessionalIds || [])
  const custom = overrides.customProfessionals || []

  return [...base.filter((p: any) => !deleted.has(p.id)), ...custom].map((prof: any) => {
    const profOv = overrides.professionals?.[prof.id]
    return {
      ...prof,
      isAvailable: profOv?.isAvailable !== undefined ? profOv.isAvailable : prof.isAvailable,
      availableDays: profOv?.availableDays || prof.availableDays,
      workHours: profOv?.workHours || prof.workHours,
      lunchBreak: profOv?.lunchBreak || prof.lunchBreak,
    }
  })
})

function handleToggleProf(prof: any) {
  toggleProfessionalAvailability(prof.id, !prof.isAvailable)
  refreshLocalOverrides()
}

function openScheduleModal(prof: any) {
  // Configuração rápida de expediente
}

const isCreateProfOpen = ref(false)
function openCreateProfModal() {
  isCreateProfOpen.value = true
}

function handleCreateProf(payload: any) {
  createProfessional(payload)
  refreshLocalOverrides()
  isCreateProfOpen.value = false
  showToast('Profissional cadastrado!')
}

function handleDeleteProf(profId: string) {
  if (confirm('Deseja realmente remover este especialista?')) {
    deleteProfessional(profId)
    refreshLocalOverrides()
    showToast('Especialista removido.')
  }
}

const blockedSlots = computed(() => localOverrides.value?.blockedSlots || [])

function handleToggleBlockSlot(date: string, time: string, isBlocked: boolean) {
  toggleBlockSlot(date, time, isBlocked)
  refreshLocalOverrides()
}

// 8. Pix e Contato
const pixInput = ref({
  keyType: 'cnpj',
  pixKey: '',
  beneficiary: '',
  city: '',
})

const contactInput = ref({
  whatsapp: '',
  instagram: '',
})

function loadPixAndContactFromOverrides() {
  const ov = localOverrides.value
  if (ov?.pix) {
    pixInput.value = {
      keyType: ov.pix.keyType || 'cnpj',
      pixKey: ov.pix.pixKey || '',
      beneficiary: ov.pix.beneficiary || '',
      city: ov.pix.city || '',
    }
  } else if (tenant.value?.pixConfig) {
    pixInput.value = {
      keyType: tenant.value.pixConfig.keyType || 'cnpj',
      pixKey: tenant.value.pixConfig.pixKey || '',
      beneficiary: tenant.value.pixConfig.beneficiary || '',
      city: tenant.value.pixConfig.city || '',
    }
  }

  if (ov?.contact) {
    contactInput.value = {
      whatsapp: ov.contact.whatsapp || '',
      instagram: ov.contact.instagram || '',
    }
  } else if (tenant.value) {
    contactInput.value = {
      whatsapp: tenant.value.phoneWhatsApp || '',
      instagram: (tenant.value as any).instagram || '',
    }
  }
}

function savePixConfig() {
  updatePixConfig(pixInput.value as any)
  refreshLocalOverrides()
  showToast('Configurações Pix salvas com sucesso!')
}

function saveContactConfig() {
  updateContact(contactInput.value)
  refreshLocalOverrides()
  showToast('Contatos comerciais salvos com sucesso!')
}

// 9. Horários Operacionais
const weeklySchedule = ref<any>({})

function loadScheduleFromOverrides() {
  if (localOverrides.value?.openingHours) {
    weeklySchedule.value = JSON.parse(JSON.stringify(localOverrides.value.openingHours))
  } else if (tenant.value?.openingHours) {
    weeklySchedule.value = JSON.parse(JSON.stringify(tenant.value.openingHours))
  }
}

function saveScheduleConfig(updatedSchedule: any) {
  updateWeeklySchedule(updatedSchedule)
  refreshLocalOverrides()
  showToast('Horários de funcionamento atualizados!')
}

// 10. Pausa de Emergência
const isEmergencyClosed = computed(() => {
  return localOverrides.value?.emergency?.isClosed ?? tenant.value?.isEmergencyClosed ?? false
})

const emergencyMessage = computed(() => {
  return localOverrides.value?.emergency?.message || tenant.value?.closedEmergencyMessage || ''
})

function toggleEmergencyMode(closed: boolean, message?: string) {
  updateEmergency(closed, message)
  refreshLocalOverrides()
  showToast(closed ? 'Loja pausada temporariamente!' : 'Loja reaberta com sucesso!')
}

// 11. Delivery e Taxas
const deliveryFee = ref(6)
const minOrderValue = ref(0)
const estimatedTime = ref('30-45 min')

function loadDeliveryFromOverrides() {
  const ov = localOverrides.value?.delivery
  if (ov) {
    deliveryFee.value = ov.deliveryFee ?? 6
    minOrderValue.value = ov.minOrderValue ?? 0
    estimatedTime.value = ov.estimatedTime || '30-45 min'
  } else if (tenant.value) {
    deliveryFee.value = tenant.value.deliveryFee ?? 6
    minOrderValue.value = tenant.value.minOrderValue ?? 0
    estimatedTime.value = tenant.value.estimatedTime || '30-45 min'
  }
}

function saveDeliveryConfig() {
  updateDelivery({
    deliveryFee: Number(deliveryFee.value),
    minOrderValue: Number(minOrderValue.value),
    estimatedTime: estimatedTime.value,
  })
  refreshLocalOverrides()
  showToast('Regras de entrega atualizadas!')
}

// 12. Comunicado no Topo
const announcementEnabled = ref(false)
const announcementMessage = ref('')

function loadAnnouncementFromOverrides() {
  const ov = localOverrides.value?.announcement
  if (ov) {
    announcementEnabled.value = ov.enabled ?? false
    announcementMessage.value = ov.message || ''
  } else if (tenant.value?.announcement) {
    announcementEnabled.value = tenant.value.announcement.enabled ?? false
    announcementMessage.value = tenant.value.announcement.message || ''
  }
}

function saveAnnouncementConfig() {
  updateAnnouncement({
    enabled: announcementEnabled.value,
    message: announcementMessage.value,
  })
  refreshLocalOverrides()
  showToast('Comunicado atualizado na vitrine!')
}

// 13. Troca de Senha Corporativa (ADR 017)
const passwordSuccessMsg = ref('')

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

// 14. Lifecycle Loaders & Sincronização
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
