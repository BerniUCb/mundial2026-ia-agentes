import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number
  color: string; size: number; rotation: number; rotationSpeed: number; opacity: number
  shape: 'rect' | 'circle' | 'star'
  life: number; maxLife: number
}

const COLORS = [
  '#C8F135', '#FFB800', '#9B8FFF', '#FF4757', '#39D98A',
  '#00C2FF', '#FFB800', '#C8F135', '#ffffff', '#C8F135',
]

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function createParticle(canvasWidth: number): Particle {
  const maxLife = randomBetween(100, 200)
  return {
    x: randomBetween(0, canvasWidth),
    y: randomBetween(-20, -60),
    vx: randomBetween(-1.5, 1.5),
    vy: randomBetween(2, 5),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: randomBetween(6, 14),
    rotation: randomBetween(0, Math.PI * 2),
    rotationSpeed: randomBetween(-0.1, 0.1),
    opacity: 1,
    shape: (['rect', 'circle', 'star'] as const)[Math.floor(Math.random() * 3)],
    life: 0,
    maxLife,
  }
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
    const outerX = x + Math.cos(angle) * size
    const outerY = y + Math.sin(angle) * size
    const innerAngle = angle + Math.PI / 5
    const innerX = x + Math.cos(innerAngle) * (size * 0.4)
    const innerY = y + Math.sin(innerAngle) * (size * 0.4)
    if (i === 0) ctx.moveTo(outerX, outerY)
    else ctx.lineTo(outerX, outerY)
    ctx.lineTo(innerX, innerY)
  }
  ctx.closePath()
  ctx.fill()
}

interface ConfettiProps {
  active: boolean
  duration?: number // ms
}

export default function Confetti({ active, duration = 4000 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{
    particles: Particle[]
    frame: number
    spawning: boolean
    spawnTimer: number
    startTime: number
  }>({
    particles: [],
    frame: 0,
    spawning: false,
    spawnTimer: 0,
    startTime: 0,
  })

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const state = stateRef.current
    state.particles = []
    state.spawning = true
    state.spawnTimer = 0
    state.startTime = performance.now()

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let raf: number
    const tick = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const elapsed = now - state.startTime
      if (elapsed < duration && state.spawning) {
        state.spawnTimer++
        if (state.spawnTimer % 2 === 0) {
          for (let i = 0; i < 4; i++) {
            state.particles.push(createParticle(canvas.width))
          }
        }
      } else {
        state.spawning = false
      }

      state.particles = state.particles.filter(p => p.life < p.maxLife && p.y < canvas.height + 40)

      for (const p of state.particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08
        p.vx *= 0.99
        p.rotation += p.rotationSpeed
        p.life++
        p.opacity = p.life < 20 ? p.life / 20 : p.life > p.maxLife * 0.7 ? 1 - (p.life - p.maxLife * 0.7) / (p.maxLife * 0.3) : 1

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.fillStyle = p.color
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          drawStar(ctx, 0, 0, p.size / 2)
        }
        ctx.restore()
      }

      if (state.particles.length > 0 || state.spawning) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [active, duration])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
