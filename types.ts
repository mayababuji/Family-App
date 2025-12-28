
export type TaskStatus = 'TODO' | 'DONE';
export type TravelStatus = 'NOT_PLANNED' | 'PLANNED' | 'DONE';

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  points: number;
}

export interface Chore {
  id: string;
  title: string;
  description: string;
  points: number;
  assignedToId: string;
  status: TaskStatus;
  category: 'CLEANING' | 'COOKING' | 'HOMEWORK' | 'BAKING' | 'TEACHING' | 'OTHER';
}

export interface TravelTarget {
  id: string;
  location: string;
  status: TravelStatus;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  description: string;
  icon: string;
}

export interface GrievanceComment {
  id: string;
  fromId: string;
  content: string;
  timestamp: number;
}

export interface Grievance {
  id: string;
  fromId: string;
  againstId?: string; // Specific member the concern is about
  title: string;
  content: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  timestamp: number;
  isResolved: boolean;
  comments: GrievanceComment[];
}

export interface KingdomReport {
  summary: string;
  heroOfTheWeek: string;
  efficiencyScore: number;
  encouragingNudge: string;
  royalMediation?: string;
  emotionalClimate: 'SUNNY' | 'BREEZY' | 'OVERCAST' | 'STORMY' | 'STARRY';
  socialInsight: string;
}

export interface FeedbackEntry {
  id: string;
  fromId: string;
  toId: string;
  type: 'PRAISE' | 'HELP' | 'TIP';
  content: string;
  timestamp: string;
}
