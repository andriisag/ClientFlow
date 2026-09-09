export type TaskStatus =
  | "pending"
  | "completed";

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
}

export interface TaskCreate {
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
}

