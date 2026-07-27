"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, Eye, EyeOff, Lock, Mail, MoveRight } from "lucide-react";
import { useState } from "react";
import { Wordmark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND } from "@/constants/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.75), rgba(15,23,42,0.85)), url('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center text-white">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Car className="size-7" aria-hidden />
          </div>
          <Wordmark />
          <p className="mt-2 text-sm text-white/70">{BRAND.tagline}</p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/90 p-8 shadow-lift backdrop-blur-xl">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Please enter your details to access your dashboard.</p>
          <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
            <div className="space-y-2 text-sm">
              <label htmlFor="email" className="font-medium">
                Email Address
              </label>
              <Input id="email" name="email" type="email" autoComplete="email" placeholder="name@company.com" icon={<Mail />} />
            </div>
            <div className="space-y-2 text-sm">
              <label htmlFor="password" className="font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  icon={<Lock />}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="remember" className="flex cursor-pointer items-center gap-2">
                <input id="remember" name="remember" type="checkbox" className="rounded border-input" />
                Remember me
              </label>
              <Link href="/forgot-password" className="font-semibold text-primary">
                Forgot Password?
              </Link>
            </div>
            <Button type="submit" className="w-full">
              Sign In
              <MoveRight aria-hidden />
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an enterprise account?{" "}
            <Link href="/support" className="font-semibold text-foreground hover:underline">
              Contact Sales
            </Link>
          </p>
        </div>
        <p className="text-center text-xs text-white/60">Privacy Policy · Terms of Service · Support</p>
      </div>
    </div>
  );
}
