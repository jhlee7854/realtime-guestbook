import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div>
          <p className="eyebrow">Guestbook auth</p>
          <h1>로그인 후 방명록을 남겨 주세요.</h1>
          <p className="helper-text">
            보드는 누구나 볼 수 있고, 방명록과 댓글 작성은 로그인 사용자만 할 수 있습니다.
          </p>
          <Link href="/board" className="secondary-link">
            보드 보기
          </Link>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
