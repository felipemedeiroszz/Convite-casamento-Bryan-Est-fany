'use client'

import { wedding } from '@/lib/wedding-config'
import { useRouter } from 'next/navigation'

export function Gifts() {
  const router = useRouter()

  const navigateToPage = (path: string) => {
    router.push(path)
  }

  return (
    <section
      id="confirmar"
      className="relative py-24 sm:py-32"
    >
      <div className="relative z-10 mx-auto max-w-4xl px-6">
        {/* Two Areas with Gold Buttons */}
        <div className="grid grid-cols-2 gap-8">
          {/* RSVP Area */}
          <div className="text-center">
            <button
              onClick={() => navigateToPage('/rsvp')}
              className="hover:scale-105 transition-transform"
            >
              <img
                src="/confirme.png"
                alt="Confirmar Presença"
                className="h-160 w-auto mx-auto"
              />
            </button>
          </div>

          {/* Gift List Area */}
          <div className="text-center">
            <button
              onClick={() => navigateToPage('/presentes')}
              className="hover:scale-105 transition-transform"
            >
              <img
                src="/lista.png"
                alt="Ver Lista de Presentes"
                className="h-160 w-auto mx-auto"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
