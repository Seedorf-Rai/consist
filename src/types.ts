export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Streak {
  current: number;
  longest: number;
}

export interface MyGroupSummary {
  id: string;
  name: string;
  member_count: number;
  daily_stake: number;
  current_day: number;
  is_admin: boolean;
  my_streak: Streak;
  my_balance: number;
}

export interface GroupDetail {
  id: string;
  name: string;
  admin: { id: string; name: string };
  daily_stake: number;
  current_day: number;
  today: string;
  resolved_today: boolean;
}

export interface MemberSummary {
  user_id: string;
  name: string;
  role: "admin" | "member";
  streak: Streak;
}

export type BoardStatus =
  | "not_started"
  | "in_progress"
  | "awaiting_validation"
  | "approved"
  | "rejected";

export interface TodayBoard {
  date: string;
  board: { user_id: string; name: string; status: BoardStatus }[];
}

export type TaskStatus = "draft" | "submitted" | "approved" | "rejected";
export type ValidationDecision = "pending" | "approved" | "rejected";

export interface TaskValidationEntry {
  validator_user_id: string;
  decision: ValidationDecision;
  decided_at: string | null;
}

export interface Task {
  id: string;
  group_id: string;
  user_id: string;
  date: string;
  title: string;
  status: TaskStatus;
  submission: {
    screenshot_url: string;
    description: string;
    submitted_at: string;
  } | null;
  validations: TaskValidationEntry[];
}

export interface PendingValidation {
  validation_id: string;
  task_id: string;
  title: string;
  owner: { id: string; name: string };
  evidence: { screenshot_url: string; description: string } | null;
}

export interface BalanceSummary {
  balance: number;
  owed_to_me: number;
  i_owe: number;
}

export interface BalanceLogEntry {
  id: string;
  date: string;
  direction: "owed_to_me" | "i_owe";
  counterparty: string;
  amount: number;
  reason: string;
  redeemed: boolean;
  redeemed_at: string | null;
}

export interface ResolutionResult {
  date: string;
  results: { user_id: string; day_success: boolean; streak_after: number }[];
  balance_logs_created: number;
}

export interface ApiErrorBody {
  error: string;
}

export interface SignupResponse {
  message: string;
  email: string;
}

export interface OtpMessageResponse {
  message: string;
}
