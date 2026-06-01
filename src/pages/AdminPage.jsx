import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import styles from './AdminPage.module.css'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD
const CATEGORIES = ['candle-holders', 'vases', 'trays', 'objet', 'jewellery']

const emptyForm = {
  title:     '',
  price:     '',
  image_url: '',
  etsy_url:  '',
  tags:      [],
  sold:      false,
}

export default function AdminPage() {
  const [authed,    setAuthed]    = useState(false)
  const [password,  setPassword]  = useState('')
  const [authError, setAuthError] = useState(false)
  const [listings,  setListings]  = useState([])
  const [form,      setForm]      = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [message,   setMessage]   = useState('')

  function login() {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      setAuthError(false)
    } else {
      setAuthError(true)
    }
  }

  async function loadListings() {
    if (!supabase) return
    const { data } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setListings(data)
  }

  useEffect(() => {
    if (authed) loadListings()
  }, [authed])

  function handleTagToggle(tag) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter(t => t !== tag)
        : [...f.tags, tag],
    }))
  }

  function startEdit(listing) {
    setEditingId(listing.id)
    setForm({
      title:     listing.title,
      price:     listing.price || '',
      image_url: listing.image_url || '',
      etsy_url:  listing.etsy_url || '',
      tags:      listing.tags || [],
      sold:      listing.sold || false,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setMessage('')
  }

  async function saveListing() {
    if (!form.title.trim()) { setMessage('Title is required.'); return }
    if (!form.etsy_url.trim()) { setMessage('Etsy URL is required.'); return }
    setSaving(true)
    setMessage('')

    const payload = {
      title:     form.title.trim(),
      price:     form.price ? parseFloat(form.price.replace('$', '')) : null,
      image_url: form.image_url.trim() || null,
      etsy_url:  form.etsy_url.trim(),
      tags:      form.tags,
      sold:      form.sold,
    }

    let error
    if (editingId) {
      ;({ error } = await supabase.from('listings').update(payload).eq('id', editingId))
    } else {
      ;({ error } = await supabase.from('listings').insert(payload))
    }

    setSaving(false)
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage(editingId ? 'Listing updated.' : 'Listing added.')
      setEditingId(null)
      setForm(emptyForm)
      loadListings()
    }
  }

  async function deleteListing(id) {
    if (!window.confirm('Delete this listing?')) return
    await supabase.from('listings').delete().eq('id', id)
    loadListings()
  }

  async function toggleSold(listing) {
    await supabase.from('listings').update({ sold: !listing.sold }).eq('id', listing.id)
    loadListings()
  }

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className={styles.loginWrap}>
        <div className={styles.loginBox}>
          <p className={styles.loginEyebrow}>Admin</p>
          <h1 className={styles.loginTitle}>Ornamental Value</h1>
          <input
            type="password"
            className={styles.input}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            autoFocus
          />
          {authError && <p className={styles.error}>Incorrect password</p>}
          <button className={styles.btnPrimary} onClick={login}>Enter</button>
        </div>
      </div>
    )
  }

  // ── Admin UI ──────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {editingId ? 'Edit Listing' : 'Add New Listing'}
        </h1>
        <p className={styles.pageSubtitle}>
          {listings.filter(l => !l.sold).length} active · {listings.filter(l => l.sold).length} sold
        </p>
      </div>

      {/* ── Form ── */}
      <div className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.fieldFull}>
            <label className={styles.label}>Item Name *</label>
            <input
              className={styles.input}
              placeholder="e.g. Kashmir Lacquer Dish"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Price (AUD)</label>
            <input
              className={styles.input}
              placeholder="e.g. 85"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Etsy Listing URL *</label>
            <input
              className={styles.input}
              placeholder="https://www.etsy.com/listing/..."
              value={form.etsy_url}
              onChange={e => setForm(f => ({ ...f, etsy_url: e.target.value }))}
            />
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label}>Image URL</label>
            <input
              className={styles.input}
              placeholder="Paste the image URL from your Etsy listing"
              value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
            />
            <p className={styles.hint}>
              On your Etsy listing page, right-click the main photo → "Copy image address" and paste it here.
            </p>
          </div>

          <div className={styles.fieldFull}>
            <label className={styles.label}>Categories</label>
            <div className={styles.tags}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`${styles.tagBtn} ${form.tags.includes(cat) ? styles.tagActive : ''}`}
                  onClick={() => handleTagToggle(cat)}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {editingId && (
            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <button
                className={`${styles.tagBtn} ${form.sold ? styles.tagSold : styles.tagActive}`}
                onClick={() => setForm(f => ({ ...f, sold: !f.sold }))}
                type="button"
              >
                {form.sold ? 'Sold — click to mark available' : 'Available — click to mark sold'}
              </button>
            </div>
          )}
        </div>

        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.formActions}>
          <button className={styles.btnPrimary} onClick={saveListing} disabled={saving}>
            {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Listing'}
          </button>
          {editingId && (
            <button className={styles.btnGhost} onClick={cancelEdit}>Cancel</button>
          )}
        </div>
      </div>

      {/* ── Listing table ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>All Listings</h2>
        {listings.length === 0 && (
          <p className={styles.empty}>No listings yet — add your first one above.</p>
        )}
        <div className={styles.listingList}>
          {listings.map(listing => (
            <div key={listing.id} className={`${styles.listingRow} ${listing.sold ? styles.listingRowSold : ''}`}>
              {listing.image_url && (
                <img src={listing.image_url} alt={listing.title} className={styles.thumb} />
              )}
              {!listing.image_url && <div className={styles.thumbEmpty} />}
              <div className={styles.listingInfo}>
                <p className={styles.listingTitle}>{listing.title}</p>
                <p className={styles.listingMeta}>
                  {listing.price ? `$${listing.price}` : 'No price'} · {(listing.tags || []).join(', ') || 'No categories'}
                  {listing.sold && <span className={styles.soldBadge}>Sold</span>}
                </p>
              </div>
              <div className={styles.listingActions}>
                <button className={styles.btnSmall} onClick={() => startEdit(listing)}>Edit</button>
                <button className={`${styles.btnSmall} ${styles.btnSmallGhost}`} onClick={() => toggleSold(listing)}>
                  {listing.sold ? 'Unmark sold' : 'Mark sold'}
                </button>
                <button className={`${styles.btnSmall} ${styles.btnSmallDanger}`} onClick={() => deleteListing(listing.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
