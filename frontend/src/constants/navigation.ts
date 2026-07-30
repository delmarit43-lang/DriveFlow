import {
  BarChart3,
  Bell,
  CalendarDays,
  Car,
  CircleDollarSign,
  CreditCard,
  Gauge,
  Headphones,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  Receipt,
  Settings,
  UserRound,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const BRAND = {
  name: "DriveFlow",
  tagline: "Smart Fleet & Car Rental Management Platform",
  adminLabel: "Enterprise Admin",
} as const;

export const CURRENT_USER = {
  name: "",
  role: "",
  company: "DriveFlow",
  email: "",
  avatar: "",
} as const;

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: readonly NavItem[];
};

/** Sidebar sections — large parents with icons; children expand on click */
export const navSections: readonly NavSection[] = [
  {
    id: "main",
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    id: "rental",
    label: "Rental Management",
    icon: Car,
    items: [
      { href: "/vehicles", label: "Vehicles", icon: Car },
      { href: "/bookings", label: "Bookings", icon: CalendarDays },
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/drivers", label: "Drivers", icon: UserRound },
    ],
  },
  {
    id: "operations",
    label: "Fleet Operations",
    icon: Wrench,
    items: [
      { href: "/maintenance", label: "Maintenance", icon: Wrench },
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/analytics", label: "Analytics", icon: Gauge },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: Wallet,
    items: [
      { href: "/payments", label: "Payments", icon: CreditCard },
      { href: "/invoices", label: "Invoices", icon: Receipt },
      { href: "/revenue", label: "Financial Overview", icon: CircleDollarSign },
    ],
  },
  {
    id: "system",
    label: "System",
    icon: Settings,
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    id: "support",
    label: "Support",
    icon: LifeBuoy,
    items: [
      { href: "/help", label: "Help Center", icon: HelpCircle },
      { href: "/support", label: "Support", icon: Headphones },
    ],
  },
] as const;

export const allNavItems: NavItem[] = navSections.flatMap((section) => [...section.items]);

export const authRoutes = ["/login", "/forgot-password", "/reset-password"] as const;

export const languages = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇺🇸", dir: "ltr" },
  { code: "so", label: "Soomaali", nativeLabel: "Soomaali", flag: "🇸🇴", dir: "ltr" },
  { code: "fr", label: "Français", nativeLabel: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "es", label: "Español", nativeLabel: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "ar", label: "العربية", nativeLabel: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "tr", label: "Türkçe", nativeLabel: "Türkçe", flag: "🇹🇷", dir: "ltr" },
] as const;
