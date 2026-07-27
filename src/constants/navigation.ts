import {
  BarChart3,
  Bell,
  CalendarDays,
  Car,
  CreditCard,
  FileText,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  Receipt,
  Settings,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";

export const BRAND = {
  name: "DriveFlow",
  tagline: "Smart Fleet & Car Rental Management Platform",
  adminLabel: "Enterprise Admin",
} as const;

export const CURRENT_USER = {
  name: "Alex Rivera",
  role: "Fleet Manager",
  company: "DriveFlow Enterprise",
  email: "alex.rivera@driveflow.com",
  avatar: "https://i.pravatar.cc/240?u=alex-rivera",
} as const;

/** Primary sidebar — matches Ui/Ux reference screens */
export const mainNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vehicles", label: "Vehicles", icon: Car },
  { href: "/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/drivers", label: "Drivers", icon: UserRound },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/analytics", label: "Analytics", icon: Gauge },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export const secondaryNav = [
  { href: "/revenue", label: "Financial Overview", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/help", label: "Help Center", icon: HelpCircle },
] as const;

export const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "so", label: "Soomaali", flag: "🇸🇴" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
] as const;

export const authRoutes = ["/login", "/forgot-password"] as const;
