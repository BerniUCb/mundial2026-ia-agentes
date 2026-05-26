"""
Simulador FIFA World Cup 2026 — Modelo ELO-Historial-Combinado v2.0
====================================================================
Autor  : Bernardo Rios Tapia
Materia: Inteligencia Artificial con Agentes — UCB, 5to Semestre 2026
Python : 3.12+

Descripcion:
    Programa interactivo que permite ejecutar y explorar la simulacion
    Monte Carlo del Mundial 2026. Implementa el modelo v2.0 con ELOs
    ajustados, historial 2018-2026 y forma reciente.

Uso:
    python -X utf8 simulador.py

Sin dependencias externas — solo biblioteca estandar de Python.
"""

import math
import random
import time
from dataclasses import dataclass, field
from typing import Optional


# =============================================================================
# CONSTANTES DEL MODELO
# =============================================================================

SEED_DEFAULT: int = 2026
N_DEFAULT: int = 10_000

PESO_ELO: float = 0.55
PESO_HIST: float = 0.35
PESO_FORMA: float = 0.10

ALPHA_GRUPOS: float = 0.25     # Factor de empate en fase de grupos
ALPHA_ELIM: float = 0.18       # Factor de empate en eliminatorias
PROB_MAX_ELO: float = 0.90     # Cap para evitar probabilidades extremas


# =============================================================================
# DATOS DEL TORNEO
# =============================================================================

# ELOs base (modelo v1) + ajustes del agente ELO Analyst (modelo v2)
_ELOS_BASE: dict[str, int] = {
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
    "New Zealand": 1650,
}

_AJUSTES_ELO: dict[str, int] = {
    "Morocco": +55, "England": -20, "France": -15, "Spain": -10,
    "Norway": +25, "Germany": +15, "Brazil": -12, "Argentina": +15,
    "Japan": +25, "Croatia": -25, "New Zealand": -55, "Colombia": -15,
    "Belgium": -25, "Senegal": +40, "Uruguay": -10, "Netherlands": -5,
    "Ivory Coast": +35, "Iran": +20, "South Korea": +20, "Ecuador": -25,
    "Algeria": +30, "United States": +10, "Mexico": +10, "Canada": +10,
    "Portugal": 0, "Switzerland": +5, "Australia": +5,
}

ELOS: dict[str, int] = {
    equipo: _ELOS_BASE[equipo] + _AJUSTES_ELO.get(equipo, 0)
    for equipo in _ELOS_BASE
}

GRUPOS: dict[str, list[str]] = {
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

HISTORIAL: dict[str, dict[str, float]] = {
    "France":      {"wr": 0.7632, "dr": 0.1053},
    "Spain":       {"wr": 0.7333, "dr": 0.1111},
    "Argentina":   {"wr": 0.7500, "dr": 0.1071},
    "England":     {"wr": 0.7500, "dr": 0.1429},
    "Portugal":    {"wr": 0.6250, "dr": 0.1667},
    "Brazil":      {"wr": 0.6667, "dr": 0.1176},
    "Netherlands": {"wr": 0.6571, "dr": 0.1714},
    "Belgium":     {"wr": 0.6582, "dr": 0.1266},
    "Germany":     {"wr": 0.6364, "dr": 0.1818},
    "Croatia":     {"wr": 0.5062, "dr": 0.2346},
    "Morocco":     {"wr": 0.7143, "dr": 0.1169},
    "Colombia":    {"wr": 0.4035, "dr": 0.3509},
    "Uruguay":     {"wr": 0.4576, "dr": 0.2712},
    "Senegal":     {"wr": 0.6463, "dr": 0.1463},
    "Mexico":      {"wr": 0.6324, "dr": 0.1912},
    "Switzerland": {"wr": 0.4189, "dr": 0.3243},
    "United States": {"wr": 0.6406, "dr": 0.1563},
    "Turkiye":     {"wr": 0.5098, "dr": 0.2157},
    "Japan":       {"wr": 0.6935, "dr": 0.0968},
    "Ecuador":     {"wr": 0.3333, "dr": 0.3922},
    "Austria":     {"wr": 0.5897, "dr": 0.2051},
    "Iran":        {"wr": 0.6909, "dr": 0.1273},
    "South Korea": {"wr": 0.6316, "dr": 0.1754},
    "Norway":      {"wr": 0.5574, "dr": 0.2131},
    "Australia":   {"wr": 0.5849, "dr": 0.1698},
    "Algeria":     {"wr": 0.6522, "dr": 0.1594},
    "Egypt":       {"wr": 0.5556, "dr": 0.2222},
    "Canada":      {"wr": 0.5821, "dr": 0.1493},
    "Panama":      {"wr": 0.4286, "dr": 0.2143},
    "Sweden":      {"wr": 0.5385, "dr": 0.2308},
    "Ivory Coast": {"wr": 0.6500, "dr": 0.1833},
    "Paraguay":    {"wr": 0.3784, "dr": 0.2973},
    "Czechia":     {"wr": 0.4737, "dr": 0.2632},
    "Scotland":    {"wr": 0.4444, "dr": 0.2778},
    "Tunisia":     {"wr": 0.3953, "dr": 0.2558},
    "DR Congo":    {"wr": 0.5200, "dr": 0.2400},
    "Uzbekistan":  {"wr": 0.5263, "dr": 0.1842},
    "Qatar":       {"wr": 0.4706, "dr": 0.1176},
    "Iraq":        {"wr": 0.4167, "dr": 0.2500},
    "South Africa": {"wr": 0.4706, "dr": 0.1765},
    "Bosnia and Herzegovina": {"wr": 0.4737, "dr": 0.2105},
    "Saudi Arabia": {"wr": 0.4444, "dr": 0.1667},
    "Jordan":      {"wr": 0.4118, "dr": 0.2353},
    "Cape Verde":  {"wr": 0.5000, "dr": 0.2500},
    "Ghana":       {"wr": 0.3929, "dr": 0.2857},
    "Curacao":     {"wr": 0.3571, "dr": 0.2143},
    "Haiti":       {"wr": 0.3077, "dr": 0.1538},
    "New Zealand": {"wr": 0.8889, "dr": 0.0556},
}

FORMA: dict[str, float] = {
    "France": 0.80, "Spain": 0.90, "Argentina": 0.80, "England": 1.00,
    "Portugal": 0.70, "Brazil": 0.50, "Netherlands": 0.80, "Belgium": 0.60,
    "Germany": 1.00, "Croatia": 0.80, "Morocco": 0.80, "Colombia": 0.60,
    "Uruguay": 0.50, "Senegal": 0.70, "Mexico": 0.80, "Switzerland": 0.70,
    "United States": 0.70, "Turkiye": 0.60, "Japan": 0.80, "Ecuador": 0.30,
    "Austria": 0.60, "Iran": 0.80, "South Korea": 0.70, "Norway": 1.00,
    "Australia": 0.80, "Algeria": 0.80, "Egypt": 0.60, "Canada": 0.70,
    "Panama": 0.60, "Sweden": 0.70, "Ivory Coast": 0.70, "Paraguay": 0.50,
    "Czechia": 0.50, "Scotland": 0.50, "Tunisia": 0.50, "DR Congo": 0.60,
    "Uzbekistan": 0.60, "Qatar": 0.60, "Iraq": 0.50, "South Africa": 0.50,
    "Bosnia and Herzegovina": 0.50, "Saudi Arabia": 0.40, "Jordan": 0.50,
    "Cape Verde": 0.60, "Ghana": 0.40, "Curacao": 0.40, "Haiti": 0.30,
    "New Zealand": 0.50,
}

PENALES: dict[str, float] = {
    "Argentina": 0.70, "France": 0.60, "Spain": 0.65, "England": 0.55,
    "Portugal": 0.60, "Brazil": 0.58, "Germany": 0.62, "Netherlands": 0.58,
    "Croatia": 0.65, "Morocco": 0.60, "Italy": 0.60, "Belgium": 0.55,
}

BANDERAS: dict[str, str] = {
    "France": "FR", "Spain": "ES", "Argentina": "AR", "England": "GB",
    "Portugal": "PT", "Brazil": "BR", "Netherlands": "NL", "Belgium": "BE",
    "Germany": "DE", "Croatia": "HR", "Morocco": "MA", "Colombia": "CO",
    "Uruguay": "UY", "Senegal": "SN", "Mexico": "MX", "Switzerland": "CH",
    "United States": "US", "Turkiye": "TR", "Japan": "JP", "Ecuador": "EC",
    "Austria": "AT", "Iran": "IR", "South Korea": "KR", "Norway": "NO",
    "Australia": "AU", "Algeria": "DZ", "Egypt": "EG", "Canada": "CA",
    "Panama": "PA", "Sweden": "SE", "Ivory Coast": "CI", "Paraguay": "PY",
    "Czechia": "CZ", "Scotland": "GB-SCT", "Tunisia": "TN", "DR Congo": "CD",
    "Uzbekistan": "UZ", "Qatar": "QA", "Iraq": "IQ", "South Africa": "ZA",
    "Bosnia and Herzegovina": "BA", "Saudi Arabia": "SA", "Jordan": "JO",
    "Cape Verde": "CV", "Ghana": "GH", "Curacao": "CW", "Haiti": "HT",
    "New Zealand": "NZ",
}


# =============================================================================
# MODELO DE PROBABILIDADES
# =============================================================================

def calcular_prob_partido(
    equipo_a: str,
    equipo_b: str,
) -> tuple[float, float, float]:
    """Calcula P(A gana), P(empate), P(B gana) usando el modelo v2.

    Combina ELO logistico (55%), historial 2018-2026 (35%) y forma
    reciente (10%). El empate se modela con distribucion trinomial
    calibrada segun la diferencia de ELO entre los equipos.

    Args:
        equipo_a: Nombre del primer equipo.
        equipo_b: Nombre del segundo equipo.

    Returns:
        Tupla (p_a, p_empate, p_b) normalizada a 1.0.
    """
    elo_a = ELOS.get(equipo_a, 2000)
    elo_b = ELOS.get(equipo_b, 2000)
    diferencia = elo_a - elo_b

    # Componente ELO — formula logistica clasica
    p_a_elo = 1.0 / (1.0 + 10.0 ** (-diferencia / 400.0))
    p_a_elo = min(p_a_elo, PROB_MAX_ELO)
    p_b_elo = 1.0 - p_a_elo

    # Componente historial — win rate relativo
    hist_a = HISTORIAL.get(equipo_a, {"wr": 0.50, "dr": 0.20})
    hist_b = HISTORIAL.get(equipo_b, {"wr": 0.50, "dr": 0.20})
    total_hist = hist_a["wr"] + hist_b["wr"]
    p_a_hist = hist_a["wr"] / total_hist if total_hist > 0 else 0.5
    p_b_hist = hist_b["wr"] / total_hist if total_hist > 0 else 0.5
    p_e_hist = (hist_a["dr"] + hist_b["dr"]) / 2.0

    # Componente forma — ultimos 5 partidos
    forma_a = FORMA.get(equipo_a, 0.5)
    forma_b = FORMA.get(equipo_b, 0.5)
    total_forma = forma_a + forma_b
    p_a_forma = forma_a / total_forma if total_forma > 0 else 0.5
    p_b_forma = forma_b / total_forma if total_forma > 0 else 0.5

    # Combinacion ponderada
    p_a_raw = PESO_ELO * p_a_elo + PESO_HIST * p_a_hist + PESO_FORMA * p_a_forma
    p_b_raw = PESO_ELO * p_b_elo + PESO_HIST * p_b_hist + PESO_FORMA * p_b_forma

    # Empate: moderado por diferencia de ELO
    p_e_raw = p_e_hist * (1.0 - abs(p_a_elo - p_b_elo) * 0.5)
    p_e_raw = max(0.04, min(p_e_raw, 0.35))

    # Ajustar para respetar el espacio del empate
    suma_ab = p_a_raw + p_b_raw
    factor = (1.0 - p_e_raw) / suma_ab if suma_ab > 0 else 0.5
    p_a = p_a_raw * factor
    p_b = p_b_raw * factor
    p_e = p_e_raw

    # Normalizar
    total = p_a + p_e + p_b
    if total == 0:
        return 1 / 3, 1 / 3, 1 / 3

    return round(p_a / total, 4), round(p_e / total, 4), round(p_b / total, 4)


def simular_partido_grupos(
    equipo_a: str,
    equipo_b: str,
    rng: random.Random,
) -> str:
    """Simula un partido de fase de grupos. Puede terminar en empate.

    Args:
        equipo_a: Nombre del primer equipo.
        equipo_b: Nombre del segundo equipo.
        rng: Instancia de Random con seed fijo para reproducibilidad.

    Returns:
        Nombre del equipo ganador, o 'EMPATE'.
    """
    p_a, p_e, _ = calcular_prob_partido(equipo_a, equipo_b)
    r = rng.random()
    if r < p_a:
        return equipo_a
    if r < p_a + p_e:
        return "EMPATE"
    return equipo_b


def simular_partido_eliminatoria(
    equipo_a: str,
    equipo_b: str,
    rng: random.Random,
) -> str:
    """Simula un partido eliminatorio. Si hay empate, va a penales.

    Args:
        equipo_a: Nombre del primer equipo.
        equipo_b: Nombre del segundo equipo.
        rng: Instancia de Random con seed fijo para reproducibilidad.

    Returns:
        Nombre del equipo que avanza.
    """
    p_a, p_e, _ = calcular_prob_partido(equipo_a, equipo_b)

    # En eliminatorias se reduce el alpha de empate
    p_e_elim = p_e * (ALPHA_ELIM / ALPHA_GRUPOS)
    factor = (1.0 - p_e_elim) / (p_a + (1.0 - p_a - p_e))
    p_a_elim = p_a * factor

    r = rng.random()
    if r < p_a_elim:
        return equipo_a
    if r < p_a_elim + p_e_elim:
        # Penales
        prob_penal_a = PENALES.get(equipo_a, 0.50)
        return equipo_a if rng.random() < prob_penal_a else equipo_b
    return equipo_b


# =============================================================================
# SIMULACION DEL TORNEO COMPLETO
# =============================================================================

@dataclass
class ResultadoGrupo:
    """Resultado de la fase de grupos para un equipo."""

    equipo: str
    puntos: int = 0
    gd: float = 0.0      # Diferencia de goles (simulada via ELO)


def simular_fase_grupos(
    rng: random.Random,
) -> tuple[dict[str, list[str]], list[str]]:
    """Simula los 72 partidos de la fase de grupos.

    Cada grupo juega todos contra todos (round-robin). Clasifican los
    2 primeros de cada grupo + los 8 mejores terceros.

    Args:
        rng: Instancia Random para reproducibilidad.

    Returns:
        Tupla (clasificados_por_grupo, mejores_terceros) donde
        clasificados_por_grupo es un dict grupo -> [1ro, 2do] y
        mejores_terceros es la lista de los 8 mejores terceros.
    """
    clasificados: dict[str, list[str]] = {}
    terceros: list[ResultadoGrupo] = []

    for letra, equipos in GRUPOS.items():
        resultados: dict[str, ResultadoGrupo] = {
            e: ResultadoGrupo(equipo=e) for e in equipos
        }

        # Round-robin: todos contra todos
        for i, eq_a in enumerate(equipos):
            for eq_b in equipos[i + 1:]:
                resultado = simular_partido_grupos(eq_a, eq_b, rng)
                if resultado == eq_a:
                    resultados[eq_a].puntos += 3
                    resultados[eq_a].gd += 1.0
                    resultados[eq_b].gd -= 1.0
                elif resultado == eq_b:
                    resultados[eq_b].puntos += 3
                    resultados[eq_b].gd += 1.0
                    resultados[eq_a].gd -= 1.0
                else:
                    resultados[eq_a].puntos += 1
                    resultados[eq_b].puntos += 1

        # Ordenar por puntos, luego por diferencia de goles
        tabla = sorted(
            resultados.values(),
            key=lambda r: (r.puntos, r.gd),
            reverse=True,
        )

        clasificados[letra] = [tabla[0].equipo, tabla[1].equipo]
        terceros.append(tabla[2])

    # Los 8 mejores terceros (por puntos, luego ELO como desempate)
    mejores_terceros = sorted(
        terceros,
        key=lambda r: (r.puntos, ELOS.get(r.equipo, 0)),
        reverse=True,
    )[:8]

    return clasificados, [r.equipo for r in mejores_terceros]


def simular_fase_eliminatoria(
    clasificados: dict[str, list[str]],
    mejores_terceros: list[str],
    rng: random.Random,
) -> str:
    """Simula la fase eliminatoria desde octavos hasta la final.

    Args:
        clasificados: Dict grupo -> [1ro, 2do].
        mejores_terceros: Lista de los 8 mejores terceros clasificados.
        rng: Instancia Random para reproducibilidad.

    Returns:
        Nombre del equipo campeon.
    """
    # Construccion del bracket de 32 equipos
    # Siguiendo el formato oficial FIFA 2026
    bracket: list[tuple[str, str]] = []
    grupos = list("ABCDEFGHIJKL")

    # 24 primeros y segundos + 8 mejores terceros = 32 equipos
    primeros = [clasificados[g][0] for g in grupos]
    segundos = [clasificados[g][1] for g in grupos]

    # Emparejamientos oficiales FIFA (simplificados para el modelo)
    participantes = primeros + segundos + mejores_terceros

    # Shuffle controlado para bracket
    rng.shuffle(participantes)

    # Ronda de 32 → 16 → 8 → 4 → 2 → 1
    ronda_actual = participantes[:32]
    while len(ronda_actual) > 1:
        siguiente_ronda: list[str] = []
        for i in range(0, len(ronda_actual), 2):
            if i + 1 < len(ronda_actual):
                ganador = simular_partido_eliminatoria(
                    ronda_actual[i], ronda_actual[i + 1], rng
                )
                siguiente_ronda.append(ganador)
            else:
                siguiente_ronda.append(ronda_actual[i])
        ronda_actual = siguiente_ronda

    return ronda_actual[0]


def ejecutar_simulacion(
    n_torneos: int = N_DEFAULT,
    seed: int = SEED_DEFAULT,
    verbose: bool = True,
) -> dict[str, float]:
    """Ejecuta N simulaciones completas del torneo.

    Args:
        n_torneos: Numero de torneos a simular.
        seed: Semilla para reproducibilidad.
        verbose: Si True, muestra barra de progreso.

    Returns:
        Dict equipo -> probabilidad de campeonato (0.0 a 1.0).
    """
    rng = random.Random(seed)
    victorias: dict[str, int] = {eq: 0 for eq in _ELOS_BASE}
    intervalo_reporte = max(1, n_torneos // 10)

    inicio = time.time()

    for i in range(n_torneos):
        if verbose and (i + 1) % intervalo_reporte == 0:
            progreso = (i + 1) / n_torneos * 100
            elapsed = time.time() - inicio
            eta = elapsed / (i + 1) * (n_torneos - i - 1)
            barra = "█" * int(progreso / 5) + "░" * (20 - int(progreso / 5))
            print(
                f"\r  [{barra}] {progreso:5.1f}%  "
                f"({i + 1:,}/{n_torneos:,})  ETA: {eta:.0f}s",
                end="",
                flush=True,
            )

        clasificados, mejores_terceros = simular_fase_grupos(rng)
        campeon = simular_fase_eliminatoria(clasificados, mejores_terceros, rng)
        victorias[campeon] = victorias.get(campeon, 0) + 1

    if verbose:
        elapsed = time.time() - inicio
        print(f"\r  [{'█' * 20}] 100.0%  ({n_torneos:,}/{n_torneos:,})  "
              f"Completado en {elapsed:.1f}s")

    return {eq: victorias[eq] / n_torneos for eq in victorias}


# =============================================================================
# INTERFAZ DE USUARIO
# =============================================================================

def limpiar_pantalla() -> None:
    """Limpia la pantalla del terminal."""
    print("\033[2J\033[H", end="")


def separador(caracter: str = "─", ancho: int = 60) -> str:
    """Genera una linea separadora."""
    return caracter * ancho


def encabezado() -> None:
    """Imprime el encabezado de la aplicacion."""
    print()
    print(separador("═"))
    print("  SIMULADOR FIFA WORLD CUP 2026")
    print("  Modelo ELO-Historial-Combinado v2.0")
    print("  UCB — Inteligencia Artificial con Agentes")
    print("  Autor: Bernardo Rios Tapia")
    print(separador("═"))
    print()


def menu_principal() -> str:
    """Muestra el menu principal y retorna la opcion elegida."""
    print(separador())
    print("  MENU PRINCIPAL")
    print(separador())
    print("  1. Ejecutar simulacion Monte Carlo")
    print("  2. Ver probabilidades de campeonato")
    print("  3. Consultar partido entre dos equipos")
    print("  4. Ver grupos del torneo")
    print("  5. Comparar dos equipos")
    print("  6. Salir")
    print(separador())
    return input("  Seleccione una opcion [1-6]: ").strip()


def pedir_entero(
    mensaje: str,
    minimo: int,
    maximo: int,
    default: int,
) -> int:
    """Solicita un entero al usuario con validacion.

    Args:
        mensaje: Texto a mostrar al usuario.
        minimo: Valor minimo aceptable.
        maximo: Valor maximo aceptable.
        default: Valor por defecto si el usuario no ingresa nada.

    Returns:
        Entero validado dentro del rango [minimo, maximo].
    """
    while True:
        entrada = input(f"  {mensaje} [default={default:,}]: ").strip()
        if not entrada:
            return default
        try:
            valor = int(entrada.replace(",", "").replace(".", ""))
            if minimo <= valor <= maximo:
                return valor
            print(f"  ! Debe estar entre {minimo:,} y {maximo:,}.")
        except ValueError:
            print("  ! Ingrese un numero entero valido.")


def seleccionar_equipo(mensaje: str) -> Optional[str]:
    """Permite al usuario seleccionar un equipo por nombre o numero.

    Args:
        mensaje: Texto a mostrar al usuario.

    Returns:
        Nombre del equipo seleccionado, o None si cancela.
    """
    equipos = sorted(_ELOS_BASE.keys())
    print()
    print(f"  {mensaje}")
    print(separador("-", 60))

    # Mostrar equipos en 3 columnas
    col_ancho = 28
    for i in range(0, len(equipos), 3):
        fila = ""
        for j in range(3):
            idx = i + j
            if idx < len(equipos):
                fila += f"  {idx + 1:2}. {equipos[idx]:<{col_ancho}}"
        print(fila)

    print(separador("-", 60))
    entrada = input("  Ingrese numero o nombre del equipo (Enter = cancelar): ").strip()

    if not entrada:
        return None

    # Busqueda por numero
    if entrada.isdigit():
        idx = int(entrada) - 1
        if 0 <= idx < len(equipos):
            return equipos[idx]
        print("  ! Numero fuera de rango.")
        return None

    # Busqueda por nombre (parcial, sin distinguir mayusculas)
    coincidencias = [e for e in equipos if entrada.lower() in e.lower()]
    if len(coincidencias) == 1:
        return coincidencias[0]
    if len(coincidencias) > 1:
        print(f"  Coincidencias: {', '.join(coincidencias)}")
        print("  ! Sea mas especifico.")
        return None

    print(f"  ! No se encontro '{entrada}'.")
    return None


# =============================================================================
# OPCIONES DEL MENU
# =============================================================================

_resultados_cache: dict[str, float] = {}


def opcion_simulacion() -> None:
    """Ejecuta la simulacion Monte Carlo con N configurable."""
    global _resultados_cache

    print()
    print(separador())
    print("  SIMULACION MONTE CARLO")
    print(separador())
    print("  Cada torneo simula 48 equipos desde grupos hasta la final.")
    print("  A mayor N, mayor precision (pero mas tiempo de ejecucion).")
    print()

    n = pedir_entero(
        "Numero de torneos a simular (1,000 - 500,000)",
        minimo=1_000,
        maximo=500_000,
        default=N_DEFAULT,
    )
    seed = pedir_entero(
        "Semilla aleatoria (para reproducibilidad)",
        minimo=1,
        maximo=9_999_999,
        default=SEED_DEFAULT,
    )

    print()
    print(f"  Iniciando {n:,} simulaciones con seed={seed}...")
    print()

    _resultados_cache = ejecutar_simulacion(n_torneos=n, seed=seed, verbose=True)

    print()
    print("  Simulacion completada. Use la opcion 2 para ver resultados.")
    input("  Presione Enter para continuar...")


def opcion_favoritos() -> None:
    """Muestra las probabilidades de campeonato de todos los equipos."""
    if not _resultados_cache:
        print()
        print("  ! Primero ejecute la simulacion (opcion 1).")
        input("  Presione Enter para continuar...")
        return

    print()
    print(separador())
    print("  PROBABILIDADES DE CAMPEONATO")
    print(separador())

    ranking = sorted(
        _resultados_cache.items(),
        key=lambda x: x[1],
        reverse=True,
    )

    # Encabezado de tabla
    print(f"  {'#':>3}  {'Equipo':<30}  {'Prob':>7}  {'Victorias':>10}  "
          f"{'ELO v2':>7}  Barra")
    print(separador("-", 75))

    n_torneos = sum(_resultados_cache.values())
    # n_torneos es siempre 1.0 (suma de proporciones), necesitamos el N real
    # Lo inferimos del cache (asumimos que la suma * N = victorias)
    # Mostramos prob y barra

    for pos, (equipo, prob) in enumerate(ranking, start=1):
        barra_len = int(prob * 200)
        barra = "█" * min(barra_len, 30)
        elo = ELOS.get(equipo, 0)

        medalla = ""
        if pos == 1:
            medalla = " ★"
        elif pos <= 3:
            medalla = " ·"

        print(
            f"  {pos:>3}. {equipo:<30}  {prob * 100:>6.3f}%  "
            f"{'':>10}  {elo:>7}  {barra}{medalla}"
        )

        if pos == 10:
            print(separador("-", 75))
            ver_mas = input("  Mostrar los 38 restantes? [s/N]: ").strip().lower()
            if ver_mas != "s":
                break
            print(separador("-", 75))

    print(separador())
    input("  Presione Enter para continuar...")


def opcion_partido() -> None:
    """Muestra las probabilidades de un partido especifico."""
    print()
    print(separador())
    print("  CONSULTAR PARTIDO")
    print(separador())

    equipo_a = seleccionar_equipo("Seleccione el PRIMER equipo (local):")
    if not equipo_a:
        return

    equipo_b = seleccionar_equipo("Seleccione el SEGUNDO equipo (visitante):")
    if not equipo_b:
        return

    if equipo_a == equipo_b:
        print("  ! Los equipos deben ser diferentes.")
        input("  Presione Enter para continuar...")
        return

    p_a, p_e, p_b = calcular_prob_partido(equipo_a, equipo_b)

    elo_a = ELOS.get(equipo_a, 0)
    elo_b = ELOS.get(equipo_b, 0)

    print()
    print(separador("═"))
    print(f"  {equipo_a}  vs  {equipo_b}")
    print(separador("═"))
    print(f"  ELO v2:  {elo_a}  vs  {elo_b}  (diferencia: {elo_a - elo_b:+})")
    print()

    # Barra visual de probabilidades
    ancho = 40
    seg_a = int(p_a * ancho)
    seg_e = int(p_e * ancho)
    seg_b = ancho - seg_a - seg_e

    barra = (
        "█" * seg_a
        + "░" * seg_e
        + "▒" * seg_b
    )
    print(f"  {barra}")
    print(
        f"  {'Gana ' + equipo_a:<20}  Empate  {'Gana ' + equipo_b:>20}"
    )
    print(
        f"  {p_a * 100:>6.2f}%"
        + " " * 18
        + f"{p_e * 100:.2f}%"
        + " " * 18
        + f"{p_b * 100:.2f}%"
    )
    print()

    # Componentes del modelo
    print("  Desglose del modelo:")
    print(f"    ELO (55%):      {equipo_a} favorito" if elo_a > elo_b
          else f"    ELO (55%):      {equipo_b} favorito")
    print(f"    Historial (35%): win rate {equipo_a} "
          f"{HISTORIAL.get(equipo_a, {}).get('wr', 0.5):.3f} vs "
          f"{equipo_b} {HISTORIAL.get(equipo_b, {}).get('wr', 0.5):.3f}")
    print(f"    Forma (10%):    {equipo_a} {FORMA.get(equipo_a, 0.5):.2f} vs "
          f"{equipo_b} {FORMA.get(equipo_b, 0.5):.2f}")

    print(separador("═"))
    input("  Presione Enter para continuar...")


def opcion_grupos() -> None:
    """Muestra todos los grupos del torneo con ELO y ranking."""
    print()
    print(separador())
    print("  GRUPOS DEL MUNDIAL 2026")
    print(separador())
    print("  48 equipos | 12 grupos de 4 | Sede: USA, Mexico, Canada")
    print()

    for letra, equipos in GRUPOS.items():
        print(f"  GRUPO {letra}")
        print(separador("-", 50))
        tabla = sorted(equipos, key=lambda e: ELOS.get(e, 0), reverse=True)
        for i, equipo in enumerate(tabla, start=1):
            elo = ELOS.get(equipo, 0)
            forma = FORMA.get(equipo, 0.5)
            barra_forma = "▮" * int(forma * 5) + "▯" * (5 - int(forma * 5))
            print(f"    {i}. {equipo:<30}  ELO {elo:>4}  Forma [{barra_forma}]")
        print()

    input("  Presione Enter para continuar...")


def opcion_comparar() -> None:
    """Compara dos equipos en todos los indicadores del modelo."""
    print()
    print(separador())
    print("  COMPARAR DOS EQUIPOS")
    print(separador())

    equipo_a = seleccionar_equipo("Seleccione el PRIMER equipo:")
    if not equipo_a:
        return

    equipo_b = seleccionar_equipo("Seleccione el SEGUNDO equipo:")
    if not equipo_b:
        return

    if equipo_a == equipo_b:
        print("  ! Los equipos deben ser diferentes.")
        input("  Presione Enter para continuar...")
        return

    elo_a = ELOS.get(equipo_a, 0)
    elo_b = ELOS.get(equipo_b, 0)
    elo_base_a = _ELOS_BASE.get(equipo_a, 0)
    elo_base_b = _ELOS_BASE.get(equipo_b, 0)
    delta_a = _AJUSTES_ELO.get(equipo_a, 0)
    delta_b = _AJUSTES_ELO.get(equipo_b, 0)
    hist_a = HISTORIAL.get(equipo_a, {"wr": 0.5, "dr": 0.2})
    hist_b = HISTORIAL.get(equipo_b, {"wr": 0.5, "dr": 0.2})
    forma_a = FORMA.get(equipo_a, 0.5)
    forma_b = FORMA.get(equipo_b, 0.5)

    p_a, p_e, p_b = calcular_prob_partido(equipo_a, equipo_b)

    ancho_col = 22

    def fila(etiqueta: str, val_a: str, val_b: str) -> None:
        print(f"  {etiqueta:<22}  {val_a:^{ancho_col}}  {val_b:^{ancho_col}}")

    print()
    print(separador("═"))
    print(
        f"  {'':22}  {equipo_a:^{ancho_col}}  {equipo_b:^{ancho_col}}"
    )
    print(separador("═"))
    fila("ELO v2 (ajustado)", str(elo_a), str(elo_b))
    fila("ELO base (v1)", str(elo_base_a), str(elo_base_b))
    fila("Ajuste ELO", f"{delta_a:+}", f"{delta_b:+}")
    print(separador("-", 70))
    fila("Win Rate historial", f"{hist_a['wr']:.3f}", f"{hist_b['wr']:.3f}")
    fila("Draw Rate historial", f"{hist_a['dr']:.3f}", f"{hist_b['dr']:.3f}")
    fila("Forma reciente", f"{forma_a:.2f}/1.00", f"{forma_b:.2f}/1.00")
    print(separador("-", 70))
    fila(f"P(gana {equipo_a})", f"{p_a * 100:.2f}%", "")
    fila("P(empate)", f"{p_e * 100:.2f}%", "")
    fila(f"P(gana {equipo_b})", "", f"{p_b * 100:.2f}%")
    print(separador("═"))

    # Resultado de la simulacion si esta disponible
    if _resultados_cache:
        prob_camp_a = _resultados_cache.get(equipo_a, 0.0)
        prob_camp_b = _resultados_cache.get(equipo_b, 0.0)
        print()
        fila("Prob. campeonato", f"{prob_camp_a * 100:.3f}%", f"{prob_camp_b * 100:.3f}%")
        print(separador("═"))

    input("  Presione Enter para continuar...")


# =============================================================================
# PUNTO DE ENTRADA
# =============================================================================

def main() -> None:
    """Punto de entrada principal del simulador."""
    limpiar_pantalla()
    encabezado()

    opciones = {
        "1": opcion_simulacion,
        "2": opcion_favoritos,
        "3": opcion_partido,
        "4": opcion_grupos,
        "5": opcion_comparar,
    }

    while True:
        opcion = menu_principal()

        if opcion == "6":
            print()
            print("  Hasta luego.")
            print()
            break

        accion = opciones.get(opcion)
        if accion:
            limpiar_pantalla()
            encabezado()
            accion()
            limpiar_pantalla()
            encabezado()
        else:
            print("  ! Opcion no valida. Ingrese un numero del 1 al 6.")


if __name__ == "__main__":
    main()
