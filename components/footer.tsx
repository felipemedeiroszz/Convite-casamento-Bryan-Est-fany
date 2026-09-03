import { wedding } from '@/lib/wedding-config'
import { Heart, Mail, MessageCircle, Share2 } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gold/20 bg-background py-16 text-center">
      <div className="mx-auto max-w-4xl px-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/LOGOBE.png"
            alt="Logo"
            className="h-20 w-auto"
          />
        </div>

        <p className="mt-6 font-serif text-2xl text-gold-gradient">
          {wedding.noivos.ele} &amp; {wedding.noivos.ela}
        </p>

        <p className="mt-4 font-serif text-lg italic text-cream/80">
          Obrigado por fazer parte da nossa história!
        </p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <span className="h-px w-12 gold-hairline" />
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {wedding.dataExtenso}
          </span>
          <span className="h-px w-12 gold-hairline" />
        </div>

        {/* Social Icons */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <a
            href="#"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-gold transition-colors hover:bg-gold/20"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-gold transition-colors hover:bg-gold/20"
            aria-label="Compartilhar"
          >
            <Share2 className="h-5 w-5" />
          </a>
          <a
            href="#"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-gold transition-colors hover:bg-gold/20"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>

        <p className="mt-8 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Feito com ♡ para o nosso grande dia
        </p>
      </div>
    </footer>
  )
}
