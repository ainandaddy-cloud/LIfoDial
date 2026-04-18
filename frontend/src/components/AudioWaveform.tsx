import { useEffect, useRef } from 'react'

export function AudioWaveform({ audioLevel = 0 }: { audioLevel?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    
    const dpr = window.devicePixelRatio || 1
    const displayW = 600
    const displayH = 80
    canvas.width = displayW * dpr
    canvas.height = displayH * dpr
    canvas.style.width = `${displayW}px`
    canvas.style.height = `${displayH}px`
    ctx.scale(dpr, dpr)
    
    const bars = 64
    const phases = Array.from({ length: bars }, () => Math.random() * Math.PI * 2)
    const speeds = Array.from({ length: bars }, () => 0.015 + Math.random() * 0.025)
    
    let animId: number
    let frame = 0
    let smoothLevel = 0
    
    function draw() {
      ctx.clearRect(0, 0, displayW, displayH)
      
      const barWidth = displayW / bars
      const centerY = displayH / 2
      const isIdle = audioLevel === 0
      
      // Smooth the audio level
      smoothLevel = smoothLevel * 0.85 + audioLevel * 0.15
      
      for (let i = 0; i < bars; i++) {
        let height: number
        let opacity: number
        
        if (isIdle) {
          // Ambient idle animation — smooth flowing wave
          const t = frame * 0.012
          const pos = i / bars
          
          // Layered sine waves for organic motion
          const wave1 = Math.sin(t + pos * Math.PI * 3) * 0.5
          const wave2 = Math.sin(t * 1.3 + pos * Math.PI * 5 + 1.2) * 0.3
          const wave3 = Math.sin(t * 0.7 + pos * Math.PI * 2 - 0.8) * 0.2
          const combined = wave1 + wave2 + wave3
          
          // Bell curve envelope — taller in center, shorter at edges
          const envelope = Math.exp(-Math.pow((pos - 0.5) * 2.8, 2))
          
          // Gentle breathing pulse
          const breathe = 0.8 + Math.sin(t * 0.5) * 0.2
          
          const maxH = 24 * envelope * breathe
          height = Math.max(2, 3 + Math.abs(combined) * maxH)
          
          opacity = 0.35 + envelope * 0.4 + Math.abs(combined) * 0.15
        } else {
          // Active audio — responsive to actual level
          const baseAmplitude = 3 + smoothLevel * 35
          const amplitude = baseAmplitude + 
            Math.sin(i * 0.15) * (smoothLevel * 15) + 
            Math.sin(frame * 0.01 + i * 0.2) * (smoothLevel * 10)
          
          height = Math.max(2, Math.abs(
            Math.sin(phases[i] + frame * speeds[i]) * amplitude
          ))
          
          opacity = 0.3 + smoothLevel * 0.7
        }
        
        ctx.fillStyle = `rgba(62, 207, 142, ${opacity})`
        ctx.beginPath()
        ctx.roundRect(
          i * barWidth + 1, 
          centerY - height,
          barWidth - 2, 
          height * 2,
          2
        )
        ctx.fill()
      }
      
      frame++
      animId = requestAnimationFrame(draw)
    }
    
    draw()
    return () => cancelAnimationFrame(animId)
  }, [audioLevel])
  
  return (
    <canvas 
      ref={canvasRef}
      width={600}
      height={80}
      className="mx-auto"
      style={{ width: '600px', height: '80px' }}
    />
  )
}
