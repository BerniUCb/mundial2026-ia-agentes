import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../components/PageWrapper'
import { MATCHES, GROUPS } from '../data/data'

function getTeamFlag(name: string): string {
  const g = GROUPS.flatMap((g) => g.teams).find((t) => t.name === name)
  return g?.flag ?? '🏳️'
}

function getTeamElo(name: string): number {
  const t = GROUPS.flatMap((g) => g.teams).find((t) => t.name === name)
  return t?.elo ?? 0
}

function MatchCard({ match, index }: { match: any; index: number }) {
  const [showProb, setShowProb] = useState(false)

  const flagA = getTeamFlag(match.teamA)
  const flagB = getTeamFlag(match.teamB)
  const eloA  = getTeamElo(match.teamA)
  const eloB  = getTeamElo(match.teamB)

  const pA = match.pA * 100
  const pE = match.pE * 100
  const pB = match.pB * 100

  const maxP = Math.max(match.pA, match.pE, match.pB)
  const prediction = maxP === match.pA ? 'A' : maxP === match.pB ? 'B' : 'E'
  const favFlag = prediction === 'A' ? flagA : prediction === 'B' ? flagB : null
  const favName = prediction === 'A' ? match.teamA : prediction === 'B' ? match.teamB : 'Empate'
  const favPct  = (maxP * 100).toFixed(1)

  // Match is "reñido" if the top two outcomes are within 8pp of each other
  const sorted = [match.pA, match.pE, match.pB].sort((a, b) => b - a)
  const isClose = (sorted[0] - sorted[1]) * 100 < 8

  return (
    <motion.div
      className="match-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, duration: 0.3 }}
      style={{ overflow: 'hidden' }}
    >
      {/* ── Top meta line ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {match.id}
        </span>
        {isClose
          ? <span className="tag tag-yellow">⚡ REÑIDO</span>
          : <span className="tag tag-accent">★ FAV CLARO</span>
        }
      </div>

      {/* ── Main row: Team A | Result | Team B ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center', marginBottom: 16 }}>

        {/* Team A */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: '3.2rem', lineHeight: 1, filter: prediction === 'A' ? 'drop-shadow(0 0 12px rgba(200,241,53,0.5))' : 'none', transition: 'filter 0.2s' }}>
            {flagA}
          </span>
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: '0.82rem',
            textAlign: 'center', letterSpacing: '0.01em', lineHeight: 1.2,
            color: prediction === 'A' ? 'var(--accent)' : 'var(--text-primary)',
          }}>
            {match.teamA}
          </span>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ELO {eloA}
          </span>
        </div>

        {/* Center result box */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          padding: '12px 16px',
          background: prediction === 'E'
            ? 'rgba(255,184,0,0.07)'
            : 'rgba(200,241,53,0.06)',
          border: prediction === 'E'
            ? '1px solid rgba(255,184,0,0.2)'
            : '1px solid rgba(200,241,53,0.18)',
          borderRadius: 12, minWidth: 88,
        }}>
          <span style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.55rem', fontWeight: 800,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}>
            RESULTADO
          </span>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, lineHeight: 1,
            letterSpacing: '0.06em', marginTop: 4,
            color: prediction === 'E' ? 'var(--yellow)' : 'var(--accent)',
          }}>
            {match.score}
          </span>
          <span style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.58rem', fontWeight: 700,
            letterSpacing: '0.10em', textTransform: 'uppercase',
            color: prediction === 'E' ? 'var(--yellow)' : 'var(--accent)',
            marginTop: 2,
          }}>
            {prediction === 'E' ? 'EMPATE' : `GANA ${favName.split(' ')[0].toUpperCase()}`}
          </span>
          <span style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.95rem', fontWeight: 900, lineHeight: 1,
            color: 'var(--text-muted)', marginTop: 4,
          }}>
            {favPct}%
          </span>
          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
            sim. Monte Carlo
          </span>
        </div>

        {/* Team B */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: '3.2rem', lineHeight: 1, filter: prediction === 'B' ? 'drop-shadow(0 0 12px rgba(200,241,53,0.5))' : 'none', transition: 'filter 0.2s' }}>
            {flagB}
          </span>
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: '0.82rem',
            textAlign: 'center', letterSpacing: '0.01em', lineHeight: 1.2,
            color: prediction === 'B' ? 'var(--accent)' : 'var(--text-primary)',
          }}>
            {match.teamB}
          </span>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ELO {eloB}
          </span>
        </div>
      </div>

      {/* ── ELO delta indicator ── */}
      {Math.abs(eloA - eloB) > 0 && (
        <div style={{
          textAlign: 'center', fontSize: '0.62rem', color: 'var(--text-muted)',
          marginBottom: 10, fontFamily: 'var(--font-mono)',
        }}>
          ΔELO {Math.abs(eloA - eloB)} pts · {eloA > eloB ? match.teamA : match.teamB} lidera en rating
        </div>
      )}

      {/* ── Toggle button ── */}
      <button
        onClick={() => setShowProb(p => !p)}
        style={{
          width: '100%', background: 'none', border: '1px solid var(--border)',
          borderRadius: 7, color: 'var(--text-muted)',
          fontFamily: 'var(--font-ui)', fontSize: '0.68rem', fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '7px 0', cursor: 'pointer',
          transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.color = 'var(--accent)'
          e.currentTarget.style.background = 'var(--accent-dim)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text-muted)'
          e.currentTarget.style.background = 'none'
        }}
      >
        <span style={{ transform: showProb ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
        {showProb ? 'Ocultar probabilidades' : 'Ver probabilidades del modelo'}
      </button>

      {/* ── Probability section (collapsible) ── */}
      <AnimatePresence initial={false}>
        {showProb && (
          <motion.div
            key="prob"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 14 }}>
              {/* Stacked bar */}
              <div style={{ display: 'flex', gap: 2, height: 16, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                <motion.div
                  className="prob-win"
                  initial={{ width: 0 }}
                  animate={{ width: `${pA}%` }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                />
                <motion.div
                  className="prob-draw"
                  initial={{ width: 0 }}
                  animate={{ width: `${pE}%` }}
                  transition={{ delay: 0.08, duration: 0.5, ease: 'easeOut' }}
                />
                <motion.div
                  className="prob-lose"
                  initial={{ width: 0 }}
                  animate={{ width: `${pB}%` }}
                  transition={{ delay: 0.14, duration: 0.55, ease: 'easeOut' }}
                />
              </div>

              {/* Labels */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '1.15rem', fontWeight: 900, color: 'var(--green)', lineHeight: 1 }}>
                    {pA.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 3 }}>
                    Gana {match.teamA.split(' ')[0]}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '1.15rem', fontWeight: 900, color: 'var(--yellow)', lineHeight: 1 }}>
                    {pE.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 3 }}>
                    Empate
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '1.15rem', fontWeight: 900, color: 'var(--coral)', lineHeight: 1 }}>
                    {pB.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 3 }}>
                    Gana {match.teamB.split(' ')[0]}
                  </div>
                </div>
              </div>

              {/* Note */}
              <div style={{
                marginTop: 12, padding: '8px 10px',
                background: 'var(--bg-input)', borderRadius: 6,
                fontSize: '0.62rem', color: 'var(--text-muted)', lineHeight: 1.6,
              }}>
                Modelo v2 · ELO×0.55 + Historial×0.35 + Forma×0.10<br/>
                50,000 torneos completos simulados · <strong style={{ color: 'var(--text-primary)' }}>este partido jugado 50,000 veces</strong> · convergencia verificada (max_var &lt; 0.5%)
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const GROUP_LETTERS = Object.keys(MATCHES)

export default function Partidos() {
  const [selected, setSelected] = useState(GROUP_LETTERS[0])
  const matches = MATCHES[selected] ?? []

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-header">
          <div className="page-tag">🏟️ Fase de Grupos</div>
          <h1 className="page-title">Partidos y <span>Pronósticos</span></h1>
          <p className="page-desc">
            Pronóstico de cada partido según el modelo ELO-Historial-Combinado v2.0 —
            <strong style={{ color: 'var(--accent)' }}> 10,300,000 simulaciones totales</strong> (50,000 torneos × 103 partidos × 2 versiones).
            Cada partido de grupos fue simulado <strong style={{ color: 'var(--accent)' }}>50,000 veces</strong> individualmente.
            El recuadro central muestra el resultado más probable. Haz clic en <strong style={{ color: 'var(--text-primary)' }}>"Ver probabilidades"</strong> para ver el desglose completo.
          </p>
        </div>

        {/* Info note */}
        <div className="info-box" style={{ marginBottom: 24 }}>
          <h4>Pronósticos del modelo, no resultados reales</h4>
          <p>
            Los porcentajes corresponden a probabilidades extraídas de <strong style={{ color: 'var(--text-primary)' }}>10,300,000 simulaciones</strong> Monte Carlo v2
            — cada partido jugado <strong style={{ color: 'var(--text-primary)' }}>50,000 veces</strong> con semilla fija seed=2026 para reproducibilidad total.
            El marcador muestra el resultado más probable de cada encuentro — no un resultado definitivo.
            "Reñido" indica que los dos mejores resultados están a menos de 8pp entre sí.
          </p>
        </div>

        {/* Group selector */}
        <div className="tabs-bar" style={{ flexWrap: 'wrap', marginBottom: 24 }}>
          {GROUP_LETTERS.map((g) => (
            <button
              key={g}
              className={`tab-btn${selected === g ? ' active' : ''}`}
              onClick={() => setSelected(g)}
            >
              {g.replace('Grupo ', '')}
            </button>
          ))}
        </div>

        {/* Group header */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', letterSpacing: '0.04em' }}>
                {selected}
              </h2>
              <span className="tag tag-accent">{matches.length} partidos</span>
              {selected.includes('Muerte') && (
                <span className="tag tag-red">💀 Grupo de la Muerte</span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {matches.map((m, i) => (
                <MatchCard key={m.id} match={m} index={i} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageWrapper>
  )
}
