import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { Experience } from "@advanced-react/server/database/schema";
import { Heart } from "lucide-react";
import { useExperienceMutation } from "../hooks/useExperienceMutation";

type ExperienceFavoriteButtonProps = {
  experienceId: Experience["id"];
  isFavorite: boolean;
  favoritesCount: number;
};
export function ExperienceFavoriteButton({
  experienceId,
  isFavorite,
  favoritesCount,
}: ExperienceFavoriteButtonProps) {
  const { currentUser } = useCurrentUser();
  if (!currentUser) return null;
  const { favoriteMutation, unfavoriteMutation } = useExperienceMutation();

  return (
    <Button
      variant={"link"}
      onClick={() => {
        if (isFavorite) {
          unfavoriteMutation.mutate({ id: experienceId });
        } else {
          favoriteMutation.mutate({ id: experienceId });
        }
      }}
      disabled={favoriteMutation.isPending || unfavoriteMutation.isPending}
    >
      <Heart
        className={cn("h-6 w-6", isFavorite && "fill-red-500 text-red-500")}
      />
      <span>{favoritesCount}</span>
    </Button>
  );
}
