import { useState } from 'react'
import './MaterialsPage.css'

const examples = [
  { title: 'REST API 핵심 정리', category: 'image', kind: '수업 캡처 · PNG', size: '1.2MB', date: '2026.10.20', preview: 'HTTP', detail: 'GET / POST', tone: 'blue' },
  { title: '회원가입 동작 확인', category: 'video', kind: '실습 영상 · MP4', size: '12.4MB', date: '2026.10.20', preview: '▶', detail: '00:32', tone: 'dark' },
  { title: '데이터베이스 관계 정리', category: 'image', kind: '수업 캡처 · JPG', size: '860KB', date: '2026.10.19', preview: 'TABLE', detail: 'users → records', tone: 'gray' },
]

const filters = [
  { id: 'all', label: '전체', count: 3 },
  { id: 'image', label: '이미지', count: 2 },
  { id: 'video', label: '영상', count: 1 },
]

export default function MaterialsPage({ navigate, user }) {
  const [filter, setFilter] = useState('all')
  const visibleExamples = filter === 'all' ? examples : examples.filter((item) => item.category === filter)

  return (
    <div className="materials-page">
      <aside className="materials-sidebar" aria-label="학습 자료함 메뉴">
        <div className="materials-brand">b&nbsp; BuildLog</div>
        <p className="materials-workspace-label">MY WORKSPACE</p>
        <nav className="materials-nav" aria-label="주 메뉴">
          <button type="button" onClick={() => navigate('/dashboard')}>대시보드</button>
          <span>공부 기록</span>
          <span>할 일</span>
          <span>오류 기록</span>
          <span className="is-current" aria-current="page">학습 자료함</span>
          <span>공개 기록</span>
        </nav>
        <div className="materials-private-note"><strong>나만의 학습 공간</strong><span>올린 자료는<br />나에게만 보여요.</span></div>
        <button className="materials-account" type="button" onClick={() => navigate('/settings')}>{user.nickname}님&nbsp; · &nbsp;내 계정</button>
      </aside>

      <main className="materials-main">
        <header className="materials-heading">
          <p>MY LEARNING LIBRARY</p>
          <h1>학습 자료함</h1>
          <p>캡처부터 실습 영상까지, 배운 순간을 한곳에 모아보세요.</p>
        </header>

        <div className="materials-layout">
          <section className="materials-upload-panel" aria-labelledby="materials-upload-title">
            <h2 id="materials-upload-title">새 자료 등록</h2>
            <p className="materials-upload-intro">기억하고 싶은 자료를 남겨보세요.</p>

            <label className="materials-field" htmlFor="materials-title">
              <span>자료 제목</span>
              <input id="materials-title" type="text" placeholder="예: REST API 수업 정리" />
            </label>
            <label className="materials-field" htmlFor="materials-memo">
              <span>메모&nbsp; · &nbsp;선택</span>
              <textarea id="materials-memo" placeholder="어떤 내용인지 간단히 적어주세요." />
            </label>

            <div className="materials-file-area">
              <span className="materials-upload-icon" aria-hidden="true">↑</span>
              <strong>이미지 또는 영상을 선택하세요</strong>
              <span>PNG · JPG&nbsp; 5MB / MP4&nbsp; 30MB</span>
              <button type="button" disabled title="다음 단계에서 연결">파일 선택</button>
            </div>
            <p className="materials-file-note">자료당 파일 1개 · 나만 볼 수 있어요</p>
            <button className="materials-submit" type="button" disabled title="다음 단계에서 연결">자료 업로드</button>
            <p className="materials-pending-note">파일 선택과 자료 업로드는 다음 단계에서 연결합니다.</p>
          </section>

          <section className="materials-library" aria-labelledby="materials-list-title">
            <div className="materials-list-heading"><h2 id="materials-list-title">내 자료</h2><span>3</span></div>
            <div className="materials-filters" role="group" aria-label="자료 종류 필터">
              {filters.map((item) => (
                <button key={item.id} type="button" className={filter === item.id ? 'is-selected' : ''} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label} {item.count}</button>
              ))}
            </div>
            <div className="materials-example-list">
              {visibleExamples.map((item) => (
                <article className="materials-item" key={item.title}>
                  <div className={`materials-preview is-${item.tone}`} aria-hidden="true"><strong>{item.preview}</strong><span>{item.detail}</span></div>
                  <div className="materials-item-info">
                    <h3>{item.title}</h3>
                    <p>{item.kind} · {item.size}</p>
                    <div className="materials-item-actions"><time>{item.date}</time><span aria-hidden="true">·</span><button type="button" disabled title="다음 단계에서 연결">원본 보기</button><span aria-hidden="true">·</span><button type="button" disabled title="다음 단계에서 연결">삭제</button></div>
                  </div>
                </article>
              ))}
            </div>
            <p className="materials-list-tip">차곡차곡 쌓인 자료가 나만의 복습 노트가 됩니다.</p>
            <p className="materials-example-note">디자인 확인용 예시 자료입니다. 실제 업로드·저장된 자료가 아닙니다.</p>
          </section>
        </div>

        <section className="materials-ai" aria-labelledby="materials-ai-title">
          <div><h2 id="materials-ai-title">AI 학습 도우미&nbsp; · &nbsp;다음 단계</h2><p>이미지를 읽고 핵심 내용과 복습 질문을 정리해요.</p><small>먼저 자료 업로드를 완성한 뒤 AI 기능을 연결합니다.</small></div>
          <button type="button" disabled>이미지 분석 연결 예정</button>
        </section>
      </main>
    </div>
  )
}
