import { Menu } from "lucide-react";
import Navbar from "./Navbar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/Button";
import { useState } from "react";
export function MobileNavSheet() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full bg-neutral-200 p-4">
        <Navbar setIsOpen={setIsOpen} />
      </SheetContent>
    </Sheet>
  );
}
