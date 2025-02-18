import { StackNavigationProp } from "@react-navigation/stack";

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ResetPassword: undefined;
  ProfileSetup: undefined;
};

export type AuthScreenNavigationProp<T extends keyof AuthStackParamList> = StackNavigationProp<AuthStackParamList, T>;
export type AppStackParamList = {
  Home: undefined;
  Plan: undefined;  // ✅ Ensure Plan is included
  Dashboard: undefined;
  Settings: undefined;
};

export interface DayCollectionBASE {
  id: string;
  created_at: Date;
  user_id: string;
  date: Date;
  completed: boolean;
}

export interface QuadrantBASE {
  id: string;
  created_at: Date;
  category: string;
  date: Date;
  DayCollection_id: string;
}

export interface Task {
  id: string;
  created_at: Date;
  Quadrant: string;
  completed: boolean;
  name: string;
}

export interface Retrospective {
  id: string;
  created_at: Date;
  DayCollection_id: string;
  Accomplishment: number;
  Intentional: number;
  TookCareOfWork: number;
  Relationship: number;
  PhysicalHealth: number;
  Emotional: number;
  GoodDay: number;
}

export interface DayCollection {
  id: string;
  created_at: Date;
  user_id: string;
  date: Date;
  completed: boolean;
  quadrants: Quadrant[];
  retrospective: Retrospective;
}

export interface Quadrant {
  id: string;
  created_at: Date;
  category: string;
  date: Date;
  DayCollection_id: string;
  Task: Task[];
}
