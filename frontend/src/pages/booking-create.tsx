import { useRouter } from "@/lib/navigation";
import { BookingWizard } from "@/components/bookings/booking-wizard";
import { useLocale } from "@/i18n/locale-context";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateBookingPage() {
  const { t } = useLocale();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={t("page.bookingCreate.title")}
        description={t("page.bookingCreate.desc")}
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
