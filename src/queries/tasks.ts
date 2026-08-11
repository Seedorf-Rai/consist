import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { qk } from "./keys";
import { TaskHistoryParams } from "../types";

export function useMyTasks(groupId: string, day?: string) {
  return useQuery({
    queryKey: qk.tasks.mine(groupId, day),
    queryFn: () => api.tasks.myTasks(groupId, day),
    enabled: !!groupId,
  });
}

export function usePendingValidations(groupId: string) {
  return useQuery({
    queryKey: qk.tasks.pendingValidations(groupId),
    queryFn: () => api.tasks.pendingValidations(groupId),
    enabled: !!groupId,
  });
}

/** Evidence links are short-lived signed URLs — worth a short staleTime so
 *  re-renders don't keep re-fetching, but not cached indefinitely. */
export function useScreenshotUrl(taskId: string, enabled: boolean) {
  return useQuery({
    queryKey: qk.tasks.screenshot(taskId),
    queryFn: () => api.tasks.screenshotUrl(taskId),
    enabled: enabled && !!taskId,
    staleTime: 60_000,
    retry: false,
  });
}

export function useCreateTask(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => api.tasks.create(groupId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks.mine(groupId) }),
  });
}

export function useSubmitTask(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, file, description }: { taskId: string; file: File; description: string }) =>
      api.tasks.submit(taskId, file, description),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tasks.mine(groupId) }),
  });
}

export function useValidateTask(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, decision }: { taskId: string; decision: "approve" | "reject" }) =>
      api.tasks.validate(taskId, decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.tasks.pendingValidations(groupId) });
      qc.invalidateQueries({ queryKey: qk.groups.today(groupId) });
    },
  });
}

export function useMyTaskHistory(groupId: string, params: TaskHistoryParams) {
  return useQuery({
    queryKey: qk.tasks.history(groupId, params),
    queryFn: () => api.tasks.myHistory(groupId, params),
    enabled: !!groupId,
    placeholderData: (prev) => prev, // keep old page visible while next page loads
  });
}