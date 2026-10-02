import { useEffect, useState } from 'react'
import { ScrollStory } from './components/ScrollStory'
import { MusicPlayer } from './components/MusicPlayer'
import { ConfettiCanvas } from './components/ConfettiCanvas'
import { useScrollProgress } from './hooks/useScrollProgress'

export default function App() {
  const { targetRef, progressRef, subscribe } = useScrollProgress<HTMLElement>()
  const [musicVisible, setMusicVisible] = useState(true)

  useEffect(() => subscribe((p) => setMusicVisible(p <= 0.9)), [subscribe])

  return (
    <main id="home">
      <ScrollStory heroRef={targetRef} progressRef={progressRef} />
      <MusicPlayer visible={musicVisible} />
      <ConfettiCanvas />
    </main>
  )
}
