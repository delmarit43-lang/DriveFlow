import * as React from "react";
import { Link } from "@/lib/navigation";
import { useRouter } from "@/lib/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  ChevronDown,
  Globe,
  LogOut,
  Mail,
  Menu,
  Moon,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import { languages } from "@/constants/navigation";
import { GlobalSearch } from "@/components/layout/global-search";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { messages } from "@/data/mock";
import { useLocale } from "@/i18n/locale-context";
import { localeMeta, translate, type LocaleCode } from "@/i18n/translations";
import { useAuth } from "@/store/auth-store";
import { useFleet } from "@/store/fleet-store";
import { useUserProfile } from "@/store/user-profile-store";
import { cn } from "@/lib/utils";

export function Topbar({ placeholder, onMenuClick }: { placeholder: string; onMenuClick: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const { resolvedTheme, setTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const { user, logout } = useAuth();
  const { profile } = useUserProfile();
  const { notifications, markAllNotificationsRead } = useFleet();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const displayName = user?.fullName || profile.name || "User";
  const displayEmail = user?.email || profile.email;
  const displayRole = user
    ? user.role === "SUPER_ADMIN"
      ? "Super Admin"
      : user.role === "ADMIN"
        ? "Admin"
        : "Staff"
    : profile.role;
  const displayAvatar = user?.profileImage || profile.avatar;

  const unread = notifications.filter((n) => !n.read);
  const unreadMessages = messages.filter((m) => m.unread).length;
  const isDark = resolvedTheme === "dark";
  const currentLanguage = languages.find((l) => l.code === locale) ?? languages[0];

  const changeLanguage = (code: LocaleCode) => {
    setLocale(code);
    const meta = localeMeta[code];
    toast({
      title: translate(code, "topbar.languageUpdated"),
      description: translate(code, "topbar.interfaceSetTo", { label: meta.nativeLabel }),
      tone: "success",
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-topbar items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex flex-1 justify-center">
        <GlobalSearch placeholder={placeholder} />
      </div>

      <div className="flex items-center gap-1">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label={`${t("topbar.notifications")} (${unread.length})`}>
              <Bell />
              {unread.length > 0 ? (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-card" />
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <div className="flex items-center justify-between px-3 py-2">
              <DropdownMenuLabel className="p-0">{t("topbar.notifications")}</DropdownMenuLabel>
              {unread.length > 0 ? (
                <button
                  type="button"
                  onClick={() => void markAllNotificationsRead()}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {t("topbar.markAllRead")}
                </button>
              ) : null}
            </div>
            <DropdownMenuSeparator />
            {notifications.slice(0, 4).map((n) => (
              <DropdownMenuItem key={n.id} onSelect={() => router.push("/notifications")} className="items-start">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-border" : "bg-primary")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{n.title}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">{n.description}</span>
                  <span className="block text-[11px] font-normal text-muted-foreground">{n.time}</span>
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push("/notifications")} className="justify-center text-primary">
              {t("topbar.viewAllNotifications")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Messages */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex" aria-label={t("topbar.messages")}>
              <Mail />
              {unreadMessages > 0 ? (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-card" />
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <DropdownMenuLabel>{t("topbar.messages")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {messages.map((m) => (
              <DropdownMenuItem key={m.id} onSelect={() => router.push("/support")} className="items-start">
                <Avatar src={m.avatar} name={m.from} className="size-8" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{m.from}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">{m.preview}</span>
                </span>
                <span className="shrink-0 text-[11px] font-normal text-muted-foreground">{m.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {mounted && isDark ? <Sun /> : <Moon />}
        </Button>

        {/* Language */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="hidden h-10 gap-2 px-2.5 sm:inline-flex"
              aria-label={t("topbar.selectLanguage")}
            >
              <Globe className="size-4" />
              <span className="text-base leading-none">{currentLanguage.flag}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {currentLanguage.code}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t("topbar.language")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {languages.map((l) => {
              const active = locale === l.code;
              return (
                <DropdownMenuItem
                  key={l.code}
                  onSelect={() => changeLanguage(l.code)}
                  className={cn(active && "bg-primary/5")}
                >
                  <span className="text-base leading-none">{l.flag}</span>
                  <span className="flex-1">
                    <span className="block font-semibold">{l.nativeLabel}</span>
                    <span className="block text-[11px] font-normal text-muted-foreground">{l.label}</span>
                  </span>
                  {active ? <span className="text-[11px] font-bold text-primary">{t("topbar.active")}</span> : null}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ml-1 flex items-center gap-3 rounded-xl border-l border-border py-1.5 pl-3 pr-2 transition hover:bg-muted"
            >
              <span className="hidden text-right sm:block">
                <span className="block text-sm font-semibold leading-tight">{displayName}</span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {displayRole}
                </span>
              </span>
              <Avatar src={displayAvatar} name={displayName} />
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end">
            <div className="flex items-center gap-3 px-3 py-3">
              <Avatar src={displayAvatar} name={displayName} className="size-11" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
                <p className="truncate text-[11px] text-muted-foreground">{displayRole}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserRound /> {t("topbar.myProfile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings /> {t("topbar.workspaceSettings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              destructive
              onSelect={() => {
                void logout().finally(() => router.push("/login"));
              }}
            >
              <LogOut /> {t("topbar.logOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
