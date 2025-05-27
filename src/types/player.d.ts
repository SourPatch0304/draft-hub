// src/types/player.ts

/**  
 * Core bio/profile information for each prospect  
 * (from rawData.bio) :contentReference[oaicite:0]{index=0}  
 */
// src/types/player.ts

export interface Bio {
  playerId: number;
  name: string;
  firstName: string;
  lastName: string;
  birthDate: string;         // YYYY-MM-DD
  height: number;            // inches
  weight: number;            // pounds
  highSchool: string | null;
  highSchoolState: string | null;
  homeTown: string;
  homeState: string | null;
  homeCountry: string;
  nationality: string;
  photoUrl: string | null;
  currentTeam: string;
  league: string;
  leagueType: string;
}

  
  /**  
   * One scout’s ranking list for a player  
   * Keys are scout names (e.g. "Sam Vecenie") with a numeric rank  
   */
  export interface ScoutRanking {
    playerId: number;
    [scoutName: string]: number | undefined;
  }
  
  /**  
   * Combine-measurement data from the draft combine or pro day  
   * (from rawData.measurements) :contentReference[oaicite:1]{index=1}  
   */
  export interface Measurement {
    playerId: number;
    heightNoShoes: number | null;
    heightShoes: number | null;
    wingspan: number | null;
    reach: number | null;
    maxVertical: number | null;
    noStepVertical: number | null;
    weight: number | null;
    bodyFat: number | null;
    handLength: number | null;
    handWidth: number | null;
    agility: number | null;      // lane agility time
    sprint: number | null;       // 3/4-court sprint
    shuttleLeft: number | null;  // left-hand shuttle
    shuttleRight: number | null; // right-hand shuttle
    shuttleBest: number | null;  // best of the two
  }
  
  
  /**  
   * Per-game log entries  
   * (from rawData.game_logs) :contentReference[oaicite:2]{index=2}  
   */
  export interface GameLog {
    playerId: number;
    gameId: number;
    season: number;
    league: string;
    date: string;               // ISO timestamp
    team: string;
    teamId: number;
    opponentId: number;
    isHome: number | null;      // 1 = home, 0 = away, null = unknown
    opponent: string;
    homeTeamPts: number;
    visitorTeamPts: number;
    gp: number;                 // minutes played (decimal)
    gs: number;                 // games started flag
    timePlayed: string;         // "MM:SS"
    fgm: number;
    fga: number;
    "fg%": number | null;
    tpm: number;
    tpa: number;
    "tp%": number | null;
    ftm: number;
    fta: number;
    "ft%": number | null;
    oreb: number;
    dreb: number;
    reb: number;
    ast: number;
    stl: number;
    blk: number;
    tov: number;
    pf: number;
    pts: number;
    plusMinus: number;
    rn: number;                 // rotation number or lineup sequence
  }
  
  /**  
   * The merged “global” player object, ready for use throughout your app  
   */
  export interface Player {
    playerId: number;
    bio: Bio;
    scoutRanking?: ScoutRanking;
    measurement?: Measurement;
    gameLogs: GameLog[];
  }
  