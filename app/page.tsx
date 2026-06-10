import Link from "next/link";
import { GuestbookForm } from "@/components/guestbook/GuestbookForm";

export default function Home() {
  return (
    <main className="home-page">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Realtime guestbook</p>
          <h1>오늘의 추억을 사진이나 그림으로 남겨 주세요.</h1>
          <p>
            방명록은 공유 보드에 포스트잇처럼 붙고, 댓글은 새로고침 없이 실시간으로 업데이트됩니다.
          </p>
          <Link href="/board" className="secondary-link">
            보드 먼저 보기
          </Link>
        </div>
        <GuestbookForm />
      </section>
    </main>
  );
}
