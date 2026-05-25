import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../components/PageWrapper'
import { AGENTS } from '../data/data'

export default function Agentes() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-header">
          <div className="page-tag">🤖 Agentes IA</div>
          <h1 className="page-title">Sistema <span>multi-agente</span></h1>
          <p className="page-desc">
            Arquitectura <strong style={{ color: 'var(--accent)' }}>Chain-of-Agents</strong> con 6 modulos autonomos
            que en conjunto produjeron <strong style={{ color: 'var(--accent)' }}>10,300,000 simulaciones Monte Carlo</strong> (50,000 torneos × 103 partidos × 2 versiones).
            Cada agente tiene su propio system prompt, contexto inyectado y outputs estructurados.
            Se comunican exclusivamente via archivos JSON y Markdown — sin estado global compartido.
          </p>
        </div>

        {/* PIPELINE FLOW */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 36 }}
        >
          <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 760 }}>
              {AGENTS.map((a, i) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <motion.button
                    onClick={() => setSelected(selected === i ? null : i)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: selected === i ? a.color + '22' : 'var(--bg-card)',
                      border: `2px solid ${selected === i ? a.color : 'var(--border)'}`,
                      borderRadius: 12,
                      padding: '10px 14px',
                      textAlign: 'center',
                      minWidth: 112,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: selected === i ? `0 0 16px ${a.color}44` : 'none',
                    }}
                  >
                    <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{a.icon}</div>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: a.color, marginBottom: 2, letterSpacing: '0.06em' }}>{a.id}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                      {a.name.split(' ').slice(0, 3).join(' ')}
                    </div>
                  </motion.button>
                  {i < AGENTS.length - 1 && (
                    <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0, opacity: 0.6 }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Haz click en un agente para ver sus detalles · Flujo: JSON/Markdown entre modulos · <strong style={{ color: 'var(--accent)' }}>10,300,000 simulaciones totales</strong>
          </div>
        </motion.div>

        {/* SELECTED AGENT DETAIL (expandable) */}
        <AnimatePresence>
          {selected !== null && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                background: 'var(--bg-card)',
                border: `2px solid ${AGENTS[selected].color}`,
                borderRadius: 16,
                padding: 24,
                boxShadow: `0 0 30px ${AGENTS[selected].color}22`,
              }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 12,
                    background: AGENTS[selected].color + '22',
                    border: `2px solid ${AGENTS[selected].color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem', flexShrink: 0,
                  }}>
                    {AGENTS[selected].icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: AGENTS[selected].color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                      {AGENTS[selected].id}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 4 }}>{AGENTS[selected].name}</div>
                    <div style={{ fontSize: '0.78rem', color: AGENTS[selected].color, fontWeight: 600, marginBottom: 10 }}>{AGENTS[selected].role}</div>
                    <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{AGENTS[selected].desc}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Inputs</div>
                    {AGENTS[selected].inputs.map((inp) => (
                      <div key={inp} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: '0.77rem', color: 'var(--text-secondary)', padding: '3px 0' }}>
                        <span style={{ color: 'var(--purple)', flexShrink: 0, fontSize: '0.7rem', marginTop: 1 }}>←</span>
                        <span>{inp}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: AGENTS[selected].color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Outputs</div>
                    {AGENTS[selected].outputs.map((out) => (
                      <div key={out} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: '0.77rem', color: 'var(--text-secondary)', padding: '3px 0' }}>
                        <span style={{ color: AGENTS[selected].color, flexShrink: 0, fontSize: '0.7rem', marginTop: 1 }}>→</span>
                        <span>{out}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ALL AGENT CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {AGENTS.map((agent, i) => (
            <motion.div
              key={agent.id}
              className="agent-card"
              style={{ borderLeftColor: agent.color, cursor: 'pointer' }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              onClick={() => setSelected(selected === i ? null : i)}
              whileHover={{ x: 4 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: agent.color + '18',
                  border: `1px solid ${agent.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', flexShrink: 0,
                }}>
                  {agent.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <div className="agent-id" style={{ color: agent.color, margin: 0 }}>{agent.id}</div>
                    <div className="agent-title" style={{ margin: 0, fontSize: '0.92rem' }}>{agent.name}</div>
                    {i === AGENTS.length - 1 && (
                      <span style={{
                        background: 'rgba(167,139,250,0.15)', color: 'var(--purple)',
                        border: '1px solid rgba(167,139,250,0.3)',
                        borderRadius: 4, padding: '1px 7px',
                        fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em',
                      }}>NUEVO</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: agent.color, marginBottom: 6, fontWeight: 600 }}>{agent.role}</div>
                  <div className="agent-desc">{agent.desc}</div>
                </div>
                <div style={{ color: selected === i ? agent.color : 'var(--text-muted)', fontSize: '0.9rem', flexShrink: 0, transition: 'transform 0.2s, color 0.2s', transform: selected === i ? 'rotate(90deg)' : 'none' }}>›</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Architecture note */}
        <div className="sep" />
        <motion.div
          className="info-box"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h4>Patron de arquitectura: Chain-of-Agents</h4>
          <p>
            Cada agente recibe un <strong style={{ color: 'var(--text-primary)' }}>system prompt</strong> con su rol especifico
            y archivos JSON como contexto. Produce outputs estructurados que el siguiente consume.
            No hay estado compartido — la comunicacion es exclusivamente via archivos.
            Dado el mismo input y semilla, el output es <strong style={{ color: 'var(--text-primary)' }}>completamente reproducible</strong>.
            El pipeline completo genero <strong style={{ color: 'var(--accent)' }}>10,300,000 simulaciones</strong> —
            5,150,000 en v1 y 5,150,000 en v2 (50,000 torneos × 103 partidos cada una) — con convergencia verificada al 0.38%.
          </p>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
