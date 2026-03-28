import { Badge } from '@/components/ui/badge';
import { CATEGORIES } from '@/lib/scoring/categories';
import type { CategoryId } from '@/types/scoring';

interface CategoryBadgeProps {
  category: CategoryId;
  showEmoji?: boolean;
  className?: string;
}

export function CategoryBadge({ category, showEmoji = true, className }: CategoryBadgeProps) {
  const info = CATEGORIES[category];
  return (
    <Badge
      variant="outline"
      className={`${info.color} font-medium text-xs ${className ?? ''}`}
    >
      {showEmoji && <span className="mr-1">{info.emoji}</span>}
      {info.label}
    </Badge>
  );
}
