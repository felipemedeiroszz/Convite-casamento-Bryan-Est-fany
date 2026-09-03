'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

type Guest = {
  id: string
  nome_completo: string
  status: 'pending' | 'confirmed' | 'declined'
}

type Companion = {
  id: string
  guest_id?: string
  nome: string
  status: 'pending' | 'confirmed' | 'declined'
}

export default function RsvpPage() {
  const router = useRouter()
  const [guests, setGuests] = useState<Guest[]>([])
  const [selectedGuestId, setSelectedGuestId] = useState('')
  const [willAttend, setWillAttend] = useState(true)
  const [companionCount, setCompanionCount] = useState(0)
  const [companions, setCompanions] = useState<Companion[]>([])
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [useGuestList, setUseGuestList] = useState(true)
  const [guestName, setGuestName] = useState('')

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    try {
      const response = await fetch('/api/guests')
      if (!response.ok) {
        console.error('Failed to fetch guests:', response.status)
        setUseGuestList(false)
        return
      }
      const data = await response.json()
      // Only show guests that are not confirmed
      const availableGuests = data.filter((g: Guest) => g.status !== 'confirmed')
      setGuests(availableGuests)
      if (availableGuests.length === 0) {
        setUseGuestList(false)
      }
    } catch (error) {
      console.error('Error fetching guests:', error)
      setUseGuestList(false)
    }
  }

  useEffect(() => {
    // Update companions when count changes
    const newCompanions: Companion[] = []
    for (let i = 0; i < companionCount; i++) {
      const existing = companions[i]
      newCompanions.push({
        id: existing?.id || `comp-${i}`,
        guest_id: existing?.guest_id,
        nome: existing?.nome || '',
        status: existing?.status || 'pending'
      })
    }
    setCompanions(newCompanions)
  }, [companionCount])

  const handleCompanionChange = (index: number, field: keyof Companion, value: string) => {
    const updated = [...companions]
    updated[index] = { ...updated[index], [field]: value }
    setCompanions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const guestId = useGuestList ? selectedGuestId : undefined
      const nome = useGuestList 
        ? (guests.find(g => g.id === selectedGuestId)?.nome_completo || '')
        : guestName

      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: guestId,
          nome,
          comparecera: willAttend,
          acompanhantes: companionCount,
          mensagem: message,
          companions: companions
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        // Update guest status to confirmed only if using guest list
        if (useGuestList && selectedGuestId) {
          await fetch(`/api/guests/${selectedGuestId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: willAttend ? 'confirmed' : 'declined' })
          })
        }
        
        // Redirect to gifts page after successful submission
        setTimeout(() => {
          router.push('/presentes')
        }, 2000)
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="min-h-screen bg-navy-gradient flex items-center justify-center px-6">
          <div className="max-w-xl w-full">
            <div className="flex flex-col items-center rounded-lg border border-gold/40 bg-[#09243D]/50 p-10 text-center backdrop-blur-sm shadow-lg shadow-gold/20">
              <CheckCircle2 className="h-16 w-16 text-gold" aria-hidden="true" />
              <p className="mt-6 font-serif text-3xl text-gold-gradient">
                Obrigado!
              </p>
              <p className="mt-4 font-sans text-lg text-cream">
                Sua confirmação foi registrada com sucesso.
              </p>
              <p className="mt-2 font-sans text-sm text-cream/70">
                Redirecionando para a lista de presentes...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="min-h-screen bg-navy-gradient py-24 sm:py-32">
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

      <div className="relative z-10 mx-auto max-w-xl px-6">
        <div className="text-center">
          <p className="font-sans text-xs uppercase tracking-[0.4em] text-gold/90">
            Confirme sua Presença
          </p>
          <h2 className="mt-4 text-balance font-serif text-3xl text-gold-gradient sm:text-4xl md:text-5xl">
            Você faz parte deste momento
          </h2>
          <div className="mt-6 flex items-center justify-center gap-4">
            <span className="h-px w-16 gold-hairline" />
            <span className="font-serif text-lg italic text-gold/80">♡</span>
            <span className="h-px w-16 gold-hairline" />
          </div>
          <p className="mx-auto mt-6 max-w-md text-pretty font-sans text-sm leading-relaxed text-cream/90">
            Por gentileza, confirme sua presença para que possamos preparar tudo
            com carinho.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-12 rounded-lg border border-gold/30 bg-[#09243D]/50 p-8 backdrop-blur-sm shadow-lg shadow-gold/10 sm:p-10"
        >
          <div className="space-y-6">
            {useGuestList ? (
              <div>
                <label
                  htmlFor="guest"
                  className="mb-2 block font-sans text-xs uppercase tracking-[0.25em] text-gold/90"
                >
                  Selecione seu nome
                </label>
                <select
                  id="guest"
                  required
                  value={selectedGuestId}
                  onChange={(e) => setSelectedGuestId(e.target.value)}
                  className="w-full rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-3 font-sans text-sm text-cream focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                >
                  <option value="">Selecione...</option>
                  {guests.map((guest) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.nome_completo}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="nome"
                  className="mb-2 block font-sans text-xs uppercase tracking-[0.25em] text-gold/90"
                >
                  Nome completo
                </label>
                <input
                  id="nome"
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={120}
                  placeholder="Seu nome"
                  className="w-full rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-3 font-sans text-sm text-cream placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                />
              </div>
            )}

            <fieldset>
              <legend className="mb-3 block font-sans text-xs uppercase tracking-[0.25em] text-gold/90">
                Você comparecerá?
              </legend>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-3 font-sans text-sm text-cream transition-all has-[:checked]:border-gold has-[:checked]:bg-gold/20 hover:border-gold/50">
                  <input
                    type="radio"
                    name="comparecera"
                    checked={willAttend}
                    onChange={() => setWillAttend(true)}
                    className="accent-gold"
                  />
                  Sim, estarei lá
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-3 font-sans text-sm text-cream transition-all has-[:checked]:border-gold has-[:checked]:bg-gold/20 hover:border-gold/50">
                  <input
                    type="radio"
                    name="comparecera"
                    checked={!willAttend}
                    onChange={() => setWillAttend(false)}
                    className="accent-gold"
                  />
                  Não poderei ir
                </label>
              </div>
            </fieldset>

            {willAttend && (
              <>
                <div>
                  <label
                    htmlFor="acompanhantes"
                    className="mb-2 block font-sans text-xs uppercase tracking-[0.25em] text-gold/90"
                  >
                    Número de acompanhantes
                  </label>
                  <input
                    id="acompanhantes"
                    type="number"
                    min={0}
                    max={20}
                    value={companionCount}
                    onChange={(e) => setCompanionCount(parseInt(e.target.value) || 0)}
                    className="w-full rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-3 font-sans text-sm text-cream focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
                  />
                </div>

                {companionCount > 0 && (
                  <div className="space-y-4">
                    <p className="font-sans text-xs uppercase tracking-[0.25em] text-gold/90">
                      Acompanhantes
                    </p>
                    {companions.map((companion, index) => (
                      <div key={companion.id} className="rounded-lg border border-gold/30 bg-[#061A2F] p-4">
                        <div className="mb-3">
                          <label
                            htmlFor={`companion-${index}`}
                            className="mb-2 block font-sans text-xs uppercase tracking-[0.15em] text-cream/80"
                          >
                            Nome do acompanhante {index + 1}
                          </label>
                          <select
                            id={`companion-${index}`}
                            required
                            value={companion.guest_id || ''}
                            onChange={(e) => {
                              const guest = guests.find(g => g.id === e.target.value)
                              handleCompanionChange(index, 'guest_id', e.target.value)
                              handleCompanionChange(index, 'nome', guest?.nome_completo || e.target.value)
                            }}
                            className="w-full rounded-lg border border-gold/30 bg-[#09243D] px-4 py-2 font-sans text-sm text-cream focus:border-gold focus:outline-none transition-colors"
                          >
                            <option value="">Selecione...</option>
                            {guests
                              .filter(g => g.id !== selectedGuestId) // Exclude main guest
                              .map((guest) => (
                                <option key={guest.id} value={guest.id}>
                                  {guest.nome_completo}
                                </option>
                              ))}
                          </select>
                        </div>
                        <fieldset>
                          <legend className="mb-2 block font-sans text-xs uppercase tracking-[0.15em] text-cream/80">
                            Comparecerá?
                          </legend>
                          <div className="grid grid-cols-3 gap-2">
                            <label className="flex cursor-pointer items-center justify-center gap-1 rounded border border-gold/30 bg-[#09243D] px-2 py-2 font-sans text-xs text-cream transition-all has-[:checked]:border-gold has-[:checked]:bg-gold/20">
                              <input
                                type="radio"
                                name={`comp-status-${index}`}
                                checked={companion.status === 'confirmed'}
                                onChange={() => handleCompanionChange(index, 'status', 'confirmed')}
                                className="accent-gold"
                              />
                              Sim
                            </label>
                            <label className="flex cursor-pointer items-center justify-center gap-1 rounded border border-gold/30 bg-[#09243D] px-2 py-2 font-sans text-xs text-cream transition-all has-[:checked]:border-gold has-[:checked]:bg-gold/20">
                              <input
                                type="radio"
                                name={`comp-status-${index}`}
                                checked={companion.status === 'declined'}
                                onChange={() => handleCompanionChange(index, 'status', 'declined')}
                                className="accent-gold"
                              />
                              Não
                            </label>
                            <label className="flex cursor-pointer items-center justify-center gap-1 rounded border border-gold/30 bg-[#09243D] px-2 py-2 font-sans text-xs text-cream transition-all has-[:checked]:border-gold has-[:checked]:bg-gold/20">
                              <input
                                type="radio"
                                name={`comp-status-${index}`}
                                checked={companion.status === 'pending'}
                                onChange={() => handleCompanionChange(index, 'status', 'pending')}
                                className="accent-gold"
                              />
                              Pendente
                            </label>
                          </div>
                        </fieldset>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div>
              <label
                htmlFor="mensagem"
                className="mb-2 block font-sans text-xs uppercase tracking-[0.25em] text-gold/90"
              >
                Deixe uma mensagem <span className="text-muted-foreground/60">(opcional)</span>
              </label>
              <textarea
                id="mensagem"
                rows={3}
                maxLength={500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Um recadinho para os noivos…"
                className="w-full resize-none rounded-lg border border-gold/30 bg-[#061A2F] px-4 py-3 font-sans text-sm text-cream placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="hover:scale-105 transition-transform disabled:cursor-not-allowed disabled:opacity-60"
            >
              <img
                src="/confirme.png"
                alt={loading ? 'Enviando…' : 'Confirmar Presença'}
                className="h-12 w-auto"
              />
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
    </main>
  )
}