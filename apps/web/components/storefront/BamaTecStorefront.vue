<!-- apps/web/components/storefront/BamaTecStorefront.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Tenant } from '~/types'
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCw,
  CheckCircle2,
  Phone,
  ArrowRight,
  ChevronRight,
  Check,
  Factory,
  Box,
  Scale,
  FileText,
  Zap,
  Store,
  ChevronLeft,
  Mail,
  Send,
  Building2,
  User,
  MessageSquare
} from 'lucide-vue-next'

const props = defineProps<{
  tenant?: Tenant | null
}>()

// Metadados reativos com fallback
const storeName = computed(() => props.tenant?.name || 'Bama TEC')
const storeAddress = computed(() => props.tenant?.address || 'Est. São Miguel Arcanjo, 200/320B - Veraneio Maracanã, Itaquaquecetuba - SP')

// Metadados da página para SEO e autoridade B2B
useHead({
  title: 'Bama TEC — Banho de Estanho, Cobre, Zinco e Reforma de Frotas | Itaquaquecetuba',
  meta: [
    {
      name: 'description',
      content: 'Bama TEC Beneficiamento de Metais Ltda — Mais de 10 anos de excelência em tratamento de superfícies e banhos químicos: Estanho (barramentos elétricos e telecomunicações), Cobre, Zinco eletrolítico, tambor rotativo, barras longas e reforma de frotas de carrinhos em Itaquaquecetuba e Grande SP.'
    }
  ]
})

// WhatsApp link generator contextualizado para B2B
const whatsappNumber = computed(() => {
  const raw = props.tenant?.phoneWhatsApp || props.tenant?.whatsapp || '5511988936972'
  const digits = String(raw).replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
})

const whatsappUrl = computed(() => {
  const msg = 'Olá! Visitei a página da Bama TEC e gostaria de solicitar um orçamento para tratamento de superfícies e banhos químicos.'
  return `https://wa.me/${whatsappNumber.value}?text=${encodeURIComponent(msg)}`
})

function getServiceWhatsappUrl(serviceTitle: string) {
  const msg = `Olá! Gostaria de solicitar uma cotação técnica para o serviço de ${serviceTitle} com a Bama TEC.`
  return `https://wa.me/${whatsappNumber.value}?text=${encodeURIComponent(msg)}`
}

// Fallback de imagem industrial
function handleImgError(e: Event) {
  const target = e.target as HTMLImageElement
  if (target) {
    target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%23f1f5f9"><rect width="100%" height="100%" fill="%23f8fafc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="%2394a3b8">⚙️ Bama TEC Beneficiamento de Metais</text></svg>'
  }
}

// 4 Pilares de Itens que atendemos
const itemsHandled = [
  {
    title: 'Barras, Tubos e Perfis Longos',
    category: 'Linha Gancheira Pesada',
    image: '/tenants/bamatec/img/exemplo-escadas-industriais.jpeg',
    desc: 'Tanques industriais compridos preparados para barras de ferro, perfis estruturais, tubulações, escadas e estruturas de serralheria de até 6 metros de comprimento sem emendas.',
    features: ['Até 6 metros sem cortes', 'Camada uniforme sem escorrimentos', 'Zinco eletrolítico, cobre e decapagem'],
    icon: Factory,
    tag: 'Serralheria & Estruturas',
    colorClass: 'text-[#2d7097]',
    borderClass: 'border-[#2d7097]/30 hover:bg-[#2d7097]/10'
  },
  {
    title: 'Peças Pequenas & Fixadores em Tambor',
    category: 'Linha Tambor Rotativo',
    image: '/tenants/bamatec/img/Exemplo-tanque-3.jpeg',
    desc: 'Processamento de alta escala para parafusos, porcas, arruelas, molas, presilhas, rebites e miudezas metálicas. Tratamento uniforme com separação e centrifugação.',
    features: ['Alta capacidade por batelada (kg)', 'Zincagem branca e amarela', 'Custo altamente competitivo para escala'],
    icon: Box,
    tag: 'Autopeças & Metalúrgica',
    colorClass: 'text-[#008b73]',
    borderClass: 'border-[#008b73]/30 hover:bg-[#008b73]/10'
  },
  {
    title: 'Componentes Elétricos & Barramentos',
    category: 'Linha Estanho & Cobre',
    image: '/tenants/bamatec/img/exemplo-barramentos.jpeg',
    desc: 'Estanhagem e cobreamento eletrolítico de alta precisão para barramentos de cobre e alumínio, terminais e componentes elétricos que exigem máxima condutividade e zero oxidação.',
    features: ['Alta condutividade elétrica e térmica', 'Excelente soldabilidade técnica', 'Resistência à corrosão por sulfetação'],
    icon: Zap,
    tag: 'Elétrica & Painéis',
    colorClass: 'text-[#5d5f85]',
    borderClass: 'border-[#5d5f85]/30 hover:bg-[#5d5f85]/10'
  },
  {
    title: 'Carrinhos de Supermercado & Atacarejo',
    category: 'Divisão Frotas & Cargas',
    image: '/tenants/bamatec/img/exemplo-carrinho-atacarejo-1.jpeg',
    desc: 'Engenharia de restauração: desmontagem, decapagem química, solda MIG de reforço, alinhamento em gabarito, banho de zinco espelhado e rodízios novos para carrinhos aramados e plataforma.',
    features: ['Economia de até 70% vs novos', 'Substituição de rodas silenciosas', 'Retirada e entrega em lotes programados'],
    icon: RotateCw,
    tag: 'Atacarejos & Supermercados',
    colorClass: 'text-[#038c4c]',
    borderClass: 'border-[#038c4c]/30 hover:bg-[#038c4c]/10'
  }
]

// Tipos de Banhos Químicos Oferecidos
const bathTypes = [
  {
    name: 'Zinco Eletrolítico (Zincagem)',
    badge: 'Proteção Anticorrosiva',
    color: 'border-[#2d7097]/30 bg-[#2d7097]/5 text-slate-900',
    badgeColor: 'border-[#2d7097]/30 bg-white text-[#2d7097]',
    numberColor: 'bg-[#2d7097]/15 text-[#2d7097]',
    desc: 'O tratamento mais versátil do mercado industrial. Garante proteção catódica ao aço contra oxidação, umidade e intempéries.',
    variants: [
      { name: 'Passivação Azul (Brilhante)', note: 'Aspecto cromado/espelhado de alta estética' },
      { name: 'Passivação Amarela (Trivalente)', note: 'Bicromatizado isento de cromo hexavalente (RoHS)' },
      { name: 'Passivação Preta', note: 'Visual sofisticado e excelente resistência' }
    ]
  },
  {
    name: 'Banho de Cobre (Cobreamento Eletrolítico)',
    badge: 'Condutividade & Base Técnica',
    color: 'border-[#5d5f85]/30 bg-[#5d5f85]/5 text-slate-900',
    badgeColor: 'border-[#5d5f85]/30 bg-white text-[#5d5f85]',
    numberColor: 'bg-[#5d5f85]/15 text-[#5d5f85]',
    desc: 'Excelente condutividade elétrica, térmica e maleabilidade mecânica. Aplicado como camada intermediária de alta aderência para outros banhos ou acabamento técnico para componentes de transmissão elétrica.',
    variants: [
      { name: 'Cobre Alcalino e Ácido', note: 'Nivelamento uniforme de superfícies e ancoragem' },
      { name: 'Barramentos e Contatos Elétricos', note: 'Máxima transferência de corrente sem aquecimento' }
    ]
  },
  {
    name: 'Estanho Eletrolítico (Estanhagem)',
    badge: 'Especialidade Bama TEC',
    color: 'border-[#008b73]/30 bg-[#008b73]/5 text-slate-900',
    badgeColor: 'border-[#008b73]/30 bg-white text-[#008b73]',
    numberColor: 'bg-[#008b73]/15 text-[#008b73]',
    desc: 'Processo de tratamento superficial que confere proteção anticorrosiva superior, condutividade elétrica e térmica de alta precisão. Ideal para barramentos de cobre, telecomunicações e indústrias de alta tecnologia.',
    variants: [
      { name: 'Estanho para Barramentos Blindados', note: 'Alta capacidade de corrente e proteção à sulfetação' },
      { name: 'Eletrônicos e Telecomunicações', note: 'Perfeita soldabilidade e contato elétrico estável' }
    ]
  },
  {
    name: 'Decapagem, Desengraxe & Fosfatização',
    badge: 'Preparação & Ancoragem',
    color: 'border-[#038c4c]/30 bg-[#038c4c]/5 text-slate-900',
    badgeColor: 'border-[#038c4c]/30 bg-white text-[#038c4c]',
    numberColor: 'bg-[#038c4c]/15 text-[#038c4c]',
    desc: 'Remoção química profunda de carepas de laminação, ferrugens consolidadas e óleos industriais, criando a rugosidade ideal para pintura ou proteção oleosa.',
    variants: [
      { name: 'Fosfatização ao Manganês e Zinco', note: 'Retenção de lubrificantes e base para pintura' },
      { name: 'Decapagem Química Ácida', note: 'Limpeza de soldas e oxidações severas' }
    ]
  }
]

// Galeria de Carrinhos e Serviços
const galleryImages = [
  {
    url: '/tenants/bamatec/img/Exemplo-carrinho-1.jpeg',
    title: 'Frotas de Carrinhos de Supermercado',
    subtitle: 'Aramado recuperado com zincagem brilhante e alinhamento em gabarito'
  },
  {
    url: '/tenants/bamatec/img/exemplo-carrinho-atacarejo-1.jpeg',
    title: 'Carrinhos Plataforma para Atacarejo',
    subtitle: 'Chapa de aço zincada e cabeceira tubular para cargas pesadas'
  },
  {
    url: '/tenants/bamatec/img/exemplo-barramentos.jpeg',
    title: 'Barramentos Elétricos Estanhados',
    subtitle: 'Perfis de alta condutividade para painéis e barramentos blindados'
  },
  {
    url: '/tenants/bamatec/img/exemplo-escadas-industriais.jpeg',
    title: 'Escadas Industriais e de Acesso',
    subtitle: 'Lances de escada zincados sob normas de segurança NR-12 e NR-35'
  },
  {
    url: '/tenants/bamatec/img/exemplo-grades-de-protecao.jpeg',
    title: 'Grades de Proteção e Venezianas',
    subtitle: 'Estruturas soldadas de serralheria protegidas contra corrosão e intempéries'
  },
  {
    url: '/tenants/bamatec/img/Exemplo-tanque-2.jpeg',
    title: 'Tanques Industriais de Tratamento',
    subtitle: 'Capacidade para imersão de perfis e barras metálicas de grande porte'
  },
  {
    url: '/tenants/bamatec/img/exemplo-carrinho-atacarejo-2.jpeg',
    title: 'Carrinhos Plataforma em Linha',
    subtitle: 'Acabamento espelhado resistente ao tráfego pesado de atacadistas'
  },
  {
    url: '/tenants/bamatec/img/Exemplo-carrinho-3.jpeg',
    title: 'Lotes Finalizados para Entrega',
    subtitle: 'Revitalização completa com rodízios silenciosos em PU maciço'
  }
]

const storeEmail = computed(() => props.tenant?.email || 'bamatec22@gmail.com')

// Estado do Formulário de Cotação de Leads B2B
const leadForm = ref({
  name: '',
  company: '',
  email: '',
  phone: '',
  service: 'Estanho Eletrolítico (Barramentos / Painéis Elétricos)',
  details: ''
})

const isSubmitting = ref(false)
const isSubmitted = ref(false)
const formError = ref('')

const availableServices = [
  'Estanho Eletrolítico (Barramentos / Painéis Elétricos)',
  'Banho de Cobre (Cobreamento Técnico e Contatos)',
  'Zinco Eletrolítico em Barras Longas (Até 6m)',
  'Zinco em Tambor Rotativo (Fixadores e Peças em kg)',
  'Reforma de Frotas de Carrinhos (Supermercados/Atacarejos)',
  'Decapagem Química, Desengraxe ou Fosfatização',
  'Outro Tratamento Galvânico / Projeto Sob Demanda'
]

const mailtoUrl = computed(() => {
  const subject = `[Cotação B2B Bama TEC] ${leadForm.value.company || leadForm.value.name} - ${leadForm.value.service}`
  const body = `Olá, equipe técnica e comercial da Bama TEC!

Gostaria de solicitar uma cotação para serviços de galvanoplastia e tratamento de superfícies:

DADOS DE CONTATO:
• Nome: ${leadForm.value.name}
• Empresa: ${leadForm.value.company || 'Não informada'}
• E-mail: ${leadForm.value.email}
• Telefone/WhatsApp: ${leadForm.value.phone}

ESPECIFICAÇÕES DO SERVIÇO:
• Tipo de Serviço/Banho: ${leadForm.value.service}
• Detalhes da Demanda (dimensões, peso em kg, lote ou requisitos de micras):
${leadForm.value.details || 'A combinar'}

---
Solicitação gerada através da vitrine digital Bama TEC (Alaska Local).`

  return `mailto:${storeEmail.value}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
})

const leadWhatsappUrl = computed(() => {
  const msg = `Olá! Enviei uma solicitação de cotação para o e-mail da Bama TEC:
• Empresa: ${leadForm.value.company || leadForm.value.name}
• Contato: ${leadForm.value.name} (${leadForm.value.phone})
• E-mail: ${leadForm.value.email}
• Serviço: ${leadForm.value.service}
${leadForm.value.details ? `• Detalhes: ${leadForm.value.details}` : ''}
Gostaria de confirmar o recebimento e solicitar retorno da equipe técnica.`

  return `https://wa.me/${whatsappNumber.value}?text=${encodeURIComponent(msg)}`
})

function submitLeadForm() {
  formError.value = ''

  if (!leadForm.value.name.trim()) {
    formError.value = 'Por favor, informe seu nome.'
    return
  }
  if (!leadForm.value.email.trim() || !leadForm.value.email.includes('@')) {
    formError.value = 'Por favor, informe um e-mail corporativo válido.'
    return
  }
  if (!leadForm.value.phone.trim()) {
    formError.value = 'Por favor, informe seu telefone ou WhatsApp de contato.'
    return
  }

  isSubmitting.value = true

  try {
    if (typeof window !== 'undefined') {
      window.location.href = mailtoUrl.value
    }
  } catch (err) {
    console.error('Erro ao acionar mailto:', err)
  }

  setTimeout(() => {
    isSubmitting.value = false
    isSubmitted.value = true
  }, 300)
}

function resetLeadForm() {
  leadForm.value = {
    name: '',
    company: '',
    email: '',
    phone: '',
    service: 'Estanho Eletrolítico (Barramentos / Painéis Elétricos)',
    details: ''
  }
  isSubmitted.value = false
  formError.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#2d7097] selection:text-white">
    <!-- 1. BARRA SUPERIOR INSTITUCIONAL / HEADER -->
    <header
      class="sticky top-0 z-40 py-2 sm:py-0 mt-4 sm:mt-0 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        <!-- Logo e Posicionamento -->
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-[#5d5f85] text-white flex items-center justify-center font-black text-lg shadow-sm border border-[#5d5f85]/30">
            ⚙️
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-base sm:text-xl font-black tracking-tight text-slate-900">
                Bama <span class="text-[#2d7097]">TEC</span>
              </span>
              <span
                class="hidden md:inline-block text-[10px] font-bold text-[#2d7097] uppercase tracking-widest bg-[#2d7097]/10 px-2 py-0.5 rounded-full border border-[#2d7097]/25">
                Beneficiamento de Metais
              </span>
            </div>
            <p class="text-[11px] text-slate-500 font-medium hidden sm:block">
              10 Anos de Excelência • Banho de Estanho, Cobre, Zinco e Frotas • Itaquaquecetuba - SP
            </p>
          </div>
        </div>

        <!-- Links de Navegação Desktop -->
        <nav class="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
          <a href="#itens" class="hover:text-[#2d7097] transition-colors">O Que Banham</a>
          <a href="#banhos" class="hover:text-[#2d7097] transition-colors">Tipos de Banhos</a>
          <a href="#carrinhos" class="hover:text-[#2d7097] transition-colors">Carrinhos</a>
          <a href="#cotacao" class="hover:text-[#2d7097] transition-colors text-[#2d7097] font-black">Solicitar Cotação</a>
          <a href="#qualidade" class="hover:text-[#2d7097] transition-colors">Normas & Laudos</a>
          <a href="#faq" class="hover:text-[#2d7097] transition-colors">Dúvidas Frequentes</a>
        </nav>

        <!-- Ações do Cabeçalho: Voltar à Home, Painel Admin e CTA WhatsApp -->
        <div class="flex items-center gap-2.5 sm:gap-3">
          <NuxtLink to="/" class="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#2d7097] transition-colors p-2 rounded-xl hover:bg-slate-100" title="Ver todos os estabelecimentos no Alaska Local">
            <ChevronLeft class="w-3.5 h-3.5" />
            <span>Alaska Local</span>
          </NuxtLink>

          <NuxtLink to="/bamatec/admin" class="p-2 rounded-xl text-slate-400 hover:text-[#2d7097] hover:bg-slate-100 transition-colors" title="Acessar Painel do Lojista">
            <Store class="w-4 h-4" />
          </NuxtLink>

          <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer"
            class="px-4 sm:px-5 py-2.5 bg-[#038c4c] hover:bg-[#02733e] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer">
            <Phone class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Solicitar Orçamento B2B</span>
            <span class="sm:hidden">Orçamento</span>
          </a>
        </div>
      </div>
    </header>

    <!-- 2. HERO SECTION INSTITUCIONAL HÍBRIDA -->
    <section
      class="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-slate-100/70">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <!-- Textos Principais -->
          <div class="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div
              class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#008b73]/10 border border-[#008b73]/25 text-[#008b73] text-xs font-bold shadow-2xs">
              <Sparkles class="w-3.5 h-3.5 text-[#008b73]" />
              <span>Tratamento de Metais & Banhos Químicos • 10 Anos de Mercado</span>
            </div>

            <h1 class="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Galvanoplastia Completa:<br />
              <span class="bg-gradient-to-r from-[#2d7097] via-[#008b73] to-[#2d7097] bg-clip-text text-transparent">
                De Barras e Peças Técnicas
              </span><br />
              a Frotas de Supermercado.
            </h1>

            <p class="text-sm sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Com mais de 10 anos de experiência, a <strong>Bama TEC</strong> é referência em beneficiamento de superfícies metálicas: especialistas em <strong>banho de estanho</strong> para barramentos elétricos e telecomunicações, <strong>banho de cobre</strong>, <strong>zinco eletrolítico</strong> para barras longas de até 6m, <strong>fixadores em tambor</strong> e <strong>reforma de frotas de carrinhos</strong> com economia de até 70%.
            </p>

            <!-- 4 Badges de Capacidade Fabril -->
            <div class="grid grid-cols-2 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-semibold text-slate-700 text-left">
              <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
                <CheckCircle2 class="w-4 h-4 text-[#038c4c] shrink-0" />
                <span><strong>Estanho, Cobre & Zinco</strong> sob norma técnica</span>
              </div>
              <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
                <CheckCircle2 class="w-4 h-4 text-[#038c4c] shrink-0" />
                <span><strong>Barras de até 6m</strong> em tanques estáticos</span>
              </div>
              <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
                <CheckCircle2 class="w-4 h-4 text-[#038c4c] shrink-0" />
                <span><strong>Tambor Rotativo</strong> para peças e fixadores</span>
              </div>
              <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
                <CheckCircle2 class="w-4 h-4 text-[#038c4c] shrink-0" />
                <span><strong>Fábrica em Itaquaquecetuba</strong> com logística SP</span>
              </div>
            </div>

            <!-- Botões de Ação Hero -->
            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-4">
              <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer"
                class="w-full sm:w-auto px-7 py-4 bg-[#2d7097] hover:bg-[#245b7a] text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-[#2d7097]/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer">
                <span>Falar com o Responsável Técnico</span>
                <ArrowRight class="w-4 h-4" />
              </a>

              <a href="#cotacao"
                class="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-[#2d7097]/40 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-2xs">
                <Mail class="w-4 h-4 text-[#2d7097]" />
                <span>Solicitar Cotação por E-mail</span>
              </a>
            </div>
          </div>

          <!-- Coluna Direita: Painel Visual com Destaques -->
          <div class="lg:col-span-5">
            <div class="relative mx-auto max-w-md lg:max-w-none">
              <!-- Card Principal com Foto Industrial -->
              <div
                class="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-200/90 shadow-2xl relative">
                <img src="https://images.unsplash.com/photo-1525328437458-0c4d4db7cab4?auto=format&fit=crop&w=1000&q=80"
                  alt="Estruturas e carrinhos metálicos pós galvanoplastia industrial"
                  class="w-full h-full object-cover" @error="handleImgError" loading="eager" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent"></div>

                <div class="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <div class="flex items-center gap-2">
                    <span
                      class="text-[10px] font-bold uppercase tracking-wider text-slate-200 bg-[#5d5f85]/80 px-2.5 py-0.5 rounded-md border border-[#2d7097]/40">
                      Capacidade Fabril
                    </span>
                    <span class="text-[10px] font-bold text-slate-300">Tanque & Tambor</span>
                  </div>
                  <p class="text-sm font-black">Galvanoplastia Estática e Rotativa</p>
                  <p class="text-[11px] text-slate-300">Peças usinadas, parafusaria, perfis pesados e frotas completas
                    de varejo.</p>
                </div>
              </div>

              <!-- Selo Flutuante 1 (Topo Direito) -->
              <div
                class="absolute -top-3 -right-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl flex items-center gap-2.5 text-xs font-black text-slate-900">
                <div class="w-8 h-8 rounded-xl bg-[#2d7097]/15 text-[#2d7097] flex items-center justify-center text-sm">
                  ⚡
                </div>
                <div>
                  <p class="leading-none">Estanho, Cobre e Zinco</p>
                  <p class="text-[10px] text-slate-500 font-semibold mt-0.5">Normas ASTM e ABNT</p>
                </div>
              </div>

              <!-- Selo Flutuante 2 (Base Esquerda) -->
              <div
                class="hidden sm:flex absolute -bottom-4 -left-4 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl items-center gap-2.5 text-xs font-black text-slate-900">
                <div
                  class="w-8 h-8 rounded-xl bg-[#038c4c]/15 text-[#038c4c] flex items-center justify-center text-sm">
                  ✨
                </div>
                <div>
                  <p class="leading-none">Zero Ferrugem</p>
                  <p class="text-[10px] text-slate-500 font-semibold mt-0.5">Camada com Salt Spray</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. O QUE BANHAMOS / ITENS ATENDIDOS (SEÇÃO PRINCIPAL SOLICITADA) -->
    <section id="itens" class="py-16 sm:py-24 border-b border-slate-200 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div class="text-center space-y-3 max-w-3xl mx-auto">
          <span
            class="text-xs font-bold uppercase tracking-wider text-[#5d5f85] bg-[#5d5f85]/10 px-3 py-1 rounded-full border border-[#5d5f85]/20">
            Versatilidade de Produção
          </span>
          <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Quais peças e itens passam pelo tratamento da Bama TEC?
          </h2>
          <p class="text-sm sm:text-base text-slate-600 font-medium">
            Estrutura fabril adaptada para receber desde miudezas a granel por peso (kg) até perfis metálicos pesados de
            serralheria e frotas inteiras.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="(item, idx) in itemsHandled" :key="idx"
            class="bg-slate-50 border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-5">
            <div class="space-y-4">
              <!-- Foto Real de Chão de Fábrica -->
              <div class="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 relative border border-slate-200 shadow-2xs">
                <img :src="item.image" :alt="item.title" class="w-full h-full object-cover" @error="handleImgError" loading="lazy" />
                <div class="absolute top-2.5 right-2.5">
                  <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-900 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                    {{ item.tag }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div
                  :class="['w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs shrink-0', item.colorClass]">
                  <component :is="item.icon" class="w-5 h-5" />
                </div>
                <div>
                  <span :class="['text-[11px] font-black uppercase tracking-wider', item.colorClass]">
                    {{ item.category }}
                  </span>
                  <h3 class="text-base font-black text-slate-900 leading-snug">
                    {{ item.title }}
                  </h3>
                </div>
              </div>

              <p class="text-xs text-slate-600 font-medium leading-relaxed">
                {{ item.desc }}
              </p>

              <ul class="space-y-2 pt-2 border-t border-slate-200/70 text-xs text-slate-700 font-medium">
                <li v-for="(feat, fIdx) in item.features" :key="fIdx" class="flex items-center gap-2">
                  <Check class="w-3.5 h-3.5 text-[#038c4c] shrink-0" />
                  <span>{{ feat }}</span>
                </li>
              </ul>
            </div>

            <div class="pt-2">
              <a :href="getServiceWhatsappUrl(item.title)" target="_blank" rel="noopener noreferrer"
                :class="['w-full py-2.5 px-3 bg-white text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-colors', item.colorClass, item.borderClass]">
                <span>Cotar Este Formato</span>
                <ChevronRight class="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. TIPOS DE BANHOS E PROCESSOS QUÍMICOS (ZINCO, NÍQUEL, ESTANHO, ETC) -->
    <section id="banhos" class="py-16 sm:py-24 border-b border-slate-200 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div class="text-center space-y-3 max-w-3xl mx-auto">
          <span
            class="text-xs font-bold uppercase tracking-wider text-[#008b73] bg-[#008b73]/10 px-3 py-1 rounded-full border border-[#008b73]/25">
            Química de Superfície
          </span>
          <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Nossos Banhos e Tratamentos Galvânicos
          </h2>
          <p class="text-sm sm:text-base text-slate-600 font-medium">
            Processos controlados quimicamente para conferir resistência à corrosão, dureza ao atrito, condutividade ou
            padrão estético superior.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="(bath, idx) in bathTypes" :key="idx"
            :class="['border rounded-3xl p-6 sm:p-8 space-y-5 bg-white shadow-2xs hover:shadow-md transition-all', bath.color]">
            <div class="flex items-start justify-between gap-4">
              <div>
                <span
                  :class="['text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-2xs', bath.badgeColor]">
                  {{ bath.badge }}
                </span>
                <h3 class="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {{ bath.name }}
                </h3>
              </div>
              <div
                :class="['w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0', bath.numberColor]">
                0{{ idx + 1 }}
              </div>
            </div>

            <p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {{ bath.desc }}
            </p>

            <div class="space-y-2 pt-2 border-t border-slate-200/80">
              <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Variações e Aplicações:
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div v-for="(variant, vIdx) in bath.variants" :key="vIdx"
                  class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-0.5">
                  <p class="font-extrabold text-slate-900">{{ variant.name }}</p>
                  <p class="text-[11px] text-slate-500">{{ variant.note }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. DESTAQUE ESPECIAL: DIVISÃO DE FROTAS DE CARRINHOS DE SUPERMERCADO -->
    <section id="carrinhos" class="py-16 sm:py-24 border-b border-slate-200 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div class="text-center space-y-3 max-w-3xl mx-auto">
          <span
            class="text-xs font-bold uppercase tracking-wider text-[#038c4c] bg-[#038c4c]/10 px-3 py-1 rounded-full border border-[#038c4c]/20">
            Divisão Frotas & Atacarejos
          </span>
          <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Reforma e Zincagem de Carrinhos de Supermercado
          </h2>
          <p class="text-sm sm:text-base text-slate-600 font-medium">
            Renove sua frota com banho galvânico brilhante, solda de reforço, gabaritagem de chassi e rodas novas em PU,
            economizando até 70% em relação à compra de novos.
          </p>
        </div>

        <!-- Comparativo Visual Antes e Depois -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Card Antes -->
          <div class="bg-rose-50/40 border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-5">
            <div class="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 relative border border-rose-200">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Abandoned_shopping_cart_in_Rotterdam.jpg"
                alt="Carrinho enferrujado e desgastado"
                class="w-full h-full object-cover filter saturate-50 contrast-125" @error="handleImgError"
                loading="lazy" />
              <div
                class="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-lg">
                Antes: Desgaste e Oxidação
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="font-extrabold text-rose-950 text-base sm:text-lg">Frota Velha e Degradada</h3>
              <ul class="space-y-2 text-xs sm:text-sm text-slate-700">
                <li class="flex items-start gap-2">
                  <span class="text-rose-600 font-bold">✕</span>
                  <span><strong>Ferrugem no aramado:</strong> Transmite aspecto anti-higiênico para quem compra
                    alimentos.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-rose-600 font-bold">✕</span>
                  <span><strong>Rodízios travados e barulhentos:</strong> Irritam o cliente e fazem abandonar a loja
                    antes.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-rose-600 font-bold">✕</span>
                  <span><strong>Comprar novo é inviável:</strong> De R$ 750 a R$ 900 por unidade drena o caixa da
                    rede.</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Card Depois -->
          <div class="bg-[#038c4c]/5 border border-[#038c4c]/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div class="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 relative border border-[#038c4c]/30">
              <img src="/tenants/bamatec/img/Exemplo-carrinho-2.jpeg"
                alt="Carrinho recuperado com galvanoplastia espelhada" class="w-full h-full object-cover"
                @error="handleImgError" loading="lazy" />
              <div
                class="absolute top-3 left-3 bg-[#038c4c] text-white text-[11px] font-black uppercase px-2.5 py-1 rounded-lg">
                Depois: Banho Galvânico & Rodízios Novos
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="font-extrabold text-slate-900 text-base sm:text-lg">Frota Bama TEC Galvanizada</h3>
              <ul class="space-y-2 text-xs sm:text-sm text-slate-700">
                <li class="flex items-start gap-2">
                  <span class="text-[#038c4c] font-bold">✓</span>
                  <span><strong>Zincagem espelhada profunda:</strong> Brilho impecável com proteção duradoura contra
                    maresia.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-[#038c4c] font-bold">✓</span>
                  <span><strong>Rodas silenciosas em PU:</strong> Rolamento blindado para deslizamento suave sem
                    travar.</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-[#038c4c] font-bold">✓</span>
                  <span><strong>Economia de ~70%:</strong> Renove 100 carrinhos pelo custo de comprar apenas 30
                    novos.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Galeria de Imagens de Carrinhos e Banhos -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
          <div v-for="(img, idx) in galleryImages" :key="idx"
            class="bg-slate-50 border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all group">
            <div class="aspect-[4/3] overflow-hidden bg-slate-900 relative">
              <img :src="img.url" :alt="img.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="handleImgError" loading="lazy" />
            </div>
            <div class="p-4 space-y-0.5">
              <h4 class="font-extrabold text-slate-900 text-sm">{{ img.title }}</h4>
              <p class="text-[11px] text-slate-500 font-medium">{{ img.subtitle }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. FORMULÁRIO DE COTAÇÃO & CAPTURA DE LEADS B2B -->
    <section id="cotacao" class="py-16 sm:py-24 border-b border-slate-200 bg-slate-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div class="text-center space-y-3 max-w-3xl mx-auto">
          <span
            class="text-xs font-bold uppercase tracking-wider text-[#2d7097] bg-[#2d7097]/10 px-3 py-1 rounded-full border border-[#2d7097]/25">
            Orçamento Rápido para Indústrias & Compradores
          </span>
          <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Solicite uma Cotação Técnica Direta
          </h2>
          <p class="text-sm sm:text-base text-slate-600 font-medium">
            Envie as especificações do seu lote ou projeto. Nossa equipe de engenharia e atendimento comercial receberá sua solicitação em <strong>{{ storeEmail }}</strong> para responder com agilidade.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          <!-- Coluna Esquerda: O Formulário -->
          <div class="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs">
            <!-- Estado Sucesso pós envio -->
            <div v-if="isSubmitted" class="space-y-6 text-center py-6">
              <div class="w-16 h-16 bg-[#038c4c]/10 text-[#038c4c] rounded-2xl flex items-center justify-center mx-auto border border-[#038c4c]/20">
                <CheckCircle2 class="w-8 h-8" />
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-black text-slate-900">Solicitação Pronta para Envio!</h3>
                <p class="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Os dados foram formatados e direcionados para <strong>{{ storeEmail }}</strong>. Caso seu aplicativo de e-mail não tenha aberto automaticamente, use os botões abaixo:
                </p>
              </div>

              <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a :href="mailtoUrl"
                  class="px-5 py-3 bg-[#2d7097] hover:bg-[#245b7a] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer">
                  <Mail class="w-4 h-4" />
                  <span>Abrir no Aplicativo de E-mail</span>
                </a>
                <a :href="leadWhatsappUrl" target="_blank" rel="noopener noreferrer"
                  class="px-5 py-3 bg-[#038c4c] hover:bg-[#02733e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer">
                  <Phone class="w-3.5 h-3.5" />
                  <span>Enviar Também no WhatsApp</span>
                </a>
              </div>

              <div class="pt-4 border-t border-slate-100">
                <button type="button" @click="resetLeadForm" class="text-xs text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer">
                  Preencher nova solicitação
                </button>
              </div>
            </div>

            <!-- Formulário Ativo -->
            <form v-else @submit.prevent="submitLeadForm" class="space-y-4 text-left">
              <div v-if="formError" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{{ formError }}</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label for="lead-name" class="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User class="w-3.5 h-3.5 text-slate-400" />
                    <span>Seu Nome *</span>
                  </label>
                  <input
                    id="lead-name"
                    v-model="leadForm.name"
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#2d7097] focus:ring-2 focus:ring-[#2d7097]/15 transition-all"
                  />
                </div>

                <div class="space-y-1.5">
                  <label for="lead-company" class="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 class="w-3.5 h-3.5 text-slate-400" />
                    <span>Empresa / Razão Social</span>
                  </label>
                  <input
                    id="lead-company"
                    v-model="leadForm.company"
                    type="text"
                    placeholder="Ex: Indústria Metalmecânica Ltda"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#2d7097] focus:ring-2 focus:ring-[#2d7097]/15 transition-all"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label for="lead-email" class="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail class="w-3.5 h-3.5 text-slate-400" />
                    <span>E-mail Corporativo *</span>
                  </label>
                  <input
                    id="lead-email"
                    v-model="leadForm.email"
                    type="email"
                    required
                    placeholder="seu.email@empresa.com.br"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#2d7097] focus:ring-2 focus:ring-[#2d7097]/15 transition-all"
                  />
                </div>

                <div class="space-y-1.5">
                  <label for="lead-phone" class="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone class="w-3.5 h-3.5 text-slate-400" />
                    <span>Telefone / WhatsApp *</span>
                  </label>
                  <input
                    id="lead-phone"
                    v-model="leadForm.phone"
                    type="tel"
                    required
                    placeholder="(11) 98888-7777"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#2d7097] focus:ring-2 focus:ring-[#2d7097]/15 transition-all"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label for="lead-service" class="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Factory class="w-3.5 h-3.5 text-slate-400" />
                  <span>Tipo de Tratamento / Serviço Desejado *</span>
                </label>
                <select
                  id="lead-service"
                  v-model="leadForm.service"
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-[#2d7097] focus:ring-2 focus:ring-[#2d7097]/15 transition-all cursor-pointer"
                >
                  <option v-for="(svc, sIdx) in availableServices" :key="sIdx" :value="svc">
                    {{ svc }}
                  </option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label for="lead-details" class="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare class="w-3.5 h-3.5 text-slate-400" />
                  <span>Detalhes do Lote / Peças (Opcional)</span>
                </label>
                <textarea
                  id="lead-details"
                  v-model="leadForm.details"
                  rows="3"
                  placeholder="Ex: Lote de 200kg de parafusos para zinco amarelo, ou 50 barras de 4 metros, espessura mínima de 8 micras, prazo estimado..."
                  class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:border-[#2d7097] focus:ring-2 focus:ring-[#2d7097]/15 transition-all resize-y"
                ></textarea>
              </div>

              <div class="pt-2">
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="w-full py-3.5 px-6 bg-[#2d7097] hover:bg-[#245b7a] active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#2d7097]/20 cursor-pointer disabled:opacity-50"
                >
                  <Send class="w-4 h-4" />
                  <span>{{ isSubmitting ? 'Preparando Envio...' : 'Enviar Solicitação para o E-mail da Bama TEC' }}</span>
                </button>
                <p class="text-[11px] text-slate-500 text-center mt-2 font-medium">
                  A mensagem será endereçada para <strong>{{ storeEmail }}</strong> com cópia para seu registro.
                </p>
              </div>
            </form>
          </div>

          <!-- Coluna Direita: Informações & Contato Direto -->
          <div class="lg:col-span-5 space-y-4 text-left">
            <div class="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
              <span class="text-[10px] font-black uppercase tracking-wider text-[#038c4c] bg-[#038c4c]/10 px-2.5 py-1 rounded-lg border border-[#038c4c]/20">
                Atendimento Técnico B2B
              </span>
              <h3 class="text-lg font-black text-slate-900">
                Por que cotar diretamente com a Bama TEC?
              </h3>
              <ul class="space-y-3 text-xs sm:text-sm text-slate-600 font-medium">
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-[#038c4c] shrink-0 mt-0.5" />
                  <span><strong>Resposta Técnica Rápida:</strong> Análise de viabilidade por engenheiro químico e metalúrgico.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-[#038c4c] shrink-0 mt-0.5" />
                  <span><strong>Laudos Laboratoriais:</strong> Medição de micras (µm) e ensaios de Salt Spray (ASTM B117 / NBR 8094).</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-[#038c4c] shrink-0 mt-0.5" />
                  <span><strong>Logística com Frota Própria:</strong> Retirada e entrega programada na Grande São Paulo e Interior.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-[#038c4c] shrink-0 mt-0.5" />
                  <span><strong>Condições B2B:</strong> Faturamento para indústrias cadastradas e pagamento facilitado.</span>
                </li>
              </ul>
            </div>

            <!-- Card WhatsApp Direto Alternativo -->
            <div class="bg-gradient-to-br from-[#038c4c]/10 via-white to-slate-50 border border-[#038c4c]/30 rounded-3xl p-6 shadow-2xs space-y-3">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-[#038c4c] text-white flex items-center justify-center shadow-xs">
                  <Phone class="w-4 h-4" />
                </div>
                <div>
                  <h4 class="font-black text-slate-900 text-sm">Prefere falar agora no WhatsApp?</h4>
                  <p class="text-[11px] text-slate-500 font-medium">Atendimento direto com o time comercial</p>
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                Envie fotos de peças, desenhos técnicos em PDF ou tire dúvidas instantaneamente pelo canal corporativo da fábrica.
              </p>
              <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer"
                class="w-full py-2.5 px-4 bg-[#038c4c] hover:bg-[#02733e] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer">
                <span>Chamar no WhatsApp da Fábrica</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. CONTROLE DE QUALIDADE, NORMAS TÉCNICAS E LAUDOS -->
    <section id="qualidade" class="py-16 sm:py-24 border-b border-slate-200 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div class="text-center space-y-3 max-w-3xl mx-auto">
          <span
            class="text-xs font-bold uppercase tracking-wider text-[#5d5f85] bg-[#5d5f85]/10 px-3 py-1 rounded-full border border-[#5d5f85]/20">
            Garantia Técnica Industrial
          </span>
          <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Controle Laboratorial e Conformidade Rigorosa
          </h2>
          <p class="text-sm sm:text-base text-slate-600 font-medium">
            Segurança para compradores industriais, engenheiros e gerentes de suprimentos que não podem arriscar lotes
            rejeitados.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 space-y-3 shadow-2xs hover:border-[#2d7097]/40 transition-colors">
            <div class="w-10 h-10 rounded-xl bg-[#2d7097]/15 text-[#2d7097] flex items-center justify-center">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <h3 class="font-black text-slate-900 text-base">Câmara Salt Spray</h3>
            <p class="text-xs text-slate-600 font-medium leading-relaxed">
              Testes periódicos de névoa salina (ASTM B117 / ABNT NBR 8094) para garantir horas de resistência contra
              corrosão branca e vermelha.
            </p>
          </div>

          <div class="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 space-y-3 shadow-2xs hover:border-[#008b73]/40 transition-colors">
            <div class="w-10 h-10 rounded-xl bg-[#008b73]/15 text-[#008b73] flex items-center justify-center">
              <Scale class="w-5 h-5" />
            </div>
            <h3 class="font-black text-slate-900 text-base">Medição de Camada (µm)</h3>
            <p class="text-xs text-slate-600 font-medium leading-relaxed">
              Espessura de depósito metálico controlada rigorosamente por métodos eletromagnéticos e de fluorescência,
              evitando folgas em roscas.
            </p>
          </div>

          <div class="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 space-y-3 shadow-2xs hover:border-[#5d5f85]/40 transition-colors">
            <div class="w-10 h-10 rounded-xl bg-[#5d5f85]/15 text-[#5d5f85] flex items-center justify-center">
              <FileText class="w-5 h-5" />
            </div>
            <h3 class="font-black text-slate-900 text-base">Laudos & Certificados</h3>
            <p class="text-xs text-slate-600 font-medium leading-relaxed">
              Emissão de certificado de conformidade do lote contendo especificações técnicas, data do banho e espessura
              medida.
            </p>
          </div>

          <div class="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 space-y-3 shadow-2xs hover:border-[#038c4c]/40 transition-colors">
            <div class="w-10 h-10 rounded-xl bg-[#038c4c]/15 text-[#038c4c] flex items-center justify-center">
              <Truck class="w-5 h-5" />
            </div>
            <h3 class="font-black text-slate-900 text-base">Logística com Frota Própria</h3>
            <p class="text-xs text-slate-600 font-medium leading-relaxed">
              Retirada e devolução de lotes diretamente na sua empresa com agendamento programado em São Paulo Capital,
              Grande SP e Interior.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 8. FAQ TÉCNICO B2B INSTITUCIONAL -->
    <section id="faq" class="py-16 sm:py-20 border-b border-slate-200 bg-slate-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div class="text-center space-y-2">
          <h2 class="text-xs font-bold uppercase tracking-wider text-[#2d7097] bg-[#2d7097]/10 inline-block px-3 py-1 rounded-full border border-[#2d7097]/20">Dúvidas Frequentes</h2>
          <p class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Perguntas comuns sobre nossos serviços industriais
          </p>
        </div>

        <div class="space-y-3">
          <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1.5">
            <h4 class="font-extrabold text-slate-900 text-sm">
              Qual o comprimento máximo das barras que a Bama TEC consegue banhar?
            </h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Nossos tanques estáticos de gancheira comportam barras, tubos e perfis metálicos de até <strong>6 metros
                de comprimento</strong>, sem necessidade de cortes ou emendas no material.
            </p>
          </div>

          <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1.5">
            <h4 class="font-extrabold text-slate-900 text-sm">
              Como funciona o banho de peças pequenas (parafusos, arruelas, molas)?
            </h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Utilizamos a linha de <strong>tambores rotativos</strong> com rotação e centrifugação automática. O
              material é pesado na entrada e faturado por quilo (kg), garantindo cobertura homogênea sem falhas nas
              roscas.
            </p>
          </div>

          <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1.5">
            <h4 class="font-extrabold text-slate-900 text-sm">
              Vocês fazem banho de estanho em barramentos elétricos de cobre?
            </h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Sim! Temos linha especializada em <strong>estanhagem eletrolítica brilhante</strong> para barramentos de
              cobre, terminais e conectores de painéis elétricos, assegurando máxima condutividade e proteção contra
              sulfetação.
            </p>
          </div>

          <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1.5">
            <h4 class="font-extrabold text-slate-900 text-sm">
              A Bama TEC emite Certificado de Qualidade e laudo técnico de camada (µm)?
            </h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Sim! Emitimos <strong>Certificado de Qualidade</strong> com laudo de conformidade por lote, incluindo medição precisa de camada de depósito metálico (em micras/µm), verificação de aspecto visual isento de manchas e testes de aderência livre de desplacamento, em conformidade com as exigências de montadoras de painéis e indústrias elétricas.
            </p>
          </div>

          <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1.5">
            <h4 class="font-extrabold text-slate-900 text-sm">
              Como funciona a reforma de carrinhos de supermercado sem desabastecer a loja?
            </h4>
            <p class="text-xs text-slate-600 leading-relaxed">
              Realizamos a retirada em <strong>lotes fracionados</strong> (ex: de 30 a 50 unidades por vez) e
              disponibilizamos carrinhos reserva conforme a necessidade, para que sua operação de vendas nunca pare.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 9. FOOTER INSTITUCIONAL COMPLETO -->
    <footer class="bg-slate-950 text-slate-400 py-14 text-xs border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800 text-left">
          <!-- Coluna 1: Empresa -->
          <div class="space-y-3 md:col-span-1">
            <div class="flex items-center gap-2">
              <span class="text-xl">⚙️</span>
              <span class="font-black text-white text-base">Bama TEC Beneficiamento de Metais</span>
            </div>
            <p class="text-slate-400 text-xs leading-relaxed">
              Com 10 anos de experiência, somos referência em banhos químicos de Estanho, Cobre e Zinco, com rigoroso controle de processo e soluções sob medida para cada desafio industrial.
            </p>
            <div class="pt-1 space-y-1.5">
              <div>
                <span
                  class="inline-block text-[10px] font-bold text-[#038c4c] bg-[#038c4c]/15 px-2 py-0.5 rounded border border-[#038c4c]/30">
                  ● Fábrica Operacional Ativa
                </span>
              </div>
              <p class="text-[11px] text-slate-400">Diretor Bama: <strong class="text-white">{{ props.tenant?.phoneWhatsApp ? `(${props.tenant.phoneWhatsApp.slice(0,2)}) ${props.tenant.phoneWhatsApp.slice(2,7)}-${props.tenant.phoneWhatsApp.slice(7)}` : '(11) 98893-6972' }}</strong></p>
              <p class="text-[11px] text-slate-400">E-mail: <strong class="text-white">bamatec22@gmail.com</strong></p>
            </div>
          </div>

          <!-- Coluna 2: Banhos Oferecidos -->
          <div class="space-y-2">
            <p class="font-black text-white text-xs uppercase tracking-wider">Banhos e Tratamentos</p>
            <ul class="space-y-1.5 text-slate-400 text-xs">
              <li>• <strong>Estanho Eletrolítico</strong> (Barramentos)</li>
              <li>• <strong>Banho de Cobre</strong> (Cobreamento)</li>
              <li>• <strong>Zinco Eletrolítico</strong> (Azul e Amarelo)</li>
              <li>• <strong>Decapagem Química</strong> e Desengraxe</li>
              <li>• Controle de Camada (µm) e Salt Spray</li>
            </ul>
          </div>

          <!-- Coluna 3: Formatos Atendidos -->
          <div class="space-y-2">
            <p class="font-black text-white text-xs uppercase tracking-wider">Formatos & Localização</p>
            <ul class="space-y-1.5 text-slate-400 text-xs">
              <li>• <strong>Fábrica:</strong> Est. São Miguel Arcanjo, 200/320B</li>
              <li>• <strong>Bairro:</strong> Veraneio Maracanã</li>
              <li>• <strong>Cidade:</strong> Itaquaquecetuba – SP</li>
              <li>• Barras e Tubos de até 6 Metros</li>
              <li>• Fixadores e Tambor Rotativo (kg)</li>
              <li>• Frotas de Carrinhos de Supermercado</li>
            </ul>
          </div>

          <!-- Coluna 4: Contato Comercial -->
          <div class="space-y-3">
            <p class="font-black text-white text-xs uppercase tracking-wider">Atendimento Direto</p>
            <p class="text-slate-300 font-medium">Itaquaquecetuba, Alto Tietê, Grande SP e Interior</p>
            <p class="text-slate-400 text-[11px]">Site oficial: <strong class="text-white">www.bamatec.com.br</strong></p>
            <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center gap-2 px-4 py-2.5 bg-[#038c4c] hover:bg-[#02733e] text-white font-bold rounded-xl transition-colors">
              <Phone class="w-3.5 h-3.5" />
              <span>Chamar no WhatsApp</span>
            </a>
          </div>
        </div>

        <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© Bama TEC Beneficiamento de Metais Ltda. Todos os direitos reservados. • www.bamatec.com.br</p>
          <p>Desenvolvido com tecnologia Alaska Local • Padrão de Alto Conforto Visual</p>
        </div>
      </div>
    </footer>
  </div>
</template>
