'use client'

import { useState, useEffect } from 'react'
import { wedding } from '@/lib/wedding-config'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now())
  const dias = Math.floor(diff / 86400000)
  const horas = Math.floor((diff % 86400000) / 3600000)
  const minutos = Math.floor((diff % 3600000) / 60000)
  const segundos = Math.floor((diff % 60000) / 1000)
  return { dias, horas, minutos, segundos }
}

export function Hero() {
  const router = useRouter()
  const target = new Date(wedding.data).getTime()
  const [time, setTime] = useState(() => getRemaining(target))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(getRemaining(target))
    const id = setInterval(() => setTime(getRemaining(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navigateToPage = (path: string) => {
    router.push(path)
  }

  return (
    <section id="hero" className="relative overflow-hidden min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/444.png"
          alt="Casal romântico"
          className="hidden md:block h-full w-full object-cover"
        />
        <img
          src="/heromobile.png"
          alt="Casal romântico"
          className="block md:hidden h-full w-full object-cover"
        />
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-black/30" />
      </div>


      <div className="relative z-40 mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row items-center px-6 py-20">
        {/* Left side - Content */}
        <div className="w-full md:w-1/2 text-left">
          <h1 className="text-balance font-serif text-4xl font-light leading-tight text-gold-gradient sm:text-5xl md:text-6xl lg:text-7xl break-words animate-fade-up">
            {wedding.noivos.ele}
            <span className="mx-4 font-serif italic text-gold/80">&</span>
            {wedding.noivos.ela}
          </h1>

          <div className="mt-4 flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <span className="h-px w-12 gold-hairline sm:w-16" />
            <span className="font-sans text-xs uppercase tracking-[0.35em] text-cream/90">
              {wedding.diaSemana}
            </span>
            <span className="h-px w-12 gold-hairline sm:w-16" />
          </div>

          <p className="mt-3 font-serif text-2xl text-cream sm:text-3xl md:text-4xl animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {wedding.dataExtenso}
          </p>

          <p className="mt-2 font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground animate-fade-up" style={{ animationDelay: '0.6s' }}>
            às {wedding.horario} — {wedding.local.cidade}
          </p>

          {/* Countdown */}
          <div className="mt-12 flex flex-row items-center justify-start sm:justify-center gap-2 sm:gap-4 md:gap-8 lg:gap-12 xl:gap-16 animate-fade-up pl-4 sm:pl-0" style={{ animationDelay: '0.8s' }}>
            {[
              { value: time.dias, label: 'Dias' },
              { value: time.horas, label: 'Horas' },
              { value: time.minutos, label: 'Minutos' },
              { value: time.segundos, label: 'Segundos' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center px-1 sm:px-2 md:px-4">
                {/* Ornamento superior sofisticado */}
                <div className="flex items-center gap-1 sm:gap-2 md:gap-3 mb-1 sm:mb-2 md:mb-3">
                  <div className="w-4 sm:w-8 md:w-12 h-px bg-gradient-to-r from-transparent via-gold/40 to-gold/70" />
                  <svg width="8" height="8" viewBox="0 0 16 16" className="text-gold/80 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5">
                    <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="0" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="0.5" />
                    <rect x="6" y="6" width="4" height="4" fill="currentColor" transform="rotate(45 8 8)" />
                  </svg>
                  <div className="w-4 sm:w-8 md:w-12 h-px bg-gradient-to-l from-transparent via-gold/40 to-gold/70" />
                </div>

                {/* Número com tipografia serifada sofisticada */}
                <span className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extralight tabular-nums text-gold-gradient tracking-[0.1em] sm:tracking-[0.15em]">
                  {mounted ? String(item.value).padStart(2, '0') : '--'}
                </span>

                {/* Label com espaçamento elegante */}
                <span className="mt-1 sm:mt-2 font-serif text-[8px] sm:text-[10px] md:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gold/90 font-light">
                  {item.label}
                </span>

                {/* Linha inferior delicada com arabesco */}
                <div className="flex items-center gap-1 sm:gap-2 md:gap-3 mt-1 sm:mt-2 md:mt-3">
                  <div className="w-6 sm:w-10 md:w-16 h-px bg-gradient-to-r from-transparent via-gold/30 to-gold/60" />
                  <svg width="10" height="6" viewBox="0 0 20 12" className="text-gold/70 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4">
                    <path d="M0 6 Q5 2, 10 6 Q15 10, 20 6" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <circle cx="10" cy="6" r="1.5" fill="currentColor" />
                  </svg>
                  <div className="w-6 sm:w-10 md:w-16 h-px bg-gradient-to-l from-transparent via-gold/30 to-gold/60" />
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 animate-fade-up relative z-50 pointer-events-auto" style={{ animationDelay: '1s' }}>
            <button
              onClick={() => navigateToPage('/rsvp')}
              className="hover:scale-105 transition-transform"
            >
              <img
                src="/botaoconfirmarpresença.png"
                alt="Confirmar Presença"
                className="h-16 w-auto"
              />
            </button>
            <button
              onClick={() => navigateToPage('/presentes')}
              className="hover:scale-105 transition-transform"
            >
              <img
                src="/botaoverlista.png"
                alt="Lista de Presentes"
                className="h-16 w-auto"
              />
            </button>
          </div>
        </div>

        {/* Right side - Empty for visual balance */}
        <div className="hidden md:block md:w-1/2" />
      </div>
    </section>
  )
}
