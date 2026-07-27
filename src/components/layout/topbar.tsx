"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { CURRENT_USER, languages } from "@/constants/navigation";
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
import { useFleet } from "@/store/fleet-store";
import { cn } from "@/lib/utils";

export function Topbar({ placeholder, onMenuClick }: { placeholder: string; onMenuClick: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const { resolvedTheme, setTheme } = useTheme();
  const { notifications, markAllNotificationsRead } = useFleet();
  const [mounted, setMounted] = React.useState(false);
  const [language, setLanguage] = React.useState<(typeof languages)[number]["code"]>("en");

  React.useEffect(() => setMounted(true), []);

  const unread = notifications.filter((n) => !n.read);
  const unreadMessages = messages.filter((m) => m.unread).length;
  const isDark = resolvedTheme === "dark";

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
            <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${unread.length} unread)`}>
              <Bell />
              {unread.length > 0 ? (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-card" />
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <div className="flex items-center justify-between px-3 py-2">
              <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
              {unread.length > 0 ? (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Mark all read
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
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Messages */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hidden sm:inline-flex" aria-label="Messages">
              <Mail />
              {unreadMessages > 0 ? (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-card" />
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <DropdownMenuLabel>Messages</DropdownMenuLabel>
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
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Select language">
              <Globe />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Language</DropdownMenuLabel>
            {languages.map((l) => (
              <DropdownMenuItem
                key={l.code}
                onSelect={() => {
                  setLanguage(l.code);
                  toast({ title: "Language updated", description: `Interface language set to ${l.label}.`, tone: "info" });
                }}
              >
                <span>{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {language === l.code ? <span className="text-xs font-bold text-primary">Active</span> : null}
              </DropdownMenuItem>
            ))}
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
                <span className="block text-sm font-semibold leading-tight">{CURRENT_USER.name}</span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {CURRENT_USER.role}
                </span>
              </span>
              <Avatar src={CURRENT_USER.avatar} name={CURRENT_USER.name} />
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <div className="px-3 py-2">
              <p className="text-sm font-bold">{CURRENT_USER.company}</p>
              <p className="text-xs text-muted-foreground">{CURRENT_USER.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <UserRound /> My profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings /> Workspace settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => router.push("/login")}>
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
