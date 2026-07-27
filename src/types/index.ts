export type VehicleStatus = "available" | "rented" | "maintenance" | "reserved";
export type BookingStatus = "active" | "pending" | "completed" | "overdue" | "cancelled";
export type PaymentStatus = "success" | "pending" | "failed" | "refunded";
export type CustomerTier = "standard" | "gold" | "platinum" | "vip";
export type FuelType = "Electric" | "Gasoline" | "Diesel" | "Hybrid";
export type Transmission = "Automatic" | "Manual";
export type VehicleCategory = "Sedan" | "SUV" | "Luxury" | "Van" | "Pickup" | "Hatchback";

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  name: string;
  plate: string;
  category: VehicleCategory;
  status: VehicleStatus;
  fuel: FuelType;
  engine: string;
  transmission: Transmission;
  dailyRate: number;
  image: string;
  year: number;
  mileage: number;
  seats: number;
  location: string;
  health: number;
  nextServiceDue: string;
  insuranceExpiry: string;
  registrationExpiry: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  license: string;
  licenseExpiry: string;
  tier: CustomerTier;
  status: "active" | "pending" | "inactive";
  avatar: string;
  memberSince: number;
  totalRentals: number;
  lifetimeSpend: number;
  loyaltyProgress: number;
  balance: number;
  trips: number;
}

export interface Booking {
  id: string;
  customerId: string;
  vehicleId: string;
  status: BookingStatus;
  pickup: string;
  return: string;
  pickupLocation: string;
  amount: number;
  paymentStatus: PaymentStatus;
}

export interface Transaction {
  id: string;
  date: string;
  bookingId: string;
  customer: string;
  method: string;
  amount: number;
  status: PaymentStatus;
}

export interface NotificationItem {
  id: string;
  category: "maintenance" | "booking" | "payment" | "vehicle" | "system";
  title: string;
  description: string;
  time: string;
  accent: "red" | "blue" | "green" | "orange" | "indigo";
  read: boolean;
  actions: { label: string; primary?: boolean }[];
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  license: string;
  licenseStatus: "valid" | "expiring" | "expired";
  licenseExpiry: string;
  rating: number;
  trips: number;
  performance: number;
  availability: "available" | "on-trip" | "off-duty";
  assignedVehicleId?: string;
  emergencyContact: { name: string; phone: string };
  documents: { label: string; status: "verified" | "pending" | "expired" }[];
}

export interface Invoice {
  id: string;
  customer: string;
  issued: string;
  amount: number;
  due: string;
  status: "paid" | "pending" | "overdue";
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: "check" | "payment" | "maintenance" | "user";
}

export interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "bank" | "wallet";
  label: string;
  detail: string;
  meta?: string;
  isDefault?: boolean;
  verified?: boolean;
}

export type MaintenanceType = "Oil Change" | "Tyre Replacement" | "Brake Service" | "Insurance" | "Registration" | "Inspection";

export interface MaintenanceTask {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  dueDate: string;
  cost: number;
  garage: string;
  priority: "high" | "medium" | "low";
  status: "scheduled" | "in-progress" | "completed";
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  date: string;
  type: MaintenanceType;
  cost: number;
  notes: string;
  odometer: number;
}

export interface Expense {
  category: string;
  share: number;
  amount: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "Owner" | "Fleet Manager" | "Dispatcher" | "Accountant" | "Viewer";
  lastActive: string;
}

export interface ApiKey {
  id: string;
  label: string;
  token: string;
  created: string;
  scope: "read" | "write" | "admin";
}
