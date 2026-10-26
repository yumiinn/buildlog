import { useEffect, useState } from 'react'
import { apiRequest, clearToken, getToken, saveToken } from './api'
import './App.css'

const nicknamePattern = /^[가-힣A-Za-z0-9_]{2,20}$/

function goTo(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function Field({ id, label, ...props }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} {...props} />
    </label>
  )
}

function AuthLayout({ title, description, children, footer }) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <button className="brand brand-button" type="button" onClick={() => goTo('/')}>
          BUILDLOG
        </button>
        <h1 id="auth-title">{title}</h1>
        <p className="description">{description}</p>
        {children}
        <div className="auth-footer">{footer}</div>
      </section>
    </main>
  )
}

function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', nickname: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    const email = form.email.trim()
    const nickname = form.nickname.trim()

    if (form.password.length < 8 || form.password.length > 64) {
      setError('비밀번호는 8~64자로 입력해 주세요.')
      setForm((current) => ({ ...current, password: '' }))
      return
    }
    if (!nicknamePattern.test(nickname)) {
      setError('닉네임은 2~20자의 한글, 영문, 숫자, 밑줄만 사용할 수 있습니다.')
      setForm((current) => ({ ...current, password: '' }))
      return
    }

    setSubmitting(true)
    try {
      await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password: form.password, nickname }),
      })
      goTo('/login')
    } catch (requestError) {
      setError(requestError.message)
      setForm((current) => ({ ...current, email, nickname, password: '' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="회원가입"
      description="내 공부 기록을 안전하게 보관할 계정을 만드세요."
      footer={<button className="text-button" type="button" onClick={() => goTo('/login')}>이미 계정이 있나요? 로그인</button>}
    >
      <form className="form" onSubmit={submit}>
        <Field id="signup-email" label="이메일" name="email" type="email" autoComplete="email" required value={form.email} onChange={updateField} />
        <Field id="signup-password" label="비밀번호" name="password" type="password" autoComplete="new-password" minLength="8" maxLength="64" required value={form.password} onChange={updateField} />
        <p className="hint">8~64자로 입력해 주세요.</p>
        <Field id="signup-nickname" label="닉네임" name="nickname" type="text" autoComplete="nickname" minLength="2" maxLength="20" required value={form.nickname} onChange={updateField} />
        <p className="hint">2~20자의 한글, 영문, 숫자, 밑줄을 사용할 수 있습니다.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={submitting}>{submitting ? '가입 중…' : '회원가입'}</button>
      </form>
    </AuthLayout>
  )
}

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      })
      saveToken(result.access_token)
      onLogin(result.user)
      goTo('/')
    } catch (requestError) {
      setError(requestError.message)
      setForm((current) => ({ ...current, email: current.email.trim(), password: '' }))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="로그인"
      description="저장한 공부 기록을 이어서 확인하세요."
      footer={<button className="text-button" type="button" onClick={() => goTo('/signup')}>처음인가요? 회원가입</button>}
    >
      <form className="form" onSubmit={submit}>
        <Field id="login-email" label="이메일" name="email" type="email" autoComplete="email" required value={form.email} onChange={updateField} />
        <Field id="login-password" label="비밀번호" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={updateField} />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={submitting}>{submitting ? '로그인 중…' : '로그인'}</button>
      </form>
    </AuthLayout>
  )
}

function Header({ user }) {
  return (
    <header className="site-header">
      <button className="brand brand-button" type="button" onClick={() => goTo('/')}>BUILDLOG</button>
      <button className="profile-button" type="button" onClick={() => goTo('/settings')} aria-label="계정 설정 열기">
        {user.nickname}
      </button>
    </header>
  )
}

function HomePage({ user }) {
  const cards = [
    ['공부 기록', '오늘 배운 내용과 작업한 내용을 기록합니다.'],
    ['할 일', '앞으로 공부하거나 만들어야 할 일을 정리합니다.'],
    ['오류 기록', '막혔던 오류와 해결 방법을 모아둡니다.'],
  ]

  return (
    <div className="app-shell">
      <Header user={user} />
      <main className="content">
        <section className="home-heading">
          <p className="eyebrow">내 기록 홈</p>
          <h1>{user.nickname}님, 오늘도 하나씩 남겨보세요.</h1>
          <p className="description">기록 기능은 다음 개발 단계에서 차례로 연결됩니다.</p>
        </section>
        <section className="record-grid" aria-label="기록 종류">
          {cards.map(([title, description]) => (
            <article className="record-card" key={title}>
              <h2>{title}</h2>
              <p>{description}</p>
              <span>준비 중</span>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

function SettingsPage({ user, onUserChange }) {
  const [nickname, setNickname] = useState(user.nickname)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    const trimmedNickname = nickname.trim()
    if (!nicknamePattern.test(trimmedNickname)) {
      setError('닉네임은 2~20자의 한글, 영문, 숫자, 밑줄만 사용할 수 있습니다.')
      return
    }

    setSubmitting(true)
    try {
      const updatedUser = await apiRequest('/api/auth/me/nickname', {
        method: 'PATCH',
        body: JSON.stringify({ nickname: trimmedNickname }),
      })
      onUserChange(updatedUser)
      setNickname(updatedUser.nickname)
      setMessage('닉네임을 변경했습니다.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-shell">
      <Header user={user} />
      <main className="content narrow-content">
        <button className="back-button" type="button" onClick={() => goTo('/')}>← 내 기록 홈</button>
        <section className="settings-card" aria-labelledby="settings-title">
          <p className="eyebrow">계정 설정</p>
          <h1 id="settings-title">닉네임 변경</h1>
          <p className="description">공개 기록과 댓글에는 현재 닉네임이 표시됩니다.</p>
          <form className="form" onSubmit={submit}>
            <Field id="settings-nickname" label="새 닉네임" type="text" minLength="2" maxLength="20" required value={nickname} onChange={(event) => setNickname(event.target.value)} />
            {error && <p className="form-error" role="alert">{error}</p>}
            {message && <p className="form-success" role="status">{message}</p>}
            <button className="primary-button" type="submit" disabled={submitting}>{submitting ? '변경 중…' : '변경'}</button>
          </form>
        </section>
      </main>
    </div>
  )
}

function LoadingPage() {
  return <main className="loading-page" aria-live="polite">로그인 상태를 확인하고 있습니다…</main>
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function handleRouteChange() {
      setPath(window.location.pathname)
    }
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  useEffect(() => {
    async function loadUser() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        setUser(await apiRequest('/api/auth/me'))
      } catch {
        clearToken()
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (loading) return
    const publicPaths = ['/login', '/signup']
    if (!user && !publicPaths.includes(path)) goTo('/login')
    if (user && publicPaths.includes(path)) goTo('/')
  }, [loading, path, user])

  if (loading) return <LoadingPage />
  if (path === '/signup' && !user) return <SignupPage />
  if (path === '/login' && !user) return <LoginPage onLogin={setUser} />
  if (path === '/settings' && user) return <SettingsPage user={user} onUserChange={setUser} />
  if (user) return <HomePage user={user} />
  return <LoadingPage />
}

export default App
