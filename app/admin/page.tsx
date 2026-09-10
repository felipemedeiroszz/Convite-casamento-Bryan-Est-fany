'use client'

import { useState, useEffect } from 'react'
import { LayoutDashboard, Users, Package, DollarSign, Settings, Plus, Trash2, Edit, Lock, LogOut, TrendingUp, Gift, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

type Tab = 'dashboard' | 'convidados' | 'produtos' | 'confirmados' | 'financeiro' | 'presentes' | 'configuracoes'

type Guest = {
  id: string
  nome_completo: string
  email?: string
  telefone?: string
  whatsapp?: string
  status: 'pending' | 'confirmed' | 'declined'
}

type Product = {
  id: string
  nome: string
  descricao: string
  valor: number
  imagem_url?: string
  quantidade_disponivel?: number
}

type GiftReceived = {
  id: string
  product_id: string
  product_name: string
  guest_name: string
  amount: number
  date: string
  mensagem?: string
  tipo?: string
}

const tabs = [
  { id: 'dashboard' as Tab, label: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'convidados' as Tab, label: 'CADASTRO DE CONVIDADOS', icon: Users },
  { id: 'produtos' as Tab, label: 'CADASTRO DE PRODUTOS', icon: Package },
  { id: 'confirmados' as Tab, label: 'CONFIRMADOS', icon: Users },
  { id: 'financeiro' as Tab, label: 'FINANCEIRO', icon: DollarSign },
  { id: 'presentes' as Tab, label: 'PRESENTES GANHOS', icon: Package },
  { id: 'configuracoes' as Tab, label: 'CONFIGURAÇÕES', icon: Settings },
]

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [guests, setGuests] = useState<Guest[]>([])
  const [showAddGuest, setShowAddGuest] = useState(false)
  const [newGuest, setNewGuest] = useState({ nome_completo: '', email: '', telefone: '', whatsapp: '' })
  const [products, setProducts] = useState<Product[]>([])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({ nome: '', descricao: '', valor: 0, imagem_url: '', quantidade_disponivel: 9999 })
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editProductForm, setEditProductForm] = useState({ nome: '', descricao: '', valor: 0, imagem_url: '', quantidade_disponivel: 9999 })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [productError, setProductError] = useState('')
  const [giftsReceived, setGiftsReceived] = useState<GiftReceived[]>([])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'bryan2026') {
      setIsAuthenticated(true)
      setAuthError('')
      // Carregar dados iniciais
      fetchAllData()
    } else {
      setAuthError('Senha incorreta')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
  }

  const fetchAllData = () => {
    fetchGuests()
    fetchProducts()
    fetchGiftsReceived()
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData()
      // Configurar atualização em tempo real (polling a cada 30 segundos)
      const interval = setInterval(fetchAllData, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'convidados' || activeTab === 'confirmados') {
        fetchGuests()
      }
      if (activeTab === 'produtos' || activeTab === 'presentes' || activeTab === 'financeiro') {
        fetchProducts()
      }
      if (activeTab === 'financeiro' || activeTab === 'presentes') {
        fetchGiftsReceived()
      }
    }
  }, [activeTab, isAuthenticated])

  const fetchGuests = async () => {
    try {
      const response = await fetch('/api/guests')
      const data = await response.json()
      setGuests(data)
    } catch (error) {
      console.error('Error fetching guests:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/gifts')
      const data = await response.json()
      // Filter out products without valid IDs
      const validProducts = Array.isArray(data) ? data.filter((p: Product) => p && p.id) : []
      setProducts(validProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    }
  }

  const fetchGiftsReceived = async () => {
    try {
      const response = await fetch('/api/gifts-received')
      if (response.ok) {
        const data = await response.json()
        setGiftsReceived(data)
      }
    } catch (error) {
      console.error('Error fetching gifts received:', error)
    }
  }

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuest),
      })
      if (response.ok) {
        setNewGuest({ nome_completo: '', email: '', telefone: '', whatsapp: '' })
        setShowAddGuest(false)
        fetchGuests()
      }
    } catch (error) {
      console.error('Error adding guest:', error)
    }
  }

  const sendWhatsAppInvite = (guest: Guest) => {
    if (!guest.whatsapp) return
    const message = encodeURIComponent(`Olá ${guest.nome_completo}! 🎉\n\nTemos uma notícia muito especial para compartilhar com você. Estamos nos casando e sua presença tornaria este dia ainda mais inesquecível!\n\nPor favor, confirme sua presença através do nosso site de casamento.\n\nCom amor,\nB & E`)
    window.open(`https://wa.me/${guest.whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank')
  }

  const handleImageUpload = async (file: File, target: 'new' | 'edit' = 'new') => {
    setUploadingImage(true)
    setUploadError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json().catch(() => ({}))
      if (response.ok && data.url) {
        if (target === 'new') {
          setNewProduct({ ...newProduct, imagem_url: data.url })
        } else {
          setEditProductForm({ ...editProductForm, imagem_url: data.url })
        }
      } else {
        setUploadError(data.error || 'Erro ao enviar imagem')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setUploadError('Erro de conexão ao enviar imagem')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setProductError('')
    try {
      const response = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      })
      if (response.ok) {
        setNewProduct({ nome: '', descricao: '', valor: 0, imagem_url: '', quantidade_disponivel: 9999 })
        setShowAddProduct(false)
        setUploadError('')
        fetchProducts()
      } else {
        const err = await response.json().catch(() => ({}))
        setProductError(err.error || 'Erro ao salvar produto')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      setProductError('Erro de conexão')
    }
  }

  const handleEditProduct = (product: Product) => {
    if (!product || !product.id) {
      setProductError('Produto inválido ou sem ID')
      return
    }
    setEditingProduct(product)
    setEditProductForm({
      nome: product.nome,
      descricao: product.descricao,
      valor: product.valor,
      imagem_url: product.imagem_url || '',
      quantidade_disponivel: product.quantidade_disponivel || 9999,
    })
    setProductError('')
    setUploadError('')
  }

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct || !editingProduct.id) {
      setProductError('Produto não selecionado ou ID inválido')
      return
    }
    setProductError('')
    try {
      const response = await fetch(`/api/gifts/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProductForm),
      })
      if (response.ok) {
        setEditingProduct(null)
        setUploadError('')
        fetchProducts()
      } else {
        const err = await response.json().catch(() => ({}))
        setProductError(err.error || 'Erro ao atualizar produto')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      setProductError('Erro de conexão')
    }
  }

  const handleCancelEditProduct = () => {
    setEditingProduct(null)
    setProductError('')
    setUploadError('')
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Deseja realmente excluir este produto?')) return
    try {
      await fetch(`/api/gifts/${id}`, { method: 'DELETE' })
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleDeleteGuest = async (id: string) => {
    try {
      await fetch(`/api/guests/${id}`, { method: 'DELETE' })
      fetchGuests()
    } catch (error) {
      console.error('Error deleting guest:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400'
      case 'declined': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado'
      case 'declined': return 'Recusou'
      default: return 'Pendente'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#061A2F] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-gold/30 bg-[#09243D]/50 p-8 backdrop-blur-sm shadow-lg shadow-gold/20">
            <div className="text-center mb-8">
              <Lock className="h-16 w-16 text-gold mx-auto mb-4" />
              <h1 className="font-serif text-3xl text-gold-gradient mb-2">
                Painel Administrativo
              </h1>
              <p className="font-sans text-sm text-cream/70">
                Entre com sua senha para acessar
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block font-sans text-xs uppercase tracking-[0.25em] text-gold/90"
                >
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-3 font-sans text-sm text-cream placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                />
              </div>

              {authError && (
                <p className="font-sans text-sm text-red-400 text-center">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-gold px-6 py-3 text-black hover:bg-gold/80 transition-colors font-sans text-sm uppercase tracking-[0.2em]"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#061A2F]">
      {/* Header */}
      <header className="border-b border-gold/30 bg-[#041020]">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl text-gold-gradient">Painel Administrativo</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-cream/80 hover:text-gold transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-sans text-xs uppercase tracking-[0.15em]">Sair</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-full md:w-64 flex-shrink-0">
            <div className="rounded-lg border border-gold/30 bg-[#09243D]/50 p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                          activeTab === tab.id
                            ? 'bg-gold/20 text-gold border border-gold/50'
                            : 'text-cream/80 hover:bg-gold/10 hover:text-gold'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-sans text-xs uppercase tracking-[0.15em]">
                          {tab.label}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            <div className="rounded-lg border border-gold/30 bg-[#09243D]/50 p-8">
              {activeTab === 'dashboard' && (
                <div>
                  <div className="mb-8">
                    <h2 className="font-serif text-4xl text-gold-gradient mb-2">Dashboard</h2>
                    <p className="font-sans text-sm text-cream/70">Visão geral do seu casamento</p>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="group relative overflow-hidden rounded-xl border border-gold/30 bg-gradient-to-br from-[#061A2F] to-[#09243D] p-6 shadow-lg shadow-gold/10 transition-all duration-300 hover:shadow-gold/20 hover:scale-[1.02]">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="h-16 w-16 text-gold" />
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20 border border-gold/30">
                          <Users className="h-5 w-5 text-gold" />
                        </div>
                        <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold/90">
                          Total Convidados
                        </p>
                      </div>
                      <p className="font-serif text-4xl font-bold text-cream mb-1">{guests.length}</p>
                      <p className="font-sans text-xs text-cream/60">Pessoas convidadas</p>
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border border-green-500/30 bg-gradient-to-br from-[#061A2F] to-[#0a2f1a] p-6 shadow-lg shadow-green-500/10 transition-all duration-300 hover:shadow-green-500/20 hover:scale-[1.02]">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="h-16 w-16 text-green-400" />
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        </div>
                        <p className="font-sans text-xs uppercase tracking-[0.2em] text-green-400/90">
                          Confirmações
                        </p>
                      </div>
                      <p className="font-serif text-4xl font-bold text-green-400 mb-1">
                        {guests.filter(g => g.status === 'confirmed').length}
                      </p>
                      <p className="font-sans text-xs text-green-400/60">
                        {guests.length > 0 ? Math.round((guests.filter(g => g.status === 'confirmed').length / guests.length) * 100) : 0}% do total
                      </p>
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-br from-[#061A2F] to-[#1a0a0a] p-6 shadow-lg shadow-red-500/10 transition-all duration-300 hover:shadow-red-500/20 hover:scale-[1.02]">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <XCircle className="h-16 w-16 text-red-400" />
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/30">
                          <XCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <p className="font-sans text-xs uppercase tracking-[0.2em] text-red-400/90">
                          Recusas
                        </p>
                      </div>
                      <p className="font-serif text-4xl font-bold text-red-400 mb-1">
                        {guests.filter(g => g.status === 'declined').length}
                      </p>
                      <p className="font-sans text-xs text-red-400/60">Não poderão comparecer</p>
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border border-yellow-500/30 bg-gradient-to-br from-[#061A2F] to-[#1a1a0a] p-6 shadow-lg shadow-yellow-500/10 transition-all duration-300 hover:shadow-yellow-500/20 hover:scale-[1.02]">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="h-16 w-16 text-yellow-400" />
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                          <Clock className="h-5 w-5 text-yellow-400" />
                        </div>
                        <p className="font-sans text-xs uppercase tracking-[0.2em] text-yellow-400/90">
                          Pendentes
                        </p>
                      </div>
                      <p className="font-serif text-4xl font-bold text-yellow-400 mb-1">
                        {guests.filter(g => g.status === 'pending').length}
                      </p>
                      <p className="font-sans text-xs text-yellow-400/60">Aguardando resposta</p>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Financial Overview */}
                    <div className="rounded-xl border border-gold/30 bg-gradient-to-br from-[#061A2F] to-[#09243D] p-6 shadow-lg shadow-gold/10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20 border border-gold/30">
                            <DollarSign className="h-5 w-5 text-gold" />
                          </div>
                          <div>
                            <h3 className="font-serif text-xl text-gold-gradient">Financeiro</h3>
                            <p className="font-sans text-xs text-cream/60">Resumo de presentes</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-[#09243D]/50 border border-gold/20">
                          <div className="flex items-center gap-3">
                            <Gift className="h-5 w-5 text-gold" />
                            <span className="font-sans text-sm text-cream/80">Total Arrecadado</span>
                          </div>
                          <span className="font-serif text-xl font-bold text-gold">
                            R$ {giftsReceived.reduce((acc, g) => acc + (g.amount || 0), 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-[#09243D]/50 border border-gold/20">
                          <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-gold" />
                            <span className="font-sans text-sm text-cream/80">Presentes Recebidos</span>
                          </div>
                          <span className="font-serif text-xl font-bold text-gold">
                            {giftsReceived.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-[#09243D]/50 border border-gold/20">
                          <div className="flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-green-400" />
                            <span className="font-sans text-sm text-cream/80">Média por Presente</span>
                          </div>
                          <span className="font-serif text-xl font-bold text-green-400">
                            R$ {giftsReceived.length > 0 ? (giftsReceived.reduce((acc, g) => acc + (g.amount || 0), 0) / giftsReceived.length).toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Products Overview */}
                    <div className="rounded-xl border border-gold/30 bg-gradient-to-br from-[#061A2F] to-[#09243D] p-6 shadow-lg shadow-gold/10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20 border border-gold/30">
                            <Package className="h-5 w-5 text-gold" />
                          </div>
                          <div>
                            <h3 className="font-serif text-xl text-gold-gradient">Produtos</h3>
                            <p className="font-sans text-xs text-cream/60">Status do catálogo</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-[#09243D]/50 border border-gold/20">
                          <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-gold" />
                            <span className="font-sans text-sm text-cream/80">Total de Produtos</span>
                          </div>
                          <span className="font-serif text-xl font-bold text-gold">
                            {products.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-[#09243D]/50 border border-gold/20">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <span className="font-sans text-sm text-cream/80">Disponíveis</span>
                          </div>
                          <span className="font-serif text-xl font-bold text-green-400">
                            {products.filter(p => (p.quantidade_disponivel || 9999) > 0).length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-[#09243D]/50 border border-gold/20">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <span className="font-sans text-sm text-cream/80">Esgotados</span>
                          </div>
                          <span className="font-serif text-xl font-bold text-red-400">
                            {products.filter(p => (p.quantidade_disponivel || 9999) <= 0).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'convidados' && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="font-serif text-3xl text-gold-gradient mb-2">
                        Cadastro de Convidados
                      </h2>
                      <p className="font-sans text-sm text-cream/70">Gerencie sua lista de convidados</p>
                    </div>
                    <button
                      onClick={() => setShowAddGuest(true)}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold/80 px-6 py-3 text-black hover:from-gold/90 hover:to-gold/70 transition-all shadow-lg shadow-gold/20 hover:shadow-gold/30"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="font-sans text-xs uppercase tracking-[0.15em] font-semibold">
                        Adicionar Convidado
                      </span>
                    </button>
                  </div>

                  {showAddGuest && (
                    <form onSubmit={handleAddGuest} className="mb-8 rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-[#061A2F] to-[#09243D] p-8 shadow-2xl shadow-gold/20">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/20 border border-gold/30">
                          <Users className="h-6 w-6 text-gold" />
                        </div>
                        <div>
                          <h3 className="font-serif text-2xl text-gold-gradient">Novo Convidado</h3>
                          <p className="font-sans text-xs text-cream/60">Preencha os dados do convidado</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-gold/90 mb-2">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            required
                            value={newGuest.nome_completo}
                            onChange={(e) => setNewGuest({ ...newGuest, nome_completo: e.target.value })}
                            className="w-full rounded-xl border border-gold/30 bg-[#09243D] px-4 py-3 text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                            placeholder="Nome completo do convidado"
                          />
                        </div>
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-gold/90 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={newGuest.email}
                            onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                            className="w-full rounded-xl border border-gold/30 bg-[#09243D] px-4 py-3 text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-gold/90 mb-2">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            value={newGuest.telefone}
                            onChange={(e) => setNewGuest({ ...newGuest, telefone: e.target.value })}
                            className="w-full rounded-xl border border-gold/30 bg-[#09243D] px-4 py-3 text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-gold/90 mb-2">
                            WhatsApp *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="11999999999"
                            value={newGuest.whatsapp}
                            onChange={(e) => setNewGuest({ ...newGuest, whatsapp: e.target.value })}
                            className="w-full rounded-xl border border-gold/30 bg-[#09243D] px-4 py-3 text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 transition-all"
                          />
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <button
                          type="submit"
                          className="flex-1 rounded-xl bg-gradient-to-r from-gold to-gold/80 px-6 py-3 text-black hover:from-gold/90 hover:to-gold/70 transition-all font-sans text-xs uppercase tracking-[0.15em] font-semibold shadow-lg shadow-gold/20"
                        >
                          Salvar Convidado
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddGuest(false)}
                          className="rounded-xl border border-gold/30 px-6 py-3 text-cream hover:bg-gold/10 transition-all font-sans text-xs uppercase tracking-[0.15em]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-[#061A2F] to-[#09243D] overflow-hidden shadow-xl shadow-gold/10">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#09243D]/80 border-b border-gold/20">
                          <tr>
                            <th className="px-6 py-4 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                              Nome
                            </th>
                            <th className="px-6 py-4 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                              Email
                            </th>
                            <th className="px-6 py-4 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                              Telefone
                            </th>
                            <th className="px-6 py-4 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                              WhatsApp
                            </th>
                            <th className="px-6 py-4 text-right font-sans text-xs uppercase tracking-[0.15em] text-gold">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {guests.map((guest) => (
                            <tr key={guest.id} className="border-t border-gold/10 hover:bg-gold/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/20 border border-gold/30">
                                    <span className="font-serif text-sm font-semibold text-gold">
                                      {guest.nome_completo.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="font-sans text-sm font-medium text-cream">
                                    {guest.nome_completo}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-sans text-sm text-cream/70">
                                {guest.email || '-'}
                              </td>
                              <td className="px-6 py-4 font-sans text-sm text-cream/70">
                                {guest.telefone || '-'}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                                  guest.status === 'confirmed' 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : guest.status === 'declined'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                }`}>
                                  {guest.status === 'confirmed' && <CheckCircle className="h-3 w-3" />}
                                  {guest.status === 'declined' && <XCircle className="h-3 w-3" />}
                                  {guest.status === 'pending' && <Clock className="h-3 w-3" />}
                                  {getStatusLabel(guest.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-sans text-sm text-cream/70">
                                {guest.whatsapp || '-'}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {guest.whatsapp && (
                                    <button
                                      onClick={() => sendWhatsAppInvite(guest)}
                                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-all"
                                      title="Enviar convite pelo WhatsApp"
                                    >
                                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                      </svg>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteGuest(guest.id)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
                                    title="Excluir convidado"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {guests.length === 0 && (
                      <div className="px-6 py-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 border border-gold/30 mx-auto mb-4">
                          <Users className="h-8 w-8 text-gold/50" />
                        </div>
                        <p className="font-sans text-sm text-cream/60">
                          Nenhum convidado cadastrado ainda
                        </p>
                        <p className="font-sans text-xs text-cream/40 mt-1">
                          Clique em "Adicionar Convidado" para começar
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'produtos' && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="font-serif text-3xl text-gold-gradient mb-2">
                        Cadastro de Produtos
                      </h2>
                      <p className="font-sans text-sm text-cream/70">Gerencie sua lista de presentes</p>
                    </div>
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold/80 px-6 py-3 text-black hover:from-gold/90 hover:to-gold/70 transition-all shadow-lg shadow-gold/20 hover:shadow-gold/30"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="font-sans text-xs uppercase tracking-[0.15em] font-semibold">
                        Adicionar Produto
                      </span>
                    </button>
                  </div>

                  {showAddProduct && (
                    <form onSubmit={handleAddProduct} className="mb-6 rounded-lg border border-gold/30 bg-[#061A2F] p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-cream/90 mb-2">
                            Nome *
                          </label>
                          <input
                            type="text"
                            required
                            value={newProduct.nome}
                            onChange={(e) => setNewProduct({ ...newProduct, nome: e.target.value })}
                            className="w-full rounded-lg border border-gold/30 bg-[#09243D] px-4 py-2 text-cream focus:border-gold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-cream/90 mb-2">
                            Valor *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={newProduct.valor}
                            onChange={(e) => setNewProduct({ ...newProduct, valor: parseFloat(e.target.value) || 0 })}
                            className="w-full rounded-lg border border-gold/30 bg-[#09243D] px-4 py-2 text-cream focus:border-gold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-cream/90 mb-2">
                            Quantidade Disponível *
                          </label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={newProduct.quantidade_disponivel}
                            onChange={(e) => setNewProduct({ ...newProduct, quantidade_disponivel: parseInt(e.target.value) || 0 })}
                            className="w-full rounded-lg border border-gold/30 bg-[#09243D] px-4 py-2 text-cream focus:border-gold focus:outline-none"
                            placeholder="9999 para ilimitado"
                          />
                          <p className="mt-1 font-sans text-xs text-cream/60">
                            Use 9999 para quantidade ilimitada
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-cream/90 mb-2">
                            Descrição
                          </label>
                          <textarea
                            value={newProduct.descricao}
                            onChange={(e) => setNewProduct({ ...newProduct, descricao: e.target.value })}
                            className="w-full rounded-lg border border-gold/30 bg-[#09243D] px-4 py-2 text-cream focus:border-gold focus:outline-none"
                            rows={3}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-cream/90 mb-2">
                            Foto do Produto
                          </label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file, 'new')
                              }}
                              disabled={uploadingImage}
                              className="w-full rounded-lg border border-gold/30 bg-[#09243D] px-4 py-2 text-cream focus:border-gold focus:outline-none"
                            />
                            {uploadingImage && (
                              <p className="text-sm text-gold">⏳ Enviando imagem...</p>
                            )}
                            {uploadError && (
                              <p className="text-sm text-red-400">❌ {uploadError}</p>
                            )}
                            {newProduct.imagem_url && (
                              <img
                                src={newProduct.imagem_url}
                                alt="Preview"
                                className="h-32 w-32 object-cover rounded border border-gold/30"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      {productError && (
                        <p className="mt-4 text-sm text-red-400">{productError}</p>
                      )}
                      <div className="mt-4 flex gap-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-gold px-6 py-2 text-black hover:bg-gold/80 transition-colors font-sans text-xs uppercase tracking-[0.15em]"
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddProduct(false)
                            setNewProduct({ nome: '', descricao: '', valor: 0, imagem_url: '' })
                            setUploadError('')
                            setProductError('')
                          }}
                          className="rounded-lg border border-gold/30 px-6 py-2 text-cream hover:bg-gold/10 transition-colors font-sans text-xs uppercase tracking-[0.15em]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}

                  {editingProduct && (
                    <form onSubmit={handleSaveEditProduct} className="mb-6 rounded-lg border-2 border-gold/60 bg-[#09243D] p-6 shadow-lg shadow-gold/20">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-serif text-2xl text-gold-gradient">
                          ✏️ Editar Produto
                        </h3>
                        <span className="font-sans text-xs uppercase tracking-wider text-cream/60">
                          ID: {editingProduct.id.slice(0, 8)}…
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-cream/90 mb-2">
                          Nome *
                        </label>
                          <input
                            type="text"
                            required
                            value={editProductForm.nome}
                            onChange={(e) => setEditProductForm({ ...editProductForm, nome: e.target.value })}
                            className="w-full rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-2 text-cream focus:border-gold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-cream/90 mb-2">
                            Valor *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={editProductForm.valor}
                            onChange={(e) => setEditProductForm({ ...editProductForm, valor: parseFloat(e.target.value) || 0 })}
                            className="w-full rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-2 text-cream focus:border-gold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-cream/90 mb-2">
                            Quantidade Disponível *
                          </label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={editProductForm.quantidade_disponivel}
                            onChange={(e) => setEditProductForm({ ...editProductForm, quantidade_disponivel: parseInt(e.target.value) || 0 })}
                            className="w-full rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-2 text-cream focus:border-gold focus:outline-none"
                            placeholder="9999 para ilimitado"
                          />
                          <p className="mt-1 font-sans text-xs text-cream/60">
                            Use 9999 para quantidade ilimitada
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-cream/90 mb-2">
                            Descrição
                          </label>
                          <textarea
                            value={editProductForm.descricao}
                            onChange={(e) => setEditProductForm({ ...editProductForm, descricao: e.target.value })}
                            className="w-full rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-2 text-cream focus:border-gold focus:outline-none"
                            rows={3}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-cream/90 mb-2">
                            Foto do Produto
                          </label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file, 'edit')
                              }}
                              disabled={uploadingImage}
                              className="w-full rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-2 text-cream focus:border-gold focus:outline-none"
                            />
                            {uploadingImage && (
                              <p className="text-sm text-gold">⏳ Enviando imagem...</p>
                            )}
                            {uploadError && (
                              <p className="text-sm text-red-400">❌ {uploadError}</p>
                            )}
                            {editProductForm.imagem_url && (
                              <div className="flex items-center gap-3">
                                <img
                                  src={editProductForm.imagem_url}
                                  alt="Preview"
                                  className="h-32 w-32 object-cover rounded border border-gold/30"
                                />
                                <button
                                  type="button"
                                  onClick={() => setEditProductForm({ ...editProductForm, imagem_url: '' })}
                                  className="rounded border border-red-500/40 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                  Remover imagem
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {productError && (
                        <p className="mt-4 text-sm text-red-400">{productError}</p>
                      )}
                      <div className="mt-4 flex gap-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-gold px-6 py-2 text-black hover:bg-gold/80 transition-colors font-sans text-xs uppercase tracking-[0.15em]"
                        >
                          Salvar Alterações
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditProduct}
                          className="rounded-lg border border-gold/30 px-6 py-2 text-cream hover:bg-gold/10 transition-colors font-sans text-xs uppercase tracking-[0.15em]"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="rounded-lg border border-gold/30 bg-[#061A2F] overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#09243D]">
                        <tr>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                          Foto
                        </th>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                          Nome
                        </th>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                          Descrição
                        </th>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                          Valor
                        </th>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                          Quantidade
                        </th>
                          <th className="px-4 py-3 text-right font-sans text-xs uppercase tracking-[0.15em] text-gold">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-t border-gold/20">
                            <td className="px-4 py-3">
                              {product.imagem_url ? (
                                <img src={product.imagem_url} alt={product.nome} className="h-12 w-12 object-cover rounded" />
                              ) : (
                                <div className="h-12 w-12 rounded bg-gold/20" />
                              )}
                            </td>
                            <td className="px-4 py-3 font-sans text-sm text-cream">
                              {product.nome}
                            </td>
                            <td className="px-4 py-3 font-sans text-sm text-cream/80 max-w-sm truncate">
                              {product.descricao || '-'}
                            </td>
                            <td className="px-4 py-3 font-sans text-sm text-cream">
                              R$ {Number(product.valor).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 font-sans text-sm text-cream">
                              {product.quantidade_disponivel === 9999 ? 'Ilimitado' : product.quantidade_disponivel || 0}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="text-gold hover:text-gold/80 transition-colors p-1"
                                  title="Editar produto"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                                  title="Excluir produto"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {products.length === 0 && (
                      <div className="px-4 py-8 text-center font-sans text-cream/60">
                        Nenhum produto cadastrado
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'confirmados' && (
                <div>
                  <h2 className="font-serif text-3xl text-gold-gradient mb-6">
                    Convidados Confirmados
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="rounded-lg border border-gold/30 bg-[#061A2F] p-6">
                      <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold/90">
                        Total Confirmados
                      </p>
                      <p className="mt-2 font-serif text-3xl text-green-400">
                        {guests.filter(g => g.status === 'confirmed').length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gold/30 bg-[#061A2F] p-6">
                      <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold/90">
                        Pendentes
                      </p>
                      <p className="mt-2 font-serif text-3xl text-yellow-400">
                        {guests.filter(g => g.status === 'pending').length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gold/30 bg-[#061A2F] p-6">
                      <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold/90">
                        Recusas
                      </p>
                      <p className="mt-2 font-serif text-3xl text-red-400">
                        {guests.filter(g => g.status === 'declined').length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gold/30 bg-[#061A2F] p-6">
                      <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold/90">
                        Taxa de Confirmação
                      </p>
                      <p className="mt-2 font-serif text-3xl text-cream">
                        {guests.length > 0 ? ((guests.filter(g => g.status === 'confirmed').length / guests.length) * 100).toFixed(0) : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gold/30 bg-[#061A2F] overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#09243D]">
                        <tr>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                            Nome
                          </th>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                            Telefone
                          </th>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                            WhatsApp
                          </th>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                            Data Confirmação
                          </th>
                          <th className="px-4 py-3 text-right font-sans text-xs uppercase tracking-[0.15em] text-gold">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {guests.filter(g => g.status === 'confirmed').map((guest) => (
                          <tr key={guest.id} className="border-t border-gold/20">
                            <td className="px-4 py-3 font-sans text-sm text-cream">
                              {guest.nome_completo}
                            </td>
                            <td className="px-4 py-3 font-sans text-sm text-cream/80">
                              {guest.email || '-'}
                            </td>
                            <td className="px-4 py-3 font-sans text-sm text-cream/80">
                              {guest.telefone || '-'}
                            </td>
                            <td className="px-4 py-3 font-sans text-sm text-cream/80">
                              {guest.whatsapp || '-'}
                            </td>
                            <td className="px-4 py-3 font-sans text-sm text-cream/80">
                              Confirmado
                            </td>
                            <td className="px-4 py-3 text-right flex gap-2 justify-end">
                              {guest.whatsapp && (
                                <button
                                  onClick={() => sendWhatsAppInvite(guest)}
                                  className="text-green-400 hover:text-green-300 transition-colors"
                                  title="Enviar mensagem pelo WhatsApp"
                                >
                                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                  </svg>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {guests.filter(g => g.status === 'confirmed').length === 0 && (
                      <div className="px-4 py-8 text-center font-sans text-cream/60">
                        Nenhum convidado confirmado ainda
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'financeiro' && (
                <div>
                  <h2 className="font-serif text-3xl text-gold-gradient mb-6">Financeiro</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="rounded-lg border border-gold/30 bg-[#061A2F] p-6">
                      <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold/90">
                        Total Arrecadado
                      </p>
                      <p className="mt-2 font-serif text-3xl text-gold-gradient">
                        R$ {giftsReceived.reduce((total, gift) => total + gift.amount, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gold/30 bg-[#061A2F] p-6">
                      <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold/90">
                        Total de Presentes
                      </p>
                      <p className="mt-2 font-serif text-3xl text-cream">
                        {giftsReceived.length}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gold/30 bg-[#061A2F] p-6">
                      <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold/90">
                        Média por Presente
                      </p>
                      <p className="mt-2 font-serif text-3xl text-cream">
                        R$ {giftsReceived.length > 0 ? (giftsReceived.reduce((total, gift) => total + gift.amount, 0) / giftsReceived.length).toFixed(2) : '0.00'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gold/30 bg-[#061A2F] p-6">
                      <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold/90">
                        Convidados Confirmados
                      </p>
                      <p className="mt-2 font-serif text-3xl text-cream">
                        {guests.filter(g => g.status === 'confirmed').length}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gold/30 bg-[#061A2F] overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#09243D]">
                        <tr>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                            Data
                          </th>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                            Tipo
                          </th>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                            Presente
                          </th>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                            Convidado
                          </th>
                          <th className="px-4 py-3 text-left font-sans text-xs uppercase tracking-[0.15em] text-gold">
                            Mensagem
                          </th>
                          <th className="px-4 py-3 text-right font-sans text-xs uppercase tracking-[0.15em] text-gold">
                            Valor
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {giftsReceived.map((gift) => (
                          <tr key={gift.id} className="border-t border-gold/20">
                            <td className="px-4 py-3 font-sans text-sm text-cream">
                              {new Date(gift.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-4 py-3 font-sans text-sm">
                              <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider ${
                                gift.tipo === 'gravata' 
                                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                                  : 'bg-gold/20 text-gold border border-gold/30'
                              }`}>
                                {gift.tipo === 'gravata' ? '💝 Gravata' : '🎁 Presente'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-sans text-sm text-cream/80">
                              {gift.product_name}
                            </td>
                            <td className="px-4 py-3 font-sans text-sm text-cream/80">
                              {gift.guest_name}
                            </td>
                            <td className="px-4 py-3 font-sans text-sm text-cream/80 max-w-xs">
                              {gift.mensagem ? (
                                <span className="italic text-gold/90">"{gift.mensagem}"</span>
                              ) : (
                                <span className="text-cream/40">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-sans text-sm text-gold">
                              R$ {gift.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {giftsReceived.length === 0 && (
                      <div className="px-4 py-8 text-center font-sans text-cream/60">
                        Nenhum presente recebido ainda
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'presentes' && (
                <div>
                  <h2 className="font-serif text-3xl text-gold-gradient mb-6">
                    Presentes Ganhos
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {giftsReceived.map((gift) => (
                      <div key={gift.id} className={`rounded-lg border p-6 ${
                        gift.tipo === 'gravata' 
                          ? 'border-pink-500/30 bg-pink-950/10' 
                          : 'border-gold/30 bg-[#061A2F]'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                            gift.tipo === 'gravata' 
                              ? 'border-pink-500 bg-pink-950/30' 
                              : 'border-gold bg-[#09243D]'
                          }`}>
                            {gift.tipo === 'gravata' ? (
                              <span className="text-2xl">💝</span>
                            ) : (
                              <Package className="h-6 w-6 text-gold" />
                            )}
                          </div>
                          <span className={`font-serif text-xl ${
                            gift.tipo === 'gravata' 
                              ? 'text-pink-400' 
                              : 'text-gold-gradient'
                          }`}>
                            R$ {gift.amount.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="mb-2">
                          <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider ${
                            gift.tipo === 'gravata' 
                              ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                              : 'bg-gold/20 text-gold border border-gold/30'
                          }`}>
                            {gift.tipo === 'gravata' ? 'Gravatinha' : 'Presente'}
                          </span>
                        </div>
                        
                        <h3 className="font-serif text-lg text-cream mb-2">
                          {gift.product_name}
                        </h3>
                        
                        <div className="mt-4 pt-4 border-t border-gold/20">
                          <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold/90 mb-1">
                            Presenteado por
                          </p>
                          <p className="font-sans text-sm text-cream/80">
                            {gift.guest_name}
                          </p>
                        </div>
                        
                        {gift.mensagem && (
                          <div className="mt-3 pt-3 border-t border-gold/10">
                            <p className="font-sans text-xs uppercase tracking-[0.2em] text-gold/90 mb-1">
                              Mensagem
                            </p>
                            <p className="font-sans text-sm text-gold/90 italic">
                              "{gift.mensagem}"
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-2">
                          <p className="font-sans text-xs text-cream/60">
                            {new Date(gift.date).toLocaleDateString('pt-BR')} às {new Date(gift.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {giftsReceived.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gold/30 mx-auto mb-4" />
                      <p className="font-sans text-cream/60">
                        Nenhum presente ganho ainda
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'configuracoes' && (
                <div>
                  <h2 className="font-serif text-3xl text-gold-gradient mb-6">
                    Configurações
                  </h2>
                  <p className="font-sans text-cream/80">
                    Configure as opções do sistema.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
