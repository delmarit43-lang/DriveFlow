import type {
  Booking,
  BookingStatus,
  Customer,
  Driver,
  Invoice,
  MaintenanceTask,
  NotificationItem,
  PaymentMethod,
  Transaction,
  Vehicle,
} from "@/types";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

const ACCESS_KEY = "driveflow_access_token";
const REFRESH_KEY = "driveflow_refresh_token";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsSummary = {
  dashboardStats: {
    totalVehicles: number;
    available: number;
    activeRentals: number;
    monthlyRevenue: number;
    pendingPayments: number;
    inMaintenance: number;
    regions: number;
    utilizationRate: number;
    activeRenters: number;
    lateReturns: number;
    newThisMonth: number;
  };
  fleetMix: { name: string; value: number; color: string }[];
  revenueChart: { month: string; value: number; bookings: number }[];
  yearlyRevenueChart: { month: string; value: number; bookings: number }[];
  mostRentedVehicles: { name: string; rentals: number; revenue: number }[];
  expenseCategories: { category: string; share: number; amount: number }[];
  spendTrend: { month: string; actual: number; previous: number }[];
  activities: {
    id: string;
    title: string;
    description: string;
    time: string;
    icon: "check" | "payment" | "maintenance" | "user";
  }[];
  driverLeaderboard: {
    id: string;
    name: string;
    trips: number;
    rating: number;
    performance: number;
  }[];
};

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshRes = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!refreshRes.ok) {
          clearTokens();
          return null;
        }
        const data = (await refreshRes.json()) as { accessToken: string; refreshToken: string };
        setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      } catch {
        clearTokens();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function request<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}/api/v1${path}`, { ...init, headers });

  if (
    res.status === 401 &&
    retry &&
    !path.startsWith("/auth/login") &&
    !path.startsWith("/auth/register") &&
    !path.startsWith("/auth/refresh") &&
    !path.startsWith("/auth/forgot-password") &&
    !path.startsWith("/auth/reset-password")
  ) {
    const next = await refreshAccessToken();
    if (next) return request<T>(path, init, false);
  }

  if (!res.ok) {
    let message = res.statusText || "Request failed";
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function fetchFleetSummary() {
  return request<AnalyticsSummary>("/analytics/summary");
}

export const api = {
  health: () => request<{ ok: boolean; database: string }>("/health"),

  register: (body: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role?: AuthUser["role"];
  }) =>
    request<{ user: AuthUser; accessToken: string; refreshToken: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ user: AuthUser; accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await request("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        /* ignore */
      }
    }
    clearTokens();
  },

  forgotPassword: (email: string) =>
    request<{ ok: boolean }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (body: { token: string; newPassword: string }) =>
    request<{ ok: boolean }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  profile: () => request<AuthUser>("/auth/profile"),

  updateProfile: (body: Partial<Pick<AuthUser, "fullName" | "phone" | "profileImage" | "email">>) =>
    request<AuthUser>("/auth/profile", { method: "PATCH", body: JSON.stringify(body) }),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<{ ok: boolean }>("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  listVehicles: () => request<Vehicle[]>("/vehicles"),
  getVehicle: (id: string) => request<Vehicle>(`/vehicles/${id}`),
  createVehicle: (body: Omit<Vehicle, "id"> & { id?: string }) =>
    request<Vehicle>("/vehicles", { method: "POST", body: JSON.stringify(body) }),
  updateVehicle: (id: string, body: Partial<Vehicle>) =>
    request<Vehicle>(`/vehicles/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteVehicle: (id: string) => request<void>(`/vehicles/${id}`, { method: "DELETE" }),

  listCustomers: () => request<Customer[]>("/customers"),
  getCustomer: (id: string) => request<Customer>(`/customers/${id}`),
  createCustomer: (body: Omit<Customer, "id"> & { id?: string }) =>
    request<Customer>("/customers", { method: "POST", body: JSON.stringify(body) }),
  updateCustomer: (id: string, body: Partial<Customer>) =>
    request<Customer>(`/customers/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteCustomer: (id: string) => request<void>(`/customers/${id}`, { method: "DELETE" }),

  listBookings: () => request<Booking[]>("/bookings"),
  getBooking: (id: string) => request<Booking>(`/bookings/${id}`),
  createBooking: (body: Omit<Booking, "id"> & { id?: string }) =>
    request<Booking>("/bookings", { method: "POST", body: JSON.stringify(body) }),
  updateBooking: (id: string, body: Partial<Booking>) =>
    request<Booking>(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  setBookingStatus: (id: string, status: BookingStatus) =>
    request<Booking>(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteBooking: (id: string) => request<void>(`/bookings/${id}`, { method: "DELETE" }),

  listDrivers: () => request<Driver[]>("/drivers"),
  createDriver: (body: Omit<Driver, "id" | "licenseStatus"> & { id?: string }) =>
    request<Driver>("/drivers", { method: "POST", body: JSON.stringify(body) }),
  updateDriver: (id: string, body: Partial<Driver>) =>
    request<Driver>(`/drivers/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteDriver: (id: string) => request<void>(`/drivers/${id}`, { method: "DELETE" }),

  listPayments: () => request<Transaction[]>("/payments"),
  createPayment: (body: {
    bookingId?: string;
    customerId?: string;
    vehicleId?: string;
    amount: number;
    method?: string;
    status?: string;
  }) => request<Transaction>("/payments", { method: "POST", body: JSON.stringify(body) }),

  listPaymentMethods: () => request<PaymentMethod[]>("/payment-methods"),
  createPaymentMethod: (body: Omit<PaymentMethod, "id">) =>
    request<PaymentMethod>("/payment-methods", { method: "POST", body: JSON.stringify(body) }),
  setDefaultPaymentMethod: (id: string) =>
    request<PaymentMethod>(`/payment-methods/${id}/default`, { method: "POST" }),
  deletePaymentMethod: (id: string) =>
    request<void>(`/payment-methods/${id}`, { method: "DELETE" }),

  listInvoices: () => request<Invoice[]>("/invoices"),
  createInvoice: (body: {
    customerId?: string;
    bookingId?: string;
    amount: number;
    dueAt?: string;
    status?: string;
  }) => request<Invoice>("/invoices", { method: "POST", body: JSON.stringify(body) }),

  listMaintenance: () => request<MaintenanceTask[]>("/maintenance"),
  createMaintenance: (body: Omit<MaintenanceTask, "id">) =>
    request<MaintenanceTask>("/maintenance", { method: "POST", body: JSON.stringify(body) }),
  completeMaintenance: (id: string) =>
    request<MaintenanceTask>(`/maintenance/${id}/complete`, { method: "POST" }),
  deleteMaintenance: (id: string) =>
    request<void>(`/maintenance/${id}`, { method: "DELETE" }),

  listNotifications: () => request<NotificationItem[]>("/notifications"),
  markNotificationRead: (id: string) =>
    request<NotificationItem>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () =>
    request<{ ok: boolean }>("/notifications/read-all", { method: "POST" }),
  deleteNotification: (id: string) =>
    request<void>(`/notifications/${id}`, { method: "DELETE" }),

  analyticsSummary: () => request<AnalyticsSummary>("/analytics/summary"),
};
