'use client'

import { useEffect } from 'react'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Story } from '@/components/story'
import { Gallery } from '@/components/gallery'
import { Gifts } from '@/components/gifts'
import { Location } from '@/components/location'
import { Footer } from '@/components/footer'

export default function Page() {
  useEffect(() => {
    // Handle hash navigation for sections
    const hash = window.location.hash.replace('#', '')
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Story />
      <Location />
      <Gallery />
      <Gifts />
      <Footer />
    </main>
  )
}
