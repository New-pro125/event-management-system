import { trpc } from "@/router";

export function useCurrentUser() {
  const { data } = trpc.auth.currentUser.useQuery();
  return {
    ...(data?.currentUser ?? undefined),
    accessToken: data?.accessToken,
    currentUser: data?.currentUser,
  };
}
