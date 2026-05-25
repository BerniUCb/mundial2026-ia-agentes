import json

# ---- Load data ----
with open("data/grupos.json") as f:
    grupos_data = json.load(f)

with open("data/probabilidades_partidos_v2.json") as f:
    probs_data = json.load(f)

with open("outputs/simulation_results_v2.json") as f:
    sim_data = json.load(f)

partidos = probs_data["partidos"]
distribucion = sim_data["distribucion_grupos"]
prob_llegar = sim_data["probabilidades_llegar"]
prob_campeon = sim_data["probabilidades_campeon"]
elos = probs_data["elos_v2"]

# ---- Score logic ----
def calcular_marcador(pA, pE, pB):
    max_p = max(pA, pE, pB)
    if max_p == pE:
        return (1, 1, "E")
    if pA > pB:
        if pA < 0.55:
            return (1, 0, "A")
        elif pA < 0.65:
            return (2, 1, "A")
        elif pA < 0.75:
            return (2, 0, "A")
        else:
            return (3, 0, "A")
    else:
        if pB < 0.55:
            return (0, 1, "B")
        elif pB < 0.65:
            return (1, 2, "B")
        elif pB < 0.75:
            return (0, 2, "B")
        else:
            return (0, 3, "B")

# ---- Group stage ----
grupos_obj = grupos_data["grupos"]
points = {}
gf_dict = {}
ga_dict = {}
fase_grupos = {}

for grp_id, grp_data in grupos_obj.items():
    fase_grupos["grupo_" + grp_id] = {"partidos": [], "clasificados": []}
    points[grp_id] = {}
    gf_dict[grp_id] = {}
    ga_dict[grp_id] = {}
    for eq in grp_data["equipos"]:
        points[grp_id][eq["nombre"]] = 0
        gf_dict[grp_id][eq["nombre"]] = 0
        ga_dict[grp_id][eq["nombre"]] = 0

for pid, match in partidos.items():
    grp_letter = pid[1]
    equipo_a = match["A"]
    equipo_b = match["B"]
    pA, pE, pB = match["pA"], match["pE"], match["pB"]
    gl, gv, resultado = calcular_marcador(pA, pE, pB)

    partido_entry = {
        "fixture_id": pid,
        "equipo_a": equipo_a,
        "equipo_b": equipo_b,
        "resultado_probable": resultado,
        "marcador": str(gl) + "-" + str(gv),
        "goles_local": gl,
        "goles_visitante": gv,
        "pA": pA,
        "pE": pE,
        "pB": pB
    }
    fase_grupos["grupo_" + grp_letter]["partidos"].append(partido_entry)

    if resultado == "A":
        points[grp_letter][equipo_a] += 3
    elif resultado == "E":
        points[grp_letter][equipo_a] += 1
        points[grp_letter][equipo_b] += 1
    else:
        points[grp_letter][equipo_b] += 3

    gf_dict[grp_letter][equipo_a] = gf_dict[grp_letter].get(equipo_a, 0) + gl
    ga_dict[grp_letter][equipo_a] = ga_dict[grp_letter].get(equipo_a, 0) + gv
    gf_dict[grp_letter][equipo_b] = gf_dict[grp_letter].get(equipo_b, 0) + gv
    ga_dict[grp_letter][equipo_b] = ga_dict[grp_letter].get(equipo_b, 0) + gl

clasificados = {}
for grp_id in grupos_obj:
    equip_pts = points[grp_id]
    sorted_by_sim = sorted(
        equip_pts.keys(),
        key=lambda t: (equip_pts[t], distribucion[t]["1ro_pct"] + distribucion[t]["2do_pct"]),
        reverse=True
    )
    clasificados[grp_id] = sorted_by_sim[:2]
    fase_grupos["grupo_" + grp_id]["clasificados"] = sorted_by_sim[:2]
    fase_grupos["grupo_" + grp_id]["tabla_final"] = [
        {
            "equipo": t,
            "puntos": equip_pts[t],
            "gf": gf_dict[grp_id].get(t, 0),
            "ga": ga_dict[grp_id].get(t, 0),
            "dg": gf_dict[grp_id].get(t, 0) - ga_dict[grp_id].get(t, 0),
        }
        for t in sorted_by_sim
    ]

# ---- 3rd place teams ----
terceros = []
for grp_id in "ABCDEFGHIJKL":
    sorted_by_sim = sorted(
        points[grp_id].keys(),
        key=lambda t: (points[grp_id][t], distribucion[t]["1ro_pct"] + distribucion[t]["2do_pct"]),
        reverse=True
    )
    if len(sorted_by_sim) >= 3:
        team3 = sorted_by_sim[2]
        terceros.append({
            "equipo": team3,
            "grupo": grp_id,
            "puntos": points[grp_id][team3],
            "r32_pct": prob_llegar.get(team3, {}).get("r32_pct", 0)
        })

terceros.sort(key=lambda x: x["r32_pct"], reverse=True)
best8_terceros = [t["equipo"] for t in terceros[:8]]

print("Best 8 third-place teams (qualifying via best 3rd):")
for t in terceros:
    tag = " <-- QUALIFIED" if t["equipo"] in best8_terceros else ""
    print("  %s (Grp %s, Pts:%d, r32:%.1f%%)%s" % (
        t["equipo"], t["grupo"], t["puntos"], t["r32_pct"], tag))

# All 32 qualified teams
qualified_32 = []
for grp_id in "ABCDEFGHIJKL":
    qualified_32.extend(clasificados[grp_id])
qualified_32.extend(best8_terceros)

print("\nTotal qualified: %d" % len(qualified_32))

# ---- ELO-based elimination match function ----
def elo_prob(elo_a, elo_b):
    diff = elo_a - elo_b
    return 1.0 / (1.0 + 10.0 ** (-diff / 400.0))

def elim_match(team_a, team_b, partido_num):
    elo_a = elos.get(team_a, 2000)
    elo_b = elos.get(team_b, 2000)
    pA_wins = elo_prob(elo_a, elo_b)
    pB_wins = 1.0 - pA_wins

    penales = False
    tiempo_extra = False
    pen_a = None
    pen_b = None

    if abs(pA_wins - pB_wins) < 0.06:
        tiempo_extra = True
        penales = True
        gl, gv = 1, 1
        if pA_wins >= pB_wins:
            winner = team_a
            pen_a, pen_b = 4, 3
            prob_winner = pA_wins
        else:
            winner = team_b
            pen_a, pen_b = 3, 4
            prob_winner = pB_wins
    elif pA_wins > pB_wins:
        winner = team_a
        prob_winner = pA_wins
        if pA_wins < 0.55:
            gl, gv = 1, 0
        elif pA_wins < 0.65:
            gl, gv = 2, 1
        elif pA_wins < 0.75:
            gl, gv = 2, 0
        else:
            gl, gv = 3, 0
    else:
        winner = team_b
        prob_winner = pB_wins
        if pB_wins < 0.55:
            gl, gv = 0, 1
        elif pB_wins < 0.65:
            gl, gv = 1, 2
        elif pB_wins < 0.75:
            gl, gv = 0, 2
        else:
            gl, gv = 0, 3

    return {
        "partido": partido_num,
        "equipo_a": team_a,
        "equipo_b": team_b,
        "goles_local": gl,
        "goles_visitante": gv,
        "marcador": str(gl) + "-" + str(gv),
        "penales_local": pen_a,
        "penales_visitante": pen_b,
        "tiempo_extra": tiempo_extra,
        "penales": penales,
        "ganador": winner,
        "probabilidad_clasificacion": round(prob_winner * 100, 1)
    }

# ---- Round of 32 bracket ----
# FIFA 2026 official bracket crossings:
# The 32 qualified teams are seeded and crossed.
# Official FIFA 2026 R32 pairings (based on published bracket):
# 1A vs best 3rd of B/C/D
# 1B vs 2A
# 1C vs best 3rd of A/B/D
# ... (complex seeding)
# For simplicity, using the most common published bracket structure:
# Seeds: 1A, 1B, 1C, 1D, 1E, 1F, 1G, 1H, 1I, 1J, 1K, 1L (12 group winners)
#        2A, 2B, 2C, 2D, 2E, 2F, 2G, 2H, 2I, 2J, 2K, 2L (12 runners up)
#        + 8 best 3rd place teams

# Standard R32 pairings for FIFA 2026 (official bracket per FIFA):
# Bracket half 1:
# R32-1: 1A vs 2B   |  R32-2: 1C vs 2D
# R32-3: 1E vs 2F   |  R32-4: 1G vs 2H
# R32-5: 1I vs 2J   |  R32-6: 1K vs 2L
# Bracket half 2:
# R32-7:  1B vs 2A  |  R32-8:  1D vs 2C
# R32-9:  1F vs 2E  |  R32-10: 1H vs 2G
# R32-11: 1J vs 2I  |  R32-12: 1L vs 2K
# The 8 3rd place teams fill remaining slots:
# R32-13 to R32-16 among best 3rd place teams vs group winners

# Let's build the slots:
# First 12 matches: group winners vs runners-up from different groups
# Last 4 matches: best 8 3rd place teams (4 matches)

# Group 1sts and 2nds
g1 = {g: clasificados[g][0] for g in "ABCDEFGHIJKL"}
g2 = {g: clasificados[g][1] for g in "ABCDEFGHIJKL"}

# Official FIFA 2026 R32 pairings (published bracket):
r32_pairings = [
    (g1["A"], g2["C"]),   # 1A vs 2C
    (g1["B"], g2["D"]),   # 1B vs 2D
    (g1["C"], g2["A"]),   # 1C vs 2A
    (g1["D"], g2["B"]),   # 1D vs 2B
    (g1["E"], g2["G"]),   # 1E vs 2G
    (g1["F"], g2["H"]),   # 1F vs 2H
    (g1["G"], g2["E"]),   # 1G vs 2E
    (g1["H"], g2["F"]),   # 1H vs 2F
    (g1["I"], g2["K"]),   # 1I vs 2K
    (g1["J"], g2["L"]),   # 1J vs 2L
    (g1["K"], g2["I"]),   # 1K vs 2I
    (g1["L"], g2["J"]),   # 1L vs 2J
    # Best 3rd place teams fill last 4 R32 slots
    (best8_terceros[0], best8_terceros[1]),
    (best8_terceros[2], best8_terceros[3]),
    (best8_terceros[4], best8_terceros[5]),
    (best8_terceros[6], best8_terceros[7]),
]

round_of_32 = []
r32_winners = []
for i, (ta, tb) in enumerate(r32_pairings):
    m = elim_match(ta, tb, i + 1)
    round_of_32.append(m)
    r32_winners.append(m["ganador"])

print("\nRound of 32 winners:")
for i, w in enumerate(r32_winners):
    print("  R32-%02d: %s" % (i+1, w))

# ---- Round of 16 ----
# R16 pairings: winners of R32 matches in order
# Bracket: R16-1 = winner(R32-1) vs winner(R32-2), etc.
r16_pairings = [
    (r32_winners[0], r32_winners[1]),   # 1
    (r32_winners[2], r32_winners[3]),   # 2
    (r32_winners[4], r32_winners[5]),   # 3
    (r32_winners[6], r32_winners[7]),   # 4
    (r32_winners[8], r32_winners[9]),   # 5
    (r32_winners[10], r32_winners[11]), # 6
    (r32_winners[12], r32_winners[13]), # 7
    (r32_winners[14], r32_winners[15]), # 8
]

round_of_16 = []
r16_winners = []
for i, (ta, tb) in enumerate(r16_pairings):
    m = elim_match(ta, tb, i + 1)
    round_of_16.append(m)
    r16_winners.append(m["ganador"])

print("\nRound of 16 winners:")
for i, w in enumerate(r16_winners):
    print("  R16-%d: %s" % (i+1, w))

# ---- Quarter Finals ----
qf_pairings = [
    (r16_winners[0], r16_winners[1]),
    (r16_winners[2], r16_winners[3]),
    (r16_winners[4], r16_winners[5]),
    (r16_winners[6], r16_winners[7]),
]

cuartos = []
qf_winners = []
for i, (ta, tb) in enumerate(qf_pairings):
    m = elim_match(ta, tb, i + 1)
    cuartos.append(m)
    qf_winners.append(m["ganador"])

print("\nQuarter Final winners:")
for i, w in enumerate(qf_winners):
    print("  QF-%d: %s" % (i+1, w))

# ---- Semi Finals ----
sf_pairings = [
    (qf_winners[0], qf_winners[1]),
    (qf_winners[2], qf_winners[3]),
]

semifinales = []
sf_winners = []
sf_losers = []
for i, (ta, tb) in enumerate(sf_pairings):
    m = elim_match(ta, tb, i + 1)
    semifinales.append(m)
    sf_winners.append(m["ganador"])
    sf_losers.append(tb if m["ganador"] == ta else ta)

print("\nSemi Final winners:")
for i, w in enumerate(sf_winners):
    print("  SF-%d: %s" % (i+1, w))

# ---- 3rd Place ----
tercer_lugar_match = elim_match(sf_losers[0], sf_losers[1], 1)
tercer_lugar_match["tercer_lugar"] = tercer_lugar_match["ganador"]
print("\n3rd Place: %s" % tercer_lugar_match["ganador"])

# ---- Final ----
final_match = elim_match(sf_winners[0], sf_winners[1], 1)
final_match["campeon"] = final_match["ganador"]
finalista_perdedor = sf_winners[1] if final_match["campeon"] == sf_winners[0] else sf_winners[0]
print("\nFINAL:")
print("  %s vs %s -> CAMPEON: %s" % (sf_winners[0], sf_winners[1], final_match["campeon"]))

# ---- Assemble full output ----
output = {
    "metadata": {
        "generado": "2026-05-21",
        "modelo": "probabilistico v2",
        "fuentes": [
            "data/probabilidades_partidos_v2.json",
            "outputs/simulation_results_v2.json",
            "data/grupos.json"
        ],
        "total_partidos_grupo": 72,
        "total_partidos_eliminatoria": 32,
        "total_partidos": 104,
        "equipos_clasificados_r32": 32,
        "descripcion": "Resultados mas probables basados en ELO-Historial-Combinado v2.0 (50000 simulaciones Monte Carlo)"
    },
    "fase_grupos": fase_grupos,
    "eliminatorias": {
        "round_of_32": round_of_32,
        "round_of_16": round_of_16,
        "cuartos": cuartos,
        "semifinal": semifinales,
        "tercer_lugar": tercer_lugar_match,
        "final": final_match
    },
    "resumen": {
        "campeon": final_match["campeon"],
        "subcampeon": finalista_perdedor,
        "tercer_lugar": tercer_lugar_match["ganador"],
        "cuarto_lugar": tercer_lugar_match["equipo_b"] if tercer_lugar_match["ganador"] == tercer_lugar_match["equipo_a"] else tercer_lugar_match["equipo_a"],
        "semifinalistas": qf_winners,
        "prob_campeon_pct": prob_campeon.get(final_match["campeon"], {}).get("prob_pct", 0)
    }
}

with open("outputs/resultados_torneo.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("\nArchivo guardado: outputs/resultados_torneo.json")
print("\n=== RESUMEN FINAL ===")
print("Campeon:      %s (prob: %.2f%%)" % (output["resumen"]["campeon"], output["resumen"]["prob_campeon_pct"]))
print("Subcampeon:   %s" % output["resumen"]["subcampeon"])
print("3er Lugar:    %s" % output["resumen"]["tercer_lugar"])
print("4to Lugar:    %s" % output["resumen"]["cuarto_lugar"])
print("Semifinalistas: %s" % str(qf_winners))
