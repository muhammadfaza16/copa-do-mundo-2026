# ESPN FIFA World Cup 2026 Public API Documentation

ESPN provides an unofficial, publicly accessible REST API that powers its own website and mobile apps. These endpoints do not require authentication (API keys) and return rich JSON data, making them excellent for personal projects or prototyping.

> [!WARNING]
> Since this API is undocumented and unofficial, ESPN does not guarantee its stability, uptime, or backward compatibility. It can change or be restricted at any time. Please implement proper error handling and caching to avoid flooding their servers.

---

## 1. Authentication & Headers

* **Authentication**: None required.
* **HTTP Method**: All requests are `GET`.
* **Recommended Headers**:
  ```http
  Accept: application/json
  User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
  ```

---

## 2. API Endpoints

### A. Scoreboard & Fixtures (Jadwal & Live Score)

Retrieves all matches for a specific day or date range, including live scores, match clocks, venue details, and key highlights.

* **URL**: `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`
* **Query Parameters**:
  * `dates` (optional): Filter matches by date in `YYYYMMDD` format or date ranges in `YYYYMMDD-YYYYMMDD` format.
    * Example: `?dates=20260616` (Matches on June 16, 2026)
    * Example: `?dates=20260611-20260719` (All matches for the entire 2026 World Cup)
  * `limit` (optional): Max number of matches to return (default is 100).
* **Sample Response Structure**:
  ```json
  {
    "leagues": [ ... ],
    "season": { "type": 13802, "year": 2026 },
    "events": [
      {
        "id": "760427",
        "date": "2026-06-16T01:00Z",
        "name": "New Zealand at Iran",
        "shortName": "NZL @ IRN",
        "status": {
          "clock": 2700,
          "displayClock": "45'+3'",
          "period": 1,
          "type": { "state": "in", "description": "First Half", "detail": "45'+3'" }
        },
        "competitions": [
          {
            "id": "760427",
            "venue": { "fullName": "SoFi Stadium", "address": { "city": "Inglewood", "country": "USA" } },
            "competitors": [
              { "id": "469", "homeAway": "home", "score": "1", "team": { "displayName": "Iran", "logo": "url" } },
              { "id": "2666", "homeAway": "away", "score": "1", "team": { "displayName": "New Zealand", "logo": "url" } }
            ],
            "details": [
              { "type": { "text": "Goal" }, "clock": { "displayValue": "7'" }, "team": { "id": "2666" }, "athletesInvolved": [ { "displayName": "Elijah Just" } ] }
            ]
          }
        ]
      }
    ]
  }
  ```

---

### B. Match Detail & Live Stats (Detail Laga & Statistik)

Retrieves extensive details for a specific match, including team box scores, player statistics, team lineups (roster), real-time textual commentary, and a detailed timeline of events.

* **URL**: `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary`
* **Query Parameters**:
  * `event` (required): The unique match/event ID (retrieved from the Scoreboard endpoint).
    * Example: `?event=760427`
* **Key JSON Keys Returned**:
  * `header`: General match meta (score, status, time, team logos).
  * `boxscore`: Comprehensive match statistics (shots, possession %, passes, saves, cards, fouls).
  * `rosters`: Starting XI lineups, formations, and bench players for both teams.
  * `keyEvents`: Chronological list of goals, substitutions, and bookings.
  * `commentary`: Play-by-play text updates of the match.
  * `standings`: Current group standing details relative to the playing teams.

---

### C. Group Standings (Klasemen Grup)

Retrieves the standing tables for all 12 groups (Groups A to L) in World Cup 2026.

* **URL**: `https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings`
* **Query Parameters**: None required.
* **Sample Response Structure**:
  ```json
  {
    "name": "FIFA World Cup",
    "children": [
      {
        "id": "1",
        "name": "Group A",
        "standings": {
          "entries": [
            {
              "team": { "id": "164", "displayName": "Mexico" },
              "stats": [
                { "name": "wins", "value": 1, "displayValue": "1" },
                { "name": "losses", "value": 0, "displayValue": "0" },
                { "name": "points", "value": 3, "displayValue": "3" }
              ]
            }
          ]
        }
      }
    ]
  }
  ```

---

## 3. JavaScript Integration Examples

Here are basic examples of fetching these endpoints in a Node.js / JavaScript project.

### Fetching World Cup Matches for Today
```javascript
async function getTodaysMatches() {
  try {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    const data = await response.json();
    
    data.events.forEach(match => {
      const home = match.competitions[0].competitors.find(c => c.homeAway === 'home');
      const away = match.competitions[0].competitors.find(c => c.homeAway === 'away');
      console.log(`${home.team.displayName} vs ${away.team.displayName} | Status: ${match.status.type.detail} | Score: ${home.score} - ${away.score}`);
    });
  } catch (error) {
    console.error('Failed to fetch scoreboard:', error);
  }
}
```

### Fetching Live Commentary & Match Stats
```javascript
async function getMatchDetails(matchId) {
  try {
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${matchId}`);
    const data = await response.json();
    
    // Lineup / Rosters
    console.log('Lineups:', data.rosters);
    // Live textual commentary
    console.log('Latest Commentary:', data.commentary?.[0]?.text);
  } catch (error) {
    console.error('Failed to fetch match details:', error);
  }
}
```

---

## 4. Best Practices for Developers

1. **Caching**: Always cache responses on your server. Do not request the scoreboard endpoint more than once every 15-30 seconds during active live matches, and cache standings/completed match details for a few hours.
2. **Robust Fallbacks**: Ensure your application handles potential network errors, unexpected empty JSON responses, or changed JSON structures gracefully without crashing the frontend.
3. **Avoid Commercial Production**: Because this API is undocumented, do not use it for critical paid/commercial services where uptime guarantees are required. For production apps, use premium services like **API-Football** or **Sportmonks**.
