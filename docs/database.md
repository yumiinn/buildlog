# Supabase PostgreSQL 준비와 실행

## 현재 상태

- FastAPI가 Supabase PostgreSQL의 Session pooler 연결 정보를 `backend/.env`에서 읽도록 준비했습니다.
- 연결 정보가 없거나 형식이 잘못되면 서버와 Alembic은 실행을 중단하며 SQLite로 자동 연결하지 않습니다.
- 기존 `database/buildlog.sqlite3` 파일과 데이터는 삭제하거나 이전하지 않았습니다.
- 현재 구현된 테이블은 회원가입·로그인에 사용하는 `users` 하나입니다. 공부 기록, 할 일, 오류 기록 테이블은 아직 구현되지 않았습니다.
- 실제 Supabase 접속과 테이블 생성은 연결 정보가 없으므로 확인하지 않았습니다.

## 1. backend/.env 만들기

프로젝트의 `backend` 폴더에서 `.env.example`을 복사해 `.env`를 만듭니다.

```powershell
cd backend
Copy-Item .env.example .env
```

Supabase Dashboard의 **Connect → Session pooler**에서 연결 정보를 복사합니다. Session pooler는 포트 5432를 사용합니다. `backend/.env`의 `DATABASE_URL`에 복사한 전체 값을 넣습니다. 데이터베이스 비밀번호에 예약 문자가 있다면 Supabase 안내에 따라 인코딩된 값을 사용합니다.

`APP_SECRET_KEY`와 `FRONTEND_ORIGIN`은 로컬 연결 확인에 필수는 아닙니다. 로그인 토큰을 서버 재시작 뒤에도 유지하려면 `APP_SECRET_KEY`에 긴 임의의 값을 직접 설정합니다.

## 2. 필요한 패키지 설치

`backend` 폴더에서 실행합니다.

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## 3. 테이블 준비

`backend` 폴더에서 다음 명령 하나를 실행합니다.

```powershell
.\.venv\Scripts\python.exe -m alembic -c alembic.ini upgrade head
```

처음 실행하면 `users`와 `alembic_version` 테이블이 생성됩니다. Alembic은 적용한 변경 번호를 `alembic_version`에 저장하므로 같은 명령을 다시 실행해도 이미 적용한 변경은 반복하지 않습니다.

## 4. 서버 실행과 연결 확인

테이블 준비가 성공한 뒤 `backend` 폴더에서 서버를 실행합니다.

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

별도 터미널의 `frontend` 폴더에서 화면을 실행합니다.

```powershell
npm.cmd run dev
```

브라우저에서 `http://localhost:5173`을 열고 새 이메일로 회원가입한 뒤 로그인합니다. 회원가입과 로그인이 성공하면 FastAPI가 Supabase PostgreSQL에 새 회원 데이터를 저장하고 읽은 것입니다.

## 설정 오류 확인

- `DATABASE_URL이 없습니다`: `backend/.env` 파일 위치와 `DATABASE_URL` 이름을 확인합니다.
- 연결 주소 형식 오류: Supabase에서 **Session pooler** 항목을 다시 복사했는지 확인합니다.
- 연결 시간 초과 또는 호스트 오류: 포트가 5432인지, 프로젝트가 실행 중인지, 네트워크 연결이 가능한지 확인합니다.
- 인증 실패: Supabase 데이터베이스 비밀번호와 pooler 사용자 이름을 확인합니다. Supabase 계정 로그인 비밀번호와 데이터베이스 비밀번호는 다를 수 있습니다.
- 비밀번호에 예약 문자가 있음: Supabase에서 안내하는 방식으로 해당 문자를 인코딩한 연결 정보를 사용합니다.

연결 문자열이나 비밀번호를 터미널 출력, 문서, Git 커밋에 남기지 않습니다.
