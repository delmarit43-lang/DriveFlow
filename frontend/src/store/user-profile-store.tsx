import * as React from "react";
import { CURRENT_USER } from "@/constants/navigation";

export type UserProfile = {
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
};

const STORAGE_KEY = "driveflow-user-profile-v2";

const defaults: UserProfile = {
  name: CURRENT_USER.name,
  role: CURRENT_USER.role,
  company: CURRENT_USER.company,
  email: CURRENT_USER.email,
  phone: "",
  location: "",
  bio: "",
  avatar: CURRENT_USER.avatar,
};

type Ctx = {
  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => void;
  setAvatar: (dataUrl: string) => void;
  clearAvatar: () => void;
  resetProfile: () => void;
};

const UserProfileContext = React.createContext<Ctx | null>(null);

function readStored(): UserProfile {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function persist(profile: UserProfile) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* quota / private mode */
  }
}

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = React.useState<UserProfile>(defaults);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setProfile(readStored());
    setReady(true);
  }, []);

  const updateProfile = React.useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, []);

  const setAvatar = React.useCallback((dataUrl: string) => {
    updateProfile({ avatar: dataUrl });
  }, [updateProfile]);

  const clearAvatar = React.useCallback(() => {
    updateProfile({ avatar: defaults.avatar });
  }, [updateProfile]);

  const resetProfile = React.useCallback(() => {
    setProfile(defaults);
    persist(defaults);
  }, []);

  const value = React.useMemo(
    () => ({ profile, updateProfile, setAvatar, clearAvatar, resetProfile }),
    [profile, updateProfile, setAvatar, clearAvatar, resetProfile],
  );

  if (!ready) {
    return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
  }

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
  const ctx = React.useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
}

/** Resize & compress an image file to a data URL suitable for localStorage. */
export async function fileToAvatarDataUrl(file: File, maxSize = 512, quality = 0.85): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG, PNG, or WebP).");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be smaller than 5 MB.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process this image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}
