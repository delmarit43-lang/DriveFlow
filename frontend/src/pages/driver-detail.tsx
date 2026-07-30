import { Link, useParams } from "@/lib/navigation";
import { Car, Mail, MapPin, Phone, ShieldCheck, Star, UserRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useFleet } from "@/store/fleet-store";
import type { Driver } from "@/types";

const licenceMeta = {
  valid: { label: "Valid", variant: "success" as const },
  expiring: { label: "Expiring soon", variant: "warning" as const },
  expired: { label: "Expired", variant: "danger" as const },
};

const documentMeta = {
  verified: { label: "Verified", variant: "success" as const },
  pending: { label: "Pending", variant: "warning" as const },
  expired: { label: "Expired", variant: "danger" as const },
};

export default function DriverProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { drivers, vehicles, setDriverAvailability } = useFleet();
  const toast = useToast();

  const driver = drivers.find((d) => d.id === id);

  if (!driver) {
    return (
      <div className="mx-auto max-w-[900px] py-10">
        <EmptyState
          icon={<UserRound />}
          title="Driver not found"
          description="This driver is no longer on your roster."
          action={
            <Button asChild>
              <Link href="/drivers">Back to drivers</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const licence = licenceMeta[driver.licenseStatus];
  const assigned = vehicles.find((v) => v.id === driver.assignedVehicleId);

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title={driver.name}
        description="Driver profile, documents, and performance history."
        breadcrumbs={[{ label: "Drivers", href: "/drivers" }, { label: driver.name }]}
        actions={
          <Select
            value={driver.availability}
            onValueChange={(v) => {
              setDriverAvailability(driver.id, v as Driver["availability"]);
              toast({ title: "Availability updated", description: `${driver.name} is now ${v.replace("-", " ")}.` });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="on-trip">On trip</SelectItem>
              <SelectItem value="off-duty">Off duty</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Card className="p-6 text-center">
            <Avatar src={driver.avatar} name={driver.name} className="mx-auto size-28" />
            <h2 className="mt-4 text-xl font-bold">{driver.name}</h2>
            <p className="text-sm text-muted-foreground">{driver.license}</p>
            <div className="mt-3 flex justify-center gap-2">
              <Badge variant={licence.variant} dot>
                Licence {licence.label}
              </Badge>
            </div>
            <ul className="mt-6 space-y-3 text-left text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Mail className="mt-0.5 size-4 shrink-0" />
                <span className="break-all">{driver.email}</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Phone className="mt-0.5 size-4 shrink-0" /> {driver.phone}
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" /> Licence expires {driver.licenseExpiry}
              </li>
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Emergency contact</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="font-semibold">{driver.emergencyContact.name}</p>
              <p className="text-sm text-muted-foreground">{driver.emergencyContact.phone}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4 w-full"
                onClick={() =>
                  toast({ title: "Contact called", description: `Dialling ${driver.emergencyContact.name}.`, tone: "info" })
                }
              >
                <Phone /> Call contact
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Trips completed</p>
              <p className="mt-2 text-3xl font-bold">{driver.trips}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Customer rating</p>
              <p className="mt-2 flex items-center gap-2 text-3xl font-bold">
                <Star className="size-6 fill-amber-400 text-amber-400" />
                {driver.rating}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Performance score</p>
              <p className="mt-2 text-3xl font-bold">{driver.performance}%</p>
              <Progress className="mt-3" value={driver.performance} />
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Assigned vehicle</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {assigned ? (
                <div className="flex items-center gap-4 rounded-2xl border border-border p-4">
                  <img src={assigned.image} alt={assigned.name} className="size-20 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{assigned.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {assigned.plate} · {assigned.transmission}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" /> {assigned.location}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/vehicles/${assigned.id}`}>Open</Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
                  <Car className="size-5" />
                  <p className="text-sm">No vehicle is currently assigned to this driver.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {driver.documents.map((doc) => {
                const meta = documentMeta[doc.status];
                return (
                  <div key={doc.label} className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
                    <p className="font-semibold">{doc.label}</p>
                    <Badge variant={meta.variant} dot>
                      {meta.label}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
