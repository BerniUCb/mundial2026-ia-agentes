import { motion } from 'framer-motion'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import PageWrapper from '../components/PageWrapper'
import { CHAMP_PROBS } from '../data/data'

const COMP_DATA = CHAMP_PROBS.filter((t) => t.probV1 > 0 || t.probV2 > 0.5)

function CompTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{d.flag} {d.name}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <div>v1: <strong style={{ color: 'var(--purple)' }}>{d.probV1.toFixed(3)}%</strong></div>
        <div>v2: <strong style={{ color: 'var(--accent)' }}>{d.probV2.toFixed(3)}%</strong></div>
        <div>Delta: <strong style={{ color: d.probV2 > d.probV1 ? 'var(--green)' : 'var(--red)' }}>
          {d.probV2 > d.probV1 ? '+' : ''}{(d.probV2 - d.probV1).toFixed(3)}pp
        </strong></div>
      </div>
    </div>
  )
}

export default function Comparativa() {
  const maxV2 = COMP_DATA[0].probV2

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-header">
          <div className="page-tag">⚡ Comparativa</div>
          <h1 className="page-title">Modelo <span>v1</span> vs <span>v2</span></h1>
          <p className="page-desc">
            Impacto de los 26 ajustes ELO sobre las probabilidades de campeonato — comparando
            <strong style={{ color: 'var(--purple)' }}> 5,150,000 simulaciones v1</strong> vs
            <strong style={{ color: 'var(--accent)' }}> 5,150,000 simulaciones v2</strong> (10,300,000 totales).
            Los deltas muestran la diferencia en puntos porcentuales entre versiones.
          </p>
        </div>

        {/* Key changes */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: 'Mayor subida',     val: '+3.86pp', name: '🇲🇦 Morocco',     sub: 'De 4.39% a 8.25%', color: 'var(--green)' },
            { label: 'Mayor bajada',     val: '-1.58pp', name: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',    sub: 'De 10.76% a 9.22%', color: 'var(--red)' },
            { label: 'Nuevo favorito',   val: '12.56%',  name: '🇦🇷 Argentina',   sub: 'IC95 no solapa rival', color: 'var(--gold)' },
            { label: 'Sims por versión',  val: '5,150,000', name: '10,300,000 total', sub: '50K torneos × 103 partidos', color: 'var(--accent)' },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              className="stat-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: k.color, marginBottom: 2 }}>{k.val}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{k.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{k.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Scatter: v1 vs v2 */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ marginBottom: 28 }}
        >
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>Dispersión v1 vs v2</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Puntos por encima de la diagonal roja = subieron en v2. Por debajo = bajaron.
            Cada punto representa 5,150,000 simulaciones por versión (10,300,000 totales).
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="probV1" name="v1" unit="%" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Modelo v1 (%)', position: 'insideBottom', offset: -12, fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis dataKey="probV2" name="v2" unit="%" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Modelo v2 (%)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip content={<CompTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 14, y: 14 }]} stroke="rgba(248,113,113,0.3)" strokeDasharray="4 4" />
              <Scatter data={COMP_DATA} fill="var(--accent)" fillOpacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Table comparison */}
        <div style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.78rem' }}>
            <div style={{ width: 24, height: 6, borderRadius: 2, background: 'var(--purple)', opacity: 0.7 }} />
            <span style={{ color: 'var(--purple)' }}>Modelo v1 (base)</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.78rem' }}>
            <div style={{ width: 24, height: 6, borderRadius: 2, background: 'var(--accent)' }} />
            <span style={{ color: 'var(--accent)' }}>Modelo v2 (corregido)</span>
          </div>
        </div>

        <div>
          <div style={{
            display: 'grid', gridTemplateColumns: '160px 1fr 72px 72px 72px',
            gap: 12, padding: '8px 0',
            borderBottom: '2px solid var(--border-strong)',
            marginBottom: 4,
          }}>
            {['Equipo', 'Barras v1 / v2', 'v1 %', 'v2 %', 'Δpp'].map((h) => (
              <div key={h} style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: h === 'Equipo' || h === 'Barras v1 / v2' ? 'left' : 'right' }}>
                {h}
              </div>
            ))}
          </div>

          {COMP_DATA.map((t, i) => {
            const delta = t.probV2 - t.probV1
            const w1 = (t.probV1 / maxV2) * 100
            const w2 = (t.probV2 / maxV2) * 100
            return (
              <motion.div
                key={t.name}
                className="comp-row"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <div className="comp-name">{t.flag} {t.name}</div>
                <div className="comp-bars">
                  <div className="comp-bar-v1" style={{ width: `${w1}%` }} />
                  <div className="comp-bar-v2" style={{ width: `${w2}%` }} />
                </div>
                <div className="comp-v1">{t.probV1.toFixed(2)}</div>
                <div className="comp-v2">{t.probV2.toFixed(3)}</div>
                <div className={`comp-delta ${delta > 0 ? 'comp-pos' : delta < 0 ? 'comp-neg' : ''}`}>
                  {delta > 0 ? '+' : ''}{delta.toFixed(2)}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Explanation */}
        <div className="sep" />
        <div className="grid-2">
          <div className="warn-box">
            <h4>Por qué cambio tanto Morocco?</h4>
            <p>Morocco tenía ELO 2435 con ajuste CAF (+5), penalizándolo 45 puntos vs equipos UEFA equivalentes.
              El agente ELO-Analyst identificó que Morocco es #8 FIFA, semifinalista Qatar 2022 (primer equipo africano),
              campeón AFCON enero 2026 y tiene win rate 71.4%. Se ajustó +55 puntos (2435 → 2490) con evidencia
              en 3 dimensiones. Resultado: de 4.39% a 8.25% (+87.9% relativo).</p>
          </div>
          <div className="warn-box">
            <h4>Por qué bajo England si tiene buena forma?</h4>
            <p>England tiene racha de 11 victorias consecutivas, excelente forma objetiva.
              El ajuste (-20 puntos, 2520 → 2500) captura el patrón histórico de 60 años sin título y
              eliminaciones sistemáticas en penales (1990, 1996, 1998, 2004, 2006, Euro 2021 final).
              Aunque el dataset 2018-2026 muestra 2/2 en penales, el historial de 60 años
              es evidencia de un riesgo sistémico no capturado por el ELO base.</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
