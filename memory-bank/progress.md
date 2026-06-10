# 진행 상황

## 현재 상태

- Next.js App Router 기반 애플리케이션 골격이 생성되었다.
- Supabase 클라이언트, 데이터 접근 함수, 공용 타입, 실시간 구독 훅이 추가되었다.
- `/` 방명록 작성 화면과 `/board` 포스트잇 보드 화면이 구현되었다.
- 사진 업로드, 캔버스 그림 입력, 포스트잇 상세 모달, 실시간 댓글 UI가 구현되었다.
- Supabase Auth 기반 로그인/회원가입, 세션 갱신 `proxy.ts`, 로그인 사용자 작성 제한이 구현되었다.
- Supabase 테이블, 인덱스, RLS 정책, Storage 버킷 설정 SQL이 `supabase/schema.sql`에 추가되었다.
- 인증/인가 구현을 위한 계획 문서 `memory-bank/auth-plan.md`가 추가되었다.
- Supabase 원격 프로젝트에 `guestbook_posts`, `comments`, `guestbook-images`가 생성된 것을 MCP read-only 조회로 확인했다.
- 로컬 실행과 수동 검증 절차가 `README.md`에 문서화되었다.
- 현재 환경에서는 npm registry 접근이 403으로 차단되어 의존성 설치와 빌드 검증은 완료하지 못했다.

## 완료된 작업

- 제품 요구사항을 정리했다.
- 상위 수준 아키텍처를 정의했다.
- Supabase 기반 권장 데이터 모델을 정의했다.
- 구현 단계를 정의했다.
- memory-bank 문서를 항상 조회하고 갱신하도록 프로젝트 지침을 추가했다.
- 문서 작성, 작업 보고, 사용자 커뮤니케이션을 한국어로 진행하도록 지침을 추가했다.
- 기존 memory-bank 문서를 한국어 기준으로 정리했다.
- Next.js 프로젝트 기본 설정 파일을 추가했다.
- 환경 변수 예시 파일 `.env.example`을 추가했다.
- Supabase 브라우저 클라이언트와 방명록/댓글 CRUD 함수를 추가했다.
- `guestbook_posts` insert와 `comments` insert를 구독하는 실시간 훅을 추가했다.
- 방명록 작성 폼, 업로드 미리보기, 드로잉 캔버스 컴포넌트를 추가했다.
- 포스트잇 보드, 포스트잇 카드, 상세 모달, 댓글 목록/작성 폼을 추가했다.
- 접근성을 고려해 폼 레이블, 모달 `Escape` 닫기, 포커스 복귀, 버튼 이름을 반영했다.
- Supabase SQL과 로컬 실행 문서를 추가했다.
- 현재 익명 작성 구조를 Supabase Auth 기반 소유권/RLS 구조로 전환하기 위한 계획을 `memory-bank/auth-plan.md`에 정리했다.
- 원격 Supabase 스키마 적용 상태를 조회해 앱용 테이블과 Storage 버킷 생성을 확인했다.
- 방명록 제출 성공 후 그림 입력 모드의 `DrawingCanvas`가 reset signal을 받아 이전 픽셀과 내부 그림 상태를 함께 초기화되도록 수정했다.
- `memory-bank/auth-plan.md` 기준으로 방명록/댓글/이미지 업로드를 로그인 사용자 전용으로 전환했다.
- 기존 공개 보드 읽기는 유지하고, 새 row에는 `user_id`를 저장하도록 데이터 접근 함수를 수정했다.
- `npm run typecheck`와 `npm run build`가 통과했다.
- `npm run lint`는 Next.js 16에서 `next lint` 명령이 유효하지 않아 실패했다.

## 다음 작업

1. Realtime publication에 `guestbook_posts`, `comments` 테이블이 포함되었는지 확인한다.
2. Supabase Auth Email provider, Site URL, Redirect URL을 실제 프로젝트 Dashboard에서 설정한다.
3. `supabase/schema.sql`을 원격 프로젝트에 적용해 `user_id`, RLS, Storage upload 정책을 갱신한다.
4. 로그인/회원가입, 방명록 작성, 댓글 작성, Storage 업로드, Realtime 갱신을 실환경에서 수동 검증한다.
5. Next.js 16에 맞는 lint 구성을 별도로 추가하거나 `lint` 스크립트를 갱신한다.
6. 필요하면 이미지 용량 제한, 파일 타입 검사, 댓글 삭제/관리 기능을 추가한다.
7. 구현 검증 후 UI 세부 반응형과 포커스 트랩을 더 정교하게 다듬는다.
8. Supabase advisor 경고 중 앱 정책 의도와 다른 항목이 있는지 검토한다.

## 중요 메모

- 이후 구현 작업은 변경 전에 `memory-bank/architecture.md`, `memory-bank/implementation-plan.md`, 이 파일을 반드시 읽어야 한다.
- 인증/인가 구현 작업은 변경 전에 `memory-bank/auth-plan.md`도 반드시 읽어야 한다.
- 아키텍처나 계획이 바뀌면 memory-bank 문서에 즉시 반영해야 한다.
- 진행 상황은 의미 있는 구현 마일스톤 이후 갱신해야 한다.
- 문서와 사용자 커뮤니케이션은 한국어로 작성한다. 단, 코드 식별자, 파일명, 명령어, 환경 변수, 외부 서비스 고유 명칭은 필요한 경우 원문을 유지한다.
- `public.guestbook`은 사용자가 학습 용도로 만든 테이블이며 현재 앱에서는 사용하지 않는다.
