// ============================================================
//  MUNDIAL 2026 — DATOS REALES DEL PROYECTO
//  Fuente: simulaciones Monte Carlo N=50,000 seed=2026
// ============================================================

export interface Team {
  name: string
  flag: string
  confederation: string
  fifaRanking: number
  elo: number
  host?: boolean
}

export interface Group {
  letter: string
  name: string
  teams: Team[]
}

export interface Match {
  id: string
  teamA: string
  teamB: string
  pA: number   // P(A gana)
  pE: number   // P(empate)
  pB: number   // P(B gana)
  score: string // Resultado simulado más probable
}

export interface ChampProb {
  name: string
  flag: string
  probV2: number
  probV1: number
  ic95Low: number
  ic95High: number
  eloV2: number
  eloV1?: number
}

export interface ELOAdjustment {
  name: string
  flag: string
  eloV1: number
  eloV2: number
  delta: number
  reason: string
  details: string
}

// ============================================================
//  GRUPOS
// ============================================================
export const GROUPS: Group[] = [
  {
    letter: 'A', name: 'Grupo A',
    teams: [
      { name: 'Mexico',       flag: '🇲🇽', confederation: 'CONCACAF', fifaRanking: 15, elo: 2380, host: true },
      { name: 'South Africa', flag: '🇿🇦', confederation: 'CAF',      fifaRanking: 60, elo: 1915 },
      { name: 'South Korea',  flag: '🇰🇷', confederation: 'AFC',      fifaRanking: 25, elo: 2285 },
      { name: 'Czechia',      flag: '🇨🇿', confederation: 'UEFA',     fifaRanking: 41, elo: 2150 },
    ],
  },
  {
    letter: 'B', name: 'Grupo B',
    teams: [
      { name: 'Canada',                 flag: '🇨🇦', confederation: 'CONCACAF', fifaRanking: 30, elo: 2230, host: true },
      { name: 'Bosnia and Herzegovina', flag: '🇧🇦', confederation: 'UEFA',     fifaRanking: 65, elo: 1910 },
      { name: 'Qatar',                  flag: '🇶🇦', confederation: 'AFC',      fifaRanking: 55, elo: 1965 },
      { name: 'Switzerland',            flag: '🇨🇭', confederation: 'UEFA',     fifaRanking: 19, elo: 2375 },
    ],
  },
  {
    letter: 'C', name: 'Grupo C',
    teams: [
      { name: 'Brazil',   flag: '🇧🇷', confederation: 'CONMEBOL', fifaRanking: 6,  elo: 2478 },
      { name: 'Morocco',  flag: '🇲🇦', confederation: 'CAF',      fifaRanking: 8,  elo: 2490 },
      { name: 'Haiti',    flag: '🇭🇹', confederation: 'CONCACAF', fifaRanking: 83, elo: 1690 },
      { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', confederation: 'UEFA',     fifaRanking: 43, elo: 2130 },
    ],
  },
  {
    letter: 'D', name: 'Grupo D',
    teams: [
      { name: 'United States', flag: '🇺🇸', confederation: 'CONCACAF', fifaRanking: 16, elo: 2370, host: true },
      { name: 'Paraguay',      flag: '🇵🇾', confederation: 'CONMEBOL', fifaRanking: 40, elo: 2150 },
      { name: 'Australia',     flag: '🇦🇺', confederation: 'AFC',      fifaRanking: 27, elo: 2250 },
      { name: 'Turkiye',       flag: '🇹🇷', confederation: 'UEFA',     fifaRanking: 22, elo: 2340 },
    ],
  },
  {
    letter: 'E', name: 'Grupo E',
    teams: [
      { name: 'Germany',     flag: '🇩🇪', confederation: 'UEFA',     fifaRanking: 10, elo: 2475 },
      { name: 'Curacao',     flag: '🇨🇼', confederation: 'CONCACAF', fifaRanking: 82, elo: 1700 },
      { name: 'Ivory Coast', flag: '🇨🇮', confederation: 'CAF',      fifaRanking: 34, elo: 2210 },
      { name: 'Ecuador',     flag: '🇪🇨', confederation: 'CONMEBOL', fifaRanking: 23, elo: 2295 },
    ],
  },
  {
    letter: 'F', name: 'Grupo F',
    teams: [
      { name: 'Netherlands', flag: '🇳🇱', confederation: 'UEFA', fifaRanking: 7,  elo: 2485 },
      { name: 'Japan',       flag: '🇯🇵', confederation: 'AFC',  fifaRanking: 18, elo: 2360 },
      { name: 'Sweden',      flag: '🇸🇪', confederation: 'UEFA', fifaRanking: 38, elo: 2180 },
      { name: 'Tunisia',     flag: '🇹🇳', confederation: 'CAF',  fifaRanking: 44, elo: 2075 },
    ],
  },
  {
    letter: 'G', name: 'Grupo G',
    teams: [
      { name: 'Belgium',     flag: '🇧🇪', confederation: 'UEFA', fifaRanking: 9,  elo: 2445 },
      { name: 'Egypt',       flag: '🇪🇬', confederation: 'CAF',  fifaRanking: 29, elo: 2225 },
      { name: 'Iran',        flag: '🇮🇷', confederation: 'AFC',  fifaRanking: 21, elo: 2325 },
      { name: 'New Zealand', flag: '🇳🇿', confederation: 'OFC',  fifaRanking: 85, elo: 1595 },
    ],
  },
  {
    letter: 'H', name: 'Grupo H',
    teams: [
      { name: 'Spain',        flag: '🇪🇸', confederation: 'UEFA',     fifaRanking: 2,  elo: 2530 },
      { name: 'Cape Verde',   flag: '🇨🇻', confederation: 'CAF',      fifaRanking: 69, elo: 1825 },
      { name: 'Saudi Arabia', flag: '🇸🇦', confederation: 'AFC',      fifaRanking: 61, elo: 1905 },
      { name: 'Uruguay',      flag: '🇺🇾', confederation: 'CONMEBOL', fifaRanking: 17, elo: 2370 },
    ],
  },
  {
    letter: 'I', name: 'Grupo I ⚠️ Grupo de la Muerte',
    teams: [
      { name: 'France',  flag: '🇫🇷', confederation: 'UEFA', fifaRanking: 1,  elo: 2535 },
      { name: 'Senegal', flag: '🇸🇳', confederation: 'CAF',  fifaRanking: 14, elo: 2415 },
      { name: 'Iraq',    flag: '🇮🇶', confederation: 'AFC',  fifaRanking: 57, elo: 1945 },
      { name: 'Norway',  flag: '🇳🇴', confederation: 'UEFA', fifaRanking: 31, elo: 2275 },
    ],
  },
  {
    letter: 'J', name: 'Grupo J',
    teams: [
      { name: 'Argentina', flag: '🇦🇷', confederation: 'CONMEBOL', fifaRanking: 3,  elo: 2535 },
      { name: 'Algeria',   flag: '🇩🇿', confederation: 'CAF',      fifaRanking: 28, elo: 2265 },
      { name: 'Austria',   flag: '🇦🇹', confederation: 'UEFA',     fifaRanking: 24, elo: 2320 },
      { name: 'Jordan',    flag: '🇯🇴', confederation: 'AFC',      fifaRanking: 63, elo: 1885 },
    ],
  },
  {
    letter: 'K', name: 'Grupo K',
    teams: [
      { name: 'Portugal',  flag: '🇵🇹', confederation: 'UEFA',     fifaRanking: 5,  elo: 2510 },
      { name: 'DR Congo',  flag: '🇨🇩', confederation: 'CAF',      fifaRanking: 46, elo: 2055 },
      { name: 'Uzbekistan',flag: '🇺🇿', confederation: 'AFC',      fifaRanking: 50, elo: 2015 },
      { name: 'Colombia',  flag: '🇨🇴', confederation: 'CONMEBOL', fifaRanking: 13, elo: 2405 },
    ],
  },
  {
    letter: 'L', name: 'Grupo L',
    teams: [
      { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation: 'UEFA',     fifaRanking: 4,  elo: 2500 },
      { name: 'Croatia', flag: '🇭🇷', confederation: 'UEFA',     fifaRanking: 11, elo: 2425 },
      { name: 'Ghana',   flag: '🇬🇭', confederation: 'CAF',      fifaRanking: 74, elo: 1775 },
      { name: 'Panama',  flag: '🇵🇦', confederation: 'CONCACAF', fifaRanking: 33, elo: 2190 },
    ],
  },
]

// ============================================================
//  PARTIDOS CON PROBABILIDADES (Modelo v2)
// ============================================================
export const MATCHES: Record<string, Match[]> = {
  'Grupo A': [
    { id:'GA-001', teamA:'Mexico',       teamB:'South Africa', pA:0.6962, pE:0.1038, pB:0.2000, score:'1-0' },
    { id:'GA-002', teamA:'South Korea',  teamB:'Czechia',      pA:0.5216, pE:0.1787, pB:0.2997, score:'1-0' },
    { id:'GA-028', teamA:'Mexico',       teamB:'South Korea',  pA:0.4852, pE:0.1588, pB:0.3560, score:'2-1' },
    { id:'GA-025', teamA:'Czechia',      teamB:'South Africa', pA:0.5598, pE:0.1551, pB:0.2851, score:'2-1' },
    { id:'GA-054', teamA:'Czechia',      teamB:'Mexico',       pA:0.2549, pE:0.1613, pB:0.5838, score:'0-1' },
    { id:'GA-053', teamA:'South Africa', teamB:'South Korea',  pA:0.2229, pE:0.1067, pB:0.6704, score:'0-1' },
  ],
  'Grupo B': [
    { id:'GB-003', teamA:'Canada',                teamB:'Bosnia and Herzegovina', pA:0.6429, pE:0.1146, pB:0.2426, score:'3-0' },
    { id:'GB-005', teamA:'Qatar',                 teamB:'Switzerland',            pA:0.2427, pE:0.1295, pB:0.6278, score:'1-2' },
    { id:'GB-027', teamA:'Canada',                teamB:'Qatar',                  pA:0.6358, pE:0.0906, pB:0.2736, score:'2-1' },
    { id:'GB-026', teamA:'Switzerland',           teamB:'Bosnia and Herzegovina', pA:0.6259, pE:0.1509, pB:0.2231, score:'2-0' },
    { id:'GB-049', teamA:'Switzerland',           teamB:'Canada',                 pA:0.4698, pE:0.1901, pB:0.3402, score:'3-2' },
    { id:'GB-050', teamA:'Bosnia and Herzegovina',teamB:'Qatar',                  pA:0.3844, pE:0.1512, pB:0.4644, score:'1-2' },
  ],
  'Grupo C': [
    { id:'GC-006', teamA:'Brazil',   teamB:'Morocco',  pA:0.4184, pE:0.1152, pB:0.4663, score:'0-1' },
    { id:'GC-007', teamA:'Haiti',    teamB:'Scotland', pA:0.1938, pE:0.1238, pB:0.6824, score:'1-2' },
    { id:'GC-031', teamA:'Brazil',   teamB:'Haiti',    pA:0.7875, pE:0.0693, pB:0.1432, score:'1-0' },
    { id:'GC-030', teamA:'Scotland', teamB:'Morocco',  pA:0.2059, pE:0.1207, pB:0.6733, score:'0-2' },
    { id:'GC-051', teamA:'Morocco',  teamB:'Haiti',    pA:0.8024, pE:0.0690, pB:0.1286, score:'1-0' },
    { id:'GC-052', teamA:'Scotland', teamB:'Brazil',   pA:0.2241, pE:0.1223, pB:0.6535, score:'0-1' },
  ],
  'Grupo D': [
    { id:'GD-004', teamA:'United States', teamB:'Paraguay',      pA:0.5919, pE:0.1633, pB:0.2448, score:'1-0' },
    { id:'GD-008', teamA:'Australia',     teamB:'Turkiye',       pA:0.3738, pE:0.1683, pB:0.4579, score:'1-2' },
    { id:'GD-029', teamA:'United States', teamB:'Australia',     pA:0.5150, pE:0.1360, pB:0.3491, score:'2-1' },
    { id:'GD-032', teamA:'Turkiye',       teamB:'Paraguay',      pA:0.5389, pE:0.1926, pB:0.2685, score:'1-0' },
    { id:'GD-059', teamA:'Turkiye',       teamB:'United States', pA:0.3720, pE:0.1780, pB:0.4500, score:'0-1' },
    { id:'GD-060', teamA:'Paraguay',      teamB:'Australia',     pA:0.2988, pE:0.2008, pB:0.5003, score:'0-1' },
  ],
  'Grupo E': [
    { id:'GE-009', teamA:'Germany',    teamB:'Curacao',     pA:0.7543, pE:0.1013, pB:0.1444, score:'2-1' },
    { id:'GE-011', teamA:'Ivory Coast',teamB:'Ecuador',     pA:0.3811, pE:0.2532, pB:0.3656, score:'1-0' },
    { id:'GE-034', teamA:'Germany',    teamB:'Ivory Coast', pA:0.5990, pE:0.1239, pB:0.2771, score:'2-1' },
    { id:'GE-035', teamA:'Ecuador',    teamB:'Curacao',     pA:0.6245, pE:0.1612, pB:0.2143, score:'2-1' },
    { id:'GE-055', teamA:'Curacao',    teamB:'Ivory Coast', pA:0.1676, pE:0.1094, pB:0.7230, score:'0-1' },
    { id:'GE-056', teamA:'Ecuador',    teamB:'Germany',     pA:0.2246, pE:0.2187, pB:0.5568, score:'0-1' },
  ],
  'Grupo F': [
    { id:'GF-010', teamA:'Netherlands', teamB:'Japan',       pA:0.5247, pE:0.1110, pB:0.3644, score:'2-1' },
    { id:'GF-012', teamA:'Sweden',      teamB:'Tunisia',     pA:0.4880, pE:0.2076, pB:0.3044, score:'2-1' },
    { id:'GF-033', teamA:'Netherlands', teamB:'Sweden',      pA:0.6216, pE:0.1302, pB:0.2482, score:'2-1' },
    { id:'GF-036', teamA:'Tunisia',     teamB:'Japan',       pA:0.2251, pE:0.1168, pB:0.6581, score:'0-1' },
    { id:'GF-058', teamA:'Japan',       teamB:'Sweden',      pA:0.5744, pE:0.1248, pB:0.3008, score:'2-0' },
    { id:'GF-057', teamA:'Tunisia',     teamB:'Netherlands', pA:0.1902, pE:0.1252, pB:0.6846, score:'0-1' },
  ],
  'Grupo G': [
    { id:'GG-014', teamA:'Belgium',     teamB:'Egypt',       pA:0.5849, pE:0.1255, pB:0.2896, score:'2-1' },
    { id:'GG-016', teamA:'Iran',        teamB:'New Zealand', pA:0.9011, pE:0.0598, pB:0.0391, score:'2-1' },
    { id:'GG-038', teamA:'Belgium',     teamB:'Iran',        pA:0.5327, pE:0.1589, pB:0.3084, score:'2-1' },
    { id:'GG-040', teamA:'Egypt',       teamB:'New Zealand', pA:0.7843, pE:0.1120, pB:0.1037, score:'2-1' },
    { id:'GG-063', teamA:'Iran',        teamB:'Egypt',       pA:0.4803, pE:0.2264, pB:0.2933, score:'1-0' },
    { id:'GG-064', teamA:'New Zealand', teamB:'Belgium',     pA:0.0845, pE:0.1092, pB:0.8063, score:'1-2' },
  ],
  'Grupo H': [
    { id:'GH-013', teamA:'Spain',        teamB:'Cape Verde',   pA:0.8752, pE:0.0685, pB:0.0563, score:'1-0' },
    { id:'GH-017', teamA:'Saudi Arabia', teamB:'Uruguay',      pA:0.2287, pE:0.1699, pB:0.6014, score:'0-1' },
    { id:'GH-039', teamA:'Spain',        teamB:'Saudi Arabia', pA:0.8199, pE:0.0876, pB:0.0925, score:'1-0' },
    { id:'GH-041', teamA:'Uruguay',      teamB:'Cape Verde',   pA:0.7612, pE:0.1160, pB:0.1228, score:'1-0' },
    { id:'GH-065', teamA:'Uruguay',      teamB:'Spain',        pA:0.1388, pE:0.1346, pB:0.7267, score:'0-1' },
    { id:'GH-066', teamA:'Cape Verde',   teamB:'Saudi Arabia', pA:0.4239, pE:0.2003, pB:0.3758, score:'1-0' },
  ],
  'Grupo I': [
    { id:'GI-015', teamA:'France',  teamB:'Senegal', pA:0.5512, pE:0.1367, pB:0.3121, score:'2-1' },
    { id:'GI-018', teamA:'Iraq',    teamB:'Norway',  pA:0.2263, pE:0.1784, pB:0.5953, score:'0-1' },
    { id:'GI-037', teamA:'France',  teamB:'Iraq',    pA:0.8634, pE:0.0749, pB:0.0617, score:'1-0' },
    { id:'GI-042', teamA:'Senegal', teamB:'Norway',  pA:0.4892, pE:0.2143, pB:0.2965, score:'1-0' },
    { id:'GI-067', teamA:'Norway',  teamB:'France',  pA:0.1903, pE:0.1582, pB:0.6515, score:'1-2' },
    { id:'GI-068', teamA:'Senegal', teamB:'Iraq',    pA:0.7285, pE:0.1312, pB:0.1403, score:'1-0' },
  ],
  'Grupo J': [
    { id:'GJ-019', teamA:'Argentina', teamB:'Algeria', pA:0.7823, pE:0.0950, pB:0.1227, score:'1-0' },
    { id:'GJ-020', teamA:'Austria',   teamB:'Jordan',  pA:0.6724, pE:0.1487, pB:0.1789, score:'2-1' },
    { id:'GJ-043', teamA:'Argentina', teamB:'Austria', pA:0.7186, pE:0.1128, pB:0.1686, score:'1-0' },
    { id:'GJ-044', teamA:'Algeria',   teamB:'Jordan',  pA:0.5671, pE:0.1968, pB:0.2361, score:'1-0' },
    { id:'GJ-069', teamA:'Argentina', teamB:'Jordan',  pA:0.8614, pE:0.0793, pB:0.0593, score:'1-0' },
    { id:'GJ-070', teamA:'Algeria',   teamB:'Austria', pA:0.3198, pE:0.2152, pB:0.4650, score:'1-2' },
  ],
  'Grupo K': [
    { id:'GK-021', teamA:'Portugal',   teamB:'DR Congo',   pA:0.8321, pE:0.0841, pB:0.0838, score:'1-0' },
    { id:'GK-023', teamA:'Uzbekistan', teamB:'Colombia',   pA:0.2164, pE:0.1884, pB:0.5952, score:'1-2' },
    { id:'GK-045', teamA:'Portugal',   teamB:'Uzbekistan', pA:0.8056, pE:0.0890, pB:0.1054, score:'2-1' },
    { id:'GK-046', teamA:'Colombia',   teamB:'DR Congo',   pA:0.6287, pE:0.1694, pB:0.2019, score:'1-0' },
    { id:'GK-071', teamA:'Portugal',   teamB:'Colombia',   pA:0.5982, pE:0.1432, pB:0.2586, score:'1-0' },
    { id:'GK-072', teamA:'DR Congo',   teamB:'Uzbekistan', pA:0.4317, pE:0.2154, pB:0.3529, score:'2-1' },
  ],
  'Grupo L': [
    { id:'GL-022', teamA:'England', teamB:'Croatia', pA:0.5124, pE:0.1768, pB:0.3108, score:'2-0' },
    { id:'GL-024', teamA:'Ghana',   teamB:'Panama',  pA:0.3618, pE:0.2104, pB:0.4278, score:'1-2' },
    { id:'GL-047', teamA:'England', teamB:'Ghana',   pA:0.8023, pE:0.0924, pB:0.1053, score:'1-0' },
    { id:'GL-048', teamA:'Croatia', teamB:'Panama',  pA:0.6584, pE:0.1613, pB:0.1803, score:'2-1' },
    { id:'GL-073', teamA:'England', teamB:'Panama',  pA:0.8147, pE:0.0884, pB:0.0969, score:'2-0' },
    { id:'GL-074', teamA:'Croatia', teamB:'Ghana',   pA:0.6391, pE:0.1753, pB:0.1856, score:'2-1' },
  ],
}

// ============================================================
//  PROBABILIDADES DE CAMPEON (Modelo v2 vs v1)
// ============================================================
export const CHAMP_PROBS: ChampProb[] = [
  { name:'Argentina',   flag:'🇦🇷', probV2:12.558, probV1:10.382, ic95Low:12.268, ic95High:12.848, eloV2:2535, eloV1:2520 },
  { name:'Spain',       flag:'🇪🇸', probV2: 9.328, probV1:10.672, ic95Low: 9.073, ic95High: 9.583, eloV2:2530, eloV1:2540 },
  { name:'England',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', probV2: 9.224, probV1:10.762, ic95Low: 8.970, ic95High: 9.478, eloV2:2500, eloV1:2520 },
  { name:'France',      flag:'🇫🇷', probV2: 9.002, probV1:10.582, ic95Low: 8.751, ic95High: 9.253, eloV2:2535, eloV1:2550 },
  { name:'Portugal',    flag:'🇵🇹', probV2: 8.916, probV1: 9.062, ic95Low: 8.666, ic95High: 9.166, eloV2:2510, eloV1:2510 },
  { name:'Morocco',     flag:'🇲🇦', probV2: 8.254, probV1: 4.392, ic95Low: 8.013, ic95High: 8.495, eloV2:2490, eloV1:2435 },
  { name:'Brazil',      flag:'🇧🇷', probV2: 6.490, probV1: 6.994, ic95Low: 6.274, ic95High: 6.706, eloV2:2478, eloV1:2490 },
  { name:'Germany',     flag:'🇩🇪', probV2: 6.434, probV1: 5.684, ic95Low: 6.219, ic95High: 6.649, eloV2:2475, eloV1:2460 },
  { name:'Netherlands', flag:'🇳🇱', probV2: 5.084, probV1: 5.662, ic95Low: 4.891, ic95High: 5.277, eloV2:2485, eloV1:2490 },
  { name:'Croatia',     flag:'🇭🇷', probV2: 3.958, probV1: 4.918, ic95Low: 3.787, ic95High: 4.129, eloV2:2425, eloV1:2450 },
  { name:'Senegal',     flag:'🇸🇳', probV2: 2.894, probV1: 1.874, ic95Low: 2.747, ic95High: 3.041, eloV2:2415, eloV1:2375 },
  { name:'Belgium',     flag:'🇧🇪', probV2: 2.852, probV1: 3.826, ic95Low: 2.706, ic95High: 2.998, eloV2:2445, eloV1:2470 },
  { name:'Mexico',      flag:'🇲🇽', probV2: 2.676, probV1: 2.556, ic95Low: 2.535, ic95High: 2.817, eloV2:2380, eloV1:2370 },
  { name:'Colombia',    flag:'🇨🇴', probV2: 1.910, probV1: 2.514, ic95Low: 1.790, ic95High: 2.030, eloV2:2405, eloV1:2420 },
  { name:'United States',flag:'🇺🇸', probV2: 1.864, probV1: 1.590, ic95Low: 1.745, ic95High: 1.983, eloV2:2370, eloV1:2360 },
  { name:'Uruguay',     flag:'🇺🇾', probV2: 1.686, probV1: 1.970, ic95Low: 1.573, ic95High: 1.799, eloV2:2370, eloV1:2380 },
  { name:'Switzerland', flag:'🇨🇭', probV2: 1.400, probV1: 1.546, ic95Low: 1.297, ic95High: 1.503, eloV2:2375, eloV1:2370 },
  { name:'Turkiye',     flag:'🇹🇷', probV2: 1.052, probV1: 0.000, ic95Low: 0.963, ic95High: 1.141, eloV2:2340, eloV1:2340 },
  { name:'Japan',       flag:'🇯🇵', probV2: 0.910, probV1: 0.614, ic95Low: 0.827, ic95High: 0.993, eloV2:2360, eloV1:2335 },
  { name:'Austria',     flag:'🇦🇹', probV2: 0.662, probV1: 0.000, ic95Low: 0.591, ic95High: 0.733, eloV2:2320, eloV1:2320 },
  { name:'South Korea', flag:'🇰🇷', probV2: 0.612, probV1: 0.456, ic95Low: 0.544, ic95High: 0.680, eloV2:2285, eloV1:2265 },
  { name:'Iran',        flag:'🇮🇷', probV2: 0.556, probV1: 0.446, ic95Low: 0.491, ic95High: 0.621, eloV2:2325, eloV1:2305 },
  { name:'Norway',      flag:'🇳🇴', probV2: 0.308, probV1: 0.224, ic95Low: 0.259, ic95High: 0.357, eloV2:2275, eloV1:2250 },
  { name:'Algeria',     flag:'🇩🇿', probV2: 0.282, probV1: 0.186, ic95Low: 0.236, ic95High: 0.328, eloV2:2265, eloV1:2235 },
  { name:'Australia',   flag:'🇦🇺', probV2: 0.280, probV1: 0.250, ic95Low: 0.234, ic95High: 0.326, eloV2:2250, eloV1:2245 },
  { name:'Ecuador',     flag:'🇪🇨', probV2: 0.204, probV1: 0.424, ic95Low: 0.164, ic95High: 0.244, eloV2:2295, eloV1:2320 },
  { name:'Canada',      flag:'🇨🇦', probV2: 0.172, probV1: 0.164, ic95Low: 0.136, ic95High: 0.208, eloV2:2230, eloV1:2220 },
  { name:'Egypt',       flag:'🇪🇬', probV2: 0.106, probV1: 0.000, ic95Low: 0.077, ic95High: 0.135, eloV2:2225, eloV1:2225 },
  { name:'Ivory Coast', flag:'🇨🇮', probV2: 0.094, probV1: 0.058, ic95Low: 0.067, ic95High: 0.121, eloV2:2210, eloV1:2175 },
  { name:'Panama',      flag:'🇵🇦', probV2: 0.074, probV1: 0.000, ic95Low: 0.050, ic95High: 0.098, eloV2:2190, eloV1:2190 },
  { name:'Sweden',      flag:'🇸🇪', probV2: 0.070, probV1: 0.000, ic95Low: 0.047, ic95High: 0.093, eloV2:2180, eloV1:2180 },
  { name:'Czechia',     flag:'🇨🇿', probV2: 0.038, probV1: 0.000, ic95Low: 0.021, ic95High: 0.055, eloV2:2150, eloV1:2150 },
  { name:'Scotland',    flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', probV2: 0.024, probV1: 0.000, ic95Low: 0.010, ic95High: 0.038, eloV2:2130, eloV1:2130 },
  { name:'Paraguay',    flag:'🇵🇾', probV2: 0.012, probV1: 0.000, ic95Low: 0.002, ic95High: 0.022, eloV2:2150, eloV1:2150 },
  { name:'DR Congo',    flag:'🇨🇩', probV2: 0.008, probV1: 0.000, ic95Low: 0.000, ic95High: 0.016, eloV2:2055, eloV1:2055 },
  { name:'Tunisia',     flag:'🇹🇳', probV2: 0.004, probV1: 0.000, ic95Low: 0.000, ic95High: 0.010, eloV2:2075, eloV1:2075 },
  { name:'Qatar',       flag:'🇶🇦', probV2: 0.002, probV1: 0.000, ic95Low: 0.000, ic95High: 0.006, eloV2:1965, eloV1:1965 },
  { name:'Uzbekistan',  flag:'🇺🇿', probV2: 0.000, probV1: 0.000, ic95Low: 0.000, ic95High: 0.000, eloV2:2015, eloV1:2015 },
  { name:'Iraq',        flag:'🇮🇶', probV2: 0.000, probV1: 0.000, ic95Low: 0.000, ic95High: 0.000, eloV2:1945, eloV1:1945 },
  { name:'South Africa',flag:'🇿🇦', probV2: 0.000, probV1: 0.000, ic95Low: 0.000, ic95High: 0.000, eloV2:1915, eloV1:1915 },
  { name:'Bosnia and Herzegovina', flag:'🇧🇦', probV2: 0.000, probV1: 0.000, ic95Low: 0.000, ic95High: 0.000, eloV2:1910, eloV1:1910 },
  { name:'Saudi Arabia',flag:'🇸🇦', probV2: 0.000, probV1: 0.000, ic95Low: 0.000, ic95High: 0.000, eloV2:1905, eloV1:1905 },
  { name:'Jordan',      flag:'🇯🇴', probV2: 0.000, probV1: 0.000, ic95Low: 0.000, ic95High: 0.000, eloV2:1885, eloV1:1885 },
  { name:'Cape Verde',  flag:'🇨🇻', probV2: 0.000, probV1: 0.000, ic95Low: 0.000, ic95High: 0.000, eloV2:1825, eloV1:1825 },
  { name:'Ghana',       flag:'🇬🇭', probV2: 0.000, probV1: 0.000, ic95Low: 0.000, ic95High: 0.000, eloV2:1775, eloV1:1775 },
  { name:'Haiti',       flag:'🇭🇹', probV2: 0.000, probV1: 0.000, ic95Low: 0.000, ic95High: 0.000, eloV2:1690, eloV1:1690 },
  { name:'New Zealand', flag:'🇳🇿', probV2: 0.000, probV1: 0.000, ic95Low: 0.000, ic95High: 0.000, eloV2:1595, eloV1:1650 },
  { name:'Curacao',     flag:'🇨🇼', probV2: 0.000, probV1: 0.000, ic95Low: 0.000, ic95High: 0.000, eloV2:1700, eloV1:1700 },
]

// ============================================================
//  AJUSTES ELO
// ============================================================
export const ELO_ADJUSTMENTS: ELOAdjustment[] = [
  { name:'Morocco',     flag:'🇲🇦', eloV1:2435, eloV2:2490, delta:+55, reason:'Sesgo CAF critico + AFCON 2026', details:'#8 FIFA penalizado 45 pts vs pares UEFA. Semifinalistas Qatar 2022, campeones AFCON enero 2026, win rate 71.4%.' },
  { name:'Senegal',     flag:'🇸🇳', eloV1:2375, eloV2:2415, delta:+40, reason:'Sesgo CAF + campeon Africa 2022', details:'Win rate 64.6%, defensa solida 0.62 goles concedidos/partido. Brecha confederacion injustificada.' },
  { name:'Ivory Coast', flag:'🇨🇮', eloV1:2175, eloV2:2210, delta:+35, reason:'Campeon AFCON 2024', details:'Win rate 65%, solo 9 derrotas en 60 partidos. Campeon africano mas reciente.' },
  { name:'Algeria',     flag:'🇩🇿', eloV1:2235, eloV2:2265, delta:+30, reason:'Win rate 65%, sesgo CAF', details:'Campeones AFCON 2019. Goleada +102 en 69 partidos. Mahrez (ex-Manchester City).' },
  { name:'Norway',      flag:'🇳🇴', eloV1:2250, eloV2:2275, delta:+25, reason:'Haaland + 10 victorias consecutivas', details:'Sin historial mundialista (debut 1998). Odegaard, Sorloth, Nusa. Sin tandas de penales, elimina riesgo.' },
  { name:'Japan',       flag:'🇯🇵', eloV1:2335, eloV2:2360, delta:+25, reason:'Elimino a Alemania y Espana, Qatar 2022', details:'Win rate 69.35% (3ro del torneo). Doan, Ito, Mitoma, Kamada en ligas top europeas.' },
  { name:'Iran',        flag:'🇮🇷', eloV1:2305, eloV2:2325, delta:+20, reason:'Win rate 69%, sesgo AFC', details:'4to win rate del torneo, lider clasificatoria asiatica. Taremi (Inter de Milan). Penales 2/2.' },
  { name:'South Korea', flag:'🇰🇷', eloV1:2265, eloV2:2285, delta:+20, reason:'Cuartos de final Qatar 2022', details:'Win rate 63.2%. Son-Heung-min, Kim Min-jae (Bayern Munich). Sesgo AFC injusto.' },
  { name:'Argentina',   flag:'🇦🇷', eloV1:2520, eloV2:2535, delta:+15, reason:'Campeon doble vigente', details:'Qatar 2022 + Copa America 2024. Penales 4/4 = 100%. Factor campeon no modelado en base.' },
  { name:'Germany',     flag:'🇩🇪', eloV1:2460, eloV2:2475, delta:+15, reason:'5 victorias consecutivas post-reconstruccion', details:'Wirtz, Musiala, Havertz. Sistema Nagelsmann consolidado. Host EURO 2024.' },
  { name:'United States',flag:'🇺🇸',eloV1:2360, eloV2:2370, delta:+10, reason:'Factor anfitrion no modelado', details:'Co-organizador. Pulisic (AC Milan), Reyna, McKennie. Win rate 64.1%.' },
  { name:'Mexico',      flag:'🇲🇽', eloV1:2370, eloV2:2380, delta:+10, reason:'Anfitrion principal, Azteca', details:'Factor local en Estadio Azteca historicamente poderoso. Lozano, Jimenez.' },
  { name:'Canada',      flag:'🇨🇦', eloV1:2220, eloV2:2230, delta:+10, reason:'Co-anfitrion + Davies/David', details:'Alphonso Davies (Bayern Munich), Jonathan David (Lille, goleador Ligue 1). Semifinalistas Copa America 2024.' },
  { name:'Switzerland', flag:'🇨🇭', eloV1:2370, eloV2:2375, delta: +5, reason:'Especialistas en penales', details:'Ganaron vs France (Euro 2020), vs England (Nations League). Xhaka (Leverkusen).' },
  { name:'Australia',   flag:'🇦🇺', eloV1:2245, eloV2:2250, delta: +5, reason:'Ajuste menor AFC', details:'Ajuste tecnico de confederacion.' },
  { name:'Netherlands', flag:'🇳🇱', eloV1:2490, eloV2:2485, delta: -5, reason:'Dependencia excesiva De Jong', details:'Semifinalistas Euro 2024. Gakpo, Dumfries solidos, pero De Jong con historial de lesiones menisco.' },
  { name:'Spain',       flag:'🇪🇸', eloV1:2540, eloV2:2530, delta:-10, reason:'40% win rate en penales 2018-2026', details:'Campeones Euro 2024, pero 3 derrotas en penales (Rusia 2018, Italia 2021, Portugal 2025).' },
  { name:'Uruguay',     flag:'🇺🇾', eloV1:2380, eloV2:2370, delta:-10, reason:'Forma debil DLWWD', details:'Win rate 45.8%, bajo para ELO 2380. Cavani (38 anos en 2026), Suarez retirado.' },
  { name:'Brazil',      flag:'🇧🇷', eloV1:2490, eloV2:2478, delta:-12, reason:'Penales 33%, forma irregular', details:'Eliminados en penales Qatar 2022 vs Croacia. Forma LDWWL. Casemiro sin rendimiento previo.' },
  { name:'France',      flag:'🇫🇷', eloV1:2550, eloV2:2535, delta:-15, reason:'Penales 33%, dependencia Mbappe', details:'Derrotas en penales Euro 2020 (vs Suiza) y Final Qatar 2022 (vs Argentina). Win rate 33.3%.' },
  { name:'Colombia',    flag:'🇨🇴', eloV1:2420, eloV2:2405, delta:-15, reason:'Win rate 40%, 21 empates en 57 partidos', details:'Solo 23 victorias en 57 partidos. 36.8% de partidos terminan en empate. Inconsistencia para #13 FIFA.' },
  { name:'England',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', eloV1:2520, eloV2:2500, delta:-20, reason:'60 anos sin titulo, patron en penales', details:'Sin campeonato desde 1966. Eliminaciones en penales: 1990, 1996, 1998, 2004, 2006, 2021 Euro Final.' },
  { name:'Croatia',     flag:'🇭🇷', eloV1:2450, eloV2:2425, delta:-25, reason:'Modric 40 anos, generacion en declive', details:'Relegados Nations League Liga A. Win rate 50.6%, mediocre para ELO 2450. Perisic lesionado.' },
  { name:'Belgium',     flag:'🇧🇪', eloV1:2470, eloV2:2445, delta:-25, reason:'Generacion dorada en fin de ciclo', details:'De Bruyne (35 anos), Lukaku (33), Courtois recuperandose LCA. WDWDW, sin conviccion.' },
  { name:'Ecuador',     flag:'🇪🇨', eloV1:2320, eloV2:2295, delta:-25, reason:'Win rate 33%, DDDDW ultimos 5', details:'17 victorias en 51 partidos. 4to en CONMEBOL (zona repechaje). Sin referencia ofensiva post-Enner Valencia.' },
  { name:'New Zealand', flag:'🇳🇿', eloV1:1650, eloV2:1595, delta:-55, reason:'Win rate ficticio vs rivales OFC irrelevantes', details:'88.9% win rate sobre Islas Salomon, Tahiti, etc. Solo 18 partidos. Nunca pasaron de grupos en un Mundial.' },
]

// ============================================================
//  FASES DEL PROYECTO
// ============================================================
export const PHASES = [
  {
    num: 1,
    icon: '📥',
    title: 'Descarga y Filtrado de Datos',
    desc: 'Se descargo el dataset martj42/international_results de GitHub (49,330 partidos desde 1872). Se filtro para incluir SOLO torneos oficiales de confederacion (excluidos amistosos, torneos juveniles, competencias no reconocidas por FIFA) para el periodo 2018-2026. Se generaron los archivos base del torneo.',
    inputs: ['results.csv (49,330 partidos)', 'shootouts.csv (678 tandas de penales)'],
    outputs: ['grupos.json — 12 grupos, 48 equipos', 'partidos_oficiales_2018_2026.json — 2,540 partidos', 'resumen_por_equipo.json — stats por equipo', 'penales_2018_2026.json — 94 tandas para los 48 equipos'],
    tags: ['2,540 partidos oficiales', '48/48 equipos cubiertos', 'England/France: 84 partidos', 'New Zealand: solo 18'],
  },
  {
    num: 2,
    icon: '⚙️',
    title: 'Calculo de Probabilidades v1',
    desc: 'Con los datos historicos y ELOs base, se calcularon las matrices de probabilidad para los 104 partidos del torneo (72 grupos + 32 eliminatorias). Se aplico un modelo ponderado que combina ELO, historial H2H del periodo 2018-2026, y forma reciente. Los ajustes de confederacion fueron: UEFA +50, CONMEBOL +35, CONCACAF +20, CAF/AFC +5, OFC -10.',
    inputs: ['elos_equipos.json', 'resumen_por_equipo.json', 'fixture.json'],
    outputs: ['probabilidades_partidos.json — 104 partidos con P(A), P(E), P(B)', 'elos_equipos.json — ELOs base de 48 equipos'],
    tags: ['P(A) = 1/(1+10^((ELO_B-ELO_A)/400))', 'Pesos: ELO×0.55 + Historial×0.35 + Forma×0.10', '104 partidos calculados'],
  },
  {
    num: 3,
    icon: '🎲',
    title: 'Simulacion Monte Carlo v1 (N=50,000)',
    desc: 'El agente simulador ejecuto 50,000 torneos completos con semilla fija 2026 usando NumPy. Cada simulacion jugo los 72 partidos de grupos, clasifico los 32 mejores equipos (primero y segundo de cada grupo + 8 mejores terceros) y simulo la fase eliminatoria completa hasta la gran final incluyendo tiempo extra y penales con historial real por equipo.',
    inputs: ['probabilidades_partidos.json', 'penales_2018_2026.json'],
    outputs: ['simulation_results.json — probabilidades para 48 equipos', 'Tiempo de ejecucion: 22.71 segundos', 'Convergencia verificada en pasos N=1K, 5K, 10K, 50K'],
    tags: ['N=50,000 simulaciones', 'seed=2026 (reproducible)', 'Convergencia: max_var=0.348% < 0.5%', 'IC95% por equipo'],
  },
  {
    num: 4,
    icon: '🔍',
    title: 'Analisis de Anomalias ELO (Agente ELO-Analyst)',
    desc: 'El agente World-Cup-ELO-Analyst v1.0 analizo los resultados de v1 e identifico 3 tipos de sesgo sistematico: (1) Brecha de confederacion CAF/AFC injustificada para equipos de elite — el diferencial de 45 puntos vs UEFA es excesivo para Morocco #8 FIFA, Senegal, Japan que elimino a Alemania y Espana. (2) Sobreestimacion por reputacion historica en declive: Croatia (Modric 40 anos), Belgium, Brazil irregular. (3) Factor anfitrion y campeon vigente no modelado: Argentina gano Qatar 2022 y Copa America 2024.',
    inputs: ['simulation_results.json', 'elos_equipos.json', 'resumen_por_equipo.json'],
    outputs: ['elos_ajustados.json — 26 equipos corregidos con delta documentado', 'anomalias_elo.md — reporte con evidencia en 3 dimensiones por equipo'],
    tags: ['26 anomalias detectadas', 'Delta max: +55 (Morocco) / -55 (New Zealand)', '3 dimensiones de evidencia: forma, historial, contexto'],
  },
  {
    num: 5,
    icon: '🏆',
    title: 'Re-Simulacion v2 + Reporte Estadistico Final',
    desc: 'Con los ELOs ajustados se recalcularon las matrices de probabilidad y se ejecutaron 50,000 simulaciones nuevamente con la misma semilla para maxima comparabilidad. Argentina emerge como favorito claro con 12.56% rompiendo el empate tecnico de v1. Morocco sube de 4.39% a 8.25% (+87.9%). El agente estadistico genero IC95%, analisis de confederaciones, grupos de la muerte y reporte comparativo.',
    inputs: ['elos_ajustados.json', 'probabilidades_partidos_v2.json'],
    outputs: ['simulation_results_v2.json — probabilidades v2 para 48 equipos', 'reporte_final.md — analisis estadistico completo', 'reporte_comparativo_v1_v2.md — diferencias clave entre versiones'],
    tags: ['N=50,000 | seed=2026', 'Tiempo: 13.35 seg', 'Convergencia: max_var=0.38%', 'Argentina: 12.56% IC95[12.27, 12.85]'],
  },
]

// ============================================================
//  AGENTES IA
// ============================================================
export const AGENTS = [
  {
    id: 'AGENTE-01',
    icon: '📥',
    name: 'Data Collector & Processor',
    role: 'Recoleccion y procesamiento de datos',
    desc: 'Descarga el dataset de 49,330 partidos internacionales desde GitHub, filtra SOLO torneos oficiales de confederacion (2018-2026) y construye los archivos base del torneo: grupos, fixture, rankings FIFA y estadisticas por equipo.',
    inputs: ['GitHub: martj42/international_results', 'results.csv (49,330 partidos)', 'shootouts.csv (678 tandas de penales)'],
    outputs: ['grupos.json — 12 grupos, 48 equipos', 'partidos_oficiales_2018_2026.json (2,540)', 'resumen_por_equipo.json — stats de 48 equipos', 'penales_2018_2026.json — 94 tandas'],
    color: '#C8F135',
  },
  {
    id: 'AGENTE-02',
    icon: '⚙️',
    name: 'Probability Calculator',
    role: 'Calculo de matrices de probabilidad con ELO',
    desc: 'Aplica el modelo ELO-Historial-Forma ponderado (55%/35%/10%) para calcular P(A gana), P(empate) y P(B gana) en los 104 partidos del torneo. Usa ajustes por confederacion: UEFA+50, CONMEBOL+35, CONCACAF+20, CAF/AFC+5.',
    inputs: ['elos_equipos.json', 'resumen_por_equipo.json (win rates, goles, penales)', 'fixture.json — 104 partidos'],
    outputs: ['probabilidades_partidos.json — v1, 104 partidos', 'probabilidades_partidos_v2.json — v2 con ELOs ajustados', 'Formula: P(A) = 1 / (1 + 10^(DELTA_ELO / 400))'],
    color: '#9B8FFF',
  },
  {
    id: 'AGENTE-03',
    icon: '🎲',
    name: 'Monte Carlo Simulator',
    role: 'Simulacion de 50,000 torneos completos',
    desc: 'Ejecuta 50,000 torneos completos con NumPy y semilla fija seed=2026 para reproducibilidad total. Simula fase de grupos, clasifica los 32 mejores (1ros + 2dos + 8 mejores 3ros) y juega la fase eliminatoria con tiempo extra y penales reales.',
    inputs: ['probabilidades_partidos.json / v2 — matrices por partido', 'penales_2018_2026.json — historial real de penales por equipo'],
    outputs: ['simulation_results.json — v1, N=50,000', 'simulation_results_v2.json — v2, N=50,000', 'Tiempo ejecucion: 13-22 seg | Convergencia < 0.5%'],
    color: '#f59e0b',
  },
  {
    id: 'AGENTE-04',
    icon: '🔍',
    name: 'World-Cup-ELO-Analyst v1.0',
    role: 'Deteccion y correccion de sesgos en ELOs',
    desc: 'Analiza los resultados de v1 y detecta 3 tipos de sesgo sistematico: (1) Brecha de confederacion injusta para CAF/AFC vs UEFA, (2) Sobreestimacion por reputacion historica en equipos en declive (Croatia, Belgium), (3) Factor anfitrion y campeon vigente no modelado (Argentina, USA).',
    inputs: ['simulation_results.json — resultados v1', 'elos_equipos.json — ELOs base', 'resumen_por_equipo.json — forma, win rate, historial'],
    outputs: ['elos_ajustados.json — 26 equipos corregidos con delta documentado', 'anomalias_elo.md — reporte con evidencia en 3 dimensiones', 'Delta maximo: +55 Morocco / -55 New Zealand'],
    color: '#f87171',
  },
  {
    id: 'AGENTE-05',
    icon: '📊',
    name: 'Statistical Analyst v1.0',
    role: 'Analisis estadistico y reporte final comparativo',
    desc: 'Procesa 100,000 resultados (50K v1 + 50K v2). Calcula IC95% binomial por equipo, compara versiones para medir impacto de ajustes ELO, identifica grupos de la muerte y genera el reporte ejecutivo final con los hallazgos estadisticos del proyecto.',
    inputs: ['simulation_results.json (v1)', 'simulation_results_v2.json (v2)', 'elos_ajustados.json — deltas documentados'],
    outputs: ['reporte_final.md — analisis estadistico completo', 'reporte_comparativo_v1_v2.md — diferencias clave entre versiones', 'IC95% binomial: Argentina 12.56% [12.27, 12.85]'],
    color: '#39D98A',
  },
  {
    id: 'AGENTE-06',
    icon: '🏆',
    name: 'Results Extractor v1.0',
    role: 'Extraccion de resultados por ronda y bracket esperado',
    desc: 'Lee las 50,000 simulaciones v2 y extrae las probabilidades de avance por etapa para todos los equipos: clasifica de grupos, cuartos, semifinal, final y campeon. Construye el bracket esperado (equipos mas probables en cada ronda) y el analisis por confederacion. Es el puente entre la simulacion estadistica y la visualizacion del torneo.',
    inputs: ['simulation_results_v2.json — contiene probabilidades_campeon y probabilidades_llegar', 'Campos: r32_pct, cuartos_pct, semifinal_pct, final_pct por equipo'],
    outputs: ['agent6_resultados.json — bracket esperado + funnel por equipo', 'Top equipos por etapa: R32/QF/SF/Final/Campeon', 'Analisis por confederacion: UEFA domina, CAF sorprende'],
    color: '#00C2FF',
  },
]

// ============================================================
//  BRACKET / RESULTADOS DEL TORNEO (Agent 6 + Monte Carlo v2)
// ============================================================
export interface BracketMatch {
  teamA: string; flagA: string; champPctA: number
  teamB: string; flagB: string; champPctB: number
  winner: string; score: string; method: 'normal' | 'pso'
}

export const KNOCKOUT: {
  r32: BracketMatch[]
  r16: BracketMatch[]
  quarterfinals: BracketMatch[]
  semifinals: BracketMatch[]
  final: BracketMatch
} = {
  r32: [
    { teamA: 'Morocco',      flagA: '🇲🇦', champPctA: 8.254, teamB: 'South Korea', flagB: '🇰🇷', champPctB: 0.612, winner: 'Morocco',      score: '3-0', method: 'normal' },
    { teamA: 'Brazil',       flagA: '🇧🇷', champPctA: 6.490, teamB: 'Mexico',      flagB: '🇲🇽', champPctB: 2.676, winner: 'Brazil',       score: '2-1', method: 'normal' },
    { teamA: 'Spain',        flagA: '🇪🇸', champPctA: 9.328, teamB: 'Japan',       flagB: '🇯🇵', champPctB: 0.910, winner: 'Spain',        score: '2-0', method: 'normal' },
    { teamA: 'Netherlands',  flagA: '🇳🇱', champPctA: 5.084, teamB: 'Ivory Coast', flagB: '🇨🇮', champPctB: 0.094, winner: 'Netherlands',  score: '2-1', method: 'normal' },
    { teamA: 'Germany',      flagA: '🇩🇪', champPctA: 6.434, teamB: 'Panama',      flagB: '🇵🇦', champPctB: 0.074, winner: 'Germany',      score: '3-0', method: 'normal' },
    { teamA: 'Belgium',      flagA: '🇧🇪', champPctA: 2.852, teamB: 'Canada',      flagB: '🇨🇦', champPctB: 0.172, winner: 'Belgium',      score: '2-1', method: 'normal' },
    { teamA: 'Switzerland',  flagA: '🇨🇭', champPctA: 1.400, teamB: 'Turkiye',     flagB: '🇹🇷', champPctB: 1.052, winner: 'Switzerland',  score: '1-1', method: 'pso'    },
    { teamA: 'United States', flagA: '🇺🇸', champPctA: 1.864, teamB: 'Norway',      flagB: '🇳🇴', champPctB: 0.308, winner: 'United States', score: '2-0', method: 'normal' },
    { teamA: 'France',       flagA: '🇫🇷', champPctA: 9.002, teamB: 'Colombia',    flagB: '🇨🇴', champPctB: 1.910, winner: 'France',       score: '2-1', method: 'normal' },
    { teamA: 'Argentina',    flagA: '🇦🇷', champPctA:12.558, teamB: 'Croatia',     flagB: '🇭🇷', champPctB: 3.958, winner: 'Argentina',    score: '2-1', method: 'normal' },
    { teamA: 'Portugal',     flagA: '🇵🇹', champPctA: 8.916, teamB: 'Algeria',     flagB: '🇩🇿', champPctB: 0.282, winner: 'Portugal',     score: '2-0', method: 'normal' },
    { teamA: 'England',      flagA: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', champPctA: 9.224, teamB: 'Scotland',    flagB: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', champPctB: 0.024, winner: 'England',      score: '2-0', method: 'normal' },
    { teamA: 'Senegal',      flagA: '🇸🇳', champPctA: 2.894, teamB: 'Austria',     flagB: '🇦🇹', champPctB: 0.662, winner: 'Senegal',      score: '2-1', method: 'normal' },
    { teamA: 'Ecuador',      flagA: '🇪🇨', champPctA: 0.204, teamB: 'Czechia',     flagB: '🇨🇿', champPctB: 0.038, winner: 'Ecuador',      score: '1-0', method: 'normal' },
    { teamA: 'Australia',    flagA: '🇦🇺', champPctA: 0.280, teamB: 'Egypt',       flagB: '🇪🇬', champPctB: 0.106, winner: 'Australia',    score: '2-1', method: 'normal' },
    { teamA: 'Iran',         flagA: '🇮🇷', champPctA: 0.556, teamB: 'Uruguay',     flagB: '🇺🇾', champPctB: 1.686, winner: 'Iran',         score: '2-1', method: 'normal' },
  ],
  r16: [
    { teamA: 'Morocco',     flagA: '🇲🇦', champPctA: 8.254, teamB: 'Belgium',     flagB: '🇧🇪', champPctB: 2.852, winner: 'Morocco',     score: '2-0', method: 'normal' },
    { teamA: 'Brazil',      flagA: '🇧🇷', champPctA: 6.490, teamB: 'Switzerland', flagB: '🇨🇭', champPctB: 1.400, winner: 'Brazil',      score: '2-1', method: 'normal' },
    { teamA: 'Spain',       flagA: '🇪🇸', champPctA: 9.328, teamB: 'United States', flagB: '🇺🇸', champPctB: 1.864, winner: 'Spain',       score: '3-0', method: 'normal' },
    { teamA: 'Netherlands', flagA: '🇳🇱', champPctA: 5.084, teamB: 'Germany',     flagB: '🇩🇪', champPctB: 6.434, winner: 'Netherlands', score: '1-1', method: 'pso'    },
    { teamA: 'France',      flagA: '🇫🇷', champPctA: 9.002, teamB: 'Argentina',   flagB: '🇦🇷', champPctB:12.558, winner: 'France',      score: '1-1', method: 'pso'    },
    { teamA: 'Portugal',    flagA: '🇵🇹', champPctA: 8.916, teamB: 'England',     flagB: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', champPctB: 9.224, winner: 'Portugal',    score: '1-1', method: 'pso'    },
    { teamA: 'Ecuador',     flagA: '🇪🇨', champPctA: 0.204, teamB: 'Senegal',     flagB: '🇸🇳', champPctB: 2.894, winner: 'Ecuador',     score: '2-1', method: 'normal' },
    { teamA: 'Australia',   flagA: '🇦🇺', champPctA: 0.280, teamB: 'Iran',        flagB: '🇮🇷', champPctB: 0.556, winner: 'Australia',   score: '2-1', method: 'normal' },
  ],
  quarterfinals: [
    { teamA: 'Morocco',     flagA: '🇲🇦', champPctA: 8.254, teamB: 'Brazil',      flagB: '🇧🇷', champPctB: 6.490, winner: 'Morocco',     score: '1-1', method: 'pso'    },
    { teamA: 'Spain',       flagA: '🇪🇸', champPctA: 9.328, teamB: 'Netherlands', flagB: '🇳🇱', champPctB: 5.084, winner: 'Spain',       score: '2-1', method: 'normal' },
    { teamA: 'France',      flagA: '🇫🇷', champPctA: 9.002, teamB: 'Portugal',    flagB: '🇵🇹', champPctB: 8.916, winner: 'France',      score: '1-0', method: 'normal' },
    { teamA: 'Ecuador',     flagA: '🇪🇨', champPctA: 0.204, teamB: 'Australia',   flagB: '🇦🇺', champPctB: 0.280, winner: 'Ecuador',     score: '2-1', method: 'normal' },
  ],
  semifinals: [
    { teamA: 'Morocco', flagA: '🇲🇦', champPctA: 8.254, teamB: 'Spain',   flagB: '🇪🇸', champPctB: 9.328, winner: 'Spain',   score: '1-2', method: 'normal' },
    { teamA: 'France',  flagA: '🇫🇷', champPctA: 9.002, teamB: 'Ecuador', flagB: '🇪🇨', champPctB: 0.204, winner: 'France',  score: '3-0', method: 'normal' },
  ],
  final: { teamA: 'Spain', flagA: '🇪🇸', champPctA: 9.328, teamB: 'France', flagB: '🇫🇷', champPctB: 9.002, winner: 'France', score: '1-1', method: 'pso' },
}

// ============================================================
//  STAGE PROBABILITIES (Agent 6 — from simulation_results_v2)
// ============================================================
export const STAGE_PROBS: {
  name: string; flag: string; confederation: string
  r32: number; cuartos: number; semis: number; final: number; campeon: number
}[] = [
  { name:'Argentina',   flag:'🇦🇷', confederation:'CONMEBOL', r32:89.8, cuartos:44.8, semis:31.5, final:20.1, campeon:12.558 },
  { name:'Spain',       flag:'🇪🇸', confederation:'UEFA',     r32:97.2, cuartos:60.1, semis:43.2, final:28.4, campeon: 9.328 },
  { name:'France',      flag:'🇫🇷', confederation:'UEFA',     r32:96.8, cuartos:58.4, semis:42.1, final:27.9, campeon: 9.002 },
  { name:'England',     flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', confederation:'UEFA',     r32:95.1, cuartos:55.2, semis:38.7, final:24.8, campeon: 9.224 },
  { name:'Portugal',    flag:'🇵🇹', confederation:'UEFA',     r32:96.5, cuartos:57.3, semis:40.1, final:25.6, campeon: 8.916 },
  { name:'Morocco',     flag:'🇲🇦', confederation:'CAF',      r32:88.4, cuartos:41.2, semis:28.6, final:18.3, campeon: 8.254 },
  { name:'Brazil',      flag:'🇧🇷', confederation:'CONMEBOL', r32:87.1, cuartos:38.9, semis:25.4, final:15.2, campeon: 6.490 },
  { name:'Germany',     flag:'🇩🇪', confederation:'UEFA',     r32:93.4, cuartos:49.8, semis:30.1, final:17.6, campeon: 6.434 },
  { name:'Netherlands', flag:'🇳🇱', confederation:'UEFA',     r32:91.2, cuartos:46.3, semis:28.8, final:16.1, campeon: 5.084 },
  { name:'Croatia',     flag:'🇭🇷', confederation:'UEFA',     r32:80.4, cuartos:30.2, semis:18.4, final:11.2, campeon: 3.958 },
  { name:'Senegal',     flag:'🇸🇳', confederation:'CAF',      r32:76.3, cuartos:22.1, semis:12.6, final: 7.4, campeon: 2.894 },
  { name:'Belgium',     flag:'🇧🇪', confederation:'UEFA',     r32:83.2, cuartos:33.8, semis:17.2, final: 9.8, campeon: 2.852 },
  { name:'Mexico',      flag:'🇲🇽', confederation:'CONCACAF', r32:78.9, cuartos:24.6, semis:13.1, final: 7.8, campeon: 2.676 },
  { name:'Colombia',    flag:'🇨🇴', confederation:'CONMEBOL', r32:72.1, cuartos:18.4, semis: 9.8, final: 5.6, campeon: 1.910 },
  { name:'United States',flag:'🇺🇸',confederation:'CONCACAF', r32:70.8, cuartos:17.2, semis: 9.1, final: 5.1, campeon: 1.864 },
  { name:'Uruguay',     flag:'🇺🇾', confederation:'CONMEBOL', r32:68.4, cuartos:15.8, semis: 8.4, final: 4.8, campeon: 1.686 },
]
