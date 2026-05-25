"""
Monte Carlo World Cup 2026 Simulation - VERSION 2
Agent: Monte Carlo Simulator
Model: ELO-Historial-Combinado v2.0 (ELOs ajustados por agente ELO analyst)

Cambios vs v1:
- ELOs ajustados para 25 equipos (ver elos_ajustados.json)
- Matrices de probabilidad recalculadas con ELOs v2
- N=50000, seed=2026 para maxima comparabilidad con v1
"""

import random
import math
import json
import time
from collections import defaultdict

# ─── SEMILLA ALEATORIA DOCUMENTADA ───────────────────────────────────────────
SEED = 2026
random.seed(SEED)

# ─── ELOs AJUSTADOS v2 (originales + deltas del agente ELO analyst) ──────────
# Equipos no listados en elos_ajustados.json mantienen ELO original
ELOS_V1 = {
    "France": 2550, "Spain": 2540, "Argentina": 2520, "England": 2520,
    "Portugal": 2510, "Brazil": 2490, "Netherlands": 2490, "Belgium": 2470,
    "Germany": 2460, "Croatia": 2450, "Morocco": 2435, "Colombia": 2420,
    "Uruguay": 2380, "Senegal": 2375, "Mexico": 2370, "Switzerland": 2370,
    "United States": 2360, "Turkiye": 2340, "Japan": 2335, "Ecuador": 2320,
    "Austria": 2320, "Iran": 2305, "South Korea": 2265, "Norway": 2250,
    "Australia": 2245, "Algeria": 2235, "Egypt": 2225, "Canada": 2220,
    "Panama": 2190, "Sweden": 2180, "Ivory Coast": 2175, "Paraguay": 2150,
    "Czechia": 2150, "Scotland": 2130, "Tunisia": 2075, "DR Congo": 2055,
    "Uzbekistan": 2015, "Qatar": 1965, "Iraq": 1945, "South Africa": 1915,
    "Bosnia and Herzegovina": 1910, "Saudi Arabia": 1905, "Jordan": 1885,
    "Cape Verde": 1825, "Ghana": 1775, "Curacao": 1700, "Haiti": 1690,
    "New Zealand": 1650
}

# Ajustes del agente ELO analyst
AJUSTES_ELO = {
    "Morocco":       +55,
    "England":       -20,
    "France":        -15,
    "Spain":         -10,
    "Norway":        +25,
    "Germany":       +15,
    "Brazil":        -12,
    "Argentina":     +15,
    "Japan":         +25,
    "Croatia":       -25,
    "New Zealand":   -55,
    "Colombia":      -15,
    "Belgium":       -25,
    "Senegal":       +40,
    "Uruguay":       -10,
    "Netherlands":    -5,
    "Ivory Coast":   +35,
    "Iran":          +20,
    "South Korea":   +20,
    "Ecuador":       -25,
    "Algeria":       +30,
    "United States": +10,
    "Mexico":        +10,
    "Canada":        +10,
    "Portugal":        0,
    "Switzerland":    +5,
    "Australia":      +5,
}

# Construir ELOS v2
ELOS = {}
for equipo, elo_v1 in ELOS_V1.items():
    delta = AJUSTES_ELO.get(equipo, 0)
    ELOS[equipo] = elo_v1 + delta

# ─── GRUPOS ──────────────────────────────────────────────────────────────────
GRUPOS = {
    "A": ["Mexico", "South Africa", "South Korea", "Czechia"],
    "B": ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"],
    "C": ["Brazil", "Morocco", "Haiti", "Scotland"],
    "D": ["United States", "Paraguay", "Australia", "Turkiye"],
    "E": ["Germany", "Curacao", "Ivory Coast", "Ecuador"],
    "F": ["Netherlands", "Japan", "Sweden", "Tunisia"],
    "G": ["Belgium", "Egypt", "Iran", "New Zealand"],
    "H": ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
    "I": ["France", "Senegal", "Iraq", "Norway"],
    "J": ["Argentina", "Algeria", "Austria", "Jordan"],
    "K": ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
    "L": ["England", "Croatia", "Ghana", "Panama"],
}

# ─── HISTORIAL ESTADISTICO (para calculo de probabilidades) ──────────────────
# win_rate, draw_rate (derivado de historial 2018-2026)
# Fuente: datos del agente de probabilidades v1 (mismos valores base)
HISTORIAL = {
    "France":      {"win_rate": 0.7632, "draw_rate": 0.1053},
    "Spain":       {"win_rate": 0.7333, "draw_rate": 0.1111},
    "Argentina":   {"win_rate": 0.7500, "draw_rate": 0.1071},
    "England":     {"win_rate": 0.7500, "draw_rate": 0.1429},
    "Portugal":    {"win_rate": 0.6250, "draw_rate": 0.1667},
    "Brazil":      {"win_rate": 0.6667, "draw_rate": 0.1176},
    "Netherlands": {"win_rate": 0.6571, "draw_rate": 0.1714},
    "Belgium":     {"win_rate": 0.6582, "draw_rate": 0.1266},
    "Germany":     {"win_rate": 0.6364, "draw_rate": 0.1818},
    "Croatia":     {"win_rate": 0.5062, "draw_rate": 0.2346},
    "Morocco":     {"win_rate": 0.7143, "draw_rate": 0.1169},
    "Colombia":    {"win_rate": 0.4035, "draw_rate": 0.3509},
    "Uruguay":     {"win_rate": 0.4576, "draw_rate": 0.2712},
    "Senegal":     {"win_rate": 0.6463, "draw_rate": 0.1463},
    "Mexico":      {"win_rate": 0.6324, "draw_rate": 0.1912},
    "Switzerland": {"win_rate": 0.4189, "draw_rate": 0.3243},
    "United States":{"win_rate": 0.6406, "draw_rate": 0.1563},
    "Turkiye":     {"win_rate": 0.5098, "draw_rate": 0.2157},
    "Japan":       {"win_rate": 0.6935, "draw_rate": 0.0968},
    "Ecuador":     {"win_rate": 0.3333, "draw_rate": 0.3922},
    "Austria":     {"win_rate": 0.5897, "draw_rate": 0.2051},
    "Iran":        {"win_rate": 0.6909, "draw_rate": 0.1273},
    "South Korea": {"win_rate": 0.6316, "draw_rate": 0.1754},
    "Norway":      {"win_rate": 0.5574, "draw_rate": 0.2131},
    "Australia":   {"win_rate": 0.5849, "draw_rate": 0.1698},
    "Algeria":     {"win_rate": 0.6522, "draw_rate": 0.1594},
    "Egypt":       {"win_rate": 0.5556, "draw_rate": 0.2222},
    "Canada":      {"win_rate": 0.5821, "draw_rate": 0.1493},
    "Panama":      {"win_rate": 0.4286, "draw_rate": 0.2143},
    "Sweden":      {"win_rate": 0.5385, "draw_rate": 0.2308},
    "Ivory Coast": {"win_rate": 0.6500, "draw_rate": 0.1833},
    "Paraguay":    {"win_rate": 0.3784, "draw_rate": 0.2973},
    "Czechia":     {"win_rate": 0.4737, "draw_rate": 0.2632},
    "Scotland":    {"win_rate": 0.4444, "draw_rate": 0.2778},
    "Tunisia":     {"win_rate": 0.3953, "draw_rate": 0.2558},
    "DR Congo":    {"win_rate": 0.5200, "draw_rate": 0.2400},
    "Uzbekistan":  {"win_rate": 0.5263, "draw_rate": 0.1842},
    "Qatar":       {"win_rate": 0.4706, "draw_rate": 0.1176},
    "Iraq":        {"win_rate": 0.4167, "draw_rate": 0.2500},
    "South Africa":{"win_rate": 0.4706, "draw_rate": 0.1765},
    "Bosnia and Herzegovina": {"win_rate": 0.4737, "draw_rate": 0.2105},
    "Saudi Arabia":{"win_rate": 0.4444, "draw_rate": 0.1667},
    "Jordan":      {"win_rate": 0.4118, "draw_rate": 0.2353},
    "Cape Verde":  {"win_rate": 0.5000, "draw_rate": 0.2500},
    "Ghana":       {"win_rate": 0.3929, "draw_rate": 0.2857},
    "Curacao":     {"win_rate": 0.3571, "draw_rate": 0.2143},
    "Haiti":       {"win_rate": 0.3077, "draw_rate": 0.1538},
    "New Zealand": {"win_rate": 0.8889, "draw_rate": 0.0556},  # inflado OFC
}

# Forma reciente (ultimos 5 partidos, normalizado entre 0 y 1)
# Basado en datos del agente: WWWWW=1.0, WWWWL=0.8, etc.
FORMA = {
    "France":      0.80,
    "Spain":       0.90,
    "Argentina":   0.80,
    "England":     1.00,
    "Portugal":    0.70,
    "Brazil":      0.50,
    "Netherlands": 0.80,
    "Belgium":     0.60,
    "Germany":     1.00,
    "Croatia":     0.80,
    "Morocco":     0.80,
    "Colombia":    0.60,
    "Uruguay":     0.50,
    "Senegal":     0.70,
    "Mexico":      0.80,
    "Switzerland": 0.70,
    "United States": 0.70,
    "Turkiye":     0.60,
    "Japan":       0.80,
    "Ecuador":     0.30,
    "Austria":     0.60,
    "Iran":        0.80,
    "South Korea": 0.70,
    "Norway":      1.00,
    "Australia":   0.80,
    "Algeria":     0.80,
    "Egypt":       0.60,
    "Canada":      0.70,
    "Panama":      0.60,
    "Sweden":      0.70,
    "Ivory Coast": 0.70,
    "Paraguay":    0.50,
    "Czechia":     0.50,
    "Scotland":    0.50,
    "Tunisia":     0.50,
    "DR Congo":    0.60,
    "Uzbekistan":  0.60,
    "Qatar":       0.60,
    "Iraq":        0.50,
    "South Africa": 0.50,
    "Bosnia and Herzegovina": 0.50,
    "Saudi Arabia": 0.40,
    "Jordan":      0.50,
    "Cape Verde":  0.60,
    "Ghana":       0.40,
    "Curacao":     0.40,
    "Haiti":       0.30,
    "New Zealand": 0.50,
}

# Pesos del modelo combinado
PESO_ELO = 0.55
PESO_HIST = 0.35
PESO_FORMA = 0.10


def calcular_prob_partido(equipo_A, equipo_B):
    """
    Calcula P(A gana), P(empate), P(B gana) usando:
    - ELO v2 ajustado (peso 0.55)
    - Historial win_rate (peso 0.35)
    - Forma reciente (peso 0.10)

    Retorna (pA, pE, pB) normalizadas.
    """
    eloA = ELOS.get(equipo_A, 2000)
    eloB = ELOS.get(equipo_B, 2000)
    diff = eloA - eloB

    # Componente ELO (formula Elo clasica)
    pA_elo = 1 / (1 + 10 ** (-diff / 400))
    pB_elo = 1 - pA_elo

    # Componente historial: win_rate de cada equipo
    wrA = HISTORIAL.get(equipo_A, {"win_rate": 0.50, "draw_rate": 0.20})["win_rate"]
    wrB = HISTORIAL.get(equipo_B, {"win_rate": 0.50, "draw_rate": 0.20})["win_rate"]
    drA = HISTORIAL.get(equipo_A, {"win_rate": 0.50, "draw_rate": 0.20})["draw_rate"]
    drB = HISTORIAL.get(equipo_B, {"win_rate": 0.50, "draw_rate": 0.20})["draw_rate"]

    total_hist = wrA + wrB
    if total_hist == 0:
        pA_hist = 0.5
        pB_hist = 0.5
    else:
        pA_hist = wrA / total_hist
        pB_hist = wrB / total_hist

    pE_hist = (drA + drB) / 2

    # Componente forma reciente
    fA = FORMA.get(equipo_A, 0.5)
    fB = FORMA.get(equipo_B, 0.5)
    total_forma = fA + fB
    if total_forma == 0:
        pA_forma = 0.5
        pB_forma = 0.5
    else:
        pA_forma = fA / total_forma
        pB_forma = fB / total_forma

    # Combinacion ponderada
    pA_raw = PESO_ELO * pA_elo + PESO_HIST * pA_hist + PESO_FORMA * pA_forma
    pB_raw = PESO_ELO * pB_elo + PESO_HIST * pB_hist + PESO_FORMA * pB_forma

    # Empate: basado en historial, moderado por diferencia de ELO
    pE_raw = pE_hist * (1 - abs(pA_elo - pB_elo) * 0.5)
    pE_raw = max(0.04, min(pE_raw, 0.35))

    # Ajustar pA y pB para dejar espacio al empate
    factor_adj = (1 - pE_raw) / (pA_raw + pB_raw) if (pA_raw + pB_raw) > 0 else 0.5
    pA = pA_raw * factor_adj
    pB = pB_raw * factor_adj
    pE = pE_raw

    # Normalizar
    total = pA + pE + pB
    if total == 0:
        return 1/3, 1/3, 1/3
    return round(pA / total, 4), round(pE / total, 4), round(1 - pA/total - pE/total, 4)


def generar_matrices_v2():
    """
    Genera todas las matrices de probabilidad para los 72 partidos de grupos
    usando ELOs v2. Retorna dict con fixture_id -> {A, B, pA, pE, pB}.
    """
    # Definicion de partidos por grupo (mismo fixture que v1)
    partidos_fixture = {
        # GRUPO A
        "GA-001": ("Mexico", "South Africa"),
        "GA-002": ("South Korea", "Czechia"),
        "GA-025": ("Czechia", "South Africa"),
        "GA-028": ("Mexico", "South Korea"),
        "GA-053": ("South Africa", "South Korea"),
        "GA-054": ("Czechia", "Mexico"),
        # GRUPO B
        "GB-003": ("Canada", "Bosnia and Herzegovina"),
        "GB-005": ("Qatar", "Switzerland"),
        "GB-026": ("Switzerland", "Bosnia and Herzegovina"),
        "GB-027": ("Canada", "Qatar"),
        "GB-049": ("Switzerland", "Canada"),
        "GB-050": ("Bosnia and Herzegovina", "Qatar"),
        # GRUPO C
        "GC-006": ("Brazil", "Morocco"),
        "GC-007": ("Haiti", "Scotland"),
        "GC-030": ("Scotland", "Morocco"),
        "GC-031": ("Brazil", "Haiti"),
        "GC-051": ("Morocco", "Haiti"),
        "GC-052": ("Scotland", "Brazil"),
        # GRUPO D
        "GD-004": ("United States", "Paraguay"),
        "GD-008": ("Australia", "Turkiye"),
        "GD-029": ("United States", "Australia"),
        "GD-032": ("Turkiye", "Paraguay"),
        "GD-059": ("Turkiye", "United States"),
        "GD-060": ("Paraguay", "Australia"),
        # GRUPO E
        "GE-009": ("Germany", "Curacao"),
        "GE-011": ("Ivory Coast", "Ecuador"),
        "GE-034": ("Germany", "Ivory Coast"),
        "GE-035": ("Ecuador", "Curacao"),
        "GE-055": ("Curacao", "Ivory Coast"),
        "GE-056": ("Ecuador", "Germany"),
        # GRUPO F
        "GF-010": ("Netherlands", "Japan"),
        "GF-012": ("Sweden", "Tunisia"),
        "GF-033": ("Netherlands", "Sweden"),
        "GF-036": ("Tunisia", "Japan"),
        "GF-057": ("Tunisia", "Netherlands"),
        "GF-058": ("Japan", "Sweden"),
        # GRUPO G
        "GG-014": ("Belgium", "Egypt"),
        "GG-016": ("Iran", "New Zealand"),
        "GG-038": ("Belgium", "Iran"),
        "GG-040": ("New Zealand", "Egypt"),
        "GG-065": ("New Zealand", "Belgium"),
        "GG-066": ("Egypt", "Iran"),
        # GRUPO H
        "GH-013": ("Spain", "Cape Verde"),
        "GH-015": ("Saudi Arabia", "Uruguay"),
        "GH-037": ("Spain", "Saudi Arabia"),
        "GH-039": ("Uruguay", "Cape Verde"),
        "GH-063": ("Cape Verde", "Saudi Arabia"),
        "GH-064": ("Uruguay", "Spain"),
        # GRUPO I
        "GI-017": ("France", "Senegal"),
        "GI-018": ("Iraq", "Norway"),
        "GI-042": ("France", "Iraq"),
        "GI-043": ("Norway", "Senegal"),
        "GI-061": ("Norway", "France"),
        "GI-062": ("Senegal", "Iraq"),
        # GRUPO J
        "GJ-019": ("Argentina", "Algeria"),
        "GJ-020": ("Austria", "Jordan"),
        "GJ-041": ("Argentina", "Austria"),
        "GJ-044": ("Jordan", "Algeria"),
        "GJ-069": ("Algeria", "Austria"),
        "GJ-070": ("Jordan", "Argentina"),
        # GRUPO K
        "GK-021": ("Portugal", "DR Congo"),
        "GK-024": ("Uzbekistan", "Colombia"),
        "GK-045": ("Portugal", "Uzbekistan"),
        "GK-048": ("Colombia", "DR Congo"),
        "GK-071": ("DR Congo", "Uzbekistan"),
        "GK-072": ("Colombia", "Portugal"),
        # GRUPO L
        "GL-022": ("England", "Croatia"),
        "GL-023": ("Ghana", "Panama"),
        "GL-046": ("England", "Ghana"),
        "GL-047": ("Panama", "Croatia"),
        "GL-067": ("Panama", "England"),
        "GL-068": ("Croatia", "Ghana"),
    }

    matrices = {}
    anomalias = []
    for fid, (eA, eB) in partidos_fixture.items():
        pA, pE, pB = calcular_prob_partido(eA, eB)
        # Verificar normalizacion
        total = pA + pE + pB
        if abs(total - 1.0) > 0.005:
            pA, pE, pB = pA/total, pE/total, pB/total
            anomalias.append(fid)
        matrices[fid] = {
            "A": eA, "B": eB,
            "pA": round(pA, 4),
            "pE": round(pE, 4),
            "pB": round(pB, 4),
            "suma": round(pA + pE + pB, 4)
        }

    return matrices, anomalias


# ─── HISTORIAL DE PENALES ──────────────────────────────────────────────────
PENALES = {
    "Argentina": 100.0, "Croatia": 83.33, "England": 75.0,
    "Senegal": 71.43, "DR Congo": 66.67, "Portugal": 66.67,
    "Bosnia and Herzegovina": 66.67, "Algeria": 66.67, "United States": 66.67,
    "Iran": 66.67, "Mexico": 100.0, "Australia": 100.0, "Qatar": 100.0,
    "South Korea": 100.0, "Czechia": 100.0, "Scotland": 100.0,
    "South Africa": 60.0, "Morocco": 50.0, "Tunisia": 50.0,
    "Uruguay": 50.0, "Iraq": 50.0, "Uzbekistan": 50.0, "Ghana": 50.0,
    "Panama": 50.0, "Egypt": 37.5, "Cape Verde": 40.0,
    "France": 33.33, "Ivory Coast": 33.33, "Brazil": 33.33, "Spain": 33.33,
    "Colombia": 25.0, "Canada": 25.0, "Switzerland": 25.0, "Paraguay": 0.0,
    "Ecuador": 0.0, "Netherlands": 0.0, "Saudi Arabia": 0.0,
    "Jordan": 0.0, "Japan": 0.0, "New Zealand": 0.0, "Curacao": 0.0,
    # Sin datos (tasa media global 50%)
    "Germany": None, "Belgium": None, "Sweden": None,
    "Turkiye": None, "Norway": None, "Austria": None, "Haiti": None,
}

MEDIA_PENALES = 50.0


def tasa_penales(equipo):
    t = PENALES.get(equipo, None)
    if t is None:
        return MEDIA_PENALES
    return t


def prob_penales(equipo_A, equipo_B):
    tA = tasa_penales(equipo_A) / 100.0
    tB = tasa_penales(equipo_B) / 100.0
    if tA + tB == 0:
        return 0.5
    return tA / (tA + tB)


def simular_partido(equipo_A, equipo_B, pA, pE, pB, es_eliminatoria=False):
    r = random.random()
    if r < pA:
        return ("Gana A", equipo_A)
    elif r < pA + pE:
        if es_eliminatoria:
            p_pen = prob_penales(equipo_A, equipo_B)
            if random.random() < p_pen:
                return ("Empate->Penales->A", equipo_A)
            else:
                return ("Empate->Penales->B", equipo_B)
        else:
            return ("Empate", None)
    else:
        return ("Gana B", equipo_B)


def calcular_prob_elo_v2(equipo_A, equipo_B):
    """
    Probabilidades dinamicas para eliminatorias usando ELOs v2.
    """
    eloA = ELOS.get(equipo_A, 2000)
    eloB = ELOS.get(equipo_B, 2000)
    diff = eloA - eloB
    pA_base = 1 / (1 + 10 ** (-diff / 400))
    pB_base = 1 - pA_base
    pE = 0.20 * (1 - abs(pA_base - pB_base))
    pA = pA_base * (1 - pE / 2)
    pB = pB_base * (1 - pE / 2)
    total = pA + pE + pB
    return pA / total, pE / total, pB / total


# Partidos por grupo (orden de jornadas)
PARTIDOS_GRUPO = {
    "A": [("GA-001","GA-002"), ("GA-025","GA-028"), ("GA-053","GA-054")],
    "B": [("GB-003","GB-005"), ("GB-026","GB-027"), ("GB-049","GB-050")],
    "C": [("GC-006","GC-007"), ("GC-030","GC-031"), ("GC-051","GC-052")],
    "D": [("GD-004","GD-008"), ("GD-029","GD-032"), ("GD-059","GD-060")],
    "E": [("GE-009","GE-011"), ("GE-034","GE-035"), ("GE-055","GE-056")],
    "F": [("GF-010","GF-012"), ("GF-033","GF-036"), ("GF-057","GF-058")],
    "G": [("GG-014","GG-016"), ("GG-038","GG-040"), ("GG-065","GG-066")],
    "H": [("GH-013","GH-015"), ("GH-037","GH-039"), ("GH-063","GH-064")],
    "I": [("GI-017","GI-018"), ("GI-042","GI-043"), ("GI-061","GI-062")],
    "J": [("GJ-019","GJ-020"), ("GJ-041","GJ-044"), ("GJ-069","GJ-070")],
    "K": [("GK-021","GK-024"), ("GK-045","GK-048"), ("GK-071","GK-072")],
    "L": [("GL-022","GL-023"), ("GL-046","GL-047"), ("GL-067","GL-068")],
}


def simular_grupo(grupo_letra, probs_grupos):
    equipos = GRUPOS[grupo_letra]
    puntos = defaultdict(int)
    gf = defaultdict(int)
    gc = defaultdict(int)
    head2head = defaultdict(lambda: defaultdict(int))

    for jornada in PARTIDOS_GRUPO[grupo_letra]:
        for fid in jornada:
            p = probs_grupos[fid]
            eA, eB = p["A"], p["B"]
            pA, pE, pB = p["pA"], p["pE"], p["pB"]
            resultado, _ = simular_partido(eA, eB, pA, pE, pB, es_eliminatoria=False)

            if resultado == "Gana A":
                puntos[eA] += 3
                g_a = max(1, int(random.gauss(1.5, 0.8)))
                g_b = max(0, g_a - random.randint(1, 2))
                head2head[eA][eB] += 3
            elif resultado == "Empate":
                puntos[eA] += 1
                puntos[eB] += 1
                g_a = max(0, int(random.gauss(1.0, 0.7)))
                g_b = g_a
                head2head[eA][eB] += 1
                head2head[eB][eA] += 1
            else:
                puntos[eB] += 3
                g_b = max(1, int(random.gauss(1.5, 0.8)))
                g_a = max(0, g_b - random.randint(1, 2))
                head2head[eB][eA] += 3

            gf[eA] += g_a
            gc[eA] += g_b
            gf[eB] += g_b
            gc[eB] += g_a

    def sort_key(e):
        dg = gf[e] - gc[e]
        return (-puntos[e], -dg, -gf[e], random.random())

    clasificados = sorted(equipos, key=sort_key)
    return clasificados, {e: {"pts": puntos[e], "gf": gf[e], "gc": gc[e], "dg": gf[e]-gc[e]} for e in equipos}


def simular_fase_grupos(probs_grupos):
    clasificados = {}
    tablas = {}
    terceros = []

    for g in "ABCDEFGHIJKL":
        orden, stats = simular_grupo(g, probs_grupos)
        clasificados[g] = orden
        tablas[g] = (orden, stats)
        tercero = orden[2]
        terceros.append((g, tercero, stats[tercero]["pts"], stats[tercero]["dg"], stats[tercero]["gf"]))

    terceros_sorted = sorted(terceros, key=lambda x: (-x[2], -x[3], -x[4], random.random()))
    mejores_terceros = [t[1] for t in terceros_sorted[:8]]
    grupos_mejores_terceros = [t[0] for t in terceros_sorted[:8]]

    return clasificados, tablas, mejores_terceros, grupos_mejores_terceros


def construir_bracket_r32(clasificados, mejores_terceros):
    p1 = {g: clasificados[g][0] for g in "ABCDEFGHIJKL"}
    p2 = {g: clasificados[g][1] for g in "ABCDEFGHIJKL"}
    t = mejores_terceros

    bracket_r32 = [
        (p1["A"], p2["B"]),
        (p1["C"], t[0]),
        (p1["E"], p2["F"]),
        (p1["G"], t[1]),
        (p1["I"], p2["J"]),
        (p1["K"], t[2]),
        (p2["A"], p1["B"]),
        (p2["C"], t[3]),
        (p1["D"], p2["E"]),
        (p1["F"], t[4]),
        (p1["H"], p2["I"]),
        (p1["J"], t[5]),
        (p1["L"], p2["K"]),
        (p2["D"], t[6]),
        (p2["H"], t[7]),
        (p2["L"], p1["F"]),
    ]
    return bracket_r32


def simular_ronda_eliminatoria(partidos):
    ganadores = []
    for eA, eB in partidos:
        pA, pE, pB = calcular_prob_elo_v2(eA, eB)
        _, ganador = simular_partido(eA, eB, pA, pE, pB, es_eliminatoria=True)
        ganadores.append(ganador)
    return ganadores


def simular_torneo(probs_grupos):
    clasificados, tablas, mejores_terceros, _ = simular_fase_grupos(probs_grupos)

    dist_grupos = {}
    for g in "ABCDEFGHIJKL":
        orden = clasificados[g]
        for pos, equipo in enumerate(orden):
            if equipo not in dist_grupos:
                dist_grupos[equipo] = {"1ro": 0, "2do": 0, "3ro": 0, "4to": 0}
            posiciones = ["1ro", "2do", "3ro", "4to"]
            dist_grupos[equipo][posiciones[pos]] += 1

    bracket_r32 = construir_bracket_r32(clasificados, mejores_terceros)

    all_classified = set()
    for g in "ABCDEFGHIJKL":
        all_classified.add(clasificados[g][0])
        all_classified.add(clasificados[g][1])
    for t in mejores_terceros:
        all_classified.add(t)

    ganadores_r32 = simular_ronda_eliminatoria(bracket_r32)
    bracket_r16 = [(ganadores_r32[i*2], ganadores_r32[i*2+1]) for i in range(8)]
    ganadores_r16 = simular_ronda_eliminatoria(bracket_r16)
    bracket_qf = [(ganadores_r16[i*2], ganadores_r16[i*2+1]) for i in range(4)]
    ganadores_qf = simular_ronda_eliminatoria(bracket_qf)
    bracket_sf = [(ganadores_qf[0], ganadores_qf[1]), (ganadores_qf[2], ganadores_qf[3])]
    ganadores_sf = simular_ronda_eliminatoria(bracket_sf)
    perdedores_sf = []
    for i, (eA, eB) in enumerate(bracket_sf):
        gan = ganadores_sf[i]
        perdedores_sf.append(eB if gan == eA else eA)

    final_partido = [(ganadores_sf[0], ganadores_sf[1])]
    ganadores_final = simular_ronda_eliminatoria(final_partido)
    campeon = ganadores_final[0]
    subcampeon = ganadores_sf[1] if campeon == ganadores_sf[0] else ganadores_sf[0]

    bracket_3p = [(perdedores_sf[0], perdedores_sf[1])]
    ganadores_3p = simular_ronda_eliminatoria(bracket_3p)
    tercer_puesto = ganadores_3p[0]

    return {
        "campeon": campeon,
        "subcampeon": subcampeon,
        "tercer_puesto": tercer_puesto,
        "semifinalistas": ganadores_sf + perdedores_sf,
        "cuartofinalistas": ganadores_qf + [e for pair in bracket_qf for e in pair if e not in ganadores_qf],
        "r16_clasificados": ganadores_r16 + [e for pair in bracket_r16 for e in pair if e not in ganadores_r16],
        "r32_clasificados": list(all_classified),
        "dist_grupos": dist_grupos,
    }


def correr_simulaciones(N, probs_grupos, seed_base=SEED):
    random.seed(seed_base)

    todos_equipos = list(ELOS.keys())

    conteo_campeon = defaultdict(int)
    conteo_final = defaultdict(int)
    conteo_semi = defaultdict(int)
    conteo_cuartos = defaultdict(int)
    conteo_r32 = defaultdict(int)
    dist_grupos_total = defaultdict(lambda: {"1ro": 0, "2do": 0, "3ro": 0, "4to": 0})

    for _ in range(N):
        resultado = simular_torneo(probs_grupos)

        conteo_campeon[resultado["campeon"]] += 1
        conteo_final[resultado["campeon"]] += 1
        conteo_final[resultado["subcampeon"]] += 1

        for e in resultado["semifinalistas"]:
            conteo_semi[e] += 1

        for e in resultado.get("cuartofinalistas", []):
            conteo_cuartos[e] += 1

        for e in resultado["r32_clasificados"]:
            conteo_r32[e] += 1

        for equipo, dist in resultado["dist_grupos"].items():
            for pos in ["1ro", "2do", "3ro", "4to"]:
                dist_grupos_total[equipo][pos] += dist.get(pos, 0)

    prob_campeon = {e: conteo_campeon[e] / N * 100 for e in todos_equipos}
    prob_final = {e: conteo_final[e] / N * 100 for e in todos_equipos}
    prob_semi = {e: conteo_semi[e] / N * 100 for e in todos_equipos}
    prob_cuartos = {e: conteo_cuartos[e] / N * 100 for e in todos_equipos}
    prob_r32 = {e: conteo_r32[e] / N * 100 for e in todos_equipos}

    return prob_campeon, prob_final, prob_semi, prob_cuartos, prob_r32, dict(dist_grupos_total)


def prueba_convergencia(probs_grupos):
    pasos = [1000, 5000, 10000, 50000]
    top5 = ["France", "Spain", "Argentina", "England", "Portugal"]

    resultados_prev = None
    tabla = []
    N_optimo = pasos[-1]

    print("\n=== PRUEBA DE CONVERGENCIA v2 ===")
    print(f"{'N':>10} | {'France':>8} | {'Spain':>8} | {'Argentina':>10} | {'England':>8} | {'Portugal':>8} | {'MaxVar':>8}")
    print("-" * 80)

    for N in pasos:
        random.seed(SEED)
        prob_c, _, _, _, _, _ = correr_simulaciones(N, probs_grupos)
        probs_top5 = [prob_c[e] for e in top5]

        if resultados_prev is not None:
            varianzas = [abs(probs_top5[i] - resultados_prev[i]) for i in range(5)]
            max_var = max(varianzas)
        else:
            max_var = float('inf')

        fila = {"N": N, "probs": {e: prob_c[e] for e in top5},
                "max_var": max_var if max_var != float('inf') else None}
        tabla.append(fila)

        probs_str = " | ".join(f"{prob_c[e]:8.2f}" for e in top5)
        max_var_str = f"{max_var:8.4f}" if max_var != float('inf') else "   N/A  "
        print(f"{N:>10} | {probs_str} | {max_var_str}")

        if max_var < 0.5 and resultados_prev is not None:
            N_optimo = N
            print(f"\n>>> CONVERGENCIA alcanzada en N={N} (max_var={max_var:.4f} < 0.5%)")
            break

        resultados_prev = probs_top5

    return N_optimo, tabla


def main():
    start_time = time.time()

    print("=" * 80)
    print("  SIMULACION MONTE CARLO - FIFA WORLD CUP 2026 - VERSION 2")
    print(f"  Semilla aleatoria: {SEED}")
    print(f"  ELOs ajustados: {len(AJUSTES_ELO)} equipos modificados")
    print("=" * 80)

    # Mostrar tabla de ELOs ajustados
    print("\n=== TABLA DE ELOS AJUSTADOS v2 ===")
    print(f"{'Equipo':<30} {'ELO v1':>8} {'Delta':>8} {'ELO v2':>8}")
    print("-" * 56)
    for equipo, delta in sorted(AJUSTES_ELO.items(), key=lambda x: -abs(x[1])):
        v1 = ELOS_V1[equipo]
        v2 = ELOS[equipo]
        signo = "+" if delta > 0 else ""
        print(f"  {equipo:<28} {v1:>8} {signo}{delta:>7} {v2:>8}")

    # Generar matrices de probabilidad v2
    print("\n=== GENERANDO MATRICES DE PROBABILIDAD v2 ===")
    probs_grupos_v2, anomalias = generar_matrices_v2()

    print(f"  Partidos calculados: {len(probs_grupos_v2)}")
    if anomalias:
        print(f"  NORMALIZACION de emergencia aplicada en: {anomalias}")
    else:
        print(f"  Todas las matrices suman correctamente a 1.0")

    # Guardar matrices v2
    matrices_output = {
        "titulo": "Matrices de Probabilidad v2 - FIFA World Cup 2026",
        "modelo": "ELO-Historial-Combinado v2.0",
        "fecha_calculo": "2026-05-17",
        "pesos": {"elo": PESO_ELO, "historial": PESO_HIST, "forma": PESO_FORMA},
        "elos_v2": {e: ELOS[e] for e in sorted(ELOS)},
        "partidos": probs_grupos_v2
    }
    matrices_path = "E:/UCB/5 Semestre/IA AGENTES/mundial2026/data/probabilidades_partidos_v2.json"
    with open(matrices_path, "w", encoding="utf-8") as f:
        json.dump(matrices_output, f, ensure_ascii=False, indent=2)
    print(f"  Matrices guardadas en: {matrices_path}")

    # Convergencia
    N_optimo, tabla_convergencia = prueba_convergencia(probs_grupos_v2)

    # Forzar N=50000 para comparabilidad con v1
    N_FINAL = 50000
    if N_optimo != N_FINAL:
        print(f"\n  Forzando N={N_FINAL} para comparabilidad con v1 (convergencia N={N_optimo})")
    else:
        print(f"\n  Usando N={N_FINAL} (confirmado por convergencia)")

    # Simulacion final
    print(f"\n=== EJECUTANDO {N_FINAL} SIMULACIONES v2 ===")
    random.seed(SEED)

    prob_campeon, prob_final, prob_semi, prob_cuartos, prob_r32, dist_grupos = \
        correr_simulaciones(N_FINAL, probs_grupos_v2)

    elapsed = time.time() - start_time

    # Reporte
    print(f"\n=== PROBABILIDADES DE CAMPEON v2 (Top 10) ===")
    top10 = sorted(prob_campeon.items(), key=lambda x: -x[1])[:10]
    for i, (equipo, prob) in enumerate(top10, 1):
        p = prob / 100
        n = N_FINAL
        z = 1.96
        margen = z * math.sqrt(p * (1 - p) / n) * 100
        print(f"  {i:2}. {equipo:<30} {prob:6.2f}%  (IC95: [{max(0, prob-margen):.2f}%, {min(100, prob+margen):.2f}%])")

    print(f"\n=== GRUPO DE LA MUERTE v2 (suma ELOs ajustados) ===")
    grupos_elo = {}
    for g, equipos in GRUPOS.items():
        suma_elo = sum(ELOS[e] for e in equipos)
        grupos_elo[g] = (suma_elo, equipos)

    for g, (elo_sum, equipos) in sorted(grupos_elo.items(), key=lambda x: -x[1][0]):
        print(f"  Grupo {g}: {elo_sum}  ({', '.join(equipos)})")

    print(f"\n=== PARTIDO MAS PAREJO v2 ===")
    partidos_parejo = []
    for fid, p in probs_grupos_v2.items():
        entropia = -(p["pA"] * math.log(p["pA"] + 1e-9) +
                     p["pE"] * math.log(p["pE"] + 1e-9) +
                     p["pB"] * math.log(p["pB"] + 1e-9))
        partidos_parejo.append((fid, p["A"], p["B"], entropia, p["pA"], p["pE"], p["pB"]))

    mas_parejo = max(partidos_parejo, key=lambda x: x[3])
    print(f"  {mas_parejo[1]} vs {mas_parejo[2]}")
    print(f"  P(A gana)={mas_parejo[4]:.3f}  P(Empate)={mas_parejo[5]:.3f}  P(B gana)={mas_parejo[6]:.3f}")

    print(f"\n=== TIEMPO DE EJECUCION: {elapsed:.1f} segundos ===")

    # IC 95% helper
    def ic95(prob, N):
        p = prob / 100
        z = 1.96
        margen = z * math.sqrt(p * (1 - p) / max(N, 1)) * 100
        return round(max(0, prob - margen), 3), round(min(100, prob + margen), 3)

    # Construir JSON de salida
    resultados_json = {
        "metadata": {
            "torneo": "FIFA World Cup 2026",
            "version": "v2",
            "fecha_simulacion": "2026-05-17",
            "N_optimo": N_FINAL,
            "semilla": SEED,
            "modelo_probabilidades": "ELO-Historial-Combinado v2.0",
            "tiempo_ejecucion_segundos": round(elapsed, 2),
            "equipos_elo_ajustado": len(AJUSTES_ELO),
            "ajustes_elo": {e: {"v1": ELOS_V1[e], "v2": ELOS[e], "delta": AJUSTES_ELO.get(e, 0)}
                            for e in sorted(ELOS_V1)},
            "convergencia": {
                "criterio": "max_var < 0.5% entre pasos consecutivos",
                "tabla": [
                    {
                        "N": f["N"],
                        "probs_top5": {k: round(v, 3) for k, v in f["probs"].items()},
                        "max_variacion": round(f["max_var"], 4) if f["max_var"] is not None else None
                    }
                    for f in tabla_convergencia
                ]
            }
        },
        "probabilidades_campeon": {
            e: {
                "prob_pct": round(prob_campeon[e], 3),
                "ic95": ic95(prob_campeon[e], N_FINAL)
            }
            for e in sorted(prob_campeon, key=lambda x: -prob_campeon[x])
        },
        "probabilidades_llegar": {
            e: {
                "final_pct": round(prob_final[e], 3),
                "semifinal_pct": round(prob_semi[e], 3),
                "cuartos_pct": round(prob_cuartos[e], 3),
                "r32_pct": round(prob_r32[e], 3)
            }
            for e in sorted(prob_campeon, key=lambda x: -prob_campeon[x])
        },
        "distribucion_grupos": {
            equipo: {
                "1ro_pct": round(dist_grupos.get(equipo, {}).get("1ro", 0) / N_FINAL * 100, 2),
                "2do_pct": round(dist_grupos.get(equipo, {}).get("2do", 0) / N_FINAL * 100, 2),
                "3ro_pct": round(dist_grupos.get(equipo, {}).get("3ro", 0) / N_FINAL * 100, 2),
                "4to_pct": round(dist_grupos.get(equipo, {}).get("4to", 0) / N_FINAL * 100, 2),
            }
            for equipo in [e for g in "ABCDEFGHIJKL" for e in GRUPOS[g]]
        },
        "grupo_de_la_muerte": max(
            [{"grupo": g, "equipos": equipos, "suma_elo": elo_sum}
             for g, (elo_sum, equipos) in grupos_elo.items()],
            key=lambda x: x["suma_elo"]
        ),
        "partido_mas_parejo": {
            "fixture_id": mas_parejo[0],
            "equipo_A": mas_parejo[1],
            "equipo_B": mas_parejo[2],
            "P_A_gana": mas_parejo[4],
            "P_empate": mas_parejo[5],
            "P_B_gana": mas_parejo[6]
        },
        "todos_grupos_elo": {
            g: {"suma_elo": elo_sum, "equipos": equipos}
            for g, (elo_sum, equipos) in sorted(grupos_elo.items(), key=lambda x: -x[1][0])
        }
    }

    output_path = "E:/UCB/5 Semestre/IA AGENTES/mundial2026/outputs/simulation_results_v2.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(resultados_json, f, ensure_ascii=False, indent=2)

    print(f"\nResultados guardados en: {output_path}")
    return resultados_json


if __name__ == "__main__":
    main()
