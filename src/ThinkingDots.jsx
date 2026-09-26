import { useEffect, useRef } from 'react'

// Réplica en canvas del sample estándar de Thinking Dots (ReactBits Pro):
// matriz de puntos que respira alrededor de una nube de densidad a la deriva.
// Defaults de la muestra: color/acento #ff44af, 3 lóbulos, pulso, deriva y cursor activo.
export default function ThinkingDots({
  color = '#ff44af',
  accentColor = '#ff6ec4',
  speed = 1,
  lobes = 3,
  spacing = 26,
  ambient = 0.16,
  intensity = 0.86,
  drift = 0.22,
  pulse = 0.1,
  pulseRate = 1.6,
  cursorInfluence = 0.35,
  opacity = 0.5,
} = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    const pointer = { x: -9999, y: -9999 }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    const onMove = (e) => { pointer.x = e.clientX; pointer.y = e.clientY }
    const onLeave = () => { pointer.x = -9999; pointer.y = -9999 }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)

    // Fases y órbitas de los lóbulos (deriva tipo lissajous)
    const seeds = Array.from({ length: lobes }, (_, i) => ({
      a: 0.5 + i * 1.7,
      b: 0.8 + i * 2.3,
      c: i * 2.1,
      d: i * 1.3,
    }))

    const hex = (s) => {
      const n = parseInt(s.slice(1), 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }
    const base = hex(color)
    const acc = hex(accentColor)

    const t0 = performance.now()
    const draw = (now) => {
      const t = ((now - t0) / 1000) * speed
      ctx.clearRect(0, 0, w, h)
      const R = Math.min(w, h)
      const cx = w / 2
      const cy = h * 0.42
      const spread = R * (0.42 + drift * 0.4)

      for (let gy = spacing / 2; gy < h; gy += spacing) {
        for (let gx = spacing / 2; gx < w; gx += spacing) {
          let density = 0
          for (let i = 0; i < lobes; i++) {
            const s = seeds[i]
            const lx = cx + Math.sin(t * 0.35 * speed + s.a + s.c) * spread * (0.55 + 0.2 * Math.sin(s.d + t * 0.2))
            const ly = cy + Math.cos(t * 0.28 * speed + s.b) * spread * 0.62
            const dx = (gx - lx) / (R * 0.5)
            const dy = (gy - ly) / (R * 0.5)
            density += Math.exp(-(dx * dx + dy * dy) * 2.4)
          }
          // Turbulencia leve que rompe el borde de la nube
          density *= 0.92 + 0.08 * Math.sin(gx * 0.02 + t * 1.3) * Math.cos(gy * 0.023 - t)
          if (cursorInfluence > 0 && pointer.x > -9999) {
            const pdx = (gx - pointer.x) / (R * 0.45)
            const pdy = (gy - pointer.y) / (R * 0.45)
            density += cursorInfluence * 2.2 * Math.exp(-(pdx * pdx + pdy * pdy) * 2.0)
          }
          density = Math.min(density, 1.4) / 1.4

          const dist = Math.hypot(gx - cx, gy - cy) / R
          const ripple = Math.sin(dist * 9 - t * pulseRate * 2.2) * pulse
          const r = spacing * (0.10 + 0.34 * density + ripple * 0.4)
          if (r <= 0.3) continue
          const glow = Math.min(1, density * 1.6)
          const cr = Math.round(base[0] + (acc[0] - base[0]) * glow)
          const cg = Math.round(base[1] + (acc[1] - base[1]) * glow)
          const cb = Math.round(base[2] + (acc[2] - base[2]) * glow)
          const alpha = Math.min(1, ambient + intensity * density + ripple * 0.22) * opacity
          if (alpha <= 0.01) continue
          if (density > 0.55) {
            ctx.beginPath()
            ctx.fillStyle = `rgba(${cr},${cg},${cb},${(alpha * 0.22).toFixed(3)})`
            ctx.arc(gx, gy, r * 2.6, 0, 6.2832)
            ctx.fill()
          }
          ctx.beginPath()
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`
          ctx.arc(gx, gy, Math.max(0.4, r), 0, 6.2832)
          ctx.fill()
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [color, accentColor, speed, lobes, spacing, ambient, intensity, drift, pulse, pulseRate, cursorInfluence, opacity])

  return <canvas ref={ref} className="thinking-dots" aria-hidden="true" />
}
