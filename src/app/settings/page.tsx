"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Building2,
  Check,
  Copy,
  Key,
  Monitor,
  Moon,
  Palette,
  Plug,
  Plus,
  Save,
  Shield,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { BRAND, CURRENT_USER, languages } from "@/constants/navigation";
import { apiKeys, teamMembers } from "@/data/mock";
import { cn } from "@/lib/utils";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export default function SettingsPage() {
  const toast = useToast();
  const { theme, setTheme } = useTheme();

  const [language, setLanguage] = React.useState("en");
  const [currency, setCurrency] = React.useState("USD");
  const [twoFactor, setTwoFactor] = React.useState(true);
  const [autoBackup, setAutoBackup] = React.useState(true);
  const [revokeKey, setRevokeKey] = React.useState<string | null>(null);
  const [integrations, setIntegrations] = React.useState({
    stripe: true,
    quickbooks: false,
    googleMaps: true,
    slack: false,
  });

  const saved = (what: string) => toast({ title: `${what} saved`, description: "Your changes have been applied." });

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        title="Settings"
        description="Company profile, pricing rules, security, roles, and appearance."
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Settings" }]}
      />

      <Tabs defaultValue="company">
        <TabsList className="flex-wrap">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="fleet">Fleet & Pricing</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="team">Users & Roles</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Company */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" /> Company profile
              </CardTitle>
              <CardDescription>This information appears on invoices and customer emails.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  saved("Company profile");
                }}
              >
                <Field label="Company name">
                  <Input defaultValue={BRAND.name} />
                </Field>
                <Field label="Trading name">
                  <Input defaultValue="DriveFlow Enterprise" />
                </Field>
                <Field label="Business email">
                  <Input type="email" defaultValue="billing@driveflow.com" />
                </Field>
                <Field label="Phone">
                  <Input defaultValue="+1 (555) 010-2200" />
                </Field>
                <Field label="Tax / VAT number">
                  <Input defaultValue="US-88-2914003" />
                </Field>
                <Field label="Registered address">
                  <Input defaultValue="742 Enterprise Blvd, New York, NY 10018" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Company description">
                    <Textarea defaultValue="Premium fleet and car rental operations across 12 regions." />
                  </Field>
                </div>
                <div className="sm:col-span-2 flex justify-end border-t border-border pt-4">
                  <Button type="submit">
                    <Save /> Save company profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fleet & pricing */}
        <TabsContent value="fleet" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fleet preferences</CardTitle>
              <CardDescription>Defaults applied to every new vehicle and reservation.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  saved("Fleet preferences");
                }}
              >
                <Field label="Default currency">
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["USD", "EUR", "GBP", "AED"].map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Distance unit">
                  <Select defaultValue="km">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="km">Kilometres</SelectItem>
                      <SelectItem value="mi">Miles</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Minimum rental (days)">
                  <Input type="number" defaultValue={1} min={1} />
                </Field>
                <Field label="Late return fee per day (USD)">
                  <Input type="number" defaultValue={95} min={0} />
                </Field>
                <Field label="Weekend surcharge (%)" hint="Applied automatically to Saturday and Sunday pickups.">
                  <Input type="number" defaultValue={15} min={0} />
                </Field>
                <Field label="Security deposit (USD)">
                  <Input type="number" defaultValue={500} min={0} />
                </Field>
                <div className="sm:col-span-2 flex justify-end border-t border-border pt-4">
                  <Button type="submit">
                    <Save /> Save pricing rules
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="size-5 text-primary" /> Appearance
              </CardTitle>
              <CardDescription>Theme and language preferences for this workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              <div>
                <p className="mb-3 text-sm font-medium">Theme</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Monitor },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-4 text-left transition",
                        theme === value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                      )}
                    >
                      <Icon className="size-5 text-primary" />
                      <span className="font-semibold">{label}</span>
                      {theme === value ? <Check className="ml-auto size-4 text-primary" /> : null}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Interface language">
                <Select
                  value={language}
                  onValueChange={(v) => {
                    setLanguage(v);
                    toast({
                      title: "Language updated",
                      description: `Interface set to ${languages.find((l) => l.code === v)?.label}.`,
                      tone: "info",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.flag} {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5 text-primary" /> Security
              </CardTitle>
              <CardDescription>Protect your workspace and manage backups.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  saved("Password");
                }}
              >
                <Field label="Current password">
                  <Input type="password" placeholder="••••••••" autoComplete="current-password" />
                </Field>
                <Field label="New password" hint="At least 12 characters with a number and symbol.">
                  <Input type="password" placeholder="••••••••" autoComplete="new-password" />
                </Field>
                <div className="sm:col-span-2 flex justify-end">
                  <Button type="submit" variant="secondary">
                    Update password
                  </Button>
                </div>
              </form>

              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
                  <div>
                    <p className="font-semibold">Two-factor authentication</p>
                    <p className="text-sm text-muted-foreground">Require a one-time code at every sign-in.</p>
                  </div>
                  <Switch
                    checked={twoFactor}
                    onCheckedChange={(v) => {
                      setTwoFactor(v);
                      toast({ title: v ? "2FA enabled" : "2FA disabled", description: "Security preference updated." });
                    }}
                    aria-label="Two-factor authentication"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
                  <div>
                    <p className="font-semibold">Automatic backups</p>
                    <p className="text-sm text-muted-foreground">Nightly encrypted snapshot of your fleet data.</p>
                  </div>
                  <Switch
                    checked={autoBackup}
                    onCheckedChange={(v) => {
                      setAutoBackup(v);
                      toast({ title: v ? "Backups enabled" : "Backups paused", description: "Backup preference updated." });
                    }}
                    aria-label="Automatic backups"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <Key className="size-4 text-primary" /> API keys
                </p>
                <div className="space-y-3">
                  {apiKeys.map((k) => (
                    <div key={k.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{k.label}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">{k.token}</p>
                        <p className="text-xs text-muted-foreground">Created {k.created}</p>
                      </div>
                      <Badge variant={k.scope === "admin" ? "danger" : k.scope === "write" ? "warning" : "muted"}>
                        {k.scope.toUpperCase()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Copy ${k.label} token`}
                        onClick={() => {
                          navigator.clipboard?.writeText(k.token);
                          toast({ title: "Token copied", description: `${k.label} key copied to clipboard.` });
                        }}
                      >
                        <Copy />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Revoke ${k.label}`}
                        className="hover:text-destructive"
                        onClick={() => setRevokeKey(k.label)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-primary" /> Users & roles
                </CardTitle>
                <CardDescription>Control who can access your workspace and what they can do.</CardDescription>
              </div>
              <Button onClick={() => toast({ title: "Invitation sent", description: "A workspace invite has been emailed." })}>
                <Plus /> Invite user
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {teamMembers.map((m) => (
                <div key={m.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-4">
                  <Avatar src={m.avatar} name={m.name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {m.name}
                      {m.email === CURRENT_USER.email ? (
                        <span className="ml-2 text-xs font-medium text-muted-foreground">(you)</span>
                      ) : null}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">{m.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.lastActive}</span>
                  <Select
                    defaultValue={m.role}
                    onValueChange={(role) =>
                      toast({ title: "Role updated", description: `${m.name} is now a ${role}.` })
                    }
                  >
                    <SelectTrigger className="h-10 w-[170px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Owner", "Fleet Manager", "Dispatcher", "Accountant", "Viewer"].map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="size-5 text-primary" /> Integrations
              </CardTitle>
              <CardDescription>Connect DriveFlow to the tools your team already uses.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
              {(
                [
                  ["stripe", "Stripe", "Card payments and payouts"],
                  ["quickbooks", "QuickBooks", "Sync invoices and expenses"],
                  ["googleMaps", "Google Maps", "Live vehicle tracking and routing"],
                  ["slack", "Slack", "Push fleet alerts to a channel"],
                ] as const
              ).map(([key, name, description]) => (
                <div key={key} className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
                  <div className="min-w-0">
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  <Switch
                    checked={integrations[key]}
                    onCheckedChange={(v) => {
                      setIntegrations((prev) => ({ ...prev, [key]: v }));
                      toast({
                        title: v ? `${name} connected` : `${name} disconnected`,
                        description: v ? "Integration is now active." : "Integration has been turned off.",
                        tone: v ? "success" : "warning",
                      });
                    }}
                    aria-label={name}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={Boolean(revokeKey)}
        onOpenChange={(open) => !open && setRevokeKey(null)}
        title="Revoke this API key?"
        description={`Any integration using "${revokeKey ?? ""}" will immediately stop working.`}
        confirmLabel="Revoke key"
        destructive
        onConfirm={() => {
          toast({ title: "API key revoked", description: `${revokeKey} can no longer be used.`, tone: "warning" });
          setRevokeKey(null);
        }}
      />
    </div>
  );
}
