export interface Client {
  id: number;
  user_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
}