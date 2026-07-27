"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

export function Avatar({
  src,
  name,
  className,
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  const [err, setErr] = React.useState(false);
  return (
    <span
      className={cn(
        "relative inline-flex size-10 shrink-0 overflow-hidden rounded-full bg-muted ring-2 ring-primary/20",
        className,
      )}
    >
      {src && !err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="size-full object-cover" onError={() => setErr(true)} />
      ) : (
        <span className="flex size-full items-center justify-center bg-primary/10 text-xs font-semibold text-primary">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
