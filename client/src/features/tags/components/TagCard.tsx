import { Badge } from "@/features/shared/components/ui/Badge";
import Link from "@/features/shared/components/ui/Link";
import { Tag } from "@advanced-react/server/database/schema";
import { useTagLabel } from "../hooks/useTagLabel";

type TagCardProps = {
  tag: Tag;
};
export function TagCard({ tag }: TagCardProps) {
  const getTagLabel = useTagLabel();
  return (
    <Badge>
      <Link to="/tags/$tagId" params={{ tagId: tag.id }} variant="ghost">
        {getTagLabel(tag)}
      </Link>
    </Badge>
  );
}
