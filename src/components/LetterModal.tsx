import { useEffect, useRef } from 'react'

export interface LetterContent {
  number: string
  src: string
  type: 'pdf' | 'image'
}

interface LetterModalProps {
  letter: LetterContent
  onClose: () => void
}

export function LetterModal({ letter, onClose }: LetterModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    closeButtonRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div
      className="letter-modal-backdrop"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
      onTouchStart={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <section className="letter-modal" role="dialog" aria-modal="true" aria-labelledby="letter-modal-title">
        <header className="letter-modal-header">
          <span id="letter-modal-title">Una carta para ti</span>
          <button ref={closeButtonRef} type="button" className="letter-modal-close" onClick={onClose} aria-label="Cerrar carta">
            ×
          </button>
        </header>
        <div className={`letter-modal-content ${letter.type === 'image' ? 'image-letter' : ''}`}>
          {letter.type === 'image' ? (
            <img src={letter.src} alt={`Carta ${letter.number}`} />
          ) : (
            <iframe src={letter.src} title={`Carta ${letter.number}`} />
          )}
        </div>
        <footer className="letter-modal-footer">
          <a href={letter.src} target="_blank" rel="noopener noreferrer">
            Abrir aparte
          </a>
        </footer>
      </section>
    </div>
  )
}
