import { LanguageProvider } from "@/features/shared/components/LanguageProvider";
import { MobileNavSheet } from "@/features/shared/components/MobileNavSheet";
import Navbar from "@/features/shared/components/Navbar";
import { ThemeProvider } from "@/features/shared/components/ThemeProvider";
import { Toaster } from "@/features/shared/components/ui/Toaster";

import { isAuthenticated, trpcQueryUtils } from "@/router";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import { CalendarArrowDown } from "lucide-react";
export type RouterAppContext = {
  trpcQueryUtils: typeof trpcQueryUtils;
  isAuthenticated: typeof isAuthenticated;
};
export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: Root,
});

function Root() {
  return (
    <ThemeProvider defaultTheme="system">
      <LanguageProvider>
        <Toaster />

        <div className="relative flex justify-center gap-12 p-4 pt-0">
          <div className="hidden sm:block">
            <Navbar />
          </div>

          <div className="absolute start-4 top-4 z-50 block sm:hidden">
            <MobileNavSheet />
          </div>
          <div className="min-h-screen w-full max-w-[460px] lg:max-w-2xl">
            <header className="mb-4 border-b border-neutral-200 p-4 dark:border-neutral-800">
              <h1 className="text-secondary-500 flex items-end justify-center gap-2 text-center text-4xl font-bold underline">
                <CalendarArrowDown className="h-9 w-9" />
                Eventi
              </h1>
            </header>
            <Outlet />
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
