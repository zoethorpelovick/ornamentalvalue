import { useState, useEffect } from 'react'

const API_KEY  = import.meta.env.VITE_ETSY_API_KEY
const SHOP_ID  = import.meta.env.VITE_ETSY_SHOP_ID || 'ornamentalvalue'
const LIMIT    = 100  // max per request; we paginate if needed

// Category tag → nav key mapping
// Etsy tags are lowercase; we match against these keys
export const CATEGORY_TAGS = [
  'candle-holders',
  'vases',
  'trays',
  'objet',
  'jewellery',
]

function normaliseTags(tags = []) {
  return tags.map(t => t.toLowerCase().trim())
}

export function useEtsyListings() {
  const [listings, setListings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!API_KEY) {
      setError('VITE_ETSY_API_KEY is not set. See .env.example for setup instructions.')
      setLoading(false)
      return
    }

    async function fetchListings() {
      try {
        // Etsy Open API v3 — active listings for a shop
        const url = new URL(
          `https://openapi.etsy.com/v3/application/shops/${SHOP_ID}/listings/active`
        )
        url.searchParams.set('limit', LIMIT)
        url.searchParams.set('includes', 'Images,Tags')
        url.searchParams.set('sort_on', 'created')
        url.searchParams.set('sort_order', 'desc')

        const res = await fetch(url.toString(), {
          headers: { 'x-api-key': API_KEY },
        })

        if (!res.ok) {
          throw new Error(`Etsy API error: ${res.status} ${res.statusText}`)
        }

        const data = await res.json()

        // Normalise each listing into a simple shape
        const items = (data.results || []).map(item => ({
          id:       item.listing_id,
          title:    item.title,
          price:    item.price,
          url:      item.url,
          tags:     normaliseTags(item.tags),
          image:    item.images?.[0]?.url_570xN || null,
          imageAlt: item.images?.[0]?.alt_text || item.title,
        }))

        setListings(items)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  return { listings, loading, error }
}

// Filter listings by category key
// 'all' returns everything; otherwise checks if any tag matches the category key
export function filterListings(listings, category) {
  if (category === 'all') return listings
  return listings.filter(l => l.tags.includes(category))
}
