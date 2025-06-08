import { useLanguage } from "@/lib/i18n/useLanguage";
import { Menu } from "lucide-react";
import { useState } from "react";
import Navbar from "./Navbar";
import { Button } from "./ui/Button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/Sheet";
export function MobileNavSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const { dir } = useLanguage();
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={dir === "rtl" ? "right" : "left"}
        className="w-full bg-neutral-200 p-4"
      >
        <Navbar setIsOpen={setIsOpen} />
      </SheetContent>
    </Sheet>
  );
}
