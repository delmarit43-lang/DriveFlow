import * as React from "react";
import { Camera, ImagePlus, KeyRound, Save, Trash2, UserRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useLocale } from "@/i18n/locale-context";
import { useAuth } from "@/store/auth-store";
import { fileToAvatarDataUrl } from "@/store/user-profile-store";
import { cn } from "@/lib/utils";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  STAFF: "Staff",
};

export default function ProfilePage() {
  const toast = useToast();
  const { t } = useLocale();
  const { user, ready, updateUser } = useAuth();
  const fileRef = React.useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone ?? "");
  }, [user]);

  if (!ready) {
    return (
      <div className="grid min-h-[40vh] place-items-center text-sm text-muted-foreground">Loading profile…</div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-[900px] py-10 text-center text-muted-foreground">
        Sign in to view your profile.
      </div>
    );
  }

  const onPickPhoto = () => fileRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      await updateUser({ profileImage: dataUrl });
      toast({
        title: t("profile.photoUpdated"),
        description: t("profile.photoUpdatedDesc"),
        tone: "success",
      });
    } catch (err) {
      toast({
        title: t("profile.uploadFailed"),
        description: err instanceof Error ? err.message : t("profile.uploadFailed"),
        tone: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const onRemovePhoto = async () => {
    try {
      await updateUser({ profileImage: "" });
      toast({ title: t("profile.photoRemoved"), description: t("profile.photoRemovedDesc"), tone: "info" });
    } catch (err) {
      toast({
        title: t("profile.uploadFailed"),
        description: err instanceof Error ? err.message : "Could not remove photo.",
        tone: "error",
      });
    }
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser({ fullName, email, phone });
      toast({ title: t("profile.saved"), description: t("profile.savedDesc"), tone: "success" });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Could not update profile.",
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Confirm the new password carefully.", tone: "error" });
      return;
    }
    setChangingPassword(true);
    try {
      const { api } = await import("@/services/api");
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Password updated", description: "Use your new password next time you sign in.", tone: "success" });
    } catch (err) {
      toast({
        title: "Password change failed",
        description: err instanceof Error ? err.message : "Could not change password.",
        tone: "error",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <PageHeader
        title={t("page.profile.title")}
        description={t("page.profile.desc")}
        breadcrumbs={[{ label: t("common.dashboard"), href: "/" }, { label: t("page.profile.title") }]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5 text-primary" /> {t("profile.photo")}
          </CardTitle>
          <CardDescription>{t("profile.photoDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <div className="relative">
              <Avatar
                src={user.profileImage}
                name={fullName || user.fullName}
                className="size-28 ring-4 ring-primary/10"
              />
              <button
                type="button"
                onClick={onPickPhoto}
                disabled={uploading}
                aria-label={t("profile.uploadPhoto")}
                className={cn(
                  "absolute bottom-1 right-1 flex size-9 items-center justify-center rounded-full",
                  "bg-primary text-primary-foreground shadow-lift",
                  "ring-2 ring-card transition hover:brightness-110",
                  "disabled:opacity-60",
                )}
              >
                <Camera className="size-4" />
              </button>
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="text-lg font-semibold tracking-tight">{fullName || user.fullName}</p>
                <p className="text-sm text-muted-foreground">{roleLabel[user.role] ?? user.role}</p>
                <Badge variant="muted" className="mt-2">
                  {email || user.email}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={onPickPhoto} disabled={uploading}>
                  <ImagePlus /> {uploading ? t("profile.uploading") : t("profile.uploadPhoto")}
                </Button>
                <Button type="button" variant="secondary" onClick={() => void onRemovePhoto()} disabled={uploading}>
                  <Trash2 /> {t("profile.remove")}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t("profile.photoTip")}</p>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onFileChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("profile.accountDetails")}</CardTitle>
          <CardDescription>{t("profile.accountDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSave}>
            <Field label={t("profile.fullName")}>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </Field>
            <Field label={t("profile.role")}>
              <Input value={roleLabel[user.role] ?? user.role} disabled />
            </Field>
            <Field label={t("profile.email")}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label={t("profile.phone")}>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+252 63 …" />
            </Field>
            <div className="sm:col-span-2 flex justify-end border-t border-border pt-4">
              <Button type="submit" disabled={saving}>
                <Save /> {saving ? "Saving…" : t("profile.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" /> Change password
          </CardTitle>
          <CardDescription>Update your account password. You will stay signed in on this device.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form className="grid max-w-lg gap-4" onSubmit={onChangePassword}>
            <Field label="Current password">
              <Input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </Field>
            <Field label="New password" hint="At least 8 characters">
              <Input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </Field>
            <Field label="Confirm new password">
              <Input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </Field>
            <div>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
