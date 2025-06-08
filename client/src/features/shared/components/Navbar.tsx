import {
  Bell,
  Edit,
  Heart,
  Home,
  Search,
  Settings,
  User,
  UserCircle2,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import Link from "./ui/Link";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { trpc } from "@/router";
import { cn } from "@/lib/utils/cn";

const navLinkClassName = `rounded-lg p-2 text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800`;
const activeNavLinkClassName = `bg-neutral-200 dark:bg-neutral-800`;
type NavigationProps = {
  setIsOpen?: (args: boolean) => void;
};
export default function Navigation({ setIsOpen }: NavigationProps) {
  return (
    <nav className="flex flex-col gap-4 pl-4 pt-8">
      <Link
        to="/"
        variant="ghost"
        className={navLinkClassName}
        activeProps={{ className: activeNavLinkClassName }}
        onClick={() => setIsOpen?.(false)}
      >
        <Home className="h-6 w-6" />
        Home
      </Link>
      <Link
        to="/search"
        variant="ghost"
        className={navLinkClassName}
        activeProps={{ className: activeNavLinkClassName }}
        onClick={() => setIsOpen?.(false)}
      >
        <Search className="h-6 w-6" />
        Search
      </Link>
      <NavigationOwnerLinks setIsOpen={setIsOpen} />
      <ThemeToggle />
    </nav>
  );
}
type NavigationOwnerLinksProps = NavigationProps;
function NavigationOwnerLinks({ setIsOpen }: NavigationOwnerLinksProps) {
  const { currentUser } = useCurrentUser();
  const unreadCountQuery = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: !!currentUser,
  });

  return (
    <>
      {currentUser ? (
        <>
          <Link
            to="/notifications"
            variant={"ghost"}
            className={cn(
              navLinkClassName,
              "relative flex items-center justify-between gap-2",
            )}
            onClick={() => setIsOpen?.(false)}
            activeProps={{ className: activeNavLinkClassName }}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notifications
            </div>
            {unreadCountQuery.data && unreadCountQuery.data > 0 && (
              <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
                {unreadCountQuery.data}
              </div>
            )}
          </Link>
          <Link
            to="/favorites"
            variant="ghost"
            className={navLinkClassName}
            onClick={() => setIsOpen?.(false)}
            activeProps={{ className: activeNavLinkClassName }}
          >
            <Heart className="h-6 w-6" />
            Favorites
          </Link>
          <Link
            to="/settings"
            variant="ghost"
            onClick={() => setIsOpen?.(false)}
            className={navLinkClassName}
            activeProps={{ className: activeNavLinkClassName }}
          >
            <Settings className="h-6 w-6" />
            Settings
          </Link>
          <Link
            to="/users/$userId"
            variant="ghost"
            onClick={() => setIsOpen?.(false)}
            className={navLinkClassName}
            activeProps={{ className: activeNavLinkClassName }}
            params={{ userId: currentUser.id }}
          >
            <UserCircle2 className="h-6 w-6" />
            Profile
          </Link>
          <Link
            to="/experiences/new"
            variant={"ghost"}
            onClick={() => setIsOpen?.(false)}
            className={navLinkClassName}
            activeProps={{ className: activeNavLinkClassName }}
          >
            <Edit className="h-6 w-6" />
            Create Experience
          </Link>
        </>
      ) : (
        <Link
          to="/login"
          variant="ghost"
          onClick={() => setIsOpen?.(false)}
          className={navLinkClassName}
          activeProps={{ className: activeNavLinkClassName }}
        >
          <User className="h-6 w-6" />
          Login
        </Link>
      )}
    </>
  );
}
