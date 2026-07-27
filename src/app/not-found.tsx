import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-24 text-center">
      <p className="text-sm font-bold text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold">This route doesn&apos;t exist</h1>
      <p className="mt-2 text-muted-foreground">Head back to the dashboard or browse the fleet.</p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Back to dashboard</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/vehicles">Browse fleet</Link>
        </Button>
      </div>
    </div>
  );
}
