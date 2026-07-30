import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CalendarCheck,
  ChevronDown,
  CreditCard,
  RefreshCw,
  Settings2,
  Wrench,
  X,
} from "lucide-react";
import { useLocale } from "@/i18n/locale-context";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DialogContent, DialogRoot } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useFleet } from "@/store/fleet-store";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/types";

const accentBorder: Record<NotificationItem["accent"], string> = {
  red: "border-l-red-500",
  blue: "border-l-blue-500",
  green: "border-l-emerald-500",
  orange: "border-l-orange-500",
  indigo: "border-l-indigo-500",
};

const categoryIcons: Record<NotificationItem["category"], React.ElementType> = {
  maintenance: Wrench,
  booking: CalendarCheck,
  payment: CreditCard,
  vehicle: Bell,
  system: RefreshCw,
};

const iconTone: Record<NotificationItem["accent"], string> = {
  red: "bg-red-50 text-red-600 dark:bg-red-500/15",
  blue: "bg-blue-50 text-primary dark:bg-primary/15",
  green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/15",
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15",
};

const tabs = [
  { value: "all", label: "All Notifications", match: () => true },
  { value: "maintenance", label: "Maintenance", match: (n: NotificationItem) => n.category === "maintenance" },
  { value: "bookings", label: "Bookings", match: (n: NotificationItem) => n.category === "booking" },
  { value: "payments", label: "Payments", match: (n: NotificationItem) => n.category === "payment" },
  { value: "system", label: "System Alerts", match: (n: NotificationItem) => n.category === "system" || n.category === "vehicle" },
];

export default function NotificationsPage() {
  const { t } = useLocale();
  const { notifications, markNotificationRead, markAllNotificationsRead, dismissNotification } = useFleet();
  const toast = useToast();
  const [prefsOpen, setPrefsOpen] = React.useState(false);
  const [showOlder, setShowOlder] = React.useState(false);
  const [prefs, setPrefs] = React.useState({
    maintenance: true,
    bookings: true,
    payments: true,
    system: false,
    email: true,
  });

  const unread = notifications.filter((n) => !n.read).length;

  const renderList = (items: NotificationItem[]) => {
    const visible = showOlder ? items : items.slice(0, 5);

    if (items.length === 0) {
      return (
        <EmptyState
          icon={<Bell />}
          title="You're all caught up"
          description="There are no notifications in this category right now."
        />
      );
    }

    return (
      <>
        <AnimatePresence initial={false}>
          {visible.map((n) => {
            const Icon = categoryIcons[n.category];
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className={cn("border-l-4 p-5", accentBorder[n.accent], !n.read && "bg-primary/[0.03]")}>
                  <div className="flex gap-4">
                    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", iconTone[n.accent])}>
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-bold">
                          {n.title}
                          {!n.read ? <span className="ml-2 inline-block size-2 rounded-full bg-primary align-middle" /> : null}
                        </h3>
                        <span className="text-xs text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">{n.description}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {n.actions.map((a) => (
                          <Button
                            key={a.label}
                            variant={a.primary ? "default" : "secondary"}
                            size="sm"
                            onClick={() => {
                              void markNotificationRead(n.id);
                              toast({ title: a.label, description: `Action applied to "${n.title}".` });
                            }}
                          >
                            {a.label}
                          </Button>
                        ))}
                        {!n.read ? (
                          <button
                            type="button"
                            onClick={() => void markNotificationRead(n.id)}
                            className="ml-auto text-xs font-semibold text-primary hover:underline"
                          >
                            Mark as read
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={`Dismiss ${n.title}`}
                      onClick={() => void dismissNotification(n.id)}
                      className="h-fit rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {items.length > 5 ? (
          <button
            type="button"
            onClick={() => setShowOlder((v) => !v)}
            className="flex w-full items-center justify-center gap-2 py-6 text-sm font-semibold text-primary hover:underline"
          >
            {showOlder ? "Show fewer" : "Load older notifications"}
            <ChevronDown className={cn("size-4 transition-transform", showOlder && "rotate-180")} />
          </button>
        ) : null}
      </>
    );
  };

  return (
    <div className="mx-auto max-w-[960px]">
      <PageHeader
        title={t("page.notifications.title")}
        description={t("page.notifications.desc")}
        actions={
          <>
            <Badge variant={unread > 0 ? "danger" : "success"}>{unread} unread</Badge>
            <button
              type="button"
              onClick={() => {
                void markAllNotificationsRead();
                toast({ title: "All caught up", description: "Every notification has been marked as read." });
              }}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Mark all as read
            </button>
            <Button variant="secondary" onClick={() => setPrefsOpen(true)}>
              <Settings2 /> Preferences
            </Button>
          </>
        }
      />

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value} className="space-y-4">
            {renderList(notifications.filter(t.match))}
          </TabsContent>
        ))}
      </Tabs>

      <DialogRoot open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent title="Notification preferences" description="Choose which alerts reach your inbox.">
          <div className="space-y-4">
            {(
              [
                ["maintenance", "Maintenance alerts"],
                ["bookings", "Booking requests"],
                ["payments", "Payment confirmations"],
                ["system", "System announcements"],
                ["email", "Also send by email"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
                <span className="text-sm font-medium">{label}</span>
                <Switch
                  checked={prefs[key]}
                  onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [key]: checked }))}
                  aria-label={label}
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setPrefsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setPrefsOpen(false);
                toast({ title: "Preferences saved", description: "Your notification settings have been updated." });
              }}
            >
              Save preferences
            </Button>
          </div>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
