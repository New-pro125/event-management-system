import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { LocationDisplay } from "@/features/shared/components/LocationDisplay";
import { Button } from "@/features/shared/components/ui/Button";
import Card from "@/features/shared/components/ui/Card";
import Link from "@/features/shared/components/ui/Link";
import { TagList } from "@/features/tags/components/TagList";
import { UserAvatarList } from "@/features/users/components/UserAvatarList";
import { useFormatters } from "@/lib/i18n/useFormatters";
import { router } from "@/router";
import { LocationData } from "@advanced-react/shared/schema/experience";
import { LinkIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ExperienceForDetails } from "../types";
import { ExperienceAttendButton } from "./ExperienceAttendButton";
import { ExperienceDeleteDialog } from "./ExperienceDeleteDialog";
import { ExperienceFavoriteButton } from "./ExperienceFavoriteButton";

type ExperienceDetailsProps = {
  experience: ExperienceForDetails;
};

export function ExperienceDetails({ experience }: ExperienceDetailsProps) {
  return (
    <Card className="p-0">
      <ExperienceDetailsMedia experience={experience} />
      <div className="w-full space-y-4 p-4">
        <ExperienceDetailsHeader experience={experience} />
        <ExperienceDetailsContent experience={experience} />
        <ExperienceDetailsTags experience={experience} />
        <ExperienceDetailsMeta experience={experience} />
        <ExperienceDetailsActionButtons experience={experience} />
        <div className="border-y-2 border-neutral-200 pt-4 dark:border-neutral-800">
          <ExperienceDetailAttendees experience={experience} />
        </div>
        <ExperienceDetailsLocation experience={experience} />
      </div>
    </Card>
  );
}

type ExperienceDetailsMediaProps = Pick<ExperienceDetailsProps, "experience">;
function ExperienceDetailsMedia({ experience }: ExperienceDetailsMediaProps) {
  if (!experience.imageUrl) {
    return null;
  }
  return (
    <div className="aspect-video w-full">
      <img
        src={experience.imageUrl}
        alt={experience.title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
type ExperienceDetailsHeaderProps = Pick<ExperienceDetailsProps, "experience">;
function ExperienceDetailsHeader({ experience }: ExperienceDetailsHeaderProps) {
  return (
    <h2 className="text-secondary-500 dark:text-primary-500 text-xl font-bold">
      {experience.title}
    </h2>
  );
}

type ExperienceDetailsContentProps = Pick<ExperienceDetailsProps, "experience">;
function ExperienceDetailsContent({
  experience,
}: ExperienceDetailsContentProps) {
  return <p>{experience.content}</p>;
}

type ExperienceDetailsMetaProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceDetailsMeta({ experience }: ExperienceDetailsMetaProps) {
  const { t } = useTranslation("experiences");
  const { formatDateTime } = useFormatters();
  return (
    <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
      <time>{formatDateTime(experience.scheduledAt)}</time>
      {experience.url && (
        <div className="flex items-center gap-2">
          <LinkIcon
            size={16}
            className="text-secondary-500 dark:text-primary-500"
          />
          <a
            href={experience.url}
            target="_blank"
            className="text-secondary-500 dark:text-primary-500 hover:underline"
          >
            {t("card.eventDetails")}
          </a>
        </div>
      )}
    </div>
  );
}
type ExperienceDetailsOwnerButtonsProps = Pick<
  ExperienceDetailsProps,
  "experience"
>;
function ExperienceDetailsOwnerButtons({
  experience,
}: ExperienceDetailsOwnerButtonsProps) {
  const { t } = useTranslation("common");
  return (
    <div className="flex gap-4">
      <Button asChild variant="link">
        <Link
          to="/experiences/$experienceId/edit"
          params={{ experienceId: experience.id }}
        >
          {t("actions.edit")}
        </Link>
      </Button>
      <ExperienceDeleteDialog
        experience={experience}
        onSuccess={() => router.navigate({ to: "/" })}
      />
    </div>
  );
}
type ExperienceDetailsActionButtonsProps = Pick<
  ExperienceDetailsProps,
  "experience"
>;
function ExperienceDetailsActionButtons({
  experience,
}: ExperienceDetailsActionButtonsProps) {
  const { currentUser } = useCurrentUser();
  const isPostOwner = currentUser?.id === experience.userId;
  if (isPostOwner) {
    return <ExperienceDetailsOwnerButtons experience={experience} />;
  }
  if (currentUser) {
    return (
      <div className="flex items-center gap-4">
        <ExperienceAttendButton
          experienceId={experience.id}
          isAttending={experience.isAttending}
        />
        <ExperienceFavoriteButton
          experienceId={experience.id}
          isFavorite={experience.isFavorited}
          favoritesCount={experience.favoritesCount}
        />
      </div>
    );
  }
  return null;
}
type ExperienceDetailsAttendeesProps = Pick<
  ExperienceDetailsProps,
  "experience"
>;
function ExperienceDetailAttendees({
  experience,
}: ExperienceDetailsAttendeesProps) {
  const { t } = useTranslation("experiences");
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">{t("details.host")}</h3>
        <UserAvatarList users={[experience.user]} totalCount={1} />
      </div>
      <div className="space-y-2">
        <Link
          to="/experiences/$experienceId/attendees"
          params={{ experienceId: experience.id }}
          variant="secondary"
        >
          <h3 className="font-medium">
            {t("details.attendees", { total: experience.attendeesCount })}
          </h3>
        </Link>
        {experience.attendeesCount > 0 ? (
          <UserAvatarList
            users={experience.attendees}
            totalCount={experience.attendeesCount}
          />
        ) : (
          <p className="text-neutral-600 dark:text-neutral-400">
            {t("details.beFirst")}
          </p>
        )}
      </div>
    </div>
  );
}
type ExperienceDetailsTagsProps = Pick<ExperienceDetailsProps, "experience">;
function ExperienceDetailsTags({ experience }: ExperienceDetailsTagsProps) {
  return <TagList tags={experience.tags} />;
}
type ExperienceDetailsLocationProps = Pick<
  ExperienceDetailsProps,
  "experience"
>;
function ExperienceDetailsLocation({
  experience,
}: ExperienceDetailsLocationProps) {
  const location = experience.location
    ? (JSON.parse(experience.location) as LocationData)
    : null;
  if (!location) return null;
  return <LocationDisplay location={location} />;
}
