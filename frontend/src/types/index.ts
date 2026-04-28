export interface RiotCachedProfile {
  tier: string | null;
  rank: string | null;
  leaguePoints: number | null;
  rankedWins: number | null;
  rankedLosses: number | null;
  summonerLevel: number | null;
  profileIconId: number | null;
  hotStreak: boolean;
  lastUpdated: string | null;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  mmr: number;
  rank: string;
  wins?: number;
  losses?: number;
  winRate?: number;
  winStreak?: number;
  totalMatches?: number;
  createdAt: string;
  updatedAt: string;
  riotGameName?: string | null;
  riotTagLine?: string | null;
  riotPuuid?: string | null;
  riotPlatform?: string | null;
  riotCachedProfile?: RiotCachedProfile | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthStatus {
  isLoggedIn: boolean;
  userRole: string | null;
}

export interface Lobby {
  _id: string;
  name: string;
  description: string;
  game: string;
  maxParticipants: number;
  currentParticipants: number;
  registrationDeadline: string;
  matchDateTime: string;
  status: "open" | "pending" | "in_progress" | "completed" | "cancelled";
  createdBy: string | User;
  participants: string[];
  prizePool?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LobbyListResponse {
  lobbies: Lobby[];
}

export interface MmrChange {
  before: number;
  after: number;
  change: number;
}

export interface MatchPlayer {
  username: string;
  odOld: number;
  mmrChange: MmrChange;
  newRank: string;
}

export interface MatchResult {
  winner: MatchPlayer;
  loser: MatchPlayer;
  lobby: string;
  replayUrl: string;
}

export interface MatchResultResponse {
  message: string;
  result: MatchResult;
}

export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
}

// ─── Riot Games ────────────────────────────────────────────────────────────────

export type RiotPlatform =
  | 'na1' | 'na2' | 'br1' | 'la1' | 'la2'
  | 'euw1' | 'eun1' | 'tr1' | 'ru'
  | 'kr' | 'jp1'
  | 'oc1' | 'ph2' | 'sg2' | 'th2' | 'tw2' | 'vn2';

export type ValPlatform = 'na' | 'eu' | 'ap' | 'kr' | 'br' | 'latam';

export interface RiotAccount {
  gameName: string;
  tagLine: string;
  puuid: string;
  platform: RiotPlatform;
}

export interface RiotRankedEntry {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  hotStreak: boolean;
  freshBlood: boolean;
}

export interface RiotChampionMastery {
  championId: number;
  championLevel: number;
  championPoints: number;
}

export interface RiotSummoner {
  id: string;
  puuid: string;
  name: string;
  profileIconId: number;
  summonerLevel: number;
}

export interface RiotFullProfile {
  account: RiotAccount;
  summoner: RiotSummoner;
  rankedSolo: RiotRankedEntry | null;
  rankedFlex: RiotRankedEntry | null;
  topChampions: RiotChampionMastery[];
}

export interface RiotMatchResultResponse {
  success: boolean;
  message: string;
  winner: {
    username: string;
    mmrBefore: number;
    mmrChange: number;
    mmrAfter: number;
    newRank: string;
    wins: number;
    losses: number;
    winRate: number;
    winStreak: number;
  };
  loser: {
    username: string;
    mmrBefore: number;
    mmrChange: number;
    mmrAfter: number;
    newRank: string;
    wins: number;
    losses: number;
    winRate: number;
    winStreak: number;
  };
}
