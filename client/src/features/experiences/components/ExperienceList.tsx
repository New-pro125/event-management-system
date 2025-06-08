import Spinner from "@/features/shared/components/ui/Spinner";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useImagePreloader } from "../hooks/useImagePreloader";
import { ExperienceForList } from "../types";
import { ExperienceCard } from "./ExperienceCard";

type ExperienceListProps = {
  experiences: ExperienceForList[];
  isLoading?: boolean;
  noExperienceMessage?: string;
};
export function ExperienceList({
  experiences,
  isLoading,
  noExperienceMessage,
}: ExperienceListProps) {
  const { preloadedImage } = useImagePreloader();
  const { t } = useTranslation("experiences");
  useEffect(() => {
    experiences.slice(0, 3).forEach((experience) => {
      if (experience.imageUrl) {
        preloadedImage(experience.imageUrl, "low");
      }
    });
  }, [experiences, preloadedImage]);
  const handleCardVisible = useCallback(
    (index: number) => {
      const nextImages = experiences.slice(index + 1, index + 4);
      nextImages.forEach((experience) => {
        if (experience.imageUrl) {
          preloadedImage(experience.imageUrl);
        }
      });
    },
    [experiences, preloadedImage],
  );

  return (
    <div className="flex flex-col gap-4 space-y-4">
      {experiences.map((experience, index) => (
        <ExperienceCard
          key={experience.id}
          experience={experience}
          priority={index < 3 ? "high" : "low"}
          onVisible={() => handleCardVisible(index)}
        />
      ))}
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
      {!isLoading && experiences.length === 0 && (
        <div className="flex justify-center">
          {noExperienceMessage ?? t("list.empty")}
        </div>
      )}
    </div>
  );
}
