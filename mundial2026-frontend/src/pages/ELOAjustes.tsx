import { useState } from 'react'
import { motion } from 'framer-motion'
import PageWrapper from '../components/PageWrapper'
import { ELO_ADJUSTMENTS } from '../data/data'

type Filter = 'all' | 'pos' | 'neg'

export default function ELOAjustes() {
  const [filter, setFilter] = useState<Filter>('all')

  const sorted = [...ELO_ADJUSTMENTS].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
  const filtered = sorted.filter((e) => {
    if (filter === 'pos') return e.delta > 0
    if (filter === 'neg') return e.delta < 0
    return true
  })
  const maxDelta = Math.max(...sorted.map((e) => Math.abs(e.delta)))

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-header">
          <div className="page-tag">📈 Ajustes ELO</div>
          <h1 className="page-title">Los <span>26 ajustes</span> del Agente ELO-Analyst</h1>
          <p className="page-desc">
            El agente World-Cup-ELO-Analyst v1.0 identificó 3 tipos de sesgo sistémico y ajustó
            26 equipos con evidencia en 3 dimensiones: forma reciente, historial mundialista y contexto específico.
            Delta máximo: <strong style={{ color: 'var(--green)' }}>+55</strong> (Morocco) /
            <strong style={{ color: 'var(--red)' }}> -55</strong> (New Zealand).
            El impacto de cada ajuste fue medido comparando
            <strong style={{ color: 'var(--accent)' }}> 5,150,000 simulaciones v1</strong> vs
            <strong style={{ color: 'var(--accent)' }}> 5,150,000 simulaciones v2</strong> —
            <strong style={{ color: 'var(--accent)' }}> 10,300,000 en total</strong>.
          </p>
        </div>

        {/* Bias types */}
        <div className="grid-3" style={{ marginBottom: 28 }}>
          <motion.div className="warn-box" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h4>Sesgo 1: Brecha de Confederación</h4>
            <p>CAF/AFC recibían ajuste +5 vs UEFA +50 — diferencial de 45 puntos injusto para equipos de élite
              como Morocco (#8 FIFA), Senegal, Japan (eliminó a Alemania y España en Qatar 2022) e Iran (69% win rate).</p>
          </motion.div>
          <motion.div className="warn-box" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h4>Sesgo 2: Reputación Histórica</h4>
            <p>Croatia (Modric 40 años, relegados Nations League Liga A), Belgium (generación dorada en declive,
              De Bruyne 35 años) y Brazil (forma irregular LDWWL, penales 33.33%) tienen ELOs que reflejan el pasado.</p>
          </motion.div>
          <motion.div className="warn-box" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h4>Sesgo 3: Factor Anfitrión / Campeón</h4>
            <p>USA, Mexico y Canada como organizadores reciben ventaja de campo no modelada. Argentina
              (campeón Qatar 2022 + Copa America 2024, penales 4/4 = 100%) no tenía bono de campeón vigente.</p>
          </motion.div>
        </div>

        {/* Filter */}
        <div className="tabs-bar" style={{ marginBottom: 24 }}>
          <button className={`tab-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
            Todos ({sorted.length})
          </button>
          <button className={`tab-btn${filter === 'pos' ? ' active' : ''}`} onClick={() => setFilter('pos')}>
            ↑ Subieron ({sorted.filter(e => e.delta > 0).length})
          </button>
          <button className={`tab-btn${filter === 'neg' ? ' active' : ''}`} onClick={() => setFilter('neg')}>
            ↓ Bajaron ({sorted.filter(e => e.delta < 0).length})
          </button>
        </div>

        {/* Delta bar visualization */}
        <div style={{ marginBottom: 28 }}>
          {filtered.map((e, i) => (
            <motion.div
              key={e.name}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr 60px',
                alignItems: 'center',
                gap: 12,
                padding: '8px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1rem' }}>{e.flag}</span>
                <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>{e.name}</span>
              </div>
              <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: '50%', width: 1, height: '100%', background: 'var(--border-strong)' }} />
                {e.delta > 0 ? (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(e.delta / maxDelta) * 50}%` }}
                    transition={{ delay: i * 0.04 + 0.2, duration: 0.6, ease: 'easeOut' }}
                    style={{
                      position: 'absolute', left: '50%',
                      height: 10, background: 'var(--green)',
                      borderRadius: '0 4px 4px 0', opacity: 0.85,
                    }}
                  />
                ) : (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(Math.abs(e.delta) / maxDelta) * 50}%` }}
                    transition={{ delay: i * 0.04 + 0.2, duration: 0.6, ease: 'easeOut' }}
                    style={{
                      position: 'absolute', right: '50%',
                      height: 10, background: 'var(--red)',
                      borderRadius: '4px 0 0 4px', opacity: 0.85,
                    }}
                  />
                )}
              </div>
              <div style={{
                fontSize: '0.9rem', fontWeight: 800, textAlign: 'right',
                color: e.delta > 0 ? 'var(--green)' : 'var(--red)',
              }}>
                {e.delta > 0 ? '+' : ''}{e.delta}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Simulation impact summary */}
        <div className="info-box" style={{ marginBottom: 28 }}>
          <h4>Impacto cuantificado con 10,300,000 simulaciones</h4>
          <p>
            Cada ajuste ELO fue validado re-ejecutando <strong style={{ color: 'var(--text-primary)' }}>50,000 torneos completos</strong> con
            los ELOs corregidos (v2) y comparando contra los 50,000 de v1 — <strong style={{ color: 'var(--text-primary)' }}>100,000 torneos</strong> y
            <strong style={{ color: 'var(--text-primary)' }}> 10,300,000 simulaciones de partido en total</strong>.
            El mayor impacto individual fue Morocco: sus ajuste de +55 pts lo movió de 4.39% a 8.25% de probabilidad de campeonato (+87.9% relativo),
            evidenciando que un delta de ELO bien justificado puede cambiar significativamente el resultado del modelo.
          </p>
        </div>

        {/* Detailed cards */}
        <div className="sep" />
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Detalle por equipo</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {filtered.map((e, i) => (
            <motion.div
              key={e.name}
              className="elo-item"
              style={{ borderLeft: `3px solid ${e.delta > 0 ? 'var(--green)' : 'var(--red)'}` }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: (i % 3) * 0.07, duration: 0.35 }}
            >
              <div className="elo-flag">{e.flag}</div>
              <div className="elo-info">
                <div className="elo-name">{e.name}</div>
                <div className="elo-reason" style={{ color: e.delta > 0 ? 'var(--green)' : 'var(--red)' }}>
                  {e.reason}
                </div>
                <div className="elo-values">
                  ELO: {e.eloV1} → {e.eloV2}
                </div>
                <div style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.5 }}>
                  {e.details}
                </div>
              </div>
              <div className={`elo-delta ${e.delta > 0 ? 'delta-pos' : 'delta-neg'}`}>
                {e.delta > 0 ? '+' : ''}{e.delta}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
