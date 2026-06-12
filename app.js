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
  "Germany": "Jerman",
  "Curaçao": "Curaçao",
  "Netherlands": "Belanda",
  "Japan": "Jepang",
  "Ivory Coast": "Pantai Gading",
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
  "England": "Inggris",
  "Croatia": "Kroasia",
  "Ghana": "Ghana",
  "Panama": "Panama",
  "Uzbekistan": "Uzbekistan",
  "Colombia": "Kolombia"
};

const STADIUM_MAP = {
  "1": { "name": "Estadio Azteca", "city": "Mexico City", "country": "Meksiko", "capacity": 83000 },
  "2": { "name": "Estadio Guadalajara", "city": "Zapopan", "country": "Meksiko", "capacity": 48000 },
  "3": { "name": "Estadio Monterrey", "city": "Monterrey", "country": "Meksiko", "capacity": 53500 },
  "4": { "name": "Dallas Stadium", "city": "Arlington", "country": "Amerika Serikat", "capacity": 94000 },
  "5": { "name": "Houston Stadium", "city": "Houston", "country": "Amerika Serikat", "capacity": 72000 },
  "6": { "name": "Kansas City Stadium", "city": "Kansas City", "country": "Amerika Serikat", "capacity": 73000 },
  "7": { "name": "Atlanta Stadium", "city": "Atlanta", "country": "Amerika Serikat", "capacity": 75000 },
  "8": { "name": "Miami Stadium", "city": "Miami", "country": "Amerika Serikat", "capacity": 65000 },
  "9": { "name": "Boston Stadium", "city": "Foxborough", "country": "Amerika Serikat", "capacity": 65000 },
  "10": { "name": "Philadelphia Stadium", "city": "Philadelphia", "country": "Amerika Serikat", "capacity": 69000 },
  "11": { "name": "NYNJ Stadium", "city": "East Rutherford", "country": "Amerika Serikat", "capacity": 82500 },
  "12": { "name": "Toronto Stadium", "city": "Toronto", "country": "Kanada", "capacity": 45000 },
  "13": { "name": "Vancouver Stadium", "city": "Vancouver", "country": "Kanada", "capacity": 54000 },
  "14": { "name": "Seattle Stadium", "city": "Seattle", "country": "Amerika Serikat", "capacity": 69000 },
  "15": { "name": "San Francisco Stadium", "city": "Santa Clara", "country": "Amerika Serikat", "capacity": 71000 },
  "16": { "name": "Los Angeles Stadium", "city": "Inglewood", "country": "Amerika Serikat", "capacity": 70000 }
};

function parseScorers(scorersStr) {
  if (!scorersStr || scorersStr === 'null' || scorersStr === '""' || scorersStr === '[]') return '';
  let cleaned = scorersStr
    .replace(/[{}""\[\]]/g, '')
    .replace(/[“”]/g, '')
    .trim();
  if (!cleaned) return '';
  return cleaned.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).join(', ');
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
  "Grup A": ["Estadio Azteca, Mexico City", "Estadio Guadalajara, Zapopan"],
  "Grup B": ["Toronto Stadium, Toronto", "Vancouver Stadium, Vancouver"],
  "Grup C": ["Los Angeles Stadium, Inglewood", "San Francisco Stadium, Santa Clara"],
  "Grup D": ["Seattle Stadium, Seattle", "Houston Stadium, Houston"],
  "Grup E": ["Dallas Stadium, Arlington", "Kansas City Stadium, Kansas City"],
  "Grup F": ["Atlanta Stadium, Atlanta", "Boston Stadium, Foxborough"],
  "Grup G": ["Miami Stadium, Miami", "Philadelphia Stadium, Philadelphia"],
  "Grup H": ["NYNJ Stadium, East Rutherford", "Estadio Monterrey, Monterrey"],
  "Grup I": ["Vancouver Stadium, Vancouver", "Seattle Stadium, Seattle"],
  "Grup J": ["Estadio Azteca, Mexico City", "Estadio Guadalajara, Zapopan"],
  "Grup K": ["Toronto Stadium, Toronto", "Boston Stadium, Foxborough"],
  "Grup L": ["NYNJ Stadium, East Rutherford", "Philadelphia Stadium, Philadelphia"]
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
let lastFetchTime = 0;
let scorePollInterval = null;
let realScores = {};
try {
  realScores = JSON.parse(localStorage.getItem('wc2026_real_scores')) || {};
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
let knockoutMatches = JSON.parse(JSON.stringify(WORLD_CUP_DATA.knockout_stage));

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
  // Check if there is an API score that is FINISHED, IN_PLAY, or PAUSED
  const apiScore = realScores[matchKey];
  if (apiScore && apiScore.score1 !== null && apiScore.score2 !== null && apiScore.status !== 'TIMED') {
    return apiScore;
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
  if (favorites.includes(matchKey)) {
    favorites = favorites.filter(id => id !== matchKey);
    btnElement.classList.remove('active');
  } else {
    favorites.push(matchKey);
    btnElement.classList.add('active');
  }
  localStorage.setItem('wc2026_favorites', JSON.stringify(favorites));
  renderFavorites();
  renderFavoritesCount();
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

// ----------------------------------------------------
// COUNTDOWN TIMER
// ----------------------------------------------------
function updateHeroPanel() {
  const container = document.querySelector('.countdown-container');
  const titleEl = document.querySelector('.countdown-title');
  const cdDisplay = document.getElementById('countdown-display');
  const subEl = document.getElementById('countdown-sub');
  if (!container || !titleEl || !cdDisplay || !subEl) return;

  const now = Date.now();
  const allMatches = [
    ...WORLD_CUP_DATA.group_stage.map(m => ({ ...m, isKO: false })),
    ...knockoutMatches.map(m => ({ ...m, isKO: true }))
  ];

  // 1. Check if there is a LIVE match (via API status OR time-based check)
  const liveMatches = allMatches.filter(m => {
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const scoreData = getMatchScore(matchKey);
    
    if (scoreData && (scoreData.status === 'IN_PLAY' || scoreData.status === 'PAUSED' || scoreData.status === 'EXTRA_TIME' || scoreData.status === 'PENALTY_SHOOTOUT')) {
      return true;
    }
    
    const matchTime = getMatchDate(m.date, m.time).getTime();
    const isFinished = scoreData && scoreData.status === 'FINISHED';
    return matchTime <= now && now < matchTime + (125 * 60 * 1000) && !isFinished;
  });

  if (liveMatches.length > 0) {
    // MODE 1: LIVE Matches Active (Show premium scoreboard)
    const m = liveMatches[0];
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const scoreData = getMatchScore(matchKey) || { score1: 0, score2: 0, status: 'IN_PLAY' };

    const team1Name = m.team1;
    const team2Name = m.team2;
    const team1Code = getTeamCode(m.team1);
    const team2Code = getTeamCode(m.team2);
    const flag1 = getFlagHtml(m.team1);
    const flag2 = getFlagHtml(m.team2);

    // Calculate match minute dynamically
    const matchTime = getMatchDate(m.date, m.time).getTime();
    const elapsedMins = Math.floor((now - matchTime) / (60 * 1000));
    
    let minuteLabel = "LIVE";
    if (scoreData.status === 'EXTRA_TIME') {
      minuteLabel = "ET";
    } else if (scoreData.status === 'PENALTY_SHOOTOUT') {
      minuteLabel = "PEN";
    } else if (elapsedMins >= 0 && elapsedMins < 45) {
      minuteLabel = `${elapsedMins + 1}'`;
    } else if (elapsedMins >= 45 && elapsedMins < 50) {
      minuteLabel = `45+'`;
    } else if (elapsedMins >= 50 && elapsedMins < 65) {
      minuteLabel = `HT`;
    } else if (elapsedMins >= 65 && elapsedMins < 110) {
      minuteLabel = `${elapsedMins - 19}'`;
    } else if (elapsedMins >= 110 && elapsedMins < 115) {
      minuteLabel = `90+'`;
    } else {
      minuteLabel = `FT`;
    }

    const cleanScorers1 = parseScorers(scoreData.home_scorers);
    const cleanScorers2 = parseScorers(scoreData.away_scorers);

    titleEl.innerHTML = `<span class="live-pulse-dot"></span>Pertandingan Berlangsung`;
    
    cdDisplay.innerHTML = `
      <div class="live-scoreboard" style="display: flex; flex-direction: column; width: 100%;">
        <div style="display: flex; width: 100%; align-items: center; justify-content: space-between;">
          <div class="live-team left-team">
            ${flag1}
            <div class="live-team-info">
              <span class="live-team-name">${team1Name}</span>
              <span class="live-team-code">${team1Code}</span>
            </div>
            <span class="live-score">${scoreData.score1 !== null && scoreData.score1 !== undefined ? scoreData.score1 : 0}</span>
          </div>
          
          <div class="live-time-col">
            <span class="live-minute-badge">${minuteLabel}</span>
            <span class="live-vs">VS</span>
          </div>
          
          <div class="live-team right-team">
            <span class="live-score">${scoreData.score2 !== null && scoreData.score2 !== undefined ? scoreData.score2 : 0}</span>
            <div class="live-team-info">
              <span class="live-team-name">${team2Name}</span>
              <span class="live-team-code">${team2Code}</span>
            </div>
            ${flag2}
          </div>
        </div>
        ${(cleanScorers1 || cleanScorers2) ? `
          <div class="live-scorers-box" style="display: flex; justify-content: space-between; font-size: 0.65rem; color: rgba(255,255,255,0.7); padding: 8px 12px 0; border-top: 1px dashed rgba(255,255,255,0.12); margin-top: 8px; width: 100%;">
            <div class="live-home-scorers" style="text-align: left; max-width: 45%; word-break: break-word;" title="${cleanScorers1}">${cleanScorers1 ? '⚽ ' + cleanScorers1 : ''}</div>
            <div class="live-away-scorers" style="text-align: right; max-width: 45%; word-break: break-word;" title="${cleanScorers2}">${cleanScorers2 ? '⚽ ' + cleanScorers2 : ''}</div>
          </div>
        ` : ''}
      </div>
    `;
    
    const venue = getMatchVenue(m);
    const stageName = m.isKO ? m.group : `Grup ${m.group.replace('Grup ', '')}`;
    subEl.innerHTML = `<span class="live-venue-label">${stageName} · ${venue}</span>`;
    
    subEl.style.display = 'block';
    cdDisplay.style.display = 'block';
    container.classList.add('live-active');
    // Remove the team-preview row used in countdown mode
    const existingCdRow = document.getElementById('cd-teams-row');
    if (existingCdRow) existingCdRow.remove();
    return;
  }

  // MODE 2: Countdown Active (No live matches)
  container.classList.remove('live-active');
  const hasLiveStructure = cdDisplay.querySelector('.live-scoreboard') || cdDisplay.innerHTML.includes('live-scoreboard');
  if (hasLiveStructure || cdDisplay.innerHTML.trim() === "" || !document.getElementById('cd-days')) {
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
  }
  
  subEl.style.display = 'block';

  const targetMatch = getNextMatch();
  if (!targetMatch) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  const targetTime = getMatchDate(targetMatch.date, targetMatch.time).getTime();
  const diff = targetTime - now;

  if (diff <= 0) {
    return;
  }

  const isOpening = targetMatch.date === "12/6" && targetMatch.time === "02:00" && targetMatch.team1 === "Meksiko";
  titleEl.innerText = isOpening ? `Kick-Off Match Pertama` : `Kick-Off Match Berikutnya`;

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
    // Insert after countdown-display, before subEl
    cdDisplay.parentNode.insertBefore(cdTeamRow, subEl);
  }
  cdTeamRow.innerHTML = `
    <div class="cd-team cd-team-left">
      <span class="cd-team-name">${targetMatch.team1}</span>
      ${flag1Cd}
    </div>
    <span class="cd-vs">VS</span>
    <div class="cd-team cd-team-right">
      ${flag2Cd}
      <span class="cd-team-name">${targetMatch.team2}</span>
    </div>
  `;

  const venueIconSvgCd = `<svg class="venue-icon" viewBox="0 0 24 24"><path d="M2 10c0-3.9 4.5-7 10-7s10 3.1 10 7-4.5 7-10 7S2 13.9 2 10z"></path><path d="M4 11v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path><path d="M7 10c0-1.7 2.2-3 5-3s5 1.3 5 3-2.2 3-5 3-5-1.3-5-3z"></path></svg>`;
  subEl.innerHTML = `${venueIconSvgCd}<span>${venue}</span>`;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');

  if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
  if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
  if (cdMins) cdMins.textContent = String(mins).padStart(2, '0');
  if (cdSecs) cdSecs.textContent = String(secs).padStart(2, '0');
}

function initCountdown() {
  updateHeroPanel();
  setInterval(updateHeroPanel, 1000);
}

// ----------------------------------------------------
// UI RENDERING ENGINES
// ----------------------------------------------------

// Render Match Card
function createMatchCardHtml(match, index, isKnockout = false) {
  const matchKey = isKnockout ? `ko_${match.match_id}` : `gs_${match.date}_${match.team1}_${match.team2}`;
  const timeInfo = getFormattedTime(match.date, match.time);
  const starredClass = isStarred(matchKey) ? 'active' : '';
  
  const scoreData = getMatchScore(matchKey);
  const rawScore = realScores[matchKey];
  const matchday = (rawScore && rawScore.matchday) ? rawScore.matchday : null;
  const labelVenue = getMatchVenue(match);

  const venueIconSvg = `<svg class="venue-icon" viewBox="0 0 24 24"><path d="M2 10c0-3.9 4.5-7 10-7s10 3.1 10 7-4.5 7-10 7S2 13.9 2 10z"></path><path d="M4 11v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path><path d="M7 10c0-1.7 2.2-3 5-3s5 1.3 5 3-2.2 3-5 3-5-1.3-5-3z"></path></svg>`;

  const stageHeaderHtml = `
    <div class="match-stage-container">
      <span class="match-stage">${match.group}</span>
    </div>
  `;

  const starBtnHtml = `<button class="star-btn star-btn-inline ${starredClass}" onclick="toggleMatchStar('${matchKey}', this)" aria-label="Simpan Pertandingan"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></button>`;


  if (scoreData) {
    const isLive = scoreData.status === 'IN_PLAY' || scoreData.status === 'PAUSED' || scoreData.status === 'EXTRA_TIME' || scoreData.status === 'PENALTY_SHOOTOUT';
    let statusText = 'FT';
    if (scoreData.status === 'IN_PLAY' || scoreData.status === 'PAUSED') statusText = 'LIVE';
    else if (scoreData.status === 'EXTRA_TIME') statusText = 'ET';
    else if (scoreData.status === 'PENALTY_SHOOTOUT') statusText = 'PEN';

    const cleanScorers1 = parseScorers(scoreData.home_scorers);
    const cleanScorers2 = parseScorers(scoreData.away_scorers);

    return `
      <div class="match-card" data-key="${matchKey}" title="${labelVenue}">
        <div class="match-header">
          ${stageHeaderHtml}
          <span class="match-date-label">${timeInfo.date}</span>
        </div>
        <div class="match-body">
          <div class="team-display left">
            <span class="team-name">${match.team1}</span>
            ${getFlagHtml(match.team1)}
          </div>
          <div class="match-time-box">
            <div class="score-display">${scoreData.score1} - ${scoreData.score2}</div>
            <div class="score-status ${isLive ? 'status-live' : 'status-ft'}">${statusText}</div>
          </div>
          <div class="team-display right">
            ${getFlagHtml(match.team2)}
            <span class="team-name">${match.team2}</span>
          </div>
          <div class="match-venue-subtle">${venueIconSvg}${labelVenue}</div>
        </div>
        ${(cleanScorers1 || cleanScorers2) ? `
          <div class="match-scorers-row" style="display: grid; grid-template-columns: minmax(0, 1fr) 50px minmax(0, 1fr); gap: 16px; margin: 4px 0 10px; padding: 6px 12px 0; border-top: 1px dashed rgba(128, 128, 128, 0.15); font-size: 0.65rem; color: var(--text-secondary); opacity: 0.8;">
            <div class="scorers-left" style="text-align: right; word-break: break-word; line-height: 1.3;">
              ${cleanScorers1 ? '⚽ ' + cleanScorers1 : ''}
            </div>
            <div></div> <!-- Middle spacer aligning with the time box -->
            <div class="scorers-right" style="text-align: left; word-break: break-word; line-height: 1.3;">
              ${cleanScorers2 ? '⚽ ' + cleanScorers2 : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  } else {
    return `
      <div class="match-card" data-key="${matchKey}" title="${labelVenue}">
        <div class="match-header">
          ${stageHeaderHtml}
          <span class="match-date-label">${timeInfo.date}</span>
        </div>
        <div class="match-body">
          <div class="team-display left">
            <span class="team-name">${match.team1}</span>
            ${getFlagHtml(match.team1)}
          </div>
          <div class="match-time-box">
            <div>${timeInfo.time}</div>
            <div class="time-tz-label">${timeInfo.tzLabel}</div>
          </div>
          <div class="team-display right">
            ${getFlagHtml(match.team2)}
            <span class="team-name">${match.team2}</span>
          </div>
          <div class="match-venue-subtle match-venue-with-star">${venueIconSvg}<span class="venue-name-text">${labelVenue}</span>${starBtnHtml}</div>
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
  let filteredKnockout = knockoutMatches;

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
    const hasScore = score && (score.status === 'FINISHED' || score.status === 'IN_PLAY');
    return scheduleSubTab === 'results' ? hasScore : !hasScore;
  });

  // Since date is formatted as e.g. "12/6", "13/6", let's map dates to simple values for sorting
  function dateToVal(dStr) {
    const [d, m] = dStr.split('/').map(Number);
    return m * 100 + d;
  }

  // Sort based on active sub-tab: upcoming is ascending, results is descending
  allFiltered.sort((a, b) => {
    const dateDiff = dateToVal(a.date) - dateToVal(b.date);
    if (dateDiff !== 0) {
      return scheduleSubTab === 'results' ? -dateDiff : dateDiff;
    }
    const timeDiff = a.time.localeCompare(b.time);
    return scheduleSubTab === 'results' ? -timeDiff : timeDiff;
  });

  if (allFiltered.length === 0) {
    const emptyMsg = scheduleSubTab === 'results'
      ? 'Belum ada hasil pertandingan yang tersedia untuk kriteria pencarian/filter ini.'
      : 'Tidak ada jadwal pertandingan mendatang yang tersedia untuk kriteria pencarian/filter ini.';
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
        listHtml += createMatchCardHtml(match, match.match_id, true);
      }
    }
  });

  container.innerHTML = listHtml;
}

// Render Latest Match Results (Hasil Pertandingan Terbaru)
function renderLatestResults() {
  recalculateKnockoutTree();
  const container = document.getElementById('latest-results-list');
  if (!container) return;

  // Combine all matches
  const allMatches = [
    ...WORLD_CUP_DATA.group_stage.map(m => ({ ...m, isKO: false })),
    ...knockoutMatches.map(m => ({ ...m, isKO: true }))
  ];

  // Filter matches that have scores recorded (finished or live)
  const matchesWithScores = allMatches.filter(m => {
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const score = getMatchScore(matchKey);
    return score && (score.status === 'FINISHED' || score.status === 'IN_PLAY');
  });

  if (matchesWithScores.length === 0) {
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
    return;
  }

  // Sort by match date/time descending (most recent matches first)
  matchesWithScores.sort((a, b) => getMatchDate(b.date, b.time) - getMatchDate(a.date, a.time));

  // Take top 3 latest matches
  const latestMatches = matchesWithScores.slice(0, 3);

  let listHtml = '';
  latestMatches.forEach(match => {
    listHtml += createMatchCardHtml(match, match.match_id || 0, match.isKO);
  });

  container.innerHTML = listHtml;
}

// Render Dashboard/Home tab nearest matches (2 Days from the first upcoming match day)
function renderNearestMatches() {
  recalculateKnockoutTree();
  const container = document.getElementById('nearest-matches-list');
  if (!container) return;

  const now = new Date();
  
  // Combine all matches
  const allMatches = [
    ...WORLD_CUP_DATA.group_stage.map(m => ({ ...m, isKO: false })),
    ...knockoutMatches.map(m => ({ ...m, isKO: true }))
  ];

  // Filter for upcoming/live matches (not finished yet, start time >= now, or currently live)
  const upcomingMatches = allMatches.filter(m => {
    if (m.isKO) {
      const isPlaceholder1 = m.team1.startsWith('Winner Match') || m.team1.startsWith('Loser Match') || m.team1.startsWith('3rd Group') || m.team1.startsWith('Runner-up Group') || m.team1.startsWith('Winner Group');
      const isPlaceholder2 = m.team2.startsWith('Winner Match') || m.team2.startsWith('Loser Match') || m.team2.startsWith('3rd Group') || m.team2.startsWith('Runner-up Group') || m.team2.startsWith('Winner Group');
      if (isPlaceholder1 || isPlaceholder2) return false;
    }
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const score = getMatchScore(matchKey);
    if (score && score.status === 'FINISHED') return false;
    const isLive = score && (score.status === 'IN_PLAY' || score.status === 'PAUSED');
    return isLive || getMatchDate(m.date, m.time) >= now;
  });

  let upcoming = [];

  if (upcomingMatches.length > 0) {
    // Sort upcoming matches chronologically
    upcomingMatches.sort((a, b) => getMatchDate(a.date, a.time) - getMatchDate(b.date, b.time));

    // Get the date of the first upcoming match
    const earliestMatch = upcomingMatches[0];
    const day1Date = getMatchDate(earliestMatch.date, earliestMatch.time);
    const day2Date = new Date(day1Date);
    day2Date.setDate(day2Date.getDate() + 1);

    const day1Str = useLocalTimezone ? getLocalDateString(day1Date) : getWibDateString(day1Date);
    const day2Str = useLocalTimezone ? getLocalDateString(day2Date) : getWibDateString(day2Date);

    // Get all matches on these two days that are NOT finished
    upcoming = allMatches.filter(m => {
      if (m.isKO) {
        const isPlaceholder1 = m.team1.startsWith('Winner Match') || m.team1.startsWith('Loser Match') || m.team1.startsWith('3rd Group') || m.team1.startsWith('Runner-up Group') || m.team1.startsWith('Winner Group');
        const isPlaceholder2 = m.team2.startsWith('Winner Match') || m.team2.startsWith('Loser Match') || m.team2.startsWith('3rd Group') || m.team2.startsWith('Runner-up Group') || m.team2.startsWith('Winner Group');
        if (isPlaceholder1 || isPlaceholder2) return false;
      }
      
      const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
      const score = getMatchScore(matchKey);
      if (score && score.status === 'FINISHED') return false;

      const matchDateStr = getMatchDateString(m);
      return matchDateStr === day1Str || matchDateStr === day2Str;
    });

    // Sort chronologically
    upcoming.sort((a, b) => getMatchDate(a.date, a.time) - getMatchDate(b.date, b.time));
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
        <p>Tidak ada pertandingan yang dijadwalkan.</p>
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

function getNextMatch() {
  const now = Date.now();
  const allMatches = [
    ...WORLD_CUP_DATA.group_stage.map(m => ({ ...m, isKO: false })),
    ...knockoutMatches.map(m => ({ ...m, isKO: true }))
  ];

  const upcoming = allMatches.filter(m => {
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const scoreData = getMatchScore(matchKey);
    if (scoreData && scoreData.status === 'FINISHED') return false;
    const matchTime = getMatchDate(m.date, m.time).getTime();
    return matchTime > now;
  });

  if (upcoming.length === 0) return null;

  upcoming.sort((a, b) => {
    const timeA = getMatchDate(a.date, a.time).getTime();
    const timeB = getMatchDate(b.date, b.time).getTime();
    return timeA - timeB;
  });

  return upcoming[0];
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

    // Check if any match has been played in this group
    let groupMatchesPlayed = 0;
    rankedTeams.forEach(team => {
      if (teamStats[team]) {
        groupMatchesPlayed += teamStats[team].played;
      }
    });

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

    gridHtml += `
      <div class="group-card" onclick="window.showGroupMatches('Grup ${groupLetter}')">
        <div class="group-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>Grup ${groupLetter}</span>
          ${groupMatchesPlayed > 0 ? '<span style="font-size: 0.55rem; color: var(--accent-emerald); border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 6px; border-radius: 4px; font-weight: bold; letter-spacing: 0.5px; animation: pulse-blink 2s infinite;">LIVE</span>' : ''}
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
  
  function dfs(matchIdx) {
    if (matchIdx === matchesNeed3rd.length) {
      return true;
    }
    const m = matchesNeed3rd[matchIdx];
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
  const fallbackAssignment = {};
  const fallbackUsed = new Set();
  matchesNeed3rd.forEach(m => {
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

// Function to dynamically calculate group standings from realScores
function calculateGroupStandings() {
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
    if (score && (score.status === 'FINISHED' || score.status === 'IN_PLAY')) {
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

  // Calculate Goal Difference and sort groupRankings
  for (const [groupName, teamList] of Object.entries(groups)) {
    let groupMatchesPlayed = 0;
    teamList.forEach(team => {
      teamStats[team].gd = teamStats[team].gf - teamStats[team].ga;
      groupMatchesPlayed += teamStats[team].played;
    });

    if (groupMatchesPlayed > 0) {
      // Sort automatically based on stats (FIFA World Cup Rules: Points -> GD -> GF -> Fallback to alphabetical)
      const sorted = [...teamList].sort((a, b) => {
        const statsA = teamStats[a];
        const statsB = teamStats[b];
        
        if (statsB.pts !== statsA.pts) return statsB.pts - statsA.pts;
        if (statsB.gd !== statsA.gd) return statsB.gd - statsA.gd;
        if (statsB.gf !== statsA.gf) return statsB.gf - statsA.gf;
        
        // Secondary fallback: alphabetical
        return a.localeCompare(b);
      });
      groupRankings[groupName] = sorted;
    } else {
      // If no matches have been played yet in this group, sort alphabetically by team name
      groupRankings[groupName] = [...teamList].sort((a, b) => a.localeCompare(b));
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
          <th style="width: 12%; text-align: center;">Grup</th>
          <th style="text-align: left; width: 38%;">Tim</th>
          <th style="width: 10%; text-align: center;">M</th>
          <th style="width: 10%; text-align: center;">SG</th>
          <th style="width: 12%; text-align: center;">P</th>
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
  // Calculate standings from scores first
  calculateGroupStandings();

  // Clear working copy matches
  knockoutMatches = JSON.parse(JSON.stringify(WORLD_CUP_DATA.knockout_stage));

  const groupStageFinished = isGroupStageComplete();

  if (!groupStageFinished) {
    // Reset all simulated winners if group stage is not finished
    simulatedWinners = {};
  } else {
    // STEP 1: Evaluate Round of 32 starting participants based on group rankings and 3rd place selections
    knockoutMatches.forEach(m => {
      if (m.group !== "Round of 32") return;

      // Check seed 1 (Home/team1)
      if (m.team1_seed && (
          m.team1_seed.endsWith('A') || m.team1_seed.endsWith('B') || m.team1_seed.endsWith('C') || m.team1_seed.endsWith('D') || 
          m.team1_seed.endsWith('E') || m.team1_seed.endsWith('F') || m.team1_seed.endsWith('G') || m.team1_seed.endsWith('H') || 
          m.team1_seed.endsWith('I') || m.team1_seed.endsWith('J') || m.team1_seed.endsWith('K') || m.team1_seed.endsWith('L')
      )) {
        const rank = m.team1_seed.charAt(0); // '1' or '2'
        const groupLetter = m.team1_seed.charAt(1); // 'A' to 'L'
        const groupName = `Grup ${groupLetter}`;
        const idx = rank === '1' ? 0 : 1;
        
        if (groupRankings[groupName] && groupRankings[groupName][idx]) {
          m.team1 = groupRankings[groupName][idx];
        } else {
          m.team1 = `${rank === '1' ? 'Juara' : 'Runner-up'} ${groupName}`;
        }
      } else if (m.team1_seed === '3rd') {
        // 3rd placed team choice
        const selectedGroup = selected3rdPlaces[m.match_id];
        if (selectedGroup && groupRankings[selectedGroup] && groupRankings[selectedGroup][2]) {
          m.team1 = groupRankings[selectedGroup][2]; // 3rd placed team is at index 2
        } else {
          m.team1 = `3rd Grup ${m.team1 ? m.team1.replace("3rd Grup ", "") : ""}`;
        }
      }

      // Check seed 2 (Away/team2)
      if (m.team2_seed && (
          m.team2_seed.endsWith('A') || m.team2_seed.endsWith('B') || m.team2_seed.endsWith('C') || m.team2_seed.endsWith('D') || 
          m.team2_seed.endsWith('E') || m.team2_seed.endsWith('F') || m.team2_seed.endsWith('G') || m.team2_seed.endsWith('H') || 
          m.team2_seed.endsWith('I') || m.team2_seed.endsWith('J') || m.team2_seed.endsWith('K') || m.team2_seed.endsWith('L')
      )) {
        const rank = m.team2_seed.charAt(0); // '1' or '2'
        const groupLetter = m.team2_seed.charAt(1); // 'A' to 'L'
        const groupName = `Grup ${groupLetter}`;
        const idx = rank === '1' ? 0 : 1;
        
        if (groupRankings[groupName] && groupRankings[groupName][idx]) {
          m.team2 = groupRankings[groupName][idx];
        } else {
          m.team2 = `${rank === '1' ? 'Juara' : 'Runner-up'} ${groupName}`;
        }
      } else if (m.team2_seed === '3rd') {
        // 3rd placed team choice
        const selectedGroup = selected3rdPlaces[m.match_id];
        if (selectedGroup && groupRankings[selectedGroup] && groupRankings[selectedGroup][2]) {
          m.team2 = groupRankings[selectedGroup][2]; // 3rd placed team
        } else {
          m.team2 = `3rd Grup ${m.team2 ? m.team2.replace("3rd Grup ", "") : ""}`;
        }
      }
    });
  }

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
      if (winner && m.team1 && m.team2 &&
          !m.team1.startsWith('Winner Match') && !m.team2.startsWith('Winner Match') && 
          !m.team1.startsWith('3rd Grup') && !m.team2.startsWith('3rd Grup')) {
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
      if (winner && loser && m.team1 && m.team2 &&
          !m.team1.startsWith('Winner Match') && !m.team2.startsWith('Winner Match')) {
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

  if (clean.startsWith("Juara Grup ")) {
    return "1" + clean.replace("Juara Grup ", "");
  }
  if (clean.startsWith("Runner-up Grup ")) {
    return "2" + clean.replace("Runner-up Grup ", "");
  }
  if (clean.startsWith("3rd Grup ")) {
    return "3RD";
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

const COMPACT_COORDINATES = {
  // Left Wing (Outer Left R32, Column 2 Upper R16, Stack Top R16 & QF)
  73: { x: 30, y: 230 },  // Column 1 upper top
  75: { x: 30, y: 330 },  // Column 1 upper bottom
  83: { x: 30, y: 390 },  // Column 1 lower top
  84: { x: 30, y: 490 },  // Column 1 lower bottom
  
  89: { x: 290, y: 200 }, // Stack Top R16
  90: { x: 150, y: 280 }, // Column 2 Upper R16
  97: { x: 290, y: 280 }, // Stack QF Upper

  // Top Wing (Top and Bottom Horizontal R32 Matches, and Stack Bottom R16 & QF)
  74: { x: 200, y: 80 },  // Top horizontal left (GER)
  77: { x: 380, y: 80 },  // Top horizontal right (FRA)
  81: { x: 200, y: 640 }, // Bottom horizontal left (USA)
  82: { x: 380, y: 640 }, // Bottom horizontal right (BEL)
  
  93: { x: 150, y: 440 }, // Column 2 Lower R16
  94: { x: 290, y: 520 }, // Stack Bottom R16
  98: { x: 290, y: 440 }, // Stack QF Lower

  // Right Wing (Outer Right R32, Column 6 Upper R16, Stack Top Right R16 & QF)
  76: { x: 496, y: 80 },  // Top-right horizontal left (BRA)
  78: { x: 676, y: 80 },  // Top-right horizontal right (ECU)
  79: { x: 846, y: 230 }, // Column 7 upper top
  80: { x: 846, y: 330 }, // Column 7 upper bottom
  
  91: { x: 586, y: 200 }, // Stack Top Right R16
  92: { x: 726, y: 280 }, // Column 6 Upper R16
  99: { x: 586, y: 280 }, // Stack QF Upper Right

  // Bottom Wing (Column 7 lower R32, Bottom-right horizontal R32)
  85: { x: 846, y: 390 }, // Column 7 lower top
  86: { x: 846, y: 490 }, // Column 7 lower bottom
  87: { x: 496, y: 640 }, // Bottom-right horizontal left (TUR)
  88: { x: 676, y: 640 }, // Bottom-right horizontal right (ARG)
  
  95: { x: 726, y: 440 }, // Column 6 Lower R16
  96: { x: 586, y: 520 }, // Stack Bottom R16 Right
  100: { x: 586, y: 440 }, // Stack QF Lower Right

  // Center (Semifinals, Final, Juara 3)
  101: { x: 290, y: 360 }, // Semifinal 1 (Left)
  102: { x: 586, y: 360 }, // Semifinal 2 (Right)
  104: { x: 438, y: 360 }, // Final (Center)
  103: { x: 438, y: 520 }  // Juara 3 (Bottom Center)
};

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

function renderBracket() {
  recalculateKnockoutTree();
  const container = document.getElementById('bracket-cards-root');
  if (!container) return;

  let cardsHtml = '';

  knockoutMatches.forEach(m => {
    const coords = COMPACT_COORDINATES[m.match_id];
    if (!coords) return;

    const winner = simulatedWinners[m.match_id];
    const isPlaceholder1 = m.team1 && typeof m.team1 === 'string' && (
      m.team1.startsWith('Winner Match') || 
      m.team1.startsWith('Loser Match') || 
      m.team1.startsWith('3rd Grup') || 
      m.team1.startsWith('3rd Group') ||
      m.team1.startsWith('Juara Grup') ||
      m.team1.startsWith('Runner-up Grup') ||
      m.team1.startsWith('Juara Group') ||
      m.team1.startsWith('Runner-up Group')
    );
    const isPlaceholder2 = m.team2 && typeof m.team2 === 'string' && (
      m.team2.startsWith('Winner Match') || 
      m.team2.startsWith('Loser Match') || 
      m.team2.startsWith('3rd Grup') || 
      m.team2.startsWith('3rd Group') ||
      m.team2.startsWith('Juara Grup') ||
      m.team2.startsWith('Runner-up Grup') ||
      m.team2.startsWith('Juara Group') ||
      m.team2.startsWith('Runner-up Group')
    );

    const team1Code = getTeamCode(m.team1 || '');
    const team2Code = getTeamCode(m.team2 || '');

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

    const formattedFlag1 = flag1 ? flag1.replace('class="flag-crest"', 'class="flag-crest-compact"') : '';
    const formattedFlag2 = flag2 ? flag2.replace('class="flag-crest"', 'class="flag-crest-compact"') : '';

    const dateVenueText = `M${m.match_id}`;

    cardsHtml += `
      <div class="compact-match-card ${cardStateClass} ${roundClass}" 
           style="left: ${coords.x}px; top: ${coords.y}px;"
           title="Laga ${m.match_id} - ${getMatchVenue(m)}">
        <span class="compact-match-date">${dateVenueText}</span>
        <!-- Team 1 -->
        <div class="compact-team-row ${isPlaceholder1 ? 'placeholder' : ''} ${team1WinnerClass}"
             ${!isPlaceholder1 ? `data-team="${m.team1}"` : ''}
             onclick="window.handleBracketTap(${m.match_id}, '${m.team1 ? m.team1.replace(/'/g, "\\'") : ''}', ${!isPlaceholder1 && !isPlaceholder2})">
          ${formattedFlag1}
          <span class="compact-team-code ${isPlaceholder1 ? 'placeholder-text' : ''}">${team1Code || '???'}</span>
        </div>
        <!-- Team 2 -->
        <div class="compact-team-row ${isPlaceholder2 ? 'placeholder' : ''} ${team2WinnerClass}"
             ${!isPlaceholder2 ? `data-team="${m.team2}"` : ''}
             onclick="window.handleBracketTap(${m.match_id}, '${m.team2 ? m.team2.replace(/'/g, "\\'") : ''}', ${!isPlaceholder1 && !isPlaceholder2})">
          ${formattedFlag2}
          <span class="compact-team-code ${isPlaceholder2 ? 'placeholder-text' : ''}">${team2Code || '???'}</span>
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

  const cardWidth = 84;
  const cardHeight = 36;
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
    { from: 85, to: 95, type: 'horizontal-left' },
    { from: 86, to: 95, type: 'horizontal-left' },
    { from: 92, to: 99, type: 'horizontal-straight' },
    { from: 95, to: 100, type: 'horizontal-straight' },

    // Bottom Wing
    { from: 76, to: 91, type: 'vertical-down' },
    { from: 78, to: 91, type: 'vertical-down' },
    { from: 87, to: 96, type: 'vertical-up' },
    { from: 88, to: 96, type: 'vertical-up' },

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

  connections.forEach(conn => {
    const fromCoords = COMPACT_COORDINATES[conn.from];
    const toCoords = COMPACT_COORDINATES[conn.to];
    if (!fromCoords || !toCoords) return;

    let x_start, y_start, x_end, y_end;
    let d = '';

    if (conn.type === 'vertical-down') {
      x_start = fromCoords.x + cardWidth / 2;
      y_start = fromCoords.y + cardHeight;
      x_end = toCoords.x + cardWidth / 2;
      y_end = toCoords.y;
      const ym = (y_start + y_end) / 2;
      d = `M ${x_start} ${y_start} V ${ym} H ${x_end} V ${y_end}`;
    } else if (conn.type === 'vertical-up') {
      x_start = fromCoords.x + cardWidth / 2;
      y_start = fromCoords.y;
      x_end = toCoords.x + cardWidth / 2;
      y_end = toCoords.y + cardHeight;
      const ym = (y_start + y_end) / 2;
      d = `M ${x_start} ${y_start} V ${ym} H ${x_end} V ${y_end}`;
    } else if (conn.type === 'horizontal-right') {
      x_start = fromCoords.x + cardWidth;
      y_start = fromCoords.y + 18;
      x_end = toCoords.x;
      y_end = toCoords.y + 18;
      const xm = (x_start + x_end) / 2;
      d = `M ${x_start} ${y_start} H ${xm} V ${y_end} H ${x_end}`;
    } else if (conn.type === 'horizontal-left') {
      x_start = fromCoords.x;
      y_start = fromCoords.y + 18;
      x_end = toCoords.x + cardWidth;
      y_end = toCoords.y + 18;
      const xm = (x_start + x_end) / 2;
      d = `M ${x_start} ${y_start} H ${xm} V ${y_end} H ${x_end}`;
    } else if (conn.type === 'horizontal-straight') {
      if (fromCoords.x < toCoords.x) {
        x_start = fromCoords.x + cardWidth;
        y_start = fromCoords.y + 18;
        x_end = toCoords.x;
      } else {
        x_start = fromCoords.x;
        y_start = fromCoords.y + 18;
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
        y_start = fromCoords.y + 18;
        x_end = toCoords.x;
      } else {
        x_start = fromCoords.x;
        y_start = fromCoords.y + 18;
        x_end = toCoords.x + cardWidth;
      }
      d = `M ${x_start} ${y_start} H ${x_end}`;
    } else if (conn.type === 'center-third') {
      if (fromCoords.x < toCoords.x) {
        x_start = fromCoords.x + cardWidth + 7.5;
        y_start = fromCoords.y + 18;
        x_end = toCoords.x;
        y_end = toCoords.y + 18;
        d = `M ${x_start} ${y_start} V ${y_end} H ${x_end}`;
      } else {
        x_start = fromCoords.x - 7.5;
        y_start = fromCoords.y + 18;
        x_end = toCoords.x + cardWidth;
        y_end = toCoords.y + 18;
        d = `M ${x_start} ${y_start} V ${y_end} H ${x_end}`;
      }
    }

    const isActive = !!simulatedWinners[conn.from];
    let lineClass = 'bracket-line-inactive';
    if (isActive) {
      if (conn.from >= 73 && conn.from <= 88) {
        lineClass = 'line-active-32';
      } else if (conn.from >= 89 && conn.from <= 96) {
        lineClass = 'line-active-16';
      } else if (conn.from >= 97 && conn.from <= 100) {
        lineClass = 'line-active-qf';
      } else if (conn.from === 101 || conn.from === 102) {
        if (conn.to === 104) {
          lineClass = 'line-active-final';
        } else {
          lineClass = 'line-active-sf';
        }
      }
    }

    pathsHtml += `<path d="${d}" class="${lineClass}"></path>`;
  });

  svg.innerHTML = pathsHtml;
}

let currentGroupPage = 0; // 0 for A-F, 1 for G-L

function renderStandingsSummary() {
  const container = document.getElementById('bracket-standings-summary');
  if (!container) return;

  // Ensure standings are calculated
  // Calculate best thirds
  const thirdsList = [];
  for (const [groupName, teamList] of Object.entries(groupRankings)) {
    if (teamList && teamList[2]) {
      const team = teamList[2];
      const stats = teamStats[team] || { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      thirdsList.push({
        group: groupName,
        team: team,
        pts: stats.pts,
        gd: stats.gd,
        gf: stats.gf,
        won: stats.won
      });
    }
  }

  // Sort thirds list (Points -> GD -> GF -> Won -> Alphabetical Group)
  thirdsList.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    if (b.won !== a.won) return b.won - a.won;
    return a.group.localeCompare(b.group);
  });

  const qualifyingThirdTeams = thirdsList.slice(0, 8).map(t => t.team);

  // Group letters mapping
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  
  // Helper to render a group column
  function renderGroupColumn(letter) {
    const groupName = `Grup ${letter}`;
    const teams = groupRankings[groupName] || [];
    if (teams.length === 0) return '';

    let rowsHtml = '';
    teams.forEach((team, idx) => {
      const isFirstOrSecond = idx < 2;
      const isThird = idx === 2;
      const isQualifiedThird = isThird && qualifyingThirdTeams.includes(team);
      const isQualified = isFirstOrSecond || isQualifiedThird;

      const flag = getFlagHtml(team);
      const code = getTeamCode(team);
      
      // Determine state class for card styling
      const stateClass = isQualified ? 'qualified' : 'eliminated';

      rowsHtml += `
        <div class="summary-team-row ${stateClass}">
          <span class="summary-rank">${idx + 1}</span>
          ${flag}
          <span class="summary-code">${code}</span>
        </div>
      `;
    });

    return `
      <div class="summary-group-col">
        <div class="summary-group-header">Grup ${letter}</div>
        <div class="summary-group-body">
          ${rowsHtml}
        </div>
      </div>
    `;
  }

  // Build Pages
  // Page 1: A to F
  let page1Html = '<div class="summary-page" id="summary-page-1" style="display: ' + (currentGroupPage === 0 ? 'grid' : 'none') + ';">';
  groupLetters.slice(0, 6).forEach(letter => {
    page1Html += renderGroupColumn(letter);
  });
  page1Html += '</div>';

  // Page 2: G to L
  let page2Html = '<div class="summary-page" id="summary-page-2" style="display: ' + (currentGroupPage === 1 ? 'grid' : 'none') + ';">';
  groupLetters.slice(6, 12).forEach(letter => {
    page2Html += renderGroupColumn(letter);
  });
  page2Html += '</div>';

  // Pager buttons & dots
  const pagerHtml = `
    <div class="summary-pager">
      <button class="pager-arrow" onclick="window.setGroupPage(0)" aria-label="Halaman Sebelumnya" ${currentGroupPage === 0 ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div class="pager-dots">
        <span class="pager-dot ${currentGroupPage === 0 ? 'active' : ''}" onclick="window.setGroupPage(0)"></span>
        <span class="pager-dot ${currentGroupPage === 1 ? 'active' : ''}" onclick="window.setGroupPage(1)"></span>
      </div>
      <button class="pager-arrow" onclick="window.setGroupPage(1)" aria-label="Halaman Berikutnya" ${currentGroupPage === 1 ? 'disabled' : ''}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  `;

  // Build Third-place teams capsules
  let thirdsCapsulesHtml = '';
  thirdsList.forEach((t) => {
    const isQual = qualifyingThirdTeams.includes(t.team);
    const code = getTeamCode(t.team);
    const flag = getFlagHtml(t.team);
    const groupLetter = t.group.replace('Grup ', '');
    const stateClass = isQual ? 'qualified' : 'eliminated';
    const statusIcon = isQual ? '●' : '○';

    thirdsCapsulesHtml += `
      <div class="thirds-summary-card ${stateClass}">
        <span class="status-indicator">${statusIcon}</span>
        ${flag}
        <span class="thirds-code">${code}</span>
        <span class="thirds-group-label">(${groupLetter})</span>
      </div>
    `;
  });

  const thirdsHtml = `
    <div class="thirds-summary-section">
      <div class="thirds-summary-header">
        <div class="thirds-header-title">
          Peringkat 3 Terbaik
          <span>8 Tim Terbaik Lolos ke Babak 32 Besar</span>
        </div>
        <div class="thirds-counter-badge">8/12 Lolos</div>
      </div>
      <div class="thirds-summary-grid">
        ${thirdsCapsulesHtml}
      </div>
    </div>
  `;

  container.innerHTML = `
    <div class="summary-section-title">Ringkasan Klasemen & Kualifikasi</div>
    <div class="summary-slider-container">
      ${page1Html}
      ${page2Html}
      ${pagerHtml}
    </div>
    <div class="summary-divider"></div>
    ${thirdsHtml}
  `;
}

window.setGroupPage = function(pageIndex) {
  currentGroupPage = pageIndex;
  renderStandingsSummary();
};

window.renderStandingsSummary = renderStandingsSummary;



let currentScale = 1;
let baseScale = 1;
let hasPinched = false;

function applyScale() {
  const wrapper = document.querySelector('.compact-bracket-wrapper');
  const container = document.getElementById('compact-bracket-container');
  const scaffolding = document.getElementById('bracket-scroll-scaffolding');
  if (!wrapper || !container) return;

  currentScale = Math.max(0.25, Math.min(currentScale, 2.5));

  container.style.transform = `scale(${currentScale})`;
  container.style.transformOrigin = 'top left';

  const baseHeight = 760;
  const scaledHeight = baseHeight * currentScale;

  // Dynamic bottom padding: decrease when zoomed out, increase when zoomed in
  let paddingBottomVal = 0;
  if (currentScale > baseScale) {
    paddingBottomVal = 60 * currentScale;
  } else {
    paddingBottomVal = 35 * currentScale;
  }

  const totalScaffoldingHeight = scaledHeight + paddingBottomVal;

  if (scaffolding) {
    scaffolding.style.width = `${960 * currentScale}px`;
    scaffolding.style.height = `${totalScaffoldingHeight}px`;
  }

  const maxWrapperHeight = 760;
  const targetWrapperHeight = Math.min(maxWrapperHeight, totalScaffoldingHeight);
  wrapper.style.height = `${targetWrapperHeight}px`;

  // Explicitly control overflow and cursor based on zoom toggle state to prevent dragging when zoomed out
  const toggle = document.getElementById('bracket-zoom-toggle');
  if (toggle && toggle.checked) {
    wrapper.style.overflow = 'auto';
    wrapper.style.cursor = 'grab';
  } else {
    wrapper.style.overflow = 'hidden';
    wrapper.style.cursor = 'default';
    wrapper.scrollLeft = 0;
    wrapper.scrollTop = 0;
  }
}

function scaleCompactBracket() {
  const wrapper = document.querySelector('.compact-bracket-wrapper');
  const container = document.getElementById('compact-bracket-container');
  if (!wrapper || !container) return;

  const wrapperWidth = wrapper.clientWidth;
  if (wrapperWidth === 0) return;

  const targetWidth = Math.max(280, wrapperWidth - 16);
  baseScale = targetWidth / 960;

  const toggle = document.getElementById('bracket-zoom-toggle');
  if (toggle && toggle.checked) {
    currentScale = 1.35;
  } else {
    currentScale = baseScale;
  }

  applyScale();
}
window.scaleCompactBracket = scaleCompactBracket;

window.toggleBracketZoom = function(isZoomed) {
  if (isZoomed) {
    currentScale = 1.35;
  } else {
    const wrapper = document.querySelector('.compact-bracket-wrapper');
    if (wrapper) {
      const wrapperWidth = wrapper.clientWidth;
      if (wrapperWidth > 0) {
        const targetWidth = Math.max(280, wrapperWidth - 16);
        baseScale = targetWidth / 960;
      }
    }
    currentScale = baseScale;
  }
  applyScale();
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
      e.preventDefault();
      hasPinched = true;

      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const factor = currentDistance / initialDistance;
      currentScale = startScale * factor;

      const toggle = document.getElementById('bracket-zoom-toggle');
      if (toggle) {
        toggle.checked = currentScale > baseScale * 1.1;
      }

      applyScale();
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
  let startX;
  let startY;
  let scrollLeft;
  let scrollTop;
  let dragThreshold = 5;

  window.isBracketDragging = false;

  wrapper.addEventListener('mousedown', (e) => {
    const toggle = document.getElementById('bracket-zoom-toggle');
    if (!toggle || !toggle.checked) return;

    isDown = true;
    wrapper.classList.add('grabbing');
    startX = e.pageX - wrapper.offsetLeft;
    startY = e.pageY - wrapper.offsetTop;
    scrollLeft = wrapper.scrollLeft;
    scrollTop = wrapper.scrollTop;
    window.isBracketDragging = false;
  });

  wrapper.addEventListener('mouseleave', () => {
    isDown = false;
    wrapper.classList.remove('grabbing');
  });

  wrapper.addEventListener('mouseup', () => {
    isDown = false;
    wrapper.classList.remove('grabbing');
    setTimeout(() => {
      window.isBracketDragging = false;
    }, 50);
  });

  wrapper.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX - wrapper.offsetLeft;
    const y = e.pageY - wrapper.offsetTop;
    const walkX = x - startX;
    const walkY = y - startY;

    if (Math.abs(walkX) > dragThreshold || Math.abs(walkY) > dragThreshold) {
      window.isBracketDragging = true;
    }

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

// Handles selection of winner in the bracket card or displays potential slot contenders
window.handleBracketTap = function(matchId, teamName, isSelectable) {
  if (window.isBracketDragging) {
    return;
  }
  if (!isSelectable) {
    if (teamName && (
      teamName.startsWith('Winner Match') || 
      teamName.startsWith('Loser Match') || 
      teamName.startsWith('3rd Grup') || 
      teamName.startsWith('3rd Group') ||
      teamName.startsWith('Juara Grup') ||
      teamName.startsWith('Runner-up Grup') ||
      teamName.startsWith('Juara Group') ||
      teamName.startsWith('Runner-up Group')
    )) {
      window.openSlotModal(teamName, matchId);
    }
    return;
  }

  if (teamName && (
    teamName.startsWith('Winner Match') || 
    teamName.startsWith('Loser Match') || 
    teamName.startsWith('3rd Grup') || 
    teamName.startsWith('3rd Group') ||
    teamName.startsWith('Juara Grup') ||
    teamName.startsWith('Runner-up') ||
    teamName.startsWith('Juara Group') ||
    teamName.startsWith('Runner-up Group')
  )) {
    window.openSlotModal(teamName, matchId);
    return;
  }

  // Toggle winner
  if (simulatedWinners[matchId] === teamName) {
    // Already winner -> untap/reset winner
    delete simulatedWinners[matchId];
  } else {
    simulatedWinners[matchId] = teamName;
  }

  recalculateKnockoutTree();
  renderBracket();
  renderFavorites(); // In case favorited cards are affected
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
              <td style="text-align: center; font-weight: 600;">${t.pts}</td>
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
              <th style="width: 10%; text-align: center;">Pos</th>
              <th style="width: 15%; text-align: center;">Grup</th>
              <th style="text-align: left; width: 45%;">Tim</th>
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

window.showGroupMatches = function(groupName) {
  const modal = document.getElementById('group-matches-modal');
  const titleEl = document.getElementById('group-matches-modal-title');
  const bodyEl = document.getElementById('group-matches-modal-body');
  if (!modal || !bodyEl || !titleEl) return;

  titleEl.innerText = `Jadwal & Hasil - ${groupName}`;

  // Filter group matches
  const matches = WORLD_CUP_DATA.group_stage.filter(m => m.group === groupName);
  
  // Sort group matches chronologically
  function dateToVal(dStr) {
    const [d, m] = dStr.split('/').map(Number);
    return m * 100 + d;
  }
  matches.sort((a, b) => {
    const dateDiff = dateToVal(a.date) - dateToVal(b.date);
    if (dateDiff !== 0) return dateDiff;
    return a.time.localeCompare(b.time);
  });

  let html = '<div class="matches-wrapper" style="padding-top: 10px; display: flex; flex-direction: column; gap: 12px;">';
  matches.forEach(m => {
    html += createMatchCardHtml(m, 0, false);
  });
  html += '</div>';

  bodyEl.innerHTML = html;
  modal.classList.add('active');
};

window.closeGroupMatchesModal = function() {
  const modal = document.getElementById('group-matches-modal');
  if (modal) {
    modal.classList.remove('active');
  }
};

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
    searchInput.addEventListener('input', renderSchedule);
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

  // Sub-tabs switcher (Jadwal Mendatang vs Hasil Pertandingan)
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

      // Highlight all rows in the bracket with the same team name
      const matches = Array.from(bracketRoot.querySelectorAll('.bracket-team-row')).filter(
        row => row.getAttribute('data-team') === teamName
      );
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
function startScorePolling() {
  if (scorePollInterval) {
    clearInterval(scorePollInterval);
  }
  
  // Fetch immediately
  fetchRealTimeScores(false);
  
  // Set interval every 60 seconds
  scorePollInterval = setInterval(() => {
    fetchRealTimeScores(false);
  }, 60000);
  console.log("Score polling started.");
}

function stopScorePolling() {
  if (scorePollInterval) {
    clearInterval(scorePollInterval);
    scorePollInterval = null;
    console.log("Score polling stopped.");
  }
}

// Fetch and update scores from API
async function fetchRealTimeScores(isManual = false) {
  const statusMsg = document.getElementById('api-status-msg');
  if (!statusMsg) return;

  const manual = isManual === true;
  if (!manual && Date.now() - lastFetchTime < 60000) {
    console.log("Score auto-fetch skipped (throttled).");
    return;
  }

  statusMsg.innerHTML = '<span class="pulse-dot loading"></span> Sinkronisasi skor otomatis sedang berjalan...';
  statusMsg.style.color = "var(--text-secondary)";

  let data = null;
  let errorMsg = "";

  const directFetch = async () => {
    console.log("Trying direct API fetch from worldcup26.ir...");
    const response = await fetch('https://worldcup26.ir/get/games');
    if (!response.ok) throw new Error(`Direct API returned status ${response.status}`);
    return await response.json();
  };

  const proxyFetch = async () => {
    console.log("Trying relative Vercel proxy fetch...");
    const response = await fetch('/api/matches');
    if (!response.ok) throw new Error(`Vercel proxy returned status ${response.status}`);
    return await response.json();
  };

  const corsFetch = async () => {
    console.log("Trying CORS proxy fallback fetch from worldcup26.ir...");
    const response = await fetch('https://corsproxy.io/?url=https://worldcup26.ir/get/games');
    if (!response.ok) throw new Error(`CORS proxy returned status ${response.status}`);
    return await response.json();
  };

  // Always prioritize Direct API first to allow browser-level mock interceptors (e.g. Cypress, MSW) to capture the call.
  const order = [
    { name: "Direct API", fn: directFetch },
    { name: "Vercel Proxy", fn: proxyFetch },
    { name: "CORS Proxy Fallback", fn: corsFetch }
  ];

  for (const step of order) {
    try {
      data = await step.fn();
      console.log(`${step.name} fetch succeeded!`);
      break;
    } catch (err) {
      errorMsg = err.message || `Error on ${step.name}`;
      console.log(`${step.name} fetch failed:`, err);
    }
  }

  // Helper to determine the winner of a knockout match from the API
  const getApiKnockoutWinner = (apiMatch, allApiMatches) => {
    const score1 = parseInt(apiMatch.home_score);
    const score2 = parseInt(apiMatch.away_score);
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

    if (!data.games || !Array.isArray(data.games)) {
      throw new Error("Struktur data API tidak dikenal.");
    }

    let updatedCount = 0;
    let winnerAdvancedCount = 0;

    data.games.forEach(apiMatch => {
      const isFinished = apiMatch.finished === 'TRUE' || apiMatch.time_elapsed === 'finished';
      const isLive = !isFinished && apiMatch.time_elapsed !== 'notstarted';

      const team1Indo = TEAM_TRANSLATIONS[apiMatch.home_team_name_en] || apiMatch.home_team_name_en;
      const team2Indo = TEAM_TRANSLATIONS[apiMatch.away_team_name_en] || apiMatch.away_team_name_en;
      
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
        let score1 = null;
        let score2 = null;
        
        if (isFinished || isLive) {
          const rawScore1 = parseInt(apiMatch.home_score);
          const rawScore2 = parseInt(apiMatch.away_score);
          
          if (match) {
            if (match.team1 === team1Indo) {
              score1 = rawScore1;
              score2 = rawScore2;
            } else {
              score1 = rawScore2;
              score2 = rawScore1;
            }
          } else {
            score1 = rawScore1;
            score2 = rawScore2;
          }
        }

        const status = isFinished ? 'FINISHED' : (isLive ? 'IN_PLAY' : 'TIMED');

        realScores[localKey] = {
          score1: score1,
          score2: score2,
          status: status,
          stadium_id: apiMatch.stadium_id,
          matchday: apiMatch.matchday,
          home_scorers: apiMatch.home_scorers,
          away_scorers: apiMatch.away_scorers
        };
        updatedCount++;

        // Advance real-life winners to the simulator bracket
        if (matchId >= 73 && isFinished) {
          const apiWinner = getApiKnockoutWinner(apiMatch, data.games);
          const winnerTeam = TEAM_TRANSLATIONS[apiWinner] || apiWinner;
          if (winnerTeam && simulatedWinners[matchId] !== winnerTeam) {
            simulatedWinners[matchId] = winnerTeam;
            winnerAdvancedCount++;
          }
        }
      }
    });

    localStorage.setItem('wc2026_real_scores', JSON.stringify(realScores));
    if (winnerAdvancedCount > 0) {
      localStorage.setItem('wc2026_simulated_winners', JSON.stringify(simulatedWinners));
    }
    // Always recalculate standings & bracket on new scores fetch
    recalculateKnockoutTree();

    const timeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    statusMsg.innerHTML = `<span class="pulse-dot"></span> Sinkronisasi otomatis aktif. Terakhir diperbarui: ${timeString} (${updatedCount} skor diperbarui).`;
    statusMsg.style.color = "var(--accent-emerald)";
    lastFetchTime = Date.now();

    // Refresh active views
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

  } catch (err) {
    console.error("Score fetch failed:", err);
    statusMsg.innerHTML = `<span class="pulse-dot error"></span> Gagal memperbarui skor: ${err.message || 'Error koneksi API'}`;
    statusMsg.style.color = "var(--accent-red)";
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

// ----------------------------------------------------
// INITIAL RUN
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initNavigation();
  
  // scale compact bracket on window resize
  window.addEventListener('resize', () => {
    if (activeTab === 'tab-bracket') {
      scaleCompactBracket();
    }
  });

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
