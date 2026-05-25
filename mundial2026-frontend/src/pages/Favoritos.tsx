import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts'
import PageWrapper from '../components/PageWrapper'
import { CHAMP_PROBS } from '../data/data'

const RANK_COLORS = [
  '#FFB800', '#94a3b8', '#b45309',
  '#C8F135', '#C8F135', '#C8F135',
  '#9B8FFF', '#9B8FFF', '#9B8FFF', '#9B8FFF',
]

function getRankColor(i: number) {
  return RANK_COLORS[i] ?? '#475569'
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-strong)',
      borderRadius: 10, padding: '12px 16px', minWidth: 200,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: '1.4rem' }}>{d.flag}</span>
        <span style={{ fontWeight: 700 }}>{d.name}</span>
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <div>Modelo v2: <strong style={{ color: 'var(--accent)' }}>{d.probV2.toFixed(3)}%</strong></div>
        <div>Modelo v1: <strong style={{ color: 'var(--purple)' }}>{d.probV1.toFixed(3)}%</strong></div>
        <div>Delta: <strong style={{ color: d.probV2 > d.probV1 ? 'var(--green)' : 'var(--red)' }}>
          {d.probV2 > d.probV1 ? '+' : ''}{(d.probV2 - d.probV1).toFixed(3)}pp
        </strong></div>
        <div>IC95%: [{d.ic95Low.toFixed(2)}, {d.ic95High.toFixed(2)}]</div>
        <div>ELO: {d.eloV2}</div>
      </div>
    </div>
  )
}

type Tab = 'chart' | 'list'

export default function Favoritos() {
  const [tab, setTab] = useState<Tab>('chart')
  const [showCount, setShowCount] = useState(20)

  const top10 = CHAMP_PROBS.slice(0, 10)
  const maxProb = CHAMP_PROBS[0].probV2
  const withProb = CHAMP_PROBS.filter((t) => t.probV2 > 0)
  const zeroProb = CHAMP_PROBS.filter((t) => t.probV2 === 0)

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-header">
          <div className="page-tag">🏆 Resultados</div>
          <h1 className="page-title">Probabilidades de <span>Campeonato</span></h1>
          <p className="page-desc">
            Resultados de <strong style={{ color: 'var(--accent)' }}>10,300,000 simulaciones</strong> Monte Carlo
            (50,000 torneos × 103 partidos × 2 versiones) con el modelo ELO-Historial-Combinado v2.0.
            Argentina emerge como favorito claro con 12.56%, separándose por <strong style={{ color: 'var(--accent)' }}>+3.23pp</strong> de España —
            diferencia estadísticamente significativa que rompe el empate técnico del modelo v1.
          </p>
        </div>

        {/* Key insight */}
        <motion.div
          className="info-box"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 24 }}
        >
          <h4>🇦🇷 Hallazgo principal: Argentina favorito claro en v2</h4>
          <p>
            En v1, los 4 primeros (England 10.76%, Spain 10.67%, France 10.58%, Argentina 10.38%)
            estaban estadísticamente empatados — los IC95% se solapaban completamente.
            En v2, Argentina sube a <strong style={{ color: 'var(--text-primary)' }}>12.56% IC95[12.27, 12.85]</strong> y su intervalo
            no solapa con ningún rival. <strong style={{ color: 'var(--text-primary)' }}>Morocco</strong> es la mayor sorpresa:
            sube de 4.39% a 8.25% (+87.9% relativo), superando a Brazil y Alemania.
            Conclusiones basadas en <strong style={{ color: 'var(--text-primary)' }}>10,300,000 simulaciones individuales</strong> — cada equipo evaluado 50,000 veces por versión.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="tabs-bar">
          <button className={`tab-btn${tab === 'chart' ? ' active' : ''}`} onClick={() => setTab('chart')}>Gráfico</button>
          <button className={`tab-btn${tab === 'list' ? ' active' : ''}`} onClick={() => setTab('list')}>Lista completa</button>
        </div>

        {tab === 'chart' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ marginBottom: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Top 10 favoritos — Probabilidad de campeonato (%) · 10,300,000 simulaciones · seed=2026
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={top10} layout="vertical" margin={{ top: 0, right: 80, bottom: 0, left: 110 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis
                  type="number" domain={[0, 14]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  type="category" dataKey="name" width={108}
                  tick={({ x, y, payload, index }) => (
                    <g transform={`translate(${x},${y})`}>
                      <text x={-6} y={0} dy={4} textAnchor="end" fill="var(--text-primary)" fontSize={12} fontWeight={600}>
                        {payload.value}
                      </text>
                    </g>
                  )}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <ReferenceLine x={10} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                <Bar dataKey="probV2" radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (v: number) => `${v.toFixed(2)}%`, fill: 'var(--text-secondary)', fontSize: 11 }}>
                  {top10.map((_, i) => (
                    <Cell key={i} fill={getRankColor(i)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* V1 vs V2 mini chart */}
            <div style={{ marginTop: 28 }}>
              <div style={{ marginBottom: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Comparacion v1 vs v2 — Top 10 (azul=v1 anterior, verde=v2 corregido)
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top10} layout="vertical" margin={{ top: 0, right: 80, bottom: 0, left: 110 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" domain={[0, 14]} tickFormatter={(v) => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={108} tick={{ fill: 'var(--text-primary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="probV1" fill="var(--purple)" opacity={0.5} radius={[0, 2, 2, 0]} name="v1" />
                  <Bar dataKey="probV2" fill="var(--accent)" radius={[0, 4, 4, 0]} name="v2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {tab === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ marginBottom: 12, fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{withProb.length} equipos con probabilidad {'>'} 0</span>
              <span>{zeroProb.length} equipos con 0.000%</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {CHAMP_PROBS.slice(0, showCount).map((t, i) => {
                const w = t.probV2 > 0 ? Math.max((t.probV2 / maxProb) * 100, 0.5) : 0
                const delta = t.probV2 - t.probV1
                return (
                  <motion.div
                    key={t.name}
                    className="champ-item"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.3 }}
                  >
                    <div className={`champ-rank ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-n'}`}>
                      {i + 1}
                    </div>
                    <div className="champ-flag">{t.flag}</div>
                    <div className="champ-name">{t.name}</div>
                    <div className="champ-bar-wrap">
                      <div className="champ-bar-bg">
                        <motion.div
                          className="champ-bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${w}%` }}
                          transition={{ delay: i * 0.025 + 0.2, duration: 0.7, ease: 'easeOut' }}
                          style={{
                            background: i === 0
                              ? 'linear-gradient(90deg,var(--gold),#cc9200)'
                              : i < 3 ? 'linear-gradient(90deg,var(--accent),#a8cc2e)'
                              : i < 9 ? 'linear-gradient(90deg,var(--purple),#7c6fe0)'
                              : 'linear-gradient(90deg,#475569,#334155)',
                          }}
                        >
                          {t.probV2 >= 1 ? `${t.probV2.toFixed(2)}%` : ''}
                        </motion.div>
                      </div>
                    </div>
                    <div className="champ-pct">{t.probV2.toFixed(3)}%</div>
                    <div style={{ width: 55, textAlign: 'right', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}
                      className={delta > 0 ? 'comp-pos' : delta < 0 ? 'comp-neg' : ''}
                    >
                      {delta > 0 ? '+' : ''}{delta !== 0 ? delta.toFixed(2) : '±0'}
                    </div>
                    <div className="champ-ic">[{t.ic95Low.toFixed(2)}, {t.ic95High.toFixed(2)}]</div>
                  </motion.div>
                )
              })}
            </div>

            {showCount < CHAMP_PROBS.length && (
              <button
                onClick={() => setShowCount((c) => Math.min(c + 16, CHAMP_PROBS.length))}
                style={{
                  marginTop: 16, background: 'var(--bg-card)', border: '1px solid var(--border-strong)',
                  color: 'var(--text-secondary)', borderRadius: 8, padding: '10px 20px',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.83rem', width: '100%',
                }}
              >
                Mostrar más ({CHAMP_PROBS.length - showCount} restantes)
              </button>
            )}

            {/* Confederation summary */}
            <div className="sep" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Probabilidad acumulada por confederación</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {[
                { conf: 'UEFA',     pct: 52.6, color: 'var(--sky)',    icon: '🇪🇺' },
                { conf: 'CONMEBOL', pct: 28.1, color: 'var(--gold)',   icon: '🌎' },
                { conf: 'CAF',      pct: 11.2, color: 'var(--coral)',  icon: '🌍' },
                { conf: 'CONCACAF', pct:  4.8, color: 'var(--accent)', icon: '🌏' },
                { conf: 'AFC',      pct:  3.3, color: 'var(--purple)', icon: '🌏' },
                { conf: 'OFC',      pct:  0.0, color: 'var(--text-muted)', icon: '🌊' },
              ].map((c) => (
                <motion.div
                  key={c.conf}
                  className="card card-sm"
                  style={{ textAlign: 'center' }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{c.icon}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: c.color, marginBottom: 2 }}>{c.conf}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: c.color }}>{c.pct}%</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}
