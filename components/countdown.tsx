'use client'

import { useEffect, useState } from 'react'
import { wedding } from '@/lib/wedding-config'

function getRemaining(target: number) {
  const diff = Math.max(0, target - Date.now())
  const dias = Math.floor(diff / 86400000)
  const horas = Math.floor((diff % 86400000) / 3600000)
  const minutos = Math.floor((diff % 3600000) / 60000)
  const segundos = Math.floor((diff % 60000) / 1000)
  return { dias, horas, minutos, segundos }
}

const labels: Record<string, string> = {
  dias: 'Dias',
  horas: 'Horas',
  minutos: 'Minutos',
  segundos: 'Segundos',
}

export function Countdown() {
  const target = new Date(wedding.data).getTime()
  const [time, setTime] = useState(() => getRemaining(target))
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(getRemaining(target))
    const id = setInterval(() => setTime(getRemaining(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  return (
    <section className="relative bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="font-sans text-xs uppercase tracking-[0.4em] text-gold/80">
          Contagem regressiva
        </p>
        <h2 className="mt-3 text-balance font-serif text-3xl text-cream sm:text-4xl">
          Faltam poucos momentos para o grande dia
        </h2>

        <div className="mt-10 grid grid-cols-4 gap-3 sm:gap-6">
          {(['dias', 'horas', 'minutos', 'segundos'] as const).map((unit) => (
            <div
              key={unit}
              className="flex flex-col items-center rounded-lg border border-border/60 bg-card px-2 py-5 sm:py-7"
            >
              <span className="font-serif text-3xl font-medium tabular-nums text-gold-gradient sm:text-5xl">
                {mounted ? String(time[unit]).padStart(2, '0') : '--'}
              </span>
              <span className="mt-2 font-sans text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:text-xs">
                {labels[unit]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
