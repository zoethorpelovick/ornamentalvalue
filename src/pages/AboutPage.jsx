import styles from './AboutPage.module.css'

export default function AboutPage({ setPage }) {
  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>About</p>

      <div className={styles.body}>
        <p>Hi, I'm Zoe, a homewares designer and devoted lover of vintage things.</p>
        <p>This is a small store by design. Everything here is one of a kind.</p>
      </div>

      <div className={styles.divider} />

      <div className={styles.actions}>
        <button className={styles.cta} onClick={() => setPage('shop')}>
          View the shop
        </button>
        <a
          href="https://www.ornamentalvalue.etsy.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
        >
          ornamentalvalue.etsy.com ↗
        </a>
      </div>
    </div>
  )
}
