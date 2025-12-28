
import { FamilyMember, Chore, Reward, TravelTarget } from './types';

export const INITIAL_MEMBERS: FamilyMember[] = [
  { id: '1', name: 'Dad', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', role: 'Quest Master', points: 0 },
  { id: '2', name: 'Mom', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anya', role: 'Guardian of Schedule', points: 0 },
  { id: '3', name: 'Leo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo', role: 'Dino Knight', points: 0 },
  { id: '4', name: 'Maya', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya', role: 'Astro Scout', points: 0 },
];

export const INITIAL_CHORES: Chore[] = [
  { id: 'c1', title: 'Whole House Cleaning', description: 'Vacuum the carpets and dust the shelves.', points: 50, assignedToId: '', status: 'TODO', category: 'CLEANING' },
  { id: 'c2', title: 'Friday Dinner Cooking', description: 'Prepare pasta and salad for the family.', points: 40, assignedToId: '', status: 'TODO', category: 'COOKING' },
  { id: 'c3', title: 'Math & Science Homework', description: 'Complete all assignments for Monday.', points: 60, assignedToId: '', status: 'TODO', category: 'HOMEWORK' },
  { id: 'c4', title: 'Sunday Baking Session', description: 'Bake a fresh batch of chocolate chip cookies.', points: 30, assignedToId: '', status: 'DONE', category: 'BAKING' },
  { id: 'c5', title: 'Reading Teaching', description: 'Help Leo with his reading practice for 30 mins.', points: 45, assignedToId: '', status: 'TODO', category: 'TEACHING' },
];

export const INITIAL_TRAVEL_TARGETS: TravelTarget[] = [
  { id: 't1', location: 'Montreal', status: 'NOT_PLANNED' },
  { id: 't2', location: 'Quebec', status: 'NOT_PLANNED' },
  { id: 't3', location: 'Ottawa', status: 'NOT_PLANNED' },
  { id: 't4', location: 'Kingston', status: 'NOT_PLANNED' },
  { id: 't5', location: 'Sudbury', status: 'NOT_PLANNED' },
];

export const INITIAL_REWARDS: Reward[] = [
  { id: 'r1', title: 'Extra Gaming Time', cost: 100, description: '30 minutes of extra screen time.', icon: '🎮' },
  { id: 'r2', title: 'Pick Dinner Tonight', cost: 150, description: 'You choose the restaurant or meal!', icon: '🍕' },
  { id: 'r3', title: 'No Chores Day', cost: 500, description: 'A full day off from all assigned tasks.', icon: '🏖️' },
  { id: 'r4', title: 'New Toy/Book', cost: 1000, description: 'A special surprise from the store.', icon: '🎁' },
];

export const CATEGORY_ICONS = {
  CLEANING: '🧹',
  COOKING: '🍳',
  HOMEWORK: '📚',
  BAKING: '🧁',
  TEACHING: '👨‍🏫',
  OTHER: '✨'
};

export const TRAVEL_STATUS_STYLES = {
  NOT_PLANNED: { label: 'Not yet planned', color: 'bg-slate-100 text-slate-500 border-slate-200' },
  PLANNED: { label: 'Planned', color: 'bg-blue-100 text-blue-600 border-blue-200' },
  DONE: { label: 'Done', color: 'bg-green-100 text-green-600 border-green-200' },
};

export const GRIEVANCE_SEVERITY = {
  MILD: { label: 'Small Tiff', color: 'bg-blue-100 text-blue-700', icon: '☁️' },
  MODERATE: { label: 'Dispute', color: 'bg-amber-100 text-amber-700', icon: '⛈️' },
  SEVERE: { label: 'Serious Concern', color: 'bg-rose-100 text-rose-700', icon: '🔥' },
};

export const FEEDBACK_CATEGORIES = {
  PRAISE: { icon: '👏', label: 'Praise', color: 'bg-green-100 text-green-700 border-green-200' },
  HELP: { icon: '🤝', label: 'Helping Hand', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  TIP: { icon: '💡', label: 'Pro Tip', color: 'bg-amber-100 text-amber-700 border-amber-200' },
};
