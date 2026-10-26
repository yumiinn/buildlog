# Phase 0 결과: 개발 기준과 환경 확인

확인일: 2026-10-26 (한국 시간)

## 1. 문서와 기능 범위

- `PRD.md`, `docs/spec.md`, `docs/plan.md`의 첫 버전 기능을 대조했습니다. 회원가입·로그인·닉네임, 세 종류의 기록, 공개·비공개, 각 검색 범위, 댓글·좋아요, 신고, 반응형 화면이 계획에 포함되어 있습니다.
- 제외 기능인 이메일 확인, 비밀번호 찾기, 할 일 마감일·중요도·내 할 일 검색, 댓글 답글은 계획에서도 제외했습니다.
- `spec.md`의 새 오류 규칙을 명확히 했습니다. **상태를 선택하지 않으면 미해결**, **처음부터 해결을 선택했다면 해결 방법 필수**입니다. 이 해석은 기본 미해결과 최초 해결 저장 조건을 모두 만족합니다.
- 회원가입·로그인은 FastAPI에서 처리하고, Supabase는 PostgreSQL 데이터베이스로 사용하는 기준으로 정리했습니다. 이는 사용자가 지정한 “백엔드 FastAPI, DB Supabase”에 따른 구현 기준입니다. 사용자에게 보이는 가입·로그인 규칙은 `spec.md`를 그대로 따릅니다.

## 2. 로컬 환경 확인

| 항목 | 확인 결과 |
| --- | --- |
| Python | 3.13.14, 실행 가능 |
| Python 패키지 관리자 | pip 26.1.2, 실행 가능 |
| Node.js | 24.22.1, 실행 가능 |
| npm | 11.19.1, `npm.cmd`로 실행 가능 |
| SQLite3 | 3.50.4, 메모리 데이터베이스에서 `SELECT 1` 성공 |
| FastAPI·Uvicorn·SQLAlchemy·Alembic·psycopg·pytest | 아직 설치되지 않음. Phase 0에서는 설치하지 않음 |
| Supabase 연결 설정 | 현재 환경 변수와 `.env` 파일에 없음. 실제 연결 확인은 Phase 2에서 진행 |
| Git | 초기화되지 않음. 초기화·커밋하지 않음 |

PowerShell의 실행 정책 때문에 `npm`은 `npm.ps1` 실행 오류가 났습니다. `npm.cmd`는 정상 실행되므로 시스템 실행 정책을 바꾸지 않고 이 명령을 사용합니다.

## 3. 도구와 데이터베이스 방식

- React 개발 화면은 Vite 기반으로 준비합니다. 현재 Node.js 24.22.1은 [Vite의 Node.js 요구 버전](https://vite.dev/guide/)을 만족합니다. React 공식 문서도 직접 구성하는 React 앱의 빌드 도구로 Vite를 제시합니다: [React 앱 직접 만들기](https://react.dev/learn/build-a-react-app-from-scratch).
- FastAPI는 Python 3.13 지원 이력이 있습니다: [FastAPI 릴리스 노트](https://fastapi.tiangolo.com/release-notes/). 정확한 FastAPI·React·Vite 버전은 Phase 1에서 설치한 뒤 의존성 파일에 고정합니다.
- 데이터 저장은 SQLAlchemy 2.x, 구조 변경은 Alembic, PostgreSQL 연결은 psycopg 3 계열을 기준으로 합니다. [FastAPI의 관계형 데이터베이스 안내](https://fastapi.tiangolo.com/tutorial/sql-databases/)와 [SQLAlchemy의 PostgreSQL](https://docs.sqlalchemy.org/en/20/dialects/postgresql.html)·[SQLite](https://docs.sqlalchemy.org/en/20/dialects/sqlite.html) 지원을 확인했습니다.
- 자동 테스트는 SQLite3를 사용하지만 서비스 데이터는 Supabase PostgreSQL에 저장합니다. SQLite에서는 구조 변경에 제한이 있어 Alembic의 [SQLite 배치 변경 방식](https://alembic.sqlalchemy.org/en/latest/batch.html)을 고려합니다. PostgreSQL 제약 조건과 연결 동작은 Supabase에서도 별도로 확인합니다.
- FastAPI가 Supabase PostgreSQL에 연결할 때는 서버 측 환경 변수의 연결 문자열을 사용합니다. 연결 방식은 실행 환경의 IPv4/IPv6에 따라 Supabase의 [연결 안내](https://supabase.com/docs/guides/database/connecting-to-postgres)에 따라 고릅니다. React 화면에는 데이터베이스 비밀번호를 전달하지 않습니다.

## 4. 실행 주소와 설정 이름

| 항목 | 개발 기준 |
| --- | --- |
| FastAPI 로컬 주소 | `http://localhost:8000` |
| React 로컬 주소 | `http://localhost:5173` |
| 테스트용 SQLite3 파일 | `database/buildlog_test.sqlite3` (테스트에서 필요할 때만 생성, Git 제외) |
| `DATABASE_URL` | FastAPI가 사용할 Supabase PostgreSQL 연결 문자열. 실제 값은 환경 변수 또는 로컬 `.env`에만 둠 |
| `APP_SECRET_KEY` | FastAPI 회원 인증에 필요한 비밀 설정값. 실제 값은 코드·문서에 넣지 않음 |
| `FRONTEND_ORIGIN` | FastAPI에서 허용할 로컬 React 주소 |
| `VITE_API_BASE_URL` | React에서 호출할 로컬 FastAPI 주소. 비밀값 아님 |

`database/buildlog_test.sqlite3`와 필요한 생성 파일을 제외하는 `.gitignore` 보완 및 값 없는 `.env.example` 작성은 Phase 1에서 진행합니다. 사용자가 지금 비밀값을 채울 필요는 없습니다.

## 5. 다음 단계 전에 필요한 것

- **Phase 1 시작 전:** 사용자가 별도로 제공해야 할 계정이나 비밀값은 없습니다. Python·Node.js·SQLite3는 이 컴퓨터에서 확인했습니다.
- **Phase 2 전:** Supabase 프로젝트와 PostgreSQL 연결 정보가 필요합니다. 프로젝트가 준비되면 연결 문자열을 로컬 환경 변수 또는 Git에서 제외된 `.env`에 넣어야 합니다. 실제 비밀번호를 채팅이나 문서에 적을 필요는 없습니다.
- Phase 1에서는 서버와 기본 화면까지만 만듭니다. 데이터베이스 접속, 사용자 데이터 저장, Git 초기화·커밋은 진행하지 않습니다.

## 6. Phase 0 완료 판단

기능 범위와 오류 상태 규칙, 인증 담당, 개발 도구, 설정 이름을 정리했습니다. Python·Node.js·SQLite3 실행을 확인했으며 코드·패키지·데이터베이스는 변경하지 않았습니다. Supabase 실제 연결은 프로젝트 정보가 필요한 Phase 2의 확인 항목으로 남깁니다.
