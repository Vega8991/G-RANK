export interface User {
  _id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  mmr: number;
  rank: string;
  createdAt: string;
  updatedAt: string;
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
  prizePool?: number;
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
