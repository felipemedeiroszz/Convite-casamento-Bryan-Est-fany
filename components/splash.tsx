'use client'

import { useState, useEffect } from 'react'

export function Splash() {
  const [isVisible, setIsVisible] = useState(true)
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    // Timeline da animação
    const timers = [
      setTimeout(() => setAnimationPhase(1), 500),   // Envelope aparece
      setTimeout(() => setAnimationPhase(2), 1500),  // Envelope começa a abrir
      setTimeout(() => setAnimationPhase(3), 2500),  // Papel começa a sair
      setTimeout(() => setAnimationPhase(4), 3500),  // Papel se expande
      setTimeout(() => setAnimationPhase(5), 4500),  // Fade out
      setTimeout(() => setIsVisible(false), 5000),   // Remove do DOM
    ]

    return () => timers.forEach(clearTimeout)
  }, [])

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-500 ${
        animationPhase >= 5 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div 
        className={`splash-wrapper transition-all duration-700 ease-out ${
          animationPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        } ${animationPhase >= 4 ? 'scale-[200%] opacity-0' : ''}`}
      >
        {/* Aba do envelope fechada */}
        <div 
          className={`splash-lid splash-lid-one ${
            animationPhase >= 2 ? 'splash-lid-one-open' : ''
          }`}
        />

        {/* Aba do envelope aberta */}
        <div 
          className={`splash-lid splash-lid-two ${
            animationPhase >= 2 ? 'splash-lid-two-open' : ''
          }`}
        />

        {/* Corpo do envelope */}
        <div className="splash-envelope" />

        {/* Papel da carta */}
        <div 
          className={`splash-letter ${
            animationPhase >= 3 ? 'splash-letter-out' : ''
          }`}
        >
          <div className="splash-letter-content">
            {/* Decorative corner */}
            <div className="splash-corner splash-corner-top-left" />
            <div className="splash-corner splash-corner-top-right" />
            <div className="splash-corner splash-corner-bottom-left" />
            <div className="splash-corner splash-corner-bottom-right" />
            
            {/* Inner border */}
            <div className="splash-inner-border" />
            
            {/* Header decoration */}
            <div className="splash-header-decoration">
              <div className="splash-line" />
              <div className="splash-diamond" />
              <div className="splash-line" />
            </div>
            
            {/* Logo */}
            <div className="splash-logo">
              <img 
                src="/LOGOBE.png" 
                alt="Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            
            {/* Names */}
            <div className="splash-names">
              <p className="splash-name-main">Bryan</p>
              <div className="splash-ampersand">&</div>
              <p className="splash-name-main">Estéfany</p>
            </div>
            
            {/* Footer decoration */}
            <div className="splash-footer-decoration">
              <div className="splash-line" />
              <div className="splash-diamond" />
              <div className="splash-line" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
