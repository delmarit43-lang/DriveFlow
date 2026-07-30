import * as React from "react";
import { Link } from "@/lib/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  Car,
  ChevronDown,
  CreditCard,
  LifeBuoy,
  Search,
  Users,
  Wrench,
} from "lucide-react";
import { useLocale } from "@/i18n/locale-context";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { faqs } from "@/data/mock";
import { cn } from "@/lib/utils";

const guides = [
  { icon: Car, title: "Fleet basics", description: "Add vehicles, set rates, and track availability.", href: "/vehicles" },
  { icon: CalendarDays, title: "Bookings", description: "Create reservations and manage the rental calendar.", href: "/bookings" },
  { icon: Users, title: "Customers", description: "Verify licences, tiers, and loyalty progress.", href: "/customers" },
  { icon: CreditCard, title: "Payments", description: "Collect payments, issue refunds, and export reports.", href: "/payments" },
  { icon: Wrench, title: "Maintenance", description: "Schedule services and monitor vehicle health.", href: "/maintenance" },
  { icon: BookOpen, title: "Reporting", description: "Build revenue and utilization reports.", href: "/reports" },
];

export default function HelpPage() {
  const { t } = useLocale();
  const [query, setQuery] = React.useState("");
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const q = query.trim().toLowerCase();
  const filteredFaqs = faqs.filter((f) => !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  const filteredGuides = guides.filter((g) => !q || g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));

  return (
    <div className="mx-auto max-w-[1000px] space-y-8">
      <PageHeader
        title={t("page.help.title")}
        description={t("page.help.desc")}
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Help Center" }]}
        actions={
          <Button asChild>
            <Link href="/support">
              <LifeBuoy /> Contact support
            </Link>
          </Button>
        }
      />

      <Input
        placeholder="Search guides and questions..."
        icon={<Search />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search help articles"
        className="h-12"
      />

      {filteredGuides.length === 0 && filteredFaqs.length === 0 ? (
        <EmptyState
          icon={<Search />}
          title="No results found"
          description={`Nothing matches "${query}". Try a different phrase or contact support.`}
          action={
            <Button asChild>
              <Link href="/support">Contact support</Link>
            </Button>
          }
        />
      ) : null}

      {filteredGuides.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-bold">Browse by topic</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGuides.map(({ icon: Icon, title, description, href }) => (
              <Link key={title} href={href}>
                <Card className="h-full p-5 transition hover:-translate-y-1 hover:shadow-lift">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <p className="mt-4 font-bold">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {filteredFaqs.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Frequently asked questions</CardTitle>
            <CardDescription>Quick answers to the questions our teams hear most.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {filteredFaqs.map((faq, i) => {
              const open = openIndex === i;
              return (
                <div key={faq.question} className="rounded-xl border border-border">
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left"
                  >
                    <span className="font-semibold">{faq.question}</span>
                    <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
                  </button>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-sm text-muted-foreground">{faq.answer}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
