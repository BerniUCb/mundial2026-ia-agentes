"""
=============================================================
AGENTE 6 — Extractor de Resultados por Ronda
Mundial 2026 — Sistema Multi-Agente
=============================================================

Responsabilidad:
  Lee los resultados de la simulacion Monte Carlo v2 (N=50,000)
  y extrae probabilidades por etapa para todos los equipos.
  Genera un JSON estructurado listo para consumo del frontend.

Fuente de datos:
  outputs/simulation_results_v2.json

Output:
  outputs/agent6_resultados.json
=============================================================
"""

import json
import os

BASE = os.path.dirname(os.path.abspath(__file__))

# ─── CARGAR DATOS DE SIMULACION ───────────────────────────────────────────────
with open(os.path.join(BASE, "outputs", "simulation_results_v2.json"), "r", encoding="utf-8") as f:
    sim = json.load(f)

campeon_data    = sim["probabilidades_campeon"]
rondas_data     = sim["probabilidades_llegar"]

# ─── BANDERAS (para referencia en el JSON) ────────────────────────────────────
FLAGS = {
    "Argentina":"🇦🇷","Spain":"🇪🇸","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","France":"🇫🇷","Portugal":"🇵🇹",
    "Morocco":"🇲🇦","Brazil":"🇧🇷","Germany":"🇩🇪","Netherlands":"🇳🇱","Croatia":"🇭🇷",
    "Senegal":"🇸🇳","Belgium":"🇧🇪","Mexico":"🇲🇽","Colombia":"🇨🇴","United States":"🇺🇸",
    "Uruguay":"🇺🇾","Switzerland":"🇨🇭","Turkiye":"🇹🇷","Japan":"🇯🇵","Austria":"🇦🇹",
    "South Korea":"🇰🇷","Iran":"🇮🇷","Norway":"🇳🇴","Algeria":"🇩🇿","Australia":"🇦🇺",
    "Ecuador":"🇪🇨","Canada":"🇨🇦","Egypt":"🇪🇬","Ivory Coast":"🇨🇮","Panama":"🇵🇦",
    "Sweden":"🇸🇪","Czechia":"🇨🇿","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","Paraguay":"🇵🇾","DR Congo":"🇨🇩",
    "Tunisia":"🇹🇳","Qatar":"🇶🇦","Uzbekistan":"🇺🇿","Iraq":"🇮🇶","South Africa":"🇿🇦",
    "Bosnia and Herzegovina":"🇧🇦","Saudi Arabia":"🇸🇦","Jordan":"🇯🇴","Cape Verde":"🇨🇻",
    "Ghana":"🇬🇭","Curacao":"🇨🇼","Haiti":"🇭🇹","New Zealand":"🇳🇿",
}

CONFS = {
    "Argentina":"CONMEBOL","Spain":"UEFA","England":"UEFA","France":"UEFA","Portugal":"UEFA",
    "Morocco":"CAF","Brazil":"CONMEBOL","Germany":"UEFA","Netherlands":"UEFA","Croatia":"UEFA",
    "Senegal":"CAF","Belgium":"UEFA","Mexico":"CONCACAF","Colombia":"CONMEBOL","United States":"CONCACAF",
    "Uruguay":"CONMEBOL","Switzerland":"UEFA","Turkiye":"UEFA","Japan":"AFC","Austria":"UEFA",
    "South Korea":"AFC","Iran":"AFC","Norway":"UEFA","Algeria":"CAF","Australia":"AFC",
    "Ecuador":"CONMEBOL","Canada":"CONCACAF","Egypt":"CAF","Ivory Coast":"CAF","Panama":"CONCACAF",
    "Sweden":"UEFA","Czechia":"UEFA","Scotland":"UEFA","Paraguay":"CONMEBOL","DR Congo":"CAF",
    "Tunisia":"CAF","Qatar":"AFC","Uzbekistan":"AFC","Iraq":"AFC","South Africa":"CAF",
    "Bosnia and Herzegovina":"UEFA","Saudi Arabia":"AFC","Jordan":"AFC","Cape Verde":"CAF",
    "Ghana":"CAF","Curacao":"CONCACAF","Haiti":"CONCACAF","New Zealand":"OFC",
}

# ─── COMBINAR TODOS LOS DATOS POR EQUIPO ─────────────────────────────────────
teams = []
for team, rondas in rondas_data.items():
    campeon = campeon_data.get(team, {})
    teams.append({
        "name": team,
        "flag": FLAGS.get(team, "🏳️"),
        "confederation": CONFS.get(team, "?"),
        # Probabilidades por etapa (%)
        "grupos_pct":   rondas["r32_pct"],      # Clasifica de fase de grupos
        "cuartos_pct":  rondas["cuartos_pct"],  # Cuartos de final
        "semis_pct":    rondas["semifinal_pct"],# Semifinal
        "final_pct":    rondas["final_pct"],    # Final
        "campeon_pct":  campeon.get("prob_pct", 0.0),
        "ic95": campeon.get("ic95", [0, 0]),
    })

# Ordenar por probabilidad de campeon
teams.sort(key=lambda x: x["campeon_pct"], reverse=True)

# ─── ARMAR EL BRACKET ESPERADO ───────────────────────────────────────────────
def top_n_by(field, n):
    sorted_t = sorted(teams, key=lambda x: x[field], reverse=True)
    return [{"name": t["name"], "flag": t["flag"], "pct": t[field]} for t in sorted_t[:n]]

bracket = {
    "clasificados_grupos": top_n_by("grupos_pct", 16),   # Top 16 mas probables de clasificar
    "cuartos":             top_n_by("cuartos_pct", 8),   # Top 8 mas probables en QF
    "semifinal":           top_n_by("semis_pct", 4),     # Top 4 en SF
    "final":               top_n_by("final_pct", 2),     # Top 2 en Final
    "campeon":             top_n_by("campeon_pct", 1),   # Favorito
}

# ─── ANALISIS POR CONFEDERACION ──────────────────────────────────────────────
conf_stats = {}
for t in teams:
    c = t["confederation"]
    if c not in conf_stats:
        conf_stats[c] = {"teams": 0, "campeon_sum": 0.0, "final_sum": 0.0, "semis_sum": 0.0}
    conf_stats[c]["teams"] += 1
    conf_stats[c]["campeon_sum"] += t["campeon_pct"]
    conf_stats[c]["final_sum"]   += t["final_pct"]
    conf_stats[c]["semis_sum"]   += t["semis_pct"]

# ─── OUTPUT FINAL ─────────────────────────────────────────────────────────────
output = {
    "metadata": {
        "agente": "Agent 6 — Results Extractor v1.0",
        "fuente": "simulation_results_v2.json (N=50,000, seed=2026, modelo ELO-Historial-Combinado v2.0)",
        "total_equipos": len(teams),
        "etapas": ["Clasificar de Grupos", "Cuartos de Final", "Semifinal", "Final", "Campeon"],
        "nota": "Las probabilidades son acumuladas: P(llegar a Cuartos) incluye P(clasificar de grupos)"
    },
    "equipos": teams,
    "bracket_esperado": bracket,
    "por_confederacion": conf_stats,
}

out_path = os.path.join(BASE, "outputs", "agent6_resultados.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print("AGENTE 6 — Resultados por Ronda")
print(f"{'='*60}")
print(f"Equipos procesados: {len(teams)}")
print()
print("BRACKET ESPERADO:")
print(f"  Campeon:   {bracket['campeon'][0]['name']} ({bracket['campeon'][0]['pct']:.2f}%)")
print(f"  Final:     {' vs '.join([t['name'] for t in bracket['final']])}")
print(f"  Semifinal: {' | '.join([t['name'] for t in bracket['semifinal']])}")
print(f"  Cuartos:   {', '.join([t['name'] for t in bracket['cuartos']])}")
print()
print("TOP 10 FAVORITOS AL CAMPEONATO:")
for i, t in enumerate(teams[:10], 1):
    print(f"  {i:2}. {t['flag']} {t['name']:<25} "
          f"Grupos:{t['grupos_pct']:5.1f}% → QF:{t['cuartos_pct']:5.1f}% → SF:{t['semis_pct']:5.1f}% → "
          f"Final:{t['final_pct']:5.1f}% → Campeon:{t['campeon_pct']:5.3f}%")
print()
print(f"Output guardado en: {out_path}")
print(f"{'='*60}")
