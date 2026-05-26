# FIFA World Cup 2026 — Prediccion Multi-Agente + Monte Carlo

**Autor:** Bernardo Rios Tapia — Universidad Catolica Boliviana "San Pablo"
**Materia:** Investigacion De operaciones 2  | 5to Semestre 2026
**Deploy:** https://mundial2026-frontend.vercel.app

---

## Descripcion

Sistema de prediccion del FIFA World Cup 2026 basado en una arquitectura **Chain-of-Agents** con 7 modulos autonomos, simulacion **Monte Carlo** (10,300,000 simulaciones totales) y modelo **Poisson bivariado** para marcadores. Todos los datos son publicos y el resultado es completamente reproducible (seed=2026).

## Resultados Principales (Modelo v2)

| Pos | Equipo | Prob. Campeon | IC 95% |
|---|---|---|---|
| 1 | Argentina | 12.56% | [12.27%, 12.85%] |
| 2 | Spain | 9.33% | [9.07%, 9.58%] |
| 3 | England | 9.22% | [8.97%, 9.48%] |
| 4 | France | 9.00% | [8.75%, 9.25%] |
| 5 | Portugal | 8.92% | [8.67%, 9.17%] |
| 6 | Morocco | 8.25% | [8.01%, 8.50%] |

**Mayor impacto individual:** Morocco +55 ELO → de 4.39% a 8.25% (+87.9% relativo)

---

## Arquitectura

```
AGENTE-01        AGENTE-02           AGENTE-03          AGENTE-04
Data Collector → Probability Engine → Monte Carlo v1 → ELO Analyst
                                                             ↓
AGENTE-07        AGENTE-06           AGENTE-05
Score Calculator ← Monte Carlo v2 ← ELO Updater
```

## Estructura del Proyecto

```
mundial2026/
├── data/
│   ├── grupos.json, fixture.json, rankings_fifa.json
│   ├── elos_equipos.json, elos_ajustados.json
│   ├── probabilidades_partidos.json (v1)
│   ├── probabilidades_partidos_v2.json (v2)
│   └── historial/
│       ├── partidos_oficiales_2018_2026.json  (2,540 partidos)
│       ├── resumen_por_equipo.json            (stats por equipo)
│       └── penales_2018_2026.json             (94 tandas)
├── outputs/
│   ├── simulation_results.json      (v1 - 50,000 torneos)
│   ├── simulation_results_v2.json   (v2 - 50,000 torneos) ← FINAL
│   ├── scores_predichos_v2.json     (72 marcadores Poisson)
│   ├── resultados_torneo.json
│   ├── anomalias_elo.md
│   └── reporte_final.md
├── monte_carlo_simulation_v2.py
├── calc_probabilidades.py
└── agente_07_scores.py

mundial2026-frontend/          ← React + TypeScript (Vite)
├── src/
│   ├── data/data.ts           ← todos los datos del frontend
│   └── pages/                 ← 10 paginas interactivas
└── package.json

INFORME_MUNDIAL_2026.md        ← Informe academico completo
generar_informe.py             ← Script generador del Word
```

## Tecnologias

| Componente | Tecnologia |
|---|---|
| Simulacion | Python 3.12 — math, json, random |
| Frontend | React 18 + TypeScript + Vite |
| Animaciones | Framer Motion |
| Graficos | Recharts |
| Deploy | Vercel |
| Modelo estadistico | ELO + Poisson bivariada |
| Simulacion | Monte Carlo (seed=2026) |

## Reproducir los resultados

```bash
# Marcadores Poisson
cd mundial2026
python -X utf8 agente_07_scores.py

# Frontend local
cd mundial2026-frontend
npm install
npm run dev
# → http://localhost:5173
```

## Dataset

- **Fuente:** `martj42/international_results` (GitHub + Kaggle, PDDL Open Data)
- **Total:** 49,330 partidos desde 1872
- **Filtrado:** 2,540 partidos oficiales 2018–2026
- **Ranking FIFA:** edicion mayo 2026

## Numeros Clave

- 10,300,000 simulaciones totales (50,000 torneos × 103 partidos × 2 versiones)
- 2,540 partidos reales como base de datos
- 26 ajustes ELO justificados con evidencia triple
- 72 marcadores predichos por modelo Poisson (100% consistentes con Monte Carlo)
- Convergencia verificada: 0.38% < umbral 0.5%
