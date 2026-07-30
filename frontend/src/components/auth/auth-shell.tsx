import * as React from "react";
import { motion } from "framer-motion";
import { Car } from "lucide-react";
import { BRAND, languages } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/locale-context";
import { type LocaleCode } from "@/i18n/translations";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=80";

export function AuthShell({
  children,
  headline,
  support,
}: {
  children: React.ReactNode;
  headline?: string;
  support?: string;
}) {
  const { t, locale, setLocale } = useLocale();
  const heroHeadline = headline ?? t("auth.heroHeadline");
  const heroSupport = support ?? t("auth.heroSupport");

  return (
    <div className="auth-shell relative min-h-screen bg-[#f4f6f8] font-auth">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Full-bleed visual plane */}
        <aside className="relative isolate hidden min-h-screen overflow-hidden bg-[#0b1220] lg:block">
          <motion.img
            src={HERO_IMAGE}
            alt=""
            className="absolute inset-0 size-full object-cover"
            initial={{ scale: 1.08, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, rgba(8,12,22,0.62) 0%, rgba(8,12,22,0.35) 42%, rgba(8,12,22,0.88) 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.28), transparent 42%), radial-gradient(circle at 80% 70%, rgba(14,165,233,0.18), transparent 36%)",
            }}
          />

          <div className="relative z-10 flex h-full min-h-screen flex-col justify-between p-10 xl:p-14">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm">
                <Car className="size-5" strokeWidth={2.25} />
              </span>
              <span className="auth-hero-brand font-display text-[1.65rem] font-bold leading-none tracking-tight">
                {BRAND.name}
              </span>
            </motion.div>

            <motion.div
              className="max-w-lg space-y-4 pb-6"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="auth-hero-title font-display text-[2.85rem] font-bold leading-[1.05] xl:text-[3.25rem]">
                {heroHeadline}
              </h1>
              <p className="auth-hero-copy max-w-md text-[15px] font-medium leading-relaxed">{heroSupport}</p>
            </motion.div>
          </div>
        </aside>

        {/* Interaction panel */}
        <main className="relative flex min-h-screen flex-col">
          <div className="absolute end-4 top-4 z-20 sm:end-6 sm:top-6">
            <label className="sr-only" htmlFor="auth-locale">
              {t("topbar.selectLanguage")}
            </label>
            <select
              id="auth-locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value as LocaleCode)}
              className="h-10 rounded-xl border border-border bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.nativeLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile hero strip — brand first */}
          <div className="relative h-44 overflow-hidden bg-[#0b1220] lg:hidden">
            <img src={HERO_IMAGE} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/65 to-[#0b1220]/35" />
            <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-5">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-white/25">
                  <Car className="size-4" strokeWidth={2.25} />
                </span>
                <span className="auth-hero-brand font-display text-[1.35rem] font-bold leading-none tracking-tight">
                  {BRAND.name}
                </span>
              </div>
              <p className="auth-hero-copy text-sm font-medium">{BRAND.tagline}</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
            <motion.div
              key={locale}
              className="mx-auto w-full max-w-[400px]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </div>

          <p className={cn("auth-footer px-6 pb-6 text-center text-[11px] font-medium sm:px-10")}>
            © {new Date().getFullYear()} {BRAND.name} · {t("auth.privacyFooter")}
          </p>
        </main>
      </div>
    </div>
  );
}
