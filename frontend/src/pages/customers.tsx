import * as React from "react";
import { Link } from "@/lib/navigation";
import { AlertTriangle, ChevronRight, Filter, KeyRound, Pencil, Search, Trash2, UserPlus, Users } from "lucide-react";
import { useLocale } from "@/i18n/locale-context";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useCustomerDialog } from "@/components/customers/customer-dialog-provider";
import { useFleet } from "@/store/fleet-store";
import { cn, formatCurrency, formatCurrencyPrecise } from "@/lib/utils";
import type { Customer } from "@/types";

const PAGE_SIZE = 5;

export default function CustomersPage() {
  const { t } = useLocale();
  const { customers, bookings, vehicles, deleteCustomer } = useFleet();
  const { openCreate, openEdit } = useCustomerDialog();
  const toast = useToast();

  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [tier, setTier] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [pendingDelete, setPendingDelete] = React.useState<Customer | null>(null);

  const topCustomer = React.useMemo(
    () => [...customers].sort((a, b) => b.lifetimeSpend - a.lifetimeSpend)[0],
    [customers],
  );
  const currentReservation = bookings.find((b) => b.status === "active");
  const reservationCustomer = customers.find((c) => c.id === currentReservation?.customerId);
  const reservationVehicle = vehicles.find((v) => v.id === currentReservation?.vehicleId);
  const expiringLicense = customers.find((c) => c.licenseExpiry.includes("2026"));

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers
      .filter((c) => status === "all" || c.status === status)
      .filter((c) => tier === "all" || c.tier === tier)
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.license.toLowerCase().includes(q),
      );
  }, [customers, query, status, tier]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  React.useEffect(() => setPage(1), [query, status, tier]);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title={t("page.customers.title")}
        description={t("page.customers.desc")}
        actions={
          <Button onClick={openCreate}>
            <UserPlus /> New Customer
          </Button>
        }
      />

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {topCustomer ? (
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
            <Badge className="bg-emerald-500/20 text-emerald-200">{topCustomer.tier.toUpperCase()}</Badge>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-2xl font-bold">{topCustomer.name}</p>
                <p className="mt-4 text-sm text-white/70">
                  Elite member since {topCustomer.memberSince} · {topCustomer.totalRentals} rentals
                </p>
                <p className="text-lg font-semibold">{formatCurrency(topCustomer.lifetimeSpend)} total spend</p>
                <Link href={`/customers/${topCustomer.id}`} className="mt-3 inline-block text-sm font-semibold text-blue-300 hover:underline">
                  View profile →
                </Link>
              </div>
              <Avatar src={topCustomer.avatar} name={topCustomer.name} className="size-16 ring-white/30" />
            </div>
          </Card>
        ) : null}

        <Card className="p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            <KeyRound className="size-4" /> Current Reservation
          </p>
          {currentReservation && reservationCustomer && reservationVehicle ? (
            <>
              <p className="mt-2 text-lg font-bold">{reservationCustomer.name}</p>
              <p className="text-muted-foreground">{reservationVehicle.name}</p>
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Due back</span>
                  <span className="font-semibold">{currentReservation.return}</span>
                </div>
                <Progress value={72} />
              </div>
              <Link
                href={`/bookings/${currentReservation.id}`}
                className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Manage booking →
              </Link>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No active reservations right now.</p>
          )}
        </Card>

        <Card className="border-red-100 bg-red-50/60 p-6 dark:border-red-500/20 dark:bg-red-500/5">
          <div className="flex gap-3">
            <AlertTriangle className="size-6 shrink-0 text-red-500" />
            <div className="min-w-0">
              <p className="font-bold text-red-700 dark:text-red-400">License Expiring</p>
              {expiringLicense ? (
                <>
                  <p className="truncate text-sm text-red-600/80 dark:text-red-300/80">
                    {expiringLicense.name} · {expiringLicense.license}
                  </p>
                  <p className="text-xs text-red-600/70 dark:text-red-300/70">Expires {expiringLicense.licenseExpiry}</p>
                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        title: "Reminder sent",
                        description: `${expiringLicense.name} was notified about the expiring licence.`,
                      })
                    }
                    className="mt-3 text-sm font-semibold text-red-600 hover:underline dark:text-red-400"
                  >
                    Notify Customer →
                  </button>
                </>
              ) : (
                <p className="text-sm text-red-600/80">All customer licences are valid.</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4">
            <div className="min-w-[220px] flex-1">
              <Input
                placeholder="Search name, email or licence..."
                icon={<Search />}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search customers"
                className="h-10"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10 w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All customers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger className="h-10 w-[170px]">
                <span className="flex items-center gap-2">
                  <Filter className="size-4 text-muted-foreground" />
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tiers</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Showing {visible.length} of {filtered.length}
            </p>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              icon={<Users />}
              title="No customers found"
              description="Adjust your filters or add a new customer to get started."
              className="m-6 border-0"
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Customer Name</TH>
                  <TH>Contact Info</TH>
                  <TH>License Number</TH>
                  <TH>History</TH>
                  <TH>Balance</TH>
                  <TH>Status</TH>
                  <TH />
                </TR>
              </THead>
              <TBody>
                {visible.map((c) => (
                  <TR key={c.id}>
                    <TD>
                      <Link href={`/customers/${c.id}`} className="flex items-center gap-3 font-medium hover:text-primary">
                        <Avatar src={c.avatar} name={c.name} />
                        <span>
                          {c.name}
                          <Badge className="ml-2" variant={c.tier === "vip" || c.tier === "platinum" ? "default" : "muted"}>
                            {c.tier.toUpperCase()}
                          </Badge>
                        </span>
                      </Link>
                    </TD>
                    <TD className="text-sm text-muted-foreground">
                      {c.email}
                      <br />
                      {c.phone}
                    </TD>
                    <TD>{c.license}</TD>
                    <TD>{c.trips} trips</TD>
                    <TD className={cn(c.balance > 0 && "font-semibold text-red-500")}>
                      {formatCurrencyPrecise(c.balance)}
                    </TD>
                    <TD>
                      <Badge variant={c.status === "active" ? "success" : c.status === "pending" ? "warning" : "muted"} dot>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${c.name}`}
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${c.name}`}
                          onClick={() => setPendingDelete(c)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                        <Link href={`/customers/${c.id}`} aria-label={`Open ${c.name}`}>
                          <ChevronRight className="size-4 text-muted-foreground transition hover:text-primary" />
                        </Link>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}

          {filtered.length > 0 ? (
            <div className="border-t border-border px-6 py-4">
              <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Total Customers" value={customers.length.toLocaleString()} hint="Directory" />
        <Metric
          title="Active Renters"
          value={String(customers.filter((c) => c.status === "active").length)}
          hint="Current"
          muted
        />
        <Metric
          title="Pending"
          value={String(customers.filter((c) => c.status === "pending").length)}
          hint="Review"
          danger
        />
        <Metric
          title="VIP / Platinum"
          value={String(customers.filter((c) => c.tier === "vip" || c.tier === "platinum").length)}
          hint="Premium"
        />
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete customer?"
        description={
          pendingDelete
            ? `${pendingDelete.name} will be removed. Customers with bookings cannot be deleted.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            await deleteCustomer(pendingDelete.id);
            toast({
              title: "Customer deleted",
              description: `${pendingDelete.name} was removed.`,
              tone: "warning",
            });
            setPendingDelete(null);
          } catch (err) {
            toast({
              title: "Delete failed",
              description: err instanceof Error ? err.message : "Could not delete customer.",
              tone: "error",
            });
          }
        }}
      />
    </div>
  );
}

function Metric({
  title,
  value,
  hint,
  muted,
  danger,
}: {
  title: string;
  value: string;
  hint: string;
  muted?: boolean;
  danger?: boolean;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className={cn("mt-1 text-sm font-semibold", danger ? "text-red-500" : muted ? "text-muted-foreground" : "text-emerald-600")}>
        {hint}
      </p>
    </Card>
  );
}
