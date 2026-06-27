'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Config, PriceEntry } from '@/lib/config'

interface QuoteModalProps {
  onClose: () => void
  onSubmit: (name: string, phone: string, email: string, city: string) => Promise<void>
  cities: string[]
  submitting: boolean
}

function QuoteModal({ onClose, onSubmit, cities, submitting }: QuoteModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Ime je obavezno'
    if (!phone.trim()) e.phone = 'Telefon je obavezan'
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Unesite ispravan email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,30,70,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-7 pt-7 pb-5 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Zatražite ponudu</h2>
            <p className="text-sm text-gray-500 mt-1">Poslaćemo Vam detalje na email</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl leading-none cursor-pointer">×</button>
        </div>
        <div className="px-7 py-6 space-y-4">
          {[
            { label: 'Ime i prezime', key: 'name', type: 'text', value: name, set: setName, placeholder: 'npr. Marko Marković' },
            { label: 'Telefon', key: 'phone', type: 'tel', value: phone, set: setPhone, placeholder: 'npr. 060 123 4567' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{f.label} <span className="text-red-400">*</span></label>
              <input type={f.type} value={f.value} placeholder={f.placeholder}
                onChange={e => { f.set(e.target.value); setErrors(p => ({ ...p, [f.key]: '' })) }}
                className={`w-full border-2 rounded-xl px-4 py-3 text-gray-800 focus:outline-none transition-all ${errors[f.key] ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'}`} />
              {errors[f.key] && <p className="text-red-400 text-xs mt-1">{errors[f.key]}</p>}
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email <span className="text-gray-300 font-normal normal-case">(opciono)</span></label>
            <input type="email" value={email} placeholder="npr. marko@email.com"
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
              className={`w-full border-2 rounded-xl px-4 py-3 text-gray-800 focus:outline-none transition-all ${errors.email ? 'border-red-300' : 'border-gray-200 focus:border-blue-500'}`} />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Grad <span className="text-gray-300 font-normal normal-case">(opciono)</span></label>
            <div className="relative">
              <select value={city} onChange={e => setCity(e.target.value)}
                className={`w-full border-2 rounded-xl px-4 py-3 text-gray-800 focus:outline-none transition-all appearance-none bg-white cursor-pointer border-gray-200 focus:border-blue-500 ${!city ? 'text-gray-400' : ''}`}>
                <option value="">Izaberite grad...</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>
        <div className="px-7 pb-7 flex gap-3">
          <button onClick={onClose} className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">Otkaži</button>
          <button onClick={() => { if (validate()) onSubmit(name, phone, email, city) }} disabled={submitting}
            className="flex-1 font-bold py-3 rounded-xl text-white transition-all shadow-md disabled:opacity-60 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #0d2f5e, #1a5fa8)' }}>
            {submitting
              ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Slanje...</span>
              : '📨 Pošalji upit'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(10,30,70,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-10 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Upit je poslat!</h2>
        <p className="text-gray-500 text-sm mb-8">Kontaktiraćemo Vas u najkraćem mogućem roku sa najboljom ponudom.</p>
        <button onClick={onClose} className="w-full font-bold py-3 rounded-xl text-white cursor-pointer" style={{ background: 'linear-gradient(135deg, #0d2f5e, #1a5fa8)' }}>Zatvori</button>
      </div>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="p-6 border-b border-gray-100">
      <div className="flex items-center gap-3 mb-5">
        <span className="bg-blue-700 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">{n}</span>
        <h2 className="font-bold text-gray-600 text-xs uppercase tracking-widest">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function OptionCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-2xl p-4 border-2 text-left transition-all duration-200 cursor-pointer w-full ${selected ? 'border-blue-700 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'}`}>
      {children}
    </button>
  )
}

function ProductIcon({ product, selected }: { product: string; selected: boolean }) {
  const cls = selected ? 'text-blue-700' : 'text-gray-400'
  const lower = product.toLowerCase()
  if (lower.includes('dvokrilni prozor') || lower.includes('dvokrilni pro')) return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="2" y="3" width="20" height="18" rx="1.5"/>
      <line x1="2" y1="9" x2="22" y2="9"/>
      <line x1="12" y1="9" x2="12" y2="21"/>
    </svg>
  )
  if (lower.includes('prozor')) return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="4" y="2" width="16" height="20" rx="1.5"/>
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
      <path d="M15 11.5 L15 10" strokeWidth="1.5"/>
      <line x1="4" y1="2" x2="4" y2="22"/>
    </svg>
  )
  if (lower.includes('balkon dvokrilni') || lower.includes('balkon dvo')) return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="2" y="2" width="20" height="20" rx="1.5"/>
      <line x1="12" y1="2" x2="12" y2="22"/>
      <circle cx="8.5" cy="12" r="0.75" fill="currentColor" stroke="none"/>
      <circle cx="15.5" cy="12" r="0.75" fill="currentColor" stroke="none"/>
    </svg>
  )
  if (lower.includes('balkon')) return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="4" y="2" width="16" height="20" rx="1.5"/>
      <circle cx="14.5" cy="12" r="0.75" fill="currentColor" stroke="none"/>
    </svg>
  )
  if (lower.includes('dvokrilna vrata') || lower.includes('dvokrilna')) return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="2" y="2" width="20" height="20" rx="1.5"/>
      <line x1="12" y1="2" x2="12" y2="22"/>
      <circle cx="9.5" cy="12" r="0.75" fill="currentColor" stroke="none"/>
      <circle cx="14.5" cy="12" r="0.75" fill="currentColor" stroke="none"/>
    </svg>
  )
  if (lower.includes('vrata')) return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="4" y="2" width="16" height="20" rx="1.5"/>
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
      <line x1="4" y1="2" x2="4" y2="22"/>
    </svg>
  )
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="3" y="3" width="18" height="18" rx="1.5"/>
    </svg>
  )
}

// Stable order for products as they appear in the price list
function uniqueOrdered<T>(arr: T[]): T[] {
  return arr.filter((v, i, a) => a.indexOf(v) === i)
}

export default function KalkulatorPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [material, setMaterial] = useState('')
  const [product, setProduct] = useState('')
  const [staklo, setStaklo] = useState('')
  const [profile, setProfile] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<PriceEntry | null>(null)

  const [roletna, setRoletna] = useState(false)
  const [komarnik, setKomarnik] = useState(false)
  const [okapnica, setOkapnica] = useState(false)
  const [podprozorska, setPodprozorska] = useState(false)
  const [montaza, setMontaza] = useState(false)

  const [total, setTotal] = useState<number | null>(null)
  const [breakdown, setBreakdown] = useState<{ label: string; value: string }[]>([])
  const [animKey, setAnimKey] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/config').then(r => r.json()),
      fetch('/api/cities').then(r => r.json()),
    ]).then(([cfg, cty]) => {
      setConfig(cfg)
      setCities(cty)
      setLoading(false)
    })
  }, [])

  // Cascading filter
  const pl = config?.pricelist ?? []
  const materials = uniqueOrdered(pl.map(e => e.material))
  const byMaterial = pl.filter(e => e.material === material)
  const products = uniqueOrdered(byMaterial.map(e => e.product))
  const byProduct = byMaterial.filter(e => e.product === product)
  const stakloOptions = uniqueOrdered(byProduct.filter(e => e.staklo !== '').map(e => e.staklo))
  const hasStaklo = stakloOptions.length > 0
  const byStaklo = hasStaklo ? byProduct.filter(e => e.staklo === staklo) : byProduct
  const profiles = uniqueOrdered(byStaklo.map(e => e.profile))
  const sizes = byStaklo.filter(e => e.profile === profile).sort((a, b) => a.width !== b.width ? a.width - b.width : a.height - b.height)

  // Reset cascade
  useEffect(() => { setProduct(''); setStaklo(''); setProfile(''); setSelectedEntry(null) }, [material])
  useEffect(() => { setStaklo(''); setProfile(''); setSelectedEntry(null) }, [product])
  useEffect(() => { setProfile(''); setSelectedEntry(null) }, [staklo])
  useEffect(() => { setSelectedEntry(null) }, [profile])

  // Auto-select when only one option
  useEffect(() => { if (materials.length === 1) setMaterial(materials[0]) }, [config])
  useEffect(() => { if (products.length === 1) setProduct(products[0]) }, [material])
  useEffect(() => { if (stakloOptions.length === 1) setStaklo(stakloOptions[0]) }, [product])
  useEffect(() => { if (profiles.length === 1) setProfile(profiles[0]) }, [staklo, product])

  const calculate = useCallback(() => {
    if (!config || !selectedEntry) { setTotal(null); setBreakdown([]); return }

    const multiplier = (1 + selectedEntry.rabat / 100) * (1 + selectedEntry.pdv / 100)
    const adj = (v: number) => Math.round(v * multiplier * 100) / 100

    const bd: { label: string; value: string }[] = [
      { label: 'Osnovna cena', value: `${adj(selectedEntry.price).toFixed(2)} €` },
    ]
    let sum = adj(selectedEntry.price)

    if (roletna && selectedEntry.roletna > 0) {
      const v = adj(selectedEntry.roletna)
      sum += v
      bd.push({ label: 'Roletna', value: `${v.toFixed(2)} €` })
    }
    if (komarnik && selectedEntry.komarnik > 0) {
      const v = adj(selectedEntry.komarnik)
      sum += v
      bd.push({ label: 'Komarnik', value: `${v.toFixed(2)} €` })
    }
    if (okapnica && selectedEntry.okapnica > 0) {
      const v = adj(selectedEntry.okapnica)
      sum += v
      bd.push({ label: 'Okapnica', value: `${v.toFixed(2)} €` })
    }
    if (podprozorska && selectedEntry.podprozorska > 0) {
      const v = adj(selectedEntry.podprozorska)
      sum += v
      bd.push({ label: 'Pod-prozorska daska', value: `${v.toFixed(2)} €` })
    }
    if (montaza && config.montaza.enabled) {
      const v = config.montaza.fixedPrice
      sum += v
      bd.push({ label: 'Montaža', value: `${v.toFixed(2)} €` })
    }

    setTotal(Math.round(sum * 100) / 100)
    setBreakdown(bd)
    setAnimKey(k => k + 1)
  }, [config, selectedEntry, roletna, komarnik, okapnica, podprozorska, montaza])

  useEffect(() => { calculate() }, [calculate])

  async function handleQuoteSubmit(name: string, phone: string, email: string, city: string) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone, email, city,
          product, material, profile,
          staklo: staklo || 'N/A',
          width: selectedEntry?.width, height: selectedEntry?.height,
          roletna, komarnik, okapnica, podprozorska, montaza, total,
        }),
      })
      if (res.ok) { setShowModal(false); setShowSuccess(true) }
      else { const err = await res.json(); alert(err.error || 'Greška pri slanju.') }
    } catch { alert('Greška pri slanju.') }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d2f5e, #1a5fa8)' }}>
        <div className="text-white text-lg font-semibold animate-pulse">Učitavanje...</div>
      </div>
    )
  }
  if (!config) return null

  // Dynamic step counter
  let stepN = 0
  const nextStep = () => ++stepN

  const showAdditions = !!selectedEntry && (
    selectedEntry.roletna > 0 || selectedEntry.komarnik > 0 ||
    selectedEntry.okapnica > 0 || selectedEntry.podprozorska > 0
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0d2f5e 0%, #1a5fa8 60%, #2a82d4 100%)' }}>
      {showModal && <QuoteModal onClose={() => setShowModal(false)} onSubmit={handleQuoteSubmit} cities={cities} submitting={submitting} />}
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}

      <header className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-white text-4xl font-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            {config.header?.title ?? 'Kalkulator stolarije'}
          </h1>
          <p className="text-white/60 text-sm mt-2">{config.header?.subtitle ?? ''}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* 1. Material */}
          <Step n={nextStep()} title="Materijal">
            <div className="grid grid-cols-2 gap-3">
              {materials.map(m => (
                <OptionCard key={m} selected={material === m} onClick={() => setMaterial(m)}>
                  <div className={`text-2xl font-black mb-1 ${material === m ? 'text-blue-800' : 'text-gray-700'}`}>{m}</div>
                </OptionCard>
              ))}
            </div>
          </Step>

          {/* 2. Product */}
          {material && (
            <Step n={nextStep()} title="Proizvod">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {products.map(p => (
                  <OptionCard key={p} selected={product === p} onClick={() => setProduct(p)}>
                    <div className="mb-3 flex justify-center">
                      <ProductIcon product={p} selected={product === p} />
                    </div>
                    <div className={`text-sm font-bold leading-tight ${product === p ? 'text-blue-800' : 'text-gray-700'}`}>{p}</div>
                  </OptionCard>
                ))}
              </div>
            </Step>
          )}

          {/* 3. Staklo (glass type) — only for products that have it */}
          {product && hasStaklo && (
            <Step n={nextStep()} title="Vrsta stakla">
              <div className="grid grid-cols-2 gap-3">
                {stakloOptions.map(s => (
                  <OptionCard key={s} selected={staklo === s} onClick={() => setStaklo(s)}>
                    <div className={`text-sm font-bold mb-1 ${staklo === s ? 'text-blue-800' : 'text-gray-700'}`}>{s} staklo</div>
                    <div className={`text-xs ${staklo === s ? 'text-blue-500' : 'text-gray-400'}`}>
                      {s === 'Dvoslojno' ? 'Standardna toplotna izolacija' : 'Poboljšana toplotna izolacija'}
                    </div>
                  </OptionCard>
                ))}
              </div>
            </Step>
          )}

          {/* Profile */}
          {(product && (!hasStaklo || staklo)) && (
            <Step n={nextStep()} title="Profil">
              <div className="grid grid-cols-2 gap-3">
                {profiles.map(p => (
                  <OptionCard key={p} selected={profile === p} onClick={() => setProfile(p)}>
                    <div className={`text-sm font-bold ${profile === p ? 'text-blue-800' : 'text-gray-700'}`}>{p}</div>
                  </OptionCard>
                ))}
              </div>
            </Step>
          )}

          {/* Dimensions */}
          {profile && (
            <Step n={nextStep()} title="Dimenzije">
              {sizes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Nema dostupnih dimenzija za izabranu kombinaciju.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {sizes.map((e, i) => {
                    const isSelected = selectedEntry === e || (selectedEntry?.width === e.width && selectedEntry?.height === e.height && selectedEntry?.price === e.price)
                    const displayPrice = Math.round(e.price * (1 + e.rabat / 100) * (1 + e.pdv / 100) * 100) / 100
                    return (
                      <button key={i} onClick={() => setSelectedEntry(e)}
                        className={`rounded-2xl p-4 border-2 text-left transition-all duration-200 cursor-pointer w-full ${isSelected ? 'border-blue-700 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'}`}>
                        <div className={`text-base font-black leading-tight ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                          {e.width} × {e.height}<span className={`text-xs font-semibold ml-0.5 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>mm</span>
                        </div>
                        <div className={`text-sm font-bold mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                          {displayPrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </Step>
          )}

          {/* Additions — shown only if the selected entry has any */}
          {showAdditions && (
            <Step n={nextStep()} title="Dodaci (opciono)">
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: 'roletna', label: 'Roletna', val: roletna, set: setRoletna, price: selectedEntry!.roletna, note: '+200mm visina',
                    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="3" rx="1"/><rect x="3" y="8" width="18" height="2.5" rx="0.75"/><rect x="3" y="12.5" width="18" height="2.5" rx="0.75"/><rect x="3" y="17" width="18" height="2.5" rx="0.75"/></svg> },
                  { key: 'komarnik', label: 'Komarnik', val: komarnik, set: setKomarnik, price: selectedEntry!.komarnik, note: '',
                    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="1.5"/><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="13" x2="21" y2="13"/><line x1="3" y1="18" x2="21" y2="18"/><line x1="8" y1="3" x2="8" y2="21"/><line x1="13" y1="3" x2="13" y2="21"/><line x1="18" y1="3" x2="18" y2="21"/></svg> },
                  { key: 'okapnica', label: 'Okapnica', val: okapnica, set: setOkapnica, price: selectedEntry!.okapnica, note: '',
                    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="5" rx="1"/><path d="M4 10 L4 17 Q4 19 6 19 L18 19 Q20 19 20 17 L20 10"/></svg> },
                  { key: 'podprozorska', label: 'Pod-prozorska daska', val: podprozorska, set: setPodprozorska, price: selectedEntry!.podprozorska, note: '',
                    icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="14" width="20" height="4" rx="1"/><rect x="5" y="4" width="14" height="10" rx="1"/><line x1="12" y1="4" x2="12" y2="14"/><line x1="5" y1="9" x2="19" y2="9"/></svg> },
                ] as const).filter(a => a.price > 0).map(a => (
                  <button key={a.key} onClick={() => a.set(v => !v)}
                    className={`rounded-xl p-4 border-2 text-left transition-all duration-200 cursor-pointer ${a.val ? 'border-blue-700 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                    <div className={`mb-2 ${a.val ? 'text-blue-700' : 'text-gray-400'}`}>{a.icon}</div>
                    <div className={`text-sm font-semibold leading-tight ${a.val ? 'text-blue-800' : 'text-gray-700'}`}>{a.label}</div>
                    <div className={`text-xs font-bold mt-0.5 ${a.val ? 'text-blue-600' : 'text-gray-400'}`}>
                      {a.price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </div>
                    {a.note && <div className={`text-xs mt-1 ${a.val ? 'text-orange-500' : 'text-gray-400'}`}>⚠ {a.note}</div>}
                    <div className={`mt-2 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${a.val ? 'bg-blue-700 border-blue-700' : 'border-gray-300'}`}>
                      {a.val && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                    </div>
                  </button>
                ))}
              </div>
            </Step>
          )}

          {/* Montaža */}
          {selectedEntry && config.montaza.enabled && (
            <Step n={nextStep()} title="Ugradnja">
              <button onClick={() => setMontaza(v => !v)}
                className={`w-full rounded-xl p-4 border-2 text-left transition-all duration-200 cursor-pointer flex items-center gap-4 ${montaza ? 'border-blue-700 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                <div className={montaza ? 'text-blue-700' : 'text-gray-400'}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-bold ${montaza ? 'text-blue-800' : 'text-gray-700'}`}>Montaža</div>
                  <div className={`text-xs font-bold mt-0.5 ${montaza ? 'text-blue-600' : 'text-gray-400'}`}>
                    {config.montaza.fixedPrice.toFixed(2)} €
                  </div>
                </div>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${montaza ? 'bg-blue-700 border-blue-700' : 'border-gray-300'}`}>
                  {montaza && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                </div>
              </button>
            </Step>
          )}

          {/* Total */}
          <section className="p-6" style={{ background: 'linear-gradient(135deg, #0d2f5e, #1a5fa8)' }}>
            {total !== null && breakdown.length > 0 && (
              <div className="mb-5 space-y-1.5">
                {breakdown.map((b, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-white/60">{b.label}</span>
                    <span className="text-white/80 font-medium">{b.value}</span>
                  </div>
                ))}
                <div className="border-t border-white/20 pt-1.5" />
              </div>
            )}
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Ukupno</div>
                {total !== null ? (
                  <div key={animKey} className="text-white text-5xl font-black" style={{ fontFamily: 'Georgia, serif', animation: 'popIn 0.25s ease-out' }}>
                    {total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </div>
                ) : (
                  <div className="text-white/30 text-4xl font-black" style={{ fontFamily: 'Georgia, serif' }}>--</div>
                )}
                {config.header?.disclaimer && <p className="text-white/40 text-xs mt-2">{config.header.disclaimer}</p>}
              </div>
              <button onClick={() => setShowModal(true)}
                className="flex-shrink-0 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-gray-900 font-black py-3 px-6 rounded-xl transition-all shadow-lg text-sm cursor-pointer">
                📨 Poruči po najboljoj ceni
              </button>
            </div>
          </section>
        </div>

        <div className="text-center text-white/30 text-xs mt-8 space-y-1">
          {config.footer?.lines?.map((line, i) => <p key={i}>{line}</p>)}
          <p className="mt-4"><a href="/admin" className="underline hover:text-white/50">Admin panel</a></p>
        </div>
      </main>
    </div>
  )
}
