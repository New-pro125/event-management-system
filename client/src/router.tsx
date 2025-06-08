import type { AppRouter } from "@advanced-react/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRouter as createTanStackRouter,
  redirect,
} from "@tanstack/react-router";
import {
  createTRPCQueryUtils,
  createTRPCReact,
  getQueryKey,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
  TRPCClientError,
  TRPCLink,
} from "@trpc/react-query";
import { observable } from "@trpc/server/observable";
import { ErrorComponent } from "./features/shared/components/ErrorComponent";
import { NotFoundComponent } from "./features/shared/components/NotFoundComponent";
import Spinner from "./features/shared/components/ui/Spinner";
import { getCurrentLanguage } from "./lib/i18n";
import { env } from "./lib/utils/env";
import { routeTree } from "./routeTree.gen";
export const trpc = createTRPCReact<AppRouter>();

export const getCurrentUser = async () => {
  const queryKey = getQueryKey(trpc.auth.currentUser);
  const cachedUser = queryClient.getQueryData(queryKey);
  if (cachedUser) return cachedUser;
  try {
    const user = await trpcQueryUtils.auth.currentUser.fetch();
    return user;
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    return null;
  }
};

export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

export const requireAuth = async () => {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    throw redirect({
      to: "/login",
      search: {
        redirect: window.location.pathname,
      },
    });
  }
};
const authLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value);
        },
        error(err) {
          if (err?.data?.code === "UNAUTHORIZED") {
            router.navigate({ to: "/login" });
          }
          observer.error(err);
        },
        complete() {
          observer.complete();
        },
      });
      return unsubscribe;
    });
  };
};
export const queryClient = new QueryClient();

function getHeaders() {
  const queryKey = getQueryKey(trpc.auth.currentUser);
  const token = queryClient.getQueryData<{ accessToken: string }>(
    queryKey,
  )?.accessToken;
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    "Accept-Language": getCurrentLanguage(),
  };
}

export const trpcClient = trpc.createClient({
  links: [
    authLink,
    // HttpBatchLink doesn't support sending FormData
    splitLink({
      condition(op) {
        return isNonJsonSerializable(op.input);
      },
      true: httpLink({
        url: env.VITE_SERVER_BASE_URL,
        fetch(url, options) {
          return fetch(url, { ...options, credentials: "include" });
        },
        headers: getHeaders,
      }),
      false: httpBatchLink({
        url: env.VITE_SERVER_BASE_URL,
        fetch(url, options) {
          return fetch(url, { ...options, credentials: "include" });
        },
        headers: getHeaders,
      }),
    }),
  ],
});

export const trpcQueryUtils = createTRPCQueryUtils({
  queryClient,
  client: trpcClient,
});

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    context: {
      trpcQueryUtils,
      isAuthenticated,
    },
    defaultPendingComponent: () => (
      <div className="flex justify-center">
        <Spinner />
      </div>
    ),
    defaultNotFoundComponent: () => <NotFoundComponent />,
    defaultErrorComponent: () => <ErrorComponent />,
    Wrap: function WrapComponent({ children }) {
      return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </trpc.Provider>
      );
    },
  });
  return router;
}

export const router = createRouter();
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}

export function iSTRPCClientError(
  cause: unknown,
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}
