import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { qk } from "./keys";

export function useMyBalance(groupId: string) {
  return useQuery({
    queryKey: qk.balances.mine(groupId),
    queryFn: () => api.balances.mine(groupId),
    enabled: !!groupId,
  });
}

export function useBalanceLog(groupId: string) {
  return useQuery({
    queryKey: qk.balances.log(groupId),
    queryFn: () => api.balances.log(groupId),
    enabled: !!groupId,
  });
}

export function useRedeemBalance(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => api.balances.redeem(logId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.balances.mine(groupId) });
      qc.invalidateQueries({ queryKey: qk.balances.log(groupId) });
    },
  });
}
