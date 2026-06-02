import styles from './ProductCard.module.css'

export default function ProductCard({ listing }) {
  const { title, price, url, image, imageAlt } = listing

  const priceDisplay = price != null && price !== ''
    ? `$${typeof price === 'object' ? (price.amount / price.divisor).toFixed(0) : Number(price).toFixed(0)}`
    : null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      aria-label={`${title} — view on Etsy`}
    >
      <div className={styles.imageWrap}>
        {image ? (
          <img
            src={image}
            alt={imageAlt}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true" />
        )}
      </div>
      <div className={styles.info}>
        <p className={styles.title}>{title}</p>
        {priceDisplay && <p className={styles.price}>{priceDisplay}</p>}
      </div>
    </a>
  )
}
