# 인증/인가 구현 계획 및 반영 상태

## 목적

이 문서는 기존 익명 작성 구조를 Supabase Auth 기반 작성 권한 구조로 전환하기 위한 기준 문서다. 인증/인가 관련 구현 시에는 이 문서를 반드시 참조해 공개 보드 경험을 유지하면서 작성, 업로드, 수정, 삭제 권한을 명확히 분리한다.

## 구현 전 구조 요약

- Supabase 브라우저 anon client가 DB와 Storage에 직접 접근한다.
- `guestbook_posts`, `comments` 테이블에 Auth 사용자 소유권을 나타내는 `user_id` 컬럼이 없다.
- RLS 정책은 공개 읽기와 익명 insert를 허용한다.
- `guestbook-images` Storage 버킷은 public이며, `uploads/%`, `drawings/%` 경로에 누구나 업로드할 수 있다.
- 이미지 URL은 public URL 형태로 `guestbook_posts.image_url`에 저장된다.
- `/board`는 공개 보드이고, `/`는 방명록 작성 화면이다.

## 반영 상태

- `@supabase/ssr` 기반 브라우저 client와 서버 client를 추가했다.
- Next.js 16 기준 세션 갱신용 `proxy.ts`를 추가했다.
- `/login`과 `/auth/callback` 라우트를 추가했다.
- email/password 로그인과 회원가입 UI를 추가했다.
- 비로그인 사용자는 `/board`를 볼 수 있지만 방명록과 댓글 작성은 로그인 안내로 제한된다.
- `createGuestbookPost()`와 `createComment()`는 현재 Auth 사용자를 확인하고 `user_id`를 저장한다.
- 새 이미지는 `users/{userId}/uploads/*` 또는 `users/{userId}/drawings/*` 경로로 업로드한다.
- `supabase/schema.sql`은 공개 읽기 유지, authenticated insert/upload 제한, nullable `user_id` 마이그레이션을 반영한다.

## 권장 정책

- 보드와 댓글 읽기는 공개 유지한다.
- 방명록 작성, 댓글 작성, 이미지 업로드는 로그인 사용자만 허용한다.
- 작성자 표시용 `author_name`은 유지한다.
- 데이터 소유권은 Auth 사용자 id 기반 `user_id`로 관리한다.
- 수정과 삭제 기능을 추가할 경우 소유자만 허용한다.
- 관리자 기능은 MVP 인증 구현과 분리하고, 필요 시 `profiles`, `user_roles`, custom claim 중 하나로 별도 설계한다.
- 기존 익명 데이터는 보존한다. 과거 row의 `user_id`는 `null`일 수 있으므로 초기 마이그레이션에서 `not null`을 강제하지 않는다.

## 수정 대상

### 의존성과 Supabase client

- `@supabase/ssr` 의존성을 추가한다.
- 브라우저 client와 서버 client를 분리한다.
  - 예: `lib/supabase/browser.ts`
  - 예: `lib/supabase/server.ts`
- Next.js App Router 세션 갱신용 `proxy.ts`를 추가한다.
- `proxy.ts`에서 `supabase.auth.getUser()`를 호출해 세션 쿠키를 갱신한다.
- 기존 `lib/supabase/client.ts`는 Auth 호환 구조로 교체하거나 래퍼 역할만 남긴다.

### 라우트와 UI

- 로그인 라우트를 추가한다.
  - 예: `/login`
  - 예: `/auth/callback`
- 인증 방식은 우선 하나만 선택한다.
  - magic link
  - email/password
- 로그아웃 동작을 추가한다.
- 비로그인 사용자는 `/board` 조회가 가능해야 한다.
- 비로그인 사용자가 `/` 작성 화면에 접근하면 로그인 유도 또는 제출 비활성화를 보여준다.
- 로그인 사용자는 기존과 동일하게 사진 업로드, 캔버스 그림, 댓글 작성을 사용할 수 있어야 한다.

### 데이터 모델

- `guestbook_posts.user_id uuid references auth.users(id) on delete set null`을 추가한다.
- `comments.user_id uuid references auth.users(id) on delete set null`을 추가한다.
- 소유자 조회와 관리 기능 확장을 위해 인덱스를 추가한다.
  - `guestbook_posts(user_id, created_at desc)`
  - `comments(user_id, created_at desc)`
- 타입 정의에 `user_id: string | null`을 반영한다.

### 데이터 접근 함수

- `createGuestbookPost()`에서 현재 사용자 확인을 수행한다.
- 로그인하지 않은 상태에서는 방명록 생성을 차단한다.
- Storage 업로드 경로에 Auth 사용자 id를 포함한다.
  - `users/{userId}/uploads/{postId}.{ext}`
  - `users/{userId}/drawings/{postId}.png`
- `guestbook_posts` insert 시 `user_id`를 함께 저장한다.
- `createComment()`에서 현재 사용자 확인을 수행하고 `comments.user_id`를 저장한다.
- 조회 함수와 Realtime 구독은 공개 읽기 정책을 전제로 유지하되, 타입 변경에 맞게 조정한다.

### Storage 정책

- `guestbook-images` 버킷의 public read는 유지할 수 있다.
- 업로드는 authenticated 사용자만 허용한다.
- 새 업로드 경로는 `users/{userId}/...` 형태로 제한한다.
- 기존 `uploads/%`, `drawings/%` 파일은 읽기 호환성을 유지한다.
- 비공개 이미지가 요구되면 public bucket과 public URL 저장 방식을 signed URL 방식으로 별도 재설계한다.

## DB 마이그레이션 초안

기존 데이터를 보존하기 위해 `user_id`는 nullable로 추가한다.

```sql
alter table public.guestbook_posts
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.comments
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists guestbook_posts_user_id_created_at_idx
  on public.guestbook_posts(user_id, created_at desc);

create index if not exists comments_user_id_created_at_idx
  on public.comments(user_id, created_at desc);
```

## RLS 마이그레이션 초안

공개 읽기는 유지하고, insert는 authenticated 사용자만 허용한다.

```sql
drop policy if exists "Anyone can create guestbook posts" on public.guestbook_posts;
drop policy if exists "Anyone can create comments" on public.comments;

create policy "Authenticated users can create guestbook posts"
  on public.guestbook_posts
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Authenticated users can create comments"
  on public.comments
  for insert
  to authenticated
  with check (user_id = auth.uid());
```

수정과 삭제 기능을 추가할 때는 다음 정책을 함께 검토한다.

```sql
create policy "Users can update own guestbook posts"
  on public.guestbook_posts
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own guestbook posts"
  on public.guestbook_posts
  for delete
  to authenticated
  using (user_id = auth.uid());

create policy "Users can delete own comments"
  on public.comments
  for delete
  to authenticated
  using (user_id = auth.uid());
```

## Storage RLS 마이그레이션 초안

```sql
drop policy if exists "Anyone can upload guestbook images" on storage.objects;

create policy "Authenticated users can upload own guestbook images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'guestbook-images'
    and (storage.foldername(name))[1] = 'users'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
```

기존 public read 정책은 유지한다.

```sql
create policy "Anyone can read guestbook images"
  on storage.objects
  for select
  using (bucket_id = 'guestbook-images');
```

## 배포 순서

1. Supabase Auth provider를 선택하고 Dashboard에서 Site URL과 Redirect URL을 설정한다.
2. nullable `user_id` 컬럼과 인덱스를 먼저 추가한다.
3. Auth client, `proxy.ts`, 로그인 UI를 구현한다.
4. 방명록과 댓글 생성 코드가 `user_id`를 포함하도록 수정한다.
5. Storage 업로드 경로를 `users/{userId}/...`로 전환한다.
6. 새 코드 배포 후 로그인 사용자 작성이 정상 동작하는지 확인한다.
7. DB insert RLS를 authenticated 전용으로 교체한다.
8. Storage 익명 업로드 정책을 제거하고 authenticated 전용 정책으로 교체한다.
9. README와 memory-bank 문서를 갱신한다.

## 검증 항목

- 비로그인 사용자는 `/board`에서 기존 방명록과 댓글을 조회할 수 있다.
- 비로그인 사용자는 방명록 작성, 댓글 작성, 이미지 업로드를 할 수 없다.
- 로그인 사용자는 방명록을 작성할 수 있다.
- 로그인 사용자는 사진 업로드와 캔버스 그림 업로드를 모두 할 수 있다.
- 로그인 사용자는 댓글을 작성할 수 있다.
- 새 `guestbook_posts.user_id`가 현재 Auth 사용자 id와 일치한다.
- 새 `comments.user_id`가 현재 Auth 사용자 id와 일치한다.
- 새 Storage object path가 `users/{userId}/...` 형태로 저장된다.
- 기존 `uploads/%`, `drawings/%` 이미지가 계속 렌더링된다.
- 두 브라우저 창에서 방명록 insert와 댓글 insert Realtime 갱신이 유지된다.
- anon key만 사용한 직접 insert와 upload가 RLS에 의해 거부된다.

## 주의사항

- `user_id`를 바로 `not null`로 만들지 않는다. 기존 익명 데이터가 깨질 수 있다.
- 기존 익명 글을 특정 사용자에게 귀속해야 한다면 별도 운영 정책과 데이터 보정 스크립트가 필요하다.
- public Storage 버킷은 URL을 아는 사람이 이미지에 접근할 수 있다.
- 비공개 이미지 요구사항이 생기면 signed URL, 만료 시간, 서버 경유 조회를 포함해 별도 마이그레이션을 설계한다.
- 관리자 권한은 단순 owner RLS와 다르므로 별도 역할 모델을 먼저 확정한다.
