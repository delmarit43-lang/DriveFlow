import { Link } from "@/lib/navigation";
import { useRouter } from "@/lib/navigation";
import { Eye, EyeOff, Lock, Mail, MoveRight } from "lucide-react";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/i18n/locale-context";
import { useAuth } from "@/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { login } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="auth-link text-[11px] font-bold uppercase tracking-[0.2em]">{t("auth.signIn")}</p>
          <h2 className="font-display text-[2rem] font-bold leading-tight sm:text-[2.15rem]">
            {t("auth.welcomeBack")}
          </h2>
          <p className="auth-muted text-[15px] font-medium leading-relaxed">{t("auth.enterEmail")}</p>
        </header>

        <form className="space-y-5" onSubmit={handleSignIn}>
          <div className="space-y-2 text-sm">
            <label htmlFor="email" className="auth-label text-[13px] font-semibold">
              {t("auth.email")}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue="admin@driveflow.com"
              placeholder="name@driveflow.so"
              icon={<Mail />}
              className="h-12 rounded-xl border-border/80 bg-white text-[15px] font-medium text-slate-900 shadow-none"
            />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="password" className="auth-label text-[13px] font-semibold">
                {t("auth.password")}
              </label>
              <Link href="/forgot-password" className="auth-link text-xs font-bold transition">
                {t("auth.forgotPassword")}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
                defaultValue="Admin@123"
                placeholder={t("auth.enterPassword")}
                icon={<Lock />}
                className="h-12 rounded-xl border-border/80 bg-white pr-11 text-[15px] font-medium text-slate-900 shadow-none"
              />
              <button
                type="button"
                className="absolute right-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-500 transition hover:text-slate-800"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <label htmlFor="remember" className="auth-muted flex cursor-pointer items-center gap-2.5 text-[13px] font-medium">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="size-4 rounded border-input text-primary accent-primary"
            />
            {t("auth.keepSignedIn")}
          </label>

          <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-[15px] font-bold" disabled={loading}>
            {loading ? t("auth.signingIn") : t("auth.signIn")}
            {!loading ? <MoveRight aria-hidden /> : null}
          </Button>
        </form>

        <p className="auth-muted text-center text-[13px] font-medium">
          {t("auth.needAccount")}{" "}
          <Link href="/support" className="font-bold text-slate-900 underline-offset-4 hover:underline">
            {t("auth.contactSales")}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
