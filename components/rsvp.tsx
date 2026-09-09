'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

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

export function Rsvp() {
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
  const [errorMsg, setErrorMsg] = useState('')

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
    setCompanions(prev => {
      const result: Companion[] = []
      for (let i = 0; i < companionCount; i++) {
        const existing = prev[i]
        result.push({
          id: existing?.id || `comp-${i}-${Date.now()}`,
          guest_id: existing?.guest_id,
          nome: existing?.nome || '',
          status: existing?.status || 'confirmed'
        })
      }
      return result
    })
  }, [companionCount])

  const handleCompanionChange = (index: number, field: keyof Companion, value: string) => {
    setCompanions(prev => {
      const updated = prev.map((c, i) => i === index ? { ...c, [field]: value } : c)
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const guestId = useGuestList ? selectedGuestId || undefined : undefined
      const nome = useGuestList
        ? (guests.find(g => g.id === selectedGuestId)?.nome_completo || '')
        : guestName.trim()

      if (!nome) {
        setErrorMsg('Por favor, informe seu nome.')
        setLoading(false)
        return
      }

      for (let i = 0; i < companions.length; i++) {
        const comp = companions[i]
        if (!comp.nome.trim()) {
          setErrorMsg(`Por favor, informe o nome do acompanhante ${i + 1}.`)
          setLoading(false)
          return
        }
      }

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
      } else {
        const err = await response.json().catch(() => null)
        setErrorMsg(err?.error || 'Erro ao enviar. Tente novamente.')
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      setErrorMsg('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section id="rsvp" className="relative bg-navy-gradient py-24 sm:py-32">
        <div className="relative z-10 mx-auto max-w-xl px-6">
          <div className="mt-12 flex flex-col items-center rounded-lg border border-gold/40 bg-[#09243D]/50 p-10 text-center backdrop-blur-sm shadow-lg shadow-gold/20">
            <CheckCircle2 className="h-16 w-16 text-gold" aria-hidden="true" />
            <p className="mt-6 font-serif text-3xl text-gold-gradient">
              Obrigado!
            </p>
            <p className="mt-4 font-sans text-lg text-cream">
              Sua confirmação foi registrada com sucesso.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="rsvp" className="relative bg-navy-gradient py-24 sm:py-32">
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
                            Acompanhante {index + 1}
                          </label>
                          <select
                            id={`companion-${index}`}
                            required
                            value={companion.guest_id || ''}
                            onChange={(e) => {
                              const guest = guests.find((g) => g.id === e.target.value)
                              handleCompanionChange(index, 'guest_id', e.target.value)
                              handleCompanionChange(
                                index,
                                'nome',
                                guest?.nome_completo || ''
                              )
                            }}
                            className="w-full rounded-lg border border-gold/30 bg-[#09243D] px-4 py-2 font-sans text-sm text-cream focus:border-gold focus:outline-none transition-colors"
                          >
                            <option value="">Selecione o acompanhante...</option>
                            {guests
                              .filter((g) => g.id !== selectedGuestId)
                              .map((guest) => (
                                <option key={guest.id} value={guest.id}>
                                  {guest.nome_completo}
                                </option>
                              ))}
                          </select>
                          {companion.nome && (
                            <p className="mt-2 font-sans text-xs text-gold/70">
                              ✅ Selecionado: <span className="text-cream">{companion.nome}</span>
                            </p>
                          )}
                        </div>
                        <fieldset>
                          <legend className="mb-2 block font-sans text-xs uppercase tracking-[0.15em] text-cream/80">
                            Comparecerá?
                          </legend>
                          <div className="grid grid-cols-2 gap-2">
                            <label
                              className={`flex cursor-pointer items-center justify-center gap-1 rounded border px-2 py-2 font-sans text-xs text-cream transition-all ${
                                companion.status === 'confirmed'
                                  ? 'border-gold bg-gold/20'
                                  : 'border-gold/30 bg-[#09243D] hover:border-gold/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`comp-status-${index}`}
                                checked={companion.status === 'confirmed'}
                                onChange={() =>
                                  handleCompanionChange(index, 'status', 'confirmed')
                                }
                                className="accent-gold"
                              />
                              Sim
                            </label>
                            <label
                              className={`flex cursor-pointer items-center justify-center gap-1 rounded border px-2 py-2 font-sans text-xs text-cream transition-all ${
                                companion.status === 'declined'
                                  ? 'border-gold bg-gold/20'
                                  : 'border-gold/30 bg-[#09243D] hover:border-gold/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`comp-status-${index}`}
                                checked={companion.status === 'declined'}
                                onChange={() =>
                                  handleCompanionChange(index, 'status', 'declined')
                                }
                                className="accent-gold"
                              />
                              Não
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

            {errorMsg && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-center font-sans text-sm text-red-300">
                {errorMsg}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="group relative inline-flex h-14 min-w-[240px] items-center justify-center overflow-hidden rounded-full px-8 font-serif text-lg font-medium text-[#061A2F] shadow-lg shadow-gold/30 transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-xl hover:shadow-gold/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5B2 35%, #D4AF37 55%, #B8860B 100%)',
              }}
            >
              <span
                className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(135deg, #B8860B 0%, #F4E5B2 30%, #FFD700 50%, #D4AF37 100%)',
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="tracking-wide">Enviando…</span>
                  </>
                ) : (
                  <span className="tracking-wide">Confirmar Presença</span>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
