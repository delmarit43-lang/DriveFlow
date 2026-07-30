import * as React from "react";
import { useRouter } from "@/lib/navigation";
import { Car, CalendarDays, Search, UserRound, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFleet } from "@/store/fleet-store";
import { cn } from "@/lib/utils";

type Result = { id: string; label: string; hint: string; href: string; icon: React.ElementType };

export function GlobalSearch({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const { vehicles, customers, bookings, drivers } = useFleet();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const results = React.useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    const out: Result[] = [];

    vehicles.forEach((v) => {
      if (v.name.toLowerCase().includes(q) || v.plate.toLowerCase().includes(q)) {
        out.push({ id: v.id, label: v.name, hint: `Vehicle · ${v.plate}`, href: `/vehicles/${v.id}`, icon: Car });
      }
    });
    customers.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) {
        out.push({ id: c.id, label: c.name, hint: `Customer · ${c.email}`, href: `/customers/${c.id}`, icon: Users });
      }
    });
    bookings.forEach((b) => {
      if (b.id.toLowerCase().includes(q)) {
        out.push({ id: b.id, label: b.id, hint: `Booking · ${b.status}`, href: `/bookings/${b.id}`, icon: CalendarDays });
      }
    });
    drivers.forEach((d) => {
      if (d.name.toLowerCase().includes(q)) {
        out.push({ id: d.id, label: d.name, hint: `Driver · ${d.availability}`, href: `/drivers/${d.id}`, icon: UserRound });
      }
    });

    return out.slice(0, 8);
  }, [query, vehicles, customers, bookings, drivers]);

  React.useEffect(() => setHighlight(0), [query]);

  React.useEffect(() => {
    const onClickAway = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") setOpen(false);
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    }
    if (event.key === "Enter") {
      event.preventDefault();
      go(results[highlight].href);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <Input
        placeholder={placeholder}
        icon={<Search />}
        aria-label="Search"
        role="combobox"
        aria-expanded={open}
        className="bg-muted/60"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {open && query.trim() ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-lift">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.href}-${r.id}`}
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => go(r.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                  i === highlight ? "bg-muted" : "hover:bg-muted/60",
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <r.icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{r.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{r.hint}</span>
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
