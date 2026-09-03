'use client'

import { useState, useEffect } from 'react'
import { wedding } from '@/lib/wedding-config'
import { Heart, Menu, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Header() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  const navigateToPage = (path: string) => {
    router.push(path)
    setMobileMenuOpen(false)
  }

  const navItems = [
    { label: 'Início', action: () => navigateToPage('/') },
    { label: 'Nossa História', action: () => navigateToPage('/#historia') },
    { label: 'O Casamento', action: () => navigateToPage('/#casamento') },
    { label: 'Galeria', action: () => navigateToPage('/#galeria') },
    { label: 'Confirmar Presença', action: () => navigateToPage('/rsvp') },
    { label: 'Lista de Presentes', action: () => navigateToPage('/presentes') },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? 'bg-[#061A2F]/50 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo */}
          <div>
            <img
              src="/LOGOBE.png"
              alt="Logo"
              className="h-12 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="font-sans text-xs uppercase tracking-[0.2em] text-cream/90 transition-colors hover:text-gold"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-cream/90 hover:text-gold transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gold/20">
            <div className="flex flex-col gap-4 pt-4">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="font-sans text-sm uppercase tracking-[0.2em] text-cream/90 transition-colors hover:text-gold text-left py-2"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
