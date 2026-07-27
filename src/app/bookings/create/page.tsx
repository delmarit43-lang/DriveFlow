"use client";

import { useRouter } from "next/navigation";
import { BookingWizard } from "@/components/bookings/booking-wizard";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateBookingPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Create Booking"
        description="Pick the dates, vehicle, and customer, then confirm."
        breadcrumbs={[{ label: "Bookings", href: "/bookings" }, { label: "New booking" }]}
      />
      <Card>
        <CardContent className="p-6">
          <BookingWizard onClose={() => router.push("/bookings")} />
        </CardContent>
      </Card>
    </div>
  );
}
