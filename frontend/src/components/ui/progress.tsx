import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <ProgressPrimitive.Root className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </ProgressPrimitive.Root>
  );
}
