"""
Simulador FIFA World Cup 2026 — Modelo ELO-Historial-Combinado v2.0
====================================================================
Autor  : Bernardo Rios Tapia
Materia: Inteligencia Artificial con Agentes — UCB, 5to Semestre 2026
Python : 3.12+

Descripcion:
    Programa interactivo que carga los datos del proyecto desde los archivos
    JSON generados por el pipeline de agentes y permite explorar y re-ejecutar
    la simulacion Monte Carlo del Mundial 2026.

    Los resultados pre-calculados (N=50,000, seed=2026) se cargan de forma
    instantanea desde outputs/simulation_results_v2.json. Tambien es posible
    lanzar una nueva simulacion con N y seed personalizados.

Uso:
    python -X utf8 simulador.py

Sin dependencias externas — solo biblioteca estandar de Python.
"""

import json
import math
import random
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


# =============================================================================
# RUTAS DE DATOS
# =============================================================================

RAIZ = Path(__file__).parent
DATA = RAIZ / "data"
OUTPUTS = RAIZ / "outputs"

RUTA_GRUPOS = DATA / "grupos.json"
RUTA_PROBS_V2 = DATA / "probabilidades_partidos_v2.json"
RUTA_ELOS_AJUSTADOS = DATA / "elos_ajustados.json"
RUTA_SIM_V2 = OUTPUTS / "simulation_results_v2.json"


# =============================================================================
# CONSTANTES DEL MODELO
# =============================================================================

SEED_DEFAULT: int = 2026
N_DEFAULT: int = 10_000

PESO_ELO: float = 0.55
PESO_HIST: float = 0.35
PESO_FORMA: float = 0.10

ALPHA_GRUPOS: float = 0.25
ALPHA_ELIM: float = 0.18
PROB_MAX_ELO: float = 0.90


# =============================================================================
# CARGA DE DATOS DESDE JSON
# =============================================================================

def cargar_json(ruta: Path) -> dict | list:
    """Carga y retorna el contenido de un archivo JSON.

    Args:
        ruta: Ruta absoluta al archivo JSON.

    Returns:
        Contenido del JSON como dict o list.

    Raises:
        SystemExit: Si el archivo no existe o tiene formato invalido.
    """
    if not ruta.exists():
        print(f"  ERROR: No se encontro el archivo {ruta}")
        print("  Asegurese de ejecutar el simulador desde la carpeta mundial2026/")
        raise SystemExit(1)

    with open(ruta, encoding="utf-8") as f:
        return json.load(f)


def cargar_datos() -> tuple[
    dict[str, int],          # elos: equipo -> ELO v2
    dict[str, list[str]],    # grupos: letra -> [equipos]
    dict[str, dict],         # info_equipos: equipo -> {fifa_ranking, confederacion, host}
    dict[str, dict],         # partidos_v2: id -> {A, B, pA, pE, pB}
    dict[str, str],          # justificaciones: equipo -> texto
    Optional[dict],          # resultados_precomp: metadata + resultados o None
]:
    """Carga todos los datos necesarios desde los archivos JSON del proyecto.

    Lee grupos.json, probabilidades_partidos_v2.json, elos_ajustados.json
    y (si existe) simulation_results_v2.json.

    Returns:
        Tupla con (elos, grupos, info_equipos, partidos_v2,
                   justificaciones, resultados_precomp).
    """
    # --- ELOs v2 y partidos pre-calculados ---
    probs_raw = cargar_json(RUTA_PROBS_V2)
    elos: dict[str, int] = probs_raw["elos_v2"]
    partidos_v2: dict[str, dict] = probs_raw["partidos"]

    # --- Grupos y datos de equipos ---
    grupos_raw = cargar_json(RUTA_GRUPOS)
    grupos: dict[str, list[str]] = {}
    info_equipos: dict[str, dict] = {}

    for letra, datos_grupo in grupos_raw["grupos"].items():
        equipos_grupo: list[str] = []
        for eq in datos_grupo["equipos"]:
            nombre = eq["nombre"]
            equipos_grupo.append(nombre)
            info_equipos[nombre] = {
                "fifa_ranking": eq.get("fifa_ranking", 99),
                "confederacion": eq.get("confederacion", "UEFA"),
                "host": eq.get("rol", "") == "Anfitrion",
            }
        grupos[letra] = equipos_grupo

    # --- Justificaciones de ajustes ELO ---
    elos_aj_raw = cargar_json(RUTA_ELOS_AJUSTADOS)
    justificaciones: dict[str, str] = {}
    for entrada in elos_aj_raw:
        equipo = entrada["equipo"]
        delta = entrada["delta"]
        justif = entrada.get("justificacion", "")
        # Guardamos delta + primeras 120 chars de justificacion
        resumen = justif[:120] + "..." if len(justif) > 120 else justif
        justificaciones[equipo] = f"Delta: {delta:+}  |  {resumen}"

    # --- Resultados pre-calculados (opcional) ---
    resultados_precomp: Optional[dict] = None
    if RUTA_SIM_V2.exists():
        sim_raw = cargar_json(RUTA_SIM_V2)
        # Extraer probabilities del JSON
        # El JSON tiene estructura: {metadata: {...}, resultados: [{equipo, victorias, probabilidad}]}
        resultados_precomp = sim_raw

    return elos, grupos, info_equipos, partidos_v2, justificaciones, resultados_precomp


# =============================================================================
# DATOS COMPLEMENTARIOS (no disponibles en JSON — hardcoded del pipeline)
# =============================================================================

# Historial 2018-2026: win rate y draw rate por equipo
# Fuente: data/historial/resumen_por_equipo.json (procesado por Agente-02)
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

# Forma reciente (ultimos 5 partidos, 0.0-1.0)
# Fuente: Agente-04 ELO Analyst — evaluacion cualitativa documentada
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

# Historial de penales (tasa de exito documentada 2018-2026)
PENALES: dict[str, float] = {
    "Argentina": 0.70, "France": 0.60, "Spain": 0.65, "England": 0.55,
    "Portugal": 0.60, "Brazil": 0.58, "Germany": 0.62, "Netherlands": 0.58,
    "Croatia": 0.65, "Morocco": 0.60,
}


# =============================================================================
# MODELO DE PROBABILIDADES
# =============================================================================

def calcular_prob_partido(
    equipo_a: str,
    equipo_b: str,
    elos: dict[str, int],
) -> tuple[float, float, float]:
    """Calcula P(A gana), P(empate), P(B gana) con el modelo v2.

    Combina ELO logistico (55%), historial 2018-2026 (35%) y forma
    reciente (10%). Los ELOs se leen del archivo JSON en tiempo de ejecucion.

    Args:
        equipo_a: Nombre del primer equipo.
        equipo_b: Nombre del segundo equipo.
        elos: Diccionario equipo -> ELO v2 cargado desde JSON.

    Returns:
        Tupla (p_a, p_empate, p_b) normalizada a 1.0.
    """
    elo_a = elos.get(equipo_a, 2000)
    elo_b = elos.get(equipo_b, 2000)
    diferencia = elo_a - elo_b

    # Componente ELO — formula logistica clasica con cap
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

    suma_ab = p_a_raw + p_b_raw
    factor = (1.0 - p_e_raw) / suma_ab if suma_ab > 0 else 0.5
    p_a = p_a_raw * factor
    p_b = p_b_raw * factor
    p_e = p_e_raw

    total = p_a + p_e + p_b
    if total == 0:
        return 1 / 3, 1 / 3, 1 / 3
    return round(p_a / total, 4), round(p_e / total, 4), round(p_b / total, 4)


# =============================================================================
# SIMULACION DEL TORNEO
# =============================================================================

@dataclass
class FilaGrupo:
    """Fila de la tabla de posiciones de un grupo."""

    equipo: str
    puntos: int = 0
    diferencia: float = 0.0


def simular_partido_grupos(
    equipo_a: str,
    equipo_b: str,
    elos: dict[str, int],
    rng: random.Random,
) -> str:
    """Simula un partido de fase de grupos (puede terminar en empate).

    Args:
        equipo_a: Nombre del primer equipo.
        equipo_b: Nombre del segundo equipo.
        elos: ELOs v2 cargados desde JSON.
        rng: Generador aleatorio con seed fijo.

    Returns:
        Nombre del ganador o la cadena 'EMPATE'.
    """
    p_a, p_e, _ = calcular_prob_partido(equipo_a, equipo_b, elos)
    r = rng.random()
    if r < p_a:
        return equipo_a
    if r < p_a + p_e:
        return "EMPATE"
    return equipo_b


def simular_partido_eliminatoria(
    equipo_a: str,
    equipo_b: str,
    elos: dict[str, int],
    rng: random.Random,
) -> str:
    """Simula un partido eliminatorio. El empate se resuelve en penales.

    Args:
        equipo_a: Nombre del primer equipo.
        equipo_b: Nombre del segundo equipo.
        elos: ELOs v2 cargados desde JSON.
        rng: Generador aleatorio con seed fijo.

    Returns:
        Nombre del equipo que avanza.
    """
    p_a, p_e, _ = calcular_prob_partido(equipo_a, equipo_b, elos)

    p_e_elim = p_e * (ALPHA_ELIM / ALPHA_GRUPOS)
    suma_ab = p_a + (1.0 - p_a - p_e)
    factor = (1.0 - p_e_elim) / suma_ab if suma_ab > 0 else 0.5
    p_a_elim = p_a * factor

    r = rng.random()
    if r < p_a_elim:
        return equipo_a
    if r < p_a_elim + p_e_elim:
        prob_penal_a = PENALES.get(equipo_a, 0.50)
        return equipo_a if rng.random() < prob_penal_a else equipo_b
    return equipo_b


def simular_fase_grupos(
    grupos: dict[str, list[str]],
    elos: dict[str, int],
    rng: random.Random,
) -> tuple[dict[str, list[str]], list[str]]:
    """Simula los 72 partidos de la fase de grupos.

    Los datos de grupos y ELOs se leen desde los JSON del proyecto.

    Args:
        grupos: Diccionario letra -> lista de equipos (desde grupos.json).
        elos: ELOs v2 (desde probabilidades_partidos_v2.json).
        rng: Generador aleatorio con seed fijo.

    Returns:
        Tupla (clasificados_por_grupo, mejores_terceros) donde
        clasificados_por_grupo es letra -> [1ro, 2do].
    """
    clasificados: dict[str, list[str]] = {}
    terceros: list[FilaGrupo] = []

    for letra, equipos in grupos.items():
        tabla: dict[str, FilaGrupo] = {
            e: FilaGrupo(equipo=e) for e in equipos
        }

        # Round-robin: todos contra todos
        for i, eq_a in enumerate(equipos):
            for eq_b in equipos[i + 1:]:
                resultado = simular_partido_grupos(eq_a, eq_b, elos, rng)
                if resultado == eq_a:
                    tabla[eq_a].puntos += 3
                    tabla[eq_a].diferencia += 1.0
                    tabla[eq_b].diferencia -= 1.0
                elif resultado == eq_b:
                    tabla[eq_b].puntos += 3
                    tabla[eq_b].diferencia += 1.0
                    tabla[eq_a].diferencia -= 1.0
                else:
                    tabla[eq_a].puntos += 1
                    tabla[eq_b].puntos += 1

        posiciones = sorted(
            tabla.values(),
            key=lambda r: (r.puntos, r.diferencia),
            reverse=True,
        )
        clasificados[letra] = [posiciones[0].equipo, posiciones[1].equipo]
        terceros.append(posiciones[2])

    # 8 mejores terceros por puntos, desempate por ELO
    mejores = sorted(
        terceros,
        key=lambda r: (r.puntos, elos.get(r.equipo, 0)),
        reverse=True,
    )[:8]

    return clasificados, [r.equipo for r in mejores]


def simular_fase_eliminatoria(
    clasificados: dict[str, list[str]],
    mejores_terceros: list[str],
    elos: dict[str, int],
    rng: random.Random,
) -> str:
    """Simula la fase eliminatoria desde octavos hasta la final.

    Args:
        clasificados: letra -> [1ro, 2do] de la fase de grupos.
        mejores_terceros: Los 8 mejores terceros clasificados.
        elos: ELOs v2 cargados desde JSON.
        rng: Generador aleatorio con seed fijo.

    Returns:
        Nombre del equipo campeon.
    """
    letras = list(clasificados.keys())
    primeros = [clasificados[g][0] for g in letras]
    segundos = [clasificados[g][1] for g in letras]
    participantes = primeros + segundos + mejores_terceros
    rng.shuffle(participantes)

    ronda = participantes[:32]
    while len(ronda) > 1:
        siguiente: list[str] = []
        for i in range(0, len(ronda), 2):
            if i + 1 < len(ronda):
                ganador = simular_partido_eliminatoria(
                    ronda[i], ronda[i + 1], elos, rng
                )
                siguiente.append(ganador)
            else:
                siguiente.append(ronda[i])
        ronda = siguiente

    return ronda[0]


def ejecutar_simulacion(
    grupos: dict[str, list[str]],
    elos: dict[str, int],
    n_torneos: int = N_DEFAULT,
    seed: int = SEED_DEFAULT,
    verbose: bool = True,
) -> dict[str, float]:
    """Ejecuta N torneos completos y retorna probabilidades de campeonato.

    Usa los datos cargados desde los archivos JSON del proyecto. Todos
    los equipos del diccionario elos son considerados participantes.

    Args:
        grupos: Grupos del torneo desde grupos.json.
        elos: ELOs v2 desde probabilidades_partidos_v2.json.
        n_torneos: Cantidad de torneos a simular.
        seed: Semilla para reproducibilidad.
        verbose: Si True, muestra barra de progreso en consola.

    Returns:
        Diccionario equipo -> probabilidad de campeonato (0.0 a 1.0).
    """
    rng = random.Random(seed)
    victorias: dict[str, int] = {eq: 0 for eq in elos}
    intervalo = max(1, n_torneos // 10)
    inicio = time.monotonic()

    for i in range(n_torneos):
        if verbose and (i + 1) % intervalo == 0:
            pct = (i + 1) / n_torneos * 100
            eta = (time.monotonic() - inicio) / (i + 1) * (n_torneos - i - 1)
            barra = "█" * int(pct / 5) + "░" * (20 - int(pct / 5))
            print(
                f"\r  [{barra}] {pct:5.1f}%  ({i + 1:,}/{n_torneos:,})"
                f"  ETA: {eta:.0f}s  ",
                end="",
                flush=True,
            )

        clasif, terceros = simular_fase_grupos(grupos, elos, rng)
        campeon = simular_fase_eliminatoria(clasif, terceros, elos, rng)
        victorias[campeon] = victorias.get(campeon, 0) + 1

    if verbose:
        elapsed = time.monotonic() - inicio
        print(
            f"\r  [{'█' * 20}] 100.0%  ({n_torneos:,}/{n_torneos:,})"
            f"  Completado en {elapsed:.1f}s  "
        )

    return {eq: victorias[eq] / n_torneos for eq in victorias}


# =============================================================================
# INTERFAZ DE USUARIO
# =============================================================================

def limpiar() -> None:
    """Limpia la pantalla del terminal."""
    print("\033[2J\033[H", end="")


def sep(car: str = "─", n: int = 62) -> str:
    """Genera una linea separadora."""
    return car * n


def encabezado() -> None:
    """Imprime el encabezado de la aplicacion."""
    print()
    print(sep("═"))
    print("  SIMULADOR FIFA WORLD CUP 2026")
    print("  Modelo ELO-Historial-Combinado v2.0  |  seed=2026")
    print("  UCB — Inteligencia Artificial con Agentes")
    print("  Autor: Bernardo Rios Tapia")
    print(sep("═"))


def menu_principal() -> str:
    """Muestra el menu principal y retorna la opcion ingresada."""
    print()
    print(sep())
    print("  MENU PRINCIPAL")
    print(sep())
    print("  1. Ver resultados pre-calculados  (N=50,000 — instantaneo)")
    print("  2. Ejecutar nueva simulacion       (N configurable)")
    print("  3. Consultar partido entre dos equipos")
    print("  4. Ver grupos del torneo")
    print("  5. Comparar dos equipos")
    print("  6. Ver ajustes ELO y justificaciones")
    print("  7. Salir")
    print(sep())
    return input("  Seleccione una opcion [1-7]: ").strip()


def pedir_entero(
    mensaje: str,
    minimo: int,
    maximo: int,
    default: int,
) -> int:
    """Solicita un entero validado al usuario.

    Args:
        mensaje: Texto a mostrar.
        minimo: Valor minimo aceptable.
        maximo: Valor maximo aceptable.
        default: Valor por defecto si el usuario no ingresa nada.

    Returns:
        Entero validado dentro del rango.
    """
    while True:
        raw = input(f"  {mensaje} [default={default:,}]: ").strip()
        if not raw:
            return default
        try:
            valor = int(raw.replace(",", "").replace(".", ""))
            if minimo <= valor <= maximo:
                return valor
            print(f"  ! Debe estar entre {minimo:,} y {maximo:,}.")
        except ValueError:
            print("  ! Ingrese un numero entero valido.")


def seleccionar_equipo(
    mensaje: str,
    elos: dict[str, int],
) -> Optional[str]:
    """Permite elegir un equipo por numero o nombre.

    Args:
        mensaje: Texto a mostrar al usuario.
        elos: Diccionario de equipos disponibles.

    Returns:
        Nombre del equipo seleccionado, o None si el usuario cancela.
    """
    equipos = sorted(elos.keys())
    print()
    print(f"  {mensaje}")
    print(sep("-"))

    col = 30
    for i in range(0, len(equipos), 2):
        izq = f"  {i + 1:2}. {equipos[i]:<{col}}"
        der = ""
        if i + 1 < len(equipos):
            der = f"  {i + 2:2}. {equipos[i + 1]}"
        print(izq + der)

    print(sep("-"))
    raw = input("  Numero o nombre del equipo (Enter = cancelar): ").strip()
    if not raw:
        return None

    if raw.isdigit():
        idx = int(raw) - 1
        if 0 <= idx < len(equipos):
            return equipos[idx]
        print("  ! Numero fuera de rango.")
        return None

    coincidencias = [e for e in equipos if raw.lower() in e.lower()]
    if len(coincidencias) == 1:
        return coincidencias[0]
    if len(coincidencias) > 1:
        print(f"  ! Varias coincidencias: {', '.join(coincidencias)}")
        return None
    print(f"  ! No se encontro '{raw}'.")
    return None


def mostrar_ranking(
    probabilidades: dict[str, float],
    elos: dict[str, int],
    titulo: str,
    fuente: str,
) -> None:
    """Imprime el ranking de probabilidades de campeonato.

    Args:
        probabilidades: equipo -> probabilidad (0.0 a 1.0).
        elos: ELOs v2 para mostrar en la tabla.
        titulo: Titulo de la tabla.
        fuente: Descripcion de la fuente de los datos.
    """
    ranking = sorted(
        probabilidades.items(),
        key=lambda x: x[1],
        reverse=True,
    )

    print()
    print(sep("═"))
    print(f"  {titulo}")
    print(f"  Fuente: {fuente}")
    print(sep("═"))
    print(f"  {'#':>3}  {'Equipo':<28}  {'Prob':>7}  {'ELO v2':>6}  Barra")
    print(sep("-"))

    for pos, (equipo, prob) in enumerate(ranking, start=1):
        barra = "█" * int(prob * 300)
        elo = elos.get(equipo, 0)
        medalla = " ★" if pos == 1 else ""
        print(
            f"  {pos:>3}. {equipo:<28}  {prob * 100:>6.3f}%"
            f"  {elo:>6}  {barra}{medalla}"
        )

        if pos == 10:
            print(sep("-"))
            resp = input("  Mostrar los 38 restantes? [s/N]: ").strip().lower()
            if resp != "s":
                break
            print(sep("-"))

    print(sep("═"))


# =============================================================================
# OPCIONES DEL MENU
# =============================================================================

def opcion_precomp(
    resultados_precomp: Optional[dict],
    elos: dict[str, int],
    cache: dict,
) -> None:
    """Muestra los resultados pre-calculados del pipeline (N=50,000).

    Lee directamente desde outputs/simulation_results_v2.json sin
    necesidad de ejecutar la simulacion.

    Args:
        resultados_precomp: Datos cargados desde simulation_results_v2.json.
        elos: ELOs v2 cargados desde JSON.
        cache: Diccionario compartido para guardar resultados en sesion.
    """
    if not resultados_precomp:
        print()
        print("  ! No se encontro outputs/simulation_results_v2.json")
        print("  Use la opcion 2 para ejecutar la simulacion.")
        input("  Enter para continuar...")
        return

    # Extraer probabilidades del JSON
    probs: dict[str, float] = {}
    meta = resultados_precomp.get("metadata", {})
    n_sim = meta.get("N_optimo", 50000)
    seed = meta.get("semilla", 2026)

    for entrada in resultados_precomp.get("resultados", []):
        equipo = entrada.get("equipo", "")
        prob = entrada.get("probabilidad", 0.0)
        if equipo:
            probs[equipo] = prob

    if not probs:
        print("  ! El archivo de resultados no tiene datos validos.")
        input("  Enter para continuar...")
        return

    # Guardar en cache para opcion comparar
    cache["probabilidades"] = probs
    cache["fuente"] = f"JSON pre-calculado (N={n_sim:,}, seed={seed})"

    mostrar_ranking(
        probs,
        elos,
        titulo="PROBABILIDADES DE CAMPEONATO — RESULTADOS OFICIALES",
        fuente=f"simulation_results_v2.json  |  N={n_sim:,}  |  seed={seed}",
    )
    input("  Enter para continuar...")


def opcion_simulacion(
    grupos: dict[str, list[str]],
    elos: dict[str, int],
    cache: dict,
) -> None:
    """Ejecuta una nueva simulacion Monte Carlo con N y seed configurables.

    Args:
        grupos: Grupos del torneo desde grupos.json.
        elos: ELOs v2 desde probabilidades_partidos_v2.json.
        cache: Diccionario compartido para guardar resultados en sesion.
    """
    print()
    print(sep())
    print("  NUEVA SIMULACION MONTE CARLO")
    print(sep())
    print("  Los datos de grupos y ELOs se leen desde los JSON del proyecto.")
    print()

    n = pedir_entero(
        "Numero de torneos (1,000 - 500,000)",
        minimo=1_000,
        maximo=500_000,
        default=N_DEFAULT,
    )
    seed = pedir_entero(
        "Semilla aleatoria",
        minimo=1,
        maximo=9_999_999,
        default=SEED_DEFAULT,
    )

    print()
    print(f"  Iniciando {n:,} simulaciones con seed={seed}...")
    print(f"  Grupos cargados desde: {RUTA_GRUPOS.name}")
    print(f"  ELOs cargados desde:   {RUTA_PROBS_V2.name}")
    print()

    probs = ejecutar_simulacion(
        grupos=grupos,
        elos=elos,
        n_torneos=n,
        seed=seed,
        verbose=True,
    )

    cache["probabilidades"] = probs
    cache["fuente"] = f"Simulacion nueva (N={n:,}, seed={seed})"

    print()
    mostrar_ranking(
        probs,
        elos,
        titulo="RESULTADOS DE LA NUEVA SIMULACION",
        fuente=f"N={n:,} torneos  |  seed={seed}",
    )
    input("  Enter para continuar...")


def opcion_partido(
    elos: dict[str, int],
    partidos_v2: dict[str, dict],
) -> None:
    """Muestra probabilidades de un partido y busca si existe en el JSON.

    Si el partido esta en probabilidades_partidos_v2.json muestra los
    valores pre-calculados. Siempre muestra tambien el calculo en vivo.

    Args:
        elos: ELOs v2 cargados desde JSON.
        partidos_v2: Partidos pre-calculados desde JSON.
    """
    print()
    print(sep())
    print("  CONSULTAR PARTIDO")
    print(sep())

    eq_a = seleccionar_equipo("Seleccione el PRIMER equipo:", elos)
    if not eq_a:
        return
    eq_b = seleccionar_equipo("Seleccione el SEGUNDO equipo:", elos)
    if not eq_b or eq_a == eq_b:
        print("  ! Equipos invalidos o iguales.")
        input("  Enter para continuar...")
        return

    p_a, p_e, p_b = calcular_prob_partido(eq_a, eq_b, elos)
    elo_a = elos.get(eq_a, 0)
    elo_b = elos.get(eq_b, 0)

    # Buscar partido en el JSON pre-calculado
    partido_json: Optional[dict] = None
    for pid, datos in partidos_v2.items():
        if datos["A"] == eq_a and datos["B"] == eq_b:
            partido_json = datos
            partido_json["_id"] = pid
            break
        if datos["A"] == eq_b and datos["B"] == eq_a:
            partido_json = {
                "A": eq_a, "B": eq_b,
                "pA": datos["pB"], "pE": datos["pE"], "pB": datos["pA"],
                "_id": pid + " (invertido)",
            }
            break

    print()
    print(sep("═"))
    print(f"  {eq_a}  vs  {eq_b}")
    print(sep("═"))
    print(f"  ELO v2:  {elo_a}  vs  {elo_b}   (diferencia: {elo_a - elo_b:+})")
    print()

    # Barra visual
    ancho = 44
    seg_a = int(p_a * ancho)
    seg_e = int(p_e * ancho)
    seg_b = ancho - seg_a - seg_e
    print(f"  [{'█' * seg_a}{'░' * seg_e}{'▒' * seg_b}]")
    print(f"  {eq_a:<20}  Empate  {eq_b:>20}")
    print(f"  {p_a * 100:>6.2f}%{' ' * 16}{p_e * 100:.2f}%"
          f"{' ' * 15}{p_b * 100:.2f}%")

    print()
    print("  Desglose del modelo:")
    print(f"    ELO (55%):       {eq_a if elo_a >= elo_b else eq_b} favorito")
    print(f"    Historial (35%): {eq_a} WR={HISTORIAL.get(eq_a,{}).get('wr',0.5):.3f}"
          f"  vs  {eq_b} WR={HISTORIAL.get(eq_b,{}).get('wr',0.5):.3f}")
    print(f"    Forma (10%):     {eq_a} {FORMA.get(eq_a, 0.5):.2f}"
          f"  vs  {eq_b} {FORMA.get(eq_b, 0.5):.2f}")

    if partido_json:
        print()
        print(f"  Valor en JSON ({partido_json['_id']}):")
        print(f"    pA={partido_json['pA']:.4f}  "
              f"pE={partido_json['pE']:.4f}  "
              f"pB={partido_json['pB']:.4f}")

    print(sep("═"))
    input("  Enter para continuar...")


def opcion_grupos(
    grupos: dict[str, list[str]],
    info_equipos: dict[str, dict],
    elos: dict[str, int],
) -> None:
    """Muestra los 12 grupos con ELO, ranking FIFA y forma de cada equipo.

    Args:
        grupos: Grupos desde grupos.json.
        info_equipos: Datos FIFA y confederacion desde grupos.json.
        elos: ELOs v2 desde probabilidades_partidos_v2.json.
    """
    print()
    print(sep())
    print("  GRUPOS DEL MUNDIAL 2026  (datos desde grupos.json)")
    print("  48 equipos | 12 grupos | USA / Mexico / Canada")
    print(sep())

    for letra, equipos in grupos.items():
        tabla = sorted(equipos, key=lambda e: elos.get(e, 0), reverse=True)
        print(f"  GRUPO {letra}")
        print(sep("-", 58))
        for i, eq in enumerate(tabla, 1):
            elo = elos.get(eq, 0)
            info = info_equipos.get(eq, {})
            ranking = info.get("fifa_ranking", "?")
            conf = info.get("confederacion", "?")
            host = " [SEDE]" if info.get("host") else ""
            forma = FORMA.get(eq, 0.5)
            barrita = "▮" * int(forma * 5) + "▯" * (5 - int(forma * 5))
            print(
                f"    {i}. {eq:<28}  ELO {elo:>4}  "
                f"FIFA #{ranking:<3}  {conf:<8}  [{barrita}]{host}"
            )
        print()

    input("  Enter para continuar...")


def opcion_comparar(
    elos: dict[str, int],
    info_equipos: dict[str, dict],
    justificaciones: dict[str, str],
    cache: dict,
) -> None:
    """Compara dos equipos en todos los indicadores del modelo.

    Args:
        elos: ELOs v2 desde JSON.
        info_equipos: Rankings y confederaciones desde grupos.json.
        justificaciones: Razones del ajuste ELO desde elos_ajustados.json.
        cache: Resultados de simulacion en memoria (si se ejecuto).
    """
    print()
    print(sep())
    print("  COMPARAR DOS EQUIPOS")
    print(sep())

    eq_a = seleccionar_equipo("Seleccione el PRIMER equipo:", elos)
    if not eq_a:
        return
    eq_b = seleccionar_equipo("Seleccione el SEGUNDO equipo:", elos)
    if not eq_b or eq_a == eq_b:
        print("  ! Equipos invalidos.")
        input("  Enter para continuar...")
        return

    p_a, p_e, p_b = calcular_prob_partido(eq_a, eq_b, elos)
    elo_a = elos.get(eq_a, 0)
    elo_b = elos.get(eq_b, 0)
    info_a = info_equipos.get(eq_a, {})
    info_b = info_equipos.get(eq_b, {})
    hist_a = HISTORIAL.get(eq_a, {"wr": 0.5, "dr": 0.2})
    hist_b = HISTORIAL.get(eq_b, {"wr": 0.5, "dr": 0.2})

    col = 20

    def fila(etiqueta: str, va: str, vb: str) -> None:
        print(f"  {etiqueta:<24}  {va:^{col}}  {vb:^{col}}")

    print()
    print(sep("═"))
    print(f"  {'':24}  {eq_a:^{col}}  {eq_b:^{col}}")
    print(sep("═"))
    fila("ELO v2 (desde JSON)", str(elo_a), str(elo_b))
    fila("Ranking FIFA", f"#{info_a.get('fifa_ranking','?')}", f"#{info_b.get('fifa_ranking','?')}")
    fila("Confederacion", info_a.get("confederacion", "?"), info_b.get("confederacion", "?"))
    print(sep("-"))
    fila("Win Rate 2018-2026", f"{hist_a['wr']:.3f}", f"{hist_b['wr']:.3f}")
    fila("Draw Rate 2018-2026", f"{hist_a['dr']:.3f}", f"{hist_b['dr']:.3f}")
    fila("Forma reciente", f"{FORMA.get(eq_a, 0.5):.2f}/1.00", f"{FORMA.get(eq_b, 0.5):.2f}/1.00")
    print(sep("-"))
    fila(f"P(gana {eq_a})", f"{p_a * 100:.2f}%", "")
    fila("P(empate)", f"{p_e * 100:.2f}%", "")
    fila(f"P(gana {eq_b})", "", f"{p_b * 100:.2f}%")

    probs = cache.get("probabilidades")
    if probs:
        fuente = cache.get("fuente", "simulacion")
        print(sep("-"))
        fila(
            f"P(campeon) [{fuente[:18]}]",
            f"{probs.get(eq_a, 0) * 100:.3f}%",
            f"{probs.get(eq_b, 0) * 100:.3f}%",
        )

    print(sep("═"))

    # Mostrar justificaciones de ajuste ELO si existen
    for eq in (eq_a, eq_b):
        if eq in justificaciones:
            print()
            print(f"  Ajuste ELO — {eq} (desde elos_ajustados.json):")
            print(f"    {justificaciones[eq]}")

    print()
    input("  Enter para continuar...")


def opcion_elo_ajustes(
    justificaciones: dict[str, str],
    elos: dict[str, int],
) -> None:
    """Muestra todos los ajustes ELO con sus justificaciones.

    Lee los datos desde elos_ajustados.json.

    Args:
        justificaciones: equipo -> descripcion del ajuste.
        elos: ELOs v2 para mostrar el valor final.
    """
    print()
    print(sep())
    print(f"  AJUSTES ELO — datos desde {RUTA_ELOS_AJUSTADOS.name}")
    print(f"  {len(justificaciones)} equipos con ajuste documentado")
    print(sep())

    for equipo, justif in sorted(justificaciones.items()):
        elo = elos.get(equipo, 0)
        print(f"  {equipo:<28}  ELO final: {elo}")
        print(f"    {justif}")
        print()

    input("  Enter para continuar...")


# =============================================================================
# PUNTO DE ENTRADA
# =============================================================================

def main() -> None:
    """Punto de entrada principal del simulador.

    Carga todos los datos desde los JSON del proyecto al inicio y luego
    presenta el menu interactivo. Los resultados de simulacion se mantienen
    en memoria durante la sesion para la opcion de comparacion.
    """
    limpiar()
    encabezado()
    print()
    print("  Cargando datos del proyecto...")

    elos, grupos, info_equipos, partidos_v2, justificaciones, resultados_precomp = (
        cargar_datos()
    )

    print(f"  OK  grupos.json              → {sum(len(v) for v in grupos.values())} equipos en {len(grupos)} grupos")
    print(f"  OK  probabilidades_v2.json   → {len(elos)} ELOs v2 + {len(partidos_v2)} partidos pre-calculados")
    print(f"  OK  elos_ajustados.json      → {len(justificaciones)} ajustes con justificacion")
    if resultados_precomp:
        n = resultados_precomp.get("metadata", {}).get("N_optimo", "?")
        print(f"  OK  simulation_results_v2.json → {n:,} simulaciones listas")
    else:
        print("  --  simulation_results_v2.json no encontrado (use opcion 2)")

    # Cache compartido entre opciones (resultados de simulacion en sesion)
    cache: dict = {}

    opciones = {
        "1": lambda: opcion_precomp(resultados_precomp, elos, cache),
        "2": lambda: opcion_simulacion(grupos, elos, cache),
        "3": lambda: opcion_partido(elos, partidos_v2),
        "4": lambda: opcion_grupos(grupos, info_equipos, elos),
        "5": lambda: opcion_comparar(elos, info_equipos, justificaciones, cache),
        "6": lambda: opcion_elo_ajustes(justificaciones, elos),
    }

    input("\n  Presione Enter para continuar...")

    while True:
        limpiar()
        encabezado()
        opcion = menu_principal()

        if opcion == "7":
            print()
            print("  Hasta luego.")
            print()
            break

        accion = opciones.get(opcion)
        if accion:
            limpiar()
            encabezado()
            accion()
        else:
            print("  ! Opcion no valida. Ingrese un numero del 1 al 7.")
            time.sleep(1)


if __name__ == "__main__":
    main()
