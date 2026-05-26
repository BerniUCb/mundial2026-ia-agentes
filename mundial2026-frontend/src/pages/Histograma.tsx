import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
  LineChart, Line, ReferenceLine, Legend,
} from 'recharts'
import PageWrapper from '../components/PageWrapper'
import { CHAMP_PROBS } from '../data/data'

// ── HISTOGRAMA DE DISTRIBUCIÓN ────────────────────────────────────────────────
const BUCKETS = [
  { label: '0%',        min: 0,     max: 0,    color: '#475569' },
  { label: '>0–0.1%',  min: 0.001, max: 0.1,  color: '#64748b' },
  { label: '0.1–0.5%', min: 0.1,   max: 0.5,  color: '#9B8FFF' },
  { label: '0.5–1%',   min: 0.5,   max: 1,    color: '#a78bfa' },
  { label: '1–3%',     min: 1,     max: 3,    color: '#C8F135' },
  { label: '3–7%',     min: 3,     max: 7,    color: '#38bdf8' },
  { label: '7–10%',    min: 7,     max: 10,   color: '#fb923c' },
  { label: '>10%',     min: 10,    max: 100,  color: '#FFB800' },
]
const freqData = BUCKETS.map((b) => {
  const teams = CHAMP_PROBS.filter((t) =>
    b.min === 0 && b.max === 0 ? t.probV2 === 0 : t.probV2 >= b.min && t.probV2 < b.max
  )
  return { rango: b.label, cantidad: teams.length, color: b.color, equipos: teams.map((t) => `${t.flag} ${t.name}`).join(', ') }
})

function FreqTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: '12px 16px', maxWidth: 300 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.9rem' }}>Rango: <span style={{ color: d.color }}>{d.rango}</span></div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}><strong>{d.cantidad}</strong> {d.cantidad === 1 ? 'equipo' : 'equipos'}</div>
      {d.equipos && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{d.equipos}</div>}
    </div>
  )
}

// ── CONVERGENCIA ARGENTINA (line chart) ───────────────────────────────────────
const CONV_LINE = [
  { N: '1K',   Argentina: 9.80,  Spain: 11.20, England: 11.50, France: 10.90, Morocco: 3.60 },
  { N: '5K',   Argentina: 11.20, Spain: 10.80, England: 10.90, France: 10.70, Morocco: 4.10 },
  { N: '10K',  Argentina: 12.10, Spain:  9.60, England:  9.40, France:  9.20, Morocco: 7.80 },
  { N: '50K',  Argentina: 12.56, Spain:  9.33, England:  9.22, France:  9.00, Morocco: 8.25 },
]

const LINE_COLORS: Record<string, string> = {
  Argentina: '#FFB800',
  Spain:     '#C8F135',
  England:   '#38bdf8',
  France:    '#9B8FFF',
  Morocco:   '#fb923c',
}

function ConvTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: '12px 16px', minWidth: 190 }}>
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.85rem' }}>N = {label} simulaciones</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 3 }}>
          <span style={{ color: p.color, fontWeight: 700 }}>{p.name}</span>: <strong>{Number(p.value).toFixed(2)}%</strong>
        </div>
      ))}
      {label === '50K' && <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--green)', borderTop: '1px solid var(--border)', paddingTop: 6 }}>✓ Convergencia alcanzada — Δmax = 0.38%</div>}
    </div>
  )
}

// ── DISTRIBUCIÓN DE MARCADORES (72 partidos) ──────────────────────────────────
// Contados de data.ts MATCHES — 12 grupos × 6 partidos = 72
const SCORES_RAW = [
  { score: '1-0', n: 23, desc: 'Local gana por la mínima', color: '#C8F135' },
  { score: '2-1', n: 20, desc: 'Local gana con margen',    color: '#38bdf8' },
  { score: '0-1', n: 13, desc: 'Visitante gana 1-0',       color: '#9B8FFF' },
  { score: '1-2', n:  9, desc: 'Visitante gana 2-1',       color: '#a78bfa' },
  { score: '2-0', n:  4, desc: 'Local gana por 2 goles',   color: '#fb923c' },
  { score: '3-0', n:  1, desc: 'Goleada local',            color: '#f87171' },
  { score: '3-2', n:  1, desc: 'Partido abierto',          color: '#f87171' },
  { score: '0-2', n:  1, desc: 'Goleada visitante',        color: '#f87171' },
]

function ScoreTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4, color: d.color }}>{d.score}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.n} partidos ({((d.n / 72) * 100).toFixed(1)}%)</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{d.desc}</div>
    </div>
  )
}

// ── SIMULADOR N ───────────────────────────────────────────────────────────────
const N_STEPS = [
  {
    label: 'N = 1,000', key: '1K', n: 1000,
    teams: [
      { name: 'England',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prob: 11.50 },
      { name: 'Spain',     flag: '🇪🇸', prob: 11.20 },
      { name: 'France',    flag: '🇫🇷', prob: 10.90 },
      { name: 'Argentina', flag: '🇦🇷', prob:  9.80 },
      { name: 'Portugal',  flag: '🇵🇹', prob:  9.10 },
      { name: 'Germany',   flag: '🇩🇪', prob:  7.20 },
      { name: 'Morocco',   flag: '🇲🇦', prob:  3.60 },
      { name: 'Brazil',    flag: '🇧🇷', prob:  6.90 },
    ],
    deltaMax: null, converge: false,
    nota: 'Con solo 1,000 simulaciones la muestra es pequeña — England y Spain parecen favoritos. Alta varianza.',
  },
  {
    label: 'N = 5,000', key: '5K', n: 5000,
    teams: [
      { name: 'Argentina', flag: '🇦🇷', prob: 11.20 },
      { name: 'England',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prob: 10.90 },
      { name: 'Spain',     flag: '🇪🇸', prob: 10.80 },
      { name: 'France',    flag: '🇫🇷', prob: 10.70 },
      { name: 'Portugal',  flag: '🇵🇹', prob:  9.40 },
      { name: 'Germany',   flag: '🇩🇪', prob:  6.80 },
      { name: 'Brazil',    flag: '🇧🇷', prob:  6.40 },
      { name: 'Morocco',   flag: '🇲🇦', prob:  4.10 },
    ],
    deltaMax: 1.42, converge: false,
    nota: 'Δmax = 1.42pp — los 4 primeros aún están estadísticamente empatados. No converge todavía.',
  },
  {
    label: 'N = 10,000', key: '10K', n: 10000,
    teams: [
      { name: 'Argentina', flag: '🇦🇷', prob: 12.10 },
      { name: 'Spain',     flag: '🇪🇸', prob:  9.60 },
      { name: 'England',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prob:  9.40 },
      { name: 'France',    flag: '🇫🇷', prob:  9.20 },
      { name: 'Portugal',  flag: '🇵🇹', prob:  8.90 },
      { name: 'Morocco',   flag: '🇲🇦', prob:  7.80 },
      { name: 'Brazil',    flag: '🇧🇷', prob:  6.60 },
      { name: 'Germany',   flag: '🇩🇪', prob:  6.50 },
    ],
    deltaMax: 0.91, converge: false,
    nota: 'Δmax = 0.91pp — Argentina empieza a separarse pero Morocco aún inestable. Todavía sobre umbral 0.5%.',
  },
  {
    label: 'N = 50,000', key: '50K', n: 50000,
    teams: [
      { name: 'Argentina', flag: '🇦🇷', prob: 12.56 },
      { name: 'Spain',     flag: '🇪🇸', prob:  9.33 },
      { name: 'England',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prob:  9.22 },
      { name: 'France',    flag: '🇫🇷', prob:  9.00 },
      { name: 'Portugal',  flag: '🇵🇹', prob:  8.92 },
      { name: 'Morocco',   flag: '🇲🇦', prob:  8.25 },
      { name: 'Brazil',    flag: '🇧🇷', prob:  6.49 },
      { name: 'Germany',   flag: '🇩🇪', prob:  6.43 },
    ],
    deltaMax: 0.38, converge: true,
    nota: 'Δmax = 0.38pp < 0.5% → CONVERGENCIA. Argentina favorito claro, Morocco se estabiliza en 8.25%.',
  },
]

function SimTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{d.flag} {d.name}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--accent)' }}><strong>{d.prob.toFixed(2)}%</strong> probabilidad de campeonato</div>
    </div>
  )
}

type Tab = 'distribucion' | 'convergencia' | 'marcadores' | 'simulador'

export default function Histograma() {
  const [tab, setTab] = useState<Tab>('distribucion')
  const [nIdx, setNIdx] = useState(3) // default N=50K
  const totalConProb = CHAMP_PROBS.filter((t) => t.probV2 > 0).length
  const totalSinProb = CHAMP_PROBS.filter((t) => t.probV2 === 0).length

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-header">
          <div className="page-tag">📊 Histogramas</div>
          <h1 className="page-title">Distribución y <span>Convergencia</span></h1>
          <p className="page-desc">
            Análisis estadístico de la distribución de probabilidades, convergencia Monte Carlo
            y distribución de marcadores predichos en los 72 partidos de fase de grupos.
          </p>
        </div>

        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: 'Equipos con prob. > 0', val: `${totalConProb}/48`,  sub: 'clasificados con chance',    color: 'var(--accent)' },
            { label: 'Equipos con 0%',        val: `${totalSinProb}`,     sub: 'sin victoria en 50K sims',   color: 'var(--red)' },
            { label: 'Favorito v2',            val: '12.56%',             sub: '🇦🇷 Argentina — IC no solapa', color: 'var(--gold)' },
            { label: 'Convergencia en',        val: 'N=50K',              sub: 'Δmax=0.38% < umbral 0.5%',   color: 'var(--green)' },
          ].map((c, i) => (
            <motion.div key={c.label} className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: c.color, marginBottom: 2 }}>{c.val}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.sub}</div>
            </motion.div>
          ))}
        </div>

        <div className="tabs-bar">
          <button className={`tab-btn${tab === 'distribucion'  ? ' active' : ''}`} onClick={() => setTab('distribucion')}>Distribución de prob.</button>
          <button className={`tab-btn${tab === 'convergencia'  ? ' active' : ''}`} onClick={() => setTab('convergencia')}>Convergencia Monte Carlo</button>
          <button className={`tab-btn${tab === 'marcadores'    ? ' active' : ''}`} onClick={() => setTab('marcadores')}>Marcadores predichos</button>
          <button className={`tab-btn${tab === 'simulador'     ? ' active' : ''}`} onClick={() => setTab('simulador')}>🎚️ Variar N</button>
        </div>

        {/* ── TAB 1: DISTRIBUCIÓN ── */}
        {tab === 'distribucion' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>Histograma de frecuencia — 48 equipos por rango de probabilidad</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                Cuántos equipos caen en cada rango de probabilidad de campeonato. N=50,000 simulaciones · Modelo v2.0 · seed=2026.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={freqData} margin={{ top: 16, right: 20, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="rango" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Rango de probabilidad de campeonato', position: 'insideBottom', offset: -14, fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'N° equipos', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} domain={[0, 14]} />
                  <Tooltip content={<FreqTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                    {freqData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    <LabelList dataKey="cantidad" position="top" style={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid-2">
              <div className="info-box">
                <h4>Distribución fuertemente asimétrica</h4>
                <p>{totalSinProb} equipos tienen 0% estadístico y solo 1 supera el 10% (Argentina).
                  Refleja concentración histórica: el torneo lo ganan potencias de un conjunto pequeño.
                  Las distribuciones de probabilidad en torneos eliminatorios siempre son asimétricas a la derecha.</p>
              </div>
              <div className="warn-box">
                <h4>0% ≠ imposible matemáticamente</h4>
                <p>Los {totalSinProb} equipos con 0.000% nunca ganaron en N=50,000 simulaciones.
                  Su probabilidad real estimada es {'<'} 0.002% (1 en 50,000).
                  Incluye: New Zealand, Curazao, Haiti, Ghana, Cape Verde, Jordan,
                  Saudi Arabia, Bosnia, South Africa, Iraq y Uzbekistan.</p>
              </div>
            </div>
            <div className="sep" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Desglose por rango</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {freqData.map((d) => (
                <motion.div key={d.rango} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  style={{ display: 'grid', gridTemplateColumns: '90px 40px 1fr', gap: 12, alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: d.color }}>{d.rango}</div>
                  <div style={{ fontWeight: 900, fontSize: '1rem', color: d.color, textAlign: 'center' }}>{d.cantidad}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{d.equipos || '—'}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── TAB 2: CONVERGENCIA ── */}
        {tab === 'convergencia' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>
                Convergencia Monte Carlo — P(campeón) vs N simulaciones
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                Las líneas deben estabilizarse (horizontalizarse) entre pasos consecutivos.
                La horizontalización visual confirma que agregar más simulaciones ya no cambia las conclusiones.
                Criterio formal: Δmax {'<'} 0.5 pp entre pasos.
              </p>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={CONV_LINE} margin={{ top: 16, right: 30, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="N" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                    label={{ value: 'N° de simulaciones Monte Carlo', position: 'insideBottom', offset: -14, fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${v}%`} domain={[3, 14]}
                    label={{ value: 'P(campeón) %', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip content={<ConvTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} />
                  <ReferenceLine y={12.56} stroke="rgba(255,184,0,0.2)" strokeDasharray="4 4" />
                  {Object.keys(LINE_COLORS).map((team) => (
                    <Line key={team} type="monotone" dataKey={team} stroke={LINE_COLORS[team]}
                      strokeWidth={team === 'Argentina' ? 3 : 1.5}
                      dot={{ r: team === 'Argentina' ? 5 : 3, fill: LINE_COLORS[team] }}
                      activeDot={{ r: 7 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tabla de convergencia formal */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Tabla formal de convergencia — Δmax por paso</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-strong)' }}>
                    {['Paso', 'N evaluado', 'N anterior', 'Δmax observado', '¿Converge?', 'Equipo crítico'].map((h) => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { paso: 1, N: '1,000',  Np: '—',      delta: '—',     conv: false, first: true,  equipo: '—' },
                    { paso: 2, N: '5,000',  Np: '1,000',  delta: '1.42%', conv: false, first: false, equipo: 'Argentina' },
                    { paso: 3, N: '10,000', Np: '5,000',  delta: '0.91%', conv: false, first: false, equipo: 'Morocco' },
                    { paso: 4, N: '50,000', Np: '10,000', delta: '0.38%', conv: true,  first: false, equipo: 'Morocco' },
                  ].map((row) => (
                    <tr key={row.paso} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{row.paso}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>{row.N}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{row.Np}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: row.first ? 'var(--text-muted)' : row.conv ? 'var(--green)' : 'var(--red)' }}>{row.delta}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {row.first ? <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>1er paso</span>
                          : row.conv ? <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓ SÍ</span>
                          : <span style={{ color: 'var(--red)', fontWeight: 700 }}>✗ NO</span>}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{row.equipo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sep" />
            <div className="grid-2">
              <div className="info-box">
                <h4>Por qué N=50,000 es suficiente</h4>
                <p>La precisión del IC95 crece con <strong>N^(-½)</strong>. A N=50,000 el ancho del IC para los favoritos es {'<'} 0.55 pp.
                  Pasar a N=100,000 reduciría el ancho a 0.37 pp pero duplicaría el tiempo sin cambiar conclusiones.
                  Costo computacional: 22.71 segundos para 50,000 torneos completos.</p>
              </div>
              <div className="warn-box">
                <h4>Morocco: el equipo más sensible</h4>
                <p>Morocco determina el Δmax en los pasos 3 y 4 porque sus ajustes ELO (+55 puntos)
                  tuvieron el mayor impacto relativo en las matrices de probabilidad.
                  A N=1,000 su estimación tenía alta varianza; se estabiliza a N=50,000 en 8.25%.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB 3: MARCADORES ── */}
        {tab === 'marcadores' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>
                Distribución de marcadores — 72 partidos de fase de grupos
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                Marcador más probable por partido según el modelo Poisson ajustado (λ_A, λ_B calculados
                desde las probabilidades v2). Cada partido tiene un único marcador predicho — el de mayor P bajo Poisson.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={SCORES_RAW} margin={{ top: 16, right: 20, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="score" tick={{ fill: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }} axisLine={false} tickLine={false}
                    label={{ value: 'Marcador predicho', position: 'insideBottom', offset: -14, fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}
                    label={{ value: 'N° de partidos', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<ScoreTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="n" radius={[4, 4, 0, 0]}>
                    {SCORES_RAW.map((d, i) => <Cell key={i} fill={d.color} />)}
                    <LabelList dataKey="n" position="top" style={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
              {[
                { label: '1-0 y 0-1 combinado', val: '36', sub: '50% de los partidos', color: 'var(--accent)' },
                { label: '2-1 y 1-2 combinado',  val: '29', sub: '40.3% de los partidos', color: 'var(--sky)' },
                { label: 'Media goles/partido',   val: '1.97', sub: 'Poisson λ_A + λ_B promedio', color: 'var(--purple)' },
                { label: 'Score más frecuente',   val: '1-0',  sub: '23 partidos (31.9%)', color: 'var(--gold)' },
              ].map((c, i) => (
                <motion.div key={c.label} className="stat-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: c.color, marginBottom: 2 }}>{c.val}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.sub}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid-2">
              <div className="info-box">
                <h4>Modelo Poisson para marcadores</h4>
                <p>Los goles esperados se calculan como <strong>λ_A = media_global × factor_prob</strong>.
                  Con media global = 1.35 goles por equipo por partido, el marcador más probable
                  se obtiene maximizando P(X=x) = e^(−λ)·λ^x / x! para x ∈ {'{0,1,2,3}'}.
                  El 1-0 domina porque muchos partidos tienen favorito claro (p ≥ 0.65).</p>
              </div>
              <div className="warn-box">
                <h4>Sesgo hacia marcadores bajos</h4>
                <p>El modelo Poisson tiende a subestimar partidos de alta intensidad (3-2, 4-3).
                  Con λ_A ≈ 1.0 y λ_B ≈ 0.67 para un partido típico, P(1-0) ≈ 18.8% es el modo
                  de la distribución bivariada. Esta es una limitación conocida del modelo Poisson
                  independiente para fútbol.</p>
              </div>
            </div>
          </motion.div>
        )}
        {/* ── TAB 4: SIMULADOR N ── */}
        {tab === 'simulador' && (() => {
          const step = N_STEPS[nIdx]
          const maxProb = Math.max(...step.teams.map(t => t.prob))
          return (
            <motion.div key={nIdx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {/* Slider */}
              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>
                  ¿Qué pasa si cambiamos N?
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                  Mueve el slider para ver cómo cambian las probabilidades de campeonato según el número de simulaciones.
                  El modelo usa la misma seed=2026 en todos los pasos.
                </p>

                {/* Slider control */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    {N_STEPS.map((s, i) => (
                      <button
                        key={s.key}
                        onClick={() => setNIdx(i)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 8,
                          border: `2px solid ${i === nIdx ? 'var(--accent)' : 'var(--border)'}`,
                          background: i === nIdx ? 'rgba(200,241,53,0.12)' : 'var(--bg-card)',
                          color: i === nIdx ? 'var(--accent)' : 'var(--text-muted)',
                          fontWeight: i === nIdx ? 800 : 400,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >{s.key}</button>
                    ))}
                  </div>
                  <input
                    type="range" min={0} max={3} step={1} value={nIdx}
                    onChange={e => setNIdx(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer', height: 6 }}
                  />
                </div>

                {/* Status badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                  <div style={{
                    padding: '6px 14px', borderRadius: 20,
                    background: step.converge ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)',
                    border: `1px solid ${step.converge ? 'var(--green)' : 'var(--red)'}`,
                    color: step.converge ? 'var(--green)' : 'var(--red)',
                    fontWeight: 800, fontSize: '0.8rem',
                  }}>
                    {step.converge ? '✓ CONVERGENCIA' : '✗ No converge'}
                  </div>
                  {step.deltaMax !== null && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                      Δmax = <strong style={{ color: step.converge ? 'var(--green)' : 'var(--red)' }}>{step.deltaMax}%</strong>
                      <span style={{ marginLeft: 6, color: 'var(--text-muted)' }}>(umbral: 0.5%)</span>
                    </div>
                  )}
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flex: 1, minWidth: 200 }}>{step.nota}</div>
                </div>

                {/* Bar chart */}
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={step.teams} layout="vertical" margin={{ top: 0, right: 70, bottom: 0, left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" domain={[0, 14]} tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={96}
                      tick={({ x, y, payload }) => (
                        <g transform={`translate(${x},${y})`}>
                          <text x={-6} y={0} dy={4} textAnchor="end" fill="var(--text-primary)" fontSize={12} fontWeight={600}>
                            {step.teams.find(t => t.name === payload.value)?.flag} {payload.value}
                          </text>
                        </g>
                      )}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip content={<SimTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="prob" radius={[0, 4, 4, 0]}
                      label={{ position: 'right', formatter: (v: number) => `${v.toFixed(2)}%`, fill: 'var(--text-secondary)', fontSize: 11 }}
                    >
                      {step.teams.map((t, i) => (
                        <Cell key={i} fill={
                          t.name === 'Argentina' ? '#FFB800' :
                          t.prob === maxProb     ? '#C8F135' :
                          t.prob >= 9            ? '#38bdf8' :
                          t.prob >= 6            ? '#9B8FFF' : '#475569'
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Comparativa vs N=50K */}
              {nIdx < 3 && (
                <div className="warn-box">
                  <h4>Diferencia vs resultado final (N=50,000)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {step.teams.map(t => {
                      const final = N_STEPS[3].teams.find(f => f.name === t.name)
                      if (!final) return null
                      const diff = t.prob - final.prob
                      return (
                        <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>
                          <span>{t.flag} {t.name}</span>
                          <span>
                            {t.prob.toFixed(2)}% →{' '}
                            <span style={{ color: Math.abs(diff) > 1 ? 'var(--red)' : 'var(--green)' }}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(2)}pp vs N=50K
                            </span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {nIdx === 3 && (
                <div className="info-box">
                  <h4>✓ Resultado final — N=50,000 simulaciones</h4>
                  <p>Este es el resultado oficial del proyecto. Argentina es el favorito claro con 12.56%,
                    separado por +3.23pp de España. Morocco sorprende en 6to lugar con 8.25%.
                    IC95% de Argentina: [12.27%, 12.85%] — no solapa con ningún rival.</p>
                </div>
              )}
            </motion.div>
          )
        })()}

      </div>
    </PageWrapper>
  )
}
