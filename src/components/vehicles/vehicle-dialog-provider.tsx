"use client";

import * as React from "react";
import { DialogContent, DialogRoot } from "@/components/ui/dialog";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import type { Vehicle } from "@/types";

type Ctx = {
  openCreate: () => void;
  openEdit: (vehicle: Vehicle) => void;
};

const VehicleDialogContext = React.createContext<Ctx | null>(null);

export function VehicleDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Vehicle | null>(null);

  const value = React.useMemo<Ctx>(
    () => ({
      openCreate: () => {
        setEditing(null);
        setOpen(true);
      },
      openEdit: (vehicle) => {
        setEditing(vehicle);
        setOpen(true);
      },
    }),
    [],
  );

  return (
    <VehicleDialogContext.Provider value={value}>
      {children}
      <DialogRoot open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-2xl"
          title={editing ? "Edit Vehicle" : "Add Vehicle"}
          description={
            editing ? "Update the specifications for this asset." : "Register a new asset into your fleet inventory."
          }
        >
          <VehicleForm vehicle={editing} onDone={() => setOpen(false)} />
        </DialogContent>
      </DialogRoot>
    </VehicleDialogContext.Provider>
  );
}

export function useVehicleDialog() {
  const ctx = React.useContext(VehicleDialogContext);
  if (!ctx) throw new Error("useVehicleDialog must be used within VehicleDialogProvider");
  return ctx;
}
