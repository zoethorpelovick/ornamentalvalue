import { useEtsyListings, filterListings } from '../hooks/useEtsyListings.js'
import ProductCard from '../components/ProductCard.jsx'
import styles from './ShopPage.module.css'

const CAT_LABELS = {
  all:             'All pieces',
  'candle-holders': 'Candle Holders',
  vases:           'Vases',
  trays:           'Trays & Catch-alls',
  objet:           'Objet',
  jewellery:       'Jewellery',
}

export default function ShopPage({ activeCategory }) {
  const { listings, loading, error } = useEtsyListings()
  const filtered = filterListings(listings, activeCategory)
  const label    = CAT_LABELS[activeCategory] || 'All pieces'

  return (
    <div className={styles.page}>
      <div className={styles.collectionHeader}>
        <h1 className={styles.collectionTitle}>{label}</h1>
        {!loading && !error && (
          <span className={styles.count}>
            {filtered.length} {filtered.length === 1 ? 'object' : 'objects'}
          </span>
        )}
      </div>

      {loading && (
        <div className={styles.state}>
          <p className={styles.stateText}>Loading…</p>
        </div>
      )}

      {error && (
        <div className={styles.state}>
          <p className={styles.stateText}>{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className={styles.state}>
          <p className={styles.stateText}>No pieces in this category yet.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className={styles.grid}>
          {filtered.map(listing => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
