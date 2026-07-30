import * as React from "react";
import { Link } from "@/lib/navigation";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/services/api";

export default function ResetPasswordPage() {
  const { t } = useLocale();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  return (
    <AuthShell headline={t("auth.resetHeadline")} support={t("auth.resetSupport")}>
      {done ? (
        <div className="space-y-6 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-7" />
          </span>
          <header className="space-y-2">
            <h2 className="font-display text-[2rem] font-bold leading-tight">{t("auth.resetPassword")}</h2>
            <p className="auth-muted text-[15px] font-medium leading-relaxed">
              Your password has been updated. You can sign in with your new credentials.
            </p>
          </header>
          <Button className="h-12 w-full rounded-xl" size="lg" asChild>
            <Link href="/login">{t("auth.backToSignIn")}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <header className="space-y-2">
            <p className="auth-link text-[11px] font-bold uppercase tracking-[0.2em]">{t("auth.account")}</p>
            <h2 className="font-display text-[2rem] font-bold leading-tight sm:text-[2.15rem]">
              {t("auth.resetPassword")}
            </h2>
            <p className="auth-muted text-[15px] font-medium leading-relaxed">Enter your new password below.</p>
          </header>

          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              if (password !== confirm) {
                toast({
                  title: t("auth.resetPassword"),
                  description: "Passwords do not match.",
                  tone: "error",
                });
                return;
              }
              if (!token) {
                toast({
                  title: t("auth.resetPassword"),
                  description: "Reset link is invalid or expired.",
                  tone: "error",
                });
                return;
              }
              setLoading(true);
              try {
                await api.resetPassword({ token, newPassword: password });
                setDone(true);
              } catch (err) {
                toast({
                  title: t("auth.resetPassword"),
                  description: err instanceof Error ? err.message : "Reset failed",
                  tone: "error",
                });
              } finally {
                setLoading(false);
              }
            }}
          >
            <label className="block space-y-2 text-sm">
              <span className="auth-label font-semibold">{t("auth.password")}</span>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder={t("auth.enterPassword")}
                  icon={<Lock />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </label>
            <label className="block space-y-2 text-sm">
              <span className="auth-label font-semibold">Confirm password</span>
              <Input
                type={show ? "text" : "password"}
                required
                minLength={8}
                placeholder="Re-enter your password"
                icon={<Lock />}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-12 rounded-xl border-border/80 bg-white text-[15px] font-medium text-slate-900 shadow-none"
              />
            </label>
            <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-[15px] font-bold" disabled={loading}>
              {t("auth.resetPassword")}
            </Button>
          </form>

          <Link
            href="/login"
            className="auth-muted inline-flex items-center gap-2 text-sm font-semibold transition hover:text-slate-900"
          >
            <ArrowLeft className="size-4" /> {t("auth.backToSignIn")}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
