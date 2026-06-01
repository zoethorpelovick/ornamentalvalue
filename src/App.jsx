import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ShopPage from './pages/ShopPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

export default function App() {
  const [page,           setPage]           = useState('shop')
  const [activeCategory, setActiveCategory] = useState('all')

  // Simple hash-based routing for admin
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') setPage('admin')
    }
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  function navigateTo(p) {
    setPage(p)
    if (p !== 'admin') window.location.hash = ''
  }

  const isAdmin = page === 'admin'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAdmin && (
        <Header
          page={page}
          setPage={navigateTo}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      )}
      <main style={{ flex: 1 }}>
        {page === 'shop'  && <ShopPage activeCategory={activeCategory} />}
        {page === 'about' && <AboutPage setPage={navigateTo} />}
        {page === 'admin' && <AdminPage />}
      </main>
      {!isAdmin && <Footer setPage={navigateTo} />}
    </div>
  )
}
