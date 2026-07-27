"use client";

import * as React from "react";
import { Download, FileText, Plus, Receipt, Search, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { invoices } from "@/data/mock";
import { downloadFile, formatCurrencyPrecise, toCsv } from "@/lib/utils";

const statusMeta = {
  paid: { label: "Paid", variant: "success" as const },
  pending: { label: "Pending", variant: "warning" as const },
  overdue: { label: "Overdue", variant: "danger" as const },
};

export default function InvoicesPage() {
  const toast = useToast();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");

  const filtered = invoices
    .filter((i) => status === "all" || i.status === status)
    .filter((i) => {
      const q = query.trim().toLowerCase();
      return !q || i.id.toLowerCase().includes(q) || i.customer.toLowerCase().includes(q);
    });

  const totals = {
    outstanding: invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + i.amount, 0),
    paid: invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter((i) => i.status === "overdue").length,
  };

  const exportAll = () => {
    downloadFile(
      "driveflow-invoices.csv",
      toCsv(
        filtered.map((i) => ({
          Invoice: i.id,
          Customer: i.customer,
          Issued: i.issued,
          Due: i.due,
          Amount: i.amount,
          Status: i.status,
        })),
      ),
    );
    toast({ title: "Invoices exported", description: `${filtered.length} invoices downloaded as CSV.` });
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <PageHeader
        title="Invoices"
        description="Billing documents, due dates, and payment status."
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Invoices" }]}
        actions={
          <>
            <Button variant="secondary" onClick={exportAll}>
              <Download /> Export all
            </Button>
            <Button onClick={() => toast({ title: "Draft created", description: "A new invoice draft is ready to edit." })}>
              <Plus /> New invoice
            </Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Outstanding" value={formatCurrencyPrecise(totals.outstanding)} icon={<Receipt />} tone="amber" />
        <StatCard label="Collected" value={formatCurrencyPrecise(totals.paid)} icon={<FileText />} tone="green" />
        <StatCard
          label="Overdue invoices"
          value={String(totals.overdue)}
          icon={<Send />}
          tone={totals.overdue > 0 ? "red" : "green"}
          hint={totals.overdue > 0 ? <Badge variant="danger">Chase payment</Badge> : <Badge variant="success">All settled</Badge>}
        />
      </section>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4">
            <div className="min-w-[220px] flex-1">
              <Input
                placeholder="Search invoice or customer..."
                icon={<Search />}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search invoices"
                className="h-10"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-10 w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Receipt />}
              title="No invoices found"
              description="Adjust your filters to see more billing documents."
              className="m-6 border-0"
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Invoice</TH>
                  <TH>Customer</TH>
                  <TH>Issued</TH>
                  <TH>Due</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Amount</TH>
                  <TH />
                </TR>
              </THead>
              <TBody>
                {filtered.map((inv) => {
                  const meta = statusMeta[inv.status];
                  return (
                    <TR key={inv.id}>
                      <TD className="font-semibold text-primary">{inv.id}</TD>
                      <TD>{inv.customer}</TD>
                      <TD className="whitespace-nowrap text-muted-foreground">{inv.issued}</TD>
                      <TD className="whitespace-nowrap text-muted-foreground">{inv.due}</TD>
                      <TD>
                        <Badge variant={meta.variant} dot>
                          {meta.label}
                        </Badge>
                      </TD>
                      <TD className="text-right font-bold">{formatCurrencyPrecise(inv.amount)}</TD>
                      <TD className="text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            downloadFile(
                              `${inv.id}.csv`,
                              toCsv([
                                {
                                  Invoice: inv.id,
                                  Customer: inv.customer,
                                  Issued: inv.issued,
                                  Due: inv.due,
                                  Amount: inv.amount,
                                  Status: inv.status,
                                },
                              ]),
                            );
                            toast({ title: "Invoice downloaded", description: `${inv.id} saved to your device.` });
                          }}
                        >
                          <Download /> Download
                        </Button>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
