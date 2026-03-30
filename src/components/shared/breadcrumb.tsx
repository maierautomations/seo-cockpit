'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;

        return (
          <span key={i} className="inline-flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="w-3 h-3 text-border shrink-0" />
            )}
            {isLast || !item.href ? (
              <span className={isLast ? 'text-foreground font-medium truncate max-w-[300px]' : 'text-muted-foreground'}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-signal transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
