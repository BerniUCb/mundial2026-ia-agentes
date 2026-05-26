import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper from '../components/PageWrapper'

const STATS = [
  { val: 10300000, suffix: '', label: 'Simulaciones totales (v1 + v2)' },
  { val: 50000,    suffix: '', label: 'Veces simulado cada partido' },
  { val: 2540,     suffix: '', label: 'Partidos oficiales analizados' },
  { val: 6,        suffix: '', label: 'Agentes IA en cadena' },
]

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const raf = useRef<number>()
  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setCount(Math.floor(ease * target))
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else setCount(target)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current!)
  }, [target, duration])
  return count
}

function StatCard({ val, suffix, label, delay }: { val: number; suffix: string; label: string; delay: number }) {
  const count = useCountUp(val, 1600)
  return (
    <motion.div
      className="hero-stat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="hero-stat-val">{count.toLocaleString()}{suffix}</div>
      <div className="hero-stat-label">{label}</div>
    </motion.div>
  )
}

const TOP3 = [
  { flag: '🇦🇷', name: 'Argentina', pct: '12.56%', elo: 2535, rank: 1 },
  { flag: '🇪🇸', name: 'Spain',     pct: '9.33%',  elo: 2530, rank: 2 },
  { flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'England',   pct: '9.22%',  elo: 2500, rank: 3 },
]

const FEATURES = [
  { icon: '🎲', title: 'Monte Carlo · 10.3M sims', desc: '10,300,000 simulaciones totales: 2 versiones × 50,000 torneos × 103 partidos. Cada partido simulado 50,000 veces. Convergencia verificada: variacion maxima 0.38%.' },
  { icon: '📐', title: 'Modelo Ponderado', desc: 'ELO × 0.55 + Historial × 0.35 + Forma × 0.10. Ajustes de confederacion calibrados para cada zona FIFA.' },
  { icon: '🔍', title: 'Correccion de Sesgos', desc: '26 equipos con ELO ajustado. Se detectaron 3 tipos de sesgo: confederacion, reputacion historica y factor anfitrion.' },
  { icon: '📊', title: 'IC95% por equipo', desc: 'Intervalos de confianza del 95% calculados con distribucion binomial para los 48 equipos clasificados.' },
  { icon: '🤖', title: '7 Agentes en cadena', desc: 'Pipeline de agentes especializados: recoleccion, calculo, simulacion, analisis ELO, actualizacion ELO, simulacion v2 y prediccion de marcadores Poisson.' },
  { icon: '🌍', title: 'Datos reales', desc: '2,540 partidos oficiales 2018-2026 de 49,330 totales. Dataset martj42 con licencia Open Data Commons PDDL.' },
]

const TOUR = [
  { step: 1, path: '/metodologia',  icon: '🔬', label: 'Metodología',   desc: 'Cómo funciona el modelo: fórmulas, pipeline y pesos' },
  { step: 2, path: '/agentes',      icon: '🤖', label: 'Agentes IA',    desc: 'Los 7 agentes en cadena: inputs, outputs y lógica' },
  { step: 3, path: '/favoritos',    icon: '🏆', label: 'Favoritos',      desc: 'Resultado principal: probabilidades de campeonato' },
  { step: 4, path: '/grupos',       icon: '⚽', label: 'Grupos A–L',     desc: '48 equipos clasificados en 12 grupos' },
  { step: 5, path: '/comparativa',  icon: '⚡', label: 'v1 vs v2',       desc: 'Impacto de corregir sesgos: Morocco +87.9%' },
  { step: 6, path: '/elo',          icon: '📈', label: 'Ajustes ELO',    desc: '26 correcciones justificadas con evidencia triple' },
]

export default function Home() {
  const nav = useNavigate()
  return (
    <PageWrapper>
      {/* BANNER UCB */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(200,241,53,0.12), rgba(200,241,53,0.06), transparent)',
        borderBottom: '1px solid rgba(200,241,53,0.25)',
        padding: '10px 52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>UCB</span>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <span>Inteligencia Artificial con Agentes — 5to Semestre 2026</span>
          <span style={{ color: 'var(--border-strong)' }}>·</span>
          <span style={{ color: 'var(--text-muted)' }}>Bernardo Rios Tapia</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
          <span style={{
            background: 'rgba(200,241,53,0.2)', color: 'var(--accent)',
            border: '1px solid rgba(200,241,53,0.4)', borderRadius: 20,
            padding: '2px 10px', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.05em',
          }}>
            ● LIVE
          </span>
          <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            mundial2026-frontend.vercel.app
          </span>
        </div>
      </div>

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-grid-bg" />
        <div className="hero-content">
          <motion.div
            className="hero-eyebrow"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            ⚽ UCB — Inteligencia Artificial con Agentes — 2026
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Simulación del<br />
            <span className="accent">Mundial</span>{' '}
            <span className="gold">2026</span><br />
            con Agentes IA
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            Sistema multi-agente que predice el FIFA World Cup 2026 con <strong style={{ color: 'var(--accent)' }}>10,300,000 simulaciones</strong> Monte Carlo
            (50,000 torneos completos × 103 partidos × 2 versiones). Combina ELO ajustado, historial oficial
            2018–2026 y forma reciente de los 48 equipos. Pipeline de 6 agentes autónomos en cadena.
          </motion.p>

          <div className="hero-stats-row">
            {STATS.map((s, i) => (
              <StatCard key={s.label} {...s} delay={0.35 + i * 0.08} />
            ))}
          </div>

          <motion.div
            style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <button
              onClick={() => nav('/favoritos')}
              style={{
                background: 'var(--accent)', color: '#000',
                border: 'none', borderRadius: 8, padding: '12px 24px',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Ver Favoritos 🏆
            </button>
            <button
              onClick={() => nav('/metodologia')}
              style={{
                background: 'transparent', color: 'var(--text-primary)',
                border: '1px solid var(--border-strong)', borderRadius: 8, padding: '12px 24px',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Ver Metodología →
            </button>
          </motion.div>
        </div>

        <div className="hero-scroll">↓ scroll para explorar</div>
      </section>

      {/* TOP 3 */}
      <section style={{ padding: '52px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ marginBottom: 28 }}>
            <div className="page-tag">🏆 Modelo v2 — 10,300,000 simulaciones</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 10 }}>Top 3 Favoritos al campeonato</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.9rem' }}>
              Argentina rompe el empate técnico del modelo v1 separándose por +3.23pp de España.
            </p>
          </div>
          <div className="grid-3">
            {TOP3.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${i === 0 ? 'rgba(255,184,0,0.45)' : 'var(--border)'}`,
                  borderRadius: 16,
                  padding: '28px 24px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {i === 0 && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: 3, background: 'linear-gradient(90deg, var(--gold), #d97706)',
                  }} />
                )}
                <div style={{ fontSize: '2.8rem', marginBottom: 8 }}>{t.flag}</div>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem',
                  background: i === 0 ? 'linear-gradient(135deg,var(--gold),#cc9200)' : i === 1 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : 'linear-gradient(135deg,#b45309,#92400e)',
                  color: '#000',
                }}>
                  #{t.rank}
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)', marginBottom: 4 }}>{t.pct}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ELO {t.elo} · IC95% calculado</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '52px', borderBottom: '1px solid var(--border)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="page-tag" style={{ marginBottom: 10 }}>Sistema</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 28 }}>Características del proyecto</h2>
        </motion.div>
        <div className="grid-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TOUR GUIADO */}
      <section style={{ padding: '52px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ marginBottom: 8 }}>
            <div className="page-tag">Recorrido sugerido</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 10, marginBottom: 6 }}>
              ¿Por dónde empezar?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 28 }}>
              Usa el sidebar izquierdo para navegar. Este orden te lleva del "cómo" al "qué encontramos":
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TOUR.map((item, i) => (
              <motion.button
                key={item.path}
                onClick={() => nav(item.path)}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '14px 20px', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'inherit', width: '100%',
                  transition: 'border-color 0.15s',
                }}
                whileHover={{ borderColor: 'var(--accent)' }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-strong)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {item.step}
                </div>
                <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', flexShrink: 0 }}>→</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CONVERGENCE */}
      <section style={{ padding: '52px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="page-tag" style={{ marginBottom: 10 }}>Convergencia</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 20 }}>Verificación de convergencia del modelo</h2>
          <div className="grid-2" style={{ gap: 16, marginBottom: 20 }}>
            {[
              { n: '1,000',  v1_arg: '12.50', v1_spa: '10.20', v1_fra: '7.10', note: 'Alta variabilidad inicial' },
              { n: '5,000',  v1_arg: '12.32', v1_spa: '9.92',  v1_fra: '8.94', note: 'Estabilizacion' },
              { n: '10,000', v1_arg: '12.20', v1_spa: '9.54',  v1_fra: '9.04', note: 'Max var: 0.38%' },
              { n: '50,000', v1_arg: '12.56', v1_spa: '9.33',  v1_fra: '9.00', note: '✓ CONVERGIDO' },
            ].map((row, i) => (
              <motion.div
                key={row.n}
                className="card card-sm"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{ display: 'flex', gap: 16, alignItems: 'center' }}
              >
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)', width: 60, flexShrink: 0 }}>N={row.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>ARG: <span style={{ color: 'var(--accent)' }}>{row.v1_arg}%</span> · ESP: {row.v1_spa}% · FRA: {row.v1_fra}%</div>
                  <div style={{ fontSize: '0.72rem', color: i === 3 ? 'var(--green)' : 'var(--text-muted)' }}>{row.note}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="info-box">
            <h4>Criterio de convergencia</h4>
            <p>La simulacion se considera convergida cuando la variacion maxima entre pasos consecutivos es menor al 0.5%.
              En v2, la variacion entre N=10,000 y N=50,000 fue <strong style={{ color: 'var(--text-primary)' }}>0.38%</strong> — por debajo del umbral.
              Los IC95% de los favoritos tienen ancho menor a 0.55 puntos porcentuales — estadisticamente robustos.</p>
          </div>
        </motion.div>
      </section>
    </PageWrapper>
  )
}
