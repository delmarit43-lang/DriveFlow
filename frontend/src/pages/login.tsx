import { Link, useRouter } from "@/lib/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useRef, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/i18n/locale-context";
import { useAuth } from "@/store/auth-store";

type RoleOption = "admin" | "manager" | "staff";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { login } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2-Step Verification State
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [require2FA, setRequire2FA] = useState(true);
  const [otp, setOtp] = useState<string[]>(["1", "2", "3", "4", "5", "6"]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [activeRole, setActiveRole] = useState<RoleOption>("admin");
  const [email, setEmail] = useState("admin@driveflow.com");
  const [password, setPassword] = useState("Admin@123");

  function handleSelectRole(role: RoleOption) {
    setActiveRole(role);
    setError(null);
    if (role === "admin") {
      setEmail("admin@driveflow.com");
      setPassword("Admin@123");
    } else if (role === "manager") {
      setEmail("manager@driveflow.com");
      setPassword("Manager@123");
    } else {
      setEmail("staff@driveflow.com");
      setPassword("Staff@123");
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split("");
    const newOtp = [...otp];
    digits.forEach((d, idx) => {
      newOtp[idx] = d;
    });
    setOtp(newOtp);
    const nextFocusIndex = Math.min(digits.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  }

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters for security.");
      return;
    }

    if (require2FA && step === "credentials") {
      setStep("2fa");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits of your security verification code.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification code invalid.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="space-y-6 text-slate-100">
        {step === "credentials" ? (
          <>
            <header className="space-y-1.5">
              <h2 className="font-sans text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {t("auth.welcomeBack")}
              </h2>
              <p className="text-xs font-normal leading-relaxed text-slate-400">
                {t("auth.enterEmail")}
              </p>
            </header>

            {/* Preset Account Selector */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Demo Credentials
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectRole("admin")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 px-2 text-center transition-all ${
                    activeRole === "admin"
                      ? "border-indigo-500 bg-indigo-600/20 text-white font-semibold shadow-sm"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <Shield className="size-3.5 text-indigo-400" />
                  <span className="text-xs">Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole("manager")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 px-2 text-center transition-all ${
                    activeRole === "manager"
                      ? "border-indigo-500 bg-indigo-600/20 text-white font-semibold shadow-sm"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <UserCheck className="size-3.5 text-blue-400" />
                  <span className="text-xs">Manager</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole("staff")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 px-2 text-center transition-all ${
                    activeRole === "staff"
                      ? "border-indigo-500 bg-indigo-600/20 text-white font-semibold shadow-sm"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <Briefcase className="size-3.5 text-emerald-400" />
                  <span className="text-xs">Staff</span>
                </button>
              </div>
            </div>

            {error ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            ) : null}

            <motion.form
              className="space-y-4"
              onSubmit={handleSignIn}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="space-y-1.5 text-sm">
                <label htmlFor="email" className="text-xs font-medium text-slate-300">
                  {t("auth.email")}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@driveflow.com"
                  icon={<Mail className="size-4 text-slate-500" />}
                  className="h-10 rounded-lg border-slate-800 bg-slate-900/90 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="password" className="text-xs font-medium text-slate-300">
                    {t("auth.password")}
                  </label>
                  <Link href="/forgot-password" className="text-xs font-medium text-indigo-400 hover:underline">
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.enterPassword")}
                    icon={<Lock className="size-4 text-slate-500" />}
                    className="h-10 rounded-lg border-slate-800 bg-slate-900/90 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10 text-xs"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-slate-500 transition hover:text-slate-200"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-1 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="remember" className="flex cursor-pointer items-center gap-2 text-xs font-normal text-slate-400 hover:text-slate-200">
                    <Checkbox id="remember" name="remember" defaultChecked />
                    {t("auth.keepSignedIn")}
                  </label>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <label htmlFor="2fa-toggle" className="flex cursor-pointer items-center gap-2 text-xs font-medium text-indigo-300 hover:text-indigo-200">
                    <Checkbox
                      id="2fa-toggle"
                      checked={require2FA}
                      onCheckedChange={(checked) => setRequire2FA(Boolean(checked))}
                    />
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="size-3.5 text-indigo-400" />
                      Require 2-Step Verification Code
                    </span>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-10 w-full rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    {t("auth.signingIn")}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {require2FA ? "Next: 2-Step Verification" : t("auth.signIn")}
                    <ArrowRight className="size-4" />
                  </span>
                )}
              </Button>
            </motion.form>

            <p className="text-center text-xs font-normal text-slate-500 pt-2">
              {t("auth.needAccount")}{" "}
              <Link href="/support" className="font-semibold text-slate-300 underline-offset-4 hover:underline">
                {t("auth.contactSales")}
              </Link>
            </p>
          </>
        ) : (
          /* Step 2: 2-Step Verification Screen */
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                <KeyRound className="size-5" />
              </div>
              <div>
                <h2 className="font-sans text-xl font-bold tracking-tight text-white">
                  2-Step Verification
                </h2>
                <p className="text-xs text-slate-400">
                  Enter your 6-digit security code
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-3 text-xs text-indigo-200 flex items-start gap-2">
              <ShieldCheck className="size-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Security Code Sent</p>
                <p className="text-[11px] text-indigo-300/90 mt-0.5">
                  A verification code has been dispatched to <strong>{email}</strong>.
                </p>
              </div>
            </div>

            {error ? (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            ) : null}

            <form onSubmit={handleVerify2FA} className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Enter 6-digit PIN</span>
                  <span className="font-mono text-indigo-400 font-medium text-[11px]">Demo: 123456</span>
                </div>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="size-11 rounded-lg border border-slate-800 bg-slate-900/90 text-center text-lg font-bold font-mono text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  size="lg"
                  className="h-10 w-full rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Verifying Code...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="size-4" />
                      Verify & Access Dashboard
                    </span>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep("credentials");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="size-3.5" />
                  Back to Sign In Credentials
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </AuthShell>
  );
}

