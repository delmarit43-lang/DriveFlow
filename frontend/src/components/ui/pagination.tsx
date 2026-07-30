import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function pageList(current: number, total: number) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "…", total];
  if (current >= total - 2) return [1, "…", total - 2, total - 1, total];
  return [1, "…", current, "…", total];
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className={cn("flex items-center justify-between gap-4", className)} aria-label="Pagination">
      <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        <ArrowLeft /> Previous
      </Button>
      <div className="flex items-center gap-1.5">
        {pageList(page, totalPages).map((p, i) =>
          typeof p === "number" ? (
            <button
              key={`${p}-${i}`}
              type="button"
              aria-current={p === page ? "page" : undefined}
              onClick={() => onPageChange(p)}
              className={cn(
                "size-9 rounded-lg text-sm font-semibold transition",
                p === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {p}
            </button>
          ) : (
            <span key={`gap-${i}`} className="px-1 text-muted-foreground">
              …
            </span>
          ),
        )}
      </div>
      <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
        Next <ArrowRight />
      </Button>
    </nav>
  );
}
