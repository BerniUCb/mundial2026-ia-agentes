import { motion } from 'framer-motion'
import PageWrapper from '../components/PageWrapper'

const EXCLUDED = [
  'Friendly (amistosos)', 'FIFA Series', 'CONCACAF Series',
  'Torneos Sub-20 / Sub-17', 'Torneos olímpicos',
  'CONIFA (no FIFA)', 'Island Games / Pacific Games',
  "King's Cup / Kirin Cup",
]

const INCLUDED_TOURNAMENTS = [
  { conf: 'FIFA', items: ['FIFA World Cup', 'FIFA World Cup qualification'] },
  { conf: 'UEFA', items: ['UEFA Euro', 'UEFA Euro qualification', 'UEFA Nations League'] },
  { conf: 'CONMEBOL', items: ['Copa America', 'Copa America qualification', 'CONMEBOL-UEFA Cup (Finalissima)'] },
  { conf: 'CONCACAF', items: ['Gold Cup', 'Gold Cup qualification', 'CONCACAF Nations League', 'CONCACAF Nations League qualification'] },
  { conf: 'CAF', items: ['African Cup of Nations', 'African Cup of Nations qualification', 'COSAFA Cup'] },
  { conf: 'AFC', items: ['AFC Asian Cup', 'AFC Asian Cup qualification', 'WAFF Championship', 'Gulf Cup', 'EAFF Championship', 'AFF Championship', 'CAFA Nations Cup'] },
  { conf: 'OFC', items: ['Oceania Nations Cup', 'Oceania Nations Cup qualification'] },
  { conf: 'OTRO', items: ['Arab Cup', 'Arab Cup qualification'] },
]

const LIMITATIONS = [
  { icon: '⚠️', title: 'Penales sin detalle', desc: 'El dataset indica el ganador de la tanda de penales, pero no el marcador tiro-a-tiro ni el ejecutor de cada penal.' },
  { icon: '⚠️', title: 'Tiempo extra no distinguido', desc: 'No se diferencia entre goles en tiempo regular vs tiempo adicional dentro del partido.' },
  { icon: '⚠️', title: 'New Zealand — 18 partidos', desc: 'Solo 18 partidos oficiales, casi todos contra rivales oceánicos irrelevantes (Islas Salomón, Tahití). Inflaba win rate al 88.89% de forma ficticia.' },
  { icon: '⚠️', title: 'Nombres de equipos', desc: 'Czechia = "Czech Republic", Turkiye = "Turkey", Curacao (con cedilla) en el dataset. Requirió mapeo manual.' },
]

export default function Fuentes() {
  return (
    <PageWrapper>
      <div className="page">
        <div className="page-header">
          <div className="page-tag">📊 Fuentes de Datos</div>
          <h1 className="page-title">De dónde vienen <span>los datos</span></h1>
          <p className="page-desc">
            El proyecto usa datos completamente reales y públicos. El dataset principal cubre
            49,330 partidos internacionales desde 1872. Se filtró para el período 2018–2026
            incluyendo únicamente torneos oficiales reconocidos por las confederaciones FIFA.
            Esos <strong style={{ color: 'var(--accent)' }}>2,540 partidos reales</strong> alimentaron el modelo que generó
            <strong style={{ color: 'var(--accent)' }}> 10,300,000 simulaciones Monte Carlo</strong> (50,000 torneos × 103 partidos × 2 versiones).
          </p>
        </div>

        {/* Main source */}
        <motion.div
          className="card card-accent"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 24, borderColor: 'rgba(200,241,53,0.25)' }}
        >
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>📦</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 4 }}>
                martj42 / international_results
              </h3>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'var(--accent)', marginBottom: 14 }}>
                github.com/martj42/international_results · Kaggle Dataset
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                {[
                  { label: 'Total de partidos', val: '49,330' },
                  { label: 'Período cubierto', val: '1872 – 2026' },
                  { label: 'Tandas de penales', val: '678' },
                  { label: 'Última actualización', val: 'Abril 2026' },
                  { label: 'Licencia', val: 'PDDL (Open Data)' },
                  { label: 'Mantenedor', val: 'Mart Jurisoo (@martj42)' },
                ].map((s) => (
                  <div key={s.label} style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.label}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)' }}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* After filtering */}
        <div className="grid-2" style={{ marginBottom: 28 }}>
          <motion.div className="card" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 14 }}>Resultado del filtrado 2018–2026</h3>
            {[
              { label: 'Partidos oficiales encontrados', val: '2,540', color: 'var(--accent)' },
              { label: 'Tandas de penales (48 equipos)', val: '94', color: 'var(--accent)' },
              { label: 'Equipos cubiertos', val: '48 / 48', color: 'var(--green)' },
              { label: 'Equipo con más partidos', val: 'France / England (84 c/u)', color: 'var(--text-primary)' },
              { label: 'Equipo con menos partidos', val: 'New Zealand (18)', color: 'var(--red)' },
              { label: 'Amistosos excluidos', val: '2,139', color: 'var(--text-muted)' },
              { label: 'Simulaciones generadas', val: '10,300,000', color: 'var(--accent)' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                <span style={{ fontWeight: 700, color: s.color }}>{s.val}</span>
              </div>
            ))}
          </motion.div>

          <motion.div className="card" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 14 }}>Fixture y Grupos Oficiales</h3>
            {[
              { label: 'Sorteo', val: '5 Dic 2025 — Kennedy Center, D.C.' },
              { label: 'Formato', val: '12 grupos de 4 (48 equipos)' },
              { label: 'Sedes', val: 'USA / México / Canadá (16 ciudades)' },
              { label: 'Partidos totales', val: '104 (72 grupos + 32 eliminatorias)' },
              { label: 'Fuente fixture', val: 'fifa.com / worldcupwiki.com' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem', gap: 12 }}>
                <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{s.label}</span>
                <span style={{ fontWeight: 600, textAlign: 'right', fontSize: '0.78rem' }}>{s.val}</span>
              </div>
            ))}

            <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Rankings FIFA: <span style={{ fontFamily: 'monospace' }}>fifa.com/rankings</span> — mayo 2026
            </div>
          </motion.div>
        </div>

        {/* Included tournaments */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 28 }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Torneos oficiales incluidos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
            {INCLUDED_TOURNAMENTS.map((t) => (
              <div key={t.conf} className="card card-sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span className={`badge badge-${t.conf === 'OTRO' ? 'OFC' : t.conf === 'FIFA' ? 'CONCACAF' : t.conf}`}>
                    {t.conf}
                  </span>
                </div>
                {t.items.map((item) => (
                  <div key={item} style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', padding: '2px 0', display: 'flex', gap: 5 }}>
                    <span style={{ color: 'var(--accent)', fontSize: '0.68rem' }}>✓</span> {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Excluded */}
        <motion.div
          className="danger-box"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginBottom: 28 }}
        >
          <h4>Torneos EXCLUIDOS del análisis</h4>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {EXCLUDED.map((e) => (
              <span key={e} className="tag tag-red">{e}</span>
            ))}
          </div>
          <p style={{ marginTop: 10 }}>
            Solo se incluyen competencias donde los equipos compiten con plantillas completas y
            el resultado tiene implicaciones clasificatorias o de prestigio continental/mundial.
          </p>
        </motion.div>

        {/* Limitations */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Limitaciones conocidas del dataset</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {LIMITATIONS.map((l, i) => (
              <motion.div
                key={l.title}
                className="card card-sm"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{l.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 5 }}>{l.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{l.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Alternative datasets */}
        <div className="sep" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Datasets alternativos evaluados (no utilizados)</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Dataset</th>
                  <th>Razón de no uso</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'patateriedata/all-international-football-results (Kaggle)', reason: 'Última actualización Oct 2025 — menos reciente que martj42' },
                  { name: 'jfjelstul/worldcup (GitHub)', reason: 'Solo World Cup, no cubre otros torneos oficiales de confederación' },
                  { name: 'schochastics/football-data (GitHub)', reason: 'Incluye ligas domésticas, más complejo sin ventaja clara' },
                  { name: 'pablollanderos33/world-cup-penalty-shootouts (Kaggle)', reason: 'Solo penales de World Cup, no otros torneos' },
                  { name: 'luigibizarro/world-cup-penalty-shootouts-1982-2022', reason: 'Solo hasta 2022, solo World Cup' },
                ].map((d) => (
                  <tr key={d.name}>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}>{d.name}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
