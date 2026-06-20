export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { event } = req.query;
  if (!event) {
    return res.status(400).json({ error: 'Missing event query parameter' });
  }

  if (event === 'mock_1') {
    return res.status(200).json({
      info: {
        attendance: 65432,
        referee: 'Ivan Barton',
        venueName: 'Estadio Azteca',
        venueCity: 'Mexico City'
      },
      stats: {
        home: {
          possessionPct: '54',
          totalShots: '14',
          shotsOnTarget: '6',
          accuratePasses: '390',
          foulsCommitted: '11',
          wonCorners: '5',
          saves: '2',
          redCards: '1'
        },
        away: {
          possessionPct: '46',
          totalShots: '9',
          shotsOnTarget: '3',
          accuratePasses: '310',
          foulsCommitted: '14',
          wonCorners: '3',
          saves: '4',
          redCards: '0'
        }
      },
      lineups: {
        home: {
          formation: '4-3-3',
          coach: 'Jaime Lozano',
          teamColor: '#006341',
          alternateColor: '#ffffff',
          uniformColor: '#006341',
          uniformType: 'home',
          starters: [
            { name: 'G. Ochoa', jersey: '13', position: 'GK' },
            { name: 'J. Sanchez', jersey: '19', position: 'RB' },
            { name: 'C. Montes', jersey: '3', position: 'CB' },
            { name: 'J. Vasquez', jersey: '5', position: 'CB' },
            { name: 'J. Gallardo', jersey: '23', position: 'LB' },
            { name: 'E. Alvarez', jersey: '4', position: 'DM' },
            { name: 'L. Chavez', jersey: '18', position: 'CM' },
            { name: 'E. Sanchez', jersey: '14', position: 'CM' },
            { name: 'U. Antuna', jersey: '15', position: 'RW' },
            { name: 'S. Gimenez', jersey: '11', position: 'ST' },
            { name: 'H. Lozano', jersey: '22', position: 'LW' }
          ]
        },
        away: {
          formation: '4-4-2',
          coach: 'Hugo Broos',
          teamColor: '#ffcd00',
          alternateColor: '#007a4d',
          uniformColor: '#ffcd00',
          uniformType: 'home',
          starters: [
            { name: 'R. Williams', jersey: '1', position: 'GK' },
            { name: 'K. Mudau', jersey: '2', position: 'RB' },
            { name: 'M. Mvala', jersey: '3', position: 'CB' },
            { name: 'S. Xulu', jersey: '5', position: 'CB' },
            { name: 'A. Modiba', jersey: '6', position: 'LB' },
            { name: 'T. Mokoena', jersey: '4', position: 'CM' },
            { name: 'S. Sithole', jersey: '13', position: 'CM' },
            { name: 'T. Morena', jersey: '11', position: 'RM' },
            { name: 'P. Tau', jersey: '10', position: 'LM' },
            { name: 'E. Makgopa', jersey: '9', position: 'ST' },
            { name: 'T. Zwane', jersey: '18', position: 'CF' }
          ]
        }
      },
      commentary: []
    });
  }

  try {
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${event}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `ESPN API error (Status: ${response.status})` });
    }

    const data = await response.json();

    // 1. Process stats
    const stats = { home: {}, away: {} };
    if (data.boxscore && data.boxscore.teams) {
      const teams = data.boxscore.teams;
      const homeTeam = teams.find(t => t.homeAway === 'home');
      const awayTeam = teams.find(t => t.homeAway === 'away');
      
      const extractStats = (team) => {
        if (!team || !team.statistics) return {};
        const s = {};
        team.statistics.forEach(item => {
          s[item.name] = item.displayValue;
        });
        return s;
      };
      
      stats.home = extractStats(homeTeam);
      stats.away = extractStats(awayTeam);
    }

    // 2. Process lineups
    const lineups = { home: { formation: '', starters: [], bench: [], coach: null, teamColor: null, alternateColor: null, uniformColor: null, uniformType: null }, away: { formation: '', starters: [], bench: [], coach: null, teamColor: null, alternateColor: null, uniformColor: null, uniformType: null } };
    if (data.rosters && Array.isArray(data.rosters)) {
      const homeRoster = data.rosters.find(r => r.homeAway === 'home');
      const awayRoster = data.rosters.find(r => r.homeAway === 'away');
      
      const mapRoster = (teamRoster) => {
        if (!teamRoster) return { formation: '', starters: [], bench: [], coach: null, teamColor: null, alternateColor: null, uniformColor: null, uniformType: null };
        const formation = teamRoster.formation || '';
        const rosterList = teamRoster.roster || [];
        const coach = teamRoster.coach?.displayName || 
                      teamRoster.coach?.name || 
                      (teamRoster.coaches && teamRoster.coaches[0]?.displayName) || 
                      (teamRoster.coaches && teamRoster.coaches[0]?.name) || 
                      null;
        
        const teamColor = teamRoster.team?.color ? `#${teamRoster.team.color}` : null;
        const alternateColor = teamRoster.team?.alternateColor ? `#${teamRoster.team.alternateColor}` : null;
        const uniformColor = teamRoster.uniform?.color ? `#${teamRoster.uniform.color}` : null;
        const uniformType = teamRoster.uniform?.type || null;
        
        const mapPlayer = (p) => ({
          name: p.athlete?.displayName || '',
          jersey: p.jersey || '',
          position: p.position ? (p.position.abbreviation || p.position.name || '') : '',
          subbedIn: p.subbedIn === true,
          subbedOut: p.subbedOut === true,
          subbedMinute: p.subOn?.displayValue || p.subOff?.displayValue || ''
        });

        const starters = rosterList.filter(p => p.starter).map(mapPlayer);
        const bench = rosterList.filter(p => !p.starter).map(mapPlayer);
        
        return { formation, starters, bench, coach, teamColor, alternateColor, uniformColor, uniformType };
      };
      
      lineups.home = mapRoster(homeRoster);
      lineups.away = mapRoster(awayRoster);
    }

    // 3. Process commentary
    const commentary = [];
    if (data.commentary && Array.isArray(data.commentary)) {
      data.commentary.forEach(item => {
        commentary.push({
          text: item.text,
          time: item.time ? item.time.displayValue : ''
        });
      });
    }

    // 4. Process game metadata info
    const attendance = data.gameInfo?.attendance || null;
    const referee = data.gameInfo?.officials?.find(o => o.position?.name === 'Referee' || o.position?.name?.toLowerCase().includes('referee'))?.displayName || null;
    const venueName = data.gameInfo?.venue?.fullName || null;
    const venueCity = data.gameInfo?.venue?.address?.city || null;
    const info = { attendance, referee, venueName, venueCity };

    return res.status(200).json({
      stats,
      lineups,
      commentary,
      info
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
