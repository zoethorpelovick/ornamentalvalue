import { useListings, filterListings } from '../hooks/useListings.js'
import ProductCard from '../components/ProductCard.jsx'
import styles from './ShopPage.module.css'

const CAT_LABELS = {
  all:              'All pieces',
  'candle-holders': 'Candle Holders',
  vases:            'Vases',
  trays:            'Trays & Catch-alls',
  objet:            'Objet',
  jewellery:        'Jewellery',
}

export default function ShopPage({ activeCategory }) {
  const { listings, loading } = useListings()
  const filtered = filterListings(listings, activeCategory)
  const label    = CAT_LABELS[activeCategory] || 'All pieces'

  return (
    <div className={styles.page}>
      <div className={styles.collectionHeader}>
        <h1 className={styles.collectionTitle}>{label}</h1>
        {!loading && (
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

      {!loading && filtered.length === 0 && (
        <div className={styles.state}>
          <p className={styles.stateText}>No pieces in this category yet.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className={styles.grid}>
          {filtered.map(listing => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
