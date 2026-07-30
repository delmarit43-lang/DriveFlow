import type {
  Booking,
  BookingStatus,
  Customer,
  CustomerStatus,
  CustomerTier,
  Driver,
  DriverAvailability,
  Invoice,
  InvoiceStatus,
  Maintenance,
  MaintenanceStatus,
  Notification,
  NotificationCategory,
  Payment,
  PaymentMethod,
  PaymentStatus,
  User,
  Vehicle,
  VehicleStatus,
} from "@prisma/client";

const vehicleStatusToApi: Record<VehicleStatus, string> = {
  AVAILABLE: "available",
  BOOKED: "reserved",
  RENTED: "rented",
  MAINTENANCE: "maintenance",
};

const vehicleStatusFromApi: Record<string, VehicleStatus> = {
  available: "AVAILABLE",
  reserved: "BOOKED",
  booked: "BOOKED",
  rented: "RENTED",
  maintenance: "MAINTENANCE",
};

const bookingStatusToApi: Record<BookingStatus, string> = {
  PENDING: "pending",
  ACTIVE: "active",
  COMPLETED: "completed",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
};

const bookingStatusFromApi: Record<string, BookingStatus> = {
  pending: "PENDING",
  active: "ACTIVE",
  completed: "COMPLETED",
  overdue: "OVERDUE",
  cancelled: "CANCELLED",
};

const paymentStatusToApi: Record<PaymentStatus, string> = {
  SUCCESS: "success",
  PENDING: "pending",
  FAILED: "failed",
  REFUNDED: "refunded",
};

const paymentStatusFromApi: Record<string, PaymentStatus> = {
  success: "SUCCESS",
  pending: "PENDING",
  failed: "FAILED",
  refunded: "REFUNDED",
};

const tierToApi: Record<CustomerTier, string> = {
  STANDARD: "standard",
  GOLD: "gold",
  PLATINUM: "platinum",
  VIP: "vip",
};

const tierFromApi: Record<string, CustomerTier> = {
  standard: "STANDARD",
  gold: "GOLD",
  platinum: "PLATINUM",
  vip: "VIP",
};

const customerStatusToApi: Record<CustomerStatus, string> = {
  ACTIVE: "active",
  PENDING: "pending",
  INACTIVE: "inactive",
};

const customerStatusFromApi: Record<string, CustomerStatus> = {
  active: "ACTIVE",
  pending: "PENDING",
  inactive: "INACTIVE",
};

const driverAvailabilityToApi: Record<DriverAvailability, string> = {
  AVAILABLE: "available",
  ON_TRIP: "on-trip",
  OFF_DUTY: "off-duty",
};

const driverAvailabilityFromApi: Record<string, DriverAvailability> = {
  available: "AVAILABLE",
  "on-trip": "ON_TRIP",
  on_trip: "ON_TRIP",
  "off-duty": "OFF_DUTY",
  off_duty: "OFF_DUTY",
};

const maintenanceStatusToApi: Record<MaintenanceStatus, string> = {
  PENDING: "scheduled",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
};

const maintenanceStatusFromApi: Record<string, MaintenanceStatus> = {
  scheduled: "PENDING",
  pending: "PENDING",
  "in-progress": "IN_PROGRESS",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
};

const invoiceStatusToApi: Record<InvoiceStatus, string> = {
  PAID: "paid",
  PENDING: "pending",
  OVERDUE: "overdue",
};

const invoiceStatusFromApi: Record<string, InvoiceStatus> = {
  paid: "PAID",
  pending: "PENDING",
  overdue: "OVERDUE",
};

const notificationCategoryToApi: Record<NotificationCategory, string> = {
  MAINTENANCE: "maintenance",
  BOOKING: "booking",
  PAYMENT: "payment",
  VEHICLE: "vehicle",
  SYSTEM: "system",
};

const notificationCategoryFromApi: Record<string, NotificationCategory> = {
  maintenance: "MAINTENANCE",
  booking: "BOOKING",
  payment: "PAYMENT",
  vehicle: "VEHICLE",
  system: "SYSTEM",
};

const accentByCategory: Record<string, string> = {
  maintenance: "orange",
  booking: "blue",
  payment: "green",
  vehicle: "indigo",
  system: "red",
};

function licenseStatusFromExpiry(expiry: string): "valid" | "expiring" | "expired" {
  if (!expiry) return "valid";
  const date = new Date(expiry);
  if (Number.isNaN(date.getTime())) return "valid";
  const days = (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return "expired";
  if (days <= 30) return "expiring";
  return "valid";
}

function relativeTime(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function mapVehicleStatusFromApi(value?: string): VehicleStatus | undefined {
  if (!value) return undefined;
  return vehicleStatusFromApi[value.toLowerCase()];
}

export function mapBookingStatusFromApi(value?: string): BookingStatus | undefined {
  if (!value) return undefined;
  return bookingStatusFromApi[value.toLowerCase()];
}

export function mapPaymentStatusFromApi(value?: string): PaymentStatus | undefined {
  if (!value) return undefined;
  return paymentStatusFromApi[value.toLowerCase()];
}

export function mapTierFromApi(value?: string): CustomerTier | undefined {
  if (!value) return undefined;
  return tierFromApi[value.toLowerCase()];
}

export function mapCustomerStatusFromApi(value?: string): CustomerStatus | undefined {
  if (!value) return undefined;
  return customerStatusFromApi[value.toLowerCase()];
}

export function mapDriverAvailabilityFromApi(value?: string): DriverAvailability | undefined {
  if (!value) return undefined;
  return driverAvailabilityFromApi[value.toLowerCase()];
}

export function mapMaintenanceStatusFromApi(value?: string): MaintenanceStatus | undefined {
  if (!value) return undefined;
  return maintenanceStatusFromApi[value.toLowerCase()];
}

export function mapInvoiceStatusFromApi(value?: string): InvoiceStatus | undefined {
  if (!value) return undefined;
  return invoiceStatusFromApi[value.toLowerCase()];
}

export function mapNotificationCategoryFromApi(value?: string): NotificationCategory | undefined {
  if (!value) return undefined;
  return notificationCategoryFromApi[value.toLowerCase()];
}

export function toVehicleDto(v: Vehicle) {
  return {
    id: v.id,
    brand: v.brand,
    model: v.model,
    name: v.name,
    plate: v.plate,
    category: v.category,
    status: vehicleStatusToApi[v.status],
    fuel: v.fuel,
    engine: v.engine,
    transmission: v.transmission,
    dailyRate: Number(v.dailyRate),
    image: v.image,
    year: v.year,
    mileage: v.mileage,
    seats: v.seats,
    location: v.location,
    health: v.health,
    nextServiceDue: v.nextServiceDue,
    insuranceExpiry: v.insuranceExpiry,
    registrationExpiry: v.registrationExpiry,
  };
}

export function toCustomerDto(c: Customer) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    address: c.address,
    license: c.license,
    licenseExpiry: c.licenseExpiry,
    tier: tierToApi[c.tier],
    status: customerStatusToApi[c.status],
    avatar: c.avatar,
    memberSince: c.memberSince,
    totalRentals: c.totalRentals,
    lifetimeSpend: Number(c.lifetimeSpend),
    loyaltyProgress: c.loyaltyProgress,
    balance: Number(c.balance),
    trips: c.trips,
  };
}

export function toBookingDto(b: Booking) {
  return {
    id: b.id,
    customerId: b.customerId,
    vehicleId: b.vehicleId,
    status: bookingStatusToApi[b.status],
    pickup: b.pickup,
    return: b.returnDate,
    pickupLocation: b.pickupLocation,
    amount: Number(b.amount),
    paymentStatus: paymentStatusToApi[b.paymentStatus],
  };
}

export function toUserDto(u: User) {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    profileImage: u.profileImage,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export function toDriverDto(d: Driver) {
  const documents = Array.isArray(d.documents)
    ? (d.documents as { label: string; status: string }[])
    : [];
  return {
    id: d.id,
    name: d.name,
    email: d.email,
    phone: d.phone,
    avatar: d.avatar,
    license: d.license,
    licenseStatus: licenseStatusFromExpiry(d.licenseExpiry),
    licenseExpiry: d.licenseExpiry,
    rating: d.rating,
    trips: d.trips,
    performance: d.performance,
    availability: driverAvailabilityToApi[d.availability],
    assignedVehicleId: d.assignedVehicleId ?? undefined,
    emergencyContact: {
      name: d.emergencyContactName,
      phone: d.emergencyContactPhone,
    },
    documents,
  };
}

export function toPaymentDto(p: Payment & { customer?: Customer | null }) {
  return {
    id: p.id,
    date: (p.paidAt ?? p.createdAt).toISOString().slice(0, 10),
    bookingId: p.bookingId ?? "",
    customer: p.customer?.name ?? "—",
    customerId: p.customerId ?? undefined,
    vehicleId: p.vehicleId ?? undefined,
    method: p.method,
    amount: Number(p.amount),
    status: paymentStatusToApi[p.status],
  };
}

export function toInvoiceDto(inv: Invoice & { customer?: Customer | null }) {
  return {
    id: inv.id,
    customer: inv.customer?.name ?? "—",
    customerId: inv.customerId ?? undefined,
    bookingId: inv.bookingId ?? undefined,
    issued: inv.issuedAt.toISOString().slice(0, 10),
    amount: Number(inv.amount),
    due: (inv.dueAt ?? inv.issuedAt).toISOString().slice(0, 10),
    status: invoiceStatusToApi[inv.status],
  };
}

export function toMaintenanceDto(m: Maintenance) {
  return {
    id: m.id,
    vehicleId: m.vehicleId,
    type: m.title,
    dueDate: m.dueDate,
    cost: Number(m.cost),
    garage: m.garage,
    priority: m.priority as "high" | "medium" | "low",
    status: maintenanceStatusToApi[m.status],
    description: m.description,
  };
}

export function toNotificationDto(n: Notification) {
  const category = notificationCategoryToApi[n.category];
  return {
    id: n.id,
    category,
    title: n.title,
    description: n.description,
    time: relativeTime(n.createdAt),
    accent: accentByCategory[category] ?? "indigo",
    read: n.read,
    actions: n.read ? [] : [{ label: "Review", primary: true }],
  };
}

export function toPaymentMethodDto(m: PaymentMethod) {
  return {
    id: m.id,
    type: m.type,
    label: m.label,
    detail: m.detail,
    meta: m.meta || undefined,
    isDefault: m.isDefault,
    verified: m.verified,
  };
}
