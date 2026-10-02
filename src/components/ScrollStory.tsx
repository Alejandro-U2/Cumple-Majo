import { useCallback, useState } from 'react'
import type { RefObject } from 'react'
import { HeroParticles } from './HeroParticles'
import { FloatBox } from './FloatBox'
import { LetterModal, type LetterContent } from './LetterModal'
import { polarImages, reasons } from '@/data/story'

interface ScrollStoryProps {
  heroRef: RefObject<HTMLElement>
  progressRef: RefObject<number>
}

export function ScrollStory({ heroRef, progressRef }: ScrollStoryProps) {
  const [selectedLetter, setSelectedLetter] = useState<LetterContent | null>(null)
  const triggerConfetti = useCallback(() => {
    window.dispatchEvent(new CustomEvent('confetti:burst'))
  }, [])
  const closeLetter = useCallback(() => setSelectedLetter(null), [])

  const handleConfettiClick = () => {
    triggerConfetti()
  }

  return (
    <>
    <section className="hero" id="hero" ref={heroRef}>
      <div className="hero-stage">
        <HeroParticles progressRef={progressRef} onConfettiTrigger={triggerConfetti} />
        <div className="hero-aura" />
        <div className="vignette" />
        <div className="hero-grid" data-hero-fade>
          <div className="hero-side left">
            <div className="hero-rule" />
            <div className="hero-word">HAPPY</div>
          </div>
          <div />
          <div className="hero-side right">
            <div className="hero-rule" />
            <div className="hero-word">BIRTHDAY</div>
          </div>
        </div>
        <div className="hero-month" data-hero-fade>
          OCTOBER
        </div>
        <div className="inf-label top" data-inf-fade>
          TE AMO
        </div>
        <div className="inf-label bottom" data-inf-fade>
          INFINITO
        </div>
        <div className="inf-label base" data-inf-fade>
          POR SIEMPRE
        </div>
        <div className="page-marker">
          <span>03</span>
          <i />
          <span>10</span>
        </div>
        <div className="hero-bottom-line" />
        <div className="scroll-message" data-scroll-message>
          PARA TI
        </div>
        <div className="scroll-cue" data-scroll-cue>
          <i />
          Sigue bajando
          <i />
        </div>
      </div>

      <FloatBox
        className="b1"
        index="01 / 04"
        kicker="Para ti"
        title="Hoy el mundo gira por ti."
        lead="Un día tan especial merecía algo con luz propia. Cada partícula que ves aquí es un pedacito de todo lo que siento por ti."
      />

      <FloatBox className="b2" index="02 / 04" kicker="Nuestros momentos" title="Cada foto, un motivo para sonreír.">
        <div className="polar-grid">
          {polarImages.map((img, i) => (
            <figure className="polar" key={i}>
              <img src={img.src} alt={img.alt} loading="lazy" />
              <figcaption>{img.caption}</figcaption>
            </figure>
          ))}
        </div>
      </FloatBox>

      <FloatBox className="b3" index="03 / 04" kicker="Razones" title="Por qué te amo">
        <ul className="reasons">
          {reasons.map((r, i) => (
            <li key={i}>
              <span className="h">♥</span>
              {r.text}
            </li>
          ))}
        </ul>
      </FloatBox>

      <FloatBox className="b4" index="04 / 04" kicker="Hoy" title="Feliz cumpleaños">
        <p className="lead">
          Que este nuevo año te traiga todo lo que mereces, y que siga a tu lado para vivirlo contigo. Te amo, hoy y por
          siempre.
        </p>
        <button className="confetti-btn" onClick={handleConfettiClick} type="button">
          Celebrar
        </button>
      </FloatBox>

      <section className="people-section b5" aria-labelledby="people-title">
        <span className="box-index" aria-hidden="true">05 / 05</span>
        <p className="kicker">Siempre cerca de ti</p>
        <h2 className="people-title" id="people-title">PERSONAS QUE TE AMAMOS</h2>
        <p className="people-intro">Cada una guarda unas palabras especiales para ti.</p>
        <div className="people-grid">
          {Array.from({ length: 12 }, (_, index) => {
            const number = String(index + 1).padStart(2, '0')
            const letterSrc = index === 1
              ? '/assets/pdf/cartaPersona2.jpeg'
              : `/assets/pdf/cartaPersona${index + 1}.pdf`
            const letterType = index === 1 ? 'image' : 'pdf'
            return (
              <article className="person-card" key={number}>
                <span className="photo-placeholder" aria-hidden="true">{number}</span>
                <img
                  src={`/assets/images/persona${index + 1}.jpeg`}
                  alt={`Fotografía de una persona que te ama, ${number}`}
                  loading="lazy"
                  onError={(event) => { event.currentTarget.style.display = 'none' }}
                />
                <div className="person-overlay">
                  <a
                    className="letter-link"
                    href={letterSrc}
                    onClick={(event) => {
                      event.preventDefault()
                      setSelectedLetter({ number, src: letterSrc, type: letterType })
                    }}
                    aria-label={`Ver carta ${number} en un modal`}
                  >
                    VER CARTA
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </section>
      <div className="infinity-runway" aria-hidden="true" />
      {selectedLetter && <LetterModal letter={selectedLetter} onClose={closeLetter} />}
    </section>
    <footer className="signature">
      Hecho con mucho amor por <span>Alejandrooo</span>
      <span className="signature-heart" aria-hidden="true">♥</span>
    </footer>
    </>
  )
}
