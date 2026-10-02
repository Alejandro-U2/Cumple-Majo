import { useEffect, useRef, useState } from 'react'

interface MusicPlayerProps {
  visible: boolean
}

export function MusicPlayer({ visible }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.loop = true
    audio.preload = 'none'
    audio.volume = 0.7
  }, [])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return
    try {
      if (audio.paused) {
        await audio.play()
        setPlaying(true)
      } else {
        audio.pause()
        setPlaying(false)
      }
    } catch (e) {
      // ignore
    }
  }

  return (
    <>
      <button
        className={`music-player ${!visible ? 'hidden' : ''}`}
        onClick={toggle}
        title={playing ? 'Pausar música' : 'Música de fondo'}
        type="button"
      >
        <span className="mi">{playing ? '❚❚' : '♪'}</span>
        <span className="ml">Perfect</span>
      </button>
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}assets/audio/hb128.mp3`} loop preload="none" />
    </>
  )
}
