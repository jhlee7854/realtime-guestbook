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
2. Supabase Authentication에서 Email provider를 활성화합니다.
3. Authentication URL Configuration에 로컬 개발 주소와 배포 주소를 등록합니다.
   - 로컬 예: `http://localhost:3000`
   - Redirect URL 예: `http://localhost:3000/auth/callback`
4. 프로젝트의 Realtime 설정에서 `guestbook_posts`, `comments` 테이블을 publication에 포함합니다.
5. `guestbook-images` 버킷이 public 상태인지 확인합니다.

## 인증/인가 정책

- `/board`의 방명록과 댓글 읽기는 공개입니다.
- 방명록 작성, 댓글 작성, 이미지 업로드는 Supabase Auth 로그인 사용자만 가능합니다.
- 새 방명록과 댓글은 `auth.users.id`를 `user_id`에 저장합니다.
- 새 이미지는 `users/{userId}/uploads/*` 또는 `users/{userId}/drawings/*` 경로로 업로드됩니다.
- 기존 익명 데이터와 기존 `uploads/*`, `drawings/*` 이미지는 계속 읽을 수 있도록 보존합니다.

## 수동 검증 절차

1. 두 브라우저 창에서 `/board`를 엽니다.
2. 다른 창에서 `/`에 접속해 사진 업로드 또는 그림으로 방명록을 등록합니다.
3. `/board` 창에 새 포스트잇이 새로고침 없이 추가되는지 확인합니다.
4. 두 창에서 같은 포스트잇 상세를 연 뒤 댓글을 남깁니다.
5. 댓글 목록과 보드의 댓글 수가 실시간으로 갱신되는지 확인합니다.
6. 로그아웃 상태에서 방명록/댓글 작성 UI가 로그인 안내로 표시되는지 확인합니다.
