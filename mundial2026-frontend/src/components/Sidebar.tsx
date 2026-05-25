import { NavLink } from 'react-router-dom'

interface NavItem { path: string; label: string; icon: string }

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Proyecto',
    items: [
      { path: '/',            label: 'Inicio',           icon: '🏠' },
      { path: '/metodologia', label: 'Metodologia',      icon: '🔬' },
      { path: '/agentes',     label: 'Agentes IA',       icon: '🤖' },
      { path: '/fuentes',     label: 'Fuentes de Datos', icon: '📊' },
    ],
  },
  {
    title: 'Torneo',
    items: [
      { path: '/grupos',   label: 'Grupos A – L',      icon: '⚽' },
      { path: '/partidos', label: 'Partidos',          icon: '🏟️' },
      { path: '/matrices', label: 'Matrices de Prob.', icon: '📋' },
      { path: '/bracket',  label: 'Bracket / Resultados', icon: '🗂️' },
    ],
  },
  {
    title: 'Resultados',
    items: [
      { path: '/favoritos',   label: 'Favoritos',    icon: '🏆' },
      { path: '/comparativa', label: 'v1 vs v2',     icon: '⚡' },
      { path: '/elo',         label: 'Ajustes ELO',  icon: '📈' },
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
      {/* Header with toggle */}
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
        {sections.map((sec) => (
          <div key={sec.title}>
            {open && <div className="nav-section-label">{sec.title}</div>}
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
            <span style={{ color: 'var(--accent)' }}>6 Agentes</span> · Monte Carlo
          </div>
        </div>
      )}
    </aside>
  )
}
