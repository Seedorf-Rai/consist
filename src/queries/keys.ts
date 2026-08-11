// Central query-key factory. Keeping these in one place means every hook
// and every invalidation call agrees on shape — no risk of stale cache

import { TaskHistoryParams } from "../types";

// entries because two files spelled a key slightly differently.
export const qk = {
  me: () => ["me"] as const,

  groups: {
    mine: () => ["groups", "mine"] as const,
    detail: (groupId: string) => ["groups", groupId, "detail"] as const,
    members: (groupId: string) => ["groups", groupId, "members"] as const,
    today: (groupId: string) => ["groups", groupId, "today"] as const,
  },

  tasks: {
    mine: (groupId: string, day?: string) => ["tasks", groupId, "mine", day ?? "today"] as const,
    pendingValidations: (groupId: string) => ["tasks", groupId, "pending-validations"] as const,
    screenshot: (taskId: string) => ["tasks", taskId, "screenshot"] as const,
    history: (groupId: string, params: TaskHistoryParams) =>
      ["tasks", groupId, "history", params.startDate ?? null, params.endDate ?? null, params.page ?? 1, params.pageSize ?? 20] as const,
  },

  balances: {
    mine: (groupId: string) => ["balances", groupId, "mine"] as const,
    log: (groupId: string) => ["balances", groupId, "log"] as const,
  },
};
