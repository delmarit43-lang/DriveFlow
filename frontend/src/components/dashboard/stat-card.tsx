import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tones = {
  blue: "bg-blue-50 text-primary dark:bg-primary/15",
  green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15",
  red: "bg-red-50 text-red-500 dark:bg-red-500/15",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/15",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/15",
} as const;

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "blue",
  className,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  hint?: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 320, damping: 24 }}>
      <Card className={cn("h-full p-5 transition-shadow hover:shadow-lift", className)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            {hint ? <div className="mt-2">{hint}</div> : null}
          </div>
          <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl [&_svg]:size-5", tones[tone])}>
            {icon}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
