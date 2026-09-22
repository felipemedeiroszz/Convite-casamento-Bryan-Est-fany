'use client'

import { useState, useEffect } from 'react'
import { Scissors, Gift, Heart, X, Copy, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

type GiftItem = {
  id: string
  nome: string
  descricao: string
  valor: number
  imagem_url?: string
  ativo?: boolean
  quantidade_disponivel?: number
  disponivel?: boolean
}

type PaymentStatus = 'pending' | 'confirmed' | 'cancelled' | 'expired'

const PREDEFINED_AMOUNTS = [20, 50, 100, 150, 200, 250]

export default function GiftsPage() {
  const [activeTab, setActiveTab] = useState<'gifts' | 'gravata'>('gifts')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isCutting, setIsCutting] = useState(false)
  const [cutProgress, setCutProgress] = useState(0)
  const [gravataLength, setGravataLength] = useState(100)
  const [gifts, setGifts] = useState<GiftItem[]>([])
  
  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null)
  const [paymentData, setPaymentData] = useState<{
    pixCode: string
    pixQrCode: string
    value: number
    paymentId: string
    expiresAt: string
  } | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Gravata modal states
  const [showGravataModal, setShowGravataModal] = useState(false)
  const [gravataAmount, setGravataAmount] = useState<number | null>(null)
  const [gravataName, setGravataName] = useState('')
  const [gravataMessage, setGravataMessage] = useState('')

  useEffect(() => {
    fetchGifts()
  }, [])

  const fetchGifts = async () => {
    try {
      const response = await fetch('/api/gifts')
      if (response.ok) {
        const data = await response.json()
        // Filter only active gifts
        const activeGifts = data.filter((gift: GiftItem) => gift.ativo !== false)
        setGifts(activeGifts)
      }
    } catch (error) {
      console.error('Error fetching gifts:', error)
      // Fallback to hardcoded gifts if API fails
      setGifts([
        { id: '1', nome: 'Jantar Romântico', descricao: 'Ajude-nos a celebrar com um jantar especial', valor: 150, quantidade_disponivel: 10, disponivel: true },
        { id: '2', nome: 'Lua de Mel', descricao: 'Contribua para nossa viagem dos sonhos', valor: 300, quantidade_disponivel: 5, disponivel: true },
        { id: '3', nome: 'Casa Nova', descricao: 'Presente para nosso novo lar', valor: 200, quantidade_disponivel: 15, disponivel: true },
        { id: '4', nome: 'Experiência', descricao: 'Momentos inesquecíveis juntos', valor: 100, quantidade_disponivel: 20, disponivel: true },
        { id: '5', nome: 'Aventura', descricao: 'Uma aventura para começar nossa vida', valor: 250, quantidade_disponivel: 8, disponivel: true },
        { id: '6', nome: 'Surpresa', descricao: 'Deixe-nos escolher algo especial', valor: 50, quantidade_disponivel: 9999, disponivel: true },
      ])
    }
  }

  const handleGiftPayment = async (gift: GiftItem) => {
    setSelectedGift(gift)
    setLoading(true)
    
    try {
      const response = await fetch('/api/payments/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: gift.id,
          valor: gift.valor,
          nome: 'Convidado',
          email: '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Erro ao criar pagamento'
        console.error('Payment API error:', errorData)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setPaymentData({
        pixCode: data.payment.pixCode,
        pixQrCode: data.payment.pixQrCode,
        value: data.payment.value,
        paymentId: data.payment.id,
        expiresAt: data.payment.expiresAt,
      })
      setShowPaymentModal(true)
      setPaymentStatus('pending')
      
      // Start polling for payment status
      startPaymentPolling(data.payment.id)
    } catch (error) {
      console.error('Payment error:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handlePixPayment = (amount: number) => {
    setGravataAmount(amount)
    setShowGravataModal(true)
  }

  const handleGravataSubmit = async () => {
    if (!gravataName.trim()) {
      alert('Por favor, informe seu nome')
      return
    }

    setLoading(true)
    setShowGravataModal(false)
    
    try {
      const response = await fetch('/api/payments/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: gravataAmount,
          nome: gravataName,
          mensagem: gravataMessage,
          email: '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Erro ao criar pagamento'
        console.error('Payment API error:', errorData)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setPaymentData({
        pixCode: data.payment.pixCode,
        pixQrCode: data.payment.pixQrCode,
        value: data.payment.value,
        paymentId: data.payment.id,
        expiresAt: data.payment.expiresAt,
      })
      setShowPaymentModal(true)
      setPaymentStatus('pending')
      
      // Start polling for payment status
      startPaymentPolling(data.payment.id)
      
      // Animate the cutting process
      setIsCutting(true)
      let progress = 0
      const interval = setInterval(() => {
        progress += 2
        setCutProgress(progress)
        setGravataLength(100 - (progress * 0.8))
        
        if (progress >= 100) {
          clearInterval(interval)
          setIsCutting(false)
          setCutProgress(0)
        }
      }, 50)
    } catch (error) {
      console.error('Payment error:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(false)
      setGravataName('')
      setGravataMessage('')
      setGravataAmount(null)
    }
  }

  const handleCustomPayment = async () => {
    const amount = parseFloat(customAmount)
    if (amount >= 20) {
      await handlePixPayment(amount)
    } else {
      alert('O valor mínimo para gravata é R$ 20,00')
    }
  }

  const startPaymentPolling = (paymentId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/${paymentId}/status`)
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'CONFIRMED') {
            setPaymentStatus('confirmed')
            clearInterval(pollInterval)
          } else if (data.status === 'CANCELLED' || data.status === 'EXPIRED') {
            setPaymentStatus(data.status.toLowerCase() as PaymentStatus)
            clearInterval(pollInterval)
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 5000) // Poll every 5 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
    }, 300000)
  }

  const copyPixCode = () => {
    if (paymentData?.pixCode) {
      navigator.clipboard.writeText(paymentData.pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setPaymentData(null)
    setPaymentStatus('pending')
    setSelectedGift(null)
    setSelectedAmount(null)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="min-h-screen bg-background py-24 sm:py-32">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/3 w-40 h-40 opacity-5">
          <svg viewBox="0 0 100 100" className="w-full h-full text-gold">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              d="M50,10 Q90,50 50,90 Q10,50 50,10"
            />
          </svg>
        </div>
        <div className="absolute right-1/4 bottom-1/3 w-40 h-40 opacity-5">
          <svg viewBox="0 0 100 100" className="w-full h-full text-gold">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              d="M50,10 Q90,50 50,90 Q10,50 50,10"
            />
          </svg>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="font-sans text-xs uppercase tracking-[0.4em] text-gold/90">
            Lista de Presentes
          </p>
          <h2 className="mt-4 text-balance font-serif text-3xl text-gold-gradient sm:text-4xl md:text-5xl">
            Celebre conosco
          </h2>
          <div className="mt-6 flex items-center justify-center gap-4">
            <span className="h-px w-16 gold-hairline" />
            <span className="font-serif text-lg italic text-gold/80">♡</span>
            <span className="h-px w-16 gold-hairline" />
          </div>
          <p className="mx-auto mt-6 max-w-md text-pretty font-sans text-sm leading-relaxed text-cream/90">
            Sua presença é nosso maior presente. Se desejar nos presentear, escolha uma das opções abaixo.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mt-12 flex justify-center gap-4">
          <button
            onClick={() => setActiveTab('gifts')}
            className={`px-6 py-3 rounded-lg font-sans text-sm uppercase tracking-[0.2em] transition-all ${
              activeTab === 'gifts'
                ? 'bg-gold/20 border-2 border-gold text-gold'
                : 'bg-[#09243D]/50 border border-gold/30 text-cream/70 hover:border-gold/50'
            }`}
          >
            <Gift className="inline mr-2 h-4 w-4" />
            Presentes
          </button>
          <button
            onClick={() => setActiveTab('gravata')}
            className={`px-6 py-3 rounded-lg font-sans text-sm uppercase tracking-[0.2em] transition-all ${
              activeTab === 'gravata'
                ? 'bg-gold/20 border-2 border-gold text-gold'
                : 'bg-[#09243D]/50 border border-gold/30 text-cream/70 hover:border-gold/50'
            }`}
          >
            <Heart className="inline mr-2 h-4 w-4" />
            Gravatinhas
          </button>
        </div>

        {/* Gifts Tab */}
        {activeTab === 'gifts' && (
          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gifts.map((gift) => (
                <div
                  key={gift.id}
                  className={`group relative overflow-hidden rounded-xl border bg-[#09243D]/70 backdrop-blur-sm shadow-lg transition-all duration-300 ${
                    gift.disponivel === false
                      ? 'border-red-500/30 opacity-60'
                      : 'border-gold/30 hover:shadow-gold/30 hover:scale-[1.03] hover:border-gold/50'
                  }`}
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden bg-[#061A2F]">
                    {gift.imagem_url ? (
                      <img
                        src={gift.imagem_url}
                        alt={gift.nome}
                        className={`h-full w-full object-cover transition-transform duration-500 ${
                          gift.disponivel === false ? '' : 'group-hover:scale-110'
                        }`}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Gift className="h-16 w-16 text-gold/30" />
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09243D] via-transparent to-transparent" />
                    
                    {/* Gift icon overlay */}
                    <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 bg-[#061A2F]/80 backdrop-blur-sm shadow-lg">
                      <Gift className="h-5 w-5 text-gold" />
                    </div>

                    {/* Sold out badge */}
                    {gift.disponivel === false && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="rounded-lg border-2 border-red-500 bg-red-500/20 px-4 py-2">
                          <p className="font-serif text-lg font-semibold text-red-400">
                            Esgotado
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-semibold text-gold-gradient leading-tight">
                      {gift.nome}
                    </h3>
                    
                    <p className="mt-3 font-sans text-sm text-cream/80 leading-relaxed line-clamp-2">
                      {gift.descricao}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-gold/20 pt-4">
                      <div>
                        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold/70">
                          Valor
                        </p>
                        <p className="font-serif text-2xl font-semibold text-gold">
                          R$ {gift.valor.toFixed(2)}
                        </p>
                        {gift.quantidade_disponivel !== undefined && gift.quantidade_disponivel < 9999 && (
                          <p className="mt-1 font-sans text-xs text-cream/60">
                            {gift.quantidade_disponivel} disponível
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleGiftPayment(gift)}
                        disabled={loading || gift.disponivel === false}
                        className={`group/btn relative overflow-hidden rounded-lg px-5 py-3 border font-sans text-xs uppercase tracking-[0.2em] transition-all ${
                          gift.disponivel === false
                            ? 'border-red-500/50 text-red-400 bg-red-500/10 cursor-not-allowed'
                            : 'bg-gold/20 border-gold/50 text-gold hover:bg-gold/30 hover:border-gold disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {gift.disponivel === false ? (
                            <>
                              <XCircle className="h-4 w-4" />
                              Esgotado
                            </>
                          ) : loading ? (
                            <>
                              <Clock className="h-4 w-4 animate-spin" />
                              Processando...
                            </>
                          ) : (
                            <>
                              <Heart className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                              Presentear
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Hover effect border */}
                  {gift.disponivel !== false && (
                    <div className="absolute inset-0 rounded-xl border-2 border-gold/0 transition-all duration-300 group-hover:border-gold/30 pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gravata Tab */}
        {activeTab === 'gravata' && (
          <div className="mt-12">
            <div className="rounded-lg border border-gold/30 bg-[#09243D]/50 p-8 backdrop-blur-sm shadow-lg shadow-gold/10">
              <div className="text-center mb-8">
                <h3 className="font-serif text-2xl text-gold-gradient mb-2">
                  Gravatinhas de Amor
                </h3>
                <p className="font-sans text-sm text-cream/80">
                  Faça um PIX e veja a gravata ser cortada! Cada pedaço representa seu carinho.
                </p>
              </div>

              {/* Gravata Visual */}
              <div className="relative h-80 bg-[#061A2F] rounded-lg overflow-hidden mb-8 border border-gold/20 flex items-center justify-center">
                {/* Gravata */}
                <div 
                  className="relative transition-all duration-1000 ease-in-out flex flex-col items-center"
                  style={{ 
                    height: '100%',
                    filter: 'drop-shadow(5px 9px 8px rgba(0, 0, 0, 0.24))'
                  }}
                >
                  {/* Nó da gravata */}
                  <div 
                    className="relative z-10 flex-shrink-0"
                    style={{
                      width: '78px',
                      height: '96px',
                      background: `
                        linear-gradient(90deg, rgba(0,0,0,.30) 0%, rgba(255,255,255,.09) 30%, rgba(255,255,255,.02) 50%, rgba(0,0,0,.20) 100%),
                        repeating-linear-gradient(135deg, #071633 0px, #071633 28px, #dfa72b 28px, #dfa72b 35px, #071633 35px, #071633 63px)
                      `,
                      clipPath: 'polygon(18% 0%, 82% 0%, 95% 18%, 84% 55%, 70% 100%, 50% 88%, 30% 100%, 16% 55%, 5% 18%)',
                      boxShadow: 'inset 8px 0 12px rgba(255,255,255,.08), inset -9px 0 14px rgba(0,0,0,.32)'
                    }}
                  >
                    {/* Vinco do nó */}
                    <div 
                      className="absolute top-2 left-1/2 transform -translate-x-1/2 opacity-50"
                      style={{
                        width: '2px',
                        height: '72px',
                        background: 'linear-gradient(to bottom, rgba(255,255,255,.13), rgba(255,255,255,0))'
                      }}
                    />
                  </div>

                  {/* Corpo da gravata */}
                  <div 
                    className="relative z-3 flex-1 transition-all duration-1000 ease-in-out"
                    style={{
                      width: `${Math.max(gravataLength * 0.88, 30)}px`,
                      minWidth: '30px',
                      background: `
                        linear-gradient(90deg, rgba(0,0,0,.32) 0%, rgba(255,255,255,.07) 30%, rgba(255,255,255,.02) 50%, rgba(0,0,0,.20) 100%),
                        repeating-linear-gradient(135deg, #071633 0px, #071633 32px, #dda52a 32px, #dda52a 38px, #071633 38px, #071633 74px)
                      `,
                      clipPath: 'polygon(30% 0%, 70% 0%, 73% 25%, 75% 50%, 78% 75%, 86% 92%, 50% 100%, 14% 92%, 22% 75%, 25% 50%, 27% 25%)',
                      boxShadow: 'inset 8px 0 14px rgba(255,255,255,.07), inset -10px 0 16px rgba(0,0,0,.34)'
                    }}
                  >
                    {/* Textura do tecido */}
                    <div 
                      className="absolute inset-0 opacity-65 pointer-events-none"
                      style={{
                        background: `
                          repeating-linear-gradient(90deg, rgba(255,255,255,.025) 0px, rgba(255,255,255,.025) 1px, transparent 1px, transparent 3px),
                          linear-gradient(90deg, transparent 0%, rgba(255,255,255,.08) 30%, rgba(255,255,255,.025) 48%, transparent 72%)
                        `
                      }}
                    />
                    
                    {/* Luz central */}
                    <div 
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none"
                      style={{
                        width: '28px',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.025), transparent)'
                      }}
                    />
                  </div>
                </div>

                {/* Scissors Animation */}
                {isCutting && (
                  <div 
                    className="absolute transition-all duration-1000 ease-in-out z-20"
                    style={{ left: `${cutProgress}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                  >
                    <Scissors className="h-16 w-16 text-gold animate-pulse drop-shadow-lg" />
                  </div>
                )}

                {/* Cutting indicator */}
                {isCutting && (
                  <div className="absolute bottom-4 left-0 right-0 text-center z-10">
                    <p className="font-sans text-xs text-gold/80 animate-pulse">
                      Cortando gravatinha... {cutProgress}%
                    </p>
                  </div>
                )}
              </div>

              {/* Predefined Amounts */}
              <div className="mb-6">
                <p className="font-sans text-xs uppercase tracking-[0.25em] text-gold/90 mb-4 text-center">
                  Valores Sugeridos
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {PREDEFINED_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handlePixPayment(amount)}
                      disabled={isCutting}
                      className="px-4 py-3 rounded-lg border border-gold/30 bg-[#061A2F] font-serif text-gold hover:border-gold hover:bg-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      R$ {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <div className="flex-1 max-w-xs w-full">
                  <label
                    htmlFor="custom-amount"
                    className="mb-2 block font-sans text-xs uppercase tracking-[0.25em] text-gold/90"
                  >
                    Valor customizado (mínimo R$ 20)
                  </label>
                  <input
                    id="custom-amount"
                    type="number"
                    min={20}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Digite o valor"
                    className="w-full rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-3 font-sans text-sm text-cream focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                  />
                </div>
                <button
                  onClick={handleCustomPayment}
                  disabled={isCutting || !customAmount}
                  className="mt-6 sm:mt-8 px-6 py-3 rounded-lg bg-gold/20 border-2 border-gold text-gold font-sans text-sm uppercase tracking-[0.2em] hover:bg-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  <Scissors className="inline mr-2 h-4 w-4" />
                  Cortar Gravata
                </button>
              </div>

              {/* PIX Info */}
              <div className="mt-8 text-center">
                <p className="font-sans text-xs text-cream/60">
                  PIX Key: casal@exemplo.com (exemplo - configure sua chave PIX real)
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Gravata Info Modal */}
        {showGravataModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative max-w-md w-full rounded-lg border border-gold/40 bg-[#09243D]/95 p-8 backdrop-blur-md shadow-2xl shadow-gold/20">
              <button
                onClick={() => setShowGravataModal(false)}
                className="absolute top-4 right-4 text-gold/60 hover:text-gold transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="text-center mb-6">
                <Heart className="h-12 w-12 text-gold mx-auto mb-4" />
                <h3 className="font-serif text-2xl text-gold-gradient mb-2">
                  Cortar Gravatinha
                </h3>
                <p className="font-sans text-sm text-cream/80">
                  Deixe seu carinho para o casal! 💝
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="gravata-name"
                    className="mb-2 block font-sans text-xs uppercase tracking-[0.25em] text-gold/90"
                  >
                    Seu Nome *
                  </label>
                  <input
                    id="gravata-name"
                    type="text"
                    required
                    value={gravataName}
                    onChange={(e) => setGravataName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-3 font-sans text-sm text-cream placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gravata-message"
                    className="mb-2 block font-sans text-xs uppercase tracking-[0.25em] text-gold/90"
                  >
                    Mensagem para o Casal
                  </label>
                  <textarea
                    id="gravata-message"
                    rows={3}
                    maxLength={300}
                    value={gravataMessage}
                    onChange={(e) => setGravataMessage(e.target.value)}
                    placeholder="Uma mensagem carinhosa para os noivos..."
                    className="w-full resize-none rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-3 font-sans text-sm text-cream placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                  />
                  <p className="mt-1 text-right font-sans text-xs text-cream/60">
                    {gravataMessage.length}/300
                  </p>
                </div>

                <div className="text-center">
                  <p className="font-serif text-xl text-gold mb-2">
                    R$ {gravataAmount?.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={handleGravataSubmit}
                  disabled={!gravataName.trim()}
                  className="flex-1 px-6 py-3 rounded-lg bg-gold/20 border-2 border-gold text-gold font-sans text-sm uppercase tracking-[0.2em] hover:bg-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Scissors className="inline mr-2 h-4 w-4" />
                  Cortar Gravata
                </button>
                <button
                  onClick={() => setShowGravataModal(false)}
                  className="px-6 py-3 rounded-lg border border-gold/30 text-cream/80 font-sans text-sm uppercase tracking-[0.2em] hover:bg-gold/10 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Payment Modal */}
        {showPaymentModal && paymentData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative max-w-md w-full rounded-lg border border-gold/40 bg-[#09243D]/95 p-8 backdrop-blur-md shadow-2xl shadow-gold/20">
              <button
                onClick={closePaymentModal}
                className="absolute top-4 right-4 text-gold/60 hover:text-gold transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {paymentStatus === 'pending' && (
                <>
                  <div className="text-center mb-6">
                    <Clock className="h-12 w-12 text-gold mx-auto mb-4 animate-pulse" />
                    <h3 className="font-serif text-2xl text-gold-gradient mb-2">
                      Aguardando Pagamento
                    </h3>
                    <p className="font-sans text-sm text-cream/80">
                      Escaneie o QR Code ou copie o código PIX
                    </p>
                  </div>

                  {paymentData.pixQrCode && (
                    <div className="mb-6 flex justify-center">
                      <img
                        src={paymentData.pixQrCode}
                        alt="QR Code PIX"
                        className="w-48 h-48 rounded-lg border border-gold/30"
                      />
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block font-sans text-xs uppercase tracking-[0.25em] text-gold/90 mb-2 text-center">
                      Código PIX (Copie e Cole)
                    </label>
                    <div className="relative">
                      <textarea
                        readOnly
                        value={paymentData.pixCode}
                        className="w-full rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-3 font-sans text-xs text-cream/80 focus:outline-none resize-none h-24"
                      />
                      <button
                        onClick={copyPixCode}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-gold/20 border border-gold/50 text-gold hover:bg-gold/30 transition-colors"
                      >
                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    {copied && (
                      <p className="mt-2 text-center font-sans text-xs text-gold">
                        Código copiado!
                      </p>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="font-serif text-xl text-gold mb-2">
                      R$ {paymentData.value.toFixed(2)}
                    </p>
                    <p className="font-sans text-xs text-cream/60">
                      Expira em: {new Date(paymentData.expiresAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </>
              )}

              {paymentStatus === 'confirmed' && (
                <div className="text-center">
                  <CheckCircle2 className="h-16 w-16 text-gold mx-auto mb-4" />
                  <h3 className="font-serif text-2xl text-gold-gradient mb-2">
                    Pagamento Confirmado!
                  </h3>
                  <p className="font-sans text-sm text-cream/80 mb-6">
                    Obrigado pelo seu presente! 💝
                  </p>
                  <button
                    onClick={closePaymentModal}
                    className="px-6 py-3 rounded-lg bg-gold/20 border-2 border-gold text-gold font-sans text-sm uppercase tracking-[0.2em] hover:bg-gold/30 transition-all"
                  >
                    Fechar
                  </button>
                </div>
              )}

              {paymentStatus === 'cancelled' && (
                <div className="text-center">
                  <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <h3 className="font-serif text-2xl text-red-400 mb-2">
                    Pagamento Cancelado
                  </h3>
                  <p className="font-sans text-sm text-cream/80 mb-6">
                    O pagamento foi cancelado. Tente novamente.
                  </p>
                  <button
                    onClick={closePaymentModal}
                    className="px-6 py-3 rounded-lg bg-gold/20 border-2 border-gold text-gold font-sans text-sm uppercase tracking-[0.2em] hover:bg-gold/30 transition-all"
                  >
                    Fechar
                  </button>
                </div>
              )}

              {paymentStatus === 'expired' && (
                <div className="text-center">
                  <Clock className="h-16 w-16 text-cream/60 mx-auto mb-4" />
                  <h3 className="font-serif text-2xl text-cream/80 mb-2">
                    Pagamento Expirado
                  </h3>
                  <p className="font-sans text-sm text-cream/80 mb-6">
                    O prazo para pagamento expirou. Tente novamente.
                  </p>
                  <button
                    onClick={closePaymentModal}
                    className="px-6 py-3 rounded-lg bg-gold/20 border-2 border-gold text-gold font-sans text-sm uppercase tracking-[0.2em] hover:bg-gold/30 transition-all"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
    </main>
  )
}