"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function AuthStatus() {
  const router = useRouter();
  const { user, isLoading } = useAuthUser();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (!isSupabaseConfigured) {
      return;
    }

    setIsSigningOut(true);
    await getSupabaseBrowserClient().auth.signOut();
    setIsSigningOut(false);
    router.refresh();
  }

  if (isLoading) {
    return <p className="auth-status">세션 확인 중...</p>;
  }

  if (!user) {
    return (
      <Link href="/login" className="secondary-link">
        로그인
      </Link>
    );
  }

  return (
    <div className="auth-status">
      <span>{user.email}</span>
      <button type="button" onClick={handleSignOut} disabled={isSigningOut}>
        {isSigningOut ? "로그아웃 중..." : "로그아웃"}
      </button>
    </div>
  );
}
