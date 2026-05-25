#!/usr/bin/env python3
"""
Agente de Probabilidades - FIFA World Cup 2026
Modelo: ELO-Historial-Combinado v1.0
Fecha: 2026-05-17
"""

import json
import math

# ============================================================
# DATOS BASE
# ============================================================

# Ajustes por confederacion
CONF_AJUSTE = {
    "UEFA": 50,
    "CONMEBOL": 40,
    "CONCACAF": 10,
    "CAF": 5,
    "AFC": 5,
    "OFC": -10
}

# Rankings FIFA (posicion y puntos donde disponibles)
RANKINGS = {
    "France": {"ranking": 1, "confederacion": "UEFA"},
    "Spain": {"ranking": 2, "confederacion": "UEFA"},
    "Argentina": {"ranking": 3, "confederacion": "CONMEBOL"},
    "England": {"ranking": 4, "confederacion": "UEFA"},
    "Portugal": {"ranking": 5, "confederacion": "UEFA"},
    "Brazil": {"ranking": 6, "confederacion": "CONMEBOL"},
    "Netherlands": {"ranking": 7, "confederacion": "UEFA"},
    "Morocco": {"ranking": 8, "confederacion": "CAF"},
    "Belgium": {"ranking": 9, "confederacion": "UEFA"},
    "Germany": {"ranking": 10, "confederacion": "UEFA"},
    "Croatia": {"ranking": 11, "confederacion": "UEFA"},
    "Colombia": {"ranking": 13, "confederacion": "CONMEBOL"},
    "Senegal": {"ranking": 14, "confederacion": "CAF"},
    "Mexico": {"ranking": 15, "confederacion": "CONCACAF"},
    "United States": {"ranking": 16, "confederacion": "CONCACAF"},
    "Uruguay": {"ranking": 17, "confederacion": "CONMEBOL"},
    "Japan": {"ranking": 18, "confederacion": "AFC"},
    "Switzerland": {"ranking": 19, "confederacion": "UEFA"},
    "Iran": {"ranking": 21, "confederacion": "AFC"},
    "Turkiye": {"ranking": 22, "confederacion": "UEFA"},
    "Ecuador": {"ranking": 23, "confederacion": "CONMEBOL"},
    "Austria": {"ranking": 24, "confederacion": "UEFA"},
    "South Korea": {"ranking": 25, "confederacion": "AFC"},
    "Australia": {"ranking": 27, "confederacion": "AFC"},
    "Algeria": {"ranking": 28, "confederacion": "CAF"},
    "Egypt": {"ranking": 29, "confederacion": "CAF"},
    "Canada": {"ranking": 30, "confederacion": "CONCACAF"},
    "Norway": {"ranking": 31, "confederacion": "UEFA"},
    "Panama": {"ranking": 33, "confederacion": "CONCACAF"},
    "Ivory Coast": {"ranking": 34, "confederacion": "CAF"},
    "Sweden": {"ranking": 38, "confederacion": "UEFA"},
    "Paraguay": {"ranking": 40, "confederacion": "CONMEBOL"},
    "Czechia": {"ranking": 41, "confederacion": "UEFA"},
    "Scotland": {"ranking": 43, "confederacion": "UEFA"},
    "Tunisia": {"ranking": 44, "confederacion": "CAF"},
    "DR Congo": {"ranking": 46, "confederacion": "CAF"},
    "Uzbekistan": {"ranking": 50, "confederacion": "AFC"},
    "Qatar": {"ranking": 55, "confederacion": "AFC"},
    "Iraq": {"ranking": 57, "confederacion": "AFC"},
    "South Africa": {"ranking": 60, "confederacion": "CAF"},
    "Saudi Arabia": {"ranking": 61, "confederacion": "AFC"},
    "Jordan": {"ranking": 63, "confederacion": "AFC"},
    "Bosnia and Herzegovina": {"ranking": 65, "confederacion": "UEFA"},
    "Cape Verde": {"ranking": 69, "confederacion": "CAF"},
    "Ghana": {"ranking": 74, "confederacion": "CAF"},
    "Curacao": {"ranking": 82, "confederacion": "CONCACAF"},
    "Haiti": {"ranking": 83, "confederacion": "CONCACAF"},
    "New Zealand": {"ranking": 85, "confederacion": "OFC"},
}

# Historial por equipo (de resumen_por_equipo.json)
HISTORIAL = {
    "Algeria": {"partidos": 69, "victorias": 45, "empates": 17, "derrotas": 7, "gf": 149, "gc": 47, "ultimos_5": "WWWWL"},
    "Argentina": {"partidos": 66, "victorias": 42, "empates": 15, "derrotas": 9, "gf": 110, "gc": 45, "ultimos_5": "WWDWL"},
    "Australia": {"partidos": 53, "victorias": 31, "empates": 11, "derrotas": 11, "gf": 104, "gc": 37, "ultimos_5": "DWWWW"},
    "Austria": {"partidos": 69, "victorias": 37, "empates": 10, "derrotas": 22, "gf": 123, "gc": 76, "ultimos_5": "WWLWD"},
    "Belgium": {"partidos": 79, "victorias": 52, "empates": 11, "derrotas": 16, "gf": 193, "gc": 70, "ultimos_5": "WDWDW"},
    "Bosnia and Herzegovina": {"partidos": 62, "victorias": 19, "empates": 17, "derrotas": 26, "gf": 79, "gc": 98, "ultimos_5": "DWDDD"},
    "Brazil": {"partidos": 62, "victorias": 38, "empates": 15, "derrotas": 9, "gf": 110, "gc": 34, "ultimos_5": "LDWWL"},
    "Canada": {"partidos": 67, "victorias": 39, "empates": 12, "derrotas": 16, "gf": 156, "gc": 58, "ultimos_5": "WWDWD"},
    "Cape Verde": {"partidos": 48, "victorias": 21, "empates": 15, "derrotas": 12, "gf": 55, "gc": 41, "ultimos_5": "WWWDW"},
    "Colombia": {"partidos": 57, "victorias": 23, "empates": 21, "derrotas": 13, "gf": 77, "gc": 50, "ultimos_5": "DDDWW"},
    "Croatia": {"partidos": 81, "victorias": 41, "empates": 20, "derrotas": 20, "gf": 144, "gc": 93, "ultimos_5": "WDWWW"},
    "Curacao": {"partidos": 46, "victorias": 21, "empates": 12, "derrotas": 13, "gf": 97, "gc": 38, "ultimos_5": "WWDWD"},
    "Czechia": {"partidos": 65, "victorias": 30, "empates": 13, "derrotas": 22, "gf": 97, "gc": 78, "ultimos_5": "DLWDD"},
    "DR Congo": {"partidos": 59, "victorias": 26, "empates": 19, "derrotas": 14, "gf": 71, "gc": 46, "ultimos_5": "WDWLW"},
    "Ecuador": {"partidos": 51, "victorias": 17, "empates": 20, "derrotas": 14, "gf": 57, "gc": 47, "ultimos_5": "DDDDW"},
    "Egypt": {"partidos": 75, "victorias": 42, "empates": 23, "derrotas": 10, "gf": 118, "gc": 48, "ultimos_5": "DWWLD"},
    "England": {"partidos": 84, "victorias": 53, "empates": 17, "derrotas": 14, "gf": 198, "gc": 58, "ultimos_5": "WWWWW"},
    "France": {"partidos": 84, "victorias": 55, "empates": 19, "derrotas": 10, "gf": 175, "gc": 71, "ultimos_5": "WWDWW"},
    "Germany": {"partidos": 65, "victorias": 35, "empates": 15, "derrotas": 15, "gf": 155, "gc": 75, "ultimos_5": "WWWWW"},
    "Ghana": {"partidos": 52, "victorias": 23, "empates": 17, "derrotas": 12, "gf": 72, "gc": 45, "ultimos_5": "WDWWW"},
    "Haiti": {"partidos": 55, "victorias": 32, "empates": 10, "derrotas": 13, "gf": 139, "gc": 62, "ultimos_5": "DWLWW"},
    "Iran": {"partidos": 55, "victorias": 38, "empates": 8, "derrotas": 9, "gf": 126, "gc": 41, "ultimos_5": "WWDLW"},
    "Iraq": {"partidos": 72, "victorias": 36, "empates": 21, "derrotas": 15, "gf": 98, "gc": 62, "ultimos_5": "WWLLW"},
    "Ivory Coast": {"partidos": 60, "victorias": 39, "empates": 12, "derrotas": 9, "gf": 108, "gc": 38, "ultimos_5": "WDWWL"},
    "Japan": {"partidos": 62, "victorias": 43, "empates": 8, "derrotas": 11, "gf": 163, "gc": 43, "ultimos_5": "WWDLW"},
    "Jordan": {"partidos": 52, "victorias": 29, "empates": 12, "derrotas": 11, "gf": 92, "gc": 40, "ultimos_5": "WWWWL"},
    "Mexico": {"partidos": 68, "victorias": 43, "empates": 12, "derrotas": 13, "gf": 108, "gc": 48, "ultimos_5": "WDWWW"},
    "Morocco": {"partidos": 77, "victorias": 55, "empates": 15, "derrotas": 7, "gf": 158, "gc": 37, "ultimos_5": "WWWDW"},
    "Netherlands": {"partidos": 77, "victorias": 47, "empates": 17, "derrotas": 13, "gf": 183, "gc": 76, "ultimos_5": "WWWDW"},
    "New Zealand": {"partidos": 18, "victorias": 16, "empates": 0, "derrotas": 2, "gf": 66, "gc": 6, "ultimos_5": "WWWWW"},
    "Norway": {"partidos": 61, "victorias": 34, "empates": 14, "derrotas": 13, "gf": 127, "gc": 61, "ultimos_5": "WWWWW"},
    "Panama": {"partidos": 76, "victorias": 40, "empates": 14, "derrotas": 22, "gf": 134, "gc": 91, "ultimos_5": "DWDWW"},
    "Paraguay": {"partidos": 48, "victorias": 12, "empates": 18, "derrotas": 18, "gf": 40, "gc": 54, "ultimos_5": "DWLDW"},
    "Portugal": {"partidos": 80, "victorias": 50, "empates": 17, "derrotas": 13, "gf": 184, "gc": 66, "ultimos_5": "WWDLW"},
    "Qatar": {"partidos": 75, "victorias": 41, "empates": 13, "derrotas": 21, "gf": 138, "gc": 82, "ultimos_5": "DWLDL"},
    "Saudi Arabia": {"partidos": 77, "victorias": 37, "empates": 15, "derrotas": 25, "gf": 102, "gc": 74, "ultimos_5": "WWLWL"},
    "Scotland": {"partidos": 67, "victorias": 34, "empates": 12, "derrotas": 21, "gf": 102, "gc": 81, "ultimos_5": "WWWLW"},
    "Senegal": {"partidos": 82, "victorias": 53, "empates": 20, "derrotas": 9, "gf": 139, "gc": 51, "ultimos_5": "WWWWL"},
    "South Africa": {"partidos": 73, "victorias": 36, "empates": 24, "derrotas": 13, "gf": 106, "gc": 55, "ultimos_5": "WWLWL"},
    "South Korea": {"partidos": 57, "victorias": 36, "empates": 13, "derrotas": 8, "gf": 110, "gc": 38, "ultimos_5": "DDDWW"},
    "Spain": {"partidos": 83, "victorias": 53, "empates": 22, "derrotas": 8, "gf": 199, "gc": 70, "ultimos_5": "WWWWD"},
    "Sweden": {"partidos": 67, "victorias": 31, "empates": 10, "derrotas": 26, "gf": 107, "gc": 83, "ultimos_5": "LLDWW"},
    "Switzerland": {"partidos": 74, "victorias": 31, "empates": 26, "derrotas": 17, "gf": 132, "gc": 87, "ultimos_5": "WWDWD"},
    "Tunisia": {"partidos": 75, "victorias": 41, "empates": 16, "derrotas": 18, "gf": 116, "gc": 52, "ultimos_5": "WWLDD"},
    "Turkiye": {"partidos": 69, "victorias": 38, "empates": 14, "derrotas": 17, "gf": 131, "gc": 84, "ultimos_5": "WWDWW"},
    "United States": {"partidos": 64, "victorias": 41, "empates": 11, "derrotas": 12, "gf": 135, "gc": 45, "ultimos_5": "WWDWL"},
    "Uruguay": {"partidos": 59, "victorias": 27, "empates": 18, "derrotas": 14, "gf": 75, "gc": 47, "ultimos_5": "DLWWD"},
    "Uzbekistan": {"partidos": 40, "victorias": 25, "empates": 9, "derrotas": 6, "gf": 78, "gc": 28, "ultimos_5": "WWDDW"},
}

# Equipos con datos escasos (< 20 partidos o flags especiales)
DATOS_ESCASOS = {"New Zealand", "Uzbekistan", "Curacao", "Cape Verde"}

# ============================================================
# FUNCIONES DE CALCULO
# ============================================================

def calcular_elo(equipo):
    """Calcula ELO ajustado segun formula del sistema."""
    ranking = RANKINGS[equipo]["ranking"]
    conf = RANKINGS[equipo]["confederacion"]
    # posicion_FIFA_inversa: rank 1 -> 100 puntos, rank 85 -> ~0
    # Usamos: (100 - ranking + 1) * 10 para que rank 1 = 1000, rank 100 = 10
    # Segun formula: 1500 + (posicion_FIFA_inversa x 10) + ajuste_conf
    # posicion_FIFA_inversa = 100 - ranking (para rank 1 -> 99, rank 85 -> 15)
    pos_inversa = max(0, 101 - ranking)
    elo = 1500 + (pos_inversa * 10) + CONF_AJUSTE[conf]
    return round(elo, 2)

def calcular_forma_reciente(ultimos_5):
    """Calcula forma reciente como win_rate de ultimos 5 partidos."""
    if not ultimos_5:
        return 0.5
    wins = ultimos_5.count('W')
    total = len(ultimos_5)
    return wins / total

def calcular_estadisticas_equipo(equipo):
    """Calcula win_rate, draw_rate, GF_avg, GA_avg, GD_avg para un equipo."""
    if equipo not in HISTORIAL:
        return None
    h = HISTORIAL[equipo]
    total = h["partidos"]
    if total == 0:
        return None
    win_rate = h["victorias"] / total
    draw_rate = h["empates"] / total
    gf_avg = h["gf"] / total
    ga_avg = h["gc"] / total
    gd_avg = gf_avg - ga_avg
    fuerza_ataque = gf_avg / 1.5
    fuerza_defensa = 1 - (ga_avg / 1.5)
    forma_reciente = calcular_forma_reciente(h.get("ultimos_5", ""))
    return {
        "win_rate": round(win_rate, 4),
        "draw_rate": round(draw_rate, 4),
        "gf_avg": round(gf_avg, 4),
        "ga_avg": round(ga_avg, 4),
        "gd_avg": round(gd_avg, 4),
        "fuerza_ataque": round(fuerza_ataque, 4),
        "fuerza_defensa": round(fuerza_defensa, 4),
        "forma_reciente": round(forma_reciente, 4),
    }

def calcular_probabilidades_partido(equipo_a, equipo_b):
    """
    Aplica el modelo ELO-Historial-Combinado v1.0.
    Retorna dict con probabilidades, inputs del modelo, flags.
    """
    flags = []
    datos_incompletos = False

    elo_a = calcular_elo(equipo_a)
    elo_b = calcular_elo(equipo_b)
    elo_diff = elo_a - elo_b

    # Probabilidad ELO
    p_elo_a = 1 / (1 + 10 ** (-elo_diff / 400))
    p_elo_b = 1 - p_elo_a

    # Historial
    stats_a = calcular_estadisticas_equipo(equipo_a)
    stats_b = calcular_estadisticas_equipo(equipo_b)

    # Verificar datos escasos
    if equipo_a in DATOS_ESCASOS or equipo_b in DATOS_ESCASOS:
        datos_incompletos = True
        flags.append("datos_escasos")

    if stats_a is None or stats_b is None:
        datos_incompletos = True
        flags.append("historial_faltante")
        # Solo ELO puro
        peso_elo = 0.90
        peso_hist = 0.10
        peso_forma = 0.0
        win_rate_a = 0.5
        win_rate_b = 0.5
        draw_rate_a = 0.25
        draw_rate_b = 0.25
        forma_a = 0.5
        forma_b = 0.5
        gd_avg_a = 0.0
        gd_avg_b = 0.0
    else:
        peso_elo = 0.55
        peso_hist = 0.35
        peso_forma = 0.10
        win_rate_a = stats_a["win_rate"]
        win_rate_b = stats_b["win_rate"]
        draw_rate_a = stats_a["draw_rate"]
        draw_rate_b = stats_b["draw_rate"]
        forma_a = stats_a["forma_reciente"]
        forma_b = stats_b["forma_reciente"]
        gd_avg_a = stats_a["gd_avg"]
        gd_avg_b = stats_b["gd_avg"]

        # Verificar discrepancia ranking vs historial
        # Equipo top 20 pero win_rate < 0.40
        ranking_a = RANKINGS[equipo_a]["ranking"]
        ranking_b = RANKINGS[equipo_b]["ranking"]
        if (ranking_a <= 20 and win_rate_a < 0.40) or (ranking_b <= 20 and win_rate_b < 0.40):
            flags.append("discrepancia_ranking_historial")

    # Score combinado
    score_a = (p_elo_a * peso_elo) + (win_rate_a * peso_hist) + (forma_a * peso_forma)
    score_b = (p_elo_b * peso_elo) + (win_rate_b * peso_hist) + (forma_b * peso_forma)

    # Probabilidades raw
    total_score = score_a + score_b
    p_raw_a = score_a / total_score
    p_raw_b = score_b / total_score

    # Ajuste empate
    draw_base = (draw_rate_a + draw_rate_b) / 2
    level_diff_factor = max(0.0, min(1.0, 1 - abs(elo_diff) / 800))
    p_draw_raw = draw_base * level_diff_factor * 1.2

    # Redistribucion
    resto = 1.0 - p_draw_raw
    p_a = p_raw_a * resto
    p_b = p_raw_b * resto

    # Normalizacion final
    total = p_a + p_draw_raw + p_b
    p_a_final = p_a / total
    p_draw_final = p_draw_raw / total
    p_b_final = p_b / total

    # Aplicar rango minimo/maximo (0.05 - 0.90)
    normalizacion_emergencia = False
    MIN_P = 0.05
    MAX_P = 0.90

    def clamp(val):
        return max(MIN_P, min(MAX_P, val))

    p_a_c = clamp(p_a_final)
    p_draw_c = clamp(p_draw_final)
    p_b_c = clamp(p_b_final)

    if (p_a_c != p_a_final) or (p_draw_c != p_draw_final) or (p_b_c != p_b_final):
        normalizacion_emergencia = True
        flags.append("normalizacion_emergencia")
        # Re-normalizar despues del clamping
        t2 = p_a_c + p_draw_c + p_b_c
        p_a_final = p_a_c / t2
        p_draw_final = p_draw_c / t2
        p_b_final = p_b_c / t2
    else:
        p_a_final = p_a_c
        p_draw_final = p_draw_c
        p_b_final = p_b_c

    # Verificacion suma
    suma = round(p_a_final + p_draw_final + p_b_final, 4)
    verificacion = "PASSED" if abs(suma - 1.0) <= 0.0001 else "FAILED"

    return {
        "p_a": round(p_a_final, 4),
        "p_draw": round(p_draw_final, 4),
        "p_b": round(p_b_final, 4),
        "suma": round(p_a_final + p_draw_final + p_b_final, 4),
        "verificacion": verificacion,
        "elo_a": elo_a,
        "elo_b": elo_b,
        "elo_diff": round(elo_diff, 2),
        "win_rate_a": round(win_rate_a, 4) if stats_a else None,
        "win_rate_b": round(win_rate_b, 4) if stats_b else None,
        "gd_avg_a": round(gd_avg_a, 4),
        "gd_avg_b": round(gd_avg_b, 4),
        "datos_incompletos": datos_incompletos,
        "normalizacion_emergencia": normalizacion_emergencia,
        "flags": flags,
    }

# ============================================================
# FIXTURE FASE DE GRUPOS
# ============================================================

FIXTURE_GRUPOS = [
    # Grupo A
    {"partido": 1, "grupo": "A", "fecha": "2026-06-11", "hora_et": "15:00", "equipo_a": "Mexico", "equipo_b": "South Africa", "estadio": "Estadio Azteca", "ciudad": "Mexico City", "pais": "Mexico"},
    {"partido": 2, "grupo": "A", "fecha": "2026-06-11", "hora_et": "22:00", "equipo_a": "South Korea", "equipo_b": "Czechia", "estadio": "Estadio Akron", "ciudad": "Zapopan", "pais": "Mexico"},
    {"partido": 25, "grupo": "A", "fecha": "2026-06-18", "hora_et": "12:00", "equipo_a": "Czechia", "equipo_b": "South Africa", "estadio": "Mercedes-Benz Stadium", "ciudad": "Atlanta", "pais": "United States"},
    {"partido": 28, "grupo": "A", "fecha": "2026-06-18", "hora_et": "21:00", "equipo_a": "Mexico", "equipo_b": "South Korea", "estadio": "Estadio Akron", "ciudad": "Zapopan", "pais": "Mexico"},
    {"partido": 53, "grupo": "A", "fecha": "2026-06-24", "hora_et": "21:00", "equipo_a": "South Africa", "equipo_b": "South Korea", "estadio": "Estadio Akron", "ciudad": "Zapopan", "pais": "Mexico"},
    {"partido": 54, "grupo": "A", "fecha": "2026-06-24", "hora_et": "21:00", "equipo_a": "Czechia", "equipo_b": "Mexico", "estadio": "Estadio Azteca", "ciudad": "Mexico City", "pais": "Mexico"},
    # Grupo B
    {"partido": 3, "grupo": "B", "fecha": "2026-06-12", "hora_et": "15:00", "equipo_a": "Canada", "equipo_b": "Bosnia and Herzegovina", "estadio": "BMO Field", "ciudad": "Toronto", "pais": "Canada"},
    {"partido": 5, "grupo": "B", "fecha": "2026-06-13", "hora_et": "15:00", "equipo_a": "Qatar", "equipo_b": "Switzerland", "estadio": "Levi's Stadium", "ciudad": "Santa Clara", "pais": "United States"},
    {"partido": 26, "grupo": "B", "fecha": "2026-06-18", "hora_et": "15:00", "equipo_a": "Switzerland", "equipo_b": "Bosnia and Herzegovina", "estadio": "SoFi Stadium", "ciudad": "Inglewood", "pais": "United States"},
    {"partido": 27, "grupo": "B", "fecha": "2026-06-18", "hora_et": "18:00", "equipo_a": "Canada", "equipo_b": "Qatar", "estadio": "BC Place", "ciudad": "Vancouver", "pais": "Canada"},
    {"partido": 49, "grupo": "B", "fecha": "2026-06-24", "hora_et": "15:00", "equipo_a": "Switzerland", "equipo_b": "Canada", "estadio": "BC Place", "ciudad": "Vancouver", "pais": "Canada"},
    {"partido": 50, "grupo": "B", "fecha": "2026-06-24", "hora_et": "15:00", "equipo_a": "Bosnia and Herzegovina", "equipo_b": "Qatar", "estadio": "Lumen Field", "ciudad": "Seattle", "pais": "United States"},
    # Grupo C
    {"partido": 6, "grupo": "C", "fecha": "2026-06-13", "hora_et": "18:00", "equipo_a": "Brazil", "equipo_b": "Morocco", "estadio": "MetLife Stadium", "ciudad": "East Rutherford", "pais": "United States"},
    {"partido": 7, "grupo": "C", "fecha": "2026-06-13", "hora_et": "21:00", "equipo_a": "Haiti", "equipo_b": "Scotland", "estadio": "Gillette Stadium", "ciudad": "Foxborough", "pais": "United States"},
    {"partido": 30, "grupo": "C", "fecha": "2026-06-19", "hora_et": "18:00", "equipo_a": "Scotland", "equipo_b": "Morocco", "estadio": "Gillette Stadium", "ciudad": "Foxborough", "pais": "United States"},
    {"partido": 31, "grupo": "C", "fecha": "2026-06-19", "hora_et": "20:30", "equipo_a": "Brazil", "equipo_b": "Haiti", "estadio": "Lincoln Financial Field", "ciudad": "Philadelphia", "pais": "United States"},
    {"partido": 51, "grupo": "C", "fecha": "2026-06-24", "hora_et": "18:00", "equipo_a": "Morocco", "equipo_b": "Haiti", "estadio": "Mercedes-Benz Stadium", "ciudad": "Atlanta", "pais": "United States"},
    {"partido": 52, "grupo": "C", "fecha": "2026-06-24", "hora_et": "18:00", "equipo_a": "Scotland", "equipo_b": "Brazil", "estadio": "Hard Rock Stadium", "ciudad": "Miami Gardens", "pais": "United States"},
    # Grupo D
    {"partido": 4, "grupo": "D", "fecha": "2026-06-12", "hora_et": "21:00", "equipo_a": "United States", "equipo_b": "Paraguay", "estadio": "SoFi Stadium", "ciudad": "Inglewood", "pais": "United States"},
    {"partido": 8, "grupo": "D", "fecha": "2026-06-14", "hora_et": "00:00", "equipo_a": "Australia", "equipo_b": "Turkiye", "estadio": "BC Place", "ciudad": "Vancouver", "pais": "Canada"},
    {"partido": 29, "grupo": "D", "fecha": "2026-06-19", "hora_et": "15:00", "equipo_a": "United States", "equipo_b": "Australia", "estadio": "Lumen Field", "ciudad": "Seattle", "pais": "United States"},
    {"partido": 32, "grupo": "D", "fecha": "2026-06-19", "hora_et": "23:00", "equipo_a": "Turkiye", "equipo_b": "Paraguay", "estadio": "Levi's Stadium", "ciudad": "Santa Clara", "pais": "United States"},
    {"partido": 59, "grupo": "D", "fecha": "2026-06-25", "hora_et": "22:00", "equipo_a": "Turkiye", "equipo_b": "United States", "estadio": "SoFi Stadium", "ciudad": "Inglewood", "pais": "United States"},
    {"partido": 60, "grupo": "D", "fecha": "2026-06-25", "hora_et": "22:00", "equipo_a": "Paraguay", "equipo_b": "Australia", "estadio": "Levi's Stadium", "ciudad": "Santa Clara", "pais": "United States"},
    # Grupo E
    {"partido": 9, "grupo": "E", "fecha": "2026-06-14", "hora_et": "13:00", "equipo_a": "Germany", "equipo_b": "Curacao", "estadio": "NRG Stadium", "ciudad": "Houston", "pais": "United States"},
    {"partido": 11, "grupo": "E", "fecha": "2026-06-14", "hora_et": "19:00", "equipo_a": "Ivory Coast", "equipo_b": "Ecuador", "estadio": "Lincoln Financial Field", "ciudad": "Philadelphia", "pais": "United States"},
    {"partido": 34, "grupo": "E", "fecha": "2026-06-20", "hora_et": "16:00", "equipo_a": "Germany", "equipo_b": "Ivory Coast", "estadio": "BMO Field", "ciudad": "Toronto", "pais": "Canada"},
    {"partido": 35, "grupo": "E", "fecha": "2026-06-20", "hora_et": "20:00", "equipo_a": "Ecuador", "equipo_b": "Curacao", "estadio": "Arrowhead Stadium", "ciudad": "Kansas City", "pais": "United States"},
    {"partido": 55, "grupo": "E", "fecha": "2026-06-25", "hora_et": "16:00", "equipo_a": "Curacao", "equipo_b": "Ivory Coast", "estadio": "Lincoln Financial Field", "ciudad": "Philadelphia", "pais": "United States"},
    {"partido": 56, "grupo": "E", "fecha": "2026-06-25", "hora_et": "16:00", "equipo_a": "Ecuador", "equipo_b": "Germany", "estadio": "MetLife Stadium", "ciudad": "East Rutherford", "pais": "United States"},
    # Grupo F
    {"partido": 10, "grupo": "F", "fecha": "2026-06-14", "hora_et": "16:00", "equipo_a": "Netherlands", "equipo_b": "Japan", "estadio": "AT&T Stadium", "ciudad": "Arlington", "pais": "United States"},
    {"partido": 12, "grupo": "F", "fecha": "2026-06-14", "hora_et": "22:00", "equipo_a": "Sweden", "equipo_b": "Tunisia", "estadio": "Estadio Akron", "ciudad": "Zapopan", "pais": "Mexico"},
    {"partido": 33, "grupo": "F", "fecha": "2026-06-20", "hora_et": "13:00", "equipo_a": "Netherlands", "equipo_b": "Sweden", "estadio": "NRG Stadium", "ciudad": "Houston", "pais": "United States"},
    {"partido": 36, "grupo": "F", "fecha": "2026-06-21", "hora_et": "00:00", "equipo_a": "Tunisia", "equipo_b": "Japan", "estadio": "Estadio Akron", "ciudad": "Zapopan", "pais": "Mexico"},
    {"partido": 57, "grupo": "F", "fecha": "2026-06-25", "hora_et": "19:00", "equipo_a": "Tunisia", "equipo_b": "Netherlands", "estadio": "Arrowhead Stadium", "ciudad": "Kansas City", "pais": "United States"},
    {"partido": 58, "grupo": "F", "fecha": "2026-06-25", "hora_et": "19:00", "equipo_a": "Japan", "equipo_b": "Sweden", "estadio": "AT&T Stadium", "ciudad": "Arlington", "pais": "United States"},
    # Grupo G
    {"partido": 14, "grupo": "G", "fecha": "2026-06-15", "hora_et": "15:00", "equipo_a": "Belgium", "equipo_b": "Egypt", "estadio": "Lumen Field", "ciudad": "Seattle", "pais": "United States"},
    {"partido": 16, "grupo": "G", "fecha": "2026-06-15", "hora_et": "21:00", "equipo_a": "Iran", "equipo_b": "New Zealand", "estadio": "SoFi Stadium", "ciudad": "Inglewood", "pais": "United States"},
    {"partido": 38, "grupo": "G", "fecha": "2026-06-21", "hora_et": "15:00", "equipo_a": "Belgium", "equipo_b": "Iran", "estadio": "SoFi Stadium", "ciudad": "Inglewood", "pais": "United States"},
    {"partido": 40, "grupo": "G", "fecha": "2026-06-21", "hora_et": "21:00", "equipo_a": "New Zealand", "equipo_b": "Egypt", "estadio": "BC Place", "ciudad": "Vancouver", "pais": "Canada"},
    {"partido": 65, "grupo": "G", "fecha": "2026-06-26", "hora_et": "23:00", "equipo_a": "New Zealand", "equipo_b": "Belgium", "estadio": "BC Place", "ciudad": "Vancouver", "pais": "Canada"},
    {"partido": 66, "grupo": "G", "fecha": "2026-06-26", "hora_et": "23:00", "equipo_a": "Egypt", "equipo_b": "Iran", "estadio": "Lumen Field", "ciudad": "Seattle", "pais": "United States"},
    # Grupo H
    {"partido": 13, "grupo": "H", "fecha": "2026-06-15", "hora_et": "12:00", "equipo_a": "Spain", "equipo_b": "Cape Verde", "estadio": "Mercedes-Benz Stadium", "ciudad": "Atlanta", "pais": "United States"},
    {"partido": 15, "grupo": "H", "fecha": "2026-06-15", "hora_et": "18:00", "equipo_a": "Saudi Arabia", "equipo_b": "Uruguay", "estadio": "Hard Rock Stadium", "ciudad": "Miami Gardens", "pais": "United States"},
    {"partido": 37, "grupo": "H", "fecha": "2026-06-21", "hora_et": "12:00", "equipo_a": "Spain", "equipo_b": "Saudi Arabia", "estadio": "Mercedes-Benz Stadium", "ciudad": "Atlanta", "pais": "United States"},
    {"partido": 39, "grupo": "H", "fecha": "2026-06-21", "hora_et": "18:00", "equipo_a": "Uruguay", "equipo_b": "Cape Verde", "estadio": "Hard Rock Stadium", "ciudad": "Miami Gardens", "pais": "United States"},
    {"partido": 63, "grupo": "H", "fecha": "2026-06-26", "hora_et": "20:00", "equipo_a": "Cape Verde", "equipo_b": "Saudi Arabia", "estadio": "NRG Stadium", "ciudad": "Houston", "pais": "United States"},
    {"partido": 64, "grupo": "H", "fecha": "2026-06-26", "hora_et": "20:00", "equipo_a": "Uruguay", "equipo_b": "Spain", "estadio": "Estadio Akron", "ciudad": "Zapopan", "pais": "Mexico"},
    # Grupo I
    {"partido": 17, "grupo": "I", "fecha": "2026-06-16", "hora_et": "15:00", "equipo_a": "France", "equipo_b": "Senegal", "estadio": "MetLife Stadium", "ciudad": "East Rutherford", "pais": "United States"},
    {"partido": 18, "grupo": "I", "fecha": "2026-06-16", "hora_et": "18:00", "equipo_a": "Iraq", "equipo_b": "Norway", "estadio": "Gillette Stadium", "ciudad": "Foxborough", "pais": "United States"},
    {"partido": 42, "grupo": "I", "fecha": "2026-06-22", "hora_et": "17:00", "equipo_a": "France", "equipo_b": "Iraq", "estadio": "Lincoln Financial Field", "ciudad": "Philadelphia", "pais": "United States"},
    {"partido": 43, "grupo": "I", "fecha": "2026-06-22", "hora_et": "20:00", "equipo_a": "Norway", "equipo_b": "Senegal", "estadio": "BMO Field", "ciudad": "Toronto", "pais": "Canada"},
    {"partido": 61, "grupo": "I", "fecha": "2026-06-26", "hora_et": "15:00", "equipo_a": "Norway", "equipo_b": "France", "estadio": "Gillette Stadium", "ciudad": "Foxborough", "pais": "United States"},
    {"partido": 62, "grupo": "I", "fecha": "2026-06-26", "hora_et": "15:00", "equipo_a": "Senegal", "equipo_b": "Iraq", "estadio": "BMO Field", "ciudad": "Toronto", "pais": "Canada"},
    # Grupo J
    {"partido": 19, "grupo": "J", "fecha": "2026-06-16", "hora_et": "21:00", "equipo_a": "Argentina", "equipo_b": "Algeria", "estadio": "Arrowhead Stadium", "ciudad": "Kansas City", "pais": "United States"},
    {"partido": 20, "grupo": "J", "fecha": "2026-06-17", "hora_et": "00:00", "equipo_a": "Austria", "equipo_b": "Jordan", "estadio": "Levi's Stadium", "ciudad": "Santa Clara", "pais": "United States"},
    {"partido": 41, "grupo": "J", "fecha": "2026-06-22", "hora_et": "13:00", "equipo_a": "Argentina", "equipo_b": "Austria", "estadio": "AT&T Stadium", "ciudad": "Arlington", "pais": "United States"},
    {"partido": 44, "grupo": "J", "fecha": "2026-06-22", "hora_et": "23:00", "equipo_a": "Jordan", "equipo_b": "Algeria", "estadio": "Levi's Stadium", "ciudad": "Santa Clara", "pais": "United States"},
    {"partido": 69, "grupo": "J", "fecha": "2026-06-27", "hora_et": "20:00", "equipo_a": "Algeria", "equipo_b": "Austria", "estadio": "Hard Rock Stadium", "ciudad": "Miami Gardens", "pais": "United States"},
    {"partido": 70, "grupo": "J", "fecha": "2026-06-27", "hora_et": "20:00", "equipo_a": "Jordan", "equipo_b": "Argentina", "estadio": "Estadio BBVA", "ciudad": "Monterrey", "pais": "Mexico"},
    # Grupo K
    {"partido": 21, "grupo": "K", "fecha": "2026-06-17", "hora_et": "13:00", "equipo_a": "Portugal", "equipo_b": "DR Congo", "estadio": "NRG Stadium", "ciudad": "Houston", "pais": "United States"},
    {"partido": 24, "grupo": "K", "fecha": "2026-06-17", "hora_et": "22:00", "equipo_a": "Uzbekistan", "equipo_b": "Colombia", "estadio": "Estadio Azteca", "ciudad": "Mexico City", "pais": "Mexico"},
    {"partido": 45, "grupo": "K", "fecha": "2026-06-23", "hora_et": "13:00", "equipo_a": "Portugal", "equipo_b": "Uzbekistan", "estadio": "NRG Stadium", "ciudad": "Houston", "pais": "United States"},
    {"partido": 48, "grupo": "K", "fecha": "2026-06-23", "hora_et": "22:00", "equipo_a": "Colombia", "equipo_b": "DR Congo", "estadio": "Estadio Akron", "ciudad": "Zapopan", "pais": "Mexico"},
    {"partido": 71, "grupo": "K", "fecha": "2026-06-27", "hora_et": "21:00", "equipo_a": "DR Congo", "equipo_b": "Uzbekistan", "estadio": "Estadio Azteca", "ciudad": "Mexico City", "pais": "Mexico"},
    {"partido": 72, "grupo": "K", "fecha": "2026-06-27", "hora_et": "21:00", "equipo_a": "Colombia", "equipo_b": "Portugal", "estadio": "AT&T Stadium", "ciudad": "Arlington", "pais": "United States"},
    # Grupo L
    {"partido": 22, "grupo": "L", "fecha": "2026-06-17", "hora_et": "16:00", "equipo_a": "England", "equipo_b": "Croatia", "estadio": "AT&T Stadium", "ciudad": "Arlington", "pais": "United States"},
    {"partido": 23, "grupo": "L", "fecha": "2026-06-17", "hora_et": "19:00", "equipo_a": "Ghana", "equipo_b": "Panama", "estadio": "BMO Field", "ciudad": "Toronto", "pais": "Canada"},
    {"partido": 46, "grupo": "L", "fecha": "2026-06-23", "hora_et": "16:00", "equipo_a": "England", "equipo_b": "Ghana", "estadio": "Gillette Stadium", "ciudad": "Foxborough", "pais": "United States"},
    {"partido": 47, "grupo": "L", "fecha": "2026-06-23", "hora_et": "19:00", "equipo_a": "Panama", "equipo_b": "Croatia", "estadio": "Gillette Stadium", "ciudad": "Foxborough", "pais": "United States"},
    {"partido": 67, "grupo": "L", "fecha": "2026-06-27", "hora_et": "17:00", "equipo_a": "Panama", "equipo_b": "England", "estadio": "MetLife Stadium", "ciudad": "East Rutherford", "pais": "United States"},
    {"partido": 68, "grupo": "L", "fecha": "2026-06-27", "hora_et": "17:00", "equipo_a": "Croatia", "equipo_b": "Ghana", "estadio": "Lincoln Financial Field", "ciudad": "Philadelphia", "pais": "United States"},
]

# ============================================================
# FIXTURE ELIMINATORIO (equipos pendientes)
# ============================================================

FIXTURE_ELIMINATORIO = {
    "ronda_32": [
        {"partido": 73, "fecha": "2026-06-28", "hora_et": "15:00", "descripcion": "2do Grupo A vs 2do Grupo B", "equipo_a": "2do_Grupo_A", "equipo_b": "2do_Grupo_B", "estadio": "SoFi Stadium", "ciudad": "Inglewood"},
        {"partido": 74, "fecha": "2026-06-29", "hora_et": "16:30", "descripcion": "1ro Grupo E vs 3ro (A/B/C/D/F)", "equipo_a": "1ro_Grupo_E", "equipo_b": "3ro_Mejor_ABCDF", "estadio": "Gillette Stadium", "ciudad": "Foxborough"},
        {"partido": 75, "fecha": "2026-06-29", "hora_et": "21:00", "descripcion": "1ro Grupo F vs 2do Grupo C", "equipo_a": "1ro_Grupo_F", "equipo_b": "2do_Grupo_C", "estadio": "Estadio Akron", "ciudad": "Zapopan"},
        {"partido": 76, "fecha": "2026-06-29", "hora_et": "13:00", "descripcion": "1ro Grupo C vs 2do Grupo F", "equipo_a": "1ro_Grupo_C", "equipo_b": "2do_Grupo_F", "estadio": "NRG Stadium", "ciudad": "Houston"},
        {"partido": 77, "fecha": "2026-06-30", "hora_et": "17:00", "descripcion": "1ro Grupo I vs 3ro (C/D/F/G/H)", "equipo_a": "1ro_Grupo_I", "equipo_b": "3ro_Mejor_CDFGH", "estadio": "MetLife Stadium", "ciudad": "East Rutherford"},
        {"partido": 78, "fecha": "2026-06-30", "hora_et": "13:00", "descripcion": "2do Grupo E vs 2do Grupo I", "equipo_a": "2do_Grupo_E", "equipo_b": "2do_Grupo_I", "estadio": "AT&T Stadium", "ciudad": "Arlington"},
        {"partido": 79, "fecha": "2026-07-01", "hora_et": "21:00", "descripcion": "1ro Grupo A vs 3ro (C/E/F/H/I)", "equipo_a": "1ro_Grupo_A", "equipo_b": "3ro_Mejor_CEFHI", "estadio": "Estadio Azteca", "ciudad": "Mexico City"},
        {"partido": 80, "fecha": "2026-07-01", "hora_et": "12:00", "descripcion": "1ro Grupo L vs 3ro (E/H/I/J/K)", "equipo_a": "1ro_Grupo_L", "equipo_b": "3ro_Mejor_EHIJK", "estadio": "Mercedes-Benz Stadium", "ciudad": "Atlanta"},
        {"partido": 81, "fecha": "2026-07-01", "hora_et": "20:00", "descripcion": "1ro Grupo D vs 3ro (B/E/F/I/J)", "equipo_a": "1ro_Grupo_D", "equipo_b": "3ro_Mejor_BEFIJ", "estadio": "Levi's Stadium", "ciudad": "Santa Clara"},
        {"partido": 82, "fecha": "2026-07-01", "hora_et": "16:00", "descripcion": "1ro Grupo G vs 3ro (A/E/H/I/J)", "equipo_a": "1ro_Grupo_G", "equipo_b": "3ro_Mejor_AEHIJ", "estadio": "Lumen Field", "ciudad": "Seattle"},
        {"partido": 83, "fecha": "2026-07-02", "hora_et": "19:00", "descripcion": "2do Grupo K vs 2do Grupo L", "equipo_a": "2do_Grupo_K", "equipo_b": "2do_Grupo_L", "estadio": "BMO Field", "ciudad": "Toronto"},
        {"partido": 84, "fecha": "2026-07-02", "hora_et": "15:00", "descripcion": "1ro Grupo H vs 2do Grupo J", "equipo_a": "1ro_Grupo_H", "equipo_b": "2do_Grupo_J", "estadio": "SoFi Stadium", "ciudad": "Inglewood"},
        {"partido": 85, "fecha": "2026-07-02", "hora_et": "23:00", "descripcion": "1ro Grupo B vs 3ro (E/F/G/I/J)", "equipo_a": "1ro_Grupo_B", "equipo_b": "3ro_Mejor_EFGIJ", "estadio": "BC Place", "ciudad": "Vancouver"},
        {"partido": 86, "fecha": "2026-07-03", "hora_et": "18:00", "descripcion": "1ro Grupo J vs 2do Grupo H", "equipo_a": "1ro_Grupo_J", "equipo_b": "2do_Grupo_H", "estadio": "Hard Rock Stadium", "ciudad": "Miami Gardens"},
        {"partido": 87, "fecha": "2026-06-28", "hora_et": "21:30", "descripcion": "1ro Grupo K vs 3ro (D/E/I/J/L)", "equipo_a": "1ro_Grupo_K", "equipo_b": "3ro_Mejor_DEIJL", "estadio": "Arrowhead Stadium", "ciudad": "Kansas City"},
        {"partido": 88, "fecha": "2026-07-03", "hora_et": "14:00", "descripcion": "2do Grupo D vs 2do Grupo G", "equipo_a": "2do_Grupo_D", "equipo_b": "2do_Grupo_G", "estadio": "AT&T Stadium", "ciudad": "Arlington"},
    ],
    "octavos": [
        {"partido": 89, "fecha": "2026-07-04", "hora_et": "17:00", "descripcion": "Ganador P74 vs Ganador P77", "equipo_a": "Ganador_P74", "equipo_b": "Ganador_P77", "estadio": "Lincoln Financial Field", "ciudad": "Philadelphia"},
        {"partido": 90, "fecha": "2026-07-04", "hora_et": "13:00", "descripcion": "Ganador P73 vs Ganador P75", "equipo_a": "Ganador_P73", "equipo_b": "Ganador_P75", "estadio": "NRG Stadium", "ciudad": "Houston"},
        {"partido": 91, "fecha": "2026-07-05", "hora_et": "16:00", "descripcion": "Ganador P76 vs Ganador P78", "equipo_a": "Ganador_P76", "equipo_b": "Ganador_P78", "estadio": "MetLife Stadium", "ciudad": "East Rutherford"},
        {"partido": 92, "fecha": "2026-07-05", "hora_et": "20:00", "descripcion": "Ganador P79 vs Ganador P80", "equipo_a": "Ganador_P79", "equipo_b": "Ganador_P80", "estadio": "Estadio Azteca", "ciudad": "Mexico City"},
        {"partido": 93, "fecha": "2026-07-06", "hora_et": "15:00", "descripcion": "Ganador P83 vs Ganador P84", "equipo_a": "Ganador_P83", "equipo_b": "Ganador_P84", "estadio": "AT&T Stadium", "ciudad": "Arlington"},
        {"partido": 94, "fecha": "2026-07-06", "hora_et": "20:00", "descripcion": "Ganador P81 vs Ganador P82", "equipo_a": "Ganador_P81", "equipo_b": "Ganador_P82", "estadio": "Lumen Field", "ciudad": "Seattle"},
        {"partido": 95, "fecha": "2026-07-07", "hora_et": "12:00", "descripcion": "Ganador P86 vs Ganador P88", "equipo_a": "Ganador_P86", "equipo_b": "Ganador_P88", "estadio": "Mercedes-Benz Stadium", "ciudad": "Atlanta"},
        {"partido": 96, "fecha": "2026-07-07", "hora_et": "16:00", "descripcion": "Ganador P85 vs Ganador P87", "equipo_a": "Ganador_P85", "equipo_b": "Ganador_P87", "estadio": "BC Place", "ciudad": "Vancouver"},
    ],
    "cuartos": [
        {"partido": 97, "fecha": "2026-07-09", "hora_et": "16:00", "descripcion": "Ganador P89 vs Ganador P90", "equipo_a": "Ganador_P89", "equipo_b": "Ganador_P90", "estadio": "Gillette Stadium", "ciudad": "Foxborough"},
        {"partido": 98, "fecha": "2026-07-10", "hora_et": "15:00", "descripcion": "Ganador P93 vs Ganador P94", "equipo_a": "Ganador_P93", "equipo_b": "Ganador_P94", "estadio": "SoFi Stadium", "ciudad": "Inglewood"},
        {"partido": 99, "fecha": "2026-07-11", "hora_et": "17:00", "descripcion": "Ganador P91 vs Ganador P92", "equipo_a": "Ganador_P91", "equipo_b": "Ganador_P92", "estadio": "Hard Rock Stadium", "ciudad": "Miami Gardens"},
        {"partido": 100, "fecha": "2026-07-11", "hora_et": "21:00", "descripcion": "Ganador P95 vs Ganador P96", "equipo_a": "Ganador_P95", "equipo_b": "Ganador_P96", "estadio": "Arrowhead Stadium", "ciudad": "Kansas City"},
    ],
    "semifinales": [
        {"partido": 101, "fecha": "2026-07-14", "hora_et": "15:00", "descripcion": "Ganador P97 vs Ganador P98", "equipo_a": "Ganador_P97", "equipo_b": "Ganador_P98", "estadio": "AT&T Stadium", "ciudad": "Arlington"},
        {"partido": 102, "fecha": "2026-07-15", "hora_et": "15:00", "descripcion": "Ganador P99 vs Ganador P100", "equipo_a": "Ganador_P99", "equipo_b": "Ganador_P100", "estadio": "Mercedes-Benz Stadium", "ciudad": "Atlanta"},
    ],
    "tercer_puesto": [
        {"partido": 103, "fecha": "2026-07-18", "hora_et": "17:00", "descripcion": "Perdedor SF1 vs Perdedor SF2", "equipo_a": "Perdedor_SF1", "equipo_b": "Perdedor_SF2", "estadio": "Hard Rock Stadium", "ciudad": "Miami Gardens"},
    ],
    "final": [
        {"partido": 104, "fecha": "2026-07-19", "hora_et": "15:00", "descripcion": "Ganador SF1 vs Ganador SF2", "equipo_a": "Ganador_SF1", "equipo_b": "Ganador_SF2", "estadio": "MetLife Stadium", "ciudad": "East Rutherford"},
    ],
}

# ============================================================
# CALCULAR ELOs
# ============================================================

def generar_elos():
    elos = {}
    for equipo in RANKINGS:
        elos[equipo] = calcular_elo(equipo)
    return dict(sorted(elos.items(), key=lambda x: -x[1]))

# ============================================================
# PROCESAMIENTO PRINCIPAL
# ============================================================

def hora_et_to_utc(fecha, hora_et):
    """Convierte hora ET (UTC-4 en verano) a UTC."""
    from datetime import datetime, timedelta
    dt_str = f"{fecha}T{hora_et}:00"
    dt = datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%S")
    dt_utc = dt + timedelta(hours=4)
    return dt_utc.strftime("%Y-%m-%dT%H:%M:%SZ")

def construir_fixture_id(grupo, partido_num):
    return f"G{grupo}-{partido_num:03d}"

def procesar_fase_grupos():
    grupos_output = {}
    stats_globales = {
        "total_partidos": 0,
        "datos_incompletos": 0,
        "normalizacion_emergencia": 0,
        "suma_failed": 0,
        "all_p_a": [],
        "all_p_draw": [],
        "all_p_b": [],
    }

    # Organizar por grupo
    grupos_dict = {}
    for p in FIXTURE_GRUPOS:
        g = p["grupo"]
        if g not in grupos_dict:
            grupos_dict[g] = []
        grupos_dict[g].append(p)

    for grupo in sorted(grupos_dict.keys()):
        partidos_grupo = grupos_dict[grupo]
        output_partidos = []

        for p in partidos_grupo:
            equipo_a = p["equipo_a"]
            equipo_b = p["equipo_b"]
            result = calcular_probabilidades_partido(equipo_a, equipo_b)

            stats_globales["total_partidos"] += 1
            if result["datos_incompletos"]:
                stats_globales["datos_incompletos"] += 1
            if result["normalizacion_emergencia"]:
                stats_globales["normalizacion_emergencia"] += 1
            if result["verificacion"] == "FAILED":
                stats_globales["suma_failed"] += 1

            stats_globales["all_p_a"].append(result["p_a"])
            stats_globales["all_p_draw"].append(result["p_draw"])
            stats_globales["all_p_b"].append(result["p_b"])

            # Fecha UTC
            fecha_utc = hora_et_to_utc(p["fecha"], p["hora_et"])

            partido_out = {
                "fixture_id": f"G{grupo}-{p['partido']:03d}",
                "partido_num": p["partido"],
                "fecha_hora_utc": fecha_utc,
                "fecha_et": p["fecha"],
                "hora_et": p["hora_et"],
                "sede": f"{p['ciudad']}, {p['pais']}",
                "estadio": p["estadio"],
                "equipo_A": equipo_a,
                "equipo_B": equipo_b,
                "probabilidades": {
                    "P_A_gana": result["p_a"],
                    "P_empate": result["p_draw"],
                    "P_B_gana": result["p_b"],
                    "suma_verificada": result["suma"],
                    "verificacion": result["verificacion"],
                },
                "inputs_modelo": {
                    "elo_A": result["elo_a"],
                    "elo_B": result["elo_b"],
                    "elo_diferencia": result["elo_diff"],
                    "win_rate_A": result["win_rate_a"],
                    "win_rate_B": result["win_rate_b"],
                    "gd_avg_A": result["gd_avg_a"],
                    "gd_avg_B": result["gd_avg_b"],
                },
                "datos_incompletos": result["datos_incompletos"],
                "flags": result["flags"] if result["flags"] else [],
            }
            output_partidos.append(partido_out)

        grupos_output[f"grupo_{grupo}"] = output_partidos

    return grupos_output, stats_globales

def construir_partido_eliminatorio(p, fase):
    return {
        "fixture_id": f"{fase}-{p['partido']:03d}",
        "partido_num": p["partido"],
        "fecha": p["fecha"],
        "hora_et": p["hora_et"],
        "descripcion": p["descripcion"],
        "equipo_A": p["equipo_a"],
        "equipo_B": p["equipo_b"],
        "estadio": p.get("estadio", "TBD"),
        "ciudad": p.get("ciudad", "TBD"),
        "equipos_pendientes": True,
        "probabilidades": "pendiente_clasificacion",
        "nota": "Las probabilidades se calcularán dinámicamente cuando el simulador proporcione los equipos clasificados.",
    }

def main():
    print("Iniciando calculo de probabilidades - FIFA World Cup 2026")
    print("Modelo: ELO-Historial-Combinado v1.0")
    print("=" * 60)

    # Calcular ELOs
    elos = generar_elos()

    # Fase de grupos
    grupos_output, stats = procesar_fase_grupos()

    # Fase eliminatoria (equipos pendientes)
    eliminatoria_output = {}

    eliminatoria_output["ronda_32"] = [
        construir_partido_eliminatorio(p, "R32") for p in FIXTURE_ELIMINATORIO["ronda_32"]
    ]
    eliminatoria_output["octavos"] = [
        construir_partido_eliminatorio(p, "OCT") for p in FIXTURE_ELIMINATORIO["octavos"]
    ]
    eliminatoria_output["cuartos"] = [
        construir_partido_eliminatorio(p, "QTR") for p in FIXTURE_ELIMINATORIO["cuartos"]
    ]
    eliminatoria_output["semifinales"] = [
        construir_partido_eliminatorio(p, "SF") for p in FIXTURE_ELIMINATORIO["semifinales"]
    ]
    eliminatoria_output["tercer_puesto"] = [
        construir_partido_eliminatorio(p, "3P") for p in FIXTURE_ELIMINATORIO["tercer_puesto"]
    ]
    eliminatoria_output["final"] = [
        construir_partido_eliminatorio(p, "FIN") for p in FIXTURE_ELIMINATORIO["final"]
    ]

    # Calcular rangos de probabilidades
    all_probs = stats["all_p_a"] + stats["all_p_draw"] + stats["all_p_b"]
    rango = {
        "min_p_victoria": round(min(stats["all_p_a"] + stats["all_p_b"]), 4),
        "max_p_victoria": round(max(stats["all_p_a"] + stats["all_p_b"]), 4),
        "min_p_empate": round(min(stats["all_p_draw"]), 4),
        "max_p_empate": round(max(stats["all_p_draw"]), 4),
        "min_global": round(min(all_probs), 4),
        "max_global": round(max(all_probs), 4),
    }

    # Construir JSON final
    output = {
        "metadata": {
            "torneo": "FIFA World Cup 2026",
            "fecha_calculo": "2026-05-17",
            "modelo": "ELO-Historial-Combinado v1.0",
            "total_partidos_procesados": stats["total_partidos"],
            "partidos_datos_incompletos": stats["datos_incompletos"],
            "partidos_normalizacion_emergencia": stats["normalizacion_emergencia"],
            "partidos_suma_failed": stats["suma_failed"],
            "verificacion_sumas": "PASSED" if stats["suma_failed"] == 0 else "REVISION_REQUERIDA",
            "rango_probabilidades": rango,
            "pesos_modelo": {
                "peso_elo": 0.55,
                "peso_historial": 0.35,
                "peso_forma_reciente": 0.10,
                "nota_datos_escasos": "Si datos escasos: peso_elo=0.90, peso_historial=0.10"
            },
        },
        "fase_grupos": grupos_output,
        "fase_eliminatoria": eliminatoria_output,
    }

    # Guardar probabilidades
    output_path = "E:/UCB/5 Semestre/IA AGENTES/mundial2026/data/probabilidades_partidos.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"Probabilidades guardadas en: {output_path}")

    # Guardar ELOs
    elos_path = "E:/UCB/5 Semestre/IA AGENTES/mundial2026/data/elos_equipos.json"
    elos_detalle = []
    for equipo, elo_val in elos.items():
        r = RANKINGS[equipo]
        elos_detalle.append({
            "equipo": equipo,
            "elo": elo_val,
            "ranking_fifa": r["ranking"],
            "confederacion": r["confederacion"],
        })

    elos_output = {
        "titulo": "ELO Calculados - FIFA World Cup 2026",
        "modelo": "ELO-Historial-Combinado v1.0",
        "fecha_calculo": "2026-05-17",
        "formula": "ELO = 1500 + ((101 - ranking_FIFA) * 10) + ajuste_confederacion",
        "ajustes_confederacion": CONF_AJUSTE,
        "equipos": elos_detalle,
        "top_5": elos_detalle[:5],
    }

    with open(elos_path, "w", encoding="utf-8") as f:
        json.dump(elos_output, f, ensure_ascii=False, indent=2)
    print(f"ELOs guardados en: {elos_path}")

    # Reporte de verificacion
    print("\n" + "=" * 60)
    print("VERIFICACION FINAL")
    print("=" * 60)
    print(f"Total de partidos de fase de grupos procesados: {stats['total_partidos']}")
    print(f"Partidos con datos incompletos: {stats['datos_incompletos']}")
    print(f"Partidos con normalizacion de emergencia: {stats['normalizacion_emergencia']}")
    print(f"Partidos con suma FAILED: {stats['suma_failed']}")
    print(f"\nRango de probabilidades:")
    print(f"  P victoria: [{rango['min_p_victoria']} - {rango['max_p_victoria']}]")
    print(f"  P empate:   [{rango['min_p_empate']} - {rango['max_p_empate']}]")
    print(f"\nTOP 5 equipos por ELO:")
    for i, e in enumerate(elos_detalle[:5], 1):
        print(f"  {i}. {e['equipo']}: ELO={e['elo']} (FIFA #{e['ranking_fifa']}, {e['confederacion']})")

    return stats, rango, elos_detalle[:5]

if __name__ == "__main__":
    main()
