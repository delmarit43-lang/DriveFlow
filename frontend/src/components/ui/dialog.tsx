import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function DialogRoot({ ...props }: Dialog.DialogProps) {
  return <Dialog.Root {...props} />;
}

export function DialogContent({
  className,
  children,
  title,
  description,
}: {
  className?: string;
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
      {/* Viewport-centered shell — keeps tall dialogs (Add Vehicle) fully visible */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none sm:p-6">
        <Dialog.Content
          className={cn(
            "pointer-events-auto relative flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lift outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            className,
          )}
        >
          {title ? (
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-3.5 sm:px-6 sm:py-4">
              <div className="min-w-0 pr-2">
                <Dialog.Title className="text-lg font-semibold tracking-tight sm:text-xl">{title}</Dialog.Title>
                {description ? (
                  <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>
                ) : null}
              </div>
              <Dialog.Close
                className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </Dialog.Close>
            </div>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">{children}</div>
        </Dialog.Content>
      </div>
    </Dialog.Portal>
  );
}

export const DialogClose = Dialog.Close;
