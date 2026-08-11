import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { qk } from "./keys";

export function useUnseenAnnouncements(enabled: boolean) {
  return useQuery({
    queryKey: qk.announcements.unseen(),
    queryFn: api.announcements.unseen,
    enabled,
    staleTime: 60_000,
  });
}

export function useAnnouncements(page: number) {
  return useQuery({
    queryKey: qk.announcements.list(page),
    queryFn: () => api.announcements.list(page),
    placeholderData: (prev) => prev,
  });
}

export function useMarkAnnouncementSeen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (announcementIds: string[]) => api.announcements.markSeen(announcementIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.announcements.unseen() }),
  });
}

export function useMarkAllAnnouncementsSeen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.announcements.markAllSeen(),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.announcements.unseen() }),
  });
}