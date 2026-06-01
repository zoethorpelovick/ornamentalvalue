import { useState, useEffect } from 'react'
import listingsData from '../data/listings.json'

const API_KEY = import.meta.env.VITE_ETSY_API_KEY
const SHOP_ID = import.meta.env.VITE_ETSY_SHOP_ID || 'ornamentalvalue'
const LIMIT   = 100

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

// Dynamically import all images from the listings folder
const imageModules = import.meta.glob('../assets/listings/*.{jpg,jpeg,png,webp,avif}', { eager: true })

function resolveImage(filename) {
  if (!filename) return null
  const key = `../assets/listings/${filename}`
  return imageModules[key]?.default || null
}

// Build listings from JSON, resolving image paths
const jsonListings = listingsData.map(item => ({
  id:       item.id,
  title:    item.title,
  price:    item.price ? { amount: parseFloat(item.price.replace('$', '')) * 100, divisor: 100 } : null,
  url:      item.url,
  tags:     normaliseTags(item.tags),
  image:    resolveImage(item.image),
  imageAlt: item.title,
}))

export function useEtsyListings() {
  const [listings, setListings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    // No API key — use JSON listings
    if (!API_KEY) {
      setListings(jsonListings)
      setLoading(false)
      return
    }

    async function fetchListings() {
      try {
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

        if (!res.ok) throw new Error(`Etsy API error: ${res.status} ${res.statusText}`)

        const data = await res.json()
        const items = (data.results || []).map(item => ({
          id:       item.listing_id,
          title:    item.title,
          price:    item.price,
          url:      item.url,
          tags:     normaliseTags(item.tags),
          image:    item.images?.[0]?.url_570xN || null,
          imageAlt: item.images?.[0]?.alt_text || item.title,
        }))

        // Fall back to JSON listings if shop is empty
        setListings(items.length > 0 ? items : jsonListings)
      } catch (err) {
        // On any fetch error, fall back to JSON listings
        setListings(jsonListings)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  return { listings, loading, error }
}

export function filterListings(listings, category) {
  if (category === 'all') return listings
  return listings.filter(l => l.tags.includes(category))
}
