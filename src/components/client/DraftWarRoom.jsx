import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Zap, Target, Users, Flame, ShieldAlert, Sparkles, TrendingUp, ChevronRight, Scale, CheckCircle2, ArrowRight, HelpCircle, BookOpen, Lightbulb, X } from 'lucide-react';

// TOP-LEVEL CONSTANTS (Defined before any component execution)
const defaultAvailablePlayers = [
  { id: 'p1', name: 'Ja\'Marr Chase', pos: 'WR', team: 'CIN', bye: 12, adp: '1.01', projPts: 318.5, floor: 17.5, ceiling: 35.0, upsideTier: 'WR1 OVERALL', valueSteal: 'CONSENSUS #1 PICK', needMatch: false },
  { id: 'p2', name: 'Bijan Robinson', pos: 'RB', team: 'ATL', bye: 12, adp: '1.02', projPts: 298.2, floor: 15.8, ceiling: 30.1, upsideTier: 'RB1 OVERALL', valueSteal: 'TOP RB ANCHOR', needMatch: true },
  { id: 'p3', name: 'Saquon Barkley', pos: 'RB', team: 'PHI', bye: 5, adp: '1.03', projPts: 292.0, floor: 15.2, ceiling: 29.5, upsideTier: 'S-TIER VOLUME', valueSteal: 'TOP 3 PICK', needMatch: true },
  { id: 'p4', name: 'Breece Hall', pos: 'RB', team: 'NYJ', bye: 12, adp: '1.04', projPts: 286.4, floor: 14.8, ceiling: 28.2, upsideTier: 'S-TIER ELITE', valueSteal: '+2 Picks Value', needMatch: true },
  { id: 'p5', name: 'Justin Jefferson', pos: 'WR', team: 'MIN', bye: 6, adp: '1.05', projPts: 290.1, floor: 15.5, ceiling: 31.2, upsideTier: 'ELITE TARGET SHARE', valueSteal: 'TOP 5 WR', needMatch: false },
  { id: 'p6', name: 'CeeDee Lamb', pos: 'WR', team: 'DAL', bye: 7, adp: '1.06', projPts: 288.5, floor: 15.0, ceiling: 30.5, upsideTier: 'ELITE TARGET SHARE', valueSteal: 'TOP 6 WR', needMatch: false },
  { id: 'p7', name: 'Amon-Ra St. Brown', pos: 'WR', team: 'DET', bye: 5, adp: '1.07', projPts: 275.2, floor: 14.5, ceiling: 27.8, upsideTier: 'HIGH FLOOR ANCHOR', valueSteal: 'ROUND 1 ANCHOR', needMatch: false },
  { id: 'p8', name: 'Malik Nabers', pos: 'WR', team: 'NYG', bye: 11, adp: '1.08', projPts: 264.5, floor: 13.2, ceiling: 28.0, upsideTier: 'BREAKOUT SUPERSTAR', valueSteal: '+4 Picks Value', needMatch: false },
  { id: 'p9', name: 'Derrick Henry', pos: 'RB', team: 'BAL', bye: 14, adp: '1.09', projPts: 272.0, floor: 14.0, ceiling: 29.0, upsideTier: 'TOUCHDOWN MONSTER', valueSteal: '+3 Picks Value', needMatch: true },
  { id: 'p10', name: 'Jahmyr Gibbs', pos: 'RB', team: 'DET', bye: 5, adp: '1.10', projPts: 265.8, floor: 13.5, ceiling: 28.4, upsideTier: 'DYNAMIC EXPLOSIVE', valueSteal: '+2 Picks Value', needMatch: true },
  { id: 'p11', name: 'Nico Collins', pos: 'WR', team: 'HOU', bye: 14, adp: '1.11', projPts: 258.4, floor: 12.8, ceiling: 27.5, upsideTier: 'ALPHA WR1', valueSteal: 'ROUND 1 VALUE', needMatch: false },
  { id: 'p12', name: 'Puka Nacua', pos: 'WR', team: 'LAR', bye: 6, adp: '1.12', projPts: 255.0, floor: 12.5, ceiling: 26.8, upsideTier: 'TARGET MONSTER', valueSteal: 'ROUND 1 VALUE', needMatch: false },
  { id: 'p13', name: 'Garrett Wilson', pos: 'WR', team: 'NYJ', bye: 12, adp: '2.01', projPts: 248.0, floor: 12.0, ceiling: 26.0, upsideTier: 'ALPHA TARGET SHARE', valueSteal: '+3 Picks Value', needMatch: false },
  { id: 'p14', name: 'Brian Thomas Jr.', pos: 'WR', team: 'JAX', bye: 12, adp: '2.02', projPts: 242.5, floor: 11.8, ceiling: 26.5, upsideTier: 'BREAKOUT SPEEDSTAR', valueSteal: '+5 Picks Value', needMatch: false },
  { id: 'p15', name: 'Marvin Harrison Jr.', pos: 'WR', team: 'ARI', bye: 11, adp: '2.03', projPts: 238.9, floor: 11.2, ceiling: 25.4, upsideTier: 'BREAKOUT UPSIDE', valueSteal: '+4 Picks Value', needMatch: false },
  { id: 'p16', name: 'Josh Allen', pos: 'QB', team: 'BUF', bye: 12, adp: '2.04', projPts: 365.2, floor: 19.5, ceiling: 35.0, upsideTier: 'QB1 OVERALL', valueSteal: 'QB1 ANCHOR', needMatch: false },
  { id: 'p17', name: 'Lamar Jackson', pos: 'QB', team: 'BAL', bye: 14, adp: '2.05', projPts: 358.0, floor: 19.0, ceiling: 34.0, upsideTier: 'KONAMI CODE QB', valueSteal: 'QB2 ANCHOR', needMatch: false },
  { id: 'p18', name: 'Jonathan Taylor', pos: 'RB', team: 'IND', bye: 14, adp: '2.06', projPts: 245.0, floor: 12.2, ceiling: 26.0, upsideTier: 'WORKHORSE RB', valueSteal: '+4 Picks Value', needMatch: true },
  { id: 'p19', name: 'De\'Von Achane', pos: 'RB', team: 'MIA', bye: 6, adp: '2.07', projPts: 240.2, floor: 11.5, ceiling: 29.8, upsideTier: 'HOME RUN CEILING', valueSteal: '+5 Picks Value', needMatch: true },
  { id: 'p20', name: 'Kyren Williams', pos: 'RB', team: 'LAR', bye: 6, adp: '2.08', projPts: 236.5, floor: 11.8, ceiling: 24.5, upsideTier: 'REDZONE TOUCHES', valueSteal: '+3 Picks Value', needMatch: true },
  { id: 'p21', name: 'Josh Jacobs', pos: 'RB', team: 'GB', bye: 10, adp: '2.09', projPts: 230.1, floor: 11.0, ceiling: 24.0, upsideTier: 'WORKHORSE RB', valueSteal: '+4 Picks Value', needMatch: true },
  { id: 'p22', name: 'Kenneth Walker III', pos: 'RB', team: 'SEA', bye: 10, adp: '2.10', projPts: 225.4, floor: 10.8, ceiling: 23.5, upsideTier: 'TOUCHDOWN CEILING', valueSteal: '+5 Picks Value', needMatch: true },
  { id: 'p23', name: 'James Cook', pos: 'RB', team: 'BUF', bye: 12, adp: '2.11', projPts: 220.0, floor: 10.5, ceiling: 22.8, upsideTier: 'PASS CATCHER RB', valueSteal: '+6 Picks Value', needMatch: true },
  { id: 'p24', name: 'Chuba Hubbard', pos: 'RB', team: 'CAR', bye: 11, adp: '3.02', projPts: 210.5, floor: 10.0, ceiling: 21.5, upsideTier: 'HIGH VOLUME RB', valueSteal: 'ROUND 3 VALUE', needMatch: true },
  { id: 'p25', name: 'Chase Brown', pos: 'RB', team: 'CIN', bye: 12, adp: '3.05', projPts: 205.2, floor: 9.8, ceiling: 22.0, upsideTier: 'BREAKOUT RB', valueSteal: 'ROUND 3 STEAL', needMatch: true },
  { id: 'p26', name: 'Brock Bowers', pos: 'TE', team: 'LV', bye: 10, adp: '3.08', projPts: 215.4, floor: 10.5, ceiling: 23.0, upsideTier: 'TE1 OVERALL', valueSteal: 'TE1 ANCHOR', needMatch: false },
  { id: 'p27', name: 'Trey McBride', pos: 'TE', team: 'ARI', bye: 11, adp: '3.10', projPts: 208.2, floor: 10.0, ceiling: 21.8, upsideTier: 'ELITE TARGET SHARE', valueSteal: '+6 Picks Value', needMatch: false },
  { id: 'p28', name: 'Patrick Mahomes', pos: 'QB', team: 'KC', bye: 6, adp: '3.12', projPts: 332.0, floor: 17.5, ceiling: 30.0, upsideTier: 'PASSING YARD QB', valueSteal: 'ROUND 3 VALUE', needMatch: false },
  { id: 'p29', name: 'Jayden Daniels', pos: 'QB', team: 'WAS', bye: 14, adp: '4.02', projPts: 328.5, floor: 16.8, ceiling: 31.5, upsideTier: 'RUSHING UPSIDE GEM', valueSteal: '+8 Picks Value', needMatch: false },
  { id: 'p30', name: 'Christian McCaffrey', pos: 'RB', team: 'SF', bye: 9, adp: '4.04', projPts: 198.5, floor: 8.5, ceiling: 24.0, upsideTier: 'VETERAN RECOVERY', valueSteal: 'PICK #40 OVERALL', needMatch: true }
];

const AI_ADVICE_MAP_MULTI = {
  en: {
    target_pos: {
      title: "🎯 TARGET RECOMMENDATION: OPTIMAL POSITIONAL BALANCE",
      alert: "⚠️ TIER DROP WARNING: Top S-Tier RBs and Alpha WRs are being drafted rapidly!",
      analysis: "Based on your current roster composition, securing high-volume RB depth before Round 3 ends is your highest priority. Target top-tier available backs (like Bijan Robinson, Saquon Barkley, or Breece Hall) to establish an elite weekly floor.",
      action: "Target High-Volume RB / WR Value"
    },
    best_rb: {
      title: "🏃 BEST AVAILABLE PLAYERS & TIER DROP RADAR",
      alert: "🔥 TOP TARGETS: Top S-Tier RBs with Guaranteed Touch Volume",
      analysis: "1. Bijan Robinson (RB - ATL) — 88% Redzone Touch Share, S-Tier Floor\n2. Saquon Barkley (RB - PHI) — 84% Touch Share, Top 3 Pick\n3. Breece Hall (RB - NYJ) — +2 Picks Value Steal",
      action: "Draft Top Available RB"
    },
    team_compare: {
      title: "📊 LEAGUE TEAM COMPARISON & RANKINGS",
      alert: "🏆 YOUR TEAM RANKING: #2 OUT OF 12 LEAGUE TEAMS (84.2/100 GRADE)",
      analysis: "Your roster leads the league in Projected Weekly Floor (114.2 Pts). You have a +24.8 Pts advantage in WR target share over League Rival 'Gridiron Kings'. Securing an elite RB2 will move you to #1 overall.",
      action: "Maintain High-Floor Strategy"
    },
    upside: {
      title: "⚡ PLAYER UPSIDE COMPARISON (Breece Hall vs. Bijan Robinson)",
      alert: "🔥 HIGHER CEILING: Breece Hall (+1.4 Pts Ceiling Advantage)",
      analysis: "Breece Hall has a 28.2 Pts single-game ceiling due to receiving volume in NYJ offense. Bijan Robinson has higher floor stability (15.8 Pts floor). AI Recommendation: Draft Breece Hall for championship tournament upside.",
      action: "Breece Hall (+4% Win Probability)"
    },
    roster_needs: {
      title: "⚠️ URGENT ROSTER NEEDS ANALYSIS",
      alert: "🚨 STARTER GAPS: RB2 & FLEX DEPTH",
      analysis: "Current Status: Your starting roster has anchored strong target share. Securing a high-volume RB2 in upcoming picks prevents a projected weekly point drop of -4.8 Pts/week.",
      action: "Address RB2 / FLEX Immediately"
    }
  },
  es: {
    target_pos: {
      title: "🎯 RECOMENDACIÓN DE TARGET: BALANCE POSICIONAL ÓPTIMO",
      alert: "⚠️ ADVERTENCIA DE CAÍDA DE NIVEL: ¡Los Corredores y Receptores Nivel S están saliendo rápidamente!",
      analysis: "Basado en la composición de tu plantilla, asegurar profundidad de Corredor (RB) de alto volumen antes de finalizar la Ronda 3 es tu mayor prioridad. Busca corredores élite (como Bijan Robinson, Saquon Barkley o Breece Hall) para garantizar un piso semanal dominante.",
      action: "Buscar Valor en RB / WR"
    },
    best_rb: {
      title: "🏃 MEJORES JUGADORES DISPONIBLES Y RADAR DE NIVELES",
      alert: "🔥 OBJETIVOS PRINCIPALES: Corredores de Nivel S con Volumen Garantizado",
      analysis: "1. Bijan Robinson (RB - ATL) — 88% de Volumen en Zona Roja, Piso Nivel S\n2. Saquon Barkley (RB - PHI) — 84% de Toques, Pick Top 3\n3. Breece Hall (RB - NYJ) — +2 Picks de Robo de Valor",
      action: "Draftear Mejor RB Disponible"
    },
    team_compare: {
      title: "📊 COMPARACIÓN Y CLASIFICACIÓN DE EQUIPOS DE LA LIGA",
      alert: "🏆 TU EQUIPO ESTÁ EN EL PUESTO #2 DE 12 EQUIPOS (CALIFICACIÓN 84.2/100)",
      analysis: "Tu plantilla lidera la liga en Piso Semanal Proyectado (114.2 Pts). Tienes una ventaja de +24.8 Pts sobre tu rival 'Gridiron Kings'. Asegurar un RB2 élite te llevará al #1 absoluto.",
      action: "Mantener Estrategia de Piso Alto"
    },
    upside: {
      title: "⚡ COMPARACIÓN DE POTENCIAL (Breece Hall vs. Bijan Robinson)",
      alert: "🔥 MAYOR TECHO EXPLOSIVO: Breece Hall (+1.4 Pts de Ventaja en Techo)",
      analysis: "Breece Hall tiene un techo de 28.2 Pts por su volumen de pases en NYJ. Bijan Robinson tiene mayor estabilidad de piso (15.8 Pts). Recomendación IA: Draftea a Breece Hall para mayor potencial.",
      action: "Breece Hall (+4% Probabilidad de Ganar)"
    },
    roster_needs: {
      title: "⚠️ ANÁLISIS DE NECESIDADES URGENTES DE PLANTILLA",
      alert: "🚨 HUECOS DE TITULARES: POSICIÓN DE RB2 Y FLEX",
      analysis: "Estado Actual: Tu alineación titular tiene cubierto el volumen de pases. Asegurar un RB2 de alto volumen en tus siguientes turnos evitará una caída proyectada de -4.8 Pts/semana.",
      action: "Cubrir RB2 / FLEX Imediatamente"
    }
  },
  pt: {
    target_pos: {
      title: "🎯 RECOMENDAÇÃO DE ALVO: EQUILÍBRIO POSICIONAL ÓTIMO",
      alert: "⚠️ ALERTA DE QUEDA DE NÍVEL: RBs e WRs Nível S estão saindo rapidamente!",
      analysis: "Com base no elenco atual, garantir um RB2 de alto volume antes do fim da Rodada 3 é sua prioridade máxima. Busque Bijan Robinson, Saquon Barkley ou Breece Hall para garantir um piso semanal dominante.",
      action: "Buscar Valor em RB / WR"
    },
    best_rb: {
      title: "🏃 MELHORES JOGADORES DISPONÍVEIS E RADAR DE NÍVEIS",
      alert: "🔥 PRINCIPAIS ALVOS: Running Backs Nível S com Volume Garantido",
      analysis: "1. Bijan Robinson (RB - ATL) — 88% de Volume na Zona Vermelha, Piso Nível S\n2. Saquon Barkley (RB - PHI) — 84% de Toques, Pick Top 3\n3. Breece Hall (RB - NYJ) — +2 Picks de Roubo de Valor",
      action: "Escolher Melhor RB Disponível"
    },
    team_compare: {
      title: "📊 COMPARAÇÃO E CLASSIFICAÇÃO DE TIMES DA LIGA",
      alert: "🏆 SEU TIME ESTÁ EM #2 DE 12 TIMES NA LIGA (NOTA 84.2/100)",
      analysis: "Seu time lidera a liga em Piso Semanal Projetado (114.2 Pts). Você tem uma vantagem de +24.8 Pts sobre o rival 'Gridiron Kings'. Garantir um RB2 de elite colocará você em #1 geral.",
      action: "Manter Estratégia de Piso Alto"
    },
    upside: {
      title: "⚡ COMPARAÇÃO DE POTENCIAL (Breece Hall vs. Bijan Robinson)",
      alert: "🔥 MAIOR TETO EXPLOSIVO: Breece Hall (+1.4 Pts de Vantagem no Teto)",
      analysis: "Breece Hall tem um teto de 28.2 Pts pelas recepções no NYJ. Bijan Robinson tem maior estabilidade no piso (15.8 Pts). Recomendação IA: Escolha Breece Hall para maior potencial.",
      action: "Breece Hall (+4% Chance de Vitória)"
    },
    roster_needs: {
      title: "⚠️ ANÁLISE DE NECESSIDADES URGENTES DO TIME",
      alert: "🚨 MAIOR LACUNA: RB2 (CRÍTICA) E FLEX (SECUNDÁRIA)",
      analysis: "Status Atual: Sua escalação titular tem boa cobertura de passes. Garantir um RB2 de alto volume nas próximas escolhas evita uma queda de -4.8 Pts/semana.",
      action: "Cobrir RB2 / FLEX Imediatamente"
    }
  }
};

const LABELS_MULTI = {
  en: {
    badge: "LIVE DRAFT EXPERT ASSISTANT",
    desc: "Real-time roster access, tier-drop alerts, best available players, and league comparison engine.",
    clockPick: "Current On-Clock Pick",
    boardTitle: "BEST AVAILABLE PLAYERS BOARD",
    boardDesc: "Ranked by SuperMacho AI Value Steal Rating & Projections",
    fitNeed: "FIT NEED",
    draftTarget: "Draft Target",
    needsTitle: "ROSTER NEEDS & STARTER GAPS",
    compareTitle: "LEAGUE TEAM COMPARISON"
  },
  es: {
    badge: "ASISTENTE EXPERTO EN DRAFT EN VIVO",
    desc: "Acceso en tiempo real a plantillas, alertas de caídas de nivel y motor de comparación de ligas.",
    clockPick: "Turno Actual en el Reloj",
    boardTitle: "TABLERO DE MEJORES JUGADORES DISPONIBLES",
    boardDesc: "Clasificado por el Rating de Valor de la IA de SuperMacho y Proyecciones",
    fitNeed: "CUBRE HUECO",
    draftTarget: "Fijar Target",
    needsTitle: "NECESIDADES Y HUECOS DE TITULARES",
    compareTitle: "COMPARACIÓN DE EQUIPOS EN LA LIGA"
  },
  pt: {
    badge: "ASSISTENTE DE DRAFT AO VIVO",
    desc: "Acesso em tempo real a elencos, alertas de quedas de nível e motor de comparação de ligas.",
    clockPick: "Escolha Atual no Relógio",
    boardTitle: "TABULEIRO DE MELHORES JOGADORES DISPONÍVEIS",
    boardDesc: "Classificado pelo Rating de Valor da IA do SuperMacho e Projeções",
    fitNeed: "PREENCHE LACUNA",
    draftTarget: "Fixar Alvo",
    needsTitle: "NECESSIDADES E LACUNAS DE TITULARES",
    compareTitle: "COMPARAÇÃO DE TIMES DA LIGA"
  }
};

const defaultLabels = {
  badge: "LIVE DRAFT EXPERT ASSISTANT",
  desc: "Real-time roster access, tier-drop alerts, best available players, and league comparison engine.",
  clockPick: "Current On-Clock Pick",
  boardTitle: "BEST AVAILABLE PLAYERS BOARD",
  boardDesc: "Ranked by SuperMacho AI Value Steal Rating & Projections",
  fitNeed: "FIT NEED",
  draftTarget: "Draft Target",
  needsTitle: "ROSTER NEEDS & STARTER GAPS",
  compareTitle: "LEAGUE TEAM COMPARISON"
};

const DRAFT_TUTORIAL_DATA = {
  es: {
    modalTitle: "📖 GUÍA Y TUTORIAL DRAFT DAY WAR ROOM",
    modalSub: "Aprende a dominar tu Draft de Fantasy Football con Inteligencia Artificial paso a paso.",
    tabs: {
      overview: "🚀 1. Visión General",
      stepByStep: "🎓 2. Paso a Paso",
      strategies: "💡 3. Estrategias Pro",
      faq: "❓ 4. Dúvidas y Glosario"
    },
    overview: {
      title: "¿Qué es la Sala de Estrategia del Draft?",
      desc: "La War Room es tu Co-Piloto de Inteligencia Artificial que analiza tu liga en tiempo real durante tu draft oficial (ESPN o Sleeper). La IA calcula caídas de nivel (Tier Drops), identifica robos de valor (Value Steals), mide el piso/techo de cada jugador y compara tu plantilla contra tus rivales.",
      f1Title: "1. Radar de Caídas de Nivel (Tier Drop Radar)",
      f1Desc: "Te alerta cuando solo quedan 1 o 2 jugadores estrella en una posición antes de que los puntos proyectados caigan drásticamente.",
      f2Title: "2. Matriz de Preguntas Tácticas IA",
      f2Desc: "Haz clic en las 5 preguntas rápidas para recomendaciones inmediatas sobre a quién elegir.",
      f3Title: "3. Tablero de Disponibles & Filtros Posicionales",
      f3Desc: "Filtra por QB, RB, WR o TE. Revisa el Rating de Robo de Valor, Piso Semanal y Techo Explosivo.",
      f4Title: "4. Registro de Picks ('Draftear Jugador')",
      f4Desc: "Presiona 'Draftear Jugador' al elegir en tu app oficial (ESPN/Sleeper) para actualizar tus necesidades automáticamente."
    },
    steps: [
      {
        num: "PASO 1",
        title: "Sincroniza o Revisa las Reglas de tu Liga",
        desc: "Asegúrate de seleccionar tu liga oficial (PPR, Half-PPR o Estándar). La IA ajusta las valoraciones según tu sistema de puntuación.",
        tip: "💡 Consejo: En ligas PPR, los Receptores (WR) y Corredores receptores tienen mayor valor."
      },
      {
        num: "PASO 2",
        title: "Consulta las 5 Preguntas Tácticas de la IA",
        desc: "Usa los botones superiores para preguntarle a la IA: '🎯 Target por Posición', '🏃 Mejores RBs Disponibles', '📊 Comparación de Equipos', '⚡ Comparación de Techo Explosivo' o '⚠️ Análisis de Necesidades'.",
        tip: "💡 Consejo: Consulta a la IA antes de cada pick para no dejar pasar jugadores élite."
      },
      {
        num: "PASO 3",
        title: "Filtra el Tablero y Revisa Piso vs Techo",
        desc: "Filtra por la posición requerida. Compara el 'Piso' (puntos seguros en semana mala) y el 'Techo' (potencial máximo explosivo).",
        tip: "💡 Consejo: En primeras rondas busca Piso Seguro. En rondas medias/tardías busca Techo Explosivo."
      },
      {
        num: "PASO 4",
        title: "Confirma tu Selección ('Draftear Jugador')",
        desc: "Cuando selecciones un jugador en ESPN o Sleeper, presiona 'Draftear Jugador' en SuperMacho para moverlo a tu equipo y recalcular tus siguientes elecciones.",
        tip: "💡 Consejo: Mantén SuperMacho abierto al lado de tu app de ESPN/Sleeper."
      }
    ],
    strategies: {
      s1Title: "🏈 Estrategia 'Hero RB' (Un Corredor Élite Primero)",
      s1Desc: "Asegura un Corredor de Nivel S en la Ronda 1 o 2 (ej. Bijan Robinson o Saquon Barkley). Luego llena tus posiciones de Receptores (WR) en las siguientes rondas.",
      s2Title: "⚡ Estrategia 'Zero RB' (Dominio de Receptores)",
      s2Desc: "Selecciona Receptores élite (WR1 y WR2) en las primeras rondas para monopolizar los pases. Luego draftea RBs de alto volumen en rondas 4-7.",
      s3Title: "🎯 Selección de QB y TE",
      s3Desc: "No draftees un QB o TE temprano a menos que caiga significativamente de su ADP. Los QBs móviles (como Josh Allen o Lamar Jackson) aportan puntos decisivos por tierra."
    },
    faq: [
      {
        q: "¿Tengo que hacer los picks también en ESPN o Sleeper?",
        a: "¡Sí! ESPN o Sleeper es la plataforma oficial donde juegas. SuperMacho es tu Entrenador de IA al oído diciéndote la mejor elección en tiempo real."
      },
      {
        q: "¿Qué significan los términos ADP, Floor, Ceiling y Value Steal?",
        a: "• ADP: Posición Promedio de Draft.\n• Floor (Piso): Puntos mínimos seguros.\n• Ceiling (Techo): Máximo potencial explosivo.\n• Value Steal: Jugador élite disponible más tarde de su turno habitual."
      },
      {
        q: "¿Consume créditos usar la War Room?",
        a: "Las acciones completas de la War Room deducen los créditos de IA configurados (predeterminado: 5 créditos) para calcular datos en tiempo real."
      }
    ]
  },
  en: {
    modalTitle: "📖 DRAFT DAY WAR ROOM GUIDE & TUTORIAL",
    modalSub: "Learn how to leverage SuperMacho AI to dominate your Fantasy Football draft step-by-step.",
    tabs: {
      overview: "🚀 1. Overview",
      stepByStep: "🎓 2. Step-by-Step",
      strategies: "💡 3. Pro Strategies",
      faq: "❓ 4. FAQs & Glossary"
    },
    overview: {
      title: "What is the Draft Day Strategy War Room?",
      desc: "The War Room is your AI Co-Pilot analyzing your live draft round-by-round (ESPN or Sleeper). The AI monitors tier drops, identifies value steals, measures player floor/ceiling variance, and compares your roster with rival managers.",
      f1Title: "1. Tier Drop Radar Alert System",
      f1Desc: "Alerts you when only 1 or 2 S-Tier players remain in a position before projected points drop off a cliff.",
      f2Title: "2. Tactical AI Coach Question Matrix",
      f2Desc: "Click any of the 5 quick tactical buttons for instant pick recommendations.",
      f3Title: "3. Best Available Players Board & Filters",
      f3Desc: "Filter by QB, RB, WR, or TE. Review Value Steal ratings, Weekly Floor, and Explosive Ceiling.",
      f4Title: "4. Draft Pick Lock & Roster Tracker",
      f4Desc: "Click 'Draft Player' when making your selection in ESPN/Sleeper so SuperMacho updates your needs in real time."
    },
    steps: [
      {
        num: "STEP 1",
        title: "Sync or Review Your League Rules",
        desc: "Ensure your official league is selected (PPR, Half-PPR, or Standard). The AI automatically adjusts values for your scoring rules.",
        tip: "💡 Tip: PPR leagues give extra value to Receivers (WR) and pass-catching Running Backs."
      },
      {
        num: "STEP 2",
        title: "Consult the 5 Tactical AI Questions",
        desc: "Ask the AI: '🎯 Target Position', '🏃 Best Available RBs', '📊 Team Comparison', '⚡ Upside Ceiling Comparison', or '⚠️ Roster Needs'.",
        tip: "💡 Tip: Check the AI before every pick so you never miss a falling star."
      },
      {
        num: "STEP 3",
        title: "Filter the Board & Review Floor vs Ceiling",
        desc: "Filter by required position. Review 'Floor' (safe baseline) and 'Ceiling' (maximum upside potential).",
        tip: "💡 Tip: In early rounds, prioritize High Floor. In middle/late rounds, chase High Ceiling."
      },
      {
        num: "STEP 4",
        title: "Lock Your Selection ('Draft Player')",
        desc: "When selecting a player in ESPN or Sleeper, click 'Draft Player' in SuperMacho to move them to your roster and recalculate needs.",
        tip: "💡 Tip: Keep SuperMacho open right alongside your official draft app."
      }
    ],
    strategies: {
      s1Title: "🏈 Hero RB Strategy (One Anchor RB First)",
      s1Desc: "Draft an S-Tier Running Back in Round 1 or 2 (e.g. Bijan Robinson or Saquon Barkley). Then stack top Wide Receivers (WR) in subsequent rounds.",
      s2Title: "⚡ Zero RB Strategy (Receiver Dominance)",
      s2Desc: "Select elite Receivers (WR1 and WR2) in early rounds. Draft high-volume RBs in rounds 4-7.",
      s3Title: "🎯 When to Draft QB and TE",
      s3Desc: "Avoid reaching for a QB or TE early unless they fall significantly past their ADP. Dual-threat QBs (like Josh Allen or Lamar Jackson) add massive rushing floors."
    },
    faq: [
      {
        q: "Do I still make my picks in my ESPN or Sleeper app?",
        a: "Yes! ESPN or Sleeper is your official league app. SuperMacho is your AI Head Coach in your ear telling you exact pick recommendations in real time."
      },
      {
        q: "What do ADP, Floor, Ceiling, and Value Steal mean?",
        a: "• ADP: Average Draft Position.\n• Floor: Minimum safe projected points.\n• Ceiling: Maximum potential points.\n• Value Steal: Elite player dropping past their consensus pick."
      },
      {
        q: "Does using the War Room cost credits?",
        a: "Full War Room actions deduct configurable AI credits (default: 5 credits) to calculate real-time tier drops and projections."
      }
    ]
  },
  pt: {
    modalTitle: "📖 GUIA E TUTORIAL DRAFT DAY WAR ROOM",
    modalSub: "Aprenda a dominar o seu draft de Fantasy Football com Inteligência Artificial passo a passo.",
    tabs: {
      overview: "🚀 1. Visão Geral",
      stepByStep: "🎓 2. Passo a Passo",
      strategies: "💡 3. Estratégias Pro",
      faq: "❓ 4. Dúvidas e Glossário"
    },
    overview: {
      title: "O que é a Sala de Estratégia do Draft?",
      desc: "A War Room é seu Co-Piloto de IA que analisa seu draft oficial (ESPN ou Sleeper) em tempo real. A IA calcula quedas de nível (Tier Drops), identifica achados de valor (Value Steals), mede piso/teto dos jogadores e compara seu time com os rivais.",
      f1Title: "1. Radar de Alerta de Queda de Nível",
      f1Desc: "Alerta quando restam apenas 1 ou 2 jogadores estrela em uma posição antes que a pontuação caia drasticamente.",
      f2Title: "2. Matriz de Perguntas Táticas de IA",
      f2Desc: "Clique nas 5 perguntas rápidas para receber recomendações instantâneas de quem escolher.",
      f3Title: "3. Tabuleiro de Melhores Disponíveis e Filtros",
      f3Desc: "Filtre por QB, RB, WR ou TE. Veja a classificação de Valor, Piso Semanal e Teto Explosivo.",
      f4Title: "4. Registro de Picks ('Selecionar Jogador')",
      f4Desc: "Clique em 'Selecionar Jogador' ao escolher no app oficial para atualizar suas necessidades automaticamente."
    },
    steps: [
      {
        num: "PASSO 1",
        title: "Sincronize ou Revise as Regras da sua Liga",
        desc: "Verifique se sua liga oficial está selecionada (PPR, Half-PPR ou Standard). A IA ajusta automaticamente os valores para suas regras.",
        tip: "💡 Dica: Ligas PPR valorizam mais Recebedores (WR) e Running Backs que recebem passes."
      },
      {
        num: "PASSO 2",
        title: "Consulte as 5 Perguntas Táticas da IA",
        desc: "Pergunte à IA: '🎯 Target por Posição', '🏃 Melhores RBs Disponíveis', '📊 Comparação de Times', etc.",
        tip: "💡 Dica: Consulte a IA antes de cada escolha para não perder oportunidades."
      },
      {
        num: "PASSO 3",
        title: "Filtre o Tabuleiro e Analise Piso vs Teto",
        desc: "Filtre pela posição necessária. Analise o 'Piso' (pontos seguros) e o 'Teto' (potencial máximo).",
        tip: "💡 Dica: Nas primeiras rodadas priorize Piso Alto. Nas rodadas intermediárias/finais, busque Teto Explosivo."
      },
      {
        num: "PASSO 4",
        title: "Confirme sua Escolha ('Selecionar Jogador')",
        desc: "Ao escolher no ESPN ou Sleeper, clique em 'Selecionar Jogador' no SuperMacho para mover para seu time e recalcular necessidades.",
        tip: "💡 Dica: Mantenha o SuperMacho aberto ao lado do seu aplicativo oficial de draft."
      }
    ],
    strategies: {
      s1Title: "🏈 Estratégia 'Hero RB' (Um RB de Elite Primeiro)",
      s1Desc: "Garanta um Running Back Nível S na Rodada 1 ou 2 (ex: Bijan Robinson ou Saquon Barkley). Depois acumule principais Recebedores (WR).",
      s2Title: "⚡ Estratégia 'Zero RB' (Domínio de Recebedores)",
      s2Desc: "Escolha Recebedores de elite nas primeiras rodadas. Escolha RBs de alto volume nas rodadas 4-7.",
      s3Title: "🎯 Quando Escolher QB e TE",
      s3Desc: "Evite escolher QB ou TE muito cedo, a menos que caiam bastante em relação ao ADP. QBs móveis (como Josh Allen ou Lamar Jackson) garantem pontos extras correndo."
    },
    faq: [
      {
        q: "Ainda preciso fazer as escolhas no app da ESPN ou Sleeper?",
        a: "Sim! ESPN ou Sleeper é onde você joga oficialmente. O SuperMacho é seu Treinador de IA dizendo a melhor escolha em tempo real."
      },
      {
        q: "O que significam ADP, Piso, Teto e Value Steal?",
        a: "• ADP: Posição Média de Draft.\n• Piso (Floor): Pontos mínimos seguros.\n• Teto (Ceiling): Potencial máximo.\n• Value Steal: Jogador de elite caindo além da escolha habitual."
      },
      {
        q: "Usar a War Room consome créditos?",
        a: "Sim, ações da War Room deduzem créditos de IA configurados (padrão: 5 créditos) para calcular dados em tempo real."
      }
    ]
  }
};

const DraftWarRoomTutorialModal = ({ isOpen, onClose, lang = 'es' }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const data = DRAFT_TUTORIAL_DATA[lang] || DRAFT_TUTORIAL_DATA.es || DRAFT_TUTORIAL_DATA.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                SUPERMACHO ACADEMY
              </span>
              <span className="text-xs text-amber-400 font-bold">• 🇲🇽 ES | 🇺🇸 EN | 🇧🇷 PT</span>
            </div>
            <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider">
              {data.modalTitle}
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              {data.modalSub}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
          {Object.entries(data.tabs).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                activeTab === key
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-2">
                <h3 className="font-bebas text-2xl text-amber-400 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>{data.overview.title}</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {data.overview.desc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>{data.overview.f1Title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{data.overview.f1Desc}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{data.overview.f2Title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{data.overview.f2Desc}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>{data.overview.f3Title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{data.overview.f3Desc}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
                    <Target className="w-4 h-4 text-amber-400" />
                    <span>{data.overview.f4Title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{data.overview.f4Desc}</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. STEP-BY-STEP TAB */}
          {activeTab === 'stepByStep' && (
            <div className="space-y-4">
              {data.steps.map((step, idx) => (
                <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      {step.num}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">ETAPA {idx + 1} DE 4</span>
                  </div>
                  <h4 className="font-bebas text-2xl text-white tracking-wider">{step.title}</h4>
                  <p className="text-xs text-slate-300">{step.desc}</p>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-amber-500/20 text-amber-300 text-xs font-bold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>{step.tip}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. STRATEGIES TAB */}
          {activeTab === 'strategies' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-2">
                <h4 className="font-bebas text-2xl text-amber-400 tracking-wider">{data.strategies.s1Title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{data.strategies.s1Desc}</p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bebas text-2xl text-cyan-400 tracking-wider">{data.strategies.s2Title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{data.strategies.s2Desc}</p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bebas text-2xl text-emerald-400 tracking-wider">{data.strategies.s3Title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{data.strategies.s3Desc}</p>
              </div>
            </div>
          )}

          {/* 4. FAQ & GLOSSARY TAB */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {data.faq.map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed pl-6">{item.a}</p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold">SuperMacho AI Draft Coach • Season 2026</span>
          <button
            onClick={onClose}
            className="btn-gold px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase shadow-lg"
          >
            ¡Entendido, Ir a la War Room!
          </button>
        </div>

      </div>
    </div>
  );
};

class DraftWarRoomBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("DraftWarRoom caught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center space-y-4 bg-slate-900 rounded-3xl border border-amber-500/30">
          <h2 className="font-bebas text-3xl text-amber-400">DRAFT WAR ROOM REFRESHING...</h2>
          <p className="text-xs text-slate-300">Click below to re-initialize your live draft strategy board.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="btn-gold px-6 py-2 rounded-xl text-xs font-bold uppercase"
          >
            Reload Board
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const DraftWarRoomInner = () => {
  const appState = useApp() || {};
  const currentLeague = appState.currentLeague || (appState.leagues && appState.leagues[0]) || { scoring: 'PPR' };
  const lang = appState.lang || 'en';
  const tRaw = appState.t;

  const t = (key) => {
    try {
      if (typeof tRaw === 'function') {
        const res = tRaw(key);
        if (typeof res === 'string') return res;
      }
      if (tRaw && typeof tRaw === 'object' && typeof tRaw[key] === 'string') {
        return tRaw[key];
      }
    } catch (e) {}
    return key;
  };
  
  const [activeQuestion, setActiveQuestion] = useState('target_pos');
  const [filterPos, setFilterPos] = useState('ALL');
  const [liveDraftPool, setLiveDraftPool] = useState(null);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [lockedTargets, setLockedTargets] = useState(() => {
    try {
      const saved = localStorage.getItem('sm_locked_draft_targets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [queueNotice, setQueueNotice] = useState(null);

  const safeLockedTargets = Array.isArray(lockedTargets) ? lockedTargets : [];

  const toggleTargetLock = (player) => {
    if (!player || !player.id) return;
    setLockedTargets(prev => {
      const currentArr = Array.isArray(prev) ? prev : [];
      const exists = currentArr.some(p => p && p.id === player.id);
      let updated;
      if (exists) {
        updated = currentArr.filter(p => p && p.id !== player.id);
        setQueueNotice(`❌ ${player.name} removed from your priority draft queue.`);
      } else {
        updated = [...currentArr, player];
        setQueueNotice(`🎯 ${player.name} locked into your Priority Draft Queue!`);
      }
      try {
        localStorage.setItem('sm_locked_draft_targets', JSON.stringify(updated));
      } catch (e) {}
      setTimeout(() => setQueueNotice(null), 4000);
      return updated;
    });
  };

  const removeTargetLock = (playerId) => {
    if (!playerId) return;
    setLockedTargets(prev => {
      const currentArr = Array.isArray(prev) ? prev : [];
      const updated = currentArr.filter(p => p && p.id !== playerId);
      try {
        localStorage.setItem('sm_locked_draft_targets', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  useEffect(() => {
    try {
      fetch('/api/nfl-sync')
        .then(res => res.json())
        .then(data => {
          if (data && data.draftPlayers && Array.isArray(data.draftPlayers) && data.draftPlayers.length > 0) {
            setLiveDraftPool(data.draftPlayers);
          }
        })
        .catch(() => {});
    } catch (e) {}
  }, []);

  const safeAdviceMap = (AI_ADVICE_MAP_MULTI && (AI_ADVICE_MAP_MULTI[lang] || AI_ADVICE_MAP_MULTI.en)) || AI_ADVICE_MAP_MULTI.en;
  const currentAdvice = (safeAdviceMap && (safeAdviceMap[activeQuestion] || safeAdviceMap.target_pos)) || safeAdviceMap.target_pos;

  const labels = (LABELS_MULTI && (LABELS_MULTI[lang] || LABELS_MULTI.en)) || defaultLabels;

  const rawAvailable = (Array.isArray(liveDraftPool) && liveDraftPool.length > 0) ? liveDraftPool : defaultAvailablePlayers;
  const availablePlayers = Array.isArray(rawAvailable) ? rawAvailable : defaultAvailablePlayers;
  const filteredPlayers = (filterPos === 'ALL' 
    ? availablePlayers 
    : availablePlayers.filter(p => p && p.pos === filterPos)) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Toast Notification Banner */}
      {queueNotice && (
        <div className="fixed top-24 right-5 z-50 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 px-6 py-3.5 rounded-2xl shadow-2xl font-extrabold flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-slate-950" />
          <span>{queueNotice}</span>
        </div>
      )}
      
      {/* HEADER & DRAFT STATUS BAR */}
      <div className="glass-panel-gold p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-extrabold text-xs px-3 py-0.5 rounded-full uppercase">
              {labels.badge}
            </span>
            <span className="text-xs text-amber-400 font-bold">• SCORING: {currentLeague?.scoring || 'PPR'}</span>
          </div>
          <h1 className="font-bebas text-4xl sm:text-5xl text-white tracking-wider">
            {t('draftWarRoomTitle')}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm font-medium">
            {labels.desc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => setShowTutorialModal(true)}
            className="btn-gold px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
            title="Abrir Guía y Tutorial Interactivo"
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {lang === 'es' ? '📖 ¿Cómo Usar la War Room? (Guía & Tutorial)' : lang === 'pt' ? '📖 Como Usar a War Room? (Guia & Tutorial)' : '📖 How to Use the War Room? (Guide & Tutorial)'}
            </span>
          </button>

          <div className="flex items-center gap-3 bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">{labels.clockPick}</div>
              <div className="font-bebas text-2xl text-amber-400">ROUND 2 • PICK #14</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 5 ONE-CLICK AI COACH STRATEGIC QUESTIONS */}
      <div className="space-y-3">
        <div className="text-xs font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>ASK SUPERMACHO AI DRAFT COACH:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <button
            onClick={() => setActiveQuestion('target_pos')}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
              activeQuestion === 'target_pos'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase">
              <Target className="w-4 h-4 flex-shrink-0" />
              <span>{t('targetPosBtn')}</span>
            </div>
            <p className="text-[10px] opacity-80 font-medium">{t('targetPosDesc')}</p>
          </button>

          <button
            onClick={() => setActiveQuestion('best_rb')}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
              activeQuestion === 'best_rb'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase">
              <Flame className="w-4 h-4 flex-shrink-0" />
              <span>{t('bestRbBtn')}</span>
            </div>
            <p className="text-[10px] opacity-80 font-medium">{t('bestRbDesc')}</p>
          </button>

          <button
            onClick={() => setActiveQuestion('team_compare')}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
              activeQuestion === 'team_compare'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase">
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              <span>{t('teamCompareBtn')}</span>
            </div>
            <p className="text-[10px] opacity-80 font-medium">{t('teamCompareDesc')}</p>
          </button>

          <button
            onClick={() => setActiveQuestion('upside')}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
              activeQuestion === 'upside'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase">
              <Scale className="w-4 h-4 flex-shrink-0" />
              <span>{t('upsideBtn')}</span>
            </div>
            <p className="text-[10px] opacity-80 font-medium">{t('upsideDesc')}</p>
          </button>

          <button
            onClick={() => setActiveQuestion('roster_needs')}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
              activeQuestion === 'roster_needs'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{t('rosterNeedsBtn')}</span>
            </div>
            <p className="text-[10px] opacity-80 font-medium">{t('rosterNeedsDesc')}</p>
          </button>

        </div>
      </div>

      {/* DYNAMIC AI COACH RESPONSE CARD */}
      <div className="bg-slate-950 p-6 rounded-3xl border-2 border-amber-500/40 space-y-4 shadow-2xl shadow-amber-500/10 animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <h3 className="font-bebas text-2xl text-white tracking-wider">
              {currentAdvice?.title || ''}
            </h3>
          </div>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold px-3 py-1 rounded-xl">
            {currentAdvice?.action || ''}
          </span>
        </div>

        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 font-bold">
          {currentAdvice?.alert || ''}
        </div>

        <p className="text-xs text-slate-200 leading-relaxed font-medium whitespace-pre-line">
          {currentAdvice?.analysis || ''}
        </p>
      </div>

      {/* METRICS & GLOSSARY GUIDE EXPANDABLE ACCORDION */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div 
          onClick={() => setShowGlossary(!showGlossary)}
          className="flex items-center justify-between cursor-pointer text-xs font-extrabold text-amber-400 uppercase tracking-widest"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>{t('glossaryTitle')}</span>
          </div>
          <span className="text-slate-400 text-xs">{showGlossary ? '▲' : '▼'}</span>
        </div>

        {showGlossary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 animate-fade-in border-t border-slate-800/80">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-bold">{t('adpTitle')}</strong>
              <p className="text-[11px] text-slate-400 leading-snug">{t('adpDesc')}</p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-bold">{t('projPtsTitle')}</strong>
              <p className="text-[11px] text-slate-400 leading-snug">{t('projPtsDesc')}</p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-bold">{t('floorCeilingTitle')}</strong>
              <p className="text-[11px] text-slate-400 leading-snug">{t('floorCeilingDesc')}</p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-bold">{t('valueStealTitle')}</strong>
              <p className="text-[11px] text-slate-400 leading-snug">{t('valueStealDesc')}</p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-bold">{t('draftTargetTitle')}</strong>
              <p className="text-[11px] text-slate-400 leading-snug">{t('draftTargetDesc')}</p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <strong className="text-amber-400 block font-bold">{t('heroRbTitle')}</strong>
              <p className="text-[11px] text-slate-400 leading-snug">{t('heroRbDesc')}</p>
            </div>

            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1 col-span-1 md:col-span-2 lg:col-span-3">
              <strong className="text-amber-400 block font-bold">{t('konamiCodeTitle')}</strong>
              <p className="text-[11px] text-slate-400 leading-snug">{t('konamiCodeDesc')}</p>
            </div>
          </div>
        )}
      </div>

      {/* LOCKED DRAFT TARGET QUEUE PANEL */}
      {safeLockedTargets.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl space-y-4 border-2 border-emerald-500/40 bg-emerald-950/20 shadow-xl shadow-emerald-500/10 animate-fade-in">
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h3 className="font-bebas text-2xl text-white tracking-wider uppercase">
                {lang === 'es' ? '🎯 TU LISTA DE DRAFT PRIORITARIA (JUGADORES FIJADOS)' : lang === 'pt' ? '🎯 SUA FILA DE DRAFT PRIORITÁRIA (JOGADORES FIXADOS)' : '🎯 YOUR LOCKED PRIORITY DRAFT QUEUE'}
              </h3>
            </div>
            <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase">
              {safeLockedTargets.length} {safeLockedTargets.length === 1 ? 'Target Locked' : 'Targets Locked'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {safeLockedTargets.map(player => (
              <div key={player.id} className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bebas text-lg font-bold">
                    {player.pos}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <span>{player.name}</span>
                      <span className="text-[11px] text-slate-400">({player.team})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-2">
                      <span>ADP: <strong className="text-slate-200">{player.adp}</strong></span>
                      <span>Proj: <strong className="text-emerald-400">{player.projPts} Pts</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeTargetLock(player.id)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors border border-slate-800"
                  title="Remove from Draft Queue"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BEST AVAILABLE PLAYERS BOARD */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bebas text-2xl text-white tracking-wider">{labels.boardTitle}</h3>
            <p className="text-xs text-slate-400 font-medium">{labels.boardDesc}</p>
          </div>

          {/* Position Filters */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {['ALL', 'RB', 'WR', 'QB', 'TE'].map(pos => (
              <button
                key={pos}
                onClick={() => setFilterPos(pos)}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition-colors ${
                  filterPos === pos ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Players List Table */}
        <div className="space-y-2.5">
          {filteredPlayers.map((player) => (
            <div 
              key={player.id}
              className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bebas text-lg font-bold ${
                  player.pos === 'RB' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  player.pos === 'WR' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                  player.pos === 'QB' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                  'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                }`}>
                  {player.pos}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white flex items-center gap-2">
                    <span>{player.name}</span>
                    <span className="text-[11px] text-slate-400">({player.team})</span>
                    {player.needMatch && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded">{labels.fitNeed}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-extrabold">Bye: {player.bye || 5}</span>
                    <span>ADP: <strong className="text-slate-200">{player.adp}</strong></span>
                    <span>Proj Pts: <strong className="text-amber-400">{player.projPts}</strong></span>
                    <span>Floor/Ceiling: <strong className="text-slate-200">{player.floor} - {player.ceiling} Pts</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-between sm:justify-end">
                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
                  {player.valueSteal}
                </span>
                <button 
                  onClick={() => toggleTargetLock(player)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-md uppercase whitespace-nowrap transition-all ${
                    lockedTargets.some(p => p.id === player.id)
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20 font-black'
                      : 'btn-gold'
                  }`}
                >
                  {lockedTargets.some(p => p.id === player.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>{lang === 'es' ? '🔒 EN TU LISTA' : lang === 'pt' ? '🔒 NA SUA FILA' : '🔒 LOCKED IN QUEUE'}</span>
                    </>
                  ) : (
                    <>
                      <span>{labels.draftTarget}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-COLUMN GRID: ROSTER NEEDS RADAR & LEAGUE TEAM COMPARISON */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column A: Roster Needs Radar */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bebas text-2xl text-white tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>{labels.needsTitle}</span>
            </h3>
            <span className="text-xs font-bold text-amber-400">3/7 Starters Filled</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">QB1: Lamar Jackson (BAL)</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase">FILLED (ELITE)</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">WR1: CeeDee Lamb (DAL)</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase">FILLED (ELITE)</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/40 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-bold text-amber-400">RB1: Urgent Priority Target Next</span>
              </div>
              <span className="text-[10px] font-extrabold text-slate-950 bg-amber-400 px-2 py-0.5 rounded uppercase">CRITICAL GAP</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/40 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-bold text-amber-400">RB2: Urgent Priority Target Next</span>
              </div>
              <span className="text-[10px] font-extrabold text-slate-950 bg-amber-400 px-2 py-0.5 rounded uppercase">CRITICAL GAP</span>
            </div>
          </div>
        </div>

        {/* Column B: League Team Comparison Matrix */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bebas text-2xl text-white tracking-wider flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>{labels.compareTitle}</span>
            </h3>
            <span className="text-xs font-bold text-cyan-400">12 Teams Scored</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">1. Gridiron Kings</div>
                <div className="text-[10px] text-slate-400">2 RBs, 1 WR Drafted</div>
              </div>
              <div className="text-right">
                <div className="font-bebas text-lg text-emerald-400">86.5 Grade</div>
                <div className="text-[10px] text-slate-400">118.2 Proj Pts</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 p-3 rounded-xl border-2 border-amber-500/50 flex justify-between items-center">
              <div>
                <div className="font-extrabold text-amber-400 flex items-center gap-1.5">
                  <span>2. YOUR TEAM (SUPERMACHO AI)</span>
                  <span className="bg-amber-500 text-slate-950 text-[9px] px-1.5 rounded font-black">YOU</span>
                </div>
                <div className="text-[10px] text-slate-300 font-medium">1 QB, 2 WRs Drafted</div>
              </div>
              <div className="text-right">
                <div className="font-bebas text-xl text-amber-400">84.2 Grade</div>
                <div className="text-[10px] font-bold text-emerald-400">114.2 Proj Pts</div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">3. Blitz Dynasty</div>
                <div className="text-[10px] text-slate-400">1 QB, 1 RB, 1 TE</div>
              </div>
              <div className="text-right">
                <div className="font-bebas text-lg text-slate-300">81.0 Grade</div>
                <div className="text-[10px] text-slate-400">109.5 Proj Pts</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* DRAFT WAR ROOM MULTILINGUAL TUTORIAL MODAL */}
      <DraftWarRoomTutorialModal
        isOpen={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
        lang={lang}
      />

    </div>
  );
};

export const DraftWarRoom = (props) => {
  return <DraftWarRoomInner {...props} />;
};
