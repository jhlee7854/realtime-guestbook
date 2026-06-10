# Realtime Guestbook

사진 업로드와 캔버스 그림, 포스트잇 보드, 실시간 댓글을 지원하는 전자 방명록 웹앱입니다.

## 기술 스택

- Next.js App Router
- React
- Supabase Postgres, Realtime, Storage
- 전역 CSS

## 로컬 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에는 Supabase 프로젝트 값을 입력합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=guestbook-images
```

## Supabase 설정

1. Supabase SQL Editor에서 `supabase/schema.sql`을 실행합니다.
2. 프로젝트의 Realtime 설정에서 `guestbook_posts`, `comments` 테이블을 publication에 포함합니다.
3. `guestbook-images` 버킷이 public 상태인지 확인합니다.

## 수동 검증 절차

1. 두 브라우저 창에서 `/board`를 엽니다.
2. 다른 창에서 `/`에 접속해 사진 업로드 또는 그림으로 방명록을 등록합니다.
3. `/board` 창에 새 포스트잇이 새로고침 없이 추가되는지 확인합니다.
4. 두 창에서 같은 포스트잇 상세를 연 뒤 댓글을 남깁니다.
5. 댓글 목록과 보드의 댓글 수가 실시간으로 갱신되는지 확인합니다.
