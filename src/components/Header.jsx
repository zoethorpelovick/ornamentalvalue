import logo from '../assets/OV_Logo.png'
import styles from './Header.module.css'

const CATEGORIES = [
  { key: 'all',           label: 'All' },
  { key: 'candle-holders', label: 'Candle Holders' },
  { key: 'vases',          label: 'Vases' },
  { key: 'trays',          label: 'Trays & Catch-alls' },
  { key: 'objet',          label: 'Objet' },
  { key: 'jewellery',      label: 'Jewellery' },
]

export default function Header({ page, setPage, activeCategory, setActiveCategory }) {
  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <button
          className={styles.logoBtn}
          onClick={() => { setPage('shop'); setActiveCategory('all') }}
          aria-label="Ornamental Value — home"
        >
          <img
            src={logo}
            alt="Ornamental Value"
            className={styles.logo}
            onError={e => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling.style.display = 'block'
            }}
          />
          <span className={styles.logoFallback} style={{ display: 'none' }}>
            Ornamental Value
          </span>
        </button>

        <nav className={styles.utils} aria-label="Site navigation">
          <button
            className={`${styles.utilLink} ${page === 'about' ? styles.utilActive : ''}`}
            onClick={() => setPage('about')}
          >
            About
          </button>
          <a
            href="mailto:hello@ornamentalvalue.com.au"
            className={styles.utilLink}
          >
            Contact
          </a>
        </nav>
      </div>

      {page === 'shop' && (
        <nav className={styles.catNav} aria-label="Product categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`${styles.catBtn} ${activeCategory === cat.key ? styles.catActive : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}
