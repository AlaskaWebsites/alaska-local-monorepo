<!-- pages/galvanoplastia.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Sparkles,
  ShieldCheck,
  Wrench,
  Truck,
  RotateCw,
  CheckCircle2,
  Phone,
  ArrowRight,
  TrendingDown,
  Layers,
  ChevronRight,
  Check
} from 'lucide-vue-next'

// Metadados da página
useHead({
  title: 'GalvanoCarts — Reforma e Galvanoplastia de Carrinhos de Supermercado',
  meta: [
    {
      name: 'description',
      content: 'Especialistas em reforma, alinhamento, troca de rodas e galvanoplastia (zincagem eletrolítica) de carrinhos de compras para supermercados e atacarejos. Economize até 70%.'
    }
  ]
})

// Simulador interativo de economia
const cartQuantity = ref(100)
const estimatedNewCost = computed(() => cartQuantity.value * 750)
const estimatedReformCost = computed(() => cartQuantity.value * 230)
const estimatedSavings = computed(() => estimatedNewCost.value - estimatedReformCost.value)

function formatBRL(val: number): string {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

// WhatsApp link generator
const whatsappNumber = '5511999999999' // Pode ser customizado com o número do cliente
const whatsappUrl = computed(() => {
  const text = encodeURIComponent(
    `Olá! Estava vendo a página e gostaria de solicitar um orçamento/vistoria gratuita para reforma e galvanoplastia de aproximadamente ${cartQuantity.value} carrinhos de supermercado.`
  )
  return `https://wa.me/${whatsappNumber}?text=${text}`
})

const beforeAfterSteps = [
  {
    title: '1. Desmontagem e Limpeza Química',
    desc: 'Remoção de rodízios velhos, cabos e plásticos danificados. Banho desengraxante de alta temperatura.'
  },
  {
    title: '2. Decapagem e Desoxidação',
    desc: 'Eliminação completa de toda a ferrugem, crostas e tintas antigas sem danificar o aço da estrutura.'
  },
  {
    title: '3. Solda MIG e Alinhamento em Gabarito',
    desc: 'Correção de empenamentos, reforço de soldas rompidas e gabaritagem milimétrica para não puxar pro lado.'
  },
  {
    title: '4. Banho Galvânico (Zincagem Eletrolítica)',
    desc: 'Camada brilhante de zinco com passivação protetora de alta durabilidade contra umidade e maresia.'
  },
  {
    title: '5. Montagem com Peças 100% Novas',
    desc: 'Rodízios de rolamento blindado em PU maciço, punho anatômico novo com sua logo e protetores de quina.'
  }
]

const servicesList = [
  {
    title: 'Zincagem Eletrolítica Brilhante',
    badge: 'Galvanoplastia',
    desc: 'Proteção anticorrosiva superior com acabamento espelhado que devolve o aspecto de loja premium aos carrinhos.',
    icon: Sparkles
  },
  {
    title: 'Troca de Rodízios e Rodas em PU',
    badge: 'Rodagem Silenciosa',
    desc: 'Fim dos carrinhos duros que travam ou puxam para o lado. Rodízios com rolamento blindado que deslizam suave.',
    icon: RotateCw
  },
  {
    title: 'Soldagem e Alinhamento Estrutural',
    badge: 'Segurança e Prumo',
    desc: 'Recuperação de grades soltas, reforço de chassi e alinhamento em mesa nivelada com solda MIG industrial.',
    icon: Wrench
  },
  {
    title: 'Cabos Personalizados com a Sua Logo',
    badge: 'Identidade Visual',
    desc: 'Cabos novos em polipropileno de alta densidade gravados com a marca e cores oficiais da sua rede de supermercado.',
    icon: Layers
  }
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
    <!-- 1. BARRA SUPERIOR / HEADER -->
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            ⚙️
          </div>
          <div>
            <span class="text-base sm:text-lg font-black tracking-tight text-slate-900">
              Galvano<span class="text-blue-600">Carts</span>
            </span>
            <span class="hidden sm:inline-block ml-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              Indústria & Varejo
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs active:scale-95"
          >
            <Phone class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Solicitar Vistoria Gratuita</span>
            <span class="sm:hidden">Orçamento</span>
          </a>
        </div>
      </div>
    </header>

    <!-- 2. HERO SECTION DE ALTO IMPACTO B2B -->
    <section class="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-slate-100/60">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div class="max-w-3xl mx-auto text-center space-y-5">
          <!-- Tag de Destaque -->
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold shadow-2xs">
            <Sparkles class="w-3.5 h-3.5 text-blue-600" />
            <span>Reforma Industrial com Banho Galvânico de Alta Duração</span>
          </div>

          <!-- Headline Principal -->
          <h1 class="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Não compre carrinhos novos.<br />
            <span class="text-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Restaure com Galvanoplastia
            </span>
            e economize até 70%.
          </h1>

          <!-- Subtítulo -->
          <p class="text-sm sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Transformamos carrinhos enferrujados, desalinhados e barulhentos em frotas com <strong>brilho de novo</strong>, rodagem macia e proteção anticorrosiva para supermercados e atacarejos.
          </p>

          <!-- Badges Rápidas -->
          <div class="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold text-slate-700">
            <span class="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
              Retirada e devolução por lotes
            </span>
            <span class="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
              Carrinhos reserva para sua operação
            </span>
            <span class="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs">
              <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
              Garantia de brilho e estrutura
            </span>
          </div>

          <!-- Botões de Ação Hero -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <a
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full sm:w-auto px-7 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Agendar Vistoria sem Custo</span>
              <ArrowRight class="w-4 h-4" />
            </a>

            <a
              href="#calculadora"
              class="w-full sm:w-auto px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-2xs"
            >
              <TrendingDown class="w-4 h-4 text-emerald-600" />
              <span>Simular Economia</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. COMPARATIVO ANTES E DEPOIS (O QUE O SUPERMERCADISTA ODEIA VS A SOLUÇÃO) -->
    <section class="py-14 sm:py-20 border-b border-slate-200 bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div class="text-center space-y-2 max-w-2xl mx-auto">
          <h2 class="text-xs font-bold uppercase tracking-wider text-blue-600">Impacto Direto no Cliente</h2>
          <p class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            O carrinho de compras é o primeiro e o último contato do cliente com a sua loja
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Card Negativo: Carrinho Velho -->
          <div class="bg-rose-50/50 border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg">
                ❌
              </div>
              <div>
                <h3 class="font-extrabold text-rose-950 text-base sm:text-lg">Carrinho Degradado</h3>
                <p class="text-xs text-rose-700">Prejudica a percepção e diminui o tempo de compra</p>
              </div>
            </div>

            <ul class="space-y-2.5 text-xs sm:text-sm text-slate-700 pt-2">
              <li class="flex items-start gap-2">
                <span class="text-rose-600 font-bold">✕</span>
                <span><strong>Ferrugem e manchas:</strong> Passa impressão de falta de higiene no contato com alimentos.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-rose-600 font-bold">✕</span>
                <span><strong>Rodas travadas e barulhentas:</strong> Irrita o cliente, que abandona a compra mais cedo.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-rose-600 font-bold">✕</span>
                <span><strong>Chassi puxando pro lado:</strong> Gera cansaço físico e acidentes contra gôndolas e veículos.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-rose-600 font-bold">✕</span>
                <span><strong>Comprar novo é inviável:</strong> Gastar de R$ 750 a R$ 900 por unidade drena o caixa da empresa.</span>
              </li>
            </ul>
          </div>

          <!-- Card Positivo: Carrinho Reformado -->
          <div class="bg-emerald-50/60 border border-emerald-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                ✨
              </div>
              <div>
                <h3 class="font-extrabold text-emerald-950 text-base sm:text-lg">Carrinho GalvanoCarts</h3>
                <p class="text-xs text-emerald-700">Padrão de loja nova por uma fração do investimento</p>
              </div>
            </div>

            <ul class="space-y-2.5 text-xs sm:text-sm text-slate-700 pt-2">
              <li class="flex items-start gap-2">
                <span class="text-emerald-600 font-bold">✓</span>
                <span><strong>Zincagem eletrolítica espelhada:</strong> Brilho reluzente com blindagem contra oxidação.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-emerald-600 font-bold">✓</span>
                <span><strong>Rodagem macia e silenciosa:</strong> Rodas novas com rolamento blindado para empurrar sem esforço.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-emerald-600 font-bold">✓</span>
                <span><strong>Alinhamento perfeito:</strong> Carrinho reto em gabarito sem desvios ou batidas.</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-emerald-600 font-bold">✓</span>
                <span><strong>Até 70% de economia:</strong> Renove 100 carrinhos pelo custo de apenas 30 novos.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. OS 4 PILARES DO NOSSO SERVIÇO -->
    <section class="py-14 sm:py-20 border-b border-slate-200 bg-slate-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div class="text-center space-y-2 max-w-2xl mx-auto">
          <h2 class="text-xs font-bold uppercase tracking-wider text-blue-600">Serviços Especializados</h2>
          <p class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tudo o que sua frota precisa em uma só empresa
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div
            v-for="(service, idx) in servicesList"
            :key="idx"
            class="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div class="space-y-3">
              <div class="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center">
                <component :is="service.icon" class="w-6 h-6" />
              </div>
              <span class="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 inline-block">
                {{ service.badge }}
              </span>
              <h3 class="font-black text-slate-900 text-base">{{ service.title }}</h3>
              <p class="text-xs text-slate-600 font-medium leading-relaxed">{{ service.desc }}</p>
            </div>

            <div class="pt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
              <span>Padrão ABNT / NBR</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. ETAPAS DO PROCESSO INDUSTRIAL (CONFIANÇA E ENGENHARIA) -->
    <section class="py-14 sm:py-20 border-b border-slate-200 bg-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        <div class="text-center space-y-2 max-w-xl mx-auto">
          <h2 class="text-xs font-bold uppercase tracking-wider text-blue-600">Processo Passo a Passo</h2>
          <p class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Como funciona a reforma da sua frota sem parar sua loja
          </p>
        </div>

        <div class="space-y-4">
          <div
            v-for="(step, idx) in beforeAfterSteps"
            :key="idx"
            class="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div class="space-y-1">
              <h3 class="font-black text-slate-900 text-base">{{ step.title }}</h3>
              <p class="text-xs sm:text-sm text-slate-600 font-medium">{{ step.desc }}</p>
            </div>
            <span class="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shrink-0">
              Etapa {{ idx + 1 }}
            </span>
          </div>
        </div>

        <!-- Logística Inteligente -->
        <div class="p-6 rounded-2xl bg-blue-50/70 border border-blue-200 text-slate-800 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <Truck class="w-6 h-6 text-blue-600 shrink-0" />
            <span>
              <strong>Logística Própria:</strong> Retiramos os carrinhos diretamente no seu supermercado em lotes fracionados (ex: 30 a 50 unidades por vez) para que sua loja continue operando normalmente.
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. CALCULADORA INTERATIVA DE ECONOMIA (FECHAMENTO DE VENDAS) -->
    <section id="calculadora" class="py-14 sm:py-20 border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6">
        <div class="bg-white border-2 border-blue-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
          <div class="text-center space-y-2">
            <span class="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Simulador Financeiro
            </span>
            <h2 class="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Calcule quanto sua rede vai economizar
            </h2>
            <p class="text-xs sm:text-sm text-slate-600 font-medium">
              Arraste a barra para selecionar a quantidade de carrinhos que precisam de manutenção:
            </p>
          </div>

          <!-- Controle Deslizante -->
          <div class="space-y-4 max-w-lg mx-auto">
            <div class="flex items-center justify-between font-black text-slate-900 text-sm sm:text-base">
              <span>Quantidade de carrinhos:</span>
              <span class="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-lg sm:text-xl font-mono">
                {{ cartQuantity }} unidades
              </span>
            </div>

            <input
              v-model.number="cartQuantity"
              type="range"
              min="20"
              max="500"
              step="10"
              class="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div class="flex justify-between text-[11px] text-slate-500 font-semibold">
              <span>20 carrinhos (mínimo)</span>
              <span>250 carrinhos</span>
              <span>500 carrinhos</span>
            </div>
          </div>

          <!-- Resultados do Comparativo -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1">
              <span class="text-[11px] font-bold text-slate-500 uppercase">Comprando Novos</span>
              <p class="text-lg sm:text-xl font-extrabold text-slate-700 font-mono line-through decoration-rose-500 decoration-2">
                {{ formatBRL(estimatedNewCost) }}
              </p>
              <span class="text-[10px] text-slate-400">Média de R$ 750/un</span>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1">
              <span class="text-[11px] font-bold text-slate-500 uppercase">Com Reforma GalvanoCarts</span>
              <p class="text-lg sm:text-xl font-extrabold text-blue-700 font-mono">
                {{ formatBRL(estimatedReformCost) }}
              </p>
              <span class="text-[10px] text-slate-500">Média de R$ 230/un com tudo</span>
            </div>

            <div class="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 text-center space-y-1 shadow-xs">
              <span class="text-[11px] font-black text-emerald-800 uppercase">Sua Economia Real</span>
              <p class="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
                {{ formatBRL(estimatedSavings) }}
              </p>
              <span class="text-[10px] font-bold text-emerald-700">~69% de economia no caixa!</span>
            </div>
          </div>

          <!-- Ação Direta com a Quantidade Selecionada -->
          <div class="text-center pt-2">
            <a
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Phone class="w-4 h-4" />
              <span>Receber Proposta Formal para {{ cartQuantity }} Carrinhos</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. QUEM ATENDEMOS -->
    <section class="py-14 sm:py-16 border-b border-slate-200 bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">
          Frota atendida para todos os formatos de varejo
        </h3>
        <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-extrabold text-slate-700">
          <span class="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">🛒 Supermercados de Bairro</span>
          <span class="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">📦 Atacados e Atacarejos</span>
          <span class="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">🏬 Hipermercados</span>
          <span class="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">🛠️ Home Centers de Construção</span>
          <span class="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200">🐕 Pet Centers e Varejo</span>
        </div>
      </div>
    </section>

    <!-- 8. FOOTER / CONTATO COMERCIAL -->
    <footer class="bg-slate-900 text-slate-400 py-12 text-xs">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div class="space-y-1">
          <p class="font-black text-white text-base">GalvanoCarts — Soluções em Frotas de Carrinhos</p>
          <p class="text-slate-400 text-xs">Galvanoplastia, Zincagem Eletrolítica, Alinhamento Estrutural e Peças de Reposição.</p>
          <p class="text-slate-500 text-[11px] pt-1">Atendimento em toda a Grande São Paulo, Capital e Interior.</p>
        </div>

        <div class="flex flex-col sm:items-end gap-2">
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Phone class="w-4 h-4" />
            <span>Falar com o Responsável Técnico</span>
          </a>
          <span class="text-[10px] text-slate-500">Desenvolvido com tecnologia Alaska Local</span>
        </div>
      </div>
    </footer>

    <!-- BOTÃO FLUTUANTE DE WHATSAPP NO MOBILE -->
    <div class="fixed bottom-4 right-4 z-50 sm:hidden">
      <a
        :href="whatsappUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl active:scale-95"
        title="Orçamento no WhatsApp"
      >
        <Phone class="w-6 h-6" />
      </a>
    </div>
  </div>
</template>
