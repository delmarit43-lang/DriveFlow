import * as React from "react";
import { Link } from "@/lib/navigation";
import { motion } from "framer-motion";
import { Car, Search, ShieldAlert, Star, UserPlus, UserRound } from "lucide-react";
import { useLocale } from "@/i18n/locale-context";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useFleet } from "@/store/fleet-store";
import { cn } from "@/lib/utils";

const licenceMeta = {
  valid: { label: "Licence valid", variant: "success" as const },
  expiring: { label: "Licence expiring", variant: "warning" as const },
  expired: { label: "Licence expired", variant: "danger" as const },
};

const availabilityMeta = {
  available: { label: "Available", variant: "success" as const },
  "on-trip": { label: "On trip", variant: "default" as const },
  "off-duty": { label: "Off duty", variant: "muted" as const },
};

export default function DriversPage() {
  const { t } = useLocale();
  const { drivers, vehicles, setDriverAvailability } = useFleet();
  const toast = useToast();
  const [query, setQuery] = React.useState("");
  const [availability, setAvailability] = React.useState("all");

  const filtered = drivers
    .filter((d) => availability === "all" || d.availability === availability)
    .filter((d) => {
      const q = query.trim().toLowerCase();
      return !q || d.name.toLowerCase().includes(q) || d.license.toLowerCase().includes(q);
    });

  const avgRating = drivers.length
    ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)
    : "0.0";
  const licenceAlerts = drivers.filter((d) => d.licenseStatus !== "valid").length;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title={t("page.drivers.title")}
        description={t("page.drivers.desc")}
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Drivers" }]}
        actions={
          <Button onClick={() => toast({ title: "Invite sent", description: "A driver onboarding link has been emailed.", tone: "info" })}>
            <UserPlus /> Invite driver
          </Button>
        }
      />

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total drivers" value={String(drivers.length)} icon={<UserRound />} />
        <StatCard
          label="On trip now"
          value={String(drivers.filter((d) => d.availability === "on-trip").length)}
          icon={<Car />}
          tone="violet"
        />
        <StatCard label="Average rating" value={`${avgRating} / 5`} icon={<Star />} tone="green" />
        <StatCard
          label="Licence alerts"
          value={String(licenceAlerts)}
          icon={<ShieldAlert />}
          tone={licenceAlerts > 0 ? "red" : "green"}
          hint={licenceAlerts > 0 ? <Badge variant="danger">Action required</Badge> : <Badge variant="success">All clear</Badge>}
        />
      </section>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="min-w-[240px] flex-1">
          <Input
            placeholder="Search drivers or licence numbers..."
            icon={<Search />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search drivers"
          />
        </div>
        <Select value={availability} onValueChange={setAvailability}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All availability</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="on-trip">On trip</SelectItem>
            <SelectItem value="off-duty">Off duty</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<UserRound />} title="No drivers found" description="Adjust your search or filters." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => {
            const licence = licenceMeta[d.licenseStatus];
            const status = availabilityMeta[d.availability];
            const assigned = vehicles.find((v) => v.id === d.assignedVehicleId);
            return (
              <motion.div key={d.id} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 26 }}>
                <Card className="flex h-full flex-col gap-5 p-5 transition-shadow hover:shadow-lift">
                  <div className="flex items-start gap-4">
                    <Avatar src={d.avatar} name={d.name} className="size-14" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/drivers/${d.id}`} className="truncate font-bold hover:text-primary">
                        {d.name}
                      </Link>
                      <p className="truncate text-sm text-muted-foreground">{d.license}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant={status.variant} dot>
                          {status.label}
                        </Badge>
                        <Badge variant={licence.variant} dot>
                          {licence.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Trips</p>
                      <p className="font-bold">{d.trips}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className="font-bold">★ {d.rating}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Score</p>
                      <p className="font-bold">{d.performance}</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Performance score</span>
                      <span className="font-semibold">{d.performance}%</span>
                    </div>
                    <Progress value={d.performance} />
                  </div>

                  <p className={cn("flex items-center gap-2 text-sm", assigned ? "text-foreground" : "text-muted-foreground")}>
                    <Car className="size-4 shrink-0 text-muted-foreground" />
                    {assigned ? (
                      <Link href={`/vehicles/${assigned.id}`} className="truncate hover:text-primary">
                        {assigned.name} · {assigned.plate}
                      </Link>
                    ) : (
                      "No vehicle assigned"
                    )}
                  </p>

                  <div className="mt-auto flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1" asChild>
                      <Link href={`/drivers/${d.id}`}>View profile</Link>
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const next = d.availability === "available" ? "off-duty" : "available";
                        setDriverAvailability(d.id, next);
                        toast({
                          title: "Availability updated",
                          description: `${d.name} is now ${availabilityMeta[next].label.toLowerCase()}.`,
                        });
                      }}
                    >
                      {d.availability === "available" ? "Set off duty" : "Set available"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
