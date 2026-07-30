import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export function TooltipProvider({
  children,
  delayDuration = 200,
}: {
  children: React.ReactNode;
  delayDuration?: number;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={0}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export function Tooltip({ children, ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>;
}

export function TooltipTrigger({
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger {...props}>{children}</TooltipPrimitive.Trigger>;
}

export function TooltipContent({
  className,
  sideOffset = 10,
  side = "right",
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        side={side}
        sideOffset={sideOffset}
        className={cn(
          "z-[80] max-w-[220px] rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 text-[12px] font-medium leading-none text-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.55),0_0_0_1px_rgba(15,23,42,0.08)]",
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=right]:slide-in-from-left-1 data-[side=left]:slide-in-from-right-1 data-[side=top]:slide-in-from-bottom-1 data-[side=bottom]:slide-in-from-top-1",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-slate-900" width={10} height={5} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
