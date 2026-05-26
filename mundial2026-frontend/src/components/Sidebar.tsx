import { NavLink } from 'react-router-dom'

interface NavItem { path: string; label: string; icon: string }

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: '1 · Proyecto',
    items: [
      { path: '/',             label: 'Inicio',           icon: '🏠' },
      { path: '/metodologia',  label: 'Metodología',      icon: '🔬' },
      { path: '/agentes',      label: 'Agentes IA',       icon: '🤖' },
      { path: '/fuentes',      label: 'Fuentes de Datos', icon: '📊' },
    ],
  },
  {
    title: '2 · Torneo',
    items: [
      { path: '/grupos',   label: 'Grupos A – L',         icon: '⚽' },
      { path: '/partidos', label: 'Partidos',             icon: '🏟️' },
      { path: '/matrices', label: 'Matrices de Prob.',    icon: '📋' },
      { path: '/bracket',  label: 'Bracket / Resultados', icon: '🗂️' },
    ],
  },
  {
    title: '3 · Resultados',
    items: [
      { path: '/favoritos',    label: 'Favoritos',            icon: '🏆' },
      { path: '/comparativa',  label: 'v1 vs v2',             icon: '⚡' },
      { path: '/elo',          label: 'Ajustes ELO',          icon: '📈' },
      { path: '/histograma',   label: 'Histogramas',          icon: '📊' },
      { path: '/limitaciones', label: 'Resultados & Límites', icon: '⚠️' },
      { path: '/glosario',     label: 'Glosario',             icon: '📖' },
    ],
  },
]

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  return (
    <aside className={`sidebar${open ? '' : ' sidebar-collapsed'}`}>
      {/* Header */}
      <div className="sidebar-logo">
        <button className="sidebar-toggle" onClick={onToggle} title={open ? 'Ocultar sidebar' : 'Mostrar sidebar'}>
          <span className="toggle-bar" /><span className="toggle-bar" /><span className="toggle-bar" />
        </button>
        {open && (
          <>
            <span className="sidebar-logo-icon">⚽</span>
            <h1>Mundial 2026<br />Simulacion IA</h1>
            <span>UCB · Inteligencia Artificial</span>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {sections.map((sec, secIdx) => (
          <div key={sec.title}>
            {open && <div className="nav-section-label" style={secIdx === 0 ? { borderTop: 'none', marginTop: 0, paddingTop: 10 } : {}}>{sec.title}</div>}
            {sec.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                title={!open ? item.label : undefined}
              >
                <span className="nav-item-icon">{item.icon}</span>
                {open && item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {open && (
        <div className="sidebar-footer">
          <div>N = <strong>50,000</strong> simulaciones</div>
          <div>Seed: <strong>2026</strong> · Modelo: <strong>v2.0</strong></div>
          <div>Convergencia: <strong>✓ 0.38%</strong></div>
          <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            <span style={{ color: 'var(--accent)' }}>7 Agentes</span> · Monte Carlo
          </div>
          <div style={{
            marginTop: 10,
            borderTop: '1px solid var(--border)',
            paddingTop: 10,
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}>
            <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 2 }}>
              Desarrollado por
            </div>
            <div style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Bernardo Rios Tapia
            </div>
            <div style={{ fontSize: '0.63rem', color: 'var(--text-muted)', marginTop: 2 }}>
              UCB · Inteligencia Artificial · 2026
            </div>
            <div style={{ marginTop: 8 }}>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.63rem',
                  display: 'block',
                  marginBottom: 3,
                }}
              >
                📁 Código fuente en GitHub
              </a>
            </div>
            <div style={{ marginTop: 4, fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.65rem' }}>
              "Los modelos no predicen el futuro —<br />cuantifican su incertidumbre."
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
