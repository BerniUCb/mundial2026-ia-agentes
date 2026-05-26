import { motion } from 'framer-motion'
import PageWrapper from '../components/PageWrapper'

const LIMITACIONES = [
  {
    num: '01',
    titulo: 'ELO Sintético, no ELO histórico real',
    nivel: 'Alta',
    color: 'var(--red)',
    desc: 'El ELO se calculó como función del ranking FIFA + ajuste por confederación, no como ELO acumulado de resultados históricos. El ranking FIFA pondera más los resultados recientes y puede no reflejar fortaleza histórica. Equipos con rachas positivas recientes pueden estar sobreestimados.',
    mitigacion: 'Se aplicaron 27 ajustes manuales basados en evidencia multidimensional (win rate, forma, penales, historial de competencias). El agente ELO Analyst identificó y corrigió los casos más críticos.',
  },
  {
    num: '02',
    titulo: 'Independencia entre partidos (sin correlaciones)',
    nivel: 'Alta',
    color: 'var(--red)',
    desc: 'El modelo asume que cada partido es estadísticamente independiente del anterior. En realidad, el rendimiento de un equipo en el torneo depende de lesiones, acumulación de tarjetas, fatiga y momentum psicológico — factores que correlacionan los resultados dentro del mismo torneo.',
    mitigacion: 'Limitación estructural del modelo. Aceptada para mantener tractabilidad matemática. Se documenta explícitamente.',
  },
  {
    num: '03',
    titulo: 'Historial 2018–2026 como proxy de calidad actual',
    nivel: 'Media',
    color: 'var(--coral)',
    desc: 'El win rate histórico de 8 años puede incluir periodos de reconstrucción o cambios de cuerpo técnico que ya no son relevantes. Por ejemplo, Belgium tenía alta win rate en 2018-2021 pero está en declive generacional desde 2022.',
    mitigacion: 'El componente de forma reciente (últimos 5 partidos, peso 10%) busca capturar el estado actual. Para los casos más críticos (Belgium, Croatia, Ecuador) se aplicaron ajustes ELO negativos con justificación documentada.',
  },
  {
    num: '04',
    titulo: 'Modelo Poisson independiente para marcadores',
    nivel: 'Media',
    color: 'var(--coral)',
    desc: 'Los marcadores se predicen asumiendo que los goles de cada equipo siguen distribuciones de Poisson independientes. Esta asunción ignora la correlación negativa entre goles (si un equipo marca, el otro ajusta su táctica) y subestima empates y partidos de alta intensidad.',
    mitigacion: 'Se usa solo para predicción puntual de marcadores, no para las probabilidades de clasificación. Las probabilidades del torneo se calculan directamente con el modelo ponderado, sin pasar por marcadores.',
  },
  {
    num: '05',
    titulo: 'Penales: solo 94 tandas registradas (2018–2026)',
    nivel: 'Media',
    color: 'var(--coral)',
    desc: 'El historial de penales es escaso: la mayoría de equipos tiene 0-3 tandas registradas. Para equipos con 0 registros se usa la media global (50%), lo que puede subestimar o sobreestimar ventajas reales. Argentina (4/4) es estadísticamente fiable; France (1/3) puede ser ruidoso.',
    mitigacion: 'Se documentan todos los equipos con historial de penales. Se aplica media global (50%) conservadoramente para equipos sin datos. En la defensa se puede señalar esto como área de mejora futura.',
  },
  {
    num: '06',
    titulo: 'Bracket de octavos no completamente determinístico',
    nivel: 'Baja',
    color: 'var(--gold)',
    desc: 'La selección de los 8 mejores terceros y su asignación al bracket sigue reglas FIFA 2026 complejas que dependen de qué grupos provienen. La simulación aproxima estas reglas pero simplifica casos extremos de múltiples terceros con los mismos puntos.',
    mitigacion: 'Para los 50,000 torneos simulados, los casos de desempate extremo representan una fracción menor. El impacto en las probabilidades de campeón es estadísticamente despreciable (< 0.1 pp).',
  },
  {
    num: '07',
    titulo: 'Ausencia de factores contextuales externos',
    nivel: 'Baja',
    color: 'var(--gold)',
    desc: 'El modelo no incorpora: lesiones (Mbappe, De Jong), suspensiones, condiciones climáticas por sede, hora del partido, o factores políticos. Estos pueden alterar resultados individuales pero tienen impacto promedio bajo en 50,000 simulaciones.',
    mitigacion: 'Limitación inherente a cualquier modelo estadístico previo al torneo. Los factores contextuales sí se reflejan parcialmente en la forma reciente (últimos 5 partidos).',
  },
]

const RESULTADOS_CLAVE = [
  { icon: '🇦🇷', titulo: 'Argentina — favorito claro en v2',           desc: '12.56% de probabilidad de campeonato. IC95 [12.27, 12.85] — no solapa con ningún rival. Separación de +3.23 pp sobre Spain. Penales 4/4 = 100%.' },
  { icon: '🇲🇦', titulo: 'Morocco — mayor sorpresa del modelo',         desc: '+87.9% de incremento relativo vs v1 (4.39% → 8.25%). Primer equipo africano semifinalista en Qatar 2022. Campeón AFCON 2026. ELO corregido +55.' },
  { icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', titulo: 'England — cayó del liderazgo v1',              desc: 'De 10.76% (líder v1) a 9.22% (v2). El ajuste -20 ELO captura 60 años sin título y patrón sistemático de eliminaciones en penales.' },
  { icon: '🇪🇺', titulo: 'UEFA + CONMEBOL dominan',                     desc: 'UEFA acumula 52.6% + CONMEBOL 28.1% = 95.4% de la probabilidad total. CAF sube a 11.2% en v2 (5.8% en v1) por correcciones Morocco, Senegal, Ivory Coast.' },
  { icon: '⚽', titulo: 'Grupo I — Grupo de la Muerte',                 desc: 'Suma ELO máxima del torneo (9,170). France 1° (44.6%), Senegal 2° (31.1%). Norway puede ser la gran sorpresa de octavos.' },
  { icon: '✓',  titulo: 'Convergencia confirmada a N=50,000',           desc: 'Δmax = 0.38% entre N=10,000 y N=50,000 < umbral 0.5%. IC95 para favoritos: ancho < 0.55 pp. 22.71 segundos de cómputo total.' },
]

export default function Limitaciones() {
  return (
    <PageWrapper>
      <div className="page">
        <div className="page-header">
          <div className="page-tag">⚠️ Resultados & Limitaciones</div>
          <h1 className="page-title">Qué predice el modelo y <span>dónde falla</span></h1>
          <p className="page-desc">
            Todo modelo estadístico tiene supuestos y limitaciones. Documentarlas explícitamente
            es parte del rigor científico — y demuestra comprensión profunda del sistema construido.
          </p>
        </div>

        {/* Resultados clave */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>Hallazgos principales del modelo</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, marginBottom: 36 }}>
          {RESULTADOS_CLAVE.map((r, i) => (
            <motion.div
              key={r.titulo}
              className="card"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              style={{ padding: '16px 18px' }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{r.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 6, color: 'var(--text-primary)' }}>{r.titulo}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{r.desc}</div>
            </motion.div>
          ))}
        </div>

        <div className="sep" />

        {/* Limitaciones */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>Limitaciones del sistema</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 24 }}>
          Clasificadas por nivel de impacto en las conclusiones finales.
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { nivel: 'Alta',  color: 'var(--red)',   desc: 'Puede afectar resultados sustancialmente' },
            { nivel: 'Media', color: 'var(--coral)', desc: 'Impacto acotado y documentado' },
            { nivel: 'Baja',  color: 'var(--gold)',  desc: 'Impacto despreciable en conclusiones' },
          ].map((n) => (
            <div key={n.nivel} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: n.color }} />
              <span style={{ color: n.color, fontWeight: 700 }}>{n.nivel}:</span>
              <span style={{ color: 'var(--text-muted)' }}>{n.desc}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {LIMITACIONES.map((lim, i) => (
            <motion.div
              key={lim.num}
              className="card"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: i * 0.06 }}
              style={{ padding: '18px 20px' }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: lim.color, minWidth: 32, opacity: 0.5 }}>{lim.num}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{lim.titulo}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: lim.color, background: `${lim.color}20`, padding: '2px 8px', borderRadius: 20, border: `1px solid ${lim.color}40` }}>
                      Impacto {lim.nivel}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>{lim.desc}</p>
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--green)' }}>↳ Mitigación: </strong>{lim.mitigacion}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="sep" />

        <div className="info-box">
          <h4>Conclusión metodológica</h4>
          <p>
            El modelo ELO-Historial-Combinado v2.0 es <strong style={{ color: 'var(--text-primary)' }}>estadísticamente robusto</strong> para
            identificar favoritos y tendencias generales, pero no puede predecir resultados individuales con alta certeza —
            ni ningún modelo puede hacerlo en un deporte con alta varianza como el fútbol.
            Su valor está en la <strong style={{ color: 'var(--text-primary)' }}>cuantificación de la incertidumbre</strong>:
            los intervalos de confianza, la distribución de probabilidades y el análisis de convergencia
            proporcionan un marco estadístico riguroso para tomar decisiones informadas.
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}
