import * as React from "react";
import { Link } from "@/lib/navigation";
import { BookOpen, CheckCircle2, Clock, Mail, MessageSquare, Phone, Send } from "lucide-react";
import { useLocale } from "@/i18n/locale-context";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { messages } from "@/data/mock";

const channels = [
  { icon: Mail, label: "Email support", detail: "", meta: "Replies within 4 hours" },
  { icon: Phone, label: "Priority phone line", detail: "", meta: "Sat–Thu, 08:00–18:00 EAT" },
  { icon: MessageSquare, label: "Live chat", detail: "Average wait 2 minutes", meta: "Available now" },
];

export default function SupportPage() {
  const { t } = useLocale();
  const toast = useToast();
  const [subject, setSubject] = React.useState("");
  const [priority, setPriority] = React.useState("normal");
  const [body, setBody] = React.useState("");

  return (
    <div className="mx-auto max-w-[1100px] space-y-8">
      <PageHeader
        title={t("page.support.title")}
        description={t("page.support.desc")}
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Support" }]}
        actions={
          <Button variant="secondary" asChild>
            <Link href="/help">
              <BookOpen /> Help Center
            </Link>
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {channels.map(({ icon: Icon, label, detail, meta }) => (
          <Card key={label} className="p-5">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <p className="mt-4 font-bold">{label}</p>
            <p className="text-sm text-muted-foreground">{detail}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> {meta}
            </p>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <CardTitle>Open a ticket</CardTitle>
            <CardDescription>Tell us what happened and we&rsquo;ll get back to you quickly.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                toast({
                  title: "Ticket submitted",
                  description: `We'll reply about "${subject}" within 4 hours.`,
                });
                setSubject("");
                setBody("");
                setPriority("normal");
              }}
            >
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Subject</span>
                <Input
                  placeholder="Briefly describe the issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Priority</span>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low — general question</SelectItem>
                    <SelectItem value="normal">Normal — needs attention</SelectItem>
                    <SelectItem value="high">High — blocking operations</SelectItem>
                    <SelectItem value="urgent">Urgent — fleet down</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Details</span>
                <Textarea
                  placeholder="Include vehicle plates, booking IDs, or error messages where relevant."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </label>
              <div className="flex justify-end border-t border-border pt-4">
                <Button type="submit">
                  <Send /> Submit ticket
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {messages.map((m) => (
                <div key={m.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <Avatar src={m.avatar} name={m.from} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{m.from}</p>
                    <p className="truncate text-sm text-muted-foreground">{m.preview}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{m.time}</p>
                  </div>
                  {m.unread ? <Badge variant="default">New</Badge> : null}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {["Dashboard", "Payments API", "Telematics sync", "Email delivery"].map((service) => (
                <div key={service} className="flex items-center justify-between text-sm">
                  <span>{service}</span>
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                    <CheckCircle2 className="size-4" /> Operational
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
