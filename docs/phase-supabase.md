# Supabase PostgreSQL 전환 준비 결과

확인일: 2026-10-26 (한국 시간)

## 완료한 내용

- 서비스 실행 시 `backend/.env`의 `DATABASE_URL`을 필수로 읽도록 변경했습니다.
- PostgreSQL 연결에는 psycopg를 사용하고 SSL 연결을 요구합니다.
- `DATABASE_URL`이 없거나 형식이 잘못되면 SQLite로 대체하지 않고 안전한 안내와 함께 중단합니다.
- 기존 `users` 구조를 생성하는 최초 Alembic 변경 파일을 만들었습니다.
- Alembic이 적용 번호를 기록해 같은 변경을 다시 실행하지 않도록 구성했습니다.
- 기존 SQLite 파일과 데이터는 변경하거나 삭제하지 않았습니다.
- 비밀값이 없는 `backend/.env.example`과 사용 방법을 `docs/database.md`에 작성했습니다.

## 확인한 내용

- 기존 회원 기능 자동 테스트가 명시적인 임시 SQLite3에서 통과했습니다.
- 최초 Alembic 변경을 임시 데이터베이스에 적용한 뒤 같은 명령을 다시 실행해도 중복 적용되지 않는 것을 확인했습니다.
- `backend/.env`가 Git 제외 대상이고 `backend/.env.example`은 기록 가능한 것을 확인했습니다.

## 아직 확인하지 못한 내용

- 실제 Supabase 연결 정보가 없으므로 PostgreSQL 접속과 테이블 생성은 실행하지 않았습니다.
- Supabase에서 회원가입·로그인으로 데이터를 저장하고 다시 읽는 확인도 아직 진행하지 않았습니다.

## 다음 할 일

- 사용자가 `backend/.env`에 Supabase Session pooler 연결 정보를 입력합니다.
- `backend` 폴더에서 Alembic 명령을 실행해 테이블을 준비합니다.
- 서버와 화면을 다시 실행하고 새 계정의 회원가입·로그인을 확인합니다.
