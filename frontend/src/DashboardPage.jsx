import { useState } from 'react'
import './DashboardPage.css'

const studies = [
  { title: 'React 컴포넌트, 이제 조금 알 것 같아요', date: '오늘', description: '화면을 작은 조각으로 나누고 다시 조합하는 방법을 배웠어요.' },
  { title: 'FastAPI로 첫 API 만들기', date: '어제', description: 'GET과 POST의 차이를 직접 요청하며 확인했어요.' },
  { title: 'Supabase 연결 성공!', date: '10월 18일', description: '내가 쓴 기록이 새로고침 후에도 그대로 남아 있어요.' },
]

const tasks = [
  'Figma 대시보드 디자인 살펴보기',
  'MCP로 디자인 정보 읽어오기',
  'React 화면으로 구현하기',
  '실제 데이터 연결해보기',
]

function SummaryCard({ label, value, hint }) {
  return (
    <article className="dashboard-summary-card">
      <h2>{label}</h2>
      <strong>{value}</strong>
      <p>{hint}</p>
    </article>
  )
}

export default function DashboardPage({ navigate }) {
  const [checkedTasks, setCheckedTasks] = useState([])
  const remaining = tasks.length - checkedTasks.length
  const completed = 8 + checkedTasks.length
  const percent = Math.round((completed / 12) * 100)

  function toggleTask(index) {
    setCheckedTasks((current) => current.includes(index)
      ? current.filter((taskIndex) => taskIndex !== index)
      : [...current, index])
  }

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar" aria-label="대시보드 메뉴">
        <div className="dashboard-brand"><span className="dashboard-brand-mark">b</span><span>BuildLog</span></div>
        <p className="dashboard-workspace-label">MY WORKSPACE</p>
        <nav className="dashboard-nav" aria-label="주 메뉴">
          <button className="dashboard-nav-item is-active" type="button" aria-current="page" onClick={() => navigate('/dashboard')}><span aria-hidden="true">▦</span>대시보드</button>
          <span className="dashboard-nav-item"><span aria-hidden="true">▤</span>공부 기록</span>
          <span className="dashboard-nav-item"><span aria-hidden="true">✓</span>할 일</span>
          <span className="dashboard-nav-item"><span aria-hidden="true">!</span>오류 기록</span>
          <span className="dashboard-nav-item"><span aria-hidden="true">↗</span>공개 기록</span>
        </nav>
        <button className="dashboard-account" type="button" onClick={() => navigate('/settings')}>
          <span className="dashboard-avatar" aria-hidden="true">이</span>
          <span><strong>이월</strong><small>계정 설정&nbsp; ›</small></span>
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar"><span>내 학습 한눈에 보기</span><time dateTime="2026-10-20">2026. 10. 20&nbsp; 화요일</time></div>

        <header className="dashboard-greeting">
          <div><h1>이월님, 차곡차곡 쌓이고 있어요</h1><p>오늘의 배움도 기록으로 남겨보세요.</p></div>
          <span className="dashboard-new-study">+&nbsp; 공부 기록 쓰기</span>
        </header>

        <section className="dashboard-summary" aria-label="학습 요약">
          <SummaryCard label="공부 기록" value="24" hint="쌓아온 배움의 순간" />
          <SummaryCard label="남은 할 일" value={remaining} hint="하나씩 완료해보세요" />
          <SummaryCard label="미해결 오류" value="2" hint="해결 과정도 소중한 기록이에요" />
        </section>

        <div className="dashboard-content-grid">
          <section className="dashboard-studies dashboard-panel" aria-labelledby="dashboard-studies-title">
            <div className="dashboard-section-heading"><h2 id="dashboard-studies-title">최근 공부 기록</h2><span>전체 보기&nbsp; ›</span></div>
            <div className="dashboard-study-list">
              {studies.map((study) => (
                <article className="dashboard-study" key={study.title}>
                  <div><h3>{study.title}</h3><span>{study.date}</span></div>
                  <p>{study.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-tasks dashboard-panel" aria-labelledby="dashboard-tasks-title">
            <div className="dashboard-task-heading"><h2 id="dashboard-tasks-title">남은 할 일</h2><span>{remaining}개</span></div>
            <p className="dashboard-task-subtitle">작은 완료가 모여 큰 성장이 돼요.</p>
            <div className="dashboard-task-list">
              {tasks.map((task, index) => (
                <label className="dashboard-task" key={task}>
                  <input type="checkbox" checked={checkedTasks.includes(index)} onChange={() => toggleTask(index)} />
                  <span>{task}</span>
                </label>
              ))}
            </div>
            <span className="dashboard-task-footer">할 일 관리하기&nbsp; →</span>
          </section>
        </div>

        <section className="dashboard-completion" aria-label="할 일 완료율">
          <div className="dashboard-progress-copy"><h2>잘하고 있어요. 벌써 {completed}개 완료!</h2><p>전체 할 일 12개 중 {completed}개를 마쳤어요.</p></div>
          <div className="dashboard-progress"><div><span>할 일 완료율</span><strong>{percent}%</strong></div><div className="dashboard-progress-track" role="progressbar" aria-label="할 일 완료율" aria-valuenow={completed} aria-valuemin="0" aria-valuemax="12"><span style={{ width: `${percent}%` }} /></div></div>
          <strong className="dashboard-progress-total">{completed} / 12</strong>
        </section>
        <footer className="dashboard-footer"><span>매일의 작은 기록, 내일의 큰 변화.</span><span>수업용 예시 데이터</span></footer>
      </main>
    </div>
  )
}
