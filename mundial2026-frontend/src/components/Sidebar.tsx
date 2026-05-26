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
      { path: '/favoritos',    label: 'Favoritos',     icon: '🏆' },
      { path: '/comparativa',  label: 'v1 vs v2',      icon: '⚡' },
      { path: '/elo',          label: 'Ajustes ELO',   icon: '📈' },
      { path: '/histograma',   label: 'Histogramas',   icon: '📊' },
      { path: '/limitaciones', label: 'Limitaciones',  icon: '⚠️' },
      { path: '/glosario',     label: 'Glosario',      icon: '📖' },
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>50K</strong> sims · seed <strong>2026</strong></span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>v2.0</span>
          </div>
          <div style={{ marginTop: 6, color: '#6B85A0', fontSize: '0.67rem' }}>
            Bernardo Rios Tapia · UCB 2026
          </div>
        </div>
      )}
    </aside>
  )
}
