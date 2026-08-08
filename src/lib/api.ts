import { http } from "./http";
import type {
  AuthResponse,
  BalanceLogEntry,
  BalanceSummary,
  GroupDetail,
  MemberSummary,
  MyGroupSummary,
  PendingValidation,
  ResolutionResult,
  Task,
  TodayBoard,
  User,
} from "../types";

/* ---------------- Auth ---------------- */

export const api = {
  auth: {
    signup: (name: string, email: string, password: string) =>
      http.post<AuthResponse>("/auth/signup", { name, email, password }, false),
    login: (email: string, password: string) =>
      http.post<AuthResponse>("/auth/login", { email, password }, false),
    logout: () => http.post<void>("/auth/logout"),
    me: () => http.get<User>("/me"),
  },

  groups: {
    create: (name: string, password: string, daily_stake: number) =>
      http.post<{ id: string; name: string; daily_stake: number }>("/groups", {
        name,
        password,
        daily_stake,
      }),
    join: (id: string, name: string, password: string) =>
      http.post<{ id: string; name: string }>(`/groups/join`, { name, password }),
    leave: (id: string) => http.post<void>(`/groups/${id}/leave`),
    delete: (id: string) => http.del<void>(`/groups/${id}`),
    setStake: (id: string, daily_stake: number) =>
      http.patch<{ id: string; daily_stake: number }>(`/groups/${id}/stake`, { daily_stake }),
    kick: (id: string, userId: string) => http.post<void>(`/groups/${id}/kick/${userId}`),
    resolveDay: (id: string, date?: string) =>
      http.post<ResolutionResult>(`/groups/${id}/resolve-day`, date ? { date } : undefined),
    mine: () => http.get<MyGroupSummary[]>("/me/groups"),
    detail: (id: string) => http.get<GroupDetail>(`/groups/${id}`),
    members: (id: string) => http.get<MemberSummary[]>(`/groups/${id}/members`),
    today: (id: string) => http.get<TodayBoard>(`/groups/${id}/today`),
  },

  tasks: {
    
    create: (groupId: string, title: string) => http.post<Task>(`/groups/${groupId}/tasks`, { title }),
    myTasks: (groupId: string, day?: string) =>
      http.get<Task[]>(`/groups/${groupId}/tasks/me`, day ? { day } : undefined),
    tasksFor: (groupId: string, userId: string, day?: string) =>
      http.get<Task[]>(`/groups/${groupId}/tasks/${userId}`, day ? { day } : undefined),
    get: (taskId: string) => http.get<Task>(`/tasks/${taskId}`),
    submit: (taskId: string, screenshot_url: string, description: string) =>
      http.post<Task>(`/tasks/${taskId}/submit`, { screenshot_url, description }),
    validate: (taskId: string, decision: "approve" | "reject") =>
      http.post<Task>(`/tasks/${taskId}/validate`, { decision }),
    pendingValidations: (groupId: string) =>
      http.get<PendingValidation[]>(`/groups/${groupId}/validations/pending`),
  },

  balances: {
    mine: (groupId: string) => http.get<BalanceSummary>(`/groups/${groupId}/balances/me`),
    log: (groupId: string, userId = "me") =>
      http.get<BalanceLogEntry[]>(`/groups/${groupId}/balance-log`, { user_id: userId }),
    redeem: (logId: string) => http.post<BalanceLogEntry>(`/balance-log/${logId}/redeem`),
  },
};

export { ApiError } from "./http";
export { getToken, setToken } from "./http";
