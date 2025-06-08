import { Moon, Sun } from "lucide-react";

import { useTranslation } from "react-i18next";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/Button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation("common");
  return (
    <Button
      variant="ghost"
      className="justify-start p-2"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-6 w-6" />
          {t("theme.light")}
        </>
      ) : (
        <>
          <Moon className="h-6 w-6" />
          {t("theme.dark")}
        </>
      )}
    </Button>
  );
}
