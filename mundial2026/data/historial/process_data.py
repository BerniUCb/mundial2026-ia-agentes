#!/usr/bin/env python3
"""
Process international football results for FIFA World Cup 2026 simulation.
Filters 48 qualified teams, official matches only (no friendlies), Jan 2018 - May 2026.
"""

import csv
import json
from collections import defaultdict
from datetime import datetime

# === CONFIGURATION ===

BASE_DIR = "E:/UCB/5 Semestre/IA AGENTES/mundial2026/data"
RAW_CSV = f"{BASE_DIR}/historial/results_raw.csv"
DATE_START = "2018-01-01"
DATE_END = "2026-05-16"

# Name mapping: our standard name -> dataset name
NAME_MAP = {
    "Czechia": "Czech Republic",
    "Turkiye": "Turkey",
    "Curacao": "Cura\u00e7ao",  # Curacao with cedilla
}

# Reverse map: dataset name -> our standard name
REVERSE_NAME_MAP = {v: k for k, v in NAME_MAP.items()}

# 48 qualified teams (standard names from grupos.json)
QUALIFIED_TEAMS = [
    "Mexico", "South Africa", "South Korea", "Czechia",
    "Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland",
    "Brazil", "Morocco", "Haiti", "Scotland",
    "United States", "Paraguay", "Australia", "Turkiye",
    "Germany", "Curacao", "Ivory Coast", "Ecuador",
    "Netherlands", "Japan", "Sweden", "Tunisia",
    "Belgium", "Egypt", "Iran", "New Zealand",
    "Spain", "Cape Verde", "Saudi Arabia", "Uruguay",
    "France", "Senegal", "Iraq", "Norway",
    "Argentina", "Algeria", "Austria", "Jordan",
    "Portugal", "DR Congo", "Uzbekistan", "Colombia",
    "England", "Croatia", "Ghana", "Panama",
]

# Team -> Group mapping
TEAM_GROUPS = {}
with open(f"{BASE_DIR}/grupos.json", "r", encoding="utf-8") as f:
    grupos_data = json.load(f)
    for group_letter, group_info in grupos_data["grupos"].items():
        for team in group_info["equipos"]:
            TEAM_GROUPS[team["nombre"]] = group_letter

# Official tournaments to INCLUDE (everything else excluded)
OFFICIAL_TOURNAMENTS = {
    "FIFA World Cup",
    "FIFA World Cup qualification",
    "Copa Am\u00e9rica",
    "Copa Am\u00e9rica qualification",
    "UEFA Euro",
    "UEFA Euro qualification",
    "UEFA Nations League",
    "African Cup of Nations",
    "African Cup of Nations qualification",
    "AFC Asian Cup",
    "AFC Asian Cup qualification",
    "Gold Cup",
    "Gold Cup qualification",
    "CONCACAF Nations League",
    "CONCACAF Nations League qualification",
    "Oceania Nations Cup",
    "Oceania Nations Cup qualification",
    "CONMEBOL\u2013UEFA Cup of Champions",  # Finalissima
    "Arab Cup",
    "Arab Cup qualification",
    "WAFF Championship",
    "COSAFA Cup",
    "SAFF Cup",
    "AFF Championship",
    "AFF Championship qualification",
    "EAFF Championship",
    "EAFF Championship qualification",
    "CAFA Nations Cup",
    "Intercontinental Cup",
    "ASEAN Championship",
    "ASEAN Championship qualification",
    "Gulf Cup",
}


def standardize_name(name):
    """Convert dataset name to our standard name."""
    return REVERSE_NAME_MAP.get(name, name)


def dataset_name(standard_name):
    """Convert our standard name to dataset name."""
    return NAME_MAP.get(standard_name, standard_name)


def load_and_filter():
    """Load CSV and filter to official matches involving 48 teams, 2018-2026."""
    # Build set of dataset names for our 48 teams
    target_names = set()
    for team in QUALIFIED_TEAMS:
        target_names.add(dataset_name(team))

    matches = []
    with open(RAW_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            date = row["date"]
            if date < DATE_START or date > DATE_END:
                continue

            tournament = row["tournament"]
            if tournament not in OFFICIAL_TOURNAMENTS:
                continue

            home = row["home_team"]
            away = row["away_team"]

            # At least one of the 48 teams must be involved
            home_is_target = home in target_names
            away_is_target = away in target_names

            if not (home_is_target or away_is_target):
                continue

            # Skip matches with NA scores (future/unplayed)
            if row["home_score"] == "NA" or row["away_score"] == "NA":
                continue

            try:
                home_score = int(row["home_score"])
                away_score = int(row["away_score"])
            except (ValueError, TypeError):
                continue

            match = {
                "fecha": date,
                "equipo_local": standardize_name(home),
                "equipo_visitante": standardize_name(away),
                "goles_local": home_score,
                "goles_visitante": away_score,
                "competencia": tournament,
                "ciudad": row.get("city", ""),
                "pais": row.get("country", ""),
                "neutral": row.get("neutral", "FALSE") == "TRUE",
            }

            # Determine result
            if home_score > away_score:
                match["resultado"] = "local"
            elif away_score > home_score:
                match["resultado"] = "visitante"
            else:
                match["resultado"] = "empate"

            matches.append(match)

    return matches


def compute_team_stats(matches):
    """Compute per-team statistics from filtered matches."""
    stats = {}
    for team in QUALIFIED_TEAMS:
        stats[team] = {
            "equipo": team,
            "grupo": TEAM_GROUPS.get(team, "?"),
            "partidos_jugados": 0,
            "victorias": 0,
            "empates": 0,
            "derrotas": 0,
            "goles_favor": 0,
            "goles_contra": 0,
            "competencias": defaultdict(int),
            "racha_actual": [],
        }

    for match in matches:
        home = match["equipo_local"]
        away = match["equipo_visitante"]
        hg = match["goles_local"]
        ag = match["goles_visitante"]
        comp = match["competencia"]

        # Process home team if it's one of 48
        if home in stats:
            s = stats[home]
            s["partidos_jugados"] += 1
            s["goles_favor"] += hg
            s["goles_contra"] += ag
            s["competencias"][comp] += 1
            if hg > ag:
                s["victorias"] += 1
                s["racha_actual"].append("W")
            elif hg < ag:
                s["derrotas"] += 1
                s["racha_actual"].append("L")
            else:
                s["empates"] += 1
                s["racha_actual"].append("D")

        # Process away team if it's one of 48
        if away in stats:
            s = stats[away]
            s["partidos_jugados"] += 1
            s["goles_favor"] += ag
            s["goles_contra"] += hg
            s["competencias"][comp] += 1
            if ag > hg:
                s["victorias"] += 1
                s["racha_actual"].append("W")
            elif ag < hg:
                s["derrotas"] += 1
                s["racha_actual"].append("L")
            else:
                s["empates"] += 1
                s["racha_actual"].append("D")

    # Compute derived stats and streaks
    for team, s in stats.items():
        p = s["partidos_jugados"]
        if p > 0:
            s["porcentaje_victorias"] = round(s["victorias"] / p * 100, 2)
            s["promedio_gf_partido"] = round(s["goles_favor"] / p, 2)
            s["promedio_gc_partido"] = round(s["goles_contra"] / p, 2)
            s["diferencia_goles"] = s["goles_favor"] - s["goles_contra"]
        else:
            s["porcentaje_victorias"] = 0
            s["promedio_gf_partido"] = 0
            s["promedio_gc_partido"] = 0
            s["diferencia_goles"] = 0

        # Compute current streak (last N same results)
        racha = s["racha_actual"]
        if racha:
            current = racha[-1]
            count = 0
            for r in reversed(racha):
                if r == current:
                    count += 1
                else:
                    break
            streak_label = {"W": "victorias", "L": "derrotas", "D": "empates"}
            s["racha_descripcion"] = f"{count} {streak_label[current]} consecutivas"
        else:
            s["racha_descripcion"] = "Sin datos"

        # Compute longest win streak
        max_win = 0
        current_win = 0
        for r in racha:
            if r == "W":
                current_win += 1
                max_win = max(max_win, current_win)
            else:
                current_win = 0
        s["mejor_racha_victorias"] = max_win

        # Last 5 results
        s["ultimos_5"] = "".join(racha[-5:]) if len(racha) >= 5 else "".join(racha)

        # Convert competencias from defaultdict to regular dict
        s["competencias"] = dict(s["competencias"])
        # Remove internal racha list
        del s["racha_actual"]

    return stats


def find_penalty_matches(matches):
    """
    The martj42 dataset does NOT include penalty shootout data.
    We mark draws in knockout stages as potential penalty matches.
    """
    penalty_candidates = []
    knockout_keywords = ["final", "quarter", "semi", "round of", "third"]

    for match in matches:
        if match["resultado"] == "empate":
            # In knockout competitions, draws typically go to penalties
            # But we can't confirm from this dataset alone
            penalty_candidates.append({
                "fecha": match["fecha"],
                "equipo_local": match["equipo_local"],
                "equipo_visitante": match["equipo_visitante"],
                "goles_local": match["goles_local"],
                "goles_visitante": match["goles_visitante"],
                "competencia": match["competencia"],
                "nota": "Empate en tiempo regular - posible tanda de penales en fase eliminatoria"
            })

    return penalty_candidates


def main():
    print("Loading and filtering matches...")
    matches = load_and_filter()
    print(f"Total official matches found: {len(matches)}")

    # Sort by date
    matches.sort(key=lambda x: x["fecha"])

    print("\nComputing team statistics...")
    stats = compute_team_stats(matches)

    # Validate
    issues = []
    for team, s in stats.items():
        p = s["partidos_jugados"]
        w = s["victorias"]
        d = s["empates"]
        l = s["derrotas"]
        if w + d + l != p:
            issues.append(f"  VALIDATION ERROR: {team}: W({w})+D({d})+L({l})={w+d+l} != P({p})")
        if p == 0:
            issues.append(f"  WARNING: {team} has 0 official matches")
        elif p < 10:
            issues.append(f"  WARNING: {team} has only {p} official matches (sparse data)")

    if issues:
        print("\nData quality issues:")
        for i in issues:
            print(i)
    else:
        print("All validations passed.")

    # Print summary
    print("\n=== TEAM SUMMARY (sorted by win%) ===")
    sorted_teams = sorted(stats.values(), key=lambda x: -x["porcentaje_victorias"])
    for s in sorted_teams:
        print(f"  {s['equipo']:30s} | Grp {s['grupo']} | P:{s['partidos_jugados']:3d} W:{s['victorias']:3d} D:{s['empates']:3d} L:{s['derrotas']:3d} | GF:{s['goles_favor']:3d} GA:{s['goles_contra']:3d} | Win%:{s['porcentaje_victorias']:6.2f}")

    # Find penalty candidates
    penalty_matches = find_penalty_matches(matches)

    # === SAVE FILES ===

    # 1. All official matches
    output_matches = {
        "titulo": "Partidos oficiales de los 48 equipos clasificados al Mundial 2026",
        "periodo": f"{DATE_START} a {DATE_END}",
        "total_partidos": len(matches),
        "torneos_incluidos": sorted(list(OFFICIAL_TOURNAMENTS)),
        "torneos_excluidos": ["Friendly", "FIFA Series", "CONCACAF Series", "Olympics", "Youth tournaments", "Club competitions"],
        "fecha_generacion": datetime.now().strftime("%Y-%m-%d"),
        "fuente": "github.com/martj42/international_results (updated April 2026)",
        "partidos": matches,
    }
    with open(f"{BASE_DIR}/historial/partidos_oficiales_2018_2026.json", "w", encoding="utf-8") as f:
        json.dump(output_matches, f, ensure_ascii=False, indent=2)
    print(f"\nSaved: partidos_oficiales_2018_2026.json ({len(matches)} matches)")

    # 2. Penalty matches
    output_penalties = {
        "titulo": "Partidos con posibles tandas de penales (empates en tiempo regular)",
        "periodo": f"{DATE_START} a {DATE_END}",
        "total_candidatos": len(penalty_matches),
        "nota": "El dataset martj42 NO incluye resultados de penales. Estos son empates en tiempo regular que en fases eliminatorias pudieron ir a penales. Se requiere cruzar con fuentes adicionales para confirmar.",
        "fecha_generacion": datetime.now().strftime("%Y-%m-%d"),
        "fuente": "github.com/martj42/international_results",
        "partidos": penalty_matches,
    }
    with open(f"{BASE_DIR}/historial/penales_2018_2026.json", "w", encoding="utf-8") as f:
        json.dump(output_penalties, f, ensure_ascii=False, indent=2)
    print(f"Saved: penales_2018_2026.json ({len(penalty_matches)} candidates)")

    # 3. Per-team summary
    output_summary = {
        "titulo": "Resumen estadistico por equipo - 48 clasificados Mundial 2026",
        "periodo": f"{DATE_START} a {DATE_END}",
        "competencias_oficiales_solamente": True,
        "fecha_generacion": datetime.now().strftime("%Y-%m-%d"),
        "fuente": "github.com/martj42/international_results (updated April 2026)",
        "equipos": {team: s for team, s in sorted(stats.items())},
    }
    with open(f"{BASE_DIR}/historial/resumen_por_equipo.json", "w", encoding="utf-8") as f:
        json.dump(output_summary, f, ensure_ascii=False, indent=2)
    print(f"Saved: resumen_por_equipo.json ({len(stats)} teams)")


if __name__ == "__main__":
    main()
