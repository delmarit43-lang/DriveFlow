import * as React from "react";
import { Link } from "@/lib/navigation";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useLocale } from "@/i18n/locale-context";
import { api } from "@/services/api";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const toast = useToast();
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  return (
    <AuthShell headline={t("auth.resetHeadline")} support={t("auth.resetSupport")}>
      {sent ? (
        <div className="space-y-6 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="size-7" />
          </span>
          <header className="space-y-2">
            <h2 className="font-display text-[2rem] font-bold leading-tight">{t("auth.checkInbox")}</h2>
            <p className="auth-muted text-[15px] font-medium leading-relaxed">
              {t("auth.resetSent", { email })}
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
            <p className="auth-muted text-[15px] font-medium leading-relaxed">{t("auth.resetIntro")}</p>
          </header>

          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                await api.forgotPassword(email);
                setSent(true);
              } catch (err) {
                toast({
                  title: t("auth.resetPassword"),
                  description: err instanceof Error ? err.message : "Request failed",
                  tone: "error",
                });
              } finally {
                setLoading(false);
              }
            }}
          >
            <label className="block space-y-2 text-sm">
              <span className="auth-label font-semibold">{t("auth.workEmail")}</span>
              <Input
                type="email"
                required
                placeholder="name@driveflow.so"
                icon={<Mail />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-border/80 bg-white text-[15px] font-medium text-slate-900 shadow-none"
              />
            </label>
            <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-[15px] font-bold" disabled={loading}>
              {t("auth.sendReset")}
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
