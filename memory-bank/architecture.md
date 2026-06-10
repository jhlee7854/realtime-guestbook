# 아키텍처

## 제품 요약

이 프로젝트는 실시간 전자 방명록 웹앱이다. 방문자는 이름, 짧은 메시지, 사진 업로드 또는 캔버스 그림을 이용해 방명록을 작성한다. 작성된 방명록은 공유 보드에 포스트잇 형태로 표시되고, 각 포스트잇을 열면 원본 이미지와 실시간 댓글을 확인할 수 있다.

## 핵심 사용자 흐름

1. 방문자가 첫 화면에서 방명록 작성 폼을 연다.
2. 방문자가 이미지 입력 방식을 선택한다.
   - 사진 파일 업로드
   - 앱 내 캔버스에 직접 그림 그리기
3. 방문자가 방명록을 등록한다.
4. 등록된 방명록이 새로고침 없이 보드에 포스트잇으로 추가된다.
5. 다른 방문자가 포스트잇을 열고 댓글을 남긴다.
6. 같은 포스트잇을 보고 있는 모든 사용자의 댓글 목록이 실시간으로 갱신된다.

## 권장 기술 스택

- 프론트엔드: Next.js와 React
- 스타일링: 프로젝트 설정에 따라 Tailwind CSS 또는 CSS Modules
- 백엔드 서비스: Supabase
- 데이터베이스: Supabase Postgres
- 실시간 업데이트: Supabase Realtime 구독
- 이미지 저장소: Supabase Storage
- 클라이언트 상태: React 상태와 실시간 구독 전용 커스텀 훅

## 애플리케이션 구조

권장 페이지 또는 라우트:

- `/`: 방명록 작성 화면
- `/board`: 포스트잇 보드 화면

권장 기능 모듈:

- `components/guestbook`: 작성 폼, 업로드 선택기, 드로잉 캔버스
- `components/board`: 포스트잇 보드, 포스트잇 미리보기, 상세 모달
- `components/comments`: 댓글 목록, 댓글 작성 폼
- `lib/supabase`: Supabase 클라이언트와 타입 기반 데이터 접근 함수
- `hooks`: 방명록과 댓글 실시간 구독 훅
- `types`: 공용 `GuestbookPost`, `Comment` 타입

## 데이터 모델

### guestbook_posts

- `id`: UUID 기본 키
- `author_name`: 필수 텍스트
- `message`: 필수 텍스트
- `image_url`: 필수 텍스트
- `image_type`: `upload` 또는 `drawing`
- `created_at`: timestamptz
- `updated_at`: timestamptz

### comments

- `id`: UUID 기본 키
- `post_id`: `guestbook_posts.id`를 참조하는 UUID 외래 키
- `author_name`: 필수 텍스트
- `content`: 필수 텍스트
- `created_at`: timestamptz

## 저장소 모델

방명록 이미지는 Supabase Storage 버킷에 저장한다.

권장 버킷:

- `guestbook-images`

권장 경로:

- `uploads/{postId 또는 uuid}.{ext}`: 업로드 사진
- `drawings/{postId 또는 uuid}.png`: 캔버스 그림

## 실시간 모델

Supabase Realtime 구독 대상:

- `guestbook_posts` insert 이벤트: 보드에 새 포스트잇을 즉시 추가한다.
- `comments` insert 이벤트: 선택된 포스트잇의 댓글 목록을 즉시 갱신한다.

각 화면은 실시간 구독 전에 초기 데이터를 먼저 조회해야 한다. 그래야 새로고침 또는 최초 진입 시 기존 데이터가 보인다.

## UI 구조

첫 화면은 사용자가 바로 방명록을 남길 수 있는 작성 중심 화면이어야 한다. 보드 화면은 실제 게시판에 포스트잇이 붙은 느낌을 준다.

포스트잇 보드 표현:

- 약간의 무작위 회전
- 부드러운 그림자
- 여러 종류의 연한 포스트잇 색상
- 모바일과 데스크톱을 모두 고려한 반응형 그리드 또는 masonry 유사 레이아웃

포스트잇 상세 보기는 모달 또는 사이드 패널로 구현할 수 있다. 포함 항목:

- 원본 이미지
- 작성자 이름
- 메시지
- 댓글 목록
- 댓글 입력 폼

## 접근성과 상태 처리

필수 UI 상태:

- 이미지 입력 방식 미선택
- 업로드 미리보기
- 빈 캔버스 또는 그림이 있는 캔버스
- 방명록 등록 중
- 방명록 등록 오류
- 보드 로딩
- 댓글 등록 중
- 댓글 등록 오류

접근성 요구사항:

- 모든 폼 컨트롤에 명확한 레이블을 제공한다.
- 모달은 키보드로 조작 가능해야 한다.
- `Escape` 키로 모달을 닫을 수 있어야 한다.
- 모달이 열리면 포커스를 모달 내부로 이동하고, 닫히면 이전 위치로 돌려야 한다.
- 버튼에는 명확한 접근 가능한 이름을 제공한다.

## 결정된 사항

- 라우팅은 Next.js App Router를 사용한다.
- 스타일링은 별도 프레임워크 없이 전역 CSS를 우선 사용한다.
- 방명록 이미지는 `guestbook-images` public Storage 버킷에 저장하고 public URL을 `guestbook_posts.image_url`에 저장한다.
- 익명 방문자 작성 흐름을 우선 지원하기 위해 공개 읽기와 익명 insert를 허용하는 RLS 정책을 사용한다.
