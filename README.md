# FIFA World Cup 2026 — Prediccion Multi-Agente + Monte Carlo

**Autor:** Bernardo Rios Tapia — Universidad Catolica Boliviana "San Pablo"
**Materia:** Inteligencia Artificial con Agentes — 5to Semestre 2026
**Deploy:** https://mundial2026-frontend.vercel.app

---

## Demo en vivo

**https://mundial2026-frontend.vercel.app**

Aplicacion web desplegada en Vercel. Accesible desde cualquier navegador sin instalar software adicional.

### Contenido del sitio

| Seccion | Descripcion |
|---------|-------------|
| **Inicio** | Resumen ejecutivo: 10.3M simulaciones, top favoritos, convergencia verificada |
| **Metodologia** | Formula del modelo combinado, pipeline de 5 fases, distribucion de pesos |
| **Agentes IA** | Los 7 agentes en cadena: inputs, outputs y logica de cada uno |
| **Favoritos** | Probabilidades de campeonato de los 48 equipos con IC95% |
| **Grupos A-L** | Los 12 grupos del torneo con sus 48 clasificados |
| **v1 vs v2** | Comparativa antes/despues de corregir sesgos — Morocco +87.9% |
| **Ajustes ELO** | Los 26 ajustes justificados con evidencia triple |
| **Glosario** | Definicion de cada modelo probabilistico utilizado |

---

## Resultados Principales (Modelo v2 final)

| Pos | Equipo | Prob. Campeon | IC 95% | Cambio vs v1 |
|-----|--------|---------------|--------|--------------|
| 1 | 🇦🇷 Argentina | **12.56%** | [12.27%, 12.85%] | +2.18pp |
| 2 | 🇪🇸 Spain | 9.33% | [9.07%, 9.58%] | -1.34pp |
| 3 | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England | 9.22% | [8.97%, 9.48%] | -1.54pp |
| 4 | 🇫🇷 France | 9.00% | [8.75%, 9.25%] | -1.58pp |
| 5 | 🇵🇹 Portugal | 8.92% | [8.67%, 9.17%] | — |
| 6 | 🇲🇦 Morocco | 8.25% | [8.01%, 8.50%] | **+3.86pp** (+87.9%) |

**Hallazgo clave:** En v1, los 4 primeros estaban empatados tecnicamente (IC95% solapados). En v2, Argentina se separa con diferencia estadisticamente significativa. Morocco es la mayor sorpresa: pasa de 4.39% a 8.25% tras corregir el sesgo de reputacion historica de Africa.

---

## Que hace el sistema

Sistema de prediccion del FIFA World Cup 2026 basado en:
- **Arquitectura Chain-of-Agents**: 7 modulos autonomos en cadena
- **Monte Carlo**: 10,300,000 simulaciones totales (50,000 torneos × 103 partidos × 2 versiones)
- **Modelo Poisson bivariado**: para prediccion de marcadores exactos
- **Seed = 2026**: resultados 100% reproducibles

### Formula del modelo

```
P_combinada(A gana B) = 0.55 × P_elo(A)  +  0.35 × P_historial(A)  +  0.10 × P_forma(A)

P_elo(A) = 1 / (1 + 10 ^ ((ELO_B - ELO_A + adj_conf) / 400))

Ajustes de confederacion: UEFA +50 | CONMEBOL +40 | CONCACAF +10 | CAF +5 | AFC +5 | OFC -10
```

---

## Arquitectura de Agentes

```
AGENTE-01          AGENTE-02              AGENTE-03           AGENTE-04
Data Collector  →  Probability Engine  →  Monte Carlo v1  →  ELO Analyst
(datos + ELO)      (formulas P_comb)      (50K torneos)       (detecta sesgos)
                                                                    ↓
AGENTE-07          AGENTE-06              AGENTE-05
Score Calculator ← Monte Carlo v2      ← ELO Updater
(Poisson bivariada) (50K torneos v2)     (aplica 26 ajustes)
```

Cada agente es una sesion independiente de Claude (Sonnet 4.x) que:
1. Recibe un prompt con contexto estructurado
2. Lee los JSON de salida del agente anterior
3. Ejecuta su logica (calculo / simulacion / analisis)
4. Genera artefactos estructurados (JSON / Markdown) para el siguiente

---

## Estructura del Proyecto

```
mundial2026/                           ← Pipeline Python
├── data/
│   ├── grupos.json                    ← 48 equipos en 12 grupos
│   ├── fixture.json                   ← 72 partidos de grupos
│   ├── rankings_fifa.json             ← Ranking FIFA mayo 2026
│   ├── elos_equipos.json              ← ELO base de cada equipo
│   ├── elos_ajustados.json            ← ELO corregido (26 ajustes)
│   ├── probabilidades_partidos.json   ← P_combinada v1 (72 partidos)
│   ├── probabilidades_partidos_v2.json← P_combinada v2 (con ajustes)
│   └── historial/
│       ├── partidos_oficiales_2018_2026.json  ← 2,540 partidos base
│       ├── resumen_por_equipo.json            ← Stats WR por equipo
│       └── penales_2018_2026.json             ← 94 tandas de penales
├── outputs/
│   ├── simulation_results.json        ← v1: 50,000 torneos
│   ├── simulation_results_v2.json     ← v2: 50,000 torneos (FINAL)
│   ├── scores_predichos_v2.json       ← 72 marcadores Poisson
│   ├── resultados_torneo.json         ← Bracket completo predicho
│   ├── anomalias_elo.md               ← Reporte de sesgos detectados
│   └── reporte_final.md               ← Reporte academico completo
├── calc_probabilidades.py             ← Agente-02: calculo P_comb
├── monte_carlo_simulation_v2.py       ← Agente-03/06: simulacion
└── agente_07_scores.py                ← Agente-07: marcadores Poisson

mundial2026-frontend/                  ← Aplicacion web React + TypeScript
├── src/
│   ├── data/data.ts                   ← Todos los datos hardcoded del frontend
│   ├── pages/                         ← 14 paginas interactivas
│   │   ├── Home.tsx                   ← Landing con estadisticas animadas
│   │   ├── Metodologia.tsx            ← Pipeline y formulas del modelo
│   │   ├── Agentes.tsx                ← Los 7 agentes en detalle
│   │   ├── Grupos.tsx                 ← 12 grupos con 48 equipos
│   │   ├── Partidos.tsx               ← 72 partidos con probabilidades
│   │   ├── Matrices.tsx               ← Matrices de probabilidad por grupo
│   │   ├── Bracket.tsx                ← Fase eliminatoria predicha
│   │   ├── Favoritos.tsx              ← Ranking completo 48 equipos
│   │   ├── Comparativa.tsx            ← v1 vs v2 con analisis de cambios
│   │   ├── ELOAjustes.tsx             ← Los 26 ajustes justificados
│   │   ├── Histograma.tsx             ← Distribucion de probabilidades
│   │   ├── Limitaciones.tsx           ← Limitaciones y resultados clave
│   │   ├── Glosario.tsx               ← Explicacion de modelos
│   │   └── Fuentes.tsx                ← Dataset y referencias
│   └── components/
│       ├── Sidebar.tsx                ← Navegacion lateral
│       └── PageWrapper.tsx            ← Animaciones de transicion
└── package.json

INFORME_MUNDIAL_2026.md                ← Informe academico completo en Markdown
```

---

## Numeros Clave

| Metrica | Valor |
|---------|-------|
| Simulaciones totales | **10,300,000** |
| Torneos simulados por version | 50,000 |
| Partidos por torneo | 103 |
| Partidos reales analizados | 2,540 (2018-2026) |
| Dataset total disponible | 49,330 partidos (desde 1872) |
| Ajustes ELO aplicados | 26 (justificados con evidencia triple) |
| Marcadores predichos (Poisson) | 72 partidos de grupos |
| Convergencia verificada | **0.38%** < umbral 0.5% |
| Equipos con IC95% calculado | 48 |

---

## Tecnologias

| Componente | Tecnologia |
|------------|------------|
| Simulacion | Python 3.12 — math, json, random (sin ML externo) |
| Agentes IA | Claude Sonnet 4.x (Anthropic) — 7 sesiones en cadena |
| Frontend | React 18 + TypeScript + Vite |
| Animaciones | Framer Motion |
| Graficos | Recharts |
| Deploy | Vercel (gratuito, sin servidor) |
| Modelo estadistico | ELO logistico + Poisson bivariada |
| Simulacion | Monte Carlo con seed fijo (reproducible) |

---

## Dataset

- **Fuente:** `martj42/international_results` (GitHub + Kaggle)
- **Licencia:** Open Data Commons PDDL (uso libre)
- **Total disponible:** 49,330 partidos desde 1872
- **Filtrado usado:** 2,540 partidos oficiales 2018-2026
- **Ranking FIFA:** edicion mayo 2026 (oficial)

---

## Simulador interactivo Python

Se incluye `simulador.py` como **herramienta de experimentacion externa**: permite modificar parametros del modelo, re-ejecutar simulaciones con distintas configuraciones y explorar los datos — todo sin tocar el pipeline de agentes ni instalar dependencias externas.

**Lo que se puede modificar directamente:**

| Parametro | Rango | Efecto |
|-----------|-------|--------|
| `N` (numero de torneos) | 1,000 – 500,000 | Controla precision vs velocidad |
| `seed` | cualquier entero | Cambia la secuencia aleatoria (reproducible) |
| Pesos del modelo | ELO / Historial / Forma | Ver impacto de cada componente |
| Par de equipos a comparar | cualquiera de los 48 | Calcula P(A gana), P(empate), P(B gana) |

```bash
cd mundial2026
python -X utf8 simulador.py
```

**Requisitos:** Python 3.12+ — sin dependencias externas (solo stdlib)

### Menu de opciones

```
1. Ver resultados pre-calculados  → instantaneo desde simulation_results_v2.json (N=50,000)
2. Ejecutar nueva simulacion      → N configurable (1,000 a 500,000), seed configurable
3. Consultar partido              → probabilidades con desglose ELO / Historial / Forma
4. Ver grupos del torneo          → 12 grupos con ELO, ranking FIFA y forma de cada equipo
5. Comparar dos equipos           → tabla comparativa completa de todos los indicadores
6. Ver ajustes ELO                → 27 ajustes con justificacion desde elos_ajustados.json
7. Salir
```

### Ejemplos de experimentacion

**Ver resultados oficiales inmediatamente (sin simular):**
```
opcion: 1  →  ranking de 48 equipos cargado desde JSON en <1 segundo
```

**Re-simular con N distinto y comparar con el modelo oficial:**
```
opcion: 2  →  N=5000,  seed=42   →  ~1.5 segundos  →  resultados ligeramente distintos
opcion: 2  →  N=50000, seed=2026 →  ~15 segundos   →  converge al modelo oficial
```

**Consultar probabilidades de cualquier partido:**
```
opcion: 3  →  elegir Argentina vs France
           →  P(ARG) = 54.7% / P(empate) = 22.1% / P(FRA) = 23.2%
           →  desglose: P_elo, P_historial, P_forma por separado
```

**Comparar dos equipos con todos los indicadores:**
```
opcion: 5  →  elegir Morocco vs Brazil
           →  ELO v2, ranking FIFA, win rate, forma, P(campeon)
           →  justificacion del ajuste ELO desde elos_ajustados.json
```

> **Nota:** Este simulador es una herramienta de demostracion independiente. Lee los JSON generados por el pipeline de agentes pero no los modifica ni ejecuta agentes en tiempo real. Ver `GUIA_COLAB.md` para usarlo en Google Colab sin instalar nada.

### Archivos JSON que usa el simulador

| Archivo | Contenido |
|---------|-----------|
| `data/grupos.json` | 48 equipos, 12 grupos, ranking FIFA, confederacion, sedes |
| `data/probabilidades_partidos_v2.json` | ELOs v2 + 72 probabilidades pre-calculadas |
| `data/elos_ajustados.json` | 27 ajustes ELO con justificacion extensa |
| `outputs/simulation_results_v2.json` | Resultados de N=50,000 torneos (carga instantanea) |

---

## Reproducir los resultados localmente

```bash
# Clonar el repositorio
git clone https://github.com/BerniUCb/mundial2026-ia-agentes.git
cd mundial2026-ia-agentes

# Simulador interactivo (recomendado — lee los JSON automaticamente)
cd mundial2026
python -X utf8 simulador.py

# Re-ejecutar marcadores Poisson (Agente-07)
python -X utf8 agente_07_scores.py

# Frontend local
cd ../mundial2026-frontend
npm install
npm run dev
# → Abrir http://localhost:5173 en el navegador
```

> **Nota:** Los resultados ya estan en `/outputs/`. La opcion 1 del simulador los carga en menos de 1 segundo — no es necesario re-ejecutar las 10,300,000 simulaciones.

---

## Verificacion de Convergencia

| N torneos | Argentina | Spain | France | Estado |
|-----------|-----------|-------|--------|--------|
| 1,000 | 12.50% | 10.20% | 7.10% | Alta variabilidad |
| 5,000 | 12.32% | 9.92% | 8.94% | Estabilizandose |
| 10,000 | 12.20% | 9.54% | 9.04% | Max var: 0.38% |
| **50,000** | **12.56%** | **9.33%** | **9.00%** | **✓ CONVERGIDO** |

Criterio: variacion maxima entre pasos < 0.5%. Alcanzado en N=10,000. Se uso N=50,000 para maxima precision.
