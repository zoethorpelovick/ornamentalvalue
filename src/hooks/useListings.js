import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import listingsData from '../data/listings.json'

// Resolve local JSON images
const imageModules = import.meta.glob('../assets/listings/*.{jpg,jpeg,png,webp,avif}', { eager: true })
function resolveImage(filename) {
  if (!filename) return null
  const key = `../assets/listings/${filename}`
  return imageModules[key]?.default || null
}

const jsonListings = listingsData.map(item => ({
  id:       item.id,
  title:    item.title,
  price:    item.price || null,
  url:      item.url,
  tags:     (item.tags || []).map(t => t.toLowerCase().trim()),
  image:    resolveImage(item.image),
  imageAlt: item.title,
}))

export function useListings() {
  const [listings, setListings] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function fetch() {
      if (!supabase) {
        setListings(jsonListings)
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('sold', false)
        .order('created_at', { ascending: false })

      if (error || !data || data.length === 0) {
        setListings(jsonListings)
      } else {
        setListings(data.map(item => ({
          id:       item.id,
          title:    item.title,
          price:    item.price ? `$${item.price}` : null,
          url:      item.etsy_url,
          tags:     (item.tags || []).map(t => t.toLowerCase().trim()),
          image:    item.image_url,
          imageAlt: item.title,
        })))
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { listings, loading }
}

export function filterListings(listings, category) {
  if (category === 'all') return listings
  return listings.filter(l => l.tags.includes(category))
}
