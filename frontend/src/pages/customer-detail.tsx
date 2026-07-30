import * as React from "react";
import { Link, useParams, useRouter } from "@/lib/navigation";
import {
  BadgeCheck,
  CalendarPlus,
  Camera,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
  ImagePlus,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { useBookingDialog } from "@/components/bookings/booking-dialog-provider";
import { useCustomerDialog } from "@/components/customers/customer-dialog-provider";
import { useFleet } from "@/store/fleet-store";
import { fileToAvatarDataUrl } from "@/store/user-profile-store";
import { bookingStatusMeta } from "@/lib/status";
import { cn, downloadFile, formatCurrencyPrecise, toCsv } from "@/lib/utils";

export default function CustomerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { customers, bookings, vehicles, updateCustomer, deleteCustomer } = useFleet();
  const booking = useBookingDialog();
  const { openEdit } = useCustomerDialog();
  const toast = useToast();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const customer = customers.find((c) => c.id === id);

  if (!customer) {
    return (
      <div className="mx-auto max-w-[900px] py-10">
        <EmptyState
          icon={<Users />}
          title="Customer not found"
          description="This profile is no longer available."
          action={
            <Button asChild>
              <Link href="/customers">Back to directory</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const myBookings = bookings.filter((b) => b.customerId === customer.id);
  const past = myBookings.filter((b) => b.status === "completed" || b.status === "cancelled");
  const upcoming = myBookings.filter((b) => b.status === "active" || b.status === "pending" || b.status === "overdue");
  const hasCustomPhoto = Boolean(customer.avatar);

  const onPickPhoto = () => fileRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      await updateCustomer(customer.id, { avatar: dataUrl });
      toast({
        title: "Photo updated",
        description: `${customer.name}'s profile photo was saved.`,
        tone: "success",
      });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Could not upload this image.",
        tone: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const onRemovePhoto = async () => {
    try {
      await updateCustomer(customer.id, { avatar: "" });
      toast({ title: "Photo removed", description: "Default avatar restored.", tone: "info" });
    } catch (err) {
      toast({
        title: "Remove failed",
        description: err instanceof Error ? err.message : "Could not remove photo.",
        tone: "error",
      });
    }
  };

  const exportHistory = () => {
    downloadFile(
      `${customer.name.toLowerCase().replace(/\s+/g, "-")}-rental-history.csv`,
      toCsv(
        myBookings.map((b) => ({
          Booking: b.id,
          Vehicle: vehicles.find((v) => v.id === b.vehicleId)?.name ?? "—",
          Pickup: b.pickup,
          Return: b.return,
          Status: b.status,
          Amount: b.amount,
        })),
      ),
    );
    toast({ title: "History exported", description: `${myBookings.length} bookings downloaded as CSV.` });
  };

  const renderRows = (rows: typeof myBookings) =>
    rows.length === 0 ? (
      <p className="py-10 text-center text-sm text-muted-foreground">Nothing to show here yet.</p>
    ) : (
      <ul className="divide-y divide-border">
        {rows.map((row) => {
          const vehicle = vehicles.find((v) => v.id === row.vehicleId);
          const meta = bookingStatusMeta[row.status];
          return (
            <li key={row.id} className="flex flex-wrap items-center gap-4 py-4">
              {vehicle ? (
                <img src={vehicle.image} alt="" className="size-14 rounded-xl object-cover" />
              ) : (
                <span className="size-14 rounded-xl bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{vehicle?.name ?? "Unassigned vehicle"}</p>
                <p className="text-sm text-muted-foreground">
                  {vehicle ? `${vehicle.fuel} · ${vehicle.plate}` : row.pickupLocation}
                </p>
              </div>
              <div className="text-sm">
                <p className="font-medium">
                  {row.pickup} – {row.return}
                </p>
                <p className="text-muted-foreground">{row.pickupLocation}</p>
              </div>
              <Badge variant={meta.variant} dot>
                {meta.label}
              </Badge>
              <p className="font-bold">{formatCurrencyPrecise(row.amount)}</p>
              <Link href={`/bookings/${row.id}`} aria-label={`Open ${row.id}`}>
                <ChevronRight className="size-4 text-muted-foreground transition hover:text-primary" />
              </Link>
            </li>
          );
        })}
      </ul>
    );

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Customer Profile"
        breadcrumbs={[{ label: "Customers", href: "/customers" }, { label: customer.name }]}
        actions={
          <>
            <Button variant="secondary" onClick={() => openEdit(customer)}>
              <Pencil /> Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 /> Delete
            </Button>
            <Button onClick={() => booking.setOpen(true)}>
              <CalendarPlus /> New booking
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Card className="p-6 text-center">
            <div className="relative mx-auto w-fit">
              <Avatar src={customer.avatar} name={customer.name} className="size-28 ring-4 ring-primary/10" />
              <button
                type="button"
                onClick={onPickPhoto}
                disabled={uploading}
                aria-label="Change customer photo"
                className={cn(
                  "absolute bottom-1 left-1 flex size-9 items-center justify-center rounded-full",
                  "bg-primary text-primary-foreground shadow-lift",
                  "ring-2 ring-card transition hover:brightness-110",
                  "disabled:opacity-60",
                )}
              >
                <Camera className="size-4" />
              </button>
              <BadgeCheck className="absolute bottom-1 right-1 size-7 rounded-full bg-emerald-500 p-1 text-white" />
            </div>
            <h2 className="mt-4 text-xl font-bold">{customer.name}</h2>
            <Badge className="mt-2">{customer.tier.toUpperCase()}</Badge>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button type="button" size="sm" onClick={onPickPhoto} disabled={uploading}>
                <ImagePlus /> {uploading ? "Uploading…" : "Upload photo"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={onRemovePhoto}
                disabled={uploading || !hasCustomPhoto}
              >
                <Trash2 /> Remove
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">JPG, PNG or WebP · max 5 MB</p>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={onFileChange}
            />

            <ul className="mt-6 space-y-3 text-left text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Mail className="mt-0.5 size-4 shrink-0" />
                <span className="break-all">{customer.email}</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Phone className="mt-0.5 size-4 shrink-0" /> {customer.phone}
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" /> {customer.address}
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <CreditCard className="mt-0.5 size-4 shrink-0" />
                <span>
                  {customer.license}
                  <span className="block text-xs">Expires {customer.licenseExpiry}</span>
                </span>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Membership status</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-primary/10">
                <p className="text-xs text-muted-foreground">Since</p>
                <p className="font-bold">{customer.memberSince}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-primary/10">
                <p className="text-xs text-muted-foreground">Total Rentals</p>
                <p className="font-bold">{customer.totalRentals}</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">To Diamond Tier</span>
                <span className="font-bold text-primary">{customer.loyaltyProgress}%</span>
              </div>
              <Progress value={customer.loyaltyProgress} className="mt-2" />
            </div>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total lifetime spend</p>
                <p className="text-xl font-bold">{formatCurrencyPrecise(customer.lifetimeSpend)}</p>
              </div>
              <Button variant="secondary" size="icon" aria-label="Export statement" onClick={exportHistory}>
                <FileText />
              </Button>
            </div>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="history">
              <TabsList>
                <TabsTrigger value="history">Rental History</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="history">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-semibold">Chronological History</h3>
                  <Button variant="secondary" size="sm" onClick={exportHistory}>
                    <Download /> Export
                  </Button>
                </div>
                {renderRows(past.length ? past : myBookings)}
              </TabsContent>

              <TabsContent value="upcoming">{renderRows(upcoming)}</TabsContent>

              <TabsContent value="documents">
                <ul className="space-y-3">
                  {[
                    {
                      label: "Driving licence",
                      detail: `${customer.license} · expires ${customer.licenseExpiry}`,
                      status: "Verified",
                    },
                    { label: "Proof of insurance", detail: "Uploaded on registration", status: "Verified" },
                    {
                      label: "Identity document",
                      detail: "Passport scan",
                      status: customer.status === "pending" ? "Pending" : "Verified",
                    },
                  ].map((doc) => (
                    <li
                      key={doc.label}
                      className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">{doc.label}</p>
                        <p className="truncate text-sm text-muted-foreground">{doc.detail}</p>
                      </div>
                      <Badge variant={doc.status === "Verified" ? "success" : "warning"} dot>
                        {doc.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete customer?"
        description={`${customer.name} will be removed from the directory. Customers with bookings cannot be deleted.`}
        confirmLabel="Delete customer"
        destructive
        onConfirm={async () => {
          try {
            await deleteCustomer(customer.id);
            toast({ title: "Customer deleted", description: `${customer.name} was removed.`, tone: "warning" });
            router.push("/customers");
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
