import { wedding } from '@/lib/wedding-config'
import { useEffect, useRef, useState } from 'react'

const journeyImages = [
  { src: '/nosconhecemos.png', alt: 'Nos conhecemos' },
  { src: '/namoramos.png', alt: 'Namoramos' },
  { src: '/opedido.png', alt: 'O pedido' },
  { src: '/nossograndedia.png', alt: 'Nosso grande dia' },
]

export function Story() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setCurrentImage(0)
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
    if (!isVisible) return

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % journeyImages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [isVisible])
  return (
    <section
      ref={sectionRef}
      id="historia"
      className="relative py-24 sm:py-32 -mt-40 z-30"
    >
      {/* Torn paper background image - positioned to create torn edge effect overlapping hero and location */}
      <div className="absolute inset-0 z-0 -mt-40 -mb-32">
        <img
          src="/sessaohistoria.png"
          alt="Fundo papel rasgado"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-20 mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div>
            <p className={`font-sans text-sm uppercase tracking-[0.4em] text-black ${isVisible ? 'animate-slide-left' : 'opacity-0'}`}>
              Nossa História
            </p>
            <h2 className={`mt-4 text-balance font-serif text-4xl text-black sm:text-5xl md:text-6xl ${isVisible ? 'animate-slide-left' : 'opacity-0'}`} style={isVisible ? { animationDelay: '0.2s' } : undefined}>
              Uma jornada de amor
            </h2>
            <div className="mt-6 flex items-center gap-4">
              <span className="h-px w-16 bg-black" />
              <span className="font-serif text-2xl italic text-black">
                B & E
              </span>
              <span className="h-px w-16 bg-black" />
            </div>

            {/* Story text */}
            <div className="mt-12 space-y-4 font-sans text-lg leading-relaxed text-white">
              <p className="text-pretty">
                Bryan e Estéfany se conheceram quando menos esperavam e, desde então, escrevem juntos uma história feita de cumplicidade, risadas e sonhos compartilhados.
              </p>
              <p className="text-pretty">
                Depois de tantos capítulos vividos lado a lado, chegou o momento de celebrar o amor diante de quem mais amamos. Será uma honra ter você presente neste dia tão especial.
              </p>
            </div>
          </div>

          {/* Right side - Journey images with animation */}
          <div className="flex justify-center items-center h-[24rem] sm:h-[28rem] md:h-[32rem]">
            {journeyImages.map((image, index) => (
              <img
                key={index}
                src={image.src}
                alt={image.alt}
                className={`absolute h-[20rem] sm:h-[24rem] md:h-[28rem] w-auto object-contain transition-all duration-1000 ease-in-out ${
                  index === currentImage
                    ? 'opacity-100 scale-100 translate-x-0'
                    : index < currentImage
                    ? 'opacity-0 scale-90 -translate-x-8'
                    : 'opacity-0 scale-90 translate-x-8'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
