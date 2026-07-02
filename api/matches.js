import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. Read data.js and evaluate WORLD_CUP_DATA
    const dataJsPath = path.join(__dirname, '..', 'data.js');
    const dataJs = fs.readFileSync(dataJsPath, 'utf8');
    const window = {};
    const runInContext = new Function('window', dataJs);
    runInContext(window);
    const WORLD_CUP_DATA = window.WORLD_CUP_DATA;

    // 2. Read app.js and extract TEAM_TRANSLATIONS
    const appJsPath = path.join(__dirname, '..', 'app.js');
    const appJs = fs.readFileSync(appJsPath, 'utf8');
    const teamTranslationsMatch = appJs.match(/const TEAM_TRANSLATIONS = ({[\s\S]*?});/);
    let TEAM_TRANSLATIONS = {};
    if (teamTranslationsMatch) {
      const parseTranslations = new Function('return ' + teamTranslationsMatch[1]);
      TEAM_TRANSLATIONS = parseTranslations();
    }

    // Add ESPN specific variations
    TEAM_TRANSLATIONS['Czech Republic'] = 'Ceko';
    TEAM_TRANSLATIONS['Czechia'] = 'Ceko';
    TEAM_TRANSLATIONS['Bosnia-Herzegovina'] = 'Bosnia dan Herzegovina';
    TEAM_TRANSLATIONS['DR Kongo'] = 'RD Kongo';
    TEAM_TRANSLATIONS['Congo DR'] = 'RD Kongo';
    TEAM_TRANSLATIONS['Türkiye'] = 'Turki';
    TEAM_TRANSLATIONS['Turkey'] = 'Turki';

    // 3. Map official matches to UTC times for chronological / slot matching
    const officialMatches = [];

    const getOfficialUtcTime = (dateStr, timeStr) => {
      const [day, month] = dateStr.split('/').map(Number);
      const [hour, min] = timeStr.split(':').map(Number);
      // WIB is UTC+7, so subtract 7 hours
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

    // 4. Fetch live data from ESPN Scoreboard API
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=150', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `ESPN API error (Status: ${response.status})` });
    }

    const espnData = await response.json();

    // 5. Separate group and knockout events to perform mapping
    const groupStageEvents = [];
    const knockoutEvents = [];

    espnData.events.forEach((ev) => {
      const comp = ev.competitions[0];
      const home = comp.competitors.find(c => c.homeAway === 'home');
      const away = comp.competitors.find(c => c.homeAway === 'away');
      
      const homeName = home.team.displayName;
      const awayName = away.team.displayName;
      const homeIndo = TEAM_TRANSLATIONS[homeName] || homeName;
      const awayIndo = TEAM_TRANSLATIONS[awayName] || awayName;
      
      // Match group stage matches by name
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

    // Use static mapping for knockout events to align with data.js match_ids robustly
    const KNOCKOUT_MAPPING = {
      "760486": 73,
      "760487": 76,
      "760488": 75,
      "760489": 74,
      "760490": 78,
      "760491": 79,
      "760492": 77,
      "760495": 80,
      "760493": 82,
      "760494": 81,
      "760497": 84,
      "760496": 83,
      "760498": 85,
      "760499": 88,
      "760500": 86,
      "760501": 87,
      "760502": 92,
      "760503": 89,
      "760504": 90,
      "760505": 96,
      "760506": 93,
      "760507": 94,
      "760508": 91,
      "760509": 95,
      "760510": 97,
      "760511": 98,
      "760512": 99,
      "760513": 100,
      "760514": 101,
      "760515": 102,
      "760516": 103,
      "760517": 104
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

    // 6. Construct legacy match objects
    const STADIUM_MAP = {
      "1": { "city": "Mexico City" },
      "2": { "city": "Zapopan" },
      "3": { "city": "Monterrey" },
      "4": { "city": "Arlington" },
      "5": { "city": "Houston" },
      "6": { "city": "Kansas City" },
      "7": { "city": "Atlanta" },
      "8": { "city": "Miami" },
      "9": { "city": "Foxborough" },
      "10": { "city": "Philadelphia" },
      "11": { "city": "East Rutherford" },
      "12": { "city": "Toronto" },
      "13": { "city": "Vancouver" },
      "14": { "city": "Seattle" },
      "15": { "city": "Santa Clara" },
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
      
      // Parse details for scorers, assisters, and red cards
      const homeScorersMap = {};
      const awayScorersMap = {};
      const homeShootoutList = [];
      const awayShootoutList = [];
      const homeRedCardsList = [];
      const awayRedCardsList = [];
      
      if (comp.details) {
        comp.details.forEach(detail => {
          const isShootout = detail.shootout === true || 
                             (detail.type && (detail.type.text.toLowerCase().includes("shootout") || detail.type.text.toLowerCase().includes("penalty shootout")));
          const isGoal = detail.scoringPlay || (detail.type && detail.type.text.includes("Goal")) || detail.ownGoal;
          const isRed = detail.redCard || (detail.type && detail.type.text.includes("Red Card"));
          const athlete = detail.athletesInvolved && detail.athletesInvolved[0];
          const playerName = athlete ? athlete.displayName : "";
          const minute = detail.clock ? detail.clock.displayValue : "";
          
          if (playerName) {
            const teamId = detail.team && detail.team.id;
            const isHomeTeam = teamId === home.id || teamId === home.team.id;
            
            if (isGoal) {
              if (isShootout) {
                const scorerText = `${playerName}`;
                if (isHomeTeam) {
                  homeShootoutList.push(scorerText);
                } else {
                  awayShootoutList.push(scorerText);
                }
              } else {
                let suffix = "";
                if (detail.ownGoal || (detail.type && detail.type.text === "Own Goal")) {
                  suffix = " (OG)";
                } else if (detail.type && detail.type.text && detail.type.text.toLowerCase().includes("penalty")) {
                  suffix = " (Pen)";
                }
                const assister = detail.athletesInvolved && detail.athletesInvolved[1];
                const assistText = assister ? ` (A: ${assister.displayName})` : "";
                const goalInfo = `${minute}${suffix}${assistText}`;
                
                const targetMap = isHomeTeam ? homeScorersMap : awayScorersMap;
                if (!targetMap[playerName]) {
                  targetMap[playerName] = [];
                }
                targetMap[playerName].push(goalInfo);
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

      const compileScorersList = (scorersMap) => {
        const list = [];
        for (const [playerName, goals] of Object.entries(scorersMap)) {
          list.push(`${playerName} ${goals.join(', ')}`);
        }
        return list;
      };

      const homeScorersList = compileScorersList(homeScorersMap);
      const awayScorersList = compileScorersList(awayScorersMap);
      
      // Format lists to SQL array string format expected by app.js (clean quotes, no double escaping)
      const formatList = (list) => {
        if (list.length === 0) return "null";
        return `{"${list.join('","')}"}`;
      };
      
      const home_scorers = formatList(homeScorersList);
      const away_scorers = formatList(awayScorersList);
      const home_shootout_scorers = formatList(homeShootoutList);
      const away_shootout_scorers = formatList(awayShootoutList);
      const home_red_cards = formatList(homeRedCardsList);
      const away_red_cards = formatList(awayRedCardsList);
      
      // Map status
      const state = ev.status && ev.status.type && ev.status.type.state;
      const espnName = ev.status && ev.status.type && ev.status.type.name;
      const espnDesc = ev.status && ev.status.type && ev.status.type.description;
      
      let finished = state === 'post' ? 'TRUE' : 'FALSE';
      
      let time_elapsed = 'notstarted';
      if (espnName === 'STATUS_POSTPONED') {
        time_elapsed = 'postponed';
      } else if (espnName === 'STATUS_DELAYED') {
        time_elapsed = 'delayed';
      } else if (espnName === 'STATUS_SUSPENDED') {
        time_elapsed = 'suspended';
      } else if (espnName === 'STATUS_ABANDONED') {
        time_elapsed = 'abandoned';
      } else if (espnName === 'STATUS_CANCELED' || espnName === 'STATUS_CANCELLED') {
        time_elapsed = 'canceled';
      } else if (state === 'post') {
        time_elapsed = 'finished';
      } else if (state === 'in') {
        finished = 'FALSE';
        time_elapsed = ev.status.displayClock || 'live';

        if (espnName === 'STATUS_HALFTIME' || (espnDesc && espnDesc.toLowerCase() === 'halftime')) {
          time_elapsed = 'HT';
        } else if (espnName === 'STATUS_EXTRA_TIME' || espnName === 'STATUS_OVERTIME' || (espnDesc && (espnDesc.toLowerCase().includes('extra') || espnDesc.toLowerCase().includes('overtime')))) {
          time_elapsed = 'ET';
        } else if (espnName === 'STATUS_SHOOTOUT' || espnName === 'STATUS_FINAL_PEN' || (espnDesc && (espnDesc.toLowerCase().includes('shootout') || espnDesc.toLowerCase().includes('penalty')))) {
          time_elapsed = 'PEN';
        }
      }
      
      // Map status for frontend checks
      let status = 'TIMED';
      if (espnName === 'STATUS_POSTPONED') {
        status = 'POSTPONED';
      } else if (espnName === 'STATUS_DELAYED') {
        status = 'DELAYED';
      } else if (espnName === 'STATUS_SUSPENDED') {
        status = 'SUSPENDED';
      } else if (espnName === 'STATUS_ABANDONED') {
        status = 'ABANDONED';
      } else if (espnName === 'STATUS_CANCELED' || espnName === 'STATUS_CANCELLED') {
        status = 'CANCELED';
      } else if (state === 'post') {
        status = 'FINISHED';
      } else if (state === 'in') {
        if (espnName === 'STATUS_HALFTIME' || (espnDesc && espnDesc.toLowerCase() === 'halftime')) {
          status = 'PAUSED'; // HT
        } else if (espnName === 'STATUS_EXTRA_TIME' || espnName === 'STATUS_OVERTIME' || (espnDesc && (espnDesc.toLowerCase().includes('extra') || espnDesc.toLowerCase().includes('overtime')))) {
          status = 'EXTRA_TIME';
        } else if (espnName === 'STATUS_SHOOTOUT' || espnName === 'STATUS_FINAL_PEN' || (espnDesc && (espnDesc.toLowerCase().includes('shootout') || espnDesc.toLowerCase().includes('penalty')))) {
          status = 'PENALTY_SHOOTOUT';
        } else {
          status = 'IN_PLAY';
        }
      }
      
      // Map stadium_id
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
        home_shootout_scorers: home_shootout_scorers,
        away_shootout_scorers: away_shootout_scorers,
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
        period_desc: (ev.status.type && ev.status.type.description) || "",
        home_shootout_score: home.shootoutScore !== undefined ? String(home.shootoutScore) : null,
        away_shootout_score: away.shootoutScore !== undefined ? String(away.shootoutScore) : null,
        espn_status_name: (ev.status && ev.status.type && ev.status.type.name) || "",
        espn_status_detail: (ev.status && ev.status.type && ev.status.type.detail) || "",
        utc_kickoff: ev.date || null
      };
    }).filter(Boolean);

    // Mock Live Match mode support
    const urlParams = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const mockLive = urlParams.searchParams.get('mockLive') === 'true' || (req.query && req.query.mockLive === 'true');

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
        home_shootout_scorers: "null",
        away_shootout_scorers: "null",
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

    return res.status(200).json({ games: mappedGames });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
