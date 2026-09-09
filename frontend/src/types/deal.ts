export type DealStatus =
  | "lead"
  | "in_progress"
  | "won"
  | "lost";

export interface Deal {
  id: number;
  user_id: number;
  client_id: number;
  title: string;
  value: number | null;
  status: DealStatus;
  client_name: string;
}

export interface DealCreate {
  title: string;
  value: number | null;
  status: DealStatus;
  client_id: number;
}

