"use client";

import * as React from "react";
import Link from "next/link";
import {
  Banknote,
  CreditCard,
  Download,
  Landmark,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DialogContent, DialogRoot } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { transactions as seedTransactions } from "@/data/mock";
import { useFleet } from "@/store/fleet-store";
import { paymentStatusMeta } from "@/lib/status";
import { cn, downloadFile, formatCurrencyPrecise, initials, toCsv } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

const methodIcons = {
  visa: CreditCard,
  mastercard: CreditCard,
  bank: Landmark,
  wallet: Wallet,
} as const;

export default function PaymentsPage() {
  const { paymentMethods, addPaymentMethod, setDefaultPaymentMethod, removePaymentMethod } = useFleet();
  const toast = useToast();

  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [pendingRemove, setPendingRemove] = React.useState<PaymentMethod | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [newLabel, setNewLabel] = React.useState("");
  const [newDetail, setNewDetail] = React.useState("");

  const filtered = seedTransactions
    .filter((t) => status === "all" || t.status === status)
    .filter((t) => {
      const q = query.trim().toLowerCase();
      return !q || t.customer.toLowerCase().includes(q) || t.bookingId.toLowerCase().includes(q);
    });

  const revenue = seedTransactions.filter((t) => t.status === "success").reduce((s, t) => s + t.amount, 0);
  const pending = seedTransactions.filter((t) => t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const refunded = seedTransactions.filter((t) => t.status === "refunded").reduce((s, t) => s + t.amount, 0);
  const failed = seedTransactions.filter((t) => t.status === "failed").length;

  const exportTransactions = () => {
    downloadFile(
      "driveflow-transactions.csv",
      toCsv(
        filtered.map((t) => ({
          Date: t.date,
          Booking: t.bookingId,
          Customer: t.customer,
          Method: t.method,
          Amount: t.amount,
          Status: t.status,
        })),
      ),
    );
    toast({ title: "Report exported", description: `${filtered.length} transactions downloaded as CSV.` });
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <PageHeader
        title="Payments"
        description="Revenue, linked accounts, transactions, and refunds."
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Payments" }]}
        actions={
          <>
            <Button variant="secondary" onClick={exportTransactions}>
              <Download /> Export Report
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus /> Add payment method
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Collected revenue" value={formatCurrencyPrecise(revenue)} icon={<Banknote />} tone="green" />
        <StatCard label="Pending payments" value={formatCurrencyPrecise(pending)} icon={<CreditCard />} tone="amber" />
        <StatCard label="Refunds issued" value={formatCurrencyPrecise(refunded)} icon={<RotateCcw />} tone="violet" />
        <StatCard
          label="Failed charges"
          value={String(failed)}
          icon={<Trash2 />}
          tone={failed > 0 ? "red" : "green"}
          hint={failed > 0 ? <Badge variant="danger">Retry required</Badge> : <Badge variant="success">Healthy</Badge>}
        />
      </section>

      <section>
        <h2 className="text-xl font-bold">Payment Methods</h2>
        <p className="text-sm text-muted-foreground">
          Securely manage your organization&rsquo;s linked accounts and primary billing preferences.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {paymentMethods.map((pm) => {
            const Icon = methodIcons[pm.type];
            return (
              <Card key={pm.id} className={cn("p-5", pm.isDefault && "border-l-4 border-l-primary")}>
                <div className="flex items-start justify-between gap-2">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  {pm.isDefault ? <Badge>DEFAULT</Badge> : pm.verified ? <Badge variant="success">Verified</Badge> : null}
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">{pm.label}</p>
                <p className="mt-1 text-lg font-bold">{pm.detail}</p>
                <p className="text-sm text-muted-foreground">{pm.meta}</p>
                <div className="mt-4 flex items-center gap-3">
                  {!pm.isDefault ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDefaultPaymentMethod(pm.id);
                        toast({ title: "Default updated", description: `${pm.label} is now your default method.` });
                      }}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Set as Default
                    </button>
                  ) : null}
                  <button
                    type="button"
                    aria-label={`Remove ${pm.label}`}
                    onClick={() => setPendingRemove(pm)}
                    className="ml-auto rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-50 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Detailed overview of last 30 days revenue and payouts.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search transactions..."
              icon={<Search />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search transactions"
              className="h-10 w-full sm:w-56"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10 w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={<CreditCard />}
              title="No transactions found"
              description="Try a different search term or status filter."
              className="border-0"
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Date</TH>
                  <TH>Booking ID</TH>
                  <TH>Customer</TH>
                  <TH>Method</TH>
                  <TH>Amount</TH>
                  <TH>Status</TH>
                  <TH />
                </TR>
              </THead>
              <TBody>
                {filtered.map((t) => {
                  const meta = paymentStatusMeta[t.status];
                  return (
                    <TR key={t.id}>
                      <TD className="whitespace-nowrap">{t.date}</TD>
                      <TD>
                        <Link href={`/bookings/${t.bookingId}`} className="font-semibold text-primary hover:underline">
                          #{t.bookingId}
                        </Link>
                      </TD>
                      <TD>
                        <span className="flex items-center gap-2">
                          <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                            {initials(t.customer)}
                          </span>
                          {t.customer}
                        </span>
                      </TD>
                      <TD className="text-muted-foreground">{t.method}</TD>
                      <TD className="font-bold">{formatCurrencyPrecise(t.amount)}</TD>
                      <TD>
                        <Badge variant={meta.variant} dot>
                          {meta.label}
                        </Badge>
                      </TD>
                      <TD className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${t.bookingId}`}>
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                              <Link href={`/bookings/${t.bookingId}`}>View booking</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                toast({ title: "Receipt sent", description: `Receipt emailed to ${t.customer}.` })
                              }
                            >
                              Send receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              destructive
                              onSelect={() =>
                                toast({
                                  title: "Refund requested",
                                  description: `${formatCurrencyPrecise(t.amount)} refund queued for ${t.customer}.`,
                                  tone: "warning",
                                })
                              }
                            >
                              Issue refund
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        onOpenChange={(open) => !open && setPendingRemove(null)}
        title="Remove payment method?"
        description={`${pendingRemove?.label ?? ""} (${pendingRemove?.detail ?? ""}) will be unlinked from this workspace.`}
        confirmLabel="Remove method"
        destructive
        onConfirm={() => {
          if (!pendingRemove) return;
          removePaymentMethod(pendingRemove.id);
          toast({ title: "Method removed", description: `${pendingRemove.label} was unlinked.`, tone: "warning" });
          setPendingRemove(null);
        }}
      />

      <DialogRoot open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent title="Add payment method" description="Link a new corporate card or bank account.">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newLabel.trim() || !newDetail.trim()) return;
              addPaymentMethod({ type: "visa", label: newLabel.toUpperCase(), detail: newDetail, meta: "Just added" });
              toast({ title: "Payment method added", description: `${newLabel} is now linked.` });
              setNewLabel("");
              setNewDetail("");
              setAddOpen(false);
            }}
          >
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Account label</span>
              <Input
                placeholder="e.g. Visa Corporate"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                required
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Card or account number</span>
              <Input
                placeholder="•••• •••• •••• 1234"
                value={newDetail}
                onChange={(e) => setNewDetail(e.target.value)}
                required
              />
            </label>
            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="secondary" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add method</Button>
            </div>
          </form>
        </DialogContent>
      </DialogRoot>
    </div>
  );
}
