"""
AGENTE-07 Score Calculator — FIFA World Cup 2026
================================================
Calcula el marcador más probable para cada partido usando un modelo de Poisson ajustado.
Lee estadísticas históricas de resumen_por_equipo.json y la lista de partidos de
la constante MATCHES en data.ts del frontend.

Algoritmo:
  lambda_A = gf_avg_A × (ga_avg_B / media_global)
  lambda_B = gf_avg_B × (ga_avg_A / media_global)
  Score más probable = argmax P(i,j) = Poisson(i, λ_A) × Poisson(j, λ_B)  i,j ∈ [0,5]
"""

import json
import math
import re
import os
import sys
from datetime import date

# Forzar UTF-8 en la salida para evitar errores en consola Windows (cp1252)
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ---------------------------------------------------------------------------
# Rutas absolutas
# ---------------------------------------------------------------------------
BASE_DIR = r"E:\UCB\5 Semestre\IA AGENTES\mundial2026"
STATS_FILE  = os.path.join(BASE_DIR, "data", "historial", "resumen_por_equipo.json")
OUTPUT_FILE = os.path.join(BASE_DIR, "outputs", "scores_predichos_v2.json")
DATA_TS     = r"E:\UCB\5 Semestre\IA AGENTES\mundial2026-frontend\src\data\data.ts"

# ---------------------------------------------------------------------------
# Poisson PMF (sin scipy — implementación pura para portabilidad)
# ---------------------------------------------------------------------------
def poisson_pmf(k: int, lam: float) -> float:
    """P(X = k) para X ~ Poisson(lam)."""
    if lam <= 0:
        return 1.0 if k == 0 else 0.0
    return math.exp(-lam) * (lam ** k) / math.factorial(k)

# ---------------------------------------------------------------------------
# Cargar estadísticas del equipo
# ---------------------------------------------------------------------------
def load_team_stats(path: str) -> dict:
    """Lee resumen_por_equipo.json y devuelve dict {nombre: {gf_avg, ga_avg}}."""
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    stats = {}
    for name, info in data["equipos"].items():
        stats[name] = {
            "gf_avg": info.get("promedio_gf_partido", 1.2),
            "ga_avg": info.get("promedio_gc_partido", 1.2),
        }
    return stats

# ---------------------------------------------------------------------------
# Mapeo de nombres de equipos (frontend → resumen_por_equipo.json)
# ---------------------------------------------------------------------------
NAME_MAP = {
    "USA": "United States",
    "Czech Republic": "Czechia",
    "Turkey": "Turkiye",
    "Cote d'Ivoire": "Ivory Coast",
    "South Korea": "South Korea",
    "Bosnia and Herzegovina": "Bosnia and Herzegovina",
    "Cape Verde": "Cape Verde",
    "DR Congo": "DR Congo",
    "New Zealand": "New Zealand",
    "Saudi Arabia": "Saudi Arabia",
    "South Africa": "South Africa",
    # Los demás ya coinciden exactamente
}

def resolve_name(name: str, stats: dict) -> str:
    """Devuelve el nombre canónico con datos en stats, o el original."""
    if name in stats:
        return name
    mapped = NAME_MAP.get(name)
    if mapped and mapped in stats:
        return mapped
    # búsqueda parcial insensible a mayúsculas
    lower = name.lower()
    for key in stats:
        if key.lower() == lower:
            return key
    return name  # fallback — se usará lambda por defecto

# ---------------------------------------------------------------------------
# Calcular score más probable
# ---------------------------------------------------------------------------
def modal_score(lam_a: float, lam_b: float):
    """Devuelve (i, j, prob) del score más probable en rango 0..5."""
    best = (-1, -1, -1.0)
    for i in range(6):
        for j in range(6):
            p = poisson_pmf(i, lam_a) * poisson_pmf(j, lam_b)
            if p > best[2]:
                best = (i, j, p)
    return best

# ---------------------------------------------------------------------------
# Parsear MATCHES desde data.ts
# ---------------------------------------------------------------------------
def parse_matches_from_ts(path: str) -> list:
    """
    Extrae todos los partidos del array MATCHES en data.ts.
    Cada partido es un dict con: id, teamA, teamB, pA, pE, pB, score, group.
    """
    with open(path, encoding="utf-8") as f:
        content = f.read()

    # Extraer bloque MATCHES
    matches_block_m = re.search(
        r"export const MATCHES[^=]*=\s*\{(.*?)\n\}",
        content, re.DOTALL
    )
    if not matches_block_m:
        raise ValueError("No se encontró el bloque MATCHES en data.ts")

    matches_block = matches_block_m.group(1)

    # Extraer cada línea de partido
    pattern = re.compile(
        r"\{\s*id:'([^']+)',\s*teamA:'([^']+)',\s*teamB:'([^']+)',\s*"
        r"pA:([\d.]+),\s*pE:([\d.]+),\s*pB:([\d.]+),\s*score:'([^']*)'\s*\}"
    )
    matches = []
    for m in pattern.finditer(matches_block):
        matches.append({
            "id":    m.group(1),
            "teamA": m.group(2),
            "teamB": m.group(3),
            "pA":    float(m.group(4)),
            "pE":    float(m.group(5)),
            "pB":    float(m.group(6)),
            "score": m.group(7),
        })
    return matches

# ---------------------------------------------------------------------------
# Función principal
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("AGENTE-07 Score Calculator — Mundial 2026")
    print("=" * 60)

    # 1. Cargar estadísticas
    print(f"\nCargando estadísticas desde:\n  {STATS_FILE}")
    team_stats = load_team_stats(STATS_FILE)
    print(f"  → {len(team_stats)} equipos cargados.")

    # 2. Calcular media global de gf_avg
    gf_values = [v["gf_avg"] for v in team_stats.values()]
    MEDIA_GLOBAL = 1.35  # valor fijo indicado en las instrucciones
    print(f"  → media_global_gf (fija): {MEDIA_GLOBAL}")

    # 3. Parsear partidos desde data.ts
    print(f"\nParsando MATCHES desde:\n  {DATA_TS}")
    matches = parse_matches_from_ts(DATA_TS)
    print(f"  → {len(matches)} partidos encontrados.")

    FALLBACK_LAMBDA = 1.2

    # Límites de normalización para equipos con estadísticas infladas por
    # competencias regionales de bajo nivel (ej. New Zealand en OFC, Curacao en CONCACAF)
    # Se aplica un cap de gf_avg y un piso de ga_avg para evitar distorsiones.
    GF_CAP = 2.50   # ningún equipo puede tener gf_avg > 2.50 en modelo mundial
    GA_FLOOR = 0.60  # ningún equipo puede tener ga_avg < 0.60 (defensas mundialistas)

    def normalize_stats(gf, ga):
        """Aplica cap/floor para evitar distorsiones por competencias de bajo nivel."""
        return min(gf, GF_CAP), max(ga, GA_FLOOR)

    results_scores = []   # para el JSON de salida
    score_distribution = {}  # para el reporte de distribución
    adjustments = 0
    warnings = []

    for match in matches:
        mid   = match["id"]
        tA    = match["teamA"]
        tB    = match["teamB"]
        pA    = match["pA"]
        pE    = match["pE"]
        pB    = match["pB"]

        print(f"  Procesando partido {mid}: {tA} vs {tB} ...")

        # Resolver nombres
        rA = resolve_name(tA, team_stats)
        rB = resolve_name(tB, team_stats)

        # Obtener lambdas base
        if rA in team_stats:
            gf_A, ga_A = normalize_stats(team_stats[rA]["gf_avg"], team_stats[rA]["ga_avg"])
        else:
            warnings.append(f"WARN: {tA} no encontrado en stats → usando fallback λ={FALLBACK_LAMBDA}")
            gf_A = FALLBACK_LAMBDA
            ga_A = FALLBACK_LAMBDA

        if rB in team_stats:
            gf_B, ga_B = normalize_stats(team_stats[rB]["gf_avg"], team_stats[rB]["ga_avg"])
        else:
            warnings.append(f"WARN: {tB} no encontrado en stats → usando fallback λ={FALLBACK_LAMBDA}")
            gf_B = FALLBACK_LAMBDA
            ga_B = FALLBACK_LAMBDA

        # Calcular lambdas según la fórmula Poisson ajustada
        lam_A = gf_A * (ga_B / MEDIA_GLOBAL)
        lam_B = gf_B * (ga_A / MEDIA_GLOBAL)

        # Validación de rango
        if math.isnan(lam_A) or lam_A <= 0:
            warnings.append(f"WARN: lambda_A inválido para {mid} → usando {MEDIA_GLOBAL}")
            lam_A = MEDIA_GLOBAL
        if math.isnan(lam_B) or lam_B <= 0:
            warnings.append(f"WARN: lambda_B inválido para {mid} → usando {MEDIA_GLOBAL}")
            lam_B = MEDIA_GLOBAL

        # Ajuste por probabilidades del modelo
        if pA > 0.60:
            lam_A *= 1.15
            lam_B *= 0.88
        elif pB > 0.60:
            lam_B *= 1.15
            lam_A *= 0.88

        # Clamp a rango realista
        lam_A = max(0.3, min(4.0, lam_A))
        lam_B = max(0.3, min(4.0, lam_B))

        # Score modal
        sA, sB, prob = modal_score(lam_A, lam_B)

        # Desempate técnico: verificar si hay score alternativo con prob muy cercana
        # y ajustarlo según pA/pE/pB
        candidates = []
        for i in range(6):
            for j in range(6):
                p = poisson_pmf(i, lam_A) * poisson_pmf(j, lam_B)
                if abs(p - prob) < 0.001:
                    candidates.append((i, j, p))

        if len(candidates) > 1:
            # Determinar resultado esperado según probabilidades
            if pA >= pB and pA >= pE:
                expected = "A"
            elif pB > pA and pB >= pE:
                expected = "B"
            else:
                expected = "E"

            def preference(c):
                i, j, p = c
                if expected == "A":
                    return (1 if i > j else 0, p)
                elif expected == "B":
                    return (1 if j > i else 0, p)
                else:
                    return (1 if i == j else 0, p)

            best_c = max(candidates, key=preference)
            sA, sB, prob = best_c

        # Validar consistencia con el modelo
        # Ganador implícito por el score
        if sA > sB:
            implied = "A"
        elif sB > sA:
            implied = "B"
        else:
            implied = "E"

        # Ganador más probable
        if pA > pB and pA > pE:
            expected_winner = "A"
        elif pB > pA and pB > pE:
            expected_winner = "B"
        else:
            expected_winner = "E"

        consistent = (implied == expected_winner)

        # Si inconsistente, ajustar iterativamente lambda del favorito hasta resolver
        if not consistent:
            adjustments += 1
            lam_A_adj, lam_B_adj = lam_A, lam_B
            for _ in range(8):  # máximo 8 iteraciones de ajuste (+0.3 cada vez)
                if expected_winner == "A":
                    lam_A_adj = min(4.0, lam_A_adj + 0.3)
                elif expected_winner == "B":
                    lam_B_adj = min(4.0, lam_B_adj + 0.3)
                else:
                    avg = (lam_A_adj + lam_B_adj) / 2
                    lam_A_adj = avg
                    lam_B_adj = avg

                sA2, sB2, prob2 = modal_score(lam_A_adj, lam_B_adj)
                resolved = (
                    (expected_winner == "A" and sA2 > sB2) or
                    (expected_winner == "B" and sB2 > sA2) or
                    (expected_winner == "E" and sA2 == sB2)
                )
                if resolved:
                    sA, sB, prob, lam_A, lam_B = sA2, sB2, prob2, lam_A_adj, lam_B_adj
                    consistent = True
                    break

        # Determinar ganador predicho (texto)
        if sA > sB:
            winner = tA
        elif sB > sA:
            winner = tB
        else:
            winner = "Empate"

        score_str = f"{sA}-{sB}"

        # Acumular distribución
        score_distribution[score_str] = score_distribution.get(score_str, 0) + 1

        results_scores.append({
            "id": mid,
            "teamA": tA,
            "teamB": tB,
            "lambda_A": round(lam_A, 4),
            "lambda_B": round(lam_B, 4),
            "score": score_str,
            "score_A": sA,
            "score_B": sB,
            "prob_score": round(prob, 6),
            "ganador_predicho": winner,
            "consistente_con_modelo": consistent,
            "pA": pA,
            "pE": pE,
            "pB": pB,
        })

    # 4. Construir y guardar JSON de salida
    os.makedirs(os.path.join(BASE_DIR, "outputs"), exist_ok=True)

    output = {
        "metadata": {
            "agente": "AGENTE-07 Score Calculator",
            "metodo": "Poisson ajustado con probabilidades v2",
            "fecha": str(date.today()),
            "media_global_gf": MEDIA_GLOBAL,
            "total_partidos": len(results_scores),
        },
        "scores": results_scores,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nArchivo JSON guardado en:\n  {OUTPUT_FILE}")

    # 5. Mostrar warnings
    if warnings:
        print("\n--- ADVERTENCIAS ---")
        for w in warnings:
            print(f"  {w}")

    # 6. Reporte de console
    print("\n" + "=" * 60)
    print("REPORTE DE RESULTADOS")
    print("=" * 60)

    # Top 5 partidos con mayor probabilidad de empate (prob máxima en X-X)
    draw_candidates = []
    for r in results_scores:
        la, lb = r["lambda_A"], r["lambda_B"]
        best_draw_prob = max(
            poisson_pmf(k, la) * poisson_pmf(k, lb)
            for k in range(6)
        )
        draw_candidates.append((best_draw_prob, r["id"], r["teamA"], r["teamB"]))
    draw_candidates.sort(reverse=True)

    print("\nTop 5 partidos con mayor probabilidad de empate:")
    for prob_d, mid, tA, tB in draw_candidates[:5]:
        print(f"  {mid}: {tA} vs {tB}  (P(empate)={prob_d:.4f})")

    # Top 5 partidos con mayor diferencia de goles esperada
    goal_diff_candidates = []
    for r in results_scores:
        diff = abs(r["lambda_A"] - r["lambda_B"])
        goal_diff_candidates.append((diff, r["id"], r["teamA"], r["teamB"],
                                     r["lambda_A"], r["lambda_B"]))
    goal_diff_candidates.sort(reverse=True)

    print("\nTop 5 partidos con mayor diferencia de goles esperada (|λ_A - λ_B|):")
    for diff, mid, tA, tB, la, lb in goal_diff_candidates[:5]:
        print(f"  {mid}: {tA} vs {tB}  λ_A={la:.3f} λ_B={lb:.3f} Δ={diff:.3f}")

    # Distribución de scores
    print("\nDistribución de scores predichos:")
    for score_s, cnt in sorted(score_distribution.items(),
                                key=lambda x: -x[1]):
        print(f"  {score_s}: {cnt} partidos")

    print(f"\nScores con ajuste por inconsistencia: {adjustments}")

    # Tabla lista para data.ts
    print("\n--- Tabla lista para data.ts ---")
    for r in results_scores:
        print(f"{{ id:'{r['id']}', score:'{r['score']}' }},")

    print("\n" + "=" * 60)
    print(f"AGENTE-07 completado. Archivo guardado en outputs/scores_predichos_v2.json")
    print("=" * 60)

    return results_scores


# ---------------------------------------------------------------------------
# Actualizar data.ts con los nuevos scores
# ---------------------------------------------------------------------------
def update_data_ts(results: list, ts_path: str):
    """Reemplaza el campo score en cada línea de partido en data.ts."""
    print(f"\nActualizando scores en:\n  {ts_path}")

    with open(ts_path, encoding="utf-8") as f:
        content = f.read()

    score_map = {r["id"]: r["score"] for r in results}
    updated = 0

    def replace_score(m):
        nonlocal updated
        mid = m.group(1)
        if mid in score_map:
            new_score = score_map[mid]
            original = m.group(0)
            replaced = re.sub(r"score:'[^']*'", f"score:'{new_score}'", original)
            if replaced != original:
                updated += 1
            return replaced
        return m.group(0)

    # Reemplazar score en líneas que contengan el id del partido
    new_content = re.sub(
        r"\{\s*id:'(G[A-Z]-\d+)',[^}]+\}",
        replace_score,
        content,
        flags=re.DOTALL
    )

    with open(ts_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"  → {updated} scores actualizados en data.ts")


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    results = main()
    update_data_ts(results, DATA_TS)
