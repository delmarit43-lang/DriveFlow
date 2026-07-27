"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { authRoutes } from "@/constants/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { FloatingActions } from "@/components/layout/floating-actions";

const searchPlaceholders: Record<string, string> = {
  "/customers": "Search customers...",
  "/payments": "Search transactions...",
  "/notifications": "Search notifications, fleet, or records...",
  "/revenue": "Search financials...",
  "/vehicles": "Search vehicles, plates, or users...",
  "/drivers": "Search drivers...",
  "/bookings": "Search bookings...",
  "/settings": "Search fleet or users...",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = React.useState(false);
  const isAuth = authRoutes.some((r) => pathname.startsWith(r));
  // The first paint must not be hidden behind an enter animation, otherwise a
  // slow hydration leaves the page blank.
  const firstPaint = React.useRef(true);

  React.useEffect(() => {
    firstPaint.current = false;
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  if (isAuth) {
    return <>{children}</>;
  }

  const placeholder =
    Object.entries(searchPlaceholders).find(([path]) => pathname.startsWith(path))?.[1] ??
    "Search fleet, bookings or customers...";

  return (
    <div className="min-h-screen bg-background lg:pl-sidebar">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="flex min-h-screen flex-col">
        <Topbar placeholder={placeholder} onMenuClick={() => setNavOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={firstPaint.current ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <FloatingActions />
    </div>
  );
}
