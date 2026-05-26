# Guia para usar el Simulador en Google Colab

**Google Colab:** https://colab.research.google.com

> El simulador es una herramienta de **demostracion independiente**. Lee los
> archivos JSON generados previamente por el pipeline de agentes y permite
> explorar resultados y ejecutar nuevas simulaciones. No requiere instalar
> nada — solo subir los archivos correctos.

---

## Archivos que necesitas subir a Colab

Sube exactamente estos archivos desde tu computadora. Estan todos en este repositorio:

```
mundial2026/
├── simulador.py                              ← el programa principal
├── data/
│   ├── grupos.json                           ← grupos del torneo
│   ├── probabilidades_partidos_v2.json       ← ELOs v2 + probabilidades
│   └── elos_ajustados.json                   ← justificaciones de ajustes
└── outputs/
    └── simulation_results_v2.json            ← resultados N=50,000
```

**Total: 5 archivos.** Sin estos archivos el simulador no puede arrancar.

---

## Paso a paso en Google Colab

### Paso 1 — Abrir Colab y crear un notebook nuevo

1. Ve a https://colab.research.google.com
2. Haz clic en **"Nuevo cuaderno"**

---

### Paso 2 — Crear la estructura de carpetas

En la primera celda del notebook, pega y ejecuta:

```python
import os

os.makedirs("data", exist_ok=True)
os.makedirs("outputs", exist_ok=True)

print("Carpetas creadas:")
print("  data/")
print("  outputs/")
print()
print("Ahora sube los archivos usando el panel lateral izquierdo.")
```

---

### Paso 3 — Subir los archivos

1. En el panel izquierdo de Colab, haz clic en el icono de **carpeta** (Files)
2. Sube los archivos en las ubicaciones correctas:

| Archivo que tienes | Donde subirlo en Colab |
|--------------------|------------------------|
| `simulador.py` | carpeta raiz `/content/` |
| `grupos.json` | carpeta `/content/data/` |
| `probabilidades_partidos_v2.json` | carpeta `/content/data/` |
| `elos_ajustados.json` | carpeta `/content/data/` |
| `simulation_results_v2.json` | carpeta `/content/outputs/` |

Para subir a una subcarpeta: navega a esa carpeta en el panel y arrastra el archivo.

---

### Paso 4 — Verificar que los archivos esten bien ubicados

En una nueva celda:

```python
import os

archivos_requeridos = [
    "simulador.py",
    "data/grupos.json",
    "data/probabilidades_partidos_v2.json",
    "data/elos_ajustados.json",
    "outputs/simulation_results_v2.json",
]

print("Verificando archivos...")
todos_ok = True
for archivo in archivos_requeridos:
    existe = os.path.exists(archivo)
    estado = "OK" if existe else "FALTA"
    print(f"  [{estado}] {archivo}")
    if not existe:
        todos_ok = False

print()
if todos_ok:
    print("Todos los archivos estan listos. Puedes continuar.")
else:
    print("Faltan archivos. Subelos antes de continuar.")
```

---

### Paso 5 — Cargar y usar el simulador

El simulador tiene menu interactivo (con `input()`), lo cual no funciona
directamente en Colab. Por eso se usan las funciones directamente:

```python
import simulador

# Cargar todos los datos desde los JSON
elos, grupos, info_equipos, partidos_v2, justificaciones, resultados_precomp = (
    simulador.cargar_datos()
)

print("Datos cargados:")
print(f"  {len(elos)} equipos con ELO v2")
print(f"  {len(grupos)} grupos del torneo")
print(f"  {len(partidos_v2)} partidos pre-calculados")
print(f"  {len(justificaciones)} ajustes ELO con justificacion")
```

---

## Ejemplos de uso en Colab

### Ver resultados pre-calculados (N=50,000)

```python
# Extraer probabilidades del JSON oficial
resultados = resultados_precomp["resultados"]
ranking = sorted(resultados, key=lambda x: x["probabilidad"], reverse=True)

print("PROBABILIDADES DE CAMPEONATO — N=50,000 torneos")
print("-" * 55)
print(f"  {'#':>3}  {'Equipo':<28}  {'Probabilidad':>12}")
print("-" * 55)
for i, r in enumerate(ranking[:10], 1):
    barra = "█" * int(r["probabilidad"] * 300)
    print(f"  {i:>3}. {r['equipo']:<28}  {r['probabilidad']*100:>6.3f}%  {barra}")
```

---

### Ejecutar una nueva simulacion con N personalizado

```python
# Simular 5,000 torneos con seed personalizado
# (mas rapido para demostracion; usa 50,000 para maxima precision)
probabilidades = simulador.ejecutar_simulacion(
    grupos=grupos,
    elos=elos,
    n_torneos=5_000,
    seed=2026,
    verbose=True,
)

# Mostrar top 10
top10 = sorted(probabilidades.items(), key=lambda x: x[1], reverse=True)[:10]
print("\nTop 10 favoritos:")
for pos, (equipo, prob) in enumerate(top10, 1):
    print(f"  {pos:2}. {equipo:<28}  {prob*100:.3f}%")
```

---

### Consultar probabilidades de un partido especifico

```python
equipo_a = "Argentina"
equipo_b = "France"

p_a, p_e, p_b = simulador.calcular_prob_partido(equipo_a, equipo_b, elos)

print(f"  {equipo_a} vs {equipo_b}")
print(f"  ELO: {elos[equipo_a]} vs {elos[equipo_b]}")
print()
print(f"  P({equipo_a} gana) = {p_a*100:.2f}%")
print(f"  P(Empate)          = {p_e*100:.2f}%")
print(f"  P({equipo_b} gana) = {p_b*100:.2f}%")
print(f"  Suma               = {(p_a+p_e+p_b)*100:.2f}%")
```

---

### Comparar dos equipos

```python
equipo_a = "Morocco"
equipo_b = "Brazil"

p_a, p_e, p_b = simulador.calcular_prob_partido(equipo_a, equipo_b, elos)

print(f"  {'Indicador':<25}  {equipo_a:^20}  {equipo_b:^20}")
print("  " + "-" * 68)
print(f"  {'ELO v2':<25}  {elos.get(equipo_a,0):^20}  {elos.get(equipo_b,0):^20}")
print(f"  {'Win Rate 2018-2026':<25}  {simulador.HISTORIAL.get(equipo_a,{}).get('wr',0):^20.3f}  {simulador.HISTORIAL.get(equipo_b,{}).get('wr',0):^20.3f}")
print(f"  {'Forma reciente':<25}  {simulador.FORMA.get(equipo_a,0.5):^20.2f}  {simulador.FORMA.get(equipo_b,0.5):^20.2f}")
print("  " + "-" * 68)
print(f"  {'P(A gana)':<25}  {p_a*100:^20.2f}%")
print(f"  {'P(empate)':<25}  {p_e*100:^20.2f}%")
print(f"  {'P(B gana)':<25}  {'':^20}  {p_b*100:^20.2f}%")

# Justificacion del ajuste ELO
if equipo_a in justificaciones:
    print(f"\n  Ajuste ELO {equipo_a}: {justificaciones[equipo_a][:100]}...")
```

---

### Ver los grupos del torneo

```python
for letra, equipos in grupos.items():
    print(f"  GRUPO {letra}")
    tabla = sorted(equipos, key=lambda e: elos.get(e, 0), reverse=True)
    for i, eq in enumerate(tabla, 1):
        info = info_equipos.get(eq, {})
        print(f"    {i}. {eq:<28}  ELO {elos.get(eq,0):>4}  "
              f"FIFA #{info.get('fifa_ranking','?'):<3}  "
              f"{info.get('confederacion','?')}")
    print()
```

---

### Ver ajustes ELO con justificacion

```python
print("AJUSTES ELO — desde elos_ajustados.json")
print("-" * 60)
for equipo, justif in sorted(justificaciones.items()):
    print(f"\n  {equipo} — ELO final: {elos.get(equipo, 0)}")
    print(f"    {justif}")
```

---

## Nota importante

Este simulador es una herramienta de **demostracion independiente**.
Lee los archivos JSON que el pipeline de 7 agentes genero previamente.
No ejecuta agentes en tiempo real ni requiere acceso a APIs externas.

Los resultados de opcion 1 son identicos a los del modelo oficial
porque leen el mismo archivo `simulation_results_v2.json`.
Los resultados de una nueva simulacion pueden variar ligeramente
con N pequeño pero convergen al mismo resultado con N=50,000.

---

*Autor: Bernardo Rios Tapia — UCB, Inteligencia Artificial con Agentes 2026*
