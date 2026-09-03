'use client'

import { useEffect, useRef, useState } from 'react'
import { wedding } from '@/lib/wedding-config'
import { useRouter } from 'next/navigation'

const galleryImages = [
  '/1.png',
  '/2.png',
  '/3.png',
]

export function Gallery() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const gallerySection = document.getElementById('galeria')
      if (!gallerySection) return

      const rect = gallerySection.getBoundingClientRect()
      const sectionHeight = gallerySection.offsetHeight
      const windowHeight = window.innerHeight
      
      // Calculate progress - need to scroll through entire section to see all images
      const scrollableDistance = sectionHeight - windowHeight
      const progress = Math.max(0, Math.min(1, -rect.top / scrollableDistance))
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial call
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section 
      ref={sectionRef}
      id="galeria" className="relative min-h-[200vh] bg-[#061A2F]">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-1/4 w-32 h-32 opacity-5">
          <svg viewBox="0 0 100 100" className="w-full h-full text-gold">
            <path
              fill="currentColor"
              d="M50,5 C60,5 70,15 70,25 C70,35 60,45 50,45 C40,45 30,35 30,25 C30,15 40,5 50,5 Z"
            />
          </svg>
        </div>
        <div className="absolute right-0 bottom-1/4 w-32 h-32 opacity-5">
          <svg viewBox="0 0 100 100" className="w-full h-full text-gold">
            <path
              fill="currentColor"
              d="M50,5 C60,5 70,15 70,25 C70,35 60,45 50,45 C40,45 30,35 30,25 C30,15 40,5 50,5 Z"
            />
          </svg>
        </div>
      </div>

      <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center mb-8">
          <p className={`font-sans text-xs uppercase tracking-[0.4em] text-gold/90 ${isVisible ? 'animate-slide-left' : 'opacity-0'}`}>
            Galeria
          </p>
          <h2 className={`mt-4 text-balance font-serif text-3xl text-gold-gradient sm:text-4xl md:text-5xl ${isVisible ? 'animate-slide-left' : 'opacity-0'}`} style={isVisible ? { animationDelay: '0.2s' } : undefined}>
            Nossos Momentos
          </h2>
          <div className={`mt-6 flex items-center justify-center gap-4 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={isVisible ? { animationDelay: '0.4s' } : undefined}>
            <span className="h-px w-16 gold-hairline" />
            <span className="font-serif text-lg italic text-gold/80">
              {wedding.noivos.iniciais}
            </span>
            <span className="h-px w-16 gold-hairline" />
          </div>
          <p className={`mt-6 font-sans text-sm text-cream/80 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={isVisible ? { animationDelay: '0.6s' } : undefined}>
            Role para ver nossas fotos
          </p>
        </div>

        {/* Scroll-based Carousel */}
        <div ref={containerRef} className="relative w-full max-w-6xl h-[40vh] sm:h-[50vh] md:h-[60vh] flex items-center justify-center">
          {galleryImages.map((src, index) => {
            // Calculate position based on scroll progress
            const totalImages = galleryImages.length
            const imageProgress = (index / totalImages) + (scrollProgress * 0.5)
            const normalizedProgress = imageProgress % 1
            const distanceFromCenter = Math.abs(normalizedProgress - 0.5) * 2
            
            // Scale: center image is largest (1.2), edges are smallest (0.6)
            const scale = 1.2 - (distanceFromCenter * 0.6)
            
            // Opacity: center is 1, edges fade to 0.3
            const opacity = 1 - (distanceFromCenter * 0.7)
            
            // Translate X: spread images horizontally - less on mobile
            const translateX = (normalizedProgress - 0.5) * (isMobile ? 400 : 1200)
            
            // Z-index: center image on top
            const zIndex = Math.round(100 - distanceFromCenter * 100)

            return (
              <div
                key={index}
                className="absolute transition-all duration-300 ease-out"
                style={{
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  opacity,
                  zIndex,
                }}
              >
                <img
                  src={src}
                  alt={`Gallery image ${index + 1}`}
                  className="h-[25vh] sm:h-[35vh] md:h-[45vh] lg:h-[50vh] w-auto object-cover rounded-lg shadow-2xl border-2 border-gold/30"
                />
              </div>
            )
          })}
        </div>

        {/* View All Button */}
        <div className={`mt-12 text-center ${isVisible ? 'animate-fade-up' : 'opacity-0'}`} style={isVisible ? { animationDelay: '0.8s' } : undefined}>
          <button 
            onClick={() => router.push('/presentes')}
            className="hover:scale-105 transition-transform"
          >
            <img
              src="/botaoverlista.png"
              alt="Ver lista de presentes"
              className="h-16 w-auto"
            />
          </button>
        </div>
      </div>
    </section>
  )
}
