export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
}

export interface BusinessHours {
  start: string; 
  end: string;   
  enabled: boolean;
}

export interface AppSettings {
  storagePath: string;
  workingDays: Record<number, BusinessHours>; 
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; 
  status: TaskStatus;
  estimatedHours: number;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  realDurationMinutes?: number;
  progressNotes?: string;
}
