"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND } from "@/constants/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <p className="text-sm font-semibold text-primary">{BRAND.name}</p>

        {sent ? (
          <div className="mt-4 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-7" />
            </span>
            <h1 className="mt-4 text-2xl font-bold">Check your inbox</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              If an account exists for <span className="font-semibold text-foreground">{email}</span>, a secure reset link
              is on its way.
            </p>
            <Button className="mt-6 w-full" asChild>
              <Link href="/login">Back to sign in</Link>
            </Button>
          </div>
        ) : (
          <>
            <h1 className="mt-2 text-2xl font-bold">Reset password</h1>
            <p className="mt-1 text-sm text-muted-foreground">We&apos;ll email you a secure reset link.</p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Work email</span>
                <Input
                  type="email"
                  required
                  placeholder="name@company.com"
                  icon={<Mail />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <Button type="submit" className="w-full">
                Send reset link
              </Button>
              <Link href="/login" className="block text-center text-sm font-semibold text-primary hover:underline">
                Back to sign in
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
