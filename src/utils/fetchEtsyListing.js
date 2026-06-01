// Fetch an Etsy listing's title, price, and image by scraping the public page
// via a CORS proxy. Tries multiple proxies in sequence.

const PROXIES = [
  url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  url => `https://thingproxy.freeboard.io/fetch/${url}`,
]

function parseListingHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Title: og:title, stripping "| Etsy" suffix
  const ogTitle = doc.querySelector('meta[property="og:title"]')?.content
  const h1Text  = doc.querySelector('h1')?.textContent?.trim()
  const raw     = ogTitle || h1Text || ''
  const title   = raw.replace(/\s*[|\-–]\s*(Etsy|etsy\.com).*$/i, '').trim()

  // Price: og:price:amount, then JSON-LD Product, then regex scan
  let price = doc.querySelector('meta[property="og:price:amount"]')?.content || ''

  if (!price) {
    for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const obj = JSON.parse(s.textContent)
        const items = Array.isArray(obj) ? obj : [obj, ...(obj['@graph'] || [])]
        for (const item of items) {
          if (item['@type'] === 'Product') {
            const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers
            if (offers?.price) { price = String(offers.price); break }
          }
        }
      } catch {}
      if (price) break
    }
  }

  if (!price) {
    const m = html.match(/"price"\s*:\s*"?(\d+\.?\d*)"?/)
    if (m) price = m[1]
  }

  // Image: og:image
  const image = doc.querySelector('meta[property="og:image"]')?.content || ''

  return {
    title,
    price: price ? String(Math.round(parseFloat(price))) : '',
    image,
  }
}

export async function fetchEtsyListing(listingUrl) {
  for (const buildUrl of PROXIES) {
    try {
      const proxyUrl = buildUrl(listingUrl)
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) })
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
