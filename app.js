// FIFA World Cup 2026 Application Logic Controller
const WORLD_CUP_DATA = window.WORLD_CUP_DATA;
const TEAM_FLAGS = window.TEAM_FLAGS;

// LOCAL STORAGE MIGRATION (English -> Indonesian)
const TEAM_TRANSLATIONS = {
  "Mexico": "Meksiko",
  "South Africa": "Afrika Selatan",
  "South Korea": "Korea Selatan",
  "Czechia": "Ceko",
  "Czech Republic": "Ceko",
  "Canada": "Kanada",
  "Democratic Republic of the Congo": "RD Kongo",
  "Bosnia and Herzegovina": "Bosnia dan Herzegovina",
  "Bosnia-Herzegovina": "Bosnia dan Herzegovina",
  "Qatar": "Qatar",
  "Switzerland": "Swiss",
  "Brazil": "Brasil",
  "Morocco": "Maroko",
  "Haiti": "Haiti",
  "Scotland": "Skotlandia",
  "United States": "Amerika Serikat",
  "Paraguay": "Paraguay",
  "Australia": "Australia",
  "Turkey": "Turki",
  "Türkiye": "Turki",
  "Turkiye": "Turki",
  "Germany": "Jerman",
  "Curaçao": "Curaçao",
  "Curacao": "Curaçao",
  "Netherlands": "Belanda",
  "Japan": "Jepang",
  "Ivory Coast": "Pantai Gading",
  "Côte d'Ivoire": "Pantai Gading",
  "Cote d'Ivoire": "Pantai Gading",
  "Ecuador": "Ekuador",
  "Sweden": "Swedia",
  "Tunisia": "Tunisia",
  "Spain": "Spanyol",
  "Cape Verde": "Tanjung Verde",
  "Cape Verde Islands": "Tanjung Verde",
  "Belgium": "Belgia",
  "Egypt": "Mesir",
  "Saudi Arabia": "Arab Saudi",
  "Uruguay": "Uruguay",
  "Iran": "Iran",
  "New Zealand": "Selandia Baru",
  "France": "Prancis",
  "Senegal": "Senegal",
  "Iraq": "Irak",
  "Norway": "Norwegia",
  "Argentina": "Argentina",
  "Algeria": "Aljazair",
  "Austria": "Austria",
  "Jordan": "Yordania",
  "Portugal": "Portugal",
  "DR Congo": "RD Kongo",
  "Congo DR": "RD Kongo",
  "Congo, DR": "RD Kongo",
  "England": "Inggris",
  "Croatia": "Kroasia",
  "Ghana": "Ghana",
  "Panama": "Panama",
  "Uzbekistan": "Uzbekistan",
  "Colombia": "Kolombia"
};

const FIFA_RANKINGS = {
  "Argentina": 1,
  "Prancis": 2,
  "Spanyol": 3,
  "Inggris": 4,
  "Brasil": 5,
  "Belgia": 6,
  "Belanda": 7,
  "Portugal": 8,
  "Kolombia": 9,
  "Kroasia": 10,
  "Jerman": 11,
  "Maroko": 12,
  "Uruguay": 13,
  "Swiss": 14,
  "Amerika Serikat": 15,
  "Meksiko": 16,
  "Jepang": 17,
  "Senegal": 18,
  "Iran": 19,
  "Korea Selatan": 22,
  "Australia": 24,
  "Turki": 26,
  "Swedia": 28,
  "Ekuador": 30,
  "Tunisia": 35,
  "Aljazair": 40,
  "Arab Saudi": 56,
  "Irak": 58,
  "Ceko": 45,
  "Kanada": 40,
  "Skotlandia": 39,
  "RD Kongo": 60,
  "Bosnia dan Herzegovina": 74,
  "Qatar": 38,
  "Haiti": 86,
  "Paraguay": 55,
  "Curaçao": 88,
  "Pantai Gading": 33,
  "Tanjung Verde": 65,
  "Mesir": 36,
  "Selandia Baru": 95,
  "Norwegia": 47,
  "Austria": 25,
  "Yordania": 68,
  "Panama": 41,
  "Afrika Selatan": 60,
  "Ghana": 64,
  "Uzbekistan": 64
};

function getTeamRankLabel(teamName) {
  const rank = FIFA_RANKINGS[teamName];
  if (rank !== undefined) {
    return `<span class="team-rank-label" style="font-size: 0.65rem; color: var(--text-secondary); opacity: 0.75; font-weight: 500; margin-top: 1px;">FIFA #${rank}</span>`;
  }
  return '';
}

const POPULAR_TEAMS = new Set([
  "Brasil", "Maroko", "Jerman", "Belanda", "Jepang", 
  "Belgia", "Spanyol", "Uruguay", "Norwegia", "Senegal", 
  "Prancis", "Argentina", "Portugal", "Inggris", "Kroasia", "Kolombia"
]);

function isPopularTeam(team) {
  if (!team) return false;
  const clean = team.trim().toLowerCase();
  for (const t of POPULAR_TEAMS) {
    if (clean.includes(t.toLowerCase())) {
      return true;
    }
  }
  return false;
}

function compareMatchesPriority(matchA, matchB) {
  const rankA1 = FIFA_RANKINGS[matchA.team1] !== undefined ? FIFA_RANKINGS[matchA.team1] : 999;
  const rankA2 = FIFA_RANKINGS[matchA.team2] !== undefined ? FIFA_RANKINGS[matchA.team2] : 999;
  const avgRankA = (rankA1 + rankA2) / 2;
  const gapA = Math.abs(rankA1 - rankA2);
  const scoreA = avgRankA + 0.3 * gapA; // Smaller score is better. Penalty for wide rank gap.

  const rankB1 = FIFA_RANKINGS[matchB.team1] !== undefined ? FIFA_RANKINGS[matchB.team1] : 999;
  const rankB2 = FIFA_RANKINGS[matchB.team2] !== undefined ? FIFA_RANKINGS[matchB.team2] : 999;
  const avgRankB = (rankB1 + rankB2) / 2;
  const gapB = Math.abs(rankB1 - rankB2);
  const scoreB = avgRankB + 0.3 * gapB;

  // 1. Prioritize match with the lower score (lower average rank + smaller gap)
  if (scoreA !== scoreB) {
    return scoreA - scoreB;
  }

  // 2. Tiebreaker: Popularity count (number of popular teams: 2, 1, or 0)
  const popA = (isPopularTeam(matchA.team1) ? 1 : 0) + (isPopularTeam(matchA.team2) ? 1 : 0);
  const popB = (isPopularTeam(matchB.team1) ? 1 : 0) + (isPopularTeam(matchB.team2) ? 1 : 0);
  if (popB !== popA) {
    return popB - popA; // Descending order
  }

  // 3. Tiebreaker: Best individual FIFA rank
  const bestRankA = Math.min(rankA1, rankA2);
  const bestRankB = Math.min(rankB1, rankB2);
  return bestRankA - bestRankB; // Ascending order
}

function getMatchBadgeHtml(team1, team2) {
  if (!team1 || !team2) return '';

  // Exclude Norwegia vs Senegal matchup
  const name1 = team1.trim().toLowerCase();
  const name2 = team2.trim().toLowerCase();
  if ((name1.includes("norwegia") && name2.includes("senegal")) || 
      (name1.includes("senegal") && name2.includes("norwegia"))) {
    return '';
  }

  if (isPopularTeam(team1) && isPopularTeam(team2)) {
    return '<span class="match-badge badge-big-match">BIG MATCH</span>';
  }
  return '';
}


const STADIUM_MAP = {
  "1": { "name": "Estadio Azteca", "city": "Mexico City", "country": "Meksiko", "capacity": 83000 },
  "2": { "name": "Estadio Akron", "city": "Zapopan", "country": "Meksiko", "capacity": 48000 },
  "3": { "name": "Estadio BBVA", "city": "Monterrey", "country": "Meksiko", "capacity": 53500 },
  "4": { "name": "AT&T Stadium", "city": "Arlington", "country": "Amerika Serikat", "capacity": 94000 },
  "5": { "name": "NRG Stadium", "city": "Houston", "country": "Amerika Serikat", "capacity": 72000 },
  "6": { "name": "Arrowhead Stadium", "city": "Kansas City", "country": "Amerika Serikat", "capacity": 73000 },
  "7": { "name": "Mercedes-Benz Stadium", "city": "Atlanta", "country": "Amerika Serikat", "capacity": 75000 },
  "8": { "name": "Hard Rock Stadium", "city": "Miami", "country": "Amerika Serikat", "capacity": 65000 },
  "9": { "name": "Gillette Stadium", "city": "Foxborough", "country": "Amerika Serikat", "capacity": 65000 },
  "10": { "name": "Lincoln Financial Field", "city": "Philadelphia", "country": "Amerika Serikat", "capacity": 69000 },
  "11": { "name": "MetLife Stadium", "city": "East Rutherford", "country": "Amerika Serikat", "capacity": 82500 },
  "12": { "name": "BMO Field", "city": "Toronto", "country": "Kanada", "capacity": 45000 },
  "13": { "name": "BC Place", "city": "Vancouver", "country": "Kanada", "capacity": 54000 },
  "14": { "name": "Lumen Field", "city": "Seattle", "country": "Amerika Serikat", "capacity": 69000 },
  "15": { "name": "Levi's Stadium", "city": "Santa Clara", "country": "Amerika Serikat", "capacity": 71000 },
  "16": { "name": "SoFi Stadium", "city": "Inglewood", "country": "Amerika Serikat", "capacity": 70000 }
};

function parseScorers(scorersStr) {
  if (!scorersStr || scorersStr === 'null' || scorersStr === '""' || scorersStr === '[]') return '';
  let cleaned = scorersStr
    .replace(/[{}""\[\]]/g, '')
    .replace(/[“”]/g, '')
    .trim();
  if (!cleaned) return '';
  return cleaned.split(',')
    .map(s => {
      let item = s.trim().replace(/^['"]|['"]$/g, '');
      if (!item) return '';
      // 1. Bersihkan semua tanda petik tunggal dari angka terlebih dahulu
      item = item.replace(/(\d+)'/g, '$1');
      // 2. Format menit tambahan (misal 45+2 menjadi 45+2')
      item = item.replace(/(\d+)\+(\d+)/g, "$1+$2'");
      // 3. Format menit biasa (misal 90 menjadi 90')
      item = item.replace(/(?<!\+)\b(\d+)\b(?!\+)/g, "$1'");
      return item;
    })
    .filter(Boolean)
    .join('<br>');
}

function migrateLocalStorageToIndonesian() {
  // 1. Migrate Group Rankings
  const savedRankingsStr = localStorage.getItem('wc2026_group_rankings');
  if (savedRankingsStr) {
    try {
      const rankings = JSON.parse(savedRankingsStr);
      if (rankings && typeof rankings === 'object') {
        const migratedRankings = {};
        let changed = false;
        
        for (const [key, teams] of Object.entries(rankings)) {
          const newKey = key.replace("Group", "Grup");
          if (newKey !== key) changed = true;
          
          if (Array.isArray(teams)) {
            migratedRankings[newKey] = teams.map(team => {
              if (team && TEAM_TRANSLATIONS[team]) {
                changed = true;
                return TEAM_TRANSLATIONS[team];
              }
              return team;
            });
          } else {
            migratedRankings[newKey] = teams;
          }
        }
        
        if (changed) {
          localStorage.setItem('wc2026_group_rankings', JSON.stringify(migratedRankings));
        }
      }
    } catch (e) {
      console.error("Migration error for group rankings", e);
    }
  }

  // 2. Migrate Simulated Winners
  const savedWinnersStr = localStorage.getItem('wc2026_simulated_winners');
  if (savedWinnersStr) {
    try {
      const winners = JSON.parse(savedWinnersStr);
      if (winners && typeof winners === 'object') {
        let changed = false;
        
        for (const [matchId, team] of Object.entries(winners)) {
          if (team && TEAM_TRANSLATIONS[team]) {
            winners[matchId] = TEAM_TRANSLATIONS[team];
            changed = true;
          }
        }
        
        if (changed) {
          localStorage.setItem('wc2026_simulated_winners', JSON.stringify(winners));
        }
      }
    } catch (e) {
      console.error("Migration error for simulated winners", e);
    }
  }

  // 3. Migrate Selected 3rd Places
  const saved3rdStr = localStorage.getItem('wc2026_selected_3rd_places');
  if (saved3rdStr) {
    try {
      const selected3rd = JSON.parse(saved3rdStr);
      if (selected3rd && typeof selected3rd === 'object') {
        let changed = false;
        
        for (const [matchId, groupName] of Object.entries(selected3rd)) {
          if (groupName && typeof groupName === 'string') {
            const newGroupName = groupName.replace("Group", "Grup");
            if (newGroupName !== groupName) {
              selected3rd[matchId] = newGroupName;
              changed = true;
            }
          }
        }
        
        if (changed) {
          localStorage.setItem('wc2026_selected_3rd_places', JSON.stringify(selected3rd));
        }
      }
    } catch (e) {
      console.error("Migration error for selected 3rd places", e);
    }
  }
}

// Run migration immediately
migrateLocalStorageToIndonesian();

// STADIUM INFO & GROUP STAGE VENUE MAPPINGS
const GROUP_VENUES = {
  "Grup A": ["Estadio Azteca, Mexico City", "Estadio Akron, Zapopan"],
  "Grup B": ["BMO Field, Toronto", "BC Place, Vancouver"],
  "Grup C": ["SoFi Stadium, Inglewood", "Levi's Stadium, Santa Clara"],
  "Grup D": ["Lumen Field, Seattle", "NRG Stadium, Houston"],
  "Grup E": ["AT&T Stadium, Arlington", "Arrowhead Stadium, Kansas City"],
  "Grup F": ["Mercedes-Benz Stadium, Atlanta", "Gillette Stadium, Foxborough"],
  "Grup G": ["Hard Rock Stadium, Miami", "Lincoln Financial Field, Philadelphia"],
  "Grup H": ["MetLife Stadium, East Rutherford", "Estadio BBVA, Monterrey"],
  "Grup I": ["BC Place, Vancouver", "Lumen Field, Seattle"],
  "Grup J": ["Estadio Azteca, Mexico City", "Estadio Akron, Zapopan"],
  "Grup K": ["BMO Field, Toronto", "Gillette Stadium, Foxborough"],
  "Grup L": ["MetLife Stadium, East Rutherford", "Lincoln Financial Field, Philadelphia"]
};

function getMatchVenue(match) {
  const matchKey = match.match_id ? `ko_${match.match_id}` : `gs_${match.date}_${match.team1}_${match.team2}`;
  const scoreData = realScores[matchKey];
  if (scoreData && scoreData.stadium_id) {
    const stadium = STADIUM_MAP[scoreData.stadium_id];
    if (stadium) {
      return `${stadium.name}, ${stadium.city}`;
    }
  }
  if (match.venue) return match.venue;
  const venues = GROUP_VENUES[match.group];
  if (venues) {
    const hash = (match.team1.charCodeAt(0) + match.team2.charCodeAt(0)) % venues.length;
    return venues[hash];
  }
  return "Stadion Piala Dunia";
}

// APP STATE
let activeTab = 'tab-home';
let scheduleSubTab = 'upcoming';
let useLocalTimezone = localStorage.getItem('wc2026_local_tz') !== 'false';
let apiKey = '12aad17c1bf941f68c2318631dfcea1b';
let lastRenderedDate = new Date().toDateString();
let isDataDirty = true;
let showPotentialDraw = false;
let _lastRenderedLineupsFingerprint = null; // tracks last-rendered lineup data to avoid redundant re-renders
let cdElementsCache = null;
let lastFetchTime = 0;
let scorePollTimeout = null;
let realScores = {};
try {
  realScores = JSON.parse(localStorage.getItem('wc2026_real_scores')) || {};
  // Stale knockout scores cleanup migration:
  // In previous versions, buggy mapping assigned completed group stage match scores to knockout match IDs (ko_*).
  // Since the real-life tournament is still in the group stage, no knockout matches have been played.
  // We automatically clear any stale ko_* scores on load to prevent matches from disappearing from the schedule fixtures.
  let clearedStale = false;
  Object.keys(realScores).forEach(key => {
    if (key.startsWith('ko_')) {
      const score = realScores[key];
      // If there's score data but no real-life knockout matches have started, delete it
      if (score && score.status !== 'TIMED') {
        delete realScores[key];
        clearedStale = true;
      }
    }
    // Also wipe clock_updated_at from any TIMED/pre-match entry.
    // If this entry later transitions to live, the stale timestamp would cause
    // elapsedMs to be huge, making the displayed minute explode (e.g. 1556').
    // The score-update logic will set a fresh clock_updated_at on first live poll.
    const score = realScores[key];
    if (score && (score.status === 'TIMED' || score.status === 'PRE_MATCH' || score.status === 'SCHEDULED' || !score.status)) {
      if (score.clock_updated_at) {
        delete score.clock_updated_at;
        clearedStale = true;
      }
    }
  });
  if (clearedStale) {
    localStorage.setItem('wc2026_real_scores', JSON.stringify(realScores));
  }
} catch (e) {
  console.error("Failed to parse real scores", e);
}

let favorites = [];
try {
  favorites = JSON.parse(localStorage.getItem('wc2026_favorites')) || [];
} catch (e) {
  console.error("Failed to parse favorites", e);
}

// THEME STATE
let currentTheme = localStorage.getItem('wc2026_theme');
if (!currentTheme) {
  currentTheme = 'light'; // Light mode is default
  localStorage.setItem('wc2026_theme', 'light');
}
if (currentTheme === 'light') {
  document.body.classList.add('light-theme');
} else {
  document.body.classList.remove('light-theme');
}

// SIMULATOR STATE
let groupRankings = {}; // { "Grup A": ["Meksiko", ...], ... }
let teamStats = {};
let simulatedWinners = {};
try {
  simulatedWinners = JSON.parse(localStorage.getItem('wc2026_simulated_winners')) || {};
} catch (e) {
  console.error("Failed to parse simulated winners", e);
}

let selected3rdPlaces = {};
try {
  selected3rdPlaces = JSON.parse(localStorage.getItem('wc2026_selected_3rd_places')) || {};
} catch (e) {
  console.error("Failed to parse selected 3rd places", e);
}

// Initialize default group structures dynamically
const groups = {}; // { "Grup A": ["Meksiko", ...], ... }
WORLD_CUP_DATA.group_stage.forEach(m => {
  if (!groups[m.group]) groups[m.group] = [];
  if (!groups[m.group].includes(m.team1)) groups[m.group].push(m.team1);
  if (!groups[m.group].includes(m.team2)) groups[m.group].push(m.team2);
});

// Group Rankings Validation Helper
function isValidGroupRankings(rankings) {
  if (!rankings || typeof rankings !== 'object') return false;
  const expectedGroups = "ABCDEFGHIJKL".split("").map(letter => `Grup ${letter}`);
  for (const groupName of expectedGroups) {
    if (!rankings[groupName] || !Array.isArray(rankings[groupName]) || rankings[groupName].length !== 4) {
      return false;
    }
  }
  return true;
}

// Load group rankings from localStorage or use default order
let savedGroupRankings = null;
try {
  savedGroupRankings = JSON.parse(localStorage.getItem('wc2026_group_rankings'));
} catch (e) {
  console.error("Failed to parse group rankings", e);
}

if (isValidGroupRankings(savedGroupRankings)) {
  groupRankings = savedGroupRankings;
} else {
  // Use default alphabetical order
  for (const [groupName, teamList] of Object.entries(groups)) {
    groupRankings[groupName] = [...teamList].sort((a, b) => a.localeCompare(b));
  }
  localStorage.setItem('wc2026_group_rankings', JSON.stringify(groupRankings));
}


// Keep a working copy of knockout stage list for the simulator state
let knockoutMatches = WORLD_CUP_DATA.knockout_stage.map(m => ({...m}));

// Cached allMatches array — avoids rebuilding ~104 spread+map objects on every call
let _cachedAllMatches = null;
let _cachedKnockoutRef = null;
function getAllMatches() {
  if (_cachedAllMatches && _cachedKnockoutRef === knockoutMatches) {
    return _cachedAllMatches;
  }
  _cachedAllMatches = [
    ...WORLD_CUP_DATA.group_stage.map(m => ({ ...m, isKO: false })),
    ...knockoutMatches.map(m => ({ ...m, isKO: true }))
  ];
  _cachedKnockoutRef = knockoutMatches;
  return _cachedAllMatches;
}

// ----------------------------------------------------
// UTILITY FUNCTIONS
// ----------------------------------------------------

// Generate flag image markup
function getFlagHtml(teamName) {
  const code = TEAM_FLAGS[teamName];
  if (code) {
    return `<img class="flag-crest" src="https://flagcdn.com/w160/${code}.png" alt="${teamName}" loading="lazy">`;
  }
  // Muted gray shield logo for placeholder teams
  return `
    <div class="flag-crest flag-crest-placeholder">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    </div>
  `;
}

// Helper to parse match date/time to local Date object
function getMatchDate(dateStr, timeStr) {
  const [day, month] = dateStr.split('/').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  // Create date in UTC
  const utcDate = new Date(Date.UTC(2026, month - 1, day, hours, minutes, 0));
  // Subtract 7 hours (WIB is UTC+7) to get actual UTC time
  utcDate.setUTCHours(utcDate.getUTCHours() - 7);
  return utcDate;
}

// Helper to get and cache kickoff timestamp directly on the match object
function getMatchKickoffTime(match) {
  if (!match) return -1;
  if (match._kickoffTime !== undefined) {
    return match._kickoffTime;
  }
  if (match.date && match.time) {
    match._kickoffTime = getMatchDate(match.date, match.time).getTime();
  } else {
    match._kickoffTime = -1;
  }
  return match._kickoffTime;
}

// Reconstruct match object from match key
function getMatchFromKey(matchKey) {
  if (matchKey.startsWith('gs_')) {
    const parts = matchKey.split('_');
    const date = parts[1];
    const team1 = parts[2];
    const team2 = parts[3];
    return WORLD_CUP_DATA.group_stage.find(m => m.date === date && m.team1 === team1 && m.team2 === team2);
  } else if (matchKey.startsWith('ko_')) {
    const matchId = parseInt(matchKey.replace('ko_', ''));
    return knockoutMatches.find(m => m.match_id === matchId);
  }
  return null;
}

// Get score of a match dynamically
function getMatchScore(matchKey) {
  const apiScore = realScores[matchKey];
  if (apiScore && apiScore.score1 !== null && apiScore.score2 !== null) {
    const status = apiScore.status;
    if (status === 'FINISHED' || status === 'IN_PLAY' || status === 'PAUSED' || status === 'EXTRA_TIME' || status === 'PENALTY_SHOOTOUT') {
      return apiScore;
    }
  }
  return null;
}


function getLocalDateString(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWibDateString(dateObj) {
  const wibDate = new Date(dateObj.getTime() + 7 * 60 * 60 * 1000);
  const year = wibDate.getUTCFullYear();
  const month = String(wibDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMatchDateString(match) {
  if (useLocalTimezone) {
    const matchDateObj = getMatchDate(match.date, match.time);
    return getLocalDateString(matchDateObj);
  } else {
    const [d, mMonth] = match.date.split('/').map(Number);
    return `2026-${String(mMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
}

function isGroupStageComplete() {
  return WORLD_CUP_DATA.group_stage.every(m => {
    const matchKey = `gs_${m.date}_${m.team1}_${m.team2}`;
    const score = getMatchScore(matchKey);
    return score && score.status === 'FINISHED';
  });
}

function isRealTeamName(name) {
  if (!name) return false;
  const n = name.trim().toLowerCase();
  return !n.includes("grup") && !n.includes("group") && 
         !n.includes("winner") && !n.includes("loser") && 
         !n.includes("match") && !n.includes("laga") && 
         !n.includes("juara") && !n.includes("runner-up") && 
         !n.includes("3rd") && !n.includes("third") && 
         !n.includes("place") && !n.includes("peringkat") && 
         !n.includes("pemenang") && !n.includes("kalah") &&
         n !== "1l" && n !== "2l" && n !== "1a" && n !== "2a" && 
         n !== "1b" && n !== "2b" && n !== "1c" && n !== "2c" &&
         n !== "1d" && n !== "2d" && n !== "1e" && n !== "2e" &&
         n !== "1f" && n !== "2f" && n !== "1g" && n !== "2g" &&
         n !== "1h" && n !== "2h" && n !== "1i" && n !== "2i" &&
         n !== "1j" && n !== "2j" && n !== "1k" && n !== "2k";
}

function normalizePlaceholderName(name) {
  if (!name) return "";
  let clean = name.trim();
  const lower = clean.toLowerCase();

  if (lower.startsWith("third place group ")) {
    return "3rd Grup " + clean.substring(18);
  }
  if (lower.startsWith("third place grup ")) {
    return "3rd Grup " + clean.substring(17);
  }
  if (lower.startsWith("group ") && lower.endsWith(" winner")) {
    return "Juara Grup " + clean.substring(6, clean.length - 7);
  }
  if (lower.startsWith("grup ") && lower.endsWith(" winner")) {
    return "Juara Grup " + clean.substring(5, clean.length - 7);
  }
  if (lower.startsWith("group ") && lower.endsWith(" 2nd place")) {
    return "Runner-up Grup " + clean.substring(6, clean.length - 10);
  }
  if (lower.startsWith("grup ") && lower.endsWith(" 2nd place")) {
    return "Runner-up Grup " + clean.substring(5, clean.length - 10);
  }
  return clean;
}

function isGroupComplete(groupLetter) {
  const groupName = `Grup ${groupLetter}`;
  const groupMatches = WORLD_CUP_DATA.group_stage.filter(m => m.group === groupName);
  if (groupMatches.length === 0) return false;
  return groupMatches.every(m => {
    const matchKey = `gs_${m.date}_${m.team1}_${m.team2}`;
    const score = getMatchScore(matchKey);
    return score && score.status === 'FINISHED';
  });
}

function getLocalTimezoneAbbr() {
  try {
    const formatter = new Intl.DateTimeFormat('id-ID', { timeZoneName: 'short' });
    const parts = formatter.formatToParts(new Date());
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : '';
  } catch (e) {
    return '';
  }
}

// Debounce helper to throttle rapid event firing (resize, search typing)
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// ----------------------------------------------------
// SCORE FLASH ANIMATION — imperative DOM injection
// Flash is triggered ONCE per score update. Never re-triggered
// on tab-switch or re-render within the animation window.
// ----------------------------------------------------
const _flashedScores = {}; // key: `${matchKey}_1` or `${matchKey}_2`, value: score that was flashed

function triggerScoreFlash(matchKey, side, newScore) {
  // Guard: only flash if this exact score hasn't been flashed yet
  const flashKey = `${matchKey}_${side}`;
  if (_flashedScores[flashKey] === newScore) return;
  _flashedScores[flashKey] = newScore;

  // Find score span elements in any card and hero panel with this matchKey
  const FLASH_DURATION_MS = 4600; // slightly longer than animation duration (4.5s)

  const applyFlash = (span) => {
    if (!span) return;
    // Remove class first (in case it's lingering), force reflow, then re-add
    span.classList.remove('flash-score');
    // eslint-disable-next-line no-unused-expressions
    void span.offsetWidth; // trigger reflow so animation restarts cleanly
    span.classList.add('flash-score');
    setTimeout(() => {
      span.classList.remove('flash-score');
    }, FLASH_DURATION_MS);
  };

  // Use rAF to ensure DOM has been updated first
  requestAnimationFrame(() => {
    // 1. Match cards on schedule/home tab — score spans are children of .score-display
    document.querySelectorAll(`.match-card[data-key="${matchKey}"] .score-display span`).forEach((span, i) => {
      // spans order: score1, dash, score2 → indices 0 and 2
      if ((side === 1 && i === 0) || (side === 2 && i === 2)) applyFlash(span);
    });

    // 2. Hero panel live scoreboard — .live-score spans
    const heroScores = document.querySelectorAll('.live-center-block .live-score');
    if (heroScores.length >= 2) {
      applyFlash(side === 1 ? heroScores[0] : heroScores[1]);
    }

    // 3. Match detail modal — #modal-score-text-val spans
    const modalScoreEl = document.getElementById('modal-score-text-val');
    if (modalScoreEl) {
      const spans = modalScoreEl.querySelectorAll('span');
      if (spans.length >= 3) {
        applyFlash(side === 1 ? spans[0] : spans[2]);
      }
    }
  });
}

// Convert WIB Date+Time to local/WIB formatted details
function getFormattedTime(dateStr, timeStr) {
  const matchDate = getMatchDate(dateStr, timeStr);

  if (useLocalTimezone) {
    // Format according to browser locale, but enforce Indonesian weekday name
    const daysIndo = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const dayName = daysIndo[matchDate.getDay()];
    const datePart = matchDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    const formattedDate = `${dayName}, ${datePart}`;
    const formattedTime = matchDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
    return { date: formattedDate, time: formattedTime, tzLabel: getLocalTimezoneAbbr() };
  } else {
    // Standard WIB formatting
    const [day, month] = dateStr.split('/').map(Number);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const wibDate = new Date(2026, month - 1, day);
    const dayName = days[wibDate.getDay()];
    const formattedDate = `${dayName}, ${day} ${months[month - 1]}`;
    return { date: formattedDate, time: timeStr, tzLabel: "WIB" };
  }
}

// Check if a match is favorited
function isStarred(matchKey) {
  return favorites.includes(matchKey);
}

// Toggle favorites
function toggleStar(matchKey, btnElement) {
  const isFavorited = favorites.includes(matchKey);
  if (isFavorited) {
    favorites = favorites.filter(id => id !== matchKey);
  } else {
    favorites.push(matchKey);
  }
  
  localStorage.setItem('wc2026_favorites', JSON.stringify(favorites));
  renderFavorites();
  renderFavoritesCount();

  // Find all star buttons for this match across the page and sync their active state
  // 1. Regular match cards
  const cards = document.querySelectorAll(`.match-card[data-key="${matchKey}"]`);
  cards.forEach(card => {
    const starBtn = card.querySelector('.star-btn');
    if (starBtn) {
      if (isFavorited) starBtn.classList.remove('active');
      else starBtn.classList.add('active');
    }
  });


}

// Render the count of favorites in header/dashboard
function renderFavoritesCount() {
  const favCount = document.getElementById('favorites-count');
  if (favCount) {
    favCount.textContent = `${favorites.length} Terpilih`;
  }
}

// Parse group letters from a 3rd-place label: e.g. "3rd Grup A/B/C/D/F" -> ["Grup A", "Grup B", ...]
function getEligibleGroupsFor3rd(label) {
  if (!label.startsWith("3rd Grup")) return [];
  const groupsPart = label.replace("3rd Grup ", "");
  return groupsPart.split('/').map(letter => `Grup ${letter}`);
}

// Helper to get structured period name and display clock for live match cards
function getMatchLiveStatusParts(scoreData) {
  if (!scoreData) return { periodName: 'LIVE', clock: '' };
  
  if (scoreData.status === 'FINISHED') return { periodName: 'FT', clock: '' };
  if (scoreData.status === 'EXTRA_TIME') return { periodName: 'ET', clock: '' };
  if (scoreData.status === 'PENALTY_SHOOTOUT') return { periodName: 'PEN', clock: '' };
  if (scoreData.status === 'PAUSED' || scoreData.time_elapsed === 'HT' || scoreData.display_clock === 'HT') return { periodName: 'HT', clock: '' };
  
  const clock = scoreData.display_clock || scoreData.time_elapsed || '';
  let periodName = 'LIVE';
  
  if (clock && clock !== 'notstarted' && clock !== 'finished') {
    if (scoreData.period_desc) {
      const desc = scoreData.period_desc.toLowerCase();
      if (desc.includes('first half') || desc === '1st half') {
        periodName = 'Babak 1';
      } else if (desc.includes('second half') || desc === '2nd half') {
        periodName = 'Babak 2';
      } else if (desc.includes('first extra') || desc.includes('1st extra')) {
        periodName = 'ET Babak 1';
      } else if (desc.includes('second extra') || desc.includes('2nd extra')) {
        periodName = 'ET Babak 2';
      } else if (desc.includes('halftime')) {
        periodName = 'HT';
      } else if (desc.includes('extra time')) {
        periodName = 'ET';
      } else if (desc.includes('shootout') || desc.includes('penalty')) {
        periodName = 'PEN';
      } else {
        periodName = scoreData.period_desc;
      }
    } else if (scoreData.period) {
      if (scoreData.period === 1) periodName = 'Babak 1';
      else if (scoreData.period === 2) periodName = 'Babak 2';
      else if (scoreData.period === 3) periodName = 'ET Babak 1';
      else if (scoreData.period === 4) periodName = 'ET Babak 2';
    }
    return { periodName, clock };
  }
  
  return { periodName, clock: 'LIVE' };
}

function getLiveClockInfo(matchKey) {
  const scoreData = realScores[matchKey];
  if (!scoreData) return { clock: 'LIVE', isPulsing: true };
  
  const baseClock = scoreData.display_clock || scoreData.time_elapsed || '';
  
  // Halftime / Pause / Extra Time / Penalty states
  if (scoreData.status === 'PAUSED' || baseClock === 'HT' || scoreData.time_elapsed === 'HT') {
    return { clock: 'HT', isPulsing: false };
  }
  if (scoreData.status === 'PENALTY_SHOOTOUT' || baseClock === 'PEN' || scoreData.time_elapsed === 'PEN') {
    return { clock: 'PEN', isPulsing: true };
  }
  if (scoreData.status === 'FINISHED' || baseClock === 'finished') {
    return { clock: 'FT', isPulsing: false };
  }
  if (scoreData.status === 'EXTRA_TIME' && (!baseClock || baseClock === 'ET')) {
    return { clock: 'ET', isPulsing: true };
  }
  
  if (!baseClock || baseClock === 'notstarted') {
    return { clock: 'LIVE', isPulsing: true };
  }
  
  const minMatch = baseClock.match(/^(\d+)/);
  if (!minMatch) return { clock: baseClock, isPulsing: true };
  
  const baseMin = parseInt(minMatch[1]);
  const extraMatch = baseClock.match(/\+(\d+)/);
  const extraMin = extraMatch ? parseInt(extraMatch[1]) : 0;
  
  const clockUpdatedAt = scoreData.clock_updated_at || scoreData.fetched_at || Date.now();
  const elapsedMs = Date.now() - clockUpdatedAt;
  const elapsedSec = Math.floor(elapsedMs / 1000);
  
  const currentSec = elapsedSec % 60;
  const additionalMins = Math.floor(elapsedSec / 60);
  let displayMin = baseMin;
  let displayExtra = extraMin;
  
  if (extraMin > 0) {
    displayExtra += additionalMins;
  } else {
    displayMin += additionalMins;
  }

  // Safety cap: football minutes should never exceed ~105 (90+15) in normal play,
  // or ~135 (120+15) in extra time. If we somehow exceed 150, the timestamp is
  // stale/corrupt — fall back to showing just the API base clock without drift.
  const isExtraTime = scoreData.status === 'EXTRA_TIME';
  const maxPlausibleMin = isExtraTime ? 135 : 105;
  if (displayMin > maxPlausibleMin) {
    // Use the raw API value only, without adding drift
    const rawClockStr = extraMin > 0 ? `${baseMin}'+${extraMin}'` : `${baseMin}'`;
    return { clock: rawClockStr, isPulsing: true };
  }

  let clockStr = '';
  if (displayExtra > 0) {
    clockStr = `${displayMin}'+${displayExtra}'`;
  } else {
    clockStr = `${displayMin}'`;
  }
  
  const isPulsing = true;
  
  return { clock: clockStr, isPulsing };
}

function updateLiveMatchClocks() {
  // 1. Update live cards on the dashboard / schedule
  const liveClocks = document.querySelectorAll('.match-card[data-key] .score-status.status-live');
  liveClocks.forEach(scoreStatusEl => {
    const card = scoreStatusEl.closest('.match-card');
    if (!card) return;
    const key = card.getAttribute('data-key');
    if (!key) return;
    const scoreData = realScores[key];
    const match = getMatchFromKey(key);
    if (match && scoreData && isMatchLive(match, scoreData)) {
      const clockInfo = getLiveClockInfo(key);
      if (clockInfo.isPulsing) {
        scoreStatusEl.classList.add('pulse-minute');
      } else {
        scoreStatusEl.classList.remove('pulse-minute');
      }
      const displayClock = clockInfo.clock === 'LIVE' ? '' : clockInfo.clock;
      if (scoreStatusEl.textContent !== displayClock) {
        scoreStatusEl.textContent = displayClock;
      }
    }
  });

  // 2. Update Hero scoreboard live clock
  const heroStatusLiveEl = document.querySelector('.live-center-block .status-live');
  if (heroStatusLiveEl) {
    const allMatches = getAllMatches();
    const liveMatches = allMatches.filter(m => {
      const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
      const scoreData = getMatchScore(matchKey);
      return isMatchLive(m, scoreData);
    });
    if (liveMatches.length > 0) {
      const m = liveMatches[0];
      const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
      const clockInfo = getLiveClockInfo(matchKey);
      
      const parts = getMatchLiveStatusParts(realScores[matchKey]);
      const clockText = clockInfo.clock || parts.clock || parts.periodName || 'LIVE';
      
      if (heroStatusLiveEl.textContent !== clockText) {
        heroStatusLiveEl.textContent = clockText;
      }
      
      if (clockInfo.isPulsing) {
        heroStatusLiveEl.classList.add('pulse-minute');
      } else {
        heroStatusLiveEl.classList.remove('pulse-minute');
      }
    }
  }

  // 3. Update Detail modal if active
  const modal = document.getElementById('match-detail-modal');
  if (modal && modal.classList.contains('active') && currentModalData) {
    const key = currentModalData.matchKey || (currentModalData.match.isKO ? `ko_${currentModalData.match.match_id}` : `gs_${currentModalData.match.date}_${currentModalData.match.team1}_${currentModalData.match.team2}`);
    const scoreData = realScores[key];
    if (scoreData) {
      // Keep currentModalData.scoreData in sync
      currentModalData.scoreData = scoreData;
      
      const t1 = currentModalData.match.team1;
      const t2 = currentModalData.match.team2;
      const score1 = scoreData.score1 !== null && scoreData.score1 !== undefined ? scoreData.score1 : '-';
      const score2 = scoreData.score2 !== null && scoreData.score2 !== undefined ? scoreData.score2 : '-';
      const isStarted = scoreData && scoreData.status && scoreData.status !== 'TIMED' && scoreData.status !== 'PRE_MATCH' && scoreData.status !== 'SCHEDULED';
      
      // Update score text in-place (no flash-score class here — handled by triggerScoreFlash)
      const modalScoreTextVal = modal.querySelector('#modal-score-text-val');
      if (modalScoreTextVal) {
        const newScoreHtml = isStarted ? `
          <span>${score1}</span>
          <span> - </span>
          <span>${score2}</span>
        ` : `
          <span style="font-size: 1.15rem; color: var(--text-secondary); font-weight: 700; letter-spacing: 1.5px;">VS</span>
        `;
        if (modalScoreTextVal.innerHTML !== newScoreHtml) {
          modalScoreTextVal.innerHTML = newScoreHtml;
        }
      }
      
      // Update live status text / clock
      const modalStatusBoxVal = modal.querySelector('#modal-status-box-val');
      if (modalStatusBoxVal) {
        let modalLiveStatusHtml = '';
        if (isMatchLive(currentModalData.match, scoreData)) {
          const liveParts = getMatchLiveStatusParts(scoreData);
          const clockInfo = getLiveClockInfo(key);
          const displayClock = clockInfo.clock || liveParts.clock || 'LIVE';
          const isPulsing = clockInfo.isPulsing;
          
          if (displayClock === liveParts.periodName) {
            modalLiveStatusHtml = `
              <span class="status-live modal-status-live ${isPulsing ? 'pulse-minute' : ''}">${displayClock}</span>
            `;
          } else if (liveParts.clock || clockInfo.clock) {
            modalLiveStatusHtml = `
              <span style="font-size: 0.68rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">${liveParts.periodName}</span>
              <span class="status-live modal-status-live ${isPulsing ? 'pulse-minute' : ''}">${displayClock}</span>
            `;
          } else {
            modalLiveStatusHtml = `
              <span class="status-live modal-status-live">${liveParts.periodName}</span>
            `;
          }
        } else {
          const minuteLabel = scoreData.status === 'FINISHED' ? 'FT' : 'Belum Mulai';
          modalLiveStatusHtml = `
            <span class="score-status ${scoreData.status === 'FINISHED' ? 'status-ft' : ''}" style="font-size: 0.68rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary);">${minuteLabel}</span>
          `;
        }
        if (modalStatusBoxVal.innerHTML !== modalLiveStatusHtml) {
          modalStatusBoxVal.innerHTML = modalLiveStatusHtml;
        }
      }
      
      // Update scorers list in-place
      const modalScorersContainerVal = modal.querySelector('#modal-scorers-container-val');
      if (modalScorersContainerVal) {
        const cleanScorers1 = parseScorers(scoreData.home_scorers);
        const cleanScorers2 = parseScorers(scoreData.away_scorers);
        const newScorersInner = (cleanScorers1 || cleanScorers2) ? `
          <div class="home-scorers" style="flex: 1; text-align: right; padding-right: 12px; line-height: 1.4;">
            ${cleanScorers1 || ''}
          </div>
          <div style="flex: 0 0 16px; text-align: center; color: var(--text-muted); font-size: 0.65rem; padding-top: 2px;">⚽</div>
          <div class="away-scorers" style="flex: 1; text-align: left; padding-left: 12px; line-height: 1.4;">
            ${cleanScorers2 || ''}
          </div>
        ` : '';
        
        if (cleanScorers1 || cleanScorers2) {
          modalScorersContainerVal.style.display = 'flex';
          if (modalScorersContainerVal.innerHTML !== newScorersInner) {
            modalScorersContainerVal.innerHTML = newScorersInner;
          }
        } else {
          modalScorersContainerVal.style.display = 'none';
          modalScorersContainerVal.innerHTML = '';
        }
      }
      
      // Lineup/formation data does not change every second — it is fetched once per match open.
      // Only event-scorer annotations can change during live play (goals/red cards).
      // Re-render lineup tab only when scorer/card data actually changed, not every 1s tick.
      if (currentModalTab === 'lineups') {
        const contentContainer = document.getElementById('modal-tab-content-container');
        if (contentContainer) {
          const fp = getLineupsFingerprint(currentModalData);
          if (fp !== _lastRenderedLineupsFingerprint) {
            _lastRenderedLineupsFingerprint = fp;
            contentContainer.innerHTML = renderLineupsTab(currentModalData.lineups);
          }
        }
      }
    }
  }
}

// Helper to calculate match minute dynamically based on score status and time_elapsed
function getMatchMinuteLabel(match, scoreData) {
  if (!scoreData) return "LIVE";
  
  if (scoreData.status === 'FINISHED') return "FT";
  if (scoreData.status === 'EXTRA_TIME') return "ET";
  if (scoreData.status === 'PENALTY_SHOOTOUT') return "PEN";
  if (scoreData.status === 'PAUSED' || scoreData.time_elapsed === 'HT' || scoreData.display_clock === 'HT') return "HT";
  
  const parts = getMatchLiveStatusParts(scoreData);
  if (parts.clock && parts.clock !== 'LIVE') {
    if (parts.periodName && parts.periodName !== 'LIVE') {
      return `${parts.periodName} - ${parts.clock}`;
    }
    return parts.clock;
  }
  
  return parts.periodName || "LIVE";
}


// Centralized live match detection: API status first, then time-based fallback
function isMatchLive(match, scoreData) {
  // Compute kickoff once and cache it on the match object itself
  const kickoff = getMatchKickoffTime(match);
  if (kickoff >= 0) {
    // Guard: if kickoff is in the future, it cannot be live!
    if (Date.now() < kickoff) {
      return false;
    }
  }

  // 1. API status takes priority
  if (scoreData && (scoreData.status === 'IN_PLAY' || scoreData.status === 'PAUSED' || scoreData.status === 'EXTRA_TIME' || scoreData.status === 'PENALTY_SHOOTOUT')) {
    return true;
  }
  // 2. Already finished
  if (scoreData && scoreData.status === 'FINISHED') return false;
  // 3. Time-based fallback: if kickoff has passed but within 130 min window, treat as live
  if (kickoff >= 0) {
    const elapsed = Date.now() - kickoff;
    if (elapsed >= 0 && elapsed < 130 * 60 * 1000) {
      return true;
    }
  }
  return false;
}

// ----------------------------------------------------
// COUNTDOWN TIMER
// ----------------------------------------------------
let lastHeroMatchKey = null;

let _cachedCdContainer = null;
let _cachedCdTitle = null;
let _cachedCdDisplay = null;
let _cachedCdSub = null;

function updateHeroPanel() {
  if (!_cachedCdContainer) _cachedCdContainer = document.querySelector('.countdown-container');
  if (!_cachedCdTitle) _cachedCdTitle = document.querySelector('.countdown-title');
  if (!_cachedCdDisplay) _cachedCdDisplay = document.getElementById('countdown-display');
  if (!_cachedCdSub) _cachedCdSub = document.getElementById('countdown-sub');

  const container = _cachedCdContainer;
  const titleEl = _cachedCdTitle;
  const cdDisplay = _cachedCdDisplay;
  const subEl = _cachedCdSub;
  if (!container || !titleEl || !cdDisplay || !subEl) return;

  // Ensure hero star button is removed
  const cdStarBtn = document.getElementById('cd-star-btn');
  if (cdStarBtn) cdStarBtn.remove();

  const now = Date.now();
  const allMatches = getAllMatches();

  // 1. Check if there is a LIVE match (API status + time-based fallback)
  const liveMatches = allMatches.filter(m => {
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const scoreData = getMatchScore(matchKey);
    return isMatchLive(m, scoreData);
  });

  if (liveMatches.length > 0) {
    liveMatches.sort((a, b) => compareMatchesPriority(a, b));
    cdElementsCache = null;
    // MODE 1: LIVE Matches Active (Show premium scoreboard)
    const m = liveMatches[0];
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    
    container.onclick = null;
    const heroDetailBtn = document.querySelector('.hero-detail-btn');
    if (heroDetailBtn) {
      heroDetailBtn.onclick = () => {
        window.openMatchDetailModal(matchKey);
      };
    }
    const scoreData = getMatchScore(matchKey) || { score1: 0, score2: 0, status: 'IN_PLAY' };

    const team1Name = m.team1;
    const team2Name = m.team2;
    const team1Code = getTeamCode(m.team1);
    const team2Code = getTeamCode(m.team2);
    const flag1 = getFlagHtml(m.team1);
    const flag2 = getFlagHtml(m.team2);

    // Calculate match minute dynamically based on API time_elapsed if available
    const minuteLabel = getMatchMinuteLabel(m, scoreData);

    const cleanScorers1 = parseScorers(scoreData.home_scorers);
    const cleanScorers2 = parseScorers(scoreData.away_scorers);
    const cleanRedCards1 = parseScorers(scoreData.home_red_cards);
    const cleanRedCards2 = parseScorers(scoreData.away_red_cards);

    // Cache key for current live match state
    const liveKey = `live_${matchKey}_${scoreData.score1}_${scoreData.score2}_${scoreData.status}_${cleanScorers1}_${cleanScorers2}_${cleanRedCards1}_${cleanRedCards2}`;

    if (lastHeroMatchKey !== liveKey) {
      lastHeroMatchKey = liveKey;

      const isBigMatch = getMatchBadgeHtml(m.team1, m.team2) !== '';
      const liveParts = getMatchLiveStatusParts(scoreData);
      const venue = getMatchVenue(m);
      const stageName = m.isKO ? m.group : `Grup ${m.group.replace('Grup ', '')}`;

      titleEl.innerHTML = `
        <div style="font-size: 0.62rem; font-weight: 700; color: var(--primary-gold); letter-spacing: var(--tracking-widest); text-transform: uppercase; opacity: 0.85; margin-bottom: ${isBigMatch ? '6px' : '18px'};">
          Pertandingan Berlangsung
        </div>
      `;

      const timeLabel = liveParts.clock || liveParts.periodName;

      // Flash is triggered imperatively by triggerScoreFlash — no inline class needed

      cdDisplay.innerHTML = `
        <div class="live-scoreboard">
          <div class="live-info-wrapper" style="display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100%;">
            ${isBigMatch ? `
            <div style="display: flex; justify-content: center; margin-bottom: 6px;">
              <span class="badge-big-match" style="position: static; transform: none; font-size: 0.55rem; padding: 2px 8px; white-space: nowrap;">BIG MATCH</span>
            </div>
          ` : ''}
          <div class="live-main-row" style="margin-bottom: 10px;">
              <!-- Team 1 -->
              <div class="live-team left-team">
                <div class="live-team-info">
                  <span class="live-team-code highlighted-code">${team1Code}</span>
                  <span class="subtle-fullname">${team1Name}</span>
                </div>
                ${flag1}
              </div>
              
              <!-- Center Block (Score + Minute) -->
              <div class="live-center-block" style="display: flex; align-items: center; justify-content: center; position: relative;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="live-score">${scoreData.score1 !== null && scoreData.score1 !== undefined ? scoreData.score1 : 0}</span>
                  <span class="live-score-separator" style="line-height: 1;">:</span>
                  <span class="live-score">${scoreData.score2 !== null && scoreData.score2 !== undefined ? scoreData.score2 : 0}</span>
                </div>
                <span class="status-live hero-status-live">
                  ${timeLabel}
                </span>
              </div>
              
              <!-- Team 2 -->
              <div class="live-team right-team">
                ${flag2}
                <div class="live-team-info">
                  <span class="live-team-code highlighted-code">${team2Code}</span>
                  <span class="subtle-fullname">${team2Name}</span>
                </div>
              </div>
            </div>
            
            <!-- Row 2: Grup + Venue -->
            <div class="live-venue-row-styled" style="text-align: center; margin-top: 4px; margin-bottom: 2px;">
              <div style="font-size: 0.62rem; color: var(--primary-gold); font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px;">
                ${stageName}
              </div>
              <div style="font-size: 0.6rem; color: var(--text-secondary); opacity: 0.6; font-weight: 500;">
                ${venue}
              </div>
            </div>
          </div>

          ${(cleanScorers1 || cleanScorers2) ? `
            <div class="live-events-row">
              <div class="live-events-left">${cleanScorers1 || ''}</div>
              <div class="live-events-icon">⚽</div>
              <div class="live-events-right">${cleanScorers2 || ''}</div>
            </div>
          ` : ''}
          ${(cleanRedCards1 || cleanRedCards2) ? `
            <div class="live-events-row redcard-row">
              <div class="live-events-left">${cleanRedCards1 || ''}</div>
              <div class="live-events-icon"><span class="red-card-icon"></span></div>
              <div class="live-events-right">${cleanRedCards2 || ''}</div>
            </div>
          ` : ''}
        </div>
      `;
      
      subEl.innerHTML = `<span class="live-venue-label">${stageName} · ${venue}</span>`;
      subEl.style.display = 'none';
      
      cdDisplay.style.display = 'block';
      container.classList.add('live-active');
      
      // Dynamic team brand colors for left/right accent bars
      const colors1 = getTeamColor(team1Name, false);
      const colors2 = getTeamColor(team2Name, true);
      
      container.style.setProperty('--team1-color', getTeamGradientCss(colors1));
      container.style.setProperty('--team2-color', getTeamGradientCss(colors2));
      container.style.setProperty('--team1-glow', Array.isArray(colors1) ? colors1[0] : colors1);
      container.style.setProperty('--team2-glow', Array.isArray(colors2) ? colors2[0] : colors2);
      
      // Remove the team-preview row used in countdown mode
      const existingCdRow = document.getElementById('cd-teams-row');
      if (existingCdRow) existingCdRow.remove();
    }
    return;
  }

  // MODE 2: Countdown Active (No live matches)
  container.classList.remove('live-active');
  cdDisplay.style.display = ''; // Reset display style to allow CSS 'display: flex'
  const hasLiveStructure = !!cdDisplay.querySelector('.live-scoreboard');
  if (hasLiveStructure || !document.getElementById('cd-days')) {
    cdDisplay.innerHTML = `
      <div class="time-segment">
        <span id="cd-days" class="time-num">00</span>
        <span class="time-label">Hari</span>
      </div>
      <div class="time-segment">
        <span id="cd-hours" class="time-num">00</span>
        <span class="time-label">Jam</span>
      </div>
      <div class="time-segment">
        <span id="cd-mins" class="time-num">00</span>
        <span class="time-label">Menit</span>
      </div>
      <div class="time-segment">
        <span id="cd-secs" class="time-num">00</span>
        <span class="time-label">Detik</span>
      </div>
    `;
    // Force reset key when switching structures
    lastHeroMatchKey = null;
  }
  
  subEl.style.display = 'block';

  const targetMatch = getNextMatch();
  if (!targetMatch) {
    container.style.display = 'none';
    lastHeroMatchKey = null;
    return;
  }

  container.style.display = 'block';

  const targetMatchKey = targetMatch.isKO ? `ko_${targetMatch.match_id}` : `gs_${targetMatch.date}_${targetMatch.team1}_${targetMatch.team2}`;
  container.onclick = null;
  const heroDetailBtn = document.querySelector('.hero-detail-btn');
  if (heroDetailBtn) {
    heroDetailBtn.onclick = () => {
      window.openMatchDetailModal(targetMatchKey);
    };
  }

  const isOpening = targetMatch.date === "12/6" && targetMatch.time === "02:00" && targetMatch.team1 === "Meksiko";
  
  // Set team colors for countdown card edge stripes
  const colors1 = getTeamColor(targetMatch.team1, false);
  const colors2 = getTeamColor(targetMatch.team2, true);
  container.style.setProperty('--team1-color', getTeamGradientCss(colors1));
  container.style.setProperty('--team2-color', getTeamGradientCss(colors2));
  container.style.setProperty('--team1-glow', Array.isArray(colors1) ? colors1[0] : colors1);
  container.style.setProperty('--team2-glow', Array.isArray(colors2) ? colors2[0] : colors2);

  const targetTime = getMatchDate(targetMatch.date, targetMatch.time).getTime();
  const diff = targetTime - now;

  if (diff <= 0) {
    const cdKey = `cd_waiting_${targetMatch.date}_${targetMatch.time}_${targetMatch.team1}_${targetMatch.team2}`;
    if (lastHeroMatchKey !== cdKey) {
      lastHeroMatchKey = cdKey;

      const isBigMatch = getMatchBadgeHtml(targetMatch.team1, targetMatch.team2) !== '';
      const textTitle = isOpening ? `Kick-Off Match Pertama` : `Kick-Off Match Berikutnya`;
      titleEl.innerHTML = `
        <span>${textTitle}</span>
      `;

      const venue = getMatchVenue(targetMatch);
      const flag1Cd = getFlagHtml(targetMatch.team1);
      const flag2Cd = getFlagHtml(targetMatch.team2);

      const cdTeamRowId = 'cd-teams-row';
      let cdTeamRow = document.getElementById(cdTeamRowId);
      if (!cdTeamRow) {
        cdTeamRow = document.createElement('div');
        cdTeamRow.id = cdTeamRowId;
        cdTeamRow.className = 'countdown-teams-row';
        cdDisplay.parentNode.insertBefore(cdTeamRow, subEl);
      }
      const badgeHtml = isBigMatch
        ? `<span class="match-badge badge-big-match" style="position: static; transform: none; margin: 0 0 2px 0;">BIG MATCH</span>`
        : '';

      cdTeamRow.style.flexDirection = 'column';
      cdTeamRow.style.alignItems = 'center';
      cdTeamRow.innerHTML = `
        ${badgeHtml}
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%;">
          <div class="cd-team cd-team-left">
            <span class="cd-team-name">${targetMatch.team1}</span>
            ${flag1Cd}
          </div>
          <span class="cd-vs">VS</span>
          <div class="cd-team cd-team-right">
            ${flag2Cd}
            <span class="cd-team-name">${targetMatch.team2}</span>
          </div>
        </div>
      `;

      // Remove any leftover separate badge row
      const oldBadgeRow = document.getElementById('cd-badge-row');
      if (oldBadgeRow) oldBadgeRow.remove();
      cdTeamRow.style.marginTop = '';

      const timeInfo = getFormattedTime(targetMatch.date, targetMatch.time);
      const dateStr = `${timeInfo.date} · ${timeInfo.time} ${timeInfo.tzLabel}`;
      const stageName = targetMatch.isKO ? targetMatch.group : `Grup ${targetMatch.group.replace('Grup ', '')}`;

      subEl.style.opacity = '1';
      subEl.innerHTML = `
        <div style="font-size: 0.72rem; font-weight: 700; color: var(--primary-gold); margin-top: 4px; margin-bottom: 3px; letter-spacing: 0.5px;">
          ${stageName}
        </div>
        <div style="font-size: 0.65rem; color: var(--text-primary); font-weight: 600; margin-bottom: 2px; opacity: 0.9;">
          ${dateStr}
        </div>
        <div style="font-size: 0.6rem; color: var(--text-secondary); opacity: 0.6; margin-bottom: 4px;">
          ${venue}
        </div>
      `;
    }

    cdElementsCache = null;
    cdDisplay.innerHTML = `
      <div style="font-size: 0.82rem; font-weight: 700; color: var(--primary-gold); padding: 8px 0; display: flex; align-items: center; justify-content: center; gap: 8px; letter-spacing: 0.5px;">
        <span class="waiting-pulse-dot"></span>
        MENUNGGU KICK-OFF...
      </div>
    `;
    return;
  }

  const cdKey = `cd_${targetMatch.date}_${targetMatch.time}_${targetMatch.team1}_${targetMatch.team2}`;

  if (lastHeroMatchKey !== cdKey) {
    lastHeroMatchKey = cdKey;

    const isBigMatch = getMatchBadgeHtml(targetMatch.team1, targetMatch.team2) !== '';
    const textTitle = isOpening ? `Kick-Off Match Pertama` : `Kick-Off Match Berikutnya`;
    titleEl.innerHTML = `
      <span>${textTitle}</span>
    `;

    const venue = getMatchVenue(targetMatch);
    const flag1Cd = getFlagHtml(targetMatch.team1);
    const flag2Cd = getFlagHtml(targetMatch.team2);

    // Rich team preview row
    const cdTeamRowId = 'cd-teams-row';
    let cdTeamRow = document.getElementById(cdTeamRowId);
    if (!cdTeamRow) {
      cdTeamRow = document.createElement('div');
      cdTeamRow.id = cdTeamRowId;
      cdTeamRow.className = 'countdown-teams-row';
      cdDisplay.parentNode.insertBefore(cdTeamRow, subEl);
    }
    const badgeHtml = isBigMatch
      ? `<span class="match-badge badge-big-match" style="position: static; transform: none; margin: 0 0 2px 0;">BIG MATCH</span>`
      : '';

    cdTeamRow.style.flexDirection = 'column';
    cdTeamRow.style.alignItems = 'center';
    cdTeamRow.innerHTML = `
      ${badgeHtml}
      <div style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%;">
        <div class="cd-team cd-team-left">
          <span class="cd-team-name">${targetMatch.team1}</span>
          ${flag1Cd}
        </div>
        <span class="cd-vs">VS</span>
        <div class="cd-team cd-team-right">
          ${flag2Cd}
          <span class="cd-team-name">${targetMatch.team2}</span>
        </div>
      </div>
    `;

    // Remove any leftover separate badge row
    const oldBadgeRow = document.getElementById('cd-badge-row');
    if (oldBadgeRow) oldBadgeRow.remove();
    cdTeamRow.style.marginTop = '';

    const timeInfo = getFormattedTime(targetMatch.date, targetMatch.time);
    const dateStr = `${timeInfo.date} · ${timeInfo.time} ${timeInfo.tzLabel}`;
    const stageName = targetMatch.isKO ? targetMatch.group : `Grup ${targetMatch.group.replace('Grup ', '')}`;
    
    subEl.style.opacity = '1';
    subEl.innerHTML = `
      <div style="font-size: 0.72rem; font-weight: 700; color: var(--primary-gold); margin-top: 4px; margin-bottom: 3px; letter-spacing: 0.5px;">
        ${stageName}
      </div>
      <div style="font-size: 0.65rem; color: var(--text-primary); font-weight: 600; margin-bottom: 2px; opacity: 0.9;">
        ${dateStr}
      </div>
      <div style="font-size: 0.6rem; color: var(--text-secondary); opacity: 0.6; margin-bottom: 4px;">
        ${venue}
      </div>
    `;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  if (!cdElementsCache) {
    cdElementsCache = {
      days: document.getElementById('cd-days'),
      hours: document.getElementById('cd-hours'),
      mins: document.getElementById('cd-mins'),
      secs: document.getElementById('cd-secs')
    };
  }

  const cdDays = cdElementsCache.days;
  const cdHours = cdElementsCache.hours;
  const cdMins = cdElementsCache.mins;
  const cdSecs = cdElementsCache.secs;

  if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
  if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
  if (cdMins) cdMins.textContent = String(mins).padStart(2, '0');
  if (cdSecs) cdSecs.textContent = String(secs).padStart(2, '0');
}

function initCountdown() {
  updateHeroPanel();
  updateLiveMatchClocks();
  setInterval(() => {
    updateHeroPanel();
    updateLiveMatchClocks();
  }, 1000);
}

// ----------------------------------------------------
// UI RENDERING ENGINES
// ----------------------------------------------------

// Render Match Card
function createMatchCardHtml(match, index, isKnockout = false, showBigMatchBadge = true) {
  const matchKey = isKnockout ? `ko_${match.match_id}` : `gs_${match.date}_${match.team1}_${match.team2}`;
  const timeInfo = getFormattedTime(match.date, match.time);
  const starredClass = isStarred(matchKey) ? 'active' : '';
  
  const scoreData = getMatchScore(matchKey);
  const rawScore = realScores[matchKey];
  const matchday = (rawScore && rawScore.matchday) ? rawScore.matchday : null;
  const labelVenue = getMatchVenue(match);
  const isLive = isMatchLive(match, scoreData);

  const stageHeaderHtml = `
    <div class="match-stage-container" style="display: flex; align-items: center; gap: 6px;">
      <span class="match-stage">${match.group}</span>
    </div>
  `;

  const starBtnHtml = `<button class="star-btn star-btn-inline ${starredClass}" onclick="event.stopPropagation(); toggleMatchStar('${matchKey}', this)" aria-label="Simpan Pertandingan"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></button>`;

  if (scoreData) {
    const cleanScorers1 = parseScorers(scoreData.home_scorers);
    const cleanScorers2 = parseScorers(scoreData.away_scorers);
    const cleanRedCards1 = parseScorers(scoreData.home_red_cards);
    const cleanRedCards2 = parseScorers(scoreData.away_red_cards);

    let scoreStatusHtml = '';
    let liveParts = null;
    if (isLive) {
      liveParts = getMatchLiveStatusParts(scoreData);
      const clockInfo = getLiveClockInfo(matchKey);
      const clockLabel = clockInfo.clock;
      const pulseClass = clockInfo.isPulsing ? 'pulse-minute' : '';
      const displayClock = clockLabel === 'LIVE' ? '' : clockLabel;
      scoreStatusHtml = `
        <div class="score-status status-live ${pulseClass}">${displayClock}</div>
      `;
    } else {
      scoreStatusHtml = '';
    }

    // Flash handled imperatively by triggerScoreFlash — no inline class evaluation needed

    return `
      <div class="match-card" data-key="${matchKey}" title="${labelVenue}" onclick="window.openMatchDetailModal('${matchKey}')" style="cursor: pointer;">
        <div class="match-header">
          ${stageHeaderHtml}
          <div class="match-header-right" style="display: flex; align-items: center; gap: 8px;">
            <span class="match-date-label">${timeInfo.date} · ${timeInfo.time} ${timeInfo.tzLabel}</span>
          </div>
        </div>
        <div class="match-body">
          <div class="team-display left">
            <span class="team-name">${match.team1}</span>
            ${getFlagHtml(match.team1)}
          </div>
          <div class="match-time-box score-box">
            ${isLive && liveParts && liveParts.clock && liveParts.clock !== 'LIVE' ? `<div class="match-period-label">${liveParts.periodName}</div>` : ''}
            <div class="score-display" style="white-space: nowrap;">
              <span>${scoreData.score1}</span>
              <span> - </span>
              <span>${scoreData.score2}</span>
            </div>
            ${scoreStatusHtml}
          </div>
          <div class="team-display right">
            ${getFlagHtml(match.team2)}
            <span class="team-name">${match.team2}</span>
          </div>
          <div class="match-venue-subtle">${labelVenue}</div>
        </div>
        ${(cleanScorers1 || cleanScorers2) ? `
          <div class="match-scorers-row">
            <div class="scorers-left">
              ${cleanScorers1 || ''}
            </div>
            <div class="scorers-icon">⚽</div>
            <div class="scorers-right">
              ${cleanScorers2 || ''}
            </div>
          </div>
        ` : ''}
        ${(cleanRedCards1 || cleanRedCards2) ? `
          <div class="match-redcards-row${!(cleanScorers1 || cleanScorers2) ? ' no-scorers' : ''}">
            <div class="redcards-left">
              ${cleanRedCards1 || ''}
            </div>
            <div class="redcards-icon">
              <span class="red-card-icon"></span>
            </div>
            <div class="redcards-right">
              ${cleanRedCards2 || ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  } else {
    return `
      <div class="match-card match-fixture-card" data-key="${matchKey}" title="${labelVenue}" onclick="window.openMatchDetailModal('${matchKey}')" style="cursor: pointer;">
        <div class="match-header">
          ${stageHeaderHtml}
          ${showBigMatchBadge ? getMatchBadgeHtml(match.team1, match.team2) : ''}
          <span class="match-date-label">${timeInfo.date}</span>
        </div>
        <div class="match-body">
          <div class="team-display left">
            <span class="team-name">${match.team1}</span>
            ${getFlagHtml(match.team1)}
          </div>
          <div class="match-time-box time-box">
            <div>${timeInfo.time}</div>
            <div class="time-tz-label">${timeInfo.tzLabel}</div>
          </div>
          <div class="team-display right">
            ${getFlagHtml(match.team2)}
            <span class="team-name">${match.team2}</span>
          </div>
          <div class="match-venue-subtle match-venue-with-star"><span class="venue-name-text">${labelVenue}</span>${starBtnHtml}</div>
        </div>
      </div>
    `;
  }
}

// Render schedule list based on search/filters
function renderSchedule() {
  recalculateKnockoutTree();
  const container = document.getElementById('schedule-list');
  if (!container) return;

  const searchQuery = document.getElementById('schedule-search').value.toLowerCase().trim();
  const filterType = document.querySelector('.tab-filter-btn.active').id; // filter-all, filter-group-stage, filter-knockout-stage
  const filterGroupVal = document.getElementById('filter-group').value;
  const filterRoundVal = document.getElementById('filter-round').value;

  let filteredGroupStage = WORLD_CUP_DATA.group_stage;
  let filteredKnockout = knockoutMatches.map(m => {
    const matchKey = `ko_${m.match_id}`;
    const score = getMatchScore(matchKey);
    if (!score && !showPotentialDraw && !isGroupStageComplete()) {
      if (!isRealTeamName(m.team1) || !isRealTeamName(m.team2)) {
        const orig = WORLD_CUP_DATA.knockout_stage.find(ok => ok.match_id === m.match_id);
        if (orig) {
          return {
            ...m,
            team1: isRealTeamName(m.team1) ? m.team1 : orig.team1,
            team2: isRealTeamName(m.team2) ? m.team2 : orig.team2
          };
        }
      }
    }
    return m;
  });

  // Filter 1: Main Type (Group Stage vs Knockout)
  if (filterType === 'filter-group-stage') {
    filteredKnockout = [];
  } else if (filterType === 'filter-knockout-stage') {
    filteredGroupStage = [];
  }

  // Filter 2: Group Dropdown
  if (filterGroupVal) {
    filteredGroupStage = filteredGroupStage.filter(m => m.group === filterGroupVal);
    filteredKnockout = [];
  }

  // Filter 3: Round Dropdown
  if (filterRoundVal) {
    filteredGroupStage = [];
    filteredKnockout = filteredKnockout.filter(m => m.group === filterRoundVal);
  }

  // Filter 4: Text Search
  if (searchQuery) {
    filteredGroupStage = filteredGroupStage.filter(m => 
      m.team1.toLowerCase().includes(searchQuery) || 
      m.team2.toLowerCase().includes(searchQuery) ||
      m.group.toLowerCase().includes(searchQuery)
    );
    filteredKnockout = filteredKnockout.filter(m => 
      m.team1.toLowerCase().includes(searchQuery) || 
      m.team2.toLowerCase().includes(searchQuery) ||
      m.group.toLowerCase().includes(searchQuery) ||
      (m.venue && m.venue.toLowerCase().includes(searchQuery))
    );
  }

  // Combine lists and filter by sub-tab state (realScores existence)
  const combined = [
    ...filteredGroupStage.map(m => ({ ...m, isKO: false })),
    ...filteredKnockout.map(m => ({ ...m, isKO: true }))
  ];

  const allFiltered = combined.filter(m => {
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const score = getMatchScore(matchKey);
    const hasScore = score && (score.status === 'FINISHED' || score.status === 'IN_PLAY' || score.status === 'PAUSED' || score.status === 'EXTRA_TIME' || score.status === 'PENALTY_SHOOTOUT');
    return scheduleSubTab === 'results' ? hasScore : !hasScore;
  });

  // Since date is formatted as e.g. "12/6", "13/6", let's map dates to simple values for sorting
  function dateToVal(dStr) {
    const [d, m] = dStr.split('/').map(Number);
    return m * 100 + d;
  }

  // Sort: ascending for fixtures, descending for results (latest first)
  allFiltered.sort((a, b) => {
    const isResults = scheduleSubTab === 'results';
    const dateDiff = dateToVal(a.date) - dateToVal(b.date);
    if (dateDiff !== 0) {
      return isResults ? -dateDiff : dateDiff;
    }
    const timeCompare = a.time.localeCompare(b.time);
    return isResults ? -timeCompare : timeCompare;
  });

  if (allFiltered.length === 0) {
    const emptyMsg = scheduleSubTab === 'results'
      ? 'Belum ada hasil pertandingan yang tersedia untuk kriteria pencarian/filter ini.'
      : 'Tidak ada jadwal pertandingan yang tersedia untuk kriteria pencarian/filter ini.';
    container.innerHTML = `
      <div class="empty-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>${emptyMsg}</p>
      </div>
    `;
    return;
  }

  // Group by Date for cleaner schedule presentation
  let listHtml = '';
  let lastDate = '';

  allFiltered.forEach(match => {
    const dateInfo = getFormattedTime(match.date, match.time);
    if (dateInfo.date !== lastDate) {
      lastDate = dateInfo.date;
      listHtml += `<div class="date-divider"><span>${lastDate}</span></div>`;
    }
    listHtml += createMatchCardHtml(match, match.match_id || 0, match.isKO);
  });

  container.innerHTML = listHtml;
}

// Render Dashboard/Home tab favorites
function renderFavorites() {
  recalculateKnockoutTree();
  const container = document.getElementById('favorites-list');
  if (!container) return;

  if (favorites.length === 0) {
    container.innerHTML = `
      <div class="empty-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        <p>Belum ada pertandingan favorit. Ketuk ikon bintang di tab Jadwal untuk menyimpannya.</p>
      </div>
    `;
    return;
  }

  let listHtml = '';
  
  // Find match object for each favorited key
  favorites.forEach(key => {
    if (key.startsWith('gs_')) {
      const parts = key.split('_');
      // gs_date_team1_team2
      const date = parts[1];
      const team1 = parts[2];
      const team2 = parts[3];
      const match = WORLD_CUP_DATA.group_stage.find(m => m.date === date && m.team1 === team1 && m.team2 === team2);
      if (match) {
        listHtml += createMatchCardHtml(match, 0, false);
      }
    } else if (key.startsWith('ko_')) {
      const matchId = parseInt(key.replace('ko_', ''));
      // Find in working copy of knockout matches
      const match = knockoutMatches.find(m => m.match_id === matchId);
      if (match) {
        let displayMatch = match;
        const score = getMatchScore(key);
        if (!score && !showPotentialDraw && !isGroupStageComplete()) {
          if (!isRealTeamName(match.team1) || !isRealTeamName(match.team2)) {
            const orig = WORLD_CUP_DATA.knockout_stage.find(ok => ok.match_id === matchId);
            if (orig) {
              displayMatch = {
                ...match,
                team1: isRealTeamName(match.team1) ? match.team1 : orig.team1,
                team2: isRealTeamName(match.team2) ? match.team2 : orig.team2
              };
            }
          }
        }
        listHtml += createMatchCardHtml(displayMatch, displayMatch.match_id, true);
      }
    }
  });

  container.innerHTML = listHtml;
}

let resultsSliderInterval = null;
let currentResultsSlide = 0;
let resultsSliderTransitioning = false;

function startResultsAutoplay(count) {
  if (resultsSliderInterval) clearInterval(resultsSliderInterval);
  resultsSliderInterval = setInterval(() => {
    if (resultsSliderTransitioning) return;
    goToResultsSlide(currentResultsSlide + 1);
  }, 6000);
}

function goToResultsSlide(targetRealIndex, animate = true) {
  const track = document.querySelector('.results-slider-track');
  const containerEl = document.querySelector('.results-slider-container');
  if (!track || !containerEl) {
    if (resultsSliderInterval) {
      clearInterval(resultsSliderInterval);
      resultsSliderInterval = null;
    }
    return;
  }

  // If the slider container is hidden (e.g. user navigated to another tab),
  // stop autoplay and don't transition.
  if (containerEl.offsetParent === null) {
    if (resultsSliderInterval) {
      clearInterval(resultsSliderInterval);
      resultsSliderInterval = null;
    }
    resultsSliderTransitioning = false;
    return;
  }

  const slides = track.querySelectorAll('.results-slide');
  const count = slides.length - 2;
  if (count <= 0) return;

  if (animate && resultsSliderTransitioning) return;

  if (animate) {
    resultsSliderTransitioning = true;
    track.style.transition = 'transform 1.4s cubic-bezier(0.22, 1, 0.25, 1)';
  } else {
    track.style.transition = 'none';
  }

  track.style.transform = `translateX(-${(targetRealIndex + 1) * 100}%)`;
  currentResultsSlide = targetRealIndex;

  // Update dots
  const activeDotIndex = (targetRealIndex + count) % count;
  const dots = document.querySelectorAll('.results-dot');
  dots.forEach((dot, idx) => {
    if (idx === activeDotIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

window.handleResultDotClick = function(index) {
  if (resultsSliderTransitioning) return;
  goToResultsSlide(index);
  const containerEl = document.querySelector('.results-slider-container');
  if (containerEl) {
    const track = containerEl.querySelector('.results-slider-track');
    if (track) {
      const count = track.querySelectorAll('.results-slide').length - 2;
      startResultsAutoplay(count);
    }
  }
};

// Render Latest Match Results (Hasil Pertandingan Terbaru)
function renderLatestResults() {
  recalculateKnockoutTree();
  const container = document.getElementById('latest-results-list');
  if (!container) return;

  // Combine all matches
  const allMatches = getAllMatches();

  // Filter matches that have scores recorded and are finished
  const matchesWithScores = allMatches.filter(m => {
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const score = getMatchScore(matchKey);
    return score && score.status === 'FINISHED';
  });

  if (matchesWithScores.length === 0) {
    if (resultsSliderInterval) {
      clearInterval(resultsSliderInterval);
      resultsSliderInterval = null;
    }
    container.innerHTML = `
      <div class="empty-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>Belum ada hasil pertandingan terbaru.</p>
      </div>
    `;
    container.removeAttribute('data-matches-hash');
    return;
  }

  // Sort by match date/time descending (most recent matches first)
  const matchesWithTime = matchesWithScores.map(m => ({
    match: m,
    time: getMatchKickoffTime(m)
  }));
  matchesWithTime.sort((a, b) => b.time - a.time);
  const sortedMatchesWithScores = matchesWithTime.map(x => x.match);

  // Extract the last 2 distinct match dates (newest first)
  const uniqueDates = [];
  for (const m of sortedMatchesWithScores) {
    if (!uniqueDates.includes(m.date)) {
      uniqueDates.push(m.date);
    }
    if (uniqueDates.length === 2) {
      break;
    }
  }

  // Filter matches belonging to these 2 most recent match days
  const latestMatches = sortedMatchesWithScores.filter(m => uniqueDates.includes(m.date));

  // Generate hash of current scores to prevent unnecessary DOM recreation on background polling
  const matchesContentHash = latestMatches.map(m => {
    const key = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const score = getMatchScore(key);
    const scoreStr = score ? `${score.score1}_${score.score2}_${score.status}` : 'no_score';
    return `${key}_${scoreStr}`;
  }).join('|');

  if (container.getAttribute('data-matches-hash') === matchesContentHash) {
    // If returning back to home tab and the slider was paused, restart autoplay
    if (activeTab === 'tab-home') {
      const track = container.querySelector('.results-slider-track');
      if (track) {
        const n = track.querySelectorAll('.results-slide').length - 2;
        if (n > 1 && !resultsSliderInterval) {
          startResultsAutoplay(n);
        }
      }
    }
    return;
  }
  container.setAttribute('data-matches-hash', matchesContentHash);

  if (latestMatches.length <= 1) {
    let listHtml = '';
    latestMatches.forEach(match => {
      listHtml += createMatchCardHtml(match, match.match_id || 0, match.isKO, false);
    });
    container.innerHTML = listHtml;
    if (resultsSliderInterval) {
      clearInterval(resultsSliderInterval);
      resultsSliderInterval = null;
    }
  } else {
    const n = latestMatches.length;

    // Clone of last match
    const cloneLastHtml = `
      <div class="results-slide cloned" data-index="${n - 1}">
        ${createMatchCardHtml(latestMatches[n - 1], latestMatches[n - 1].match_id || 0, latestMatches[n - 1].isKO, false)}
      </div>
    `;

    // Real matches
    let realSlidesHtml = '';
    latestMatches.forEach((match, idx) => {
      realSlidesHtml += `
        <div class="results-slide" data-index="${idx}">
          ${createMatchCardHtml(match, match.match_id || 0, match.isKO, false)}
        </div>
      `;
    });

    // Clone of first match
    const cloneFirstHtml = `
      <div class="results-slide cloned" data-index="0">
        ${createMatchCardHtml(latestMatches[0], latestMatches[0].match_id || 0, latestMatches[0].isKO, false)}
      </div>
    `;

    let dotsHtml = '';
    latestMatches.forEach((_, idx) => {
      dotsHtml += `<span class="results-dot ${idx === 0 ? 'active' : ''}" onclick="handleResultDotClick(${idx})"></span>`;
    });

    container.innerHTML = `
      <div class="results-slider-container">
        <div class="results-slider-track" style="transform: translateX(-100%); transition: none;">
          ${cloneLastHtml}
          ${realSlidesHtml}
          ${cloneFirstHtml}
        </div>
      </div>
      <div class="results-slider-dots">
        ${dotsHtml}
      </div>
    `;

    currentResultsSlide = 0;
    resultsSliderTransitioning = false;

    const track = container.querySelector('.results-slider-track');
    const containerEl = container.querySelector('.results-slider-container');

    if (track && containerEl) {
      // Handle infinite jump when transition ends
      track.addEventListener('transitionend', () => {
        resultsSliderTransitioning = false;
        
        if (currentResultsSlide === n) {
          track.style.transition = 'none';
          track.style.transform = 'translateX(-100%)';
          currentResultsSlide = 0;
          track.offsetHeight; // Force reflow
        }
        
        if (currentResultsSlide === -1) {
          track.style.transition = 'none';
          track.style.transform = `translateX(-${n * 100}%)`;
          currentResultsSlide = n - 1;
          track.offsetHeight; // Force reflow
        }
      });

      // Pause on hover
      containerEl.addEventListener('mouseenter', () => {
        if (resultsSliderInterval) {
          clearInterval(resultsSliderInterval);
          resultsSliderInterval = null;
        }
      });
      containerEl.addEventListener('mouseleave', () => {
        startResultsAutoplay(n);
      });

      // Start autoplay
      startResultsAutoplay(n);
    }
  }
  
  // Render statistics and top scorers on the Home tab
  renderStatistics();
}

function renderStatistics() {
  const scorersListContainer = document.getElementById('top-scorers-list');
  if (!scorersListContainer) return;

  const scorersMap = {};
  let totalGoals = 0;
  let matchesPlayed = 0;
  const teamGoalsMap = {};
  const teamMatchesMap = {};
  let totalRedCards = 0;
  let totalOwnGoals = 0;
  let biggestWin = { diff: 0, matchStr: '-', team: '-' };
  let highestScoringMatch = { total: 0, matchStr: '-' };

  const allMatches = getAllMatches();

  allMatches.forEach(m => {
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const score = getMatchScore(matchKey);

    if (score && (score.status === 'FINISHED' || score.status === 'IN_PLAY' || score.status === 'PAUSED' || score.status === 'EXTRA_TIME' || score.status === 'PENALTY_SHOOTOUT')) {
      const s1 = parseInt(score.score1) || 0;
      const s2 = parseInt(score.score2) || 0;
      
      totalGoals += (s1 + s2);
      matchesPlayed++;

      teamGoalsMap[m.team1] = (teamGoalsMap[m.team1] || 0) + s1;
      teamGoalsMap[m.team2] = (teamGoalsMap[m.team2] || 0) + s2;
      teamMatchesMap[m.team1] = (teamMatchesMap[m.team1] || 0) + 1;
      teamMatchesMap[m.team2] = (teamMatchesMap[m.team2] || 0) + 1;

      // Calculate red cards
      const countRedCards = (cardsStr) => {
        if (!cardsStr || cardsStr === 'null' || cardsStr === '""' || cardsStr === '[]') return 0;
        const cleaned = cardsStr.replace(/[{}""\[\]]/g, '').trim();
        if (!cleaned) return 0;
        return cleaned.split(',').length;
      };

      totalRedCards += (countRedCards(score.home_red_cards) + countRedCards(score.away_red_cards));

      // Calculate biggest win
      const diff = Math.abs(s1 - s2);
      if (diff > biggestWin.diff) {
        biggestWin.diff = diff;
        biggestWin.matchStr = `${m.team1} ${s1} - ${s2} ${m.team2}`;
        biggestWin.team = s1 > s2 ? m.team1 : m.team2;
      }

      // Calculate highest scoring match
      const total = s1 + s2;
      if (total > highestScoringMatch.total) {
        highestScoringMatch.total = total;
        highestScoringMatch.matchStr = `${m.team1} ${s1} - ${s2} ${m.team2}`;
      }

      const addScorers = (scorersStr, teamName) => {
        if (!scorersStr || scorersStr === 'null' || scorersStr === '""' || scorersStr === '[]') return;
        const cleaned = scorersStr.replace(/[{}""\[\]]/g, '').replace(/[“”]/g, '').trim();
        if (!cleaned) return;

        cleaned.split(',').forEach(s => {
          const item = s.trim().replace(/^['"]|['"]$/g, '');
          if (!item) return;

          // Count own goals
          if (/\(og\)/i.test(item) || /own\s+goal/i.test(item) || /bunuh\s+diri/i.test(item)) {
            totalOwnGoals++;
            return;
          }

          // Normalisasi format menit gol agar hitungan gol akurat
          let cleanedItem = item.replace(/(\d+)'/g, '$1');
          cleanedItem = cleanedItem.replace(/(\d+)\+(\d+)/g, "$1+$2'");
          cleanedItem = cleanedItem.replace(/(?<!\+)\b(\d+)\b(?!\+)/g, "$1'");

          const minutesMatch = cleanedItem.match(/\d+'/g);
          const goalCount = minutesMatch ? minutesMatch.length : 1;

          let playerName = cleanedItem.split(/\d/)[0].trim();
          if (!playerName) playerName = cleanedItem.trim();
          
          playerName = playerName.replace(/\s*\(A:.*?\)\s*$/i, '').trim();

          if (playerName) {
            if (!scorersMap[playerName]) {
              scorersMap[playerName] = { name: playerName, team: teamName, goals: 0 };
            }
            scorersMap[playerName].goals += goalCount;
          }
        });
      };

      addScorers(score.home_scorers, m.team1);
      addScorers(score.away_scorers, m.team2);
    }
  });

  // Display top scorers list only (sorted by goals, then fewest team matches played, then alphabetically)
  const currentList = Object.values(scorersMap)
    .sort((a, b) => {
      // 1. Goals (descending)
      if (b.goals !== a.goals) {
        return b.goals - a.goals;
      }
      // 2. Fewest team matches played (ascending) — better goals-per-match ratio
      const matchesA = teamMatchesMap[a.team] || 0;
      const matchesB = teamMatchesMap[b.team] || 0;
      if (matchesA !== matchesB) {
        return matchesA - matchesB;
      }
      // 3. Alphabetical fallback
      return a.name.localeCompare(b.name);
    })
    .map(s => ({ name: s.name, team: s.team, value: s.goals, label: 'Gol' }));
  const emptyMsg = 'Belum ada gol yang dicetak.';

  const titleEl = document.getElementById('stats-leaderboard-title');
  const iconEl = titleEl ? titleEl.nextElementSibling : null;
  if (titleEl) titleEl.textContent = 'Top Scorer';
  if (iconEl) iconEl.textContent = '⚽';

  let listHtml = '';
  if (currentList.length === 0) {
    listHtml = `
      <div class="empty-placeholder">
        <p>${emptyMsg}</p>
      </div>
    `;
    scorersListContainer.innerHTML = listHtml;
  } else {
    let currentRank = 1;
    let prevValue = -1;
    let rankToDisplay = 1;

    currentList.forEach((s, index) => {
      if (s.value !== prevValue) {
        currentRank = index + 1;
        prevValue = s.value;
        rankToDisplay = currentRank;
      }

      let rankClass = 'stats-rank-other';
      if (rankToDisplay === 1) rankClass = 'stats-rank-1st';
      else if (rankToDisplay === 2) rankClass = 'stats-rank-2nd';
      else if (rankToDisplay === 3) rankClass = 'stats-rank-3rd';

      const isHidden = index >= 10;
      const rowClass = isHidden ? 'stats-row scorer-row-hidden' : 'stats-row';
      const rowStyle = isHidden ? 'display: none !important;' : '';

      listHtml += `
        <div class="${rowClass}" style="${rowStyle}">
          <div class="stats-row-left">
            <span class="stats-rank ${rankClass}">${rankToDisplay}</span>
            <div class="stats-player-info">
              <span class="stats-player-name">${s.name}</span>
              <div class="stats-player-team">
                ${getFlagHtml(s.team)}
                <span>${s.team}</span>
              </div>
            </div>
          </div>
          <div class="stats-row-right">
            <span class="stats-goals-num">${s.value}</span>
            <span class="stats-goals-label">${s.label}</span>
          </div>
        </div>
      `;
    });

    scorersListContainer.innerHTML = listHtml;

    // Dynamically add or toggle the Load More button
    if (currentList.length > 10) {
      let btn = document.getElementById('btn-load-more-scorers');
      if (!btn) {
        btn = document.createElement('button');
        btn.id = 'btn-load-more-scorers';
        btn.className = 'btn-subtle-load-more';
        btn.setAttribute('style', 'width: calc(100% - 32px); padding: 10px; margin: 14px 16px 16px 16px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; color: var(--text-secondary); font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; letter-spacing: 0.5px;');
        btn.innerHTML = 'Lihat Lebih Banyak';
        btn.onclick = window.expandScorersList;
        scorersListContainer.parentNode.appendChild(btn);
      } else {
        btn.style.display = 'block';
        btn.innerHTML = 'Lihat Lebih Banyak';
        btn.setAttribute('data-expanded', 'false');
      }
    } else {
      const btn = document.getElementById('btn-load-more-scorers');
      if (btn) btn.style.display = 'none';
    }
  }

  const matchesPlayedEl = document.getElementById('stats-matches-played');
  const totalGoalsEl = document.getElementById('stats-total-goals');
  const avgGoalsEl = document.getElementById('stats-avg-goals');
  const topTeamEl = document.getElementById('stats-top-team');
  const totalRedCardsEl = document.getElementById('stats-total-red-cards');
  const totalOwnGoalsEl = document.getElementById('stats-total-own-goals');
  const biggestWinEl = document.getElementById('stats-biggest-win');
  const biggestWinSubEl = document.getElementById('stats-biggest-win-sub');
  const highestScoringEl = document.getElementById('stats-highest-scoring');

  if (matchesPlayedEl) matchesPlayedEl.textContent = matchesPlayed;
  if (totalGoalsEl) totalGoalsEl.textContent = totalGoals;
  if (avgGoalsEl) avgGoalsEl.textContent = matchesPlayed > 0 ? (totalGoals / matchesPlayed).toFixed(2) : "0.00";
  
  // Calculate top team (most goals) - supports multiple teams if tied
  let topTeams = [];
  let topTeamGoals = 0;
  Object.entries(teamGoalsMap).forEach(([team, goals]) => {
    if (goals > topTeamGoals) {
      topTeams = [team];
      topTeamGoals = goals;
    } else if (goals === topTeamGoals && goals > 0) {
      topTeams.push(team);
    }
  });

  if (topTeamEl) {
    if (topTeams.length > 0) {
      let html = '';
      topTeams.forEach(team => {
        html += `
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
            ${getFlagHtml(team)}
            <span style="font-size: 0.8rem; font-weight: 800; color: var(--text-primary);">${team} (${topTeamGoals} Gol)</span>
          </div>
        `;
      });
      topTeamEl.innerHTML = html;
    } else {
      topTeamEl.textContent = "-";
    }
  }

  if (totalRedCardsEl) totalRedCardsEl.textContent = totalRedCards;
  if (totalOwnGoalsEl) totalOwnGoalsEl.textContent = totalOwnGoals;
  if (biggestWinEl) {
    biggestWinEl.textContent = biggestWin.diff > 0 ? biggestWin.matchStr : '-';
  }
  if (biggestWinSubEl) {
    biggestWinSubEl.textContent = biggestWin.diff > 0 ? `Selisih +${biggestWin.diff} gol (${biggestWin.team})` : 'Selisih gol terbanyak';
  }
  if (highestScoringEl) {
    highestScoringEl.textContent = highestScoringMatch.total > 0 ? `${highestScoringMatch.matchStr} (${highestScoringMatch.total} Gol)` : '-';
  }
}

window.expandScorersList = function() {
  const hiddenRows = document.querySelectorAll('.scorer-row-hidden');
  const btn = document.getElementById('btn-load-more-scorers');
  if (!btn) return;
  
  const isExpanded = btn.getAttribute('data-expanded') === 'true';
  
  if (isExpanded) {
    hiddenRows.forEach(row => {
      row.style.setProperty('display', 'none', 'important');
    });
    btn.innerHTML = 'Lihat Lebih Banyak';
    btn.setAttribute('data-expanded', 'false');
  } else {
    hiddenRows.forEach(row => {
      row.style.setProperty('display', 'flex', 'important');
    });
    btn.innerHTML = 'Lihat Lebih Sedikit';
    btn.setAttribute('data-expanded', 'true');
  }
};

// Render Dashboard/Home tab nearest matches (2 Days from the first upcoming match day)
function getHeroMatch() {
  const now = Date.now();
  const allMatches = getAllMatches();

  const liveMatches = allMatches.filter(m => {
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const scoreData = getMatchScore(matchKey);
    return isMatchLive(m, scoreData);
  });

  if (liveMatches.length > 0) {
    liveMatches.sort((a, b) => compareMatchesPriority(a, b));
    return liveMatches[0];
  }

  return getNextMatch();
}

function isSameMatch(m1, m2) {
  if (!m1 || !m2) return false;
  if (m1.isKO !== m2.isKO) return false;
  if (m1.isKO) {
    return m1.match_id === m2.match_id;
  }
  return m1.date === m2.date && m1.team1 === m2.team1 && m1.team2 === m2.team2;
}

// Render Dashboard/Home tab nearest matches (2 Days from the first upcoming match day)
function renderNearestMatches() {
  recalculateKnockoutTree();
  const container = document.getElementById('nearest-matches-list');
  if (!container) return;

  const now = new Date();
  const nowTime = now.getTime();
  
  // Combine all matches
  const allMatches = getAllMatches();

  // Filter for upcoming/live matches (not finished yet, start time >= now, or currently live)
  const upcomingMatches = allMatches.filter(m => {
    if (m.isKO) {
      const isPlaceholder1 = !isRealTeamName(m.team1);
      const isPlaceholder2 = !isRealTeamName(m.team2);
      if (isPlaceholder1 || isPlaceholder2) return false;
    }
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const score = getMatchScore(matchKey);
    if (score && score.status === 'FINISHED') return false;
    const isLive = score && (score.status === 'IN_PLAY' || score.status === 'PAUSED' || score.status === 'EXTRA_TIME' || score.status === 'PENALTY_SHOOTOUT');
    return isLive || getMatchKickoffTime(m) >= nowTime;
  });

  let upcoming = [];

  if (upcomingMatches.length > 0) {
    // Sort upcoming matches chronologically using cached kickoff time
    const upcomingWithTime = upcomingMatches.map(m => ({
      match: m,
      time: getMatchKickoffTime(m)
    }));
    upcomingWithTime.sort((a, b) => a.time - b.time);
    const sortedUpcomingMatches = upcomingWithTime.map(x => x.match);

    // Get the date of the first upcoming match
    const earliestMatch = sortedUpcomingMatches[0];
    const day1Date = getMatchDate(earliestMatch.date, earliestMatch.time);
    const day2Date = new Date(day1Date);
    day2Date.setDate(day2Date.getDate() + 1);

    const day1Str = useLocalTimezone ? getLocalDateString(day1Date) : getWibDateString(day1Date);
    const day2Str = useLocalTimezone ? getLocalDateString(day2Date) : getWibDateString(day2Date);

    // Get matches on these two days from the already-filtered set.
    // Note: Since sortedUpcomingMatches is already sorted, filtering it preserves the chronological order.
    upcoming = sortedUpcomingMatches.filter(m => {
      const matchDateStr = getMatchDateString(m);
      return matchDateStr === day1Str || matchDateStr === day2Str;
    });
  } else {
    // Fallback: If no upcoming matches (e.g. tournament ended), show the last 3 matches (Semifinals, Final)
    upcoming = allMatches.slice(-3);
  }

  if (upcoming.length === 0) {
    container.innerHTML = `
      <div class="empty-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <p>Tidak ada pertandingan lainnya yang dijadwalkan.</p>
      </div>
    `;
    return;
  }

  // Filter out the hero match shown in countdown/live panel
  const heroMatch = getHeroMatch();
  if (heroMatch) {
    upcoming = upcoming.filter(m => !isSameMatch(m, heroMatch));
  }

  if (upcoming.length === 0) {
    container.innerHTML = `
      <div class="empty-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <p>Tidak ada pertandingan lainnya yang dijadwalkan.</p>
      </div>
    `;
    return;
  }

  let listHtml = '';
  upcoming.forEach(match => {
    listHtml += createMatchCardHtml(match, match.match_id || 0, match.isKO);
  });

  container.innerHTML = listHtml;
}

let _cachedNextMatch = null;
let _cachedNextMatchTime = 0;

function getNextMatch() {
  const now = Date.now();
  
  if (_cachedNextMatch && _cachedNextMatchTime > now) {
    return _cachedNextMatch;
  }
  
  const allMatches = getAllMatches();
  const upcoming = allMatches.filter(m => {
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const scoreData = getMatchScore(matchKey);
    if (scoreData && scoreData.status === 'FINISHED') return false;
    const matchTime = getMatchKickoffTime(m);
    return matchTime > now;
  });

  if (upcoming.length === 0) {
    _cachedNextMatch = null;
    _cachedNextMatchTime = 0;
    return null;
  }

  // Pre-calculate times to avoid calling getMatchKickoffTime repeatedly during sort
  const upcomingWithTime = upcoming.map(m => ({
    match: m,
    time: getMatchKickoffTime(m)
  }));

  upcomingWithTime.sort((a, b) => {
    if (a.time !== b.time) {
      return a.time - b.time;
    }
    return compareMatchesPriority(a.match, b.match);
  });

  _cachedNextMatch = upcomingWithTime[0].match;
  _cachedNextMatchTime = upcomingWithTime[0].time;
  return _cachedNextMatch;
}

function renderLiveMatches() {
  updateHeroPanel();
}

// Render Groups Tab
function renderGroups() {
  recalculateKnockoutTree();
  const container = document.getElementById('groups-grid');
  if (!container) return;

  let gridHtml = '';
  
  for (const groupLetter of "ABCDEFGHIJKL".split("")) {
    const groupName = `Grup ${groupLetter}`;
    const rankedTeams = groupRankings[groupName];

    let rowsHtml = '';
    
    rankedTeams.forEach((team, idx) => {
      const stats = teamStats[team] || { played: 0, gd: 0, pts: 0 };
      const gdSign = stats.gd > 0 ? `+${stats.gd}` : stats.gd;
      
      const rankClass = idx === 0 ? 'rank-1st' : (idx === 1 ? 'rank-2nd' : (idx === 2 ? 'rank-3rd' : 'rank-4th'));
      const rankSuffix = idx === 0 ? '1' : (idx === 1 ? '2' : (idx === 2 ? '3' : '4'));
      const teamWeightClass = idx < 2 ? 'team-bold' : '';

      rowsHtml += `
        <tr>
          <td class="group-rank-badge ${rankClass}" style="text-align: center; font-weight: 800;">${rankSuffix}</td>
          <td>
            <div class="team-cell">
              ${getFlagHtml(team)}
              <span class="team-name ${teamWeightClass}">${team}</span>
            </div>
          </td>
          <td style="text-align: center; font-weight: 600; opacity: 0.85;">${stats.played}</td>
          <td style="text-align: center; font-weight: 600; opacity: 0.85;">${gdSign}</td>
          <td style="text-align: center; font-weight: 700; color: ${idx < 2 ? 'var(--primary-gold)' : 'inherit'};">${stats.pts}</td>
        </tr>
      `;
    });

    const isGroupLive = WORLD_CUP_DATA.group_stage.some(m => {
      const matchGroup = m.group.replace('Grup ', '').trim();
      if (matchGroup !== groupLetter) return false;
      const matchKey = `gs_${m.date}_${m.team1}_${m.team2}`;
      const score = getMatchScore(matchKey);
      return isMatchLive(m, score);
    });

    gridHtml += `
      <div class="group-card">
        <div class="group-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>Grup ${groupLetter}</span>
          ${isGroupLive ? '<span style="font-size: 0.55rem; color: var(--accent-red); border: 1px solid rgba(239, 68, 68, 0.3); padding: 2px 6px; border-radius: 4px; font-weight: bold; letter-spacing: 0.5px; animation: pulse-blink 1.5s infinite;">LIVE</span>' : ''}
        </div>
        <table class="group-table">
          <thead>
            <tr>
              <th style="width: 10%; text-align: center;">#</th>
              <th style="text-align: left; width: 50%;">Tim</th>
              <th style="width: 13%; text-align: center;">M</th>
              <th style="width: 13%; text-align: center;">SG</th>
              <th style="width: 14%; text-align: center;">P</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }

  container.innerHTML = gridHtml;

  // Render best 3rd placed standings
  renderBestThirds();
}

// ----------------------------------------------------
// BRACKET SIMULATION STATE MANAGEMENT & CALCULATIONS
// ----------------------------------------------------

// Swaps team index in group standing rank list
window.moveGroupTeam = function(groupName, index, direction) {
  // Disabled - purely informational platform
  return;
};

// DFS matching algorithm to align the 8 qualifying third-placed teams to matches
function solveThirdsAssignment(matchesNeed3rd, qualifyingThirds) {
  const assignment = {};
  const used = new Set();

  // Step 1: Pre-assign groups for matches that are already resolved in the real scores API
  matchesNeed3rd.forEach(m => {
    const isTeam1_3rd = m.team1_seed === '3rd';
    const apiMatchData = realScores[`ko_${m.match_id}`];
    if (apiMatchData) {
      const apiTeamName = isTeam1_3rd ? apiMatchData.home_team_name_en : apiMatchData.away_team_name_en;
      if (apiTeamName && isRealTeamName(apiTeamName)) {
        const normalized = TEAM_TRANSLATIONS[apiTeamName] || apiTeamName;
        // Find which group contains this team
        for (const [groupName, teamList] of Object.entries(groupRankings)) {
          if (teamList && teamList.includes(normalized)) {
            assignment[m.match_id] = groupName;
            used.add(groupName);
            break;
          }
        }
      }
    }
  });

  // Filter out matches that have already been assigned from the API
  const unassignedMatches = matchesNeed3rd.filter(m => !assignment[m.match_id]);
  
  function dfs(matchIdx) {
    if (matchIdx === unassignedMatches.length) {
      return true;
    }
    const m = unassignedMatches[matchIdx];
    const label = m.team1_seed === '3rd' ? m.team1 : m.team2;
    const eligible = getEligibleGroupsFor3rd(label);
    
    for (const group of eligible) {
      if (qualifyingThirds.includes(group) && !used.has(group)) {
        used.add(group);
        assignment[m.match_id] = group;
        if (dfs(matchIdx + 1)) {
          return true;
        }
        used.delete(group);
        delete assignment[m.match_id];
      }
    }
    return false;
  }
  
  if (dfs(0)) {
    return assignment;
  }
  
  // Fallback greedy matching if DFS fails (should not happen for valid combinations)
  const fallbackAssignment = { ...assignment };
  const fallbackUsed = new Set(used);
  unassignedMatches.forEach(m => {
    const label = m.team1_seed === '3rd' ? m.team1 : m.team2;
    const eligible = getEligibleGroupsFor3rd(label);
    for (const group of eligible) {
      if (qualifyingThirds.includes(group) && !fallbackUsed.has(group)) {
        fallbackUsed.add(group);
        fallbackAssignment[m.match_id] = group;
        break;
      }
    }
  });
  return fallbackAssignment;
}

// Helper to calculate head-to-head stats (points, GD, GF) for a subset of tied teams
function getH2HStats(teams) {
  const stats = {};
  teams.forEach(t => {
    stats[t] = { pts: 0, gd: 0, gf: 0 };
  });
  WORLD_CUP_DATA.group_stage.forEach(m => {
    if (teams.includes(m.team1) && teams.includes(m.team2)) {
      const matchKey = `gs_${m.date}_${m.team1}_${m.team2}`;
      const score = getMatchScore(matchKey);
      if (score && (score.status === 'FINISHED' || score.status === 'IN_PLAY' || score.status === 'PAUSED' || score.status === 'EXTRA_TIME' || score.status === 'PENALTY_SHOOTOUT')) {
        const s1 = parseInt(score.score1);
        const s2 = parseInt(score.score2);
        if (!isNaN(s1) && !isNaN(s2)) {
          stats[m.team1].gf += s1;
          stats[m.team1].gd += (s1 - s2);
          stats[m.team2].gf += s2;
          stats[m.team2].gd += (s2 - s1);
          if (s1 > s2) {
            stats[m.team1].pts += 3;
          } else if (s2 > s1) {
            stats[m.team2].pts += 3;
          } else {
            stats[m.team1].pts += 1;
            stats[m.team2].pts += 1;
          }
        }
      }
    }
  });
  return stats;
}

// Helper to sort group teams based on overall standings and resolve ties with H2H/FIFA rankings
function sortGroupTeams(teamList, overallStats) {
  // First sort by overall stats (Points -> GD -> GF)
  const sorted = [...teamList].sort((a, b) => {
    const statsA = overallStats[a] || { pts: 0, gd: 0, gf: 0 };
    const statsB = overallStats[b] || { pts: 0, gd: 0, gf: 0 };
    if (statsB.pts !== statsA.pts) return statsB.pts - statsA.pts;
    if (statsB.gd !== statsA.gd) return statsB.gd - statsA.gd;
    if (statsB.gf !== statsA.gf) return statsB.gf - statsA.gf;
    return 0; // Maintain tie for head-to-head resolution
  });

  // Resolve tied blocks using H2H stats
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (j < sorted.length) {
      const a = sorted[i];
      const b = sorted[j];
      const statsA = overallStats[a] || { pts: 0, gd: 0, gf: 0 };
      const statsB = overallStats[b] || { pts: 0, gd: 0, gf: 0 };
      if (statsA.pts === statsB.pts && statsA.gd === statsB.gd && statsA.gf === statsB.gf) {
        j++;
      } else {
        break;
      }
    }

    const tiedCount = j - i;
    if (tiedCount > 1) {
      const tiedTeams = sorted.slice(i, j);
      const h2h = getH2HStats(tiedTeams);
      
      tiedTeams.sort((a, b) => {
        const h2hA = h2h[a] || { pts: 0, gd: 0, gf: 0 };
        const h2hB = h2h[b] || { pts: 0, gd: 0, gf: 0 };
        if (h2hB.pts !== h2hA.pts) return h2hB.pts - h2hA.pts;
        if (h2hB.gd !== h2hA.gd) return h2hB.gd - h2hA.gd;
        if (h2hB.gf !== h2hA.gf) return h2hB.gf - h2hA.gf;

        // Fallback to FIFA Rankings (lower rank number is better)
        const rankA = FIFA_RANKINGS[a] !== undefined ? FIFA_RANKINGS[a] : 999;
        const rankB = FIFA_RANKINGS[b] !== undefined ? FIFA_RANKINGS[b] : 999;
        if (rankA !== rankB) return rankA - rankB;

        // Final alphabetical fallback
        return a.localeCompare(b);
      });

      // Put sorted tied teams back into the array
      for (let k = 0; k < tiedCount; k++) {
        sorted[i + k] = tiedTeams[k];
      }
    }
    i = j;
  }
  return sorted;
}

function calculateOfficialGroupStandings() {
  let officialGroupsData = null;
  try {
    officialGroupsData = JSON.parse(localStorage.getItem('wc2026_api_groups_data'));
  } catch (e) {
    console.error("Failed to parse official standings in calculateOfficialGroupStandings:", e);
  }

  if (!officialGroupsData || !officialGroupsData.children) {
    return false; // Fall back to local simulator
  }

  const getStat = (entry, statName) => {
    if (!entry.stats) return 0;
    const s = entry.stats.find(st => st.name === statName);
    return s ? s.value : 0;
  };

  // Reset teamStats
  teamStats = {};

  for (const groupLetter of "ABCDEFGHIJKL".split("")) {
    const groupName = `Grup ${groupLetter}`;
    
    const espnGroup = officialGroupsData.children.find(g => 
      g.name && g.name.toLowerCase().replace('group ', '').trim() === groupLetter.toLowerCase()
    );

    if (espnGroup && espnGroup.standings && espnGroup.standings.entries) {
      let teamsList = espnGroup.standings.entries.map((entry, idx) => {
        const rawName = entry.team.displayName;
        const teamName = TEAM_TRANSLATIONS[rawName] || rawName;
        
        return {
          teamName,
          played: getStat(entry, 'gamesPlayed'),
          wins: getStat(entry, 'wins'),
          draws: getStat(entry, 'ties'),
          losses: getStat(entry, 'losses'),
          gf: getStat(entry, 'pointsFor'),
          ga: getStat(entry, 'pointsAgainst'),
          gd: getStat(entry, 'pointDifferential'),
          pts: getStat(entry, 'points'),
          isLiveAdjusted: false,
          originalIndex: idx
        };
      });

      // Apply virtual standings updates for matches that are live or finished but not yet reflected in ESPN standings
      teamsList.forEach(teamObj => {
        const tName = teamObj.teamName;
        
        const playedMatchesForTeam = WORLD_CUP_DATA.group_stage.filter(m => {
          const matchGroup = m.group.replace('Grup ', '').trim();
          if (matchGroup !== groupLetter) return false;
          if (m.team1 !== tName && m.team2 !== tName) return false;
          
          const matchKey = `gs_${m.date}_${m.team1}_${m.team2}`;
          const scoreData = getMatchScore(matchKey);
          return scoreData !== null && scoreData !== undefined;
        });

        playedMatchesForTeam.sort((a, b) => {
          return getMatchDate(a.date, a.time).getTime() - getMatchDate(b.date, b.time).getTime();
        });

        const Y = playedMatchesForTeam.length;
        const X = teamObj.played;

        if (Y > X) {
          const unreflectedMatches = playedMatchesForTeam.slice(X);
          unreflectedMatches.forEach(m => {
            const matchKey = `gs_${m.date}_${m.team1}_${m.team2}`;
            const scoreData = getMatchScore(matchKey);
            if (!scoreData) return;

            const isLive = isMatchLive(m, scoreData);
            if (isLive) {
              teamObj.isLiveAdjusted = true;
            }

            const isHome = m.team1 === tName;
            const s1 = parseInt(isHome ? scoreData.score1 : scoreData.score2) || 0;
            const s2 = parseInt(isHome ? scoreData.score2 : scoreData.score1) || 0;

            teamObj.played += 1;
            teamObj.gf += s1;
            teamObj.ga += s2;
            teamObj.gd += (s1 - s2);

            if (s1 > s2) {
              teamObj.wins += 1;
              teamObj.pts += 3;
            } else if (s1 < s2) {
              teamObj.losses += 1;
            } else {
              teamObj.draws += 1;
              teamObj.pts += 1;
            }
          });
        }
      });

      // Sort virtual standings using standard tie-breakers (H2H, FIFA rankings, etc.)
      const teamNames = teamsList.map(t => t.teamName);
      const tempStats = {};
      teamsList.forEach(t => {
        tempStats[t.teamName] = { pts: t.pts, gd: t.gd, gf: t.gf };
      });
      const sortedNames = sortGroupTeams(teamNames, tempStats);
      teamsList.sort((a, b) => sortedNames.indexOf(a.teamName) - sortedNames.indexOf(b.teamName));

      // Save to groupRankings and teamStats
      groupRankings[groupName] = teamsList.map(t => t.teamName);
      teamsList.forEach(t => {
        teamStats[t.teamName] = {
          played: t.played,
          won: t.wins,
          drawn: t.draws,
          lost: t.losses,
          gf: t.gf,
          ga: t.ga,
          gd: t.gd,
          pts: t.pts
        };
      });
    }
  }

  return true;
}

function calculateGroupStandings() {
  let success = false;
  if (standingsSource === 'official') {
    success = calculateOfficialGroupStandings();
  }

  if (!success) {
    // Initialize stats for all teams in groups
    teamStats = {};
    for (const [groupName, teamList] of Object.entries(groups)) {
      teamList.forEach(team => {
        teamStats[team] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      });
    }

    // Calculate from real scores
    WORLD_CUP_DATA.group_stage.forEach(m => {
      const matchKey = `gs_${m.date}_${m.team1}_${m.team2}`;
      const score = getMatchScore(matchKey);
      if (score && (score.status === 'FINISHED' || score.status === 'IN_PLAY' || score.status === 'PAUSED' || score.status === 'EXTRA_TIME' || score.status === 'PENALTY_SHOOTOUT')) {
        const s1 = score.score1;
        const s2 = score.score2;
        
        if (s1 !== null && s2 !== null && s1 !== undefined && s2 !== undefined) {
          teamStats[m.team1].played++;
          teamStats[m.team2].played++;
          
          teamStats[m.team1].gf += s1;
          teamStats[m.team1].ga += s2;
          teamStats[m.team2].gf += s2;
          teamStats[m.team2].ga += s1;
          
          if (s1 > s2) {
            teamStats[m.team1].won++;
            teamStats[m.team1].pts += 3;
            teamStats[m.team2].lost++;
          } else if (s1 < s2) {
            teamStats[m.team2].won++;
            teamStats[m.team2].pts += 3;
            teamStats[m.team1].lost++;
          } else {
            teamStats[m.team1].drawn++;
            teamStats[m.team1].pts += 1;
            teamStats[m.team2].drawn++;
            teamStats[m.team2].pts += 1;
          }
        }
      }
    });

    // Calculate Goal Difference and sort groupRankings using H2H / FIFA rankings tie-breakers
    for (const [groupName, teamList] of Object.entries(groups)) {
      teamList.forEach(team => {
        teamStats[team].gd = teamStats[team].gf - teamStats[team].ga;
      });
      groupRankings[groupName] = sortGroupTeams(teamList, teamStats);
    }
  }

  // Calculate best 3rd placed teams and match them to Round of 32 slots automatically
  const thirds = [];
  for (const [groupName, teamList] of Object.entries(groupRankings)) {
    if (teamList && teamList[2]) {
      const team = teamList[2]; // 3rd placed team is at index 2
      const stats = teamStats[team] || { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      thirds.push({ group: groupName, pts: stats.pts, gd: stats.gd, gf: stats.gf, won: stats.won });
    }
  }

  // Sort thirds
  thirds.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    if (b.won !== a.won) return b.won - a.won;
    return a.group.localeCompare(b.group);
  });

  // Top 8 qualifying groups
  const qualifyingThirdGroups = thirds.slice(0, 8).map(t => t.group);

  // Find matches that need a 3rd placed team
  const matchesNeed3rd = WORLD_CUP_DATA.knockout_stage.filter(m => m.team1_seed === '3rd' || m.team2_seed === '3rd');

  // Solve assignment automatically
  selected3rdPlaces = solveThirdsAssignment(matchesNeed3rd, qualifyingThirdGroups);

  // Save updated rankings to localStorage
  localStorage.setItem('wc2026_group_rankings', JSON.stringify(groupRankings));
  localStorage.setItem('wc2026_selected_3rd_places', JSON.stringify(selected3rdPlaces));
}

// Function to render the Best 3rd Placed Standings table
function renderBestThirds() {
  const container = document.getElementById('best-thirds-table-container');
  if (!container) return;

  // Collect 3rd placed teams from each of the 12 groups
  const thirds = [];
  for (const [groupName, teamList] of Object.entries(groupRankings)) {
    if (teamList && teamList[2]) {
      const team = teamList[2]; // 3rd placed team is at index 2
      const stats = teamStats[team] || { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      thirds.push({
        group: groupName,
        team: team,
        played: stats.played,
        won: stats.won,
        drawn: stats.drawn,
        lost: stats.lost,
        gf: stats.gf,
        ga: stats.ga,
        gd: stats.gd,
        pts: stats.pts
      });
    }
  }

  // Sort: Points -> GD -> GF -> Won -> Alphabetical Group Letter
  thirds.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    if (b.won !== a.won) return b.won - a.won;
    return a.group.localeCompare(b.group);
  });

  let rowsHtml = '';
  thirds.forEach((t, idx) => {
    const isQualified = idx < 8;
    const rankClass = isQualified ? 'rank-1st' : 'rank-4th';
    const statusBadge = isQualified 
      ? '<span class="status-badge lolos">LOLOS</span>'
      : '<span class="status-badge gugur">GUGUR</span>';
    
    const gdSign = t.gd > 0 ? `+${t.gd}` : t.gd;

    rowsHtml += `
      <tr style="background: ${isQualified ? 'rgba(16, 185, 129, 0.01)' : 'rgba(239, 68, 68, 0.01)'}">
        <td class="group-rank-badge ${rankClass}" style="text-align: center; font-weight: 800;">${idx + 1}</td>
        <td style="text-align: center; font-weight: 700; color: var(--primary-gold);">${t.group.replace("Grup ", "")}</td>
        <td>
          <div class="team-cell">
            ${getFlagHtml(t.team)}
            <span class="team-name ${isQualified ? 'team-bold' : ''}" style="max-width: 160px;">${t.team}</span>
          </div>
        </td>
        <td style="text-align: center; font-weight: 600; opacity: 0.85;">${t.played}</td>
        <td style="text-align: center; font-weight: 600; opacity: 0.85;">${gdSign}</td>
        <td style="text-align: center; font-weight: 700; color: ${isQualified ? 'var(--primary-gold)' : 'inherit'};">${t.pts}</td>
        <td style="text-align: center;">${statusBadge}</td>
      </tr>
    `;
  });

  container.innerHTML = `
    <table class="group-table">
      <thead>
        <tr>
          <th style="width: 8%; text-align: center;">Pos</th>
          <th style="width: 10%; text-align: center;">Grup</th>
          <th style="text-align: left; width: 42%;">Tim</th>
          <th style="width: 10%; text-align: center;">M</th>
          <th style="width: 10%; text-align: center;">SG</th>
          <th style="width: 10%; text-align: center;">P</th>
          <th style="width: 10%; text-align: center;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;
}

// Main function to dynamically trace standing ranks and calculate bracket teams
function recalculateKnockoutTree() {
  if (!isDataDirty) return;
  // Calculate standings from scores first
  calculateGroupStandings();

  // Clear working copy matches (shallow clone is safe — match objects are flat)
  knockoutMatches = WORLD_CUP_DATA.knockout_stage.map(m => ({...m}));
  _cachedAllMatches = null; // Invalidate cached allMatches since knockoutMatches changed
  _cachedNextMatch = null;  // Invalidate cached next match

  // STEP 1: Evaluate Round of 32 starting participants based on group rankings and 3rd place selections (Always evaluate dynamically)
  knockoutMatches.forEach(m => {
    if (m.group !== "Round of 32") return;

    const apiMatchData = realScores[`ko_${m.match_id}`];

    // Check seed 1 (Home/team1)
    let team1SetFromApi = false;
    if (apiMatchData && apiMatchData.home_team_name_en) {
      const apiHomeName = apiMatchData.home_team_name_en;
      if (isRealTeamName(apiHomeName)) {
        m.team1 = TEAM_TRANSLATIONS[apiHomeName] || apiHomeName;
        team1SetFromApi = true;
      }
    }

    if (!team1SetFromApi) {
      if (m.team1_seed && (
          m.team1_seed.endsWith('A') || m.team1_seed.endsWith('B') || m.team1_seed.endsWith('C') || m.team1_seed.endsWith('D') || 
          m.team1_seed.endsWith('E') || m.team1_seed.endsWith('F') || m.team1_seed.endsWith('G') || m.team1_seed.endsWith('H') || 
          m.team1_seed.endsWith('I') || m.team1_seed.endsWith('J') || m.team1_seed.endsWith('K') || m.team1_seed.endsWith('L')
      )) {
        const rank = m.team1_seed.charAt(0); // '1' or '2'
        const groupLetter = m.team1_seed.charAt(1); // 'A' to 'L'
        const groupName = `Grup ${groupLetter}`;
        const idx = rank === '1' ? 0 : 1;
        
        const hasRealScore = getMatchScore(`ko_${m.match_id}`);
        if (showPotentialDraw || hasRealScore || isGroupStageComplete() || isGroupComplete(groupLetter)) {
          if (groupRankings[groupName] && groupRankings[groupName][idx]) {
            m.team1 = groupRankings[groupName][idx];
          } else {
            m.team1 = `${rank === '1' ? 'Juara' : 'Runner-up'} ${groupName}`;
          }
        } else {
          m.team1 = `${rank === '1' ? 'Juara' : 'Runner-up'} ${groupName}`;
        }
      } else if (m.team1_seed === '3rd') {
        // 3rd placed team choice
        const selectedGroup = selected3rdPlaces[m.match_id];
        const hasRealScore = getMatchScore(`ko_${m.match_id}`);
        if (showPotentialDraw || hasRealScore || isGroupStageComplete()) {
          if (selectedGroup && groupRankings[selectedGroup] && groupRankings[selectedGroup][2]) {
            m.team1 = groupRankings[selectedGroup][2]; // 3rd placed team is at index 2
          } else {
            const orig = WORLD_CUP_DATA.knockout_stage.find(ok => ok.match_id === m.match_id);
            m.team1 = orig ? orig.team1 : "3rd Grup";
          }
        } else {
          const orig = WORLD_CUP_DATA.knockout_stage.find(ok => ok.match_id === m.match_id);
          m.team1 = orig ? orig.team1 : "3rd Grup";
        }
      }
    }

    // Check seed 2 (Away/team2)
    let team2SetFromApi = false;
    if (apiMatchData && apiMatchData.away_team_name_en) {
      const apiAwayName = apiMatchData.away_team_name_en;
      if (isRealTeamName(apiAwayName)) {
        m.team2 = TEAM_TRANSLATIONS[apiAwayName] || apiAwayName;
        team2SetFromApi = true;
      }
    }

    if (!team2SetFromApi) {
      if (m.team2_seed && (
          m.team2_seed.endsWith('A') || m.team2_seed.endsWith('B') || m.team2_seed.endsWith('C') || m.team2_seed.endsWith('D') || 
          m.team2_seed.endsWith('E') || m.team2_seed.endsWith('F') || m.team2_seed.endsWith('G') || m.team2_seed.endsWith('H') || 
          m.team2_seed.endsWith('I') || m.team2_seed.endsWith('J') || m.team2_seed.endsWith('K') || m.team2_seed.endsWith('L')
      )) {
        const rank = m.team2_seed.charAt(0); // '1' or '2'
        const groupLetter = m.team2_seed.charAt(1); // 'A' to 'L'
        const groupName = `Grup ${groupLetter}`;
        const idx = rank === '1' ? 0 : 1;
        
        const hasRealScore = getMatchScore(`ko_${m.match_id}`);
        if (showPotentialDraw || hasRealScore || isGroupStageComplete() || isGroupComplete(groupLetter)) {
          if (groupRankings[groupName] && groupRankings[groupName][idx]) {
            m.team2 = groupRankings[groupName][idx];
          } else {
            m.team2 = `${rank === '1' ? 'Juara' : 'Runner-up'} ${groupName}`;
          }
        } else {
          m.team2 = `${rank === '1' ? 'Juara' : 'Runner-up'} ${groupName}`;
        }
      } else if (m.team2_seed === '3rd') {
        // 3rd placed team choice
        const selectedGroup = selected3rdPlaces[m.match_id];
        const hasRealScore = getMatchScore(`ko_${m.match_id}`);
        if (showPotentialDraw || hasRealScore || isGroupStageComplete()) {
          if (selectedGroup && groupRankings[selectedGroup] && groupRankings[selectedGroup][2]) {
            m.team2 = groupRankings[selectedGroup][2]; // 3rd placed team
          } else {
            const orig = WORLD_CUP_DATA.knockout_stage.find(ok => ok.match_id === m.match_id);
            m.team2 = orig ? orig.team2 : "3rd Grup";
          }
        } else {
          const orig = WORLD_CUP_DATA.knockout_stage.find(ok => ok.match_id === m.match_id);
          m.team2 = orig ? orig.team2 : "3rd Grup";
        }
      }
    }
  });

  // STEP 2: Propagate decisions sequentially (Match 73 up to Match 104)
  const sortedKO = [...knockoutMatches].sort((a, b) => a.match_id - b.match_id);

  sortedKO.forEach(m => {
    let winner = simulatedWinners[m.match_id];
    if (winner && winner !== m.team1 && winner !== m.team2) {
      delete simulatedWinners[m.match_id];
      winner = undefined;
    }
    
    // Find who the loser is if a winner was selected
    let loser = "";
    if (winner) {
      if (m.team1 === winner) loser = m.team2;
      else if (m.team2 === winner) loser = m.team1;
    }

    // Propagate Winner
    const nextMatchForWinner = knockoutMatches.find(nxt => nxt.team1_seed === `W${m.match_id}` || nxt.team2_seed === `W${m.match_id}`);
    if (nextMatchForWinner) {
      const side = nextMatchForWinner.team1_seed === `W${m.match_id}` ? 'team1' : 'team2';
      
      // If winner exists and both competitor names are known (not placeholders)
      if (winner && isRealTeamName(m.team1) && isRealTeamName(m.team2)) {
        nextMatchForWinner[side] = winner;
      } else {
        // Reset slot to placeholder name
        nextMatchForWinner[side] = `Winner Match ${m.match_id}`;
        // Clear selection downstream if it was decided
        if (simulatedWinners[nextMatchForWinner.match_id]) {
          delete simulatedWinners[nextMatchForWinner.match_id];
        }
      }
    }

    // Propagate Loser (Specifically for 3rd Place Match, which depends on SF L101 and L102)
    const nextMatchForLoser = knockoutMatches.find(nxt => nxt.team1_seed === `L${m.match_id}` || nxt.team2_seed === `L${m.match_id}`);
    if (nextMatchForLoser) {
      const side = nextMatchForLoser.team1_seed === `L${m.match_id}` ? 'team1' : 'team2';
      if (winner && loser && isRealTeamName(m.team1) && isRealTeamName(m.team2)) {
        nextMatchForLoser[side] = loser;
      } else {
        nextMatchForLoser[side] = `Loser Match ${m.match_id}`;
        if (simulatedWinners[nextMatchForLoser.match_id]) {
          delete simulatedWinners[nextMatchForLoser.match_id];
        }
      }
    }
  });

  // Keep simulated winners & 3rd places synced with localStorage
  localStorage.setItem('wc2026_simulated_winners', JSON.stringify(simulatedWinners));
  localStorage.setItem('wc2026_selected_3rd_places', JSON.stringify(selected3rdPlaces));
  isDataDirty = false;
}

// ----------------------------------------------------
// BRACKET SIMULATION RENDERING
// ----------------------------------------------------

// Formatter to translate placeholder teams into clean Indonesian labels
function formatPlaceholderName(name) {
  return name
    .replace("Winner Match", "Pemenang M")
    .replace("Loser Match", "Kalah M")
    .replace("Winner Group", "Juara Grup")
    .replace("Runner-up Group", "Runner-up Grup")
    .replace("3rd Group", "Peringkat 3");
}

const TEAM_CODES = {
  "Meksiko": "MEX",
  "Afrika Selatan": "RSA",
  "Korea Selatan": "KOR",
  "Ceko": "CZE",
  "Kanada": "CAN",
  "Bosnia dan Herzegovina": "BIH",
  "Qatar": "QAT",
  "Swiss": "SWI",
  "Brasil": "BRA",
  "Maroko": "MAR",
  "Haiti": "HAI",
  "Skotlandia": "SCO",
  "Amerika Serikat": "USA",
  "Paraguay": "PAR",
  "Australia": "AUS",
  "Turki": "TUR",
  "Jerman": "GER",
  "Curaçao": "CUW",
  "Belanda": "NED",
  "Jepang": "JPN",
  "Pantai Gading": "CIV",
  "Ekuador": "ECU",
  "Swedia": "SWE",
  "Tunisia": "TUN",
  "Spanyol": "SPA",
  "Tanjung Verde": "CPV",
  "Belgia": "BEL",
  "Mesir": "EGY",
  "Arab Saudi": "KSA",
  "Uruguay": "URU",
  "Iran": "IRN",
  "Selandia Baru": "NZL",
  "Prancis": "FRA",
  "Senegal": "SEN",
  "Irak": "IRQ",
  "Norwegia": "NOR",
  "Argentina": "ARG",
  "Aljazair": "ALG",
  "Austria": "AUT",
  "Yordania": "JOR",
  "Portugal": "POR",
  "RD Kongo": "COD",
  "Inggris": "ENG",
  "Kroasia": "CRO",
  "Ghana": "GHA",
  "Panama": "PAN",
  "Uzbekistan": "UZB",
  "Kolombia": "COL"
};

function getTeamCode(teamName) {
  if (!teamName) return "";
  if (TEAM_CODES[teamName]) {
    return TEAM_CODES[teamName];
  }
  const clean = teamName.trim();
  if (TEAM_CODES[clean]) return TEAM_CODES[clean];

  const lower = clean.toLowerCase();

  if (clean.startsWith("Juara Grup ")) {
    return "1" + clean.replace("Juara Grup ", "");
  }
  if (clean.startsWith("Runner-up Grup ")) {
    return "2" + clean.replace("Runner-up Grup ", "");
  }
  if (clean.startsWith("3rd Grup ")) {
    return "3RD " + clean.replace("3rd Grup ", "");
  }
  if (clean.startsWith("3rd Group ")) {
    return "3RD " + clean.replace("3rd Group ", "");
  }
  if (lower.startsWith("third place group ")) {
    return "3RD " + clean.substring(18);
  }
  if (lower.startsWith("third place grup ")) {
    return "3RD " + clean.substring(17);
  }
  if (lower.startsWith("group ") && lower.endsWith(" winner")) {
    return "1" + clean.substring(6, clean.length - 7);
  }
  if (lower.startsWith("grup ") && lower.endsWith(" winner")) {
    return "1" + clean.substring(5, clean.length - 7);
  }
  if (lower.startsWith("group ") && lower.endsWith(" 2nd place")) {
    return "2" + clean.substring(6, clean.length - 10);
  }
  if (lower.startsWith("grup ") && lower.endsWith(" 2nd place")) {
    return "2" + clean.substring(5, clean.length - 10);
  }
  if (clean.startsWith("Winner Match ")) {
    return "W" + clean.replace("Winner Match ", "");
  }
  if (clean.startsWith("Loser Match ")) {
    return "L" + clean.replace("Loser Match ", "");
  }
  if (clean.startsWith("Pemenang M")) {
    return "W" + clean.replace("Pemenang M", "");
  }
  if (clean.startsWith("Kalah M")) {
    return "L" + clean.replace("Kalah M", "");
  }
  return clean.substring(0, 3).toUpperCase();
}

function getTeamColor(teamName, isAway = false) {
  if (window.TEAM_COLORS && window.TEAM_COLORS[teamName]) {
    return window.TEAM_COLORS[teamName];
  }
  if (teamName) {
    const cleanName = teamName.trim().toLowerCase();
    for (const key in window.TEAM_COLORS) {
      if (cleanName.includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName)) {
        return window.TEAM_COLORS[key];
      }
    }
  }
  return "transparent";
}

function getTeamGradientCss(teamColorsOrColor) {
  if (Array.isArray(teamColorsOrColor)) {
    if (teamColorsOrColor.length === 1) {
      return teamColorsOrColor[0];
    }
    if (teamColorsOrColor.length === 2) {
      // Balanced 50-50 split with a soft 10% transition area
      const color1 = teamColorsOrColor[0];
      const color2 = teamColorsOrColor[1];
      return `linear-gradient(180deg, ${color1} 0%, ${color1} 45%, ${color2} 55%, ${color2} 100%)`;
    }
    if (teamColorsOrColor.length >= 3) {
      // Balanced 33-33-33 split with soft 6% transition areas
      const color1 = teamColorsOrColor[0];
      const color2 = teamColorsOrColor[1];
      const color3 = teamColorsOrColor[2];
      return `linear-gradient(180deg, ${color1} 0%, ${color1} 30%, ${color2} 36%, ${color2} 63%, ${color3} 70%, ${color3} 100%)`;
    }
  }
  return teamColorsOrColor;
}



const BASE_COMPACT_COORDINATES = {
  // Left Wing (Outer Left R32, Column 2 Upper R16, Stack Top R16 & QF)
  73: { x: 30, y: 220 },  // Column 1 upper top (aligned for fork center)
  75: { x: 30, y: 300 },  // Column 1 upper bottom (aligned for fork center)
  83: { x: 30, y: 420 },  // Column 1 lower top (aligned for fork center)
  84: { x: 30, y: 500 },  // Column 1 lower bottom (aligned for fork center)
  
  89: { x: 290, y: 170 }, // Stack Top R16
  90: { x: 160, y: 260 }, // Column 2 Upper R16 (centered & balanced)
  97: { x: 290, y: 260 }, // Stack QF Upper (balanced)
 
  // Top Wing (Top and Bottom Horizontal R32 Matches, and Stack Bottom R16 & QF)
  74: { x: 200, y: 80 },  // Top horizontal left (GER)
  77: { x: 380, y: 80 },  // Top horizontal right (FRA)
  81: { x: 200, y: 640 }, // Bottom horizontal left (USA)
  82: { x: 380, y: 640 }, // Bottom horizontal right (BEL)
  
  93: { x: 160, y: 460 }, // Column 2 Lower R16 (centered & balanced)
  94: { x: 290, y: 550 }, // Stack Bottom R16
  98: { x: 290, y: 460 }, // Stack QF Lower (balanced)

  // Right Wing (Outer Right R32, Column 6 Upper R16, Stack Top Right R16 & QF)
  76: { x: 496, y: 80 },  // Top-right horizontal left (BRA)
  78: { x: 676, y: 80 },  // Top-right horizontal right (ECU)
  79: { x: 846, y: 220 }, // Column 7 upper top (aligned for fork center)
  80: { x: 846, y: 300 }, // Column 7 upper bottom (aligned for fork center)
  
  91: { x: 586, y: 170 }, // Stack Top Right R16
  92: { x: 716, y: 260 }, // Column 6 Upper R16 (centered & balanced)
  99: { x: 586, y: 260 }, // Stack QF Upper Right (balanced)

  // Bottom Wing (Column 7 lower R32, Bottom-right horizontal R32)
  88: { x: 846, y: 420 }, // Column 7 lower top (aligned for fork center)
  86: { x: 846, y: 500 }, // Column 7 lower bottom (aligned for fork center)
  87: { x: 496, y: 640 }, // Bottom-right horizontal left (Juara Grup K vs 3rd)
  85: { x: 676, y: 640 }, // Bottom-right horizontal right (Swiss vs 3rd)
  
  95: { x: 716, y: 460 }, // Column 6 Lower R16 (centered & balanced)
  96: { x: 586, y: 550 }, // Stack Bottom R16 Right
  100: { x: 586, y: 460 }, // Stack QF Lower Right (balanced)

  // Center (Semifinals, Final, Juara 3)
  101: { x: 290, y: 360 }, // Semifinal 1 (Left)
  102: { x: 586, y: 360 }, // Semifinal 2 (Right)
  104: { x: 438, y: 360 }, // Final (Center)
  103: { x: 438, y: 440 }  // Juara 3 (Bottom Center)
};

const COMPACT_COORDINATES = {};
for (const [id, coords] of Object.entries(BASE_COMPACT_COORDINATES)) {
  COMPACT_COORDINATES[id] = {
    x: Math.round(coords.x * 0.58),
    y: coords.y
  };
}

// Formatter to translate date string "29/6" into "29 Jun"
function formatCompactMatchDate(dateStr) {
  if (!dateStr) return "";
  const [day, month] = dateStr.split('/').map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  return `${day} ${months[month - 1]}`;
}

// Extractor to get only the city name from venue (e.g. "SoFi Stadium, Inglewood" -> "Inglewood")
function getVenueCity(venueStr) {
  if (!venueStr) return "";
  const parts = venueStr.split(',');
  return parts.length > 1 ? parts[1].trim() : venueStr.trim();
}

// Extractor to get only the stadium name from venue (e.g. "SoFi Stadium, Inglewood" -> "SoFi Stadium")
function getVenueStadium(venueStr) {
  if (!venueStr) return "";
  const parts = venueStr.split(',');
  return parts[0].trim();
}

function getMatchTooltipHtml(m) {
  const isPlaceholder1 = !isRealTeamName(m.team1);
  const isPlaceholder2 = !isRealTeamName(m.team2);
  
  const team1Name = isPlaceholder1 ? formatPlaceholderName(m.team1 || 'TBD') : (m.team1 || 'TBD');
  const team2Name = isPlaceholder2 ? formatPlaceholderName(m.team2 || 'TBD') : (m.team2 || 'TBD');
  
  const apiMatchData = realScores[`ko_${m.match_id}`];
  let score1 = '';
  let score2 = '';
  if (apiMatchData && apiMatchData.score1 !== undefined && apiMatchData.score1 !== null) {
    score1 = apiMatchData.score1;
    score2 = apiMatchData.score2;
  }
  
  const winner = simulatedWinners[m.match_id];
  const t1WinnerMarker = winner === m.team1 ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--primary-gold)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-left: 4px;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"></path></svg>` : '';
  const t2WinnerMarker = winner === m.team2 ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--primary-gold)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-left: 4px;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"></path></svg>` : '';
  
  const dateStr = formatCompactMatchDate(m.date);
  const timeInfo = getFormattedTime(m.date, m.time);
  
  const roundTranslations = {
    "Round of 32": "32 Besar",
    "Round of 16": "16 Besar",
    "Quarter-final": "Perempat Final",
    "Semi-final": "Semifinal",
    "Third-place match": "Perebutan Tempat Ke-3",
    "Final": "Final"
  };
  const roundLabel = roundTranslations[m.group] || m.group;

  let statusText = '';
  let liveMinute = '';
  let homeScorersText = '';
  let awayScorersText = '';

  if (apiMatchData) {
    if (apiMatchData.status === 'IN_PLAY' || apiMatchData.status === 'LIVE') {
      liveMinute = apiMatchData.time_elapsed ? `${apiMatchData.time_elapsed}'` : 'LIVE';
      statusText = `<span style="display: inline-flex; align-items: center; gap: 4px; color: #ff3366; font-weight: 700; font-size: 0.6rem; letter-spacing: 0.3px;"><span style="display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #ff3366; animation: live-blink-pulse 1.2s infinite;"></span>${liveMinute}</span>`;
    } else if (apiMatchData.status === 'FINISHED') {
      statusText = `<span style="background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.55); padding: 1px 4px; border-radius: 3px; font-size: 0.52rem; font-weight: 700; border: 1px solid rgba(255,255,255,0.1); letter-spacing: 0.3px;">SELESAI</span>`;
    }
    
    // Parse scorers
    if (apiMatchData.home_scorers) {
      homeScorersText = parseScorers(apiMatchData.home_scorers);
    }
    if (apiMatchData.away_scorers) {
      awayScorersText = parseScorers(apiMatchData.away_scorers);
    }
  }

  return `
    <div class="tooltip-container" style="display: flex; flex-direction: column; gap: 8px; min-width: 170px; font-family: var(--font-sans, sans-serif); text-align: left;">
      <!-- Header: Round + Time -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px; font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; color: var(--primary-gold);">
        <span>${roundLabel}</span>
        <span style="color: rgba(255,255,255,0.45); font-weight: 500;">${dateStr} · ${timeInfo.time}</span>
      </div>

      <!-- Teams & Scores -->
      <div style="display: flex; flex-direction: column; gap: 7px; margin-top: 2px;">
        <!-- Team 1 -->
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <span style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: ${winner === m.team1 ? '700' : '500'}; color: ${winner && winner !== m.team1 ? 'rgba(255,255,255,0.45)' : '#ffffff'};">
              ${m.team1 && !isPlaceholder1 ? getFlagHtml(m.team1).replace('class="flag-crest"', 'style="width:14px; height:10px; border-radius:1px; object-fit:cover;"') : ''}
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">${team1Name}</span>
              ${t1WinnerMarker}
            </span>
            <span style="font-size: 0.8rem; font-weight: 700; color: ${winner === m.team1 ? 'var(--primary-gold)' : '#ffffff'};">${score1}</span>
          </div>
          ${homeScorersText ? `
            <div style="font-size: 0.58rem; color: rgba(255,255,255,0.45); padding-left: 20px; font-weight: 400; line-height: 1.2;">
              ${homeScorersText}
            </div>
          ` : ''}
        </div>

        <!-- Team 2 -->
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
            <span style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: ${winner === m.team2 ? '700' : '500'}; color: ${winner && winner !== m.team2 ? 'rgba(255,255,255,0.45)' : '#ffffff'};">
              ${m.team2 && !isPlaceholder2 ? getFlagHtml(m.team2).replace('class="flag-crest"', 'style="width:14px; height:10px; border-radius:1px; object-fit:cover;"') : ''}
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">${team2Name}</span>
              ${t2WinnerMarker}
            </span>
            <span style="font-size: 0.8rem; font-weight: 700; color: ${winner === m.team2 ? 'var(--primary-gold)' : '#ffffff'};">${score2}</span>
          </div>
          ${awayScorersText ? `
            <div style="font-size: 0.58rem; color: rgba(255,255,255,0.45); padding-left: 20px; font-weight: 400; line-height: 1.2;">
              ${awayScorersText}
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Footer: Venue + Status -->
      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px; margin-top: 4px; font-size: 0.58rem; color: rgba(255,255,255,0.45); font-weight: 500; gap: 8px;">
        <span style="display: flex; align-items: center; gap: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 110px;" title="${getMatchVenue(m)}">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display: inline-block; vertical-align: middle; opacity: 0.7;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${getVenueStadium(getMatchVenue(m))}
        </span>
        ${statusText}
      </div>
    </div>
  `;
}

let activeTooltipMatchId = null;

window.showBracketTooltip = function(event, matchId, isClick = false) {
  const tooltip = document.getElementById('bracket-tooltip');
  if (!tooltip) return;
  const match = knockoutMatches.find(m => m.match_id === matchId);
  if (!match) return;

  // If a click locked another tooltip, hover should be ignored
  if (!isClick && activeTooltipMatchId !== null) return;

  // Toggle if clicked again on the same card
  if (isClick && activeTooltipMatchId === matchId) {
    window.hideBracketTooltip(true);
    return;
  }

  tooltip.innerHTML = getMatchTooltipHtml(match);
  tooltip.style.display = 'block';

  if (isClick) {
    activeTooltipMatchId = matchId;
    
    // Position anchored to the card element's physical rect
    const cardEl = (event && event.target) ? event.target.closest('.compact-match-card') : null;
    const wrapper = document.querySelector('.compact-bracket-wrapper');
    if (cardEl && wrapper) {
      const cardRect = cardEl.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      
      const leftRelativeToWrapper = cardRect.left - wrapperRect.left + wrapper.scrollLeft;
      const topRelativeToWrapper = cardRect.top - wrapperRect.top + wrapper.scrollTop;
      
      const tooltipWidth = tooltip.offsetWidth || 180;
      const tooltipHeight = tooltip.offsetHeight || 120;
      
      // Center horizontally on the card
      let x = leftRelativeToWrapper + (cardRect.width / 2) - (tooltipWidth / 2);
      // Clamp horizontally within the wrapper boundaries
      x = Math.max(8, Math.min(x, wrapperRect.width + wrapper.scrollLeft - tooltipWidth - 8));
      
      // Position vertically (above if card is low, below if card is high)
      let y;
      if (topRelativeToWrapper > 320) {
        y = topRelativeToWrapper - tooltipHeight - 10;
      } else {
        y = topRelativeToWrapper + cardRect.height + 10;
      }
      
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    }
  } else {
    // Hover mode follows mouse position
    window.moveBracketTooltip(event);
  }
};

window.hideBracketTooltip = function(force = false) {
  if (!force && activeTooltipMatchId !== null) return; // Don't hide if locked
  
  const tooltip = document.getElementById('bracket-tooltip');
  if (tooltip) {
    tooltip.style.display = 'none';
  }
  if (force) {
    activeTooltipMatchId = null;
  }
};

window.moveBracketTooltip = function(event) {
  if (activeTooltipMatchId !== null) return; // Don't move if locked
  
  const tooltip = document.getElementById('bracket-tooltip');
  if (!tooltip) return;
  
  const offsetMouseX = 14;
  const offsetMouseY = 14;
  
  const tooltipRect = tooltip.getBoundingClientRect();
  const wrapper = document.querySelector('.compact-bracket-wrapper');
  if (!wrapper) return;
  const wrapperRect = wrapper.getBoundingClientRect();
  
  let x = event.clientX - wrapperRect.left + wrapper.scrollLeft + offsetMouseX;
  let y = event.clientY - wrapperRect.top + wrapper.scrollTop + offsetMouseY;
  
  if (x + tooltipRect.width > wrapperRect.width) {
    x = event.clientX - wrapperRect.left - tooltipRect.width - offsetMouseX;
  }
  
  if (y + tooltipRect.height > wrapperRect.height) {
    y = event.clientY - wrapperRect.top - tooltipRect.height - offsetMouseY;
  }
  
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
};

// Global click listener to close popover when clicking outside cards
document.addEventListener('click', (e) => {
  if (e.target.closest('.compact-match-card')) return;
  if (window.hideBracketTooltip) {
    window.hideBracketTooltip(true);
  }
});

function renderBracket() {
  recalculateKnockoutTree();
  const container = document.getElementById('bracket-cards-root');
  if (!container) return;

  let cardsHtml = '';

  knockoutMatches.forEach(m => {
    const coords = COMPACT_COORDINATES[m.match_id];
    if (!coords) return;

    const winner = simulatedWinners[m.match_id];
    const isPlaceholder1 = !isRealTeamName(m.team1);
    const isPlaceholder2 = !isRealTeamName(m.team2);

    const team1WinnerClass = (winner && winner === m.team1) ? 'winner' : (winner ? 'loser' : '');
    const team2WinnerClass = (winner && winner === m.team2) ? 'winner' : (winner ? 'loser' : '');

    const hasPlaceholders = isPlaceholder1 || isPlaceholder2;
    const hasWinner = !!winner;
    let cardStateClass = '';
    if (hasPlaceholders) {
      cardStateClass = 'match-locked';
    } else if (hasWinner) {
      cardStateClass = 'match-predicted';
    } else {
      cardStateClass = 'match-ready';
    }

    let roundClass = '';
    if (m.group === "Round of 32") roundClass = "round-32";
    else if (m.group === "Round of 16") roundClass = "round-16";
    else if (m.group === "Quarter-final") roundClass = "round-qf";
    else if (m.group === "Semi-final") roundClass = "round-sf";
    else if (m.group === "Third-place match") roundClass = "round-third";
    else if (m.group === "Final") roundClass = "round-final";

    const flag1 = !isPlaceholder1 && m.team1 ? getFlagHtml(m.team1) : '';
    const flag2 = !isPlaceholder2 && m.team2 ? getFlagHtml(m.team2) : '';

    let code1 = getTeamCode(m.team1 || '');
    let code2 = getTeamCode(m.team2 || '');

    if (code1.startsWith("3RD") || code1.startsWith("3rd")) {
      code1 = "3rd";
    }
    if (code2.startsWith("3RD") || code2.startsWith("3rd")) {
      code2 = "3rd";
    }

    const formattedFlag1 = flag1 
      ? flag1.replace('class="flag-crest"', 'class="flag-crest-compact"') 
      : `<div class="flag-crest-placeholder">${code1}</div>`;
    const formattedFlag2 = flag2 
      ? flag2.replace('class="flag-crest"', 'class="flag-crest-compact"') 
      : `<div class="flag-crest-placeholder">${code2}</div>`;

    cardsHtml += `
      <div class="compact-match-card ${cardStateClass} ${roundClass}" 
           style="left: ${coords.x}px; top: ${coords.y}px; cursor: pointer;"
           onmouseenter="window.showBracketTooltip(event, ${m.match_id})"
           onmouseleave="window.hideBracketTooltip()"
           onmousemove="window.moveBracketTooltip(event)"
           onclick="window.showBracketTooltip(event, ${m.match_id}, true); event.stopPropagation();">
        <!-- Team 1 -->
        <div class="compact-team-row ${isPlaceholder1 ? 'placeholder' : ''} ${team1WinnerClass}">
          ${formattedFlag1}
        </div>
        <!-- Team 2 -->
        <div class="compact-team-row ${isPlaceholder2 ? 'placeholder' : ''} ${team2WinnerClass}">
          ${formattedFlag2}
        </div>
      </div>
    `;
  });

  container.innerHTML = cardsHtml;
  renderBracketLines();
  renderStandingsSummary();
}

function renderBracketLines() {
  const svg = document.getElementById('bracket-svg-connections');
  if (!svg) return;

  const cardWidth = 48;
  const cardHeight = 56;
  let pathsHtml = '';

  const connections = [
    // Left Wing (Column 1 to Column 2 R16/QF stack)
    { from: 73, to: 90, type: 'horizontal-right' },
    { from: 75, to: 90, type: 'horizontal-right' },
    { from: 83, to: 93, type: 'horizontal-right' },
    { from: 84, to: 93, type: 'horizontal-right' },
    { from: 90, to: 97, type: 'horizontal-straight' },
    { from: 93, to: 98, type: 'horizontal-straight' },

    // Top Wing (Top/Bottom horizontal to Stack Top/Bottom R16)
    { from: 74, to: 89, type: 'vertical-down' },
    { from: 77, to: 89, type: 'vertical-down' },
    { from: 81, to: 94, type: 'vertical-up' },
    { from: 82, to: 94, type: 'vertical-up' },

    // Right Wing
    { from: 79, to: 92, type: 'horizontal-left' },
    { from: 80, to: 92, type: 'horizontal-left' },
    { from: 88, to: 95, type: 'horizontal-left' },
    { from: 86, to: 95, type: 'horizontal-left' },
    { from: 92, to: 99, type: 'horizontal-straight' },
    { from: 95, to: 100, type: 'horizontal-straight' },

    // Bottom Wing
    { from: 76, to: 91, type: 'vertical-down' },
    { from: 78, to: 91, type: 'vertical-down' },
    { from: 87, to: 96, type: 'vertical-up' },
    { from: 85, to: 96, type: 'vertical-up' },

    // Stack vertical progression
    { from: 89, to: 97, type: 'vertical-straight' },
    { from: 94, to: 98, type: 'vertical-straight' },
    { from: 91, to: 99, type: 'vertical-straight' },
    { from: 96, to: 100, type: 'vertical-straight' },

    // QF to SF vertical straight
    { from: 97, to: 101, type: 'vertical-straight' },
    { from: 98, to: 101, type: 'vertical-straight' },
    { from: 99, to: 102, type: 'vertical-straight' },
    { from: 100, to: 102, type: 'vertical-straight' },

    // SF to Final (center) and Juara 3 (bottom center)
    { from: 101, to: 104, type: 'center-final' },
    { from: 102, to: 104, type: 'center-final' },
    { from: 101, to: 103, type: 'center-third' },
    { from: 102, to: 103, type: 'center-third' }
  ];

  const drawnSharedTargets = new Set();

  connections.forEach(conn => {
    const fromCoords = COMPACT_COORDINATES[conn.from];
    const toCoords = COMPACT_COORDINATES[conn.to];
    if (!fromCoords || !toCoords) return;

    let x_start, y_start, x_end, y_end;
    let d = '';
    let sharedD = '';

    const siblingConns = connections.filter(c => c.to === conn.to && c.type === conn.type);
    const hasSharedTrunk = siblingConns.length > 1;

    if (conn.type === 'vertical-down') {
      x_start = fromCoords.x + cardWidth / 2;
      y_start = fromCoords.y + cardHeight;
      x_end = toCoords.x + cardWidth / 2;
      y_end = toCoords.y;
      const ym = (y_start + y_end) / 2;
      if (hasSharedTrunk) {
        d = `M ${x_start} ${y_start} V ${ym} H ${x_end}`;
        sharedD = `M ${x_end} ${ym} V ${y_end}`;
      } else {
        d = `M ${x_start} ${y_start} V ${ym} H ${x_end} V ${y_end}`;
      }
    } else if (conn.type === 'vertical-up') {
      x_start = fromCoords.x + cardWidth / 2;
      y_start = fromCoords.y;
      x_end = toCoords.x + cardWidth / 2;
      y_end = toCoords.y + cardHeight;
      const ym = (y_start + y_end) / 2;
      if (hasSharedTrunk) {
        d = `M ${x_start} ${y_start} V ${ym} H ${x_end}`;
        sharedD = `M ${x_end} ${ym} V ${y_end}`;
      } else {
        d = `M ${x_start} ${y_start} V ${ym} H ${x_end} V ${y_end}`;
      }
    } else if (conn.type === 'horizontal-right') {
      x_start = fromCoords.x + cardWidth;
      y_start = fromCoords.y + cardHeight / 2;
      x_end = toCoords.x;
      y_end = toCoords.y + cardHeight / 2;
      const xm = (x_start + x_end) / 2;
      if (hasSharedTrunk) {
        d = `M ${x_start} ${y_start} H ${xm} V ${y_end}`;
        sharedD = `M ${xm} ${y_end} H ${x_end}`;
      } else {
        d = `M ${x_start} ${y_start} H ${xm} V ${y_end} H ${x_end}`;
      }
    } else if (conn.type === 'horizontal-left') {
      x_start = fromCoords.x;
      y_start = fromCoords.y + cardHeight / 2;
      x_end = toCoords.x + cardWidth;
      y_end = toCoords.y + cardHeight / 2;
      const xm = (x_start + x_end) / 2;
      if (hasSharedTrunk) {
        d = `M ${x_start} ${y_start} H ${xm} V ${y_end}`;
        sharedD = `M ${xm} ${y_end} H ${x_end}`;
      } else {
        d = `M ${x_start} ${y_start} H ${xm} V ${y_end} H ${x_end}`;
      }
    } else if (conn.type === 'horizontal-straight') {
      if (fromCoords.x < toCoords.x) {
        x_start = fromCoords.x + cardWidth;
        y_start = fromCoords.y + cardHeight / 2;
        x_end = toCoords.x;
      } else {
        x_start = fromCoords.x;
        y_start = fromCoords.y + cardHeight / 2;
        x_end = toCoords.x + cardWidth;
      }
      d = `M ${x_start} ${y_start} H ${x_end}`;
    } else if (conn.type === 'vertical-straight') {
      x_start = fromCoords.x + cardWidth / 2;
      if (fromCoords.y < toCoords.y) {
        y_start = fromCoords.y + cardHeight;
        y_end = toCoords.y;
      } else {
        y_start = fromCoords.y;
        y_end = toCoords.y + cardHeight;
      }
      d = `M ${x_start} ${y_start} V ${y_end}`;
    } else if (conn.type === 'center-final') {
      if (fromCoords.x < toCoords.x) {
        x_start = fromCoords.x + cardWidth;
        y_start = fromCoords.y + cardHeight / 2;
        x_end = toCoords.x;
      } else {
        x_start = fromCoords.x;
        y_start = fromCoords.y + cardHeight / 2;
        x_end = toCoords.x + cardWidth;
      }
      d = `M ${x_start} ${y_start} H ${x_end}`;
    } else if (conn.type === 'center-third') {
      if (fromCoords.x < toCoords.x) {
        x_start = fromCoords.x + cardWidth;
        y_start = fromCoords.y + cardHeight / 2;
        x_end = toCoords.x;
        y_end = toCoords.y + cardHeight / 2;
        const xm = (x_start + x_end) / 2;
        d = `M ${x_start} ${y_start} H ${xm} V ${y_end} H ${x_end}`;
      } else {
        x_start = fromCoords.x;
        y_start = fromCoords.y + cardHeight / 2;
        x_end = toCoords.x + cardWidth;
        y_end = toCoords.y + cardHeight / 2;
        const xm = (x_start + x_end) / 2;
        d = `M ${x_start} ${y_start} H ${xm} V ${y_end} H ${x_end}`;
      }
    }

    const isActive = !!simulatedWinners[conn.from];
    const lineClass = isActive ? 'bracket-line-active' : 'bracket-line-inactive';

    pathsHtml += `<path d="${d}" class="${lineClass}"></path>`;

    if (hasSharedTrunk && sharedD && !drawnSharedTargets.has(conn.to)) {
      drawnSharedTargets.add(conn.to);

      const isSharedActive = siblingConns.some(c => !!simulatedWinners[c.from]);
      const sharedLineClass = isSharedActive ? 'bracket-line-active' : 'bracket-line-inactive';
      pathsHtml += `<path d="${sharedD}" class="${sharedLineClass}"></path>`;
    }
  });

  svg.innerHTML = pathsHtml;
}

let currentGroupPage = 0; // 0 for A-F, 1 for G-L

function renderStandingsSummary() {
  // No-op (standings summary removed from bracket page)
}

window.setGroupPage = function(pageIndex) {};

window.renderStandingsSummary = renderStandingsSummary;



let currentScale = 1;
let baseScale = 1;
let hasPinched = false;

let _cachedBracketWrapper = null;
let _cachedBracketContainer = null;
let _cachedBracketScaffolding = null;

function applyScale() {
  if (!_cachedBracketWrapper) _cachedBracketWrapper = document.querySelector('.compact-bracket-wrapper');
  if (!_cachedBracketContainer) _cachedBracketContainer = document.getElementById('compact-bracket-container');
  if (!_cachedBracketScaffolding) _cachedBracketScaffolding = document.getElementById('bracket-scroll-scaffolding');

  const wrapper = _cachedBracketWrapper;
  const container = _cachedBracketContainer;
  const scaffolding = _cachedBracketScaffolding;
  if (!wrapper || !container) return;

  currentScale = Math.max(0.25, Math.min(currentScale, 2.5));

  container.style.transform = `scale(${currentScale})`;
  container.style.transformOrigin = 'top left';

  const baseHeight = 760;
  const scaledHeight = baseHeight * currentScale;

  const totalScaffoldingHeight = scaledHeight + 16 * currentScale;

  if (scaffolding) {
    scaffolding.style.width = `${560 * currentScale}px`;
    scaffolding.style.height = `${totalScaffoldingHeight}px`;
  }

  const maxWrapperHeight = 760;
  const targetWrapperHeight = Math.min(maxWrapperHeight, totalScaffoldingHeight);
  wrapper.style.height = `${targetWrapperHeight}px`;

  wrapper.style.overflow = 'hidden';
  wrapper.style.cursor = 'default';
  wrapper.scrollLeft = 0;
  wrapper.scrollTop = 0;
}

function scaleCompactBracket() {
  const wrapper = document.querySelector('.compact-bracket-wrapper');
  const container = document.getElementById('compact-bracket-container');
  if (!wrapper || !container) return;

  const wrapperWidth = wrapper.clientWidth;
  if (wrapperWidth === 0) return;

  const targetWidth = Math.max(280, wrapperWidth - 16);
  baseScale = targetWidth / 560;
  currentScale = Math.min(1, baseScale);

  applyScale();
}
window.scaleCompactBracket = scaleCompactBracket;

window.toggleBracketZoom = function(isZoomed) {
  // No-op since it fits mobile screens automatically now
};

window.togglePotentialDraw = function(checked) {
  showPotentialDraw = checked;
  isDataDirty = true;
  renderBracket();
};

function initBracketTouchGestures() {
  const wrapper = document.querySelector('.compact-bracket-wrapper');
  if (!wrapper) return;

  let initialDistance = null;
  let startScale = 1;

  wrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      initialDistance = getTouchDistance(e.touches[0], e.touches[1]);
      startScale = currentScale;
    }
  }, { passive: false });

  wrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialDistance !== null) {
      e.preventDefault(); // Prevent native page zoom

      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      if (currentDistance > 5) {
        const factor = currentDistance / initialDistance;
        currentScale = startScale * factor;
        applyScale();
      }
    }
  }, { passive: false });

  wrapper.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialDistance = null;
    }
  });

  function getTouchDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
window.initBracketTouchGestures = initBracketTouchGestures;

function initBracketDragScroll() {
  const wrapper = document.querySelector('.compact-bracket-wrapper');
  if (!wrapper) return;

  let isDown = false;
  let startX, startY, scrollLeft, scrollTop;

  wrapper.addEventListener('mousedown', (e) => {
    if (currentScale <= baseScale * 1.05) return; // Only drag when zoomed in
    isDown = true;
    wrapper.style.cursor = 'grabbing';
    startX = e.clientX - wrapper.offsetLeft;
    startY = e.clientY - wrapper.offsetTop;
    scrollLeft = wrapper.scrollLeft;
    scrollTop = wrapper.scrollTop;
  });

  wrapper.addEventListener('mouseleave', () => {
    if (isDown) {
      isDown = false;
      wrapper.style.cursor = 'grab';
    }
  });

  wrapper.addEventListener('mouseup', () => {
    if (isDown) {
      isDown = false;
      wrapper.style.cursor = 'grab';
    }
  });

  wrapper.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.clientX - wrapper.offsetLeft;
    const y = e.clientY - wrapper.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    wrapper.scrollLeft = scrollLeft - walkX;
    wrapper.scrollTop = scrollTop - walkY;
  });
}
window.initBracketDragScroll = initBracketDragScroll;

// Selects 3rd-place team Group mapping in simulator
window.select3rdPlaceGroup = function(matchId, groupName) {
  if (groupName) {
    selected3rdPlaces[matchId] = groupName;
  } else {
    delete selected3rdPlaces[matchId];
  }
  recalculateKnockoutTree();
  renderBracket();
  renderFavorites();
};



window.openSlotModal = function(teamName, matchId) {
  const title = document.getElementById('slot-modal-title');
  const body = document.getElementById('slot-modal-body');
  const modal = document.getElementById('slot-modal');
  if (!title || !body || !modal) return;

  title.textContent = `Info Slot: ${formatPlaceholderName(teamName)}`;
  body.innerHTML = '';

  const is3rd = teamName.startsWith('3rd') || teamName.includes('/');
  
  if (teamName.includes('Grup') && (teamName.startsWith('Juara') || teamName.startsWith('Runner-up') || is3rd)) {
    if (is3rd) {
      const allowedGroups = getEligibleGroupsFor3rd(teamName);
      const titleLabel = teamName.replace("3rd Grup ", "Peringkat 3 Grup ");
      title.textContent = `Klasemen ${titleLabel}`;
      
      const allThirds = [];
      for (const [groupName, teamList] of Object.entries(groupRankings)) {
        if (teamList && teamList[2]) {
          const team = teamList[2];
          const stats = teamStats[team] || { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
          allThirds.push({
            group: groupName,
            team: team,
            played: stats.played,
            won: stats.won,
            drawn: stats.drawn,
            lost: stats.lost,
            gf: stats.gf,
            ga: stats.ga,
            gd: stats.gd,
            pts: stats.pts
          });
        }
      }

      allThirds.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        if (b.won !== a.won) return b.won - a.won;
        return a.group.localeCompare(b.group);
      });

      let rowsHtml = '';
      allThirds.forEach((t, idx) => {
        if (allowedGroups.includes(t.group)) {
          const isQualified = idx < 8;
          const rankClass = isQualified ? 'rank-1st' : 'rank-4th';
          const statusBadge = isQualified 
            ? '<span class="status-badge lolos">LOLOS</span>'
            : '<span class="status-badge gugur">GUGUR</span>';
          
          const gdSign = t.gd > 0 ? `+${t.gd}` : t.gd;
          rowsHtml += `
            <tr style="background: ${isQualified ? 'rgba(16, 185, 129, 0.01)' : 'rgba(239, 68, 68, 0.01)'}">
              <td class="group-rank-badge ${rankClass}" style="text-align: center; font-weight: 800;">${idx + 1}</td>
              <td style="text-align: center; font-weight: 700; color: var(--primary-gold);">${t.group.replace("Grup ", "")}</td>
              <td>
                <div class="team-cell" style="display: flex; align-items: center; gap: 8px;">
                  ${getFlagHtml(t.team)}
                  <span class="team-name ${isQualified ? 'team-bold' : ''}">${t.team}</span>
                </div>
              </td>
              <td style="text-align: center; font-weight: 600;">${gdSign}</td>
              <td style="text-align: center; font-weight: 700; color: ${isQualified ? 'var(--primary-gold)' : 'inherit'};">${t.pts}</td>
              <td style="text-align: center;">${statusBadge}</td>
            </tr>
          `;
        }
      });

      body.innerHTML = `
        <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
          Menampilkan peringkat 3 dari grup <strong>${allowedGroups.map(g => g.replace("Grup ", "")).join(', ')}</strong> yang eligible untuk slot ini:
        </p>
        <table class="group-table">
          <thead>
            <tr>
              <th style="width: 8%; text-align: center;">Pos</th>
              <th style="width: 12%; text-align: center;">Grup</th>
              <th style="text-align: left; width: 38%;">Tim</th>
              <th style="width: 12%; text-align: center;">SG</th>
              <th style="width: 15%; text-align: center;">Poin</th>
              <th style="width: 15%; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      `;
    } else {
      const matchGroup = teamName.match(/Grup\s+([A-L])/);
      if (matchGroup) {
        const groupLetter = matchGroup[1];
        const groupName = `Grup ${groupLetter}`;
        const rankedTeams = groupRankings[groupName];

        const isJuaraSlot = teamName.startsWith('Juara');
        const isRunnerUpSlot = teamName.startsWith('Runner-up');

        let introText = '';
        if (isJuaraSlot) {
          introText = `Hanya tim peringkat 1 (Juara) dari <strong>${groupName}</strong> yang eligible untuk slot ini. Klasemen grup saat ini:`;
        } else if (isRunnerUpSlot) {
          introText = `Hanya tim peringkat 2 (Runner-up) dari <strong>${groupName}</strong> yang eligible untuk slot ini. Klasemen grup saat ini:`;
        } else {
          introText = `Tim dari <strong>${groupName}</strong> yang memenuhi syarat akan mengisi slot ini. Klasemen grup saat ini:`;
        }

        title.textContent = `Klasemen ${groupName}`;

        let rowsHtml = '';
        rankedTeams.forEach((team, idx) => {
          const stats = teamStats[team] || { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
          const gdSign = stats.gd > 0 ? `+${stats.gd}` : stats.gd;
          const rankClass = idx === 0 ? 'rank-1st' : (idx === 1 ? 'rank-2nd' : (idx === 2 ? 'rank-3rd' : 'rank-4th'));
          const rankSuffix = idx === 0 ? '1' : (idx === 1 ? '2' : (idx === 2 ? '3' : '4'));
          
          let rowStyle = '';
          let statusBadge = '';
          
          if (isJuaraSlot) {
            if (idx === 0) {
              rowStyle = 'background: rgba(212, 175, 55, 0.08); font-weight: 700; border-left: 3px solid var(--primary-gold);';
              statusBadge = '<span style="font-size: 0.55rem; color: var(--primary-gold); border: 1px solid rgba(212, 175, 55, 0.4); padding: 1.5px 5px; border-radius: 4px; font-weight: bold; background: rgba(212, 175, 55, 0.05); float: right; margin-top: 2px; letter-spacing: 0.5px;">JUARA</span>';
            } else {
              rowStyle = 'opacity: 0.45;';
            }
          } else if (isRunnerUpSlot) {
            if (idx === 1) {
              rowStyle = 'background: rgba(142, 142, 147, 0.15); font-weight: 700; border-left: 3px solid var(--secondary-bronze);';
              statusBadge = '<span style="font-size: 0.55rem; color: var(--text-primary); border: 1px solid rgba(142, 142, 147, 0.4); padding: 1.5px 5px; border-radius: 4px; font-weight: bold; background: rgba(142, 142, 147, 0.05); float: right; margin-top: 2px; letter-spacing: 0.5px;">RUNNER-UP</span>';
            } else {
              rowStyle = 'opacity: 0.45;';
            }
          }

          rowsHtml += `
            <tr style="${rowStyle}">
              <td class="group-rank-badge ${rankClass}" style="text-align: center; font-weight: 800;">${rankSuffix}</td>
              <td>
                <div class="team-cell" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    ${getFlagHtml(team)}
                    <span class="team-name ${idx < 2 ? 'team-bold' : ''}">${team}</span>
                  </div>
                  ${statusBadge}
                </div>
              </td>
              <td style="text-align: center; opacity: 0.85;">${stats.played}</td>
              <td style="text-align: center; opacity: 0.85;">${gdSign}</td>
              <td style="text-align: center; font-weight: 700; color: ${idx < 2 ? 'var(--primary-gold)' : 'inherit'};">${stats.pts}</td>
            </tr>
          `;
        });

        body.innerHTML = `
          <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
            ${introText}
          </p>
          <table class="group-table">
            <thead>
              <tr>
                <th style="width: 10%; text-align: center;">#</th>
                <th style="text-align: left; width: 50%;">Tim</th>
                <th style="width: 13%; text-align: center;">M</th>
                <th style="width: 13%; text-align: center;">SG</th>
                <th style="width: 14%; text-align: center;">P</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        `;
      }
    }
  } else if (
    teamName.startsWith('Winner Match') || 
    teamName.startsWith('Loser Match') || 
    teamName.startsWith('Winner Laga') || 
    teamName.startsWith('Pemenang M') || 
    teamName.startsWith('Kalah M')
  ) {
    const matchIdNum = parseInt(teamName.replace(/\D/g, ''));
    const sourceMatch = knockoutMatches.find(nxt => nxt.match_id === matchIdNum);

    if (sourceMatch) {
      title.textContent = `Kontender Laga ${matchIdNum}`;

      const t1IsPlaceholder = sourceMatch.team1.startsWith('Winner Match') || sourceMatch.team1.startsWith('Loser Match') || sourceMatch.team1.startsWith('3rd Grup') || sourceMatch.team1.startsWith('Juara Grup') || sourceMatch.team1.startsWith('Runner-up Grup') || sourceMatch.team1.startsWith('Juara Group') || sourceMatch.team1.startsWith('Runner-up Group');
      const t2IsPlaceholder = sourceMatch.team2.startsWith('Winner Match') || sourceMatch.team2.startsWith('Loser Match') || sourceMatch.team2.startsWith('3rd Grup') || sourceMatch.team2.startsWith('Juara Grup') || sourceMatch.team2.startsWith('Runner-up Grup') || sourceMatch.team2.startsWith('Juara Group') || sourceMatch.team2.startsWith('Runner-up Group');

      const t1Formatted = t1IsPlaceholder ? formatPlaceholderName(sourceMatch.team1) : sourceMatch.team1;
      const t2Formatted = t2IsPlaceholder ? formatPlaceholderName(sourceMatch.team2) : sourceMatch.team2;

      body.innerHTML = `
        <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
          Slot ini akan diisi oleh tim pemenang dari <strong>Laga ${matchIdNum}</strong>. Klik pada kontender di bawah untuk melihat rincian mereka:
        </p>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
          <div class="glass-panel" style="padding: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255,255,255,0.01); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md);" onclick="window.openSlotModal('${sourceMatch.team1.replace(/'/g, "\\'")}', ${sourceMatch.match_id})">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${getFlagHtml(sourceMatch.team1)}
              <span style="font-weight: 600; font-size: 0.85rem; color: ${t1IsPlaceholder ? 'var(--text-muted)' : 'var(--text-primary)'};">${t1Formatted}</span>
            </div>
            ${t1IsPlaceholder ? '<span style="font-size: 0.65rem; color: var(--primary-gold); font-weight:700;">Lihat Potensi →</span>' : ''}
          </div>
          <div style="text-align: center; font-size: 0.7rem; font-weight: bold; color: var(--text-muted);">VS</div>
          <div class="glass-panel" style="padding: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: rgba(255,255,255,0.01); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md);" onclick="window.openSlotModal('${sourceMatch.team2.replace(/'/g, "\\'")}', ${sourceMatch.match_id})">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${getFlagHtml(sourceMatch.team2)}
              <span style="font-weight: 600; font-size: 0.85rem; color: ${t2IsPlaceholder ? 'var(--text-muted)' : 'var(--text-primary)'};">${t2Formatted}</span>
            </div>
            ${t2IsPlaceholder ? '<span style="font-size: 0.65rem; color: var(--primary-gold); font-weight:700;">Lihat Potensi →</span>' : ''}
          </div>
        </div>
      `;
    }
  }

  modal.classList.add('active');
};

window.closeSlotModal = function() {
  const modal = document.getElementById('slot-modal');
  if (modal) {
    modal.classList.remove('active');
  }
};



window.scrollToBracketColumn = function(colIdx) {};
window.syncBracketRoundTabs = function() {};



// ----------------------------------------------------
// FAVORITES BRIDGE WINDOW BINDINGS
// ----------------------------------------------------
window.toggleMatchStar = function(matchKey, btnElement) {
  toggleStar(matchKey, btnElement);
};

// ----------------------------------------------------
// APPLICATION SETUP & ROUTING
// ----------------------------------------------------

// Tabs Router
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Deactivate current
      document.querySelector('.nav-item.active').classList.remove('active');
      document.querySelector('.tab-content.active').classList.remove('active');

      // Activate clicked
      item.classList.add('active');
      activeTab = item.getAttribute('data-tab');
      document.getElementById(activeTab).classList.add('active');

      // Stop results slider autoplay and reset transition state when navigating away from Home tab
      if (activeTab !== 'tab-home') {
        if (resultsSliderInterval) {
          clearInterval(resultsSliderInterval);
          resultsSliderInterval = null;
        }
        resultsSliderTransitioning = false;
      }

      // Specific tab triggers
      if (activeTab === 'tab-schedule') {
        renderSchedule();
      } else if (activeTab === 'tab-groups') {
        renderGroups();
      } else if (activeTab === 'tab-bracket') {
        renderBracket();
        setTimeout(scaleCompactBracket, 50);
      } else if (activeTab === 'tab-home') {
        renderFavorites();
        renderNearestMatches();
        renderLatestResults();
        renderLiveMatches();
      }
      
      // Scroll to top of window
      window.scrollTo(0, 0);

      // Auto-fetch scores if API key exists (throttled to once a minute)
      if (apiKey) {
        fetchRealTimeScores(false);
      }
    });
  });
}

// Setup timezone, filters, search settings and reset
function initSettingsAndFilters() {
  // Timezone switcher
  const tzToggle = document.getElementById('timezone-toggle');
  if (tzToggle) {
    tzToggle.checked = useLocalTimezone;
    tzToggle.addEventListener('change', (e) => {
      useLocalTimezone = e.target.checked;
      localStorage.setItem('wc2026_local_tz', useLocalTimezone);
      
      // Update schedule & bracket rendering timezone dates
      renderSchedule();
      renderFavorites();
      renderNearestMatches();
      renderLatestResults();
      if (activeTab === 'tab-bracket') renderBracket();
    });
  }

  // Theme switcher
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.checked = document.body.classList.contains('light-theme');
    themeToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.body.classList.add('light-theme');
        localStorage.setItem('wc2026_theme', 'light');
      } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('wc2026_theme', 'dark');
      }
    });
  }




  // Schedule filtering listeners
  const searchInput = document.getElementById('schedule-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(renderSchedule, 150));
  }

  const groupSelect = document.getElementById('filter-group');
  if (groupSelect) {
    groupSelect.addEventListener('change', () => {
      // Clear Round selection if Group is picked to avoid empty overlaps
      if (groupSelect.value) {
        document.getElementById('filter-round').value = "";
      }
      renderSchedule();
    });
  }

  const roundSelect = document.getElementById('filter-round');
  if (roundSelect) {
    roundSelect.addEventListener('change', () => {
      // Clear Group selection if Round is picked to avoid empty overlaps
      if (roundSelect.value) {
        document.getElementById('filter-group').value = "";
      }
      renderSchedule();
    });
  }

  // Filter stage tabs (Semua, Fase Grup, Fase Gugur)
  const filterTabs = document.querySelectorAll('.tab-filter-btn');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelector('.tab-filter-btn.active').classList.remove('active');
      tab.classList.add('active');
      
      // Reset selects to avoid confusions
      document.getElementById('filter-group').value = "";
      document.getElementById('filter-round').value = "";
      
      renderSchedule();
    });
  });

  // Sub-tabs switcher (Jadwal vs Hasil Pertandingan)
  const subtabUpcoming = document.getElementById('subtab-upcoming');
  const subtabResults = document.getElementById('subtab-results');
  if (subtabUpcoming && subtabResults) {
    subtabUpcoming.addEventListener('click', () => {
      subtabUpcoming.classList.add('active');
      subtabResults.classList.remove('active');
      scheduleSubTab = 'upcoming';
      renderSchedule();
    });
    subtabResults.addEventListener('click', () => {
      subtabUpcoming.classList.remove('active');
      subtabResults.classList.add('active');
      scheduleSubTab = 'results';
      renderSchedule();
    });
  }





  // Bracket team hover highlighting (interactive UX)
  const bracketRoot = document.getElementById('bracket-root');
  if (bracketRoot) {
    bracketRoot.addEventListener('mouseover', (e) => {
      const target = e.target.closest('.bracket-team-row');
      if (!target) return;
      const teamName = target.getAttribute('data-team');
      if (!teamName) return;

      // Clear any existing highlights first
      const highlighted = bracketRoot.querySelectorAll('.highlighted-team');
      highlighted.forEach(el => el.classList.remove('highlighted-team'));

      // Highlight all rows in the bracket with the same team name (use attribute selector for O(1) query)
      const matches = bracketRoot.querySelectorAll(`.bracket-team-row[data-team="${CSS.escape(teamName)}"]`);
      matches.forEach(row => row.classList.add('highlighted-team'));
    });

    bracketRoot.addEventListener('mouseout', (e) => {
      const target = e.target.closest('.bracket-team-row');
      if (!target) return;

      // Clear highlights
      const highlighted = bracketRoot.querySelectorAll('.highlighted-team');
      highlighted.forEach(el => el.classList.remove('highlighted-team'));
    });
  }
}

// Background Polling functions
let currentPollInterval = 60000; // Default: 60s
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 5;

function hasLiveMatches() {
  const allMatches = getAllMatches();
  return allMatches.some(m => {
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const scoreData = getMatchScore(matchKey);
    return isMatchLive(m, scoreData);
  });
}

function startScorePolling() {
  if (scorePollTimeout) {
    clearTimeout(scorePollTimeout);
  }
  
  // Recursive poll function
  async function poll() {
    try {
      await fetchRealTimeScores(false);
    } catch (e) {
      console.error("Auto-poll fetch error:", e);
    }
    const targetInterval = hasLiveMatches() ? 10000 : 60000;
    currentPollInterval = targetInterval;
    scorePollTimeout = setTimeout(poll, currentPollInterval);
  }
  
  // Fetch immediately, then schedule next
  fetchRealTimeScores(false).then(() => {
    const targetInterval = hasLiveMatches() ? 10000 : 60000;
    currentPollInterval = targetInterval;
    scorePollTimeout = setTimeout(poll, currentPollInterval);
    console.log(`Score polling started (${currentPollInterval / 1000}s interval).`);
  }).catch(err => {
    console.error("Initial score poll failed, scheduling retry:", err);
    currentPollInterval = 60000;
    scorePollTimeout = setTimeout(poll, currentPollInterval);
  });
}

function stopScorePolling() {
  if (scorePollTimeout) {
    clearTimeout(scorePollTimeout);
    scorePollTimeout = null;
    console.log("Score polling stopped.");
  }
}

// Fallback client-side fetch from ESPN scoreboards and standings API (enables fully functional local mode)
async function fetchScoresDirectFromEspn() {
  const espnUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=150';
  const response = await fetch(espnUrl);
  if (!response.ok) {
    throw new Error(`ESPN API returned status ${response.status}`);
  }
  const espnData = await response.json();

  let groupsData = null;
  try {
    const resGroups = await fetch('https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings');
    if (resGroups.ok) {
      groupsData = await resGroups.json();
    }
  } catch (err) {
    console.warn("Direct groups fetch failed:", err);
  }

  const officialMatches = [];
  const getOfficialUtcTime = (dateStr, timeStr) => {
    const [day, month] = dateStr.split('/').map(Number);
    const [hour, min] = timeStr.split(':').map(Number);
    const dateObj = new Date(Date.UTC(2026, month - 1, day, hour - 7, min));
    return dateObj.toISOString();
  };

  WORLD_CUP_DATA.group_stage.forEach((m, idx) => {
    officialMatches.push({
      match_id: idx + 1,
      team1: m.team1,
      team2: m.team2,
      group: m.group,
      utc_time: getOfficialUtcTime(m.date, m.time)
    });
  });

  WORLD_CUP_DATA.knockout_stage.forEach((m) => {
    officialMatches.push({
      match_id: m.match_id,
      team1: m.team1,
      team2: m.team2,
      group: m.group,
      utc_time: getOfficialUtcTime(m.date, m.time)
    });
  });

  const groupStageEvents = [];
  const knockoutEvents = [];

  const localTranslations = { ...TEAM_TRANSLATIONS };
  localTranslations['Czech Republic'] = 'Ceko';
  localTranslations['Czechia'] = 'Ceko';
  localTranslations['Bosnia-Herzegovina'] = 'Bosnia dan Herzegovina';
  localTranslations['DR Kongo'] = 'RD Kongo';
  localTranslations['Congo DR'] = 'RD Kongo';
  localTranslations['Türkiye'] = 'Turki';
  localTranslations['Turkey'] = 'Turki';

  espnData.events.forEach((ev) => {
    const comp = ev.competitions[0];
    const home = comp.competitors.find(c => c.homeAway === 'home');
    const away = comp.competitors.find(c => c.homeAway === 'away');
    
    const homeName = home.team.displayName;
    const awayName = away.team.displayName;
    const homeIndo = localTranslations[homeName] || homeName;
    const awayIndo = localTranslations[awayName] || awayName;
    
    const gsIdx = WORLD_CUP_DATA.group_stage.findIndex(m => 
      (m.team1 === homeIndo && m.team2 === awayIndo) || 
      (m.team1 === awayIndo && m.team2 === homeIndo)
    );
    
    if (gsIdx !== -1) {
      groupStageEvents.push({ ev, match_id: gsIdx + 1 });
    } else {
      knockoutEvents.push(ev);
    }
  });

  const KNOCKOUT_MAPPING = {
    "760486": 73, "760487": 76, "760488": 75, "760489": 74, "760490": 78,
    "760491": 79, "760492": 77, "760495": 80, "760493": 82, "760494": 81,
    "760497": 84, "760496": 83, "760498": 85, "760499": 88, "760500": 86,
    "760501": 87, "760502": 92, "760503": 89, "760504": 90, "760505": 96,
    "760506": 93, "760507": 94, "760508": 91, "760509": 95, "760510": 97,
    "760511": 98, "760512": 99, "760513": 100, "760514": 101, "760515": 102,
    "760516": 103, "760517": 104
  };

  const mappings = {};
  groupStageEvents.forEach(item => {
    mappings[item.ev.id] = item.match_id;
  });
  knockoutEvents.forEach(ev => {
    if (KNOCKOUT_MAPPING[ev.id]) {
      mappings[ev.id] = KNOCKOUT_MAPPING[ev.id];
    }
  });

  const STADIUM_MAP = {
    "1": { "city": "Mexico City" }, "2": { "city": "Zapopan" }, "3": { "city": "Monterrey" },
    "4": { "city": "Arlington" }, "5": { "city": "Houston" }, "6": { "city": "Kansas City" },
    "7": { "city": "Atlanta" }, "8": { "city": "Miami" }, "9": { "city": "Foxborough" },
    "10": { "city": "Philadelphia" }, "11": { "city": "East Rutherford" }, "12": { "city": "Toronto" },
    "13": { "city": "Vancouver" }, "14": { "city": "Seattle" }, "15": { "city": "Santa Clara" },
    "16": { "city": "Inglewood" }
  };

  const mappedGames = espnData.events.map(ev => {
    const matchId = mappings[ev.id];
    if (!matchId) return null;
    
    const comp = ev.competitions[0];
    const home = comp.competitors.find(c => c.homeAway === 'home');
    const away = comp.competitors.find(c => c.homeAway === 'away');
    
    const homeName = home.team.displayName;
    const awayName = away.team.displayName;
    const homeScore = home.score || "0";
    const awayScore = away.score || "0";
    
    const homeScorersList = [];
    const awayScorersList = [];
    const homeRedCardsList = [];
    const awayRedCardsList = [];
    
    if (comp.details) {
      comp.details.forEach(detail => {
        const isGoal = detail.scoringPlay || (detail.type && detail.type.text.includes("Goal")) || detail.ownGoal;
        const isRed = detail.redCard || (detail.type && detail.type.text.includes("Red Card"));
        const athlete = detail.athletesInvolved && detail.athletesInvolved[0];
        const playerName = athlete ? athlete.displayName : "";
        const minute = detail.clock ? detail.clock.displayValue : "";
        
        if (playerName) {
          const teamId = detail.team && detail.team.id;
          const isHomeTeam = teamId === home.id || teamId === home.team.id;
          
          if (isGoal) {
            const suffix = detail.ownGoal ? " (OG)" : "";
            const assister = detail.athletesInvolved && detail.athletesInvolved[1];
            const assistText = assister ? ` (A: ${assister.displayName})` : "";
            const scorerText = `${playerName} ${minute}${suffix}${assistText}`;
            if (isHomeTeam) {
              homeScorersList.push(scorerText);
            } else {
              awayScorersList.push(scorerText);
            }
          }
          
          if (isRed) {
            const redText = `${playerName} ${minute}`;
            if (isHomeTeam) {
              homeRedCardsList.push(redText);
            } else {
              awayRedCardsList.push(redText);
            }
          }
        }
      });
    }
    
    const formatList = (list) => {
      if (list.length === 0) return "null";
      return `{"${list.join('","')}"}`;
    };
    
    const home_scorers = formatList(homeScorersList);
    const away_scorers = formatList(awayScorersList);
    const home_red_cards = formatList(homeRedCardsList);
    const away_red_cards = formatList(awayRedCardsList);
    
    const state = ev.status && ev.status.type && ev.status.type.state;
    let finished = state === 'post' ? 'TRUE' : 'FALSE';
    
    let time_elapsed = 'notstarted';
    if (state === 'post') {
      time_elapsed = 'finished';
    } else if (state === 'in') {
      finished = 'FALSE';
      time_elapsed = ev.status.displayClock || 'live';
      
      const espnName = ev.status && ev.status.type && ev.status.type.name;
      const espnDesc = ev.status && ev.status.type && ev.status.type.description;

      if (espnName === 'STATUS_HALFTIME' || (espnDesc && espnDesc.toLowerCase() === 'halftime')) {
        time_elapsed = 'HT';
      } else if (espnName === 'STATUS_EXTRA_TIME' || (espnDesc && espnDesc.toLowerCase().includes('extra'))) {
        time_elapsed = 'ET';
      } else if (espnName === 'STATUS_SHOOTOUT' || (espnDesc && espnDesc.toLowerCase().includes('shootout') || espnDesc && espnDesc.toLowerCase().includes('penalty'))) {
        time_elapsed = 'PEN';
      }
    }
    
    let status = 'TIMED';
    if (state === 'post') {
      status = 'FINISHED';
    } else if (state === 'in') {
      const espnName = ev.status && ev.status.type && ev.status.type.name;
      const espnDesc = ev.status && ev.status.type && ev.status.type.description;

      if (espnName === 'STATUS_HALFTIME' || (espnDesc && espnDesc.toLowerCase() === 'halftime')) {
        status = 'PAUSED';
      } else if (espnName === 'STATUS_EXTRA_TIME' || (espnDesc && espnDesc.toLowerCase().includes('extra'))) {
        status = 'EXTRA_TIME';
      } else if (espnName === 'STATUS_SHOOTOUT' || (espnDesc && espnDesc.toLowerCase().includes('shootout') || espnDesc && espnDesc.toLowerCase().includes('penalty'))) {
        status = 'PENALTY_SHOOTOUT';
      } else {
        status = 'IN_PLAY';
      }
    }
    
    const espnCity = comp.venue && comp.venue.address && comp.venue.address.city;
    let stadium_id = "1";
    if (espnCity) {
      const foundKey = Object.keys(STADIUM_MAP).find(key => 
        STADIUM_MAP[key].city.toLowerCase().includes(espnCity.toLowerCase()) || 
        espnCity.toLowerCase().includes(STADIUM_MAP[key].city.toLowerCase())
      );
      if (foundKey) stadium_id = foundKey;
    }
    
    const officialMatch = officialMatches.find(m => m.match_id === matchId);
    const groupLetter = officialMatch && officialMatch.group ? officialMatch.group.replace("Grup ", "") : "A";
    
    let type = 'group';
    if (matchId > 72 && officialMatch && officialMatch.group) {
      const g = officialMatch.group.toLowerCase();
      if (g.includes("32")) type = 'r32';
      else if (g.includes("16")) type = 'r16';
      else if (g.includes("quarter")) type = 'qf';
      else if (g.includes("semi")) type = 'sf';
      else if (g.includes("ketiga") || g.includes("third")) type = 'third';
      else if (g.includes("final")) type = 'final';
    }

    return {
      _id: `espn_${ev.id}`,
      id: String(matchId),
      espn_event_id: ev.id,
      home_team_id: home.id,
      away_team_id: away.id,
      home_score: homeScore,
      away_score: awayScore,
      home_scorers,
      away_scorers,
      home_red_cards,
      away_red_cards,
      group: groupLetter,
      matchday: String(officialMatch ? (Math.ceil(matchId / 24) || 1) : 1),
      stadium_id,
      finished,
      time_elapsed,
      type,
      home_team_name_en: homeName,
      away_team_name_en: awayName,
      display_clock: ev.status.displayClock || "",
      period: ev.status.period || 0,
      period_desc: (ev.status.type && ev.status.type.description) || ""
    };
  }).filter(Boolean);

  const mockLive = new URL(window.location.href).searchParams.get('mockLive') === 'true';
  if (mockLive) {
    const mockGame = {
      _id: "espn_mock_1",
      id: "1",
      espn_event_id: "mock_1",
      home_team_id: "mock_home",
      away_team_id: "mock_away",
      home_score: "2",
      away_score: "1",
      home_scorers: `{"Santiago Gimenez 12'","Hirving Lozano 34'"}`,
      away_scorers: `{"Percy Tau 25'"}`,
      home_red_cards: `{"Edson Alvarez 40'"}`,
      away_red_cards: "null",
      group: "A",
      matchday: "1",
      stadium_id: "1",
      finished: "FALSE",
      time_elapsed: "45'+2'",
      type: "group",
      home_team_name_en: "Mexico",
      away_team_name_en: "South Africa",
      display_clock: "45'+2'",
      period: 1,
      period_desc: "1st Half"
    };

    const existingIdx = mappedGames.findIndex(g => g.id === "1");
    if (existingIdx !== -1) {
      mappedGames[existingIdx] = mockGame;
    } else {
      mappedGames.unshift(mockGame);
    }
  }

  return { games: mappedGames, groups: groupsData };
}

// Fetch and update scores from API
async function fetchRealTimeScores(isManual = false) {
  const statusMsgEl = document.getElementById('api-status-msg');
  // Null-safe wrapper — status panel may have been removed from UI
  const statusMsg = statusMsgEl || { innerHTML: '', style: {} };

  const manual = isManual === true;
  const throttleMs = Math.max(currentPollInterval - 5000, 20000); // Slightly less than interval to avoid skips
  if (!manual && Date.now() - lastFetchTime < throttleMs) {
    console.log("Score auto-fetch skipped (throttled).");
    return;
  }

  if (statusMsgEl) {
    statusMsg.innerHTML = '<span class="pulse-dot loading"></span> Sinkronisasi skor otomatis sedang berjalan...';
    statusMsg.style.color = "var(--text-secondary)";
  }


  let data = null;
  let errorMsg = "";

  try {
    console.log("Fetching real-time scores from Vercel proxy (/api/matches)...");
    const matchesUrl = '/api/matches';
    const [resGames, resGroups] = await Promise.all([
      fetch(matchesUrl),
      fetch('/api/groups').catch(err => {
        console.error("Proxy groups fetch failed:", err);
        return null;
      })
    ]);
    if (!resGames.ok) throw new Error(`Vercel proxy returned status ${resGames.status}`);
    const gamesData = await resGames.json();
    let groupsData = null;
    if (resGroups && resGroups.ok) {
      groupsData = await resGroups.json();
    }
    data = { games: gamesData, groups: groupsData };
    console.log("Vercel Proxy fetch succeeded!");
  } catch (err) {
    errorMsg = err.message || "Error on Vercel Proxy fetch";
    console.log("Vercel Proxy fetch failed, trying direct client-side ESPN API fetch...", err);
    try {
      data = await fetchScoresDirectFromEspn();
      console.log("Direct client-side ESPN fetch succeeded!");
    } catch (fallbackErr) {
      errorMsg = `Proxy error: ${errorMsg}. Direct fetch error: ${fallbackErr.message}`;
      console.error("Direct client-side ESPN fetch failed:", fallbackErr);
    }
  }

  // Helper to determine the winner of a knockout match from the API
  const getApiKnockoutWinner = (apiMatch, allApiMatches) => {
    let score1 = parseInt(apiMatch.home_score);
    let score2 = parseInt(apiMatch.away_score);
    if (isNaN(score1) || score1 < 0 || score1 > 15) score1 = 0;
    if (isNaN(score2) || score2 < 0 || score2 > 15) score2 = 0;
    const team1 = apiMatch.home_team_name_en;
    const team2 = apiMatch.away_team_name_en;
    
    if (score1 > score2) return team1;
    if (score2 > score1) return team2;
    
    const matchId = parseInt(apiMatch.id);
    const nextMatch = allApiMatches.find(m => 
      parseInt(m.id) > matchId && 
      (m.home_team_name_en === team1 || m.away_team_name_en === team1 || 
       m.home_team_name_en === team2 || m.away_team_name_en === team2)
    );
    
    if (nextMatch) {
      if (nextMatch.home_team_name_en === team1 || nextMatch.away_team_name_en === team1) {
        return team1;
      }
      if (nextMatch.home_team_name_en === team2 || nextMatch.away_team_name_en === team2) {
        return team2;
      }
    }
    return team1;
  };

  try {
    if (!data) {
      throw new Error(errorMsg || "Gagal mengambil data dari API utama maupun proxy.");
    }

    let gamesArray = null;
    let groupsDataObj = null;

    if (data.games) {
      gamesArray = Array.isArray(data.games) ? data.games : (data.games.games || null);
      groupsDataObj = data.groups;
    } else {
      if (Array.isArray(data)) {
        gamesArray = data;
      } else if (data && Array.isArray(data.games)) {
        gamesArray = data.games;
      }
    }

    if (!gamesArray) {
      throw new Error("Struktur data API tidak dikenal.");
    }

    let anyDataChanged = false;
    if (groupsDataObj) {
      const prevGroupsJson = localStorage.getItem('wc2026_api_groups_data');
      const newGroupsJson = JSON.stringify(groupsDataObj);
      if (prevGroupsJson !== newGroupsJson) {
        localStorage.setItem('wc2026_api_groups_data', newGroupsJson);
        anyDataChanged = true;
      }
    }

    let updatedCount = 0;
    let winnerAdvancedCount = 0;

    gamesArray.forEach(apiMatch => {
      let isFinished = apiMatch.finished === 'TRUE' || apiMatch.time_elapsed === 'finished';
      let isLive = !isFinished && apiMatch.time_elapsed !== 'notstarted';

      let team1Indo = TEAM_TRANSLATIONS[apiMatch.home_team_name_en] || apiMatch.home_team_name_en;
      let team2Indo = TEAM_TRANSLATIONS[apiMatch.away_team_name_en] || apiMatch.away_team_name_en;
      
      team1Indo = normalizePlaceholderName(team1Indo);
      team2Indo = normalizePlaceholderName(team2Indo);
      
      let localKey = null;
      const matchId = parseInt(apiMatch.id);
      
      if (matchId <= 72) {
        const match = WORLD_CUP_DATA.group_stage.find(m => 
          (m.team1 === team1Indo && m.team2 === team2Indo) || 
          (m.team1 === team2Indo && m.team2 === team1Indo)
        );
        if (match) {
          localKey = `gs_${match.date}_${match.team1}_${match.team2}`;
        }
      } else {
        const match = WORLD_CUP_DATA.knockout_stage.find(m => m.match_id === matchId);
        if (match) {
          localKey = `ko_${match.match_id}`;
        }
      }

      if (localKey) {
        const match = getMatchFromKey(localKey);
        const kickoff = getMatchKickoffTime(match);
        
        // Guard: if kickoff is in the future, force notstarted / TIMED status
        if (kickoff >= 0) {
          if (Date.now() < kickoff) {
            isFinished = false;
            isLive = false;
          }
        }
        
        // Time-based fallback: if API says notstarted but kickoff has passed, treat as live
        if (!isFinished && !isLive && kickoff >= 0) {
          const elapsed = Date.now() - kickoff;
          if (elapsed >= 0 && elapsed < 130 * 60 * 1000) {
            isLive = true;
          }
        }
        
        let score1 = null;
        let score2 = null;
        let scorers1 = null;
        let scorers2 = null;
        let redCards1 = null;
        let redCards2 = null;
        
        const rawHomeRed = apiMatch.home_red_cards || apiMatch.home_redcards || null;
        const rawAwayRed = apiMatch.away_red_cards || apiMatch.away_redcards || null;

        if (isFinished || isLive) {
          let rawScore1 = parseInt(apiMatch.home_score);
          let rawScore2 = parseInt(apiMatch.away_score);
          
          // Secure against corrupted API scores (e.g. leaking Persian year 1405 or kickoff hour 12/23)
          if (isNaN(rawScore1) || rawScore1 < 0 || rawScore1 > 15) rawScore1 = 0;
          if (isNaN(rawScore2) || rawScore2 < 0 || rawScore2 > 15) rawScore2 = 0;
          
          if (match) {
            if (match.team1 === team1Indo) {
              score1 = rawScore1;
              score2 = rawScore2;
              scorers1 = apiMatch.home_scorers;
              scorers2 = apiMatch.away_scorers;
              redCards1 = rawHomeRed;
              redCards2 = rawAwayRed;
            } else {
              score1 = rawScore2;
              score2 = rawScore1;
              scorers1 = apiMatch.away_scorers;
              scorers2 = apiMatch.home_scorers;
              redCards1 = rawAwayRed;
              redCards2 = rawHomeRed;
            }
          } else {
            score1 = rawScore1;
            score2 = rawScore2;
            scorers1 = apiMatch.home_scorers;
            scorers2 = apiMatch.away_scorers;
            redCards1 = rawHomeRed;
            redCards2 = rawAwayRed;
          }
        } else {
          // Scheduled / not started
          if (match) {
            if (match.team1 === team1Indo) {
              scorers1 = apiMatch.home_scorers;
              scorers2 = apiMatch.away_scorers;
              redCards1 = rawHomeRed;
              redCards2 = rawAwayRed;
            } else {
              scorers1 = apiMatch.away_scorers;
              scorers2 = apiMatch.home_scorers;
              redCards1 = rawAwayRed;
              redCards2 = rawHomeRed;
            }
          } else {
            scorers1 = apiMatch.home_scorers;
            scorers2 = apiMatch.away_scorers;
            redCards1 = rawHomeRed;
            redCards2 = rawAwayRed;
          }
        }

        let status = 'TIMED';
        if (isFinished) {
          status = 'FINISHED';
        } else if (isLive) {
          const isHt = apiMatch.time_elapsed === 'HT' || 
                       (apiMatch.period_desc && apiMatch.period_desc.toLowerCase().includes('halftime')) ||
                       (apiMatch.display_clock && apiMatch.display_clock.toLowerCase() === 'ht');
          const isEt = apiMatch.time_elapsed === 'ET' || 
                       (apiMatch.period_desc && apiMatch.period_desc.toLowerCase().includes('extra'));
          const isPen = apiMatch.time_elapsed === 'PEN' || 
                        (apiMatch.period_desc && (apiMatch.period_desc.toLowerCase().includes('shootout') || apiMatch.period_desc.toLowerCase().includes('penalty')));
          
          if (isHt) {
            status = 'PAUSED';
          } else if (isEt) {
            status = 'EXTRA_TIME';
          } else if (isPen) {
            status = 'PENALTY_SHOOTOUT';
          } else {
            status = 'IN_PLAY';
          }
        }

        const existing = realScores[localKey];
        let score1_updated_at = existing ? (existing.score1_updated_at || 0) : 0;
        let score2_updated_at = existing ? (existing.score2_updated_at || 0) : 0;

        // When transitioning from a non-live state (TIMED/PRE_MATCH) to live,
        // the existing clock_updated_at could be hours old (set when match was first fetched
        // as 'notstarted'). Using that stale timestamp causes elapsedMs to be huge,
        // making the displayed minute explode (e.g. 1556'). Reset it to now on transition.
        const wasLive = existing && (
          existing.status === 'IN_PLAY' ||
          existing.status === 'PAUSED' ||
          existing.status === 'EXTRA_TIME' ||
          existing.status === 'PENALTY_SHOOTOUT'
        );
        let clock_updated_at = (!existing || !wasLive)
          ? Date.now()  // first time seeing this match live — anchor the clock now
          : (existing.clock_updated_at || Date.now());

        if (existing && isLive) {
          if (score1 !== null && score1 !== undefined && existing.score1 !== null && existing.score1 !== undefined && score1 > existing.score1) {
            score1_updated_at = Date.now();
            // Trigger flash imperatively — only fires once per score value
            triggerScoreFlash(localKey, 1, score1);
          }
          if (score2 !== null && score2 !== undefined && existing.score2 !== null && existing.score2 !== undefined && score2 > existing.score2) {
            score2_updated_at = Date.now();
            // Trigger flash imperatively — only fires once per score value
            triggerScoreFlash(localKey, 2, score2);
          }
          // Only advance clock_updated_at (and reset drift) when ESPN reports a new clock value
          if (wasLive && (existing.display_clock !== apiMatch.display_clock || existing.time_elapsed !== apiMatch.time_elapsed)) {
            clock_updated_at = Date.now();
          }
        }

        let hasMatchChanged = false;
        if (!existing) {
          hasMatchChanged = true;
        } else {
          if (existing.score1 !== score1 ||
              existing.score2 !== score2 ||
              existing.status !== status ||
              existing.time_elapsed !== (apiMatch.time_elapsed || null) ||
              existing.display_clock !== (apiMatch.display_clock || null) ||
              existing.period !== (apiMatch.period || null) ||
              existing.period_desc !== (apiMatch.period_desc || null) ||
              existing.home_scorers !== scorers1 ||
              existing.away_scorers !== scorers2 ||
              existing.home_red_cards !== redCards1 ||
              existing.away_red_cards !== redCards2 ||
              existing.home_team_name_en !== team1Indo ||
              existing.away_team_name_en !== team2Indo ||
              String(existing.stadium_id) !== String(apiMatch.stadium_id) ||
              String(existing.matchday) !== String(apiMatch.matchday)) {
            hasMatchChanged = true;
          }
        }

        if (hasMatchChanged) {
          realScores[localKey] = {
            score1: score1,
            score2: score2,
            status: status,
            stadium_id: apiMatch.stadium_id,
            matchday: apiMatch.matchday,
            home_scorers: scorers1,
            away_scorers: scorers2,
            home_red_cards: redCards1,
            away_red_cards: redCards2,
            home_team_name_en: team1Indo,
            away_team_name_en: team2Indo,
            time_elapsed: apiMatch.time_elapsed || null,
            espn_event_id: apiMatch.espn_event_id || null,
            display_clock: apiMatch.display_clock || null,
            period: apiMatch.period || null,
            period_desc: apiMatch.period_desc || null,
            score1_updated_at: score1_updated_at,
            score2_updated_at: score2_updated_at,
            clock_updated_at: clock_updated_at,
            fetched_at: Date.now()
          };
          updatedCount++;
          anyDataChanged = true;
        }

        // Advance real-life winners to the simulator bracket
        if (matchId >= 73 && isFinished) {
          const apiWinner = getApiKnockoutWinner(apiMatch, gamesArray);
          const winnerTeam = TEAM_TRANSLATIONS[apiWinner] || apiWinner;
          if (winnerTeam && simulatedWinners[matchId] !== winnerTeam) {
            simulatedWinners[matchId] = winnerTeam;
            winnerAdvancedCount++;
            anyDataChanged = true;
          }
        }
      }
    });

    if (anyDataChanged) {
      localStorage.setItem('wc2026_real_scores', JSON.stringify(realScores));
      if (winnerAdvancedCount > 0) {
        localStorage.setItem('wc2026_simulated_winners', JSON.stringify(simulatedWinners));
      }
      isDataDirty = true;
      recalculateKnockoutTree();
    }

    const timeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newStatusHtml = `<span class="pulse-dot"></span> Sinkronisasi otomatis aktif. Terakhir diperbarui: ${timeString} (${updatedCount} skor diperbarui).`;
    if (statusMsg.innerHTML !== newStatusHtml) {
      statusMsg.innerHTML = newStatusHtml;
    }
    statusMsg.style.color = "var(--accent-emerald)";
    lastFetchTime = Date.now();
    consecutiveErrors = 0; // Reset error count on success

    // Refresh active views only if data actually changed
    if (anyDataChanged) {
      if (activeTab === 'tab-schedule') {
        renderSchedule();
      } else if (activeTab === 'tab-bracket') {
        renderBracket();
      } else if (activeTab === 'tab-groups') {
        renderGroups();
      } else if (activeTab === 'tab-home') {
        renderFavorites();
        renderNearestMatches();
        renderLatestResults();
        renderLiveMatches();
      }
    }

  } catch (err) {
    consecutiveErrors++;
    console.error(`Score fetch failed (attempt ${consecutiveErrors}):`, err);
    const retryIn = Math.round(currentPollInterval / 1000);
    statusMsg.innerHTML = `<span class="pulse-dot error"></span> Gagal memperbarui skor: ${err.message || 'Error koneksi API'} (percobaan ke-${consecutiveErrors}, retry ${retryIn}s)`;
    statusMsg.style.color = "var(--accent-red)";
    // Still update lastFetchTime to prevent rapid-fire retries
    lastFetchTime = Date.now();
  }
}

function mapApiStageToLocal(apiStage) {
  switch (apiStage) {
    case 'LAST_32':
    case 'ROUND_OF_32':
      return "Round of 32";
    case 'ROUND_OF_16':
      return "Round of 16";
    case 'QUARTER_FINALS':
    case 'QUARTER_FINAL':
      return "Quarter-final";
    case 'SEMI_FINALS':
    case 'SEMI_FINAL':
      return "Semi-final";
    case 'THIRD_PLACE':
      return "Third-place match";
    case 'FINAL':
      return "Final";
    default:
      return "";
  }
}

let standingsSource = 'official';

let currentModalTab = 'stats';
let currentModalData = null;
let matchSummaryCache = {};

function createModalHeaderHtml(match, scoreData, summaryData) {
  const t1 = match.team1;
  const t2 = match.team2;
  const score1 = scoreData.score1 !== null && scoreData.score1 !== undefined ? scoreData.score1 : '-';
  const score2 = scoreData.score2 !== null && scoreData.score2 !== undefined ? scoreData.score2 : '-';
  // Flash is triggered imperatively by triggerScoreFlash — no inline class evaluation here
  const minuteLabel = isMatchLive(match, scoreData) ? getMatchMinuteLabel(match, scoreData) : (scoreData.status === 'FINISHED' ? 'FT' : 'Belum Mulai');
  
  let modalLiveStatusHtml = '';
  if (isMatchLive(match, scoreData)) {
    const liveParts = getMatchLiveStatusParts(scoreData);
    if (liveParts.clock && liveParts.clock !== liveParts.periodName) {
      modalLiveStatusHtml = `
        <span style="font-size: 0.68rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">${liveParts.periodName}</span>
        <span class="status-live modal-status-live">${liveParts.clock}</span>
      `;
    } else {
      modalLiveStatusHtml = `
        <span class="status-live modal-status-live">${liveParts.periodName}</span>
      `;
    }
  } else {
    modalLiveStatusHtml = `
      <span class="score-status ${scoreData.status === 'FINISHED' ? 'status-ft' : ''}" style="font-size: 0.68rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary);">${minuteLabel}</span>
    `;
  }
  
  const stageOrGroupLabel = match.isKO ? getKoStageLabel(match.stage) : `Grup ${match.group.replace('Grup ', '')}`;
  
  let scorersHtml = '';
  const cleanScorers1 = parseScorers(scoreData.home_scorers);
  const cleanScorers2 = parseScorers(scoreData.away_scorers);
  if (cleanScorers1 || cleanScorers2) {
    scorersHtml = `
      <div class="modal-scorers-container" id="modal-scorers-container-val" style="display: flex; justify-content: space-between; width: 100%; font-size: 0.68rem; color: var(--text-secondary) !important; margin-top: 6px; padding: 0 8px; box-sizing: border-box; font-weight: 500;">
        <div class="home-scorers" style="flex: 1; text-align: right; padding-right: 12px; line-height: 1.4;">
          ${cleanScorers1 || ''}
        </div>
        <div style="flex: 0 0 16px; text-align: center; color: var(--text-muted); font-size: 0.65rem; padding-top: 2px;">⚽</div>
        <div class="away-scorers" style="flex: 1; text-align: left; padding-left: 12px; line-height: 1.4;">
          ${cleanScorers2 || ''}
        </div>
      </div>
    `;
  } else {
    scorersHtml = `
      <div class="modal-scorers-container" id="modal-scorers-container-val" style="display: none; justify-content: space-between; width: 100%; font-size: 0.68rem; color: var(--text-secondary) !important; margin-top: 6px; padding: 0 8px; box-sizing: border-box; font-weight: 500;">
      </div>
    `;
  }

  const timeInfo = getFormattedTime(match.date, match.time);
  const kickoffText = `${timeInfo.date} · ${timeInfo.time} ${timeInfo.tzLabel}`;

  const stadiumText = getMatchVenue(match);

  let refereeText = '-';
  if (summaryData) {
    if (summaryData.info && summaryData.info.referee) {
      refereeText = summaryData.info.referee;
    } else {
      refereeText = '-';
    }
  } else {
    refereeText = 'Memuat...';
  }

  let attendanceText = '-';
  if (summaryData) {
    if (summaryData.info && summaryData.info.attendance) {
      attendanceText = Number(summaryData.info.attendance).toLocaleString('id-ID');
    } else {
      attendanceText = '-';
    }
  } else {
    attendanceText = 'Memuat...';
  }

  const isStarted = scoreData && scoreData.status && scoreData.status !== 'TIMED' && scoreData.status !== 'PRE_MATCH' && scoreData.status !== 'SCHEDULED';
  
  const scoreTextHtml = isStarted ? `
    <span>${score1}</span>
    <span> - </span>
    <span>${score2}</span>
  ` : `
    <span style="font-size: 1.15rem; color: var(--text-secondary); font-weight: 700; letter-spacing: 1.5px;">VS</span>
  `;

  return `
    <div class="modal-match-header-summary">
      <div style="font-size: 0.65rem; color: var(--primary-gold) !important; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 2px;">
        ${stageOrGroupLabel}
      </div>
      <div class="modal-teams-row">
        <div class="modal-team-col">
          <div class="modal-team-flag-wrapper">${getFlagHtml(t1)}</div>
          <span class="modal-team-name">${t1}</span>
        </div>
        <div class="modal-score-box">
          <div class="modal-score-text" id="modal-score-text-val">
            ${scoreTextHtml}
          </div>
          <div class="modal-status-box" id="modal-status-box-val">${modalLiveStatusHtml}</div>
        </div>
        <div class="modal-team-col">
          <div class="modal-team-flag-wrapper">${getFlagHtml(t2)}</div>
          <span class="modal-team-name">${t2}</span>
        </div>
      </div>
      ${scorersHtml}
      <div class="modal-match-meta-grid">
        <div class="meta-item">
          <div class="meta-item-header">
            <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span class="meta-label">Kick-Off</span>
          </div>
          <span class="meta-value">${kickoffText}</span>
        </div>
        <div class="meta-item">
          <div class="meta-item-header">
            <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span class="meta-label">Stadion</span>
          </div>
          <span class="meta-value">${stadiumText}</span>
        </div>
        <div class="meta-item">
          <div class="meta-item-header">
            <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span class="meta-label">Wasit</span>
          </div>
          <span class="meta-value" id="modal-referee-val">${refereeText}</span>
        </div>
        <div class="meta-item">
          <div class="meta-item-header">
            <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span class="meta-label">Penonton</span>
          </div>
          <span class="meta-value" id="modal-attendance-val">${attendanceText}</span>
        </div>
      </div>
    </div>
  `;
}

window.openMatchDetailModal = async function(matchKey) {
  const modal = document.getElementById('match-detail-modal');
  const body = document.getElementById('match-detail-modal-body');
  if (!modal || !body) return;
  
  modal.classList.add('active');
  
  const allMatches = getAllMatches();
  let match = allMatches.find(m => {
    const key = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    return key === matchKey;
  });
  
  if (!match) {
    body.innerHTML = '<div style="text-align: center; color: #718096 !important; font-size: 0.8rem; padding: 20px;">Pertandingan tidak ditemukan.</div>';
    return;
  }

  // Use potential slot names for upcoming knockout matches with no real score
  if (match.isKO) {
    const score = getMatchScore(matchKey);
    if (!score && !showPotentialDraw && !isGroupStageComplete()) {
      if (!isRealTeamName(match.team1) || !isRealTeamName(match.team2)) {
        const orig = WORLD_CUP_DATA.knockout_stage.find(ok => ok.match_id === match.match_id);
        if (orig) {
          match = {
            ...match,
            team1: isRealTeamName(match.team1) ? match.team1 : orig.team1,
            team2: isRealTeamName(match.team2) ? match.team2 : orig.team2
          };
        }
      }
    }
  }
  
  const rawScore = realScores[matchKey];
  const espnEventId = rawScore ? rawScore.espn_event_id : null;
  const scoreData = getMatchScore(matchKey) || { score1: 0, score2: 0, status: 'TIMED' };
  
  const t1 = match.team1;
  const t2 = match.team2;
  
  if (!espnEventId) {
    const staticHeaderHtml = createModalHeaderHtml(match, scoreData, { info: { referee: '-', attendance: '-' } });
    body.innerHTML = `
      <div class="modal-header-container">${staticHeaderHtml}</div>
      <div style="text-align: center; color: var(--text-secondary) !important; font-size: 0.78rem; padding: 20px; line-height: 1.5; background: rgba(255,255,255,0.02); border-radius: var(--border-radius-sm); border: 1px dashed var(--glass-border); margin-top: 16px;">
        Statistik, lineup, dan komentar resmi hanya tersedia untuk pertandingan yang disinkronkan dari ESPN API.
      </div>
    `;
    return;
  }
  
  const cached = matchSummaryCache[espnEventId];
  if (cached) {
    currentModalData = { ...cached };
    currentModalData.homeTeam = t1;
    currentModalData.awayTeam = t2;
    currentModalData.scoreData = scoreData;
    currentModalData.match = match;
    currentModalData.matchKey = matchKey;
    currentModalTab = 'stats';
    
    renderModalContent();
    
    if (scoreData.status === 'FINISHED') {
      return;
    }
  } else {
    // Only show loading spinner if we don't have cached data to show immediately
    const loadingHeaderHtml = createModalHeaderHtml(match, scoreData, null);
    body.innerHTML = `
      <div class="modal-header-container">${loadingHeaderHtml}</div>
      <div class="modal-tabs-menu" style="display: none;"></div>
      <div id="modal-tab-content-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 40px 0;">
        <span class="pulse-dot loading" style="width: 12px; height: 12px; background-color: var(--primary-gold) !important;"></span>
        <span style="font-size: 0.72rem; color: var(--text-secondary) !important;">Memuat detail pertandingan...</span>
      </div>
    `;
  }
  
  try {
    const res = await fetch(`/api/match-summary?event=${espnEventId}`);
    if (!res.ok) throw new Error('Gagal mengambil data dari API');
    
    const summaryData = await res.json();
    matchSummaryCache[espnEventId] = summaryData;
    
    // Check if the modal is still open for the same match
    const modalActive = modal.classList.contains('active');
    const matchesCurrent = currentModalData && currentModalData.matchKey === matchKey;
    const isInitialLoadNoCache = !cached; // If we didn't show cache, we must render
    
    if (modalActive && (matchesCurrent || isInitialLoadNoCache)) {
      currentModalData = { ...summaryData };
      currentModalData.homeTeam = t1;
      currentModalData.awayTeam = t2;
      currentModalData.scoreData = scoreData;
      currentModalData.match = match;
      currentModalData.matchKey = matchKey;
      
      // If we didn't have cache, set tab to stats
      if (isInitialLoadNoCache) {
        currentModalTab = 'stats';
      }
      
      renderModalContent();
    }
  } catch (err) {
    console.error(err);
    if (!cached) {
      const errorHeaderHtml = createModalHeaderHtml(match, scoreData, { info: { referee: '-', attendance: '-' } });
      body.innerHTML = `
        <div class="modal-header-container">${errorHeaderHtml}</div>
        <div style="text-align: center; color: var(--accent-red); font-size: 0.78rem; padding: 20px; line-height: 1.5; background: rgba(255, 255, 255, 0.02); border-radius: var(--border-radius-sm); border: 1px solid rgba(239, 68, 68, 0.25); margin-top: 16px;">
          Gagal memuat detail: ${err.message || 'Koneksi error'}.
        </div>
      `;
    }
  }
};

window.closeMatchDetailModal = function() {
  const modal = document.getElementById('match-detail-modal');
  if (modal) {
    modal.classList.remove('active');
  }
  currentModalData = null;
  _lastRenderedLineupsFingerprint = null; // reset so next open always renders fresh
};

window.switchModalTab = function(tabId, btn) {
  currentModalTab = tabId;
  
  const tabBtns = document.querySelectorAll('.modal-tab-btn');
  tabBtns.forEach(btn => btn.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  const contentEl = document.getElementById('modal-tab-content-container');
  if (contentEl && currentModalData) {
    if (tabId === 'lineups') {
      // Reset fingerprint so the tab switch always renders the full lineup once
      _lastRenderedLineupsFingerprint = null;
      contentEl.innerHTML = renderLineupsTab(currentModalData.lineups);
      // Record fingerprint immediately so subsequent 1s ticks don't re-render
      _lastRenderedLineupsFingerprint = getLineupsFingerprint(currentModalData);
    } else {
      contentEl.innerHTML = renderStatsTab(currentModalData.stats);
    }
  }
};

function renderModalContent() {
  const body = document.getElementById('match-detail-modal-body');
  if (!body || !currentModalData) return;
  
  let headerContainer = body.querySelector('.modal-header-container');
  let tabsMenu = body.querySelector('.modal-tabs-menu');
  let contentContainer = document.getElementById('modal-tab-content-container');
  
  const headerHtml = createModalHeaderHtml(
    currentModalData.match,
    currentModalData.scoreData,
    currentModalData
  );
  
  const hasTabs = tabsMenu && tabsMenu.querySelectorAll('.modal-tab-btn').length > 0;
  
  if (!headerContainer || !tabsMenu || !hasTabs || !contentContainer) {
    // Rebuild the complete shell if it's not present or incomplete
    _lastRenderedLineupsFingerprint = null; // ensure stale fingerprint is cleared
    const initialTabContent = currentModalTab === 'stats'
      ? renderStatsTab(currentModalData.stats)
      : renderLineupsTab(currentModalData.lineups);
    body.innerHTML = `
      <div class="modal-header-container">${headerHtml}</div>
      <div class="modal-tabs-menu">
        <button class="modal-tab-btn ${currentModalTab === 'stats' ? 'active' : ''}" onclick="window.switchModalTab('stats', this)">Statistik</button>
        <button class="modal-tab-btn ${currentModalTab === 'lineups' ? 'active' : ''}" onclick="window.switchModalTab('lineups', this)">Lineup</button>
      </div>
      <div id="modal-tab-content-container">
        ${initialTabContent}
      </div>
    `;
    // Record fingerprint right after the full build so the 1s ticker doesn't immediately re-render
    if (currentModalTab === 'lineups') {
      _lastRenderedLineupsFingerprint = getLineupsFingerprint(currentModalData);
    }
  } else {
    // If the shell is already there, update elements selectively
    if (headerContainer.innerHTML !== headerHtml) {
      headerContainer.innerHTML = headerHtml;
    }
    
    // Update tabs active state
    const tabBtns = tabsMenu.querySelectorAll('.modal-tab-btn');
    tabBtns.forEach(btn => {
      const onclickAttr = btn.getAttribute('onclick') || '';
      const isStatsBtn = onclickAttr.includes('stats');
      const isLineupsBtn = onclickAttr.includes('lineups');
      if (currentModalTab === 'stats' && isStatsBtn) {
        btn.classList.add('active');
      } else if (currentModalTab === 'lineups' && isLineupsBtn) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Update content tab container only when underlying data actually changed.
    // For lineups: use a lightweight fingerprint instead of innerHTML comparison (which is unreliable
    // because the browser normalises whitespace/newlines differently than the JS template literal).
    if (currentModalTab === 'lineups') {
      const fp = getLineupsFingerprint(currentModalData);
      if (fp !== _lastRenderedLineupsFingerprint) {
        _lastRenderedLineupsFingerprint = fp;
        contentContainer.innerHTML = renderLineupsTab(currentModalData.lineups);
      }
    } else {
      const contentHtml = renderStatsTab(currentModalData.stats);
      if (contentContainer.innerHTML !== contentHtml) {
        contentContainer.innerHTML = contentHtml;
      }
    }
  }
}

function renderStatsTab(stats) {
  if (!stats || !stats.home || Object.keys(stats.home).length === 0) {
    return `
      <div class="empty-tab-placeholder">
        <svg class="empty-placeholder-icon" viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="var(--primary-gold)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <p class="empty-placeholder-title">Statistik Belum Tersedia</p>
        <p class="empty-placeholder-subtitle">Statistik detail pertandingan akan ditampilkan langsung setelah laga dimulai.</p>
      </div>
    `;
  }
  
  const h = stats.home;
  const a = stats.away;
  
  const createStatRow = (label, valH, valA, isPct = false) => {
    let pctH = 50;
    let pctA = 50;
    
    const numH = parseFloat(valH) || 0;
    const numA = parseFloat(valA) || 0;
    if (isPct) {
      pctH = numH;
      pctA = numA;
    } else {
      const total = numH + numA;
      if (total > 0) {
        pctH = (numH / total) * 100;
        pctA = (numA / total) * 100;
      }
    }
    
    return `
      <div class="stat-item">
        <div class="stat-label-row">
          <span>${valH}${isPct ? '%' : ''}</span>
          <span class="stat-name">${label}</span>
          <span>${valA}${isPct ? '%' : ''}</span>
        </div>
        <div class="stat-bar-container">
          <div class="stat-bar-home" style="width: ${pctH}%;"></div>
          <div class="stat-bar-away" style="width: ${pctA}%;"></div>
        </div>
      </div>
    `;
  };
  
  return `
    <div class="stats-tab-content">
      ${createStatRow('Penguasaan Bola', h.possessionPct || '0', a.possessionPct || '0', true)}
      ${createStatRow('Total Tembakan', h.totalShots || '0', a.totalShots || '0')}
      ${createStatRow('Tembakan Tepat Sasaran', h.shotsOnTarget || '0', a.shotsOnTarget || '0')}
      ${createStatRow('Umpan Sukses', h.accuratePasses || '0', a.accuratePasses || '0')}
      ${createStatRow('Pelanggaran', h.foulsCommitted || '0', a.foulsCommitted || '0')}
      ${createStatRow('Tendangan Sudut', h.wonCorners || '0', a.wonCorners || '0')}
      ${createStatRow('Penyelamatan', h.saves || '0', a.saves || '0')}
      ${createStatRow('Kartu Merah', h.redCards || '0', a.redCards || '0')}
    </div>
  `;
}

function isGoalkeeper(pos) {
  if (!pos) return false;
  const p = pos.toUpperCase().trim();
  return p === 'GK' || p === 'G' || p === 'GKPR' || p.includes('GOAL');
}

function groupPlayersIntoLines(players, formationString) {
  // Define line categories
  const getLineCategory = (pos) => {
    if (isGoalkeeper(pos)) return 'GK';
    const p = pos.toUpperCase().trim();
    const midPositions = ['LM', 'RM', 'CM', 'LCM', 'RCM', 'DM', 'CDM', 'LDM', 'RDM', 'AM', 'CAM', 'LAM', 'RAM', 'MF', 'M', 'AM-L', 'AM-R', 'AML', 'AMR'];
    
    if (midPositions.includes(p) || p.includes('MID') || p.includes('M')) return 'MID';
    if (p.includes('DEF') || p.includes('D') || p.includes('B')) return 'DEF';
    return 'ATT';
  };

  // Define depth ranks for longitudinal sorting (deepest to most advanced)
  const getLongitudinalRank = (pos) => {
    if (isGoalkeeper(pos)) return 0;
    const p = pos.toUpperCase().trim();
    const ranks = {
      // Defenders
      'LB': 1, 'LWB': 1, 'CB': 1, 'LCB': 1, 'RCB': 1, 'RB': 1, 'RWB': 1, 'DF': 1, 'D': 1,
      // Midfielders (Deepest to Advanced)
      'DM': 2, 'CDM': 2, 'LDM': 2, 'RDM': 2,
      'CM': 3, 'LCM': 3, 'RCM': 3, 'MF': 3, 'M': 3,
      'LM': 4, 'RM': 4,
      'AM': 5, 'CAM': 5, 'LAM': 5, 'RAM': 5, 'AM-L': 5, 'AM-R': 5, 'AML': 5, 'AMR': 5,
      // Forwards (Deepest to Advanced)
      'LW': 6, 'RW': 6, 'CF': 6, 'LF': 6, 'RF': 6,
      'ST': 7, 'FW': 7, 'F': 7
    };
    if (ranks[p] !== undefined) return ranks[p];
    if (p.includes('DM') || p.includes('CDM')) return 2;
    if (p.includes('AM') || p.includes('CAM')) return 5;
    if (p.includes('M')) return 3;
    if (p.includes('D') || p.includes('B')) return 1;
    return 6;
  };

  // Define side ranks for left-to-right sorting (-2 to 2)
  const getSideRank = (pos) => {
    if (isGoalkeeper(pos)) return 0;
    const p = pos.toUpperCase().trim();
    const ranks = {
      'LB': -2, 'LWB': -2, 'LM': -2, 'LW': -2, 'LWF': -2, 'AM-L': -2, 'AML': -2,
      'LCB': -1, 'LCM': -1, 'LDM': -1, 'LAM': -1, 'LF': -1, 'LS': -1,
      'GK': 0, 'CB': 0, 'DF': 0, 'D': 0, 'DM': 0, 'CDM': 0, 'CM': 0, 'MF': 0, 'M': 0, 'AM': 0, 'CAM': 0, 'CF': 0, 'ST': 0, 'F': 0, 'FW': 0,
      'RCB': 1, 'RCM': 1, 'RDM': 1, 'RAM': 1, 'RF': 1, 'RS': 1,
      'RB': 2, 'RWB': 2, 'RM': 2, 'RW': 2, 'RWF': 2, 'AM-R': 2, 'AMR': 2
    };
    if (ranks[p] !== undefined) return ranks[p];
    
    // Check suffixes / hyphens (e.g. AM-L, AM-R, Mid-L, Mid-R)
    if (p.endsWith('-L') || p.endsWith('L')) return -1.5;
    if (p.endsWith('-R') || p.endsWith('R')) return 1.5;
    
    // Check prefixes (e.g. LCB, LCM)
    if (p.startsWith('L')) return -1;
    if (p.startsWith('R')) return 1;
    return 0;
  };

  // 1. Separate GK
  const gk = players.find(p => isGoalkeeper(p.position)) || players[0];
  const outfield = players.filter(p => p !== gk);

  // 2. Sort outfield players by longitudinal depth rank, then side rank (Left -> Right)
  const sortedOutfield = [...outfield].sort((a, b) => {
    const longA = getLongitudinalRank(a.position);
    const longB = getLongitudinalRank(b.position);
    
    if (longA !== longB) {
      return longA - longB;
    }
    return getSideRank(a.position) - getSideRank(b.position);
  });

  const lines = [[gk]];

  // 3. Distribute into lines based on formation
  let parts = [4, 3, 3];
  if (formationString && formationString.includes('-')) {
    parts = formationString.split('-').map(x => parseInt(x) || 3);
  }
  
  const totalExpected = parts.reduce((a, b) => a + b, 0) + 1;

  if (totalExpected === players.length) {
    let idx = 0;
    parts.forEach(count => {
      const linePlayers = sortedOutfield.slice(idx, idx + count);
      // Ensure each sliced line is strictly ordered Left to Right
      linePlayers.sort((a, b) => getSideRank(a.position) - getSideRank(b.position));
      lines.push(linePlayers);
      idx += count;
    });
  } else {
    // Fallback: group by category and sort Left to Right
    const def = sortedOutfield.filter(p => getLineCategory(p.position) === 'DEF');
    const mid = sortedOutfield.filter(p => getLineCategory(p.position) === 'MID');
    const fwd = sortedOutfield.filter(p => getLineCategory(p.position) === 'ATT');
    
    if (def.length > 0) {
      def.sort((a, b) => getSideRank(a.position) - getSideRank(b.position));
      lines.push(def);
    }
    if (mid.length > 0) {
      mid.sort((a, b) => getSideRank(a.position) - getSideRank(b.position));
      lines.push(mid);
    }
    if (fwd.length > 0) {
      fwd.sort((a, b) => getSideRank(a.position) - getSideRank(b.position));
      lines.push(fwd);
    }
  }

  return lines;
}

const SOCCER_TEAM_KITS = {
  "Meksiko": { home: ["#006847", "#ffffff"], away: ["#ffffff", "#006847"] },
  "Afrika Selatan": { home: ["#ffcc00", "#007a33"], away: ["#007a33", "#ffcc00"] },
  "Korea Selatan": { home: ["#ea1c2c", "#ffffff"], away: ["#ffffff", "#ea1c2c"] },
  "Ceko": { home: ["#e30613", "#ffffff"], away: ["#ffffff", "#11457e"] },
  "Kanada": { home: ["#da291c", "#ffffff"], away: ["#ffffff", "#da291c"] },
  "Bosnia dan Herzegovina": { home: ["#002fbe", "#ffffff"], away: ["#ffffff", "#002fbe"] },
  "Qatar": { home: ["#8a1538", "#ffffff"], away: ["#ffffff", "#8a1538"] },
  "Swiss": { home: ["#da291c", "#ffffff"], away: ["#ffffff", "#da291c"] },
  "Brasil": { home: ["#fde100", "#009c3b"], away: ["#002776", "#ffffff"] },
  "Maroko": { home: ["#c1272d", "#ffffff"], away: ["#ffffff", "#c1272d"] },
  "Haiti": { home: ["#00209f", "#ffffff"], away: ["#d21034", "#ffffff"] },
  "Skotlandia": { home: ["#002d62", "#ffffff"], away: ["#ffffff", "#002d62"] },
  "Amerika Serikat": { home: ["#ffffff", "#002868"], away: ["#002868", "#ffffff"] },
  "Paraguay": { home: ["#d52b1e", "#ffffff"], away: ["#ffffff", "#d52b1e"] },
  "Australia": { home: ["#ffcd00", "#00843d"], away: ["#002fbe", "#ffffff"] },
  "Turki": { home: ["#e30a17", "#ffffff"], away: ["#ffffff", "#e30a17"] },
  "Jerman": { home: ["#ffffff", "#000000"], away: ["#ff69b4", "#ffffff"] },
  "Curaçao": { home: ["#002b7f", "#ffffff"], away: ["#ffffff", "#002b7f"] },
  "Belanda": { home: ["#f36c21", "#ffffff"], away: ["#ffffff", "#21468b"] },
  "Jepang": { home: ["#004b87", "#ffffff"], away: ["#ffffff", "#004b87"] },
  "Pantai Gading": { home: ["#ff8200", "#ffffff"], away: ["#ffffff", "#ff8200"] },
  "Ekuador": { home: ["#fdd100", "#0033a0"], away: ["#0033a0", "#ffffff"] },
  "Swedia": { home: ["#fecc00", "#006aa7"], away: ["#006aa7", "#fecc00"] },
  "Tunisia": { home: ["#ffffff", "#e20919"], away: ["#e20919", "#ffffff"] },
  "Spanyol": { home: ["#c60b1e", "#fabd00"], away: ["#ffffff", "#c60b1e"] },
  "Tanjung Verde": { home: ["#002a6f", "#ffffff"], away: ["#ffffff", "#002a6f"] },
  "Belgia": { home: ["#e30613", "#ffd100"], away: ["#ffffff", "#e30613"] },
  "Mesir": { home: ["#ce1126", "#ffffff"], away: ["#ffffff", "#ce1126"] },
  "Arab Saudi": { home: ["#006c35", "#ffffff"], away: ["#ffffff", "#006c35"] },
  "Uruguay": { home: ["#0081c6", "#ffffff"], away: ["#ffffff", "#0081c6"] },
  "Iran": { home: ["#ffffff", "#239e46"], away: ["#da291c", "#ffffff"] },
  "Selandia Baru": { home: ["#ffffff", "#000000"], away: ["#000000", "#ffffff"] },
  "Prancis": { home: ["#002395", "#ffffff"], away: ["#ffffff", "#002395"] },
  "Senegal": { home: ["#ffffff", "#00853f"], away: ["#00853f", "#ffffff"] },
  "Irak": { home: ["#006c35", "#ffffff"], away: ["#ffffff", "#006c35"] },
  "Norwegia": { home: ["#ba0c2f", "#ffffff"], away: ["#ffffff", "#00205b"] },
  "Argentina": { home: ["#75aadb", "#ffffff"], away: ["#00205b", "#ffffff"] },
  "Aljazair": { home: ["#ffffff", "#006233"], away: ["#006233", "#ffffff"] },
  "Austria": { home: ["#ed2939", "#ffffff"], away: ["#ffffff", "#ed2939"] },
  "Yordania": { home: ["#ffffff", "#ce1126"], away: ["#ce1126", "#ffffff"] },
  "Portugal": { home: ["#ff0000", "#ffffff"], away: ["#ffffff", "#ff0000"] },
  "RD Kongo": { home: ["#007fff", "#fcd116"], away: ["#ffffff", "#007fff"] },
  "Inggris": { home: ["#ffffff", "#00205b"], away: ["#00205b", "#ffffff"] },
  "Kroasia": { home: ["#ffffff", "#ff0000"], away: ["#00209f", "#ffffff"] },
  "Ghana": { home: ["#ffffff", "#000000"], away: ["#da291c", "#ffffff"] },
  "Panama": { home: ["#da291c", "#ffffff"], away: ["#ffffff", "#da291c"] },
  "Uzbekistan": { home: ["#ffffff", "#00aeef"], away: ["#00aeef", "#ffffff"] },
  "Kolombia": { home: ["#fcd116", "#003893"], away: ["#003893", "#ffffff"] }
};

function colorsClash(hex1, hex2) {
  const getRgb = (hex) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return { r, g, b };
  };
  try {
    const c1 = getRgb(hex1);
    const c2 = getRgb(hex2);
    const dist = Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2)
    );
    return dist < 120;
  } catch (e) {
    return false;
  }
}

function getTeamJerseyStyles(teamName, isHome, defaultColor, defaultTextColor) {
  let kit = SOCCER_TEAM_KITS[teamName];
  if (!kit) {
    const clean = teamName.toLowerCase().trim();
    for (const k in SOCCER_TEAM_KITS) {
      if (k.toLowerCase() === clean) {
        kit = SOCCER_TEAM_KITS[k];
        break;
      }
    }
  }
  
  if (kit) {
    return {
      homeBg: kit.home[0],
      homeText: kit.home[1],
      awayBg: kit.away[0],
      awayText: kit.away[1]
    };
  }
  
  const legacyColors = getTeamColor(teamName);
  if (Array.isArray(legacyColors) && legacyColors.length > 0) {
    return {
      homeBg: legacyColors[0],
      homeText: legacyColors[1] || '#ffffff',
      awayBg: legacyColors[2] || legacyColors[0],
      awayText: legacyColors[1] || '#ffffff'
    };
  }
  
  return {
    homeBg: defaultColor,
    homeText: defaultTextColor,
    awayBg: defaultColor === '#ffffff' ? '#000000' : '#ffffff',
    awayText: defaultTextColor
  };
}

function getGkJerseyBg(team1Bg, team2Bg) {
  const options = ['#ff9500', '#00ff00', '#ffff00', '#00e5ff']; // Orange, Neon Green, Yellow, Cyan
  for (const color of options) {
    if (!colorsClash(color, team1Bg) && !colorsClash(color, team2Bg)) {
      return color;
    }
  }
  return '#ff9500'; // fallback
}

function getContrastTextColor(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140 ? '#000000' : '#ffffff';
}

// Extract player names from raw scorer/red-card string (strips minute info)
function parseScorerNames(scorersStr) {
  if (!scorersStr || scorersStr === 'null' || scorersStr === '""' || scorersStr === '[]') return [];
  const cleaned = scorersStr.replace(/[{}"\[\]]/g, '').trim();
  if (!cleaned) return [];
  return cleaned
    .split(',')
    .map(s => {
      let item = s.trim().replace(/^['"]|['"]$/g, '');
      // Strip assist annotation like " (A: Di Maria)"
      item = item.replace(/\s*\(A:.*?\)\s*$/i, '').trim();
      // Strip own goal annotation like " (OG)"
      item = item.replace(/\s*\(OG\)\s*$/i, '').trim();
      // Strip trailing minute like "45'", "90+3'", "45'+3'", or bare number
      item = item.replace(/\s+\d+.*?$/, '').trim();
      return item;
    })
    .filter(Boolean);
}

// Check if two player names match, accounting for abbreviations, accents, and suffixes
function isNameMatch(name1, name2) {
  if (!name1 || !name2) return false;
  
  const SUFFIXES = new Set(["jr", "sr", "ii", "iii", "iv"]);
  const cleanTokens = (str) => {
    return str.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9\s]/g, " ")     // replace punctuation with space
      .split(/\s+/)
      .filter(t => t.length > 0 && !SUFFIXES.has(t));
  };
  
  const t1 = cleanTokens(name1);
  const t2 = cleanTokens(name2);
  
  if (t1.length === 0 || t2.length === 0) return false;
  
  // Exact match of the full string (ignoring spaces/punctuation/accents)
  if (t1.join(" ") === t2.join(" ")) return true;
  
  // Identify last tokens
  const last1 = t1[t1.length - 1];
  const last2 = t2[t2.length - 1];
  
  // Last name must match!
  if (last1 !== last2) {
    return false;
  }
  
  const firsts1 = t1.slice(0, -1);
  const firsts2 = t2.slice(0, -1);
  
  if (firsts1.length === 0 || firsts2.length === 0) {
    return true; 
  }
  
  const isCompatible = (tok1, tok2) => {
    if (tok1 === tok2) return true;
    if (tok1.length === 1 && tok2.startsWith(tok1)) return true;
    if (tok2.length === 1 && tok1.startsWith(tok2)) return true;
    return false;
  };
  
  let hasCompatibleFirst = false;
  for (const f1 of firsts1) {
    for (const f2 of firsts2) {
      if (isCompatible(f1, f2)) {
        hasCompatibleFirst = true;
        break;
      }
    }
  }
  
  return hasCompatibleFirst;
}

// True if playerName matches any name in eventNames array
function playerMatchesEvent(playerName, eventNames) {
  if (!playerName || !eventNames || eventNames.length === 0) return false;
  return eventNames.some(ev => isNameMatch(playerName, ev));
}

function countPlayerGoals(playerName, scorerNames) {
  if (!playerName || !scorerNames || scorerNames.length === 0) return 0;
  let count = 0;
  scorerNames.forEach(ev => {
    if (isNameMatch(playerName, ev)) {
      count++;
    }
  });
  return count;
}

function formatPitchPlayerName(fullName) {
  if (!fullName) return '';
  return fullName.trim();
}

// Returns a lightweight fingerprint of the lineup + event data that should trigger a re-render.
// Only includes: player IDs/jersey numbers, formation, and live event annotations (goals/cards/subs).
// This avoids the expensive innerHTML comparison which is unreliable (browser normalises whitespace).
function getLineupsFingerprint(modalData) {
  if (!modalData) return 'null';
  const sd = modalData.scoreData;
  const lin = modalData.lineups;
  const key = [
    // Match identity
    modalData.matchKey || '',
    // Scorer/card events (change during live play)
    sd ? (sd.home_scorers || '') : '',
    sd ? (sd.away_scorers || '') : '',
    sd ? (sd.home_red_cards || '') : '',
    sd ? (sd.away_red_cards || '') : '',
    // Lineup structure & colors (changes only when API pushes new lineup data)
    lin ? JSON.stringify([
      lin.home && lin.home.formation,
      lin.home && lin.home.coach,
      lin.home && lin.home.uniformColor,
      lin.home && lin.home.teamColor,
      lin.home && lin.home.starters && lin.home.starters.map(p => p.jersey + p.name + (p.subbedOut || '') + (p.subbedIn || '')).join('|'),
      lin.home && lin.home.bench && lin.home.bench.map(p => p.jersey + p.name + (p.subbedIn || '') + (p.subbedMinute || '')).join('|'),
      lin.away && lin.away.formation,
      lin.away && lin.away.coach,
      lin.away && lin.away.uniformColor,
      lin.away && lin.away.teamColor,
      lin.away && lin.away.starters && lin.away.starters.map(p => p.jersey + p.name + (p.subbedOut || '') + (p.subbedIn || '')).join('|'),
      lin.away && lin.away.bench && lin.away.bench.map(p => p.jersey + p.name + (p.subbedIn || '') + (p.subbedMinute || '')).join('|'),
    ]) : 'nolineup',
  ].join('::');
  return key;
}

function renderLineupsTab(lineups) {
  const home = lineups ? lineups.home : null;
  const away = lineups ? lineups.away : null;
  
  const hasLineup = (home && home.starters && home.starters.length > 0) ||
                    (away && away.starters && away.starters.length > 0);
  if (!hasLineup) {
    return `
      <div class="empty-tab-placeholder">
        <svg class="empty-placeholder-icon" viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="var(--primary-gold)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="3" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <circle cx="12" cy="12" r="3.5" />
          <rect x="6" y="2" width="12" height="4" />
          <rect x="6" y="18" width="12" height="4" />
        </svg>
        <p class="empty-placeholder-title">Susunan Pemain Belum Tersedia</p>
        <p class="empty-placeholder-subtitle">Lineup resmi akan ditampilkan segera setelah dirilis oleh tim penyelenggara.</p>
      </div>
    `;
  }
  
  const homeFormation = home.formation || '?';
  const awayFormation = away.formation || '?';
  
  const homeLines = groupPlayersIntoLines(home.starters || [], homeFormation);
  const awayLines = groupPlayersIntoLines(away.starters || [], awayFormation);
  
  const t1 = (currentModalData && currentModalData.homeTeam) || 'Home';
  const t2 = (currentModalData && currentModalData.awayTeam) || 'Away';
  const scoreData = currentModalData && currentModalData.scoreData;
  
  // Parse event names for icon annotations
  const homeScorerNames  = parseScorerNames(scoreData?.home_scorers);
  const awayScorerNames  = parseScorerNames(scoreData?.away_scorers);
  const homeRedNames     = parseScorerNames(scoreData?.home_red_cards);
  const awayRedNames     = parseScorerNames(scoreData?.away_red_cards);

  // Dynamic Kit colours from API uniformColor or teamColor
  const apiHomeBg = home.uniformColor || home.teamColor;
  const apiAwayBg = away.uniformColor || away.teamColor;

  const homeKit = getTeamJerseyStyles(t1, true,  'var(--primary-gold)', '#000000');
  const awayKit = getTeamJerseyStyles(t2, false, 'var(--secondary-bronze)', '#ffffff');

  const homeBg = apiHomeBg || homeKit.homeBg;
  const homeText = apiHomeBg ? getContrastTextColor(homeBg) : homeKit.homeText;
  const homeJerseyBorder = (homeBg === '#ffffff' || homeBg === 'var(--panel-bg-solid)') ? '#cbd5e1' : 'rgba(255,255,255,0.3)';

  let awayBg = awayKit.homeBg;
  let awayText = awayKit.homeText;
  if (apiAwayBg) {
    awayBg = apiAwayBg;
    awayText = getContrastTextColor(awayBg);
  } else {
    const clash = colorsClash(homeBg, awayKit.homeBg);
    awayBg = clash ? awayKit.awayBg : awayKit.homeBg;
    awayText = clash ? awayKit.awayText : awayKit.homeText;
  }
  const awayJerseyBorder = (awayBg === '#ffffff' || awayBg === 'var(--panel-bg-solid)') ? '#cbd5e1' : 'rgba(255,255,255,0.3)';
  const gkBg    = getGkJerseyBg(homeBg, awayBg);
  const gkText  = getContrastTextColor(gkBg);
  const gkBorder = gkBg === '#ffffff' ? '#cbd5e1' : 'rgba(255,255,255,0.5)';

  // Horizontal spread helper
  const getX = (j, P) => {
    if (P === 1) return 50;
    const spacing = Math.min(84 / P, 22);
    return 50 + (j - (P - 1) / 2) * spacing;
  };

  // Event icon HTML (overlaid on jersey)
  const eventIcons = (playerName, scorerNames, redNames, isSubbedOut) => {
    const goalCount = countPlayerGoals(playerName, scorerNames);
    const hasRed  = playerMatchesEvent(playerName, redNames);
    let html = '';
    if (goalCount > 0) {
      html += `<span class="jersey-event goal-badge">${'⚽'.repeat(goalCount)}</span>`;
    }
    if (hasRed)  html += `<span class="jersey-event red-badge"></span>`;
    if (isSubbedOut) html += `<span class="jersey-event subout-badge">↓</span>`;
    return html;
  };

  let playerNodesHtml = '';

  // Home players — GK bottom (92%), ATT top of home half (55%)
  const L_home = homeLines.length;
  homeLines.forEach((line, i) => {
    const y = 92 - (i / Math.max(L_home - 1, 1)) * 37;
    line.forEach((p, j) => {
      const x = getX(j, line.length);
      const displayName = formatPitchPlayerName(p.name);
      const isGK = isGoalkeeper(p.position);
      const bg = isGK ? gkBg : homeBg;
      const color = isGK ? gkText : homeText;
      const border = isGK ? gkBorder : homeJerseyBorder;
      const icons = eventIcons(p.name, homeScorerNames, homeRedNames, p.subbedOut);
      playerNodesHtml += `
        <div class="pitch-player-node home-team" style="left:${x}%;top:${y}%;" title="${p.name} — ${p.position}">
          <div class="pitch-jersey" style="background:${bg}!important;color:${color}!important;border-color:${border}!important;">
            ${p.jersey || ''}${icons}
          </div>
          <span class="pitch-player-name">${displayName}</span>
        </div>`;
    });
  });

  // Away players — GK top (8%), ATT bottom of away half (45%)
  const L_away = awayLines.length;
  awayLines.forEach((line, i) => {
    const y = 8 + (i / Math.max(L_away - 1, 1)) * 37;
    line.forEach((p, j) => {
      const x = getX(j, line.length);
      const displayName = formatPitchPlayerName(p.name);
      const isGK = isGoalkeeper(p.position);
      const bg = isGK ? gkBg : awayBg;
      const color = isGK ? gkText : awayText;
      const border = isGK ? gkBorder : awayJerseyBorder;
      const icons = eventIcons(p.name, awayScorerNames, awayRedNames, p.subbedOut);
      playerNodesHtml += `
        <div class="pitch-player-node away-team" style="left:${x}%;top:${y}%;" title="${p.name} — ${p.position}">
          <span class="pitch-player-name">${displayName}</span>
          <div class="pitch-jersey" style="background:${bg}!important;color:${color}!important;border-color:${border}!important;">
            ${p.jersey || ''}${icons}
          </div>
        </div>`;
    });
  });

  // Bench section builder
  const buildBenchCol = (benchPlayers, scorerNames, redNames, align) => {
    if (!benchPlayers || benchPlayers.length === 0) {
      return `<div style="color:var(--text-muted);font-size:0.65rem;padding:6px 0;text-align:center;">—</div>`;
    }
    return benchPlayers.map(p => {
      const goalCount = countPlayerGoals(p.name, scorerNames);
      const hasRed  = playerMatchesEvent(p.name, redNames);
      const shortName = p.name || '';
      let cleanMin = p.subbedMinute ? p.subbedMinute.replace(/[a-zA-Z\s\(\)]/g, '') : '';
      if (cleanMin && !cleanMin.endsWith("'")) {
        cleanMin += "'";
      }
      const minuteTag = cleanMin ? `<span class="bench-minute">${cleanMin}</span>` : '';
      const subIcon = p.subbedIn
        ? `<span class="bench-sub-icon sub-in" title="Masuk">↑${minuteTag}</span>`
        : '';
      const goalIcon = goalCount > 0 ? `<span style="font-size:0.55rem;">${'⚽'.repeat(goalCount)}</span>` : '';
      const redIcon  = hasRed  ? `<span class="bench-red-dot" title="Kartu Merah"></span>` : '';
      const posLabel = (p.position === 'Sub' || p.position === 'SUB' || p.position === 'Res') ? '' : (p.position || '');
      return `
        <div class="bench-player-row">
          <span class="bench-jersey">${p.jersey || '—'}</span>
          <span class="bench-name">${shortName}</span>
          <span class="bench-pos">${posLabel}</span>
          <span class="bench-events">${goalIcon}${redIcon}${subIcon}</span>
        </div>`;
    }).join('');
  };

  const homeBench = buildBenchCol(home.bench || [], homeScorerNames, homeRedNames, 'left');
  const awayBench = buildBenchCol(away.bench || [], awayScorerNames, awayRedNames, 'right');

  // Kit dot for legend
  const kitDot = (bg, border) =>
    `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${bg};border:1.5px solid ${border};vertical-align:middle;margin-right:5px;flex-shrink:0;"></span>`;

  return `
    <div class="lineup-tab-root">

      <!-- Formation Header -->
      <div class="lineup-formation-bar">
        <div class="lineup-team-badge">
          ${kitDot(homeBg, homeJerseyBorder)}
          <span class="lf-team-name">${t1}</span>
          <span class="lf-formation">${homeFormation}</span>
        </div>
        <div class="lf-vs">vs</div>
        <div class="lineup-team-badge lf-right">
          <span class="lf-formation">${awayFormation}</span>
          <span class="lf-team-name">${t2}</span>
          ${kitDot(awayBg, awayJerseyBorder)}
        </div>
      </div>

      <!-- Pitch -->
      <div class="pitch-container">
        <svg class="pitch-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.5"/>
          <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.3)" stroke-width="0.6"/>
          <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="0.5"/>
          <circle cx="50" cy="50" r="0.7" fill="rgba(255,255,255,0.5)"/>
          <!-- Bottom penalty -->
          <rect x="22" y="82" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.5"/>
          <rect x="37" y="93" width="26" height="5" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.5"/>
          <circle cx="50" cy="89" r="0.4" fill="rgba(255,255,255,0.4)"/>
          <path d="M 42 82 A 10 10 0 0 1 58 82" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.5"/>
          <!-- Top penalty -->
          <rect x="22" y="2" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.5"/>
          <rect x="37" y="2" width="26" height="5" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.5"/>
          <circle cx="50" cy="11" r="0.4" fill="rgba(255,255,255,0.4)"/>
          <path d="M 42 18 A 10 10 0 0 0 58 18" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.5"/>
        </svg>
        ${playerNodesHtml}
      </div>

      <!-- Event Legend -->
      <div class="lineup-event-legend">
        <span class="lel-item"><span style="font-size:0.7rem;">⚽</span> Gol</span>
        <span class="lel-item"><span class="lel-red-card"></span> Kartu Merah</span>
        <span class="lel-item"><span class="lel-sub-arrow sub-in">↑</span> Masuk</span>
        <span class="lel-item"><span class="lel-sub-arrow sub-out">↓</span> Keluar</span>
      </div>

      <!-- Bench Section -->
      <div class="bench-section">
        <div class="bench-section-title">Cadangan</div>
        <div class="bench-grid">
          <div class="bench-col bench-col-home">
            <div class="bench-col-header">
              ${kitDot(homeBg, homeJerseyBorder)}${t1}
            </div>
            ${homeBench}
            ${home.coach ? `
              <div class="lineup-coach-row">
                <strong>Pelatih:</strong> ${home.coach}
              </div>
            ` : ''}
          </div>
          <div class="bench-col-divider"></div>
          <div class="bench-col bench-col-away">
            <div class="bench-col-header bench-col-header-right">
              ${t2}${kitDot(awayBg, awayJerseyBorder)}
            </div>
            ${awayBench}
            ${away.coach ? `
              <div class="lineup-coach-row align-right">
                <strong>Pelatih:</strong> ${away.coach}
              </div>
            ` : ''}
          </div>
        </div>
      </div>

    </div>
  `;
}

window.switchLineupTeam = function(team, btn) {};

// ----------------------------------------------------
// INITIAL RUN
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Clean up any stale mock live state from previous sessions
  localStorage.removeItem('wc2026_mock_live');

  initCountdown();
  initNavigation();
  
  // scale compact bracket on window resize (debounced to 100ms)
  window.addEventListener('resize', debounce(() => {
    if (activeTab === 'tab-bracket') {
      scaleCompactBracket();
    }
  }, 10000 / 100)); // 100ms delay

  // Initialize pinch-to-zoom gestures
  initBracketTouchGestures();
  initBracketDragScroll();

  initSettingsAndFilters();
  
  // Render default home view parts
  renderFavorites();
  renderNearestMatches();
  renderLatestResults();
  renderFavoritesCount();
  renderLiveMatches();
  
  // Initial calculate
  recalculateKnockoutTree();

  // Start background auto-polling for scores
  if (apiKey) {
    startScorePolling();
  }

  // Auto update when day changes
  setInterval(() => {
    const currentDate = new Date().toDateString();
    if (currentDate !== lastRenderedDate) {
      lastRenderedDate = currentDate;
      // Re-render date-sensitive views
      renderNearestMatches();
      renderLatestResults();
      renderFavorites();
      renderLiveMatches();
    }
  }, 15000); // Check every 15 seconds

  // Handle tab visibility changes to pause/resume polling
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (apiKey) startScorePolling();
    } else {
      stopScorePolling();
    }
  });
});
