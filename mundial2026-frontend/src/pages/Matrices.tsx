import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../components/PageWrapper'
import { MATCHES, GROUPS } from '../data/data'
import type { Match } from '../data/data'

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function buildMatrix(letter: string) {
  const groupName = `Grupo ${letter}`
  const group = GROUPS.find(g => g.letter === letter)
  if (!group) return { teams: [], flags: [], elos: [], matrix: [], matches: [] }
  const teams = group.teams.map(t => t.name)
  const flags = group.teams.map(t => t.flag)
  const elos  = group.teams.map(t => t.elo)
  const n = teams.length
  const matrix: ({ pWin: number; pDraw: number; pLose: number } | null)[][] =
    Array.from({ length: n }, () => Array(n).fill(null))

  // Try both group name variants
  const matches: Match[] = MATCHES[groupName]
    ?? MATCHES[`Grupo ${letter} ⚠️ Grupo de la Muerte`]
    ?? []

  for (const m of matches) {
    const iA = teams.indexOf(m.teamA), iB = teams.indexOf(m.teamB)
    if (iA !== -1 && iB !== -1) {
      matrix[iA][iB] = { pWin: m.pA, pDraw: m.pE, pLose: m.pB }
      matrix[iB][iA] = { pWin: m.pB, pDraw: m.pE, pLose: m.pA }
    }
  }
  return { teams, flags, elos, matrix, matches }
}

// Color for P(win) — green (strong fav) → yellow → red (underdog)
function winColor(p: number): string {
  if (p >= 0.65) return 'rgba(52,211,153,0.18)'
  if (p >= 0.50) return 'rgba(52,211,153,0.09)'
  if (p >= 0.40) return 'rgba(251,191,36,0.14)'
  if (p >= 0.30) return 'rgba(251,191,36,0.08)'
  return 'rgba(248,113,113,0.13)'
}
function winTextColor(p: number): string {
  if (p >= 0.65) return 'var(--green)'
  if (p >= 0.40) return 'var(--yellow)'
  return 'var(--red)'
}

// ─── MINI CELL (inside matrix) ────────────────────────────────────────────────
function MatrixCell({ cell, animate }: { cell: { pWin: number; pDraw: number; pLose: number }; animate: boolean }) {
  const vPct = cell.pWin * 100
  const ePct = cell.pDraw * 100
  const dPct = cell.pLose * 100
  return (
    <div style={{
      background: winColor(cell.pWin),
      borderRadius: 8, padding: '10px 8px',
      display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center',
      height: '100%',
    }}>
      {/* Big win % */}
      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: winTextColor(cell.pWin), lineHeight: 1 }}>
        {vPct.toFixed(1)}%
      </div>
      {/* Stacked bar */}
      <div style={{ width: '100%', height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', gap: 1 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={animate ? { width: `${vPct}%` } : { width: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          style={{ background: 'var(--green)', height: '100%', borderRadius: 2, flexShrink: 0 }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={animate ? { width: `${ePct}%` } : { width: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          style={{ background: 'var(--yellow)', height: '100%', borderRadius: 2, flexShrink: 0 }}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={animate ? { width: `${dPct}%` } : { width: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          style={{ background: 'var(--red)', height: '100%', borderRadius: 2, flexShrink: 0 }}
        />
      </div>
      {/* E / D small */}
      <div style={{ fontSize: '0.56rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
        E {ePct.toFixed(0)}% · D {dPct.toFixed(0)}%
      </div>
    </div>
  )
}

// ─── MATCH CARD ───────────────────────────────────────────────────────────────
function MatchCard({ m, flagA, flagB, animate }: {
  m: Match; flagA: string; flagB: string; animate: boolean
}) {
  const [showProb, setShowProb] = useState(false)
  const pA = m.pA * 100, pE = m.pE * 100, pB = m.pB * 100
  const winner = m.pA > m.pB && m.pA > m.pE ? 'A' : m.pB > m.pA && m.pB > m.pE ? 'B' : 'E'
  const maxPct = Math.max(pA, pE, pB).toFixed(1)
  const favFlag = winner === 'A' ? flagA : winner === 'B' ? flagB : null

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '14px 16px', overflow: 'hidden',
    }}>
      {/* Teams row with prominent result */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        {/* Team A */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: winner === 'A' ? 'var(--accent)' : 'var(--text-secondary)',
          fontWeight: winner === 'A' ? 800 : 500,
        }}>
          <span style={{ fontSize: '1.2rem', filter: winner === 'A' ? 'drop-shadow(0 0 8px rgba(200,241,53,0.4))' : 'none' }}>{flagA}</span>
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-ui)' }}>{m.teamA.split(' ').slice(0, 2).join(' ')}</span>
        </div>

        {/* Center: result badge */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '6px 10px', borderRadius: 8, minWidth: 64,
          background: winner === 'E' ? 'rgba(255,184,0,0.09)' : 'rgba(200,241,53,0.08)',
          border: winner === 'E' ? '1px solid rgba(255,184,0,0.2)' : '1px solid rgba(200,241,53,0.15)',
        }}>
          <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{favFlag ?? '🤝'}</span>
          <span style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.78rem', fontWeight: 900,
            color: winner === 'E' ? 'var(--yellow)' : 'var(--accent)', lineHeight: 1.2,
          }}>
            {winner === 'E' ? 'EMPATE' : 'GANA'}
          </span>
          <span style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.85rem', fontWeight: 900,
            color: winner === 'E' ? 'var(--yellow)' : 'var(--accent)',
          }}>
            {maxPct}%
          </span>
        </div>

        {/* Team B */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end',
          color: winner === 'B' ? 'var(--accent)' : 'var(--text-secondary)',
          fontWeight: winner === 'B' ? 800 : 500,
        }}>
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-ui)' }}>{m.teamB.split(' ').slice(0, 2).join(' ')}</span>
          <span style={{ fontSize: '1.2rem', filter: winner === 'B' ? 'drop-shadow(0 0 8px rgba(200,241,53,0.4))' : 'none' }}>{flagB}</span>
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setShowProb(p => !p)}
        style={{
          width: '100%', background: 'none',
          border: '1px solid var(--border)', borderRadius: 5,
          color: 'var(--text-muted)', fontFamily: 'var(--font-ui)',
          fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.07em',
          padding: '5px 0', cursor: 'pointer', transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
      >
        <span style={{ transform: showProb ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
        {showProb ? 'OCULTAR' : 'VER PROBABILIDADES'}
      </button>

      {/* Probability bars (collapsible) */}
      <AnimatePresence initial={false}>
        {showProb && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 12 }}>
              {[
                { label: `${flagA} Gana`, pct: pA, color: 'var(--green)', active: winner === 'A' },
                { label: 'Empate',        pct: pE, color: 'var(--yellow)', active: winner === 'E' },
                { label: `${flagB} Gana`, pct: pB, color: 'var(--red)',   active: winner === 'B' },
              ].map((bar, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? 8 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.68rem' }}>
                    <span style={{ color: bar.active ? bar.color : 'var(--text-muted)', fontWeight: bar.active ? 700 : 400 }}>
                      {bar.label}
                    </span>
                    <span style={{ fontWeight: 900, color: bar.color, fontFamily: 'var(--font-ui)', fontSize: '0.8rem' }}>
                      {bar.pct.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-input)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={animate ? { width: `${bar.pct}%` } : { width: 0 }}
                      transition={{ duration: 0.65, ease: 'easeOut', delay: 0.1 + i * 0.1 }}
                      style={{
                        height: '100%', background: bar.color, borderRadius: 4,
                        opacity: bar.active ? 1 : 0.5,
                        boxShadow: bar.active ? `0 0 8px ${bar.color}60` : 'none',
                      }}
                    />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: '0.56rem', color: 'var(--text-muted)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                {m.id} · v2 · 50,000 sims · 10.3M total
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── GROUP ACCORDION ──────────────────────────────────────────────────────────
function GroupAccordion({ letter, index }: { letter: string; index: number }) {
  const [open, setOpen] = useState(false)
  const { teams, flags, elos, matrix, matches } = buildMatrix(letter)
  const isDeath = letter === 'I'
  const teamMap = Object.fromEntries(
    (GROUPS.find(g => g.letter === letter)?.teams ?? []).map(t => [t.name, t.flag])
  )

  // Dificultad del grupo: sum of ELOs
  const sumElo = elos.reduce((a, b) => a + b, 0)
  const maxElo = Math.max(...elos), minElo = Math.min(...elos)
  const spread = maxElo - minElo

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      style={{
        background: 'var(--bg-card)',
        border: isDeath
          ? `1px solid ${open ? 'rgba(248,113,113,0.5)' : 'rgba(248,113,113,0.25)'}`
          : `1px solid ${open ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      {/* ── Header (always visible, click to toggle) ── */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
          textAlign: 'left',
        }}
      >
        {/* Letter badge */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: '1.1rem',
          background: isDeath
            ? 'rgba(248,113,113,0.12)'
            : open ? 'var(--accent-dim)' : 'var(--bg-input)',
          color: isDeath ? 'var(--red)' : open ? 'var(--accent)' : 'var(--text-secondary)',
          border: isDeath ? '1px solid rgba(248,113,113,0.2)' : open ? '1px solid var(--accent-glow)' : '1px solid var(--border)',
          transition: 'all 0.2s',
        }}>{letter}</div>

        {/* Group info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.82rem', fontWeight: 700,
              color: isDeath ? 'var(--red)' : 'var(--text-primary)',
            }}>
              Grupo {letter}
            </span>
            {isDeath && (
              <span style={{
                background: 'rgba(248,113,113,0.12)', color: 'var(--red)',
                border: '1px solid rgba(248,113,113,0.25)',
                borderRadius: 4, padding: '1px 7px', fontSize: '0.6rem', fontWeight: 800,
              }}>💀 Grupo de la Muerte</span>
            )}
            <span style={{
              fontSize: '0.62rem', color: 'var(--text-muted)',
              background: 'var(--bg-input)', borderRadius: 4, padding: '1px 6px',
            }}>
              ΣElo {sumElo.toLocaleString()}
            </span>
            <span style={{
              fontSize: '0.62rem',
              color: spread > 500 ? 'var(--green)' : spread > 300 ? 'var(--yellow)' : 'var(--red)',
              background: 'var(--bg-input)', borderRadius: 4, padding: '1px 6px',
            }}>
              {spread > 500 ? '↕ Muy desigual' : spread > 300 ? '↕ Mixto' : '↕ Parejo'}
            </span>
          </div>
          {/* Flags row */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {flags.map((f, i) => (
              <span key={i} style={{ fontSize: '1.15rem' }} title={teams[i]}>{f}</span>
            ))}
            {!open && (
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                · {matches.length} partidos
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}
        >▼</motion.div>
      </button>

      {/* ── Expanded content ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 18px 20px', borderTop: '1px solid var(--border)' }}>

              {/* ELO chips */}
              <div style={{ display: 'flex', gap: 8, paddingTop: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                {teams.map((t, i) => (
                  <div key={t} style={{
                    background: 'var(--bg-input)', border: '1px solid var(--border-strong)',
                    borderRadius: 8, padding: '6px 12px',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>{flags[i]}</span>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{t}</div>
                      <div style={{
                        fontSize: '0.62rem', color: 'var(--text-muted)',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>ELO {elos[i]}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── MATRIX ── */}
              <div style={{ marginBottom: 8, fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Matriz de probabilidades (fila gana → columna)
              </div>
              <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                <table style={{ borderCollapse: 'separate', borderSpacing: 4, width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{
                        width: 120, padding: '6px 8px', textAlign: 'left',
                        fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600,
                      }}>
                        ← fila gana
                      </th>
                      {teams.map((t, j) => (
                        <th key={j} style={{
                          minWidth: 110, padding: '6px 4px', textAlign: 'center',
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: '1.15rem' }}>{flags[j]}</span>
                            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                              {t.split(' ').slice(0, 2).join(' ')}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, i) => (
                      <tr key={team}>
                        <td style={{ padding: '4px 8px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ fontSize: '1.1rem' }}>{flags[i]}</span>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{team.split(' ').slice(0, 2).join(' ')}</div>
                              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{elos[i]}</div>
                            </div>
                          </div>
                        </td>
                        {teams.map((_, j) => (
                          <td key={j} style={{ padding: '3px', verticalAlign: 'top' }}>
                            {i === j ? (
                              <div style={{
                                minWidth: 110, height: 72, background: 'var(--bg-input)',
                                borderRadius: 8, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '1.1rem', color: 'var(--border-strong)',
                              }}>—</div>
                            ) : matrix[i][j] ? (
                              <div style={{ minWidth: 110, height: 72 }}>
                                <MatrixCell cell={matrix[i][j]!} animate={open} />
                              </div>
                            ) : (
                              <div style={{
                                minWidth: 110, height: 72, background: 'var(--bg-input)',
                                borderRadius: 8, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '0.65rem', color: 'var(--text-muted)',
                              }}>N/D</div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Legend ── */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', fontSize: '0.68rem' }}>
                {[
                  { color: 'var(--green)',  label: '≥65% Favorito claro',    bg: 'rgba(52,211,153,0.18)' },
                  { color: 'var(--yellow)', label: '40-65% Parejo',           bg: 'rgba(251,191,36,0.14)' },
                  { color: 'var(--red)',    label: '<40% Desfavorable',       bg: 'rgba(248,113,113,0.13)' },
                ].map(l => (
                  <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: l.bg, border: `1px solid ${l.color}`, display: 'inline-block' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{l.label}</span>
                  </span>
                ))}
                <span style={{ color: 'var(--text-muted)' }}>E = Empate · D = Derrota (equipo fila)</span>
              </div>

              {/* ── Individual matches ── */}
              <div style={{ marginBottom: 8, fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Partidos del grupo — detalle completo
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                {matches.map(m => (
                  <MatchCard
                    key={m.id}
                    m={m}
                    flagA={teamMap[m.teamA] ?? '🏳️'}
                    flagB={teamMap[m.teamB] ?? '🏳️'}
                    animate={open}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const GROUP_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function Matrices() {
  const [allOpen, setAllOpen] = useState(false)

  return (
    <PageWrapper>
      <div className="page">
        {/* ── Header ── */}
        <div className="page-header">
          <div className="page-tag">📋 Matrices de Probabilidad</div>
          <h1 className="page-title">Matrices por <span>Grupo</span></h1>
          <p className="page-desc">
            Haz clic en cualquier grupo para expandir su matriz completa.
            Cada celda muestra la probabilidad de que el equipo de la
            <strong style={{ color: 'var(--accent)' }}> fila gane</strong> contra
            el equipo de la columna, junto con la distribución Victoria / Empate / Derrota con barras animadas.
            Las probabilidades fueron calculadas con el modelo
            <strong style={{ color: 'var(--purple)' }}> ELO-Historial-Forma v2</strong> sobre
            2,540 partidos oficiales 2018–2026, validadas con
            <strong style={{ color: 'var(--accent)' }}> 10,300,000 simulaciones Monte Carlo</strong> (cada partido jugado 50,000 veces).
          </p>
        </div>

        {/* ── How it works ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 10, marginBottom: 28,
        }}>
          {[
            { icon: '⚖️', color: 'var(--accent)',  title: 'ELO × 0.55', desc: 'Rating relativo del equipo. Fórmula logística: P = 1 / (1 + 10^(ΔELO/400))' },
            { icon: '📜', color: 'var(--purple)', title: 'Historial × 0.35', desc: 'Win rate real de cada equipo en partidos oficiales 2018–2026 (2,540 partidos)' },
            { icon: '🔥', color: 'var(--gold)',   title: 'Forma × 0.10', desc: 'Resultados de los últimos 5 partidos, normalizado de 0 a 1 por equipo' },
            { icon: '🎯', color: 'var(--blue)',   title: 'Normalizado', desc: 'P(A) + P(E) + P(B) = 1.0 siempre. Verificado en los 72 partidos de grupos' },
          ].map(c => (
            <div key={c.title} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '12px 14px',
              borderTop: `2px solid ${c.color}`,
            }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: c.color, marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Legend quick ref ── */}
        <div style={{
          display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap',
          padding: '10px 16px', background: 'var(--bg-card)',
          borderRadius: 8, border: '1px solid var(--border)', fontSize: '0.72rem',
          alignItems: 'center',
        }}>
          <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Leyenda celdas:</span>
          {[
            { color: 'var(--green)',  bg: 'rgba(52,211,153,0.18)', label: '≥65% Favorito claro' },
            { color: 'var(--yellow)', bg: 'rgba(251,191,36,0.14)', label: '40-65% Parejo' },
            { color: 'var(--red)',    bg: 'rgba(248,113,113,0.13)', label: '<40% Desfavorable' },
          ].map(l => (
            <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: l.bg, border: `1px solid ${l.color}`, display: 'inline-block' }} />
              <span style={{ color: 'var(--text-secondary)' }}>{l.label}</span>
            </span>
          ))}
          <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '0.65rem' }}>
            Clic en el grupo → expandir matriz + partidos
          </span>
        </div>

        {/* ── Group accordions ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {GROUP_LETTERS.map((l, i) => (
            <GroupAccordion key={l} letter={l} index={i} />
          ))}
        </div>

        {/* ── Footer note ── */}
        <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Fuente:</strong> probabilidades_partidos_v2.json — calculado por el Agente 2 (Probability Calculator) sobre los 72 partidos de fase de grupos.
            Los valores P(A), P(E), P(B) están normalizados para sumar exactamente 1.000.
            Validados con <strong style={{ color: 'var(--text-secondary)' }}>10,300,000 simulaciones Monte Carlo</strong> en total —
            cada partido jugado <strong style={{ color: 'var(--text-secondary)' }}>50,000 veces</strong> individualmente · seed=2026 · convergencia max_var=0.38%.
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
