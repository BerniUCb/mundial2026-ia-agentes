import { motion } from 'framer-motion'
import PageWrapper from '../components/PageWrapper'
import { PHASES } from '../data/data'

export default function Metodologia() {
  return (
    <PageWrapper>
      <div className="page">
        <div className="page-header">
          <div className="page-tag">🔬 Metodología</div>
          <h1 className="page-title">Como se construyo el sistema</h1>
          <p className="page-desc">
            Pipeline de 5 fases con agentes IA especializados. Cada agente recibe el output del anterior,
            aplica su lógica y genera artefactos estructurados (JSON / Markdown) para el siguiente nodo.
            Arquitectura: <strong style={{ color: 'var(--accent)' }}>Agentes en Cadena</strong>.
          </p>
        </div>

        {/* SIMULATION STATS — impacto */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ marginBottom: 36 }}
        >
          <div style={{ marginBottom: 10, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Escala del simulador
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>

            {/* TOTAL GRANDE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              style={{
                background: 'linear-gradient(135deg, rgba(200,241,53,0.12), rgba(200,241,53,0.04))',
                border: '1px solid rgba(200,241,53,0.35)',
                borderRadius: 14, padding: '20px 22px',
                gridColumn: 'span 2',
              }}
            >
              <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>
                Total de simulaciones (v1 + v2)
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.2rem', fontWeight: 900, lineHeight: 1, color: 'var(--accent)', letterSpacing: '0.02em' }}>
                10,300,000
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
                2 versiones × 50,000 torneos × 103 partidos por torneo<br/>
                <span style={{ color: 'var(--text-muted)' }}>72 de grupos + 31 de fase eliminatoria (promedio)</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="stat-card"
            >
              <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Por partido (grupos)</div>
              <div className="stat-value" style={{ fontSize: '2rem' }}>50,000</div>
              <div className="stat-label">simulaciones individuales<br/>cada partido jugado 50,000 veces</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="stat-card"
            >
              <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Torneos completos</div>
              <div className="stat-value" style={{ fontSize: '2rem' }}>100,000</div>
              <div className="stat-label">50,000 v1 + 50,000 v2<br/>seed=2026, reproducibles</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="stat-card"
            >
              <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Partidos por torneo</div>
              <div className="stat-value" style={{ fontSize: '2rem' }}>103</div>
              <div className="stat-label">72 grupos + 31 eliminatoria<br/>con penales reales por equipo</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="stat-card"
            >
              <div style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Convergencia</div>
              <div className="stat-value" style={{ fontSize: '2rem' }}>0.38%</div>
              <div className="stat-label">varianza máxima entre runs<br/>umbral de calidad: &lt; 0.5%</div>
            </motion.div>

          </div>
        </motion.div>

        {/* MODELO FORMULA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ marginBottom: 8, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Formula del modelo
          </div>
          <div className="formula-box" style={{ marginBottom: 32 }}>
            <div><span className="comment">// Probabilidad combinada ponderada</span></div>
            <div>P_combinada(A gana B) =</div>
            <div>  0.55 × P_elo(A) + 0.35 × P_historial(A) + 0.10 × P_forma(A)</div>
            <div style={{ marginTop: 8 }}><span className="comment">// Componente ELO — formula logistica</span></div>
            <div>P_elo(A) = 1 / (1 + 10 ^ ((ELO_B + adj_conf_B - ELO_A - adj_conf_A) / 400))</div>
            <div style={{ marginTop: 8 }}><span className="comment">// Ajustes de confederacion aplicados al ELO base</span></div>
            <div>UEFA +50 | CONMEBOL +35 | CONCACAF +20 | CAF +5 | AFC +5 | OFC -10</div>
          </div>
        </motion.div>

        {/* WEIGHT VISUALIZATION */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ marginBottom: 32 }}
        >
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16 }}>Distribución de pesos del modelo</h3>
          <div style={{ display: 'flex', gap: 0, height: 48, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '55%' }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              style={{ background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: '#000' }}
            >
              ELO 55%
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '35%' }}
              transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
              style={{ background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#000' }}
            >
              Historial 35%
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '10%' }}
              transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
              style={{ background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#000' }}
            >
              10%
            </motion.div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)', display: 'inline-block' }} /> ELO Rating — poder relativo del equipo</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--purple)', display: 'inline-block' }} /> Historial H2H 2018-2026 en torneos oficiales</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--gold)', display: 'inline-block' }} /> Forma reciente (ultimos 5 partidos)</span>
          </div>
        </motion.div>

        {/* PHASES TIMELINE */}
        <div style={{ marginBottom: 16, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Pipeline de desarrollo
        </div>
        <div className="timeline">
          {PHASES.map((phase, i) => (
            <motion.div
              key={phase.num}
              className="timeline-item"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <div className="timeline-dot">{phase.icon}</div>
              <div className="timeline-content">
                <div className="timeline-num">Fase {phase.num}</div>
                <div className="timeline-title">{phase.title}</div>
                <div className="timeline-desc">{phase.desc}</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Inputs</div>
                    {phase.inputs.map((inp) => (
                      <div key={inp} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '2px 0', display: 'flex', gap: 5 }}>
                        <span style={{ color: 'var(--purple)' }}>←</span> {inp}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Outputs</div>
                    {phase.outputs.map((out) => (
                      <div key={out} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '2px 0', display: 'flex', gap: 5 }}>
                        <span style={{ color: 'var(--accent)' }}>→</span> {out}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="timeline-tags">
                  {phase.tags.map((tag) => (
                    <span key={tag} className="tag tag-accent tag-mono">{tag}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* METHODOLOGY NOTES */}
        <div className="sep" />
        <div className="grid-2">
          <motion.div
            className="info-box"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h4>Por qué Monte Carlo?</h4>
            <p>El torneo tiene 104 partidos con resultados probabilísticos (no binarios). Monte Carlo
              permite estimar la distribución completa de resultados posibles al simular miles de
              torneos completos, capturando efectos de bracket, desempates y progresión de equipos
              que modelos analíticos no pueden calcular directamente.</p>
          </motion.div>
          <motion.div
            className="warn-box"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4>Limitaciones del modelo</h4>
            <p>El modelo no captura lesiones durante el torneo, estado de ánimo del equipo,
              condiciones meteorológicas, ni el efecto árbitro. Los pesos ELO/Historial/Forma
              son estimaciones calibradas, no optimizadas con backtest. Los resultados son
              probabilidades, no predicciones deterministas.</p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  )
}
