import * as React from "react";
import { DialogContent, DialogRoot } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "@/types";

const CustomerForm = React.lazy(() =>
  import("@/components/customers/customer-form").then((m) => ({ default: m.CustomerForm })),
);

type Ctx = {
  openCreate: () => void;
  openEdit: (customer: Customer) => void;
};

const CustomerDialogContext = React.createContext<Ctx | null>(null);

export function CustomerDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Customer | null>(null);

  const value = React.useMemo<Ctx>(
    () => ({
      openCreate: () => {
        setEditing(null);
        setOpen(true);
      },
      openEdit: (customer) => {
        setEditing(customer);
        setOpen(true);
      },
    }),
    [],
  );

  return (
    <CustomerDialogContext.Provider value={value}>
      {children}
      <DialogRoot open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-xl"
          title={editing ? "Edit Customer" : "Add Customer"}
          description={
            editing
              ? "Update this renter’s profile and membership details."
              : "Register a new customer in your rental directory."
          }
        >
          <React.Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <CustomerForm customer={editing} onDone={() => setOpen(false)} />
          </React.Suspense>
        </DialogContent>
      </DialogRoot>
    </CustomerDialogContext.Provider>
  );
}

export function useCustomerDialog() {
  const ctx = React.useContext(CustomerDialogContext);
  if (!ctx) throw new Error("useCustomerDialog must be used within CustomerDialogProvider");
  return ctx;
}
