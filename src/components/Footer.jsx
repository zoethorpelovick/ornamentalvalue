import favicon from '../assets/OVFavicon.png'
import styles from './Footer.module.css'

export default function Footer({ setPage }) {
  return (
    <footer className={styles.footer}>
      <button
        className={styles.logoBtn}
        onClick={() => setPage('shop')}
        aria-label="Back to shop"
      >
        <img
          src={favicon}
          alt="OV"
          className={styles.favicon}
          onError={e => { e.currentTarget.style.display = 'none' }}
        />
      </button>

      <nav className={styles.links} aria-label="Footer navigation">
        <button className={styles.link} onClick={() => setPage('about')}>About</button>
        <a href="mailto:hello@ornamentalvalue.com.au" className={styles.link}>Contact</a>
        <a
          href="https://www.ornamentalvalue.etsy.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          ornamentalvalue.etsy.com ↗
        </a>
      </nav>
    </footer>
  )
}
