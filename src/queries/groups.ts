import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { qk } from "./keys";

export function useMyGroups() {
  return useQuery({
    queryKey: qk.groups.mine(),
    queryFn: api.groups.mine,
  });
}

export function useGroupDetail(groupId: string) {
  return useQuery({
    queryKey: qk.groups.detail(groupId),
    queryFn: () => api.groups.detail(groupId),
    enabled: !!groupId,
  });
}

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: qk.groups.members(groupId),
    queryFn: () => api.groups.members(groupId),
    enabled: !!groupId,
  });
}

export function useTodayBoard(groupId: string) {
  return useQuery({
    queryKey: qk.groups.today(groupId),
    queryFn: () => api.groups.today(groupId),
    enabled: !!groupId,
  });
}

/** Convenience: the three calls GroupHomeScreen needs, fired in parallel. */
export function useGroupHome(groupId: string) {
  const detail = useGroupDetail(groupId);
  const members = useGroupMembers(groupId);
  const board = useTodayBoard(groupId);
  return {
    detail,
    members,
    board,
    isLoading: detail.isLoading || members.isLoading || board.isLoading,
    error: detail.error || members.error || board.error,
    refetchAll: () => Promise.all([detail.refetch(), members.refetch(), board.refetch()]),
  };
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, password, dailyStake }: { name: string; password: string; dailyStake: number }) =>
      api.groups.create(name, password, dailyStake),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.groups.mine() }),
  });
}

export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, password }: { name: string; password: string }) =>
      api.groups.join(encodeURIComponent(name), name, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.groups.mine() }),
  });
}

export function useLeaveGroup(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.groups.leave(groupId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.groups.mine() }),
  });
}

export function useDeleteGroup(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.groups.delete(groupId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.groups.mine() }),
  });
}

export function useSetStake(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dailyStake: number) => api.groups.setStake(groupId, dailyStake),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.groups.detail(groupId) }),
  });
}

export function useKickMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.groups.kick(groupId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.groups.members(groupId) }),
  });
}

export function useResolveDay(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date?: string) => api.groups.resolveDay(groupId, date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.groups.detail(groupId) });
      qc.invalidateQueries({ queryKey: qk.groups.today(groupId) });
      qc.invalidateQueries({ queryKey: qk.groups.members(groupId) });
      qc.invalidateQueries({ queryKey: qk.groups.mine() });
    },
  });
}
