"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type AuthMode = "signin" | "signup";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setError(null);

    if (!isSupabaseConfigured) {
      setError("Supabase 환경 변수를 먼저 설정해 주세요.");
      return;
    }

    if (!email.trim() || password.length < 6) {
      setError("이메일과 6자 이상의 비밀번호를 입력해 주세요.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (signInError) {
          throw signInError;
        }

        router.push("/");
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        router.push("/");
        router.refresh();
        return;
      }

      setStatus("가입 확인 메일을 보냈습니다. 메일의 링크를 눌러 로그인을 완료해 주세요.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증 요청에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <fieldset className="auth-mode">
        <legend>인증 방식</legend>
        <label>
          <input
            type="radio"
            name="authMode"
            checked={mode === "signin"}
            onChange={() => setMode("signin")}
          />
          로그인
        </label>
        <label>
          <input
            type="radio"
            name="authMode"
            checked={mode === "signup"}
            onChange={() => setMode("signup")}
          />
          회원가입
        </label>
      </fieldset>

      <label>
        이메일
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          required
        />
      </label>

      <label>
        비밀번호
        <input
          type="password"
          value={password}
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="6자 이상"
          required
        />
      </label>

      {error && <p className="form-message error" role="alert">{error}</p>}
      {status && <p className="form-message success" role="status">{status}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "처리 중..." : mode === "signin" ? "로그인" : "회원가입"}
      </button>
    </form>
  );
}
