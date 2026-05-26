import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../components/PageWrapper'

// ── MODELOS DE PROBABILIDAD ───────────────────────────────────────────────────
const MODELOS = [
  {
    id: 'elo',
    nombre: 'Modelo ELO Logístico',
    icono: '📐',
    color: 'var(--accent)',
    formula: 'P_ELO(A gana B) = 1 / (1 + 10^(−ΔELO / 400))',
    que: 'Convierte la diferencia de puntos ELO entre dos equipos en una probabilidad de victoria. Usa una función logística (curva en S) que mapea cualquier diferencia al rango (0%, 100%).',
    por_que: 'Es el estándar internacional para fútbol adoptado por FIFA en 2018. Tiene base matemática sólida (Arpad Elo, 1960), es interpretable y captura la "superioridad objetiva" del equipo independientemente de resultados recientes.',
    cuando: 'Es el componente principal (peso 55%) porque el ELO captura la calidad estructural del equipo. Se usa también en eliminatorias para calcular probabilidades dinámicas partido a partido.',
    tabla: [
      { delta: '0',    p: '50.0%', interp: 'Equipos perfectamente parejos' },
      { delta: '+100', p: '64.0%', interp: 'Ventaja moderada' },
      { delta: '+200', p: '76.0%', interp: 'Favorito claro' },
      { delta: '+400', p: '90.9%', interp: 'Favorito muy fuerte' },
      { delta: '+600', p: '97.4%', interp: 'Dominio casi total → se normaliza a 90%' },
    ],
  },
  {
    id: 'historial',
    nombre: 'Modelo de Win Rate Histórico',
    icono: '📊',
    color: 'var(--purple)',
    formula: 'P_hist(A gana B) = WR_A / (WR_A + WR_B)  donde WR = V / (V+E+D)',
    que: 'Calcula la tasa de victorias real de cada equipo en partidos oficiales 2018–2026 y normaliza entre los dos equipos del partido. Refleja el rendimiento histórico documentado.',
    por_que: 'El ELO es sintético (calculado desde ranking). El historial usa resultados reales. Equipos como Morocco (71.4% win rate) o Iran (69.1%) muestran en datos lo que el ELO subestima por sesgo de confederación.',
    cuando: 'Peso 35% en modo estándar. Se reduce a 10% para equipos con menos de 50 partidos registrados (New Zealand 18, Uzbekistán 40, Curazao 46, Cabo Verde 48) porque con pocos datos el win rate es poco confiable.',
    tabla: [
      { delta: 'New Zealand', p: '88.9%', interp: '→ Peso reducido a 10% (solo 18 partidos vs rivales OFC débiles)' },
      { delta: 'Morocco',     p: '71.4%', interp: '→ Win rate real alto, justifica ajuste ELO +55' },
      { delta: 'Japan',       p: '69.4%', interp: '→ Eliminó a Alemania y España en Qatar 2022' },
      { delta: 'France',      p: '76.3%', interp: '→ Historial sólido, consistente con ELO alto' },
      { delta: 'Colombia',    p: '40.4%', interp: '→ Bajo para FIFA #13, justifica ajuste ELO −15' },
    ],
  },
  {
    id: 'forma',
    nombre: 'Modelo de Forma Reciente (Decaimiento Exponencial)',
    icono: '📈',
    color: 'var(--gold)',
    formula: 'P_forma(A) = Σ[s_k × 0.9^(5−k)] / 4.0951  (k=1..5, más reciente=k=5)',
    que: 'Pondera los últimos 5 partidos oficiales con decaimiento exponencial λ=0.9. El partido más reciente vale 1 punto, el anterior 0.9, luego 0.81, 0.729, 0.656. Victoria=1, Empate=0.5, Derrota=0.',
    por_que: 'Captura el momentum de corto plazo. Un equipo que ganó sus últimos 5 partidos está en mejor momento que uno con el mismo ELO histórico pero racha negativa. El decaimiento λ=0.9 evita que un partido antiguo pese igual que uno reciente.',
    cuando: 'Peso 10% — el más bajo — porque es la señal más ruidosa (solo 5 partidos). En modo datos escasos se elimina completamente (peso=0) para evitar amplificar ruido estadístico.',
    tabla: [
      { delta: 'England WWWWW',    p: '1.000', interp: '→ Forma máxima posible' },
      { delta: 'Argentina WWDWL',  p: '0.657', interp: '→ Forma alta pero no perfecta (derrota reciente)' },
      { delta: 'Ecuador DDDDW',    p: '0.432', interp: '→ Forma baja, 4 empates seguidos' },
      { delta: 'Croatia WDWDW',    p: '0.768', interp: '→ Intercalando empates y victorias' },
    ],
  },
  {
    id: 'combinado',
    nombre: 'Modelo Ponderado Combinado (Principal)',
    icono: '⚖️',
    color: 'var(--sky)',
    formula: 'P_comb = 0.55 × P_ELO + 0.35 × P_hist + 0.10 × P_forma',
    que: 'Combina linealmente los tres modelos anteriores con pesos fijos. Es el modelo que realmente se usa para simular cada partido. Los pesos suman siempre 1.0.',
    por_que: 'Ningún modelo solo es suficiente: ELO ignora el rendimiento real, el historial ignora la fuerza relativa, la forma es ruidosa. La combinación ponderada aprovecha las fortalezas de cada uno y mitiga sus debilidades. Los pesos 55/35/10 reflejan la estabilidad relativa de cada señal.',
    cuando: 'En TODOS los 72 partidos de grupos. En eliminatorias se usa solo P_ELO (más estable para duelos directos) dado que no hay matrices precomputadas para cruces desconocidos.',
    tabla: [
      { delta: 'Brazil vs Morocco', p: '54.1%', interp: 'ELO: 57.9% | Hist: 48.9% | Forma: 51.4% → Brazil ligero favorito' },
      { delta: 'France vs Iraq',    p: '90.0%*', interp: 'ELO: 97.4% → normalizado a 90% (ΔELO=590 > umbral 600)' },
      { delta: 'Mexico vs South Africa', p: '69.6%', interp: 'ELO: 72.3% | Hist: 71.1% | Forma: 65.8% → Mexico claro' },
    ],
  },
  {
    id: 'trinomial',
    nombre: 'Distribución Trinomial (Victoria/Empate/Derrota)',
    icono: '🎲',
    color: 'var(--coral)',
    formula: 'α = 0.25×(1−|p−0.5|×2)  →  P(A)=p(1−α), P(E)=α, P(B)=q(1−α)',
    que: 'Convierte la probabilidad combinada de victoria (P_comb, un número entre 0 y 1) en tres probabilidades: gana A, empate, gana B. El factor α representa la probabilidad de empate y varía según el equilibrio del partido.',
    por_que: 'El fútbol tiene 3 resultados posibles, no 2. Ignorar el empate subestimaría la cantidad de partidos trabados en fase de grupos. α=0.25 base corresponde a la media histórica de empates en torneos internacionales oficiales (fuente: dataset martj42 2018-2026).',
    cuando: 'Solo en fase de GRUPOS. En eliminatorias los empates se resuelven con penales → α_elim=0.18 y el empate no es resultado final sino transición a penales.',
    tabla: [
      { delta: 'p=0.50 (total equilibrio)',  p: 'α=0.25', interp: '37.5% / 25.0% / 37.5%' },
      { delta: 'p=0.65 (favorito moderado)', p: 'α=0.175', interp: '53.6% / 17.5% / 28.9%' },
      { delta: 'p=0.80 (favorito claro)',    p: 'α=0.10',  interp: '72.0% / 10.0% / 18.0%' },
      { delta: 'p=0.90 (dominio total)',     p: 'α=0.025', interp: '87.8% / 2.5% / 9.8%' },
    ],
  },
  {
    id: 'poisson',
    nombre: 'Distribución de Poisson (Marcadores)',
    icono: '⚽',
    color: 'var(--green)',
    formula: 'P(X=k) = e^(−λ) × λ^k / k!  con λ_A = 1.35 × (2×pA)',
    que: 'Modela el número de goles que marcará cada equipo como variable aleatoria de Poisson. Con λ_A goles esperados para el equipo A, calcula la probabilidad de que marque exactamente 0, 1, 2, 3... goles. El marcador más probable maximiza P(A=x)×P(B=y).',
    por_que: 'La distribución de Poisson es el estándar académico para modelar eventos discretos raros e independientes (como goles). Con media global 1.35 goles/equipo/partido (calculada del dataset), predice marcadores realistas sin sobreparametrizar.',
    cuando: 'SOLO para predecir marcadores exactos (ej: 1-0, 2-1). NO se usa para las probabilidades de campeonato — esas se calculan directamente con el modelo ponderado. Poisson es un módulo auxiliar del Agente 7.',
    tabla: [
      { delta: 'λ=0.67 (débil)',   p: 'P(0 goles)=51.3%', interp: 'P(1 gol)=34.4%, P(2 goles)=11.5%' },
      { delta: 'λ=1.02 (medio)',   p: 'P(0 goles)=36.1%', interp: 'P(1 gol)=36.8%, P(2 goles)=18.8%' },
      { delta: 'λ=1.35 (promedio)',p: 'P(0 goles)=25.9%', interp: 'P(1 gol)=35.0%, P(2 goles)=23.6%' },
      { delta: 'λ=1.72 (fuerte)',  p: 'P(0 goles)=17.9%', interp: 'P(1 gol)=30.8%, P(2 goles)=26.5%' },
    ],
  },
]

// ── GLOSARIO DE VALORES ───────────────────────────────────────────────────────
const TERMINOS = [
  { term: 'prob_pct', valor: '0 – 100', color: 'var(--accent)',
    simple: 'Porcentaje de veces que ese equipo ganó el torneo completo en 50,000 simulaciones.',
    tecnico: 'prob_pct = (victorias / N) × 100. Argentina: 6,279/50,000 × 100 = 12.558%.',
    ejemplo: '"prob_pct": 12.558 → Argentina ganó 6,279 de 50,000 torneos.' },
  { term: 'ic95 [low, high]', valor: '[%, %]', color: 'var(--purple)',
    simple: 'Margen de error del 95%. Rango donde está la probabilidad real con 95% de certeza.',
    tecnico: 'p̂ ± 1.96 × √(p̂(1−p̂)/N). Argentina: ±0.29pp → [12.268, 12.848].',
    ejemplo: '"ic95": [12.268, 12.848] → probabilidad real entre 12.27% y 12.85%.' },
  { term: 'pA / pE / pB', valor: 'Tres números que suman 1.0', color: 'var(--sky)',
    simple: 'Probabilidades del partido: gana A / empate / gana B. Siempre suman 100%.',
    tecnico: 'pA=p×(1−α), pE=α, pB=q×(1−α). Verificación: suma=1.0±0.0001.',
    ejemplo: '"pA":0.6962, "pE":0.1038, "pB":0.2000 → Mexico 69.6% / Empate 10.4% / S.Africa 20%.' },
  { term: 'suma', valor: '1.0 (o 1.0001 por redondeo)', color: 'var(--green)',
    simple: 'Verificación automática: confirma que las probabilidades del partido no tienen errores.',
    tecnico: 'Si suma > 1.0001 se normaliza: P_i = P_i / Σ(P). Hubo 1 caso en v2 (GB-003).',
    ejemplo: '"suma": 1.0001 → se normalizó dividiendo entre 1.0001 antes de simular.' },
  { term: 'lambda_A / lambda_B', valor: 'Goles esperados (Poisson)', color: 'var(--gold)',
    simple: 'Promedio de goles que se espera que haga cada equipo. λ=1.0 → lo más probable es 1 gol.',
    tecnico: 'λ_A = media_global(1.35) × (2×pA). Maximiza P(X=x)×P(Y=y) para predecir marcador.',
    ejemplo: '"lambda_A":1.016, "lambda_B":0.671 → marcador más probable: 1-0 (18.8%).' },
  { term: 'delta (ajuste ELO)', valor: 'Positivo o negativo', color: 'var(--coral)',
    simple: 'Cuántos puntos ELO se sumaron (+) o restaron (−) al equipo al corregir el modelo v1→v2.',
    tecnico: 'ELO_v2 = ELO_v1 + delta. Determinado por agente ELO-Analyst con 3 dimensiones de evidencia.',
    ejemplo: '"Morocco": {"v1":2435, "v2":2490, "delta":55} → subió 55 pts por sesgo CAF.' },
  { term: 'max_variacion (Δmax)', valor: '< 0.5% = convergencia', color: 'var(--red)',
    simple: 'Cuánto cambió la estimación del equipo más volátil entre el paso anterior y este. Cuando baja de 0.5%, el modelo es estable.',
    tecnico: 'Δmax = max_i |p̂_i(N) − p̂_i(N_prev)|. v1: 0.348% en N=50K ✓. v2: 0.38% en N=50K ✓.',
    ejemplo: '"max_variacion": 0.348 → Morocco varió 0.348pp. Como 0.348 < 0.5, hay convergencia.' },
  { term: 'consistente_con_modelo', valor: 'true / false', color: 'var(--text-muted)',
    simple: 'Verifica que el marcador predicho por Poisson coincide con el favorito del modelo de probabilidades.',
    tecnico: 'true si ganador_predicho == equipo con mayor pA o pB. Detecta contradicciones entre modelos.',
    ejemplo: '"consistente_con_modelo": true → Mexico gana 1-0 (Poisson) Y tiene pA=0.696 (favorito). ✓' },
]

type Tab = 'modelos' | 'glosario'

function TermCard({ t, i }: { t: typeof TERMINOS[0]; i: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      onClick={() => setOpen(!open)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        marginBottom: 8,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', gap: 12 }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: t.color, fontFamily: 'JetBrains Mono, monospace' }}>{t.term}</span>
          <span style={{ marginLeft: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.valor}</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </div>
      <div style={{ padding: '0 16px 12px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        {t.simple}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', background: 'rgba(0,0,0,0.25)' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Técnico</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 10, lineHeight: 1.6 }}>{t.tecnico}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Ejemplo</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.ejemplo}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ModelCard({ m, i }: { m: typeof MODELOS[0]; i: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06 }}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${m.color}40`,
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{ padding: '16px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}
        onClick={() => setOpen(!open)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '1.3rem' }}>{m.icono}</span>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: m.color }}>{m.nombre}</span>
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            background: 'rgba(0,0,0,0.3)',
            padding: '6px 10px',
            borderRadius: 6,
            borderLeft: `3px solid ${m.color}`,
          }}>
            {m.formula}
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0, marginTop: 4 }}>{open ? '▲' : '▼ ver'}</span>
      </div>

      {/* Resumen */}
      <div style={{ padding: '0 18px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {[
          { label: '¿Qué hace?', val: m.que, color: 'var(--sky)' },
          { label: '¿Por qué se usa?', val: m.por_que, color: m.color },
          { label: '¿Cuándo se aplica?', val: m.cuando, color: 'var(--gold)' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: s.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Tabla expandible */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: `1px solid ${m.color}30`, padding: '14px 18px', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: m.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Tabla de referencia con datos reales
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <tbody>
                    {m.tabla.map((row, ri) => (
                      <tr key={ri} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '7px 10px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{row.delta}</td>
                        <td style={{ padding: '7px 10px', fontWeight: 700, color: m.color, whiteSpace: 'nowrap' }}>{row.p}</td>
                        <td style={{ padding: '7px 10px', color: 'var(--text-secondary)' }}>{row.interp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Glosario() {
  const [tab, setTab] = useState<Tab>('modelos')

  return (
    <PageWrapper>
      <div className="page">
        <div className="page-header">
          <div className="page-tag">📖 Glosario</div>
          <h1 className="page-title">Modelos y <span>valores explicados</span></h1>
          <p className="page-desc">
            Qué modelo se usa, por qué se eligió, y qué significa cada valor del proyecto —
            explicado para cualquier persona, con fórmula y ejemplo real incluidos.
          </p>
        </div>

        <div className="tabs-bar">
          <button className={`tab-btn${tab === 'modelos' ? ' active' : ''}`} onClick={() => setTab('modelos')}>
            Modelos de probabilidad
          </button>
          <button className={`tab-btn${tab === 'glosario' ? ' active' : ''}`} onClick={() => setTab('glosario')}>
            Campos JSON y valores
          </button>
        </div>

        {tab === 'modelos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="info-box" style={{ marginBottom: 20 }}>
              <h4>6 modelos en el pipeline — de los datos al resultado</h4>
              <p>El sistema usa modelos distintos para distintas cosas. ELO para fuerza relativa,
                historial para rendimiento real, forma para momentum, el modelo combinado para la probabilidad
                del partido, la distribución trinomial para simular el resultado, y Poisson solo para predecir
                el marcador exacto. Expande cada modelo para ver la tabla de referencia.</p>
            </div>
            {MODELOS.map((m, i) => <ModelCard key={m.id} m={m} i={i} />)}
          </motion.div>
        )}

        {tab === 'glosario' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="warn-box" style={{ marginBottom: 20 }}>
              <h4>Campos que aparecen en los archivos JSON del proyecto</h4>
              <p>Cada JSON tiene sus propios campos. Aquí se explica qué representa cada uno,
                su rango de valores válidos y un ejemplo con datos reales del torneo.
                Haz clic en cualquier campo para ver la definición técnica.</p>
            </div>
            {TERMINOS.map((t, i) => <TermCard key={t.term} t={t} i={i} />)}
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}
