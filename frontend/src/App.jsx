import { useEffect, useState } from 'react'
import './App.css'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

function App() {
  const [connection, setConnection] = useState('checking')

  useEffect(() => {
    const controller = new AbortController()

    async function checkConnection() {
      try {
        const response = await fetch(`${apiBaseUrl}/health`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('API request failed')

        const result = await response.json()
        setConnection(result.status === 'ok' ? 'connected' : 'disconnected')
      } catch (error) {
        if (error.name !== 'AbortError') setConnection('disconnected')
      }
    }

    checkConnection()
    return () => controller.abort()
  }, [])

  const connectionText = {
    checking: '서버 연결 확인 중',
    connected: '서버 연결됨',
    disconnected: '서버에 연결할 수 없습니다',
  }

  return (
    <main className="page">
      <section className="welcome" aria-labelledby="page-title">
        <p className="eyebrow">BUILDLOG</p>
        <h1 id="page-title">배운 것을 기록하고, 다시 찾아보세요.</h1>
        <p className="description">
          공부 기록과 할 일, 오류 해결 과정을 한곳에 모으는 공간입니다.
        </p>
        <p className={`connection connection--${connection}`} role="status">
          <span className="connection-dot" aria-hidden="true" />
          {connectionText[connection]}
        </p>
      </section>
    </main>
  )
}

export default App
