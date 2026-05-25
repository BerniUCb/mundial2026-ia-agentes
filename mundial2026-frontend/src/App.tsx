import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Metodologia from './pages/Metodologia'
import Agentes from './pages/Agentes'
import Fuentes from './pages/Fuentes'
import Grupos from './pages/Grupos'
import Partidos from './pages/Partidos'
import Matrices from './pages/Matrices'
import Favoritos from './pages/Favoritos'
import Comparativa from './pages/Comparativa'
import ELOAjustes from './pages/ELOAjustes'
import Bracket from './pages/Bracket'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"            element={<Home />} />
        <Route path="/metodologia" element={<Metodologia />} />
        <Route path="/agentes"     element={<Agentes />} />
        <Route path="/fuentes"     element={<Fuentes />} />
        <Route path="/grupos"      element={<Grupos />} />
        <Route path="/partidos"    element={<Partidos />} />
        <Route path="/matrices"    element={<Matrices />} />
        <Route path="/bracket"     element={<Bracket />} />
        <Route path="/favoritos"   element={<Favoritos />} />
        <Route path="/comparativa" element={<Comparativa />} />
        <Route path="/elo"         element={<ELOAjustes />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <BrowserRouter>
      <div className={`app-layout${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="main-content">
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  )
}
