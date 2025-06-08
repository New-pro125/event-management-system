import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import Card from "@/features/shared/components/ui/Card";
import Link from "@/features/shared/components/ui/Link";
import { TagList } from "@/features/tags/components/TagList";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { useFormatters } from "@/lib/i18n/useFormatters";
import { router } from "@/router";
import { LinkIcon, MessageSquare, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ExperienceForList } from "../types";
import { ExperienceAttendButton } from "./ExperienceAttendButton";
import { ExperienceDeleteDialog } from "./ExperienceDeleteDialog";
import { ExperienceFavoriteButton } from "./ExperienceFavoriteButton";

type ExperienceCardProps = {
  experience: ExperienceForList;
  priority?: "low" | "high";
  onVisible?: () => void;
};
export function ExperienceCard({
  experience,
  priority = "low",
  onVisible,
}: ExperienceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!onVisible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible();
        }
      },
      { threshold: 0.1, rootMargin: "0px" },
    );
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => observer.disconnect();
  }, [onVisible]);
  return (
    <Card
      className="animate-in z-0 h-[670px] max-w-[600px] overflow-hidden p-0 transition-all duration-200 hover:scale-105"
      isAnimated
    >
      <ExperienceCardMedia experience={experience} priority={priority} />
      <div className="flex items-start gap-4 p-4">
        <ExperienceCardAvatar experience={experience} />
        <div className="w-full space-y-4">
          <ExperienceCardHeader experience={experience} />
          <ExperienceCardContent experience={experience} />
          <ExperienceCardTags experience={experience} />
          <ExperienceCardMeta experience={experience} />
          <ExperienceCardMetricButtons experience={experience} />
          <ExperienceCardActionButtons experience={experience} />
        </div>
      </div>
    </Card>
  );
}

type ExperienceCardAvatarProps = Pick<ExperienceCardProps, "experience">;
function ExperienceCardAvatar({ experience }: ExperienceCardAvatarProps) {
  return (
    <Link
      to={"/users/$userId"}
      params={{ userId: experience.user.id }}
      variant="ghost"
    >
      <UserAvatar user={experience.user} showName={false} />
    </Link>
  );
}
type ExperienceCardMediaProps = Pick<
  ExperienceCardProps,
  "experience" | "priority"
>;
function ExperienceCardMedia({
  experience,
  priority = "low",
}: ExperienceCardMediaProps) {
  if (!experience.imageUrl)
    return (
      <div className="bg-netural-100 aspect-video w-full dark:bg-neutral-700" />
    );
  return (
    <div className="aspect-video max-h-[338px] w-full">
      <img
        src={experience.imageUrl}
        alt={experience.title}
        className="h-full w-full object-cover"
        loading={priority === "high" ? "eager" : "lazy"}
        fetchPriority={priority}
      />
    </div>
  );
}
type ExperienceCardHeaderProps = Pick<ExperienceCardProps, "experience">;
function ExperienceCardHeader({ experience }: ExperienceCardHeaderProps) {
  return (
    <div>
      <div>{experience.user.name}</div>
      <Link
        to="/experiences/$experienceId"
        params={{ experienceId: experience.id }}
      >
        <h2 className="text-secondary-500 dark:text-primary-500 text-xl font-bold">
          {experience.title}
        </h2>
      </Link>
    </div>
  );
}

type ExperienceCardContentProps = Pick<ExperienceCardProps, "experience">;
function ExperienceCardContent({ experience }: ExperienceCardContentProps) {
  return <p>{experience.content.slice(0, 50)}...</p>;
}

type ExperienceCardMetaProps = Pick<ExperienceCardProps, "experience">;

function ExperienceCardMeta({ experience }: ExperienceCardMetaProps) {
  const { t } = useTranslation("experiences");
  const { formatDateTime } = useFormatters();
  return (
    <div className="flex flex-col gap-4 text-neutral-600 md:flex-row md:items-center dark:text-neutral-400">
      <time className="text-nowrap">
        {formatDateTime(experience.scheduledAt)}
      </time>
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
type ExperienceCardMetricButtonsProps = Pick<ExperienceCardProps, "experience">;

function ExperienceCardMetricButtons({
  experience,
}: ExperienceCardMetricButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <ExperienceFavoriteButton
        experienceId={experience.id}
        isFavorite={experience.isFavorited}
        favoritesCount={experience.favoritesCount}
      />
      <Button variant={"link"} asChild>
        <Link
          to="/experiences/$experienceId/attendees"
          params={{ experienceId: experience.id }}
        >
          <User className="h-5 w-5" />
          <span>{experience.attendeesCount}</span>
        </Link>
      </Button>
      <Button variant={"link"} asChild>
        <Link
          to="/experiences/$experienceId"
          params={{ experienceId: experience.id }}
        >
          <MessageSquare className="h-5 w-5" />
          <span>{experience.commentsCount}</span>
        </Link>
      </Button>
    </div>
  );
}
type ExperienceCardOwnerButtonsProps = Pick<ExperienceCardProps, "experience">;
function ExperienceCardOwnerButtons({
  experience,
}: ExperienceCardOwnerButtonsProps) {
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
type ExperienceCardActionButtonsProps = Pick<ExperienceCardProps, "experience">;
function ExperienceCardActionButtons({
  experience,
}: ExperienceCardActionButtonsProps) {
  const { currentUser } = useCurrentUser();
  const isPostOwner = currentUser?.id === experience.userId;
  if (isPostOwner) {
    return <ExperienceCardOwnerButtons experience={experience} />;
  }
  if (currentUser) {
    return (
      <ExperienceAttendButton
        experienceId={experience.id}
        isAttending={experience.isAttending}
      />
    );
  }
  return null;
}
type ExperienceCardTagsProps = Pick<ExperienceCardProps, "experience">;
function ExperienceCardTags({ experience }: ExperienceCardTagsProps) {
  return <TagList tags={experience.tags} />;
}
