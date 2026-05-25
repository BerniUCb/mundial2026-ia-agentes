import { motion } from 'framer-motion'
import PageWrapper from '../components/PageWrapper'
import { GROUPS } from '../data/data'

export default function Grupos() {
  return (
    <PageWrapper>
      <div className="page">
        <div className="page-header">
          <div className="page-tag">⚽ Fase de Grupos</div>
          <h1 className="page-title">Los 12 grupos del <span>Mundial 2026</span></h1>
          <p className="page-desc">
            48 equipos divididos en 12 grupos de 4. Clasifican los 2 primeros de cada grupo y
            los 8 mejores terceros = <strong style={{ color: 'var(--accent)' }}>32 equipos</strong> a la fase eliminatoria.
            Sede: USA 🇺🇸 · México 🇲🇽 · Canadá 🇨🇦
          </p>
        </div>

        {/* LEGEND */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
          {[
            { cls: 'badge-UEFA',     label: 'UEFA' },
            { cls: 'badge-CONMEBOL', label: 'CONMEBOL' },
            { cls: 'badge-CONCACAF', label: 'CONCACAF' },
            { cls: 'badge-CAF',      label: 'CAF (Africa)' },
            { cls: 'badge-AFC',      label: 'AFC (Asia)' },
            { cls: 'badge-OFC',      label: 'OFC (Oceania)' },
          ].map((b) => (
            <span key={b.cls} className={`badge ${b.cls}`}>{b.label}</span>
          ))}
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
            · FIFA #N = Ranking FIFA mayo 2026 · ELO = Rating ELO ajustado v2
          </span>
        </div>

        <div className="grid-auto">
          {GROUPS.map((g, gi) => (
            <motion.div
              key={g.letter}
              className="group-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: (gi % 4) * 0.08, duration: 0.4 }}
            >
              <div className="group-header">
                <div className="group-header-label">{g.name}</div>
                <div className="group-header-letter">{g.letter}</div>
              </div>
              <div>
                {g.teams.map((t, ti) => (
                  <div key={t.name} className="group-team-row">
                    <div style={{ fontSize: '1.3rem', flexShrink: 0 }}>{t.flag}</div>
                    <div className="group-team-info">
                      <div className="group-team-name">
                        {t.name}
                        {t.host && <span className="host-badge">SEDE</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span className={`badge badge-${t.confederation}`}>{t.confederation}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                          ELO {t.elo}
                        </span>
                      </div>
                    </div>
                    <span className="group-team-ranking">#{t.fifaRanking}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* STATS */}
        <div className="sep" />
        <div className="grid-4" style={{ gap: 14 }}>
          {[
            { val: '48', label: 'Equipos clasificados', icon: '⚽' },
            { val: '12', label: 'Grupos de 4 equipos', icon: '🏟️' },
            { val: '72', label: 'Partidos en fase de grupos', icon: '📋' },
            { val: '32', label: 'Clasifican a eliminatorias', icon: '🏆' },
          ].map((s) => (
            <motion.div
              key={s.label}
              className="stat-card"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.icon}</div>
              <div className="stat-value">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
