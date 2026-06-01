import { useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ShopPage from './pages/ShopPage.jsx'
import AboutPage from './pages/AboutPage.jsx'

export default function App() {
  const [page, setPage] = useState('shop')
  const [activeCategory, setActiveCategory] = useState('all')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        page={page}
        setPage={setPage}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <main style={{ flex: 1 }}>
        {page === 'shop'  && <ShopPage activeCategory={activeCategory} />}
        {page === 'about' && <AboutPage setPage={setPage} />}
      </main>
      <Footer setPage={setPage} />
    </div>
  )
}
