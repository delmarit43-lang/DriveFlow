import type {
  ActivityItem,
  ApiKey,
  Booking,
  Customer,
  Driver,
  Expense,
  Invoice,
  MaintenanceTask,
  NotificationItem,
  PaymentMethod,
  ServiceRecord,
  TeamMember,
  Transaction,
  Vehicle,
} from "@/types";

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const LOC = {
  hargeisaAirport: "Hargeisa Airport Branch",
  maansoor: "Maansoor Business Hub",
  june26: "26 June District Depot",
  berbera: "Berbera Port Depot",
  burco: "Burco Central Station",
  borama: "Borama City Hub",
  gabiley: "Gabiley Service Yard",
  erigavo: "Erigavo Regional Depot",
} as const;

export const vehicles: Vehicle[] = [
  {
    id: "v1",
    brand: "TOYOTA",
    model: "Land Cruiser Prado",
    name: "Toyota Land Cruiser Prado",
    plate: "SL-HGE-4821",
    category: "SUV",
    status: "available",
    fuel: "Diesel",
    engine: "2.8L Turbo Diesel",
    transmission: "Automatic",
    dailyRate: 95,
    image: img("photo-1519641471654-76be92320bf5"),
    year: 2024,
    mileage: 18400,
    seats: 7,
    location: LOC.maansoor,
    health: 96,
    nextServiceDue: "Aug 12, 2026",
    insuranceExpiry: "Mar 01, 2027",
    registrationExpiry: "Jan 18, 2027",
  },
  {
    id: "v2",
    brand: "TOYOTA",
    model: "Hilux",
    name: "Toyota Hilux Double Cab",
    plate: "SL-HGE-2294",
    category: "Pickup",
    status: "rented",
    fuel: "Diesel",
    engine: "2.8L GD Turbo",
    transmission: "Manual",
    dailyRate: 72,
    image: img("photo-1558618666-fcd25c85f82e"),
    year: 2023,
    mileage: 28600,
    seats: 5,
    location: LOC.hargeisaAirport,
    health: 91,
    nextServiceDue: "Sep 02, 2026",
    insuranceExpiry: "Nov 14, 2026",
    registrationExpiry: "Jun 30, 2027",
  },
  {
    id: "v3",
    brand: "TOYOTA",
    model: "Hiace",
    name: "Toyota Hiace Commuter",
    plate: "SL-BRB-1401",
    category: "Van",
    status: "maintenance",
    fuel: "Diesel",
    engine: "2.8L Diesel",
    transmission: "Manual",
    dailyRate: 65,
    image: img("photo-1544620341-1adc1baa8cdd"),
    year: 2022,
    mileage: 58400,
    seats: 14,
    location: LOC.berbera,
    health: 62,
    nextServiceDue: "Jul 30, 2026",
    insuranceExpiry: "Aug 09, 2026",
    registrationExpiry: "Feb 22, 2027",
  },
  {
    id: "v4",
    brand: "MERCEDES-BENZ",
    model: "G-Class",
    name: "Mercedes-Benz G 63 AMG",
    plate: "SL-HGE-9007",
    category: "Luxury",
    status: "rented",
    fuel: "Gasoline",
    engine: "4.0L Biturbo V8",
    transmission: "Automatic",
    dailyRate: 280,
    image: img("photo-1618843479313-40f8afb4b4d8"),
    year: 2024,
    mileage: 9200,
    seats: 5,
    location: LOC.maansoor,
    health: 98,
    nextServiceDue: "Dec 04, 2026",
    insuranceExpiry: "Apr 19, 2027",
    registrationExpiry: "Apr 19, 2027",
  },
  {
    id: "v5",
    brand: "TOYOTA",
    model: "Corolla Cross",
    name: "Toyota Corolla Cross",
    plate: "SL-GBY-3180",
    category: "SUV",
    status: "available",
    fuel: "Hybrid",
    engine: "1.8L Hybrid",
    transmission: "Automatic",
    dailyRate: 58,
    image: img("photo-1621007947382-bb3c3994e3fb"),
    year: 2024,
    mileage: 11200,
    seats: 5,
    location: LOC.gabiley,
    health: 94,
    nextServiceDue: "Oct 18, 2026",
    insuranceExpiry: "Jan 05, 2027",
    registrationExpiry: "Sep 12, 2027",
  },
  {
    id: "v6",
    brand: "NISSAN",
    model: "Patrol",
    name: "Nissan Patrol Y62",
    plate: "SL-HGE-5510",
    category: "SUV",
    status: "available",
    fuel: "Gasoline",
    engine: "5.6L V8",
    transmission: "Automatic",
    dailyRate: 110,
    image: img("photo-1606664515524-ed2f786a0bd6"),
    year: 2023,
    mileage: 22100,
    seats: 7,
    location: LOC.june26,
    health: 89,
    nextServiceDue: "Nov 22, 2026",
    insuranceExpiry: "May 30, 2027",
    registrationExpiry: "Mar 08, 2027",
  },
  {
    id: "v7",
    brand: "HYUNDAI",
    model: "Tucson",
    name: "Hyundai Tucson",
    plate: "SL-BRC-7742",
    category: "SUV",
    status: "reserved",
    fuel: "Gasoline",
    engine: "2.5L Smartstream",
    transmission: "Automatic",
    dailyRate: 55,
    image: img("photo-1617469767053-d3b523a0b982"),
    year: 2023,
    mileage: 19800,
    seats: 5,
    location: LOC.burco,
    health: 92,
    nextServiceDue: "Aug 28, 2026",
    insuranceExpiry: "Dec 11, 2026",
    registrationExpiry: "Jul 01, 2027",
  },
  {
    id: "v8",
    brand: "TOYOTA",
    model: "Camry",
    name: "Toyota Camry",
    plate: "SL-HGE-6610",
    category: "Sedan",
    status: "available",
    fuel: "Hybrid",
    engine: "2.5L Hybrid",
    transmission: "Automatic",
    dailyRate: 48,
    image: img("photo-1623869675781-80aa31012a5a"),
    year: 2024,
    mileage: 14100,
    seats: 5,
    location: LOC.maansoor,
    health: 97,
    nextServiceDue: "Sep 15, 2026",
    insuranceExpiry: "Feb 20, 2027",
    registrationExpiry: "Oct 03, 2027",
  },
  {
    id: "v9",
    brand: "KIA",
    model: "Sportage",
    name: "Kia Sportage",
    plate: "SL-BOR-2290",
    category: "SUV",
    status: "available",
    fuel: "Gasoline",
    engine: "2.0L",
    transmission: "Automatic",
    dailyRate: 52,
    image: img("photo-1609521263047-f8f205293f24"),
    year: 2023,
    mileage: 16700,
    seats: 5,
    location: LOC.borama,
    health: 90,
    nextServiceDue: "Oct 05, 2026",
    insuranceExpiry: "Aug 14, 2027",
    registrationExpiry: "Apr 22, 2027",
  },
  {
    id: "v10",
    brand: "TOYOTA",
    model: "RAV4",
    name: "Toyota RAV4",
    plate: "SL-HGE-3388",
    category: "SUV",
    status: "rented",
    fuel: "Hybrid",
    engine: "2.5L Hybrid",
    transmission: "Automatic",
    dailyRate: 68,
    image: img("photo-1519642918688-7eae5e5bb8f4"),
    year: 2024,
    mileage: 9800,
    seats: 5,
    location: LOC.hargeisaAirport,
    health: 95,
    nextServiceDue: "Dec 12, 2026",
    insuranceExpiry: "Jun 08, 2027",
    registrationExpiry: "Nov 19, 2027",
  },
  {
    id: "v11",
    brand: "LEXUS",
    model: "LX 600",
    name: "Lexus LX 600",
    plate: "SL-HGE-1001",
    category: "Luxury",
    status: "available",
    fuel: "Gasoline",
    engine: "3.5L Twin-Turbo V6",
    transmission: "Automatic",
    dailyRate: 220,
    image: img("photo-1555215695-3004980ad54e"),
    year: 2024,
    mileage: 6400,
    seats: 7,
    location: LOC.maansoor,
    health: 99,
    nextServiceDue: "Jan 10, 2027",
    insuranceExpiry: "Sep 01, 2027",
    registrationExpiry: "Sep 01, 2027",
  },
  {
    id: "v12",
    brand: "ISUZU",
    model: "D-Max",
    name: "Isuzu D-Max",
    plate: "SL-ERV-8840",
    category: "Pickup",
    status: "maintenance",
    fuel: "Diesel",
    engine: "3.0L Turbo Diesel",
    transmission: "Manual",
    dailyRate: 60,
    image: img("photo-1533473359331-0135ef1b58bf"),
    year: 2022,
    mileage: 41200,
    seats: 5,
    location: LOC.erigavo,
    health: 71,
    nextServiceDue: "Jul 28, 2026",
    insuranceExpiry: "Oct 30, 2026",
    registrationExpiry: "May 15, 2027",
  },
];

export const customers: Customer[] = [];

export const bookings: Booking[] = [];

export const transactions: Transaction[] = [];

export const paymentMethods: PaymentMethod[] = [];

export const notifications: NotificationItem[] = [];

export const activities: ActivityItem[] = [];

export const drivers: Driver[] = [];

export const maintenanceTasks: MaintenanceTask[] = [];

export const serviceHistory: ServiceRecord[] = [];

export const invoices: Invoice[] = [];

export const dashboardStats = {
  totalVehicles: 12,
  available: 7,
  activeRentals: 3,
  monthlyRevenue: 0,
  pendingPayments: 0,
  inMaintenance: 2,
  regions: 8,
  utilizationRate: 0,
  totalCustomers: 0,
  activeRenters: 0,
  lateReturns: 0,
  newThisMonth: 0,
};

export const revenueChart: { month: string; value: number; bookings: number }[] = [];

export const yearlyRevenueChart: { month: string; value: number; bookings: number }[] = [];

export const fleetMix: { name: string; value: number; color: string }[] = [
  { name: "Rented", value: 3, color: "#2563EB" },
  { name: "Maintenance", value: 2, color: "#10B981" },
  { name: "Available", value: 7, color: "#93C5FD" },
];

export const spendTrend: { month: string; actual: number; previous: number }[] = [];

export const expenseCategories: Expense[] = [];

export const mostRentedVehicles: { name: string; rentals: number; revenue: number }[] = [];

export const teamMembers: TeamMember[] = [];

export const apiKeys: ApiKey[] = [];

export const messages: {
  id: string;
  from: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
}[] = [];

export const faqs: { question: string; answer: string }[] = [];

export function getCustomer(id: string) {
  return customers.find((c) => c.id === id);
}

export function getVehicle(id: string) {
  return vehicles.find((v) => v.id === id);
}

export function getBooking(id: string) {
  return bookings.find((b) => b.id === id);
}

export function getDriver(id: string) {
  return drivers.find((d) => d.id === id);
}
