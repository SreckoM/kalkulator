'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Config, Product, Type, Material, Profile, Formula } from '@/lib/config'

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
            { label: 'Ime i prezime', key: 'name', type: 'text', value: name, set: setName, placeholder: 'npr. Marko Marković', required: true },
            { label: 'Telefon', key: 'phone', type: 'tel', value: phone, set: setPhone, placeholder: 'npr. 060 123 4567', required: true },
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
            {submitting ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Slanje...</span> : '📨 Pošalji upit'}
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

function ProductIcon({ id, selected }: { id: string; selected: boolean }) {
  const cls = selected ? 'text-blue-700' : 'text-gray-400'
  if (id === 'prozor') return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="3" y="3" width="18" height="18" rx="1.5"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="12" y1="9" x2="12" y2="21"/>
    </svg>
  )
  if (id === 'balkon') return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="4" y="2" width="16" height="20" rx="1.5"/>
      <line x1="4" y1="2" x2="4" y2="22"/>
      <circle cx="14.5" cy="12" r="0.75" fill="currentColor" stroke="none"/>
      <line x1="12" y1="2" x2="12" y2="22"/>
    </svg>
  )
  if (id === 'podizno') return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="2" y="3" width="20" height="18" rx="1.5"/>
      <line x1="12" y1="3" x2="12" y2="21"/>
      <polyline points="8 10 5 12 8 14"/>
      <polyline points="16 10 19 12 16 14"/>
    </svg>
  )
  if (id === 'ulazna_vrata') return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="4" y="2" width="16" height="20" rx="1.5"/>
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
      <path d="M15 11.5 L15 10" strokeWidth="1.5"/>
      <line x1="4" y1="2" x2="4" y2="22"/>
    </svg>
  )
  if (id === 'unutrasnja_vrata') return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      <rect x="4" y="2" width="16" height="20" rx="1.5"/>
      <circle cx="15" cy="12" r="0.75" fill="currentColor" stroke="none"/>
      <line x1="4" y1="2" x2="4" y2="22"/>
    </svg>
  )
  return null
}

export default function KalkulatorPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [productId, setProductId] = useState('')
  const [typeId, setTypeId] = useState('')
  const [materialId, setMaterialId] = useState('')
  const [profileId, setProfileId] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [komarnik, setKomarnik] = useState(false)
  const [roletna, setRoletna] = useState(false)
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

  const availableTypes = config?.types?.filter(t => t.products?.includes(productId)) ?? []
  const availableMaterials = config?.materials?.filter(m => m.products?.includes(productId)) ?? []
  const availableProfiles = config?.profiles?.filter(p => p.material === materialId) ?? []

  useEffect(() => { setTypeId(''); setMaterialId(''); setProfileId('') }, [productId])
  useEffect(() => { setProfileId('') }, [materialId])

  useEffect(() => { if (availableTypes.length === 1) setTypeId(availableTypes[0].id) }, [productId])
  useEffect(() => { if (availableMaterials.length === 1) setMaterialId(availableMaterials[0].id) }, [productId])
  useEffect(() => { if (availableProfiles.length === 1) setProfileId(availableProfiles[0].id) }, [materialId])

  const calculate = useCallback(() => {
    if (!config || !productId || !typeId || !materialId || !profileId || !width || !height) {
      setTotal(null); setBreakdown([]); return
    }
    const wMm = parseFloat(width)
    const hMm = parseFloat(height)
    if (isNaN(wMm) || isNaN(hMm) || wMm <= 0 || hMm <= 0) { setTotal(null); setBreakdown([]); return }

    const profile = config.profiles?.find(p => p.id === profileId)!
    const formula = config.formulas?.find(
      f => f.product === productId && f.type === typeId && f.material === materialId
    )
    if (!formula) { setTotal(null); setBreakdown([]); return }

    // dimensions in cm
    const wCm = wMm / 10
    const hCm = hMm / 10
    const area = (wCm * hCm) / 10000   // m²
    const perim = 2 * (wCm + hCm) / 100 // m

    // height surcharges (thresholds in cm)
    let surchargeTotal = 0
    if (formula.surcharges) {
      for (const s of formula.surcharges) {
        if (hCm >= s.minH) surchargeTotal += s.amount
      }
    }

    const basePrice = Math.ceil(
      formula.areaCoeff * area +
      formula.perimCoeff * profile.perimFactor * perim +
      formula.constant +
      surchargeTotal
    )

    const bd: { label: string; value: string }[] = [
      { label: 'Osnovna cena', value: `${basePrice.toFixed(2)} €` },
    ]

    let addonsTotal = 0
    const areaCm2 = wCm * hCm // cm² for additions

    if (komarnik && config.additions.komarnik.enabled) {
      const v = (config.additions.komarnik.pricePerCm2 ?? 0) * areaCm2
      addonsTotal += v
      bd.push({ label: 'Komarnik', value: `${v.toFixed(2)} €` })
    }
    if (roletna && config.additions.roletna.enabled) {
      const v = (config.additions.roletna.pricePerCm2 ?? 0) * areaCm2
      addonsTotal += v
      bd.push({ label: 'Roletna', value: `${v.toFixed(2)} €` })
    }
    if (okapnica && config.additions.okapnica.enabled) {
      const v = (config.additions.okapnica.pricePerCm ?? 0) * wCm
      addonsTotal += v
      bd.push({ label: 'Okapnica', value: `${v.toFixed(2)} €` })
    }
    if (podprozorska && config.additions.podprozorska.enabled) {
      const v = (config.additions.podprozorska.pricePerCm ?? 0) * wCm
      addonsTotal += v
      bd.push({ label: 'Pod-prozorska daska', value: `${v.toFixed(2)} €` })
    }
    if (montaza && config.additions.montaza?.enabled) {
      const v = config.additions.montaza.fixedPrice ?? 0
      addonsTotal += v
      bd.push({ label: 'Montaža', value: `${v.toFixed(2)} €` })
    }

    const grand = basePrice + addonsTotal
    setTotal(Math.round(grand * 100) / 100)
    setBreakdown(bd)
    setAnimKey(k => k + 1)
  }, [config, productId, typeId, materialId, profileId, width, height, komarnik, roletna, okapnica, podprozorska, montaza])

  useEffect(() => { calculate() }, [calculate])

  async function handleQuoteSubmit(name: string, phone: string, email: string, city: string) {
    setSubmitting(true)
    const product = config?.products.find(p => p.id === productId)
    const type = config?.types.find(t => t.id === typeId)
    const material = config?.materials.find(m => m.id === materialId)
    const profile = config?.profiles.find(p => p.id === profileId)
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone, email, city,
          product: product?.name, type: type?.name,
          material: material?.name, profile: profile?.name,
          width, height, komarnik, roletna, okapnica, podprozorska, montaza, total,
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

  const canShowAdditions = !!profileId && !!width && !!height

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0d2f5e 0%, #1a5fa8 60%, #2a82d4 100%)' }}>
      {showModal && <QuoteModal onClose={() => setShowModal(false)} onSubmit={handleQuoteSubmit} cities={cities} submitting={submitting} />}
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}

      <header className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-white/50 text-xs font-bold tracking-widest uppercase mb-2"></div>
          <h1 className="text-white text-4xl font-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Kalkulator stolarije
          </h1>
          <p className="text-white/60 text-sm mt-2">PVC i ALU prozori, vrata i klizni sistemi</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* 1. Product */}
          <Step n={1} title="Izaberite proizvod">
            <div className="grid grid-cols-3 gap-3">
              {config.products?.map((p: Product) => (
                <OptionCard key={p.id} selected={productId === p.id} onClick={() => setProductId(p.id)}>
                  <div className="mb-3 flex justify-center">
                    <ProductIcon id={p.id} selected={productId === p.id} />
                  </div>
                  <div className={`text-sm font-bold leading-tight ${productId === p.id ? 'text-blue-800' : 'text-gray-700'}`}>{p.name}</div>
                </OptionCard>
              ))}
            </div>
          </Step>

          {/* 2. Type */}
          {productId && (
            <Step n={2} title="Tip otvaranja">
              <div className="grid grid-cols-2 gap-3">
                {availableTypes?.map((t: Type) => (
                  <OptionCard key={t.id} selected={typeId === t.id} onClick={() => setTypeId(t.id)}>
                    <div className={`text-sm font-bold ${typeId === t.id ? 'text-blue-800' : 'text-gray-700'}`}>{t.name}</div>
                  </OptionCard>
                ))}
              </div>
            </Step>
          )}

          {/* 3. Material */}
          {typeId && (
            <Step n={3} title="Materijal">
              <div className="grid grid-cols-2 gap-3">
                {availableMaterials?.map((m: Material) => (
                  <OptionCard key={m.id} selected={materialId === m.id} onClick={() => setMaterialId(m.id)}>
                    <div className={`text-lg font-black mb-1 ${materialId === m.id ? 'text-blue-800' : 'text-gray-700'}`}>{m.name}</div>
                  </OptionCard>
                ))}
              </div>
            </Step>
          )}

          {/* 4. Profile */}
          {materialId && (
            <Step n={4} title="Profil">
              <div className="grid grid-cols-2 gap-3">
                {availableProfiles?.map((p: Profile) => (
                  <OptionCard key={p.id} selected={profileId === p.id} onClick={() => setProfileId(p.id)}>
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-20 object-cover rounded-lg mb-3" />
                    ) : (
                      <div className={`w-full h-16 rounded-lg mb-3 flex items-center justify-center text-xs font-semibold ${profileId === p.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        Nema slike
                      </div>
                    )}
                    <div className={`text-sm font-bold ${profileId === p.id ? 'text-blue-800' : 'text-gray-700'}`}>{p.name}</div>
                  </OptionCard>
                ))}
              </div>
            </Step>
          )}

          {/* 5. Dimensions */}
          {profileId && (
            <Step n={5} title="Dimenzije (mm)">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Širina (mm)</label>
                  <input type="number" min="100" max="5000" placeholder="npr. 1200" value={width}
                    onChange={e => setWidth(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-lg font-bold focus:outline-none focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Visina (mm)</label>
                  <input type="number" min="100" max="5000" placeholder="npr. 1400" value={height}
                    onChange={e => setHeight(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-lg font-bold focus:outline-none focus:border-blue-500 transition-all" />
                </div>
              </div>
              {width && height && parseFloat(width) > 0 && parseFloat(height) > 0 && (
                <p className="text-xs text-gray-400 mt-3">
                  Površina: {((parseFloat(width) / 10) * (parseFloat(height) / 10) / 10000).toFixed(3)} m²
                  &nbsp;·&nbsp;
                  Obim: {(2 * (parseFloat(width) / 10 + parseFloat(height) / 10) / 100).toFixed(2)} m
                </p>
              )}
            </Step>
          )}

          {/* 6. Additions */}
          {canShowAdditions && ['komarnik', 'roletna', 'okapnica', 'podprozorska'].some(k => {
            const a = config.additions[k as keyof typeof config.additions]
            return a.enabled && (!a.products || a.products.includes(productId))
          }) && (
            <Step n={6} title="Dodaci (opciono)">
              <div className="grid grid-cols-2 gap-3">
                {([
                  {
                    key: 'komarnik', label: 'Komarnik', val: komarnik, set: setKomarnik, desc: 'po m²',
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="1.5"/>
                        <line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="13" x2="21" y2="13"/><line x1="3" y1="18" x2="21" y2="18"/>
                        <line x1="8" y1="3" x2="8" y2="21"/><line x1="13" y1="3" x2="13" y2="21"/><line x1="18" y1="3" x2="18" y2="21"/>
                      </svg>
                    )
                  },
                  {
                    key: 'roletna', label: 'Roletna', val: roletna, set: setRoletna, desc: 'po m²',
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="3" rx="1"/>
                        <rect x="3" y="8" width="18" height="2.5" rx="0.75"/>
                        <rect x="3" y="12.5" width="18" height="2.5" rx="0.75"/>
                        <rect x="3" y="17" width="18" height="2.5" rx="0.75"/>
                        <line x1="10" y1="6" x2="10" y2="6.1"/><line x1="14" y1="6" x2="14" y2="6.1"/>
                      </svg>
                    )
                  },
                  {
                    key: 'okapnica', label: 'Okapnica', val: okapnica, set: setOkapnica, desc: 'po širini',
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="5" rx="1"/>
                        <path d="M4 10 L4 17 Q4 19 6 19 L18 19 Q20 19 20 17 L20 10"/>
                        <line x1="8" y1="14" x2="8" y2="19"/><line x1="12" y1="14" x2="12" y2="19"/><line x1="16" y1="14" x2="16" y2="19"/>
                      </svg>
                    )
                  },
                  {
                    key: 'podprozorska', label: 'Pod-prozorska daska', val: podprozorska, set: setPodprozorska, desc: 'po širini',
                    icon: (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="14" width="20" height="4" rx="1"/>
                        <rect x="5" y="4" width="14" height="10" rx="1"/>
                        <line x1="12" y1="4" x2="12" y2="14"/>
                        <line x1="5" y1="9" x2="19" y2="9"/>
                      </svg>
                    )
                  },
                ] as const).filter(a => {
                  const cfg = config.additions[a.key]
                  return cfg.enabled && (!cfg.products || cfg.products.includes(productId))
                }).map(a => (
                  <button key={a.key} onClick={() => a.set(v => !v)}
                    className={`rounded-xl p-4 border-2 text-left transition-all duration-200 cursor-pointer ${a.val ? 'border-blue-700 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                    <div className={`mb-2 ${a.val ? 'text-blue-700' : 'text-gray-400'}`}>{a.icon}</div>
                    <div className={`text-sm font-semibold leading-tight ${a.val ? 'text-blue-800' : 'text-gray-700'}`}>{a.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{a.desc}</div>
                    <div className={`mt-2 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${a.val ? 'bg-blue-700 border-blue-700' : 'border-gray-300'}`}>
                      {a.val && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                    </div>
                  </button>
                ))}
              </div>
            </Step>
          )}

          {/* 7. Installation */}
          {canShowAdditions && config.additions.montaza?.enabled && (
            <Step n={7} title="Ugradnja">
              <button onClick={() => setMontaza(v => !v)}
                className={`w-full rounded-xl p-4 border-2 text-left transition-all duration-200 cursor-pointer flex items-center gap-4 ${montaza ? 'border-blue-700 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                <div className={montaza ? 'text-blue-700' : 'text-gray-400'}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-bold ${montaza ? 'text-blue-800' : 'text-gray-700'}`}>Montaža</div>
                  <div className="text-xs text-gray-400 mt-0.5">fiksna cena: {(config.additions.montaza.fixedPrice ?? 0).toFixed(2)} €</div>
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
                <p className="text-white/40 text-xs mt-2">* Okvirna cena bez PDV-a</p>
              </div>
              <button onClick={() => setShowModal(true)}
                className="flex-shrink-0 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-gray-900 font-black py-3 px-6 rounded-xl transition-all shadow-lg text-sm cursor-pointer">
                📨 Poruči po najboljoj ceni
              </button>
            </div>
          </section>
        </div>

        <div className="text-center text-white/30 text-xs mt-8 space-y-1">
          <p>Bul. Mihajla Pupina 5, Novi Beograd • Ilije Stojadinovića 51, Beograd</p>
          <p>011/770 24 35 • 060/3020 669</p>
          <p className="mt-4"><a href="/admin" className="underline hover:text-white/50">Admin panel</a></p>
        </div>
      </main>
    </div>
  )
}
