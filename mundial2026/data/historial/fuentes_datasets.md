# Fuentes de Datos - Historial de Partidos Oficiales Mundial 2026

## Fecha de generacion: 2026-05-16

---

## Dataset Principal

### martj42/international_results (GitHub + Kaggle)
- **URL GitHub**: https://github.com/martj42/international_results
- **URL Kaggle**: https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017
- **Ultima actualizacion del dataset**: Abril 2026
- **Registros totales**: 49,330 partidos (1872-2026)
- **Archivos utilizados**:
  - `results.csv` - Resultados de todos los partidos internacionales
  - `shootouts.csv` - Tandas de penales (678 registros, 1967-2026)
- **Formato**: CSV con columnas: date, home_team, away_team, home_score, away_score, tournament, city, country, neutral
- **Licencia**: Open Data Commons Public Domain Dedication and License (PDDL)
- **Mantenedor**: Mart Jurisoo (@martj42)
- **Notas de calidad**:
  - Dataset mas completo y actualizado disponible para resultados internacionales
  - Cubre TODOS los torneos oficiales y amistosos (filtrado necesario)
  - Los nombres de equipos usan convencion en ingles (Czech Republic, Turkey, etc.)
  - Partidos del Mundial 2026 con scores NA = aun no jugados (correctamente excluidos)

---

## Mapeo de Nombres de Equipos

El dataset usa nombres diferentes para 3 de nuestros 48 equipos:

| Nombre en grupos.json | Nombre en dataset |
|----------------------|-------------------|
| Czechia | Czech Republic |
| Turkiye | Turkey |
| Curacao | Curacao (con cedilla) |

---

## Torneos Oficiales Incluidos

Se filtraron UNICAMENTE los siguientes torneos (excluidos amistosos/friendlies):

### Competencias de FIFA
- FIFA World Cup
- FIFA World Cup qualification

### UEFA
- UEFA Euro
- UEFA Euro qualification
- UEFA Nations League

### CONMEBOL
- Copa America
- Copa America qualification
- CONMEBOL-UEFA Cup of Champions (Finalissima)

### CONCACAF
- Gold Cup
- Gold Cup qualification
- CONCACAF Nations League
- CONCACAF Nations League qualification

### CAF (Africa)
- African Cup of Nations
- African Cup of Nations qualification
- COSAFA Cup

### AFC (Asia)
- AFC Asian Cup
- AFC Asian Cup qualification
- WAFF Championship
- SAFF Cup
- AFF Championship / ASEAN Championship
- Gulf Cup
- EAFF Championship
- Intercontinental Cup
- CAFA Nations Cup

### OFC (Oceania)
- Oceania Nations Cup
- Oceania Nations Cup qualification

### Otros torneos oficiales de confederacion
- Arab Cup / Arab Cup qualification

---

## Torneos EXCLUIDOS

- Friendly (amistosos internacionales) - 2,139 partidos excluidos
- FIFA Series - 57 partidos excluidos
- CONCACAF Series - 35 partidos excluidos
- Torneos juveniles (Sub-20, Sub-17)
- Torneos olimpicos
- Competencias de clubes
- CONIFA (no reconocido por FIFA)
- Island Games, Pacific Games, Indian Ocean Island Games
- King's Cup, Kirin Cup, Kirin Challenge Cup
- Otros torneos invitacionales menores

---

## Estadisticas del Filtrado

- **Periodo**: 1 enero 2018 - 16 mayo 2026
- **Partidos oficiales encontrados**: 2,540
- **Tandas de penales (48 equipos)**: 94
- **Equipos cubiertos**: 48/48 (todos los clasificados)
- **Equipo con mas partidos**: France, England (84 cada uno)
- **Equipo con menos partidos**: New Zealand (18)

---

## Archivos Generados

| Archivo | Descripcion | Registros |
|---------|-------------|-----------|
| `results_raw.csv` | Dataset crudo descargado de GitHub | 49,330 |
| `shootouts_raw.csv` | Tandas de penales crudo de GitHub | 678 |
| `partidos_oficiales_2018_2026.json` | Partidos filtrados (oficial, 48 equipos) | 2,540 |
| `penales_2018_2026.json` | Tandas de penales + resumen por equipo | 94 |
| `resumen_por_equipo.json` | Stats agregadas por equipo | 48 |

---

## Limitaciones Conocidas

1. **Penales**: El dataset solo indica el ganador de la tanda, NO incluye marcadores individuales de cada penal ni detalle tiro-a-tiro
2. **Tiempos extra**: No se distingue entre goles en tiempo regular vs. tiempo extra
3. **New Zealand**: Solo 18 partidos oficiales en el periodo (juega mayormente en OFC con pocas competencias)
4. **Curacao**: 46 partidos, muchos en CONCACAF Nations League de niveles inferiores
5. **Partidos futuros**: Los partidos del Mundial 2026 con score NA fueron correctamente excluidos
6. **Nombres**: Algunos torneos menores pueden tener inconsistencias en el nombre a lo largo de los anos

---

## Datasets Alternativos Evaluados (No Utilizados)

| Dataset | URL | Razon de no uso |
|---------|-----|-----------------|
| patateriedata/all-international-football-results (Kaggle) | https://www.kaggle.com/datasets/patateriedata/all-international-football-results | Ultima actualizacion Oct 2025, menos reciente que martj42 |
| jfjelstul/worldcup (GitHub) | https://github.com/jfjelstul/worldcup | Solo World Cup, no cubre otros torneos oficiales |
| schochastics/football-data (GitHub) | https://github.com/schochastics/football-data | Incluye ligas domesticas, mas complejo sin ventaja clara |
| pablollanderos33/world-cup-penalty-shootouts (Kaggle) | https://www.kaggle.com/datasets/pablollanderos33/world-cup-penalty-shootouts | Solo World Cup penalties, no otros torneos |
| luigibizarro/world-cup-penalty-shootouts-1982-2022 (Kaggle) | https://www.kaggle.com/datasets/luigibizarro/world-cup-penalty-shootouts-1982-2022 | Solo hasta 2022, solo World Cup |
