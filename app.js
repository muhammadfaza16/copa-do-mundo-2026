// FIFA World Cup 2026 Application Logic Controller
const WORLD_CUP_DATA = window.WORLD_CUP_DATA;
const TEAM_FLAGS = window.TEAM_FLAGS;

// LOCAL STORAGE MIGRATION (English -> Indonesian)
const TEAM_TRANSLATIONS = {
  "Mexico": "Meksiko",
  "South Africa": "Afrika Selatan",
  "South Korea": "Korea Selatan",
  "Czechia": "Ceko",
  "Canada": "Kanada",
  "Bosnia and Herzegovina": "Bosnia dan Herzegovina",
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
  "England": "Inggris",
  "Croatia": "Kroasia",
  "Ghana": "Ghana",
  "Panama": "Panama",
  "Uzbekistan": "Uzbekistan",
  "Colombia": "Kolombia"
};

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
  "Grup A": ["Estadio Azteca, Mexico City", "Estadio Akron, Guadalajara"],
  "Grup B": ["BMO Field, Toronto", "BC Place, Vancouver"],
  "Grup C": ["SoFi Stadium, Inglewood", "Levi's Stadium, Santa Clara"],
  "Grup D": ["Lumen Field, Seattle", "NRG Stadium, Houston"],
  "Grup E": ["AT&T Stadium, Arlington", "Arrowhead Stadium, Kansas City"],
  "Grup F": ["Mercedes-Benz Stadium, Atlanta", "Gillette Stadium, Foxborough"],
  "Grup G": ["Hard Rock Stadium, Miami Gardens", "Lincoln Financial Field, Philadelphia"],
  "Grup H": ["MetLife Stadium, East Rutherford", "Estadio BBVA, Guadalupe"],
  "Grup I": ["BC Place, Vancouver", "Lumen Field, Seattle"],
  "Grup J": ["Estadio Azteca, Mexico City", "Estadio Akron, Guadalajara"],
  "Grup K": ["BMO Field, Toronto", "Gillette Stadium, Foxborough"],
  "Grup L": ["MetLife Stadium, East Rutherford", "Lincoln Financial Field, Philadelphia"]
};

function getMatchVenue(match) {
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
  // WIB is UTC+7
  const utcTimestamp = Date.UTC(2026, month - 1, day, hours - 7, minutes, 0);
  return new Date(utcTimestamp);
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
    const score = realScores[matchKey];
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

  // 1. Check if there is a LIVE match
  const liveMatches = allMatches.filter(m => {
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    const scoreData = realScores[matchKey];
    return scoreData && (scoreData.status === 'IN_PLAY' || scoreData.status === 'PAUSED');
  });

  if (liveMatches.length > 0) {
    // MODE 1: LIVE Matches Active
    titleEl.innerHTML = `<span class="live-blink-dot" style="margin-right: 8px;"></span>Pertandingan Sedang Berlangsung`;
    
    let liveHtml = '<div style="width: 100%; display: flex; flex-direction: column; gap: 10px; margin-top: 15px; margin-bottom: 5px;">';
    liveMatches.forEach(m => {
      liveHtml += createMatchCardHtml(m, 0, m.isKO);
    });
    liveHtml += '</div>';
    
    cdDisplay.innerHTML = liveHtml;
    cdDisplay.style.display = 'block';
    subEl.style.display = 'none';
    return;
  }

  // MODE 2: Countdown Active (No live matches)
  const hasLiveStructure = cdDisplay.querySelector('.match-card') || cdDisplay.innerHTML.includes('match-card');
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
  subEl.innerText = `${targetMatch.team1} vs ${targetMatch.team2} - ${venue}`;

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
  
  const labelStage = match.group;
  const labelVenue = getMatchVenue(match);

  return `
    <div class="match-card" data-key="${matchKey}">
      <div class="match-header">
        <span class="match-stage">${labelStage}</span>
        <span class="match-date-label">${timeInfo.date}</span>
      </div>
      <div class="match-body">
        <div class="team-display left">
          <span class="team-name">${match.team1}</span>
          ${getFlagHtml(match.team1)}
        </div>
        <div class="match-time-box">
          ${(() => {
            const scoreData = realScores[matchKey];
            if (scoreData) {
              const isLive = scoreData.status === 'IN_PLAY' || scoreData.status === 'PAUSED';
              const statusText = isLive ? 'LIVE' : 'FT';
              return `
                <div class="score-display">${scoreData.score1} - ${scoreData.score2}</div>
                <div class="score-status ${isLive ? 'status-live' : 'status-ft'}">${statusText}</div>
              `;
            }
            return `
              <div>${timeInfo.time}</div>
              <div class="time-tz-label">${timeInfo.tzLabel}</div>
            `;
          })()}
        </div>
        <div class="team-display right">
          ${getFlagHtml(match.team2)}
          <span class="team-name">${match.team2}</span>
        </div>
      </div>
      <div class="match-footer">
        <div class="match-footer-left">
          <span class="match-venue-label">${labelVenue}</span>
        </div>
        <button class="star-btn ${starredClass}" onclick="toggleMatchStar('${matchKey}', this)" aria-label="Simpan Pertandingan">
          <svg viewBox="0 0 24 24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  `;
}

// Render schedule list based on search/filters
function renderSchedule() {
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
    const hasScore = !!realScores[matchKey];
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
  const container = document.getElementById('latest-results-list');
  if (!container) return;

  // Combine all matches
  const allMatches = [
    ...WORLD_CUP_DATA.group_stage.map(m => ({ ...m, isKO: false })),
    ...knockoutMatches.map(m => ({ ...m, isKO: true }))
  ];

  // Filter matches that have real scores recorded
  const matchesWithScores = allMatches.filter(m => {
    const matchKey = m.isKO ? `ko_${m.match_id}` : `gs_${m.date}_${m.team1}_${m.team2}`;
    return !!realScores[matchKey];
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
    const score = realScores[matchKey];
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

    // Get all matches (both finished and upcoming) on these two days
    upcoming = allMatches.filter(m => {
      if (m.isKO) {
        const isPlaceholder1 = m.team1.startsWith('Winner Match') || m.team1.startsWith('Loser Match') || m.team1.startsWith('3rd Group') || m.team1.startsWith('Runner-up Group') || m.team1.startsWith('Winner Group');
        const isPlaceholder2 = m.team2.startsWith('Winner Match') || m.team2.startsWith('Loser Match') || m.team2.startsWith('3rd Group') || m.team2.startsWith('Runner-up Group') || m.team2.startsWith('Winner Group');
        if (isPlaceholder1 || isPlaceholder2) return false;
      }
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
    const scoreData = realScores[matchKey];
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
    const score = realScores[matchKey];
    if (score && (score.status === 'FINISHED' || score.status === 'IN_PLAY' || score.status === 'PAUSED')) {
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
      ? '<span style="font-size: 0.55rem; color: var(--accent-emerald); border: 1px solid rgba(16, 185, 129, 0.3); padding: 1.5px 6px; border-radius: 4px; font-weight: bold; background: rgba(16, 185, 129, 0.05); letter-spacing: 0.5px;">LOLOS</span>'
      : '<span style="font-size: 0.55rem; color: var(--accent-red); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1.5px 6px; border-radius: 4px; font-weight: bold; background: rgba(239, 68, 68, 0.05); letter-spacing: 0.5px;">GUGUR</span>';
    
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
    const winner = simulatedWinners[m.match_id];
    
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

function renderBracket() {
  const container = document.getElementById('bracket-root');
  if (!container) return;

  const slotHeights = [124, 276, 580, 1188, 2404];

  // Group knockoutMatches by stage in a single left-to-right flow
  const stages = [
    { 
      title: "32 Besar", 
      matches: [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 85, 86, 87, 88].map(id => knockoutMatches.find(m => m.match_id === id)).filter(Boolean), 
      info: "16 Laga • 29 Jun - 3 Jul", 
      slotHeight: 124 
    },
    { 
      title: "16 Besar", 
      matches: [89, 90, 93, 94, 91, 92, 95, 96].map(id => knockoutMatches.find(m => m.match_id === id)).filter(Boolean), 
      info: "8 Laga • 4 Jul - 7 Jul", 
      slotHeight: 276 
    },
    { 
      title: "Perempat Final", 
      matches: [97, 98, 99, 100].map(id => knockoutMatches.find(m => m.match_id === id)).filter(Boolean), 
      info: "4 Laga • 9 - 12 Jul", 
      slotHeight: 580 
    },
    { 
      title: "Semifinal", 
      matches: [101, 102].map(id => knockoutMatches.find(m => m.match_id === id)).filter(Boolean), 
      info: "2 Laga • 14 - 15 Jul", 
      slotHeight: 1188 
    },
    { 
      title: "Final & Juara 3", 
      matches: [
        knockoutMatches.find(m => m.match_id === 104),
        knockoutMatches.find(m => m.match_id === 103)
      ].filter(Boolean), 
      info: "2 Laga • 18 - 19 Jul", 
      slotHeight: 2404 
    }
  ];

  let bracketHtml = '';

  stages.forEach((stage, sIdx) => {
    let matchesHtml = '';
    const slotHeight = stage.slotHeight;

    stage.matches.forEach(m => {
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

      let team1Content = `<span class="bracket-team-name-wrap">${getFlagHtml(m.team1)} <span>${m.team1 || ''}</span></span>`;
      if (isPlaceholder1 && m.team1) {
        team1Content = `<span class="bracket-team-name-wrap">${getFlagHtml(m.team1)} <span class="placeholder-text">${formatPlaceholderName(m.team1)}</span></span>`;
      }

      let team2Content = `<span class="bracket-team-name-wrap">${getFlagHtml(m.team2)} <span>${m.team2 || ''}</span></span>`;
      if (isPlaceholder2 && m.team2) {
        team2Content = `<span class="bracket-team-name-wrap">${getFlagHtml(m.team2)} <span class="placeholder-text">${formatPlaceholderName(m.team2)}</span></span>`;
      }

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

      const timeInfo = getFormattedTime(m.date, m.time);

      const matchBoxHtml = `
        <div class="bracket-match ${cardStateClass}">
          <div class="bracket-match-header">
            <span>Laga ${m.match_id}</span>
            <span>${timeInfo.date} • ${timeInfo.time}</span>
          </div>
          <!-- Team 1 Row -->
          <div class="bracket-team-row ${isPlaceholder1 ? 'placeholder' : ''} ${team1WinnerClass}" 
               ${!isPlaceholder1 ? `data-team="${m.team1}"` : ''}
               onclick="window.handleBracketTap(${m.match_id}, '${m.team1 ? m.team1.replace(/'/g, "\\'") : ''}', ${!isPlaceholder1 && !isPlaceholder2})">
             ${team1Content}
             ${winner && winner === m.team1 ? `
               <span class="bracket-winner-indicator">
                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:2px;">
                   <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                   <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                   <path d="M4 22h16"></path>
                   <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
                   <path d="M12 2a5 5 0 0 0-5 5v3.66c0 .87.35 1.7 1 2.34l2 2a2.83 2.83 0 0 0 4 0l2-2a3.3 3.3 0 0 0 1-2.34V7a5 5 0 0 0-5-5z"></path>
                 </svg>
                 <span>MENANG</span>
               </span>
             ` : ''}
          </div>
          <!-- Team 2 Row -->
          <div class="bracket-team-row ${isPlaceholder2 ? 'placeholder' : ''} ${team2WinnerClass}" 
               ${!isPlaceholder2 ? `data-team="${m.team2}"` : ''}
               onclick="window.handleBracketTap(${m.match_id}, '${m.team2 ? m.team2.replace(/'/g, "\\'") : ''}', ${!isPlaceholder1 && !isPlaceholder2})">
             ${team2Content}
             ${winner && winner === m.team2 ? `
               <span class="bracket-winner-indicator">
                 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:2px;">
                   <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                   <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                   <path d="M4 22h16"></path>
                   <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path>
                   <path d="M12 2a5 5 0 0 0-5 5v3.66c0 .87.35 1.7 1 2.34l2 2a2.83 2.83 0 0 0 4 0l2-2a3.3 3.3 0 0 0 1-2.34V7a5 5 0 0 0-5-5z"></path>
                 </svg>
                 <span>MENANG</span>
               </span>
             ` : ''}
          </div>
          <div class="bracket-match-footer-venue">
            ${m.venue}
          </div>
        </div>
      `;

      const isThirdPlace = m.group === "Third-place match";

      if (isThirdPlace) {
        matchesHtml += `
          <div class="bracket-third-place-wrapper">
            <div class="bracket-third-place-header" style="font-size: 0.65rem; font-weight: 700; color: var(--primary-gold); text-align: center; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Perebutan Juara 3</div>
            ${matchBoxHtml}
          </div>
        `;
      } else {
        matchesHtml += `
          <div class="bracket-slot ${cardStateClass}" style="height: ${slotHeight}px;">
            ${matchBoxHtml}
          </div>
        `;
      }
    });

    bracketHtml += `
      <div class="bracket-column" style="--parent-height: ${sIdx > 0 ? slotHeights[sIdx - 1] : 0}px;">
        <div class="bracket-column-header">
          ${stage.title}
          <div class="bracket-column-info">${stage.info}</div>
        </div>
        ${matchesHtml}
      </div>
    `;
  });

  container.innerHTML = bracketHtml;
}

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
            ? '<span style="font-size: 0.55rem; color: var(--accent-emerald); border: 1px solid rgba(16, 185, 129, 0.3); padding: 1.5px 6px; border-radius: 4px; font-weight: bold; background: rgba(16, 185, 129, 0.05); letter-spacing: 0.5px;">LOLOS</span>'
            : '<span style="font-size: 0.55rem; color: var(--accent-red); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1.5px 6px; border-radius: 4px; font-weight: bold; background: rgba(239, 68, 68, 0.05); letter-spacing: 0.5px;">GUGUR</span>';
          
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



window.scrollBracketToEdge = function(direction) {
  const container = document.getElementById('bracket-scroll-container');
  if (!container) return;

  if (direction === 'left') {
    container.scrollTo({
      left: 0,
      behavior: 'smooth'
    });
  } else if (direction === 'right') {
    container.scrollTo({
      left: container.scrollWidth,
      behavior: 'smooth'
    });
  }
};

window.centerBracketVertical = function() {
  const bracket = document.getElementById('bracket-root');
  if (!bracket) return;

  const rect = bracket.getBoundingClientRect();
  const bracketCenterViewportY = rect.top + rect.height / 2;

  // Dynamically calculate unobstructed viewport heights
  const header = document.querySelector('header');
  const bottomNav = document.querySelector('.bottom-nav');
  const headerHeight = header ? header.getBoundingClientRect().height : 60;
  const bottomNavHeight = bottomNav ? (window.innerHeight - bottomNav.getBoundingClientRect().top) : 92;

  // Unobstructed center of the viewport
  const unobstructedCenterY = headerHeight + (window.innerHeight - headerHeight - bottomNavHeight) / 2;

  const targetScrollY = window.scrollY + bracketCenterViewportY - unobstructedCenterY;

  window.scrollTo({
    top: targetScrollY,
    behavior: 'smooth'
  });
};

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

      // Toggle center button visibility based on active tab
      if (activeTab === 'tab-bracket') {
        document.body.classList.add('bracket-active');
      } else {
        document.body.classList.remove('bracket-active');
      }

      // Specific tab triggers
      if (activeTab === 'tab-schedule') {
        renderSchedule();
      } else if (activeTab === 'tab-groups') {
        renderGroups();
      } else if (activeTab === 'tab-bracket') {
        renderBracket();
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

  if (!apiKey) {
    statusMsg.innerHTML = '<span class="pulse-dot error"></span> API Key tidak dikonfigurasi.';
    statusMsg.style.color = "var(--accent-red)";
    return;
  }

  statusMsg.innerHTML = '<span class="pulse-dot loading"></span> Sinkronisasi skor otomatis sedang berjalan...';
  statusMsg.style.color = "var(--text-secondary)";

  let fetchUrl = 'https://corsproxy.io/?url=https://api.football-data.org/v4/competitions/WC/matches';
  let headers = { 'X-Auth-Token': apiKey };

  // If deployed (running on Vercel), use the Vercel serverless proxy endpoint
  const isVercel = typeof window !== 'undefined' && window.location && (window.location.hostname === 'julesrimet26.vercel.app' || window.location.hostname.endsWith('.vercel.app'));
  if (isVercel) {
    fetchUrl = '/api/matches';
    headers = {}; // headers are handled by the serverless function
  }

  try {
    const response = await fetch(fetchUrl, { headers });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("API Key tidak valid (403 Forbidden).");
      } else if (response.status === 429) {
        throw new Error("Terlalu banyak permintaan (429 Rate Limit). Silakan tunggu sebentar.");
      }
      throw new Error(`API error (Status: ${response.status})`);
    }

    const data = await response.json();
    if (!data || !data.matches || !Array.isArray(data.matches)) {
      throw new Error("Struktur data API tidak dikenal.");
    }

    let updatedCount = 0;
    let winnerAdvancedCount = 0;

    data.matches.forEach(apiMatch => {
      // We only care about played or in-progress matches
      if (apiMatch.status === 'FINISHED' || apiMatch.status === 'IN_PLAY' || apiMatch.status === 'PAUSED') {
        const team1Indo = TEAM_TRANSLATIONS[apiMatch.homeTeam.name] || apiMatch.homeTeam.name;
        const team2Indo = TEAM_TRANSLATIONS[apiMatch.awayTeam.name] || apiMatch.awayTeam.name;
        
        let localKey = null;
        if (apiMatch.stage === 'GROUP_STAGE') {
          const match = WORLD_CUP_DATA.group_stage.find(m => 
            (m.team1 === team1Indo && m.team2 === team2Indo) || 
            (m.team1 === team2Indo && m.team2 === team1Indo)
          );
          if (match) {
            localKey = `gs_${match.date}_${match.team1}_${match.team2}`;
          }
        } else {
          const localStage = mapApiStageToLocal(apiMatch.stage);
          if (localStage) {
            // Find by stage, date, time
            const apiDate = new Date(apiMatch.utcDate);
            const wibOffset = 7 * 60 * 60 * 1000;
            const wibDate = new Date(apiDate.getTime() + wibOffset);
            
            const day = wibDate.getUTCDate();
            const month = wibDate.getUTCMonth() + 1;
            const hours = String(wibDate.getUTCHours()).padStart(2, '0');
            const minutes = String(wibDate.getUTCMinutes()).padStart(2, '0');
            
            const localDateStr = `${day}/${month}`;
            const localTimeStr = `${hours}:${minutes}`;
            
            const match = WORLD_CUP_DATA.knockout_stage.find(m => 
              m.group === localStage && 
              m.date === localDateStr && 
              m.time === localTimeStr
            );
            if (match) {
              localKey = `ko_${match.match_id}`;
            } else {
              // Fallback matching by teams
              const fallbackMatch = WORLD_CUP_DATA.knockout_stage.find(m => 
                m.group === localStage && 
                ((m.team1 === team1Indo && m.team2 === team2Indo) || 
                 (m.team1 === team2Indo && m.team2 === team1Indo))
              );
              if (fallbackMatch) {
                localKey = `ko_${fallbackMatch.match_id}`;
              }
            }
          }
        }

        if (localKey) {
          realScores[localKey] = {
            score1: apiMatch.score.fullTime.home,
            score2: apiMatch.score.fullTime.away,
            status: apiMatch.status
          };
          updatedCount++;

          // Advance real-life winners to the simulator bracket
          if (apiMatch.stage !== 'GROUP_STAGE' && apiMatch.status === 'FINISHED') {
            const matchId = parseInt(localKey.replace('ko_', ''));
            const winner = apiMatch.score.winner;
            let winnerTeam = "";
            if (winner === 'HOME_TEAM') {
              winnerTeam = team1Indo;
            } else if (winner === 'AWAY_TEAM') {
              winnerTeam = team2Indo;
            }
            if (winnerTeam && simulatedWinners[matchId] !== winnerTeam) {
              simulatedWinners[matchId] = winnerTeam;
              winnerAdvancedCount++;
            }
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
