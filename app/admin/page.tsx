'use client'

import { useEffect, useState } from 'react'
import type { Config, Product, Type, Profile, Formula } from '@/lib/config'

const PW_KEY = 'admin_pw'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [storedPw, setStoredPw] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [activeTab, setActiveTab] = useState<'products' | 'types' | 'profiles' | 'formulas' | 'additions'>('products')

  useEffect(() => {
    const pw = sessionStorage.getItem(PW_KEY)
    if (pw) { setStoredPw(pw); tryLoad(pw) }
  }, [])

  async function tryLoad(pw: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/config')
      if (!res.ok) throw new Error()
      const data = await res.json()
      const v = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify(data),
      })
      if (v.ok) {
        setConfig(data)
        setAuthed(true)
        sessionStorage.setItem(PW_KEY, pw)
        setStoredPw(pw)
      } else {
        setAuthError('Pogrešna lozinka.')
      }
    } catch {
      setAuthError('Greška pri učitavanju.')
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!config) return
    setSaved(false); setSaveError('')
    setLoading(true)
    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': storedPw },
      body: JSON.stringify(config),
    })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    else setSaveError('Greška pri čuvanju.')
    setLoading(false)
  }

  function updateProduct(id: string, field: keyof Product, value: string) {
    if (!config) return
    setConfig({ ...config, products: config.products.map(p => p.id === id ? { ...p, [field]: value } : p) })
  }

  function updateType(id: string, field: keyof Type, value: string | string[]) {
    if (!config) return
    setConfig({ ...config, types: config.types.map(t => t.id === id ? { ...t, [field]: value } : t) })
  }

  function updateProfile(id: string, field: keyof Profile, value: string | number) {
    if (!config) return
    setConfig({
      ...config,
      profiles: config.profiles.map(p => p.id === id ? {
        ...p,
        [field]: field === 'perimFactor' ? parseFloat(value as string) || 0 : value
      } : p)
    })
  }

  function updateFormula(idx: number, field: keyof Formula, value: string | number) {
    if (!config) return
    const updated = config.formulas.map((f, i) => i !== idx ? f : {
      ...f,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    })
    setConfig({ ...config, formulas: updated })
  }

  function updateSurcharge(formulaIdx: number, surchargeIdx: number, field: 'minH' | 'amount', value: string) {
    if (!config) return
    const updated = config.formulas.map((f, i) => {
      if (i !== formulaIdx || !f.surcharges) return f
      return {
        ...f,
        surcharges: f.surcharges.map((s, j) => j !== surchargeIdx ? s : { ...s, [field]: parseFloat(value) || 0 })
      }
    })
    setConfig({ ...config, formulas: updated })
  }

  function updateAddition(key: string, field: string, value: string | number | boolean) {
    if (!config) return
    setConfig({
      ...config,
      additions: {
        ...config.additions,
        [key]: { ...config.additions[key as keyof Config['additions']], [field]: typeof value === 'string' ? parseFloat(value) || 0 : value }
      }
    })
  }

  const tabs = [
    { key: 'products', label: 'Proizvodi' },
    { key: 'types', label: 'Tipovi' },
    { key: 'profiles', label: 'Profili' },
    { key: 'formulas', label: 'Formule' },
    { key: 'additions', label: 'Dodaci' },
  ] as const

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d2f5e, #1a5fa8)' }}>
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          </div>
          <div className="space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && tryLoad(password)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500" placeholder="Lozinka" autoFocus />
            {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
            <button onClick={() => tryLoad(password)} disabled={loading}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer">
              {loading ? 'Prijavljivanje...' : 'Prijavi se'}
            </button>
          </div>
          <div className="text-center mt-6">
            <a href="/kalkulator" className="text-blue-600 hover:underline text-sm">← Nazad na kalkulator</a>
          </div>
        </div>
      </div>
    )
  }

  if (!config) return null

  // Group formulas by product for display
  const formulasByProduct = config.products.map(p => ({
    product: p,
    formulas: config.formulas
      .map((f, idx) => ({ ...f, idx }))
      .filter(f => f.product === p.id),
  })).filter(g => g.formulas.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/kalkulator" className="text-blue-300 hover:text-white text-sm transition-colors">← Kalkulator</a>
          <button onClick={handleSave} disabled={loading}
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-2 px-5 rounded-xl text-sm transition-all disabled:opacity-50 cursor-pointer">
            {loading ? 'Čuvanje...' : '💾 Sačuvaj'}
          </button>
        </div>
      </div>

      {saved && <div className="bg-green-50 border-l-4 border-green-500 px-6 py-3 text-green-800 text-sm font-medium">✅ Sačuvano!</div>}
      {saveError && <div className="bg-red-50 border-l-4 border-red-500 px-6 py-3 text-red-800 text-sm font-medium">❌ {saveError}</div>}

      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === t.key ? 'bg-blue-800 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Products tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Nazivi proizvoda</h2>
            </div>
            {config.products.map((p: Product) => (
              <div key={p.id} className="px-6 py-4 flex items-center gap-4 border-b border-gray-50 hover:bg-gray-50">
                <span className="text-xs text-gray-400 font-mono w-32 flex-shrink-0">{p.id}</span>
                <input value={p.name} onChange={e => updateProduct(p.id, 'name', e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-400" />
              </div>
            ))}
          </div>
        )}

        {/* Types tab */}
        {activeTab === 'types' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Tipovi otvaranja</h2>
              <p className="text-gray-400 text-xs mt-0.5">Naziv i za koje proizvode važi</p>
            </div>
            {config.types.map((t: Type) => (
              <div key={t.id} className="px-6 py-4 border-b border-gray-50 hover:bg-gray-50">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-xs text-gray-400 font-mono w-32 flex-shrink-0">{t.id}</span>
                  <input value={t.name} onChange={e => updateType(t.id, 'name', e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-400" />
                </div>
                <div className="ml-36 flex gap-3 flex-wrap">
                  {config.products.map(prod => (
                    <label key={prod.id} className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-500">
                      <input type="checkbox" checked={t.products.includes(prod.id)}
                        onChange={e => updateType(t.id, 'products', e.target.checked ? [...t.products, prod.id] : t.products.filter(x => x !== prod.id))}
                        className="rounded" />
                      {prod.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profiles tab */}
        {activeTab === 'profiles' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h2 className="font-bold text-gray-800">Profili</h2>
                <p className="text-gray-400 text-xs mt-0.5">Korekcija obima — množi se s koeficijentom obima iz formule (Roloplast = 1.0)</p>
              </div>
              {config.profiles.map((p: Profile) => (
                <div key={p.id} className="px-6 py-5 border-b border-gray-50 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-20 h-16 object-cover rounded-lg border border-gray-200" />
                      ) : (
                        <div className="w-20 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs text-center">
                          nema slike
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input value={p.name} onChange={e => updateProfile(p.id, 'name', e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-blue-400" />
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-gray-400 text-sm">×</span>
                          <input type="number" step="0.01" value={p.perimFactor}
                            onChange={e => updateProfile(p.id, 'perimFactor', e.target.value)}
                            className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400" />
                        </div>
                      </div>
                      <input value={p.image} onChange={e => updateProfile(p.id, 'image', e.target.value)}
                        placeholder="URL slike (https://...)"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 focus:outline-none focus:border-blue-400" />
                      <div className="text-xs text-gray-400">Materijal: <span className="font-semibold text-gray-600">{p.material.toUpperCase()}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-xs text-center">Slike se dodaju kao URL link. Uploadujte slike na hosting i unesite URL.</p>
          </div>
        )}

        {/* Formulas tab */}
        {activeTab === 'formulas' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-xs text-blue-700">
              <strong>Formula:</strong> ceil( površina_koef × površina[m²] + obim_koef × faktor_profila × obim[m] + konstanta )
            </div>
            {formulasByProduct.map(({ product, formulas }) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">{product.name}</h2>
                </div>
                {formulas.map(f => (
                  <div key={f.idx} className="px-6 py-5 border-b border-gray-50 hover:bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg px-2 py-1">
                        {config.types.find(t => t.id === f.type)?.name ?? f.type}
                      </span>
                      <span className={`text-xs font-bold rounded-lg px-2 py-1 ${f.material === 'pvc' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {f.material.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Površina (€/m²)</label>
                        <input type="number" step="0.01" value={f.areaCoeff}
                          onChange={e => updateFormula(f.idx, 'areaCoeff', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Obim (€/m) — Roloplast</label>
                        <input type="number" step="0.01" value={f.perimCoeff}
                          onChange={e => updateFormula(f.idx, 'perimCoeff', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Konstanta (€)</label>
                        <input type="number" step="0.01" value={f.constant}
                          onChange={e => updateFormula(f.idx, 'constant', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400" />
                      </div>
                    </div>
                    {f.surcharges && f.surcharges.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-400 mb-2">Doplatci za visinu</div>
                        <div className="space-y-2">
                          {f.surcharges.map((s, si) => (
                            <div key={si} className="flex items-center gap-3">
                              <span className="text-xs text-gray-500 w-16 flex-shrink-0">≥ visina</span>
                              <input type="number" step="1" value={s.minH}
                                onChange={e => updateSurcharge(f.idx, si, 'minH', e.target.value)}
                                className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold text-gray-700 text-right focus:outline-none focus:border-blue-400" />
                              <span className="text-xs text-gray-400">cm →</span>
                              <input type="number" step="0.01" value={s.amount}
                                onChange={e => updateSurcharge(f.idx, si, 'amount', e.target.value)}
                                className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400" />
                              <span className="text-xs text-gray-400">€</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Additions tab */}
        {activeTab === 'additions' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Dodaci i cene</h2>
            </div>
            {([
              { key: 'komarnik', label: 'Komarnik', field: 'pricePerCm2', unit: '€/cm²', desc: 'Cena × širina × visina' },
              { key: 'roletna', label: 'Roletna', field: 'pricePerCm2', unit: '€/cm²', desc: 'Cena × širina × visina' },
              { key: 'okapnica', label: 'Okapnica', field: 'pricePerCm', unit: '€/cm', desc: 'Cena × širina' },
              { key: 'podprozorska', label: 'Pod-prozorska daska', field: 'pricePerCm', unit: '€/cm', desc: 'Cena × širina' },
            ] as const).map(a => {
              const addon = config.additions[a.key as keyof Config['additions']]
              const val = a.field === 'pricePerCm2' ? addon.pricePerCm2 : addon.pricePerCm
              return (
                <div key={a.key} className="px-6 py-4 border-b border-gray-50 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-700">{a.label}</div>
                      <div className="text-xs text-gray-400">{a.desc}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <input type="number" step="0.1" value={val ?? 0}
                        onChange={e => updateAddition(a.key, a.field, e.target.value)}
                        className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400" />
                      <span className="text-gray-400 text-sm">{a.unit}</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                      <input type="checkbox" checked={addon.enabled}
                        onChange={e => updateAddition(a.key, 'enabled', e.target.checked)}
                        className="rounded w-4 h-4 accent-blue-700" />
                      <span className="text-xs text-gray-500">Aktivan</span>
                    </label>
                  </div>
                </div>
              )
            })}
            {/* Montaza */}
            <div className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700">Montaža</div>
                  <div className="text-xs text-gray-400">Fiksna cena ugradnje</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input type="number" step="1" value={config.additions.montaza.fixedPrice ?? 0}
                    onChange={e => updateAddition('montaza', 'fixedPrice', e.target.value)}
                    className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-700 text-right focus:outline-none focus:border-blue-400" />
                  <span className="text-gray-400 text-sm">€</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                  <input type="checkbox" checked={config.additions.montaza.enabled}
                    onChange={e => updateAddition('montaza', 'enabled', e.target.checked)}
                    className="rounded w-4 h-4 accent-blue-700" />
                  <span className="text-xs text-gray-500">Aktivan</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button onClick={handleSave} disabled={loading}
            className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-10 rounded-xl transition-all disabled:opacity-50 cursor-pointer">
            {loading ? 'Čuvanje...' : '💾 Sačuvaj sve promene'}
          </button>
        </div>
      </div>
    </div>
  )
}
