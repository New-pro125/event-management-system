import { Experience, User } from "@advanced-react/server/database/schema";

type ExperienceWithUser = Experience & { user: User };
type ExperienceWithCommentsCount = Experience & {
  commentsCount: number;
};
type ExperienceWithUserContext = Experience & {
  isAttending: boolean;
  isFavorited: boolean;
};
type ExperienceWithAttendeesCount = Experience & {
  attendeesCount: number;
};
type ExperienceWithAttendees = Experience & {
  attendees: User[];
};
type ExperienceWithFavoritesCount = Experience & {
  favoritesCount: number;
};
export type ExperienceForList = ExperienceWithUser &
  ExperienceWithCommentsCount &
  ExperienceWithUserContext &
  ExperienceWithAttendeesCount &
  ExperienceWithFavoritesCount;

export type ExperienceForDetails = ExperienceWithUser &
  ExperienceWithCommentsCount &
  ExperienceWithUserContext &
  ExperienceWithAttendees &
  ExperienceWithAttendeesCount &
  ExperienceWithFavoritesCount;
