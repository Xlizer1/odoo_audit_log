export interface OdooLog {
  id: number;
  dbId: number;
  resId: number | null;
  date: string;
  time: string;
  model: string;
  record: string;
  author: string;
  body: string;
  type: string;
  details?: string;
}

export interface DashboardStats {
  ping: number;
  velocity: number;
  leaderboard: { name: string; count: number }[];
}

export interface ModelConfig {
  label: string;
  color: string;
  fetchDetails: boolean;
}
