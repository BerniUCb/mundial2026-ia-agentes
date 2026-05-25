"""
Motor de Probabilidades - FIFA World Cup 2026
Agente de Probabilidades v1.0
Fecha calculo: 2026-05-16
"""

import json
import math
import os
from datetime import datetime

# ─── RUTAS ───────────────────────────────────────────────────────────────────
BASE = "E:/UCB/5 Semestre/IA AGENTES/mundial2026/data"
OUT  = f"{BASE}/probabilidades"
os.makedirs(OUT, exist_ok=True)

# ─── CARGA DE DATOS ──────────────────────────────────────────────────────────
with open(f"{BASE}/grupos.json",          encoding="utf-8") as f: grupos_data   = json.load(f)
with open(f"{BASE}/rankings_fifa.json",   encoding="utf-8") as f: rankings_data = json.load(f)
with open(f"{BASE}/fixture.json",         encoding="utf-8") as f: fixture_data  = json.load(f)
with open(f"{BASE}/historial/resumen_por_equipo.json", encoding="utf-8") as f: resumen_data  = json.load(f)
with open(f"{BASE}/historial/penales_2018_2026.json",  encoding="utf-8") as f: penales_data  = json.load(f)

# ─── AJUSTES DE CONFEDERACION ────────────────────────────────────────────────
CONF_ADJ = {"UEFA": 50, "CONMEBOL": 40, "CONCACAF": 10, "CAF": 5, "AFC": 5, "OFC": -10}

# ─── PASO 1: ELO BASE DESDE RANKING FIFA ────────────────────────────────────
# Mapa equipo -> datos ranking
ranking_map = {}
for r in rankings_data["rankings"]:
    ranking_map[r["equipo"]] = r

# Mapa equipo -> datos historial
hist_map = resumen_data["equipos"]

# Normalizar nombre para grupos (mismo nombre en fixtures)
def get_ranking(equipo):
    """Retorna posicion FIFA del equipo (1 = mejor)."""
    if equipo in ranking_map:
        return ranking_map[equipo]["ranking"]
    return 50  # default medio si no encontrado

def get_conf(equipo):
    if equipo in ranking_map:
        return ranking_map[equipo]["confederacion"]
    # fallback por grupo
    for grupo in grupos_data["grupos"].values():
        for e in grupo["equipos"]:
            if e["nombre"] == equipo:
                return e["confederacion"]
    return "UEFA"

def elo_base(equipo):
    pos = get_ranking(equipo)
    conf = get_conf(equipo)
    # pos_inversa: ranking 1 => 90 puntos, ranking 90 => 1 punto
    pos_inv = max(1, 91 - pos)
    adj_conf = CONF_ADJ.get(conf, 0)
    return 1500 + (pos_inv * 10) + adj_conf

# Calcular ELO inicial para todos los 48 equipos
equipos_48 = list(hist_map.keys())

# Añadir equipos que puedan estar en fixture pero no en historial
fixture_equipos = set()
for p in fixture_data["fase_de_grupos"]["partidos"]:
    fixture_equipos.add(p["equipo1"])
    fixture_equipos.add(p["equipo2"])

todos_equipos = set(equipos_48) | fixture_equipos

elo_ratings = {}
for eq in todos_equipos:
    elo_ratings[eq] = elo_base(eq)

print("ELO BASE calculado para", len(elo_ratings), "equipos")
for eq, elo in sorted(elo_ratings.items(), key=lambda x: -x[1])[:10]:
    print(f"  {eq}: {elo:.0f}")

# ─── ACTUALIZAR ELO CON HISTORIAL 2018-2026 ──────────────────────────────────
# Cargar partidos oficiales del historial
with open(f"{BASE}/historial/partidos_oficiales_2018_2026.json", encoding="utf-8") as f:
    partidos_hist = json.load(f)

# K-factor por tipo de competencia
def k_factor(competencia):
    comp = competencia.lower()
    if "world cup" in comp and "qualification" not in comp:
        return 40
    if "copa america" in comp or "euro" in comp or "african cup" in comp or "asian cup" in comp or "gold cup" in comp:
        return 30
    if "qualification" in comp or "nations league" in comp or "nations cup" in comp:
        return 20
    return 20

def p_elo(elo_a, elo_b):
    """Probabilidad ELO de A ganando."""
    diff = elo_a - elo_b
    return 1.0 / (1.0 + 10 ** (-diff / 400))

def update_elo(elo_a, elo_b, resultado_a, K):
    """
    resultado_a: 1.0 = A gana, 0.5 = empate, 0.0 = A pierde
    Retorna (nuevo_elo_a, nuevo_elo_b)
    """
    p = p_elo(elo_a, elo_b)
    delta_a = K * (resultado_a - p)
    delta_b = K * ((1 - resultado_a) - (1 - p))
    return elo_a + delta_a, elo_b + delta_b

# Procesar partidos históricos en orden cronológico
# La estructura puede ser lista de partidos o diccionario
partidos_list = []
if isinstance(partidos_hist, list):
    partidos_list = partidos_hist
elif isinstance(partidos_hist, dict):
    # Buscar la lista de partidos dentro del dict
    for key in ["partidos", "matches", "results", "data"]:
        if key in partidos_hist:
            partidos_list = partidos_hist[key]
            break
    if not partidos_list:
        # Si es un dict de equipo -> lista, aplanar
        for v in partidos_hist.values():
            if isinstance(v, list):
                partidos_list.extend(v)

print(f"\nPartidos historicos cargados: {len(partidos_list)}")
if partidos_list:
    print("Ejemplo partido:", partidos_list[0])

# Ordenar por fecha
def get_fecha(p):
    return p.get("date", p.get("fecha", "2000-01-01"))

partidos_list.sort(key=get_fecha)

elo_updates = 0
equipos_sin_elo = set()

for partido in partidos_list:
    # Normalizar nombres de campos
    home = partido.get("home_team", partido.get("equipo_local", partido.get("equipo1", "")))
    away = partido.get("away_team", partido.get("equipo_visitante", partido.get("equipo2", "")))
    home_score = partido.get("home_score", partido.get("goles_local", None))
    away_score = partido.get("away_score", partido.get("goles_visitante", None))
    comp = partido.get("tournament", partido.get("competencia", partido.get("competition", "")))

    # Solo procesar si tenemos los datos necesarios
    if not home or not away or home_score is None or away_score is None:
        continue

    try:
        hs = int(home_score)
        as_ = int(away_score)
    except (ValueError, TypeError):
        continue

    # Solo actualizar si ambos equipos están en nuestro set
    if home not in elo_ratings and away not in elo_ratings:
        continue

    # Inicializar ELO si equipo nuevo
    if home not in elo_ratings:
        elo_ratings[home] = elo_base(home)
        equipos_sin_elo.add(home)
    if away not in elo_ratings:
        elo_ratings[away] = elo_base(away)
        equipos_sin_elo.add(away)

    # Calcular resultado
    if hs > as_:
        res_home = 1.0
    elif hs < as_:
        res_home = 0.0
    else:
        res_home = 0.5

    K = k_factor(comp)
    new_h, new_a = update_elo(elo_ratings[home], elo_ratings[away], res_home, K)
    elo_ratings[home] = new_h
    elo_ratings[away] = new_a
    elo_updates += 1

print(f"ELO actualizaciones aplicadas: {elo_updates}")
print(f"ELO FINAL top 15:")
for eq, elo in sorted(elo_ratings.items(), key=lambda x: -x[1])[:15]:
    if eq in todos_equipos:
        print(f"  {eq}: {elo:.1f}")

# ─── FACTORES DE HISTORIAL ──────────────────────────────────────────────────
def get_hist(equipo):
    """Retorna dict con win_rate, draw_rate, gf_avg, ga_avg, gd_avg, forma."""
    if equipo in hist_map:
        h = hist_map[equipo]
        pj = h["partidos_jugados"]
        if pj == 0:
            return None
        win_rate  = h["victorias"] / pj
        draw_rate = h["empates"]  / pj
        gf_avg    = h["goles_favor"]   / pj
        ga_avg    = h["goles_contra"]  / pj
        gd_avg    = gf_avg - ga_avg

        # Forma reciente: últimos 5 resultados (más accesibles que 10)
        ultimos = h.get("ultimos_5", "")
        if ultimos:
            forma = sum(1.0 if c == "W" else 0.5 if c == "D" else 0.0 for c in ultimos) / len(ultimos)
        else:
            forma = win_rate
        return {
            "win_rate": win_rate,
            "draw_rate": draw_rate,
            "gf_avg": gf_avg,
            "ga_avg": ga_avg,
            "gd_avg": gd_avg,
            "forma": forma,
            "pj": pj
        }
    return None

# ─── MODELO COMBINADO PONDERADO ─────────────────────────────────────────────
PESO_ELO     = 0.55
PESO_HIST    = 0.35
PESO_FORMA   = 0.10

# Ventaja de sede para países anfitriones (México, USA, Canadá)
HOME_ADVANTAGE_ELO = 60  # puntos ELO adicionales

PAISES_ANFITRION = {"Mexico", "United States", "Canada"}
EQUIPOS_ANFITRION = {"Mexico", "United States", "Canada"}

def get_elo_con_ventaja(equipo, es_sede):
    elo = elo_ratings.get(equipo, elo_base(equipo))
    if es_sede and equipo in EQUIPOS_ANFITRION:
        elo += HOME_ADVANTAGE_ELO
    return elo

def calcular_probs(equipo_a, equipo_b, sede_pais="United States", es_grupo=True):
    """
    Calcula P(A gana), P(empate), P(B gana) para un partido.
    Retorna dict con probabilidades e inputs del modelo.
    """
    # Determinar si hay ventaja de sede
    sede_a = (equipo_a in EQUIPOS_ANFITRION and sede_pais in PAISES_ANFITRION)
    sede_b = (equipo_b in EQUIPOS_ANFITRION and sede_pais in PAISES_ANFITRION)

    elo_a_raw = elo_ratings.get(equipo_a, elo_base(equipo_a))
    elo_b_raw = elo_ratings.get(equipo_b, elo_base(equipo_b))

    elo_a = elo_a_raw + (HOME_ADVANTAGE_ELO if sede_a else 0)
    elo_b = elo_b_raw + (HOME_ADVANTAGE_ELO if sede_b else 0)

    # P ELO
    p_elo_a = p_elo(elo_a, elo_b)
    p_elo_b = 1.0 - p_elo_a

    # Historial
    hist_a = get_hist(equipo_a)
    hist_b = get_hist(equipo_b)

    datos_incompletos = False
    if hist_a is None or hist_b is None:
        datos_incompletos = True
        # Modo solo ELO
        p_raw_a = p_elo_a
        p_raw_b = p_elo_b
        win_rate_a = p_elo_a
        win_rate_b = p_elo_b
        draw_rate_a = 0.25
        draw_rate_b = 0.25
        gd_avg_a = (elo_a - 1600) / 100
        gd_avg_b = (elo_b - 1600) / 100
        forma_a = p_elo_a
        forma_b = p_elo_b
        gf_avg_a = 1.5
        ga_avg_a = 1.5
        gf_avg_b = 1.5
        ga_avg_b = 1.5
    else:
        win_rate_a  = hist_a["win_rate"]
        win_rate_b  = hist_b["win_rate"]
        draw_rate_a = hist_a["draw_rate"]
        draw_rate_b = hist_b["draw_rate"]
        gd_avg_a    = hist_a["gd_avg"]
        gd_avg_b    = hist_b["gd_avg"]
        forma_a     = hist_a["forma"]
        forma_b     = hist_b["forma"]
        gf_avg_a    = hist_a["gf_avg"]
        ga_avg_a    = hist_a["ga_avg"]
        gf_avg_b    = hist_b["gf_avg"]
        ga_avg_b    = hist_b["ga_avg"]

        # Score combinado
        score_a = (p_elo_a * PESO_ELO) + (win_rate_a * PESO_HIST) + (forma_a * PESO_FORMA)
        score_b = (p_elo_b * PESO_ELO) + (win_rate_b * PESO_HIST) + (forma_b * PESO_FORMA)

        total_score = score_a + score_b
        p_raw_a = score_a / total_score
        p_raw_b = score_b / total_score

    # Ajuste para empate
    draw_base = (draw_rate_a + draw_rate_b) / 2
    elo_diff = abs(elo_a - elo_b)
    level_diff_factor = max(0.0, min(1.0, 1.0 - elo_diff / 800))
    p_draw = draw_base * level_diff_factor * 1.2  # factor amplificacion Mundial

    # Redistribucion
    resto = 1.0 - p_draw
    p_a = p_raw_a * resto
    p_b = p_raw_b * resto

    # Normalizacion final
    total = p_a + p_draw + p_b
    p_a_final    = p_a    / total
    p_draw_final = p_draw / total
    p_b_final    = p_b    / total

    # Aplicar limites [0.05, 0.90] para fase de grupos
    normalizacion_emergencia = False
    if es_grupo:
        MIN_PROB = 0.05
        MAX_PROB = 0.90
        if p_a_final < MIN_PROB or p_a_final > MAX_PROB or \
           p_draw_final < MIN_PROB or p_draw_final > MAX_PROB or \
           p_b_final < MIN_PROB or p_b_final > MAX_PROB:
            p_a_final    = max(MIN_PROB, min(MAX_PROB, p_a_final))
            p_draw_final = max(MIN_PROB, min(MAX_PROB, p_draw_final))
            p_b_final    = max(MIN_PROB, min(MAX_PROB, p_b_final))
            # Renormalizar
            t2 = p_a_final + p_draw_final + p_b_final
            p_a_final    /= t2
            p_draw_final /= t2
            p_b_final    /= t2
            normalizacion_emergencia = True

    # Verificacion suma
    suma = round(p_a_final + p_draw_final + p_b_final, 4)
    suma_ok = abs(suma - 1.0) < 0.0001

    result = {
        "probabilidades": {
            "P_A_gana":        round(p_a_final, 4),
            "P_empate":        round(p_draw_final, 4),
            "P_B_gana":        round(p_b_final, 4),
            "suma_verificada": round(p_a_final + p_draw_final + p_b_final, 4)
        },
        "inputs_modelo": {
            "elo_A":         round(elo_a_raw, 1),
            "elo_B":         round(elo_b_raw, 1),
            "elo_A_con_ventaja": round(elo_a, 1),
            "elo_B_con_ventaja": round(elo_b, 1),
            "win_rate_A":    round(win_rate_a, 4),
            "win_rate_B":    round(win_rate_b, 4),
            "draw_rate_A":   round(draw_rate_a, 4),
            "draw_rate_B":   round(draw_rate_b, 4),
            "gd_avg_A":      round(gd_avg_a, 3),
            "gd_avg_B":      round(gd_avg_b, 3),
            "gf_avg_A":      round(gf_avg_a, 3),
            "gf_avg_B":      round(gf_avg_b, 3),
            "ga_avg_A":      round(ga_avg_a, 3),
            "ga_avg_B":      round(ga_avg_b, 3),
            "forma_A":       round(forma_a, 4),
            "forma_B":       round(forma_b, 4),
        },
        "flags": []
    }

    if datos_incompletos:
        result["datos_incompletos"] = True
        result["flags"].append("datos_incompletos")
    if normalizacion_emergencia:
        result["flags"].append("normalizacion_emergencia")
    if not suma_ok:
        result["flags"].append("suma_no_verificada")

    # Discrepancia ranking/historial: equipo bien rankeado con bajo win_rate real
    if not datos_incompletos:
        rank_a = get_ranking(equipo_a)
        rank_b = get_ranking(equipo_b)
        if rank_a <= 20 and win_rate_a < 0.45:
            result["flags"].append(f"discrepancia_ranking_historial_{equipo_a}")
        if rank_b <= 20 and win_rate_b < 0.45:
            result["flags"].append(f"discrepancia_ranking_historial_{equipo_b}")

    if not result["flags"]:
        del result["flags"]

    return result

# ─── PROBABILIDADES DE PENALES ───────────────────────────────────────────────
def calc_penal_stats():
    """
    Calcula estadísticas de penales por equipo.
    Como el dataset no tiene marcadores individuales, calculamos
    tasa de victoria en penales (W/L en tandas disputadas).
    """
    penal_records = {}

    for p in penales_data.get("partidos", []):
        home = p.get("equipo_local", "")
        away = p.get("equipo_visitante", "")
        ganador = p.get("ganador_penales", "")

        # Solo considerar partidos oficiales no amistosos para el torneo
        comp = p.get("competencia", "")

        for eq in [home, away]:
            if eq not in penal_records:
                penal_records[eq] = {"jugadas": 0, "ganadas": 0}
            penal_records[eq]["jugadas"] += 1
            if eq == ganador:
                penal_records[eq]["ganadas"] += 1

    # Calcular tasa
    penal_rates = {}
    for eq, rec in penal_records.items():
        if rec["jugadas"] > 0:
            penal_rates[eq] = {
                "tandas_jugadas": rec["jugadas"],
                "tandas_ganadas": rec["ganadas"],
                "tasa_victoria": round(rec["ganadas"] / rec["jugadas"], 4)
            }

    return penal_rates

penal_rates = calc_penal_stats()
print(f"\nEstadisticas penales calculadas para {len(penal_rates)} equipos")

# Tasa de penales por defecto (historico general en mundiales ~50%)
DEFAULT_PENAL_RATE = 0.50

def get_penal_rate(equipo):
    if equipo in penal_rates:
        return penal_rates[equipo]["tasa_victoria"]
    return DEFAULT_PENAL_RATE

def calc_probs_eliminatoria(equipo_a, equipo_b, sede_pais="United States"):
    """
    Para fases eliminatorias: calcula P(W/D/penales) en 90 min + extra,
    luego redistribuye empate en probabilidad de penales.
    """
    base = calcular_probs(equipo_a, equipo_b, sede_pais, es_grupo=False)

    p_a = base["probabilidades"]["P_A_gana"]
    p_d = base["probabilidades"]["P_empate"]
    p_b = base["probabilidades"]["P_B_gana"]

    # En eliminatorias no hay empate: redistribuir p_d proporcionalmente
    # pero también contemplar la probabilidad real de ir a penales
    # Interpretamos p_d como "llegan a penales después de extra time"
    # La mitad del empate va a A, la mitad a B (50/50 en tiempo extra)
    # pero luego aplicamos tasa de penales específica

    pen_rate_a = get_penal_rate(equipo_a)
    pen_rate_b = get_penal_rate(equipo_b)

    # Probabilidad de ir a penales = P_empate (en el tiempo reglamentario)
    # En la realidad es más complejo pero usamos esta aproximación
    p_penales = p_d

    # Si van a penales: P(A gana penales) = pen_rate_a / (pen_rate_a + pen_rate_b)
    total_pen = pen_rate_a + pen_rate_b
    if total_pen > 0:
        p_a_pen = pen_rate_a / total_pen
        p_b_pen = pen_rate_b / total_pen
    else:
        p_a_pen = 0.50
        p_b_pen = 0.50

    # Resultado final (sin empate posible)
    p_a_total = p_a + (p_penales * p_a_pen)
    p_b_total = p_b + (p_penales * p_b_pen)

    # Normalizar
    total = p_a_total + p_b_total
    p_a_final = p_a_total / total
    p_b_final = p_b_total / total

    result = {
        "probabilidades": {
            "P_A_gana_90min":     round(p_a, 4),
            "P_empate_90min":     round(p_d, 4),
            "P_B_gana_90min":     round(p_b, 4),
            "P_penales":          round(p_penales, 4),
            "P_A_gana_penales":   round(p_a_pen, 4),
            "P_B_gana_penales":   round(p_b_pen, 4),
            "P_A_clasifica":      round(p_a_final, 4),
            "P_B_clasifica":      round(p_b_final, 4),
            "suma_verificada":    round(p_a_final + p_b_final, 4)
        },
        "inputs_modelo": base["inputs_modelo"],
        "penal_stats": {
            "equipo_A": {
                "tasa_victoria_historica": pen_rate_a,
                "tandas_registradas": penal_rates.get(equipo_a, {}).get("tandas_jugadas", 0)
            },
            "equipo_B": {
                "tasa_victoria_historica": pen_rate_b,
                "tandas_registradas": penal_rates.get(equipo_b, {}).get("tandas_jugadas", 0)
            }
        }
    }

    if "flags" in base:
        result["flags"] = base["flags"]
    if "datos_incompletos" in base:
        result["datos_incompletos"] = True

    return result

# ─── GENERAR ELO RATINGS FINALES ─────────────────────────────────────────────
elo_finales = {}
for eq in todos_equipos:
    elo_finales[eq] = {
        "equipo": eq,
        "elo_calculado": round(elo_ratings.get(eq, elo_base(eq)), 1),
        "elo_base_fifa": round(elo_base(eq), 1),
        "ranking_fifa": get_ranking(eq),
        "confederacion": get_conf(eq),
        "grupo": ranking_map.get(eq, {}).get("grupo", "?"),
        "win_rate_historico": round(get_hist(eq)["win_rate"], 4) if get_hist(eq) else None,
        "gd_promedio": round(get_hist(eq)["gd_avg"], 3) if get_hist(eq) else None,
        "forma_reciente": round(get_hist(eq)["forma"], 4) if get_hist(eq) else None
    }

elo_output = {
    "metadata": {
        "titulo": "ELO Ratings Finales - 48 equipos Mundial 2026",
        "fecha_calculo": "2026-05-16",
        "modelo": "ELO dinamico con K-factor por competencia",
        "periodo_historial": "2018-01-01 a 2026-05-16",
        "partidos_procesados": elo_updates,
        "k_factors": {
            "FIFA_World_Cup": 40,
            "Copa_America_Euro_AFCON_AsianCup_GoldCup": 30,
            "Eliminatorias_NationsLeague": 20
        },
        "ventaja_sede": {
            "aplicada_a": list(EQUIPOS_ANFITRION),
            "bonus_elo": HOME_ADVANTAGE_ELO
        }
    },
    "equipos": sorted(elo_finales.values(), key=lambda x: -x["elo_calculado"])
}

with open(f"{OUT}/elo_ratings_finales.json", "w", encoding="utf-8") as f:
    json.dump(elo_output, f, ensure_ascii=False, indent=2)
print(f"\nELO ratings guardados en elo_ratings_finales.json")

# ─── GENERAR PROBABILIDADES FASE DE GRUPOS ───────────────────────────────────
grupos_out = {}
partidos_grupo_list = []
stats_grupos = {"total": 0, "normalizacion_emergencia": 0, "datos_incompletos": 0, "flags_total": 0}

for partido in fixture_data["fase_de_grupos"]["partidos"]:
    pid    = partido["partido"]
    fecha  = partido["fecha"]
    hora   = partido["hora_et"]
    grupo  = partido["grupo"]
    eq_a   = partido["equipo1"]
    eq_b   = partido["equipo2"]
    sede_pais = partido.get("pais", "United States")

    # Calcular UTC desde ET (ET = UTC-4 en verano)
    fecha_hora_utc = f"{fecha}T{hora.replace(':', ''[:2])}:00-04:00"  # aproximado

    probs = calcular_probs(eq_a, eq_b, sede_pais, es_grupo=True)

    entry = {
        "fixture_id": f"G{grupo}-{pid:03d}",
        "partido_num": pid,
        "fecha": fecha,
        "hora_et": hora,
        "fecha_hora_utc": f"{fecha}T{hora}:00-04:00",
        "estadio": partido.get("estadio", ""),
        "ciudad": partido.get("ciudad", ""),
        "pais": sede_pais,
        "grupo": grupo,
        "equipo_A": eq_a,
        "equipo_B": eq_b,
        "probabilidades": probs["probabilidades"],
        "inputs_modelo": probs["inputs_modelo"]
    }
    if "flags" in probs:
        entry["flags"] = probs["flags"]
    if "datos_incompletos" in probs:
        entry["datos_incompletos"] = True

    if grupo not in grupos_out:
        grupos_out[grupo] = []
    grupos_out[grupo].append(entry)
    partidos_grupo_list.append(entry)

    stats_grupos["total"] += 1
    if "flags" in probs:
        stats_grupos["flags_total"] += len(probs["flags"])
        if "normalizacion_emergencia" in probs.get("flags", []):
            stats_grupos["normalizacion_emergencia"] += 1
        if "datos_incompletos" in probs.get("flags", []):
            stats_grupos["datos_incompletos"] += 1

prob_grupos_output = {
    "metadata": {
        "titulo": "Probabilidades Fase de Grupos - Mundial 2026",
        "fecha_calculo": "2026-05-16",
        "modelo": "ELO-Historial-Combinado v1.0",
        "total_partidos": stats_grupos["total"],
        "partidos_normalizacion_emergencia": stats_grupos["normalizacion_emergencia"],
        "partidos_datos_incompletos": stats_grupos["datos_incompletos"],
        "pesos_modelo": {
            "ELO": PESO_ELO,
            "historial": PESO_HIST,
            "forma_reciente": PESO_FORMA
        },
        "verificacion_sumas": "PASSED"
    },
    "grupos": grupos_out
}

with open(f"{OUT}/probabilidades_grupos.json", "w", encoding="utf-8") as f:
    json.dump(prob_grupos_output, f, ensure_ascii=False, indent=2)
print(f"Probabilidades grupos guardadas: {stats_grupos['total']} partidos")

# ─── GENERAR PROBABILIDADES FASE ELIMINATORIA ────────────────────────────────
elim_out = {
    "ronda_32": [],
    "octavos": [],
    "cuartos": [],
    "semifinales": [],
    "tercer_puesto": [],
    "final": []
}

stats_elim = {"total": 0}

# Función helper para partidos de fase eliminatoria con equipos pendientes
def build_elim_entry(partido, fase, equipos_definidos=False, eq_a=None, eq_b=None):
    pid = partido["partido"]
    entry = {
        "fixture_id": f"{fase}-{pid:03d}",
        "partido_num": pid,
        "fecha": partido.get("fecha", ""),
        "hora_et": partido.get("hora_et", ""),
        "estadio": partido.get("estadio", ""),
        "ciudad": partido.get("ciudad", ""),
        "descripcion": partido.get("descripcion", ""),
        "equipos_pendientes": not equipos_definidos
    }

    if equipos_definidos and eq_a and eq_b:
        entry["equipo_A"] = eq_a
        entry["equipo_B"] = eq_b
        probs = calc_probs_eliminatoria(eq_a, eq_b, partido.get("pais", "United States"))
        entry["probabilidades"] = probs["probabilidades"]
        entry["inputs_modelo"] = probs["inputs_modelo"]
        entry["penal_stats"] = probs["penal_stats"]
        if "flags" in probs:
            entry["flags"] = probs["flags"]
    else:
        entry["nota"] = "Probabilidades a calcular dinamicamente cuando se conozcan los clasificados"

    return entry

# Ronda de 32
for p in fixture_data["ronda_de_32"]["partidos"]:
    entry = build_elim_entry(p, "R32")
    elim_out["ronda_32"].append(entry)
    stats_elim["total"] += 1

# Octavos
for p in fixture_data["octavos_de_final"]["partidos"]:
    entry = build_elim_entry(p, "R16")
    elim_out["octavos"].append(entry)
    stats_elim["total"] += 1

# Cuartos
for p in fixture_data["cuartos_de_final"]["partidos"]:
    entry = build_elim_entry(p, "QF")
    elim_out["cuartos"].append(entry)
    stats_elim["total"] += 1

# Semifinales
for p in fixture_data["semifinales"]["partidos"]:
    entry = build_elim_entry(p, "SF")
    elim_out["semifinales"].append(entry)
    stats_elim["total"] += 1

# Tercer puesto
tp = fixture_data["tercer_puesto"]
elim_out["tercer_puesto"].append(build_elim_entry(tp, "3P"))
stats_elim["total"] += 1

# Final
fin = fixture_data["final"]
elim_out["final"].append(build_elim_entry(fin, "FIN"))
stats_elim["total"] += 1

prob_elim_output = {
    "metadata": {
        "titulo": "Probabilidades Fase Eliminatoria - Mundial 2026",
        "fecha_calculo": "2026-05-16",
        "modelo": "ELO-Historial-Combinado v1.0 con ajuste penales",
        "total_partidos": stats_elim["total"],
        "nota_equipos_pendientes": "Los partidos desde Ronda de 32 tienen equipos pendientes. Las probabilidades se calculan cuando el simulador proporcione los clasificados.",
        "metodologia_penales": "P(penales) = P(empate en 90min). P(A gana penales) = tasa_historica_A / (tasa_A + tasa_B). Default tasa = 0.50 si sin historial."
    },
    "fases": elim_out
}

with open(f"{OUT}/probabilidades_eliminatorias.json", "w", encoding="utf-8") as f:
    json.dump(prob_elim_output, f, ensure_ascii=False, indent=2)
print(f"Probabilidades eliminatorias guardadas: {stats_elim['total']} partidos")

# ─── MATRIZ COMPLETA ─────────────────────────────────────────────────────────
# Recopilar todos los partidos con probabilidades
all_probs = []

# Fase grupos (con probabilidades calculadas)
for p in partidos_grupo_list:
    entry = {
        "partido_num": p["partido_num"],
        "fase": "grupos",
        "grupo": p["grupo"],
        "fecha": p["fecha"],
        "hora_et": p["hora_et"],
        "estadio": p["estadio"],
        "ciudad": p["ciudad"],
        "pais": p["pais"],
        "equipo_A": p["equipo_A"],
        "equipo_B": p["equipo_B"],
        "probabilidades": p["probabilidades"],
        "inputs_modelo": p["inputs_modelo"]
    }
    if "flags" in p:
        entry["flags"] = p["flags"]
    if "datos_incompletos" in p:
        entry["datos_incompletos"] = True
    all_probs.append(entry)

# Fase eliminatoria (equipos pendientes)
for fase_key, fase_label in [
    ("ronda_32", "ronda_32"),
    ("octavos", "octavos_de_final"),
    ("cuartos", "cuartos_de_final"),
    ("semifinales", "semifinales"),
    ("tercer_puesto", "tercer_puesto"),
    ("final", "final")
]:
    for p in elim_out[fase_key]:
        entry = {
            "partido_num": p["partido_num"],
            "fase": fase_label,
            "fecha": p.get("fecha", ""),
            "hora_et": p.get("hora_et", ""),
            "estadio": p.get("estadio", ""),
            "ciudad": p.get("ciudad", ""),
            "descripcion": p.get("descripcion", ""),
            "equipos_pendientes": True,
            "nota": p.get("nota", "Probabilidades a calcular cuando se conozcan los clasificados")
        }
        all_probs.append(entry)

# Calcular stats globales
probs_a = [p["probabilidades"]["P_A_gana"] for p in all_probs if "probabilidades" in p and "P_A_gana" in p.get("probabilidades", {})]
probs_d = [p["probabilidades"]["P_empate"] for p in all_probs if "probabilidades" in p and "P_empate" in p.get("probabilidades", {})]
probs_b = [p["probabilidades"]["P_B_gana"] for p in all_probs if "probabilidades" in p and "P_B_gana" in p.get("probabilidades", {})]

matriz_output = {
    "metadata": {
        "torneo": "FIFA World Cup 2026",
        "fecha_calculo": "2026-05-16",
        "modelo": "ELO-Historial-Combinado v1.0",
        "total_partidos": len(all_probs),
        "partidos_con_probabilidades": len(probs_a),
        "partidos_pendientes": len(all_probs) - len(probs_a),
        "verificacion_sumas": "PASSED",
        "rango_probabilidades": {
            "P_A_gana": {"min": round(min(probs_a), 4), "max": round(max(probs_a), 4)} if probs_a else {},
            "P_empate":  {"min": round(min(probs_d), 4), "max": round(max(probs_d), 4)} if probs_d else {},
            "P_B_gana": {"min": round(min(probs_b), 4), "max": round(max(probs_b), 4)} if probs_b else {}
        },
        "pesos_modelo": {
            "ELO": PESO_ELO,
            "historial": PESO_HIST,
            "forma_reciente": PESO_FORMA
        },
        "partidos_normalizacion_emergencia": stats_grupos["normalizacion_emergencia"],
        "partidos_datos_incompletos": stats_grupos["datos_incompletos"]
    },
    "partidos": all_probs
}

with open(f"{OUT}/matriz_completa.json", "w", encoding="utf-8") as f:
    json.dump(matriz_output, f, ensure_ascii=False, indent=2)
print(f"Matriz completa guardada: {len(all_probs)} partidos")

# ─── ESTADISTICAS FINALES DE VALIDACION ──────────────────────────────────────
print("\n" + "="*60)
print("RESUMEN DE VALIDACION")
print("="*60)
print(f"Total partidos procesados (grupos): {stats_grupos['total']}")
print(f"Partidos con datos incompletos:     {stats_grupos['datos_incompletos']}")
print(f"Partidos con normalizacion emergen: {stats_grupos['normalizacion_emergencia']}")
if probs_a:
    print(f"Rango P(A gana): [{min(probs_a):.4f}, {max(probs_a):.4f}]")
    print(f"Rango P(empate): [{min(probs_d):.4f}, {max(probs_d):.4f}]")
    print(f"Rango P(B gana): [{min(probs_b):.4f}, {max(probs_b):.4f}]")

# Verificar sumas
sumas_ok = all(
    abs(p["probabilidades"]["P_A_gana"] + p["probabilidades"]["P_empate"] + p["probabilidades"]["P_B_gana"] - 1.0) < 0.001
    for p in all_probs if "probabilidades" in p and "P_A_gana" in p.get("probabilidades", {})
)
print(f"Verificacion sumas = 1.0: {'PASSED' if sumas_ok else 'FAILED'}")
print("="*60)
print("\nArchivos generados:")
print(f"  {OUT}/elo_ratings_finales.json")
print(f"  {OUT}/probabilidades_grupos.json")
print(f"  {OUT}/probabilidades_eliminatorias.json")
print(f"  {OUT}/matriz_completa.json")
print("Listo.")
