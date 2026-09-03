'use client'

import { wedding } from '@/lib/wedding-config'
import { useRouter } from 'next/navigation'

export function Location() {
  const router = useRouter()

  const navigateToPage = (path: string) => {
    router.push(path)
  }

  return (
    <section 
      id="casamento" className="relative min-h-[120vh] sm:min-h-screen py-32 sm:py-24">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/celebraçãodesktop.png"
          alt="Celebração"
          className="hidden md:block h-full w-full object-cover"
        />
        <img
          src="/celebraçãomobile.png"
          alt="Celebração"
          className="block md:hidden h-full w-full object-cover"
        />
      </div>

      {/* Buttons Overlay */}
      <div className="absolute bottom-6 sm:bottom-22 left-0 right-0 z-10 mx-auto max-w-4xl px-6">
        <div className="grid grid-cols-2 gap-0 sm:gap-6">
          {/* Map Button */}
          <div className="text-center">
            <a
              href={wedding.local.mapaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:scale-105 transition-transform"
            >
              <img
                src="/botaovernomapa.png"
                alt="Ver no Mapa"
                className="h-16 sm:h-24 w-auto mx-auto"
              />
            </a>
          </div>

          {/* Gift List Button */}
          <div className="text-center">
            <button
              onClick={() => navigateToPage('/presentes')}
              className="hover:scale-105 transition-transform"
            >
              <img
                src="/botaolistadepresentes.png"
                alt="Ver Lista de Presentes"
                className="h-16 sm:h-24 w-auto mx-auto"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
