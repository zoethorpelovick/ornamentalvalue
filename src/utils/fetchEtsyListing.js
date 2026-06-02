// Fetch Etsy listing data via CORS proxy, parsing the __NEXT_DATA__ JSON
// blob that Etsy embeds in every listing page's static HTML.

const PROXIES = [
  url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  url => `https://thingproxy.freeboard.io/fetch/${url}`,
]

function parseListingHtml(html) {
  // ── Strategy 1: __NEXT_DATA__ JSON blob ──────────────────────────────────
  // Etsy's Next.js pages embed all listing data here in static HTML
  try {
    const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(\{.*?\})<\/script>/s)
    if (nextMatch) {
      const nextData = JSON.parse(nextMatch[1])
      // Navigate to listing data — path varies slightly but listing is usually here
      const props = nextData?.props?.pageProps
      const listing = props?.listing || props?.listingData?.listing || props?.initialData?.listing

      if (listing) {
        const title = listing.title || ''
        // Price lives in listing.price or listing.listings_retail_price
        const priceObj = listing.price || listing.listings_retail_price
        const price = priceObj
          ? String(Math.round(priceObj.amount / (priceObj.divisor || 100)))
          : ''
        // Images array
        const images = listing.images || listing.listing_images || []
        const image = images[0]?.url_570xN || images[0]?.url_fullxfull || ''

        if (title) return { title, price, image }
      }
    }
  } catch {}

  // ── Strategy 2: data-appears-event-data attribute ─────────────────────────
  // The price component embeds a JSON blob with full price info
  try {
    const priceMatch = html.match(/data-appears-component-name="price"[^>]*data-appears-event-data="([^"]+)"/)
    if (priceMatch) {
      // Etsy HTML-encodes the JSON — decode it
      const raw = priceMatch[1]
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&#39;/g, "'")
      const priceData = JSON.parse(raw)
      const price = priceData.price_money?.amount
        ? String(Math.round(priceData.price_money.amount / (priceData.price_money.divisor || 100)))
        : priceData.currency_formatted_raw || ''

      // Still need title and image from other strategies
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.content || ''
      const title = ogTitle.replace(/\s*[|\-–]\s*(Etsy|etsy\.com).*$/i, '').trim()
      const image = doc.querySelector('meta[property="og:image"]')?.content || ''

      if (price) return { title, price, image }
    }
  } catch {}

  // ── Strategy 3: og meta tags + JSON-LD ───────────────────────────────────
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html')

    const ogTitle = doc.querySelector('meta[property="og:title"]')?.content || ''
    const title = ogTitle.replace(/\s*[|\-–]\s*(Etsy|etsy\.com).*$/i, '').trim()
    const image = doc.querySelector('meta[property="og:image"]')?.content || ''
    let price = doc.querySelector('meta[property="og:price:amount"]')?.content || ''

    if (!price) {
      for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
        try {
          const obj = JSON.parse(s.textContent)
          const items = Array.isArray(obj) ? obj : [obj, ...(obj['@graph'] || [])]
          for (const item of items) {
            if (item['@type'] === 'Product') {
              const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers
              if (offers?.price) { price = String(Math.round(offers.price)); break }
            }
          }
        } catch {}
        if (price) break
      }
    }

    if (title) return { title, price, image }
  } catch {}

  return { title: '', price: '', image: '' }
}

export async function fetchEtsyListing(listingUrl) {
  for (const buildUrl of PROXIES) {
    try {
      const proxyUrl = buildUrl(listingUrl)
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) })
      if (!res.ok) continue

      let html = ''
      const contentType = res.headers.get('content-type') || ''

      if (contentType.includes('application/json')) {
        const json = await res.json()
        html = json.contents || json.html || ''
      } else {
        html = await res.text()
      }

      if (!html || html.length < 500) continue
      if (html.includes('Host not in allowlist')) continue

      const result = parseListingHtml(html)
      if (result.title) return { ok: true, ...result }

    } catch {}
  }

  return { ok: false, title: '', price: '', image: '' }
}
