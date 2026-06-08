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

// STADIUM INFO
const STADIUMS = [
  { name: "MetLife Stadium", city: "East Rutherford, NJ", capacity: "82,500", url: "https://maps.google.com/?q=MetLife+Stadium" },
  { name: "Estadio Azteca", city: "Kota Meksiko, MX", capacity: "87,523", url: "https://maps.google.com/?q=Estadio+Azteca" },
  { name: "SoFi Stadium", city: "Inglewood, CA", capacity: "70,240", url: "https://maps.google.com/?q=SoFi+Stadium" },
  { name: "Gillette Stadium", city: "Foxborough, MA", capacity: "65,878", url: "https://maps.google.com/?q=Gillette+Stadium" },
  { name: "Estadio BBVA", city: "Guadalupe, NL", capacity: "53,500", url: "https://maps.google.com/?q=Estadio+BBVA" },
  { name: "NRG Stadium", city: "Houston, TX", capacity: "72,220", url: "https://maps.google.com/?q=NRG+Stadium" },
  { name: "AT&T Stadium", city: "Arlington, TX", capacity: "80,000", url: "https://maps.google.com/?q=AT&T+Stadium" },
  { name: "Mercedes-Benz Stadium", city: "Atlanta, GA", capacity: "71,000", url: "https://maps.google.com/?q=Mercedes-Benz+Stadium+Atlanta" },
  { name: "Levi's Stadium", city: "Santa Clara, CA", capacity: "68,500", url: "https://maps.google.com/?q=Levi's+Stadium" },
  { name: "Lumen Field", city: "Seattle, WA", capacity: "69,000", url: "https://maps.google.com/?q=Lumen+Field" },
  { name: "BMO Field", city: "Toronto, ON", capacity: "45,000", url: "https://maps.google.com/?q=BMO+Field" },
  { name: "Lincoln Financial Field", city: "Philadelphia, PA", capacity: "69,796", url: "https://maps.google.com/?q=Lincoln+Financial+Field" },
  { name: "BC Place", city: "Vancouver, BC", capacity: "54,500", url: "https://maps.google.com/?q=BC+Place" },
  { name: "Hard Rock Stadium", city: "Miami Gardens, FL", capacity: "64,767", url: "https://maps.google.com/?q=Hard+Rock+Stadium" },
  { name: "Arrowhead Stadium", city: "Kansas City, MO", capacity: "76,416", url: "https://maps.google.com/?q=Arrowhead+Stadium" },
  { name: "Estadio Akron", city: "Zapopan, Jal", capacity: "48,070", url: "https://maps.google.com/?q=Estadio+Akron" }
];

// APP STATE
let activeTab = 'tab-home';
let useLocalTimezone = localStorage.getItem('wc2026_local_tz') !== 'false';
let apiKey = '12aad17c1bf941f68c2318631dfcea1b';
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
  currentTheme = 'dark'; // Dark mode is default
  localStorage.setItem('wc2026_theme', 'dark');
}
if (currentTheme === 'light') {
  document.body.classList.add('light-theme');
}

// SIMULATOR STATE
let groupRankings = {}; // { "Grup A": ["Meksiko", ...], ... }
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
  // Use default alphabetical/extracted team order
  for (const [groupName, teamList] of Object.entries(groups)) {
    groupRankings[groupName] = [...teamList];
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
    return `<img class="flag-crest" src="https://flagcdn.com/w40/${code}.png" alt="${teamName}" loading="lazy">`;
  }
  // Muted gray shield logo for placeholder teams
  return `
    <div class="flag-crest" style="display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15);">
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

// Convert WIB Date+Time to local/WIB formatted details
function getFormattedTime(dateStr, timeStr) {
  const matchDate = getMatchDate(dateStr, timeStr);

  if (useLocalTimezone) {
    // Format according to browser locale
    const formattedDate = matchDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    const formattedTime = matchDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
    return { date: formattedDate, time: formattedTime, tzLabel: "" };
  } else {
    // Standard WIB formatting
    const [day, month] = dateStr.split('/').map(Number);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const formattedDate = `${day} ${months[month - 1]}`;
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
function initCountdown() {
  // Opening match: 12 June 2026 at 02:00 WIB
  const targetTime = new Date("2026-06-12T02:00:00+07:00").getTime();

  function update() {
    const now = new Date().getTime();
    const diff = targetTime - now;

    if (diff <= 0) {
      document.getElementById('countdown-display').innerHTML = `
        <div style="font-size:1.4rem; font-weight:800; color:var(--primary-gold); width:100%; text-align:center; padding:10px 0;">
          KICK OFF PIALA DUNIA 2026!
        </div>
      `;
      clearInterval(interval);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
  }

  update();
  const interval = setInterval(update, 1000);
}

// ----------------------------------------------------
// UI RENDERING ENGINES
// ----------------------------------------------------

// Render Match Card
function createMatchCardHtml(match, index, isKnockout = false) {
  const matchKey = isKnockout ? `ko_${match.match_id}` : `gs_${match.date}_${match.team1}_${match.team2}`;
  const timeInfo = getFormattedTime(match.date, match.time);
  const starredClass = isStarred(matchKey) ? 'active' : '';
  
  const labelStage = isKnockout ? match.group : match.group;
  const labelVenue = isKnockout ? match.venue : "Group Stage Match";

  // Check top10 / top20 badges
  let badgeHtml = '';
  if (match.top10) {
    badgeHtml = `<span class="match-badge badge-top10">Super Match (Top 10)</span>`;
  } else if (match.top20) {
    badgeHtml = `<span class="match-badge badge-top20">Big Match (Top 20)</span>`;
  }

  return `
    <div class="match-card" data-key="${matchKey}">
      <div class="match-header">
        <span class="match-stage">${labelStage}</span>
        <span class="match-venue">${labelVenue}</span>
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
              const statusColor = isLive ? 'var(--accent-emerald)' : 'var(--accent-emerald)';
              const blinkStyle = isLive ? 'style="animation: pulse-blink 1s infinite; color: var(--accent-red); font-weight: 800;"' : `style="color: ${statusColor}; font-weight: 700;"`;
              return `
                <div style="font-size: 1.05rem; font-weight: 800; letter-spacing: 0.5px; line-height: 1.2;">${scoreData.score1} - ${scoreData.score2}</div>
                <div style="font-size: 0.55rem;" ${blinkStyle}>${statusText}</div>
              `;
            }
            return `
              <div>${timeInfo.time}</div>
              <div style="font-size:0.6rem; opacity:0.7;">${timeInfo.tzLabel}</div>
            `;
          })()}
        </div>
        <div class="team-display right">
          ${getFlagHtml(match.team2)}
          <span class="team-name">${match.team2}</span>
        </div>
      </div>
      <div class="match-footer">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:0.65rem; color:var(--text-secondary); font-weight:700;">${timeInfo.date}</span>
          ${badgeHtml}
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
  let filteredKnockout = WORLD_CUP_DATA.knockout_stage;

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

  // Combine lists and sort chronologically by date
  // Since date is formatted as e.g. "12/6", "13/6", let's map dates to simple values for sorting
  function dateToVal(dStr) {
    const [d, m] = dStr.split('/').map(Number);
    return m * 100 + d;
  }

  const allFiltered = [
    ...filteredGroupStage.map(m => ({ ...m, isKO: false })),
    ...filteredKnockout.map(m => ({ ...m, isKO: true }))
  ].sort((a, b) => {
    const diff = dateToVal(a.date) - dateToVal(b.date);
    if (diff !== 0) return diff;
    return a.time.localeCompare(b.time);
  });

  if (allFiltered.length === 0) {
    container.innerHTML = `
      <div class="empty-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>Pertandingan tidak ditemukan. Silakan ganti kata kunci atau saringan filter Anda.</p>
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

// Render Dashboard/Home tab nearest matches
function renderNearestMatches() {
  const container = document.getElementById('nearest-matches-list');
  if (!container) return;

  const now = new Date();
  
  // Combine all matches
  const allMatches = [
    ...WORLD_CUP_DATA.group_stage.map(m => ({ ...m, isKO: false })),
    ...knockoutMatches.map(m => ({ ...m, isKO: true }))
  ];

  // Filter for upcoming matches (start time >= now)
  let upcoming = allMatches.filter(m => {
    if (m.isKO) {
      const isPlaceholder1 = m.team1.startsWith('Winner Match') || m.team1.startsWith('Loser Match') || m.team1.startsWith('3rd Group') || m.team1.startsWith('Runner-up Group') || m.team1.startsWith('Winner Group');
      const isPlaceholder2 = m.team2.startsWith('Winner Match') || m.team2.startsWith('Loser Match') || m.team2.startsWith('3rd Group') || m.team2.startsWith('Runner-up Group') || m.team2.startsWith('Winner Group');
      if (isPlaceholder1 || isPlaceholder2) return false;
    }
    return getMatchDate(m.date, m.time) >= now;
  });

  // Sort chronologically
  upcoming.sort((a, b) => getMatchDate(a.date, a.time) - getMatchDate(b.date, b.time));

  // If no upcoming matches (e.g. tournament ended), fallback to show the final matches
  if (upcoming.length === 0) {
    upcoming = allMatches.slice(-3); // show last 3 matches (Semifinals, Final)
  }

  // Take top 3 matches
  const nearest = upcoming.slice(0, 3);

  let listHtml = '';
  nearest.forEach(match => {
    listHtml += createMatchCardHtml(match, match.match_id || 0, match.isKO);
  });

  container.innerHTML = listHtml;
}

// Render Groups Tab
function renderGroups() {
  const container = document.getElementById('groups-grid');
  if (!container) return;

  let gridHtml = '';

  for (const groupLetter of "ABCDEFGHIJKL".split("")) {
    const groupName = `Grup ${groupLetter}`;
    const rankedTeams = groupRankings[groupName];

    let teamListHtml = '';
    rankedTeams.forEach((team, idx) => {
      // Small visual rank badge
      const rankColor = idx === 0 ? 'var(--primary-gold)' : (idx === 1 ? 'var(--text-primary)' : (idx === 2 ? 'var(--text-secondary)' : 'var(--text-muted)'));
      const rankSuffix = idx === 0 ? '1st' : (idx === 1 ? '2nd' : (idx === 2 ? '3rd' : '4th'));
      
      const upDisabled = idx === 0 ? 'style="opacity: 0.15; pointer-events: none;"' : '';
      const downDisabled = idx === 3 ? 'style="opacity: 0.15; pointer-events: none;"' : '';

      teamListHtml += `
        <div class="group-team-item">
          <div class="group-team-info">
            <span style="font-size:0.65rem; font-weight:800; min-width:20px; color:${rankColor};">${rankSuffix}</span>
            ${getFlagHtml(team)}
            <span class="team-name" style="font-weight: ${idx < 2 ? '600' : '400'};">${team}</span>
          </div>
          <!-- Up/Down arrows to manually reorder standings -->
          <div style="display:flex; gap:4px;">
            <button class="star-btn" ${upDisabled} onclick="moveGroupTeam('${groupName}', ${idx}, -1)" aria-label="Naikkan posisi">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
            <button class="star-btn" ${downDisabled} onclick="moveGroupTeam('${groupName}', ${idx}, 1)" aria-label="Turunkan posisi">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>
        </div>
      `;
    });

    gridHtml += `
      <div class="group-card">
        <div class="group-title">Grup ${groupLetter}</div>
        <div class="group-team-list">
          ${teamListHtml}
        </div>
      </div>
    `;
  }

  container.innerHTML = gridHtml;
}

// ----------------------------------------------------
// BRACKET SIMULATION STATE MANAGEMENT & CALCULATIONS
// ----------------------------------------------------

// Swaps team index in group standing rank list
window.moveGroupTeam = function(groupName, index, direction) {
  const list = groupRankings[groupName];
  const targetIndex = index + direction;
  if (targetIndex >= 0 && targetIndex < list.length) {
    // Swap
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    
    // Save state
    localStorage.setItem('wc2026_group_rankings', JSON.stringify(groupRankings));
    
    // Recalculate bracket setup
    recalculateKnockoutTree();
    
    // Re-render
    renderGroups();
    renderBracket();
    renderFavorites(); // In case favorited KO card teams updated
  }
};

// Main function to dynamically trace standing ranks and calculate bracket teams
function recalculateKnockoutTree() {
  // Clear working copy matches
  knockoutMatches = JSON.parse(JSON.stringify(WORLD_CUP_DATA.knockout_stage));

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

// Click to scroll bracket horizontally on mobile
window.scrollToBracketColumn = function(colIndex) {
  const container = document.getElementById('bracket-root');
  if (!container) return;
  const columns = container.querySelectorAll('.bracket-column');
  if (columns.length > colIndex) {
    const colWidth = columns[colIndex].offsetWidth + 24; // offsetWidth + gap (24px)
    container.scrollTo({
      left: colIndex * colWidth,
      behavior: 'smooth'
    });
  }
};

function renderBracket() {
  const container = document.getElementById('bracket-root');
  const dotsContainer = document.getElementById('bracket-dots');
  if (!container || !dotsContainer) return;

  // Tree-ordered match IDs for each stage
  const treeOrder = {
    "Round of 32": [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 85, 86, 87, 88],
    "Round of 16": [89, 90, 93, 94, 91, 92, 95, 96],
    "Quarter-final": [97, 98, 99, 100],
    "Semi-final": [101, 102],
    "Final": [104],
    "Third-place match": [103]
  };

  const slotHeights = [110, 244, 512, 1048, 2120];

  // Group knockoutMatches by stage with subtext info
  const stages = [
    { title: "32 Besar", matches: knockoutMatches.filter(m => m.group === "Round of 32"), info: "16 Laga • 29 Jun - 3 Jul" },
    { title: "16 Besar", matches: knockoutMatches.filter(m => m.group === "Round of 16"), info: "8 Laga • 4 Jul - 7 Jul" },
    { title: "Perempat Final", matches: knockoutMatches.filter(m => m.group === "Quarter-final"), info: "4 Laga • 9 - 12 Jul" },
    { title: "Semifinal", matches: knockoutMatches.filter(m => m.group === "Semi-final"), info: "2 Laga • 14 - 15 Jul" },
    { 
      title: "Final & Juara 3", 
      matches: [
        ...knockoutMatches.filter(m => m.group === "Final"),
        ...knockoutMatches.filter(m => m.group === "Third-place match")
      ],
      info: "2 Laga • 18 - 19 Jul"
    }
  ];

  let bracketHtml = '';
  let dotsHtml = '';

  stages.forEach((stage, sIdx) => {
    let matchesHtml = '';
    const slotHeight = slotHeights[sIdx];

    // Sort matches to match tree order
    let sortedMatches = [];
    if (sIdx === 4) {
      // For column 5: Final is first, Third-place match is second
      sortedMatches = [
        ...knockoutMatches.filter(m => m.group === "Final"),
        ...knockoutMatches.filter(m => m.group === "Third-place match")
      ];
    } else {
      const stageMatches = stage.matches;
      if (stageMatches.length > 0) {
        const matchGroup = stageMatches[0].group; // e.g. "Round of 32"
        const order = treeOrder[matchGroup];
        sortedMatches = [...stageMatches].sort((a, b) => {
          return order.indexOf(a.match_id) - order.indexOf(b.match_id);
        });
      } else {
        sortedMatches = stageMatches;
      }
    }

    sortedMatches.forEach(m => {
      const winner = simulatedWinners[m.match_id];
      const isPlaceholder1 = m.team1 && typeof m.team1 === 'string' && (m.team1.startsWith('Winner Match') || m.team1.startsWith('Loser Match') || m.team1.startsWith('3rd Grup') || m.team1.startsWith('3rd Group'));
      const isPlaceholder2 = m.team2 && typeof m.team2 === 'string' && (m.team2.startsWith('Winner Match') || m.team2.startsWith('Loser Match') || m.team2.startsWith('3rd Grup') || m.team2.startsWith('3rd Group'));

      // Check if team1 is 3rd place placeholder -> render dropdown selection
      let team1Content = `<span class="bracket-team-name-wrap">${getFlagHtml(m.team1)} <span>${m.team1 || ''}</span></span>`;
      if (m.team1_seed === '3rd' && isPlaceholder1 && m.team1) {
        const eligible = getEligibleGroupsFor3rd(m.team1);
        let options = `<option value="">Pilih 3rd...</option>`;
        eligible.forEach(g => {
          const team = (groupRankings[g] && groupRankings[g][2]) ? groupRankings[g][2] : `Tim 3rd ${g}`;
          const selectedAttr = selected3rdPlaces[m.match_id] === g ? 'selected' : '';
          options += `<option value="${g}" ${selectedAttr}>Grup ${g.replace("Grup ", "")}: ${team}</option>`;
        });
        team1Content = `
          <select class="bracket-select" onchange="select3rdPlaceGroup(${m.match_id}, this.value)">
            ${options}
          </select>
        `;
      } else if (isPlaceholder1 && m.team1) {
        team1Content = `<span class="bracket-team-name-wrap">${getFlagHtml(m.team1)} <span class="placeholder-text">${formatPlaceholderName(m.team1)}</span></span>`;
      }

      // Check if team2 is 3rd place placeholder -> render dropdown selection
      let team2Content = `<span class="bracket-team-name-wrap">${getFlagHtml(m.team2)} <span>${m.team2 || ''}</span></span>`;
      if (m.team2_seed === '3rd' && isPlaceholder2 && m.team2) {
        const eligible = getEligibleGroupsFor3rd(m.team2);
        let options = `<option value="">Pilih 3rd...</option>`;
        eligible.forEach(g => {
          const team = (groupRankings[g] && groupRankings[g][2]) ? groupRankings[g][2] : `Tim 3rd ${g}`;
          const selectedAttr = selected3rdPlaces[m.match_id] === g ? 'selected' : '';
          options += `<option value="${g}" ${selectedAttr}>Grup ${g.replace("Grup ", "")}: ${team}</option>`;
        });
        team2Content = `
          <select class="bracket-select" onchange="select3rdPlaceGroup(${m.match_id}, this.value)">
            ${options}
          </select>
        `;
      } else if (isPlaceholder2 && m.team2) {
        team2Content = `<span class="bracket-team-name-wrap">${getFlagHtml(m.team2)} <span class="placeholder-text">${formatPlaceholderName(m.team2)}</span></span>`;
      }

      const team1WinnerClass = (winner && winner === m.team1) ? 'winner' : (winner ? 'loser' : '');
      const team2WinnerClass = (winner && winner === m.team2) ? 'winner' : (winner ? 'loser' : '');

      const isSelectable = !isPlaceholder1 && !isPlaceholder2;
      const clickableClass = isSelectable ? 'clickable' : '';
      const isPredicted = !!winner;

      // Determine visual card state
      let cardStateClass = '';
      if (!isSelectable) {
        cardStateClass = 'match-locked';
      } else if (isPredicted) {
        cardStateClass = 'match-predicted';
      } else {
        cardStateClass = 'match-ready';
      }

      const matchBoxHtml = `
        <div class="bracket-match ${clickableClass} ${cardStateClass}">
          <div class="bracket-match-header">
            <span>Match ${m.match_id} - ${m.group === "Third-place match" ? "Perebutan Juara 3" : m.group}</span>
            <span>${m.date} ${m.time}</span>
          </div>
          <!-- Team 1 Row -->
          <div class="bracket-team-row ${isPlaceholder1 ? 'placeholder' : ''} ${team1WinnerClass}" 
               ${!isPlaceholder1 ? `data-team="${m.team1}"` : ''} 
               onclick="handleBracketTap(${m.match_id}, '${m.team1}', ${isSelectable})">
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
               onclick="handleBracketTap(${m.match_id}, '${m.team2}', ${isSelectable})">
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
          <div style="font-size:0.6rem; color:var(--text-muted); text-align:center; padding-top:2px; border-top:1px dashed rgba(255,255,255,0.03); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
            ${m.venue}
          </div>
        </div>
      `;

      if (m.group === "Third-place match") {
        matchesHtml += `
          <div class="bracket-third-place-wrapper">
            <div style="font-size:0.65rem; font-weight:700; color:var(--primary-gold); text-align:center; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px;">Perebutan Juara 3</div>
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
      <div class="bracket-column">
        <div class="bracket-column-header">
          ${stage.title}
          <div class="bracket-column-info">${stage.info}</div>
        </div>
        ${matchesHtml}
      </div>
    `;

    // Indicators dots
    dotsHtml += `<div class="bracket-dot ${sIdx === 0 ? 'active' : ''}" data-col="${sIdx}" onclick="scrollToBracketColumn(${sIdx})"></div>`;
  });

  container.innerHTML = bracketHtml;
  dotsContainer.innerHTML = dotsHtml;

  // Add scroll event listener to bracket container to sync indicator dots on mobile swipe
  container.addEventListener('scroll', syncBracketDots);
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

// Handles selection of winner in the bracket card
window.handleBracketTap = function(matchId, teamName, isSelectable) {
  if (!isSelectable) return;
  if (teamName && (teamName.startsWith('Winner Match') || teamName.startsWith('Loser Match') || teamName.startsWith('3rd Grup') || teamName.startsWith('3rd Group'))) return;

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

// Synchronize indicator dots with horizontal scroll index
function syncBracketDots() {
  const container = document.getElementById('bracket-root');
  const dots = document.querySelectorAll('.bracket-dot');
  if (!container || dots.length === 0) return;

  const scrollLeft = container.scrollLeft;
  const columns = container.querySelectorAll('.bracket-column');
  if (columns.length === 0) return;
  
  const colWidth = columns[0].offsetWidth + 24; // width + gap (24px)
  const activeIndex = Math.round(scrollLeft / colWidth);

  dots.forEach((dot, idx) => {
    if (idx === activeIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

// ----------------------------------------------------
// INFO TAB - STADIUMS
// ----------------------------------------------------
function renderStadiums() {
  const container = document.getElementById('stadiums-container');
  if (!container) return;

  let listHtml = '';
  STADIUMS.forEach(s => {
    listHtml += `
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="stadium-card">
        <div>
          <div class="stadium-name">${s.name}</div>
          <div class="stadium-city">${s.city} • Kapasitas: ${s.capacity}</div>
        </div>
        <svg viewBox="0 0 24 24">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </a>
    `;
  });

  container.innerHTML = listHtml;
}

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
      } else if (activeTab === 'tab-home') {
        renderFavorites();
        renderNearestMatches();
      }
      
      // Scroll to top of window
      window.scrollTo(0, 0);
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



  // Reset simulator action
  const resetBtn = document.getElementById('reset-bracket-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin menyetel ulang semua simulasi grup dan fase gugur?')) {
        simulatedWinners = {};
        selected3rdPlaces = {};
        
        // Reset group standings rankings to alphabetical order
        for (const [groupName, teamList] of Object.entries(groups)) {
          groupRankings[groupName] = [...teamList];
        }
        
        localStorage.setItem('wc2026_group_rankings', JSON.stringify(groupRankings));
        localStorage.setItem('wc2026_simulated_winners', JSON.stringify(simulatedWinners));
        localStorage.setItem('wc2026_selected_3rd_places', JSON.stringify(selected3rdPlaces));

        recalculateKnockoutTree();
        renderGroups();
        renderBracket();
        renderFavorites();
        renderNearestMatches();
        
        alert('Simulasi berhasil disetel ulang!');
      }
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

  // API Key Listeners
  const fetchScoresBtn = document.getElementById('fetch-scores-btn');
  if (fetchScoresBtn) {
    fetchScoresBtn.addEventListener('click', fetchRealTimeScores);
  }
}

// Fetch and update scores from API
async function fetchRealTimeScores() {
  const statusMsg = document.getElementById('api-status-msg');
  const fetchBtn = document.getElementById('fetch-scores-btn');
  if (!statusMsg) return;

  if (!apiKey) {
    statusMsg.textContent = "Silakan simpan API Key terlebih dahulu.";
    statusMsg.style.color = "var(--accent-red)";
    return;
  }

  statusMsg.textContent = "Mengambil data skor...";
  statusMsg.style.color = "var(--text-secondary)";
  if (fetchBtn) fetchBtn.disabled = true;

  try {
    const response = await fetch('https://corsproxy.io/?url=https://api.football-data.org/v4/competitions/WC/matches', {
      headers: {
        'X-Auth-Token': apiKey
      }
    });

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
      recalculateKnockoutTree();
    }

    statusMsg.textContent = `Sukses! ${updatedCount} skor diperbarui.${winnerAdvancedCount > 0 ? ` ${winnerAdvancedCount} pemenang dimasukkan ke bagan.` : ''}`;
    statusMsg.style.color = "var(--accent-emerald)";

    // Refresh active views
    if (activeTab === 'tab-schedule') {
      renderSchedule();
    } else if (activeTab === 'tab-bracket') {
      renderBracket();
    } else if (activeTab === 'tab-home') {
      renderFavorites();
      renderNearestMatches();
    }

  } catch (err) {
    console.error("Score fetch failed:", err);
    statusMsg.textContent = err.message || "Gagal mengambil data skor.";
    statusMsg.style.color = "var(--accent-red)";
  } finally {
    if (fetchBtn) fetchBtn.disabled = false;
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
  renderFavoritesCount();
  renderStadiums();
  
  // Initial calculate
  recalculateKnockoutTree();

  // Auto-fetch scores if API key exists
  if (apiKey) {
    fetchRealTimeScores();
  }
});
