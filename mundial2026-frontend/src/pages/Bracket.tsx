import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../components/PageWrapper'
import Confetti from '../components/Confetti'
import { GROUPS, MATCHES, KNOCKOUT, STAGE_PROBS } from '../data/data'
import type { BracketMatch } from '../data/data'

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Tab = 'bracket' | 'grupos' | 'funnel'

interface ModalState {
  match: BracketMatch
  round: string
  matchIndex: number
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getTeamFlag(name: string): string {
  for (const g of GROUPS) {
    const t = g.teams.find(t => t.name === name)
    if (t) return t.flag
  }
  return '🏳️'
}

function getGroupMatches(groupName: string) {
  return MATCHES[groupName] || []
}

function computeStandings(letter: string) {
  const gName = `Grupo ${letter}` + (letter === 'I' ? ' ⚠️ Grupo de la Muerte' : '')
  const group = GROUPS.find(g => g.letter === letter)
  if (!group) return []
  const matches = MATCHES[gName] || MATCHES[`Grupo ${letter}`] || []
  const stats: Record<string, { pts: number; gf: number; ga: number }> = {}
  group.teams.forEach(t => { stats[t.name] = { pts: 0, gf: 0, ga: 0 } })
  for (const m of matches) {
    if (!stats[m.teamA] || !stats[m.teamB]) continue
    const isA = m.pA > m.pB && m.pA > m.pE
    const isE = !isA && m.pE >= m.pB
    if (isA) {
      stats[m.teamA].pts += 3; stats[m.teamA].gf += 2; stats[m.teamB].ga += 2
    } else if (isE) {
      stats[m.teamA].pts += 1; stats[m.teamB].pts += 1
      stats[m.teamA].gf += 1; stats[m.teamA].ga += 1
      stats[m.teamB].gf += 1; stats[m.teamB].ga += 1
    } else {
      stats[m.teamB].pts += 3; stats[m.teamB].gf += 2; stats[m.teamA].ga += 2
    }
  }
  const teamMap = Object.fromEntries(group.teams.map(t => [t.name, t]))
  return Object.entries(stats)
    .map(([name, s]) => ({ name, ...s, dg: s.gf - s.ga, team: teamMap[name] }))
    .sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf)
}

// ─── MATCH MODAL ──────────────────────────────────────────────────────────────
function MatchModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const { match, round } = state
  const flagA = match.flagA || getTeamFlag(match.teamA)
  const flagB = match.flagB || getTeamFlag(match.teamB)

  // Get group probabilities if available
  const groupProbs = (() => {
    for (const gKey of Object.keys(MATCHES)) {
      const m = MATCHES[gKey].find(m =>
        (m.teamA === match.teamA && m.teamB === match.teamB) ||
        (m.teamA === match.teamB && m.teamB === match.teamA)
      )
      if (m) {
        const flipped = m.teamA === match.teamB
        return {
          pA: flipped ? m.pB : m.pA,
          pE: m.pE,
          pB: flipped ? m.pA : m.pB,
        }
      }
    }
    // Derive from champ pcts for knockout
    const total = match.champPctA + match.champPctB
    if (total === 0) return { pA: 0.5, pE: 0.15, pB: 0.35 }
    const raw = match.champPctA / (total || 1)
    return { pA: raw * 0.85, pE: 0.15, pB: (1 - raw) * 0.85 }
  })()

  const bars = [
    { label: match.teamA, flag: flagA, pct: groupProbs.pA * 100, color: 'var(--accent)', champPct: match.champPctA },
    { label: 'Empate',    flag: '⚖️',  pct: groupProbs.pE * 100, color: 'var(--text-muted)', champPct: null },
    { label: match.teamB, flag: flagB, pct: groupProbs.pB * 100, color: 'var(--purple)', champPct: match.champPctB },
  ]

  const [scoreA, scoreB] = match.score.split('-').map(Number)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(8,12,24,0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 24 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-secondary)',
            border: match.method === 'pso' ? '1.5px solid var(--gold)' : '1.5px solid var(--border-strong)',
            borderRadius: 20,
            padding: 28,
            maxWidth: 440,
            width: '100%',
            boxShadow: match.method === 'pso'
              ? '0 0 60px rgba(255,184,0,0.2), 0 8px 40px rgba(0,0,0,0.6)'
              : '0 8px 40px rgba(0,0,0,0.6)',
            position: 'relative',
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'var(--bg-input)', border: '1px solid var(--border-strong)',
              borderRadius: 8, width: 32, height: 32,
              color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>

          {/* Round label */}
          <div style={{
            fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            {round}
            {match.method === 'pso' && (
              <span style={{
                background: 'rgba(255,184,0,0.15)', color: 'var(--gold)',
                border: '1px solid rgba(255,184,0,0.35)', borderRadius: 5,
                padding: '1px 7px', fontSize: '0.6rem', fontWeight: 800,
              }}>PENALES</span>
            )}
          </div>

          {/* Teams + Score */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, marginBottom: 24 }}>
            {/* Team A */}
            <div style={{
              flex: 1, textAlign: 'center', padding: '14px 10px',
              background: match.winner === match.teamA ? 'rgba(200,241,53,0.08)' : 'var(--bg-card)',
              borderRadius: 12,
              border: match.winner === match.teamA ? '1px solid var(--accent-glow)' : '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <div style={{ fontSize: '2.4rem', lineHeight: 1, filter: match.winner === match.teamA ? 'drop-shadow(0 0 12px rgba(200,241,53,0.4))' : 'none' }}>{flagA}</div>
              <div style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 800,
                color: match.winner === match.teamA ? 'var(--accent)' : 'var(--text-primary)',
                lineHeight: 1.2,
              }}>{match.teamA}</div>
              {/* Goals */}
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '2.8rem', lineHeight: 1,
                color: match.winner === match.teamA ? 'var(--accent)' : 'var(--text-secondary)',
                marginTop: 4,
              }}>
                {isNaN(scoreA) ? '—' : scoreA}
              </div>
              {match.winner === match.teamA && (
                <div style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.08em' }}>✓ GANADOR</div>
              )}
            </div>

            {/* Center divider */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 40 }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>VS</div>
              {match.method === 'pso' && (
                <div style={{
                  background: 'rgba(255,184,0,0.15)', color: 'var(--gold)',
                  border: '1px solid rgba(255,184,0,0.35)', borderRadius: 5,
                  padding: '3px 6px', fontSize: '0.6rem', fontWeight: 800, textAlign: 'center',
                }}>PSO</div>
              )}
              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
                {match.method === 'pso' ? 'Penales' : 'Tiempo\nregl.'}
              </div>
            </div>

            {/* Team B */}
            <div style={{
              flex: 1, textAlign: 'center', padding: '14px 10px',
              background: match.winner === match.teamB ? 'rgba(200,241,53,0.08)' : 'var(--bg-card)',
              borderRadius: 12,
              border: match.winner === match.teamB ? '1px solid var(--accent-glow)' : '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <div style={{ fontSize: '2.4rem', lineHeight: 1, filter: match.winner === match.teamB ? 'drop-shadow(0 0 12px rgba(200,241,53,0.4))' : 'none' }}>{flagB}</div>
              <div style={{
                fontFamily: 'var(--font-ui)', fontSize: '0.82rem', fontWeight: 800,
                color: match.winner === match.teamB ? 'var(--accent)' : 'var(--text-primary)',
                lineHeight: 1.2,
              }}>{match.teamB}</div>
              {/* Goals */}
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '2.8rem', lineHeight: 1,
                color: match.winner === match.teamB ? 'var(--accent)' : 'var(--text-secondary)',
                marginTop: 4,
              }}>
                {isNaN(scoreB) ? '—' : scoreB}
              </div>
              {match.winner === match.teamB && (
                <div style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.08em' }}>✓ GANADOR</div>
              )}
            </div>
          </div>

          {/* Probability bars */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 12,
            }}>Probabilidades del partido</div>
            {bars.map((b, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {b.flag} {b.label}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: b.color }}>{b.pct.toFixed(1)}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-input)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${b.pct}%` }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
                    style={{ height: '100%', background: b.color, borderRadius: 4, opacity: 0.85 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Champ probabilities */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
            background: 'var(--bg-card)', borderRadius: 10, padding: '12px 14px',
          }}>
            <div>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {flagA} % Campeón
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)' }}>
                {match.champPctA.toFixed(2)}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {flagB} % Campeón
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)' }}>
                {match.champPctB.toFixed(2)}%
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Basado en 10,300,000 simulaciones Monte Carlo · cada partido jugado 50,000 veces · seed=2026 · Modelo v2
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── BRACKET MATCH NODE ───────────────────────────────────────────────────────
function MatchNode({
  match, roundLabel, matchIndex, onClick, size = 'md',
}: {
  match: BracketMatch
  roundLabel: string
  matchIndex: number
  onClick: (s: ModalState) => void
  size?: 'sm' | 'md' | 'lg'
}) {
  const flagA = match.flagA || getTeamFlag(match.teamA)
  const flagB = match.flagB || getTeamFlag(match.teamB)
  const isGold = size === 'lg'
  const w = size === 'sm' ? 130 : size === 'lg' ? 200 : 155
  const fontSize = size === 'sm' ? '0.66rem' : size === 'lg' ? '0.82rem' : '0.72rem'

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick({ match, round: roundLabel, matchIndex })}
      style={{
        width: w,
        background: 'var(--bg-card)',
        border: isGold ? '1.5px solid var(--gold)' : match.method === 'pso' ? '1px solid rgba(255,184,0,0.4)' : '1px solid var(--border-strong)',
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: isGold ? '0 0 20px rgba(255,184,0,0.2)' : 'var(--shadow-sm)',
        flexShrink: 0,
        transition: 'box-shadow 0.2s',
        userSelect: 'none',
      }}
    >
      {/* Team A */}
      {[
        { name: match.teamA, flag: flagA, champPct: match.champPctA },
        { name: match.teamB, flag: flagB, champPct: match.champPctB },
      ].map((t, i) => {
        const isWinner = t.name === match.winner
        return (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: size === 'lg' ? '9px 10px' : '7px 8px',
              borderBottom: i === 0 ? '1px solid var(--border)' : 'none',
              background: isWinner ? 'rgba(200,241,53,0.08)' : 'transparent',
            }}
          >
            <span style={{ fontSize: size === 'lg' ? '1.1rem' : '0.9rem', flexShrink: 0 }}>{t.flag}</span>
            <span style={{
              flex: 1, fontSize, fontWeight: isWinner ? 700 : 500,
              color: isWinner ? 'var(--text-primary)' : 'var(--text-secondary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{t.name}</span>
            <span style={{
              fontSize: '0.6rem', fontWeight: 700,
              color: isWinner ? 'var(--accent)' : 'var(--text-muted)',
              flexShrink: 0,
            }}>
              {isWinner ? '✓' : ''}
              {t.champPct > 0 ? ` ${t.champPct.toFixed(1)}%` : ''}
            </span>
          </div>
        )
      })}
      {/* Score bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '4px 8px',
        background: isGold ? 'rgba(255,184,0,0.08)' : 'var(--bg-input)',
        borderTop: isGold ? '1px solid rgba(255,184,0,0.2)' : '1px solid var(--border)',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: size === 'lg' ? '1.2rem' : '0.95rem',
          letterSpacing: '0.06em', lineHeight: 1,
          color: isGold ? 'var(--gold)' : 'var(--text-primary)',
          fontWeight: 400,
        }}>{match.score}</span>
        {match.method === 'pso' && (
          <span style={{
            background: 'rgba(255,184,0,0.2)', color: 'var(--gold)',
            borderRadius: 3, padding: '1px 5px', fontSize: '0.55rem', fontWeight: 800,
          }}>PSO</span>
        )}
      </div>
    </motion.div>
  )
}

// ─── CONNECTOR LINE COLUMN ────────────────────────────────────────────────────
// Creates the bracket connector: groups pairs of matches and draws the connecting lines
function ConnectorCol({ count, matchHeight }: { count: number; matchHeight: number }) {
  const lines = []
  for (let i = 0; i < count; i++) {
    lines.push(
      <div key={i} style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '100%', height: matchHeight,
          borderTop: '1px solid var(--border-strong)',
          borderBottom: '1px solid var(--border-strong)',
          borderRight: '1px solid var(--border-strong)',
          borderRadius: '0 6px 6px 0',
        }} />
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 20, flexShrink: 0 }}>
      {lines}
    </div>
  )
}

// ─── ROUND COLUMN ─────────────────────────────────────────────────────────────
function RoundCol({
  label, matches, roundLabel, gap, size = 'md', onMatchClick, showConnector = true,
}: {
  label: string
  matches: BracketMatch[]
  roundLabel: string
  gap: number
  size?: 'sm' | 'md' | 'lg'
  onMatchClick: (s: ModalState) => void
  showConnector?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, flexShrink: 0 }}>
      {/* Round label */}
      <div style={{
        fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: size === 'lg' ? 'var(--gold)' : 'var(--accent)',
        marginBottom: 10, textAlign: 'center', minHeight: 22,
      }}>{label}</div>

      {/* Matches with gaps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap, alignItems: 'center' }}>
        {matches.map((m, i) => (
          <MatchNode
            key={i}
            match={m}
            roundLabel={roundLabel}
            matchIndex={i}
            onClick={onMatchClick}
            size={size}
          />
        ))}
      </div>
    </div>
  )
}

// ─── BRACKET TREE ─────────────────────────────────────────────────────────────
function BracketTree({ onMatchClick, onChampion }: { onMatchClick: (s: ModalState) => void; onChampion: () => void }) {
  const MATCH_H = 80   // approximate height of match node
  const COL_GAP = 20   // gap between columns

  // Split bracket in half: top 8 R32, top 4 R16, top 2 QF, SF[0]
  const r32Top    = KNOCKOUT.r32.slice(0, 8)
  const r32Bot    = KNOCKOUT.r32.slice(8, 16)
  const r16Top    = KNOCKOUT.r16.slice(0, 4)
  const r16Bot    = KNOCKOUT.r16.slice(4, 8)
  const qfTop     = KNOCKOUT.quarterfinals.slice(0, 2)
  const qfBot     = KNOCKOUT.quarterfinals.slice(2, 4)

  const roundGap = (pairGap: number) => pairGap

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 20 }}>
      <div style={{ minWidth: 1100, padding: '0 8px' }}>
        {/* ── TOP HALF ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: COL_GAP, marginBottom: 8 }}>
          <RoundCol label="Ronda de 32" matches={r32Top} roundLabel="Ronda de 32" gap={10} size="sm" onMatchClick={onMatchClick} />
          <RoundCol label="Octavos" matches={r16Top} roundLabel="Octavos de Final" gap={roundGap(100)} size="md" onMatchClick={onMatchClick} />
          <RoundCol label="Cuartos" matches={qfTop} roundLabel="Cuartos de Final" gap={roundGap(250)} size="md" onMatchClick={onMatchClick} />
          <RoundCol label="Semifinal" matches={[KNOCKOUT.semifinals[0]]} roundLabel="Semifinal" gap={0} size="md" onMatchClick={onMatchClick} />
        </div>

        {/* ── FINAL CENTERED ── */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '20px 0', gap: 16,
          borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
          margin: '12px 0',
        }}>
          <div style={{ textAlign: 'center' }}>
            {/* 3er lugar */}
            <div style={{
              fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
            }}>3er Lugar</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-card)', border: '1px solid var(--border-strong)',
              borderRadius: 10, padding: '8px 14px', fontSize: '0.75rem',
            }}>
              <span>🇲🇦</span><span style={{ color: 'var(--text-secondary)' }}>Morocco</span>
              <span style={{ color: 'var(--text-muted)' }}>vs</span>
              <span style={{ color: 'var(--text-secondary)' }}>Ecuador</span><span>🇪🇨</span>
            </div>
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, rgba(255,184,0,0.08), rgba(255,184,0,0.03))',
            border: '2px solid var(--gold)',
            borderRadius: 16, padding: '18px 24px',
            boxShadow: '0 0 40px rgba(255,184,0,0.15)',
          }}>
            <div style={{
              fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4,
            }}>
              🏆 Gran Final · Los Ángeles · 19 Jul 2026
            </div>
            <MatchNode
              match={KNOCKOUT.final}
              roundLabel="Gran Final"
              matchIndex={0}
              onClick={(s) => { onMatchClick(s); onChampion() }}
              size="lg"
            />
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={onChampion}
              style={{
                background: 'linear-gradient(135deg, var(--gold), #d97706)',
                border: 'none', borderRadius: 8, padding: '8px 20px',
                color: '#000', fontWeight: 800, fontSize: '0.78rem',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 6,
                marginTop: 4,
              }}
            >
              🎉 ¡Celebrar campeón!
            </motion.button>
            <div style={{
              display: 'flex', gap: 20, marginTop: 4,
              fontSize: '0.65rem', color: 'var(--text-secondary)',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.55rem', textTransform: 'uppercase' }}>Campeón más probable</div>
                <div style={{ color: 'var(--gold)', fontWeight: 800, marginTop: 2 }}>🇫🇷 France · 9.00%</div>
              </div>
              <div style={{ width: 1, background: 'var(--border)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.55rem', textTransform: 'uppercase' }}>Favorito global</div>
                <div style={{ color: 'var(--accent)', fontWeight: 800, marginTop: 2 }}>🇦🇷 Argentina · 12.56%</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM HALF ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: COL_GAP, marginTop: 8 }}>
          <RoundCol label="Ronda de 32" matches={r32Bot} roundLabel="Ronda de 32" gap={10} size="sm" onMatchClick={onMatchClick} />
          <RoundCol label="Octavos" matches={r16Bot} roundLabel="Octavos de Final" gap={roundGap(100)} size="md" onMatchClick={onMatchClick} />
          <RoundCol label="Cuartos" matches={qfBot} roundLabel="Cuartos de Final" gap={roundGap(250)} size="md" onMatchClick={onMatchClick} />
          <RoundCol label="Semifinal" matches={[KNOCKOUT.semifinals[1]]} roundLabel="Semifinal" gap={0} size="md" onMatchClick={onMatchClick} />
        </div>
      </div>
    </div>
  )
}

// ─── GROUP TABLE ──────────────────────────────────────────────────────────────
function GroupCard({ letter, index }: { letter: string; index: number }) {
  const standings = computeStandings(letter)
  const isDeath = letter === 'I'
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      style={{
        background: 'var(--bg-card)',
        border: isDeath ? '1px solid rgba(248,113,113,0.3)' : '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px',
        background: isDeath ? 'rgba(248,113,113,0.06)' : 'var(--bg-input)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: isDeath ? 'var(--red)' : 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Grupo {letter}
          </div>
          {isDeath && <div style={{ fontSize: '0.58rem', color: 'var(--red)', fontWeight: 600 }}>💀 Grupo de la Muerte</div>}
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: isDeath ? 'rgba(248,113,113,0.15)' : 'var(--accent-dim)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', fontWeight: 900, color: isDeath ? 'var(--red)' : 'var(--accent)',
        }}>{letter}</div>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '18px 1.2rem 1fr 28px 24px 24px 28px',
        gap: 4, padding: '5px 12px',
        fontSize: '0.55rem', fontWeight: 700, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        borderBottom: '1px solid var(--border)',
      }}>
        <span>#</span><span></span><span>Equipo</span>
        <span style={{ textAlign: 'center' }}>PTS</span>
        <span style={{ textAlign: 'center' }}>GF</span>
        <span style={{ textAlign: 'center' }}>GC</span>
        <span style={{ textAlign: 'center' }}>DG</span>
      </div>

      {/* Rows */}
      {standings.map((s, i) => {
        const borderColor = i === 0 ? 'var(--accent)' : i === 1 ? 'var(--purple)' : i === 2 ? 'rgba(251,191,36,0.6)' : 'transparent'
        return (
          <div key={s.name} style={{
            display: 'grid', gridTemplateColumns: '18px 1.2rem 1fr 28px 24px 24px 28px',
            alignItems: 'center', gap: 4, padding: '7px 12px',
            borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
            borderLeft: `3px solid ${borderColor}`,
          }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center' }}>{i + 1}</span>
            <span style={{ fontSize: '0.88rem' }}>{s.team?.flag ?? ''}</span>
            <span style={{
              fontSize: '0.72rem', fontWeight: i < 2 ? 700 : 500,
              color: i < 2 ? 'var(--text-primary)' : 'var(--text-secondary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{s.name}</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)', textAlign: 'center' }}>{s.pts}</span>
            <span style={{ fontSize: '0.7rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{s.gf}</span>
            <span style={{ fontSize: '0.7rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{s.ga}</span>
            <span style={{
              fontSize: '0.7rem', textAlign: 'center', fontWeight: 600,
              color: s.dg > 0 ? 'var(--green)' : s.dg < 0 ? 'var(--red)' : 'var(--text-muted)',
            }}>{s.dg > 0 ? `+${s.dg}` : s.dg}</span>
          </div>
        )
      })}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 8, padding: '6px 12px', flexWrap: 'wrap' }}>
        {[
          { color: 'var(--accent)',                  label: '1ro · R32' },
          { color: 'var(--purple)',                  label: '2do · R32' },
          { color: 'rgba(251,191,36,0.6)',            label: '3ro · Mejor' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.57rem', color: 'var(--text-muted)' }}>
            <span style={{ width: 7, height: 7, borderRadius: 2, background: l.color, display: 'inline-block', flexShrink: 0 }} />
            {l.label}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── FUNNEL TAB ───────────────────────────────────────────────────────────────
function FunnelTab() {
  const top = STAGE_PROBS.slice(0, 20)
  const cols = ['R32', 'Cuartos', 'Semis', 'Final', 'Campeón'] as const
  const keys = ['r32', 'cuartos', 'semis', 'final', 'campeon'] as const
  const colors = ['var(--accent)', 'var(--blue)', 'var(--purple)', 'var(--gold)', 'var(--gold)']

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr repeat(5, 68px)',
        gap: 8, padding: '7px 0', marginBottom: 6,
        fontSize: '0.58rem', fontWeight: 800, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        borderBottom: '2px solid var(--border-strong)',
      }}>
        <span></span><span>Equipo</span>
        {cols.map(c => <span key={c} style={{ textAlign: 'center' }}>{c}</span>)}
      </div>
      {top.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-8px' }}
          transition={{ delay: i * 0.025, duration: 0.3 }}
          style={{
            display: 'grid',
            gridTemplateColumns: '28px 1fr repeat(5, 68px)',
            gap: 8, alignItems: 'center',
            padding: '8px 0', borderBottom: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: '1.1rem', textAlign: 'center' }}>{t.flag}</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
          {keys.map((k, j) => {
            const pct = t[k]
            const isChamp = k === 'campeon'
            return (
              <div key={k} style={{
                position: 'relative', height: 22, borderRadius: 4,
                overflow: 'hidden', background: 'var(--bg-input)',
              }}>
                <motion.div
                  style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0,
                    background: colors[j], opacity: isChamp ? 1 : 0.55, borderRadius: 4,
                  }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.025 + 0.15, duration: 0.65, ease: 'easeOut' }}
                />
                <span style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem', fontWeight: 700, zIndex: 1,
                  color: isChamp && pct > 5 ? '#000' : 'var(--text-primary)',
                }}>{pct.toFixed(1)}%</span>
              </div>
            )
          })}
        </motion.div>
      ))}
      <div style={{ marginTop: 12, fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        simulation_results_v2.json · 10,300,000 simulaciones totales · 50,000 por partido · seed=2026
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Bracket() {
  const [tab, setTab] = useState<Tab>('bracket')
  const [modal, setModal] = useState<ModalState | null>(null)
  const [confetti, setConfetti] = useState(false)

  const triggerConfetti = useCallback(() => {
    setConfetti(true)
    setTimeout(() => setConfetti(false), 5000)
  }, [])

  const tabs = [
    { key: 'bracket' as Tab, label: 'Bracket Visual', icon: '🗂️' },
    { key: 'grupos'  as Tab, label: 'Fase de Grupos', icon: '⚽' },
    { key: 'funnel'  as Tab, label: 'Funnel de Avance', icon: '📊' },
  ]

  const best3rds = [
    { name: 'Algeria',   flag: '🇩🇿' }, { name: 'Ecuador',  flag: '🇪🇨' },
    { name: 'Egypt',     flag: '🇪🇬' }, { name: 'Norway',   flag: '🇳🇴' },
    { name: 'Australia', flag: '🇦🇺' }, { name: 'Czechia',  flag: '🇨🇿' },
    { name: 'Panama',    flag: '🇵🇦' }, { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ]

  return (
    <PageWrapper>
      <Confetti active={confetti} duration={4500} />
      {modal && <MatchModal state={modal} onClose={() => setModal(null)} />}

      <div className="page">
        {/* ── Header ── */}
        <div className="page-header">
          <div className="page-tag">🗂️ Bracket · Mundial 2026</div>
          <h1 className="page-title">Bracket <span>Oficial</span> del Torneo</h1>
          <p className="page-desc">
            Visualización interactiva basada en <strong style={{ color: 'var(--accent)' }}>10,300,000 simulaciones Monte Carlo</strong> (50,000 torneos × 103 partidos × 2 versiones).
            Cada resultado es el más frecuente en las 50,000 simulaciones de la versión v2. Haz clic en cualquier partido para ver las probabilidades y el detalle estadístico.
          </p>
        </div>

        {/* ── Champion Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex', gap: 0, borderRadius: 14, overflow: 'hidden',
            border: '1px solid var(--border-strong)', marginBottom: 28,
          }}
        >
          {[
            { flag: '🇦🇷', label: 'Favorito Global', val: 'Argentina', sub: '12.56% campeón', accent: 'var(--accent)', bg: 'rgba(200,241,53,0.05)' },
            { flag: '🇫🇷', label: 'Campeón más probable', val: 'France', sub: '9.00% · Final más frecuente', accent: 'var(--gold)', bg: 'rgba(255,184,0,0.05)' },
            { flag: '🇲🇦', label: 'Mayor sorpresa', val: 'Morocco', sub: '+87.9% vs ELO base', accent: 'var(--purple)', bg: 'rgba(129,140,248,0.05)' },
            { flag: '⚽', label: 'Simulaciones totales', val: '10,300,000', sub: '50K torneos × 103 partidos × 2 versiones', accent: 'var(--blue)', bg: 'transparent' },

          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: '14px 18px', background: s.bg,
              borderRight: i < 3 ? '1px solid var(--border)' : 'none',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{s.flag}</div>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: s.accent }}>{s.val}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Tabs ── */}
        <div className="tabs-bar" style={{ marginBottom: 24 }}>
          {tabs.map(t => (
            <button key={t.key} className={`tab-btn${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── BRACKET TAB ── */}
        {tab === 'bracket' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div style={{
              fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 16,
              display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)', display: 'inline-block' }} />
                Ganador
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255,184,0,0.6)', display: 'inline-block' }} />
                PSO = Penales
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>
                % = probabilidad de ser campeón · Haz clic en cualquier partido para detalles
              </span>
            </div>

            <BracketTree onMatchClick={setModal} onChampion={triggerConfetti} />

            <div style={{ marginTop: 20 }} className="info-box">
              <h4>¿Cómo se determinó cada resultado?</h4>
              <p>
                Cada partido en el bracket es el resultado que ocurrió en la <strong style={{ color: 'var(--text-primary)' }}>mayoría de las 50,000 simulaciones v2</strong> (parte de las 10,300,000 totales).
                El marcador es el más frecuente en esas simulaciones. Los partidos marcados <strong style={{ color: 'var(--gold)' }}>PSO</strong> son
                aquellos donde el empate ocurrió en más del 30% de las simulaciones y se resolvieron por penales,
                usando las tasas históricas reales de cada selección (94 tandas registradas 2018–2026).
              </p>
            </div>
          </motion.div>
        )}

        {/* ── GRUPOS TAB ── */}
        {tab === 'grupos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-strong)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--yellow)' }}>
                🏅 8 mejores terceros clasificados:
              </span>
              {best3rds.map(t => (
                <span key={t.name} style={{
                  background: 'rgba(251,191,36,0.1)', color: 'var(--yellow)',
                  border: '1px solid rgba(251,191,36,0.25)', borderRadius: 6,
                  padding: '3px 9px', fontSize: '0.72rem', fontWeight: 600,
                }}>
                  {t.flag} {t.name}
                </span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {'ABCDEFGHIJKL'.split('').map((l, i) => (
                <GroupCard key={l} letter={l} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── FUNNEL TAB ── */}
        {tab === 'funnel' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className="info-box" style={{ marginBottom: 20 }}>
              <h4>Probabilidades acumuladas de avance por etapa (top 20)</h4>
              <p>
                Cada % = fracción de las 50,000 simulaciones v2 (de 10,300,000 totales) donde el equipo llegó o superó esa etapa.
                Valores acumulativos: P(Cuartos) incluye P(clasificar de grupos).
              </p>
            </div>
            <FunnelTab />
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}
